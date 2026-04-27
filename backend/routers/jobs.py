import os
import shutil
from datetime import date
from uuid import uuid4

from fastapi import (
    APIRouter,
    BackgroundTasks,
    Depends,
    File,
    Form,
    HTTPException,
    Query,
    UploadFile,
    status,
)
from postgrest.exceptions import APIError

from config import get_settings
from database import get_supabase
from pipeline.worker import process_job
from schemas import JobListResponse, JobOut
from services.auth import get_current_user, require_role


router = APIRouter(prefix="/jobs", tags=["jobs"])


ALLOWED_EXTENSIONS = {".mp3", ".wav", ".m4a", ".ogg", ".webm", ".mp4"}


def _fetch_job_or_404(supabase, job_id: str) -> dict:
    try:
        result = supabase.table("jobs").select("*").eq("id", job_id).single().execute()
        job = result.data if result else None
    except APIError as exc:
        if getattr(exc, "code", None) == "PGRST116":
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Job not found",
            ) from exc
        raise

    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found",
        )
    return job


@router.post("", response_model=JobOut, status_code=status.HTTP_201_CREATED)
async def create_job(
    background_tasks: BackgroundTasks,
    name: str = Form(...),
    language: str = Form("en"),
    event_date: str | None = Form(None),
    notes: str | None = Form(None),
    audio_file: UploadFile = File(...),
    current_user: dict = Depends(require_role("videographer", "admin")),
) -> JobOut:
    file_extension = os.path.splitext(audio_file.filename or "")[1].lower()
    if file_extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unsupported file type. Allowed: mp3, wav, m4a, ogg, webm, mp4",
        )

    settings = get_settings()
    upload_dir = settings.upload_dir
    os.makedirs(upload_dir, exist_ok=True)

    stored_filename = f"{uuid4()}{file_extension}"
    file_path = os.path.join(upload_dir, stored_filename)
    with open(file_path, "wb") as destination:
        shutil.copyfileobj(audio_file.file, destination)
    file_size = os.path.getsize(file_path)
    await audio_file.close()

    supabase = get_supabase()
    job_payload = {
        "user_id": current_user["id"],
        "name": name,
        "language": language,
        "notes": notes,
        "status": "queued",
        "step_index": 0,
        "step_label": "Queued",
    }
    if event_date:
        try:
            parsed_event_date = date.fromisoformat(event_date)
            job_payload["event_date"] = parsed_event_date.isoformat()
        except ValueError:
            pass

    job_result = supabase.table("jobs").insert(job_payload).execute()
    job = job_result.data[0] if job_result and job_result.data else None
    if not job:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create job",
        )

    supabase.table("audio_files").insert(
        {
            "job_id": job["id"],
            "file_path": file_path,
            "original_name": audio_file.filename,
            "file_size": file_size,
            "mime_type": audio_file.content_type,
        }
    ).execute()

    background_tasks.add_task(process_job, job["id"], file_path, language, current_user["id"])

    return JobOut(**job)


@router.get("", response_model=JobListResponse, status_code=status.HTTP_200_OK)
async def list_jobs(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    status_filter: str | None = Query(None, alias="status"),
    current_user: dict = Depends(get_current_user),
) -> JobListResponse:
    supabase = get_supabase()
    query = supabase.table("jobs").select("*", count="exact")

    if current_user.get("role") == "videographer":
        query = query.eq("user_id", current_user["id"])
    if status_filter:
        query = query.eq("status", status_filter)

    offset = (page - 1) * page_size
    result = (
        query.order("created_at", desc=True)
        .range(offset, offset + page_size - 1)
        .execute()
    )

    items = [JobOut(**job) for job in (result.data or [])]
    return JobListResponse(
        items=items,
        total=result.count or 0,
        page=page,
        page_size=page_size,
    )


@router.get("/{job_id}", response_model=JobOut, status_code=status.HTTP_200_OK)
async def get_job(job_id: str, current_user: dict = Depends(get_current_user)) -> JobOut:
    supabase = get_supabase()
    job = _fetch_job_or_404(supabase, job_id)

    if current_user.get("role") == "videographer" and job.get("user_id") != current_user["id"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied",
        )

    return JobOut(**job)


@router.post("/{job_id}/retry", response_model=JobOut, status_code=status.HTTP_200_OK)
async def retry_job(
    job_id: str,
    background_tasks: BackgroundTasks,
    current_user: dict = Depends(get_current_user),
) -> JobOut:
    supabase = get_supabase()
    job = _fetch_job_or_404(supabase, job_id)

    if current_user.get("role") == "videographer" and job.get("user_id") != current_user["id"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied",
        )
    if job.get("status") != "failed":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only failed jobs can be retried",
        )

    audio_result = (
        supabase.table("audio_files")
        .select("file_path")
        .eq("job_id", job_id)
        .limit(1)
        .execute()
    )
    if not audio_result or not audio_result.data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Audio file not found",
        )
    file_path = audio_result.data[0]["file_path"]

    supabase.table("transcript_segments").delete().eq("job_id", job_id).execute()
    supabase.table("highlights").delete().eq("job_id", job_id).execute()

    supabase.table("jobs").update(
        {
            "status": "queued",
            "step_index": 0,
            "step_label": "Queued",
            "error_message": None,
        }
    ).eq("id", job_id).execute()

    background_tasks.add_task(process_job, job_id, file_path, job["language"], job["user_id"])

    updated_job = _fetch_job_or_404(supabase, job_id)
    return JobOut(**updated_job)

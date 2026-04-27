import csv
import io
import json
import os

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import FileResponse, StreamingResponse
from postgrest.exceptions import APIError

from database import get_supabase
from schemas import HighlightOut, TranscriptSegmentOut
from services.auth import get_current_user


router = APIRouter(prefix="/jobs", tags=["transcripts"])


def _get_ready_job(job_id: str, current_user: dict) -> dict:
    supabase = get_supabase()
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

    if current_user.get("role") == "videographer" and job.get("user_id") != current_user.get("id"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied",
        )

    if job.get("status") != "ready":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Job is not ready yet",
        )

    return job


@router.get("/{job_id}/transcript", response_model=list[TranscriptSegmentOut], status_code=status.HTTP_200_OK)
async def get_transcript(job_id: str, current_user: dict = Depends(get_current_user)) -> list[TranscriptSegmentOut]:
    _get_ready_job(job_id, current_user)

    supabase = get_supabase()
    result = (
        supabase.table("transcript_segments")
        .select("*")
        .eq("job_id", job_id)
        .order("segment_index")
        .execute()
    )

    return [TranscriptSegmentOut(**segment) for segment in (result.data or [])]


@router.get("/{job_id}/highlights", response_model=list[HighlightOut], status_code=status.HTTP_200_OK)
async def get_highlights(job_id: str, current_user: dict = Depends(get_current_user)) -> list[HighlightOut]:
    _get_ready_job(job_id, current_user)

    supabase = get_supabase()
    result = (
        supabase.table("highlights")
        .select("*")
        .eq("job_id", job_id)
        .order("score", desc=True)
        .execute()
    )

    return [HighlightOut(**highlight) for highlight in (result.data or [])]


@router.get("/{job_id}/audio", response_model=None, status_code=status.HTTP_200_OK)
async def get_job_audio(job_id: str, current_user: dict = Depends(get_current_user)) -> FileResponse:
    _get_ready_job(job_id, current_user)

    supabase = get_supabase()
    audio_result = (
        supabase.table("audio_files")
        .select("file_path,original_name,mime_type")
        .eq("job_id", job_id)
        .limit(1)
        .execute()
    )
    audio_file = audio_result.data[0] if audio_result and audio_result.data else None
    if not audio_file:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Audio file not found",
        )

    file_path = audio_file.get("file_path")
    if not file_path or not os.path.exists(file_path):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Uploaded audio file is missing",
        )

    return FileResponse(
        file_path,
        media_type=audio_file.get("mime_type") or "application/octet-stream",
        filename=audio_file.get("original_name") or "audio",
    )


@router.get("/{job_id}/export/csv", response_model=None, status_code=status.HTTP_200_OK)
async def export_transcript_csv(job_id: str, current_user: dict = Depends(get_current_user)) -> StreamingResponse:
    job = _get_ready_job(job_id, current_user)

    supabase = get_supabase()
    segments_result = (
        supabase.table("transcript_segments")
        .select("*")
        .eq("job_id", job_id)
        .order("segment_index")
        .execute()
    )
    highlights_result = (
        supabase.table("highlights")
        .select("*")
        .eq("job_id", job_id)
        .order("score", desc=True)
        .execute()
    )

    output = io.StringIO()
    writer = csv.writer(output)

    writer.writerow(["TRANSCRIPT"])
    writer.writerow(["#", "Speaker", "Start (s)", "End (s)", "Text", "Highlight Label", "Score"])
    for segment in (segments_result.data or []):
        writer.writerow(
            [
                segment.get("segment_index"),
                segment.get("speaker"),
                segment.get("start_time"),
                segment.get("end_time"),
                segment.get("text"),
                segment.get("highlight_label") or "",
                segment.get("highlight_score") or "",
            ]
        )

    writer.writerow([])

    writer.writerow(["HIGHLIGHTS"])
    writer.writerow(["Label", "Score", "Start (s)", "End (s)", "Text"])
    for highlight in (highlights_result.data or []):
        writer.writerow(
            [
                highlight.get("label"),
                highlight.get("score"),
                highlight.get("start_time"),
                highlight.get("end_time"),
                highlight.get("text"),
            ]
        )

    safe_name = job["name"].replace(" ", "_")
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f'attachment; filename="{safe_name}_transcript.csv"'},
    )


@router.get("/{job_id}/export/json", response_model=None, status_code=status.HTTP_200_OK)
async def export_transcript_json(job_id: str, current_user: dict = Depends(get_current_user)) -> StreamingResponse:
    job = _get_ready_job(job_id, current_user)

    supabase = get_supabase()
    segments_result = (
        supabase.table("transcript_segments")
        .select("*")
        .eq("job_id", job_id)
        .order("segment_index")
        .execute()
    )
    highlights_result = (
        supabase.table("highlights")
        .select("*")
        .eq("job_id", job_id)
        .order("score", desc=True)
        .execute()
    )

    payload = {
        "job_id": job_id,
        "job_name": job["name"],
        "transcript": segments_result.data or [],
        "highlights": highlights_result.data or [],
    }
    json_str = json.dumps(payload, indent=2, default=str)

    safe_name = job["name"].replace(" ", "_")
    return StreamingResponse(
        iter([json_str]),
        media_type="application/json",
        headers={"Content-Disposition": f'attachment; filename="{safe_name}_transcript.json"'},
    )

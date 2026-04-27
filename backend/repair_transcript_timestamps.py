import argparse
import os

from database import get_supabase
from services.audio_metadata import get_audio_duration_seconds
from services.timestamps import get_scale_factor, normalize_timestamp_pair


def _get_existing_timeline(job: dict, segments: list[dict]) -> float:
    candidates = [float(job.get("duration_seconds") or 0.0)]
    candidates.extend(float(segment.get("end_time") or 0.0) for segment in segments)
    return max(candidates)


def repair_job(job_id: str, dry_run: bool = False) -> bool:
    supabase = get_supabase()
    job_result = supabase.table("jobs").select("*").eq("id", job_id).single().execute()
    job = job_result.data if job_result else None
    if not job:
        print(f"{job_id}: job not found")
        return False

    audio_result = (
        supabase.table("audio_files")
        .select("file_path")
        .eq("job_id", job_id)
        .limit(1)
        .execute()
    )
    audio = audio_result.data[0] if audio_result and audio_result.data else None
    if not audio:
        print(f"{job_id}: audio file row not found")
        return False

    file_path = audio.get("file_path")
    if not file_path or not os.path.exists(file_path):
        print(f"{job_id}: audio file missing at {file_path}")
        return False

    actual_duration = get_audio_duration_seconds(file_path)
    segments = (
        supabase.table("transcript_segments")
        .select("id,start_time,end_time")
        .eq("job_id", job_id)
        .order("segment_index")
        .execute()
        .data
        or []
    )
    highlights = (
        supabase.table("highlights")
        .select("id,start_time,end_time")
        .eq("job_id", job_id)
        .execute()
        .data
        or []
    )

    timeline_duration = _get_existing_timeline(job, segments)
    scale_factor = get_scale_factor(actual_duration, timeline_duration)
    print(
        f"{job_id}: actual={actual_duration:.3f}s timeline={timeline_duration:.3f}s "
        f"scale={scale_factor:.6f} segments={len(segments)} highlights={len(highlights)}"
    )

    if dry_run:
        return True

    for segment in segments:
        start_time, end_time = normalize_timestamp_pair(
            segment.get("start_time"),
            segment.get("end_time"),
            scale_factor,
            actual_duration,
        )
        supabase.table("transcript_segments").update(
            {
                "start_time": start_time,
                "end_time": end_time,
            }
        ).eq("id", segment["id"]).execute()

    for highlight in highlights:
        start_time, end_time = normalize_timestamp_pair(
            highlight.get("start_time"),
            highlight.get("end_time"),
            scale_factor,
            actual_duration,
        )
        supabase.table("highlights").update(
            {
                "start_time": start_time,
                "end_time": end_time,
            }
        ).eq("id", highlight["id"]).execute()

    supabase.table("jobs").update(
        {
            "duration_seconds": int(round(actual_duration)),
        }
    ).eq("id", job_id).execute()

    return True


def main() -> None:
    parser = argparse.ArgumentParser(description="Normalize stored transcript timestamps to real audio duration.")
    parser.add_argument("--job-id", action="append", help="Specific job ID to repair. Can be repeated.")
    parser.add_argument("--all-ready", action="store_true", help="Repair every ready job.")
    parser.add_argument("--dry-run", action="store_true", help="Print planned repairs without updating Supabase.")
    args = parser.parse_args()

    supabase = get_supabase()
    job_ids = args.job_id or []
    if args.all_ready:
        ready_jobs = supabase.table("jobs").select("id").eq("status", "ready").execute().data or []
        job_ids.extend(job["id"] for job in ready_jobs)

    unique_job_ids = list(dict.fromkeys(job_ids))
    if not unique_job_ids:
        parser.error("Provide --job-id or --all-ready")

    repaired = 0
    for job_id in unique_job_ids:
        if repair_job(job_id, dry_run=args.dry_run):
            repaired += 1

    action = "Checked" if args.dry_run else "Repaired"
    print(f"{action} {repaired} job(s).")


if __name__ == "__main__":
    main()

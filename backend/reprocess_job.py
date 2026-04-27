import argparse
import os

from database import get_supabase
from pipeline.worker import process_job


def reprocess_job(job_id: str) -> bool:
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

    print(f"{job_id}: clearing existing transcript/highlights")
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

    print(f"{job_id}: reprocessing {file_path}")
    process_job(job_id, file_path, job["language"], job["user_id"])
    print(f"{job_id}: complete")
    return True


def main() -> None:
    parser = argparse.ArgumentParser(description="Reprocess a job from its existing uploaded audio.")
    parser.add_argument("job_id", help="Job ID to reprocess")
    args = parser.parse_args()

    if not reprocess_job(args.job_id):
        raise SystemExit(1)


if __name__ == "__main__":
    main()

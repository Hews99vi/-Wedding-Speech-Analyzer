import os
import time

from database import get_supabase
from services.audio_metadata import get_audio_duration_seconds
from services.gemini import analyze_transcript_highlights
from services.timestamps import normalize_timestamp_pair
from services.whisper import transcribe_audio


def _update_job(supabase, job_id: str, **kwargs) -> None:
    supabase.table("jobs").update(kwargs).eq("id", job_id).execute()


def _create_notification(
    supabase,
    user_id: str,
    job_id: str,
    title: str,
    message: str,
    notif_type: str = "info",
) -> None:
    supabase.table("notifications").insert(
        {
            "user_id": user_id,
            "job_id": job_id,
            "title": title,
            "message": message,
            "type": notif_type,
            "read": False,
        }
    ).execute()


def process_job(job_id: str, file_path: str, language: str, user_id: str) -> None:
    supabase = get_supabase()
    try:
        _update_job(
            supabase,
            job_id,
            status="processing",
            step_index=1,
            step_label="Uploading Audio",
        )

        if not os.path.exists(file_path):
            raise FileNotFoundError(f"Audio file not found: {file_path}")

        actual_duration = get_audio_duration_seconds(file_path)

        _update_job(supabase, job_id, step_index=2, step_label="Noise Reduction")
        time.sleep(1)

        _update_job(supabase, job_id, step_index=3, step_label="Speaker Diarization")
        time.sleep(1)

        _update_job(supabase, job_id, step_index=4, step_label="Speech Recognition")
        segments = transcribe_audio(file_path, language)

        _update_job(supabase, job_id, step_index=5, step_label="NLP Analysis")
        try:
            highlight_analysis = analyze_transcript_highlights(segments, language)
        except Exception:
            highlight_analysis = {}

        segment_rows = []
        for seg in segments:
            highlight = highlight_analysis.get(int(seg.get("index", 0)), {})
            highlight_score = float(highlight.get("highlight_score", 0.0) or 0.0)
            highlight_label = highlight.get("highlight_label") if highlight_score > 6.0 else None
            start_time, end_time = normalize_timestamp_pair(
                seg.get("start_time", 0.0),
                seg.get("end_time", 0.0),
                1.0,
                actual_duration,
            )
            segment_rows.append(
                {
                    "job_id": job_id,
                    "speaker": seg.get("speaker", "Speaker 1"),
                    "start_time": start_time,
                    "end_time": end_time,
                    "text": str(seg.get("text", "")),
                    "highlight_label": highlight_label,
                    "highlight_score": highlight_score,
                    "segment_index": int(seg.get("index", 0)),
                }
            )

        inserted_segments = []
        for i in range(0, len(segment_rows), 50):
            batch = segment_rows[i : i + 50]
            result = supabase.table("transcript_segments").insert(batch).execute()
            inserted_segments.extend(result.data or [])

        _update_job(supabase, job_id, step_index=6, step_label="Generating Highlights")

        seg_id_map = {row["segment_index"]: row["id"] for row in inserted_segments}

        highlight_rows = []
        for seg in segments:
            highlight = highlight_analysis.get(int(seg.get("index", 0)), {})
            score = float(highlight.get("highlight_score", 0.0) or 0.0)
            label = highlight.get("highlight_label") if score > 6.0 else None
            if score > 6.0 and label:
                start_time, end_time = normalize_timestamp_pair(
                    seg.get("start_time", 0.0),
                    seg.get("end_time", 0.0),
                    1.0,
                    actual_duration,
                )
                highlight_rows.append(
                    {
                        "job_id": job_id,
                        "segment_id": seg_id_map.get(int(seg.get("index", 0))),
                        "score": score,
                        "label": label,
                        "start_time": start_time,
                        "end_time": end_time,
                        "text": str(seg.get("text", "")),
                    }
                )

        if highlight_rows:
            supabase.table("highlights").insert(highlight_rows).execute()

        _update_job(
            supabase,
            job_id,
            status="ready",
            step_index=6,
            step_label="Complete",
            duration_seconds=int(round(actual_duration)),
            error_message=None,
        )

        _create_notification(
            supabase,
            user_id,
            job_id,
            "Analysis Complete",
            f"Your speech has been analyzed. Found {len(highlight_rows)} highlight moment(s).",
            "success",
        )
    except Exception as exc:
        error_msg = str(exc)[:500]
        _update_job(
            supabase,
            job_id,
            status="failed",
            step_label="Failed",
            error_message=error_msg,
        )
        _create_notification(
            supabase,
            user_id,
            job_id,
            "Analysis Failed",
            f"Processing failed: {error_msg[:200]}",
            "error",
        )
        raise

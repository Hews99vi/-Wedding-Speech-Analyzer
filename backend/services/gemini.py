import json

import google.generativeai as genai

from config import get_settings


def _clean_json_response(raw: str) -> str:
    cleaned = raw.strip()
    if cleaned.startswith("```json"):
        lines = cleaned.splitlines()
        if lines:
            lines = lines[1:]
        if lines and lines[-1].strip() == "```":
            lines = lines[:-1]
        cleaned = "\n".join(lines)
    elif cleaned.startswith("```"):
        lines = cleaned.splitlines()
        if lines:
            lines = lines[1:]
        if lines and lines[-1].strip() == "```":
            lines = lines[:-1]
        cleaned = "\n".join(lines)
    return cleaned.strip()


def analyze_transcript_highlights(segments: list[dict], language: str = "en") -> dict[int, dict]:
    settings = get_settings()
    genai.configure(api_key=settings.gemini_api_key)

    lang_note = (
        "The transcript is Sinhala."
        if language == "si"
        else "The transcript is English."
    )
    transcript_payload = [
        {
            "index": segment["index"],
            "start_time": segment["start_time"],
            "end_time": segment["end_time"],
            "text": segment["text"],
        }
        for segment in segments
    ]

    prompt = f"""
You are an expert wedding speech editor.
{lang_note}

Analyze the transcript segments below for editing highlights.
Return ONLY a valid JSON object. No markdown. No explanation.

Required structure:
{{
  "segments": [
    {{
      "index": <integer, must match an input index>,
      "highlight_score": <float 0.0-10.0>,
      "highlight_label": <"Emotional Peak"|"Humor"|"Toast"|"Vows"|"Advice"|null>
    }}
  ]
}}

Rules:
- Do not change transcript text or timestamps
- Return one result for every input segment
- Score emotional/narrative editing value from 0.0 to 10.0
- Only assign a highlight_label when highlight_score is above 6.0
- Set highlight_label to null when highlight_score is 6.0 or below

Transcript segments:
{json.dumps(transcript_payload, ensure_ascii=False)}
"""

    response = genai.GenerativeModel(settings.gemini_model).generate_content(prompt)
    raw = (response.text or "").strip()
    cleaned = _clean_json_response(raw)
    try:
        parsed = json.loads(cleaned)
    except json.JSONDecodeError as exc:
        raise ValueError(f"Gemini returned invalid highlight JSON: {raw[:200]}") from exc

    results = parsed.get("segments", [])
    if not isinstance(results, list):
        raise ValueError("Gemini highlight response did not include segments")

    by_index: dict[int, dict] = {}
    for item in results:
        try:
            index = int(item.get("index"))
        except (TypeError, ValueError):
            continue
        by_index[index] = {
            "highlight_score": float(item.get("highlight_score", 0.0) or 0.0),
            "highlight_label": item.get("highlight_label"),
        }
    return by_index


def analyze_audio(file_path: str, language: str = "en") -> dict:
    settings = get_settings()
    genai.configure(api_key=settings.gemini_api_key)
    audio_ref = genai.upload_file(path=file_path)

    lang_note = (
        "The audio is in Sinhala language. Transcribe in Sinhala script."
        if language == "si"
        else "The audio is in English."
    )

    prompt = f"""
You are an expert wedding speech transcriber and analyzer.
{lang_note}

Transcribe this wedding speech audio recording and return ONLY a valid JSON object.
No markdown. No explanation. No code fences. Raw JSON only.

Required structure:
{{
  "duration_seconds": <integer, total audio duration>,
  "speakers": ["Speaker 1", "Speaker 2"],
  "segments": [
    {{
      "index": <integer, 0-based>,
      "speaker": "Speaker 1",
      "start_time": <float, seconds>,
      "end_time": <float, seconds>,
      "text": "<transcribed text>",
      "highlight_score": <float 0.0-10.0>,
      "highlight_label": <"Emotional Peak"|"Humor"|"Toast"|"Vows"|"Advice"|null>
    }}
  ]
}}

Rules:
- Transcribe the speech in chronological order only
- Transcribe spoken words as literally as possible
- Do not summarize, paraphrase, rewrite, or invent missing words
- Identify different speakers as Speaker 1, Speaker 2, etc.
- Use real audio timestamps in seconds from the beginning of the file
- Do not use fractions of the full file duration as timestamps
- Segment on natural phrase/sentence boundaries, usually 2 to 8 seconds
- Score each segment 0.0-10.0 for emotional/narrative significance
- Only assign a highlight_label to segments scoring above 6.0
- Set highlight_label to null for segments scoring 6.0 or below
- Timestamps must match when the words are actually spoken in the audio
- Return ONLY the JSON object, nothing else
"""

    try:
        response = genai.GenerativeModel(settings.gemini_model).generate_content([audio_ref, prompt])
        raw = (response.text or "").strip()
        cleaned = _clean_json_response(raw)
        try:
            parsed = json.loads(cleaned)
        except json.JSONDecodeError as exc:
            raise ValueError(f"Gemini returned invalid JSON: {raw[:200]}") from exc

        segments = parsed.get("segments")
        if not isinstance(segments, list) or not segments:
            raise ValueError("Gemini returned no segments")

        return parsed
    finally:
        try:
            genai.delete_file(audio_ref.name)
        except Exception:
            pass

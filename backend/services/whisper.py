from functools import lru_cache

from faster_whisper import WhisperModel

from config import get_settings


@lru_cache(maxsize=2)
def _get_model(model_name: str, compute_type: str) -> WhisperModel:
    return WhisperModel(model_name, device="cpu", compute_type=compute_type)


def transcribe_audio(file_path: str, language: str = "en") -> list[dict]:
    settings = get_settings()
    model = _get_model(settings.whisper_model, settings.whisper_compute_type)
    whisper_language = "si" if language == "si" else "en"

    segments, _info = model.transcribe(
        file_path,
        beam_size=5,
        language=whisper_language,
        vad_filter=True,
    )

    rows = []
    for index, segment in enumerate(segments):
        text = segment.text.strip()
        if not text:
            continue

        rows.append(
            {
                "index": index,
                "speaker": "Speaker 1",
                "start_time": float(segment.start),
                "end_time": float(segment.end),
                "text": text,
            }
        )

    if not rows:
        raise ValueError("Whisper returned no transcript segments")

    return rows

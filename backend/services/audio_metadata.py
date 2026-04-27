from mutagen import File as MutagenFile


def get_audio_duration_seconds(file_path: str) -> float:
    audio = MutagenFile(file_path)
    if audio is None or audio.info is None:
        raise ValueError(f"Unable to read audio metadata: {file_path}")

    duration = float(getattr(audio.info, "length", 0.0) or 0.0)
    if duration <= 0:
        raise ValueError(f"Audio duration is unavailable: {file_path}")

    return duration

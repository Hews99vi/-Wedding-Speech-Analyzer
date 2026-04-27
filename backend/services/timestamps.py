from __future__ import annotations

from typing import Any


TIMELINE_MISMATCH_THRESHOLD = 0.05


def _safe_float(value: Any, default: float = 0.0) -> float:
    try:
        return float(value)
    except (TypeError, ValueError):
        return default


def _clamp(value: float, minimum: float, maximum: float) -> float:
    return min(max(value, minimum), maximum)


def get_analysis_timeline_seconds(analysis: dict, segments: list[dict]) -> float:
    candidates = [_safe_float(analysis.get("duration_seconds"))]
    candidates.extend(_safe_float(segment.get("end_time")) for segment in segments)
    return max(candidates)


def get_scale_factor(actual_duration: float, timeline_duration: float) -> float:
    if actual_duration <= 0 or timeline_duration <= 0:
        return 1.0

    ratio = actual_duration / timeline_duration
    if abs(1.0 - ratio) <= TIMELINE_MISMATCH_THRESHOLD:
        return 1.0

    return ratio


def normalize_timestamp_pair(
    start_time: Any,
    end_time: Any,
    scale_factor: float,
    actual_duration: float,
) -> tuple[float, float]:
    start = _clamp(_safe_float(start_time) * scale_factor, 0.0, actual_duration)
    end = _clamp(_safe_float(end_time) * scale_factor, 0.0, actual_duration)
    if end < start:
        end = start
    return round(start, 3), round(end, 3)

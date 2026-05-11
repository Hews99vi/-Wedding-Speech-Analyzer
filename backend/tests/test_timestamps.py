import pytest
from services.timestamps import (
    get_scale_factor,
    normalize_timestamp_pair,
    TIMELINE_MISMATCH_THRESHOLD,
)


def test_normalize_scales_timestamps():
    start, end = normalize_timestamp_pair(10.0, 20.0, scale_factor=2.0, actual_duration=60.0)
    assert start == 20.0
    assert end == 40.0


def test_normalize_clamps_end_to_duration():
    start, end = normalize_timestamp_pair(5.0, 100.0, scale_factor=1.0, actual_duration=30.0)
    assert end == 30.0


def test_normalize_clamps_start_to_zero():
    start, end = normalize_timestamp_pair(-5.0, 10.0, scale_factor=1.0, actual_duration=60.0)
    assert start == 0.0


def test_normalize_start_cannot_exceed_end():
    # scale pushes end below start after clamping — end must equal start
    start, end = normalize_timestamp_pair(50.0, 30.0, scale_factor=1.0, actual_duration=40.0)
    assert start <= end


def test_normalize_zero_scale_factor():
    start, end = normalize_timestamp_pair(10.0, 20.0, scale_factor=0.0, actual_duration=60.0)
    assert start == 0.0
    assert end == 0.0


def test_normalize_rounds_to_three_decimals():
    start, end = normalize_timestamp_pair(1.0 / 3, 2.0 / 3, scale_factor=1.0, actual_duration=60.0)
    assert start == round(1.0 / 3, 3)
    assert end == round(2.0 / 3, 3)


def test_get_scale_factor_normal():
    # actual=60, timeline=120 → ratio=0.5 (far from 1.0, so returned as-is)
    factor = get_scale_factor(actual_duration=60.0, timeline_duration=120.0)
    assert factor == pytest.approx(0.5)


def test_get_scale_factor_returns_one_when_close():
    # ratio within TIMELINE_MISMATCH_THRESHOLD → return 1.0
    timeline = 100.0
    actual = timeline * (1.0 + TIMELINE_MISMATCH_THRESHOLD * 0.5)
    factor = get_scale_factor(actual_duration=actual, timeline_duration=timeline)
    assert factor == 1.0


def test_get_scale_factor_zero_timeline():
    factor = get_scale_factor(actual_duration=60.0, timeline_duration=0.0)
    assert factor == 1.0


def test_get_scale_factor_zero_actual():
    factor = get_scale_factor(actual_duration=0.0, timeline_duration=60.0)
    assert factor == 1.0

import pytest
from pydantic import ValidationError
from schemas import (
    UserRole,
    UserStatus,
    JobStatus,
    HighlightLabel,
    UserOut,
    JobOut,
    TranscriptSegmentOut,
    HighlightOut,
    UpdateUserRole,
    UpdateUserStatus,
)


def test_job_status_enum_values():
    assert JobStatus.QUEUED == "queued"
    assert JobStatus.PROCESSING == "processing"
    assert JobStatus.READY == "ready"
    assert JobStatus.FAILED == "failed"


def test_user_role_enum_values():
    assert UserRole.VIDEOGRAPHER == "videographer"
    assert UserRole.EDITOR == "editor"
    assert UserRole.ADMIN == "admin"


def test_highlight_label_enum_values():
    labels = {label.value for label in HighlightLabel}
    assert labels == {"Emotional Peak", "Humor", "Toast", "Vows", "Advice"}


def test_user_out_valid():
    user = UserOut(
        id="abc",
        name="Alice",
        email="alice@example.com",
        role="videographer",
        status="active",
        created_at="2025-01-01T00:00:00+00:00",
    )
    assert user.role == UserRole.VIDEOGRAPHER
    assert user.status == UserStatus.ACTIVE


def test_user_out_invalid_role():
    with pytest.raises(ValidationError):
        UserOut(
            id="abc",
            name="Alice",
            email="alice@example.com",
            role="hacker",
            status="active",
            created_at="2025-01-01T00:00:00+00:00",
        )


def test_job_out_optional_fields():
    job = JobOut(
        id="job-1",
        user_id="user-1",
        name="Wedding Speech",
        language="en",
        status="queued",
        step_index=0,
        created_at="2025-01-01T00:00:00+00:00",
        updated_at="2025-01-01T00:00:00+00:00",
    )
    assert job.event_date is None
    assert job.notes is None
    assert job.error_message is None


def test_transcript_segment_out_valid():
    seg = TranscriptSegmentOut(
        id="seg-1",
        job_id="job-1",
        speaker="Speaker 1",
        start_time=0.0,
        end_time=5.0,
        text="Hello everyone",
        segment_index=0,
    )
    assert seg.highlight_label is None
    assert seg.text == "Hello everyone"


def test_highlight_out_valid():
    hl = HighlightOut(
        id="hl-1",
        job_id="job-1",
        segment_id="seg-1",
        score=8.5,
        label="Emotional Peak",
        start_time=10.0,
        end_time=15.0,
        text="I love you all",
    )
    assert hl.label == HighlightLabel.EMOTIONAL_PEAK
    assert hl.score == 8.5


def test_update_user_role_valid():
    body = UpdateUserRole(role="editor")
    assert body.role == UserRole.EDITOR


def test_update_user_role_rejects_invalid():
    with pytest.raises(ValidationError):
        UpdateUserRole(role="superuser")


def test_update_user_status_valid():
    body = UpdateUserStatus(status="suspended")
    assert body.status == UserStatus.SUSPENDED

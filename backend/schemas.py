from datetime import date, datetime
from enum import Enum

from pydantic import BaseModel


class UserRole(str, Enum):
    VIDEOGRAPHER = "videographer"
    EDITOR = "editor"
    ADMIN = "admin"


class UserStatus(str, Enum):
    ACTIVE = "active"
    SUSPENDED = "suspended"


class JobStatus(str, Enum):
    QUEUED = "queued"
    PROCESSING = "processing"
    READY = "ready"
    FAILED = "failed"


class Language(str, Enum):
    EN = "en"
    SI = "si"


class HighlightLabel(str, Enum):
    EMOTIONAL_PEAK = "Emotional Peak"
    HUMOR = "Humor"
    TOAST = "Toast"
    VOWS = "Vows"
    ADVICE = "Advice"


class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str
    role: UserRole


class LoginRequest(BaseModel):
    email: str
    password: str


class UserOut(BaseModel):
    id: str
    name: str
    email: str
    role: UserRole
    status: UserStatus
    created_at: datetime


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str
    user: UserOut


class RefreshRequest(BaseModel):
    refresh_token: str


class JobCreate(BaseModel):
    name: str
    event_date: date | None = None
    language: Language
    notes: str | None = None


class JobOut(BaseModel):
    id: str
    user_id: str
    name: str
    event_date: date | None = None
    language: Language
    notes: str | None = None
    status: JobStatus
    step_index: int
    step_label: str | None = None
    error_message: str | None = None
    duration_seconds: float | None = None
    created_at: datetime
    updated_at: datetime


class JobListResponse(BaseModel):
    items: list[JobOut]
    total: int
    page: int
    page_size: int


class TranscriptSegmentOut(BaseModel):
    id: str
    job_id: str
    speaker: str | None = None
    start_time: float
    end_time: float
    text: str
    highlight_label: HighlightLabel | None = None
    highlight_score: float | None = None
    segment_index: int


class HighlightOut(BaseModel):
    id: str
    job_id: str
    segment_id: str
    score: float
    label: HighlightLabel
    start_time: float
    end_time: float
    text: str


class NotificationOut(BaseModel):
    id: str
    user_id: str
    type: str
    title: str
    message: str
    read: bool
    job_id: str | None = None
    created_at: datetime


class UpdateUserRole(BaseModel):
    role: UserRole


class UpdateUserStatus(BaseModel):
    status: UserStatus

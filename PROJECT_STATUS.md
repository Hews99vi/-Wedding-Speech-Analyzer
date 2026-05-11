# WEDDING SPEECH ANALYZER — COMPLETE PROJECT STATUS REPORT

---

## 1. DIRECTORY TREE

```
/Users/nmantha/Documents/GitHub/-Wedding-Speech-Analyzer
├── PROJECT_STATUS.md
├── REAL_DATA_AUDIT.md
├── SYSTEM_WORKFLOW_REPORT.md
├── backend/
│   ├── .env
│   ├── .env.example
│   ├── README.md
│   ├── config.py
│   ├── database.py
│   ├── main.py
│   ├── pytest.ini
│   ├── pipeline/
│   │   ├── __init__.py
│   │   └── worker.py
│   ├── requirements.txt
│   ├── routers/
│   │   ├── __init__.py
│   │   ├── admin.py
│   │   ├── auth.py
│   │   ├── jobs.py
│   │   ├── notifications.py
│   │   └── transcripts.py
│   ├── schemas.py
│   ├── services/
│   │   ├── __init__.py
│   │   ├── audio_metadata.py
│   │   ├── auth.py
│   │   ├── gemini.py
│   │   ├── timestamps.py
│   │   └── whisper.py
│   ├── supabase_schema.sql
│   ├── supabase_schema_migration_v2.sql
│   └── tests/
│       ├── __init__.py
│       ├── conftest.py
│       ├── test_gemini.py
│       ├── test_routes.py
│       ├── test_schemas.py
│       └── test_timestamps.py
└── frontend/
    ├── .env
    ├── .gitignore
    ├── README.md
    ├── eslint.config.js
    ├── index.html
    ├── package.json
    ├── postcss.config.js
    ├── vitest.config.ts
    ├── public/
    │   └── vite.svg
    ├── src/
    │   ├── App.tsx
    │   ├── setupTests.ts
    │   ├── api/
    │   │   ├── admin.ts
    │   │   ├── auth.ts
    │   │   ├── client.ts
    │   │   ├── jobs.ts
    │   │   └── notifications.ts
    │   ├── components/
    │   │   ├── AuthInitializer.tsx
    │   │   ├── ErrorBoundary.tsx
    │   │   ├── MobileNav.tsx
    │   │   ├── RoleGate.tsx
    │   │   ├── Sidebar.tsx
    │   │   ├── ThemeProvider.tsx
    │   │   ├── TopBar.tsx
    │   │   ├── transcript/
    │   │   │   └── TranscriptViewer.tsx
    │   │   └── ui/
    │   │       ├── Badge.tsx
    │   │       ├── Button.tsx
    │   │       ├── Card.tsx
    │   │       ├── EmptyState.tsx
    │   │       ├── ErrorState.tsx
    │   │       ├── Input.tsx
    │   │       ├── Progress.tsx
    │   │       ├── Skeleton.tsx
    │   │       ├── Table.tsx
    │   │       └── ThemeToggle.tsx
    │   ├── layouts/
    │   │   ├── AuthLayout.tsx
    │   │   └── DashboardLayout.tsx
    │   ├── lib/
    │   │   └── supabase.ts
    │   ├── main.tsx
    │   ├── pages/
    │   │   ├── admin/
    │   │   │   └── AdminUsers.tsx
    │   │   ├── auth/
    │   │   │   ├── ForgotPassword.tsx
    │   │   │   ├── Login.tsx
    │   │   │   ├── Register.tsx
    │   │   │   └── ResetPassword.tsx
    │   │   ├── common/
    │   │   │   ├── Landing.tsx
    │   │   │   ├── NotFound.tsx
    │   │   │   └── Unauthorized.tsx
    │   │   ├── dashboard/
    │   │   │   ├── Admin.tsx
    │   │   │   ├── Analytics.tsx
    │   │   │   ├── Editor.tsx
    │   │   │   ├── NewAnalysis.tsx
    │   │   │   ├── Overview.tsx
    │   │   │   ├── Uploads.tsx
    │   │   │   └── Videographer.tsx
    │   │   ├── jobs/
    │   │   │   ├── JobDetail.tsx
    │   │   │   └── JobsList.tsx
    │   │   ├── notifications/
    │   │   │   ├── NotificationSettings.tsx
    │   │   │   └── Notifications.tsx
    │   │   └── transcript/
    │   │       └── TranscriptViewerPage.tsx
    │   ├── routes/
    │   │   ├── AppRouter.tsx
    │   │   ├── guards.tsx
    │   │   ├── routeMeta.ts
    │   │   └── routePaths.ts
    │   ├── store/
    │   │   ├── __tests__/
    │   │   │   └── authStore.test.ts
    │   │   ├── authStore.ts
    │   │   └── uiStore.ts
    │   ├── routes/
    │   │   └── __tests__/
    │   │       └── routePaths.test.ts
    │   ├── components/
    │   │   └── ui/
    │   │       └── __tests__/
    │   │           ├── Badge.test.tsx
    │   │           ├── Button.test.tsx
    │   │           ├── Input.test.tsx
    │   │           └── Progress.test.tsx
    │   └── types/
    │       ├── auth.ts
    │       ├── job.ts
    │       └── notification.ts
    ├── tailwind.config.js
    ├── tsconfig.app.json
    ├── tsconfig.json
    ├── tsconfig.node.json
    └── vite.config.ts
```

---

## 2. ALL FASTAPI ROUTES (20 total)

### backend/routers/auth.py

| Method | Path | Function | Response Model |
|---|---|---|---|
| GET | /auth/me | get_me | UserOut |

Returns current authenticated user's profile row from `profiles` table.

### backend/routers/jobs.py

| Method | Path | Function | Response Model |
|---|---|---|---|
| POST | /jobs | create_job | JobOut (201) |
| GET | /jobs | list_jobs | JobListResponse |
| GET | /jobs/{job_id} | get_job | JobOut |
| POST | /jobs/{job_id}/retry | retry_job | JobOut |

### backend/routers/transcripts.py

| Method | Path | Function | Response Model |
|---|---|---|---|
| GET | /jobs/{job_id}/transcript | get_transcript | list[TranscriptSegmentOut] |
| GET | /jobs/{job_id}/highlights | get_highlights | list[HighlightOut] |
| GET | /jobs/{job_id}/audio | get_job_audio | None (FileResponse) |
| GET | /jobs/{job_id}/export/csv | export_transcript_csv | None (StreamingResponse) |
| GET | /jobs/{job_id}/export/json | export_transcript_json | None (StreamingResponse) |

### backend/routers/notifications.py

| Method | Path | Function | Response Model |
|---|---|---|---|
| GET | /notifications | list_notifications | list[NotificationOut] |
| PATCH | /notifications/read-all | mark_all_notifications_as_read | dict[str, str] |
| PATCH | /notifications/{notification_id} | mark_notification_as_read | NotificationOut |
| DELETE | /notifications | clear_notifications | dict[str, str] |

### backend/routers/admin.py

| Method | Path | Function | Response Model |
|---|---|---|---|
| GET | /admin/users | list_users | list[UserOut] |
| PATCH | /admin/users/{user_id}/role | update_user_role | UserOut |
| PATCH | /admin/users/{user_id}/status | update_user_status | UserOut |
| DELETE | /admin/users/{user_id} | delete_user | None |
| GET | /admin/stats | get_admin_stats | None (dict) |

### backend/main.py (inline)

| Method | Path | Returns |
|---|---|---|
| GET | / | `{"message": "Wedding Speech Analyzer API", "docs": "/docs"}` |
| GET | /health | `{"status": "ok", "version": "1.0.0"}` |

---

## 3. IMPLEMENTATION STATUS PER ROUTER

### auth.py — FULLY IMPLEMENTED
- `get_me`: Reads `current_user` from `get_current_user` dependency (`supabase.auth.get_user(token)` → profiles lookup). Returns real profile data.

### jobs.py — FULLY IMPLEMENTED
- `create_job`: Validates file extension, saves to `./uploads/{uuid}.{ext}`, inserts rows into `jobs` and `audio_files`, enqueues `process_job` as a FastAPI background task.
- `list_jobs`: Supabase query with `.range()` pagination, role-based filter (videographer sees only their own jobs via `.eq("user_id", ...)`), optional status filter, ordered by `created_at DESC`.
- `get_job`: Supabase `.single()`, ownership check for videographer role.
- `retry_job`: Validates only failed jobs can be retried, deletes existing `transcript_segments` and `highlights` rows, resets `step_index=0`, `status="queued"`, re-triggers `process_job`.

### transcripts.py — FULLY IMPLEMENTED
- `get_transcript`: Requires job `status == "ready"`, queries `transcript_segments` ordered by `segment_index`.
- `get_highlights`: Requires job `status == "ready"`, queries `highlights` ordered by `score DESC`.
- `get_job_audio`: Looks up `audio_files` row to get original filename and `mime_type`, returns `FileResponse`.
- `export_transcript_csv`: Streams CSV with two sections — transcript table and highlights table.
- `export_transcript_json`: Streams JSON `{"job_id": ..., "job_name": ..., "transcript": [...], "highlights": [...]}`.

### notifications.py — FULLY IMPLEMENTED
All four endpoints perform real Supabase queries filtered by `user_id`. No stubs or hardcoded returns.

### admin.py — FULLY IMPLEMENTED
- `list_users`: Queries all `profiles` rows ordered by `created_at DESC`.
- `update_user_role` / `update_user_status`: PATCH with validated enum body, updates `profiles` table.
- `delete_user`: Checks existence and self-deletion guard, calls `supabase.auth.admin.delete_user(user_id)`.
- `get_admin_stats`: Four separate Supabase count queries; builds `jobs_by_status` dict by iterating all job statuses.

---

## 4. DATABASE SCHEMA

### TABLE: profiles
| Column | Type | Constraints |
|---|---|---|
| id | UUID | PRIMARY KEY, FK → auth.users.id ON DELETE CASCADE |
| name | TEXT | NOT NULL |
| email | TEXT | NOT NULL UNIQUE |
| role | TEXT | NOT NULL DEFAULT 'videographer' CHECK IN ('videographer','editor','admin') |
| status | TEXT | NOT NULL DEFAULT 'active' CHECK IN ('active','suspended') |
| created_at | TIMESTAMPTZ | NOT NULL DEFAULT NOW() |
| updated_at | TIMESTAMPTZ | NOT NULL DEFAULT NOW() |

### TABLE: jobs
| Column | Type | Constraints |
|---|---|---|
| id | UUID | PRIMARY KEY DEFAULT gen_random_uuid() |
| user_id | UUID | NOT NULL REFERENCES profiles(id) ON DELETE CASCADE |
| name | TEXT | NOT NULL |
| event_date | DATE | nullable |
| language | TEXT | NOT NULL DEFAULT 'en' CHECK IN ('en','si') |
| notes | TEXT | nullable |
| status | TEXT | NOT NULL DEFAULT 'queued' CHECK IN ('queued','processing','ready','failed') |
| step_index | INTEGER | NOT NULL DEFAULT 0 |
| step_label | TEXT | NOT NULL DEFAULT 'Queued' |
| error_message | TEXT | nullable |
| duration_seconds | INTEGER | nullable |
| created_at | TIMESTAMPTZ | NOT NULL DEFAULT NOW() |
| updated_at | TIMESTAMPTZ | NOT NULL DEFAULT NOW() |

### TABLE: audio_files
| Column | Type | Constraints |
|---|---|---|
| id | UUID | PRIMARY KEY DEFAULT gen_random_uuid() |
| job_id | UUID | NOT NULL REFERENCES jobs(id) ON DELETE CASCADE |
| file_path | TEXT | NOT NULL |
| original_name | TEXT | NOT NULL |
| file_size | INTEGER | nullable |
| mime_type | TEXT | nullable |
| created_at | TIMESTAMPTZ | NOT NULL DEFAULT NOW() |

### TABLE: transcript_segments
| Column | Type | Constraints |
|---|---|---|
| id | UUID | PRIMARY KEY DEFAULT gen_random_uuid() |
| job_id | UUID | NOT NULL REFERENCES jobs(id) ON DELETE CASCADE |
| speaker | TEXT | NOT NULL DEFAULT 'Speaker 1' |
| start_time | FLOAT | NOT NULL |
| end_time | FLOAT | NOT NULL |
| text | TEXT | NOT NULL |
| highlight_label | TEXT | CHECK IN ('Emotional Peak','Humor','Toast','Vows','Advice') OR NULL |
| highlight_score | FLOAT | DEFAULT 0.0 |
| segment_index | INTEGER | NOT NULL DEFAULT 0 |
| created_at | TIMESTAMPTZ | NOT NULL DEFAULT NOW() |

### TABLE: highlights
| Column | Type | Constraints |
|---|---|---|
| id | UUID | PRIMARY KEY DEFAULT gen_random_uuid() |
| job_id | UUID | NOT NULL REFERENCES jobs(id) ON DELETE CASCADE |
| segment_id | UUID | REFERENCES transcript_segments(id) ON DELETE SET NULL |
| score | FLOAT | NOT NULL |
| label | TEXT | NOT NULL |
| start_time | FLOAT | NOT NULL |
| end_time | FLOAT | NOT NULL |
| text | TEXT | NOT NULL |
| created_at | TIMESTAMPTZ | NOT NULL DEFAULT NOW() |

### TABLE: notifications
| Column | Type | Constraints |
|---|---|---|
| id | UUID | PRIMARY KEY DEFAULT gen_random_uuid() |
| user_id | UUID | NOT NULL REFERENCES profiles(id) ON DELETE CASCADE |
| type | TEXT | NOT NULL DEFAULT 'info' CHECK IN ('info','success','warning','error') |
| title | TEXT | NOT NULL |
| message | TEXT | NOT NULL |
| read | BOOLEAN | NOT NULL DEFAULT FALSE |
| job_id | UUID | REFERENCES jobs(id) ON DELETE SET NULL |
| created_at | TIMESTAMPTZ | NOT NULL DEFAULT NOW() |

---

## 5. GEMINI PIPELINE — STEP BY STEP

`backend/pipeline/worker.py` → `process_job(job_id, file_path, language, user_id)`

**STEP 1 — Status: "Uploading Audio" (step_index=1)**
Updates DB. Validates `file_path` exists on disk. Calls `get_audio_duration_seconds(file_path)` from `services/audio_metadata.py` using the `mutagen` library.

**STEP 2 — Status: "Noise Reduction" (step_index=2)**
`time.sleep(1)` — MOCKED. No real DSP.

**STEP 3 — Status: "Speaker Diarization" (step_index=3)**
`time.sleep(1)` — MOCKED. All segments assigned `speaker = "Speaker 1"`.

**STEP 4 — Status: "Speech Recognition" (step_index=4) — REAL**
`segments = transcribe_audio(file_path, language)` via `services/whisper.py`. Loads `faster_whisper.WhisperModel` (cached with `@lru_cache`), runs `model.transcribe()` with `vad_filter=True`.

**STEP 5 — Status: "NLP Analysis" (step_index=5) — REAL**
`highlight_analysis = analyze_transcript_highlights(segments, language)` via `services/gemini.py`. Sends full transcript to Gemini 2.5 Flash and parses scored highlight JSON.

**STEP 6A — Write transcript_segments to DB**
Merges Gemini scores with Whisper segments, normalises timestamps via `normalize_timestamp_pair()`, batch inserts in chunks of 50.

**STEP 6B — Status: "Generating Highlights" (step_index=6)**
Filters `score > 6.0`, inserts into `highlights` table.

**STEP 7 — Status: "Complete" (status="ready")**
Updates job row, creates success notification.

| Step | Label | Real/Mocked |
|---|---|---|
| 1 | Uploading Audio | Real (file check + mutagen duration) |
| 2 | Noise Reduction | MOCKED — time.sleep(1) |
| 3 | Speaker Diarization | MOCKED — time.sleep(1), all speakers = "Speaker 1" |
| 4 | Speech Recognition | Real — faster-whisper |
| 5 | NLP Analysis | Real — Gemini API |
| 6A | DB write segments | Real — batch Supabase insert |
| 6B | DB write highlights | Real — Supabase insert |
| 7 | Complete notification | Real — Supabase insert |

---

## 6. ENVIRONMENT VARIABLES

### Backend (`backend/config.py`)
| Variable | Purpose | Default |
|---|---|---|
| SUPABASE_URL | Supabase project REST URL | None (required) |
| SUPABASE_SERVICE_ROLE_KEY | Service role key (bypasses RLS) | None (required) |
| GEMINI_API_KEY | Google AI Studio API key | None (required) |
| GEMINI_MODEL | Gemini model name | gemini-2.5-flash |
| WHISPER_MODEL | faster-whisper model size | small |
| WHISPER_COMPUTE_TYPE | Inference precision | int8 |
| UPLOAD_DIR | Local path for uploaded audio files | ./uploads |
| CORS_ORIGINS | Comma-separated allowed CORS origins | http://localhost:5173,http://localhost:3000 |

### Frontend (`frontend/.env`)
| Variable | Purpose |
|---|---|
| VITE_SUPABASE_URL | Supabase project URL for client-side SDK |
| VITE_SUPABASE_ANON_KEY | Supabase anon key for client-side SDK |
| VITE_API_URL | Backend API base URL (currently unused — client.ts still hardcoded) |

---

## 7. TEST SUITE

**Total: 87 automated tests across backend and frontend — all passing.**

### How to run

```bash
# Backend
cd backend
.venv/bin/python3 -m pytest tests/ -v

# Frontend
cd frontend
npm test
```

---

### Backend — pytest (43 tests)

**Framework:** pytest 8.3, pytest-asyncio, pytest-mock
**Config:** `backend/pytest.ini` (`testpaths = tests`, `asyncio_mode = auto`, `pythonpath = .`)

#### `tests/conftest.py` — shared fixtures

| Fixture | Description |
|---|---|
| `mock_sb` | `MagicMock()` Supabase client passed into route fixtures |
| `client_videographer` | `TestClient` with `get_current_user` overridden to a videographer; all router `get_supabase` calls monkeypatched to `mock_sb` |
| `client_admin` | Same but `get_current_user` returns an admin user |
| `client_no_auth` | Plain `TestClient` with no auth overrides — `HTTPBearer` returns 403 naturally |

Supabase is mocked at the router module level (`monkeypatch.setattr("routers.jobs.get_supabase", ...)`) because routers call `get_supabase()` directly in function bodies rather than via `Depends`.

---

#### `tests/test_timestamps.py` — 10 pure unit tests

Tests `services/timestamps.py` with no external dependencies.

| Test | Asserts |
|---|---|
| `test_normalize_scales_timestamps` | start/end multiplied by scale_factor |
| `test_normalize_clamps_end_to_duration` | end_time cannot exceed actual_duration |
| `test_normalize_clamps_start_to_zero` | start_time cannot go below 0 |
| `test_normalize_start_cannot_exceed_end` | after clamping, start ≤ end |
| `test_normalize_zero_scale_factor` | scale=0.0 → both timestamps become 0 |
| `test_normalize_rounds_to_three_decimals` | output rounded to 3 decimal places |
| `test_get_scale_factor_normal` | actual=60, timeline=120 → factor=0.5 |
| `test_get_scale_factor_returns_one_when_close` | ratio within 5% threshold → factor=1.0 |
| `test_get_scale_factor_zero_timeline` | timeline=0 → factor=1.0 (no division by zero) |
| `test_get_scale_factor_zero_actual` | actual=0 → factor=1.0 |

---

#### `tests/test_schemas.py` — 13 Pydantic validation tests

Tests `schemas.py` model parsing and enum values.

| Test | Asserts |
|---|---|
| `test_job_status_enum_values` | JobStatus has queued/processing/ready/failed |
| `test_user_role_enum_values` | UserRole has videographer/editor/admin |
| `test_highlight_label_enum_values` | HighlightLabel has the 5 label strings |
| `test_user_out_valid` | Valid dict → UserOut parses without error |
| `test_user_out_invalid_role` | role="hacker" → ValidationError |
| `test_job_out_optional_fields` | event_date=None, notes=None → valid |
| `test_transcript_segment_out_valid` | Segment dict → parses with correct types |
| `test_highlight_out_valid` | Highlight dict → correct enum and float types |
| `test_update_user_role_valid` | UpdateUserRole(role="editor") → valid |
| `test_update_user_role_rejects_invalid` | role="superuser" → ValidationError |
| `test_update_user_status_valid` | UpdateUserStatus(status="suspended") → valid |

---

#### `tests/test_gemini.py` — 9 tests (Gemini API mocked)

Tests `services/gemini.py` with `unittest.mock.patch` intercepting all `genai` calls.

| Test | Asserts |
|---|---|
| `test_clean_json_strips_code_fence` | ` ```json\n{...}\n``` ` → `{...}` |
| `test_clean_json_strips_plain_fence` | ` ```\n{...}\n``` ` → `{...}` |
| `test_clean_json_plain_passthrough` | plain JSON unchanged |
| `test_clean_json_strips_whitespace` | leading/trailing whitespace removed |
| `test_analyze_highlights_builds_correct_index` | mock returns valid JSON → dict keyed by segment index |
| `test_analyze_highlights_raises_on_invalid_json` | mock returns `"not json"` → raises ValueError |
| `test_analyze_highlights_handles_missing_segments_key` | mock returns `{}` → returns empty dict |
| `test_analyze_highlights_english_prompt_includes_language` | captured prompt contains "English" |
| `test_analyze_highlights_sinhala_prompt_includes_language` | captured prompt contains "Sinhala" |

---

#### `tests/test_routes.py` — 11 FastAPI integration tests

Uses `FastAPI.dependency_overrides` for auth and monkeypatching for Supabase. No real network calls.

| Test | Fixture | Asserts |
|---|---|---|
| `test_get_me_returns_current_user` | videographer | GET /auth/me → 200, role="videographer" |
| `test_get_me_requires_auth` | no_auth | GET /auth/me → 403 |
| `test_health_check` | no_auth | GET /health → 200, status="ok" |
| `test_list_jobs_returns_200` | videographer | mock returns 1 job → 200, items length=1 |
| `test_list_jobs_requires_auth` | no_auth | GET /jobs → 403 |
| `test_get_job_not_found` | videographer | Supabase raises PGRST116 APIError → 404 |
| `test_get_job_wrong_owner_forbidden` | videographer | job.user_id ≠ current user → 403 |
| `test_admin_list_users_requires_admin_role` | videographer | GET /admin/users → 403 |
| `test_admin_list_users_returns_users` | admin | mock returns 1 user → 200, len=1 |
| `test_admin_stats_returns_counts` | admin | 4 sequential execute() mocks → 200, total_users=5 |
| `test_list_notifications_returns_200` | videographer | mock returns 1 notification → 200 |
| `test_mark_all_read_returns_message` | videographer | PATCH /notifications/read-all → 200 |
| `test_clear_notifications_returns_message` | videographer | DELETE /notifications → 200 |

---

### Frontend — vitest (44 tests)

**Framework:** vitest 2.1, @testing-library/react, @testing-library/user-event, @testing-library/jest-dom
**Config:** `frontend/vitest.config.ts` (jsdom environment, globals=true, setupFiles includes jest-dom matchers and a localStorage mock)

---

#### `src/components/ui/__tests__/Badge.test.tsx` — 6 tests

| Test | Asserts |
|---|---|
| renders children | text content present |
| default variant | has `bg-surface-alt` class |
| success variant | has `bg-success-50` class |
| warning variant | has `bg-warning-50` class |
| danger variant | has `bg-danger-50` class |
| accepts additional className | custom class present |

---

#### `src/components/ui/__tests__/Button.test.tsx` — 7 tests

| Test | Asserts |
|---|---|
| renders children text | button text present |
| primary is default variant | has `bg-brand-600` class |
| secondary variant | has `bg-surface-alt` class |
| danger variant | has `bg-danger-500` class |
| calls onClick when clicked | handler called once |
| disabled button does not call onClick | handler not called |
| disabled button has opacity class | has `disabled:opacity-60` class |

---

#### `src/components/ui/__tests__/Input.test.tsx` — 10 tests

| Test | Asserts |
|---|---|
| renders label when provided | label text in DOM |
| renders without label element | no label when prop omitted |
| renders error message | error string displayed |
| renders helperText when no error | helperText string displayed |
| error takes priority over helperText | error shown, helperText hidden |
| type text has no toggle button | no password toggle button |
| type password shows toggle button | `aria-label="Show password"` present |
| password input not role textbox | `queryByRole('textbox')` returns null |
| password toggle changes input type | click → type="text"; click again → type="password" |
| toggle button aria-label updates | after click → aria-label becomes "Hide password" |

---

#### `src/components/ui/__tests__/Progress.test.tsx` — 5 tests

| Test | Asserts |
|---|---|
| renders at given percentage | inner div width = "50%" for value=50 |
| clamps value above 100 | value=150 → width "100%" |
| clamps value below 0 | value=-10 → width "0%" |
| renders at 0 | width "0%" |
| renders at 100 | width "100%" |

---

#### `src/store/__tests__/authStore.test.ts` — 8 tests

Uses Zustand `setState` directly; `localStorage` is mocked in `setupTests.ts` to support the `persist` middleware.

| Test | Asserts |
|---|---|
| initial state is unauthenticated | isAuthenticated=false, user=null, accessToken=null |
| setAuth sets all fields | isAuthenticated=true, user and accessToken populated |
| clearAuth resets all fields | back to initial state |
| setAccessToken updates token only | user unchanged, accessToken updated |
| hasRole returns true for matching role | videographer → hasRole(["videographer"]) = true |
| hasRole returns true when role is in the list | hasRole(["admin","videographer"]) = true |
| hasRole returns false for wrong role | hasRole(["admin"]) = false |
| hasRole returns false when no user | initial state → false |

---

#### `src/routes/__tests__/routePaths.test.ts` — 8 tests

| Test | Asserts |
|---|---|
| routePaths.auth.login | === "/login" |
| routePaths.app.videographer | === "/app/videographer" |
| routePaths.app.jobs | === "/app/jobs" |
| routePaths.app.admin | === "/app/admin" |
| getRoleRedirect admin | returns "/app/admin" |
| getRoleRedirect editor | returns "/app/editor" |
| getRoleRedirect videographer | returns "/app/videographer" |
| getRoleRedirect unknown role | defaults to "/app/videographer" without crashing |

---

## 8. FRONTEND PAGES AND ROUTES

| Route | Component | Real data? |
|---|---|---|
| / | Landing.tsx | N/A (static) |
| /login | Login.tsx | Yes — Supabase signInWithPassword |
| /register | Register.tsx | Yes — Supabase signUp |
| /forgot-password | ForgotPassword.tsx | Yes — Supabase resetPasswordForEmail |
| /auth/reset-password | ResetPassword.tsx | Yes — Supabase updateUser |
| /app/videographer | Videographer.tsx | Yes — GET /jobs |
| /app/videographer/new-analysis | NewAnalysis.tsx | Yes — POST /jobs |
| /app/editor | Editor.tsx | NO — hardcoded mock array |
| /app/admin | Admin.tsx | NO — hardcoded mock arrays |
| /app/admin/users | AdminUsers.tsx | Yes — GET /admin/users + mutations |
| /app/jobs | JobsList.tsx | Yes — GET /jobs with pagination |
| /app/jobs/:jobId | JobDetail.tsx | Yes — GET /jobs/{id}, polls every 6s |
| /app/jobs/:jobId/transcript | TranscriptViewerPage.tsx | Yes — transcript/highlights/audio APIs |
| /app/notifications | Notifications.tsx | Yes — GET /notifications + mutations |
| /app/notifications/settings | NotificationSettings.tsx | NO — toggle state only |
| /unauthorized | Unauthorized.tsx | N/A (static) |
| * | NotFound.tsx | N/A (static) |

---

## 9. README STATUS

There is no README.md at the project root.

Three partial docs exist:
- `backend/README.md` — exists (backend-only setup)
- `frontend/README.md` — exists (Vite boilerplate only)
- `PROJECT_STATUS.md` — this file

---

## 10. BUGS, TODOS, INCOMPLETE FEATURES

### Mocked pipeline steps

```
backend/pipeline/worker.py  # Noise Reduction — no real DSP
backend/pipeline/worker.py  # Speaker Diarization — no real service, all "Speaker 1"
```

### Hardcoded mock data in frontend pages

| File | What is hardcoded |
|---|---|
| pages/dashboard/Editor.tsx | jobQueue array with fake couples, stages, ETAs; all stat numbers |
| pages/dashboard/Admin.tsx | mockJobs, mockIssues, mockAudit arrays; all stat numbers |
| pages/dashboard/Analytics.tsx | fetchInsights() returns static sentiment/risk/highlights data |
| pages/dashboard/Overview.tsx | All metrics hardcoded (24 active projects, 94% audio quality, etc.) |
| pages/dashboard/Uploads.tsx | Empty table, all buttons non-functional |
| pages/notifications/NotificationSettings.tsx | Toggles only update component state, no persistence |

### Unimplemented features

| Feature | Status |
|---|---|
| Noise reduction DSP | Pipeline step exists as label + sleep only |
| Real speaker diarization | All segments get "Speaker 1" |
| Email notifications | In-app DB notifications only; no SMTP |
| WebSocket / SSE real-time updates | Frontend polls GET /jobs/{id} every 6s as workaround |
| Audio quality scoring | No backend endpoint, no DB metric |
| Risk flag analytics | No backend detection or table |
| Notification preferences | No DB table, no endpoint, UI is stub |
| Chunked/resumable upload | Single multipart/form-data POST only |

### VITE_API_URL env var defined but unused

`frontend/src/api/client.ts` has `const BASE_URL = 'http://localhost:8000'` hardcoded instead of reading `import.meta.env.VITE_API_URL`.

### Notification type mismatch

`frontend/src/types/notification.ts` declares extra types (`ProcessingComplete`, `KeyMomentsDetected`, `AudioQualityIssue`) that the backend never writes. Backend only writes `info`, `success`, `warning`, `error`.

---

**Total endpoints: 20 | Total DB tables: 6 | Total frontend pages: 16 | Total UI components: 17 | Automated tests: 87 (43 backend + 44 frontend)**

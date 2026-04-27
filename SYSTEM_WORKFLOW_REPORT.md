# Terminal 1 — Backend 
bashcd backend
source .venv/bin/activate
uvicorn main:app --reload --port 8000

# Terminal 2 — Frontend 
bashcd frontend
npm install
npm run dev

# Wedding Speech Analyzer - System Workflow Report

Report date: 2026-04-27

This report explains how the Wedding Speech Analyzer system is designed to work, how data moves through the platform, and what each user role does in the workflow. It describes the actual backend behavior and also notes where the current frontend screen is still using prototype behavior.

## 1. System Purpose

The Wedding Speech Analyzer Platform is built to help wedding media teams upload speech audio, automatically transcribe it, identify speakers, detect important emotional or narrative moments, and export useful transcript/highlight data for editors.

The system has three main roles:

- Videographer: uploads wedding speech recordings and monitors processing.
- Editor: reviews completed transcripts and highlights, then exports useful moments.
- Admin: manages users, roles, platform monitoring, and overall job visibility.

## 2. High-Level Architecture

The project has two main applications:

| Layer | Technology | Purpose |
|---|---|---|
| Frontend | React, TypeScript, Vite, Tailwind CSS | User interface, role-based pages, upload form, dashboards, transcript viewer. |
| Backend | FastAPI, Python | Authentication, job creation, file upload, AI processing, transcript/highlight APIs, notifications, admin APIs. |
| Database | Supabase PostgreSQL | Stores users, jobs, audio file metadata, transcript segments, highlights, and notifications. |
| AI Service | Google Gemini API | Processes uploaded audio and returns transcript segments, speakers, timestamps, and highlight scores. |
| Storage | Local filesystem | Uploaded audio files are currently saved into `UPLOAD_DIR`, default `./uploads`. |

The backend uses the Supabase service role key, so all database access is performed server-side. The frontend should not use Supabase directly.

## 3. Main Data Model

The Supabase schema contains these tables:

| Table | Purpose |
|---|---|
| `profiles` | Stores application users, password hashes, roles, and account status. |
| `jobs` | Stores each uploaded analysis job, owner, language, status, progress step, duration, and errors. |
| `audio_files` | Stores metadata for the uploaded audio file linked to a job. |
| `transcript_segments` | Stores timestamped transcript segments returned by Gemini. |
| `highlights` | Stores important moments detected from transcript segments. |
| `notifications` | Stores in-app alerts for job completion or processing failure. |

## 4. Authentication And Access Control

The backend has a custom JWT authentication system.

1. A user registers through `POST /auth/register`.
2. The backend checks whether the email already exists in `profiles`.
3. The password is hashed with bcrypt.
4. The user row is inserted into Supabase.
5. The backend returns an access token, refresh token, token type, and user object.

Login works through `POST /auth/login`:

1. The backend finds the user by email.
2. It verifies the bcrypt password hash.
3. Suspended users are blocked.
4. The backend returns new access and refresh tokens.

Protected endpoints use `get_current_user()`:

1. The bearer token is decoded.
2. The token must be an access token.
3. The user is fetched from `profiles`.
4. Suspended users are blocked.
5. Role checks are applied with `require_role()`.

Current roles are:

| Role | Backend value | Main permission |
|---|---|---|
| Videographer | `videographer` | Create jobs and view own jobs. |
| Editor | `editor` | View jobs/transcripts/highlights. |
| Admin | `admin` | Manage users and view admin stats. Also backend allows admin job upload. |

Important current issue: the frontend login page currently simulates login instead of calling the real login API. The backend authentication itself is real.

## 5. End-To-End Job Processing Workflow

This is the core system workflow.

### Step 1: User Uploads Audio

A videographer creates a new analysis job from the New Analysis screen.

The frontend sends a multipart request to:

`POST /jobs`

The request includes:

- `name`
- `language`
- `event_date`
- `notes`
- `audio_file`

The backend validates the file extension. Allowed extensions are:

- `.mp3`
- `.wav`
- `.m4a`
- `.ogg`
- `.webm`
- `.mp4`

### Step 2: Backend Stores File And Job Record

After validation:

1. The backend creates the upload directory if needed.
2. It generates a UUID filename.
3. It saves the uploaded file to the local filesystem.
4. It inserts a row into `jobs` with status `queued`.
5. It inserts a row into `audio_files` with file path, original name, size, and MIME type.
6. It starts a FastAPI background task called `process_job()`.

### Step 3: Background Processing Begins

The worker updates the job status to:

- `processing`
- `step_index = 1`
- `step_label = "Uploading Audio"`

Then it runs through these processing labels:

1. Uploading Audio
2. Noise Reduction
3. Speaker Diarization
4. Speech Recognition
5. NLP Analysis
6. Generating Highlights
7. Complete

Important current detail: noise reduction and separate diarization are represented as progress steps, but there is no separate DSP or pyannote-style diarization implementation. Gemini is asked to handle transcription, speaker identification, timestamps, and highlight scoring in one AI call.

### Step 4: Gemini Audio Analysis

The backend uploads the audio file to Gemini and sends a prompt asking for JSON only.

Expected Gemini output:

- total duration
- speakers
- transcript segments
- segment index
- speaker label
- start time
- end time
- transcribed text
- highlight score
- highlight label

Allowed highlight labels are:

- Emotional Peak
- Humor
- Toast
- Vows
- Advice

Segments scoring above `6.0` with a label become highlight candidates.

### Step 5: Store Transcript And Highlights

The worker stores each transcript segment in `transcript_segments`.

For highlight rows:

1. The worker checks each segment score.
2. If the score is greater than `6.0` and there is a label, it inserts a row into `highlights`.
3. The highlight row includes job ID, segment ID, score, label, start/end time, and text.

### Step 6: Complete Or Fail The Job

If processing succeeds:

1. The job becomes `ready`.
2. `duration_seconds` is saved.
3. `error_message` is cleared.
4. A success notification is inserted.

If processing fails:

1. The job becomes `failed`.
2. The error message is saved.
3. A failure notification is inserted.
4. The exception is raised by the background task.

### Step 7: User Reviews Results

When a job is ready, authenticated users can request:

- `GET /jobs/{job_id}/transcript`
- `GET /jobs/{job_id}/highlights`
- `GET /jobs/{job_id}/export/csv`
- `GET /jobs/{job_id}/export/json`

Videographers can only access their own jobs. Editors can access jobs through the backend route, but the current backend does not yet define editor-specific assignment rules.

## 6. Videographer Workflow

The videographer is the user who brings new wedding speech audio into the system.

### Intended Real Workflow

1. Videographer signs in.
2. The system redirects them to the Videographer Dashboard.
3. They choose New Analysis or Quick Upload.
4. They enter job details:
   - job name
   - event date
   - language
   - notes
5. They either choose an audio file or record audio through the browser microphone.
6. They submit the job.
7. The frontend uploads the file to the backend.
8. The backend creates a job and starts background processing.
9. The videographer views job progress.
10. When complete, they receive an in-app notification.
11. They open the job and review the generated transcript/highlights.
12. They can export transcript/highlight data or hand off the job to an editor.

### Backend Behavior For Videographers

Videographer access is enforced in these ways:

- `POST /jobs` allows `videographer` and `admin`.
- `GET /jobs` filters videographer users to only their own jobs.
- `GET /jobs/{job_id}` blocks videographers from viewing jobs owned by someone else.
- transcript, highlight, and export endpoints also check ownership through `_get_ready_job()`.

### Current Frontend Reality

Real/partially real:

- New Analysis upload calls the backend through `createAnalysisJob()`.
- Browser microphone recording uses real browser APIs.

Still prototype/dummy:

- Videographer dashboard numbers and recent jobs are hardcoded.
- Jobs list uses mock job rows.
- Job detail uses simulated job progress and mock highlights.
- Transcript viewer uses fake transcript text and `/audio/sample.mp3`.
- Login is simulated with a demo user/token.

## 7. Editor Workflow

The editor role is meant to review AI-generated transcripts and highlights and prepare outputs for editing work.

### Intended Real Workflow

1. Editor signs in.
2. The system redirects them to the Editor Dashboard.
3. Editor views jobs that are ready or assigned for review.
4. Editor opens a job detail page.
5. Editor reviews:
   - processing status
   - transcript
   - speaker labels
   - highlight labels
   - highlight scores
   - timestamps
6. Editor opens the Transcript Viewer.
7. Editor searches transcript text and jumps to highlighted sections.
8. Editor exports data as CSV or JSON for use in editing tools.
9. Editor may share or download highlight timestamps.

### Backend Behavior For Editors

The backend currently lets authenticated users call job read endpoints, with ownership restrictions only applied to videographers. That means editors can access job records through:

- `GET /jobs`
- `GET /jobs/{job_id}`
- `GET /jobs/{job_id}/transcript`
- `GET /jobs/{job_id}/highlights`
- export endpoints

However, there is no explicit editor assignment table or review status table. So the backend supports editor reading, but not a complete editor review-management workflow.

### Current Frontend Reality

Still prototype/dummy:

- Editor dashboard metrics are hardcoded.
- Editor job queue is hardcoded.
- Transcript Viewer uses mock transcript data.
- Job Detail exports mock highlight data locally.
- No real review state, assignment, approval, or editor notes are persisted.

## 8. Admin Workflow

The admin role manages platform users and monitors system activity.

### Intended Real Workflow

1. Admin signs in.
2. The system redirects them to the Admin Dashboard.
3. Admin reviews platform-level statistics:
   - total users
   - total jobs
   - jobs grouped by status
   - total highlights
4. Admin opens User Management.
5. Admin can:
   - list users
   - change a user role
   - suspend or activate users
   - delete users, except their own account
6. Admin monitors failed jobs and operational issues.
7. Admin checks notifications and platform status.

### Backend Behavior For Admins

Admin-only endpoints:

- `GET /admin/users`
- `PATCH /admin/users/{user_id}/role`
- `PATCH /admin/users/{user_id}/status`
- `DELETE /admin/users/{user_id}`
- `GET /admin/stats`

Admin users can also create jobs through `POST /jobs` because the backend allows `require_role("videographer", "admin")`.

### Current Frontend Reality

Real backend exists:

- Admin users API exists.
- Admin stats API exists.

Still prototype/dummy:

- Admin dashboard currently displays hardcoded cards, mock jobs, mock issues, and mock audit entries.
- Admin Users page uses a local `mockUsers` array.
- Role/status changes only show toasts and do not call backend endpoints.
- There is no real audit log table or issue queue endpoint in the backend.

## 9. Notification Workflow

The backend creates notifications during processing.

Success case:

- title: `Analysis Complete`
- type: `success`
- message includes the number of highlight moments found.

Failure case:

- title: `Analysis Failed`
- type: `error`
- message includes the processing error.

Users can:

- list notifications
- mark one notification as read
- mark all notifications as read
- clear all notifications

Current limitation:

- Notification settings are frontend-only state.
- There is no email provider integration.
- There are no persisted notification preferences.
- Some frontend notification code has TypeScript/cache update issues.

## 10. Export Workflow

The backend supports two export formats.

CSV export:

`GET /jobs/{job_id}/export/csv`

The CSV includes:

- transcript rows
- segment speaker
- start/end seconds
- text
- highlight label
- highlight score
- separate highlights section

JSON export:

`GET /jobs/{job_id}/export/json`

The JSON includes:

- job ID
- job name
- transcript array
- highlights array

Current frontend limitation:

- Some frontend export behavior still creates local mock files.
- Direct browser export URLs may fail with protected endpoints because Authorization headers are not automatically included in normal link downloads. The frontend should download through Axios as a blob.

## 11. Route And Screen Access By Role

| Route | Role access in frontend | Purpose |
|---|---|---|
| `/app/videographer` | Videographer | Videographer dashboard. |
| `/app/videographer/new-analysis` | Videographer | Create upload/analysis job. |
| `/app/editor` | Editor | Editor dashboard. |
| `/app/admin` | Admin | Admin dashboard. |
| `/app/admin/users` | Admin | User management. |
| `/app/jobs` | Videographer, Editor | Job list. |
| `/app/jobs/:jobId` | Videographer, Editor | Job details. |
| `/app/jobs/:jobId/transcript` | Videographer, Editor | Transcript viewer. |
| `/app/notifications` | Authenticated users | Notifications. |
| `/app/notifications/settings` | Authenticated users | Notification settings. |

Frontend route access is controlled by Zustand auth state and `RequireRole`. Backend access is controlled separately by JWT and role dependencies.

## 12. What Actually Happens In A Successful Real Backend Run

This is the clean backend sequence:

1. A real user exists in `profiles`.
2. The user logs in and receives a JWT.
3. The user uploads audio with `POST /jobs`.
4. Backend writes:
   - `jobs`
   - `audio_files`
5. Background task starts.
6. Backend updates job progress.
7. Gemini analyzes the uploaded audio.
8. Backend writes:
   - `transcript_segments`
   - `highlights`
9. Backend updates job to `ready`.
10. Backend writes a success notification.
11. Client reads job/transcript/highlights/export endpoints.

If Gemini fails, file is missing, JSON parsing fails, or no segments are returned:

1. Backend updates job to `failed`.
2. Backend saves the error message.
3. Backend creates a failure notification.
4. User can retry through `POST /jobs/{job_id}/retry`.

## 13. Current System Limitations

The most important limitations are:

- Frontend login/register are not connected to real auth yet.
- Many frontend dashboards still show hardcoded data.
- Frontend production build currently fails TypeScript checks.
- Audio files are stored locally, not in cloud object storage.
- Background processing uses FastAPI `BackgroundTasks`, not a durable job queue.
- Noise reduction is simulated.
- Separate speaker diarization is not implemented.
- WebSockets are not implemented.
- Email notification delivery is not implemented.
- Password reset is not implemented.
- Admin issue queue and audit log are not implemented as real backend features.
- Editor assignment/review workflow is not implemented as database-backed functionality.

## 14. Recommended Real Workflow Completion Plan

To make the role workflows fully real, complete the work in this order:

1. Fix frontend TypeScript build errors.
2. Wire login and register screens to real backend auth.
3. Store and refresh real JWT/refresh tokens reliably.
4. Connect Jobs List to `GET /jobs`.
5. Connect Job Detail to `GET /jobs/{id}` and `POST /jobs/{id}/retry`.
6. Connect Transcript Viewer to transcript/highlight APIs.
7. Implement authenticated export downloads through Axios blobs.
8. Connect notifications correctly and fix cache updates.
9. Connect Admin Users to real admin endpoints.
10. Connect Admin Dashboard to `/admin/stats`.
11. Replace or remove hardcoded dashboard metrics.
12. Add missing backend features only if required:
    - password reset
    - email notifications
    - notification preferences
    - editor assignments
    - audit log
    - issue queue
    - cloud storage
    - durable background queue

## 15. Final Summary

The real backend workflow is already clear: users create jobs, audio is stored, Gemini processes it, results are saved to Supabase, and users retrieve transcripts, highlights, exports, and notifications.

The role model is also clear:

- Videographers create and monitor analysis jobs.
- Editors review ready transcripts/highlights and export useful editing data.
- Admins manage users and monitor platform statistics.

The main gap is the frontend. Several screens describe the intended workflow, but many still use local mock data instead of the real backend. Once the frontend is connected to the existing APIs and the TypeScript build errors are fixed, the system can behave much closer to the real workflow described in this report.

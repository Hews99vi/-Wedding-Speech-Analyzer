# Wedding Speech Analyzer - Real Data vs Dummy Data Audit

Audit date: 2026-04-27

This document records what is actually connected to real data/APIs, what is still mocked or only local UI state, and what must be changed so the whole project works with real Supabase, Gemini, and backend API data.

## Executive Summary

The backend is mostly implemented for real data. It uses Supabase tables, JWT authentication, local file upload storage, Gemini audio analysis, transcript/highlight persistence, exports, notifications, and admin endpoints.

The frontend is mixed. Some API client functions exist and the new analysis upload page calls the backend, but many visible pages still use hardcoded/demo data. Login, register, job list, job detail, transcript viewer, admin dashboards, analytics, editor dashboard, videographer dashboard, uploads, and notification settings are not fully connected to real backend data.

The frontend also does not currently pass a production build. `npm run build` fails with TypeScript errors in auth storage, notification cache updates, notification type mapping, transcript virtualization, and `NewAnalysis` optimistic job typing.

## Verification Performed

- Read backend FastAPI routers, services, pipeline, schemas, and Supabase SQL schema.
- Read frontend API clients, routes, auth store, pages, and shared components.
- Searched for dummy/mock/sample/demo/placeholder code paths.
- Ran backend syntax check:
  - `python3 -m py_compile main.py config.py database.py schemas.py routers/*.py services/*.py pipeline/*.py`
  - Result: passed.
- Ran frontend build:
  - `npm run build`
  - Result: failed TypeScript compilation.
- Did not inspect or expose secrets from `backend/.env`.

## Features Working With Real Data/API

| Feature | Current real status | Evidence |
|---|---|---|
| Backend health/root endpoints | Real | `GET /health`, `GET /` in `backend/main.py`. |
| Backend configuration | Real env-based config | `backend/config.py` loads Supabase, Gemini, JWT, upload, CORS settings from `.env`. |
| Supabase client | Real | `backend/database.py` creates a Supabase client using service role credentials. |
| Database schema | Real schema exists | `backend/supabase_schema.sql` creates `profiles`, `jobs`, `audio_files`, `transcript_segments`, `highlights`, `notifications`. |
| Register API | Real | `POST /auth/register` writes to `profiles`, hashes password, returns JWT tokens. |
| Login API | Real | `POST /auth/login` validates bcrypt password from Supabase and returns JWT tokens. |
| Refresh token API | Real | `POST /auth/refresh` validates refresh JWT and issues new tokens. |
| Backend role authorization | Real | `get_current_user()` and `require_role()` enforce JWT and role checks. |
| Job upload API | Real | `POST /jobs` accepts multipart audio, saves local file, creates `jobs` and `audio_files` rows. |
| Job list API | Real | `GET /jobs` reads Supabase, paginates, filters videographer jobs by owner. |
| Job detail API | Real | `GET /jobs/{job_id}` reads Supabase and enforces videographer ownership. |
| Retry failed job API | Real | `POST /jobs/{job_id}/retry` clears previous transcript/highlights and reruns processing. |
| AI audio analysis | Real Gemini API call | `backend/services/gemini.py` uploads audio to Gemini and asks for JSON transcript/highlight output. |
| Pipeline persistence | Real | `backend/pipeline/worker.py` writes transcript segments, highlights, job status, duration, and notifications to Supabase. |
| Transcript API | Real | `GET /jobs/{job_id}/transcript` reads `transcript_segments` for ready jobs. |
| Highlights API | Real | `GET /jobs/{job_id}/highlights` reads `highlights` for ready jobs. |
| CSV/JSON export APIs | Real backend | `GET /jobs/{job_id}/export/csv` and `/export/json` stream transcript/highlight data. |
| Notifications API | Real backend | list, mark one read, mark all read, clear all operate on `notifications`. |
| Admin users API | Real backend | list users, update role/status, delete user. |
| Admin stats API | Real backend | reads profile, job, status, and highlight counts from Supabase. |
| Frontend API client layer | Real client functions exist | `frontend/src/api/auth.ts`, `jobs.ts`, `notifications.ts`. |
| Frontend token refresh interceptor | Mostly real | `frontend/src/api/client.ts` attaches bearer token and refreshes on 401. |
| New analysis upload page | Partially real | `frontend/src/pages/dashboard/NewAnalysis.tsx` calls `createAnalysisJob()`, which posts to `POST /jobs`. |
| Browser microphone recording | Real browser API | `NewAnalysis.tsx` uses `navigator.mediaDevices` and `MediaRecorder`, then attaches recording as an upload file. |
| Notification dropdown/page fetch | Partially real | `TopBar.tsx` and `Notifications.tsx` call `fetchNotifications()`, but TypeScript/cache bugs need fixing. |

## Features Still Using Dummy, Mock, Demo, or Local-Only Data

| Area | File(s) | Dummy/local behavior | What is needed for real data |
|---|---|---|---|
| Login UI | `frontend/src/pages/auth/Login.tsx` | Does not call `loginUser()`. It simulates auth, stores `demo-user` and `demo-access-token`, and uses developer demo accounts. | Call `loginUser()`, store real access + refresh token, remove role selector/demo auth bypass. |
| Register UI | `frontend/src/pages/auth/Register.tsx` | Only shows toast: `Account created. Please sign in.` No backend request. | Call `registerUser()`, handle duplicate email/API validation, store or redirect using real response. |
| Forgot password | `frontend/src/pages/auth/ForgotPassword.tsx` | Only sets local `sent` state and toast. Backend has no password reset endpoint. | Add backend reset-token/email flow or remove real-password-reset claim. |
| Jobs list | `frontend/src/pages/jobs/JobsList.tsx` | Uses `mockJobs` and `fetchJobs()` returns the local array. | Use `listJobs()`, map backend fields, implement server pagination/status filters or client mapping. |
| Job detail | `frontend/src/pages/jobs/JobDetail.tsx` | Uses `mockFetchJobDetail()`, `mockHighlights`, simulated progress, simulated failure/retry, local export generation. | Use `getJob()`, `retryJob()`, `getHighlights()`, export endpoints, and route transcript buttons to real transcript page. |
| Transcript viewer page | `frontend/src/pages/transcript/TranscriptViewerPage.tsx` | Uses `buildMockTranscript()` with Lorem Ipsum and `/audio/sample.mp3`. | Fetch `getTranscript()` and `getHighlights()`. Backend must expose the original uploaded audio URL or signed storage URL if playback is required. |
| Overview dashboard | `frontend/src/pages/dashboard/Overview.tsx` | Hardcoded active projects, reviews, audio quality, storage, turnaround, editor capacity. | Add or reuse stats endpoints that calculate real values. |
| Videographer dashboard | `frontend/src/pages/dashboard/Videographer.tsx` | Hardcoded metrics and `recentJobs` array. | Use `listJobs()` and computed totals/progress from real jobs. |
| Editor dashboard | `frontend/src/pages/dashboard/Editor.tsx` | Hardcoded queue and metrics. | Add editor queue endpoint or use real ready/processing jobs plus highlights/export data. |
| Analytics page | `frontend/src/pages/dashboard/Analytics.tsx` | `fetchInsights()` waits 600ms and returns static sentiment/highlights/risk flags. | Add backend analytics endpoint or compute from real jobs/highlights. |
| Admin monitoring page | `frontend/src/pages/dashboard/Admin.tsx` | Uses `mockJobs`, `mockIssues`, `mockAudit`, and hardcoded summary cards. | Use `/admin/stats`, real jobs, and add real issue/audit endpoints if those features are required. |
| Admin users page | `frontend/src/pages/admin/AdminUsers.tsx` | Uses `mockUsers`; role/status actions only show toasts. | Call `/admin/users`, `/admin/users/{id}/role`, `/admin/users/{id}/status`, and delete endpoint if needed. |
| Notification settings | `frontend/src/pages/notifications/NotificationSettings.tsx` | Toggles are only component state. Save button has no action. | Add backend table/endpoints for notification preferences, then read/write preferences. |
| Uploads page | `frontend/src/pages/dashboard/Uploads.tsx` | Uses an empty local `rows` array; buttons do nothing. | Either remove page or connect it to jobs/audio file metadata. |
| Landing demo CTA | `frontend/src/pages/common/Landing.tsx` | Contains demo-oriented CTA text. | Fine for marketing, but it does not represent real data functionality. |

## Claims In The UI That Are Not Actually Implemented

| Claim / visible behavior | Current reality | Required fix |
|---|---|---|
| "Chunked upload ready", "Auto-resume", "Checksum verify", "resumable chunks" | Upload is a single multipart request to `POST /jobs`. No chunk table, checksum, or resume protocol exists. | Implement chunked/resumable upload backend and frontend, or remove these labels. |
| "Noise Reduction" pipeline step | Backend only updates the step and sleeps for 1 second. No DSP/noise reduction is run. | Add real audio preprocessing or label it as a pipeline status only. |
| "Speaker Diarization" pipeline step | Gemini is asked to identify speakers in the same prompt. No separate diarization model runs. | Accept Gemini-only diarization or add pyannote/other diarization service. |
| "WebSocket channel placeholder ready" | No WebSocket backend exists. Frontend mock detail polls a fake function. | Add WebSocket/SSE or use real polling against `GET /jobs/{id}`. |
| "Email settings" / email notification delivery | No email service or preferences backend exists. Notifications are in-app database rows only. | Add email provider and preferences model/endpoints. |
| "Audio quality issue" notifications | Backend only creates success/error notifications from processing. No audio quality scoring exists. | Implement quality scoring and create real warning notifications. |
| "Risk flags" analytics | No backend risk detection endpoint or schema exists. | Add analysis fields/table and endpoint, or remove from UI. |
| Export URL helpers in frontend | `getExportCsvUrl()` and `getExportJsonUrl()` return raw URLs. Backend export endpoints require bearer auth, so normal direct browser downloads will not include the token. | Download exports through Axios as blobs with Authorization header. |

## Build And Type Problems Blocking A Real Release

`npm run build` currently fails. Main issues:

- `frontend/src/api/client.ts`: `readUserFromStorage` is unused.
- `frontend/src/store/authStore.ts`: `createJSONStorage(safeStorage)` typing fails because storage may be `undefined`.
- `frontend/src/components/TopBar.tsx`: React Query cache is updated with a single notification or `{ message }` where an array is expected.
- `frontend/src/pages/notifications/Notifications.tsx`: same React Query cache issue.
- `frontend/src/pages/notifications/Notifications.tsx`: notification type label maps do not include backend types `info`, `success`, `warning`, `error`.
- `frontend/src/pages/notifications/Notifications.tsx`: `createdAt` can be undefined.
- `frontend/src/components/transcript/TranscriptViewer.tsx`: `react-window` `List` child/render typing is incorrect for the installed version.
- `frontend/src/pages/dashboard/NewAnalysis.tsx`: optimistic job object does not satisfy the required `Job` type.
- `frontend/src/pages/transcript/TranscriptViewerPage.tsx`: unused `Card` import.

Backend Python compile check passed.

## Backend Gaps To Make Everything Real

1. Add password reset endpoints and email sending if forgot-password must be real.
2. Add notification preference table/endpoints if notification settings must persist.
3. Add frontend-facing audio playback support:
   - expose uploaded audio metadata/URL, or
   - store audio in Supabase Storage/S3 and return signed URLs.
4. Decide whether local upload storage is acceptable. Current files are saved to `./uploads`, not cloud storage.
5. Add real chunked/resumable upload support or remove the claim from UI.
6. Add real audio preprocessing/noise reduction if that step must be more than status text.
7. Add real analytics/admin issue/audit endpoints if dashboards must show real operational data.
8. Consider background processing durability. FastAPI `BackgroundTasks` works for a demo but is not reliable for long-running production jobs after server restarts.
9. Update Gemini model/config. Current code uses `gemini-1.5-flash`; confirm availability and desired model before production deployment.

## Frontend Work Required To Remove Dummy Data

Priority order:

1. Fix TypeScript build errors so the app can ship.
2. Replace demo login with `loginUser()` and persist both access and refresh tokens.
3. Replace register toast with `registerUser()`.
4. Connect `JobsList` to `listJobs()`.
5. Connect `JobDetail` to `getJob()`, `retryJob()`, `getHighlights()`, and real export downloads.
6. Connect `TranscriptViewerPage` to `getTranscript()` and `getHighlights()`.
7. Fix notification cache updates and backend type mapping.
8. Connect admin user page to real admin user endpoints.
9. Connect admin dashboard to `/admin/stats`; create missing issue/audit endpoints only if those screens are required.
10. Replace hardcoded videographer/editor/overview/analytics metrics with derived real data or hide unfinished cards.
11. Remove unsupported UI claims for chunking, auto-resume, checksum, WebSockets, email delivery, and risk flags until implemented.

## Suggested Real-Data Acceptance Checklist

A feature should be considered real only when all items below are true:

- It calls a backend endpoint or external API, not a local array or fake delay.
- It persists or reads from Supabase or another real storage system.
- It works after browser refresh and across user accounts.
- It respects backend authentication and role permissions.
- It has loading, empty, success, and error states.
- It passes `npm run build`.
- It has at least one manual test path documented.

## Current Bottom Line

The backend is a real API foundation, but the frontend is still largely a prototype shell. The most real end-to-end path is:

Register/login through backend API manually or after wiring UI -> upload a new analysis from `NewAnalysis` -> backend stores job/audio -> Gemini processes audio -> backend stores transcript/highlights -> backend exposes transcript/highlights/export/notifications.

The visible app experience is not yet fully real because many screens bypass those APIs and display mock data.

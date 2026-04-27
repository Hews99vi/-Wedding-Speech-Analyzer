# Wedding Speech Analyzer Platform Backend
FastAPI backend for the Wedding Speech Analyzer Platform using Supabase, JWT auth, and Gemini 1.5 Flash.

## 1. Project Title and Description
Wedding Speech Analyzer Platform Backend — API server for authentication, job processing, transcript analysis, notifications, and admin operations.

## 2. Prerequisites
- Python 3.11+
- Redis NOT required (we use FastAPI BackgroundTasks)
- Supabase account (free tier works)
- Google Gemini API key (free tier: 1500 req/day)

## 3. First-Time Setup
```bash
cd backend
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env and fill in SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, GEMINI_API_KEY, JWT_SECRET
```

## 4. Supabase Setup
- Go to supabase.com and create a project.
- Open SQL Editor, click New Query, paste `supabase_schema.sql`, and run it.
- Go to Settings > API.
- Copy Project URL into `SUPABASE_URL`.
- Copy service_role key into `SUPABASE_SERVICE_ROLE_KEY`.
- WARNING: use service_role key NOT anon key.

## 5. Run the Backend
```bash
uvicorn main:app --reload --port 8000
```

## 6. Verify It Works
- `http://localhost:8000` -> `{"message": "Wedding Speech Analyzer API", "docs": "/docs"}`
- `http://localhost:8000/health` -> `{"status": "ok", "version": "1.0.0"}`
- `http://localhost:8000/docs` -> Swagger UI with all endpoints

## 7. Run the Frontend
```bash
cd frontend
npm install
npm run dev
```
Then open `http://localhost:5173`.

## 8. API Reference
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/auth/register` | Public | Register a new user and return access/refresh tokens. |
| POST | `/auth/login` | Public | Authenticate user and return access/refresh tokens. |
| POST | `/auth/refresh` | Public (refresh token) | Issue new token pair from refresh token. |
| POST | `/jobs` | `videographer` or `admin` | Upload audio and create a queued processing job. |
| GET | `/jobs` | Any authenticated user | List jobs (role-filtered for videographers) with pagination. |
| GET | `/jobs/{id}` | Any authenticated user | Get a single job by ID with access control. |
| POST | `/jobs/{id}/retry` | Any authenticated user | Retry a failed job and requeue pipeline processing. |
| GET | `/jobs/{id}/transcript` | Any authenticated user | Get transcript segments for a ready job. |
| GET | `/jobs/{id}/highlights` | Any authenticated user | Get highlights for a ready job. |
| GET | `/jobs/{id}/export/csv` | Any authenticated user | Download transcript + highlights as CSV. |
| GET | `/jobs/{id}/export/json` | Any authenticated user | Download transcript + highlights as JSON. |
| GET | `/notifications` | Any authenticated user | List latest notifications for current user. |
| PATCH | `/notifications/read-all` | Any authenticated user | Mark all notifications as read. |
| PATCH | `/notifications/{id}` | Any authenticated user | Mark one notification as read. |
| DELETE | `/notifications` | Any authenticated user | Delete all notifications for current user. |
| GET | `/admin/users` | `admin` | List all platform users. |
| PATCH | `/admin/users/{id}/role` | `admin` | Update a user role. |
| PATCH | `/admin/users/{id}/status` | `admin` | Update a user status (active/suspended). |
| DELETE | `/admin/users/{id}` | `admin` | Delete a user (cannot delete self). |
| GET | `/admin/stats` | `admin` | Get admin dashboard statistics. |

## 9. How the AI Pipeline Works
Upload audio -> FastAPI saves file -> BackgroundTasks runs `process_job()` -> Steps update in DB (Uploading Audio -> Noise Reduction -> Speaker Diarization -> Speech Recognition -> NLP Analysis -> Generating Highlights) -> Gemini 1.5 Flash analyzes audio in one API call -> Transcript segments and highlights are saved to Supabase -> Frontend polls `GET /jobs/{id}` to show live progress -> Job status becomes `ready` -> transcript and highlights are available.

## 10. Environment Variables Reference
| Variable | Required | Description |
|---|---|---|
| `SUPABASE_URL` | Yes | Supabase project URL from API settings. |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Supabase service role key (server-side, high privilege). |
| `GEMINI_API_KEY` | Yes | Google Gemini API key for audio analysis. |
| `JWT_SECRET` | Yes | Secret key used to sign JWT access/refresh tokens. |
| `JWT_ALGORITHM` | Yes | JWT signing algorithm (default `HS256`). |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Yes | Access token expiry in minutes. |
| `REFRESH_TOKEN_EXPIRE_DAYS` | Yes | Refresh token expiry in days. |
| `UPLOAD_DIR` | Yes | Local filesystem directory for uploaded audio files. |
| `CORS_ORIGINS` | Yes | Comma-separated allowed frontend origins. |

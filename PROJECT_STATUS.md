# Wedding Speech Analyzer Platform - Project Status

## 1. Project Identity
- **Project Title:** Wedding Speech Analyzer Platform
- **Student:** Kodagodage Dias Yapa
- **Student ID:** 10952648
- **Module:** PUSL3190
- **Supervisor:** Ms. Dulanjali Wijesekara

## 2. Implementation Status
| Component | Status | Notes |
|---|---|---|
| Frontend UI (React/TS) | ✅ Complete | All pages, routing, RBAC, dark mode |
| API Client Layer | ✅ Complete | Axios + JWT refresh interceptor |
| Backend API Server | ✅ Complete | FastAPI, 15 endpoints across 5 routers |
| Database Schema | ✅ Complete | 6 tables in Supabase PostgreSQL |
| Authentication | ✅ Complete | JWT + bcrypt, 3 roles |
| File Upload | ✅ Complete | Multipart, stored locally |
| AI Pipeline | ✅ Complete | Gemini 1.5 Flash (STT + diarization + NLP) |
| Transcript API | ✅ Complete | Segments with timestamps and speakers |
| Highlights API | ✅ Complete | Scored and categorised moments |
| Export (CSV/JSON) | ✅ Complete | Downloadable from frontend |
| Notifications | ✅ Complete | Job completion alerts |
| Admin Panel | ✅ Complete | User management + platform stats |
| Speaker Diarization | 🔄 Via Gemini | Gemini identifies speakers in transcription call |
| Noise Reduction | 🔄 Simulated | Step shown in pipeline, full DSP implementation planned |
| Custom ML Models | 📋 Planned | Whisper + pyannote.audio integration in next phase |

## 3. Tech Stack Used
- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS, Zustand, Axios
- **Backend:** Python 3.11, FastAPI, supabase-py
- **Database:** PostgreSQL via Supabase
- **AI/ML:** Google Gemini 1.5 Flash API
- **Auth:** JWT (python-jose), bcrypt (passlib)
- **Storage:** Local filesystem (`./uploads`)

## 4. API Endpoints Summary
- Auth: 3 endpoints
- Jobs: 4 endpoints
- Transcripts: 4 endpoints
- Notifications: 4 endpoints
- Admin: 5 endpoints
- **Total: 20 endpoints**

## 5. How to Run the Project
- **Step 1:** Run Supabase schema SQL.
- **Step 2:** `cd backend && source .venv/bin/activate && uvicorn main:app --reload --port 8000`
- **Step 3:** `cd frontend && npm run dev`

## 6. Known Limitations and Next Steps
- Audio files stored locally (S3 migration planned)
- Noise reduction is simulated (noisereduce library integration planned)
- Custom Whisper fine-tuning on wedding speech corpus planned
- pyannote.audio diarization to replace Gemini speaker detection planned
- WebSocket real-time updates (currently frontend polls every 3s)
- Sinhala language accuracy depends on Gemini's multilingual capability

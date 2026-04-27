import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from config import get_settings
from routers import admin, auth, jobs, notifications, transcripts


settings = get_settings()

app = FastAPI(title="Wedding Speech Analyzer API", version="1.0.0")

cors_origins = [origin.strip() for origin in settings.cors_origins.split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

os.makedirs(settings.upload_dir, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=settings.upload_dir), name="uploads")

# Both routers use prefix="/jobs" and are additive in FastAPI.
app.include_router(auth.router)
app.include_router(jobs.router)
app.include_router(transcripts.router)
app.include_router(notifications.router)
app.include_router(admin.router)


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok", "version": "1.0.0"}


@app.get("/")
async def root() -> dict[str, str]:
    return {"message": "Wedding Speech Analyzer API", "docs": "/docs"}

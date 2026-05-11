import pytest
from fastapi.testclient import TestClient
from unittest.mock import MagicMock


MOCK_VIDEOGRAPHER = {
    "id": "vid-user-1",
    "name": "Test Videographer",
    "email": "vid@test.com",
    "role": "videographer",
    "status": "active",
    "created_at": "2025-01-01T00:00:00+00:00",
}

MOCK_ADMIN = {
    "id": "admin-user-1",
    "name": "Test Admin",
    "email": "admin@test.com",
    "role": "admin",
    "status": "active",
    "created_at": "2025-01-01T00:00:00+00:00",
}


@pytest.fixture()
def mock_sb():
    return MagicMock()


def _patch_supabase(monkeypatch, mock_sb):
    monkeypatch.setattr("routers.jobs.get_supabase", lambda: mock_sb)
    monkeypatch.setattr("routers.admin.get_supabase", lambda: mock_sb)
    monkeypatch.setattr("routers.notifications.get_supabase", lambda: mock_sb)
    monkeypatch.setattr("routers.transcripts.get_supabase", lambda: mock_sb)


@pytest.fixture()
def client_videographer(mock_sb, monkeypatch):
    _patch_supabase(monkeypatch, mock_sb)

    from main import app
    from services.auth import get_current_user

    app.dependency_overrides[get_current_user] = lambda: MOCK_VIDEOGRAPHER
    with TestClient(app) as client:
        yield client, mock_sb
    app.dependency_overrides.clear()


@pytest.fixture()
def client_admin(mock_sb, monkeypatch):
    _patch_supabase(monkeypatch, mock_sb)

    from main import app
    from services.auth import get_current_user

    app.dependency_overrides[get_current_user] = lambda: MOCK_ADMIN
    with TestClient(app) as client:
        yield client, mock_sb
    app.dependency_overrides.clear()


@pytest.fixture()
def client_no_auth():
    from main import app

    with TestClient(app, raise_server_exceptions=False) as client:
        yield client

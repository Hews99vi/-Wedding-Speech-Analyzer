from unittest.mock import MagicMock
from postgrest.exceptions import APIError


# ── Shared fixture data ───────────────────────────────────────────────────────

JOB_DICT = {
    "id": "job-1",
    "user_id": "vid-user-1",
    "name": "Wedding Speech",
    "language": "en",
    "status": "ready",
    "step_index": 6,
    "step_label": "Done",
    "error_message": None,
    "duration_seconds": None,
    "event_date": None,
    "notes": None,
    "created_at": "2025-01-01T00:00:00+00:00",
    "updated_at": "2025-01-01T00:00:00+00:00",
}

USER_DICT = {
    "id": "vid-user-1",
    "name": "Test Videographer",
    "email": "vid@test.com",
    "role": "videographer",
    "status": "active",
    "created_at": "2025-01-01T00:00:00+00:00",
}

NOTIF_DICT = {
    "id": "notif-1",
    "user_id": "vid-user-1",
    "type": "info",
    "title": "Job ready",
    "message": "Your job is ready",
    "read": False,
    "job_id": None,
    "created_at": "2025-01-01T00:00:00+00:00",
}


# ── Auth routes ───────────────────────────────────────────────────────────────

def test_get_me_returns_current_user(client_videographer):
    client, _ = client_videographer
    response = client.get("/auth/me")
    assert response.status_code == 200
    data = response.json()
    assert data["role"] == "videographer"
    assert data["email"] == "vid@test.com"


def test_get_me_requires_auth(client_no_auth):
    response = client_no_auth.get("/auth/me")
    assert response.status_code == 403


def test_health_check(client_no_auth):
    response = client_no_auth.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


# ── Jobs routes ───────────────────────────────────────────────────────────────

def test_list_jobs_returns_200(client_videographer):
    client, mock_sb = client_videographer

    execute_result = MagicMock()
    execute_result.data = [JOB_DICT]
    execute_result.count = 1
    # videographer path: .table().select().eq().order().range().execute()
    (
        mock_sb.table.return_value
        .select.return_value
        .eq.return_value
        .order.return_value
        .range.return_value
        .execute.return_value
    ) = execute_result

    response = client.get("/jobs")
    assert response.status_code == 200
    body = response.json()
    assert body["total"] == 1
    assert len(body["items"]) == 1
    assert body["items"][0]["name"] == "Wedding Speech"


def test_list_jobs_requires_auth(client_no_auth):
    response = client_no_auth.get("/jobs")
    assert response.status_code == 403


def test_get_job_not_found(client_videographer):
    client, mock_sb = client_videographer

    error = APIError({"code": "PGRST116", "message": "No rows found", "details": "", "hint": ""})
    (
        mock_sb.table.return_value
        .select.return_value
        .eq.return_value
        .single.return_value
        .execute.side_effect
    ) = error

    response = client.get("/jobs/nonexistent-id")
    assert response.status_code == 404


def test_get_job_wrong_owner_forbidden(client_videographer):
    client, mock_sb = client_videographer

    other_job = {**JOB_DICT, "user_id": "someone-else"}
    execute_result = MagicMock()
    execute_result.data = other_job
    (
        mock_sb.table.return_value
        .select.return_value
        .eq.return_value
        .single.return_value
        .execute.return_value
    ) = execute_result

    response = client.get("/jobs/job-1")
    assert response.status_code == 403


# ── Admin routes ──────────────────────────────────────────────────────────────

def test_admin_list_users_requires_admin_role(client_videographer):
    client, _ = client_videographer
    response = client.get("/admin/users")
    assert response.status_code == 403


def test_admin_list_users_returns_users(client_admin):
    client, mock_sb = client_admin

    execute_result = MagicMock()
    execute_result.data = [USER_DICT]
    (
        mock_sb.table.return_value
        .select.return_value
        .order.return_value
        .execute.return_value
    ) = execute_result

    response = client.get("/admin/users")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["email"] == "vid@test.com"


def test_admin_stats_returns_counts(client_admin):
    client, mock_sb = client_admin

    # get_admin_stats calls .execute() 4 times in sequence
    r1 = MagicMock(count=5, data=[])
    r2 = MagicMock(count=10, data=[])
    r3 = MagicMock(count=None, data=[{"status": "ready"}, {"status": "queued"}])
    r4 = MagicMock(count=3, data=[])
    mock_sb.table.return_value.select.return_value.execute.side_effect = [r1, r2, r3, r4]

    response = client.get("/admin/stats")
    assert response.status_code == 200
    data = response.json()
    assert "total_users" in data
    assert data["total_users"] == 5
    assert data["total_jobs"] == 10
    assert data["total_highlights"] == 3


# ── Notifications routes ──────────────────────────────────────────────────────

def test_list_notifications_returns_200(client_videographer):
    client, mock_sb = client_videographer

    execute_result = MagicMock()
    execute_result.data = [NOTIF_DICT]
    (
        mock_sb.table.return_value
        .select.return_value
        .eq.return_value
        .order.return_value
        .limit.return_value
        .execute.return_value
    ) = execute_result

    response = client.get("/notifications")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["title"] == "Job ready"


def test_mark_all_read_returns_message(client_videographer):
    client, mock_sb = client_videographer

    (
        mock_sb.table.return_value
        .update.return_value
        .eq.return_value
        .execute.return_value
    ) = MagicMock()

    response = client.patch("/notifications/read-all")
    assert response.status_code == 200
    assert "message" in response.json()


def test_clear_notifications_returns_message(client_videographer):
    client, mock_sb = client_videographer

    (
        mock_sb.table.return_value
        .delete.return_value
        .eq.return_value
        .execute.return_value
    ) = MagicMock()

    response = client.delete("/notifications")
    assert response.status_code == 200
    assert "message" in response.json()

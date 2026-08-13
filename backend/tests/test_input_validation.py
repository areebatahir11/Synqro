from fastapi.testclient import TestClient

from main import app

client = TestClient(app)


def test_invalid_role_value_rejected(admin_headers):
    r = client.post(
        "/users",
        json={
            "email": "bad-role-test@synqro.test",
            "password": "password123",
            "full_name": "Bad Role",
            "role": "superuser",
        },
        headers=admin_headers,
    )
    assert r.status_code == 422


def test_invalid_priority_value_rejected(admin_headers, pm_id):
    r = client.post(
        "/projects",
        json={"name": "Bad Priority Project", "priority": "urgent!!", "project_manager_id": pm_id},
        headers=admin_headers,
    )
    assert r.status_code == 422


def test_end_date_before_start_date_rejected(admin_headers, pm_id):
    r = client.post(
        "/projects",
        json={
            "name": "Bad Dates",
            "start_date": "2026-06-01",
            "end_date": "2026-01-01",
            "project_manager_id": pm_id,
        },
        headers=admin_headers,
    )
    assert r.status_code == 422


def test_blank_task_title_rejected(project_with_member, pm_headers):
    r = client.post(f"/projects/{project_with_member['id']}/tasks", json={"title": "   "}, headers=pm_headers)
    assert r.status_code == 422


def test_missing_required_field_rejected(admin_headers):
    r = client.post("/users", json={"email": "missing-fields@synqro.test"}, headers=admin_headers)
    assert r.status_code == 422


def test_error_response_has_consistent_shape(admin_headers):
    r = client.post("/users", json={"email": "not-an-email"}, headers=admin_headers)
    assert r.status_code == 422
    body = r.json()
    assert "error" in body
    assert "message" in body["error"]
    assert "code" in body["error"]


def test_404_uses_same_error_shape():
    r = client.get("/this-route-does-not-exist")
    assert r.status_code == 404
    body = r.json()
    assert "error" in body
    assert "message" in body["error"]


def test_duplicate_email_on_user_creation_returns_clean_message(admin_headers):
    payload = {
        "email": "duplicate-test@synqro.test",
        "password": "password123",
        "full_name": "Duplicate Test",
        "role": "team_member",
    }
    first = client.post("/users", json=payload, headers=admin_headers)
    assert first.status_code in (201, 409)  # 409 if a previous run already created this account

    second = client.post("/users", json=payload, headers=admin_headers)
    assert second.status_code == 409
    assert "already exists" in second.json()["error"]["message"].lower()

    # cleanup
    if first.status_code == 201:
        client.delete(f"/users/{first.json()['id']}", headers=admin_headers)
from fastapi.testclient import TestClient

from main import app

client = TestClient(app)


def test_login_success_returns_token(admin_headers):
    assert "Authorization" in admin_headers


def test_login_with_wrong_password_rejected():
    r = client.post(
        "/auth/login",
        json={"email": "no-such-account@synqro.test", "password": "definitely-wrong-123"},
    )
    assert r.status_code == 401


def test_login_with_malformed_email_returns_422():
    r = client.post("/auth/login", json={"email": "not-an-email", "password": "x"})
    assert r.status_code == 422


def test_me_reflects_correct_role_per_account(admin_headers, pm_headers, member_headers):
    assert client.get("/auth/me", headers=admin_headers).json()["role"] == "admin"
    assert client.get("/auth/me", headers=pm_headers).json()["role"] == "project_manager"
    assert client.get("/auth/me", headers=member_headers).json()["role"] == "team_member"


def test_unauthenticated_request_is_rejected():
    r = client.get("/auth/me")
    assert r.status_code in (401, 403)


def test_garbage_token_is_rejected():
    r = client.get("/auth/me", headers={"Authorization": "Bearer not-a-real-token"})
    assert r.status_code == 401
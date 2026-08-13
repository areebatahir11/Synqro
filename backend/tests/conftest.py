import os
import uuid

import pytest
from fastapi.testclient import TestClient

from main import app

client = TestClient(app)


def _login(email: str, password: str) -> dict:
    r = client.post("/auth/login", json={"email": email, "password": password})
    assert r.status_code == 200, f"Login failed for {email}: {r.status_code} {r.text}"
    token = r.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture(scope="session")
def admin_headers():
    return _login(os.environ["TEST_ADMIN_EMAIL"], os.environ["TEST_ADMIN_PASSWORD"])


@pytest.fixture(scope="session")
def pm_headers():
    return _login(os.environ["TEST_PM_EMAIL"], os.environ["TEST_PM_PASSWORD"])


@pytest.fixture(scope="session")
def member_headers():
    return _login(os.environ["TEST_MEMBER_EMAIL"], os.environ["TEST_MEMBER_PASSWORD"])


@pytest.fixture(scope="session")
def pm_id(pm_headers):
    return client.get("/auth/me", headers=pm_headers).json()["id"]


@pytest.fixture(scope="session")
def member_id(member_headers):
    return client.get("/auth/me", headers=member_headers).json()["id"]


@pytest.fixture
def fresh_project(admin_headers, pm_id):
    """
    Admin creates a brand-new project assigned to the test PM. Most
    task/discussion tests build on top of this so each test starts from
    a clean, isolated project instead of sharing state across the suite.
    Deletes itself (and, via FK cascade, its tasks/discussions/notifications)
    after the test.
    """
    payload = {
        "name": f"Test Project {uuid.uuid4().hex[:8]}",
        "description": "Created by the automated test suite — safe to delete.",
        "priority": "medium",
        "status": "active",
        "project_manager_id": pm_id,
    }
    r = client.post("/projects", json=payload, headers=admin_headers)
    assert r.status_code == 201, r.text
    project = r.json()
    yield project
    client.delete(f"/projects/{project['id']}", headers=admin_headers)


@pytest.fixture
def project_with_member(fresh_project, pm_headers, member_id):
    """Same as fresh_project, but the test team member has already been added."""
    r = client.post(
        f"/projects/{fresh_project['id']}/members",
        json={"member_id": member_id},
        headers=pm_headers,
    )
    assert r.status_code == 201, r.text
    return fresh_project
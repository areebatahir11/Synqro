import uuid

from fastapi.testclient import TestClient

from main import app

client = TestClient(app)


def test_admin_can_create_project(admin_headers, pm_id):
    payload = {"name": f"RBAC Create Test {uuid.uuid4().hex[:6]}", "project_manager_id": pm_id}
    r = client.post("/projects", json=payload, headers=admin_headers)
    assert r.status_code == 201
    client.delete(f"/projects/{r.json()['id']}", headers=admin_headers)


def test_pm_cannot_create_project(pm_headers, pm_id):
    payload = {"name": "Should be rejected", "project_manager_id": pm_id}
    r = client.post("/projects", json=payload, headers=pm_headers)
    assert r.status_code == 403


def test_team_member_cannot_create_project(member_headers, pm_id):
    payload = {"name": "Should be rejected", "project_manager_id": pm_id}
    r = client.post("/projects", json=payload, headers=member_headers)
    assert r.status_code == 403


def test_pm_sees_their_assigned_project_in_list(fresh_project, pm_headers):
    r = client.get("/projects", headers=pm_headers)
    assert r.status_code == 200
    ids = [p["id"] for p in r.json()]
    assert fresh_project["id"] in ids


def test_team_member_cannot_see_project_before_being_added(fresh_project, member_headers):
    r = client.get(f"/projects/{fresh_project['id']}", headers=member_headers)
    # RLS hides the row entirely — from the caller's side this looks like 404,
    # not 403, which is the correct behavior (don't reveal the project exists).
    assert r.status_code == 404


def test_team_member_sees_project_after_being_added(project_with_member, member_headers):
    r = client.get(f"/projects/{project_with_member['id']}", headers=member_headers)
    assert r.status_code == 200


def test_pm_can_update_own_project_description(fresh_project, pm_headers):
    r = client.patch(
        f"/projects/{fresh_project['id']}",
        json={"description": "Updated by PM"},
        headers=pm_headers,
    )
    assert r.status_code == 200
    assert r.json()["description"] == "Updated by PM"


def test_pm_cannot_reassign_project_manager(fresh_project, pm_headers):
    r = client.patch(
        f"/projects/{fresh_project['id']}",
        json={"project_manager_id": "00000000-0000-0000-0000-000000000000", "description": "still me"},
        headers=pm_headers,
    )
    assert r.status_code == 200
    # the project_manager_id must be silently unchanged, not the bogus one
    assert r.json()["project_manager_id"] == fresh_project["project_manager_id"]


def test_only_admin_can_delete_project(fresh_project, pm_headers):
    r = client.delete(f"/projects/{fresh_project['id']}", headers=pm_headers)
    assert r.status_code == 403


def test_team_member_cannot_add_project_members(fresh_project, member_headers, member_id):
    r = client.post(
        f"/projects/{fresh_project['id']}/members",
        json={"member_id": member_id},
        headers=member_headers,
    )
    assert r.status_code == 403
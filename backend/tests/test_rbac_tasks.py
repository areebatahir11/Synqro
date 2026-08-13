import uuid

from fastapi.testclient import TestClient

from main import app

client = TestClient(app)


def _create_task(project_id: str, headers: dict, assigned_to: str | None = None) -> dict:
    payload = {"title": f"Task {uuid.uuid4().hex[:6]}", "priority": "medium"}
    if assigned_to:
        payload["assigned_to"] = assigned_to
    r = client.post(f"/projects/{project_id}/tasks", json=payload, headers=headers)
    assert r.status_code == 201, r.text
    return r.json()


def test_pm_can_create_and_assign_task(project_with_member, pm_headers, member_id):
    task = _create_task(project_with_member["id"], pm_headers, assigned_to=member_id)
    assert task["assigned_to"] == member_id
    assert task["status"] == "todo"


def test_team_member_cannot_create_task(project_with_member, member_headers):
    r = client.post(
        f"/projects/{project_with_member['id']}/tasks",
        json={"title": "Should be rejected"},
        headers=member_headers,
    )
    assert r.status_code == 403


def test_team_member_can_update_status_on_own_task(project_with_member, pm_headers, member_headers, member_id):
    task = _create_task(project_with_member["id"], pm_headers, assigned_to=member_id)
    r = client.patch(f"/tasks/{task['id']}/status", json={"status": "in_progress"}, headers=member_headers)
    assert r.status_code == 200
    assert r.json()["status"] == "in_progress"


def test_team_member_cannot_use_full_update_endpoint(project_with_member, pm_headers, member_headers, member_id):
    """
    The core restriction from the spec: a team member may change a task's
    status, but nothing else. The full PATCH /tasks/{id} endpoint is
    reserved for admin/PM entirely — the status-only endpoint exists
    precisely so this case has an allowed path and this one doesn't.
    """
    task = _create_task(project_with_member["id"], pm_headers, assigned_to=member_id)
    r = client.patch(f"/tasks/{task['id']}", json={"title": "Hacked title"}, headers=member_headers)
    assert r.status_code == 403


def test_team_member_cannot_update_status_on_unassigned_task(project_with_member, pm_headers, member_headers):
    task = _create_task(project_with_member["id"], pm_headers)  # no assignee
    r = client.patch(f"/tasks/{task['id']}/status", json={"status": "completed"}, headers=member_headers)
    # RLS hides the row -> looks like 404, same principle as the projects test
    assert r.status_code == 404


def test_invalid_status_value_is_rejected(project_with_member, pm_headers, member_headers, member_id):
    task = _create_task(project_with_member["id"], pm_headers, assigned_to=member_id)
    r = client.patch(
        f"/tasks/{task['id']}/status",
        json={"status": "not_a_real_status"},
        headers=member_headers,
    )
    assert r.status_code == 422


def test_task_assignment_creates_notification_for_assignee(project_with_member, pm_headers, member_headers, member_id):
    task = _create_task(project_with_member["id"], pm_headers, assigned_to=member_id)
    r = client.get("/notifications", headers=member_headers)
    assert any(
        n["related_task_id"] == task["id"] and n["type"] == "task_assigned" for n in r.json()
    )


def test_only_pm_or_admin_can_delete_task(project_with_member, pm_headers, member_headers, member_id):
    task = _create_task(project_with_member["id"], pm_headers, assigned_to=member_id)
    r = client.delete(f"/tasks/{task['id']}", headers=member_headers)
    assert r.status_code == 403
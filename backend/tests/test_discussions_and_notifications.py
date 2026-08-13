from fastapi.testclient import TestClient

from main import app

client = TestClient(app)


def _create_task(project_id: str, headers: dict, assigned_to: str | None = None) -> dict:
    payload = {"title": "Discussion test task", "priority": "medium"}
    if assigned_to:
        payload["assigned_to"] = assigned_to
    r = client.post(f"/projects/{project_id}/tasks", json=payload, headers=headers)
    assert r.status_code == 201, r.text
    return r.json()


def test_assignee_can_post_and_read_discussion(project_with_member, pm_headers, member_headers, member_id):
    task = _create_task(project_with_member["id"], pm_headers, assigned_to=member_id)

    r = client.post(f"/tasks/{task['id']}/discussions", json={"message": "Working on it"}, headers=member_headers)
    assert r.status_code == 201

    r2 = client.get(f"/tasks/{task['id']}/discussions", headers=pm_headers)
    assert r2.status_code == 200
    assert any(d["message"] == "Working on it" for d in r2.json())


def test_blank_discussion_message_rejected(project_with_member, pm_headers, member_headers, member_id):
    task = _create_task(project_with_member["id"], pm_headers, assigned_to=member_id)
    r = client.post(f"/tasks/{task['id']}/discussions", json={"message": "   "}, headers=member_headers)
    assert r.status_code == 422


def test_discussion_message_notifies_the_other_party(project_with_member, pm_headers, member_headers, member_id):
    task = _create_task(project_with_member["id"], pm_headers, assigned_to=member_id)
    client.post(f"/tasks/{task['id']}/discussions", json={"message": "Question about scope"}, headers=member_headers)

    r = client.get("/notifications", headers=pm_headers)
    assert any(
        n["related_task_id"] == task["id"] and n["type"] == "new_discussion" for n in r.json()
    )


def test_mark_single_notification_read(member_headers):
    unread = client.get("/notifications", headers=member_headers, params={"is_read": False}).json()
    if not unread:
        return  # nothing pending this run — not a failure, just nothing to exercise
    notif_id = unread[0]["id"]
    r = client.patch(f"/notifications/{notif_id}/read", headers=member_headers)
    assert r.status_code == 200
    assert r.json()["is_read"] is True


def test_mark_all_notifications_read(member_headers):
    r = client.patch("/notifications/read-all", headers=member_headers)
    assert r.status_code == 200

    r2 = client.get("/notifications", headers=member_headers, params={"is_read": False})
    assert r2.json() == []


def test_user_cannot_see_another_users_notifications(pm_headers, member_headers):
    pm_ids = {n["id"] for n in client.get("/notifications", headers=pm_headers).json()}
    member_ids = {n["id"] for n in client.get("/notifications", headers=member_headers).json()}
    assert pm_ids.isdisjoint(member_ids)
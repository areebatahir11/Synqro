from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.dependencies.auth import CurrentUser, get_current_user, require_role
from app.models.schemas import TaskCreate, TaskOut, TaskStatusUpdate, TaskUpdate
from app.services.notification_service import notify_status_updated, notify_task_assigned

router = APIRouter(tags=["tasks"])

VALID_TASK_SORT_FIELDS = {"created_at", "updated_at", "title", "due_date", "priority", "status"}


@router.get("/projects/{project_id}/tasks", response_model=list[TaskOut])
def list_project_tasks(
    project_id: str,
    current_user: CurrentUser = Depends(get_current_user),
    search: Optional[str] = Query(None, description="Matches against task title"),
    status_filter: Optional[str] = Query(None, alias="status"),
    priority: Optional[str] = Query(None),
    assigned_to: Optional[str] = Query(None),
    sort_by: str = Query("created_at"),
    sort_order: str = Query("desc", pattern="^(asc|desc)$"),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
):
    if sort_by not in VALID_TASK_SORT_FIELDS:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"sort_by must be one of {VALID_TASK_SORT_FIELDS}")

    query = current_user.db.table("tasks").select("*").eq("project_id", project_id)

    if search:
        query = query.ilike("title", f"%{search}%")
    if status_filter:
        query = query.eq("status", status_filter)
    if priority:
        query = query.eq("priority", priority)
    if assigned_to:
        query = query.eq("assigned_to", assigned_to)

    query = query.order(sort_by, desc=(sort_order == "desc")).range(offset, offset + limit - 1)
    res = query.execute()
    return res.data


@router.post("/projects/{project_id}/tasks", response_model=TaskOut, status_code=status.HTTP_201_CREATED)
def create_task(
    project_id: str,
    payload: TaskCreate,
    current_user: CurrentUser = Depends(require_role("admin", "project_manager")),
):
    data = payload.model_dump(mode="json")
    data["project_id"] = project_id
    data["created_by"] = current_user.id
    res = current_user.db.table("tasks").insert(data).execute()
    if not res.data:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Could not create task on this project")

    task = res.data[0]
    if task.get("assigned_to"):
        notify_task_assigned(task["assigned_to"], task["title"], project_id, task["id"])
    return task


@router.get("/tasks/{task_id}", response_model=TaskOut)
def get_task(task_id: str, current_user: CurrentUser = Depends(get_current_user)):
    res = current_user.db.table("tasks").select("*").eq("id", task_id).execute()
    if not res.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found or access denied")
    return res.data[0]


@router.patch("/tasks/{task_id}", response_model=TaskOut)
def update_task(
    task_id: str,
    payload: TaskUpdate,
    current_user: CurrentUser = Depends(require_role("admin", "project_manager")),
):
    updates = {k: v for k, v in payload.model_dump(mode="json").items() if v is not None}
    if not updates:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No fields to update")

    res = current_user.db.table("tasks").update(updates).eq("id", task_id).execute()
    if not res.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found or access denied")

    task = res.data[0]
    if "assigned_to" in updates and task.get("assigned_to"):
        notify_task_assigned(task["assigned_to"], task["title"], task["project_id"], task["id"])
    elif "status" in updates and task.get("assigned_to") and task["assigned_to"] != current_user.id:
        # PM/admin changed the status themselves — let the assignee know,
        # same as when the assignee changes it and the PM gets notified
        # (see update_task_status below).
        notify_status_updated(task["assigned_to"], task["title"], task["status"], task["project_id"], task["id"])
    return task


@router.patch("/tasks/{task_id}/status", response_model=TaskOut)
def update_task_status(
    task_id: str,
    payload: TaskStatusUpdate,
    current_user: CurrentUser = Depends(require_role("team_member")),
):
    # Team members can ONLY ever touch the status column — this route never
    # accepts anything else, and RLS additionally scopes rows to assigned_to = self.
    res = (
        current_user.db.table("tasks")
        .update({"status": payload.status})
        .eq("id", task_id)
        .execute()
    )
    if not res.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found or not assigned to you")

    task = res.data[0]
    # notify the task creator (the PM) about the status change
    notify_status_updated(task["created_by"], task["title"], task["status"], task["project_id"], task["id"])
    return task


@router.delete("/tasks/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(task_id: str, current_user: CurrentUser = Depends(require_role("admin", "project_manager"))):
    current_user.db.table("tasks").delete().eq("id", task_id).execute()
    return None
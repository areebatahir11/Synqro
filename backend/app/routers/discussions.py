from fastapi import APIRouter, Depends, HTTPException, status

from app.dependencies.auth import CurrentUser, get_current_user
from app.models.schemas import DiscussionCreate, DiscussionOut
from app.services.notification_service import notify_new_discussion

router = APIRouter(tags=["discussions"])


@router.get("/tasks/{task_id}/discussions", response_model=list[DiscussionOut])
def list_discussions(task_id: str, current_user: CurrentUser = Depends(get_current_user)):
    res = (
        current_user.db.table("task_discussions")
        .select("*")
        .eq("task_id", task_id)
        .order("created_at")
        .execute()
    )
    return res.data


@router.post("/tasks/{task_id}/discussions", response_model=DiscussionOut, status_code=status.HTTP_201_CREATED)
def add_discussion(
    task_id: str,
    payload: DiscussionCreate,
    current_user: CurrentUser = Depends(get_current_user),
):
    res = (
        current_user.db.table("task_discussions")
        .insert({"task_id": task_id, "user_id": current_user.id, "message": payload.message})
        .execute()
    )
    if not res.data:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Could not post to this task's discussion")

    discussion = res.data[0]

    # notify the other side of the conversation: fetch the task to find PM + assignee
    task_res = current_user.db.table("tasks").select("*").eq("id", task_id).single().execute()
    if task_res.data:
        task = task_res.data
        recipients = {task.get("assigned_to"), task.get("created_by")} - {current_user.id, None}
        for recipient_id in recipients:
            notify_new_discussion(recipient_id, task["title"], task["project_id"], task_id)

    return discussion

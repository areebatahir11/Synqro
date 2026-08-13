from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.dependencies.auth import CurrentUser, get_current_user
from app.models.schemas import NotificationOut

router = APIRouter(prefix="/notifications", tags=["notifications"])


@router.get("", response_model=list[NotificationOut])
def list_notifications(
    current_user: CurrentUser = Depends(get_current_user),
    is_read: Optional[bool] = Query(None),
    type: Optional[str] = Query(None),
):
    query = current_user.db.table("notifications").select("*").eq("user_id", current_user.id)
    if is_read is not None:
        query = query.eq("is_read", is_read)
    if type:
        query = query.eq("type", type)
    res = query.order("created_at", desc=True).execute()
    return res.data


@router.patch("/{notification_id}/read", response_model=NotificationOut)
def mark_read(notification_id: str, current_user: CurrentUser = Depends(get_current_user)):
    res = (
        current_user.db.table("notifications")
        .update({"is_read": True})
        .eq("id", notification_id)
        .execute()
    )
    if not res.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Notification not found")
    return res.data[0]


@router.patch("/read-all")
def mark_all_read(current_user: CurrentUser = Depends(get_current_user)):
    current_user.db.table("notifications").update({"is_read": True}).eq(
        "user_id", current_user.id
    ).eq("is_read", False).execute()
    return {"message": "All notifications marked as read"}

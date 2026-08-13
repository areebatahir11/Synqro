from typing import Optional

from app.core.supabase_client import get_service_client


def create_notification(
    user_id: str,
    type: str,
    message: str,
    related_project_id: Optional[str] = None,
    related_task_id: Optional[str] = None,
) -> None:
    """
    System-generated notification. Uses the service client (bypasses RLS)
    because a notification is written to a DIFFERENT user's row than the
    one performing the action (e.g. PM assigns a task -> notification goes
    to the team member, not the PM).
    """
    get_service_client().table("notifications").insert(
        {
            "user_id": user_id,
            "type": type,
            "message": message,
            "related_project_id": related_project_id,
            "related_task_id": related_task_id,
        }
    ).execute()


def notify_task_assigned(assignee_id: str, task_title: str, project_id: str, task_id: str) -> None:
    create_notification(
        user_id=assignee_id,
        type="task_assigned",
        message=f'You were assigned to task "{task_title}"',
        related_project_id=project_id,
        related_task_id=task_id,
    )


def notify_status_updated(recipient_id: str, task_title: str, new_status: str, project_id: str, task_id: str) -> None:
    create_notification(
        user_id=recipient_id,
        type="status_updated",
        message=f'Task "{task_title}" status changed to {new_status}',
        related_project_id=project_id,
        related_task_id=task_id,
    )


def notify_new_discussion(recipient_id: str, task_title: str, project_id: str, task_id: str) -> None:
    create_notification(
        user_id=recipient_id,
        type="new_discussion",
        message=f'New comment on task "{task_title}"',
        related_project_id=project_id,
        related_task_id=task_id,
    )

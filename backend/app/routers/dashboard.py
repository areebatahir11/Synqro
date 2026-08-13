from collections import Counter
from datetime import date, timedelta

from fastapi import APIRouter, Depends

from app.dependencies.auth import CurrentUser, require_role
from app.models.schemas import AdminDashboard, MemberDashboard, PMDashboard

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/admin", response_model=AdminDashboard)
def admin_dashboard(current_user: CurrentUser = Depends(require_role("admin"))):
    projects = current_user.db.table("projects").select("status").execute().data
    users = current_user.db.table("profiles").select("id").execute().data
    tasks = current_user.db.table("tasks").select("status").execute().data

    return AdminDashboard(
        total_projects=len(projects),
        total_users=len(users),
        projects_by_status=dict(Counter(p["status"] for p in projects)),
        total_tasks=len(tasks),
        tasks_by_status=dict(Counter(t["status"] for t in tasks)),
    )


@router.get("/pm", response_model=PMDashboard)
def pm_dashboard(current_user: CurrentUser = Depends(require_role("project_manager"))):
    projects = current_user.db.table("projects").select("id").execute().data
    project_ids = [p["id"] for p in projects]

    if not project_ids:
        return PMDashboard(assigned_projects=0, pending_tasks=0, completed_tasks=0, upcoming_deadlines=[])

    tasks = current_user.db.table("tasks").select("*").in_("project_id", project_ids).execute().data
    pending = [t for t in tasks if t["status"] != "completed"]
    completed = [t for t in tasks if t["status"] == "completed"]

    soon = date.today() + timedelta(days=7)
    upcoming = sorted(
        [t for t in pending if t.get("due_date") and t["due_date"] <= str(soon)],
        key=lambda t: t["due_date"],
    )[:10]

    return PMDashboard(
        assigned_projects=len(projects),
        pending_tasks=len(pending),
        completed_tasks=len(completed),
        upcoming_deadlines=upcoming,
    )


@router.get("/member", response_model=MemberDashboard)
def member_dashboard(current_user: CurrentUser = Depends(require_role("team_member"))):
    tasks = current_user.db.table("tasks").select("*").eq("assigned_to", current_user.id).execute().data
    pending = [t for t in tasks if t["status"] != "completed"]
    completed = [t for t in tasks if t["status"] == "completed"]

    soon = date.today() + timedelta(days=7)
    upcoming = sorted(
        [t for t in pending if t.get("due_date") and t["due_date"] <= str(soon)],
        key=lambda t: t["due_date"],
    )[:10]

    return MemberDashboard(
        assigned_tasks=len(tasks),
        pending_tasks=len(pending),
        completed_tasks=len(completed),
        upcoming_deadlines=upcoming,
    )

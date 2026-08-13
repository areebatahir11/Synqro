from collections import Counter
from datetime import date, timedelta

from fastapi import APIRouter, Depends

from app.dependencies.auth import CurrentUser, require_role
from app.models.schemas import AdminDashboard, MemberDashboard, PMDashboard
from app.models.analytics_schemas import (
    PMAnalyticsDashboard,
    MemberAnalyticsDashboard,
    TimelinessBreakdown,
)
from app.services.analytics_service import build_pm_analytics, build_member_analytics

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


@router.get("/pm/analytics", response_model=PMAnalyticsDashboard)
def pm_analytics_dashboard(current_user: CurrentUser = Depends(require_role("project_manager"))):
    projects = current_user.db.table("projects").select("id, name").execute().data
    project_ids = [p["id"] for p in projects]
    project_labels = {p["id"]: p["name"] for p in projects}

    if not project_ids:
        empty = TimelinessBreakdown(on_time=0, late=0, never_completed=0, no_deadline=0)
        return PMAnalyticsDashboard(
            overall=empty,
            on_time_rate=0.0,
            avg_completion_days=None,
            trend=[],
            by_project=[],
            by_member=[],
        )

    tasks = (
        current_user.db.table("tasks")
        .select("id, project_id, assigned_to, status, due_date, completed_at")
        .in_("project_id", project_ids)
        .execute()
        .data
    )

    member_ids = {t["assigned_to"] for t in tasks if t.get("assigned_to")}
    member_labels = {}
    if member_ids:
        profiles = (
            current_user.db.table("profiles")
            .select("id, full_name")
            .in_("id", list(member_ids))
            .execute()
            .data
        )
        member_labels = {p["id"]: p["full_name"] for p in profiles}

    return build_pm_analytics(tasks, project_labels, member_labels)


@router.get("/member/analytics", response_model=MemberAnalyticsDashboard)
def member_analytics_dashboard(current_user: CurrentUser = Depends(require_role("team_member"))):
    tasks = (
        current_user.db.table("tasks")
        .select("id, project_id, assigned_to, status, due_date, completed_at")
        .eq("assigned_to", current_user.id)
        .execute()
        .data
    )

    project_ids = {t["project_id"] for t in tasks if t.get("project_id")}
    project_labels = {}
    if project_ids:
        projects = (
            current_user.db.table("projects")
            .select("id, name")
            .in_("id", list(project_ids))
            .execute()
            .data
        )
        project_labels = {p["id"]: p["name"] for p in projects}

    return build_member_analytics(tasks, project_labels)
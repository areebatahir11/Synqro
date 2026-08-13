from typing import Optional

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.dependencies.auth import CurrentUser, get_current_user, require_role
from app.models.schemas import (
    ProjectCreate,
    ProjectMemberAdd,
    ProjectMemberOut,
    ProjectOut,
    ProjectUpdate,
)

router = APIRouter(prefix="/projects", tags=["projects"])

VALID_SORT_FIELDS = {"created_at", "updated_at", "name", "start_date", "end_date", "priority", "status"}


@router.get("", response_model=list[ProjectOut])
def list_projects(
    current_user: CurrentUser = Depends(get_current_user),
    search: Optional[str] = Query(None, description="Matches against project name"),
    status_filter: Optional[str] = Query(None, alias="status"),
    priority: Optional[str] = Query(None),
    project_manager_id: Optional[str] = Query(None),
    sort_by: str = Query("created_at"),
    sort_order: str = Query("desc", pattern="^(asc|desc)$"),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
):
    # RLS filters this automatically per role: admin sees all, PM sees own,
    # team member sees projects they belong to.
    if sort_by not in VALID_SORT_FIELDS:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"sort_by must be one of {VALID_SORT_FIELDS}")

    query = current_user.db.table("projects").select("*")

    if search:
        query = query.ilike("name", f"%{search}%")
    if status_filter:
        query = query.eq("status", status_filter)
    if priority:
        query = query.eq("priority", priority)
    if project_manager_id:
        query = query.eq("project_manager_id", project_manager_id)

    query = query.order(sort_by, desc=(sort_order == "desc")).range(offset, offset + limit - 1)
    res = query.execute()
    return res.data


@router.post("", response_model=ProjectOut, status_code=status.HTTP_201_CREATED)
def create_project(payload: ProjectCreate, current_user: CurrentUser = Depends(require_role("admin"))):
    data = payload.model_dump(mode="json")
    data["created_by"] = current_user.id
    res = current_user.db.table("projects").insert(data).execute()
    return res.data[0]


@router.get("/{project_id}", response_model=ProjectOut)
def get_project(project_id: UUID, current_user: CurrentUser = Depends(get_current_user)):
    res = current_user.db.table("projects").select("*").eq("id", str(project_id)).execute()
    if not res.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found or access denied")
    return res.data[0]


@router.patch("/{project_id}", response_model=ProjectOut)
def update_project(
    project_id: UUID,
    payload: ProjectUpdate,
    current_user: CurrentUser = Depends(get_current_user),
):
    if current_user.role not in ("admin", "project_manager"):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not allowed to update projects")

    updates = {k: v for k, v in payload.model_dump(mode="json").items() if v is not None}
    if not updates:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No fields to update")

    # PMs cannot reassign the project manager or reparent the project
    if current_user.role == "project_manager":
        updates.pop("project_manager_id", None)

    res = current_user.db.table("projects").update(updates).eq("id", str(project_id)).execute()
    if not res.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found or access denied")
    return res.data[0]


@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_project(project_id: UUID, current_user: CurrentUser = Depends(require_role("admin"))):
    current_user.db.table("projects").delete().eq("id", str(project_id)).execute()
    return None


# ---------- PROJECT MEMBERS ----------
@router.get("/{project_id}/members", response_model=list[ProjectMemberOut])
def list_members(project_id: UUID, current_user: CurrentUser = Depends(get_current_user)):
    res = current_user.db.table("project_members").select("*").eq("project_id", str(project_id)).execute()
    return res.data


@router.post("/{project_id}/members", response_model=ProjectMemberOut, status_code=status.HTTP_201_CREATED)
def add_member(
    project_id: UUID,
    payload: ProjectMemberAdd,
    current_user: CurrentUser = Depends(require_role("admin", "project_manager")),
):
    res = (
        current_user.db.table("project_members")
        .insert({"project_id": str(project_id), "member_id": payload.member_id})
        .execute()
    )
    if not res.data:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Could not add member to this project")
    return res.data[0]


@router.delete("/{project_id}/members/{member_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_member(
    project_id: UUID,
    member_id: UUID,
    current_user: CurrentUser = Depends(require_role("admin", "project_manager")),
):
    current_user.db.table("project_members").delete().eq("project_id", str(project_id)).eq(
        "member_id", str(member_id)
    ).execute()
    return None
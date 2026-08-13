import logging

from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.core.supabase_client import get_service_client
from app.dependencies.auth import CurrentUser, get_current_user, require_role
from app.models.schemas import ProfileOut, PublicProfileOut, UserCreate, UserSelfUpdate, UserUpdate

logger = logging.getLogger("synqro")

router = APIRouter(prefix="/users", tags=["users"])


@router.get("", response_model=list[ProfileOut])
def list_users(
    current_user: CurrentUser = Depends(require_role("admin", "project_manager")),
    search: Optional[str] = Query(None, description="Matches against full_name or email"),
    role: Optional[str] = Query(None),
    sort_order: str = Query("desc", pattern="^(asc|desc)$"),
):
    # Read-only listing — relaxed to PMs too (not just admin) because they
    # need to pick team members when adding to a project, and the
    # profiles_select_all_authenticated RLS policy already grants any
    # authenticated user read access to every profile row. Create/update/
    # delete below remain admin-only — this route only ever reads.
    query = current_user.db.table("profiles").select("*")

    if search:
        query = query.or_(f"full_name.ilike.%{search}%,email.ilike.%{search}%")
    if role:
        query = query.eq("role", role)

    res = query.order("created_at", desc=(sort_order == "desc")).execute()
    return res.data


@router.post("", response_model=ProfileOut, status_code=status.HTTP_201_CREATED)
def create_user(payload: UserCreate, current_user: CurrentUser = Depends(require_role("admin"))):
    service_client = get_service_client()
    try:
        created = service_client.auth.admin.create_user(
            {
                "email": payload.email,
                "password": payload.password,
                "email_confirm": True,
                "user_metadata": {"full_name": payload.full_name, "role": payload.role},
            }
        )
    except Exception as e:
        # Supabase's admin API doesn't give a clean error code we can pattern-match
        # reliably, so we check the message text for the one case a caller actually
        # needs to know about (duplicate email), and otherwise hide the raw error.
        logger.warning("User creation failed for %s: %s", payload.email, e)
        if "already been registered" in str(e).lower() or "already registered" in str(e).lower():
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"A user with the email {payload.email} already exists.",
            )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Could not create this user. Please check the details and try again.",
        )

    # profile row is auto-created by the DB trigger (handle_new_user)
    profile_res = (
        service_client.table("profiles").select("*").eq("id", created.user.id).single().execute()
    )
    return profile_res.data


# ---------- SELF-SERVICE PROFILE (any authenticated user, own row only) ----------
# NOTE: these must stay declared BEFORE the /{user_id} routes below, otherwise
# FastAPI would match "me" as a user_id path parameter instead.
@router.get("/me", response_model=ProfileOut)
def get_my_profile(current_user: CurrentUser = Depends(get_current_user)):
    res = current_user.db.table("profiles").select("*").eq("id", current_user.id).single().execute()
    return res.data


@router.patch("/me", response_model=ProfileOut)
def update_my_profile(payload: UserSelfUpdate, current_user: CurrentUser = Depends(get_current_user)):
    updates = {k: v for k, v in payload.model_dump(mode="json").items() if v is not None}
    if not updates:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No fields to update")
    # RLS's "profiles_update_own" policy (id = auth.uid()) is what actually
    # scopes this to the caller's own row — .eq() here is belt-and-suspenders.
    res = current_user.db.table("profiles").update(updates).eq("id", current_user.id).execute()
    if not res.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Profile not found")
    return res.data[0]


@router.get("/{user_id}", response_model=PublicProfileOut)
def get_public_profile(user_id: str, current_user: CurrentUser = Depends(get_current_user)):
    """
    Any authenticated user can look up another user's minimal public
    profile (name, role, avatar) — backed by the profiles_select_all_authenticated
    RLS policy, which already grants read access to every profile row for
    any logged-in user. This just exposes that read at the API layer so a
    Project Manager or Team Member can resolve names for task assignees,
    discussion authors, etc. without needing admin-only GET /users.
    """
    res = current_user.db.table("profiles").select("id, full_name, role, avatar_url").eq("id", user_id).execute()
    if not res.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return res.data[0]


@router.patch("/{user_id}", response_model=ProfileOut)
def update_user(user_id: str, payload: UserUpdate, current_user: CurrentUser = Depends(require_role("admin"))):
    updates = {k: v for k, v in payload.model_dump(mode="json").items() if v is not None}
    if not updates:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No fields to update")
    res = current_user.db.table("profiles").update(updates).eq("id", user_id).execute()
    if not res.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return res.data[0]


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(user_id: str, current_user: CurrentUser = Depends(require_role("admin"))):
    if user_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot delete your own account.",
        )
    try:
        get_service_client().auth.admin.delete_user(user_id)
    except Exception as e:
        logger.warning("User deletion failed for %s: %s", user_id, e)
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")
    return None
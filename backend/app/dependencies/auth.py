from dataclasses import dataclass

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from supabase import Client

from app.core.supabase_client import get_service_client, get_user_client

bearer_scheme = HTTPBearer()


@dataclass
class CurrentUser:
    id: str
    email: str
    full_name: str
    role: str
    access_token: str
    db: Client  # request-scoped, RLS-enforced client for this user


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
) -> CurrentUser:
    token = credentials.credentials

    # Verify the token with Supabase Auth
    service_client = get_service_client()
    try:
        auth_response = service_client.auth.get_user(token)
    except Exception:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token")

    if not auth_response or not auth_response.user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token")

    user = auth_response.user

    # Fetch profile (role, full_name) — service client so this lookup itself
    # never depends on the not-yet-known role's RLS policy
    profile_res = (
        service_client.table("profiles").select("*").eq("id", user.id).single().execute()
    )
    if not profile_res.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Profile not found for this user")

    profile = profile_res.data

    return CurrentUser(
        id=user.id,
        email=user.email,
        full_name=profile["full_name"],
        role=profile["role"],
        access_token=token,
        db=get_user_client(token),
    )


def require_role(*allowed_roles: str):
    """Dependency factory — restrict a route to specific roles."""

    async def _check(current_user: CurrentUser = Depends(get_current_user)) -> CurrentUser:
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"This action requires one of these roles: {', '.join(allowed_roles)}",
            )
        return current_user

    return _check

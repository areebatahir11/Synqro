from fastapi import APIRouter, Depends, HTTPException, status

from app.core.supabase_client import get_anon_client
from app.dependencies.auth import CurrentUser, get_current_user
from app.models.schemas import LoginRequest, LoginResponse, MeResponse, ProfileOut

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login", response_model=LoginResponse)
def login(payload: LoginRequest):
    client = get_anon_client()
    try:
        auth_res = client.auth.sign_in_with_password(
            {"email": payload.email, "password": payload.password}
        )
    except Exception:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")

    if not auth_res.session:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")

    profile_res = (
        client.table("profiles").select("*").eq("id", auth_res.user.id).single().execute()
    )

    return LoginResponse(
        access_token=auth_res.session.access_token,
        refresh_token=auth_res.session.refresh_token,
        user=ProfileOut(**profile_res.data),
    )


@router.get("/me", response_model=MeResponse)
def me(current_user: CurrentUser = Depends(get_current_user)):
    return MeResponse(
        id=current_user.id,
        email=current_user.email,
        full_name=current_user.full_name,
        role=current_user.role,
    )


@router.post("/logout")
def logout(current_user: CurrentUser = Depends(get_current_user)):
    current_user.db.auth.sign_out()
    return {"message": "Logged out"}

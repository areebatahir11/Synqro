from functools import lru_cache

from supabase import create_client, Client

from app.core.config import settings


@lru_cache
def get_anon_client() -> Client:
    """Unauthenticated client — used for login/signup calls only."""
    return create_client(settings.supabase_url, settings.supabase_anon_key)


@lru_cache
def get_service_client() -> Client:
    """
    Full-access client using the service role key — BYPASSES RLS entirely.
    Only ever use this for:
      - admin creating a new user (auth.admin.create_user)
      - the auth/me lookup right after verifying a token (to fetch the profile
        before we know anything about the user)
    Never use this for normal project/task CRUD.
    """
    return create_client(settings.supabase_url, settings.supabase_service_role_key)


def get_user_client(access_token: str) -> Client:
    """
    Client scoped to the calling user's own JWT. All Postgrest requests made
    through this client carry the user's Authorization header, so RLS
    policies apply exactly as if the user queried Supabase directly.
    """
    client = create_client(settings.supabase_url, settings.supabase_anon_key)
    client.postgrest.auth(access_token)
    return client

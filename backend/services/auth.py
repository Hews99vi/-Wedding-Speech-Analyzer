from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from postgrest.exceptions import APIError

from database import get_supabase


bearer_scheme = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
) -> dict:
    supabase = get_supabase()

    # Delegate token verification to Supabase Auth — works regardless of
    # whether the project signs with HS256 or ES256.
    try:
        response = supabase.auth.get_user(credentials.credentials)
        auth_user = response.user
        if not auth_user:
            raise ValueError("No user returned")
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        ) from exc

    user_id = str(auth_user.id)
    meta = auth_user.user_metadata or {}

    try:
        result = supabase.table("profiles").select("*").eq("id", user_id).single().execute()
        user = result.data if result else None
    except APIError as exc:
        if getattr(exc, "code", None) == "PGRST116":
            user = None
        else:
            raise

    if not user:
        email = auth_user.email or ""
        name = meta.get("name") or email.split("@")[0]
        role = meta.get("role", "videographer")
        if role not in ("videographer", "editor", "admin"):
            role = "videographer"
        try:
            insert_result = supabase.table("profiles").insert({
                "id": user_id,
                "email": email,
                "name": name,
                "role": role,
                "status": "active",
            }).execute()
            user = insert_result.data[0] if insert_result.data else None
        except Exception:
            user = None

        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User profile not found",
            )

    if user.get("status") == "suspended":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account suspended",
        )
    return user


def require_role(*roles: str):
    async def role_dependency(user: dict = Depends(get_current_user)) -> dict:
        if user.get("role") not in roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions",
            )
        return user

    return role_dependency

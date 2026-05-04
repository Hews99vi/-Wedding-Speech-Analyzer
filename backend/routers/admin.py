from fastapi import APIRouter, Depends, HTTPException, status

from database import get_supabase
from schemas import UpdateUserRole, UpdateUserStatus, UserOut
from services.auth import require_role


router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/users", response_model=list[UserOut], status_code=status.HTTP_200_OK)
async def list_users(current_user: dict = Depends(require_role("admin"))) -> list[UserOut]:
    supabase = get_supabase()
    result = supabase.table("profiles").select("*").order("created_at", desc=True).execute()
    return [UserOut(**user) for user in (result.data or [])]


@router.patch("/users/{user_id}/role", response_model=UserOut, status_code=status.HTTP_200_OK)
async def update_user_role(
    user_id: str,
    body: UpdateUserRole,
    current_user: dict = Depends(require_role("admin")),
) -> UserOut:
    supabase = get_supabase()
    result = (
        supabase.table("profiles")
        .update({"role": body.role.value})
        .eq("id", user_id)
        .execute()
    )
    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    return UserOut(**result.data[0])


@router.patch("/users/{user_id}/status", response_model=UserOut, status_code=status.HTTP_200_OK)
async def update_user_status(
    user_id: str,
    body: UpdateUserStatus,
    current_user: dict = Depends(require_role("admin")),
) -> UserOut:
    supabase = get_supabase()
    result = (
        supabase.table("profiles")
        .update({"status": body.status.value})
        .eq("id", user_id)
        .execute()
    )
    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    return UserOut(**result.data[0])


@router.delete("/users/{user_id}", response_model=None, status_code=status.HTTP_200_OK)
async def delete_user(
    user_id: str,
    current_user: dict = Depends(require_role("admin")),
) -> dict[str, str]:
    supabase = get_supabase()
    existing = (
        supabase.table("profiles")
        .select("id")
        .eq("id", user_id)
        .limit(1)
        .execute()
    )
    if not existing.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    if user_id == current_user["id"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete your own account",
        )

    supabase.auth.admin.delete_user(user_id)
    return {"message": "User deleted"}


@router.get("/stats", response_model=None, status_code=status.HTTP_200_OK)
async def get_admin_stats(current_user: dict = Depends(require_role("admin"))) -> dict:
    supabase = get_supabase()

    users_result = supabase.table("profiles").select("*", count="exact").execute()
    jobs_count_result = supabase.table("jobs").select("*", count="exact").execute()
    jobs_status_result = supabase.table("jobs").select("status").execute()
    highlights_result = supabase.table("highlights").select("*", count="exact").execute()

    jobs_by_status: dict[str, int] = {}
    for row in (jobs_status_result.data or []):
        status_key = row.get("status")
        if status_key:
            jobs_by_status[status_key] = jobs_by_status.get(status_key, 0) + 1

    return {
        "total_users": users_result.count or 0,
        "total_jobs": jobs_count_result.count or 0,
        "jobs_by_status": jobs_by_status,
        "total_highlights": highlights_result.count or 0,
    }

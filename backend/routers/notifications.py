from fastapi import APIRouter, Depends, HTTPException, status

from database import get_supabase
from schemas import NotificationOut
from services.auth import get_current_user


router = APIRouter(prefix="/notifications", tags=["notifications"])


@router.get("", response_model=list[NotificationOut], status_code=status.HTTP_200_OK)
async def list_notifications(current_user: dict = Depends(get_current_user)) -> list[NotificationOut]:
    supabase = get_supabase()
    result = (
        supabase.table("notifications")
        .select("*")
        .eq("user_id", current_user["id"])
        .order("created_at", desc=True)
        .limit(50)
        .execute()
    )
    return [NotificationOut(**notification) for notification in (result.data or [])]


@router.patch("/read-all", response_model=dict[str, str], status_code=status.HTTP_200_OK)
async def mark_all_notifications_as_read(
    current_user: dict = Depends(get_current_user),
) -> dict[str, str]:
    supabase = get_supabase()
    (
        supabase.table("notifications")
        .update({"read": True})
        .eq("user_id", current_user["id"])
        .execute()
    )
    return {"message": "All notifications marked as read"}


@router.patch("/{notification_id}", response_model=NotificationOut, status_code=status.HTTP_200_OK)
async def mark_notification_as_read(
    notification_id: str,
    current_user: dict = Depends(get_current_user),
) -> NotificationOut:
    supabase = get_supabase()
    result = (
        supabase.table("notifications")
        .update({"read": True})
        .eq("id", notification_id)
        .eq("user_id", current_user["id"])
        .execute()
    )
    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found",
        )
    return NotificationOut(**result.data[0])


@router.delete("", response_model=dict[str, str], status_code=status.HTTP_200_OK)
async def clear_notifications(current_user: dict = Depends(get_current_user)) -> dict[str, str]:
    supabase = get_supabase()
    supabase.table("notifications").delete().eq("user_id", current_user["id"]).execute()
    return {"message": "All notifications cleared"}

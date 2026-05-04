from fastapi import APIRouter, Depends, status

from schemas import UserOut
from services.auth import get_current_user


router = APIRouter(prefix="/auth", tags=["auth"])


@router.get("/me", response_model=UserOut, status_code=status.HTTP_200_OK)
async def get_me(current_user: dict = Depends(get_current_user)) -> UserOut:
    return UserOut(**current_user)

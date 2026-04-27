from fastapi import APIRouter, HTTPException, status

from database import get_supabase
from schemas import LoginRequest, RefreshRequest, RegisterRequest, TokenResponse, UserOut
from services.auth import (
    create_access_token,
    create_refresh_token,
    decode_token,
    hash_password,
    verify_password,
)


router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(body: RegisterRequest) -> TokenResponse:
    supabase = get_supabase()
    existing = (
        supabase.table("profiles")
        .select("id")
        .eq("email", body.email)
        .limit(1)
        .execute()
    )
    if existing.data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )

    inserted = (
        supabase.table("profiles")
        .insert(
            {
                "name": body.name,
                "email": body.email,
                "password_hash": hash_password(body.password),
                "role": body.role.value,
                "status": "active",
            }
        )
        .execute()
    )

    created_user = inserted.data[0] if inserted and inserted.data else None
    if not created_user:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create user",
        )

    access_token = create_access_token(created_user["id"], created_user["role"])
    refresh_token = create_refresh_token(created_user["id"])
    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        user=UserOut(**created_user),
    )


@router.post("/login", response_model=TokenResponse, status_code=status.HTTP_200_OK)
async def login(body: LoginRequest) -> TokenResponse:
    supabase = get_supabase()
    result = (
        supabase.table("profiles")
        .select("*")
        .eq("email", body.email)
        .limit(1)
        .execute()
    )
    user = result.data[0] if result and result.data else None

    if not user or not verify_password(body.password, user["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
        )

    if user.get("status") == "suspended":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account suspended",
        )

    access_token = create_access_token(user["id"], user["role"])
    refresh_token = create_refresh_token(user["id"])
    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        user=UserOut(**user),
    )


@router.post("/refresh", response_model=TokenResponse, status_code=status.HTTP_200_OK)
async def refresh(body: RefreshRequest) -> TokenResponse:
    payload = decode_token(body.refresh_token)
    if payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token",
        )

    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )

    supabase = get_supabase()
    result = (
        supabase.table("profiles")
        .select("*")
        .eq("id", user_id)
        .limit(1)
        .execute()
    )
    user = result.data[0] if result and result.data else None
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )
    if user.get("status") == "suspended":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account suspended",
        )

    access_token = create_access_token(user["id"], user["role"])
    refresh_token = create_refresh_token(user["id"])
    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        user=UserOut(**user),
    )

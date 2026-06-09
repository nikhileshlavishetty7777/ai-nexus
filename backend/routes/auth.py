# backend/routes/auth.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database.database import get_db
from models.schemas import UserRegister, UserLogin, TokenResponse, UserResponse
from services.auth_service import (
    authenticate_user, register_user, create_access_token, update_last_login
)
from utils.dependencies import get_current_user
from database.models import User
from datetime import timedelta
from config import settings

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=TokenResponse)
async def register(data: UserRegister, db: Session = Depends(get_db)):
    """Register a new user account."""
    user = register_user(db, data.email, data.username, data.password, data.full_name)
    token = create_access_token({"sub": user.id, "role": user.role})
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=UserResponse.model_validate(user),
    )


@router.post("/login", response_model=TokenResponse)
async def login(data: UserLogin, db: Session = Depends(get_db)):
    """Login with email and password."""

    print("EMAIL_RAW:", repr(data.email))
    print("PASSWORD_RAW:", repr(data.password))

    email = data.email.strip().lower()
    password = data.password.strip()

    user = authenticate_user(db, email, password)
    print("AUTH_RESULT:", user)

    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account has been disabled")

    update_last_login(db, user)

    token = create_access_token({
        "sub": user.id,
        "role": user.role
    })

    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=UserResponse.model_validate(user),
    )
@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    """Get current authenticated user."""
    return UserResponse.model_validate(current_user)


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Refresh JWT token."""
    token = create_access_token({"sub": current_user.id, "role": current_user.role})
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=UserResponse.model_validate(current_user),
    )

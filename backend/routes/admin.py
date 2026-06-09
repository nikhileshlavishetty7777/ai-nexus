# backend/routes/admin.py
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from database.database import get_db
from database.models import User, Chat, Message, UsageLog, AdminSetting, UserRole
from models.schemas import AdminUserUpdate, AdminSettingUpdate, DashboardStats, UserResponse, UsageLogResponse
from utils.dependencies import get_current_admin
from datetime import datetime, timedelta
from typing import List, Optional

router = APIRouter(prefix="/admin", tags=["Admin"])


@router.get("/dashboard", response_model=DashboardStats)
async def get_dashboard_stats(
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin),
):
    """Get admin dashboard statistics."""
    today = datetime.utcnow().replace(hour=0, minute=0, second=0)

    total_users = db.query(func.count(User.id)).scalar()
    active_users = db.query(func.count(User.id)).filter(User.is_active == True).scalar()
    total_chats = db.query(func.count(Chat.id)).scalar()
    total_messages = db.query(func.count(Message.id)).scalar()
    total_tokens = db.query(func.coalesce(func.sum(UsageLog.total_tokens), 0)).scalar()
    openai_tokens = db.query(func.coalesce(func.sum(UsageLog.total_tokens), 0)).filter(UsageLog.provider == "openai").scalar()
    gemini_tokens = db.query(func.coalesce(func.sum(UsageLog.total_tokens), 0)).filter(UsageLog.provider == "gemini").scalar()
    new_users_today = db.query(func.count(User.id)).filter(User.created_at >= today).scalar()
    messages_today = db.query(func.count(Message.id)).filter(Message.created_at >= today).scalar()

    return DashboardStats(
        total_users=total_users,
        active_users=active_users,
        total_chats=total_chats,
        total_messages=total_messages,
        total_tokens=int(total_tokens),
        openai_tokens=int(openai_tokens),
        gemini_tokens=int(gemini_tokens),
        new_users_today=new_users_today,
        messages_today=messages_today,
    )


@router.get("/users", response_model=List[UserResponse])
async def list_users(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin),
):
    """List all users."""
    query = db.query(User)
    if search:
        query = query.filter(
            (User.email.ilike(f"%{search}%")) | (User.username.ilike(f"%{search}%"))
        )
    users = query.order_by(desc(User.created_at)).offset(skip).limit(limit).all()
    return [UserResponse.model_validate(u) for u in users]


@router.put("/users/{user_id}")
async def update_user(
    user_id: str,
    data: AdminUserUpdate,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin),
):
    """Update user (admin action)."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.id == current_admin.id:
        raise HTTPException(status_code=400, detail="Cannot modify your own account here")

    for field, value in data.model_dump(exclude_none=True).items():
        setattr(user, field, value)
    db.commit()
    return {"message": "User updated", "user": UserResponse.model_validate(user)}


@router.delete("/users/{user_id}")
async def delete_user(
    user_id: str,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin),
):
    """Delete a user account."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.id == current_admin.id:
        raise HTTPException(status_code=400, detail="Cannot delete your own account")

    db.delete(user)
    db.commit()
    return {"message": "User deleted"}


@router.get("/chats")
async def list_all_chats(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin),
):
    """List all chats across users."""
    chats = (
        db.query(Chat, User.email, User.username)
        .join(User, Chat.user_id == User.id)
        .order_by(desc(Chat.updated_at))
        .offset(skip).limit(limit)
        .all()
    )
    return [
        {
            "id": c.Chat.id, "title": c.Chat.title, "model": c.Chat.model,
            "message_count": c.Chat.message_count, "total_tokens": c.Chat.total_tokens,
            "user_email": c.email, "user_username": c.username,
            "created_at": c.Chat.created_at.isoformat(),
        }
        for c in chats
    ]


@router.delete("/chats/{chat_id}")
async def admin_delete_chat(
    chat_id: str,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin),
):
    """Admin delete any chat."""
    chat = db.query(Chat).filter(Chat.id == chat_id).first()
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")
    db.delete(chat)
    db.commit()
    return {"message": "Chat deleted"}


@router.get("/usage-logs", response_model=List[UsageLogResponse])
async def get_usage_logs(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    provider: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin),
):
    """Get API usage logs."""
    query = db.query(UsageLog)
    if provider:
        query = query.filter(UsageLog.provider == provider)
    logs = query.order_by(desc(UsageLog.created_at)).offset(skip).limit(limit).all()
    return [UsageLogResponse.model_validate(l) for l in logs]


@router.get("/settings")
async def get_settings(
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin),
):
    """Get all admin settings."""
    settings = db.query(AdminSetting).all()
    return {s.key: {"value": s.value, "type": s.value_type, "description": s.description, "category": s.category} for s in settings}


@router.put("/settings/{key}")
async def update_setting(
    key: str,
    data: AdminSettingUpdate,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin),
):
    """Update an admin setting."""
    setting = db.query(AdminSetting).filter(AdminSetting.key == key).first()
    if not setting:
        raise HTTPException(status_code=404, detail="Setting not found")

    setting.value = data.value
    setting.updated_by = current_admin.id
    setting.updated_at = datetime.utcnow()
    db.commit()
    return {"message": "Setting updated", "key": key, "value": data.value}


@router.get("/analytics")
async def get_analytics(
    days: int = Query(7, ge=1, le=90),
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin),
):
    """Get usage analytics for the past N days."""
    since = datetime.utcnow() - timedelta(days=days)

    daily_messages = (
        db.query(
            func.date(Message.created_at).label("date"),
            func.count(Message.id).label("count"),
        )
        .filter(Message.created_at >= since)
        .group_by(func.date(Message.created_at))
        .all()
    )

    daily_users = (
        db.query(
            func.date(User.created_at).label("date"),
            func.count(User.id).label("count"),
        )
        .filter(User.created_at >= since)
        .group_by(func.date(User.created_at))
        .all()
    )

    model_usage = (
        db.query(
            UsageLog.model,
            func.count(UsageLog.id).label("count"),
            func.sum(UsageLog.total_tokens).label("tokens"),
        )
        .filter(UsageLog.created_at >= since)
        .group_by(UsageLog.model)
        .all()
    )

    return {
        "daily_messages": [{"date": str(r.date), "count": r.count} for r in daily_messages],
        "daily_new_users": [{"date": str(r.date), "count": r.count} for r in daily_users],
        "model_usage": [{"model": r.model, "count": r.count, "tokens": int(r.tokens or 0)} for r in model_usage],
    }

# backend/services/chat_service.py
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List, Optional
from database.models import Chat, Message, User, UsageLog
from models.schemas import ChatCreate, ChatUpdate
from datetime import datetime
from loguru import logger


def create_chat(db: Session, user_id: str, data: ChatCreate) -> Chat:
    chat = Chat(
        user_id=user_id,
        title=data.title or "New Chat",
        model=data.model or "gpt-4o-mini",
        provider=data.provider or "openai",
        system_prompt=data.system_prompt,
    )
    db.add(chat)
    db.commit()
    db.refresh(chat)
    return chat


def get_user_chats(
    db: Session, user_id: str, search: Optional[str] = None,
    skip: int = 0, limit: int = 50, include_archived: bool = False
) -> List[Chat]:
    query = db.query(Chat).filter(Chat.user_id == user_id)
    if not include_archived:
        query = query.filter(Chat.is_archived == False)
    if search:
        query = query.filter(Chat.title.ilike(f"%{search}%"))
    return query.order_by(desc(Chat.updated_at)).offset(skip).limit(limit).all()


def get_chat(db: Session, chat_id: str, user_id: str) -> Optional[Chat]:
    return db.query(Chat).filter(Chat.id == chat_id, Chat.user_id == user_id).first()


def update_chat(db: Session, chat: Chat, data: ChatUpdate) -> Chat:
    for field, value in data.model_dump(exclude_none=True).items():
        setattr(chat, field, value)
    chat.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(chat)
    return chat


def delete_chat(db: Session, chat: Chat):
    db.delete(chat)
    db.commit()


def get_chat_messages(db: Session, chat_id: str) -> List[Message]:
    return db.query(Message).filter(Message.chat_id == chat_id).order_by(Message.created_at).all()


def add_message(
    db: Session,
    chat_id: str,
    role: str,
    content: str,
    model: Optional[str] = None,
    provider: Optional[str] = None,
    tokens_used: int = 0,
    is_error: bool = False,
) -> Message:
    message = Message(
        chat_id=chat_id,
        role=role,
        content=content,
        model=model,
        provider=provider,
        tokens_used=tokens_used,
        is_error=is_error,
    )
    db.add(message)

    # Update chat stats
    chat = db.query(Chat).filter(Chat.id == chat_id).first()
    if chat:
        chat.message_count += 1
        chat.total_tokens += tokens_used
        chat.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(message)
    return message


def auto_title_chat(db: Session, chat: Chat, first_message: str):
    """Auto-generate chat title from first message."""
    if chat.title == "New Chat" and first_message:
        title = first_message[:50].strip()
        if len(first_message) > 50:
            title += "..."
        chat.title = title
        db.commit()


def log_usage(
    db: Session,
    user_id: Optional[str],
    provider: str,
    model: str,
    prompt_tokens: int,
    completion_tokens: int,
    action: str = "chat",
    status: str = "success",
    error_message: Optional[str] = None,
    chat_id: Optional[str] = None,
):
    total_tokens = prompt_tokens + completion_tokens
    # Rough cost estimate (per 1M tokens)
    costs = {
        "gpt-4o": 5.0, "gpt-4o-mini": 0.15, "gpt-4-turbo": 10.0,
        "gpt-3.5-turbo": 0.5, "gemini-1.5-pro": 3.5, "gemini-1.5-flash": 0.075,
    }
    cost_per_token = costs.get(model, 1.0) / 1_000_000
    cost_estimate = total_tokens * cost_per_token

    log = UsageLog(
        user_id=user_id,
        chat_id=chat_id,
        provider=provider,
        model=model,
        prompt_tokens=prompt_tokens,
        completion_tokens=completion_tokens,
        total_tokens=total_tokens,
        cost_estimate=cost_estimate,
        action=action,
        status=status,
        error_message=error_message,
    )
    db.add(log)

    # Update user stats
    if user_id:
        user = db.query(User).filter(User.id == user_id).first()
        if user:
            user.total_messages += 1
            user.total_tokens += total_tokens

    db.commit()

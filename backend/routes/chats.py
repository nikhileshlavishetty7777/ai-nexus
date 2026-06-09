# backend/routes/chats.py
import json
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from database.database import get_db
from database.models import User, Message
from models.schemas import (
    ChatCreate, ChatUpdate, ChatResponse, MessageResponse,
    SendMessageRequest, ChatExport
)
from services.chat_service import (
    create_chat, get_user_chats, get_chat, update_chat, delete_chat,
    get_chat_messages, add_message, auto_title_chat, log_usage
)
from services.ai_service import get_ai_response
from utils.dependencies import get_current_user
from typing import List, Optional
from loguru import logger

router = APIRouter(prefix="/chats", tags=["Chats"])


@router.post("", response_model=ChatResponse)
async def create_new_chat(
    data: ChatCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create a new chat session."""
    chat = create_chat(db, current_user.id, data)
    return ChatResponse.model_validate(chat)


@router.get("", response_model=List[ChatResponse])
async def list_chats(
    search: Optional[str] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    include_archived: bool = Query(False),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List all chats for current user."""
    chats = get_user_chats(db, current_user.id, search, skip, limit, include_archived)
    return [ChatResponse.model_validate(c) for c in chats]


@router.get("/{chat_id}", response_model=ChatResponse)
async def get_chat_detail(
    chat_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get chat details."""
    chat = get_chat(db, chat_id, current_user.id)
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")
    return ChatResponse.model_validate(chat)


@router.put("/{chat_id}", response_model=ChatResponse)
async def update_chat_detail(
    chat_id: str,
    data: ChatUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update chat settings."""
    chat = get_chat(db, chat_id, current_user.id)
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")
    chat = update_chat(db, chat, data)
    return ChatResponse.model_validate(chat)


@router.delete("/{chat_id}")
async def delete_chat_session(
    chat_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete a chat session."""
    chat = get_chat(db, chat_id, current_user.id)
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")
    delete_chat(db, chat)
    return {"message": "Chat deleted successfully"}


@router.get("/{chat_id}/messages", response_model=List[MessageResponse])
async def get_messages(
    chat_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get all messages in a chat."""
    chat = get_chat(db, chat_id, current_user.id)
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")
    messages = get_chat_messages(db, chat_id)
    return [MessageResponse.model_validate(m) for m in messages]


@router.post("/{chat_id}/messages")
async def send_message(
    chat_id: str,
    data: SendMessageRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    chat = get_chat(db, chat_id, current_user.id)

    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")

    model = data.model or chat.model
    provider = data.provider or chat.provider

    if hasattr(provider, "value"):
        provider = provider.value

    provider = str(provider).lower().strip()

    if provider == "gemini":
        model = "gemini-2.5-flash"

    add_message(db, chat_id, "user", data.content)

    if chat.message_count <= 1:
        auto_title_chat(db, chat, data.content)

    messages_db = get_chat_messages(db, chat_id)

    conversation = [
        {"role": m.role, "content": m.content}
        for m in messages_db
        if m.role in ("user", "assistant")
    ]

    system_prompt = chat.system_prompt or "You are AI Nexus assistant."

    async def stream_response():

        try:
            result = await get_ai_response(
                conversation,
                model,
                provider,
                system_prompt=system_prompt
            )

            content = result["content"]

            # 🔥 SEND FULL RESPONSE AS STREAM
            yield f"data: {json.dumps({'type': 'chunk', 'content': content})}\n\n"

            yield f"data: {json.dumps({'type': 'done'})}\n\n"

            add_message(
                db,
                chat_id,
                "assistant",
                content,
                model=model,
                provider=provider
            )

        except Exception as e:
            logger.error(f"Streaming error: {e}")

            yield f"data: {json.dumps({'type': 'error', 'content': str(e)})}\n\n"

    return StreamingResponse(
        stream_response(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        },
    )
@router.get("/{chat_id}/export")
async def export_chat(
    chat_id: str,
    format: str = Query("json", regex="^(json|markdown|txt)$"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Export chat conversation."""
    chat = get_chat(db, chat_id, current_user.id)
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")

    messages = get_chat_messages(db, chat_id)

    if format == "json":
        export_data = {
            "chat": {"id": chat.id, "title": chat.title, "model": chat.model, "created_at": chat.created_at.isoformat()},
            "messages": [{"role": m.role, "content": m.content, "created_at": m.created_at.isoformat()} for m in messages],
            "exported_at": datetime.utcnow().isoformat(),
        }
        return export_data

    elif format == "markdown":
        lines = [f"# {chat.title}\n", f"*Exported: {datetime.utcnow().strftime('%Y-%m-%d %H:%M UTC')}*\n\n---\n"]
        for msg in messages:
            role_label = "**You**" if msg.role == "user" else "**AI Nexus**"
            lines.append(f"{role_label}\n\n{msg.content}\n\n---\n")
        content = "\n".join(lines)
        return StreamingResponse(
            iter([content]),
            media_type="text/markdown",
            headers={"Content-Disposition": f'attachment; filename="{chat.title}.md"'},
        )

    else:  # txt
        lines = [f"Chat: {chat.title}\n", f"Exported: {datetime.utcnow()}\n\n{'='*50}\n\n"]
        for msg in messages:
            role_label = "You" if msg.role == "user" else "AI Nexus"
            lines.append(f"[{role_label}]\n{msg.content}\n\n{'─'*40}\n\n")
        content = "".join(lines)
        return StreamingResponse(
            iter([content]),
            media_type="text/plain",
            headers={"Content-Disposition": f'attachment; filename="{chat.title}.txt"'},
        )

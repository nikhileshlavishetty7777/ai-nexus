from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database.database import get_db
from database.models import User
from models.schemas import AIQuickRequest
from services.ai_service import get_available_models, quick_ai_action
from utils.dependencies import get_current_user
from config import settings

router = APIRouter(
    prefix="/ai",
    tags=["AI"]
)

@router.get("/debug")
async def debug():
    return {
        "openai_enabled": bool(settings.OPENAI_API_KEY),
        "gemini_enabled": bool(settings.GEMINI_API_KEY),
        "openai_key_prefix": settings.OPENAI_API_KEY[:10] if settings.OPENAI_API_KEY else None,
        "gemini_key_prefix": settings.GEMINI_API_KEY[:10] if settings.GEMINI_API_KEY else None,
    }

@router.get("/models")
async def list_models(current_user: User = Depends(get_current_user)):
    return {"models": get_available_models()}


@router.post("/quick")
async def quick_action(data: AIQuickRequest):
    try:
        result = await quick_ai_action(
            action=data.action,
            content=data.content,
            model=data.model or "gpt-4o-mini",
            provider=str(data.provider or "openai"),
            target_language=data.target_language,
        )
        return {"result": result, "action": data.action}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI error: {str(e)}")


@router.get("/capabilities")
async def get_capabilities():
    """Get AI capabilities list."""
    return {
        "capabilities": [
            {"id": "chat", "name": "General Chat", "description": "Ask anything", "icon": "MessageSquare"},
            {"id": "code", "name": "Code Generation", "description": "Write and debug code", "icon": "Code"},
            {"id": "summarize", "name": "Summarization", "description": "Summarize long texts", "icon": "FileText"},
            {"id": "translate", "name": "Translation", "description": "Translate to any language", "icon": "Globe"},
            {"id": "email", "name": "Email Writing", "description": "Write professional emails", "icon": "Mail"},
            {"id": "essay", "name": "Essay Writing", "description": "Write essays and articles", "icon": "PenTool"},
            {"id": "math", "name": "Math Solving", "description": "Solve math problems", "icon": "Calculator"},
            {"id": "explain", "name": "Explain Concepts", "description": "Simplify complex topics", "icon": "Lightbulb"},
            {"id": "improve", "name": "Writing Improvement", "description": "Improve your text", "icon": "Edit"},
            {"id": "bullets", "name": "Bullet Points", "description": "Convert text to bullets", "icon": "List"},
        ]
    }
    from config import settings

@router.get("/debug")
async def debug():
    return {
        "openai_enabled": bool(settings.OPENAI_API_KEY),
        "gemini_enabled": bool(settings.GEMINI_API_KEY),
        "openai_key_prefix": settings.OPENAI_API_KEY[:10] if settings.OPENAI_API_KEY else None,
        "gemini_key_prefix": settings.GEMINI_API_KEY[:10] if settings.GEMINI_API_KEY else None,
    }
# =========================
# MODEL LIST (FIX FOR ROUTES)
# =========================
def get_available_models():
    models = []

    if openai_client:
        models.extend([
            {"id": "gpt-4o", "name": "GPT-4o", "provider": "openai"},
            {"id": "gpt-4o-mini", "name": "GPT-4o Mini", "provider": "openai"},
            {"id": "gpt-4-turbo", "name": "GPT-4 Turbo", "provider": "openai"},
            {"id": "gpt-3.5-turbo", "name": "GPT-3.5 Turbo", "provider": "openai"},
        ])

    if gemini_available:
        models.extend([
            {"id": "gemini-2.5-flash", "name": "Gemini 2.5 Flash", "provider": "gemini"},
            {"id": "gemini-2.0-flash", "name": "Gemini 2.0 Flash", "provider": "gemini"},
            {"id": "gemini-2.5-pro", "name": "Gemini 2.5 Pro", "provider": "gemini"},
        ])

    if not models:
        return [
            {"id": "gpt-4o-mini", "name": "GPT-4o Mini", "provider": "openai"},
            {"id": "gemini-2.0-flash", "name": "Gemini Flash", "provider": "gemini"},
        ]

    return models
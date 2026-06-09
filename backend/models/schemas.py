# backend/models/schemas.py
from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional, List, Any
from datetime import datetime
from enum import Enum


class UserRole(str, Enum):
    USER = "user"
    ADMIN = "admin"


class AIProvider(str, Enum):
    OPENAI = "openai"
    GEMINI = "gemini"


# ─── Auth Schemas ─────────────────────────────────────────────────────────────

class UserRegister(BaseModel):
    email: EmailStr
    username: str
    password: str
    full_name: Optional[str] = None

    @field_validator("username")
    @classmethod
    def validate_username(cls, v):
        if len(v) < 3:
            raise ValueError("Username must be at least 3 characters")
        if not v.replace("_", "").replace("-", "").isalnum():
            raise ValueError("Username can only contain letters, numbers, _ and -")
        return v.lower()

    @field_validator("password")
    @classmethod
    def validate_password(cls, v):
        if len(v) < 6:
            raise ValueError("Password must be at least 6 characters")
        return v


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: "UserResponse"


# ─── User Schemas ─────────────────────────────────────────────────────────────

class UserResponse(BaseModel):
    id: str
    email: str
    username: str
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None
    role: str
    is_active: bool
    preferred_model: str
    preferred_provider: str
    total_messages: int
    total_tokens: int
    created_at: datetime

    class Config:
        from_attributes = True


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None
    preferred_model: Optional[str] = None
    preferred_provider: Optional[AIProvider] = None


class PasswordChange(BaseModel):
    current_password: str
    new_password: str

    @field_validator("new_password")
    @classmethod
    def validate_new_password(cls, v):
        if len(v) < 6:
            raise ValueError("Password must be at least 6 characters")
        return v


# ─── Chat Schemas ─────────────────────────────────────────────────────────────

class ChatCreate(BaseModel):
    title: Optional[str] = "New Chat"
    model: Optional[str] = "gpt-4o-mini"
    provider: Optional[AIProvider] = AIProvider.OPENAI
    system_prompt: Optional[str] = None


class ChatUpdate(BaseModel):
    title: Optional[str] = None
    model: Optional[str] = None
    provider: Optional[AIProvider] = None
    is_pinned: Optional[bool] = None
    is_archived: Optional[bool] = None
    system_prompt: Optional[str] = None


class ChatResponse(BaseModel):
    id: str
    user_id: str
    title: str
    model: str
    provider: str
    is_pinned: bool
    is_archived: bool
    message_count: int
    total_tokens: int
    system_prompt: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ─── Message Schemas ──────────────────────────────────────────────────────────

class MessageCreate(BaseModel):
    content: str
    role: str = "user"


class MessageResponse(BaseModel):
    id: str
    chat_id: str
    role: str
    content: str
    model: Optional[str] = None
    provider: Optional[str] = None
    tokens_used: int
    is_error: bool
    created_at: datetime

    class Config:
        from_attributes = True


class SendMessageRequest(BaseModel):
    content: str
    model: Optional[str] = None
    provider: Optional[AIProvider] = None
    document_id: Optional[str] = None


# ─── AI Request Schemas ───────────────────────────────────────────────────────

class AIQuickRequest(BaseModel):
    action: str  # summarize, translate, email, essay, etc.
    content: str
    target_language: Optional[str] = None
    model: Optional[str] = "gpt-4o-mini"
    provider: Optional[AIProvider] = AIProvider.OPENAI


# ─── Document Schemas ─────────────────────────────────────────────────────────

class DocumentResponse(BaseModel):
    id: str
    user_id: str
    chat_id: Optional[str] = None
    filename: str
    original_filename: str
    file_type: str
    file_size: int
    summary: Optional[str] = None
    is_processed: bool
    created_at: datetime

    class Config:
        from_attributes = True


# ─── Admin Schemas ────────────────────────────────────────────────────────────

class AdminUserUpdate(BaseModel):
    is_active: Optional[bool] = None
    role: Optional[UserRole] = None
    full_name: Optional[str] = None


class AdminSettingUpdate(BaseModel):
    value: str


class DashboardStats(BaseModel):
    total_users: int
    active_users: int
    total_chats: int
    total_messages: int
    total_tokens: int
    openai_tokens: int
    gemini_tokens: int
    new_users_today: int
    messages_today: int


class UsageLogResponse(BaseModel):
    id: str
    user_id: Optional[str] = None
    provider: str
    model: str
    total_tokens: int
    cost_estimate: float
    action: Optional[str] = None
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


# ─── Chat Export ──────────────────────────────────────────────────────────────

class ChatExport(BaseModel):
    chat: ChatResponse
    messages: List[MessageResponse]
    exported_at: datetime


# Update forward references
TokenResponse.model_rebuild()

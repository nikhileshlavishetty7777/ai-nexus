# backend/services/ai_service.py

import asyncio
from typing import List, Dict, Optional
from loguru import logger
from config import settings

from openai import AsyncOpenAI, RateLimitError, AuthenticationError, APIError
from google import genai


# =====================================================
# OPENAI CLIENT
# =====================================================
print("OPENAI KEY EXISTS:", bool(settings.OPENAI_API_KEY))

openai_client = None
if settings.OPENAI_API_KEY:
    try:
        openai_client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
        print("OPENAI CLIENT CREATED:", openai_client)
    except Exception as e:
        print("OPENAI INIT ERROR:", repr(e))


# =====================================================
# GEMINI CLIENT (NEW SDK ONLY)
# =====================================================
gemini_client = None
gemini_available = False

print("GEMINI KEY EXISTS:", bool(settings.GEMINI_API_KEY))

if settings.GEMINI_API_KEY:
    try:
        gemini_client = genai.Client(api_key=settings.GEMINI_API_KEY)
        gemini_available = True
        print("GEMINI CLIENT CREATED")
    except Exception as e:
        print("GEMINI INIT ERROR:", repr(e))
        gemini_available = False


# =====================================================
# MODEL LISTS
# =====================================================
OPENAI_MODELS = [
    {"id": "gpt-4o", "name": "GPT-4o", "provider": "openai"},
    {"id": "gpt-4o-mini", "name": "GPT-4o Mini", "provider": "openai"},
    {"id": "gpt-4-turbo", "name": "GPT-4 Turbo", "provider": "openai"},
    {"id": "gpt-3.5-turbo", "name": "GPT-3.5 Turbo", "provider": "openai"},
]

GEMINI_MODELS = [
    {"id": "gemini-2.5-flash", "name": "Gemini 2.5 Flash", "provider": "gemini"},
    {"id": "gemini-2.0-flash", "name": "Gemini 2.0 Flash", "provider": "gemini"},
    {"id": "gemini-2.5-pro", "name": "Gemini 2.5 Pro", "provider": "gemini"},
]


# =====================================================
# AVAILABLE MODELS
# =====================================================
def get_available_models():
    models = []

    if openai_client:
        models.extend(OPENAI_MODELS)

    if gemini_available:
        models.extend(GEMINI_MODELS)

    if not models:
        return OPENAI_MODELS + GEMINI_MODELS

    return models


# =====================================================
# OPENAI CHAT
# =====================================================
async def chat_with_openai(messages, model="gpt-4o-mini", system_prompt=None):
    if not openai_client:
        raise ValueError("OpenAI not initialized")

    formatted = []

    if system_prompt:
        formatted.append({"role": "system", "content": system_prompt})

    formatted.extend(messages)

    try:
        response = await openai_client.chat.completions.create(
            model=model,
            messages=formatted,
            max_tokens=2000,
            stream=False   # 🔥 IMPORTANT: force OFF
        )

        return {
            "content": response.choices[0].message.content,
            "provider": "openai"
        }
    except RateLimitError:
        raise ValueError("OpenAI quota exceeded")

    except AuthenticationError:
        raise ValueError("Invalid OpenAI API key")

    except APIError as e:
        raise ValueError(f"OpenAI API error: {str(e)}")

    except Exception as e:
        raise ValueError(f"OpenAI error: {str(e)}")


# =====================================================
# GEMINI CHAT (NEW SDK FIXED)
# =====================================================
async def chat_with_gemini(messages, model="gemini-2.0-flash", system_prompt=None):
    if not gemini_available:
        raise ValueError("Gemini not initialized")

    prompt = ""

    if system_prompt:
        prompt += system_prompt + "\n\n"

    for m in messages:
        if m["role"] == "user":
            prompt += f"User: {m['content']}\n"
        elif m["role"] == "assistant":
            prompt += f"Assistant: {m['content']}\n"

    try:
        response = gemini_client.models.generate_content(
            model=model,
            contents=prompt
        )

        return {
            "content": response.text or "No response",
            "provider": "gemini"
        }
    except Exception as e:
        raise ValueError(f"Gemini error: {str(e)}")


# =====================================================
# MAIN ROUTER
# =====================================================
async def get_ai_response(messages, model, provider, system_prompt=None):

    provider = str(provider).lower().strip()

    print("➡️ Provider:", provider)

    # OPENAI
    if provider == "openai":
        try:
            
            return await chat_with_openai(messages, model, system_prompt)
        except Exception as e:
            print("OpenAI failed, fallback Gemini:", e)

            return await chat_with_gemini(
                messages,
                "gemini-2.5-flash",
                system_prompt
            )

    # GEMINI
    if provider == "gemini":
        return await chat_with_gemini(messages, model, system_prompt)

    raise ValueError("Unknown provider")


# =====================================================
# QUICK ACTIONS
# =====================================================
async def quick_ai_action(
    action: str,
    content: str,
    model: str = "gemini-2.0-flash",
    provider: str = "gemini",
    target_language: str = "English",
) -> str:

    prompts = {
        "summarize": f"Summarize this:\n\n{content}",
        "translate": f"Translate to {target_language}:\n\n{content}",
        "email": f"Write professional email:\n\n{content}",
        "essay": f"Write essay:\n\n{content}",
        "improve": f"Improve text:\n\n{content}",
        "bullets": f"Convert to bullet points:\n\n{content}",
        "code_review": f"Review code:\n\n{content}",
        "explain": f"Explain simply:\n\n{content}",
    }

    prompt = prompts.get(action, f"{action}:\n\n{content}")

    messages = [{"role": "user", "content": prompt}]

    system = "You are AI Nexus assistant."

    result = await get_ai_response(
        messages,
        model,
        provider,
        system_prompt=system,
    )

    return result.get("content", "")
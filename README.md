# 🚀 AI Nexus — Advanced AI Chat Platform

A production-ready AI chat application built with **FastAPI + React + Vite**, supporting **OpenAI GPT-4o** and **Google Gemini 1.5 Pro**, with a stunning glassmorphism UI, admin panel, document analysis, and real-time streaming.

---

## ✨ Features

| Category | Features |
|---|---|
| **AI Models** | GPT-4o, GPT-4o Mini, GPT-3.5, Gemini 1.5 Pro, Gemini Flash |
| **Chat** | Streaming responses, conversation memory, context retention |
| **Documents** | PDF, TXT, DOCX upload & AI analysis |
| **UI/UX** | Dark/light mode, glassmorphism, Framer Motion animations |
| **Auth** | JWT authentication, register/login/logout |
| **Admin** | Dashboard, user management, usage logs, settings |
| **Export** | JSON, Markdown, TXT chat export |
| **Markdown** | Full markdown + syntax highlighting in chat |

---

## 📁 Project Structure

```
ai-nexus/
├── backend/
│   ├── main.py                 # FastAPI entry point
│   ├── config.py               # Environment settings
│   ├── requirements.txt
│   ├── .env.example
│   ├── database/
│   │   ├── __init__.py
│   │   ├── database.py         # SQLAlchemy setup + seeding
│   │   └── models.py           # ORM models
│   ├── models/
│   │   └── schemas.py          # Pydantic validation schemas
│   ├── routes/
│   │   ├── auth.py             # /api/v1/auth/*
│   │   ├── users.py            # /api/v1/users/*
│   │   ├── chats.py            # /api/v1/chats/* (streaming)
│   │   ├── ai.py               # /api/v1/ai/*
│   │   ├── documents.py        # /api/v1/documents/*
│   │   └── admin.py            # /api/v1/admin/*
│   ├── services/
│   │   ├── auth_service.py     # JWT + password logic
│   │   ├── ai_service.py       # OpenAI + Gemini integration
│   │   ├── chat_service.py     # Chat/message CRUD
│   │   └── file_service.py     # File upload + text extraction
│   └── utils/
│       └── dependencies.py     # FastAPI auth dependencies
│
└── frontend/
    ├── index.html
    ├── package.json
    ├── vite.config.ts
    ├── tailwind.config.js
    └── src/
        ├── App.tsx
        ├── main.tsx
        ├── styles/globals.css
        ├── store/
        │   ├── authStore.ts     # Zustand auth state
        │   ├── chatStore.ts     # Zustand chat state
        │   └── themeStore.ts    # Dark/light mode
        ├── utils/
        │   └── api.ts           # Axios client + streaming
        ├── pages/
        │   ├── LandingPage.tsx  # Public landing page
        │   ├── LoginPage.tsx
        │   ├── RegisterPage.tsx
        │   ├── ChatPage.tsx     # Main chat interface
        │   ├── ProfilePage.tsx
        │   ├── AdminPage.tsx    # Full admin panel
        │   └── NotFoundPage.tsx
        └── components/
            ├── layout/
            │   ├── ProtectedRoute.tsx
            │   └── AdminRoute.tsx
            └── chat/
                ├── Sidebar.tsx         # Chat list + user menu
                ├── MessageBubble.tsx   # Message w/ markdown
                ├── ChatInput.tsx       # Input + model picker
                ├── TypingIndicator.tsx # Streaming animation
                └── WelcomeScreen.tsx   # Empty state
```

---

## ⚡ Quick Start

### Prerequisites
- Python 3.10+
- Node.js 18+
- OpenAI API Key (optional but recommended)
- Google Gemini API Key (optional)

---

### 1. Backend Setup

```bash
cd ai-nexus/backend

# Create virtual environment
python -m venv venv

# Activate
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env and add your API keys

# Start the server
uvicorn main:app --reload --port 8000
```

The API will be available at: `http://localhost:8000`
Swagger docs: `http://localhost:8000/api/docs`

---

### 2. Frontend Setup

```bash
cd ai-nexus/frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

Frontend runs at: `http://localhost:5173`

---

### 3. Environment Variables

Edit `backend/.env`:

```env
# Required
SECRET_KEY=your-32-char-minimum-secret-key-here

# AI APIs (at least one recommended)
OPENAI_API_KEY=sk-your-openai-key
GEMINI_API_KEY=your-gemini-key

# Admin credentials
ADMIN_EMAIL=admin@ainexus.com
ADMIN_PASSWORD=admin123!@#

# Optional
DEBUG=false
DATABASE_URL=sqlite:///./ai_nexus.db
```

---

## 🔑 Default Credentials

| Role | Email | Password |
|---|---|---|
| Admin | admin@ainexus.com | admin123!@# |

> ⚠️ Change these in production via `.env`

---

## 🌐 API Endpoints

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/v1/auth/register` | Register new user |
| POST | `/api/v1/auth/login` | Login + get JWT |
| GET | `/api/v1/auth/me` | Get current user |

### Chats
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/v1/chats` | List user chats |
| POST | `/api/v1/chats` | Create new chat |
| PUT | `/api/v1/chats/{id}` | Update chat |
| DELETE | `/api/v1/chats/{id}` | Delete chat |
| GET | `/api/v1/chats/{id}/messages` | Get messages |
| POST | `/api/v1/chats/{id}/messages` | Send message (SSE streaming) |
| GET | `/api/v1/chats/{id}/export` | Export chat |

### AI
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/v1/ai/models` | List available models |
| POST | `/api/v1/ai/quick` | Quick actions (summarize, translate, etc.) |

### Documents
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/v1/documents/upload` | Upload PDF/TXT/DOCX |
| GET | `/api/v1/documents` | List documents |
| DELETE | `/api/v1/documents/{id}` | Delete document |

### Admin
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/v1/admin/dashboard` | Dashboard stats |
| GET | `/api/v1/admin/users` | List all users |
| PUT | `/api/v1/admin/users/{id}` | Update user |
| DELETE | `/api/v1/admin/users/{id}` | Delete user |
| GET | `/api/v1/admin/usage-logs` | API usage logs |
| GET | `/api/v1/admin/settings` | Get settings |
| PUT | `/api/v1/admin/settings/{key}` | Update setting |
| GET | `/api/v1/admin/analytics` | Usage analytics |

---

## 🏗️ Production Deployment

### Backend (with gunicorn)
```bash
pip install gunicorn
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

### Frontend (build)
```bash
cd frontend
npm run build
# Serve the `dist` folder with nginx/caddy
```

### Docker Compose (optional)
```yaml
version: '3.8'
services:
  backend:
    build: ./backend
    ports: ["8000:8000"]
    env_file: ./backend/.env
  frontend:
    build: ./frontend
    ports: ["80:80"]
    depends_on: [backend]
```

---

## 🛠️ Tech Stack

**Backend:** FastAPI · SQLAlchemy · SQLite · JWT (python-jose) · bcrypt · OpenAI SDK · Google Generative AI · PyPDF2 · python-docx · Loguru

**Frontend:** React 18 · Vite · TypeScript · Tailwind CSS · Framer Motion · Zustand · React Router v6 · React Markdown · react-syntax-highlighter · Lucide React · Axios · react-hot-toast

---

## 📝 License

MIT © AI Nexus

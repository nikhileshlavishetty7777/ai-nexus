 AI Nexus — Advanced AI Chat Platform

A production-ready AI chat application built with **FastAPI + React + Vite**, supporting **OpenAI GPT-4o** and **Google Gemini 1.5 Pro**, with a stunning glassmorphism UI, admin panel, document analysis, and real-time streaming.

--

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

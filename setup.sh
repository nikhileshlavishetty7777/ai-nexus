#!/bin/bash
# AI Nexus — Full Setup Script
echo ""
echo "╔══════════════════════════════════════╗"
echo "║         AI NEXUS SETUP               ║"
echo "║   Advanced AI Chat Platform          ║"
echo "╚══════════════════════════════════════╝"
echo ""

# ── Backend ──────────────────────────────────────────────────────────────────
echo "📦 Setting up Backend..."
cd backend

if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is required. Please install Python 3.10+"
    exit 1
fi

python3 -m venv venv
source venv/bin/activate 2>/dev/null || source venv/Scripts/activate 2>/dev/null

pip install -r requirements.txt -q
echo "✅ Backend dependencies installed"

if [ ! -f ".env" ]; then
    cp .env.example .env
    echo "⚙️  Created backend/.env — ADD YOUR API KEYS!"
fi

mkdir -p uploads logs
cd ..

# ── Frontend ──────────────────────────────────────────────────────────────────
echo ""
echo "🎨 Setting up Frontend..."
cd frontend

if ! command -v node &> /dev/null; then
    echo "❌ Node.js 18+ is required"
    exit 1
fi

npm install -q
echo "✅ Frontend dependencies installed"
cd ..

# ── Done ──────────────────────────────────────────────────────────────────────
echo ""
echo "╔══════════════════════════════════════════════════════╗"
echo "║                  SETUP COMPLETE! 🎉                  ║"
echo "╠══════════════════════════════════════════════════════╣"
echo "║  1. Edit backend/.env — add your API keys            ║"
echo "║  2. Terminal 1: cd backend && ./start.sh             ║"
echo "║  3. Terminal 2: cd frontend && ./start.sh            ║"
echo "║                                                      ║"
echo "║  Frontend: http://localhost:5173                     ║"
echo "║  API Docs: http://localhost:8000/api/docs            ║"
echo "║                                                      ║"
echo "║  Admin:  admin@ainexus.com / admin123!@#             ║"
echo "╚══════════════════════════════════════════════════════╝"
echo ""

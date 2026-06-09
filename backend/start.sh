#!/bin/bash
# AI Nexus Backend Startup Script
set -e

echo "🚀 Starting AI Nexus Backend..."

# Check Python
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is required"
    exit 1
fi

# Create venv if needed
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
fi

# Activate
source venv/bin/activate 2>/dev/null || source venv/Scripts/activate 2>/dev/null

# Install deps
echo "📚 Installing dependencies..."
pip install -r requirements.txt -q

# Copy .env if needed
if [ ! -f ".env" ]; then
    cp .env.example .env
    echo "⚙️  Created .env from template. Please edit it with your API keys."
fi

# Create necessary dirs
mkdir -p uploads logs

# Start server
echo "✅ Starting FastAPI server on http://localhost:8000"
echo "📖 API Docs: http://localhost:8000/api/docs"
echo ""
uvicorn main:app --reload --host 0.0.0.0 --port 8000

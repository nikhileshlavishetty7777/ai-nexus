#!/bin/bash
# AI Nexus Frontend Startup Script
set -e

echo "🎨 Starting AI Nexus Frontend..."

# Check Node
if ! command -v node &> /dev/null; then
    echo "❌ Node.js 18+ is required"
    exit 1
fi

# Install deps
echo "📦 Installing dependencies..."
npm install

echo "✅ Starting Vite dev server on http://localhost:5173"
echo ""
npm run dev

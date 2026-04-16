#!/bin/bash

# Referrly Project Setup Script
# This script sets up the entire project for local development

set -e

echo "🚀 Referrly Setup Script"
echo "=========================="
echo ""

# Check for Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 20+ first."
    exit 1
fi

echo "✓ Node.js version: $(node --version)"

# Check for Docker
if ! command -v docker &> /dev/null; then
    echo "⚠️  Docker is not installed. You can still run locally, but Docker is recommended."
    USE_DOCKER=false
else
    echo "✓ Docker is installed"
    USE_DOCKER=true
fi

echo ""
echo "📦 Installing Dependencies..."
echo ""

# Install backend dependencies
echo "Backend dependencies..."
cd backend
npm install
cd ..

# Install frontend dependencies
echo "Frontend dependencies..."
cd frontend
npm install
cd ..

echo ""
echo "✓ Dependencies installed successfully!"

echo ""
echo "🗄️  Setting up Database..."
echo ""

# Check for PostgreSQL
if ! command -v psql &> /dev/null; then
    if [ "$USE_DOCKER" = true ]; then
        echo "⚠️  PostgreSQL not found locally, but Docker is available"
        echo "You can use 'docker-compose up -d postgres' to start PostgreSQL in Docker"
    else
        echo "❌ PostgreSQL is not installed. Please install PostgreSQL 13+ first."
        echo "Or use Docker: docker-compose up -d postgres"
        exit 1
    fi
fi

if [ "$USE_DOCKER" != true ]; then
    # Create database and tables
    echo "Creating database schema..."
    cd backend
    npm run db:push
    npm run db:seed
    cd ..
    echo "✓ Database initialized with sample data"
fi

echo ""
echo "📝 Environment Configuration"
echo ""

# Check if backend .env exists
if [ ! -f "backend/.env" ]; then
    echo "Creating backend/.env from backend/.env.example..."
    cp backend/.env.example backend/.env
    echo "✓ Please update backend/.env if needed"
else
    echo "✓ backend/.env already exists"
fi

# Check if frontend .env.local exists
if [ ! -f "frontend/.env.local" ]; then
    echo "Creating frontend/.env.local from frontend/.env.example..."
    cp frontend/.env.example frontend/.env.local
    echo "✓ Please update frontend/.env.local if needed"
else
    echo "✓ frontend/.env.local already exists"
fi

echo ""
echo "✅ Setup Complete!"
echo ""
echo "═══════════════════════════════════════════════════════════════"
echo ""

if [ "$USE_DOCKER" = true ]; then
    echo "🐳 To start with Docker:"
    echo "   docker-compose up --build"
    echo ""
    echo "   Then open:"
    echo "   - Frontend: http://localhost:3000"
    echo "   - Backend:  http://localhost:5000"
    echo "   - Database: localhost:5432"
else
    echo "💻 To start development servers:"
    echo ""
    echo "   Terminal 1 (Backend):"
    echo "   cd backend"
    echo "   npm run dev"
    echo ""
    echo "   Terminal 2 (Frontend):"
    echo "   cd frontend"
    echo "   npm run dev"
    echo ""
    echo "   Then open:"
    echo "   - Frontend: http://localhost:3000"
    echo "   - Backend:  http://localhost:5000"
fi

echo ""
echo "📚 Demo Credentials:"
echo "   Seeker:  seeker1@example.com / password123"
echo "   Referrer: referrer1@google.com / password123"
echo ""
echo "📖 Documentation:"
echo "   - Project Guide: see README.md"
echo ""
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "Happy coding! 🚀"

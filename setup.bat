@echo off
REM Referrly Project Setup Script for Windows
REM This script sets up the entire project for local development

echo.
echo ============================================================
echo           Referrly Project Setup Script
echo ============================================================
echo.

REM Check for Node.js
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js is not installed. Please install Node.js 20+ first.
    echo   Download from: https://nodejs.org/
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo ✓ Node.js version: %NODE_VERSION%
echo.

echo 📦 Installing Dependencies...
echo.

REM Install backend dependencies
echo Installing Backend dependencies...
cd backend
call npm install
cd ..

echo.

REM Install frontend dependencies  
echo Installing Frontend dependencies...
cd frontend
call npm install
cd ..

echo.
echo ✓ Dependencies installed successfully!
echo.

echo 🗄️  Setting up Database...
echo.

REM Check for PostgreSQL
where psql >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ⚠️  PostgreSQL not found locally.
    echo   Please install PostgreSQL 13+ or use Docker:
    echo   docker-compose up -d postgres
) else (
    echo Creating database schema...
    cd backend
    call npm run db:push
    call npm run db:seed
    cd ..
    echo ✓ Database initialized with sample data
)

echo.
echo 📝 Environment Configuration
echo.

if not exist "backend\.env" (
    echo Creating backend\.env from backend\.env.example...
    copy backend\.env.example backend\.env
    echo ✓ Please update backend\.env if needed
) else (
    echo ✓ backend\.env already exists
)

if not exist "frontend\.env.local" (
    echo Creating frontend\.env.local from frontend\.env.example...
    copy frontend\.env.example frontend\.env.local
    echo ✓ Please update frontend\.env.local if needed
) else (
    echo ✓ frontend\.env.local already exists
)

echo.
echo ✅ Setup Complete!
echo.
echo ============================================================
echo.
echo 🐳 To start with Docker:
echo    docker-compose up --build
echo.
echo 💻 Or start development servers manually:
echo.
echo    Backend (Terminal 1):
echo    cd backend
echo    npm run dev
echo.
echo    Frontend (Terminal 2):
echo    cd frontend
echo    npm run dev
echo.
echo 🌐 Then open:
echo    Frontend: http://localhost:3000
echo    Backend:  http://localhost:5000
echo.
echo 📚 Demo Credentials:
echo    Seeker:   seeker1@example.com / password123
echo    Referrer: referrer1@google.com / password123
echo.
echo 📖 Documentation:
echo    - Project Guide: see README.md
echo.
echo ============================================================
echo.
echo Happy coding! 🚀
echo.
pause

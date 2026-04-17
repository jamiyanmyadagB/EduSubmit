@echo off
echo 🚀 Starting EduSubmit Development Environment...
echo.

echo 📦 Installing dependencies...
call npm run install:all
if errorlevel 1 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)

echo.
echo 🔥 Starting both frontend and backend...
echo 📍 Frontend will be available at: http://localhost:3000
echo 📍 Backend APIs will be available at: http://localhost:8080
echo.
echo Press Ctrl+C to stop all services
echo.

call npm run dev

@echo off
echo 🚀 EduSubmit Quick Start
echo.

echo 🔧 Checking prerequisites...
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Node.js not found. Please install Node.js first.
    pause
    exit /b 1
)

where java >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Java not found. Please install Java 17+ first.
    pause
    exit /b 1
)

echo ✅ Prerequisites check passed
echo.

echo 📦 Installing frontend dependencies...
cd edusubmit-frontend
call npm install --legacy-peer-deps
if errorlevel 1 (
    echo ❌ Frontend installation failed
    pause
    exit /b 1
)

echo ✅ Frontend dependencies installed
echo.

echo 🔥 Starting frontend development server...
echo 📍 Frontend will be available at: http://localhost:3000
echo.
echo Press Ctrl+C to stop the server
echo.

call npm start

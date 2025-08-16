@echo off
REM RitZone Backend Startup Script for Windows
REM ==============================================
REM Starts the backend server with environment variables

echo 🚀 Starting RitZone Backend Server...
echo ======================================

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js is not installed. Please install Node.js first.
    pause
    exit /b 1
)

REM Check if .env file exists
if not exist "C:\app\backend\.env" (
    echo ❌ Environment file not found at C:\app\backend\.env
    echo Please create the .env file with your configuration.
    pause
    exit /b 1
)

REM Navigate to backend directory
cd /d C:\app\backend

echo 📁 Current directory: %CD%
echo 🔧 Loading environment variables from .env file...

REM Check if node_modules exists
if not exist "node_modules" (
    echo 📦 Installing dependencies...
    npm install
)

echo ✅ Environment loaded successfully
echo 🔍 Validating environment configuration...

REM Validate environment variables
node -e "try { require('./config/environment').validateEnvironment(); console.log('✅ Environment validation passed'); } catch (error) { console.error('❌ Environment validation failed:', error.message); process.exit(1); }"

if %ERRORLEVEL% NEQ 0 (
    echo ❌ Environment validation failed. Please check your .env file.
    pause
    exit /b 1
)

echo 🌐 Starting server...
echo Press Ctrl+C to stop the server
echo ======================================

REM Start the server
node server.js

pause
@echo off
echo ========================================
echo    RitZone Backend Startup Script
echo ========================================
echo.

echo Loading environment variables from .env file...
if exist .env (
    echo .env file found, loading variables...
    for /f "usebackq tokens=1,2 delims==" %%a in (.env) do (
        if not "%%a"=="" if not "%%a:~0,1%"=="#" set %%a=%%b
    )
) else (
    echo .env file not found, please create one using .env.example
    echo Using fallback environment variables...
    set NODE_ENV=development
    set BACKEND_PORT=8001
)

echo.
echo Checking Node.js version...
node --version
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js 18 or higher
    pause
    exit /b 1
)

echo.
echo Checking npm...
npm --version
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: npm is not installed or not in PATH
    echo Please install npm
    pause
    exit /b 1
)

echo.
echo Installing dependencies...
npm install
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: npm install failed
    pause
    exit /b 1
)

echo.
echo Validating environment variables...
node -e "require('./config/environment').validateEnvironment()" 2>nul || echo Warning: Environment validation failed, but continuing...

echo.
echo Starting RitZone Backend...
echo Supabase URL: %SUPABASE_URL%
echo Backend Port: %BACKEND_PORT%
echo Environment: %NODE_ENV%
echo Frontend URL: %FRONTEND_URL%
echo.
echo The API will be available at: http://localhost:%BACKEND_PORT%/api
echo Health Check: http://localhost:%BACKEND_PORT%/api/health
echo.

node server.js

pause

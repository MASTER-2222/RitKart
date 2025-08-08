#!/bin/bash

echo "========================================"
echo "    RitZone Backend Startup Script"
echo "========================================"
echo

echo "Loading environment variables from .env file..."
if [ -f .env ]; then
    echo ".env file found, loading variables..."
    set -a
    source .env
    set +a
else
    echo ".env file not found, please create one using .env.example"
    echo "Using fallback environment variables..."
    export NODE_ENV="development"
    export BACKEND_PORT="8001"
fi

echo
echo "Checking Node.js version..."
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is not installed or not in PATH"
    echo "Please install Node.js 18 or higher"
    exit 1
fi
node --version

echo
echo "Checking npm..."
if ! command -v npm &> /dev/null; then
    echo "ERROR: npm is not installed or not in PATH"
    echo "Please install npm"
    exit 1
fi
npm --version

echo
echo "Installing dependencies..."
npm install
if [ $? -ne 0 ]; then
    echo "ERROR: npm install failed"
    exit 1
fi

echo
echo "Validating environment variables..."
node -e "require('./config/environment').validateEnvironment()" 2>/dev/null || echo "Warning: Environment validation failed, but continuing..."

echo
echo "Starting RitZone Backend..."
echo "Supabase URL: ${SUPABASE_URL:-'Not set'}"
echo "Backend Port: ${BACKEND_PORT:-8001}"
echo "Environment: ${NODE_ENV:-development}"
echo "Frontend URL: ${FRONTEND_URL:-'Not set'}"
echo
echo "The API will be available at: http://localhost:${BACKEND_PORT:-8001}/api"
echo "Health Check: http://localhost:${BACKEND_PORT:-8001}/api/health"
echo

node server.js

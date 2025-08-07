#!/bin/bash
# RitZone Backend Startup Script
# ==============================================
# Starts the backend server with environment variables

echo "🚀 Starting RitZone Backend Server..."
echo "======================================"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if .env file exists
if [ ! -f "/app/backend/.env" ]; then
    echo "❌ Environment file not found at /app/backend/.env"
    echo "Please create the .env file with your configuration."
    exit 1
fi

# Navigate to backend directory
cd /app/backend

echo "📁 Current directory: $(pwd)"
echo "🔧 Loading environment variables from .env file..."

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

echo "✅ Environment loaded successfully"
echo "🔍 Validating environment configuration..."

# Validate environment variables
node -e "
try {
  require('./config/environment').validateEnvironment();
  console.log('✅ Environment validation passed');
} catch (error) {
  console.error('❌ Environment validation failed:', error.message);
  process.exit(1);
}
"

if [ $? -ne 0 ]; then
    echo "❌ Environment validation failed. Please check your .env file."
    exit 1
fi

echo "🌐 Starting server..."
echo "Press Ctrl+C to stop the server"
echo "======================================"

# Start the server
node server.js
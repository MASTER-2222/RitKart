#!/bin/bash

echo "========================================"
echo "    RitZone Backend Startup Script"
echo "========================================"
echo

echo "Loading environment variables from .env file..."
if [ -f .env ]; then
    echo ".env file found, loading variables..."
    export $(grep -v '^#' .env | xargs)
else
    echo ".env file not found, using default values..."
    export MONGODB_URI="mongodb+srv://ritkart-admin:RakAJVBURLCJ0uHy@ritkart-cluster.yopyqig.mongodb.net/ritkart?retryWrites=true&w=majority&appName=ritkart-cluster"
    export MONGODB_DATABASE="ritkart"
    export JWT_SECRET="mySecretKey123456789012345678901234567890"
    export FRONTEND_URL="http://localhost:3000"
fi

echo
echo "Checking Java version..."
if ! command -v java &> /dev/null; then
    echo "ERROR: Java is not installed or not in PATH"
    echo "Please install Java 17 or higher"
    exit 1
fi
java -version

echo
echo "Checking Maven..."
if ! command -v mvn &> /dev/null; then
    echo "ERROR: Maven is not installed or not in PATH"
    echo "Please install Maven 3.6 or higher"
    exit 1
fi
mvn -version

echo
echo "Building the project..."
mvn clean compile
if [ $? -ne 0 ]; then
    echo "ERROR: Build failed"
    exit 1
fi

echo
echo "Starting RitZone Backend..."
echo "MongoDB URI: $MONGODB_URI"
echo "Database: $MONGODB_DATABASE"
echo "Frontend URL: $FRONTEND_URL"
echo
echo "The API will be available at: http://localhost:8080/api"
echo "Swagger UI: http://localhost:8080/api/swagger-ui.html"
echo "Health Check: http://localhost:8080/api/actuator/health"
echo

mvn spring-boot:run

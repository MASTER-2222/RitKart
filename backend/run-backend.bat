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
    echo .env file not found, using default values...
    set MONGODB_URI=mongodb+srv://ritkart-admin:RakAJVBURLCJ0uHy@ritkart-cluster.yopyqig.mongodb.net/ritkart?retryWrites=true^&w=majority^&appName=ritkart-cluster
    set MONGODB_DATABASE=ritkart
    set JWT_SECRET=mySecretKey123456789012345678901234567890
    set FRONTEND_URL=http://localhost:3000
)

echo.
echo Checking Java version...
java -version
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Java is not installed or not in PATH
    echo Please install Java 17 or higher
    pause
    exit /b 1
)

echo.
echo Checking Maven...
mvn -version
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Maven is not installed or not in PATH
    echo Please install Maven 3.6 or higher
    pause
    exit /b 1
)

echo.
echo Building the project...
mvn clean compile
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Build failed
    pause
    exit /b 1
)

echo.
echo Starting RitZone Backend...
echo MongoDB URI: %MONGODB_URI%
echo Database: %MONGODB_DATABASE%
echo Frontend URL: %FRONTEND_URL%
echo.
echo The API will be available at: http://localhost:8080/api
echo Swagger UI: http://localhost:8080/api/swagger-ui.html
echo Health Check: http://localhost:8080/api/actuator/health
echo.

mvn spring-boot:run

pause

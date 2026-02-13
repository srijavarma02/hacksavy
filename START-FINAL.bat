@echo off
echo ========================================
echo   Smart Campus Energy Dashboard
echo   FINAL WORKING VERSION
echo ========================================
echo.

cd /d "%~dp0"

echo [1/3] Starting Backend Server...
start "Backend Server - Port 3001" cmd /k "node server/enhancedServer.js"
timeout /t 5 /nobreak >nul

echo [2/3] Starting React App...
start "React App - Port 3000" cmd /k "npm run client"
timeout /t 8 /nobreak >nul

echo [3/3] Opening Browser...
start http://localhost:3000

echo.
echo ========================================
echo   DONE! Application is running
echo ========================================
echo.
echo Backend:  http://localhost:3001
echo Frontend: http://localhost:3000
echo.
echo To stop: Close the server windows
echo.
pause

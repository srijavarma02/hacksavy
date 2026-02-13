@echo off
echo Stopping any existing Node processes...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul

echo.
echo Starting Backend Server...
start "Backend Server" cmd /k "node server/enhancedServer.js"
timeout /t 3 /nobreak >nul

echo.
echo Starting Frontend...
start "Frontend" cmd /k "npm run client"

echo.
echo ========================================
echo Both servers are starting!
echo Backend: http://localhost:3001
echo Frontend: http://localhost:3000
echo ========================================
echo.
echo Press any key to open browser...
pause >nul
start http://localhost:3000

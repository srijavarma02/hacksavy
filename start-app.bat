@echo off
echo Starting Smart Campus Energy Dashboard...
echo.
echo Starting Backend Server on port 3001...
start "Backend Server" cmd /k "cd /d %~dp0 && node server/enhancedServer.js"
timeout /t 3 /nobreak >nul
echo.
echo Starting React App on port 3000...
start "React App" cmd /k "cd /d %~dp0 && npm run client"
timeout /t 5 /nobreak >nul
echo.
echo Opening browser...
start http://localhost:3000
echo.
echo Done! Both servers are running.
echo Close the server windows to stop the application.
pause

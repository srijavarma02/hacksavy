@echo off
echo ========================================
echo  Smart Campus Backend Restart Script
echo ========================================
echo.

echo [1/3] Killing all Node.js processes...
taskkill /F /IM node.exe 2>nul
if %errorlevel% equ 0 (
    echo ✓ Node.js processes terminated
) else (
    echo ℹ No Node.js processes were running
)
echo.

echo [2/3] Waiting 2 seconds...
timeout /t 2 /nobreak >nul
echo.

echo [3/3] Starting backend server...
echo.
echo ========================================
echo  Server is starting on port 3001
echo  Press Ctrl+C to stop the server
echo ========================================
echo.

cd "C:\Users\sarip\OneDrive\Desktop\git programs\hacksavvy26\hacksavvy26"
node server/enhancedServer.js

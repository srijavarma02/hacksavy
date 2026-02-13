@echo off
cd /d "%~dp0"
echo Installing ml-random-forest package...
call npm install ml-random-forest --yes
echo.
echo Installation complete!
pause

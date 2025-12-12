@echo off
echo ==========================================
echo   Adventure Forge - Deploy Frontend
echo ==========================================
echo.
echo This script will build and deploy the frontend to GitHub Pages.
echo.

cd /d "%~dp0"

echo [1/2] Installing dependencies (just to be sure)...
call npm install

echo.
echo [2/2] Deploying to GitHub Pages...
call npm run deploy

echo.
echo ==========================================
echo   SUCCESS! 
echo   Your app should be live at:
echo   https://guillermo94pr.github.io/adventure-forge
echo ==========================================
pause

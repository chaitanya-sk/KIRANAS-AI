@echo off
title KIRANAS - Smart Rural FMCG Inventory Platform
color 0A
cls

echo =====================================================================
echo          KIRANAS - Smart Inventory. Smarter Kiranas.
echo =====================================================================
echo.
echo [1/4] Checking environment requirements...
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is not found in PATH! Please install Node.js from https://nodejs.org
    pause
    exit /b 1
)

where npm >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] npm is not found in PATH!
    pause
    exit /b 1
)
echo [OK] Node.js and npm detected successfully.
echo.

echo [2/4] Verifying project directories...
if not exist "backend\server.js" (
    echo [ERROR] backend\server.js not found! Please run this script from the project root.
    pause
    exit /b 1
)
if not exist "frontend\src\App.jsx" (
    echo [ERROR] frontend\src\App.jsx not found! Please run this script from the project root.
    pause
    exit /b 1
)
echo [OK] Backend and Frontend directories verified.
echo.

echo [3/4] Launching Backend Server on port 5000...
start "KIRANAS Backend Server (Port 5000)" cmd.exe /k "cd /d "%~dp0backend" && title KIRANAS Backend (Port 5000) && npm run dev"

echo Waiting 3 seconds for backend initialization...
timeout /t 3 /nobreak >nul

echo [4/4] Launching Frontend Dev Server on port 5173...
start "KIRANAS Frontend Client (Port 5173)" cmd.exe /k "cd /d "%~dp0frontend" && title KIRANAS Frontend (Port 5173) && npm run dev"

echo.
echo =====================================================================
echo   KIRANAS is running in standalone Windows Command Prompt windows!
echo =====================================================================
echo   * Frontend URL:      http://localhost:5173
echo   * Sales Ledger:      http://localhost:5173/sales
echo   * Backend API:       http://localhost:5000
echo   * API Health Check:  http://localhost:5000/api/health
echo   * Demo Credentials:  shopkeeper@kiranas.in / kirana123
echo =====================================================================
echo.
echo NOTE: Do not close the two spawned terminal windows while using the app.
echo To stop both servers, run stop-kiranas.bat or close the windows.
echo.
pause

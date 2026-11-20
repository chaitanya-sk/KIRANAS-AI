@echo off
title Stop KIRANAS Servers
color 0C
cls

echo =====================================================================
echo                Stopping KIRANAS Local Processes
echo =====================================================================
echo.

echo Freeing port 5000 (Backend)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":5000" ^| findstr "LISTENING"') do (
    echo Killing PID %%a on port 5000...
    taskkill /F /PID %%a >nul 2>&1
)

echo Freeing port 5173 (Frontend)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":5173" ^| findstr "LISTENING"') do (
    echo Killing PID %%a on port 5173...
    taskkill /F /PID %%a >nul 2>&1
)

echo.
echo =====================================================================
echo  KIRANAS servers on ports 5000 and 5173 have been stopped.
echo =====================================================================
timeout /t 3

@echo off
setlocal

cd /d "%~dp0"

echo Starting Aatene frontend...
echo.

if not exist "node_modules\" (
  echo Dependencies are missing. Installing now...
  call npm install
  if errorlevel 1 (
    echo.
    echo npm install failed.
    pause
    exit /b 1
  )
  echo.
)

call npm run dev

echo.
echo Project stopped or failed to start.
pause

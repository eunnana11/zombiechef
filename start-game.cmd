@echo off
setlocal
cd /d "%~dp0"

where npm.cmd >nul 2>nul
if errorlevel 1 (
  echo.
  echo Node.js npm was not found.
  echo Install Node.js LTS from https://nodejs.org/
  echo Then close this window and double-click start-game.cmd again.
  echo.
  pause
  exit /b 1
)

if not exist node_modules (
  echo Installing game packages...
  call npm.cmd install
  if errorlevel 1 (
    echo.
    echo npm install failed.
    pause
    exit /b 1
  )
)

echo Starting Zombie Chef...
echo Browser will open at http://127.0.0.1:5173/
start "" "http://127.0.0.1:5173/"
call npm.cmd run dev

pause

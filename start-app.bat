@echo off
setlocal

cd /d "%~dp0"

echo ==========================================
echo  Transport Codex - szybki start
echo ==========================================

if not exist ".env" (
  if exist ".env.example" (
    echo [setup] Brak .env - tworze z .env.example
    copy /Y ".env.example" ".env" >nul
  )
)

if not exist "node_modules" (
  echo [setup] Instaluje zaleznosci - npm install...
  call npm install
  if errorlevel 1 goto :error
)

if not exist "src\app\icon.svg" (
  if exist "generate-icon.bat" (
    echo [setup] Brak ikony - generuje src\app\icon.svg
    call generate-icon.bat
    if errorlevel 1 goto :error
  )
)

echo [start] Uruchamiam aplikacje: npm run dev
echo [info] Otworz: http://localhost:3000
echo.

call npm run dev
if errorlevel 1 goto :error

goto :eof

:error
echo.
echo [error] Nie udalo sie uruchomic aplikacji.
echo [hint] Sprawdz czy Node.js i npm sa zainstalowane.
pause
exit /b 1

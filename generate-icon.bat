@echo off
setlocal

cd /d "%~dp0"

set "ICON_PATH=src\app\icon.svg"

if not exist "src\app" (
  echo [error] Nie znaleziono katalogu src\app.
  exit /b 1
)

(
  echo ^<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256"^>
  echo   ^<rect width="256" height="256" rx="52" fill="#1f2f79"/^>
  echo   ^<path d="M44 84h124a16 16 0 0 1 16 16v52H44z" fill="#f7f8fb"/^>
  echo   ^<path d="M184 112h28l20 24v16h-48z" fill="#cfe676"/^>
  echo   ^<circle cx="88" cy="176" r="18" fill="#a0d12f"/^>
  echo   ^<circle cx="188" cy="176" r="18" fill="#a0d12f"/^>
  echo   ^<circle cx="88" cy="176" r="8" fill="#1f2f79"/^>
  echo   ^<circle cx="188" cy="176" r="8" fill="#1f2f79"/^>
  echo   ^<path d="M62 74h132" stroke="#a0d12f" stroke-width="10" stroke-linecap="round"/^>
  echo   ^<text x="128" y="112" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="28" font-weight="700" fill="#1f2f79"^>IBV^</text^>
  echo ^</svg^>
) > "%ICON_PATH%"

if errorlevel 1 (
  echo [error] Nie udalo sie wygenerowac pliku %ICON_PATH%.
  exit /b 1
)

echo [ok] Wygenerowano: %ICON_PATH%
echo [info] Ikona bedzie uzyta automatycznie przez Next.js jako favicon.
exit /b 0

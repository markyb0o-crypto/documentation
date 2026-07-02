@echo off
chcp 65001 >nul
cd /d "%~dp0"

echo ========================================
echo  VST UI Generator - Tailscale Start
echo ========================================
echo.

where python >nul 2>&1
if errorlevel 1 (
    echo Fehler: Python nicht gefunden.
    pause
    exit /b 1
)

where tailscale >nul 2>&1
if errorlevel 1 (
    echo Hinweis: Tailscale CLI nicht gefunden.
    echo App laeuft trotzdem - IP manuell aus Tailscale-App ablesen.
) else (
    echo Deine Tailscale-IP auf diesem PC:
    tailscale ip -4
    echo.
)

echo Server startet auf Port 8080 ...
echo.
echo Am Tablet im Browser oeffnen:
echo   http://DEINE-TAILSCALE-IP:8080
echo.
echo Beispiel: http://100.x.x.x:8080
echo.
echo Server laeuft - Fenster offen lassen!
echo ========================================
echo.

start http://127.0.0.1:8080
python -m http.server 8080 --bind 0.0.0.0

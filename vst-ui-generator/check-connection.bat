@echo off
chcp 65001 >nul
cd /d "%~dp0"

echo.
echo  VST UI Generator - Verbindungs-Check
echo  =====================================
echo.

:: Python
where python >nul 2>&1
if errorlevel 1 (
    echo [X] Python: NICHT gefunden
) else (
    echo [OK] Python: installiert
)

:: Server laeuft?
netstat -an | findstr ":8080 " | findstr "LISTENING" >nul 2>&1
if errorlevel 1 (
    echo [X] Server: laeuft NICHT auf Port 8080
    echo     Starte start-tailscale.bat
) else (
    echo [OK] Server: laeuft auf Port 8080
)

:: Lokal erreichbar?
powershell -Command "try { $r = Invoke-WebRequest -Uri 'http://127.0.0.1:8080' -UseBasicParsing -TimeoutSec 3; if ($r.StatusCode -eq 200) { exit 0 } else { exit 1 } } catch { exit 1 }" >nul 2>&1
if errorlevel 1 (
    echo [X] Lokal: http://127.0.0.1:8080 NICHT erreichbar
) else (
    echo [OK] Lokal: http://127.0.0.1:8080 erreichbar
)

:: Tailscale
where tailscale >nul 2>&1
if errorlevel 1 (
    echo [?] Tailscale CLI: nicht gefunden
) else (
    for /f "delims=" %%i in ('tailscale ip -4 2^>nul') do (
        echo [OK] Tailscale IP: %%i
        echo     Tablet-URL: http://%%i:8080
    )
    tailscale ip -4 >nul 2>&1
    if errorlevel 1 echo [X] Tailscale: nicht verbunden
)

:: Firewall-Regel
netsh advfirewall firewall show rule name="VST UI Generator" >nul 2>&1
if errorlevel 1 (
    echo [X] Firewall: Port 8080 NICHT freigegeben
    echo     Loesung: start-tailscale.bat als Administrator starten
) else (
    echo [OK] Firewall: Regel vorhanden
)

echo.
echo  =====================================
echo  Wenn alles [OK] ist, am Tablet oeffnen:
echo    http://TAILSCALE-IP:8080
echo  =====================================
echo.
pause

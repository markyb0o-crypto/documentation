@echo off
chcp 65001 >nul
cd /d "%~dp0"
set PORT=8080

echo.
echo  ╔══════════════════════════════════════════╗
echo  ║   VST UI Generator - Tailscale Start     ║
echo  ╚══════════════════════════════════════════╝
echo.

:: --- Python pruefen ---
where python >nul 2>&1
if errorlevel 1 (
    echo [FEHLER] Python nicht gefunden.
    echo Installieren: https://www.python.org/downloads/
    echo Wichtig: "Add Python to PATH" aktivieren!
    pause
    exit /b 1
)

:: --- Firewall-Regel (Port 8080 oeffnen) ---
echo [1/4] Windows-Firewall: Port %PORT% freigeben ...
netsh advfirewall firewall show rule name="VST UI Generator" >nul 2>&1
if errorlevel 1 (
    netsh advfirewall firewall add rule name="VST UI Generator" dir=in action=allow protocol=TCP localport=%PORT% >nul 2>&1
    if errorlevel 1 (
        echo [WARNUNG] Firewall-Regel fehlgeschlagen.
        echo Bitte start.bat als Administrator ausfuehren!
        echo Oder manuell: Windows-Firewall - Port %PORT% fuer Python erlauben
    ) else (
        echo         OK - Port %PORT% freigegeben.
    )
) else (
    echo         OK - Regel existiert bereits.
)

:: --- Tailscale pruefen ---
echo.
echo [2/4] Tailscale-Status:
where tailscale >nul 2>&1
if errorlevel 1 (
    echo [WARNUNG] tailscale CLI nicht im PATH.
    echo IP manuell aus der Tailscale-App ablesen.
    set TS_IP=UNBEKANNT
) else (
    tailscale status 2>nul | findstr /i "100." >nul
    if errorlevel 1 (
        echo [WARNUNG] Tailscale scheint nicht verbunden zu sein!
        echo Bitte Tailscale-App oeffnen und verbinden.
    ) else (
        echo         Tailscale ist verbunden.
    )
    for /f "delims=" %%i in ('tailscale ip -4 2^>nul') do set TS_IP=%%i
)

:: --- IPs anzeigen ---
echo.
echo [3/4] Deine Adressen:
echo.
echo   Lokal am PC:     http://127.0.0.1:%PORT%
if defined TS_IP (
    echo   Tailscale ^(Tablet^): http://%TS_IP%:%PORT%
) else (
    echo   Tailscale ^(Tablet^): http://100.x.x.x:%PORT%  ^(IP aus Tailscale-App^)
)
echo.

:: --- Port pruefen ob schon belegt ---
netstat -an | findstr ":%PORT% " | findstr "LISTENING" >nul 2>&1
if not errorlevel 1 (
    echo [WARNUNG] Port %PORT% ist schon belegt!
    echo Moeglicherweise laeuft der Server bereits.
    echo Teste: http://127.0.0.1:%PORT%
    echo.
    choice /C JN /M "Trotzdem neu starten (alter Prozess muss manuell beendet werden)"
    if errorlevel 2 exit /b 0
)

:: --- Server starten ---
echo [4/4] Server startet auf 0.0.0.0:%PORT% ...
echo.
echo  ══════════════════════════════════════════
echo   Fenster OFFEN lassen!
echo   Am Tablet oeffnen:
if defined TS_IP (
echo     http://%TS_IP%:%PORT%
) else (
echo     http://DEINE-TAILSCALE-IP:%PORT%
)
echo  ══════════════════════════════════════════
echo.

start http://127.0.0.1:%PORT%
python -m http.server %PORT% --bind 0.0.0.0

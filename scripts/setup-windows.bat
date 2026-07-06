@echo off
REM Einmalige Installation der Abhängigkeiten unter Windows

chcp 65001 >nul
echo ========================================
echo  YouTube-Playlist-zu-Audio – Setup
echo ========================================
echo.

where python >nul 2>&1
if errorlevel 1 (
    echo [FEHLER] Python nicht gefunden.
    echo Bitte installieren: https://www.python.org/downloads/
    echo Wichtig: "Add Python to PATH" aktivieren!
    pause
    exit /b 1
)

echo [1/2] yt-dlp installieren ...
python -m pip install --upgrade yt-dlp
if errorlevel 1 (
    echo [FEHLER] pip-Installation fehlgeschlagen.
    pause
    exit /b 1
)

echo.
echo [2/2] ffmpeg prüfen ...
where ffmpeg >nul 2>&1
if errorlevel 1 (
    echo ffmpeg nicht gefunden. Versuche Installation via winget ...
    where winget >nul 2>&1
    if errorlevel 1 (
        echo.
        echo [HINWEIS] winget nicht verfügbar. ffmpeg manuell installieren:
        echo   https://ffmpeg.org/download.html
        echo   Den bin-Ordner zum System-PATH hinzufügen.
    ) else (
        winget install --id Gyan.FFmpeg -e --accept-source-agreements --accept-package-agreements
    )
) else (
    echo ffmpeg ist bereits installiert.
)

echo.
echo ========================================
echo  Setup abgeschlossen!
echo.
echo  Verwendung:
echo    youtube_playlist_to_audio.bat "PLAYLIST_URL"
echo.
echo  Dateien landen in: %USERPROFILE%\Downloads
echo ========================================
pause

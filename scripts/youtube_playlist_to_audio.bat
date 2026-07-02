@echo off
REM YouTube-Playlist zu MP3 – Windows-Starter
REM Doppelklick oder: youtube_playlist_to_audio.bat "PLAYLIST_URL"

chcp 65001 >nul
setlocal

cd /d "%~dp0"

where python >nul 2>&1
if errorlevel 1 (
    echo Fehler: Python ist nicht installiert oder nicht im PATH.
    echo Download: https://www.python.org/downloads/
    echo Bei der Installation "Add Python to PATH" aktivieren!
    pause
    exit /b 1
)

if "%~1"=="" (
    echo.
    echo Verwendung:
    echo   youtube_playlist_to_audio.bat "https://www.youtube.com/playlist?list=..."
    echo.
    echo Optionen werden an das Python-Script weitergegeben, z.B.:
    echo   youtube_playlist_to_audio.bat -f mp3 -q 192 "PLAYLIST_URL"
    echo.
    pause
    exit /b 1
)

python "%~dp0youtube_playlist_to_audio.py" %*
set EXIT_CODE=%ERRORLEVEL%

if %EXIT_CODE% neq 0 pause
exit /b %EXIT_CODE%

@echo off
REM YouTube-Playlist zu MP3 – Windows-Starter
REM Doppelklick: fragt nach URL ODER liest playlist.txt

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

python "%~dp0youtube_playlist_to_audio.py" %*
set EXIT_CODE=%ERRORLEVEL%

echo.
pause
exit /b %EXIT_CODE%

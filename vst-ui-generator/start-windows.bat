@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo VST UI Asset Generator startet ...
echo Browser: http://localhost:8080
echo.
start http://localhost:8080
python -m http.server 8080

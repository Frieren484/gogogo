@echo off
chcp 65001 >nul
cd /d "%~dp0"
call "%~dp0start.bat"
if %errorlevel% neq 0 pause

@echo off
setlocal EnableExtensions
cd /d "%~dp0"
call "%~dp0start.bat"
if %errorlevel% neq 0 pause

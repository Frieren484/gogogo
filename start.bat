@echo off
setlocal EnableExtensions

:: Переходим в папку с проектом
cd /d "%~dp0"

chcp 65001 >nul 2>&1
title Ветеринарная клиника "ЛапУшки" - Запуск

echo =======================================================
echo       Ветеринарная клиника "ЛапУшки"
echo       Запуск веб-приложения и открытие в браузере
echo =======================================================
echo Папка проекта: %CD%
echo.

:: 1. Проверяем наличие Node.js
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo [ПОИСК] Node.js не найден в стандартном PATH. Проверяем папки установки...
    if exist "%ProgramFiles%\nodejs\node.exe" (
        set "PATH=%ProgramFiles%\nodejs;%PATH%"
    ) else if exist "%ProgramFiles(x86)%\nodejs\node.exe" (
        set "PATH=%ProgramFiles(x86)%\nodejs;%PATH%"
    ) else if exist "%LocalAppData%\Programs\node\node.exe" (
        set "PATH=%LocalAppData%\Programs\node;%PATH%"
    ) else (
        echo.
        echo [ОШИБКА] Node.js не найден в вашей системе!
        echo Пожалуйста, установите Node.js (рекомендуется LTS): https://nodejs.org/
        echo После установки перезапустите этот файл.
        echo.
        pause
        exit /b 1
    )
)

echo [OK] Node.js найден:
node -v
echo.

:: 2. Проверяем наличие package.json
if not exist "package.json" (
    echo [ОШИБКА] Файл package.json не найден в папке %CD%!
    echo Убедитесь, что батник запускается в папке проекта.
    echo.
    pause
    exit /b 1
)

:: 3. Проверяем наличие папки node_modules
if not exist "node_modules" (
    echo [ИНФО] Папка node_modules не найдена. Устанавливаем библиотеки (npm install)...
    call npm install
    if %errorlevel% neq 0 (
        echo [ОШИБКА] Ошибка при установке библиотек через npm install.
        pause
        exit /b 1
    )
    echo [OK] Библиотеки успешно установлены.
    echo.
)

:: 4. Открываем сайт в браузере
echo [ИНФО] Открытие сайта в браузере (http://localhost:3000)...
start http://localhost:3000

echo.
echo =======================================================
echo Запуск локального сервера Vite...
echo Сайт доступен по адресу: http://localhost:3000
echo Чтобы остановить сервер, нажмите Ctrl + C
echo =======================================================
echo.

call npm run dev:open

if %errorlevel% neq 0 (
    echo.
    echo [ИНФО] Запуск через стандартную команду npm run dev...
    call npm run dev
)

echo.
echo [ИНФО] Сервер завершил работу.
pause

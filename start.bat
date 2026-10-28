@echo off
chcp 65001 >nul
title Ветеринарная клиника "ЛапУшки" - Запуск

echo ====================================================
echo       Ветеринарная клиника "ЛапУшки"
echo       Запуск веб-приложения и открытие в браузере
echo ====================================================
echo.

where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ОШИБКА] Node.js не найден в системе!
    echo Пожалуйста, установите Node.js с официального сайта: https://nodejs.org/
    echo.
    pause
    exit /b 1
)

if not exist node_modules (
    echo [ИНФО] Папка node_modules не найдена. Устанавливаем зависимости...
    call npm install
    if %errorlevel% neq 0 (
        echo [ОШИБКА] Не удалось установить зависимости.
        pause
        exit /b 1
    )
    echo [УСПЕХ] Зависимости успешно установлены.
    echo.
)

echo [1/2] Запуск браузера (http://localhost:3000)...
start "" cmd /c "timeout /t 2 /nobreak >nul && start http://localhost:3000"

echo [2/2] Запуск локального сервера Vite на порту 3000...
echo Для остановки сервера нажмите комбинацию клавиш Ctrl+C.
echo ====================================================
echo.

call npm run dev

pause

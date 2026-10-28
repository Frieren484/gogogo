@echo off
chcp 65001 >nul
title Ветеринарная клиника "ЛапУшки" - Запуск
cd /d "%~dp0"

echo =======================================================
echo       Ветеринарная клиника "ЛапУшки"
echo       Запуск веб-приложения и открытие в браузере
echo =======================================================
echo.

:: 1. Проверяем, доступен ли node напрямую
where node >nul 2>&1
if %errorlevel% equ 0 goto NODE_READY

:: 2. Если node не в PATH, ищем в стандартных путях Windows (без вложенных блоков скобок)
if exist "%ProgramFiles%\nodejs\node.exe" set "PATH=%ProgramFiles%\nodejs;%PATH%" & goto NODE_READY
if exist "C:\Program Files\nodejs\node.exe" set "PATH=C:\Program Files\nodejs;%PATH%" & goto NODE_READY
if exist "C:\Program Files (x86)\nodejs\node.exe" set "PATH=C:\Program Files (x86)\nodejs;%PATH%" & goto NODE_READY
if exist "%LOCALAPPDATA%\Programs\node\node.exe" set "PATH=%LOCALAPPDATA%\Programs\node;%PATH%" & goto NODE_READY

echo [ОШИБКА] Node.js не найден на вашем компьютере!
echo.
echo Для работы проекта необходим Node.js.
echo Скачайте и установите Node.js (рекомендуется версия LTS):
echo https://nodejs.org/
echo.
echo После установки закройте это окно и запустите start.bat снова.
echo.
pause
exit /b 1

:NODE_READY
echo [OK] Node.js найден:
node -v
echo.

:: 3. Проверка package.json
if not exist "package.json" goto ERR_NO_PACKAGE
goto CHECK_DEPS

:ERR_NO_PACKAGE
echo [ОШИБКА] Файл package.json не найден в папке проекта:
echo %CD%
echo Пожалуйста, запускайте батник из корня проекта.
echo.
pause
exit /b 1

:CHECK_DEPS
:: 4. Проверка установленных зависимостей
if exist "node_modules" goto RUN_SERVER

echo [ИНФО] Папка node_modules не найдена.
echo Выполняется первая установка библиотек (npm install)...
echo Это может занять около 1 минуты, пожалуйста, подождите...
echo.
call npm install
if %errorlevel% neq 0 goto ERR_INSTALL
echo.
echo [OK] Библиотеки успешно установлены!
echo.

:RUN_SERVER
echo =======================================================
echo Запуск локального сервера Vite...
echo Сайт открывается по адресу: http://localhost:3000
echo Чтобы остановить сервер, нажмите Ctrl + C в этом окне
echo =======================================================
echo.

:: Открываем браузер на http://localhost:3000
start "" "http://localhost:3000"

:: Запускаем сервер Vite
call npm run dev

if %errorlevel% neq 0 (
    echo.
    echo [ИНФО] Сервер завершил работу или произошла ошибка.
)

echo.
pause
exit /b 0

:ERR_INSTALL
echo.
echo [ОШИБКА] Не удалось установить библиотеки через npm install.
echo Проверьте подключение к интернету или права доступа.
echo.
pause
exit /b 1

# Запуск проекта Ветеринарная клиника "ЛапУшки"
Set-Location -Path $PSScriptRoot

Write-Host "=======================================================" -ForegroundColor Cyan
Write-Host "      Ветеринарная клиника 'ЛапУшки' - Запуск" -ForegroundColor Green
Write-Host "=======================================================" -ForegroundColor Cyan

# Проверка Node.js
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "[ОШИБКА] Node.js не установлен!" -ForegroundColor Red
    Write-Host "Скачайте и установите Node.js с официального сайта: https://nodejs.org/"
    Read-Host "Нажмите Enter для выхода..."
    exit 1
}

# Проверка зависимостей
if (-not (Test-Path "node_modules")) {
    Write-Host "[ИНФО] Установка зависимостей (npm install)..." -ForegroundColor Yellow
    npm install
}

Write-Host "[ИНФО] Запуск сайта и открытие в браузере..." -ForegroundColor Cyan
Start-Process "http://localhost:3000"

npm run dev

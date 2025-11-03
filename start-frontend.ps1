# Script para iniciar el frontend
# Uso: .\start-frontend.ps1

Write-Host "🚀 Iniciando Frontend React Native..." -ForegroundColor Cyan
Write-Host ""

# Verificar si node_modules existe
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Instalando dependencias..." -ForegroundColor Yellow
    npm install
    Write-Host ""
}

Write-Host "✓ Dependencias listas" -ForegroundColor Green
Write-Host ""

# Preguntar modo de ejecución
Write-Host "Selecciona modo de ejecución:" -ForegroundColor Cyan
Write-Host "  1) Web (navegador)" -ForegroundColor White
Write-Host "  2) Expo (QR para celular/emulador)" -ForegroundColor White
Write-Host ""
$modo = Read-Host "Opción (1 o 2)"

switch ($modo) {
    "1" {
        Write-Host "▶️  Iniciando en modo WEB..." -ForegroundColor Green
        npm run web
    }
    "2" {
        Write-Host "▶️  Iniciando servidor Expo..." -ForegroundColor Green
        npm start
    }
    default {
        Write-Host "▶️  Por defecto, iniciando servidor Expo..." -ForegroundColor Green
        npm start
    }
}


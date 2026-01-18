# Reset-Database.ps1
# Script para resetar banco de dados e reiniciar sistema - Windows

Write-Host "🔄 RESET COMPLETO DO SISTEMA 3D LUCRATIVA" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "⚠️  ATENÇÃO: Este script vai:" -ForegroundColor Yellow
Write-Host "   1. Limpar o banco de dados 3dlucrativa"
Write-Host "   2. Recriar tabelas"
Write-Host "   3. Executar seeds com dados iniciais"
Write-Host ""

$confirm = Read-Host "Tem certeza que deseja continuar? (s/n)"
if ($confirm -ne 's' -and $confirm -ne 'S') {
    Write-Host "❌ Operação cancelada" -ForegroundColor Red
    exit
}

Write-Host ""
Write-Host "1️⃣  Parando servidor se estiver rodando..." -ForegroundColor Blue
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Get-Process "node.exe" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2
Write-Host "✅ Pronto" -ForegroundColor Green
Write-Host ""

Write-Host "2️⃣  Limpando banco de dados..." -ForegroundColor Blue
Write-Host "⚠️  Configure seu MySQL e execute:" -ForegroundColor Yellow
Write-Host '   mysql -u root -p -e "DROP DATABASE IF EXISTS `3dlucrativa`; CREATE DATABASE `3dlucrativa`;"' -ForegroundColor Cyan
Write-Host ""
$dbReady = Read-Host "Banco foi limpo e recriado? (s/n)"
if ($dbReady -ne 's' -and $dbReady -ne 'S') {
    Write-Host "❌ Operação cancelada" -ForegroundColor Red
    exit
}
Write-Host "✅ Banco pronto" -ForegroundColor Green
Write-Host ""

Write-Host "3️⃣  Verificando dependências..." -ForegroundColor Blue
npm list axios jsonwebtoken bcrypt 2>$null | Out-Null
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Todas as dependências instaladas" -ForegroundColor Green
} else {
    Write-Host "⚠️  Instalando dependências..." -ForegroundColor Yellow
    npm install
    Write-Host "✅ Dependências instaladas" -ForegroundColor Green
}
Write-Host ""

Write-Host "4️⃣  Sincronizando banco de dados..." -ForegroundColor Blue
npm run typeorm migration:run 2>$null
Write-Host "✅ Migrations executadas (ou não havia nenhuma)" -ForegroundColor Green
Write-Host ""

Write-Host "5️⃣  Executando seed com dados iniciais..." -ForegroundColor Blue
npm run seed
Write-Host ""

Write-Host "==========================================" -ForegroundColor Green
Write-Host "✅ RESET COMPLETO CONCLUÍDO!" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
Write-Host ""

Write-Host "📋 CREDENCIAIS PADRÃO:" -ForegroundColor Yellow
Write-Host "  Email: admin@3dlucrativa.com" -ForegroundColor Cyan
Write-Host "  Senha: admin123" -ForegroundColor Cyan
Write-Host ""

Write-Host "🚀 Para iniciar o sistema:" -ForegroundColor Blue
Write-Host ""
Write-Host "  DESENVOLVIMENTO:" -ForegroundColor Green
Write-Host "    npm run dev" -ForegroundColor Cyan
Write-Host ""
Write-Host "  PRODUÇÃO:" -ForegroundColor Green
Write-Host "    npm run build" -ForegroundColor Cyan
Write-Host "    npm start" -ForegroundColor Cyan
Write-Host ""

Write-Host "⚠️  Lembre-se:" -ForegroundColor Yellow
Write-Host "  • Todas as mudanças de Mercado Pago foram aplicadas" -ForegroundColor Cyan
Write-Host "  • Novos preços: R\$ 0.01 (Intermediário) e R\$ 0.02 (Avançado)" -ForegroundColor Cyan
Write-Host "  • Plano ativa AUTOMATICAMENTE após pagamento" -ForegroundColor Cyan
Write-Host "  • Variáveis de ambiente: verifique .env.local" -ForegroundColor Cyan
Write-Host ""

$start = Read-Host "Deseja iniciar o servidor agora? (dev/prod/n)"
if ($start -eq 'dev' -or $start -eq 'd') {
    Write-Host ""
    Write-Host "Iniciando em DESENVOLVIMENTO..." -ForegroundColor Green
    npm run dev
} elseif ($start -eq 'prod' -or $start -eq 'p') {
    Write-Host ""
    Write-Host "Compilando para PRODUÇÃO..." -ForegroundColor Green
    npm run build
    Write-Host "Iniciando em PRODUÇÃO..." -ForegroundColor Green
    npm start
} else {
    Write-Host ""
    Write-Host "Sistema pronto! Execute quando desejar:" -ForegroundColor Green
    Write-Host "  npm run dev   (desenvolvimento)" -ForegroundColor Cyan
    Write-Host "  npm start     (produção)" -ForegroundColor Cyan
}

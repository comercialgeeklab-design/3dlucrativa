@echo off
echo ================================================
echo  3dlucrativa - Setup Inicial
echo ================================================
echo.

echo [1/5] Instalando dependencias...
call npm install

echo.
echo [2/5] Iniciando MySQL via Docker...
call docker-compose up -d

echo.
echo [3/5] Aguardando MySQL inicializar (30 segundos)...
timeout /t 30 /nobreak

echo.
echo [4/5] Criando pasta de uploads...
if not exist "public\uploads" mkdir "public\uploads"
echo "" > public\uploads\.gitkeep

echo.
echo [5/5] Populando banco de dados inicial...
call npx ts-node scripts/seed.ts

echo.
echo ================================================
echo  Setup concluido com sucesso!
echo ================================================
echo.
echo Para iniciar o servidor de desenvolvimento:
echo   npm run dev
echo.
echo Acesse: http://localhost:3000
echo Admin: admin@3dlucrativa.com / admin123
echo.
pause

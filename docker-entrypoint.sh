#!/bin/sh
# Script de inicialização para Docker

set -e

echo "🚀 Iniciando 3D Lucrativa..."

# Aguardar MySQL estar pronto
echo "⏳ Aguardando MySQL..."
for i in {1..30}; do
  if mysqladmin ping -h"$DB_HOST" -u"$DB_USERNAME" -p"$DB_PASSWORD" --silent; then
    echo "✅ MySQL está pronto!"
    break
  fi
  echo "  Tentativa $i/30..."
  sleep 1
done

# Opcional: Executar seed do banco de dados (comentado por enquanto)
# echo "🌱 Executando seed do banco de dados..."
# npm run seed || echo "⚠️ Seed falhou, continuando..."

# Iniciar aplicação
echo "🚀 Iniciando servidor Next.js..."
npm start

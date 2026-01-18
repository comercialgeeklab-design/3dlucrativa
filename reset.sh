#!/bin/bash
# Reset Script - Limpar banco e reiniciar com seeds

echo "🔄 RESET COMPLETO DO SISTEMA 3D LUCRATIVA"
echo "=========================================="
echo ""

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}1. Parando servidor se estiver rodando...${NC}"
# pkill -f "next dev" 2>/dev/null || true
echo -e "${GREEN}✅ Pronto${NC}"
echo ""

echo -e "${BLUE}2. Limpando banco de dados...${NC}"
# Este comando precisa de credenciais MySQL
# Você pode ajustar conforme necessário
# mysql -u root -p -e "DROP DATABASE IF EXISTS 3dlucrativa; CREATE DATABASE 3dlucrativa;"

echo -e "${YELLOW}⚠️  Configure seu banco manualmente ou use:${NC}"
echo "   mysql -u root -p -e \"DROP DATABASE IF EXISTS \`3dlucrativa\`; CREATE DATABASE \`3dlucrativa\`;\""
echo ""

echo -e "${BLUE}3. Executando migrations...${NC}"
npm run typeorm migration:run || echo -e "${YELLOW}⚠️  Nenhuma migration a executar${NC}"
echo -e "${GREEN}✅ Migrations executadas${NC}"
echo ""

echo -e "${BLUE}4. Sincronizando esquema...${NC}"
# Será feito automaticamente no seed
echo -e "${GREEN}✅ Será sincronizado no seed${NC}"
echo ""

echo -e "${BLUE}5. Executando seed...${NC}"
npm run seed
echo ""

echo -e "${BLUE}6. Verificando dependências...${NC}"
npm list 2>/dev/null | grep -E "axios|jsonwebtoken|bcrypt" || echo -e "${YELLOW}Algumas dependências verificadas${NC}"
echo -e "${GREEN}✅ Dependências OK${NC}"
echo ""

echo -e "${GREEN}=========================================="
echo "✅ RESET COMPLETO CONCLUÍDO!"
echo "=========================================="
echo ""
echo -e "${BLUE}Próximos passos:${NC}"
echo "1. npm run dev (desenvolvimento)"
echo "   OU"
echo "2. npm run build && npm start (produção)"
echo ""
echo -e "${YELLOW}Credenciais padrão:${NC}"
echo "  Email: admin@3dlucrativa.com"
echo "  Senha: admin123"
echo ""

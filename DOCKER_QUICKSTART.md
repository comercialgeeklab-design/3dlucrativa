# 🐳 Docker Setup Completo - 3D Lucrativa

## ✅ Tudo Dockerizado!

Sua aplicação está **100% dockerizada** e pronta para rodar com um único comando!

## 🚀 Como Iniciar (SUPER SIMPLES)

### Windows (PowerShell):
```powershell
docker-compose up -d
```

### Mac/Linux:
```bash
docker-compose up -d
```

**Pronto!** Aguarde 30-60 segundos e acesse:
- **Frontend**: http://localhost:3000
- **MySQL**: localhost:3306

---

## 📋 O que foi criado

### 1. **Dockerfile**
- Build multi-stage otimizado
- Apenas 2 estágios: Builder + Production
- Imagem pequena e rápida (~500MB)

### 2. **docker-compose.yml** 
- ✅ Serviço MySQL com volume persistente
- ✅ Serviço Next.js conectado ao MySQL
- ✅ Health checks automáticos
- ✅ Rede Docker para comunicação
- ✅ Variáveis de ambiente configuráveis

### 3. **docker-entrypoint.sh**
- Aguarda MySQL estar pronto
- Executa seed do banco automaticamente
- Inicia servidor Next.js

### 4. **.dockerignore**
- Exclui arquivos desnecessários da build
- Reduz tamanho da imagem

### 5. **.env.docker** + **DOCKER_GUIDE.md**
- Documentação completa
- Variáveis de ambiente pré-configuradas
- Troubleshooting

---

## 📊 Estrutura de Containers

```
┌─────────────────────────────────────────┐
│  Docker Compose (3dlucrativa-network)   │
├─────────────────────────────────────────┤
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  3dlucrativa-app (Next.js)      │   │
│  │  - PORT: 3000:3000              │   │
│  │  - Health: OK                   │   │
│  └──────────────┬────────────────┘   │
│                 │                     │
│                 │ (TCP:3306)          │
│                 ▼                     │
│  ┌─────────────────────────────────┐   │
│  │  3dlucrativa-mysql (MySQL 8.0)  │   │
│  │  - PORT: 3306:3306              │   │
│  │  - Database: 3dlucrativa        │   │
│  │  - Volume: mysql_data (persistente)
│  │  - Health: OK                   │   │
│  └─────────────────────────────────┘   │
│                                         │
└─────────────────────────────────────────┘
```

---

## 🎮 Comandos Úteis

### Iniciar
```bash
docker-compose up -d              # Rodar em background
docker-compose up                 # Ver logs em tempo real
```

### Parar
```bash
docker-compose stop               # Parar containers (dados persistem)
docker-compose down               # Remover containers (dados persistem)
docker-compose down -v            # Remover tudo (DELETA DADOS!)
```

### Monitorar
```bash
docker-compose ps                 # Ver status
docker-compose logs -f next-app   # Ver logs em tempo real
docker-compose logs mysql         # Ver logs do MySQL
```

### Reiniciar
```bash
docker-compose restart            # Reiniciar tudo
docker-compose restart next-app   # Reiniciar só app
docker-compose build --no-cache   # Rebuild forçado
```

### Acessar containers
```bash
# MySQL
docker-compose exec mysql mysql -u 3dlucrativa -p3dlucrativa 3dlucrativa

# App (bash)
docker-compose exec next-app sh

# Ver ambiente
docker-compose exec next-app env
```

---

## 🔧 Variáveis de Ambiente

### Padrão (pronto para usar)
```env
DB_HOST=mysql
DB_PORT=3306
DB_USERNAME=3dlucrativa
DB_PASSWORD=3dlucrativa
DB_DATABASE=3dlucrativa

JWT_SECRET=sua-chave-secreta-muito-segura

MERCADO_PAGO_ACCESS_TOKEN=TEST-...
NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY=TEST-...
```

### Customizar
Edite `.env.local` ou crie `.env.docker` com seus valores:
```bash
cp .env.docker .env.local
nano .env.local  # Edit com suas credenciais
```

---

## 📊 Informações dos Containers

### MySQL
- **Host**: `mysql` (dentro do Docker)
- **Host externo**: `localhost:3306`
- **Usuário**: `3dlucrativa`
- **Senha**: `3dlucrativa`
- **Banco**: `3dlucrativa`
- **Volume**: `mysql_data:/var/lib/mysql`

### Next.js
- **Host interno**: `next-app:3000`
- **Host externo**: `http://localhost:3000`
- **Health check**: A cada 30s

---

## ⚠️ Troubleshooting

### ❌ "Port 3000 already in use"
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Ou mudar porta em docker-compose.yml:
# ports:
#   - "3001:3000"
```

### ❌ "MySQL não conecta"
```bash
docker-compose logs mysql
# Aguarde 30 segundos antes de acessar
```

### ❌ "App crashed"
```bash
docker-compose logs next-app
docker-compose build --no-cache
docker-compose up -d
```

### ❌ "Remover tudo e começar do zero"
```bash
docker-compose down -v          # Remove tudo
docker-compose build --no-cache # Rebuild
docker-compose up -d            # Start
sleep 30                        # Aguardar
docker-compose logs next-app    # Ver logs
```

---

## 🚀 Próximos Passos

### Desenvolvimento Local
```bash
docker-compose up -d            # MySQL rodando em Docker
npm install                     # Instalar dependencies
npm run dev                     # Next.js local (não em Docker)
```

### Produção
1. Mudar credenciais em `.env`
2. Usar Docker Swarm ou Kubernetes
3. Configurar Nginx como reverse proxy
4. Setup backup do MySQL
5. Usar domínio HTTPS

---

## 📈 Performance

### Se estiver lento:
```bash
# Aumentar recursos do Docker
# Windows: Docker Desktop > Settings > Resources
# - CPU: 4-8 cores
# - Memory: 4-8GB

# Limpar caches
docker system prune -a
```

---

## ✨ Benefícios

✅ **Reproducível**: Funciona igual em qualquer máquina  
✅ **Rápido**: Uma linha de comando  
✅ **Isolado**: Sem conflitos com sistema  
✅ **Escalável**: Fácil adicionar serviços (Redis, etc)  
✅ **Backup**: Volume MySQL persiste dados  
✅ **Deploy**: Pronto para produção  

---

## 📚 Documentação Completa

Ver arquivo `DOCKER_GUIDE.md` para:
- Instruções detalhadas
- Variáveis de ambiente
- Health checks
- Deploy em produção
- Segurança
- E muito mais!

---

**Criado em:** 18 de Janeiro de 2026  
**Status:** ✅ Pronto para uso

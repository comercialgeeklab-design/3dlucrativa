# 🐳 Guia Docker - 3D Lucrativa

## ✅ Pré-requisitos

- **Docker**: [Instalar Docker Desktop](https://www.docker.com/products/docker-desktop)
- **Docker Compose**: Vem incluído no Docker Desktop

## 🚀 Iniciar Sistema com Docker

### Opção 1: Iniciar com um comando (Recomendado)

```bash
docker-compose up -d
```

Isso irá:
1. ✅ Criar e iniciar o container MySQL
2. ✅ Criar e iniciar o container Next.js
3. ✅ Executar seed automático do banco de dados
4. ✅ Aguardar que o MySQL esteja saudável antes de iniciar o app

### Opção 2: Iniciar com logs em tempo real

```bash
docker-compose up
```

Pressione `Ctrl+C` para parar (containers continuam rodando)

## 📊 Monitorar Containers

```bash
# Ver status dos containers
docker-compose ps

# Ver logs do app Next.js
docker-compose logs next-app

# Ver logs do MySQL
docker-compose logs mysql

# Ver logs em tempo real
docker-compose logs -f next-app
```

## 🛑 Parar Containers

```bash
# Parar todos os containers (dados persiste)
docker-compose stop

# Parar e remover containers
docker-compose down

# Parar, remover containers E volumes (DELETA DADOS!)
docker-compose down -v
```

## 🔄 Reiniciar Containers

```bash
# Reiniciar todos
docker-compose restart

# Reiniciar apenas o app
docker-compose restart next-app

# Reiniciar apenas o MySQL
docker-compose restart mysql
```

## 🔧 Acessar Aplicação

- **Frontend**: http://localhost:3000
- **MySQL**: `localhost:3306`
  - Usuário: `3dlucrativa`
  - Senha: `3dlucrativa`
  - Banco: `3dlucrativa`

## 📝 Variáveis de Ambiente

### Usar arquivo .env.docker

```bash
# Copiar arquivo de exemplo (já feito)
cp .env.docker .env.local

# Editar com suas credenciais reais
nano .env.local
```

### Variáveis mais importantes:

```env
# JWT Secret (MUDAR EM PRODUÇÃO!)
JWT_SECRET=sua-chave-secreta-segura

# Mercado Pago (obter em: https://www.mercadopago.com.br/developers/panel)
MERCADO_PAGO_ACCESS_TOKEN=TEST-...
NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY=TEST-...
```

## 🔨 Build Manual

Se fez mudanças no código, rebuilde a imagem:

```bash
# Rebuild e reiniciar
docker-compose up --build -d

# Ou apenas rebuild
docker-compose build
```

## 📦 Dados Persistentes

O banco de dados MySQL está configurado com volume:
- **Volume**: `mysql_data`
- **Localização no PC**: `C:\ProgramData\Docker\volumes\...` (Windows)

Os dados persistem mesmo após parar/remover containers (usando `stop` ou `down`)

⚠️ **Cuidado**: `docker-compose down -v` DELETA o volume e TODOS os dados!

## 🐛 Troubleshooting

### Problema: Port 3000 já está em uso

```bash
# Ver qual processo está usando a porta
netstat -ano | findstr :3000

# Matar o processo (Windows)
taskkill /PID <PID> /F

# Ou usar porta diferente no docker-compose.yml:
# ports:
#   - "3001:3000"
```

### Problema: Port 3306 já está em uso

Mesmo problema acima, mas para porta 3306

### Problema: MySQL não conecta

```bash
# Verificar logs do MySQL
docker-compose logs mysql

# Aguardar 30 segundos para MySQL inicializar
# Pode ser necessário rodar seed manualmente:
docker-compose exec next-app npm run seed
```

### Problema: Container crashed

```bash
# Ver logs de erro
docker-compose logs next-app

# Tentar rebuild
docker-compose build --no-cache
docker-compose up -d
```

### Problema: Lipar tudo e começar do zero

```bash
# Parar e remover tudo (dados também!)
docker-compose down -v

# Rebuild e iniciar novamente
docker-compose build --no-cache
docker-compose up -d

# Aguardar 30 segundos
sleep 30

# Ver logs
docker-compose logs next-app
```

## 🌐 Acessar MySQL dentro do Docker

```bash
# Via linha de comando
docker-compose exec mysql mysql -u 3dlucrativa -p3dlucrativa 3dlucrativa

# Ou usando MySQL Workbench/DBeaver
# Host: localhost:3306
# User: 3dlucrativa
# Password: 3dlucrativa
# Database: 3dlucrativa
```

## 📊 Verificar Saúde dos Containers

```bash
# Verificar status
docker-compose ps

# Espera-se ver:
# STATUS: "Up X minutes (healthy)" ✅
# Se vir "unhealthy" ou "restarting", há problema
```

## 🔐 Segurança em Produção

⚠️ **NÃO USE AS CREDENCIAIS PADRÃO EM PRODUÇÃO!**

```yaml
# Mudar em produção:
MYSQL_PASSWORD: ${DB_PASSWORD} # não deixar hard-coded
JWT_SECRET: ${JWT_SECRET}       # nunca deixar visível
MERCADO_PAGO_ACCESS_TOKEN: ${MERCADO_PAGO_ACCESS_TOKEN}
```

Use arquivo `.env` com valores seguros e NÃO versione no git.

## 📈 Performance

Se o app estiver lento:

```bash
# Aumentar recursos do Docker (Windows)
# Docker Desktop > Settings > Resources
# - CPU: aumentar para 4-8 cores
# - Memory: aumentar para 4-8GB

# Limpar caches e unused images
docker system prune -a
```

## 🚀 Deploy em Produção

Para produção, recomenda-se:
1. Usar servidor mais potente (AWS, DigitalOcean, etc)
2. Mude credenciais em `.env`
3. Configure backup automático do MySQL
4. Use Docker Swarm ou Kubernetes para orquestração
5. Configure reverse proxy (Nginx) na frente

---

**Última atualização:** 18 de Janeiro de 2026

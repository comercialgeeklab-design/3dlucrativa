# 🚀 Guia de Início Rápido - 3dlucrativa

## Instalação Automática (Windows)

Execute o script de setup:

```bash
setup.bat
```

Este script irá:
1. Instalar todas as dependências
2. Iniciar o MySQL via Docker
3. Criar as pastas necessárias
4. Popular o banco com dados iniciais

## Instalação Manual

### 1. Instalar Dependências

```bash
npm install
```

### 2. Configurar Banco de Dados

Iniciar MySQL via Docker:

```bash
docker-compose up -d
```

Aguardar 30 segundos para o MySQL inicializar completamente.

### 3. Criar Estrutura de Pastas

```bash
mkdir public\uploads
echo. > public\uploads\.gitkeep
```

### 4. Popular Banco de Dados

```bash
npm run seed
```

Este comando cria:
- Plataformas de venda (Shopee, Mercado Livre, Amazon)
- Usuário admin: `admin@3dlucrativa.com` / `admin123`

### 5. Iniciar Servidor

```bash
npm run dev
```

Acesse: **http://localhost:3000**

## 🧪 Testando a Aplicação

### 1. Acesso Admin

- URL: http://localhost:3000/login
- Email: `admin@3dlucrativa.com`
- Senha: `admin123`

### 2. Criar Novo Usuário

- Acesse: http://localhost:3000/register
- Preencha o formulário
- **Teste com CNPJ**: Digite um CNPJ válido e veja o preenchimento automático
- **Teste com CEP**: Digite um CEP e veja o endereço ser preenchido
- Senha padrão será: `abc12**`

### 3. Login com Novo Usuário

- Faça login com o email cadastrado
- Senha: `abc12**`
- Sistema irá forçar troca de senha

## 📊 Estrutura Criada

### Banco de Dados

Tabelas criadas automaticamente:
- `users` - Usuários do sistema
- `stores` - Lojas dos usuários
- `products` - Produtos
- `product_filaments` - Filamentos usados nos produtos
- `filaments` - Estoque de filamentos
- `filament_purchases` - Compras de filamento
- `stocks` - Estoque geral
- `stock_purchases` - Compras de estoque
- `inventories` - Inventário de impressoras
- `sales` - Vendas realizadas
- `platforms` - Plataformas de venda

### Plataformas Pré-cadastradas

| Plataforma | Comissão |
|------------|----------|
| Shopee | 12% |
| Mercado Livre | 16% |
| Amazon | 15% |
| Outros | 10% |

## 🔧 Comandos Úteis

```bash
# Desenvolvimento
npm run dev

# Build para produção
npm run build

# Iniciar produção
npm start

# Gerenciar Docker
npm run docker:up    # Iniciar MySQL
npm run docker:down  # Parar MySQL

# Popular banco novamente
npm run seed
```

## 🐛 Solução de Problemas

### Erro ao conectar no MySQL

```bash
# Parar e remover containers
docker-compose down -v

# Iniciar novamente
docker-compose up -d

# Aguardar 30 segundos e popular
npm run seed
```

### Porta 3000 em uso

Edite o comando no package.json ou use:

```bash
PORT=3001 npm run dev
```

### Erro de módulos não encontrados

```bash
# Limpar node_modules e reinstalar
rm -rf node_modules
npm install
```

## 📝 Próximas Etapas

Após a instalação, você pode:

1. ✅ Fazer login como admin
2. ✅ Cadastrar novos usuários
3. ⏳ Configurar perfil da loja (em desenvolvimento)
4. ⏳ Cadastrar filamentos (em desenvolvimento)
5. ⏳ Cadastrar produtos (em desenvolvimento)
6. ⏳ Registrar vendas (em desenvolvimento)
7. ⏳ Visualizar dashboard (em desenvolvimento)

## 🎨 Temas

Alterne entre tema claro e escuro usando as configurações do navegador ou adicionaremos um botão em breve.

## 📧 Suporte

Para dúvidas ou problemas, consulte o README.md principal.

---

**Desenvolvido com ❤️ para lojas de impressão 3D**

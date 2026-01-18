# 🚀 3dlucrativa - Sistema de Precificação para Impressão 3D

Plataforma SaaS completa para automação de precificação e gestão de lojas de impressão 3D.

## � Dois Níveis de Acesso

### 👤 **Cliente (Usuário Público)**
- **Rota**: `/dashboard`
- Cadastro livre na plataforma
- Acesso ao seu próprio dashboard privado
- Gerencia: produtos, filamentos, vendas, estoque
- Vê: suas próprias estatísticas e receita

### 🛡️ **Admin do SaaS (Time Interna)**
- **Rota**: `/admin`
- Acesso exclusivo (role ADMIN)
- Visualiza: usuários cadastrados, novos registros, estatísticas globais
- Configura: comissões das plataformas
- **NÃO gerencia users** - apenas visualiza métricas sobre eles

---

## �📋 Funcionalidades

### 🔐 Autenticação
- Cadastro com CPF ou CNPJ
- Preenchimento automático via CNPJ (BrasilAPI)
- Preenchimento automático de endereço via CEP (ViaCEP)
- Senha padrão `abc12**` com obrigatoriedade de troca no primeiro acesso
- JWT com hash SHA-256 e salt

### 🏪 Gestão de Loja
- Perfil da loja (logo, informações, endereço)
- Configuração de impostos e porcentagem
- Custo de energia por kWh

### 📦 Produtos
- Cadastro completo de produtos
- Upload de foto (até 20MB)
- Upload de arquivo STL/3MF
- Cálculo de filamentos por cor e gramatura
- Tempo de impressão para cálculo de energia
- Estoque de embalagens
- Seleção de plataforma de venda (Shopee, Mercado Livre, Amazon)
- **Precificação Automática** baseada em:
  - Custo de filamento
  - Custo de energia
  - Custo de embalagem
  - Comissão da plataforma
  - Impostos
  - Margem de lucro desejada

### 🎨 Estoque de Filamento
- Tipos: PLA, ABS, PETG, TPU, Nylon, ASA, Outros
- Controle por cor e fabricante
- Histórico de compras
- Previsão de quebra de estoque
- Métricas de utilização

### 📦 Estoque Geral
- Cadastro de embalagens e materiais
- Controle de quantidade e valor
- Histórico de compras

### 🖨️ Inventário
- Cadastro de impressoras 3D
- Marca, modelo, apelido
- Valor pago e quantidade
- Upload de fotos

### 💰 Vendas (Cliente)
- Registro de vendas por produto
- Quantidade e plataforma
- Cálculo automático de comissões
- Histórico completo de vendas

### 📊 Dashboard Cliente
- Estatísticas: produtos, vendas, receita, mensal
- Receita bruta vs líquida
- Vendas por plataforma

### 🛡️ Painel Admin do SaaS
- **Dashboard Admin**: Estatísticas globais
  - Total de usuários ativos
  - Total de produtos no sistema
  - Total de vendas (todas as lojas)
  - Receita total (líquida após comissões)
  - Novos usuários este mês
  
- **Gráficos**:
  - Receita por plataforma
  - Tendência de vendas (últimos 7 dias)
  
- **Monitoramento de Usuários**:
  - Lista de todos os usuários cadastrados
  - Status: ativo/inativo
  - Data de cadastro
  - Nome da loja
  - Opções: desativar ou deletar (se necessário)
  
- **Configurações**:
  - Editar comissões das plataformas de venda

## 🛠️ Tecnologias

### Backend
- **Next.js 14** (App Router) com API Routes integradas
- **TypeORM** para ORM
- **MySQL 8.0** via Docker
- **JWT** para autenticação
- **bcrypt** para hash de senhas
- **class-validator** para validação de DTOs
- **Swagger** (futuro) para documentação

### Frontend
- **React 18**
- **Tailwind CSS**
- **shadcn/ui** para componentes
- **React Query** para gerenciamento de estado
- **next-themes** para dark/light mode
- **Lottie** para animações
- **react-icons** e **lucide-react**
- **sonner** para notificações

### APIs Externas
- **ViaCEP** - Busca de endereço por CEP
- **BrasilAPI** - Busca de dados por CNPJ

## �️ Rotas da Aplicação

### 🌐 Públicas (Sem autenticação)
```
GET  /                 - Landing page
GET  /login            - Página de login
POST /api/auth/login   - Login
GET  /register         - Página de cadastro
POST /api/auth/register - Cadastro
```

### 👤 Cliente (Requer autenticação - role: USER)
```
/dashboard                      - Dashboard principal
/dashboard/products             - Listar produtos
/dashboard/products/new         - Criar novo produto
/dashboard/filaments            - Listar filamentos
/dashboard/filaments/new        - Criar novo filamento
/dashboard/sales                - Registrar e visualizar vendas
/dashboard/settings             - Configurações da loja
/dashboard/change-password      - Alterar senha

GET  /api/products              - Listar produtos
POST /api/products/create       - Criar produto
GET  /api/products/[id]         - Detalhes do produto
PUT  /api/products/[id]         - Atualizar produto
DELETE /api/products/[id]       - Deletar produto

GET  /api/filaments             - Listar filamentos
POST /api/filaments             - Criar filamento
GET  /api/filaments/[id]        - Detalhes do filamento
PUT  /api/filaments/[id]        - Atualizar filamento
DELETE /api/filaments/[id]      - Deletar filamento

GET  /api/sales                 - Listar vendas
POST /api/sales                 - Registrar venda
DELETE /api/sales/[id]          - Deletar venda

GET  /api/stores/me             - Dados da loja
PUT  /api/stores/me             - Atualizar loja

GET  /api/platforms             - Listar plataformas
```

### 🛡️ Admin do SaaS (Requer autenticação - role: ADMIN)
```
/admin                          - Dashboard admin (estatísticas)
/admin/users                    - Monitoramento de usuários
/admin/products                 - Visualizar todos os produtos
/admin/settings                 - Configurações de plataformas

GET  /api/admin/stats           - Estatísticas globais
GET  /api/admin/users           - Listar usuários
POST /api/admin/users/[id]/deactivate - Desativar usuário
DELETE /api/admin/users/[id]    - Deletar usuário
GET  /api/admin/products        - Listar todos os produtos
DELETE /api/admin/products/[id] - Deletar produto
PUT  /api/admin/platforms/[id]  - Atualizar comissão
```

## 🚀 Instalação

### Pré-requisitos
- Node.js 20+ (LTS)
- Docker e Docker Compose
- npm ou yarn

### 1. Clone o repositório
```bash
cd "c:\Users\Pedro\Documents\3dlucrativa"
```

### 2. Instale as dependências
```bash
npm install
```

### 3. Configure as variáveis de ambiente
```bash
cp .env.example .env
```

Edite o arquivo `.env` conforme necessário.

### 4. Inicie o MySQL via Docker
```bash
docker-compose up -d
```

Aguarde o MySQL inicializar (cerca de 30 segundos).

### 5. Crie a pasta de uploads
```bash
mkdir -p public/uploads
```

### 6. Inicie o servidor de desenvolvimento
```bash
npm run dev
```

O servidor estará disponível em: http://localhost:3000

## 📁 Estrutura do Projeto

```
3dlucrativa/
├── app/                        # Next.js App Router
│   ├── api/                    # API Routes (Backend)
│   │   ├── auth/              # Autenticação
│   │   ├── external/          # APIs externas
│   │   ├── admin/             # Rotas admin (protegidas)
│   │   ├── products/          # Produtos
│   │   ├── filaments/         # Filamentos
│   │   ├── sales/             # Vendas
│   │   └── platforms/         # Plataformas
│   ├── login/                 # Página de login
│   ├── register/              # Página de cadastro
│   ├── dashboard/             # Dashboard do cliente (protegido)
│   ├── admin/                 # Área administrativa (protegida)
│   ├── globals.css            # Estilos globais
│   ├── layout.tsx             # Layout principal
│   └── page.tsx               # Landing page
├── components/                # Componentes React
│   ├── ui/                    # Componentes shadcn/ui
│   ├── sidebar.tsx            # Sidebar inteligente
│   └── providers.tsx          # Providers globais
├── lib/                       # Bibliotecas e utilitários
│   ├── database/              # TypeORM
│   │   ├── entities/          # Entidades do banco
│   │   └── data-source.ts     # Configuração TypeORM
│   ├── auth/                  # Autenticação
│   ├── external-apis/         # APIs externas
│   ├── utils/                 # Utilitários
│   └── utils.ts               # Helpers gerais
├── public/                    # Arquivos estáticos
│   └── uploads/               # Uploads de imagens
├── docker-compose.yml         # Docker Compose (MySQL)
├── .env                       # Variáveis de ambiente
├── next.config.js             # Configuração Next.js
├── tailwind.config.ts         # Configuração Tailwind
├── tsconfig.json              # Configuração TypeScript
└── package.json               # Dependências
```

## 🎨 Temas

O sistema possui suporte completo para temas claro e escuro, com cores baseadas em roxo.

## 🔒 Segurança

- Senhas com hash bcrypt (salt rounds: 10)
- JWT com algoritmo SHA-256
- Validação de CPF/CNPJ
- Proteção de rotas autenticadas
- Sanitização de inputs

## 📝 Próximos Passos

Ainda falta implementar as APIs e páginas para:
- [ ] Gestão de produtos com precificação
- [ ] CRUD de filamentos
- [ ] CRUD de estoque
- [ ] CRUD de inventário
- [ ] Registro de vendas
- [ ] Dashboard completo
- [ ] Área administrativa
- [ ] Upload de arquivos
- [ ] Relatórios e métricas
- [ ] Documentação Swagger

## 🤝 Contribuindo

Este é um projeto privado. Entre em contato para mais informações.

## 📄 Licença

Todos os direitos reservados © 2026 3dlucrativa

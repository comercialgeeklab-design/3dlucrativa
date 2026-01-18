# 🏗️ Arquitetura do Sistema - 3dlucrativa

## 📐 Visão Geral

```
┌─────────────────────────────────────────────────────────┐
│                    BROWSER (Cliente)                    │
├─────────────────────────────────────────────────────────┤
│  Landing Page → Login → Dashboard/Admin                 │
│                                                         │
│  React 18 + Next.js 14 (App Router)                    │
│  Tailwind CSS + shadcn/ui                              │
│  React Query + Sonner                                  │
└────────────────┬────────────────────────────────────────┘
                 │ HTTP/HTTPS
                 │ JWT Token no Header
                 ↓
┌─────────────────────────────────────────────────────────┐
│            NEXT.JS API ROUTES (Backend)                 │
│                                                         │
│  Authentication (JWT + bcrypt)                          │
│  ├─ /api/auth/register                                 │
│  ├─ /api/auth/login                                    │
│  ├─ /api/auth/change-password                          │
│  └─ /api/auth/me                                       │
│                                                         │
│  Middleware de Proteção                                 │
│  ├─ withAuth() → Cliente autenticado                    │
│  └─ withAdmin() → Admin SaaS autenticado                │
│                                                         │
│  API de Negócios                                        │
│  ├─ /api/products → CRUD de produtos                   │
│  ├─ /api/filaments → CRUD de filamentos                │
│  ├─ /api/sales → Registro de vendas                    │
│  ├─ /api/stores/me → Configurações da loja             │
│  ├─ /api/platforms → Lista de plataformas              │
│  ├─ /api/admin/* → Rotas exclusivas do admin           │
│  └─ /api/external/* → APIs externas                    │
└────────────────┬────────────────────────────────────────┘
                 │ SQL/TypeORM
                 ↓
┌─────────────────────────────────────────────────────────┐
│              BANCO DE DADOS (MySQL 8.0)                 │
│                                                         │
│  Tabelas:                                               │
│  ├─ users           (clientes + admin)                 │
│  ├─ stores          (loja de cada usuário)             │
│  ├─ products        (produtos criados)                 │
│  ├─ filaments       (tipos de filamento)               │
│  ├─ sales           (registro de vendas)               │
│  ├─ platforms       (plataformas de venda)             │
│  ├─ product_filaments (relação filamento x produto)    │
│  ├─ filament_purchases (histórico de compras)          │
│  └─ stocks, inventories, etc                           │
│                                                         │
│  Docker MySQL via docker-compose.yml                    │
└─────────────────────────────────────────────────────────┘
```

---

## 🔐 Fluxo de Autenticação

```
1. CADASTRO
   ├─ Usuário preenche formulário
   ├─ Valida CPF/CNPJ (localmente)
   ├─ Auto-preenche via APIs externas
   ├─ POST /api/auth/register
   ├─ Backend: valida, hash senha com bcrypt, cria registro
   ├─ Cria loja padrão
   ├─ Retorna sucesso
   └─ Redireciona para login

2. LOGIN
   ├─ POST /api/auth/login { email, senha }
   ├─ Backend: busca usuário, compara hash bcrypt
   ├─ Se válido: gera JWT (HS256 SHA-256)
   ├─ Retorna token
   └─ Frontend: salva em localStorage

3. REQUISIÇÕES AUTENTICADAS
   ├─ Frontend: envia Authorization: Bearer <token>
   ├─ Backend: extrai token do header
   ├─ Valida JWT com chave secreta
   ├─ Busca usuário no banco
   ├─ Verifica: ativo? role correto?
   └─ Executa ação ou retorna 401/403

4. LOGOUT
   └─ Frontend: remove token do localStorage
```

---

## 📊 Modelo de Dados

### User (Usuário)
```
{
  id: UUID
  email: string (único)
  name: string
  role: 'ADMIN' | 'USER'
  isActive: boolean
  passwordHash: string
  createdAt: timestamp
  
  Relações:
  store: Store (1-to-1)
  products: Product[]
  sales: Sale[]
}
```

### Store (Loja)
```
{
  id: UUID
  userId: UUID (FK)
  storeName: string
  description: text
  
  Localização:
  cep: string
  street: string
  number: string
  neighborhood: string
  city: string
  state: string
  
  Configurações:
  paysTax: boolean
  taxPercentage: decimal
  energyCostPerKwh: decimal
  
  Relações:
  user: User (1-to-1)
}
```

### Product (Produto)
```
{
  id: UUID
  userId: UUID (FK)
  name: string
  description: text
  
  Cálculos:
  filamentCost: decimal
  energyCost: decimal
  packagingCost: decimal
  profitMarginPercentage: decimal
  finalPrice: decimal (calculado)
  
  Especificações:
  printingHours: decimal
  isActive: boolean
  
  Arquivos:
  stlFile: string (path)
  photoFile: string (path)
  
  Relações:
  user: User
  filaments: ProductFilament[]
  sales: Sale[]
}
```

### Filament (Filamento)
```
{
  id: UUID
  type: string (PLA, ABS, PETG, TPU, Nylon, ASA)
  color: string
  manufacturer: string
  currentStock: decimal (gramas)
  pricePerGram: decimal
  totalValue: decimal
  
  Relações:
  products: ProductFilament[]
  purchases: FilamentPurchase[]
}
```

### Sale (Venda)
```
{
  id: UUID
  userId: UUID (FK)
  productId: UUID (FK)
  platformId: UUID (FK)
  quantity: int
  saleDate: date
  tax: decimal (default 0)
  
  Relações:
  user: User
  product: Product
  platform: Platform
}
```

### Platform (Plataforma)
```
{
  id: UUID
  name: string (Shopee, Mercado Livre, Amazon, etc)
  commissionPercentage: decimal
  
  Relações:
  sales: Sale[]
  productPlatforms: ProductPlatform[]
}
```

---

## 💰 Fluxo de Precificação

```
ENTRADA:
├─ Filamento selecionado → pricePerGram
├─ Horas de impressão → energyPerHour
├─ Custo de energia → costPerKwh
├─ Custo de embalagem → packagingCost
├─ Margem desejada → marginPercentage
└─ Plataforma → commissionPercentage

CÁLCULOS:
├─ filamentCost = quantity * pricePerGram
├─ energyCost = hours * energyPerHour * costPerKwh
├─ baseCost = filamentCost + energyCost + packagingCost
├─ beforeMargin = baseCost * (1 + marginPercentage/100)
├─ commission = beforeMargin * (commissionPercentage/100)
└─ finalPrice = beforeMargin + commission

SAÍDA: finalPrice (preço que o cliente vai vender)

VENDA:
├─ saleTotal = finalPrice * quantity
├─ saleCommission = saleTotal * (platformCommission/100)
├─ saleTax = saleTotal * (storeTax/100)
└─ netValue = saleTotal - saleCommission - saleTax
```

---

## 🛡️ Segurança

### Níveis de Acesso
```
PÚBLICO (sem autenticação)
├─ GET /                    (landing page)
├─ GET /login               (página)
├─ POST /api/auth/login     (API)
├─ GET /register            (página)
├─ POST /api/auth/register  (API)
└─ GET /api/external/*      (APIs sem token)

CLIENTE (autenticação + role:USER)
├─ /dashboard/*            (todas as rotas cliente)
└─ /api/products, /api/sales, etc

ADMIN (autenticação + role:ADMIN)
├─ /admin/*                (todas as rotas admin)
└─ /api/admin/*            (todas as APIs admin)
```

### Proteção de Dados
```
JWT VERIFICATION:
├─ Assinado com chave secreta (HMAC-SHA256)
├─ Expiração configurável
├─ Verificado em toda requisição protegida
└─ Re-validação do usuário no banco

PASSWORDS:
├─ Hash bcrypt com salt rounds 10
├─ Nunca armazenado em plaintext
├─ Comparação segura (timing-safe)
└─ Força mínima validada

DADOS ISOLADOS:
├─ Cliente só vê seus próprios dados
├─ Query com userId em todos os GETs
├─ Admin vê todos os dados
└─ Sem informações sensíveis em logs
```

---

## 🔄 Fluxos Principais

### Fluxo: Cliente Registra Venda

```
1. Frontend
   └─ POST /api/sales { productId, quantity, platformId, saleDate }
   
2. Backend - withAuth Middleware
   ├─ Extrai token JWT
   ├─ Valida assinatura
   ├─ Busca usuário no banco
   └─ Passa user para handler

3. Backend - Lógica
   ├─ Valida dados de entrada
   ├─ Busca produto (associado ao usuário)
   ├─ Busca plataforma
   ├─ Calcula: comissão, impostos, valor líquido
   ├─ Cria registro de Sale
   └─ Retorna dados formatados

4. Frontend
   ├─ Recebe resposta com sucesso
   ├─ Atualiza lista de vendas
   ├─ Mostra toast de sucesso
   └─ Limpa formulário
```

### Fluxo: Admin Visualiza Estatísticas

```
1. Frontend
   └─ GET /api/admin/stats

2. Backend - withAdmin Middleware
   ├─ Valida JWT e role === 'ADMIN'
   └─ Passa admin user para handler

3. Backend - Lógica
   ├─ COUNT users (todos)
   ├─ COUNT users (criados este mês)
   ├─ COUNT products (todos)
   ├─ SUM sales e revenue
   ├─ GROUP BY platform para gráfico
   ├─ GROUP BY date (últimos 7 dias)
   └─ Retorna objeto com estatísticas

4. Frontend
   ├─ Recebe dados
   ├─ Renderiza cards com KPIs
   ├─ Renderiza gráficos com Recharts
   └─ Atualiza a cada 30s (opcional)
```

---

## 📦 Stack Tecnológico

### Frontend
```
React 18
├─ next.js 14 (App Router)
├─ TypeScript
├─ Tailwind CSS
├─ shadcn/ui
├─ react-query v5
├─ react-hook-form
├─ zod (validação)
├─ recharts (gráficos)
├─ sonner (notificações)
├─ date-fns (datas)
└─ lucide-react (ícones)
```

### Backend
```
Node.js/Next.js 14
├─ TypeScript
├─ TypeORM 0.3.19
├─ MySQL 8.0
├─ JWT (jsonwebtoken)
├─ bcrypt
├─ class-validator
└─ class-transformer
```

### Infraestrutura
```
Docker
├─ docker-compose.yml
└─ MySQL 8.0 container

Ambiente
├─ .env com variáveis de configuração
└─ CORS, Headers de segurança
```

---

## 🔌 APIs Externas Integradas

### ViaCEP
```
GET https://viacep.com.br/ws/{cep}/json/
├─ Usado no: formulário de cadastro
├─ Busca: logradouro, bairro, cidade, estado
└─ Sem autenticação
```

### BrasilAPI (CNPJ)
```
GET https://api.cnpj.dev/v1/{cnpj}
├─ Usado no: formulário de cadastro
├─ Busca: nome, natureza jurídica, data abertura
└─ Sem autenticação
```

---

## 📈 Escalabilidade

### Melhorias Sugeridas
```
Curto prazo:
├─ Paginação em listas
├─ Índices de banco de dados
├─ Cache Redis
└─ Rate limiting

Médio prazo:
├─ CDN para arquivos
├─ Background jobs (Bull)
├─ Webhooks para eventos
└─ API GraphQL

Longo prazo:
├─ Microserviços
├─ Event sourcing
├─ Sharding de banco
└─ Multi-região
```

---

## 🧪 Testes

```
Unit Tests
├─ Cálculos de preço
├─ Validações
└─ Formatações

Integration Tests
├─ APIs completas
├─ Fluxos de usuário
└─ Autenticação

E2E Tests
├─ Cadastro até venda
├─ Admin dashboard
└─ Segurança de rotas
```


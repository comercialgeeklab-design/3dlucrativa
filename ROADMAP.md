# 🚀 Roadmap de Desenvolvimento - 3dlucrativa

## ✅ Fase 1 - CONCLUÍDA (100%)

### Infraestrutura
- [x] Configuração do projeto Next.js 14
- [x] TypeORM + MySQL 8.0
- [x] Docker Compose
- [x] Estrutura de pastas
- [x] Configuração de ambiente (.env)

### Autenticação
- [x] Sistema de JWT
- [x] Hash de senhas (bcrypt)
- [x] API de registro
- [x] API de login
- [x] API de troca de senha
- [x] Middleware de autenticação
- [x] Validação de CPF/CNPJ

### Frontend Base
- [x] Landing page
- [x] Página de login
- [x] Página de registro
- [x] Componentes UI (shadcn/ui)
- [x] Sistema de temas (dark/light)
- [x] React Query configurado
- [x] Toast notifications

### Integrações Externas
- [x] ViaCEP (busca de endereço)
- [x] BrasilAPI (dados de CNPJ)

### Banco de Dados
- [x] 11 entidades criadas
- [x] Relacionamentos mapeados
- [x] Seed com dados iniciais
- [x] Plataformas pré-cadastradas

---

## 🔨 Fase 2 - EM DESENVOLVIMENTO (0%)

### Módulo: Perfil da Loja

#### Backend APIs
- [ ] `GET /api/stores/me` - Obter dados da loja
- [ ] `PUT /api/stores/me` - Atualizar perfil
- [ ] `POST /api/stores/logo` - Upload de logo
- [ ] `PUT /api/stores/settings` - Configurações (impostos, energia)

#### Frontend
- [ ] Página de perfil da loja
- [ ] Formulário de edição
- [ ] Upload de logo (drag & drop)
- [ ] Configurações de impostos
- [ ] Configuração de custo de energia

---

## 📦 Fase 3 - PLANEJADA (0%)

### Módulo: Produtos

#### Backend APIs
- [ ] `GET /api/products` - Listar produtos
- [ ] `POST /api/products` - Criar produto
- [ ] `GET /api/products/:id` - Detalhes do produto
- [ ] `PUT /api/products/:id` - Atualizar produto
- [ ] `DELETE /api/products/:id` - Deletar produto
- [ ] `POST /api/products/:id/photo` - Upload de foto
- [ ] `POST /api/products/:id/file` - Upload de arquivo STL
- [ ] `POST /api/products/:id/calculate-price` - Calcular preço

#### Frontend
- [ ] Página de listagem de produtos
- [ ] Modal de criação/edição (universal)
- [ ] Formulário de produto completo
- [ ] Seleção de filamentos (múltiplos)
- [ ] Input de gramatura por cor
- [ ] Seleção de estoque (embalagem)
- [ ] Seleção de plataforma de venda
- [ ] Input de margem de lucro
- [ ] Visualização de preço calculado em tempo real
- [ ] Upload de foto do produto
- [ ] Upload de arquivo STL/3MF (até 20MB)
- [ ] Card de produto com detalhes

#### Funcionalidades
- [ ] Cálculo automático de preço
- [ ] Preview de custo vs lucro
- [ ] Validação de arquivo (tipo e tamanho)
- [ ] Otimização de imagens

---

## 🎨 Fase 4 - PLANEJADA (0%)

### Módulo: Filamentos

#### Backend APIs
- [ ] `GET /api/filaments` - Listar filamentos
- [ ] `POST /api/filaments` - Cadastrar filamento
- [ ] `GET /api/filaments/:id` - Detalhes
- [ ] `PUT /api/filaments/:id` - Atualizar
- [ ] `DELETE /api/filaments/:id` - Deletar
- [ ] `POST /api/filaments/:id/purchase` - Adicionar compra
- [ ] `GET /api/filaments/:id/history` - Histórico de compras
- [ ] `GET /api/filaments/stock-prediction` - Previsão de quebra

#### Frontend
- [ ] Página de listagem de filamentos
- [ ] Modal de cadastro/edição
- [ ] Formulário de filamento
  - [ ] Tipo (PLA, ABS, PETG, TPU, etc)
  - [ ] Cor
  - [ ] Fabricante
  - [ ] Quantidade inicial
  - [ ] Valor
- [ ] Modal de adicionar compra
- [ ] Indicador de estoque baixo
- [ ] Gráfico de uso de filamento
- [ ] Alerta de quebra de estoque

#### Funcionalidades
- [ ] Cálculo de preço por grama
- [ ] Atualização automática de estoque ao vender
- [ ] Previsão de quando vai acabar
- [ ] Histórico de uso por produto
- [ ] Relatório de filamentos mais usados

---

## 📊 Fase 5 - PLANEJADA (0%)

### Módulo: Estoque

#### Backend APIs
- [ ] `GET /api/stocks` - Listar estoque
- [ ] `POST /api/stocks` - Cadastrar item
- [ ] `GET /api/stocks/:id` - Detalhes
- [ ] `PUT /api/stocks/:id` - Atualizar
- [ ] `DELETE /api/stocks/:id` - Deletar
- [ ] `POST /api/stocks/:id/purchase` - Adicionar compra

#### Frontend
- [ ] Página de listagem de estoque
- [ ] Modal de cadastro/edição
- [ ] Formulário de item de estoque
  - [ ] Nome (tipo de embalagem)
  - [ ] Quantidade
  - [ ] Valor total
- [ ] Modal de adicionar compra
- [ ] Cálculo de preço unitário

---

## 🖨️ Fase 6 - PLANEJADA (0%)

### Módulo: Inventário (Impressoras)

#### Backend APIs
- [ ] `GET /api/inventory` - Listar impressoras
- [ ] `POST /api/inventory` - Cadastrar impressora
- [ ] `GET /api/inventory/:id` - Detalhes
- [ ] `PUT /api/inventory/:id` - Atualizar
- [ ] `DELETE /api/inventory/:id` - Deletar
- [ ] `POST /api/inventory/:id/photo` - Upload de foto

#### Frontend
- [ ] Página de listagem de impressoras
- [ ] Modal de cadastro/edição
- [ ] Formulário de impressora
  - [ ] Marca
  - [ ] Modelo
  - [ ] Apelido
  - [ ] Valor pago
  - [ ] Quantidade
  - [ ] Foto
- [ ] Card visual de impressora
- [ ] Valor total do inventário

---

## 💰 Fase 7 - PLANEJADA (0%)

### Módulo: Vendas

#### Backend APIs
- [ ] `GET /api/sales` - Listar vendas
- [ ] `POST /api/sales` - Registrar venda
- [ ] `GET /api/sales/:id` - Detalhes da venda
- [ ] `DELETE /api/sales/:id` - Cancelar venda
- [ ] `GET /api/sales/stats` - Estatísticas

#### Frontend
- [ ] Página de registro de venda
- [ ] Formulário de venda
  - [ ] Seleção de produto
  - [ ] Quantidade
  - [ ] Plataforma de venda
  - [ ] Data da venda
- [ ] Listagem de vendas
- [ ] Filtros (período, produto, plataforma)
- [ ] Cálculo automático de comissões e impostos

#### Funcionalidades
- [ ] Atualização automática de estoque de filamento
- [ ] Cálculo de lucro líquido
- [ ] Histórico completo

---

## 📊 Fase 8 - PLANEJADA (0%)

### Módulo: Dashboard

#### Backend APIs
- [ ] `GET /api/dashboard/overview` - Visão geral
- [ ] `GET /api/dashboard/sales` - Dados de vendas
- [ ] `GET /api/dashboard/products` - Produtos mais vendidos
- [ ] `GET /api/dashboard/filaments` - Uso de filamentos
- [ ] `GET /api/dashboard/platforms` - Vendas por plataforma
- [ ] `GET /api/dashboard/stock-alerts` - Alertas de estoque

#### Frontend
- [ ] Dashboard principal
- [ ] Cards de métricas:
  - [ ] Vendas do mês
  - [ ] Lucro líquido
  - [ ] Valor bruto
  - [ ] Comissões pagas
  - [ ] Impostos pagos
- [ ] Gráficos:
  - [ ] Vendas ao longo do tempo
  - [ ] Produtos mais vendidos
  - [ ] Uso de filamentos
  - [ ] Vendas por plataforma
- [ ] Tabelas:
  - [ ] Produtos mais vendidos
  - [ ] Filamentos mais usados
  - [ ] Vendas recentes
- [ ] Alertas:
  - [ ] Filamentos acabando
  - [ ] Estoque baixo
  - [ ] Previsão de quebra
- [ ] Filtros:
  - [ ] Hoje
  - [ ] Semana
  - [ ] Mês
  - [ ] Ano
  - [ ] Período personalizado

#### Bibliotecas
- [ ] Recharts para gráficos
- [ ] date-fns para manipulação de datas
- [ ] Lottie para animações

---

## 👨‍💼 Fase 9 - PLANEJADA (0%)

### Módulo: Admin

#### Backend APIs
- [ ] `GET /api/admin/users` - Listar usuários
- [ ] `GET /api/admin/stats` - Estatísticas gerais
- [ ] `PUT /api/admin/users/:id/status` - Ativar/desativar usuário
- [ ] `GET /api/admin/dashboard` - Dashboard admin

#### Frontend
- [ ] Dashboard administrativo
- [ ] Métricas:
  - [ ] Total de clientes
  - [ ] Clientes ativos
  - [ ] Novos clientes (dia/semana/mês)
  - [ ] Taxa de retenção
- [ ] Listagem de usuários
- [ ] Filtros e busca
- [ ] Gráfico de crescimento

---

## 🎨 Fase 10 - MELHORIAS (0%)

### UX/UI
- [ ] Animações Lottie
- [ ] Skeleton loaders
- [ ] Loading states
- [ ] Empty states
- [ ] Error boundaries
- [ ] Confirmações de ações (modals)
- [ ] Tooltips informativos
- [ ] Breadcrumbs
- [ ] Paginação
- [ ] Busca global

### Performance
- [ ] Lazy loading de imagens
- [ ] Infinite scroll
- [ ] Cache strategies
- [ ] Otimização de queries
- [ ] Index no banco de dados

### Acessibilidade
- [ ] ARIA labels
- [ ] Navegação por teclado
- [ ] Contraste adequado
- [ ] Screen reader support

---

## 📱 Fase 11 - FUTURA (0%)

### Funcionalidades Avançadas
- [ ] PWA (Progressive Web App)
- [ ] Notificações push
- [ ] Modo offline
- [ ] Exportação de relatórios (PDF/Excel)
- [ ] Importação de produtos (CSV)
- [ ] API pública para integrações
- [ ] Webhooks
- [ ] Multi-idioma (i18n)
- [ ] Multi-moeda

### Integrações
- [ ] Integração com Shopee API
- [ ] Integração com Mercado Livre API
- [ ] Integração com Amazon API
- [ ] Sincronização automática de vendas
- [ ] Email marketing
- [ ] WhatsApp notifications

---

## 🎯 Prioridades

### 🔥 Alta Prioridade (Próximas 2 semanas)
1. Módulo de Produtos (Fase 3)
2. Módulo de Filamentos (Fase 4)
3. Dashboard básico (Fase 8 parcial)

### ⚡ Média Prioridade (1 mês)
1. Módulo de Vendas (Fase 7)
2. Módulo de Estoque (Fase 5)
3. Dashboard completo (Fase 8)

### 📋 Baixa Prioridade (2+ meses)
1. Módulo de Inventário (Fase 6)
2. Área Admin (Fase 9)
3. Melhorias UX/UI (Fase 10)

---

## 📊 Progresso Geral

- **Fase 1:** ✅ 100%
- **Fase 2:** ⏸️ 0%
- **Fase 3:** ⏸️ 0%
- **Fase 4:** ⏸️ 0%
- **Fase 5:** ⏸️ 0%
- **Fase 6:** ⏸️ 0%
- **Fase 7:** ⏸️ 0%
- **Fase 8:** ⏸️ 0%
- **Fase 9:** ⏸️ 0%
- **Fase 10:** ⏸️ 0%

**Total:** 10% completo

---

**Última atualização:** 17 de Janeiro de 2026

# 📋 Guia de Testes - 3dlucrativa

## 🔓 Credenciais de Teste

### Admin do SaaS
```
Email: admin@3dlucrativa.com
Senha: admin123
```

### Usuário Cliente de Teste (criar via cadastro)
```
Email: cliente@teste.com
Senha: teste123
```

---

## ✅ Fluxo de Teste - Usuário Cliente

### 1️⃣ Cadastro e Login
- [ ] Acessar `http://localhost:3000/register`
- [ ] Preencher formulário com dados válidos
- [ ] CEP válido deve auto-preencher endereço
- [ ] CNPJ válido deve auto-preencher dados da empresa
- [ ] Criar conta com sucesso
- [ ] Fazer login com e-mail e senha
- [ ] Ser redirecionado para `/dashboard`

### 2️⃣ Dashboard Principal
- [ ] Ver cards: Produtos, Vendas, Receita, Mensal
- [ ] Valores devem estar zerados no primeiro acesso

### 3️⃣ Criar Filamento
- [ ] Ir para `/dashboard/filaments`
- [ ] Clicar em "Novo Filamento"
- [ ] Preencher:
  - Tipo: PLA
  - Cor: Vermelho
  - Fabricante: Creality
  - Quantidade: 1000g
  - Preço: 85.00
- [ ] Validar cálculo automático: Preço por grama = 0,085
- [ ] Filamento aparecer na lista

### 4️⃣ Criar Produto
- [ ] Ir para `/dashboard/products`
- [ ] Clicar em "Novo Produto"
- [ ] Preencher:
  - Nome: Suporte de Celular
  - Filamento: PLA Vermelho (criado acima)
  - Horas de Impressão: 2.5h
  - Margem Desejada: 30%
  - Plataformas: Shopee, Mercado Livre
- [ ] Upload de foto (opcional)
- [ ] Upload de STL (opcional)
- [ ] Clicar em "Criar Produto"
- [ ] Produto aparecer na lista com preço calculado

### 5️⃣ Registrar Venda
- [ ] Ir para `/dashboard/sales`
- [ ] Clicar em "Nova Venda"
- [ ] Preencher:
  - Produto: Suporte de Celular
  - Quantidade: 2
  - Plataforma: Shopee (12% comissão)
  - Data: Hoje
- [ ] Validar preview com cálculo de comissão
- [ ] Clicar em "Registrar Venda"
- [ ] Venda aparecer no histórico
- [ ] Valor líquido = Total - Comissão

### 6️⃣ Configurações da Loja
- [ ] Ir para `/dashboard/settings`
- [ ] Editar dados da loja
- [ ] Preencher impostos e custo de energia
- [ ] Clicar "Salvar"
- [ ] Dados persistem após refresh

### 7️⃣ Alterar Senha
- [ ] Ir para `/dashboard/change-password`
- [ ] Preencher senha atual e nova senha
- [ ] Validar requisitos de senha
- [ ] Fazer logout e login com nova senha

---

## ✅ Fluxo de Teste - Admin do SaaS

### 1️⃣ Login Admin
- [ ] Acessar `http://localhost:3000/login`
- [ ] Usar credenciais admin
- [ ] Ser redirecionado para `/admin`

### 2️⃣ Dashboard Admin
- [ ] Ver KPI cards:
  - [ ] Total de usuários
  - [ ] Total de produtos
  - [ ] Total de vendas
  - [ ] Receita total
  - [ ] Novos usuários este mês
- [ ] Gráficos exibidos corretamente (se houver dados)

### 3️⃣ Monitorar Usuários
- [ ] Ir para `/admin/users`
- [ ] Ver lista de usuários cadastrados
- [ ] Buscar por e-mail ou nome da loja
- [ ] Desativar um usuário
  - [ ] Ícone de cadeado aparecer
  - [ ] Usuário desativado no banco
- [ ] Deletar um usuário (com confirmação)
  - [ ] Usuário removido da lista

### 4️⃣ Visualizar Produtos
- [ ] Ir para `/admin/products`
- [ ] Ver todos os produtos de todos os clientes
- [ ] Buscar por nome ou usuário
- [ ] Deletar um produto (com confirmação)

### 5️⃣ Configurar Plataformas
- [ ] Ir para `/admin/settings`
- [ ] Ver lista de plataformas com comissões atuais
- [ ] Editar comissão de uma plataforma
  - [ ] Clicar "Editar"
  - [ ] Alterar valor (ex: 12% → 15%)
  - [ ] Clicar "Salvar"
  - [ ] Valor atualizado na lista
- [ ] Novo valor afeta cálculos de vendas futuras

### 6️⃣ Logout Admin
- [ ] Clicar em "Sair"
- [ ] Ser redirecionado para `/login`

---

## 🔐 Testes de Segurança

### Proteção de Rotas
- [ ] Acessar `/dashboard` sem token → redirecionar para `/login`
- [ ] Acessar `/admin` com usuário CLIENT → erro 403
- [ ] Usar token expirado → erro 401
- [ ] Usar token inválido → erro 401

### Isolamento de Dados
- [ ] Cliente A não vê dados de Cliente B
- [ ] Cliente não pode acessar `/admin` mesmo autenticado
- [ ] Admin pode ver dados de todos os clientes

---

## 📊 Testes de Cálculos

### Preço de Produto
Fórmula: `finalPrice = (filamentCost + energyCost + packagingCost) * (1 + marginPercentage) + commission`

Teste:
- [ ] Filamento R$ 10 + Margem 30% = Preço ~ R$ 13
- [ ] Valores refletem nas vendas corretamente

### Comissão de Venda
Fórmula: `commission = (quantity * finalPrice) * (platformCommissionPercentage / 100)`

Teste:
- [ ] 2x Produto R$ 50 com plataforma 12% = Comissão R$ 12
- [ ] Valor líquido = R$ 100 - R$ 12 = R$ 88

---

## 🔄 Fluxo Completo

1. Admin acessa `/admin` e vê estatísticas zeradas
2. Cliente se cadastra em `/register`
3. Cliente cria filamento
4. Cliente cria produto
5. Cliente registra venda
6. Admin acessa `/admin` e vê:
   - [ ] +1 novo usuário
   - [ ] +1 produto
   - [ ] +1 venda
   - [ ] Receita atualizada
   - [ ] Gráfico de tendência

---

## ⚠️ Casos de Erro a Validar

- [ ] Criar filamento com valores negativo → erro
- [ ] Criar venda sem selecionar produto → erro
- [ ] Arquivo STL > 20MB → erro
- [ ] Email duplicado no cadastro → erro
- [ ] Senha muito fraca → aviso
- [ ] CEP inválido → erro
- [ ] CNPJ inválido → erro

---

## 🚀 Performance

- [ ] Carregar `/admin` com 100+ usuários < 2s
- [ ] Listar produtos de um cliente < 1s
- [ ] Registrar venda < 1s
- [ ] Gráficos renderizam suavemente

---

## 📱 Responsividade

- [ ] Desktop: Tudo funciona perfeitamente
- [ ] Tablet: Layout adapta bem
- [ ] Mobile: Interface utilizável (ajustes podem ser necessários)


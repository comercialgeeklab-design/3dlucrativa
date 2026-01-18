# ✅ Checklist de Implementação - Mercado Pago

## 📋 Arquivos Criados

- [x] `lib/external-apis/mercadopago.ts` - Serviço principal
- [x] `lib/external-apis/mercadopago.examples.ts` - Exemplos de uso
- [x] `lib/types/mercadopago.ts` - Tipos TypeScript
- [x] `app/api/payment/mercadopago/route.ts` - API route
- [x] `app/api/payment/webhook/route.ts` - Webhook handler
- [x] `app/payment/mercadopago/page.tsx` - Página de checkout
- [x] `components/MercadoPagoCheckout.tsx` - Componente React
- [x] `MERCADO_PAGO_SETUP.md` - Documentação setup
- [x] `MERCADO_PAGO_RESUMO.md` - Resumo executivo
- [x] `MERCADO_PAGO_TROUBLESHOOTING.md` - Guia de troubleshooting
- [x] `.env.mercadopago.example` - Template de env vars

## 📝 Modificações Realizadas

- [x] `lib/database/entities/PaymentRequest.ts` - Adicionados campos MP

## 🔧 Próximos Passos Recomendados

### Passo 1: Setup Inicial ⚙️
```bash
# 1. Copiar credenciais para .env.local:
MERCADO_PAGO_ACCESS_TOKEN=TEST-3072028497805407-011717-2b8a29520b325daf8008755bdf8fb47a-2271905770
NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY=TEST-7512e7fb-f568-4459-b631-40615cbe05ef
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# 2. Instalar dependências (se necessário):
npm install axios

# 3. Migrar banco de dados:
npm run typeorm migration:run
# ou
npm run db:migrate
```

### Passo 2: Testes Básicos 🧪
```bash
# 1. Iniciar servidor:
npm run dev

# 2. Abrir em navegador:
# http://localhost:3000/payment/mercadopago

# 3. Testar PIX:
# - Clicar em "PIX/QR Code"
# - Clicar em "Gerar QR Code"
# - Verificar se QR Code aparece

# 4. Testar Cartão:
# - Clicar em "Cartão de Crédito"
# - Preencher com dados de teste
# - Verificar resposta

# 5. Verificar logs:
# - Console do navegador (F12)
# - Terminal do servidor
```

### Passo 3: Integração com Sistema 🔗
```bash
# 1. Atualizar página de pagamento existente:
# app/payment/page.tsx → Incluir MercadoPagoCheckout

# 2. Implementar após pagamento bem-sucedido:
# - Ativar plano do usuário
# - Enviar email de confirmação
# - Redirecionar para dashboard

# 3. Exemplo:
onSuccess={(paymentId) => {
  // 1. Chamar API para ativar plano
  await fetch('/api/user/activate-plan', {
    method: 'POST',
    body: JSON.stringify({ paymentId })
  });
  
  // 2. Mostrar notificação
  toast.success('Plano ativado!');
  
  // 3. Redirecionar
  router.push('/dashboard');
}}
```

### Passo 4: Webhook Setup (Desenvolvimento) 🔌

**Usando Ngrok:**
```bash
# 1. Baixar Ngrok: https://ngrok.com/download

# 2. Executar em novo terminal:
ngrok http 3000

# 3. Copiar URL gerada (ex: https://abc123.ngrok.io)

# 4. Acessar Mercado Pago Dashboard:
# https://www.mercadopago.com.br/developers/panel

# 5. Ir para: Account Settings > Webhooks > Add URL

# 6. Adicionar webhook:
# URL: https://abc123.ngrok.io/api/payment/webhook
# Eventos: 
#   - payment.created
#   - payment.updated
#   - merchant_order.updated

# 7. Testar clicando em "Send test notification"

# 8. Verificar logs do servidor (deve aparecer a notificação)
```

### Passo 5: Validações e Segurança 🔒
```bash
# 1. Implementar validação de webhook:
# Adicionar assinatura HMAC em mercadoPagoService.verifyWebhook()

# 2. Adicionar rate limiting:
# npm install express-rate-limit

# 3. Validar entrada de dados:
# - Verificar se amount é válido
# - Validar CPF/CNPJ
# - Verificar documentos

# 4. Adicionar logs:
# - Registrar todos os pagamentos
# - Registrar webhooks recebidos
# - Registrar erros
```

### Passo 6: Testes E2E 🎯
```bash
# 1. Teste PIX:
# - Iniciar pagamento
# - Verificar QR Code aparece
# - Simular confirmação
# - Verificar status atualiza

# 2. Teste Cartão:
# - Usar cartão de teste APROVADO
# - Verificar sucesso imediato
# - Usar cartão de teste RECUSADO
# - Verificar erro exibido

# 3. Teste Webhook:
# - Usar Ngrok
# - Fazer pagamento
# - Verificar webhook é recebido
# - Verificar status atualiza no BD
```

### Passo 7: Migração para Produção 🚀
```bash
# 1. Obter credenciais de PRODUÇÃO:
# Ir para: https://www.mercadopago.com.br/developers/panel
# API Keys (não TEST-)

# 2. Atualizar variáveis:
MERCADO_PAGO_ACCESS_TOKEN=prod-key-xxx
NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY=prod-key-xxx
NEXT_PUBLIC_BASE_URL=https://seu-dominio.com

# 3. Configurar webhook em PRODUÇÃO:
# URL: https://seu-dominio.com/api/payment/webhook

# 4. Testar com pagamento real (pequeno valor)

# 5. Implementar:
# - Alertas de erro
# - Auditoria de transações
# - Suporte ao cliente
```

---

## 📚 Documentação Consultável

| Arquivo | Propósito |
|---------|-----------|
| `MERCADO_PAGO_SETUP.md` | Guia completo de setup |
| `MERCADO_PAGO_RESUMO.md` | Visão geral da implementação |
| `MERCADO_PAGO_TROUBLESHOOTING.md` | Resolvendo problemas |
| `lib/external-apis/mercadopago.examples.ts` | Exemplos de código |

---

## 🎓 Fluxo Recomendado de Aprendizado

1. Ler `MERCADO_PAGO_RESUMO.md` - Entender o que foi feito
2. Ler `MERCADO_PAGO_SETUP.md` - Configurar ambiente
3. Usar `mercadopago.examples.ts` - Ver exemplos práticos
4. Consultar `MERCADO_PAGO_TROUBLESHOOTING.md` - Se houver problemas
5. Acessar documentação oficial - Para features avançadas

---

## 🔐 Checklist de Segurança Antes de Produção

```markdown
ANTES DE COLOCAR EM PRODUÇÃO, VERIFICAR:

Credenciais:
- [ ] Usando credenciais de PRODUÇÃO (não TEST-)
- [ ] Access Token nunca exposto no frontend
- [ ] Public Key em NEXT_PUBLIC_ (seguro expor)
- [ ] HTTPS ativado no domínio

Validações:
- [ ] Validar entrada de dados (amount, documento, etc)
- [ ] Verificar se pagamento existe antes de atualizar
- [ ] Verificar expiração de tokens

Segurança:
- [ ] Implementar validação de assinatura de webhook
- [ ] Adicionar rate limiting
- [ ] Implementar logs de auditoria
- [ ] Criptografar dados sensíveis

Webhooks:
- [ ] URL de webhook configurada e acessível
- [ ] Webhook recebendo notificações corretamente
- [ ] Status atualiza após webhook

Testes:
- [ ] Testar pagamento com cartão APROVADO
- [ ] Testar pagamento com cartão RECUSADO
- [ ] Testar PIX com QR Code
- [ ] Testar webhook
- [ ] Testar cenário de erro

Monitoramento:
- [ ] Logs de todos os pagamentos
- [ ] Alertas para erros
- [ ] Dashboard de transações
- [ ] Suporte para disputas/chargebacks
```

---

## 📞 Contatos Úteis

**Seu Mercado Pago:**
- Dashboard: https://www.mercadopago.com.br/developers/panel
- Documentação: https://www.mercadopago.com.br/developers
- Status: https://status.mercadopago.com

**Seu Projeto:**
- Servidor: `npm run dev`
- Logs: Console do navegador (F12)
- Banco: Verificar tabela `payment_requests`

---

## 💡 Dicas Úteis

### Debug com Ngrok
```bash
# Monitorar requests em http://localhost:4040
ngrok http 3000 --inspect
```

### Teste de Webhook Manual
```bash
curl -X POST http://localhost:3000/api/payment/webhook \
  -H "Content-Type: application/json" \
  -d '{"type":"payment","data":{"id":123}}'
```

### Verificar Status do Pagamento
```bash
# No console do navegador:
const paymentId = 'uuid-seu-pagamento';
const token = localStorage.getItem('token');
fetch(`/api/payment/mercadopago?id=${paymentId}`, {
  headers: {'Authorization': `Bearer ${token}`}
}).then(r => r.json()).then(console.log);
```

### Limpar Dados de Teste
```sql
-- Deletar pagamentos de teste
DELETE FROM payment_requests WHERE created_at > NOW() - INTERVAL '1 day';
```

---

## ✨ Extras Recomendados

### 1. Implementar Reemissão de Recibos
```typescript
// app/api/payment/receipt/[id]/route.ts
// GET /api/payment/receipt/uuid-payment
// Retorna PDF/Email do recibo
```

### 2. Adicionar Dashboard de Transações
```typescript
// app/dashboard/transactions/page.tsx
// Listar todos os pagamentos do usuário
// Filtrar por status, data, valor
```

### 3. Implementar Reembolsos
```typescript
// app/api/payment/refund/route.ts
// POST com paymentId
// Reembolsar ao usuario
```

### 4. Adicionar Recorrência (Assinatura)
```typescript
// Para planos recorrentes
// Usar subscription API do Mercado Pago
```

---

**Status:** ✅ Implementação Completa
**Data:** 17 de Janeiro de 2026
**Próximo Passo:** Executar Passo 1 do setup ⬆️

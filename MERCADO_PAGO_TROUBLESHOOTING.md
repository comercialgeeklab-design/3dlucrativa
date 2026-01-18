# 🔧 Guia de Troubleshooting - Mercado Pago

## ❌ Problemas Comuns e Soluções

### 1. Erro: "MERCADO_PAGO_ACCESS_TOKEN não configurado"

**Causa:** Variável de ambiente não está definida

**Solução:**
```bash
# 1. Verificar se .env.local existe
ls -la .env.local

# 2. Adicionar as variáveis:
MERCADO_PAGO_ACCESS_TOKEN=TEST-3072028497805407-011717-2b8a29520b325daf8008755bdf8fb47a-2271905770
NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY=TEST-7512e7fb-f568-4459-b631-40615cbe05ef

# 3. Reiniciar o servidor
npm run dev
```

---

### 2. Erro: "TypeError: window.MercadoPago is undefined"

**Causa:** SDK do Mercado Pago não foi carregado

**Solução:**
```tsx
// Verificar no DevTools:
// 1. Console > Network > buscar "sdk.mercadopago.com"
// 2. Deve estar status 200

// 2. Se não carregou, verificar em MercadoPagoCheckout.tsx:
useEffect(() => {
  const script = document.createElement('script');
  script.src = 'https://sdk.mercadopago.com/js/v2'; // ✅ Correto
  // ...
}, []);
```

---

### 3. QR Code PIX não aparece

**Causa:** Resposta da API pode não ter o campo `qrCode`

**Solução:**
```typescript
// Verificar resposta no console:
const response = await fetch('/api/payment/mercadopago', {...});
const data = await response.json();
console.log(data); // Deve ter "qrCode" e "paymentId"

// Se não tiver, verificar no backend:
// - Logs de erro em /api/payment/mercadopago
// - Validar credenciais de Mercado Pago
// - Verificar se API key está correta
```

---

### 4. Erro 401: "Token inválido ou não fornecido"

**Causa:** JWT não está sendo enviado corretamente

**Solução:**
```typescript
// Verificar se token existe:
const token = localStorage.getItem('token');
console.log('Token:', token);

// Verificar se header está correto:
headers: {
  'Authorization': `Bearer ${token}` // ✅ Espaço importante!
}

// Não usar:
// 'Authorization': `Bearer${token}` ❌ Sem espaço

// Verificar expiração do token:
const decoded = jwt_decode(token); // npm install jwt-decode
console.log('Expira em:', new Date(decoded.exp * 1000));
```

---

### 5. Webhook não recebe notificações

**Causa:** URL não está acessível ou não está configurada no Mercado Pago

**Solução:**

**Desenvolvimento Local (com Ngrok):**
```bash
# 1. Instalar Ngrok: https://ngrok.com/download

# 2. Rodar seu servidor Next.js normalmente:
npm run dev

# 3. Em outro terminal, expor a porta:
ngrok http 3000

# 4. Copiar URL gerada (exemplo: https://abc123.ngrok.io)

# 5. Ir para Mercado Pago Dashboard:
# https://www.mercadopago.com.br/developers/panel
# Account Settings > Webhooks > Add URL

# 6. Adicionar:
https://abc123.ngrok.io/api/payment/webhook

# 7. Selecionar eventos:
# - payment.created
# - payment.updated
# - merchant_order.updated

# 8. Testar clicando em "Test Notification"
```

**Produção:**
```bash
# URL deve ser acessível:
https://seu-dominio.com/api/payment/webhook

# Verificar em navegador se retorna:
# {"status":"ok","message":"Webhook endpoint está ativo"}
```

---

### 6. Pagamento rejeitado sem razão clara

**Causa:** Pode ser validação do Mercado Pago

**Solução:**
```typescript
// Verificar resposta detalhada no console:
const data = await response.json();
console.log(data.details); // Mensagem de erro do MP

// Causas comuns:
// - Cartão expirado
// - Dados do titular incorretos
// - CVV inválido
// - Limite de crédito excedido
// - Cartão bloqueado pelo banco

// Para testes, usar cartões específicos:
// Aprovado: 4111 1111 1111 1111
// Recusado: 5555 5555 5555 4444
```

---

### 7. Banco de Dados - Campo não encontrado

**Causa:** Migrations não foram executadas

**Solução:**
```bash
# Se usando TypeORM:
npm run typeorm migration:run

# Se usando outro ORM, adaptar o comando

# Verificar se campos existem na tabela payment_requests:
# - mercadoPagoPaymentId
# - mercadoPagoQrCodeUrl
# - mercadoPagoQrCodeData
# - mercadoPagoPaymentMethod
# - mercadoPagoMetadata
```

---

### 8. Erro ao criar token de cartão (Cartão)

**Causa:** SDK do Mercado Pago não inicializado corretamente

**Solução:**
```typescript
// Verificar se Public Key está configurada:
if (!process.env.NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY) {
  throw new Error('NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY não configurada');
}

// Inicializar SDK:
useEffect(() => {
  if (window.MercadoPago) {
    window.MercadoPago.setPublishableKey(
      process.env.NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY
    );
  }
}, []);

// Para produção, implementar CardForm completo:
// https://www.mercadopago.com.br/developers/pt/guides/web-checkout/tokenization
```

---

### 9. Polling de status não funciona

**Causa:** Intervalo de polling muito longo ou endpoint com erro

**Solução:**
```typescript
// Verificar endpoint:
GET /api/payment/mercadopago?id=uuid-do-pagamento

// Deve retornar:
{
  "id": "uuid",
  "status": "pending|approved|rejected",
  "amount": 0.01,
  "method": "pix|credit_card",
  "createdAt": "2026-01-17T...",
  "mercadoPagoId": "12345678"
}

// Se não funcionar, verificar:
// - UUID do pagamento está correto?
// - Existe no banco de dados?
// - Token JWT é válido?

// Aumentar frequência de polling (padrão: 5s):
setTimeout(checkStatus, 2000); // 2 segundos (mais frequente)
```

---

### 10. Erro de CORS

**Causa:** Request do frontend bloqueado por CORS

**Solução:**
```typescript
// Se estiver em ambiente de teste, headers já devem estar configurados
// Se receber erro CORS, verificar:

// 1. Requisições devem ser para o mesmo domínio (same-origin)
// ✅ /api/payment/mercadopago (relativo, mesmo domínio)
// ❌ https://api.mercadopago.com/v1/... (origin diferente)

// 2. API calls para Mercado Pago devem ser no backend:
// ✅ Backend chama API MP (sem CORS)
// ❌ Frontend chama API MP direto (CORS)

// 3. Se precisar chamar API MP do frontend, usar proxy:
// /api/proxy/mercadopago/... → /api/payment/mercadopago
```

---

### 11. Problema: Pagamento não atualiza no BD após webhook

**Causa:** Webhook não está sendo recebido ou processado com erro

**Solução:**
```bash
# 1. Verificar logs do servidor:
# Procurar por "Webhook do Mercado Pago recebido:"
# No arquivo de logs ou console

# 2. Testar webhook manualmente:
curl -X POST http://localhost:3000/api/payment/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "type": "payment",
    "data": {"id": 12345678}
  }'

# 3. Resposta deve ser:
# {"success": true, "message": "..."}

# 4. Se falhar, verificar:
# - ID do pagamento (data.id) é válido?
# - Pagamento existe no BD?
# - JWT_SECRET está configurado?

# 5. Ativar logs no serviço MP:
// Em mercadopago.ts
console.log('Webhook data:', body);
console.log('Payment found:', payment);
console.log('Status mapped:', newStatus);
```

---

### 12. Problema: Credenciais inválidas

**Causa:** Access Token ou Public Key incorretos/expirados

**Solução:**
```bash
# 1. Verificar credenciais em:
# https://www.mercadopago.com.br/developers/panel
# Account Settings > API Keys

# 2. Copiar corretamente (sem espaços):
# ✅ TEST-3072028497805407-011717-2b8a29520b325daf8008755bdf8fb47a-2271905770
# ❌ TEST-3072028497805407-011717-2b8a29520b325daf8008755bdf8fb47a-2271905770 

# 3. Verificar se está em modo TESTE:
# - Chave começa com "TEST-" = Modo Teste ✅
# - Chave não começa com "TEST-" = Modo Produção ❌ (para testes)

# 4. Se ainda não funcionar, gerar nova chave:
# Menu > API Keys > Regenerate
```

---

### 13. Problema: Estado do pagamento fica "pending" para sempre

**Causa:** Webhook não está atualizado ou payload incorreto

**Solução:**
```typescript
// 1. Tentar atualizar manualmente via GET:
GET /api/payment/mercadopago?id=uuid-payment

// Se status não atualizar mesmo após webhook:

// 2. Chamar Mercado Pago direto para verificar status real:
// No serviço: mercadoPagoService.getPayment(mercadoPagoId)

// 3. Implementar "refresh manual" no frontend:
<button onClick={() => {
  fetch(`/api/payment/mercadopago?id=${paymentId}`)
    .then(r => r.json())
    .then(data => setStatus(data.status));
}}>
  Atualizar Status
</button>

// 4. Aumentar timeout de polling:
// Padrão: 5 minutos (300s)
// Aumentar para: 10-15 minutos para pagamentos PIX
```

---

### 14. Problema: Erro ao criar banco de dados / Migration

**Causa:** TypeORM não conseguiu sincronizar schema

**Solução:**
```bash
# 1. Verificar conexão com banco:
# - PostgreSQL está rodando?
# - Credenciais corretas?
# - Banco existe?

# 2. Se banco não existe:
# Criar manualmente em seu SGBD
# CREATE DATABASE "3dlucrativa";

# 3. Executar migrations:
npm run typeorm migration:generate -- -n AddMercadoPagoFields
npm run typeorm migration:run

# 4. Se usar sincronize: true em data-source.ts:
// entities: [...],
// synchronize: true, // ✅ Auto-sync (desenvolvimento)

# 5. Verificar entidade PaymentRequest.ts foi atualizada
```

---

### 15. Problema: Performance - Muitas requisições ao banco

**Causa:** Polling muito frequente

**Solução:**
```typescript
// Aumentar intervalo de polling:
const CHECK_INTERVAL = 5000; // 5 segundos
setTimeout(checkStatus, CHECK_INTERVAL);

// Parar após tempo máximo:
const MAX_ATTEMPTS = 60; // 5 minutos
const TIMEOUT = 60 * 60 * 1000; // 1 hora

// Implementar cache no frontend:
const [statusCache, setStatusCache] = useState({});
if (statusCache[paymentId]) {
  return statusCache[paymentId];
}

// Usar SWR ou React Query para melhor gerenciamento:
import useSWR from 'swr';
const { data } = useSWR(`/api/payment/${paymentId}`, fetcher, {
  refreshInterval: 5000, // Auto-refresh a cada 5s
  revalidateOnFocus: false,
});
```

---

## 📞 Contato e Recursos

- **Documentação**: https://www.mercadopago.com.br/developers
- **Status Page**: https://status.mercadopago.com
- **Community**: https://stackoverflow.com/questions/tagged/mercadopago

---

## ✅ Checklist de Verificação

```markdown
Antes de achar que há um bug:

- [ ] Variáveis de ambiente estão configuradas?
- [ ] Servidor foi reiniciado após adicionar env vars?
- [ ] Token JWT é válido e não expirou?
- [ ] URL do webhook é acessível (usando Ngrok em dev)?
- [ ] Cartão de teste está correto?
- [ ] Mercado Pago está em modo TESTE (chave começa com TEST-)?
- [ ] Banco de dados foi migrado?
- [ ] Console do navegador tem algum erro?
- [ ] Logs do servidor têm mensagens de erro?
- [ ] Public Key está no NEXT_PUBLIC_ env var?
- [ ] Access Token nunca está exposto no frontend?
```

---

**Última atualização:** 17 de Janeiro de 2026

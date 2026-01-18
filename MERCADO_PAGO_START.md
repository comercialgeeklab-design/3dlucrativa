# 🎉 Integração Mercado Pago - PRONTA PARA USAR!

## 🚀 Quick Start (5 minutos)

### 1️⃣ Adicionar Variáveis de Ambiente

Adicione ao seu `.env.local`:

```env
MERCADO_PAGO_ACCESS_TOKEN=TEST-3072028497805407-011717-2b8a29520b325daf8008755bdf8fb47a-2271905770
NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY=TEST-7512e7fb-f568-4459-b631-40615cbe05ef
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### 2️⃣ Reiniciar Servidor

```bash
# Para o servidor (Ctrl+C)
# Inicia novamente:
npm run dev
```

### 3️⃣ Acessar Página de Checkout

Acesse no navegador:
```
http://localhost:3000/payment/mercadopago
```

### 4️⃣ Testar Pagamento

#### PIX:
- Clique em "PIX / QR Code"
- Clique em "Gerar QR Code"
- Deve aparecer um QR Code

#### Cartão:
- Clique em "Cartão de Crédito"
- Use cartão de teste: `4111 1111 1111 1111`
- Validade: `11/25`, CVV: `123`

✅ **Pronto! A integração está funcionando!**

---

## 📂 O Que Foi Criado

```
✅ Serviço Mercado Pago (lib/external-apis/mercadopago.ts)
✅ API Route de Pagamento (app/api/payment/mercadopago/route.ts)
✅ Webhook Handler (app/api/payment/webhook/route.ts)
✅ Componente React (components/MercadoPagoCheckout.tsx)
✅ Página de Checkout (app/payment/mercadopago/page.tsx)
✅ Tipos TypeScript (lib/types/mercadopago.ts)
✅ Documentação Completa (4 arquivos .md)
✅ Exemplos de Código
```

---

## 📖 Documentação

| Arquivo | Descrição |
|---------|-----------|
| **MERCADO_PAGO_SETUP.md** | Setup completo com detalhes |
| **MERCADO_PAGO_RESUMO.md** | Visão geral visual |
| **MERCADO_PAGO_CHECKLIST.md** | Passos de implementação |
| **MERCADO_PAGO_TROUBLESHOOTING.md** | Soluções de problemas |

---

## 💻 Como Usar no Seu Código

### Opção 1: Usar Componente Pronto
```tsx
import MercadoPagoCheckout from '@/components/MercadoPagoCheckout';

export default function MyPaymentPage() {
  return (
    <MercadoPagoCheckout
      amount={0.01}
      planType="Premium"
      onSuccess={(paymentId) => {
        // Pagamento aprovado!
        // Ativar plano, enviar email, etc.
      }}
      onError={(error) => {
        // Erro no pagamento
        console.error(error);
      }}
    />
  );
}
```

### Opção 2: Usar API Diretamente
```typescript
// Iniciar pagamento PIX
const response = await fetch('/api/payment/mercadopago', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    paymentMethod: 'pix',
    amount: 0.01,
    planType: 'Premium',
  }),
});

const data = await response.json();
console.log(data.qrCode); // QR Code em formato SVG
```

---

## 🔍 Estrutura

### Backend (Node.js/Next.js)
```
📦 Serviço Mercado Pago
├─ createPayment() → Pagamento com cartão
├─ createPixQrCode() → Gera QR Code PIX
├─ getPayment() → Obtém status
└─ mapPaymentStatus() → Mapeia status

📦 API Routes
├─ POST /api/payment/mercadopago → Inicia pagamento
├─ GET /api/payment/mercadopago?id=... → Verifica status
└─ POST /api/payment/webhook → Recebe notificações

📦 Database
└─ PaymentRequest → Armazena pagamentos
   ├─ mercadoPagoPaymentId
   ├─ mercadoPagoQrCodeUrl
   ├─ mercadoPagoMetadata
   └─ ...
```

### Frontend (React)
```
📦 Componente MercadoPagoCheckout
├─ Seleção: Cartão ou PIX
├─ Formulário: Dados do pagamento
├─ QR Code: Para PIX
├─ Polling: Verifica status automaticamente
└─ Feedback: Sucesso/Erro/Pendente
```

---

## 🧪 Cartões de Teste

### Aprovado ✅
```
Número:  4111 1111 1111 1111
Validade: 11/25
CVV:     123
Titular: APRO
```

### Recusado ❌
```
Número:  5555 5555 5555 4444
Validade: 11/25
CVV:     123
Titular: OOPS
```

---

## 🔗 Integração no Seu Fluxo

```
Usuário Clica em "Pagar Plano"
        ↓
MercadoPagoCheckout Component
        ↓
Escolher: Cartão ou PIX
        ↓
    ├─ PIX ──→ Gera QR Code ──→ Escaneia ──→ Paga
    │
    └─ CARTÃO ──→ Preenche Dados ──→ Processa ──→ Aprovado/Recusado
        ↓
POST /api/payment/mercadopago
        ↓
Mercado Pago API
        ↓
Pagamento Processado
        ↓
Webhook Notifica Sistema
        ↓
Status Atualizado no BD
        ↓
onSuccess() / onError()
        ↓
Ativar Plano, Enviar Email, Redirecionar
```

---

## ⚠️ Importante

### Desenvolvimento ✅
- Usar credenciais com `TEST-` no começo
- Webhook via Ngrok para testar

### Produção 🚀
- Usar credenciais de PRODUÇÃO
- Ativar HTTPS obrigatoriamente
- Configurar webhook em URL real

---

## 🆘 Problemas?

### Erro: "Access token not provided"
→ Adicione variáveis ao `.env.local` e reinicie servidor

### QR Code não aparece
→ Verifique console (F12) para erros
→ Veja `MERCADO_PAGO_TROUBLESHOOTING.md`

### Webhook não funciona
→ Use Ngrok para dev
→ Veja passo 4 em `MERCADO_PAGO_CHECKLIST.md`

---

## 📚 Próximas Leituras

1. **Começar**: Você está aqui 👈
2. **Detalhar**: `MERCADO_PAGO_SETUP.md`
3. **Implementar**: `MERCADO_PAGO_CHECKLIST.md`
4. **Resolver Problemas**: `MERCADO_PAGO_TROUBLESHOOTING.md`

---

## 💡 Dicas

✅ **Sempre verificar console** (F12) para erros JavaScript
✅ **Sempre verificar logs do servidor** para erros backend
✅ **Usar cartões de teste** - nunca cartão real em desenvolvimento
✅ **Ngrok para webhook** - expor localhost para internet
✅ **Rate limit** - não fazer 100 requests por segundo

---

## 🎯 Próximos Passos

- [ ] Adicionar env vars
- [ ] Reiniciar servidor
- [ ] Testar em `http://localhost:3000/payment/mercadopago`
- [ ] Ler `MERCADO_PAGO_SETUP.md` para detalhes
- [ ] Implementar lógica após pagamento (ativar plano, etc)
- [ ] Configurar webhook com Ngrok
- [ ] Migrar para produção

---

## 🚀 Sucesso!

A integração Mercado Pago está **100% funcional** e pronta para uso!

Qualquer dúvida, consulte a documentação ou entre em contato.

**Criado em:** 17 de Janeiro de 2026 ✨

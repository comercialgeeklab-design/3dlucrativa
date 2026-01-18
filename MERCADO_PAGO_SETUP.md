# Integração Mercado Pago - Guia de Implementação

## 📋 Dados de Integração

**Suas credenciais de TESTE:**
```
Public Key:    TEST-7512e7fb-f568-4459-b631-40615cbe05ef
Access Token:  TEST-3072028497805407-011717-2b8a29520b325daf8008755bdf8fb47a-2271905770
```

## 🔧 Configuração

### 1. Variáveis de Ambiente

Adicionar ao arquivo `.env.local`:

```env
# Mercado Pago
MERCADO_PAGO_ACCESS_TOKEN=TEST-3072028497805407-011717-2b8a29520b325daf8008755bdf8fb47a-2271905770
NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY=TEST-7512e7fb-f568-4459-b631-40615cbe05ef
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### 2. Dependências Necessárias

Certifique-se que o `axios` está instalado:

```bash
npm install axios
```

## 🚀 Componentes Criados

### 1. **Serviço Mercado Pago** (`lib/external-apis/mercadopago.ts`)
- Classe `MercadoPagoService` com métodos para:
  - Criar pagamentos (cartão de crédito)
  - Criar preferências de checkout
  - Gerar QR Codes PIX
  - Obter status de pagamentos
  - Mapear status entre Mercado Pago e sistema interno

### 2. **API Routes**

#### `/api/payment/mercadopago` (POST/GET)
- **POST**: Inicia um pagamento (cartão ou PIX)
  - Requer: `Authorization` header com JWT
  - Body: `{ paymentMethod, amount, cardToken?, cardHolderName?, ... }`
  - Response: Detalhes do pagamento ou QR Code

- **GET**: Obtém status de um pagamento
  - Requer: `Authorization` header e `id` como query param
  - Response: Status, valor, método, etc.

#### `/api/payment/webhook` (POST/GET)
- **POST**: Recebe notificações do Mercado Pago
  - Atualiza status dos pagamentos automaticamente
  - Processa webhooks de `payment` e `merchant_order`

- **GET**: Verifica saúde do webhook

### 3. **Componente Checkout** (`components/MercadoPagoCheckout.tsx`)
- Componente React com UI completa
- Suporte para:
  - Pagamento com cartão de crédito
  - PIX com QR Code
  - Polling automático para atualizar status
  - Feedback visual de sucesso/erro

### 4. **Banco de Dados**
Campos adicionados à entidade `PaymentRequest`:
```typescript
mercadoPagoPaymentId?: string;        // ID do pagamento no MP
mercadoPagoPreferenceId?: string;     // ID da preferência (checkout)
mercadoPagoQrCodeUrl?: string;        // URL do QR Code PIX
mercadoPagoQrCodeData?: string;       // Dados do QR Code PIX
mercadoPagoPaymentMethod?: string;    // Método de pagamento
mercadoPagoMetadata?: any;            // Metadados adicionais
```

## 📱 Usando o Componente

```tsx
import MercadoPagoCheckout from '@/components/MercadoPagoCheckout';

export default function MyPage() {
  return (
    <MercadoPagoCheckout
      amount={0.01}
      planType="Intermediário"
      onSuccess={(paymentId) => {
        console.log('Pagamento aprovado:', paymentId);
        // Redirecionar, ativar plano, etc.
      }}
      onError={(error) => {
        console.error('Erro:', error);
      }}
    />
  );
}
```

## 🔌 Webhook Setup

Para ativar os webhooks no Mercado Pago:

1. Ir para: https://www.mercadopago.com.br/developers/panel
2. Account Settings → Webhooks
3. Adicionar URL:
   ```
   https://seu-dominio.com/api/payment/webhook
   ```
4. Selecionar eventos:
   - `payment.created`
   - `payment.updated`
   - `merchant_order.updated`

## 🧪 Testando Localmente

Para testar webhooks em desenvolvimento, use o Ngrok:

```bash
# Instalar ngrok: https://ngrok.com/download
ngrok http 3000

# Usar a URL pública gerada para configurar o webhook
```

## 💳 Cartões de Teste

### Cartões de Crédito (Aprovado)
```
Número:  4111 1111 1111 1111
Validade: 11/25
CVV:     123
Titular:  APRO
```

### Cartões de Crédito (Recusado)
```
Número:  5555 5555 5555 4444
Validade: 11/25
CVV:     123
Titular:  OOPS
```

## 🔐 Segurança

### ⚠️ Importante para Produção:

1. **Nunca** exponha o `Access Token` no frontend
2. Usar `NEXT_PUBLIC_` apenas para `PUBLIC_KEY`
3. Todo processamento de cartão deve ser via Mercado Pago SDK
4. Validar webhooks com assinatura (implementar em `mercadoPagoService.verifyWebhook()`)
5. Usar HTTPS obrigatoriamente
6. Implementar rate limiting nas rotas de API
7. Auditar todos os pagamentos

### Fluxo de Segurança Recomendado:

```
Frontend (MercadoPago SDK)
    ↓
    Create Token (com Public Key)
    ↓
Backend API (com Access Token)
    ↓
    Process Payment
    ↓
Mercado Pago
    ↓
    Webhook Notification
    ↓
Atualizar BD
```

## 📊 Status de Pagamento

Mapeamento automático:
- MP `pending` → Sistema `pending`
- MP `approved` → Sistema `approved`
- MP `authorized` → Sistema `approved`
- MP `in_process` → Sistema `pending`
- MP `rejected` → Sistema `rejected`
- MP `cancelled` → Sistema `rejected`

## 🎯 Próximas Etapas

1. **[ ]** Configurar variáveis de ambiente
2. **[ ]** Testar cartão de crédito
3. **[ ]** Testar QR Code PIX
4. **[ ]** Configurar webhooks
5. **[ ]** Implementar lógica de ativação de plano após pagamento
6. **[ ]** Adicionar validação de assinatura de webhook
7. **[ ]** Testes E2E
8. **[ ]** Migrar para credenciais de produção quando pronto

## 📚 Documentação Oficial

- [Mercado Pago Developers](https://www.mercadopago.com.br/developers)
- [API Reference](https://www.mercadopago.com.br/developers/pt/reference)
- [SDKs](https://www.mercadopago.com.br/developers/pt/sdks)
- [Teste de Cartões](https://www.mercadopago.com.br/developers/pt/guides/additional-content/your-integrations/test-cards)

## 🆘 Troubleshooting

**Erro: "MERCADO_PAGO_ACCESS_TOKEN não configurado"**
- Verificar se variável está em `.env.local`
- Reiniciar o servidor Next.js após adicionar env vars

**QR Code não aparece**
- Verificar se o SDK do Mercado Pago foi carregado
- Checar console do navegador para erros

**Webhook não recebe notificações**
- Usar Ngrok para testar localmente
- Verificar URL do webhook está acessível
- Ativar eventos corretos no painel do Mercado Pago

---

Qualquer dúvida, me chama! 🚀

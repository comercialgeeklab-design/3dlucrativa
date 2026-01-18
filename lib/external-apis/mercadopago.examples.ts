/**
 * Exemplos e testes para a integração Mercado Pago
 * Este arquivo demonstra como usar a API de pagamento
 */

// ============================================================
// 1. TESTE: Iniciar Pagamento com PIX
// ============================================================
async function testPixPayment() {
  const token = localStorage.getItem('token');

  const response = await fetch('/api/payment/mercadopago', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      paymentMethod: 'pix',
      amount: 0.01,
      planType: 'Intermediário',
    }),
  });

  const data = await response.json();
  console.log('PIX Payment Response:', data);
  // Response:
  // {
  //   success: true,
  //   paymentId: "uuid-xxx",
  //   method: "pix",
  //   qrCode: "svg/base64",
  //   amount: 49.90,
  //   message: "QR Code PIX gerado com sucesso"
  // }

  return data;
}

// ============================================================
// 2. TESTE: Iniciar Pagamento com Cartão
// ============================================================
async function testCreditCardPayment() {
  const token = localStorage.getItem('token');

  // Simular tokenização de cartão via Mercado Pago SDK
  // Em produção: const cardToken = await window.MercadoPago.createCardToken({...})

  const response = await fetch('/api/payment/mercadopago', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      paymentMethod: 'credit_card',
      amount: 0.02,
      planType: 'Avançado',
      cardToken: 'token-xxx-from-mp-sdk',
      cardHolderName: 'João Silva',
      cardHolderEmail: 'joao@example.com',
      cardHolderDocument: '12345678900',
    }),
  });

  const data = await response.json();
  console.log('Credit Card Payment Response:', data);
  // Response:
  // {
  //   success: true,
  //   paymentId: "uuid-xxx",
  //   mercadoPagoId: "12345678",
  //   status: "approved",
  //   method: "credit_card",
  //   amount: 0.02,
  //   message: "Pagamento aprovado com sucesso!"
  // }

  return data;
}

// ============================================================
// 3. TESTE: Verificar Status do Pagamento
// ============================================================
async function testGetPaymentStatus(paymentId: string) {
  const token = localStorage.getItem('token');

  const response = await fetch(`/api/payment/mercadopago?id=${paymentId}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  const data = await response.json();
  console.log('Payment Status:', data);
  // Response:
  // {
  //   id: "uuid-xxx",
  //   status: "approved|pending|rejected",
  //   amount: 0.01,
  //   method: "credit_card|pix",
  //   createdAt: "2026-01-17T...",
  //   mercadoPagoId: "12345678",
  //   qrCode: "svg/base64" (apenas para PIX)
  // }

  return data;
}

// ============================================================
// 4. TESTE: Simular Webhook do Mercado Pago
// ============================================================
async function testWebhookSimulation() {
  // Simular uma notificação de pagamento aprovado do Mercado Pago
  const webhookPayload = {
    id: 'webhook-id-xxx',
    type: 'payment',
    data: {
      id: 12345678, // ID do pagamento no Mercado Pago
    },
    action: 'payment.created',
  };

  // Em desenvolvimento, você pode chamar assim:
  const response = await fetch('/api/payment/webhook', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(webhookPayload),
  });

  const data = await response.json();
  console.log('Webhook Response:', data);
  // Response:
  // {
  //   success: true,
  //   message: "Pagamento processado com sucesso",
  //   paymentId: "uuid-xxx",
  //   status: "approved"
  // }

  return data;
}

// ============================================================
// 5. TESTE: Cartões de Teste (Mercado Pago)
// ============================================================

const TEST_CARDS = {
  // Cartão APROVADO
  APPROVED: {
    number: '4111 1111 1111 1111',
    expiration: '11/25',
    cvv: '123',
    holderName: 'APRO',
    document: '12345678900',
  },

  // Cartão RECUSADO
  REJECTED: {
    number: '5555 5555 5555 4444',
    expiration: '11/25',
    cvv: '123',
    holderName: 'OOPS',
    document: '12345678900',
  },

  // Cartão PENDENTE
  PENDING: {
    number: '4009 1234 5678 9010',
    expiration: '11/25',
    cvv: '123',
    holderName: 'TEST',
    document: '12345678900',
  },
};

// ============================================================
// 6. EXEMPLO: Integração no Componente
// ============================================================
/*
import MercadoPagoCheckout from '@/components/MercadoPagoCheckout';

export default function CheckoutPage() {
  return (
    <MercadoPagoCheckout
      amount={0.01}
      planType="Intermediário"
      onSuccess={(paymentId) => {
        console.log('Pagamento bem-sucedido:', paymentId);
        // Redirecionar para confirmação, ativar plano, etc.
      }}
      onError={(error) => {
        console.error('Erro no pagamento:', error);
        // Mostrar mensagem de erro ao usuário
      }}
    />
  );
}
*/

// ============================================================
// 7. EXEMPLO: Fluxo Completo no Backend
// ============================================================
/*
// 1. Usuário inicia checkout
POST /api/payment/mercadopago
{
  "paymentMethod": "pix",
  "amount": 0.01,
  "planType": "Intermediário"
}

// 2. Retorna QR Code para escanear
Response:
{
  "paymentId": "uuid-xxx",
  "qrCode": "data:image/svg+xml;...",
  "method": "pix"
}

// 3. Usuário escaneia e paga no app do banco/Mercado Pago

// 4. Mercado Pago envia webhook
POST /api/payment/webhook
{
  "type": "payment",
  "data": {"id": 12345678}
}

// 5. Sistema atualiza status do pagamento no BD
// 6. Webhook dispara eventos (email, ativar plano, etc.)

// 7. Frontend pode verificar status periodicamente
GET /api/payment/mercadopago?id=uuid-xxx
*/

// ============================================================
// 8. TESTES COM CURL (para desenvolvimento)
// ============================================================
/*

# PIX Payment
curl -X POST http://localhost:3000/api/payment/mercadopago \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer seu-token-jwt" \
  -d '{
    "paymentMethod": "pix",
    "amount": 0.01,
    "planType": "Intermediário"
  }'

# Get Status
curl http://localhost:3000/api/payment/mercadopago?id=uuid-xxx \
  -H "Authorization: Bearer seu-token-jwt"

# Webhook Test
curl -X POST http://localhost:3000/api/payment/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "type": "payment",
    "data": {"id": 12345678}
  }'

*/

// ============================================================
// 9. Estrutura do Banco de Dados (PaymentRequest)
// ============================================================
/*

Entity: PaymentRequest {
  id: string (uuid)
  userId: string (uuid)
  
  // Dados básicos
  paymentMethod: 'credit_card' | 'pix'
  amount: decimal
  status: 'pending' | 'approved' | 'rejected'
  
  // Cartão de crédito
  cardHolderName?: string
  cardNumber?: string (últimos 4 dígitos)
  cardExpiry?: string
  cardCvv?: string (nunca armazenar!)
  
  // PIX
  pixKey?: string
  pixQrCode?: string (SVG ou URL)
  
  // Mercado Pago
  mercadoPagoPaymentId?: string
  mercadoPagoPreferenceId?: string
  mercadoPagoQrCodeUrl?: string
  mercadoPagoQrCodeData?: string
  mercadoPagoPaymentMethod?: string
  mercadoPagoMetadata?: object
  
  // Timestamps
  createdAt: Date
  updatedAt: Date
}

*/

export {
  testPixPayment,
  testCreditCardPayment,
  testGetPaymentStatus,
  testWebhookSimulation,
  TEST_CARDS,
};

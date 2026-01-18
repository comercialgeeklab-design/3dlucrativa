/**
 * Tipos TypeScript para integração com Mercado Pago
 */

export enum MercadoPagoPaymentStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  AUTHORIZED = 'authorized',
  IN_PROCESS = 'in_process',
  IN_MEDIATION = 'in_mediation',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
  CHARGED_BACK = 'charged_back',
}

export enum MercadoPagoPaymentMethod {
  CREDIT_CARD = 'credit_card',
  DEBIT_CARD = 'debit_card',
  ACCOUNT_MONEY = 'account_money',
  VOUCHER = 'voucher',
  PIX = 'pix',
  BOLBRADESCO = 'bolbradesco',
  WIRED_TRANSFER = 'wired_transfer',
}

export interface MercadoPagoPaymentResponse {
  id: number;
  status: MercadoPagoPaymentStatus;
  status_detail: string;
  currency_id: string;
  description: string;
  live_mode: boolean;
  created_at: string;
  approved_at: string | null;
  authorization_code: string | null;
  money_release_date: string | null;
  collector_id: number;
  payer: {
    id: string;
    email: string;
    identification: {
      number: string;
      type: string;
    };
    first_name?: string;
    last_name?: string;
  };
  payment_method: {
    id: MercadoPagoPaymentMethod;
    type: string;
    issuer_id?: string;
  };
  card?: {
    id: string;
    last_four_digits: string;
    first_six_digits: string;
    expiration_month: number;
    expiration_year: number;
    cardholder: {
      name: string;
      identification: {
        number: string;
        type: string;
      };
    };
  };
  transaction_details?: {
    net_received_amount: number;
    total_paid_amount: number;
    overpaid_amount: number;
    external_resource_url: string | null;
    acquirer_reconciliation: any[];
  };
  installments?: number;
  transaction_amount: number;
  amount_refunded: number;
  coupon?: {
    id: string;
    percent_off?: number;
    amount_off?: number;
  };
  differential_pricing_id?: string;
  external_reference: string;
  statement_descriptor: string | null;
  additional_info?: {
    ip_address?: string;
    user_agent?: string;
  };
  metadata?: Record<string, any>;
}

export interface MercadoPagoWebhookNotification {
  id: string;
  live_mode: boolean;
  type: 'payment' | 'merchant_order' | 'plan' | 'subscription' | 'invoice';
  date_created: string;
  user_id?: string;
  resource?: {
    id: string;
    url: string;
  };
  data?: {
    id: string;
    [key: string]: any;
  };
  action?: string;
}

export interface MercadoPagoQRCodeResponse {
  id: string;
  store_id: string;
  pos_id?: string;
  items: Array<{
    sku_number: string;
    category: string;
    description: string;
    unit_price: number;
    quantity: number;
    unit_measure: string;
    total_amount: number;
  }>;
  qr_data: string; // SVG ou base64 do QR Code
  created_at: string;
  updated_at: string;
  [key: string]: any;
}

export interface PaymentCheckoutPayload {
  paymentMethod: 'credit_card' | 'pix';
  amount: number;
  planType?: string;
  cardToken?: string;
  cardHolderName?: string;
  cardHolderEmail?: string;
  cardHolderDocument?: string;
}

export interface PaymentStatusResponse {
  id: string;
  status: 'pending' | 'approved' | 'rejected';
  amount: number;
  method: 'credit_card' | 'pix';
  createdAt: string;
  mercadoPagoId?: string;
  qrCode?: string;
}

export interface WebhookVerificationData {
  id: string;
  signature: string;
  timestamp: string;
  secret: string;
}

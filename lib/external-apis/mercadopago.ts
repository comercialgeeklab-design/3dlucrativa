import axios from 'axios';

const API_BASE_URL = 'https://api.mercadopago.com/v1';
const ACCESS_TOKEN = process.env.MERCADO_PAGO_ACCESS_TOKEN;

export interface MercadoPagoPaymentData {
  transaction_amount: number;
  payment_method_id: string;
  payer: {
    email: string;
    first_name: string;
    last_name: string;
    identification: {
      type: string;
      number: string;
    };
  };
  description: string;
  external_reference: string;
  installments?: number;
  token?: string; // Para cartão de crédito tokenizado
}

export interface MercadoPagoPreferenceData {
  items: Array<{
    id: string;
    title: string;
    quantity: number;
    unit_price: number;
  }>;
  payer: {
    email: string;
    name: string;
  };
  back_urls: {
    success: string;
    failure: string;
    pending: string;
  };
  notification_url: string;
  external_reference: string;
  auto_return: 'approved' | 'all';
}

export class MercadoPagoService {
  private accessToken: string;

  constructor() {
    if (!ACCESS_TOKEN) {
      throw new Error('MERCADO_PAGO_ACCESS_TOKEN não configurado');
    }
    this.accessToken = ACCESS_TOKEN;
  }

  /**
   * Cria um pagamento direto com cartão de crédito
   */
  async createPayment(data: MercadoPagoPaymentData) {
    try {
      const response = await axios.post(`${API_BASE_URL}/payments`, data, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      return response.data;
    } catch (error: any) {
      console.error('Erro ao criar pagamento:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Cria uma preferência de pagamento (checkout com múltiplas opções)
   */
  async createPreference(data: MercadoPagoPreferenceData) {
    try {
      const response = await axios.post(`${API_BASE_URL}/checkout/preferences`, data, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      return response.data;
    } catch (error: any) {
      console.error('Erro ao criar preferência:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Obtém informações de um pagamento
   */
  async getPayment(paymentId: string) {
    try {
      const response = await axios.get(`${API_BASE_URL}/payments/${paymentId}`, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
        },
      });

      return response.data;
    } catch (error: any) {
      console.error('Erro ao obter pagamento:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Obtém informações de uma preferência
   */
  async getPreference(preferenceId: string) {
    try {
      const response = await axios.get(`${API_BASE_URL}/checkout/preferences/${preferenceId}`, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
        },
      });

      return response.data;
    } catch (error: any) {
      console.error('Erro ao obter preferência:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Cria um QR Code para PIX
   */
  async createPixQrCode(amount: number, externalReference: string, description: string) {
    try {
      // Criar pagamento via PIX através da API de pagamentos
      const response = await axios.post(
        `${API_BASE_URL}/payments`,
        {
          transaction_amount: amount,
          description: description,
          payment_method_id: 'pix',
          external_reference: externalReference,
          payer: {
            email: 'test@test.com',
          },
        },
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
            'X-Idempotency-Key': `${externalReference}-${Date.now()}`,
          },
        }
      );

      // Retornar dados do QR code
      const qrCode = response.data.point_of_interaction?.transaction_data?.qr_code || '';
      const qrCodeBase64 = response.data.point_of_interaction?.transaction_data?.qr_code_base64 || '';
      
      return {
        qr_data: qrCode,
        qr_code: qrCode,
        qr_code_base64: qrCodeBase64,
        ticket_url: response.data.point_of_interaction?.transaction_data?.ticket_url || '',
        payment_id: response.data.id,
        status: response.data.status,
      };
    } catch (error: any) {
      console.error('Erro ao gerar QR Code PIX:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Valida um webhook do Mercado Pago
   */
  verifyWebhook(data: any, signature: string, secret: string): boolean {
    // TODO: Implementar validação de assinatura do webhook
    return true;
  }

  /**
   * Mapeia status do Mercado Pago para status interno
   */
  mapPaymentStatus(mercadoPagoStatus: string): 'pending' | 'approved' | 'rejected' {
    const statusMap: Record<string, 'pending' | 'approved' | 'rejected'> = {
      'pending': 'pending',
      'approved': 'approved',
      'authorized': 'approved',
      'in_process': 'pending',
      'in_mediation': 'pending',
      'rejected': 'rejected',
      'cancelled': 'rejected',
      'refunded': 'rejected',
      'charged_back': 'rejected',
    };

    return statusMap[mercadoPagoStatus] || 'pending';
  }
}

export default new MercadoPagoService();

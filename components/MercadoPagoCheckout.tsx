'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CreditCard, QrCode, Loader2, Copy, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';

type PaymentMethod = 'credit_card' | 'pix';
type PaymentStatus = 'pending' | 'processing' | 'approved' | 'rejected' | null;

interface MercadoPagoCheckoutProps {
  amount: number;
  planType?: string;
  onSuccess?: (paymentId: string) => void;
  onError?: (error: string) => void;
}

declare global {
  interface Window {
    MercadoPago?: any;
  }
}

export default function MercadoPagoCheckout({
  amount,
  planType = 'Premium',
  onSuccess,
  onError,
}: MercadoPagoCheckoutProps) {
  const [method, setMethod] = useState<PaymentMethod | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<PaymentStatus>(null);
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [cardToken, setCardToken] = useState<string | null>(null);
  const [mpLoaded, setMpLoaded] = useState(false);

  const [formData, setFormData] = useState({
    cardHolderName: '',
    cardHolderEmail: '',
    cardHolderDocument: '',
  });

  // Carregar SDK do Mercado Pago
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const script = document.createElement('script');
    script.src = 'https://sdk.mercadopago.com/js/v2';
    script.onload = () => {
      if (window.MercadoPago) {
        window.MercadoPago.setPublishableKey(
          process.env.NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY || ''
        );
        setMpLoaded(true);
      }
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    let formattedValue = value;

    // Formatar documento (remover caracteres especiais)
    if (name === 'cardHolderDocument') {
      formattedValue = value.replace(/\D/g, '').slice(0, 11);
    }

    setFormData(prev => ({
      ...prev,
      [name]: formattedValue,
    }));
  };

  const createCardToken = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!mpLoaded) {
      toast.error('Mercado Pago ainda não está carregado');
      return;
    }

    if (!formData.cardHolderName || !formData.cardHolderEmail || !formData.cardHolderDocument) {
      toast.error('Preencha todos os campos');
      return;
    }

    setLoading(true);

    try {
      // Usar o SDK do Mercado Pago para criar token do cartão
      // Isso é feito via cardform ou cardtoken
      // Para este exemplo, vamos simular
      
      // Em produção, você usaria:
      // const token = await window.MercadoPago.createCardToken({...})
      
      // Por enquanto, vamos prosseguir para demonstração
      setCardToken('test-token-' + Date.now());
      processPayment('credit_card', 'test-token-' + Date.now());
    } catch (error: any) {
      toast.error('Erro ao processar cartão: ' + error.message);
      setLoading(false);
    }
  };

  const generatePixQrCode = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setStatus('processing');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Você precisa estar autenticado');
        setLoading(false);
        return;
      }

      const response = await fetch('/api/payment/mercadopago', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          paymentMethod: 'pix',
          amount,
          planType,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao gerar QR Code');
      }

      setPaymentId(data.paymentId);
      setQrCode(data.qrCode);
      setStatus('pending');
      toast.success('QR Code PIX gerado com sucesso!');

      // Iniciar polling para verificar status
      pollPaymentStatus(data.paymentId);

    } catch (error: any) {
      console.error('Erro ao gerar QR Code:', error);
      setStatus('rejected');
      toast.error(error.message);
      onError?.(error.message);
    } finally {
      setLoading(false);
    }
  };

  const processPayment = async (method: PaymentMethod, token?: string) => {
    setLoading(true);
    setStatus('processing');

    try {
      const authToken = localStorage.getItem('token');
      if (!authToken) {
        toast.error('Você precisa estar autenticado');
        setLoading(false);
        return;
      }

      const response = await fetch('/api/payment/mercadopago', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          paymentMethod: method,
          amount,
          planType,
          cardToken: token,
          cardHolderName: formData.cardHolderName,
          cardHolderEmail: formData.cardHolderEmail,
          cardHolderDocument: formData.cardHolderDocument,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao processar pagamento');
      }

      setPaymentId(data.paymentId);

      if (data.success) {
        setStatus('approved');
        toast.success('Pagamento aprovado!');
        onSuccess?.(data.paymentId);
      } else {
        setStatus('pending');
        toast.info('Pagamento pendente de aprovação');
        pollPaymentStatus(data.paymentId);
      }

    } catch (error: any) {
      console.error('Erro ao processar pagamento:', error);
      setStatus('rejected');
      toast.error(error.message);
      onError?.(error.message);
    } finally {
      setLoading(false);
    }
  };

  const pollPaymentStatus = (pId: string) => {
    const maxAttempts = 60; // 5 minutos (5s * 60)
    let attempts = 0;

    const checkStatus = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await fetch(`/api/payment/mercadopago?id=${pId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();

          if (data.status === 'approved') {
            setStatus('approved');
            toast.success('Pagamento aprovado!');
            onSuccess?.(pId);
            return;
          }

          if (data.status === 'rejected') {
            setStatus('rejected');
            toast.error('Pagamento foi rejeitado');
            onError?.('Pagamento rejeitado');
            return;
          }
        }
      } catch (error) {
        console.error('Erro ao verificar status:', error);
      }

      attempts++;
      if (attempts < maxAttempts) {
        setTimeout(checkStatus, 5000); // Verificar a cada 5 segundos
      }
    };

    checkStatus();
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copiado para a área de transferência');
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {!method ? (
        // Seleção de método de pagamento
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card
            className="cursor-pointer hover:border-blue-500 transition-colors"
            onClick={() => setMethod('credit_card')}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Cartão de Crédito
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Pague com cartão de crédito de forma segura
              </p>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer hover:border-green-500 transition-colors"
            onClick={() => setMethod('pix')}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <QrCode className="w-5 h-5" />
                PIX / QR Code
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Escaneie o código QR ou copie a chave PIX
              </p>
            </CardContent>
          </Card>
        </div>
      ) : null}

      {/* Cartão de Crédito */}
      {method === 'credit_card' && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Pagamento com Cartão</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMethod(null)}
              >
                Voltar
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {status === 'approved' ? (
              <div className="space-y-4">
                <div className="flex items-center justify-center">
                  <CheckCircle className="w-12 h-12 text-green-500" />
                </div>
                <p className="text-center text-green-600 font-semibold">
                  Pagamento aprovado com sucesso!
                </p>
                <p className="text-center text-sm text-gray-600">
                  ID do pagamento: {paymentId}
                </p>
              </div>
            ) : status === 'rejected' ? (
              <div className="space-y-4">
                <div className="flex items-center justify-center">
                  <XCircle className="w-12 h-12 text-red-500" />
                </div>
                <p className="text-center text-red-600 font-semibold">
                  Pagamento rejeitado
                </p>
                <Button
                  onClick={() => {
                    setMethod(null);
                    setStatus(null);
                    setFormData({
                      cardHolderName: '',
                      cardHolderEmail: '',
                      cardHolderDocument: '',
                    });
                  }}
                  className="w-full"
                >
                  Tentar novamente
                </Button>
              </div>
            ) : (
              <form onSubmit={createCardToken} className="space-y-4">
                <div>
                  <Label htmlFor="cardHolderName">Nome Completo</Label>
                  <Input
                    id="cardHolderName"
                    name="cardHolderName"
                    value={formData.cardHolderName}
                    onChange={handleInputChange}
                    placeholder="João da Silva"
                    disabled={loading}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="cardHolderEmail">Email</Label>
                  <Input
                    id="cardHolderEmail"
                    name="cardHolderEmail"
                    type="email"
                    value={formData.cardHolderEmail}
                    onChange={handleInputChange}
                    placeholder="joao@example.com"
                    disabled={loading}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="cardHolderDocument">CPF</Label>
                  <Input
                    id="cardHolderDocument"
                    name="cardHolderDocument"
                    value={formData.cardHolderDocument}
                    onChange={handleInputChange}
                    placeholder="00000000000"
                    disabled={loading}
                    required
                    maxLength={11}
                  />
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded p-4">
                  <p className="text-sm text-blue-800">
                    <strong>Nota:</strong> Os dados do cartão são processados de forma segura pelo Mercado Pago.
                    Você será redirecionado para confirmar o pagamento.
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setMethod(null)}
                    disabled={loading}
                  >
                    Voltar
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="flex-1"
                  >
                    {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Processar Pagamento - R$ {amount.toFixed(2)}
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      )}

      {/* PIX / QR Code */}
      {method === 'pix' && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Pagamento com PIX</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMethod(null)}
                disabled={loading}
              >
                Voltar
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {status === 'approved' ? (
              <div className="space-y-4">
                <div className="flex items-center justify-center">
                  <CheckCircle className="w-12 h-12 text-green-500" />
                </div>
                <p className="text-center text-green-600 font-semibold">
                  Pagamento confirmado!
                </p>
                <p className="text-center text-sm text-gray-600">
                  Seu pagamento foi processado com sucesso.
                </p>
              </div>
            ) : status === 'rejected' ? (
              <div className="space-y-4">
                <div className="flex items-center justify-center">
                  <XCircle className="w-12 h-12 text-red-500" />
                </div>
                <p className="text-center text-red-600 font-semibold">
                  Pagamento expirado
                </p>
                <Button
                  onClick={() => {
                    setMethod(null);
                    setStatus(null);
                    setQrCode(null);
                    setPaymentId(null);
                  }}
                  className="w-full"
                >
                  Gerar novo QR Code
                </Button>
              </div>
            ) : qrCode ? (
              <div className="space-y-4">
                <p className="text-center text-sm text-gray-600">
                  Escaneie o QR Code abaixo com seu celular
                </p>

                <div className="bg-gray-100 p-6 rounded-lg flex justify-center">
                  <div
                    dangerouslySetInnerHTML={{ __html: qrCode }}
                  />
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
                  <p className="text-sm text-yellow-800">
                    Aguardando confirmação do pagamento...
                  </p>
                </div>

                <div className="pt-4">
                  <p className="text-xs text-gray-500 mb-2">
                    Valor: R$ {amount.toFixed(2)}
                  </p>
                  <Button
                    onClick={() => {
                      setMethod(null);
                      setStatus(null);
                      setQrCode(null);
                      setPaymentId(null);
                    }}
                    variant="outline"
                    className="w-full"
                  >
                    Gerar novo QR Code
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={generatePixQrCode} className="space-y-4">
                <p className="text-sm text-gray-600">
                  Gere um QR Code para escanear com seu celular e finalizar o pagamento.
                </p>

                <div className="bg-blue-50 border border-blue-200 rounded p-4">
                  <p className="text-sm text-blue-800">
                    <strong>Valor a pagar:</strong> R$ {amount.toFixed(2)}
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setMethod(null)}
                    disabled={loading}
                  >
                    Voltar
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="flex-1"
                  >
                    {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Gerar QR Code
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import MercadoPagoCheckout from '@/components/MercadoPagoCheckout';

export default function PaymentMercadoPagoPage() {
  const router = useRouter();
  const [amount, setAmount] = useState(0.01);
  const [planType, setPlanType] = useState('Intermediário');

  useEffect(() => {
    // Determinar valor e tipo de plano baseado no usuário
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      if (user.plan === 'intermediario') {
        setAmount(0.01); // R$ 0,01 para teste
        setPlanType('Intermediário');
      } else if (user.plan === 'avancado') {
        setAmount(0.02); // R$ 0,02 para teste
        setPlanType('Avançado');
      }
    }
  }, []);

  const handlePaymentSuccess = (paymentId: string) => {
    // Redirecionar ou atualizar interface
    setTimeout(() => {
      router.push('/dashboard?payment_success=true');
    }, 2000);
  };

  const handlePaymentError = (error: string) => {
    console.error('Erro no pagamento:', error);
    // Opcionalmente, redirecionar para uma página de erro
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Finalizar Pagamento</CardTitle>
            <p className="text-sm text-gray-600 mt-2">
              Plano: <strong>{planType}</strong> - Valor: <strong>R$ {amount.toFixed(2)}</strong>
            </p>
          </CardHeader>
          <CardContent>
            <MercadoPagoCheckout
              amount={amount}
              planType={planType}
              onSuccess={handlePaymentSuccess}
              onError={handlePaymentError}
            />
          </CardContent>
        </Card>

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">
            ℹ️ Informações Importantes
          </h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li>✅ Pagamentos 100% seguros via Mercado Pago</li>
            <li>✅ Suporte para Cartão de Crédito e PIX</li>
            <li>✅ Confirmação instantânea após pagamento</li>
            <li>✅ Você receberá um recibo por email</li>
            <li>🔒 Seus dados são protegidos pelas políticas de segurança do Mercado Pago</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

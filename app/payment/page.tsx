'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CreditCard, QrCode, Loader2, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

type PaymentMethod = 'credit_card' | 'pix';

export default function PaymentPage() {
  const router = useRouter();
  const [method, setMethod] = useState<PaymentMethod | null>(null);
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState(0.01);
  const [formData, setFormData] = useState({
    cardHolderName: '',
    cardNumber: '',
    cardExpiry: '',
    cardCvv: '',
    pixKey: '',
  });

  useEffect(() => {
    // Determinar valor baseado no plano do usuário
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      if (user.plan === 'intermediario') {
        setAmount(0.01);
      } else if (user.plan === 'avancado') {
        setAmount(0.02);
      }
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    let formattedValue = value;
    
    // Formatar número do cartão
    if (name === 'cardNumber') {
      formattedValue = value.replace(/\D/g, '').replace(/(\d{4})/g, '$1 ').trim().slice(0, 19);
    }
    
    // Formatar validade
    if (name === 'cardExpiry') {
      formattedValue = value.replace(/\D/g, '');
      if (formattedValue.length >= 2) {
        formattedValue = formattedValue.slice(0, 2) + '/' + formattedValue.slice(2, 4);
      }
      formattedValue = formattedValue.slice(0, 7);
    }
    
    // Formatar CVV
    if (name === 'cardCvv') {
      formattedValue = value.replace(/\D/g, '').slice(0, 4);
    }
    
    setFormData({ ...formData, [name]: formattedValue });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (method === 'credit_card') {
      if (!formData.cardHolderName || !formData.cardNumber || !formData.cardExpiry || !formData.cardCvv) {
        toast.error('Preencha todos os campos do cartão');
        return;
      }
      
      if (formData.cardNumber.replace(/\s/g, '').length < 16) {
        toast.error('Número do cartão inválido');
        return;
      }
    }
    
    if (method === 'pix' && !formData.pixKey) {
      toast.error('Informe sua chave PIX');
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/payment/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          paymentMethod: method,
          amount: amount,
          ...(method === 'credit_card' ? {
            cardHolderName: formData.cardHolderName,
            cardNumber: formData.cardNumber.replace(/\s/g, ''),
            cardExpiry: formData.cardExpiry,
            cardCvv: formData.cardCvv,
          } : {
            pixKey: formData.pixKey,
          }),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Solicitação de pagamento enviada com sucesso!');
        toast.info('Aguarde a aprovação do administrador para acessar a plataforma.');
        
        // Redirecionar para tela de aguardando aprovação
        setTimeout(() => {
          router.push('/payment/pending');
        }, 2000);
      } else {
        toast.error(data.error || 'Erro ao processar pagamento');
      }
    } catch (error) {
      console.error('Erro ao processar pagamento:', error);
      toast.error('Erro ao processar pagamento');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white dark:from-gray-950 dark:to-gray-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl dark:bg-gray-900/50 dark:border-gray-800">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => method ? setMethod(null) : router.push('/dashboard')}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <CardTitle className="text-2xl dark:text-white">Pagamento de Acesso</CardTitle>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Complete seu pagamento para acessar a plataforma
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Valor */}
          <div className="bg-purple-50 dark:bg-purple-950/30 p-6 rounded-lg text-center">
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">Valor do plano mensal</p>
            <p className="text-4xl font-bold text-purple-600 dark:text-purple-400">R$ {amount.toFixed(2).replace('.', ',')}</p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
              Acesso completo à plataforma de gestão 3D
            </p>
          </div>

          {!method ? (
            <div className="space-y-4">
              <p className="text-center text-gray-700 dark:text-gray-300 font-medium">
                Escolha a forma de pagamento:
              </p>
              
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setMethod('credit_card')}
                  className="flex flex-col items-center gap-3 p-6 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-purple-500 dark:hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-950/20 transition-all"
                >
                  <CreditCard className="h-12 w-12 text-purple-600 dark:text-purple-400" />
                  <span className="font-medium dark:text-white">Cartão de Crédito</span>
                </button>

                <button
                  onClick={() => setMethod('pix')}
                  className="flex flex-col items-center gap-3 p-6 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-purple-500 dark:hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-950/20 transition-all"
                >
                  <QrCode className="h-12 w-12 text-purple-600 dark:text-purple-400" />
                  <span className="font-medium dark:text-white">PIX</span>
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {method === 'credit_card' && (
                <>
                  <div>
                    <Label htmlFor="cardHolderName" className="dark:text-gray-300">Nome no Cartão *</Label>
                    <Input
                      id="cardHolderName"
                      name="cardHolderName"
                      value={formData.cardHolderName}
                      onChange={handleInputChange}
                      placeholder="João Silva"
                      disabled={loading}
                      className="dark:bg-gray-800 dark:border-gray-700"
                    />
                  </div>

                  <div>
                    <Label htmlFor="cardNumber" className="dark:text-gray-300">Número do Cartão *</Label>
                    <Input
                      id="cardNumber"
                      name="cardNumber"
                      value={formData.cardNumber}
                      onChange={handleInputChange}
                      placeholder="1234 5678 9012 3456"
                      disabled={loading}
                      className="dark:bg-gray-800 dark:border-gray-700"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="cardExpiry" className="dark:text-gray-300">Validade *</Label>
                      <Input
                        id="cardExpiry"
                        name="cardExpiry"
                        value={formData.cardExpiry}
                        onChange={handleInputChange}
                        placeholder="MM/AA"
                        disabled={loading}
                        className="dark:bg-gray-800 dark:border-gray-700"
                      />
                    </div>
                    <div>
                      <Label htmlFor="cardCvv" className="dark:text-gray-300">CVV *</Label>
                      <Input
                        id="cardCvv"
                        name="cardCvv"
                        type="password"
                        value={formData.cardCvv}
                        onChange={handleInputChange}
                        placeholder="123"
                        disabled={loading}
                        className="dark:bg-gray-800 dark:border-gray-700"
                      />
                    </div>
                  </div>
                </>
              )}

              {method === 'pix' && (
                <div>
                  <Label htmlFor="pixKey" className="dark:text-gray-300">Sua Chave PIX *</Label>
                  <Input
                    id="pixKey"
                    name="pixKey"
                    value={formData.pixKey}
                    onChange={handleInputChange}
                    placeholder="CPF, e-mail, celular ou chave aleatória"
                    disabled={loading}
                    className="dark:bg-gray-800 dark:border-gray-700"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    Informe sua chave PIX para que possamos validar o pagamento
                  </p>
                </div>
              )}

              <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <p className="text-sm text-green-800 dark:text-green-300">
                  ✅ Pagamento via Mercado Pago - Seu plano será ativado automaticamente após a confirmação!
                </p>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-purple-600 hover:bg-purple-700"
                disabled={loading}
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Enviar Solicitação de Pagamento
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, CheckCircle, XCircle, Loader2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

export default function PaymentPendingPage() {
  const router = useRouter();
  const [status, setStatus] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [lastCheck, setLastCheck] = useState<Date>(new Date());

  useEffect(() => {
    checkPaymentStatus();
    const interval = setInterval(checkPaymentStatus, 5000); // Verifica a cada 5 segundos
    return () => clearInterval(interval);
  }, []);

  const checkPaymentStatus = async () => {
    try {
      setChecking(true);
      const token = localStorage.getItem('token');
      const response = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        const newStatus = data.paymentStatus;
        
        // Atualizar localStorage com novo status
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const user = JSON.parse(userStr);
          user.paymentStatus = newStatus;
          localStorage.setItem('user', JSON.stringify(user));
        }
        
        // Se o status mudou, mostrar notificação
        if (status !== newStatus && !loading) {
          if (newStatus === 'approved') {
            toast.success('🎉 Pagamento aprovado! Redirecionando...');
          } else if (newStatus === 'rejected') {
            toast.error('❌ Pagamento recusado');
          }
        }
        
        setStatus(newStatus);
        setLoading(false);
        setLastCheck(new Date());

        if (newStatus === 'approved') {
          setTimeout(() => {
            router.push('/dashboard');
          }, 2000);
        }
      }
    } catch (error) {
      console.error('Erro ao verificar status:', error);
      setLoading(false);
    } finally {
      setChecking(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white dark:from-gray-950 dark:to-gray-900 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600 dark:text-purple-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white dark:from-gray-950 dark:to-gray-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md dark:bg-gray-900/50 dark:border-gray-800">
        <CardHeader>
          <CardTitle className="text-center dark:text-white">Status do Pagamento</CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {status === 'pending' && (
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <Clock className="h-16 w-16 text-yellow-500 dark:text-yellow-400 animate-pulse" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Aguardando Aprovação
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Sua solicitação de pagamento foi enviada com sucesso!
                </p>
                <p className="text-gray-600 dark:text-gray-400 text-sm mt-2">
                  O administrador irá revisar e aprovar seu acesso em breve.
                  Você receberá uma notificação quando for aprovado.
                </p>
              </div>
              <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex items-center justify-center gap-2 text-xs text-blue-800 dark:text-blue-300">
                  <RefreshCw className={`h-3 w-3 ${checking ? 'animate-spin' : ''}`} />
                  <span>
                    {checking ? 'Verificando status...' : `Última verificação: ${lastCheck.toLocaleTimeString('pt-BR')}`}
                  </span>
                </div>
                <p className="text-xs text-blue-800 dark:text-blue-300 mt-2 text-center">
                  Atualização automática a cada 5 segundos
                </p>
              </div>
              <Button
                onClick={checkPaymentStatus}
                variant="outline"
                className="w-full"
                disabled={checking}
              >
                {checking ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verificando...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Verificar Agora
                  </>
                )}
              </Button>
            </div>
          )}

          {status === 'approved' && (
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <CheckCircle className="h-16 w-16 text-green-500 dark:text-green-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Pagamento Aprovado!
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Seu acesso foi liberado com sucesso!
                </p>
                <p className="text-gray-600 dark:text-gray-400 text-sm mt-2">
                  Redirecionando para o dashboard...
                </p>
              </div>
            </div>
          )}

          {status === 'rejected' && (
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <XCircle className="h-16 w-16 text-red-500 dark:text-red-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Pagamento Recusado
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Infelizmente sua solicitação de pagamento foi recusada.
                </p>
                <p className="text-gray-600 dark:text-gray-400 text-sm mt-2">
                  Entre em contato com o suporte para mais informações.
                </p>
              </div>
              <Button
                onClick={() => router.push('/payment')}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                Tentar Novamente
              </Button>
            </div>
          )}

          <Button
            onClick={handleLogout}
            variant="outline"
            className="w-full"
          >
            Sair
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

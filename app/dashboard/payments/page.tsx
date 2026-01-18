'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CheckCircle, XCircle, Clock, CreditCard, QrCode, Loader2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface PaymentRequestData {
  id: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  paymentMethod: 'credit_card' | 'pix';
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
  cardHolderName?: string;
  cardNumber?: string;
  pixKey?: string;
  createdAt: string;
}

export default function AdminPaymentsPage() {
  const router = useRouter();
  const [requests, setRequests] = useState<PaymentRequestData[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      if (user.role !== 'admin') {
        router.push('/dashboard');
        return;
      }
    }

    fetchRequests();
    
    // Auto-refresh a cada 10 segundos
    const interval = setInterval(() => {
      if (autoRefresh) {
        fetchRequests(true); // true = silent refresh
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [router, autoRefresh]);

  const fetchRequests = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      
      const token = localStorage.getItem('token');
      const response = await fetch('/api/payment/admin', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        const previousPendingCount = requests.filter(r => r.status === 'pending').length;
        const newPendingCount = data.filter((r: PaymentRequestData) => r.status === 'pending').length;
        
        // Notificar sobre novas solicitações
        if (silent && newPendingCount > previousPendingCount) {
          toast.info(`${newPendingCount - previousPendingCount} nova(s) solicitação(ões) de pagamento`);
        }
        
        setRequests(data);
        setLastUpdate(new Date());
      } else {
        if (!silent) toast.error('Erro ao carregar solicitações');
      }
    } catch (error) {
      console.error('Erro ao carregar solicitações:', error);
      if (!silent) toast.error('Erro ao carregar solicitações');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (requestId: string, action: 'approve' | 'reject') => {
    setProcessing(requestId);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/payment/admin', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ requestId, action }),
      });

      if (response.ok) {
        toast.success(`Pagamento ${action === 'approve' ? 'aprovado' : 'rejeitado'} com sucesso!`);
        await fetchRequests();
      } else {
        const data = await response.json();
        toast.error(data.error || 'Erro ao processar pagamento');
      }
    } catch (error) {
      console.error('Erro ao processar pagamento:', error);
      toast.error('Erro ao processar pagamento');
    } finally {
      setProcessing(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300">
            <Clock className="h-3 w-3" />
            Pendente
          </span>
        );
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">
            <CheckCircle className="h-3 w-3" />
            Aprovado
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300">
            <XCircle className="h-3 w-3" />
            Rejeitado
          </span>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600 dark:text-purple-400" />
      </div>
    );
  }

  const pendingRequests = requests.filter((r) => r.status === 'pending');
  const processedRequests = requests.filter((r) => r.status !== 'pending');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Solicitações de Pagamento
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Gerencie as solicitações de pagamento dos usuários
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Última atualização: {lastUpdate.toLocaleTimeString('pt-BR')}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <label className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                  className="rounded"
                />
                Auto-atualizar
              </label>
            </div>
          </div>
          <Button
            onClick={() => fetchRequests()}
            variant="outline"
            size="sm"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Solicitações Pendentes */}
      <Card className="dark:bg-gray-900/50 dark:border-gray-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 dark:text-white">
            <Clock className="h-5 w-5 text-yellow-500" />
            Pendentes ({pendingRequests.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pendingRequests.length === 0 ? (
            <p className="text-center text-gray-600 dark:text-gray-400 py-8">
              Nenhuma solicitação pendente
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Usuário</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Método</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Detalhes</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingRequests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell className="font-medium dark:text-white">
                        {request.user.name}
                      </TableCell>
                      <TableCell className="dark:text-gray-300">{request.user.email}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {request.paymentMethod === 'credit_card' ? (
                            <>
                              <CreditCard className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                              <span className="dark:text-gray-300">Cartão</span>
                            </>
                          ) : (
                            <>
                              <QrCode className="h-4 w-4 text-green-600 dark:text-green-400" />
                              <span className="dark:text-gray-300">PIX</span>
                            </>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold text-green-600 dark:text-green-400">
                        R$ {Number(request.amount).toFixed(2)}
                      </TableCell>
                      <TableCell className="text-sm text-gray-600 dark:text-gray-400">
                        {request.paymentMethod === 'credit_card' && (
                          <div>
                            <div>{request.cardHolderName}</div>
                            <div>**** {request.cardNumber}</div>
                          </div>
                        )}
                        {request.paymentMethod === 'pix' && (
                          <div>{request.pixKey}</div>
                        )}
                      </TableCell>
                      <TableCell className="dark:text-gray-300">
                        {new Date(request.createdAt).toLocaleDateString('pt-BR')}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleAction(request.id, 'approve')}
                            disabled={processing === request.id}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            {processing === request.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <CheckCircle className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleAction(request.id, 'reject')}
                            disabled={processing === request.id}
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Histórico */}
      <Card className="dark:bg-gray-900/50 dark:border-gray-800">
        <CardHeader>
          <CardTitle className="dark:text-white">
            Histórico ({processedRequests.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {processedRequests.length === 0 ? (
            <p className="text-center text-gray-600 dark:text-gray-400 py-8">
              Nenhum pagamento processado ainda
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Usuário</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Método</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Data</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {processedRequests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell className="font-medium dark:text-white">
                        {request.user.name}
                      </TableCell>
                      <TableCell className="dark:text-gray-300">{request.user.email}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {request.paymentMethod === 'credit_card' ? (
                            <>
                              <CreditCard className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                              <span className="dark:text-gray-300">Cartão</span>
                            </>
                          ) : (
                            <>
                              <QrCode className="h-4 w-4 text-green-600 dark:text-green-400" />
                              <span className="dark:text-gray-300">PIX</span>
                            </>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold text-green-600 dark:text-green-400">
                        R$ {Number(request.amount).toFixed(2)}
                      </TableCell>
                      <TableCell>{getStatusBadge(request.status)}</TableCell>
                      <TableCell className="dark:text-gray-300">
                        {new Date(request.createdAt).toLocaleDateString('pt-BR')}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

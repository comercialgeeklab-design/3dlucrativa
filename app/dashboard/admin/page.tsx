'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Users,
  CreditCard,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
} from 'lucide-react';

interface SaaSMetrics {
  totalUsers: number;
  newUsersThisMonth: number;
  activeSubscriptions: number;
  pendingPayments: number;
  totalRevenueThisMonth: number;
  totalRevenueAllTime: number;
  approvedPaymentsThisMonth: number;
  rejectedPaymentsThisMonth: number;
  recentUsers: Array<{
    id: string;
    name: string;
    email: string;
    paymentStatus: string;
    createdAt: string;
  }>;
  monthlyRevenue: Array<{
    month: string;
    revenue: number;
    users: number;
  }>;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [metrics, setMetrics] = useState<SaaSMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('Admin Dashboard: useEffect executado');
    
    // Verificar se é admin
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      console.log('Admin Dashboard: Sem user no localStorage, redirecionando para login');
      router.push('/login');
      return;
    }

    try {
      const user = JSON.parse(userStr);
      console.log('Admin Dashboard: User role:', user.role);
      
      if (user.role?.toUpperCase() !== 'ADMIN') {
        console.log('Admin Dashboard: Não é admin, redirecionando para /dashboard');
        router.push('/dashboard');
        return;
      }

      console.log('Admin Dashboard: É admin, buscando métricas');
      fetchMetrics();
      
      // Auto-refresh a cada 30 segundos
      const interval = setInterval(() => {
        fetchMetrics(true);
      }, 30000);

      return () => clearInterval(interval);
    } catch (error) {
      console.error('Admin Dashboard: Erro ao parsear user:', error);
      router.push('/login');
    }
  }, []);

  const fetchMetrics = async (silent = false) => {
    try {
      console.log('Admin Dashboard: Iniciando fetchMetrics, silent:', silent);
      
      if (!silent) setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('Admin Dashboard: Sem token');
        router.push('/login');
        return;
      }

      console.log('Admin Dashboard: Fazendo fetch para /api/admin/metrics');
      const response = await fetch('/api/admin/metrics', {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log('Admin Dashboard: Response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('Admin Dashboard: Dados recebidos:', data);
        setMetrics(data);
        setLastUpdate(new Date());
      } else {
        const errorData = await response.json();
        console.error('Admin Dashboard: Erro na resposta:', errorData);
        setError(errorData.error || 'Erro ao carregar métricas');
      }
    } catch (error) {
      console.error('Admin Dashboard: Erro no catch:', error);
      setError('Erro ao conectar com o servidor');
    } finally {
      if (!silent) {
        console.log('Admin Dashboard: Finalizando loading');
        setLoading(false);
      }
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      PENDING: { label: 'Pendente', className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' },
      APPROVED: { label: 'Aprovado', className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' },
      REJECTED: { label: 'Rejeitado', className: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' },
    };
    const badge = badges[status as keyof typeof badges] || badges.PENDING;
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${badge.className}`}>
        {badge.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <h3 className="text-red-800 dark:text-red-300 font-semibold">Erro</h3>
          <p className="text-red-600 dark:text-red-400 mt-1">{error}</p>
          <button
            onClick={() => fetchMetrics()}
            className="mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="p-6">
        <p className="text-gray-500">Nenhum dado disponível</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Dashboard SaaS
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Métricas e desempenho da plataforma
          </p>
        </div>
        {lastUpdate && (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Atualizado: {lastUpdate.toLocaleTimeString('pt-BR')}
          </p>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Users */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalUsers}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {metrics.newUsersThisMonth} novos este mês
            </p>
          </CardContent>
        </Card>

        {/* Active Subscriptions */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assinaturas Ativas</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.activeSubscriptions}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {metrics.pendingPayments} aguardando aprovação
            </p>
          </CardContent>
        </Card>

        {/* Revenue This Month */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita do Mês</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(metrics.totalRevenueThisMonth)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {metrics.approvedPaymentsThisMonth} pagamentos aprovados
            </p>
          </CardContent>
        </Card>

        {/* Total Revenue */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(metrics.totalRevenueAllTime)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Histórico completo
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Receita Mensal</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {metrics.monthlyRevenue.slice(0, 6).map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{item.month}</p>
                    <p className="text-xs text-muted-foreground">{item.users} usuários</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold">{formatCurrency(item.revenue)}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Users */}
        <Card>
          <CardHeader>
            <CardTitle>Usuários Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {metrics.recentUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(user.createdAt)}</p>
                  </div>
                  <div>{getStatusBadge(user.paymentStatus)}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment Status Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Resumo de Pagamentos - Este Mês</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3 p-4 bg-yellow-50 dark:bg-yellow-900/10 rounded-lg">
              <Clock className="h-8 w-8 text-yellow-600" />
              <div>
                <p className="text-2xl font-bold">{metrics.pendingPayments}</p>
                <p className="text-sm text-muted-foreground">Pendentes</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-4 bg-green-50 dark:bg-green-900/10 rounded-lg">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{metrics.approvedPaymentsThisMonth}</p>
                <p className="text-sm text-muted-foreground">Aprovados</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-4 bg-red-50 dark:bg-red-900/10 rounded-lg">
              <XCircle className="h-8 w-8 text-red-600" />
              <div>
                <p className="text-2xl font-bold">{metrics.rejectedPaymentsThisMonth}</p>
                <p className="text-sm text-muted-foreground">Rejeitados</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

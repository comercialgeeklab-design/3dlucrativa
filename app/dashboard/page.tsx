'use client';

import { useEffect, useMemo, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LineChart as SimpleLineChart } from '@/components/charts/LineChart';
import { Sparkline } from '@/components/charts/Sparkline';
import { PlanFeatureGuard } from '@/components/PlanFeatureGuard';
import {
  Package,
  TrendingUp,
  DollarSign,
  ShoppingCart,
  PiggyBank,
  Layers,
  AlertTriangle,
} from 'lucide-react';

interface DashboardStats {
  period: {
    startDate: string;
    endDate: string;
  };
  totals: {
    quantitySold: number;
    grossRevenue: number;
    commissionPaid: number;
    taxPaid: number;
    netRevenue: number;
  };
  products: {
    topProducts: Array<{ id: string; name: string; quantity: number; revenue: number; trend: number[] }>;
  };
  filaments: {
    totalUsedGrams: number;
    mostUsed: Array<{ id: string; name: string; gramsUsed: number }>;
    lowStock: Array<{ id: string; name: string; currentStock: number }>;
  };
  platforms: {
    ranking: Array<{ id: string; name: string; revenue: number; commission: number; trend: number[] }>;
  };
  stock: {
    totalFilamentStockValue: number;
    totalStockValue: number;
    totalInventoryValue: number;
  };
  trend: Array<{ date: string; quantity: number; gross: number; net: number; commission: number; tax: number }>;
}

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [rangeType, setRangeType] = useState<'day' | 'month' | 'year' | 'custom'>('month');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  // Verificar se é admin IMEDIATAMENTE antes de renderizar
  if (typeof window !== 'undefined') {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user.role?.toUpperCase() === 'ADMIN') {
          window.location.href = '/dashboard/admin';
          return <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          </div>;
        }
      } catch (e) {
        console.error('Erro ao parsear user:', e);
      }
    }
  }

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const start = startOfMonth.toISOString().split('T')[0];
    const end = now.toISOString().split('T')[0];
    setStartDate(start);
    setEndDate(end);
    
    // Initial fetch
    fetchStatsInternal({ start, end });
  }, [router]);

  const fetchStatsInternal = async (params: { start: string; end: string }) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const query = new URLSearchParams({ startDate: params.start, endDate: params.end });
      const response = await fetch(`/api/dashboard/stats?${query.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      } else {
        setStats(null);
      }
    } catch (error) {
      console.error('Erro ao carregar stats:', error);
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = useCallback((params: { start: string; end: string }) => {
    return fetchStatsInternal(params);
  }, [router]);

  const handleRangeChange = (value: 'day' | 'month' | 'year' | 'custom') => {
    setRangeType(value);
    const now = new Date();
    let newStart = '';
    let newEnd = '';
    
    if (value === 'day') {
      const d = now.toISOString().split('T')[0];
      newStart = d;
      newEnd = d;
      setStartDate(newStart);
      setEndDate(newEnd);
      fetchStats({ start: newStart, end: newEnd });
    } else if (value === 'month') {
      // Format as YYYY-MM for month input
      const monthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      setStartDate(monthStr);
      setEndDate(monthStr);
      // Convert to full dates for API
      const start = `${monthStr}-01`;
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
      const end = `${monthStr}-${String(lastDay).padStart(2, '0')}`;
      fetchStats({ start, end });
    } else if (value === 'year') {
      // Format as YYYY for year input
      const yearStr = String(now.getFullYear());
      setStartDate(yearStr);
      setEndDate(yearStr);
      // Convert to full dates for API
      const start = `${yearStr}-01-01`;
      const end = `${yearStr}-12-31`;
      fetchStats({ start, end });
    } else {
      // custom - keep current dates or set defaults
      if (!startDate || !endDate) {
        const start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
        const end = now.toISOString().split('T')[0];
        setStartDate(start);
        setEndDate(end);
      }
    }
  };

  const formatDate = (d: Date) => d.toISOString().split('T')[0];
  
  const getApiDates = (start: string, end: string, type: typeof rangeType): { start: string; end: string } => {
    if (!start || !end) {
      // Fallback to current month if empty
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
      const monthEnd = now.toISOString().split('T')[0];
      return { start: monthStart, end: monthEnd };
    }
    
    if (type === 'month') {
      // start/end are YYYY-MM, convert to full dates
      try {
        const [sYear, sMonth] = start.split('-').map(Number);
        const [eYear, eMonth] = end.split('-').map(Number);
        if (!sYear || !sMonth || !eYear || !eMonth) throw new Error('Invalid month format');
        const lastDay = new Date(eYear, eMonth, 0).getDate();
        return {
          start: `${start}-01`,
          end: `${end}-${String(lastDay).padStart(2, '0')}`,
        };
      } catch (e) {
        console.error('Error parsing month:', e);
        return { start, end };
      }
    } else if (type === 'year') {
      // start/end are YYYY, convert to full dates
      try {
        const startYear = parseInt(start, 10);
        const endYear = parseInt(end, 10);
        if (isNaN(startYear) || isNaN(endYear) || startYear < 2000 || endYear > 2100) {
          throw new Error('Invalid year');
        }
        return {
          start: `${startYear}-01-01`,
          end: `${endYear}-12-31`,
        };
      } catch (e) {
        console.error('Error parsing year:', e);
        return { start: '2026-01-01', end: '2026-12-31' };
      }
    }
    // day or custom - already in correct format
    return { start, end };
  };
  
  const setPreset = async (preset: 'today' | '7days' | 'month' | 'year') => {
    const now = new Date();
    let start = new Date(now);
    let end = new Date(now);
    if (preset === 'today') {
      // start and end are today
    } else if (preset === '7days') {
      start.setDate(now.getDate() - 6);
    } else if (preset === 'month') {
      start = new Date(now.getFullYear(), now.getMonth(), 1);
    } else if (preset === 'year') {
      start = new Date(now.getFullYear(), 0, 1);
    }
    const s = formatDate(start);
    const e = formatDate(end);
    setStartDate(s);
    setEndDate(e);
    setRangeType('custom');
    await fetchStats({ start: s, end: e });
  };

  const hasData = useMemo(() => !!stats, [stats]);

  const formatXAxis = (dateStr: string) => {
    if (!dateStr || typeof dateStr !== 'string') return '';
    if (!startDate || !endDate) return dateStr.slice(5);
    
    try {
      const start = new Date(rangeType === 'year' ? `${startDate}-01-01` : rangeType === 'month' ? `${startDate}-01` : startDate);
      const end = new Date(rangeType === 'year' ? `${endDate}-12-31` : rangeType === 'month' ? `${endDate}-01` : endDate);
      const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      
      if (days <= 31) {
        // Show day/month for monthly view
        return dateStr.slice(5); // MM-DD
      } else if (days <= 366) {
        // Show month for yearly view
        const parts = dateStr.split('-');
        return parts.length >= 2 ? parts[1] : dateStr;
      } else {
        // Show year for multi-year
        return dateStr.slice(0, 4);
      }
    } catch (e) {
      console.error('Error formatting axis:', e);
      return dateStr.slice(5);
    }
  };

  if (loading || !stats) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-pulse text-purple-600 dark:text-purple-400">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8 transition-all duration-300 ease-in-out">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Visão consolidada do seu negócio no período selecionado.
        </p>
      </div>

    {/* Filtros */}
    <Card className="dark:bg-gray-900/50 dark:border-gray-800">
      <CardHeader>
        <CardTitle className="dark:text-white">Período</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 md:flex-row md:items-end">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium dark:text-gray-300">Intervalo</label>
          <select
            className="rounded-md border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white p-2 text-sm"
            value={rangeType}
            onChange={(e) => handleRangeChange(e.target.value as any)}
          >
            <option value="day">Dia</option>
            <option value="month">Mês</option>
            <option value="year">Ano</option>
            <option value="custom">Personalizado</option>
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">Início</label>
          <Input
            type={rangeType === 'month' ? 'month' : rangeType === 'year' ? 'number' : 'date'}
            value={startDate}
            min={rangeType === 'year' ? '2020' : undefined}
            max={rangeType === 'year' ? '2030' : undefined}
            placeholder={rangeType === 'year' ? 'Ano' : undefined}
            onChange={(e) => {
              setStartDate(e.target.value);
              if (rangeType !== 'custom') setRangeType('custom');
            }}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">Fim</label>
          <Input
            type={rangeType === 'month' ? 'month' : rangeType === 'year' ? 'number' : 'date'}
            value={endDate}
            min={rangeType === 'year' ? '2020' : undefined}
            max={rangeType === 'year' ? '2030' : undefined}
            placeholder={rangeType === 'year' ? 'Ano' : undefined}
            onChange={(e) => {
              setEndDate(e.target.value);
              if (rangeType !== 'custom') setRangeType('custom');
            }}
          />
        </div>
        <Button onClick={() => {
          const apiDates = getApiDates(startDate, endDate, rangeType);
          fetchStats(apiDates);
        }}>Atualizar</Button>
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={() => setPreset('today')}>Hoje</Button>
          <Button type="button" variant="outline" onClick={() => setPreset('7days')}>Últimos 7 dias</Button>
          <Button type="button" variant="outline" onClick={() => setPreset('month')}>Este mês</Button>
          <Button type="button" variant="outline" onClick={() => setPreset('year')}>Este ano</Button>
        </div>
      </CardContent>
    </Card>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="transition-all duration-200 hover:shadow-lg hover:-translate-y-1 dark:bg-gray-900/50 dark:border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium dark:text-white">Qtd vendida</CardTitle>
          <ShoppingCart className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          </CardHeader>
          <CardContent>
          <div className="text-2xl font-bold dark:text-white">{stats.totals.quantitySold}</div>
            <p className="text-xs text-gray-600 dark:text-gray-400">
            Itens vendidos no período
            </p>
          </CardContent>
        </Card>

        <Card className="transition-all duration-200 hover:shadow-lg hover:-translate-y-1 dark:bg-gray-900/50 dark:border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium dark:text-white">Bruto</CardTitle>
          <DollarSign className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          </CardHeader>
          <CardContent>
          <div className="text-2xl font-bold dark:text-white">R$ {stats.totals.grossRevenue.toFixed(2)}</div>
            <p className="text-xs text-gray-600 dark:text-gray-400">
            Valor bruto das vendas
            </p>
          </CardContent>
        </Card>

        <Card className="transition-all duration-200 hover:shadow-lg hover:-translate-y-1 dark:bg-gray-900/50 dark:border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium dark:text-white">Comissões + Impostos</CardTitle>
          <PiggyBank className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          </CardHeader>
          <CardContent>
          <div className="text-lg font-bold dark:text-white">Comissão: R$ {stats.totals.commissionPaid.toFixed(2)}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Imposto: R$ {stats.totals.taxPaid.toFixed(2)}</div>
          <p className="text-xs text-gray-600 dark:text-gray-400">Total de encargos</p>
          </CardContent>
        </Card>

        <Card className="transition-all duration-200 hover:shadow-lg hover:-translate-y-1 dark:bg-gray-900/50 dark:border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium dark:text-white">Líquido</CardTitle>
          <TrendingUp className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          </CardHeader>
          <CardContent>
          <div className="text-2xl font-bold dark:text-white">R$ {stats.totals.netRevenue.toFixed(2)}</div>
          <p className="text-xs text-gray-600 dark:text-gray-400">Receita líquida no período</p>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de linha (colorido) */}
    <PlanFeatureGuard requiredPlan="intermediario" featureName="Relatórios avançados e gráficos">
      <Card className="bg-gradient-to-br from-purple-50 to-white dark:from-purple-950/30 dark:to-gray-900/50 dark:border-gray-800 transition-all duration-300 hover:shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 dark:text-white">
            <TrendingUp className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            Vendas no período
          </CardTitle>
        </CardHeader>
        <CardContent>
          {stats.trend.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingCart className="h-12 w-12 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
              <p className="text-sm text-gray-600 dark:text-gray-400">Sem dados no período selecionado.</p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">Experimente ajustar o período ou adicionar vendas.</p>
            </div>
          ) : (
            <SimpleLineChart
              height={280}
              data={stats.trend.map((t) => {
                try {
                  return {
                    x: formatXAxis(t.date),
                    Bruto: t.gross || 0,
                    Líquido: t.net || 0,
                    Comissão: t.commission || 0,
                    Imposto: t.tax || 0,
                  };
                } catch (e) {
                  console.error('Error formatting chart data:', e);
                  return {
                    x: t.date?.slice(5) || '',
                    Bruto: 0,
                    Líquido: 0,
                    Comissão: 0,
                    Imposto: 0,
                  };
                }
              })}
              series={[
                { key: 'Bruto', label: 'Bruto', color: '#7c3aed' },
                { key: 'Líquido', label: 'Líquido', color: '#10b981' },
                { key: 'Comissão', label: 'Comissão', color: '#f59e0b' },
                { key: 'Imposto', label: 'Imposto', color: '#ef4444' },
              ]}
            />
          )}
        </CardContent>
      </Card>
    </PlanFeatureGuard>

    {/* Produtos e Plataformas */}
    <PlanFeatureGuard requiredPlan="intermediario" featureName="Análise de produtos e plataformas">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-purple-600" />
              Produtos mais vendidos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {stats.products.topProducts.length === 0 && (
              <p className="text-sm text-gray-600">Sem vendas no período.</p>
            )}
            {stats.products.topProducts.map((p, idx) => (
              <div key={p.id} className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-purple-50 to-transparent hover:from-purple-100 transition-colors">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-purple-600">#{idx + 1}</span>
                    <span className="font-medium text-gray-900">{p.name}</span>
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    {p.quantity} un • <span className="font-semibold text-green-600">R$ {p.revenue.toFixed(2)}</span>
                  </div>
                </div>
                <div className="ml-4">
                  <Sparkline data={p.trend || []} width={80} height={30} color="#7c3aed" fillOpacity={0.3} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="transition-all duration-200 hover:shadow-lg dark:bg-gray-900/50 dark:border-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 dark:text-white">
              <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
              Plataformas que mais venderam
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {stats.platforms.ranking.length === 0 && (
              <p className="text-sm text-gray-600 dark:text-gray-400">Sem vendas no período.</p>
            )}
            {stats.platforms.ranking.map((p, idx) => (
              <div key={p.id} className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-green-50 to-transparent dark:from-green-950/30 dark:to-transparent hover:from-green-100 dark:hover:from-green-900/40 transition-colors">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-green-600 dark:text-green-400">#{idx + 1}</span>
                    <span className="font-medium text-gray-900 dark:text-white">{p.name}</span>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    <span className="font-semibold text-green-600 dark:text-green-400">R$ {p.revenue.toFixed(2)}</span> • Comissão: R$ {p.commission.toFixed(2)}
                  </div>
                </div>
                <div className="ml-4">
                  <Sparkline data={p.trend || []} width={80} height={30} color="#10b981" fillOpacity={0.3} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </PlanFeatureGuard>

    {/* Filamentos */}
    <PlanFeatureGuard requiredPlan="intermediario" featureName="Análise de filamentos">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="transition-all duration-200 hover:shadow-lg dark:bg-gray-900/50 dark:border-gray-800">
          <CardHeader>
            <CardTitle className="dark:text-white">Filamentos mais utilizados</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-gray-600 dark:text-gray-400">Total usado: {stats.filaments.totalUsedGrams} g</p>
            {stats.filaments.mostUsed.length === 0 && (
              <p className="text-sm text-gray-600 dark:text-gray-400">Sem consumo no período.</p>
            )}
            {stats.filaments.mostUsed.map((f) => (
              <div key={f.id} className="flex justify-between text-sm">
                <span className="dark:text-gray-300">{f.name}</span>
                <span className="text-gray-700 dark:text-gray-400">{f.gramsUsed} g</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="transition-all duration-200 hover:shadow-lg dark:bg-gray-900/50 dark:border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="dark:text-white">Filamentos perto de acabar</CardTitle>
            <AlertTriangle className="h-4 w-4 text-amber-500 dark:text-amber-400" />
          </CardHeader>
          <CardContent className="space-y-2">
            {stats.filaments.lowStock.length === 0 && (
              <p className="text-sm text-gray-600 dark:text-gray-400">Nenhum alerta de estoque.</p>
            )}
            {stats.filaments.lowStock.map((f) => (
              <div key={f.id} className="flex justify-between text-sm">
                <span className="dark:text-gray-300">{f.name}</span>
                <span className="text-gray-700 dark:text-gray-400">{f.currentStock} g</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </PlanFeatureGuard>

    {/* Estoque e Inventário */}
    <PlanFeatureGuard requiredPlan="intermediario" featureName="Análise de estoque e inventário">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="transition-all duration-200 hover:shadow-lg hover:-translate-y-1 dark:bg-gray-900/50 dark:border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium dark:text-white">Valor estoque filamento</CardTitle>
            <Layers className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold dark:text-white">R$ {stats.stock.totalFilamentStockValue.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card className="dark:bg-gray-900/50 dark:border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium dark:text-white">Valor estoque normal</CardTitle>
            <Package className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold dark:text-white">R$ {stats.stock.totalStockValue.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card className="dark:bg-gray-900/50 dark:border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium dark:text-white">Valor total inventário</CardTitle>
            <PiggyBank className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold dark:text-white">R$ {stats.stock.totalInventoryValue.toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>
    </PlanFeatureGuard>

    {!hasData && (
      <Card>
        <CardContent>
          <p className="text-sm text-red-600">Não foi possível carregar os dados.</p>
        </CardContent>
      </Card>
    )}

    </div>
  );
}

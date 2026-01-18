'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, Loader2 } from 'lucide-react';
import { LineChart as SimpleLineChart } from '@/components/charts/LineChart';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';

interface Product {
  id: string;
  name: string;
  finalPrice: number;
}

interface Platform {
  id: string;
  name: string;
  commissionPercentage: number;
  fixedFeePerItem?: number;
}

interface Sale {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  platformId: string;
  platformName: string;
  commission: number;
  tax: number;
  netValue: number;
  saleDate: string;
}

interface SaleFormData {
  productId: string;
  quantity: number;
  platformId: string;
  saleDate: string;
}

export default function SalesPage() {
  const router = useRouter();
  const [sales, setSales] = useState<Sale[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<SaleFormData>({
    productId: '',
    quantity: 1,
    platformId: '',
    saleDate: new Date().toISOString().split('T')[0],
  });
  const [preview, setPreview] = useState<Sale | null>(null);
  const [startDate, setStartDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(1);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const trend = useMemo(() => {
    const map = new Map<string, { gross: number; net: number; quantity: number }>();
    for (const s of sales) {
      const key = new Date(s.saleDate).toISOString().slice(0, 10);
      const curr = map.get(key) || { gross: 0, net: 0, quantity: 0 };
      curr.gross += Number(s.totalPrice) || 0;
      curr.net += Number(s.netValue) || 0;
      curr.quantity += Number(s.quantity) || 0;
      map.set(key, curr);
    }
    return Array.from(map.entries())
      .sort((a, b) => (a[0] < b[0] ? -1 : 1))
      .map(([date, v]) => ({ x: date.slice(5), Bruto: v.gross, Líquido: v.net, Quantidade: v.quantity }));
  }, [sales]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    Promise.all([fetchSales(), fetchProducts(), fetchPlatforms()]);
  }, []);

  const applyFilter = async () => {
    setLoading(true);
    await fetchSales();
    setLoading(false);
  };

  const formatDate = (d: Date) => d.toISOString().split('T')[0];
  const setPreset = async (preset: 'today' | 'month' | 'year' | '7days') => {
    const now = new Date();
    let start = new Date(now);
    let end = new Date(now);

    if (preset === 'today') {
      // start and end are today
    } else if (preset === 'month') {
      start = new Date(now.getFullYear(), now.getMonth(), 1);
    } else if (preset === 'year') {
      start = new Date(now.getFullYear(), 0, 1);
    } else if (preset === '7days') {
      start.setDate(now.getDate() - 6);
    }

    setStartDate(formatDate(start));
    setEndDate(formatDate(end));
    await applyFilter();
  };

  const fetchSales = async () => {
    try {
      const token = localStorage.getItem('token');
      const qs = startDate && endDate ? `?startDate=${startDate}&endDate=${endDate}` : '';
      const response = await fetch(`/api/sales${qs}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setSales(data);
      }
    } catch (error) {
      toast.error('Erro ao carregar vendas');
    }
  };

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/products', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      }
    } catch (error) {
      toast.error('Erro ao carregar produtos');
    }
  };

  const fetchPlatforms = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/platforms', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setPlatforms(data);
      }
    } catch (error) {
      toast.error('Erro ao carregar plataformas');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = e.target as HTMLInputElement;
    const newValue = type === 'number' ? parseFloat(value) : value;

    const newData = { ...formData, [name]: newValue };
    setFormData(newData);

    // Update preview
    if (newData.productId && newData.platformId) {
      const product = products.find((p) => p.id === newData.productId);
      const platform = platforms.find((p) => p.id === newData.platformId);

      if (product && platform) {
        const unitPrice = product.finalPrice;
        const totalPrice = unitPrice * newData.quantity;
        // Comissão já está incluída no preço final do produto
        // Venda é simples: quantidade × preço
        const commission = 0;
        const tax = 0;
        const netValue = totalPrice;

        setPreview({
          id: 'preview',
          productId: product.id,
          productName: product.name,
          quantity: newData.quantity,
          unitPrice,
          totalPrice,
          platformId: platform.id,
          platformName: platform.name,
          commission,
          tax,
          netValue,
          saleDate: newData.saleDate,
        });
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.productId || !formData.platformId) {
      toast.error('Selecione produto e plataforma');
      return;
    }

    setSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch('/api/sales', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success('Venda registrada com sucesso');
        await fetchSales();
        setFormData({
          productId: '',
          quantity: 1,
          platformId: '',
          saleDate: new Date().toISOString().split('T')[0],
        });
        setShowForm(false);
        setPreview(null);
      } else {
        const error = await response.json();
        toast.error(error.error || 'Erro ao registrar venda');
      }
    } catch (error) {
      console.error('Erro ao registrar venda:', error);
      toast.error('Erro ao registrar venda');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja deletar esta venda?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/sales/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        setSales(sales.filter((s) => s.id !== id));
        toast.success('Venda deletada com sucesso');
      } else {
        toast.error('Erro ao deletar venda');
      }
    } catch (error) {
      toast.error('Erro ao deletar venda');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Vendas
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Registre suas vendas por plataforma
          </p>
        </div>
        <Button
          className="bg-purple-600 hover:bg-purple-700"
          onClick={() => setShowForm(!showForm)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Nova Venda
        </Button>
      </div>

      {/* Filtro por período */}
      <Card className="dark:bg-gray-900/50 dark:border-gray-800">
        <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-4 py-4">
          <div>
            <Label>Início</Label>
            <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </div>
          <div>
            <Label>Fim</Label>
            <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>
          <div className="flex items-end">
            <Button onClick={applyFilter} className="w-full">Aplicar</Button>
          </div>
          <div className="flex items-end gap-2">
            <Button type="button" variant="outline" onClick={() => setPreset('today')}>Hoje</Button>
            <Button type="button" variant="outline" onClick={() => setPreset('7days')}>Últimos 7 dias</Button>
            <Button type="button" variant="outline" onClick={() => setPreset('month')}>Este mês</Button>
            <Button type="button" variant="outline" onClick={() => setPreset('year')}>Este ano</Button>
          </div>
        </CardContent>
      </Card>

      {/* Formulário */}
      {showForm && (
        <Card className="p-6 dark:bg-gray-900/50 dark:border-gray-800">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="productId">Produto *</Label>
                <select
                  id="productId"
                  name="productId"
                  value={formData.productId}
                  onChange={handleInputChange}
                  className="w-full rounded-md border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white p-2 disabled:bg-gray-100 dark:disabled:bg-gray-700"
                  disabled={submitting}
                >
                  <option value="">Selecione um produto</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name} (R$ {Number(product.finalPrice).toFixed(2)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="quantity">Quantidade</Label>
                <Input
                  id="quantity"
                  name="quantity"
                  type="number"
                  min="1"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  disabled={submitting}
                />
              </div>

              <div>
                <Label htmlFor="platformId">Plataforma *</Label>
                <select
                  id="platformId"
                  name="platformId"
                  value={formData.platformId}
                  onChange={handleInputChange}
                  className="w-full rounded-md border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white p-2 disabled:bg-gray-100 dark:disabled:bg-gray-700"
                  disabled={submitting}
                >
                  <option value="">Selecione uma plataforma</option>
                  {platforms.map((platform) => (
                    <option key={platform.id} value={platform.id}>
                      {platform.name} ({platform.commissionPercentage}%)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="saleDate">Data da Venda</Label>
                <Input
                  id="saleDate"
                  name="saleDate"
                  type="date"
                  value={formData.saleDate}
                  onChange={handleInputChange}
                  disabled={submitting}
                />
              </div>
            </div>

            {/* Preview */}
            {preview && (
              <div className="rounded-md bg-blue-50 dark:bg-blue-950/30 p-4 space-y-2">
                <p className="text-sm dark:text-gray-300">
                  <strong>Produto:</strong> {preview.productName}
                </p>
                <p className="text-sm dark:text-gray-300">
                  <strong>Valor Unitário:</strong> R$ {Number(preview.unitPrice).toFixed(2)}
                </p>
                <p className="text-sm dark:text-gray-300">
                  <strong>Quantidade:</strong> {preview.quantity}
                </p>
                <p className="text-sm dark:text-gray-300">
                  <strong>Total:</strong> R$ {Number(preview.totalPrice).toFixed(2)}
                </p>
                <p className="text-sm text-green-600 dark:text-green-400">
                  <strong>Valor Líquido:</strong> R$ {Number(preview.netValue).toFixed(2)}
                </p>
              </div>
            )}

            <div className="flex gap-2">
              <Button type="submit" disabled={submitting} className="flex-1">
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Registrar Venda
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowForm(false)}
                disabled={submitting}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Lista de Vendas */}
      <Card className="dark:bg-gray-900/50 dark:border-gray-800">
        <CardHeader>
          <CardTitle className="dark:text-white">Tendência de vendas</CardTitle>
        </CardHeader>
        <CardContent>
          {trend.length === 0 ? (
            <p className="text-sm text-gray-600 dark:text-gray-400">Sem dados no período selecionado.</p>
          ) : (
            <SimpleLineChart
              height={260}
              data={trend}
              series={[
                { key: 'Bruto', label: 'Bruto', color: '#7c3aed' },
                { key: 'Líquido', label: 'Líquido', color: '#10b981' },
                { key: 'Quantidade', label: 'Quantidade', color: '#3b82f6' },
              ]}
            />
          )}
        </CardContent>
      </Card>
      <Card className="dark:bg-gray-900/50 dark:border-gray-800">
        <CardHeader>
          <CardTitle className="dark:text-white">Histórico de Vendas ({sales.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {sales.length === 0 ? (
            <p className="text-center text-gray-600 dark:text-gray-400 py-8">
              Nenhuma venda registrada ainda
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produto</TableHead>
                    <TableHead className="text-right">Quantidade</TableHead>
                    <TableHead className="text-right">Valor Unit.</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead>Plataforma</TableHead>
                    <TableHead className="text-right">Valor Líquido</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sales.map((sale) => (
                    <TableRow key={sale.id}>
                      <TableCell className="font-medium">
                        {sale.productName}
                      </TableCell>
                      <TableCell className="text-right">
                        {sale.quantity}
                      </TableCell>
                      <TableCell className="text-right">
                        R$ {Number(sale.unitPrice).toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right">
                        R$ {Number(sale.totalPrice).toFixed(2)}
                      </TableCell>
                      <TableCell>{sale.platformName}</TableCell>
                      <TableCell className="text-right text-green-600 dark:text-green-400 font-medium">
                        R$ {Number(sale.netValue).toFixed(2)}
                      </TableCell>
                      <TableCell>
                        {new Date(sale.saleDate).toLocaleDateString('pt-BR')}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(sale.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
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

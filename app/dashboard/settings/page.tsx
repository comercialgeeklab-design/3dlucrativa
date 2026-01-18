'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { PlanFeatureGuard } from '@/components/PlanFeatureGuard';
import { toast } from 'sonner';

interface Store {
  id: string;
  storeName: string;
  logo?: string;
  description?: string;
  cep?: string;
  street?: string;
  number?: string;
  city?: string;
  state?: string;
  paysTax?: boolean;
  taxPercentage?: number;
  energyCostPerKwh?: number;
}

export default function SettingsPage() {
  const router = useRouter();
  const [store, setStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    fetchStore();
  }, [router]);

  const fetchStore = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/stores/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        // Store não existe ainda, criar uma vazia
        setStore({
          id: '',
          storeName: '',
        });
      } else {
        const data = await response.json();
        setStore(data);
      }
    } catch (error) {
      toast.error('Erro ao carregar dados da loja');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!store) return;

    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/stores/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(store),
      });

      if (!response.ok) {
        throw new Error('Erro ao salvar dados');
      }

      toast.success('Configurações salvas com sucesso!');
    } catch (error) {
      toast.error('Erro ao salvar configurações');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !store) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Configurações da Loja
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Configure as informações da sua loja
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informações Básicas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="storeName">Nome da Loja</Label>
            <Input
              id="storeName"
              value={store.storeName}
              onChange={(e) =>
                setStore({ ...store, storeName: e.target.value })
              }
              placeholder="Minha Loja 3D"
            />
          </div>

          <div>
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={store.description || ''}
              onChange={(e) =>
                setStore({ ...store, description: e.target.value })
              }
              placeholder="Descreva sua loja..."
            />
          </div>

          {/* Logo Upload - Restricted Feature */}
          <PlanFeatureGuard requiredPlan="avancado" featureName="Logo personalizado para PDFs">
            <div>
              <Label htmlFor="logo">Logo da Loja (para PDFs e exportações)</Label>
              <Input
                id="logo"
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                      setStore({ ...store, logo: event.target?.result as string });
                    };
                    reader.readAsDataURL(file);
                  }
                }}
              />
              {store.logo && (
                <div className="mt-2">
                  <p className="text-sm text-gray-600 mb-2">Preview:</p>
                  <img src={store.logo} alt="Logo" className="h-24 w-24 object-contain" />
                </div>
              )}
            </div>
          </PlanFeatureGuard>

          <div>
            <Label htmlFor="cep">CEP</Label>
            <Input
              id="cep"
              value={store.cep || ''}
              onChange={(e) => setStore({ ...store, cep: e.target.value })}
              placeholder="00000-000"
            />
          </div>

          <div>
            <Label htmlFor="street">Rua</Label>
            <Input
              id="street"
              value={store.street || ''}
              onChange={(e) => setStore({ ...store, street: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="number">Número</Label>
              <Input
                id="number"
                value={store.number || ''}
                onChange={(e) =>
                  setStore({ ...store, number: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="city">Cidade</Label>
              <Input
                id="city"
                value={store.city || ''}
                onChange={(e) => setStore({ ...store, city: e.target.value })}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="state">Estado</Label>
            <Input
              id="state"
              maxLength={2}
              value={store.state || ''}
              onChange={(e) => setStore({ ...store, state: e.target.value })}
              placeholder="SP"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Configurações Financeiras</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <PlanFeatureGuard requiredPlan="intermediario" featureName="Configurações avançadas de precificação">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="paysTax"
                checked={store.paysTax || false}
                onChange={(e) =>
                  setStore({ ...store, paysTax: e.target.checked })
                }
              />
              <Label htmlFor="paysTax">Minha loja paga impostos</Label>
            </div>

            {store.paysTax && (
              <div>
                <Label htmlFor="taxPercentage">Percentual de Imposto (%)</Label>
                <Input
                  id="taxPercentage"
                  type="number"
                  step="0.01"
                  value={store.taxPercentage || 0}
                  onChange={(e) =>
                    setStore({
                      ...store,
                      taxPercentage: parseFloat(e.target.value),
                    })
                  }
                />
              </div>
            )}

            <div>
              <Label htmlFor="energyCostPerKwh">Custo de Energia por Hora (R$/h)</Label>
              <Input
                id="energyCostPerKwh"
                type="number"
                step="0.01"
                value={store.energyCostPerKwh || 0}
                onChange={(e) =>
                  setStore({
                    ...store,
                    energyCostPerKwh: parseFloat(e.target.value),
                  })
                }
              />
            </div>
          </PlanFeatureGuard>
        </CardContent>
      </Card>

      <Button
        onClick={handleSave}
        disabled={saving}
        className="bg-purple-600 hover:bg-purple-700"
      >
        {saving ? 'Salvando...' : 'Salvar Configurações'}
      </Button>
    </div>
  );
}

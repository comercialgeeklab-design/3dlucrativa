'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { PlanFeatureGuard } from '@/components/PlanFeatureGuard';
import { toast } from 'sonner';

interface PlatformSettings {
  id: string;
  name: string;
  commissionPercentage: number;
  fixedFeePerItem: number;
}

export default function PlatformsPage() {
  const router = useRouter();
  const [settings, setSettings] = useState<PlatformSettings[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingCommission, setEditingCommission] = useState<number>(0);
  const [editingFixedFee, setEditingFixedFee] = useState<number>(0);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    fetchSettings();
  }, [router]);

  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/platforms', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setSettings(data);
      } else {
        toast.error('Erro ao carregar plataformas');
      }
    } catch (error) {
      toast.error('Erro ao carregar plataformas');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (platformId: string, newCommission: number, newFixedFee: number) => {
    if (!Number.isFinite(newCommission) || newCommission < 0 || newCommission > 100) {
      toast.error('Comissão deve estar entre 0 e 100%');
      return;
    }

    if (!Number.isFinite(newFixedFee) || newFixedFee < 0) {
      toast.error('Taxa fixa deve ser positiva');
      return;
    }

    setSaving(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/platforms/${platformId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ commissionPercentage: newCommission, fixedFeePerItem: newFixedFee }),
      });

      if (response.ok) {
        setSettings(
          settings.map((s) =>
            s.id === platformId
              ? { ...s, commissionPercentage: newCommission, fixedFeePerItem: newFixedFee }
              : s,
          ),
        );
        setEditingId(null);
        toast.success('Configuração atualizada');
      } else {
        const errorBody = await response.json();
        toast.error(errorBody.error || 'Erro ao atualizar');
      }
    } catch (error) {
      toast.error('Erro ao atualizar plataforma');
    } finally {
      setSaving(false);
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
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Plataformas</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Configure comissão e taxa fixa por item vendido.</p>
      </div>

      <PlanFeatureGuard requiredPlan="intermediario" featureName="Configuração de plataformas">
        <Card>
          <CardHeader>
            <CardTitle>Comissionamento</CardTitle>
          </CardHeader>
          <CardContent>
          <div className="space-y-4">
            {settings.map((platform) => (
              <div
                key={platform.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
              >
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">{platform.name}</h3>
                  <p className="text-sm text-gray-500">Ajuste a comissão e a taxa fixa aplicada nas vendas.</p>
                </div>

                {editingId === platform.id ? (
                  <div className="flex flex-col gap-3 items-start">
                    <div className="flex flex-wrap gap-4 items-center">
                      <div className="flex items-center gap-2">
                        <Label className="text-sm">Comissão</Label>
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          step="0.1"
                          value={editingCommission}
                          onChange={(e) => setEditingCommission(parseFloat(e.target.value))}
                          className="w-24"
                        />
                        <span className="text-gray-600">%</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Label className="text-sm">Taxa fixa</Label>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={editingFixedFee}
                          onChange={(e) => setEditingFixedFee(parseFloat(e.target.value))}
                          className="w-28"
                        />
                        <span className="text-gray-600">R$</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleSave(platform.id, editingCommission, editingFixedFee)}
                        disabled={saving}
                      >
                        {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                        Salvar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingId(null)}
                        disabled={saving}
                      >
                        Cancelar
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-4 items-center">
                    <div className="text-right">
                      <p className="text-2xl font-bold text-purple-600">{platform.commissionPercentage}%</p>
                      <p className="text-sm text-gray-600">Taxa fixa: R$ {Number(platform.fixedFeePerItem || 0).toFixed(2)}</p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setEditingId(platform.id);
                        setEditingCommission(platform.commissionPercentage);
                        setEditingFixedFee(platform.fixedFeePerItem || 0);
                      }}
                    >
                      Editar
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      </PlanFeatureGuard>
    </div>
  );
}

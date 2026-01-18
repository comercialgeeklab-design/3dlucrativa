'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PlanFeatureGuard } from '@/components/PlanFeatureGuard';
import { toast } from 'sonner';

interface Filament {
  id: string;
  type: string;
  color: string;
  manufacturer: string;
  currentStock: number;
  pricePerGram: number;
  totalValue: number;
}

export default function FilamentsPage() {
  const router = useRouter();
  const [filaments, setFilaments] = useState<Filament[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    fetchFilaments();
  }, []);

  const fetchFilaments = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/filaments', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Erro ao buscar filamentos');
      }

      const data = await response.json();
      setFilaments(data);
    } catch (error) {
      toast.error('Erro ao carregar filamentos');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja deletar este filamento?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/filaments/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Erro ao deletar filamento');
      }

      setFilaments(filaments.filter((f) => f.id !== id));
      toast.success('Filamento deletado com sucesso');
    } catch (error) {
      toast.error('Erro ao deletar filamento');
    }
  };

  if (loading) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Filamentos
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Gerencie seu estoque de filamentos
          </p>
        </div>
        <PlanFeatureGuard requiredPlan="intermediario" featureName="Gerenciamento de filamentos">
          <Button
            className="bg-purple-600 hover:bg-purple-700"
            onClick={() => router.push('/dashboard/filaments/new')}
          >
            <Plus className="h-4 w-4 mr-2" />
            Novo Filamento
          </Button>
        </PlanFeatureGuard>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Seus Filamentos ({filaments.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filaments.length === 0 ? (
            <p className="text-center text-gray-600 dark:text-gray-400 py-8">
              Nenhum filamento cadastrado ainda
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Cor</TableHead>
                  <TableHead>Fabricante</TableHead>
                  <TableHead>Estoque (g)</TableHead>
                  <TableHead>Preço/g</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filaments.map((filament) => (
                  <TableRow key={filament.id}>
                    <TableCell className="font-medium">{filament.type}</TableCell>
                    <TableCell>{filament.color}</TableCell>
                    <TableCell>{filament.manufacturer}</TableCell>
                    <TableCell>{Number(filament.currentStock).toFixed(2)}</TableCell>
                    <TableCell>R$ {Number(filament.pricePerGram).toFixed(4)}</TableCell>
                    <TableCell>R$ {Number(filament.totalValue).toFixed(2)}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(filament.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

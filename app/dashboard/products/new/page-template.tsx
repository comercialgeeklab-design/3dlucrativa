'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, Edit2 } from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';

interface ProductFilament {
  filamentId: string;
  gramsUsed: number;
  filament?: {
    id: string;
    type: string;
    color: string;
    manufacturer: string;
    pricePerGram: number;
  };
}

interface Product {
  id: string;
  name: string;
  description?: string;
  photo?: string;
  finalPrice: number;
  printingHours: number;
  profitMarginPercentage: number;
  isActive: boolean;
  createdAt: string;
  productFilaments?: ProductFilament[];
}

export default function ProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/products', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Erro ao buscar produtos');
      }

      const data = await response.json();
      setProducts(data);
    } catch (error) {
      toast.error('Erro ao carregar produtos');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja deletar este produto?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Erro ao deletar produto');
      }

      setProducts(products.filter((p) => p.id !== id));
      toast.success('Produto deletado com sucesso');
    } catch (error) {
      toast.error('Erro ao deletar produto');
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
            Produtos
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Gerencie seus produtos e seus preços
          </p>
        </div>
        <Button
          className="bg-purple-600 hover:bg-purple-700"
          onClick={() => router.push('/dashboard/products/new')}
        >
          <Plus className="h-4 w-4 mr-2" />
          Novo Produto
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Seus Produtos ({products.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {products.length === 0 ? (
            <p className="text-center text-gray-600 dark:text-gray-400 py-8">
              Nenhum produto cadastrado ainda
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {products.map((product) => {
                const totalGramas =
                  product.productFilaments?.reduce((sum, pf) => sum + pf.gramsUsed, 0) || 0;

                return (
                  <div
                    key={product.id}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden hover:shadow-lg transition-shadow flex flex-col"
                  >
                    {/* Foto do Produto */}
                    <div className="relative w-full h-32 bg-gray-100 dark:bg-gray-800 overflow-hidden">
                      {product.photo ? (
                        <img
                          src={product.photo}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                          Sem foto
                        </div>
                      )}
                    </div>

                    {/* Informações do Produto */}
                    <div className="p-3 space-y-2 flex-1 flex flex-col">
                      {/* Nome e Status */}
                      <div className="flex justify-between items-start gap-2">
                        <h3 className="font-semibold text-sm text-gray-900 dark:text-white truncate">
                          {product.name}
                        </h3>
                        <span
                          className={`px-2 py-0.5 rounded text-xs font-medium whitespace-nowrap ${
                            product.isActive
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          }`}
                        >
                          {product.isActive ? 'Ativo' : 'Inativo'}
                        </span>
                      </div>

                      {/* Descrição (escondida em mobile) */}
                      {product.description && (
                        <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-1 hidden md:block">
                          {product.description}
                        </p>
                      )}

                      {/* Filamentos - resumido */}
                      {product.productFilaments && product.productFilaments.length > 0 && (
                        <div className="bg-gray-50 dark:bg-gray-900 rounded p-2">
                          <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                            {totalGramas}g de filamento
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {product.productFilaments.map((pf, idx) => (
                              <span
                                key={idx}
                                className="text-xs bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-0.5 rounded"
                              >
                                {pf.filament?.color.slice(0, 3)}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Preço */}
                      <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                        <p className="text-xs text-gray-500 dark:text-gray-400">Preço</p>
                        <p className="text-lg font-bold text-purple-600 dark:text-purple-400">
                          R$ {Number(product.finalPrice).toFixed(2)}
                        </p>
                      </div>

                      {/* Detalhes rápidos */}
                      <div className="grid grid-cols-3 gap-1 text-xs">
                        <div>
                          <p className="text-gray-500">Impressão</p>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {Number(product.printingHours).toFixed(1)}h
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500">Margem</p>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {product.profitMarginPercentage}%
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500">Data</p>
                          <p className="font-semibold text-gray-900 dark:text-white text-xs">
                            {new Date(product.createdAt).toLocaleDateString('pt-BR', {
                              day: '2-digit',
                              month: '2-digit',
                            })}
                          </p>
                        </div>
                      </div>

                      {/* Ações */}
                      <div className="flex gap-2 mt-auto pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 text-xs h-8"
                          disabled
                          title="Em breve"
                        >
                          <Edit2 className="h-3 w-3 mr-1" />
                          Editar
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="flex-1 text-xs h-8 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                          onClick={() => handleDelete(product.id)}
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          Deletar
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

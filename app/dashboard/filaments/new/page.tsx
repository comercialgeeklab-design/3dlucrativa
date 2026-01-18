'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { ArrowLeft, Loader2 } from 'lucide-react';

const FILAMENT_TYPES = ['PLA', 'ABS', 'PETG', 'TPU', 'Nylon', 'ASA', 'Outro'];
const PRESET_COLORS = [
  { name: 'Vermelho', hex: '#EF4444' },
  { name: 'Azul', hex: '#3B82F6' },
  { name: 'Branco', hex: '#FFFFFF' },
  { name: 'Preto', hex: '#000000' },
  { name: 'Verde', hex: '#22C55E' },
  { name: 'Amarelo', hex: '#FBBF24' },
  { name: 'Laranja', hex: '#F97316' },
  { name: 'Rosa', hex: '#EC4899' },
  { name: 'Roxo', hex: '#A855F7' },
  { name: 'Ciano', hex: '#06B6D4' },
];

interface FilamentFormData {
  type: string;
  color: string;
  colorHex: string;
  manufacturer: string;
  initialStock: number;
  purchasePrice: number;
}

export default function NewFilamentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FilamentFormData>({
    type: '',
    color: '',
    colorHex: '#000000',
    manufacturer: '',
    initialStock: 0,
    purchasePrice: 0,
  });
  const [pricePerGram, setPricePerGram] = useState<number>(0);

  // Calcular preço por grama quando quantity ou purchasePrice mudam
  useEffect(() => {
    if (formData.initialStock > 0 && formData.purchasePrice > 0) {
      setPricePerGram(formData.purchasePrice / formData.initialStock);
    } else {
      setPricePerGram(0);
    }
  }, [formData.initialStock, formData.purchasePrice]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = e.target as HTMLInputElement;
    const newValue = type === 'number' ? parseFloat(value) : value;

    setFormData((prev) => ({
      ...prev,
      [name]: newValue,
    }));
  };

  const handleColorChange = (hex: string, name: string = '') => {
    setFormData((prev) => ({
      ...prev,
      colorHex: hex,
      color: name || prev.color,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.type || !formData.color || !formData.manufacturer) {
      toast.error('Preencha todos os campos obrigatórios (Tipo, Cor e Fabricante)');
      return;
    }

    if (formData.initialStock <= 0) {
      toast.error('Quantidade inicial deve ser maior que zero');
      return;
    }

    if (formData.purchasePrice <= 0) {
      toast.error('Preço de compra deve ser maior que zero');
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch('/api/filaments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          type: formData.type,
          color: formData.color,
          colorHex: formData.colorHex,
          manufacturer: formData.manufacturer,
          currentStock: formData.initialStock,
          totalValue: formData.purchasePrice,
          pricePerGram: pricePerGram,
        }),
      });

      if (response.ok) {
        toast.success('Filamento criado com sucesso');
        router.push('/dashboard/filaments');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Erro ao criar filamento');
      }
    } catch (error) {
      console.error('Erro ao criar filamento:', error);
      toast.error('Erro ao criar filamento');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-3xl font-bold">Novo Filamento</h1>
      </div>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informações Básicas */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Informações Básicas</h2>

            <div>
              <Label htmlFor="type">Tipo de Filamento *</Label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                className="w-full rounded-md border border-gray-300 p-2 disabled:bg-gray-100"
                disabled={loading}
              >
                <option value="">Selecione um tipo</option>
                {FILAMENT_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="color">Cor *</Label>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    id="color"
                    name="color"
                    value={formData.color}
                    onChange={handleInputChange}
                    placeholder="Ex: Vermelho, Azul, Branco"
                    disabled={loading}
                    className="flex-1"
                  />
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={formData.colorHex}
                      onChange={(e) => handleColorChange(e.target.value)}
                      disabled={loading}
                      className="h-10 w-16 rounded-md border border-gray-300 cursor-pointer"
                      title="Selecionar cor"
                    />
                  </div>
                </div>

                {/* Cores Pré-definidas */}
                <div>
                  <p className="text-sm text-gray-600 mb-2">Cores sugeridas:</p>
                  <div className="grid grid-cols-5 gap-2">
                    {PRESET_COLORS.map((preset) => (
                      <button
                        key={preset.hex}
                        type="button"
                        onClick={() => handleColorChange(preset.hex, preset.name)}
                        disabled={loading}
                        className={`h-10 rounded-md border-2 transition-all hover:scale-105 ${
                          formData.colorHex === preset.hex
                            ? 'border-gray-800'
                            : 'border-gray-300'
                        }`}
                        style={{ backgroundColor: preset.hex }}
                        title={preset.name}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Cor selecionada: <strong>{formData.color || 'Nenhuma'}</strong> ({formData.colorHex})
                  </p>
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="manufacturer">Fabricante *</Label>
              <Input
                id="manufacturer"
                name="manufacturer"
                value={formData.manufacturer}
                onChange={handleInputChange}
                placeholder="Ex: Creality, Anycubic"
                disabled={loading}
              />
            </div>
          </div>

          {/* Estoque Inicial */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Compra Inicial</h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="initialStock">Quantidade (g) *</Label>
                <Input
                  id="initialStock"
                  name="initialStock"
                  type="number"
                  step="0.1"
                  min="0"
                  value={formData.initialStock}
                  onChange={handleInputChange}
                  placeholder="Ex: 1000"
                  disabled={loading}
                />
              </div>

              <div>
                <Label htmlFor="purchasePrice">Preço Total (R$) *</Label>
                <Input
                  id="purchasePrice"
                  name="purchasePrice"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.purchasePrice}
                  onChange={handleInputChange}
                  placeholder="Ex: 85.00"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Cálculo Automático */}
            {formData.initialStock > 0 && formData.purchasePrice > 0 && (
              <div className="rounded-md bg-blue-50 p-4">
                <p className="text-sm text-gray-600">
                  Preço por grama: <strong>R$ {pricePerGram.toFixed(4)}</strong>
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Calculado automaticamente: {formData.purchasePrice} ÷ {formData.initialStock.toFixed(1)}g
                </p>
              </div>
            )}
          </div>

          {/* Botões */}
          <div className="flex gap-4">
            <Button
              type="submit"
              disabled={loading}
              className="flex-1"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Criar Filamento
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={loading}
              className="flex-1"
            >
              Cancelar
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

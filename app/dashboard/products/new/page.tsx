'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { PlanFeatureGuard } from '@/components/PlanFeatureGuard';
import { toast } from 'sonner';
import { ArrowLeft, Loader2, Trash2, Plus } from 'lucide-react';

interface Filament {
  id: string;
  type: string;
  color: string;
  manufacturer: string;
  currentStock: number;
  pricePerGram: number;
}

interface Platform {
  id: string;
  name: string;
  commissionPercentage: number;
  fixedFeePerItem?: number;
}

interface FilamentUsage {
  filamentId: string;
  gramsUsed: number;
}

interface ProductFormData {
  name: string;
  description: string;
  filaments: FilamentUsage[];
  printingHours: number;
  desiredMarginPercentage: number;
  platforms: string[];
  stlFile?: File;
  photoFile?: File;
}

export default function NewProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [filaments, setFilaments] = useState<Filament[]>([]);
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [energyCostPerKwh, setEnergyCostPerKwh] = useState<number>(0);
  const [paysTax, setPaysTax] = useState<boolean>(false);
  const [taxPercentage, setTaxPercentage] = useState<number>(0);
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    filaments: [{ filamentId: '', gramsUsed: 0 }],
    printingHours: 0,
    desiredMarginPercentage: 30,
    platforms: [],
  });
  const [calculatedPrice, setCalculatedPrice] = useState<number>(0);
  const [finalPrice, setFinalPrice] = useState<number>(0);
  const [finalPriceTouched, setFinalPriceTouched] = useState<boolean>(false);

  const calculatePrice = useCallback(() => {
    let totalFilamentCost = 0;

    formData.filaments.forEach((filamentUsage) => {
      const filament = filaments.find((f) => f.id === filamentUsage.filamentId);
      if (filament) {
        totalFilamentCost += Number(filament.pricePerGram) * filamentUsage.gramsUsed;
      }
    });

    const energyCost = formData.printingHours * energyCostPerKwh;

    const totalCost = totalFilamentCost + energyCost;
    let basePriceWithMargin = totalCost * (1 + formData.desiredMarginPercentage / 100);

    if (paysTax && taxPercentage > 0) {
      basePriceWithMargin = basePriceWithMargin * (1 + taxPercentage / 100);
    }

    const price = Math.max(0, basePriceWithMargin);
    const roundedPrice = Number(price.toFixed(2));
    setCalculatedPrice(roundedPrice);

    if (!finalPriceTouched) {
      let finalAutoPrice = price;
      if (formData.platforms.length > 0) {
        finalAutoPrice = platforms
          .filter((p) => formData.platforms.includes(p.id))
          .reduce((max, platform) => {
            const commissionRate = Number(platform.commissionPercentage) / 100;
            const fixedFee = Number(platform.fixedFeePerItem || 0);
            const denom = 1 - commissionRate;
            const suggested = denom > 0 ? (price + fixedFee) / denom : price + fixedFee;
            return Math.max(max, suggested);
          }, price);
      }
      const roundedFinal = Number(finalAutoPrice.toFixed(2));
      setFinalPrice(roundedFinal);
    }
  }, [formData.filaments, formData.printingHours, formData.desiredMarginPercentage, formData.platforms, energyCostPerKwh, paysTax, taxPercentage, filaments, platforms, finalPriceTouched]);

  useEffect(() => {
    calculatePrice();
  }, [calculatePrice]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/login');
          return;
        }

        const filResponse = await fetch('/api/filaments', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (filResponse.ok) {
          const filData = await filResponse.json();
          setFilaments(filData);
        }

        const platResponse = await fetch('/api/platforms', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (platResponse.ok) {
          const platData = await platResponse.json();
          setPlatforms(platData);
        }
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        toast.error('Erro ao carregar filamentos e plataformas');
      } finally {
        setLoadingData(false);
      }
    };

    fetchData();
  }, [router]);

  useEffect(() => {
    const fetchStoreSettings = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await fetch('/api/store/settings', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          const data = await response.json();
          setEnergyCostPerKwh(data.energyCostPerKwh || 0);
          setPaysTax(data.paysTax || false);
          setTaxPercentage(data.taxPercentage || 0);
        }
      } catch (error) {
        console.error('Erro ao carregar configuracoes da loja:', error);
      }
    };

    fetchStoreSettings();
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = e.target as HTMLInputElement;
    const newValue = type === 'number' ? parseFloat(value) : value;

    if (name === 'printingHours' || name === 'desiredMarginPercentage') {
      setFinalPriceTouched(false);
    }

    setFormData((prev) => ({
      ...prev,
      [name]: newValue,
    }));
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    fileType: 'stlFile' | 'photoFile',
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Arquivo muito grande. Maximo 5MB. Comprima a imagem.');
        return;
      }

      setFormData((prev) => ({
        ...prev,
        [fileType]: file,
      }));
    }
  };

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          const maxDim = 800;
          if (width > maxDim || height > maxDim) {
            const ratio = Math.min(maxDim / width, maxDim / height);
            width *= ratio;
            height *= ratio;
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const compressed = canvas.toDataURL('image/jpeg', 0.7);
            resolve(compressed);
          } else {
            reject(new Error('Nao foi possivel comprimir a imagem'));
          }
        };
        img.onerror = () => reject(new Error('Erro ao carregar imagem'));
      };
      reader.onerror = () => reject(new Error('Erro ao ler arquivo'));
    });
  };

  const handlePlatformToggle = (platformId: string) => {
    setFormData((prev) => ({
      ...prev,
      platforms: prev.platforms.includes(platformId)
        ? prev.platforms.filter((id) => id !== platformId)
        : [...prev.platforms, platformId],
    }));
    setFinalPriceTouched(false);
  };

  const handleAddFilament = () => {
    setFormData((prev) => ({
      ...prev,
      filaments: [...prev.filaments, { filamentId: '', gramsUsed: 0 }],
    }));
  };

  const handleRemoveFilament = (index: number) => {
    if (formData.filaments.length === 1) {
      toast.error('Voce precisa de pelo menos um filamento');
      return;
    }
    setFormData((prev) => ({
      ...prev,
      filaments: prev.filaments.filter((_, i) => i !== index),
    }));
  };

  const handleFilamentChange = (index: number, field: 'filamentId' | 'gramsUsed', value: string | number) => {
    setFinalPriceTouched(false);
    setFormData((prev) => ({
      ...prev,
      filaments: prev.filaments.map((f, i) =>
        i === index
          ? {
              ...f,
              [field]: field === 'gramsUsed' ? parseFloat(value as string) || 0 : value,
            }
          : f,
      ),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || formData.filaments.some((f) => !f.filamentId || f.gramsUsed <= 0)) {
      toast.error('Preencha nome, selecione filamentos e defina quantidade de gramas');
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      let photoBase64 = '';
      if (formData.photoFile) {
        try {
          photoBase64 = await compressImage(formData.photoFile);
        } catch (error) {
          toast.error('Erro ao processar imagem');
          setLoading(false);
          return;
        }
      }

      const submitData = new FormData();
      submitData.append('name', formData.name);
      submitData.append('description', formData.description);
      submitData.append('filaments', JSON.stringify(formData.filaments));
      submitData.append('printingHours', formData.printingHours.toString());
      submitData.append(
        'desiredMarginPercentage',
        formData.desiredMarginPercentage.toString(),
      );
      submitData.append('platforms', JSON.stringify(formData.platforms));
      submitData.append('photoBase64', photoBase64);
      submitData.append('finalPrice', finalPrice.toString());

      const response = await fetch('/api/products/create', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: submitData,
      });

      if (response.ok) {
        toast.success('Produto criado com sucesso');
        router.push('/dashboard/products');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Erro ao criar produto');
      }
    } catch (error) {
      console.error('Erro ao criar produto:', error);
      toast.error('Erro ao criar produto');
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

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
        <h1 className="text-3xl font-bold">Novo Produto</h1>
      </div>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Informacoes Basicas</h2>

            <div>
              <Label htmlFor="name">Nome do Produto *</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Ex: Suporte de Celular"
                disabled={loading}
              />
            </div>

            <div>
              <Label htmlFor="description">Descricao</Label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Descreva o produto"
                className="w-full rounded-md border border-gray-300 p-2 text-sm disabled:bg-gray-100"
                disabled={loading}
              />
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Configuracoes de Producao</h2>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Filamentos Utilizados *</Label>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleAddFilament}
                  disabled={loading}
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Adicionar Filamento
                </Button>
              </div>

              {formData.filaments.map((filamentUsage, index) => {
                const selectedFilament = filaments.find((f) => f.id === filamentUsage.filamentId);
                const costForThis = selectedFilament
                  ? selectedFilament.pricePerGram * filamentUsage.gramsUsed
                  : 0;

                return (
                  <div
                    key={index}
                    className="flex gap-3 rounded-lg border border-gray-200 p-4"
                  >
                    <div className="flex-1 space-y-2">
                      <select
                        value={filamentUsage.filamentId}
                        onChange={(e) => handleFilamentChange(index, 'filamentId', e.target.value)}
                        className="w-full rounded-md border border-gray-300 p-2 text-sm disabled:bg-gray-100"
                        disabled={loading}
                      >
                        <option value="">Selecione um filamento</option>
                        {filaments.map((filament) => (
                          <option key={filament.id} value={filament.id}>
                            {filament.type} - {filament.color} ({filament.manufacturer})
                            {' '}
                            - R$ {Number(filament.pricePerGram).toFixed(4)}/g
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex-1 space-y-2">
                      <Input
                        type="number"
                        min="0"
                        step="0.1"
                        placeholder="Gramas"
                        value={filamentUsage.gramsUsed || ''}
                        onChange={(e) =>
                          handleFilamentChange(index, 'gramsUsed', e.target.value)
                        }
                        disabled={loading}
                      />
                      {selectedFilament && filamentUsage.gramsUsed > 0 && (
                        <p className="text-xs text-gray-600">
                          R$ {costForThis.toFixed(2)}
                        </p>
                      )}
                    </div>

                    {formData.filaments.length > 1 && (
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => handleRemoveFilament(index)}
                        disabled={loading}
                        className="mt-2"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="printingHours">Horas de Impressao</Label>
                <Input
                  id="printingHours"
                  name="printingHours"
                  type="number"
                  step="0.1"
                  min="0"
                  value={formData.printingHours}
                  onChange={handleInputChange}
                  disabled={loading}
                />
                {energyCostPerKwh > 0 && (
                  <p className="mt-1 text-xs text-gray-600">
                    Custo de energia: {formData.printingHours.toFixed(2)}h x R$ {Number(energyCostPerKwh).toFixed(2)}/h = R$ {(formData.printingHours * Number(energyCostPerKwh)).toFixed(2)}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="desiredMarginPercentage">Margem Desejada (%)</Label>
                <Input
                  id="desiredMarginPercentage"
                  name="desiredMarginPercentage"
                  type="number"
                  min="0"
                  value={formData.desiredMarginPercentage}
                  onChange={handleInputChange}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Plataformas de Venda</h2>
              <div className="grid grid-cols-2 gap-4">
                {platforms.map((platform) => (
                  <label key={platform.id} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.platforms.includes(platform.id)}
                      onChange={() => handlePlatformToggle(platform.id)}
                      disabled={loading}
                    />
                    <span>
                      {platform.name} ({platform.commissionPercentage}%{typeof platform.fixedFeePerItem === 'number' && platform.fixedFeePerItem > 0 ? ` + R$ ${Number(platform.fixedFeePerItem).toFixed(2)}` : ''})
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <PlanFeatureGuard requiredPlan="intermediario" featureName="Precificacao automatica">
              <div className="rounded-lg border-2 border-blue-500 bg-blue-50 p-4">
                <h3 className="font-semibold text-blue-900">Calculo de Preco em Tempo Real</h3>
                <div className="mt-3 space-y-2">
                  <div className="text-xs font-semibold text-gray-700 uppercase">Custos:</div>
                  {formData.filaments.map((filamentUsage, index) => {
                    const filament = filaments.find((f) => f.id === filamentUsage.filamentId);
                    if (!filament || filamentUsage.gramsUsed <= 0) return null;
                    const cost = Number(filament.pricePerGram) * filamentUsage.gramsUsed;
                    return (
                      <div key={index} className="flex justify-between text-sm">
                        <span>
                          {filament.color} ({filamentUsage.gramsUsed}g):
                        </span>
                        <span>R$ {cost.toFixed(2)}</span>
                      </div>
                    );
                  })}
                  {energyCostPerKwh > 0 && (
                    <div className="flex justify-between text-sm">
                      <span>Custo de energia ({formData.printingHours.toFixed(2)}h):</span>
                      <span>R$ {(formData.printingHours * Number(energyCostPerKwh)).toFixed(2)}</span>
                    </div>
                  )}
                  
                  {paysTax && taxPercentage > 0 && (
                    <div className="flex justify-between text-sm text-orange-600">
                      <span>Impostos ({taxPercentage}%):</span>
                      <span>R$ {(() => {
                        let filamentCost = 0;
                        formData.filaments.forEach((filamentUsage) => {
                          const filament = filaments.find((f) => f.id === filamentUsage.filamentId);
                          if (filament) {
                            filamentCost += Number(filament.pricePerGram) * filamentUsage.gramsUsed;
                          }
                        });
                        const energyCostVal = formData.printingHours * Number(energyCostPerKwh);
                        const totalCost = filamentCost + energyCostVal;
                        const withMargin = totalCost * (1 + formData.desiredMarginPercentage / 100);
                        const taxValue = withMargin * (taxPercentage / 100);
                        return taxValue.toFixed(2);
                      })()}</span>
                    </div>
                  )}

                  <div className="border-t pt-2">
                    {(() => {
                      const platformBase = finalPriceTouched ? finalPrice : calculatedPrice;
                      return (
                        <>
                          <div className="text-sm font-semibold text-blue-900 mb-2">
                            Preco Base (sem comissao): R$ {platformBase.toFixed(2)}
                          </div>

                          {formData.platforms.length > 0 && (
                            <div className="mb-3 p-2 bg-purple-50 rounded border border-purple-200">
                              <div className="text-xs font-semibold text-purple-900 uppercase mb-2">Preco Sugerido por Plataforma:</div>
                              {platforms
                                .filter((p) => formData.platforms.includes(p.id))
                                .map((platform) => {
                                  const fixedFee = Number(platform.fixedFeePerItem || 0);
                                  const commissionRate = Number(platform.commissionPercentage) / 100;
                                  const denominator = 1 - commissionRate;
                                  const priceWithCommission = denominator > 0 ? (platformBase + fixedFee) / denominator : platformBase + fixedFee;
                                  return (
                                    <div key={platform.id} className="flex justify-between text-sm mb-1">
                                      <span className="text-purple-800">{platform.name} ({platform.commissionPercentage}%{fixedFee > 0 ? ` + R$ ${fixedFee.toFixed(2)}` : ''}):</span>
                                      <span className="font-semibold text-purple-800">R$ {priceWithCommission.toFixed(2)}</span>
                                    </div>
                                  );
                                })}
                            </div>
                          )}
                        </>
                      );
                    })()}
                    
                    <div>
                      <Label htmlFor="finalPrice">Preco Final *</Label>
                      <Input
                        id="finalPrice"
                        type="number"
                        step="0.01"
                        min="0"
                        value={Number(finalPrice.toFixed(2))}
                        onChange={(e) => {
                          setFinalPriceTouched(true);
                          setFinalPrice(parseFloat(e.target.value) || 0);
                        }}
                        disabled={loading}
                        className="font-semibold text-lg"
                      />
                      <p className="mt-1 text-xs text-gray-600">
                        Ajuste o preco conforme necessario
                      </p>
                    </div>
                    
                    {finalPrice > 0 && (() => {
                      let filamentCost = 0;
                      formData.filaments.forEach((filamentUsage) => {
                        const filament = filaments.find((f) => f.id === filamentUsage.filamentId);
                        if (filament) {
                          filamentCost += Number(filament.pricePerGram) * filamentUsage.gramsUsed;
                        }
                      });
                      const energyCostVal = formData.printingHours * Number(energyCostPerKwh);
                      const totalCost = filamentCost + energyCostVal;
                      
                      let priceBeforeTax = finalPrice;
                      let taxValue = 0;
                      if (paysTax && taxPercentage > 0) {
                        priceBeforeTax = finalPrice / (1 + taxPercentage / 100);
                        taxValue = finalPrice - priceBeforeTax;
                      }
                      
                      const profit = priceBeforeTax - totalCost;
                      const profitPercentage = totalCost > 0 ? (profit / totalCost) * 100 : 0;
                      
                      return (
                        <div className="mt-3 p-3 bg-green-50 rounded border border-green-200 space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="text-green-800 font-semibold">Margem Liquida Real:</span>
                            <span className="text-green-800 font-semibold">
                              {profitPercentage.toFixed(1)}% (R$ {profit.toFixed(2)})
                            </span>
                          </div>
                          {paysTax && taxPercentage > 0 && (
                            <div className="flex justify-between text-xs text-orange-700">
                              <span>Imposto sobre preco final ({taxPercentage}%):</span>
                              <span>R$ {taxValue.toFixed(2)}</span>
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </div>
            </PlanFeatureGuard>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Arquivos</h2>

            <div>
              <Label htmlFor="photoFile">
                Foto do Produto (sera salva no banco de dados)
              </Label>
              <Input
                id="photoFile"
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange(e, 'photoFile')}
                disabled={loading}
              />
              <p className="mt-1 text-xs text-gray-600">
                Formatos suportados: PNG, JPG, JPEG. Maximo 5MB. A foto sera comprimida automaticamente (reduzida para 800x800px, qualidade 70%) e salva no banco de dados.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <Button
              type="submit"
              disabled={loading}
              className="flex-1"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Criar Produto
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

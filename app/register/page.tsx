'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Package } from 'lucide-react';
import { toast } from 'sonner';

function RegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const planParam = searchParams.get('plan') || 'free';
  
  const [formData, setFormData] = useState({
    name: '',
    documentType: 'cpf' as 'cpf' | 'cnpj',
    cpf: '',
    cnpj: '',
    email: '',
    cep: '',
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
  });
  const [loading, setLoading] = useState(false);
  const [loadingCep, setLoadingCep] = useState(false);
  const [loadingCnpj, setLoadingCnpj] = useState(false);

  const handleCepBlur = async () => {
    if (formData.cep.replace(/\D/g, '').length !== 8) return;

    setLoadingCep(true);
    try {
      const response = await fetch(`/api/external/cep/${formData.cep}`);
      const data = await response.json();

      if (response.ok) {
        setFormData((prev) => ({
          ...prev,
          street: data.street || '',
          neighborhood: data.neighborhood || '',
          city: data.city || '',
          state: data.state || '',
        }));
        toast.success('Endereço preenchido automaticamente');
      }
    } catch (error) {
      toast.error('Erro ao buscar CEP');
    } finally {
      setLoadingCep(false);
    }
  };

  const handleCnpjBlur = async () => {
    if (formData.documentType !== 'cnpj' || formData.cnpj.replace(/\D/g, '').length !== 14) return;

    setLoadingCnpj(true);
    try {
      const response = await fetch(`/api/external/cnpj/${formData.cnpj}`);
      const data = await response.json();

      if (response.ok) {
        setFormData((prev) => ({
          ...prev,
          name: data.companyName || prev.name,
          cep: data.cep || prev.cep,
          street: data.street || prev.street,
          number: data.number || prev.number,
          complement: data.complement || prev.complement,
          neighborhood: data.neighborhood || prev.neighborhood,
          city: data.city || prev.city,
          state: data.state || prev.state,
        }));
        toast.success('Dados da empresa preenchidos automaticamente');
      }
    } catch (error) {
      toast.error('Erro ao buscar CNPJ');
    } finally {
      setLoadingCnpj(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          cpf: formData.documentType === 'cpf' ? formData.cpf : undefined,
          cnpj: formData.documentType === 'cnpj' ? formData.cnpj : undefined,
          email: formData.email,
          plan: planParam,
          address: {
            cep: formData.cep,
            street: formData.street,
            number: formData.number,
            complement: formData.complement,
            neighborhood: formData.neighborhood,
            city: formData.city,
            state: formData.state,
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || 'Erro ao realizar cadastro');
        return;
      }

      toast.success(`Cadastro realizado! Sua senha padrão é: ${data.defaultPassword}`);
      
      // Salvar token e usuário
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      setTimeout(() => {
        // Se for plano pago, redirecionar para Mercado Pago
        if (planParam === 'intermediario' || planParam === 'avancado') {
          router.push('/payment/mercadopago');
        } else {
          router.push('/dashboard');
        }
      }, 2000);
    } catch (error) {
      toast.error('Erro ao conectar ao servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="space-y-1 flex flex-col items-center">
          <div className="flex items-center space-x-2 mb-4">
            <Package className="h-8 w-8 text-purple-600" />
            <span className="text-2xl font-bold text-purple-600">3dlucrativa</span>
          </div>
          <CardTitle className="text-2xl">Criar conta</CardTitle>
          <CardDescription>
            Preencha os dados abaixo para criar sua conta
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome / Razão Social</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Tipo de Documento</Label>
              <div className="flex gap-4">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    value="cpf"
                    checked={formData.documentType === 'cpf'}
                    onChange={() => setFormData({ ...formData, documentType: 'cpf' })}
                    className="mr-2"
                  />
                  CPF
                </label>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    value="cnpj"
                    checked={formData.documentType === 'cnpj'}
                    onChange={() => setFormData({ ...formData, documentType: 'cnpj' })}
                    className="mr-2"
                  />
                  CNPJ
                </label>
              </div>
            </div>

            {formData.documentType === 'cpf' ? (
              <div className="space-y-2">
                <Label htmlFor="cpf">CPF</Label>
                <Input
                  id="cpf"
                  value={formData.cpf}
                  onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                  placeholder="000.000.000-00"
                  required
                />
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="cnpj">CNPJ</Label>
                <Input
                  id="cnpj"
                  value={formData.cnpj}
                  onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
                  onBlur={handleCnpjBlur}
                  placeholder="00.000.000/0000-00"
                  disabled={loadingCnpj}
                  required
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cep">CEP</Label>
                <Input
                  id="cep"
                  value={formData.cep}
                  onChange={(e) => setFormData({ ...formData, cep: e.target.value })}
                  onBlur={handleCepBlur}
                  placeholder="00000-000"
                  disabled={loadingCep}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="number">Número</Label>
                <Input
                  id="number"
                  value={formData.number}
                  onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="street">Rua</Label>
              <Input
                id="street"
                value={formData.street}
                onChange={(e) => setFormData({ ...formData, street: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="neighborhood">Bairro</Label>
                <Input
                  id="neighborhood"
                  value={formData.neighborhood}
                  onChange={(e) => setFormData({ ...formData, neighborhood: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">Cidade</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-purple-600 hover:bg-purple-700"
              disabled={loading}
            >
              {loading ? 'Cadastrando...' : 'Criar Conta'}
            </Button>
          </form>

          <div className="mt-4 text-center text-sm">
            Já tem uma conta?{' '}
            <Link href="/login" className="text-purple-600 hover:underline">
              Fazer login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Carregando...</div>}>
      <RegisterContent />
    </Suspense>
  );
}

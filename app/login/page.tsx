'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Package } from 'lucide-react';
import { toast } from 'sonner';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || 'Erro ao fazer login');
        return;
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      toast.success('Login realizado com sucesso!');

      // Verificar role primeiro
      if (data.user.role?.toUpperCase() === 'ADMIN') {
        // Admin vai direto para dashboard admin sem verificar pagamento
        router.push('/dashboard/admin');
        return;
      }

      // Usuários com plano FREE não precisam pagar
      if (data.user.plan === 'free') {
        if (data.user.mustChangePassword) {
          router.push('/dashboard/change-password');
        } else {
          router.push('/dashboard');
        }
        return;
      }

      // Apenas usuários regulares com plano pago verificam pagamento
      if (data.user.paymentStatus !== 'approved') {
        // Se pagamento foi rejeitado, vai direto para página de pagamento
        if (data.user.paymentStatus === 'rejected') {
          router.push('/payment');
        } else if (data.user.paymentStatus === 'pending') {
          // Verificar se já tem uma solicitação de pagamento
          const checkResponse = await fetch('/api/payment/check', {
            headers: { Authorization: `Bearer ${data.token}` },
          });
          const checkData = await checkResponse.json();
          
          if (checkData.hasRequest) {
            // Já tem solicitação, vai para tela de aguardo
            router.push('/payment/pending');
          } else {
            // Não tem solicitação, vai para tela de pagamento
            router.push('/payment');
          }
        }
      } else if (data.user.mustChangePassword) {
        router.push('/dashboard/change-password');
      } else {
        router.push('/dashboard');
      }
    } catch (error) {
      toast.error('Erro ao conectar ao servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 flex flex-col items-center">
          <div className="flex items-center space-x-2 mb-4">
            <Package className="h-8 w-8 text-purple-600" />
            <span className="text-2xl font-bold text-purple-600">3dlucrativa</span>
          </div>
          <CardTitle className="text-2xl">Bem-vindo de volta</CardTitle>
          <CardDescription>
            Entre com suas credenciais para acessar sua conta
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-purple-600 hover:bg-purple-700"
              disabled={loading}
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            Não tem uma conta?{' '}
            <Link href="/register" className="text-purple-600 hover:underline">
              Cadastre-se
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, LogOut, Package, FileText, ShoppingCart, Settings, Link2, Moon, Sun, Receipt } from 'lucide-react';
import { useTheme } from 'next-themes';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAccess = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      // Verificar status de pagamento
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        setIsAdmin(user.role?.toUpperCase() === 'ADMIN');
        
        // Admin nunca precisa de verificação de pagamento
        if (user.role?.toUpperCase() === 'ADMIN') {
          return;
        }

        // Usuários com plano FREE não precisam de pagamento
        if (user.plan === 'free') {
          return;
        }
        
        // Apenas usuários regulares com plano pago verificam pagamento
        if (user.paymentStatus !== 'approved') {
          if (user.paymentStatus === 'rejected') {
            router.push('/payment');
          } else if (user.paymentStatus === 'pending') {
            // Verificar se já tem solicitação
            try {
              const response = await fetch('/api/payment/check', {
                headers: { Authorization: `Bearer ${token}` },
              });
              const data = await response.json();
              
              if (data.hasRequest) {
                router.push('/payment/pending');
              } else {
                router.push('/payment');
              }
            } catch (error) {
              router.push('/payment');
            }
          }
        }
      }
    };

    checkAccess();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link href="/dashboard" className="flex items-center space-x-2">
            <Package className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            <span className="text-xl font-bold text-purple-600 dark:text-purple-400">3dlucrativa</span>
          </Link>
          <div className="flex items-center space-x-2">
            <Button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              variant="ghost"
              size="icon"
              className="h-9 w-9"
            >
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Alternar tema</span>
            </Button>
            <Button
              onClick={handleLogout}
              variant="ghost"
              className="flex items-center space-x-2"
            >
              <LogOut className="h-4 w-4" />
              <span>Sair</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 min-h-screen">
          <nav className="p-4 space-y-2">
            <Link href="/dashboard">
              <Button
                variant="ghost"
                className="w-full justify-start dark:hover:bg-purple-900/20"
              >
                <LayoutDashboard className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
            </Link>
            
            {!isAdmin && (
              <>
                <Link href="/dashboard/products">
                  <Button
                    variant="ghost"
                    className="w-full justify-start dark:hover:bg-purple-900/20"
                  >
                    <Package className="h-4 w-4 mr-2" />
                    Produtos
                  </Button>
                </Link>
                <Link href="/dashboard/filaments">
                  <Button
                    variant="ghost"
                    className="w-full justify-start dark:hover:bg-purple-900/20"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Filamentos
                  </Button>
                </Link>
                <Link href="/dashboard/sales">
                  <Button
                    variant="ghost"
                    className="w-full justify-start dark:hover:bg-purple-900/20"
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Vendas
                  </Button>
                </Link>
                <Link href="/dashboard/platforms">
                  <Button
                    variant="ghost"
                    className="w-full justify-start dark:hover:bg-purple-900/20"
                  >
                    <Link2 className="h-4 w-4 mr-2" />
                    Plataformas
                  </Button>
                </Link>
                <Link href="/dashboard/settings">
                  <Button
                    variant="ghost"
                    className="w-full justify-start dark:hover:bg-purple-900/20"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Configurações
                  </Button>
                </Link>
              </>
            )}
            
            {isAdmin && (
              <Link href="/dashboard/payments">
                <Button
                  variant="ghost"
                  className="w-full justify-start dark:hover:bg-purple-900/20"
                >
                  <Receipt className="h-4 w-4 mr-2" />
                  Pagamentos
                </Button>
              </Link>
            )}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

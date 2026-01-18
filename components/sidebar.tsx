'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
  Package,
  LayoutDashboard,
  FileText,
  ShoppingCart,
  Settings,
  LogOut,
  Users,
  BarChart3,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SidebarProps {
  isAdmin?: boolean;
}

export function Sidebar({ isAdmin = false }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  const basePath = isAdmin ? '/admin' : '/dashboard';

  const adminLinks = [
    { href: '/admin', icon: BarChart3, label: 'Estatísticas' },
    { href: '/admin/users', icon: Users, label: 'Usuários Cadastrados' },
    { href: '/admin/products', icon: Package, label: 'Produtos' },
    { href: '/admin/settings', icon: Settings, label: 'Configurações' },
  ];

  const clientLinks = [
    { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/dashboard/products', icon: Package, label: 'Produtos' },
    { href: '/dashboard/filaments', icon: FileText, label: 'Filamentos' },
    { href: '/dashboard/sales', icon: ShoppingCart, label: 'Vendas' },
    { href: '/dashboard/settings', icon: Settings, label: 'Configurações' },
  ];

  const links = isAdmin ? adminLinks : clientLinks;

  return (
    <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <h1 className="text-2xl font-bold text-purple-600">3dlucrativa</h1>
        <p className="text-sm text-gray-500 mt-1">
          {isAdmin ? 'Painel Admin' : 'Painel Cliente'}
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {links.map((link) => {
          const isActive = pathname === link.href || pathname.startsWith(link.href + '/');
          const Icon = link.icon;

          return (
            <Link key={link.href} href={link.href}>
              <Button
                variant={isActive ? 'default' : 'ghost'}
                className={`w-full justify-start ${
                  isActive ? 'bg-purple-600 hover:bg-purple-700' : ''
                }`}
              >
                <Icon className="h-4 w-4 mr-2" />
                {link.label}
              </Button>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
        {!isAdmin && (
          <Link href="/admin">
            <Button variant="outline" className="w-full justify-start text-xs">
              Admin Dashboard
            </Button>
          </Link>
        )}
        <Button
          variant="outline"
          className="w-full justify-start text-red-600"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sair
        </Button>
      </div>
    </div>
  );
}

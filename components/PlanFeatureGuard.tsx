'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Zap } from 'lucide-react';

interface PlanFeatureGuardProps {
  children: React.ReactNode;
  requiredPlan: 'intermediario' | 'avancado';
  featureName: string;
}

export function PlanFeatureGuard({
  children,
  requiredPlan,
  featureName,
}: PlanFeatureGuardProps) {
  const router = useRouter();
  const userStr = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
  const user = userStr ? JSON.parse(userStr) : null;

  // Se o plano do usuário é FREE
  if (user?.plan === 'free') {
    return (
      <div className="relative rounded-lg overflow-hidden">
        <div className="blur-sm pointer-events-none select-none opacity-50">
          {children}
        </div>
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-black/40 to-black/20">
          <div className="bg-white dark:bg-gray-800 rounded-md p-4 shadow-xl max-w-xs mx-auto">
            <div className="flex items-center justify-center gap-1.5 mb-2">
              <Zap className="h-4 w-4 text-amber-500" />
              <h3 className="font-semibold text-sm text-gray-900 dark:text-white">
                Premium
              </h3>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-300 text-center mb-3">
              {featureName}
            </p>
            <Button
              onClick={() => router.push('/pricing')}
              className="w-full bg-amber-600 hover:bg-amber-700 text-white text-xs h-8 rounded-md"
            >
              Fazer Upgrade
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Se tem plano pago, mostrar conteúdo normalmente
  if (requiredPlan === 'intermediario' && user?.plan !== 'free') {
    return <>{children}</>;
  }

  if (requiredPlan === 'avancado' && (user?.plan === 'avancado' || user?.plan === 'intermediario')) {
    return <>{children}</>;
  }

  // Se chegar aqui, mostrar componente normalmente
  return <>{children}</>;
}

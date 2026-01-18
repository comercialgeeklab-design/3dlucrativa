'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Package, Zap, Crown } from 'lucide-react';

const plans = [
  {
    name: 'Grátis',
    price: 'R$ 0',
    period: '/mês',
    icon: Package,
    description: 'Comece a gerenciar seus produtos gratuitamente',
    color: 'bg-blue-50 dark:bg-blue-900/10',
    borderColor: 'border-blue-200 dark:border-blue-800',
    buttonColor: 'bg-blue-600 hover:bg-blue-700',
    features: [
      { text: 'Criar produtos', included: true },
      { text: 'Gerenciar filamentos', included: true },
      { text: 'Dashboard básico', included: true },
      { text: 'Precificação automática', included: false, locked: true },
      { text: 'Logo personalizado', included: false, locked: true },
      { text: 'Relatórios avançados', included: false, locked: true },
    ],
    badge: 'Plano Gratuito',
  },
  {
    name: 'Intermediário',
    price: 'R$ 49',
    period: '/mês',
    icon: Zap,
    description: 'Tudo do plano grátis + recursos intermediários',
    color: 'bg-purple-50 dark:bg-purple-900/10',
    borderColor: 'border-purple-200 dark:border-purple-800',
    buttonColor: 'bg-purple-600 hover:bg-purple-700',
    features: [
      { text: 'Criar produtos', included: true },
      { text: 'Gerenciar filamentos', included: true },
      { text: 'Precificação automática', included: true },
      { text: 'Dashboard avançado', included: true },
      { text: 'Logo personalizado', included: false, locked: true },
      { text: 'Relatórios avançados', included: false, locked: true },
    ],
    badge: 'Populares',
    highlighted: true,
  },
  {
    name: 'Avançado',
    price: 'R$ 99',
    period: '/mês',
    icon: Crown,
    description: 'Acesso completo a todos os recursos premium',
    color: 'bg-amber-50 dark:bg-amber-900/10',
    borderColor: 'border-amber-200 dark:border-amber-800',
    buttonColor: 'bg-amber-600 hover:bg-amber-700',
    features: [
      { text: 'Criar produtos ilimitados', included: true },
      { text: 'Gerenciar filamentos', included: true },
      { text: 'Precificação automática', included: true },
      { text: 'Logo personalizado', included: true },
      { text: 'Relatórios avançados', included: true },
      { text: 'Suporte prioritário', included: true },
    ],
    badge: 'Recomendado',
  },
];

export default function PricingPage() {
  const router = useRouter();

  const handleSelectPlan = (planName: string) => {
    const planMap = {
      'Grátis': 'free',
      'Intermediário': 'intermediario',
      'Avançado': 'avancado',
    };
    router.push(`/register?plan=${planMap[planName as keyof typeof planMap]}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Planos Simples e Transparentes
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Escolha o plano perfeito para seu negócio de impressão 3D. Comece grátis e cresça quando estiver pronto.
          </p>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {plans.map((plan, index) => {
            const Icon = plan.icon;
            const isHighlighted = plan.highlighted;

            return (
              <div
                key={index}
                className={`relative transition-transform hover:scale-105 ${
                  isHighlighted ? 'md:scale-105' : ''
                }`}
              >
                {/* Badge */}
                {isHighlighted && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                    <span className="bg-gradient-to-r from-purple-600 to-purple-400 text-white px-4 py-1 rounded-full text-sm font-semibold">
                      {plan.badge}
                    </span>
                  </div>
                )}

                <Card
                  className={`h-full ${plan.color} border-2 ${plan.borderColor} ${
                    isHighlighted ? 'shadow-2xl' : 'shadow-lg'
                  }`}
                >
                  <CardHeader className="pb-6">
                    <div className="flex items-center justify-between mb-4">
                      <Icon className={`h-12 w-12 ${
                        plan.name === 'Grátis' ? 'text-blue-600' :
                        plan.name === 'Intermediário' ? 'text-purple-600' :
                        'text-amber-600'
                      }`} />
                      {!isHighlighted && (
                        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                          {plan.badge}
                        </span>
                      )}
                    </div>
                    <CardTitle className="text-2xl mb-2">{plan.name}</CardTitle>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {plan.description}
                    </p>
                  </CardHeader>

                  <CardContent className="space-y-6">
                    {/* Price */}
                    <div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-bold text-gray-900 dark:text-white">
                          {plan.price}
                        </span>
                        <span className="text-gray-600 dark:text-gray-400">
                          {plan.period}
                        </span>
                      </div>
                    </div>

                    {/* Button */}
                    <Button
                      onClick={() => handleSelectPlan(plan.name)}
                      className={`w-full ${plan.buttonColor} text-white h-12 font-semibold rounded-lg transition-all`}
                    >
                      {plan.name === 'Grátis' ? 'Começar Grátis' : 'Fazer Upgrade'}
                    </Button>

                    {/* Features */}
                    <div className="space-y-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                      {plan.features.map((feature, featureIndex) => (
                        <div key={featureIndex} className="flex items-start gap-3">
                          <div
                            className={`mt-1 ${
                              feature.included
                                ? 'text-green-600'
                                : 'text-gray-300 dark:text-gray-600'
                            }`}
                          >
                            <Check className="h-5 w-5" />
                          </div>
                          <div className="flex-1">
                            <p
                              className={`text-sm ${
                                feature.included
                                  ? 'text-gray-900 dark:text-gray-100 font-medium'
                                  : 'text-gray-400 dark:text-gray-500 line-through'
                              }`}
                            >
                              {feature.text}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>

        {/* FAQ or additional info */}
        <div className="mt-20 text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Perguntas Frequentes
          </h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Todos os planos incluem suporte via email, acesso ao dashboard e gerenciamento de múltiplos fornecedores.
            Você pode fazer upgrade ou downgrade a qualquer momento.
          </p>
        </div>
      </div>
    </div>
  );
}

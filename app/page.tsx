import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, Package, DollarSign, TrendingUp, Check, Zap, Crown } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Package className="h-8 w-8 text-purple-600" />
            <span className="text-2xl font-bold text-purple-600">3dlucrativa</span>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/login">
              <Button variant="ghost">Entrar</Button>
            </Link>
            <Link href="/register">
              <Button className="bg-purple-600 hover:bg-purple-700">
                Começar Grátis
              </Button>
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
          Automatize a Precificação da
          <span className="text-purple-600"> Sua Loja 3D</span>
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
          Gerencie estoque, calcule preços automaticamente e maximize seus lucros 
          com a plataforma completa para impressão 3D.
        </p>
        <div className="flex justify-center space-x-4">
          <Link href="/register">
            <Button size="lg" className="bg-purple-600 hover:bg-purple-700">
              Começar Agora <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <Link href="#features">
            <Button size="lg" variant="outline">
              Saiba Mais
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center mb-12">
          Tudo que você precisa em um só lugar
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
            <DollarSign className="h-12 w-12 text-purple-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Precificação Automática</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Calcule preços considerando filamento, energia, comissões e sua margem de lucro desejada.
            </p>
          </div>
          <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
            <Package className="h-12 w-12 text-purple-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Gestão de Estoque</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Controle filamentos, materiais e previsão de quebra de estoque baseado em vendas.
            </p>
          </div>
          <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
            <TrendingUp className="h-12 w-12 text-purple-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Dashboard Completo</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Visualize vendas, lucros, produtos mais vendidos e métricas importantes em tempo real.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-4xl font-bold text-center mb-4">Planos Simples e Transparentes</h2>
        <p className="text-center text-gray-600 dark:text-gray-400 mb-12 max-w-2xl mx-auto">
          Escolha o plano perfeito para seu negócio. Comece grátis e cresça quando estiver pronto.
        </p>
        
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Plano Grátis */}
          <div className="relative">
            <Card className="h-full bg-blue-50 dark:bg-blue-900/10 border-2 border-blue-200 dark:border-blue-800 shadow-lg">
              <CardHeader className="pb-6">
                <div className="flex items-center gap-3 mb-4">
                  <Package className="h-10 w-10 text-blue-600" />
                  <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Plano Gratuito</span>
                </div>
                <CardTitle className="text-2xl">Grátis</CardTitle>
                <p className="text-sm text-gray-600 dark:text-gray-400">Comece a gerenciar seus produtos</p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-gray-900 dark:text-white">R$ 0</span>
                  <span className="text-gray-600 dark:text-gray-400">/mês</span>
                </div>
                <Link href="/register?plan=free" className="block">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12 font-semibold rounded-lg">
                    Começar Grátis
                  </Button>
                </Link>
                <div className="space-y-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-green-600 mt-1" />
                    <p className="text-sm text-gray-900 dark:text-gray-100 font-medium">Criar produtos</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-green-600 mt-1" />
                    <p className="text-sm text-gray-900 dark:text-gray-100 font-medium">Gerenciar filamentos</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-green-600 mt-1" />
                    <p className="text-sm text-gray-900 dark:text-gray-100 font-medium">Dashboard básico</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="text-gray-300 dark:text-gray-600 mt-1">
                      <Check className="h-5 w-5" />
                    </div>
                    <p className="text-sm text-gray-400 dark:text-gray-500 line-through">Precificação automática</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="text-gray-300 dark:text-gray-600 mt-1">
                      <Check className="h-5 w-5" />
                    </div>
                    <p className="text-sm text-gray-400 dark:text-gray-500 line-through">Logo personalizado</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Plano Intermediário */}
          <div className="relative md:scale-105">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
              <span className="bg-gradient-to-r from-purple-600 to-purple-400 text-white px-4 py-1 rounded-full text-sm font-semibold">
                Populares
              </span>
            </div>
            <Card className="h-full bg-purple-50 dark:bg-purple-900/10 border-2 border-purple-200 dark:border-purple-800 shadow-2xl">
              <CardHeader className="pb-6">
                <div className="flex items-center gap-3 mb-4">
                  <Zap className="h-10 w-10 text-purple-600" />
                </div>
                <CardTitle className="text-2xl">Intermediário</CardTitle>
                <p className="text-sm text-gray-600 dark:text-gray-400">Recursos intermediários inclusos</p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-gray-900 dark:text-white">R$ 49</span>
                  <span className="text-gray-600 dark:text-gray-400">/mês</span>
                </div>
                <Link href="/register?plan=intermediario" className="block">
                  <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white h-12 font-semibold rounded-lg">
                    Fazer Upgrade
                  </Button>
                </Link>
                <div className="space-y-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-green-600 mt-1" />
                    <p className="text-sm text-gray-900 dark:text-gray-100 font-medium">Criar produtos</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-green-600 mt-1" />
                    <p className="text-sm text-gray-900 dark:text-gray-100 font-medium">Precificação automática</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-green-600 mt-1" />
                    <p className="text-sm text-gray-900 dark:text-gray-100 font-medium">Dashboard avançado</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-green-600 mt-1" />
                    <p className="text-sm text-gray-900 dark:text-gray-100 font-medium">Gerenciar filamentos</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="text-gray-300 dark:text-gray-600 mt-1">
                      <Check className="h-5 w-5" />
                    </div>
                    <p className="text-sm text-gray-400 dark:text-gray-500 line-through">Logo personalizado</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Plano Avançado */}
          <div className="relative">
            <Card className="h-full bg-amber-50 dark:bg-amber-900/10 border-2 border-amber-200 dark:border-amber-800 shadow-lg">
              <CardHeader className="pb-6">
                <div className="flex items-center gap-3 mb-4">
                  <Crown className="h-10 w-10 text-amber-600" />
                  <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Recomendado</span>
                </div>
                <CardTitle className="text-2xl">Avançado</CardTitle>
                <p className="text-sm text-gray-600 dark:text-gray-400">Acesso completo a todos os recursos</p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-gray-900 dark:text-white">R$ 99</span>
                  <span className="text-gray-600 dark:text-gray-400">/mês</span>
                </div>
                <Link href="/register?plan=avancado" className="block">
                  <Button className="w-full bg-amber-600 hover:bg-amber-700 text-white h-12 font-semibold rounded-lg">
                    Fazer Upgrade
                  </Button>
                </Link>
                <div className="space-y-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-green-600 mt-1" />
                    <p className="text-sm text-gray-900 dark:text-gray-100 font-medium">Criar produtos ilimitados</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-green-600 mt-1" />
                    <p className="text-sm text-gray-900 dark:text-gray-100 font-medium">Precificação automática</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-green-600 mt-1" />
                    <p className="text-sm text-gray-900 dark:text-gray-100 font-medium">Logo personalizado</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-green-600 mt-1" />
                    <p className="text-sm text-gray-900 dark:text-gray-100 font-medium">Dashboard completo</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-green-600 mt-1" />
                    <p className="text-sm text-gray-900 dark:text-gray-100 font-medium">Suporte prioritário</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-purple-600 py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Pronto para aumentar seus lucros?
          </h2>
          <p className="text-xl text-purple-100 mb-8">
            Junte-se a centenas de lojas que já automatizaram sua precificação
          </p>
          <Link href="/register">
            <Button size="lg" variant="secondary" className="bg-white text-purple-600 hover:bg-gray-100">
              Criar Conta Gratuita
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Package className="h-6 w-6 text-purple-400" />
            <span className="text-xl font-bold">3dlucrativa</span>
          </div>
          <p className="text-gray-400">
            © 2026 3dlucrativa. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}

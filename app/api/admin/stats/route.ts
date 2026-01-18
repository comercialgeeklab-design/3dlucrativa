import { NextRequest, NextResponse } from 'next/server';
import { getDataSource } from '@/lib/database/data-source';
import { User } from '@/lib/database/entities/User';
import { Product } from '@/lib/database/entities/Product';
import { Sale } from '@/lib/database/entities/Sale';
import { Platform } from '@/lib/database/entities/Platform';
import { withAdmin } from '@/lib/auth/middleware';
import { MoreThanOrEqual, LessThanOrEqual } from 'typeorm';

async function handleGetStats(request: NextRequest, user: User) {
  try {
    const dataSource = await getDataSource();
    const userRepository = dataSource.getRepository(User);
    const productRepository = dataSource.getRepository(Product);
    const saleRepository = dataSource.getRepository(Sale);
    const platformRepository = dataSource.getRepository(Platform);

    // Get total users
    const totalUsers = await userRepository.count();

    // Get new users this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const newUsersThisMonth = await userRepository.count({
      where: {
        createdAt: MoreThanOrEqual(startOfMonth),
      },
    });

    // Get total products
    const totalProducts = await productRepository.count();

    // Get all sales
    const sales = await saleRepository.find({
      relations: ['product', 'platform'],
    });

    const totalSales = sales.length;
    const totalRevenue = sales.reduce((sum, sale) => {
      const saleTotal = sale.quantity * sale.product.finalPrice;
      const commission = (saleTotal * sale.platform.commissionPercentage) / 100;
      return sum + (saleTotal - commission);
    }, 0);

    // Revenue by platform
    const revenueByPlatform: Record<string, number> = {};
    sales.forEach((sale) => {
      const platformName = sale.platform.name;
      const saleTotal = sale.quantity * sale.product.finalPrice;
      const commission = (saleTotal * sale.platform.commissionPercentage) / 100;
      const netValue = saleTotal - commission;

      if (!revenueByPlatform[platformName]) {
        revenueByPlatform[platformName] = 0;
      }
      revenueByPlatform[platformName] += netValue;
    });

    const revenueByPlatformArray = Object.entries(revenueByPlatform).map(
      ([platform, revenue]) => ({
        platform,
        revenue,
      }),
    );

    // Sales trend (last 7 days)
    const last7days = new Date();
    last7days.setDate(last7days.getDate() - 7);

    const recentSales = sales.filter(
      (sale) => new Date(sale.saleDate) >= last7days,
    );

    const salesTrend: Record<string, { sales: number; revenue: number }> = {};
    recentSales.forEach((sale) => {
      const dateKey = new Date(sale.saleDate).toLocaleDateString('pt-BR');
      if (!salesTrend[dateKey]) {
        salesTrend[dateKey] = { sales: 0, revenue: 0 };
      }
      const saleTotal = sale.quantity * sale.product.finalPrice;
      const commission = (saleTotal * sale.platform.commissionPercentage) / 100;
      salesTrend[dateKey].sales += 1;
      salesTrend[dateKey].revenue += saleTotal - commission;
    });

    const salesTrendArray = Object.entries(salesTrend).map(([date, data]) => ({
      date,
      ...data,
    }));

    return NextResponse.json({
      totalUsers,
      totalProducts,
      totalSales,
      totalRevenue,
      newUsersThisMonth,
      revenueByPlatform: revenueByPlatformArray,
      salesTrend: salesTrendArray,
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar estatísticas' },
      { status: 500 },
    );
  }
}

export const GET = withAdmin(handleGetStats);

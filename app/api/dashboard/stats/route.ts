import { NextRequest, NextResponse } from 'next/server';
import { Between, In } from 'typeorm';
import { getDataSource } from '@/lib/database/data-source';
import { authenticateRequest } from '@/lib/auth/middleware';
import { Sale } from '@/lib/database/entities/Sale';
import { Product } from '@/lib/database/entities/Product';
import { ProductFilament } from '@/lib/database/entities/ProductFilament';
import { Filament } from '@/lib/database/entities/Filament';
import { Stock } from '@/lib/database/entities/Stock';
import { Inventory } from '@/lib/database/entities/Inventory';
import { Store } from '@/lib/database/entities/Store';
import { Platform } from '@/lib/database/entities/Platform';

function parseDate(value?: string | null): Date | null {
  if (!value) return null;
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d;
}

export async function GET(request: NextRequest) {
  try {
    const { user, error } = await authenticateRequest(request);
    if (error || !user) {
      return NextResponse.json({ error: error || 'Não autorizado' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const startParam = parseDate(searchParams.get('startDate'));
    const endParam = parseDate(searchParams.get('endDate'));

    const endDate = endParam ? new Date(endParam) : new Date();
    endDate.setHours(23, 59, 59, 999);

    const startDate = startParam
      ? new Date(startParam)
      : (() => {
          const d = new Date();
          d.setDate(1);
          d.setHours(0, 0, 0, 0);
          return d;
        })();

    const dataSource = await getDataSource();
    const saleRepository = dataSource.getRepository(Sale);
    const productRepository = dataSource.getRepository(Product);
    const productFilamentRepository = dataSource.getRepository(ProductFilament);
    const filamentRepository = dataSource.getRepository(Filament);
    const stockRepository = dataSource.getRepository(Stock);
    const inventoryRepository = dataSource.getRepository(Inventory);
    const storeRepository = dataSource.getRepository(Store);
    const platformRepository = dataSource.getRepository(Platform);

    const store = await storeRepository.findOne({ where: { userId: user.id } });
    if (!store) {
      return NextResponse.json({ error: 'Loja não encontrada para o usuário' }, { status: 404 });
    }

    const [sales, products] = await Promise.all([
      saleRepository.find({
        where: { userId: user.id, saleDate: Between(startDate, endDate) },
        relations: ['product', 'platform'],
        order: { saleDate: 'DESC' },
      }),
      productRepository.find({ where: { storeId: store.id } }),
    ]);

    const productIds = products.map((p) => p.id);
    const productFilaments = productIds.length
      ? await productFilamentRepository.find({
          where: { productId: In(productIds) },
          relations: ['filament'],
        })
      : [];

    const filamentMap = new Map<string, Filament>();
    (await filamentRepository.find({ where: { storeId: store.id } })).forEach((f) => {
      filamentMap.set(f.id, f);
    });

    // Aggregations
    let totalQuantitySold = 0;
    let grossRevenue = 0;
    let totalCommission = 0;
    let totalTax = 0;
    let netRevenue = 0;

    const productAgg: Record<string, { name: string; quantity: number; revenue: number; dailyRevenue: number[] }> = {};
    const platformAgg: Record<string, { name: string; revenue: number; commission: number; dailyRevenue: number[] }> = {};
    const filamentUsage: Record<string, { filament: Filament; grams: number }> = {};
    const dateKeys: string[] = [];

    const storePaysTax = !!store.paysTax;
    const storeTaxRate = Number(store.taxPercentage || 0) / 100;

    // Build date range for sparklines
    const daysBetween = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    for (let i = 0; i < Math.min(daysBetween, 30); i++) {
      const d = new Date(startDate);
      d.setDate(startDate.getDate() + i);
      dateKeys.push(d.toISOString().slice(0, 10));
    }

    sales.forEach((sale) => {
      const saleTotal = Number(sale.totalValue || 0) || Number(sale.unitPrice) * sale.quantity;
      const commissionRate = Number(sale.platform?.commissionPercentage || 0) / 100;
      const fixedFee = Number((sale.platform as any)?.fixedFeePerItem || 0);
      const commissionValue = saleTotal * commissionRate + fixedFee * sale.quantity;
      const taxValue = storePaysTax ? saleTotal * storeTaxRate : 0;
      const net = saleTotal - commissionValue - taxValue;

      totalQuantitySold += sale.quantity;
      grossRevenue += saleTotal;
      totalCommission += commissionValue;
      totalTax += taxValue;
      netRevenue += net;

      if (sale.productId) {
        const key = sale.productId;
        if (!productAgg[key]) {
          productAgg[key] = {
            name: sale.product?.name || 'Produto',
            quantity: 0,
            revenue: 0,
            dailyRevenue: dateKeys.map(() => 0),
          };
        }
        productAgg[key].quantity += sale.quantity;
        productAgg[key].revenue += saleTotal;
        const dateKey = new Date(sale.saleDate).toISOString().slice(0, 10);
        const dayIdx = dateKeys.indexOf(dateKey);
        if (dayIdx >= 0) productAgg[key].dailyRevenue[dayIdx] += saleTotal;
      }

      if (sale.platformId) {
        const pKey = sale.platformId;
        if (!platformAgg[pKey]) {
          platformAgg[pKey] = {
            name: sale.platform?.name || 'Plataforma',
            revenue: 0,
            commission: 0,
            dailyRevenue: dateKeys.map(() => 0),
          };
        }
        platformAgg[pKey].revenue += saleTotal;
        platformAgg[pKey].commission += commissionValue;
        const dateKey = new Date(sale.saleDate).toISOString().slice(0, 10);
        const dayIdx = dateKeys.indexOf(dateKey);
        if (dayIdx >= 0) platformAgg[pKey].dailyRevenue[dayIdx] += saleTotal;
      }
    });

    // Filament usage per product * quantity sold
    const productFilamentByProduct = productFilaments.reduce<Record<string, ProductFilament[]>>((acc, pf) => {
      if (!acc[pf.productId]) acc[pf.productId] = [];
      acc[pf.productId].push(pf);
      return acc;
    }, {});

    sales.forEach((sale) => {
      const pfs = productFilamentByProduct[sale.productId] || [];
      pfs.forEach((pf) => {
        const grams = Number(pf.gramsUsed || 0) * sale.quantity;
        if (!filamentUsage[pf.filamentId]) {
          const filament = filamentMap.get(pf.filamentId) as Filament;
          filamentUsage[pf.filamentId] = { filament, grams: 0 };
        }
        filamentUsage[pf.filamentId].grams += grams;
      });
    });

    const mostUsedFilaments = Object.values(filamentUsage)
      .sort((a, b) => b.grams - a.grams)
      .slice(0, 5)
      .map((f) => ({
        id: f.filament?.id,
        name: `${f.filament?.type || ''} ${f.filament?.color || ''}`.trim(),
        gramsUsed: Number(f.grams.toFixed(2)),
      }));

    const lowStockFilaments = Array.from(filamentMap.values())
      .filter((f) => Number(f.currentStock) <= 200)
      .map((f) => ({
        id: f.id,
        name: `${f.type} ${f.color}`,
        currentStock: Number(f.currentStock),
      }));

    const topProducts = Object.entries(productAgg)
      .map(([id, data]) => ({ id, name: data.name, quantity: data.quantity, revenue: data.revenue, trend: data.dailyRevenue }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    const platformRanking = Object.entries(platformAgg)
      .map(([id, data]) => ({ id, name: data.name, revenue: data.revenue, commission: data.commission, trend: data.dailyRevenue }))
      .sort((a, b) => b.revenue - a.revenue);

    const totalFilamentStockValue = Array.from(filamentMap.values()).reduce(
      (sum, f) => sum + Number(f.totalValue || 0),
      0,
    );
    const totalStockValue = (await stockRepository.find({ where: { storeId: store.id } })).reduce(
      (sum, s) => sum + Number(s.totalValue || 0),
      0,
    );
    const totalInventoryValue = (await inventoryRepository.find({ where: { storeId: store.id } })).reduce(
      (sum, inv) => sum + Number(inv.paidValue || 0) * Number(inv.quantity || 0),
      0,
    );

    // Build daily trend within period - include ALL days even with zero sales
    const trendMap: Record<string, { quantity: number; gross: number; net: number; commission: number; tax: number }> = {};
    
    // Initialize all days in range with zeros
    const dayCount = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    for (let i = 0; i < dayCount; i++) {
      const d = new Date(startDate);
      d.setDate(startDate.getDate() + i);
      const dateKey = d.toISOString().slice(0, 10);
      trendMap[dateKey] = { quantity: 0, gross: 0, net: 0, commission: 0, tax: 0 };
    }
    
    // Fill in actual sales data
    sales.forEach((sale) => {
      const d = new Date(sale.saleDate);
      const dateKey = d.toISOString().slice(0, 10);
      if (!trendMap[dateKey]) {
        trendMap[dateKey] = { quantity: 0, gross: 0, net: 0, commission: 0, tax: 0 };
      }
      const saleTotal = Number(sale.totalValue || 0) || Number(sale.unitPrice) * sale.quantity;
      const commissionRate = Number(sale.platform?.commissionPercentage || 0) / 100;
      const fixedFee = Number((sale.platform as any)?.fixedFeePerItem || 0);
      const commissionValue = saleTotal * commissionRate + fixedFee * sale.quantity;
      const taxValue = storePaysTax ? saleTotal * storeTaxRate : 0;
      const net = saleTotal - commissionValue - taxValue;
      trendMap[dateKey].quantity += sale.quantity;
      trendMap[dateKey].gross += saleTotal;
      trendMap[dateKey].commission += commissionValue;
      trendMap[dateKey].tax += taxValue;
      trendMap[dateKey].net += net;
    });
    
    const trend = Object.entries(trendMap)
      .sort((a, b) => (a[0] < b[0] ? -1 : 1))
      .map(([date, v]) => ({
        date,
        quantity: v.quantity,
        gross: Number(v.gross.toFixed(2)),
        net: Number(v.net.toFixed(2)),
        commission: Number(v.commission.toFixed(2)),
        tax: Number(v.tax.toFixed(2)),
      }));

    return NextResponse.json({
      period: {
        startDate,
        endDate,
      },
      totals: {
        quantitySold: totalQuantitySold,
        grossRevenue: Number(grossRevenue.toFixed(2)),
        commissionPaid: Number(totalCommission.toFixed(2)),
        taxPaid: Number(totalTax.toFixed(2)),
        netRevenue: Number(netRevenue.toFixed(2)),
      },
      products: {
        topProducts,
      },
      filaments: {
        totalUsedGrams: Number(
          Object.values(filamentUsage).reduce((sum, f) => sum + f.grams, 0).toFixed(2),
        ),
        mostUsed: mostUsedFilaments,
        lowStock: lowStockFilaments,
      },
      platforms: {
        ranking: platformRanking,
      },
      stock: {
        totalFilamentStockValue: Number(totalFilamentStockValue.toFixed(2)),
        totalStockValue: Number(totalStockValue.toFixed(2)),
        totalInventoryValue: Number(totalInventoryValue.toFixed(2)),
      },
      trend,
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas do dashboard:', error);
    return NextResponse.json({ error: 'Erro ao buscar estatísticas' }, { status: 500 });
  }
}

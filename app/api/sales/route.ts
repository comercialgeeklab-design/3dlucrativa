import { NextRequest, NextResponse } from 'next/server';
import { Between } from 'typeorm';
import { getDataSource } from '@/lib/database/data-source';
import { Sale } from '@/lib/database/entities/Sale';
import { Product } from '@/lib/database/entities/Product';
import { Platform } from '@/lib/database/entities/Platform';
import { User } from '@/lib/database/entities/User';
import { withAuth } from '@/lib/auth/middleware';

async function handleGetSales(request: NextRequest, user: User) {
  try {
    const dataSource = await getDataSource();
    const saleRepository = dataSource.getRepository(Sale);

    const url = new URL(request.url);
    const startDate = url.searchParams.get('startDate');
    const endDate = url.searchParams.get('endDate');

    const where: any = { userId: user.id };
    if (startDate && endDate) {
      where.saleDate = Between(new Date(startDate), new Date(endDate));
    }

    const sales = await saleRepository.find({
      where,
      relations: ['product', 'platform'],
      order: { saleDate: 'DESC' },
    });

    // Format response
    const formatted = sales.map((sale) => {
      const totalPrice = sale.quantity * sale.product.finalPrice;
      return {
        id: sale.id,
        productId: sale.productId,
        productName: sale.product.name,
        quantity: sale.quantity,
        unitPrice: sale.product.finalPrice,
        totalPrice: totalPrice,
        platformId: sale.platformId,
        platformName: sale.platform.name,
        commission: 0,
        tax: 0,
        netValue: totalPrice,
        saleDate: sale.saleDate,
      };
    });

    return NextResponse.json(formatted);
  } catch (error) {
    console.error('Erro ao buscar vendas:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar vendas' },
      { status: 500 },
    );
  }
}

async function handleCreateSale(request: NextRequest, user: User) {
  try {
    const body = await request.json();
    const { productId, quantity, platformId, saleDate } = body;

    if (!productId || !quantity || !platformId) {
      return NextResponse.json(
        { error: 'Dados incompletos' },
        { status: 400 },
      );
    }

    const dataSource = await getDataSource();
    const saleRepository = dataSource.getRepository(Sale);
    const productRepository = dataSource.getRepository(Product);
    const platformRepository = dataSource.getRepository(Platform);

    // Verify product exists
    const product = await productRepository.findOne({ where: { id: productId } });
    if (!product) {
      return NextResponse.json(
        { error: 'Produto não encontrado' },
        { status: 404 },
      );
    }

    // Verify platform exists
    const platform = await platformRepository.findOne({ where: { id: platformId } });
    if (!platform) {
      return NextResponse.json(
        { error: 'Plataforma não encontrada' },
        { status: 404 },
      );
    }

    // Calculate sale values
    const totalPrice = quantity * product.finalPrice;
    
    const sale = new Sale();
    sale.userId = user.id;
    sale.productId = productId;
    sale.platformId = platformId;
    sale.quantity = quantity;
    sale.unitPrice = product.finalPrice;
    sale.totalValue = totalPrice;
    sale.platformCommission = 0; // Already included in product price
    sale.taxValue = 0;
    sale.netValue = totalPrice;
    sale.saleDate = new Date(saleDate || new Date());

    const savedSale = await saleRepository.save(sale);

    // Return formatted response
    return NextResponse.json({
      id: savedSale.id,
      productId: savedSale.productId,
      productName: product.name,
      quantity: savedSale.quantity,
      unitPrice: product.finalPrice,
      totalPrice: totalPrice,
      platformId: savedSale.platformId,
      platformName: platform.name,
      commission: 0,
      tax: 0,
      netValue: totalPrice,
      saleDate: savedSale.saleDate,
    });
  } catch (error) {
    console.error('Erro ao criar venda:', error);
    return NextResponse.json(
      { error: 'Erro ao criar venda' },
      { status: 500 },
    );
  }
}

export const GET = withAuth(handleGetSales);
export const POST = withAuth(handleCreateSale);

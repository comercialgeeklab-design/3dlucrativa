import { NextRequest, NextResponse } from 'next/server';
import { getDataSource } from '@/lib/database/data-source';
import { Product } from '@/lib/database/entities/Product';
import { Store } from '@/lib/database/entities/Store';
import { User } from '@/lib/database/entities/User';
import { withAuth } from '@/lib/auth/middleware';

async function handleGetProducts(request: NextRequest, user: User) {
  try {
    const dataSource = await getDataSource();
    const productRepository = dataSource.getRepository(Product);
    const storeRepository = dataSource.getRepository(Store);

    // Obter a loja do usuário
    const store = await storeRepository.findOne({
      where: { userId: user.id },
    });

    if (!store) {
      return NextResponse.json(
        { error: 'Loja não encontrada' },
        { status: 404 },
      );
    }

    // Buscar produtos da loja
    const products = await productRepository.find({
      where: { storeId: store.id },
      relations: ['productFilaments', 'productFilaments.filament'],
      order: { createdAt: 'DESC' },
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error('Erro ao buscar produtos:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar produtos' },
      { status: 500 },
    );
  }
}

export const GET = withAuth(handleGetProducts);

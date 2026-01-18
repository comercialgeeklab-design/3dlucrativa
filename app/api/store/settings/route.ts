import { NextRequest, NextResponse } from 'next/server';
import { getDataSource } from '@/lib/database/data-source';
import { Store } from '@/lib/database/entities/Store';
import { User } from '@/lib/database/entities/User';
import { withAuth } from '@/lib/auth/middleware';

async function handleGetStoreSettings(request: NextRequest, user: User) {
  try {
    const dataSource = await getDataSource();
    const storeRepository = dataSource.getRepository(Store);

    // Obter a loja do usuário
    const store = await storeRepository.findOne({
      where: { userId: user.id },
      select: [
        'id',
        'storeName',
        'energyCostPerKwh',
        'paysTax',
        'taxPercentage',
      ],
    });

    if (!store) {
      return NextResponse.json(
        { error: 'Loja não encontrada' },
        { status: 404 },
      );
    }

    return NextResponse.json(store);
  } catch (error) {
    console.error('Erro ao buscar configurações da loja:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar configurações da loja' },
      { status: 500 },
    );
  }
}

export const GET = withAuth(handleGetStoreSettings);

import { NextRequest, NextResponse } from 'next/server';
import { getDataSource } from '@/lib/database/data-source';
import { Store } from '@/lib/database/entities/Store';
import { User } from '@/lib/database/entities/User';
import { withAuth } from '@/lib/auth/middleware';

async function handleGetStore(request: NextRequest, user: User) {
  try {
    const dataSource = await getDataSource();
    const storeRepository = dataSource.getRepository(Store);

    const store = await storeRepository.findOne({
      where: { userId: user.id },
    });

    if (!store) {
      return NextResponse.json(
        { error: 'Loja não encontrada' },
        { status: 404 },
      );
    }

    return NextResponse.json(store);
  } catch (error) {
    console.error('Erro ao buscar loja:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar loja' },
      { status: 500 },
    );
  }
}

async function handleUpdateStore(request: NextRequest, user: User) {
  try {
    const body = await request.json();
    const dataSource = await getDataSource();
    const storeRepository = dataSource.getRepository(Store);

    const store = await storeRepository.findOne({
      where: { userId: user.id },
    });

    if (!store) {
      return NextResponse.json(
        { error: 'Loja não encontrada' },
        { status: 404 },
      );
    }

    // Atualizar campos permitidos
    if (body.storeName) store.storeName = body.storeName;
    if (body.description !== undefined) store.description = body.description;
    if (body.cep !== undefined) store.cep = body.cep;
    if (body.street !== undefined) store.street = body.street;
    if (body.number !== undefined) store.number = body.number;
    if (body.complement !== undefined) store.complement = body.complement;
    if (body.neighborhood !== undefined) store.neighborhood = body.neighborhood;
    if (body.city !== undefined) store.city = body.city;
    if (body.state !== undefined) store.state = body.state;
    if (body.paysTax !== undefined) store.paysTax = body.paysTax;
    if (body.taxPercentage !== undefined) store.taxPercentage = body.taxPercentage;
    if (body.energyCostPerKwh !== undefined)
      store.energyCostPerKwh = body.energyCostPerKwh;

    const updatedStore = await storeRepository.save(store);

    return NextResponse.json(updatedStore);
  } catch (error) {
    console.error('Erro ao atualizar loja:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar loja' },
      { status: 500 },
    );
  }
}

export const GET = withAuth(handleGetStore);
export const PUT = withAuth(handleUpdateStore);

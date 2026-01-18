import { NextRequest, NextResponse } from 'next/server';
import { getDataSource } from '@/lib/database/data-source';
import { Filament } from '@/lib/database/entities/Filament';
import { FilamentPurchase } from '@/lib/database/entities/FilamentPurchase';
import { Store } from '@/lib/database/entities/Store';
import { User } from '@/lib/database/entities/User';
import { withAuth } from '@/lib/auth/middleware';
import { calculatePricePerGram } from '@/lib/utils/pricing';

async function handleGetFilaments(request: NextRequest, user: User) {
  try {
    const dataSource = await getDataSource();
    const filamentRepository = dataSource.getRepository(Filament);
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

    const filaments = await filamentRepository.find({
      where: { storeId: store.id },
      relations: ['purchases'],
      order: { createdAt: 'DESC' },
    });

    return NextResponse.json(filaments);
  } catch (error) {
    console.error('Erro ao buscar filamentos:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar filamentos' },
      { status: 500 },
    );
  }
}

async function handleCreateFilament(request: NextRequest, user: User) {
  try {
    const body = await request.json();
    const { type, color, manufacturer, currentStock, totalValue } = body;

    if (!type || !color || !manufacturer || !currentStock || !totalValue) {
      return NextResponse.json(
        { error: 'Dados obrigatórios faltando: tipo, cor, fabricante, quantidade e preço' },
        { status: 400 },
      );
    }

    const dataSource = await getDataSource();
    const filamentRepository = dataSource.getRepository(Filament);
    const filamentPurchaseRepository = dataSource.getRepository(FilamentPurchase);
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

    const pricePerGram = calculatePricePerGram(totalValue, currentStock);

    const filament = filamentRepository.create({
      storeId: store.id,
      type,
      color,
      manufacturer,
      currentStock,
      totalValue,
      pricePerGram,
    });

    const savedFilament = await filamentRepository.save(filament);

    // Criar registro de compra inicial
    const purchase = filamentPurchaseRepository.create({
      filamentId: savedFilament.id,
      quantity: currentStock,
      price: totalValue,
      totalValue,
    });

    await filamentPurchaseRepository.save(purchase);

    return NextResponse.json(
      {
        filament: savedFilament,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error('Erro ao criar filamento:', error);
    return NextResponse.json(
      { error: 'Erro ao criar filamento' },
      { status: 500 },
    );
  }
}

export const GET = withAuth(handleGetFilaments);
export const POST = withAuth(handleCreateFilament);

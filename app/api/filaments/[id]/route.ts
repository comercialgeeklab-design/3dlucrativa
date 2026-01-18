import { NextRequest, NextResponse } from 'next/server';
import { getDataSource } from '@/lib/database/data-source';
import { Filament } from '@/lib/database/entities/Filament';
import { User } from '@/lib/database/entities/User';
import { withAuth } from '@/lib/auth/middleware';

async function handleGetFilament(
  request: NextRequest,
  user: User,
  { params }: { params: { id: string } },
) {
  try {
    const { id } = params;
    const dataSource = await getDataSource();
    const filamentRepository = dataSource.getRepository(Filament);

    const filament = await filamentRepository.findOne({
      where: { id },
      relations: ['purchases'],
    });

    if (!filament) {
      return NextResponse.json(
        { error: 'Filamento não encontrado' },
        { status: 404 },
      );
    }

    return NextResponse.json(filament);
  } catch (error) {
    console.error('Erro ao buscar filamento:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar filamento' },
      { status: 500 },
    );
  }
}

async function handleUpdateFilament(
  request: NextRequest,
  user: User,
  { params }: { params: { id: string } },
) {
  try {
    const { id } = params;
    const body = await request.json();

    const dataSource = await getDataSource();
    const filamentRepository = dataSource.getRepository(Filament);

    const filament = await filamentRepository.findOne({ where: { id } });

    if (!filament) {
      return NextResponse.json(
        { error: 'Filamento não encontrado' },
        { status: 404 },
      );
    }

    if (body.color) filament.color = body.color;
    if (body.currentStock !== undefined) filament.currentStock = body.currentStock;
    if (body.totalValue !== undefined) filament.totalValue = body.totalValue;

    const updatedFilament = await filamentRepository.save(filament);

    return NextResponse.json(updatedFilament);
  } catch (error) {
    console.error('Erro ao atualizar filamento:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar filamento' },
      { status: 500 },
    );
  }
}

async function handleDeleteFilament(
  request: NextRequest,
  user: User,
  { params }: { params: { id: string } },
) {
  try {
    const { id } = params;
    const dataSource = await getDataSource();
    const filamentRepository = dataSource.getRepository(Filament);

    const filament = await filamentRepository.findOne({ where: { id } });

    if (!filament) {
      return NextResponse.json(
        { error: 'Filamento não encontrado' },
        { status: 404 },
      );
    }

    await filamentRepository.remove(filament);

    return NextResponse.json({ message: 'Filamento deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar filamento:', error);
    return NextResponse.json(
      { error: 'Erro ao deletar filamento' },
      { status: 500 },
    );
  }
}

export const GET = withAuth(handleGetFilament);
export const PUT = withAuth(handleUpdateFilament);
export const DELETE = withAuth(handleDeleteFilament);

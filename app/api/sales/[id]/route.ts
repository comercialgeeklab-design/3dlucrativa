import { NextRequest, NextResponse } from 'next/server';
import { getDataSource } from '@/lib/database/data-source';
import { Sale } from '@/lib/database/entities/Sale';
import { User } from '@/lib/database/entities/User';
import { withAuth } from '@/lib/auth/middleware';

async function handleDeleteSale(
  request: NextRequest,
  user: User,
  { params }: { params: { id: string } },
) {
  try {
    const { id } = params;
    const dataSource = await getDataSource();
    const saleRepository = dataSource.getRepository(Sale);

    const sale = await saleRepository.findOne({ where: { id, userId: user.id } });

    if (!sale) {
      return NextResponse.json(
        { error: 'Venda não encontrada' },
        { status: 404 },
      );
    }

    await saleRepository.remove(sale);

    return NextResponse.json({ message: 'Venda deletada com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar venda:', error);
    return NextResponse.json(
      { error: 'Erro ao deletar venda' },
      { status: 500 },
    );
  }
}

export const DELETE = withAuth(handleDeleteSale);

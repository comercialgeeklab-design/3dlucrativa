import { NextRequest, NextResponse } from 'next/server';
import { getDataSource } from '@/lib/database/data-source';
import { Product } from '@/lib/database/entities/Product';
import { User } from '@/lib/database/entities/User';
import { withAdmin } from '@/lib/auth/middleware';

async function handleDeleteAdminProduct(
  request: NextRequest,
  user: User,
  { params }: { params: { id: string } },
) {
  try {
    const { id } = params;
    const dataSource = await getDataSource();
    const productRepository = dataSource.getRepository(Product);

    const product = await productRepository.findOne({ where: { id } });

    if (!product) {
      return NextResponse.json(
        { error: 'Produto não encontrado' },
        { status: 404 },
      );
    }

    await productRepository.remove(product);

    return NextResponse.json({ message: 'Produto deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar produto:', error);
    return NextResponse.json(
      { error: 'Erro ao deletar produto' },
      { status: 500 },
    );
  }
}

export const DELETE = withAdmin(handleDeleteAdminProduct);

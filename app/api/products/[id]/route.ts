import { NextRequest, NextResponse } from 'next/server';
import { getDataSource } from '@/lib/database/data-source';
import { Product } from '@/lib/database/entities/Product';
import { Store } from '@/lib/database/entities/Store';
import { User } from '@/lib/database/entities/User';
import { withAuth } from '@/lib/auth/middleware';

async function handleGetProduct(
  request: NextRequest,
  user: User,
  { params }: { params: { id: string } },
) {
  try {
    const { id } = params;
    const dataSource = await getDataSource();
    const productRepository = dataSource.getRepository(Product);
    const storeRepository = dataSource.getRepository(Store);

    // Verificar se a loja pertence ao usuário
    const store = await storeRepository.findOne({
      where: { userId: user.id },
    });

    if (!store) {
      return NextResponse.json(
        { error: 'Loja não encontrada' },
        { status: 404 },
      );
    }

    const product = await productRepository.findOne({
      where: { id, storeId: store.id },
      relations: ['productFilaments', 'productFilaments.filament'],
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Produto não encontrado' },
        { status: 404 },
      );
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error('Erro ao buscar produto:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar produto' },
      { status: 500 },
    );
  }
}

async function handleUpdateProduct(
  request: NextRequest,
  user: User,
  { params }: { params: { id: string } },
) {
  try {
    const { id } = params;
    const body = await request.json();

    const dataSource = await getDataSource();
    const productRepository = dataSource.getRepository(Product);
    const storeRepository = dataSource.getRepository(Store);

    // Verificar se a loja pertence ao usuário
    const store = await storeRepository.findOne({
      where: { userId: user.id },
    });

    if (!store) {
      return NextResponse.json(
        { error: 'Loja não encontrada' },
        { status: 404 },
      );
    }

    const product = await productRepository.findOne({
      where: { id, storeId: store.id },
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Produto não encontrado' },
        { status: 404 },
      );
    }

    // Atualizar campos permitidos
    if (body.name) product.name = body.name;
    if (body.printingHours !== undefined) product.printingHours = body.printingHours;
    if (body.profitMarginPercentage !== undefined)
      product.profitMarginPercentage = body.profitMarginPercentage;
    if (body.finalPrice !== undefined) product.finalPrice = body.finalPrice;
    if (body.isActive !== undefined) product.isActive = body.isActive;

    const updatedProduct = await productRepository.save(product);

    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.error('Erro ao atualizar produto:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar produto' },
      { status: 500 },
    );
  }
}

async function handleDeleteProduct(
  request: NextRequest,
  user: User,
  { params }: { params: { id: string } },
) {
  try {
    const { id } = params;
    const dataSource = await getDataSource();
    const productRepository = dataSource.getRepository(Product);
    const storeRepository = dataSource.getRepository(Store);

    // Verificar se a loja pertence ao usuário
    const store = await storeRepository.findOne({
      where: { userId: user.id },
    });

    if (!store) {
      return NextResponse.json(
        { error: 'Loja não encontrada' },
        { status: 404 },
      );
    }

    const product = await productRepository.findOne({
      where: { id, storeId: store.id },
    });

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

export const GET = withAuth(handleGetProduct);
export const PUT = withAuth(handleUpdateProduct);
export const DELETE = withAuth(handleDeleteProduct);

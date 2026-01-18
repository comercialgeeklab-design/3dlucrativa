import { NextRequest, NextResponse } from 'next/server';
import { getDataSource } from '@/lib/database/data-source';
import { Product } from '@/lib/database/entities/Product';
import { ProductFilament } from '@/lib/database/entities/ProductFilament';
import { Store } from '@/lib/database/entities/Store';
import { Filament } from '@/lib/database/entities/Filament';
import { User } from '@/lib/database/entities/User';
import { withAuth } from '@/lib/auth/middleware';

async function handleCreateProduct(request: NextRequest, user: User) {
  try {
    const formData = await request.formData();
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const filaments = JSON.parse(formData.get('filaments') as string) as Array<{ filamentId: string; gramsUsed: number }>;
    const printingHours = parseFloat(formData.get('printingHours') as string);
    const desiredMarginPercentage = parseFloat(formData.get('desiredMarginPercentage') as string);
    const finalPriceFromForm = parseFloat(formData.get('finalPrice') as string);
    let photoBase64 = formData.get('photoBase64') as string;

    // Limitar tamanho da foto (máximo 500KB)
    if (photoBase64 && photoBase64.length > 500 * 1024) {
      return NextResponse.json(
        { error: 'Foto muito grande. Máximo 500KB. Reduza o tamanho da imagem.' },
        { status: 400 },
      );
    }

    if (!name || !filaments || filaments.length === 0 || !printingHours || desiredMarginPercentage === undefined) {
      return NextResponse.json(
        { error: 'Dados obrigatórios faltando: nome, filamentos, horas de impressão e margem' },
        { status: 400 },
      );
    }

    // Validate all filaments have filamentId and gramsUsed
    if (filaments.some((f) => !f.filamentId || f.gramsUsed <= 0)) {
      return NextResponse.json(
        { error: 'Todos os filamentos devem ter ID e quantidade de gramas' },
        { status: 400 },
      );
    }

    const dataSource = await getDataSource();
    const productRepository = dataSource.getRepository(Product);
    const storeRepository = dataSource.getRepository(Store);
    const productFilamentRepository = dataSource.getRepository(ProductFilament);
    const filamentRepository = dataSource.getRepository(Filament);

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

    // Calcular custos de filamento e validar
    let totalFilamentCost = 0;
    for (const filamentUsage of filaments) {
      const filament = await filamentRepository.findOne({
        where: { id: filamentUsage.filamentId, storeId: store.id },
      });

      if (!filament) {
        return NextResponse.json(
          { error: `Filamento ${filamentUsage.filamentId} não encontrado` },
          { status: 404 },
        );
      }

      totalFilamentCost += filament.pricePerGram * filamentUsage.gramsUsed;
    }

    // Calculate total cost (for reference only)
    const totalCost = totalFilamentCost;
    
    // Use the final price provided by the user (which includes margin, taxes, etc.)
    const finalPrice = finalPriceFromForm || totalCost;

    // Criar produto com foto em base64
    const product = productRepository.create({
      storeId: store.id,
      name,
      description: description || null,
      photo: photoBase64 || null, // Save base64 photo if provided
      printingHours: Number(printingHours),
      profitMarginPercentage: Number(desiredMarginPercentage),
      calculatedCost: totalCost,
      finalPrice,
      isActive: true,
    });

    const savedProduct = await productRepository.save(product);

    // Adicionar filamentos
    for (const filamentUsage of filaments) {
      const productFilament = productFilamentRepository.create({
        productId: savedProduct.id,
        filamentId: filamentUsage.filamentId,
        gramsUsed: filamentUsage.gramsUsed,
      });
      await productFilamentRepository.save(productFilament);
    }

    return NextResponse.json(
      {
        message: 'Produto criado com sucesso',
        product: {
          id: savedProduct.id,
          name: savedProduct.name,
          finalPrice,
          calculatedCost: totalCost,
          hasPhoto: !!photoBase64,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error('Erro ao criar produto:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    return NextResponse.json(
      { error: `Erro ao criar produto: ${errorMessage}` },
      { status: 500 },
    );
  }
}

export const POST = withAuth(handleCreateProduct);

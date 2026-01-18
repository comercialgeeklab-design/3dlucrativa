import { NextRequest, NextResponse } from 'next/server';
import { getDataSource } from '@/lib/database/data-source';
import { Platform } from '@/lib/database/entities/Platform';
import { authenticateRequest } from '@/lib/auth/middleware';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const { user, error } = await authenticateRequest(request);
    if (error || !user) {
      return NextResponse.json({ error: error || 'Não autorizado' }, { status: 401 });
    }

    const { id } = params;
    const body = await request.json();
    const { commissionPercentage, fixedFeePerItem } = body;

    if (typeof commissionPercentage !== 'number' || commissionPercentage < 0 || commissionPercentage > 100) {
      return NextResponse.json(
        { error: 'Comissão deve estar entre 0 e 100' },
        { status: 400 },
      );
    }

    if (fixedFeePerItem !== undefined && (typeof fixedFeePerItem !== 'number' || fixedFeePerItem < 0)) {
      return NextResponse.json(
        { error: 'Taxa fixa deve ser um número positivo' },
        { status: 400 },
      );
    }

    const dataSource = await getDataSource();
    const platformRepository = dataSource.getRepository(Platform);

    const platform = await platformRepository.findOne({ where: { id } });

    if (!platform) {
      return NextResponse.json(
        { error: 'Plataforma não encontrada' },
        { status: 404 },
      );
    }

    platform.commissionPercentage = commissionPercentage;
    if (fixedFeePerItem !== undefined) {
      platform.fixedFeePerItem = fixedFeePerItem;
    }

    const updatedPlatform = await platformRepository.save(platform);

    return NextResponse.json(updatedPlatform);
  } catch (error) {
    console.error('Erro ao atualizar plataforma:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar plataforma' },
      { status: 500 },
    );
  }
}

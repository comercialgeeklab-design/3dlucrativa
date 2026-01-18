import { NextRequest, NextResponse } from 'next/server';
import { getDataSource } from '@/lib/database/data-source';
import { Platform } from '@/lib/database/entities/Platform';

export async function GET(request: NextRequest) {
  try {
    const dataSource = await getDataSource();
    const platformRepository = dataSource.getRepository(Platform);

    const platforms = await platformRepository.find();

    return NextResponse.json(platforms);
  } catch (error) {
    console.error('Erro ao buscar plataformas:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar plataformas' },
      { status: 500 },
    );
  }
}

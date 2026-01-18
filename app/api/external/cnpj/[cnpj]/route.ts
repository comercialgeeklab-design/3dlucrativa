import { NextRequest, NextResponse } from 'next/server';
import { fetchCNPJData } from '@/lib/external-apis/cnpj';

export async function GET(
  request: NextRequest,
  { params }: { params: { cnpj: string } },
) {
  try {
    const { cnpj } = params;

    if (!cnpj || cnpj.replace(/\D/g, '').length !== 14) {
      return NextResponse.json({ error: 'CNPJ inválido' }, { status: 400 });
    }

    const data = await fetchCNPJData(cnpj);

    if (!data) {
      return NextResponse.json({ error: 'CNPJ não encontrado' }, { status: 404 });
    }

    return NextResponse.json({
      cnpj: data.cnpj,
      companyName: data.razao_social,
      tradeName: data.nome_fantasia,
      cep: data.cep,
      street: data.logradouro,
      number: data.numero,
      complement: data.complemento,
      neighborhood: data.bairro,
      city: data.municipio,
      state: data.uf,
    });
  } catch (error) {
    console.error('Erro ao buscar CNPJ:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar dados da empresa' },
      { status: 500 },
    );
  }
}

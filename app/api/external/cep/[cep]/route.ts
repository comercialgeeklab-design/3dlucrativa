import { NextRequest, NextResponse } from 'next/server';
import { fetchAddressByCEP } from '@/lib/external-apis/viacep';

export async function GET(
  request: NextRequest,
  { params }: { params: { cep: string } },
) {
  try {
    const { cep } = params;

    if (!cep || cep.replace(/\D/g, '').length !== 8) {
      return NextResponse.json({ error: 'CEP inválido' }, { status: 400 });
    }

    const data = await fetchAddressByCEP(cep);

    if (!data) {
      return NextResponse.json({ error: 'CEP não encontrado' }, { status: 404 });
    }

    return NextResponse.json({
      cep: data.cep,
      street: data.logradouro,
      complement: data.complemento,
      neighborhood: data.bairro,
      city: data.localidade,
      state: data.uf,
    });
  } catch (error) {
    console.error('Erro ao buscar CEP:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar endereço' },
      { status: 500 },
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { getDataSource } from '@/lib/database/data-source';
import { PaymentRequest } from '@/lib/database/entities/PaymentRequest';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'sua-chave-secreta';

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Token não fornecido' }, { status: 401 });
    }

    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (error) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }

    const dataSource = await getDataSource();
    const paymentRepository = dataSource.getRepository(PaymentRequest);

    // Verificar se usuário tem alguma solicitação de pagamento
    const existingRequest = await paymentRepository.findOne({
      where: {
        userId: decoded.userId,
      },
    });

    return NextResponse.json({
      hasRequest: !!existingRequest,
      status: existingRequest?.status || null,
    });
  } catch (error) {
    console.error('Erro ao verificar solicitação:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

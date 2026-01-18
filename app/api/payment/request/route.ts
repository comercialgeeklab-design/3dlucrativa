import { NextRequest, NextResponse } from 'next/server';
import { getDataSource } from '@/lib/database/data-source';
import { PaymentRequest, PaymentMethod } from '@/lib/database/entities/PaymentRequest';
import { User } from '@/lib/database/entities/User';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'sua-chave-secreta';

export async function POST(request: NextRequest) {
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
    const userRepository = dataSource.getRepository(User);
    const paymentRepository = dataSource.getRepository(PaymentRequest);

    const user = await userRepository.findOne({ where: { id: decoded.userId } });
    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    const body = await request.json();
    const { 
      paymentMethod, 
      amount, 
      cardHolderName, 
      cardNumber, 
      cardExpiry, 
      cardCvv, 
      pixKey 
    } = body;

    if (!paymentMethod || !amount) {
      return NextResponse.json({ error: 'Dados incompletos' }, { status: 400 });
    }

    // Verificar se já existe uma solicitação pendente
    const existingRequest = await paymentRepository.findOne({
      where: {
        userId: user.id,
        status: 'pending',
      },
    });

    if (existingRequest) {
      return NextResponse.json(
        { error: 'Você já possui uma solicitação de pagamento pendente' },
        { status: 400 }
      );
    }

    // Criar nova solicitação de pagamento
    const paymentRequest = paymentRepository.create({
      userId: user.id,
      paymentMethod: paymentMethod as PaymentMethod,
      amount,
      cardHolderName,
      cardNumber: cardNumber ? cardNumber.slice(-4) : undefined, // Salvar apenas últimos 4 dígitos
      cardExpiry,
      cardCvv: undefined, // Nunca salvar CVV
      pixKey,
      status: 'pending',
    });

    await paymentRepository.save(paymentRequest);

    return NextResponse.json({
      message: 'Solicitação de pagamento criada com sucesso',
      requestId: paymentRequest.id,
    });
  } catch (error) {
    console.error('Erro ao processar solicitação de pagamento:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

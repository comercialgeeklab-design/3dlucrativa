import { NextRequest, NextResponse } from 'next/server';
import { getDataSource } from '@/lib/database/data-source';
import { PaymentRequest, PaymentRequestStatus } from '@/lib/database/entities/PaymentRequest';
import { User, UserRole, PaymentStatus } from '@/lib/database/entities/User';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'sua-chave-secreta';

// Listar todas as solicitações (apenas admin)
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
    const userRepository = dataSource.getRepository(User);

    const admin = await userRepository.findOne({ where: { id: decoded.userId } });
    if (!admin || admin.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    const paymentRepository = dataSource.getRepository(PaymentRequest);
    const requests = await paymentRepository.find({
      relations: ['user'],
      order: {
        createdAt: 'DESC',
      },
    });

    return NextResponse.json(requests);
  } catch (error) {
    console.error('Erro ao listar solicitações:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// Aprovar ou rejeitar pagamento
export async function PATCH(request: NextRequest) {
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

    const admin = await userRepository.findOne({ where: { id: decoded.userId } });
    if (!admin || admin.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    const body = await request.json();
    const { requestId, action } = body; // action: 'approve' | 'reject'

    if (!requestId || !action) {
      return NextResponse.json({ error: 'Dados incompletos' }, { status: 400 });
    }

    const paymentRepository = dataSource.getRepository(PaymentRequest);
    const paymentRequest = await paymentRepository.findOne({
      where: { id: requestId },
      relations: ['user'],
    });

    if (!paymentRequest) {
      return NextResponse.json({ error: 'Solicitação não encontrada' }, { status: 404 });
    }

    if (paymentRequest.status !== 'pending') {
      return NextResponse.json(
        { error: 'Esta solicitação já foi processada' },
        { status: 400 }
      );
    }

    // Atualizar status da solicitação
    const newStatus = action === 'approve' ? PaymentRequestStatus.APPROVED : PaymentRequestStatus.REJECTED;
    paymentRequest.status = newStatus;
    await paymentRepository.save(paymentRequest);

    // Atualizar status do usuário
    const user = paymentRequest.user;
    user.paymentStatus = action === 'approve' ? PaymentStatus.APPROVED : PaymentStatus.REJECTED;
    await userRepository.save(user);

    return NextResponse.json({
      message: `Pagamento ${action === 'approve' ? 'aprovado' : 'rejeitado'} com sucesso`,
      status: newStatus,
    });
  } catch (error) {
    console.error('Erro ao processar pagamento:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

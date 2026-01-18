import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { AppDataSource } from '@/lib/database/data-source';
import { User, UserRole, PaymentStatus } from '@/lib/database/entities/User';
import { PaymentRequest, PaymentRequestStatus } from '@/lib/database/entities/PaymentRequest';
import { MoreThanOrEqual } from 'typeorm';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function GET(req: NextRequest) {
  try {
    // Verificar token
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Token não fornecido' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; role: string };

    // Verificar se é admin
    if (decoded.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }

    const userRepo = AppDataSource.getRepository(User);
    const paymentRepo = AppDataSource.getRepository(PaymentRequest);

    // Datas
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    // Total de usuários
    const totalUsers = await userRepo.count({ where: { role: UserRole.USER } });

    // Novos usuários este mês
    const newUsersThisMonth = await userRepo.count({
      where: {
        role: UserRole.USER,
        createdAt: MoreThanOrEqual(startOfMonth),
      },
    });

    // Assinaturas ativas (usuários com status APPROVED)
    const activeSubscriptions = await userRepo.count({
      where: {
        role: UserRole.USER,
        paymentStatus: PaymentStatus.APPROVED,
      },
    });

    // Pagamentos pendentes
    const pendingPayments = await userRepo.count({
      where: {
        role: UserRole.USER,
        paymentStatus: PaymentStatus.PENDING,
      },
    });

    // Pagamentos aprovados este mês
    const approvedPaymentsThisMonth = await paymentRepo.count({
      where: {
        status: PaymentRequestStatus.APPROVED,
        updatedAt: MoreThanOrEqual(startOfMonth),
      },
    });

    // Pagamentos rejeitados este mês
    const rejectedPaymentsThisMonth = await paymentRepo.count({
      where: {
        status: PaymentRequestStatus.REJECTED,
        updatedAt: MoreThanOrEqual(startOfMonth),
      },
    });

    // Receita total este mês (R$ 29,90 por pagamento aprovado)
    const totalRevenueThisMonth = approvedPaymentsThisMonth * 29.90;

    // Receita total (todos os pagamentos aprovados)
    const allApprovedPayments = await paymentRepo.count({
      where: { status: PaymentRequestStatus.APPROVED },
    });
    const totalRevenueAllTime = allApprovedPayments * 29.90;

    // Usuários recentes (últimos 10)
    const recentUsers = await userRepo.find({
      where: { role: UserRole.USER },
      order: { createdAt: 'DESC' },
      take: 10,
      select: ['id', 'name', 'email', 'paymentStatus', 'createdAt'],
    });

    // Receita mensal (últimos 6 meses)
    const monthlyRevenue = [];
    for (let i = 5; i >= 0; i--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const nextMonthDate = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      
      const monthName = monthDate.toLocaleDateString('pt-BR', { 
        month: 'short', 
        year: 'numeric' 
      });

      // Buscar pagamentos aprovados no período
      const monthPayments = await paymentRepo
        .createQueryBuilder('payment')
        .where('payment.status = :status', { status: PaymentRequestStatus.APPROVED })
        .andWhere('payment.updatedAt >= :start', { start: monthDate })
        .andWhere('payment.updatedAt < :end', { end: nextMonthDate })
        .getCount();

      // Buscar novos usuários no período
      const monthUsers = await userRepo
        .createQueryBuilder('user')
        .where('user.role = :role', { role: UserRole.USER })
        .andWhere('user.createdAt >= :start', { start: monthDate })
        .andWhere('user.createdAt < :end', { end: nextMonthDate })
        .getCount();

      monthlyRevenue.push({
        month: monthName,
        revenue: monthPayments * 29.90,
        users: monthUsers,
      });
    }

    return NextResponse.json({
      totalUsers,
      newUsersThisMonth,
      activeSubscriptions,
      pendingPayments,
      totalRevenueThisMonth,
      totalRevenueAllTime,
      approvedPaymentsThisMonth,
      rejectedPaymentsThisMonth,
      recentUsers,
      monthlyRevenue,
    });
  } catch (error) {
    console.error('Erro ao buscar métricas:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar métricas' },
      { status: 500 }
    );
  }
}

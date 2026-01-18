import { NextRequest, NextResponse } from 'next/server';
import { getDataSource } from '@/lib/database/data-source';
import { PaymentRequest, PaymentMethod, PaymentRequestStatus } from '@/lib/database/entities/PaymentRequest';
import { User } from '@/lib/database/entities/User';
import mercadoPagoService from '@/lib/external-apis/mercadopago';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'sua-chave-secreta';
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

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
      planType,
      cardToken,
      cardHolderName,
      cardHolderEmail,
      cardHolderDocument,
    } = body;

    if (!paymentMethod || !amount) {
      return NextResponse.json({ error: 'Dados incompletos' }, { status: 400 });
    }

    // Criar registro de solicitação de pagamento
    const paymentRequest = paymentRepository.create({
      userId: user.id,
      paymentMethod: paymentMethod === 'pix' ? PaymentMethod.PIX : PaymentMethod.CREDIT_CARD,
      amount,
      status: PaymentRequestStatus.PENDING,
    });

    await paymentRepository.save(paymentRequest);

    if (paymentMethod === 'pix') {
      // Gerar QR Code PIX via Mercado Pago
      try {
        const qrCodeResponse = await mercadoPagoService.createPixQrCode(
          amount,
          paymentRequest.id,
          `Plano ${planType || 'Premium'} - ${user.storeName || user.email}`
        );

        paymentRequest.mercadoPagoQrCodeUrl = qrCodeResponse.qr_data;
        paymentRequest.mercadoPagoQrCodeData = qrCodeResponse.qr_data;
        paymentRequest.mercadoPagoPaymentMethod = 'pix';
        paymentRequest.mercadoPagoMetadata = qrCodeResponse;

        await paymentRepository.save(paymentRequest);

        return NextResponse.json({
          success: true,
          paymentId: paymentRequest.id,
          method: 'pix',
          qrCode: qrCodeResponse.qr_data,
          amount,
          message: 'QR Code PIX gerado com sucesso',
        });
      } catch (error: any) {
        console.error('Erro ao gerar QR Code PIX:', error);
        return NextResponse.json({
          error: 'Erro ao gerar QR Code PIX',
          details: error.message,
        }, { status: 500 });
      }
    }

    if (paymentMethod === 'credit_card') {
      // Processar pagamento com cartão de crédito
      if (!cardToken || !cardHolderName || !cardHolderEmail) {
        return NextResponse.json({ 
          error: 'Dados do cartão incompletos' 
        }, { status: 400 });
      }

      try {
        const paymentData = {
          transaction_amount: parseFloat(String(amount)),
          payment_method_id: 'visa', // Pode ser ajustado baseado no tipo de cartão
          token: cardToken,
          installments: 1,
          payer: {
            email: cardHolderEmail,
            first_name: cardHolderName.split(' ')[0],
            last_name: cardHolderName.split(' ').slice(1).join(' ') || 'Client',
            identification: {
              type: 'CPF',
              number: cardHolderDocument || '00000000000',
            },
          },
          description: `Plano ${planType || 'Premium'} - ${user.storeName || user.email}`,
          external_reference: paymentRequest.id,
        };

        const mercadoPagoResponse = await mercadoPagoService.createPayment(paymentData);

        const internalStatus = mercadoPagoService.mapPaymentStatus(mercadoPagoResponse.status);

        paymentRequest.status = internalStatus;
        paymentRequest.mercadoPagoPaymentId = mercadoPagoResponse.id.toString();
        paymentRequest.mercadoPagoPaymentMethod = mercadoPagoResponse.payment_method.id;
        paymentRequest.mercadoPagoMetadata = mercadoPagoResponse;

        await paymentRepository.save(paymentRequest);

        // ✅ AUTOMÁTICO: Se pagamento aprovado, ativar plano do usuário
        if (internalStatus === PaymentRequestStatus.APPROVED) {
          user.plan = planType?.toLowerCase() === 'avançado' ? 'avancado' : 'intermediario';
          user.planActivatedAt = new Date();
          await userRepository.save(user);
        }

        return NextResponse.json({
          success: internalStatus === PaymentRequestStatus.APPROVED,
          paymentId: paymentRequest.id,
          mercadoPagoId: mercadoPagoResponse.id,
          status: internalStatus,
          method: 'credit_card',
          amount,
          message: internalStatus === PaymentRequestStatus.APPROVED 
            ? 'Pagamento aprovado com sucesso!' 
            : 'Pagamento pendente de aprovação',
        });
      } catch (error: any) {
        console.error('Erro ao processar pagamento:', error);

        paymentRequest.status = PaymentRequestStatus.REJECTED;
        await paymentRepository.save(paymentRequest);

        return NextResponse.json({
          success: false,
          paymentId: paymentRequest.id,
          status: 'rejected',
          error: 'Erro ao processar pagamento com cartão',
          details: error.response?.data?.message || error.message,
        }, { status: 400 });
      }
    }

    return NextResponse.json({
      error: 'Método de pagamento não suportado',
    }, { status: 400 });

  } catch (error: any) {
    console.error('Erro na rota de pagamento:', error);
    return NextResponse.json({
      error: 'Erro ao processar pagamento',
      details: error.message,
    }, { status: 500 });
  }
}

// GET - Obter status do pagamento
export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Token não fornecido' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const paymentId = searchParams.get('id');

    if (!paymentId) {
      return NextResponse.json({ error: 'ID do pagamento não fornecido' }, { status: 400 });
    }

    const dataSource = await getDataSource();
    const paymentRepository = dataSource.getRepository(PaymentRequest);

    const payment = await paymentRepository.findOne({
      where: { id: paymentId },
    });

    if (!payment) {
      return NextResponse.json({ error: 'Pagamento não encontrado' }, { status: 404 });
    }

    return NextResponse.json({
      id: payment.id,
      status: payment.status,
      amount: payment.amount,
      method: payment.paymentMethod,
      createdAt: payment.createdAt,
      mercadoPagoId: payment.mercadoPagoPaymentId,
      qrCode: payment.mercadoPagoQrCodeUrl,
    });
  } catch (error: any) {
    console.error('Erro ao obter status do pagamento:', error);
    return NextResponse.json({
      error: 'Erro ao obter status do pagamento',
    }, { status: 500 });
  }
}

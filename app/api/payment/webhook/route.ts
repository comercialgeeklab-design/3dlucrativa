import { NextRequest, NextResponse } from 'next/server';
import { getDataSource } from '@/lib/database/data-source';
import { PaymentRequest, PaymentRequestStatus } from '@/lib/database/entities/PaymentRequest';
import { User } from '@/lib/database/entities/User';
import mercadoPagoService from '@/lib/external-apis/mercadopago';

/**
 * Webhook para receber notificações de pagamento do Mercado Pago
 * POST /api/payment/webhook
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log('Webhook do Mercado Pago recebido:', {
      type: body.type,
      data: body.data,
      action: body.action,
    });

    // Mercado Pago envia dois tipos de notificação:
    // 1. payment - quando há mudança no status do pagamento
    // 2. merchant_order - para pedidos
    
    if (body.type === 'payment') {
      const paymentId = body.data?.id;

      if (!paymentId) {
        return NextResponse.json({
          error: 'ID do pagamento não fornecido',
        }, { status: 400 });
      }

      try {
        // Obter informações atualizadas do pagamento no Mercado Pago
        const mercadoPagoPayment = await mercadoPagoService.getPayment(String(paymentId));

        console.log('Detalhes do pagamento do MP:', {
          id: mercadoPagoPayment.id,
          status: mercadoPagoPayment.status,
          external_reference: mercadoPagoPayment.external_reference,
        });

        // Buscar o pagamento interno pelo external_reference (nosso ID)
        const dataSource = await getDataSource();
        const paymentRepository = dataSource.getRepository(PaymentRequest);
        const userRepository = dataSource.getRepository(User);

        const paymentRequest = await paymentRepository.findOne({
          where: { id: mercadoPagoPayment.external_reference },
          relations: ['user'],
        });

        if (!paymentRequest) {
          console.warn('Pagamento interno não encontrado:', mercadoPagoPayment.external_reference);
          return NextResponse.json({
            success: true,
            message: 'Notificação recebida (pagamento não encontrado)',
          });
        }

        // Mapear status do Mercado Pago para status interno
        const newStatus = mercadoPagoService.mapPaymentStatus(mercadoPagoPayment.status);

        // Atualizar apenas se o status mudou
        if (paymentRequest.status !== newStatus) {
          paymentRequest.status = newStatus;
          paymentRequest.mercadoPagoPaymentId = paymentId.toString();
          paymentRequest.mercadoPagoPaymentMethod = mercadoPagoPayment.payment_method?.id || 'unknown';
          paymentRequest.mercadoPagoMetadata = {
            ...paymentRequest.mercadoPagoMetadata,
            lastWebhookUpdate: new Date().toISOString(),
            mercadoPagoStatus: mercadoPagoPayment.status,
          };

          await paymentRepository.save(paymentRequest);

          console.log('Pagamento atualizado:', {
            id: paymentRequest.id,
            novoStatus: newStatus,
          });

          // ✅ AUTOMÁTICO: Se pagamento aprovado, ativar plano do usuário
          if (newStatus === PaymentRequestStatus.APPROVED && paymentRequest.user) {
            const user = await userRepository.findOne({ 
              where: { id: paymentRequest.userId } 
            });
            
            if (user) {
              // Determinar plano baseado no valor do pagamento
              // PIX: 0.01 = Intermediário, 0.02 = Avançado
              // Ou usar lógica diferente conforme necessário
              if (paymentRequest.amount === 0.01) {
                user.plan = 'intermediario';
              } else if (paymentRequest.amount === 0.02) {
                user.plan = 'avancado';
              }
              
              user.planActivatedAt = new Date();
              await userRepository.save(user);
              
              console.log('✅ Plano ativado automaticamente para usuário:', {
                userId: user.id,
                plan: user.plan,
                timestamp: new Date().toISOString(),
              });
            }
          }

          // TODO: Aqui você pode adicionar lógica adicional:
          // - Enviar email de confirmação
          // - Ativar plano do usuário
          // - Registrar em auditoria
          // - Etc.
        }

        return NextResponse.json({
          success: true,
          message: 'Pagamento processado com sucesso',
          paymentId: paymentRequest.id,
          status: newStatus,
        });

      } catch (error: any) {
        console.error('Erro ao processar webhook:', error);
        return NextResponse.json({
          success: true, // Retornar 2xx para não reenviar
          message: 'Notificação recebida mas com erro no processamento',
          error: error.message,
        });
      }
    }

    if (body.type === 'merchant_order') {
      console.log('Notificação de pedido recebida:', body.data?.id);
      // Processar notificações de merchant_order se necessário
      return NextResponse.json({
        success: true,
        message: 'Notificação de pedido recebida',
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Notificação recebida',
    });

  } catch (error: any) {
    console.error('Erro no webhook:', error);
    
    // Importante: retornar 2xx mesmo em erro para evitar reenvios infinitos
    return NextResponse.json({
      success: true,
      error: 'Erro ao processar webhook',
      details: error.message,
    });
  }
}

// GET - Para teste do webhook (Mercado Pago usa GET para validar)
export async function GET(request: NextRequest) {
  return NextResponse.json({
    status: 'ok',
    message: 'Webhook endpoint está ativo',
    timestamp: new Date().toISOString(),
  });
}

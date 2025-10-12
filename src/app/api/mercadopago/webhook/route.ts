import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/mercadopago/webhook
 * Recibir notificaciones de Mercado Pago sobre cambios en el estado del pago
 * 
 * Mercado Pago enviará notificaciones cuando:
 * - Se apruebe un pago
 * - Se rechace un pago
 * - El pago quede pendiente
 * - Se haga un reembolso
 * 
 * Documentación: https://www.mercadopago.com.uy/developers/es/docs/your-integrations/notifications/webhooks
 */

interface MercadoPagoNotification {
  id: number;
  live_mode: boolean;
  type: 'payment' | 'plan' | 'subscription' | 'point_integration_wh';
  date_created: string;
  user_id: string;
  api_version: string;
  action: string;
  data: {
    id: string;
  };
}

export async function POST(request: NextRequest) {
  try {
    const notification: MercadoPagoNotification = await request.json();
    
    console.log('🔔 Webhook de Mercado Pago recibido:', notification);

    // Verificar que sea una notificación de pago
    if (notification.type !== 'payment') {
      console.log('ℹ️ Notificación ignorada (no es de pago)');
      return NextResponse.json({ status: 'ignored' }, { status: 200 });
    }

    const paymentId = notification.data.id;
    console.log('💳 Payment ID:', paymentId);

    // ============================================
    // PRODUCCIÓN (Descomentar cuando tengas las credenciales)
    // ============================================
    /*
    const mercadopago = require('mercadopago');
    
    // Configurar credenciales
    mercadopago.configure({
      access_token: process.env.MERCADOPAGO_ACCESS_TOKEN
    });

    // Obtener información del pago
    const payment = await mercadopago.payment.findById(paymentId);
    
    console.log('📊 Estado del pago:', {
      id: payment.body.id,
      status: payment.body.status,
      status_detail: payment.body.status_detail,
      external_reference: payment.body.external_reference,
      transaction_amount: payment.body.transaction_amount
    });

    // Actualizar el pedido en la base de datos según el estado
    const orderId = payment.body.external_reference;
    
    switch (payment.body.status) {
      case 'approved':
        // Pago aprobado - marcar pedido como pagado
        console.log('✅ Pago aprobado para pedido:', orderId);
        // TODO: await ordersAPI.updateStatus(orderId, 'paid');
        // TODO: Enviar email de confirmación
        break;
        
      case 'pending':
        // Pago pendiente
        console.log('⏳ Pago pendiente para pedido:', orderId);
        // TODO: await ordersAPI.updateStatus(orderId, 'pending_payment');
        break;
        
      case 'rejected':
        // Pago rechazado
        console.log('❌ Pago rechazado para pedido:', orderId);
        // TODO: await ordersAPI.updateStatus(orderId, 'payment_failed');
        // TODO: Enviar email notificando el rechazo
        break;
        
      case 'refunded':
        // Pago reembolsado
        console.log('↩️ Pago reembolsado para pedido:', orderId);
        // TODO: await ordersAPI.updateStatus(orderId, 'refunded');
        break;
        
      case 'cancelled':
        // Pago cancelado
        console.log('🚫 Pago cancelado para pedido:', orderId);
        // TODO: await ordersAPI.updateStatus(orderId, 'cancelled');
        break;
    }
    */

    // Por ahora, solo loggeamos
    console.log('ℹ️ Webhook procesado (modo simulación)');

    return NextResponse.json({ status: 'received' }, { status: 200 });

  } catch (error) {
    console.error('❌ Error al procesar webhook de Mercado Pago:', error);
    return NextResponse.json(
      { 
        error: 'Error al procesar webhook',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// GET endpoint para verificar que el webhook está configurado
export async function GET() {
  return NextResponse.json({
    message: 'Mercado Pago Webhook Endpoint',
    status: 'active',
    documentation: 'https://www.mercadopago.com.uy/developers/es/docs/your-integrations/notifications/webhooks'
  });
}

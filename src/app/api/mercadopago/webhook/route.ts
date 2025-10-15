import { NextRequest, NextResponse } from 'next/server';
import { MercadoPagoConfig, Payment } from 'mercadopago';
import { createClient } from '@supabase/supabase-js';

/**
 * POST /api/mercadopago/webhook
 * Recibir notificaciones de Mercado Pago sobre cambios en el estado del pago
 */

interface MercadoPagoNotification {
  id?: number;
  live_mode?: boolean;
  type: 'payment' | 'plan' | 'subscription' | 'point_integration_wh';
  date_created?: string;
  user_id?: string;
  api_version?: string;
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

    // Validar credenciales
    if (!process.env.MERCADOPAGO_ACCESS_TOKEN) {
      console.error('❌ MERCADOPAGO_ACCESS_TOKEN no configurado');
      return NextResponse.json({ status: 'error' }, { status: 500 });
    }

    // Configurar cliente de Mercado Pago
    const client = new MercadoPagoConfig({
      accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN,
      options: { timeout: 5000 }
    });

    const payment = new Payment(client);

    // Obtener información del pago
    const paymentInfo = await payment.get({ id: paymentId });
    
    console.log('📊 Estado del pago:', {
      id: paymentInfo.id,
      status: paymentInfo.status,
      status_detail: paymentInfo.status_detail,
      external_reference: paymentInfo.external_reference,
      transaction_amount: paymentInfo.transaction_amount
    });

    // Actualizar el pedido en la base de datos según el estado
    const orderId = paymentInfo.external_reference;
    
    if (!orderId) {
      console.error('❌ No se encontró external_reference en el pago');
      return NextResponse.json({ status: 'error' }, { status: 400 });
    }

    // Inicializar Supabase
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Actualizar estado del pedido según el estado del pago
    let newStatus: string;
    let paymentStatus: string;

    switch (paymentInfo.status) {
      case 'approved':
        newStatus = 'processing';
        paymentStatus = 'paid';
        console.log('✅ Pago aprobado para pedido:', orderId);
        break;
        
      case 'pending':
      case 'in_process':
        newStatus = 'pending';
        paymentStatus = 'pending';
        console.log('⏳ Pago pendiente para pedido:', orderId);
        break;
        
      case 'rejected':
        newStatus = 'cancelled';
        paymentStatus = 'failed';
        console.log('❌ Pago rechazado para pedido:', orderId);
        break;
        
      case 'refunded':
        newStatus = 'refunded';
        paymentStatus = 'refunded';
        console.log('↩️ Pago reembolsado para pedido:', orderId);
        break;
        
      case 'cancelled':
        newStatus = 'cancelled';
        paymentStatus = 'failed';
        console.log('🚫 Pago cancelado para pedido:', orderId);
        break;
        
      default:
        console.log('⚠️ Estado de pago desconocido:', paymentInfo.status);
        return NextResponse.json({ status: 'unknown_status' }, { status: 200 });
    }

    // Actualizar pedido en Supabase
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        status: newStatus,
        payment_status: paymentStatus,
        payment_provider_id: paymentInfo.id?.toString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId);

    if (updateError) {
      console.error('❌ Error al actualizar pedido:', updateError);
      return NextResponse.json({ status: 'error' }, { status: 500 });
    }

    console.log('✅ Pedido actualizado correctamente');

    return NextResponse.json({ status: 'processed' }, { status: 200 });

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

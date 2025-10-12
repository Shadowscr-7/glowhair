import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/mercadopago/create-preference
 * Crear preferencia de pago en Mercado Pago
 * 
 * IMPORTANTE: Para usar en producción, debes:
 * 1. Instalar el SDK: npm install mercadopago
 * 2. Configurar las credenciales en variables de entorno:
 *    - MERCADOPAGO_ACCESS_TOKEN (Production o Test)
 * 3. Descomentar el código real y eliminar la simulación
 */

interface MercadoPagoItem {
  title: string;
  quantity: number;
  unit_price: number;
  currency_id: string;
}

interface PayerInfo {
  name: string;
  surname: string;
  email: string;
  phone: {
    number: string;
  };
}

interface BackUrls {
  success: string;
  failure: string;
  pending: string;
}

interface PreferenceRequest {
  orderId: string;
  items: MercadoPagoItem[];
  payer: PayerInfo;
  back_urls: BackUrls;
  auto_return: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: PreferenceRequest = await request.json();

    console.log('🟢 Creando preferencia de Mercado Pago:', body);

    // ============================================
    // SIMULACIÓN (DESARROLLO)
    // ============================================
    // Retornar URL simulada para testing
    const simulatedResponse = {
      id: `pref-${Date.now()}`,
      init_point: `https://www.mercadopago.com.uy/checkout/v1/redirect?pref_id=simulation-${body.orderId}`,
      sandbox_init_point: `https://sandbox.mercadopago.com.uy/checkout/v1/redirect?pref_id=simulation-${body.orderId}`,
      status: 'pending'
    };

    return NextResponse.json(simulatedResponse, { status: 200 });

    // ============================================
    // PRODUCCIÓN (Descomentar cuando tengas las credenciales)
    // ============================================
    /*
    const mercadopago = require('mercadopago');
    
    // Configurar credenciales
    mercadopago.configure({
      access_token: process.env.MERCADOPAGO_ACCESS_TOKEN
    });

    // Crear preferencia
    const preference = {
      items: body.items.map(item => ({
        title: item.title,
        unit_price: item.unit_price,
        quantity: item.quantity,
        currency_id: item.currency_id || 'UYU' // Peso uruguayo
      })),
      payer: {
        name: body.payer.name,
        surname: body.payer.surname,
        email: body.payer.email,
        phone: {
          number: body.payer.phone.number
        }
      },
      back_urls: {
        success: body.back_urls.success,
        failure: body.back_urls.failure,
        pending: body.back_urls.pending
      },
      auto_return: body.auto_return || 'approved',
      external_reference: body.orderId,
      statement_descriptor: 'GLOWHAIR',
      notification_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/mercadopago/webhook`,
      metadata: {
        order_id: body.orderId
      }
    };

    const response = await mercadopago.preferences.create(preference);
    
    return NextResponse.json({
      id: response.body.id,
      init_point: response.body.init_point,
      sandbox_init_point: response.body.sandbox_init_point,
      status: 'success'
    }, { status: 200 });
    */

  } catch (error) {
    console.error('❌ Error al crear preferencia de Mercado Pago:', error);
    return NextResponse.json(
      { 
        error: 'Error al crear preferencia de pago',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

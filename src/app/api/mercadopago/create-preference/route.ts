import { NextRequest, NextResponse } from 'next/server';
import { MercadoPagoConfig, Preference } from 'mercadopago';

/**
 * POST /api/mercadopago/create-preference
 * Crear preferencia de pago en Mercado Pago
 */

interface MercadoPagoItem {
  id?: string;
  title: string;
  quantity: number;
  unit_price: number;
  currency_id?: string;
}

interface PayerInfo {
  name: string;
  surname: string;
  email: string;
  phone?: {
    area_code?: string;
    number: string;
  };
  address?: {
    street_name?: string;
    street_number?: string;
    zip_code?: string;
  };
}

interface PreferenceRequest {
  orderId: string;
  items: MercadoPagoItem[];
  payer: PayerInfo;
  totalAmount?: number;
}

export async function POST(request: NextRequest) {
  try {
    const body: PreferenceRequest = await request.json();

    console.log('🟢 Creando preferencia de Mercado Pago:', body);

    // Validar credenciales
    if (!process.env.MERCADOPAGO_ACCESS_TOKEN) {
      console.error('❌ MERCADOPAGO_ACCESS_TOKEN no configurado');
      return NextResponse.json(
        { error: 'Mercado Pago no está configurado correctamente' },
        { status: 500 }
      );
    }

    // Configurar cliente de Mercado Pago
    const client = new MercadoPagoConfig({
      accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN,
      options: { timeout: 5000 }
    });

    const preference = new Preference(client);

    // Obtener base URL
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 
                    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 
                    'http://localhost:3000';

    // Crear preferencia de pago
    const preferenceData = {
      items: body.items.map(item => ({
        id: item.id || `item-${Date.now()}`,
        title: item.title,
        quantity: item.quantity,
        unit_price: item.unit_price,
        currency_id: item.currency_id || 'UYU', // Peso uruguayo
      })),
      payer: {
        name: body.payer.name,
        surname: body.payer.surname,
        email: body.payer.email,
        phone: body.payer.phone ? {
          area_code: body.payer.phone.area_code || '',
          number: body.payer.phone.number,
        } : undefined,
        address: body.payer.address ? {
          street_name: body.payer.address.street_name || '',
          street_number: body.payer.address.street_number || '',
          zip_code: body.payer.address.zip_code || '',
        } : undefined,
      },
      back_urls: {
        success: `${baseUrl}/orders/success?orderId=${body.orderId}`,
        failure: `${baseUrl}/checkout?error=payment_failed`,
        pending: `${baseUrl}/orders/pending?orderId=${body.orderId}`,
      },
      auto_return: 'approved' as const,
      external_reference: body.orderId,
      statement_descriptor: 'GLOWHAIR',
      notification_url: `${baseUrl}/api/mercadopago/webhook`,
      expires: false,
      payment_methods: {
        installments: 12, // Permitir hasta 12 cuotas
      },
    };

    const response = await preference.create({ body: preferenceData });

    console.log('✅ Preferencia creada:', response.id);

    return NextResponse.json({
      id: response.id,
      init_point: response.init_point,
      sandbox_init_point: response.sandbox_init_point,
      status: 'success'
    });

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

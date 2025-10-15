import { NextRequest, NextResponse } from 'next/server';
import { orderService, CreateOrderData } from '@/lib/services/orders';
import { emailService } from '@/lib/services/email';

/**
 * GET /api/orders
 * Obtener todas las órdenes del usuario actual o todas (si es admin)
 */
export async function GET(request: NextRequest) {
  try {
    console.log('🔵 GET /api/orders - Inicio');
    
    const { searchParams } = new URL(request.url);
    const userId = request.headers.get('x-user-id') || searchParams.get('user_id');
    const isAdmin = request.headers.get('x-is-admin') === 'true' || searchParams.get('is_admin') === 'true';
    
    // Filtros
    const status = searchParams.get('status') || undefined;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    console.log('📦 Parámetros:', { userId, isAdmin, status, page, limit });

    if (isAdmin) {
      // Admin: obtener todas las órdenes
      console.log('👑 Usuario admin - obteniendo todas las órdenes');
      const result = await orderService.getAllOrders({ status, page, limit });
      
      console.log('📊 Resultado getAllOrders:', { 
        success: result.success, 
        ordersCount: result.data?.orders?.length,
        total: result.data?.total,
        error: result.error 
      });
      
      if (!result.success) {
        console.error('❌ Error en getAllOrders:', result.error);
        return NextResponse.json(
          { error: result.error },
          { status: 400 }
        );
      }

      return NextResponse.json({
        orders: result.data?.orders || [],
        total: result.data?.total || 0,
        page,
        limit
      });
    } else if (userId) {
      // Usuario: obtener solo sus órdenes
      const result = await orderService.getUserOrders(userId, page, limit);
      
      console.log('📦 Resultado getUserOrders:', { success: result.success, error: result.error });

      if (!result.success) {
        console.error('❌ Error al obtener órdenes del usuario:', result.error);
        return NextResponse.json(
          { error: result.error || 'Error al obtener órdenes' },
          { status: 400 }
        );
      }

      return NextResponse.json({
        orders: result.data?.orders || [],
        total: result.data?.total || 0,
        page,
        limit
      });
    } else {
      console.log('⚠️ No userId ni isAdmin');
      return NextResponse.json(
        { error: 'Usuario no autenticado' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('❌ Error in GET /api/orders:', error);
    return NextResponse.json(
      { error: 'Error al obtener órdenes' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/orders
 * Crear una nueva orden
 */
export async function POST(request: NextRequest) {
  try {
    console.log('🔵 POST /api/orders - Inicio');
    
    const body = await request.json();
    console.log('📦 Body recibido:', JSON.stringify(body, null, 2));

    // Validar campos requeridos
    if (!body.user_id) {
      return NextResponse.json(
        { error: 'user_id es requerido' },
        { status: 400 }
      );
    }

    if (!body.shipping_address) {
      return NextResponse.json(
        { error: 'shipping_address es requerido' },
        { status: 400 }
      );
    }

    if (!body.items || body.items.length === 0) {
      return NextResponse.json(
        { error: 'items es requerido y no puede estar vacío' },
        { status: 400 }
      );
    }

    // Preparar datos de la orden
    const orderData: CreateOrderData = {
      user_id: body.user_id,
      total: parseFloat(body.total),
      subtotal: parseFloat(body.subtotal),
      tax: parseFloat(body.tax),
      shipping: parseFloat(body.shipping),
      status: body.status || 'pending',
      payment_method: body.payment_method || 'mercadopago',
      payment_status: body.payment_status || 'pending',
      shipping_address: body.shipping_address,
      items: body.items.map((item: { product_id: string; quantity: number; price: number; product_name?: string }) => ({
        product_id: item.product_id,
        quantity: item.quantity,
        price: parseFloat(item.price.toString()),
        product_name: item.product_name,
      })),
    };

    console.log('✅ Datos de orden preparados');

    // Crear la orden usando el servicio
    const result = await orderService.createOrder(orderData);

    if (!result.success) {
      console.error('❌ Error al crear orden:', result.error);
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    console.log('✅ Orden creada exitosamente:', result.data?.id);

    // Enviar emails de confirmación (no bloqueante)
    emailService.sendOrderConfirmation({
      orderId: result.data!.id,
      customerEmail: body.shipping_address.email,
      customerName: `${body.shipping_address.firstName} ${body.shipping_address.lastName}`,
      total: orderData.total,
      items: orderData.items.map(item => ({
        name: item.product_name || 'Producto',
        quantity: item.quantity,
        price: item.price,
      })),
      shippingAddress: {
        address: body.shipping_address.address,
        city: body.shipping_address.city,
        state: body.shipping_address.state,
        zipCode: body.shipping_address.zipCode,
        country: body.shipping_address.country,
      },
    }).catch(err => console.error('Error enviando email al cliente:', err));

    // Notificar al admin (no bloqueante)
    emailService.notifyAdminNewOrder({
      orderId: result.data!.id,
      customerEmail: body.shipping_address.email,
      customerName: `${body.shipping_address.firstName} ${body.shipping_address.lastName}`,
      total: orderData.total,
      items: orderData.items.map(item => ({
        name: item.product_name || 'Producto',
        quantity: item.quantity,
        price: item.price,
      })),
      shippingAddress: {
        address: body.shipping_address.address,
        city: body.shipping_address.city,
        state: body.shipping_address.state,
        zipCode: body.shipping_address.zipCode,
        country: body.shipping_address.country,
      },
    }).catch(err => console.error('Error notificando al admin:', err));

    // Retornar la orden creada (ya tiene el formato correcto)
    return NextResponse.json({
      success: true,
      order: result.data,
      message: 'Orden creada exitosamente'
    }, { status: 201 });
  } catch (error) {
    console.error('❌ Error in POST /api/orders:', error);
    return NextResponse.json(
      { error: 'Error al crear orden' },
      { status: 500 }
    );
  }
}

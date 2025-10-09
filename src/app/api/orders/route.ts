import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * GET /api/orders
 * Obtener todas las órdenes del usuario actual o todas (si es admin)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = request.headers.get('x-user-id') || 'temp-user-id';
    const isAdmin = request.headers.get('x-is-admin') === 'true';
    
    // Filtros
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = supabase
      .from('orders')
      .select(`
        *,
        user:users(id, email, full_name),
        items:order_items(
          id,
          product_id,
          quantity,
          price,
          product:products(id, name, image, slug)
        )
      `, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Si no es admin, solo mostrar órdenes del usuario
    if (!isAdmin) {
      query = query.eq('user_id', userId);
    }

    // Filtrar por estado si se proporciona
    if (status) {
      query = query.eq('status', status);
    }

    const { data, error, count } = await query;

    if (error) throw error;

    return NextResponse.json({
      orders: data || [],
      total: count || 0,
      limit,
      offset
    });
  } catch (error) {
    console.error('Error in GET /api/orders:', error);
    return NextResponse.json(
      { error: 'Error al obtener órdenes' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/orders
 * Crear una nueva orden desde el carrito
 */
export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id') || 'temp-user-id';
    const body = await request.json();

    // Validar campos requeridos
    if (!body.shipping_address) {
      return NextResponse.json(
        { error: 'shipping_address es requerido' },
        { status: 400 }
      );
    }

    // Obtener items del carrito
    const { data: cartItems, error: cartError } = await supabase
      .from('cart_items')
      .select(`
        quantity,
        product:products!inner(
          id,
          name,
          price,
          stock
        )
      `)
      .eq('user_id', userId);

    if (cartError) throw cartError;

    if (!cartItems || cartItems.length === 0) {
      return NextResponse.json(
        { error: 'El carrito está vacío' },
        { status: 400 }
      );
    }

    // Verificar stock de todos los productos
    for (const item of cartItems) {
      const product = Array.isArray(item.product) ? item.product[0] : item.product;
      if (product.stock < item.quantity) {
        return NextResponse.json(
          { error: `Stock insuficiente para ${product.name}` },
          { status: 400 }
        );
      }
    }

    // Calcular totales
    const subtotal = cartItems.reduce((sum, item) => {
      const product = Array.isArray(item.product) ? item.product[0] : item.product;
      return sum + (product.price * item.quantity);
    }, 0);

    const taxRate = 0.16;
    const tax = subtotal * taxRate;
    const shippingCost = subtotal >= 50 ? 0 : 5.99;
    const total = subtotal + tax + shippingCost;

    // Crear la orden
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: userId,
        status: 'pending',
        subtotal: parseFloat(subtotal.toFixed(2)),
        tax: parseFloat(tax.toFixed(2)),
        shipping: parseFloat(shippingCost.toFixed(2)),
        total: parseFloat(total.toFixed(2)),
        shipping_address: body.shipping_address,
        billing_address: body.billing_address || body.shipping_address,
        payment_method: body.payment_method || 'pending',
        notes: body.notes || null
      })
      .select()
      .single();

    if (orderError) throw orderError;

    // Crear items de la orden
    const orderItems = cartItems.map(item => {
      const product = Array.isArray(item.product) ? item.product[0] : item.product;
      return {
        order_id: order.id,
        product_id: product.id,
        quantity: item.quantity,
        price: product.price
      };
    });

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) throw itemsError;

    // Actualizar stock de productos
    for (const item of cartItems) {
      const product = Array.isArray(item.product) ? item.product[0] : item.product;
      await supabase
        .from('products')
        .update({ stock: product.stock - item.quantity })
        .eq('id', product.id);
    }

    // Limpiar el carrito
    await supabase
      .from('cart_items')
      .delete()
      .eq('user_id', userId);

    // Obtener orden completa con items
    const { data: fullOrder } = await supabase
      .from('orders')
      .select(`
        *,
        items:order_items(
          id,
          product_id,
          quantity,
          price,
          product:products(id, name, image, slug)
        )
      `)
      .eq('id', order.id)
      .single();

    return NextResponse.json(fullOrder, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/orders:', error);
    return NextResponse.json(
      { error: 'Error al crear orden' },
      { status: 500 }
    );
  }
}

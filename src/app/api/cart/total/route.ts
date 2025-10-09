import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

interface CartItemWithProduct {
  quantity: number;
  product: {
    price: number;
    original_price?: number;
  };
}

/**
 * GET /api/cart/total
 * Obtener el total del carrito (subtotal, impuestos, total)
 */
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id') || 'temp-user-id';

    const { data, error } = await supabase
      .from('cart_items')
      .select(`
        quantity,
        product:products!inner(
          price,
          original_price
        )
      `)
      .eq('user_id', userId)
      .returns<CartItemWithProduct[]>();

    if (error) throw error;

    const cartItems = data || [];

    if (cartItems.length === 0) {
      return NextResponse.json({
        subtotal: 0,
        tax: 0,
        discount: 0,
        shipping: 0,
        total: 0,
        items: 0
      });
    }

    // Calcular subtotal
    const subtotal = cartItems.reduce((sum, item) => {
      const price = item.product?.price || 0;
      return sum + (price * item.quantity);
    }, 0);

    // Calcular descuentos (si hay precio original)
    const discount = cartItems.reduce((sum, item) => {
      const price = item.product?.price || 0;
      const originalPrice = item.product?.original_price || price;
      const savings = originalPrice - price;
      return sum + (savings * item.quantity);
    }, 0);

    // Calcular impuestos (ejemplo: 16%)
    const taxRate = 0.16;
    const tax = subtotal * taxRate;

    // Calcular envío (gratis si subtotal > $50)
    const freeShippingThreshold = 50;
    const shippingCost = 5.99;
    const shipping = subtotal >= freeShippingThreshold ? 0 : shippingCost;

    // Total
    const total = subtotal + tax + shipping;

    return NextResponse.json({
      subtotal: parseFloat(subtotal.toFixed(2)),
      tax: parseFloat(tax.toFixed(2)),
      discount: parseFloat(discount.toFixed(2)),
      shipping: parseFloat(shipping.toFixed(2)),
      total: parseFloat(total.toFixed(2)),
      items: cartItems.length,
      taxRate,
      freeShippingThreshold,
      freeShipping: subtotal >= freeShippingThreshold
    });
  } catch (error) {
    console.error('Error in GET /api/cart/total:', error);
    return NextResponse.json(
      { error: 'Error al calcular total del carrito' },
      { status: 500 }
    );
  }
}

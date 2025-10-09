import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * GET /api/cart/count
 * Obtener el número total de items en el carrito
 */
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id') || 'temp-user-id';

    const { data, error, count } = await supabase
      .from('cart_items')
      .select('quantity', { count: 'exact' })
      .eq('user_id', userId);

    if (error) throw error;

    // Sumar todas las cantidades
    const totalItems = data?.reduce((sum, item) => sum + item.quantity, 0) || 0;

    return NextResponse.json(
      {
        count: totalItems,
        uniqueItems: count || 0
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in GET /api/cart/count:', error);
    return NextResponse.json(
      { error: 'Error al obtener contador del carrito' },
      { status: 500 }
    );
  }
}

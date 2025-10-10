import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * GET /api/orders/user/[userId]
 * Obtener todas las órdenes de un usuario específico (admin o el mismo usuario)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const requestUserId = request.headers.get('x-user-id') || 'temp-user-id';
    const isAdmin = request.headers.get('x-is-admin') === 'true';

    // Verificar permisos
    if (!isAdmin && requestUserId !== userId) {
      return NextResponse.json(
        { error: 'No autorizado para ver órdenes de este usuario' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    const { data: orders, error, count } = await supabase
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
      `, { count: 'exact' })
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    return NextResponse.json({
      orders: orders || [],
      total: count || 0,
      limit,
      offset
    });
  } catch (error) {
    console.error('Error in GET /api/orders/user/[userId]:', error);
    return NextResponse.json(
      { error: 'Error al obtener órdenes del usuario' },
      { status: 500 }
    );
  }
}

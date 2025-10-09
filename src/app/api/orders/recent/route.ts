import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * GET /api/orders/recent
 * Obtener las órdenes más recientes (últimas 10 por defecto)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = request.headers.get('x-user-id') || 'temp-user-id';
    const isAdmin = request.headers.get('x-is-admin') === 'true';
    const limit = parseInt(searchParams.get('limit') || '10');

    let query = supabase
      .from('orders')
      .select(`
        id,
        status,
        total,
        created_at,
        user:users(id, email, full_name),
        items:order_items(
          id,
          quantity,
          product:products(id, name, image)
        )
      `)
      .order('created_at', { ascending: false })
      .limit(limit);

    // Si no es admin, filtrar por usuario
    if (!isAdmin) {
      query = query.eq('user_id', userId);
    }

    const { data: orders, error } = await query;

    if (error) throw error;

    return NextResponse.json(orders || []);
  } catch (error) {
    console.error('Error in GET /api/orders/recent:', error);
    return NextResponse.json(
      { error: 'Error al obtener órdenes recientes' },
      { status: 500 }
    );
  }
}

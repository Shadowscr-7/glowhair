import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * GET /api/reviews/user/[userId]
 * Obtener todas las reseñas de un usuario
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params;
    const requestUserId = request.headers.get('x-user-id') || 'temp-user-id';
    const isAdmin = request.headers.get('x-is-admin') === 'true';

    // Verificar permisos (solo el usuario o admin pueden ver sus reseñas)
    if (!isAdmin && requestUserId !== userId) {
      return NextResponse.json(
        { error: 'No autorizado para ver reseñas de este usuario' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    const { data: reviews, error, count } = await supabase
      .from('reviews')
      .select(`
        id,
        product_id,
        rating,
        title,
        comment,
        created_at,
        updated_at,
        product:products(id, name, slug, image)
      `, { count: 'exact' })
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    return NextResponse.json({
      reviews: reviews || [],
      total: count || 0,
      limit,
      offset
    });
  } catch (error) {
    console.error('Error in GET /api/reviews/user/[userId]:', error);
    return NextResponse.json(
      { error: 'Error al obtener reseñas del usuario' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * GET /api/reviews/product/[productId]
 * Obtener todas las reseñas de un producto con estadísticas
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { productId: string } }
) {
  try {
    const { productId } = params;
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Obtener reseñas
    const { data: reviews, error: reviewsError, count } = await supabase
      .from('reviews')
      .select(`
        id,
        user_id,
        rating,
        title,
        comment,
        created_at,
        updated_at,
        user:users(id, full_name)
      `, { count: 'exact' })
      .eq('product_id', productId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (reviewsError) throw reviewsError;

    // Calcular estadísticas
    const { data: allReviews, error: statsError } = await supabase
      .from('reviews')
      .select('rating')
      .eq('product_id', productId);

    if (statsError) throw statsError;

    const totalReviews = allReviews?.length || 0;
    const averageRating = totalReviews > 0
      ? allReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
      : 0;

    // Distribución de calificaciones
    const ratingDistribution = {
      5: allReviews?.filter(r => r.rating === 5).length || 0,
      4: allReviews?.filter(r => r.rating === 4).length || 0,
      3: allReviews?.filter(r => r.rating === 3).length || 0,
      2: allReviews?.filter(r => r.rating === 2).length || 0,
      1: allReviews?.filter(r => r.rating === 1).length || 0
    };

    return NextResponse.json({
      reviews: reviews || [],
      pagination: {
        total: count || 0,
        limit,
        offset
      },
      statistics: {
        totalReviews,
        averageRating: parseFloat(averageRating.toFixed(2)),
        ratingDistribution
      }
    });
  } catch (error) {
    console.error('Error in GET /api/reviews/product/[productId]:', error);
    return NextResponse.json(
      { error: 'Error al obtener reseñas del producto' },
      { status: 500 }
    );
  }
}

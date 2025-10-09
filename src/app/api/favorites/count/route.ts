import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * GET /api/favorites/count
 * Obtener el número de favoritos del usuario
 */
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id') || 'temp-user-id';

    const { count, error } = await supabase
      .from('favorites')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (error) throw error;

    return NextResponse.json({
      count: count || 0
    });
  } catch (error) {
    console.error('Error in GET /api/favorites/count:', error);
    return NextResponse.json(
      { error: 'Error al obtener contador de favoritos' },
      { status: 500 }
    );
  }
}

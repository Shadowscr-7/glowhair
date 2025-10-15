import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * GET /api/favorites/count
 * Obtener el número de favoritos del usuario
 */
export async function GET(request: NextRequest) {
  try {
    // UUID temporal para desarrollo (reemplazar con auth.uid() en producción)
    const userId = request.headers.get('x-user-id') || '00000000-0000-0000-0000-000000000001';

    const { count, error } = await supabase
      .from('glowhair_favorites')
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

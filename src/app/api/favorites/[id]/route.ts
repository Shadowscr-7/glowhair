import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * DELETE /api/favorites/[id]
 * Eliminar un favorito específico por product_id
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await params in Next.js 15
    const { id: productId } = await params;
    
    // UUID temporal para desarrollo (reemplazar con auth.uid() en producción)
    const userId = request.headers.get('x-user-id') || '00000000-0000-0000-0000-000000000001';

    // Eliminar el favorito
    const { error } = await supabase
      .from('glowhair_favorites')
      .delete()
      .eq('user_id', userId)
      .eq('product_id', productId);

    if (error) throw error;

    return NextResponse.json({
      message: 'Favorito eliminado correctamente'
    });
  } catch (error) {
    console.error('Error in DELETE /api/favorites/[id]:', error);
    return NextResponse.json(
      { error: 'Error al eliminar favorito' },
      { status: 500 }
    );
  }
}

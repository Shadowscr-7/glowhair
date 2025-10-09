import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * DELETE /api/favorites/[productId]
 * Eliminar un producto específico de favoritos
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { productId: string } }
) {
  try {
    const { productId } = params;
    const userId = request.headers.get('x-user-id') || 'temp-user-id';

    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('user_id', userId)
      .eq('product_id', productId);

    if (error) throw error;

    return NextResponse.json({
      message: 'Producto eliminado de favoritos correctamente'
    });
  } catch (error) {
    console.error('Error in DELETE /api/favorites/[productId]:', error);
    return NextResponse.json(
      { error: 'Error al eliminar favorito' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/favorites/[productId]
 * Verificar si un producto está en favoritos
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { productId: string } }
) {
  try {
    const { productId } = params;
    const userId = request.headers.get('x-user-id') || 'temp-user-id';

    const { data, error } = await supabase
      .from('favorites')
      .select('id')
      .eq('user_id', userId)
      .eq('product_id', productId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    return NextResponse.json({
      isFavorite: !!data
    });
  } catch (error) {
    console.error('Error in GET /api/favorites/[productId]:', error);
    return NextResponse.json(
      { error: 'Error al verificar favorito' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * GET /api/favorites
 * Obtener todos los productos favoritos del usuario
 */
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id') || 'temp-user-id';

    const { data: favorites, error } = await supabase
      .from('favorites')
      .select(`
        id,
        created_at,
        product:products(
          id,
          name,
          slug,
          description,
          price,
          original_price,
          image,
          stock,
          is_active,
          category:categories(id, name),
          brand:brands(id, name)
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json(favorites || []);
  } catch (error) {
    console.error('Error in GET /api/favorites:', error);
    return NextResponse.json(
      { error: 'Error al obtener favoritos' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/favorites
 * Agregar un producto a favoritos
 */
export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id') || 'temp-user-id';
    const body = await request.json();

    if (!body.product_id) {
      return NextResponse.json(
        { error: 'product_id es requerido' },
        { status: 400 }
      );
    }

    // Verificar si el producto existe
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('id')
      .eq('id', body.product_id)
      .single();

    if (productError || !product) {
      return NextResponse.json(
        { error: 'Producto no encontrado' },
        { status: 404 }
      );
    }

    // Verificar si ya está en favoritos
    const { data: existing } = await supabase
      .from('favorites')
      .select('id')
      .eq('user_id', userId)
      .eq('product_id', body.product_id)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: 'El producto ya está en favoritos' },
        { status: 400 }
      );
    }

    // Agregar a favoritos
    const { data: favorite, error: insertError } = await supabase
      .from('favorites')
      .insert({
        user_id: userId,
        product_id: body.product_id
      })
      .select(`
        id,
        created_at,
        product:products(
          id,
          name,
          slug,
          price,
          image
        )
      `)
      .single();

    if (insertError) throw insertError;

    return NextResponse.json(favorite, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/favorites:', error);
    return NextResponse.json(
      { error: 'Error al agregar favorito' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/favorites
 * Eliminar todos los favoritos del usuario
 */
export async function DELETE(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id') || 'temp-user-id';

    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('user_id', userId);

    if (error) throw error;

    return NextResponse.json({
      message: 'Todos los favoritos eliminados correctamente'
    });
  } catch (error) {
    console.error('Error in DELETE /api/favorites:', error);
    return NextResponse.json(
      { error: 'Error al eliminar favoritos' },
      { status: 500 }
    );
  }
}

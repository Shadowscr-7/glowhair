import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * GET /api/favorites
 * Obtener todos los productos favoritos del usuario
 */
export async function GET(request: NextRequest) {
  try {
    // UUID temporal para desarrollo (reemplazar con auth.uid() en producción)
    const userId = request.headers.get('x-user-id') || '00000000-0000-0000-0000-000000000001';

    console.log('📋 GET /api/favorites - userId:', userId);

    const { data: favorites, error } = await supabase
      .from('glowhair_favorites')
      .select(`
        id,
        created_at,
        product_id
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    console.log('📋 Favorites result:', { 
      count: favorites?.length, 
      error,
      errorDetails: error ? {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      } : null
    });

    if (error) {
      console.error('❌ Error al obtener favoritos:', error);
      return NextResponse.json(
        { 
          error: 'Error al obtener favoritos',
          details: error.message,
          hint: error.hint || 'Verifica que la tabla glowhair_favorites exista y tenga las políticas RLS correctas'
        },
        { status: 500 }
      );
    }

    // Si hay favoritos, obtener los productos por separado
    if (favorites && favorites.length > 0) {
      const productIds = favorites.map(f => f.product_id);
      
      const { data: products, error: productsError } = await supabase
        .from('glowhair_products')
        .select('id, name, slug, description, price, original_price, image, stock, is_active')
        .in('id', productIds);

      if (!productsError && products) {
        // Combinar favoritos con productos
        const favoritesWithProducts = favorites.map(fav => {
          const product = products.find(p => p.id === fav.product_id);
          return {
            id: fav.id,
            created_at: fav.created_at,
            product: product || null
          };
        }).filter(f => f.product !== null); // Solo devolver favoritos con productos válidos

        console.log('✅ Favoritos obtenidos con productos:', favoritesWithProducts.length);
        return NextResponse.json(favoritesWithProducts);
      }
    }

    console.log('✅ Favoritos obtenidos:', favorites?.length || 0);
    return NextResponse.json(favorites || []);
  } catch (error) {
    console.error('❌ Error in GET /api/favorites:', error);
    return NextResponse.json(
      { 
        error: 'Error al obtener favoritos',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
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
    // UUID temporal para desarrollo (reemplazar con auth.uid() en producción)
    const userId = request.headers.get('x-user-id') || '00000000-0000-0000-0000-000000000001';
    const body = await request.json();

    console.log('🔖 POST /api/favorites - Request:', { userId, product_id: body.product_id });

    if (!body.product_id) {
      return NextResponse.json(
        { error: 'product_id es requerido' },
        { status: 400 }
      );
    }

    // NO verificamos si el producto existe para evitar RLS recursion
    // La foreign key constraint de la base de datos lo manejará automáticamente
    console.log('⏩ Saltando verificación de producto para evitar RLS recursion');
    console.log('📌 El constraint FOREIGN KEY verificará la existencia del producto');

    // Verificar si ya está en favoritos
    console.log('🔍 Verificando si ya es favorito...');
    const { data: existing, error: existingError } = await supabase
      .from('glowhair_favorites')
      .select('id')
      .eq('user_id', userId)
      .eq('product_id', body.product_id)
      .single();

    console.log('🔍 Existing check:', { existing, existingError });

    if (existing) {
      console.log('⚠️ Ya está en favoritos');
      return NextResponse.json(
        { error: 'El producto ya está en favoritos' },
        { status: 400 }
      );
    }

    // Agregar a favoritos
    console.log('➕ Insertando en glowhair_favorites...');
    const { data: favorite, error: insertError } = await supabase
      .from('glowhair_favorites')
      .insert({
        user_id: userId,
        product_id: body.product_id
      })
      .select('id, created_at, product_id')
      .single();

    console.log('💾 Insert result:', { favorite, insertError });

    if (insertError) {
      console.error('❌ Error al insertar favorito:', insertError);
      return NextResponse.json(
        { 
          error: 'Error al insertar en la base de datos',
          details: insertError.message,
          code: insertError.code,
          hint: insertError.hint || 'Verifica las políticas RLS y permisos'
        },
        { status: 500 }
      );
    }

    // Respuesta exitosa (sin información del producto para evitar RLS)
    if (favorite) {
      console.log('✅ Favorito creado exitosamente:', favorite);
      return NextResponse.json({
        id: favorite.id,
        created_at: favorite.created_at,
        product_id: favorite.product_id,
        message: 'Favorito agregado correctamente'
      }, { status: 201 });
    }

    console.log('✅ Favorito creado exitosamente:', favorite);
    return NextResponse.json(favorite, { status: 201 });
  } catch (error) {
    console.error('❌ Error in POST /api/favorites:', error);
    
    // Mejorar el mensaje de error
    const errorMessage = error instanceof Error ? error.message : 'Error al agregar favorito';
    const errorDetails = error && typeof error === 'object' ? error : {};
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: errorDetails,
        hint: 'Verifica que la tabla favorites exista en Supabase y que tengas los permisos necesarios'
      },
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
    // UUID temporal para desarrollo (reemplazar con auth.uid() en producción)
    const userId = request.headers.get('x-user-id') || '00000000-0000-0000-0000-000000000001';

    const { error } = await supabase
      .from('glowhair_favorites')
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

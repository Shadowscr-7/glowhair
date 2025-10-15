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
      
      console.log('🔍 Buscando productos para favoritos:', productIds);
      
      const { data: products, error: productsError } = await supabase
        .from('glowhair_products')
        .select('id, name, slug, description, price, original_price, images, stock, is_active')
        .in('id', productIds);

      console.log('📦 Products result:', { 
        count: products?.length, 
        productsError,
        productIds: products?.map(p => p.id)
      });

      if (productsError) {
        console.error('❌ Error al obtener productos:', productsError);
        // Aunque falle productos, devolver favoritos sin product data
        const favoritesWithoutProducts = favorites.map(fav => ({
          id: fav.id,
          created_at: fav.created_at,
          product: null
        }));
        return NextResponse.json(favoritesWithoutProducts);
      }

      if (products) {
        // Combinar favoritos con productos
        const favoritesWithProducts = favorites.map(fav => {
          const product = products.find(p => p.id === fav.product_id);
          return {
            id: fav.id,
            created_at: fav.created_at,
            product: product || null
          };
        }); // NO filtrar, devolver todos incluso sin producto

        console.log('✅ Favoritos obtenidos con productos:', {
          total: favoritesWithProducts.length,
          conProducto: favoritesWithProducts.filter(f => f.product !== null).length,
          sinProducto: favoritesWithProducts.filter(f => f.product === null).length
        });
        
        return NextResponse.json(favoritesWithProducts);
      }
    }

    // Si no hay favoritos o no se pudieron obtener productos, devolver array vacío
    console.log('✅ Favoritos obtenidos:', 0);
    return NextResponse.json([]);
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

    // Verificar si ya está en favoritos para hacer TOGGLE
    console.log('🔍 Verificando si ya es favorito...');
    const { data: existingFavorites, error: existingError } = await supabase
      .from('glowhair_favorites')
      .select('id')
      .eq('user_id', userId)
      .eq('product_id', body.product_id);

    console.log('🔍 Existing check:', { 
      count: existingFavorites?.length || 0, 
      existingError 
    });

    if (existingError) {
      console.error('❌ Error al verificar favorito existente:', existingError);
      return NextResponse.json(
        { 
          error: 'Error al verificar favoritos',
          details: existingError.message
        },
        { status: 500 }
      );
    }

    // Si ya existe, ELIMINARLO (toggle off)
    if (existingFavorites && existingFavorites.length > 0) {
      console.log('🗑️ Ya está en favoritos, eliminando (toggle off)...');
      
      const { error: deleteError } = await supabase
        .from('glowhair_favorites')
        .delete()
        .eq('user_id', userId)
        .eq('product_id', body.product_id);

      if (deleteError) {
        console.error('❌ Error al eliminar favorito:', deleteError);
        return NextResponse.json(
          { 
            error: 'Error al eliminar de favoritos',
            details: deleteError.message
          },
          { status: 500 }
        );
      }

      console.log('✅ Favorito eliminado exitosamente (toggle off)');
      return NextResponse.json({
        action: 'removed',
        message: 'Producto eliminado de favoritos'
      }, { status: 200 });
    }

    // Si NO existe, AGREGARLO (toggle on)
    console.log('➕ No está en favoritos, agregando (toggle on)...');
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
      console.log('✅ Favorito agregado exitosamente (toggle on):', favorite);
      return NextResponse.json({
        action: 'added',
        id: favorite.id,
        created_at: favorite.created_at,
        product_id: favorite.product_id,
        message: 'Producto agregado a favoritos'
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

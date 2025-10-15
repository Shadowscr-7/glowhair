import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * POST /api/favorites/cleanup
 * Eliminar favoritos huérfanos (productos que ya no existen)
 */
export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id') || '00000000-0000-0000-0000-000000000001';

    console.log('🧹 Iniciando limpieza de favoritos huérfanos para usuario:', userId);

    // 1. Obtener todos los favoritos del usuario
    const { data: favorites, error: favoritesError } = await supabase
      .from('glowhair_favorites')
      .select('id, product_id')
      .eq('user_id', userId);

    if (favoritesError) {
      console.error('❌ Error al obtener favoritos:', favoritesError);
      return NextResponse.json(
        { error: 'Error al obtener favoritos', details: favoritesError.message },
        { status: 500 }
      );
    }

    if (!favorites || favorites.length === 0) {
      console.log('✅ No hay favoritos para limpiar');
      return NextResponse.json({
        message: 'No hay favoritos para limpiar',
        deleted: 0
      });
    }

    console.log(`📊 Favoritos encontrados: ${favorites.length}`);

    // 2. Obtener todos los IDs de productos válidos
    const productIds = favorites.map(f => f.product_id);
    const { data: validProducts, error: productsError } = await supabase
      .from('glowhair_products')
      .select('id')
      .in('id', productIds);

    if (productsError) {
      console.error('❌ Error al verificar productos:', productsError);
      return NextResponse.json(
        { error: 'Error al verificar productos', details: productsError.message },
        { status: 500 }
      );
    }

    const validProductIds = new Set(validProducts?.map(p => p.id) || []);
    console.log(`✅ Productos válidos: ${validProductIds.size}`);

    // 3. Identificar favoritos huérfanos (sin producto válido)
    const orphanedFavorites = favorites.filter(f => !validProductIds.has(f.product_id));
    
    if (orphanedFavorites.length === 0) {
      console.log('✅ No hay favoritos huérfanos');
      return NextResponse.json({
        message: 'Todos los favoritos están vinculados a productos válidos',
        deleted: 0,
        total: favorites.length
      });
    }

    console.log(`🗑️  Favoritos huérfanos encontrados: ${orphanedFavorites.length}`);
    console.log('IDs a eliminar:', orphanedFavorites.map(f => f.id));

    // 4. Eliminar favoritos huérfanos
    const orphanedIds = orphanedFavorites.map(f => f.id);
    const { error: deleteError } = await supabase
      .from('glowhair_favorites')
      .delete()
      .in('id', orphanedIds);

    if (deleteError) {
      console.error('❌ Error al eliminar favoritos huérfanos:', deleteError);
      return NextResponse.json(
        { error: 'Error al eliminar favoritos', details: deleteError.message },
        { status: 500 }
      );
    }

    console.log(`✅ Eliminados ${orphanedFavorites.length} favoritos huérfanos`);

    return NextResponse.json({
      message: 'Favoritos huérfanos eliminados correctamente',
      deleted: orphanedFavorites.length,
      total: favorites.length,
      remaining: favorites.length - orphanedFavorites.length
    });

  } catch (error) {
    console.error('❌ Error in POST /api/favorites/cleanup:', error);
    return NextResponse.json(
      { 
        error: 'Error al limpiar favoritos',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}

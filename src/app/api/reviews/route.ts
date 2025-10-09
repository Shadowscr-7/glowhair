import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * GET /api/reviews
 * Obtener todas las reseñas (con filtros opcionales)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('product_id');
    const userId = searchParams.get('user_id');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = supabase
      .from('reviews')
      .select(`
        id,
        user_id,
        product_id,
        rating,
        title,
        comment,
        created_at,
        updated_at,
        user:users(id, full_name, email),
        product:products(id, name, slug, image)
      `, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Filtrar por producto
    if (productId) {
      query = query.eq('product_id', productId);
    }

    // Filtrar por usuario
    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data, error, count } = await query;

    if (error) throw error;

    return NextResponse.json({
      reviews: data || [],
      total: count || 0,
      limit,
      offset
    });
  } catch (error) {
    console.error('Error in GET /api/reviews:', error);
    return NextResponse.json(
      { error: 'Error al obtener reseñas' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/reviews
 * Crear una nueva reseña
 */
export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id') || 'temp-user-id';
    const body = await request.json();

    // Validar campos requeridos
    if (!body.product_id) {
      return NextResponse.json(
        { error: 'product_id es requerido' },
        { status: 400 }
      );
    }

    if (!body.rating || body.rating < 1 || body.rating > 5) {
      return NextResponse.json(
        { error: 'rating debe ser un número entre 1 y 5' },
        { status: 400 }
      );
    }

    if (!body.comment || body.comment.trim().length < 10) {
      return NextResponse.json(
        { error: 'comment debe tener al menos 10 caracteres' },
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

    // Verificar si el usuario ya tiene una reseña para este producto
    const { data: existing } = await supabase
      .from('reviews')
      .select('id')
      .eq('user_id', userId)
      .eq('product_id', body.product_id)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: 'Ya has creado una reseña para este producto. Puedes editarla.' },
        { status: 400 }
      );
    }

    // Crear la reseña
    const { data: review, error: insertError } = await supabase
      .from('reviews')
      .insert({
        user_id: userId,
        product_id: body.product_id,
        rating: body.rating,
        title: body.title || null,
        comment: body.comment.trim()
      })
      .select(`
        id,
        user_id,
        product_id,
        rating,
        title,
        comment,
        created_at,
        user:users(id, full_name, email),
        product:products(id, name, slug)
      `)
      .single();

    if (insertError) throw insertError;

    return NextResponse.json(review, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/reviews:', error);
    return NextResponse.json(
      { error: 'Error al crear reseña' },
      { status: 500 }
    );
  }
}

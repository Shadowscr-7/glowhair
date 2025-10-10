import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * GET /api/reviews/[id]
 * Obtener una reseña específica
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { data: review, error } = await supabase
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
      `)
      .eq('id', id)
      .single();

    if (error) throw error;

    if (!review) {
      return NextResponse.json(
        { error: 'Reseña no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json(review);
  } catch (error) {
    console.error('Error in GET /api/reviews/[id]:', error);
    return NextResponse.json(
      { error: 'Error al obtener reseña' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/reviews/[id]
 * Actualizar una reseña (solo el autor)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = request.headers.get('x-user-id') || 'temp-user-id';
    const body = await request.json();

    // Obtener la reseña existente
    const { data: existingReview, error: fetchError } = await supabase
      .from('reviews')
      .select('user_id')
      .eq('id', id)
      .single();

    if (fetchError || !existingReview) {
      return NextResponse.json(
        { error: 'Reseña no encontrada' },
        { status: 404 }
      );
    }

    // Verificar que el usuario sea el autor
    if (existingReview.user_id !== userId) {
      return NextResponse.json(
        { error: 'No autorizado para editar esta reseña' },
        { status: 403 }
      );
    }

    // Validar campos si se proporcionan
    if (body.rating !== undefined && (body.rating < 1 || body.rating > 5)) {
      return NextResponse.json(
        { error: 'rating debe ser un número entre 1 y 5' },
        { status: 400 }
      );
    }

    if (body.comment !== undefined && body.comment.trim().length < 10) {
      return NextResponse.json(
        { error: 'comment debe tener al menos 10 caracteres' },
        { status: 400 }
      );
    }

    // Construir objeto de actualización
    const updateData: Record<string, unknown> = {};
    if (body.rating !== undefined) updateData.rating = body.rating;
    if (body.title !== undefined) updateData.title = body.title;
    if (body.comment !== undefined) updateData.comment = body.comment.trim();

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No hay campos para actualizar' },
        { status: 400 }
      );
    }

    // Actualizar la reseña
    const { data: review, error: updateError } = await supabase
      .from('reviews')
      .update(updateData)
      .eq('id', id)
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
        product:products(id, name, slug)
      `)
      .single();

    if (updateError) throw updateError;

    return NextResponse.json(review);
  } catch (error) {
    console.error('Error in PUT /api/reviews/[id]:', error);
    return NextResponse.json(
      { error: 'Error al actualizar reseña' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/reviews/[id]
 * Eliminar una reseña (solo el autor o admin)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = request.headers.get('x-user-id') || 'temp-user-id';
    const isAdmin = request.headers.get('x-is-admin') === 'true';

    // Obtener la reseña existente
    const { data: existingReview, error: fetchError } = await supabase
      .from('reviews')
      .select('user_id')
      .eq('id', id)
      .single();

    if (fetchError || !existingReview) {
      return NextResponse.json(
        { error: 'Reseña no encontrada' },
        { status: 404 }
      );
    }

    // Verificar permisos (autor o admin)
    if (!isAdmin && existingReview.user_id !== userId) {
      return NextResponse.json(
        { error: 'No autorizado para eliminar esta reseña' },
        { status: 403 }
      );
    }

    // Eliminar la reseña
    const { error: deleteError } = await supabase
      .from('reviews')
      .delete()
      .eq('id', id);

    if (deleteError) throw deleteError;

    return NextResponse.json({
      message: 'Reseña eliminada correctamente'
    });
  } catch (error) {
    console.error('Error in DELETE /api/reviews/[id]:', error);
    return NextResponse.json(
      { error: 'Error al eliminar reseña' },
      { status: 500 }
    );
  }
}

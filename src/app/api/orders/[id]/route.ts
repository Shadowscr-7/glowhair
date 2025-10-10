import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * GET /api/orders/[id]
 * Obtener detalles de una orden específica
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = request.headers.get('x-user-id') || 'temp-user-id';
    const isAdmin = request.headers.get('x-is-admin') === 'true';

    const { data: order, error } = await supabase
      .from('orders')
      .select(`
        *,
        user:users(id, email, full_name, phone),
        items:order_items(
          id,
          product_id,
          quantity,
          price,
          product:products(id, name, image, slug, description)
        )
      `)
      .eq('id', id)
      .single();

    if (error) throw error;

    if (!order) {
      return NextResponse.json(
        { error: 'Orden no encontrada' },
        { status: 404 }
      );
    }

    // Verificar que el usuario tenga acceso a esta orden
    if (!isAdmin && order.user_id !== userId) {
      return NextResponse.json(
        { error: 'No autorizado para ver esta orden' },
        { status: 403 }
      );
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error('Error in GET /api/orders/[id]:', error);
    return NextResponse.json(
      { error: 'Error al obtener orden' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/orders/[id]
 * Actualizar el estado de una orden (solo admin)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // const isAdmin = request.headers.get('x-is-admin') === 'true';

    // Solo admins pueden actualizar órdenes
    // TODO: Implementar validación real de admin
    // if (!isAdmin) {
    //   return NextResponse.json(
    //     { error: 'No autorizado' },
    //     { status: 403 }
    //   );
    // }

    const body = await request.json();
    const allowedFields = ['status', 'tracking_number', 'notes'];
    const updateData: Record<string, unknown> = {};

    // Solo permitir actualizar campos específicos
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No hay campos para actualizar' },
        { status: 400 }
      );
    }

    // Actualizar fecha de envío si el estado cambia a 'shipped'
    if (updateData.status === 'shipped' && !updateData.tracking_number) {
      updateData.shipped_at = new Date().toISOString();
    }

    // Actualizar fecha de entrega si el estado cambia a 'delivered'
    if (updateData.status === 'delivered') {
      updateData.delivered_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        user:users(id, email, full_name),
        items:order_items(
          id,
          product_id,
          quantity,
          price,
          product:products(id, name, image, slug)
        )
      `)
      .single();

    if (error) throw error;

    if (!data) {
      return NextResponse.json(
        { error: 'Orden no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in PUT /api/orders/[id]:', error);
    return NextResponse.json(
      { error: 'Error al actualizar orden' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/orders/[id]
 * Cancelar una orden (solo si está en estado 'pending')
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = request.headers.get('x-user-id') || 'temp-user-id';
    const isAdmin = request.headers.get('x-is-admin') === 'true';

    // Obtener la orden
    const { data: order, error: fetchError } = await supabase
      .from('orders')
      .select('*, items:order_items(product_id, quantity)')
      .eq('id', id)
      .single();

    if (fetchError) throw fetchError;

    if (!order) {
      return NextResponse.json(
        { error: 'Orden no encontrada' },
        { status: 404 }
      );
    }

    // Verificar permisos
    if (!isAdmin && order.user_id !== userId) {
      return NextResponse.json(
        { error: 'No autorizado para cancelar esta orden' },
        { status: 403 }
      );
    }

    // Solo se puede cancelar si está en estado 'pending'
    if (order.status !== 'pending') {
      return NextResponse.json(
        { error: 'Solo se pueden cancelar órdenes en estado pendiente' },
        { status: 400 }
      );
    }

    // Restaurar stock de productos
    if (order.items) {
      for (const item of order.items) {
        await supabase.rpc('increment_product_stock', {
          product_id: item.product_id,
          quantity: item.quantity
        });
      }
    }

    // Actualizar estado a 'cancelled'
    const { error: updateError } = await supabase
      .from('orders')
      .update({ 
        status: 'cancelled',
        cancelled_at: new Date().toISOString()
      })
      .eq('id', id);

    if (updateError) throw updateError;

    return NextResponse.json({
      message: 'Orden cancelada correctamente'
    });
  } catch (error) {
    console.error('Error in DELETE /api/orders/[id]:', error);
    return NextResponse.json(
      { error: 'Error al cancelar orden' },
      { status: 500 }
    );
  }
}

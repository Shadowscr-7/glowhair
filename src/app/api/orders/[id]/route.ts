import { NextRequest, NextResponse } from 'next/server';
import { orderService } from '@/lib/services/orders';

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
    const userId = request.headers.get('x-user-id');
    const isAdmin = request.headers.get('x-is-admin') === 'true';

    console.log('🔵 GET /api/orders/[id] - Inicio', { id, userId, isAdmin });

    // Obtener orden usando el servicio
    // Si no es admin y no hay userId, obtener sin filtro (para desarrollo)
    const result = await orderService.getOrderById(id, !isAdmin && userId ? userId : undefined);

    console.log('📦 Resultado del servicio:', { success: result.success, hasData: !!result.data, error: result.error });

    if (!result.success || !result.data) {
      return NextResponse.json(
        { error: result.error || 'Orden no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json(result.data);
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
    const body = await request.json();
    const { status, payment_status } = body;

    if (!status) {
      return NextResponse.json(
        { error: 'El campo status es requerido' },
        { status: 400 }
      );
    }

    // Actualizar usando el servicio
    const result = await orderService.updateOrderStatus(id, status, payment_status);

    if (!result.success || !result.data) {
      return NextResponse.json(
        { error: result.error || 'Error al actualizar orden' },
        { status: 404 }
      );
    }

    return NextResponse.json(result.data);
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
 * Cancelar una orden
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = request.headers.get('x-user-id');

    // Cancelar usando el servicio
    const result = await orderService.cancelOrder(id);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Error al cancelar orden' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      message: 'Orden cancelada correctamente',
      order: result.data
    });
  } catch (error) {
    console.error('Error in DELETE /api/orders/[id]:', error);
    return NextResponse.json(
      { error: 'Error al cancelar orden' },
      { status: 500 }
    );
  }
}

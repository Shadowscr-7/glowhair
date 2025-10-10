import { NextRequest, NextResponse } from 'next/server';
import { cartService } from '@/lib/services/orders';

/**
 * PUT /api/cart/[itemId]
 * Actualizar la cantidad de un item en el carrito
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ itemId: string }> }
) {
  try {
    const { itemId } = await params;
    const body = await request.json();

    if (body.quantity === undefined) {
      return NextResponse.json(
        { error: 'quantity es requerido' },
        { status: 400 }
      );
    }

    const userId = request.headers.get('x-user-id') || 'temp-user-id';
    const quantity = parseInt(body.quantity);

    if (isNaN(quantity) || quantity < 0) {
      return NextResponse.json(
        { error: 'La cantidad debe ser un número mayor o igual a 0' },
        { status: 400 }
      );
    }

    const result = await cartService.updateCartItem(userId, itemId, quantity);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json(result.data, { status: 200 });
  } catch (error) {
    console.error('Error in PUT /api/cart/[itemId]:', error);
    return NextResponse.json(
      { error: 'Error al actualizar item del carrito' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/cart/[itemId]
 * Eliminar un item específico del carrito
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ itemId: string }> }
) {
  try {
    const { itemId } = await params;
    const userId = request.headers.get('x-user-id') || 'temp-user-id';

    const result = await cartService.removeFromCart(userId, itemId);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: 'Item eliminado del carrito correctamente' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in DELETE /api/cart/[itemId]:', error);
    return NextResponse.json(
      { error: 'Error al eliminar item del carrito' },
      { status: 500 }
    );
  }
}

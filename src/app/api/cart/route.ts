import { NextRequest, NextResponse } from 'next/server';
import { cartService } from '@/lib/services/orders';

/**
 * GET /api/cart
 * Obtener el carrito del usuario actual
 */
export async function GET(request: NextRequest) {
  try {
    // Obtener userId de la sesión (por ahora usamos un mock)
    // TODO: Implementar autenticación real
    const userId = request.headers.get('x-user-id') || 'temp-user-id';

    const result = await cartService.getCart(userId);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json(result.data, { status: 200 });
  } catch (error) {
    console.error('Error in GET /api/cart:', error);
    return NextResponse.json(
      { error: 'Error al obtener carrito' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/cart
 * Agregar un producto al carrito
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validar campos requeridos
    if (!body.product_id) {
      return NextResponse.json(
        { error: 'product_id es requerido' },
        { status: 400 }
      );
    }

    const userId = request.headers.get('x-user-id') || 'temp-user-id';
    const productId = body.product_id;
    const quantity = body.quantity || 1;

    // Validar cantidad
    if (quantity < 1) {
      return NextResponse.json(
        { error: 'La cantidad debe ser mayor a 0' },
        { status: 400 }
      );
    }

    const result = await cartService.addToCart(userId, productId, quantity);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json(result.data, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/cart:', error);
    return NextResponse.json(
      { error: 'Error al agregar producto al carrito' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/cart
 * Vaciar todo el carrito
 */
export async function DELETE(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id') || 'temp-user-id';

    const result = await cartService.clearCart(userId);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: 'Carrito vaciado correctamente' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in DELETE /api/cart:', error);
    return NextResponse.json(
      { error: 'Error al vaciar carrito' },
      { status: 500 }
    );
  }
}

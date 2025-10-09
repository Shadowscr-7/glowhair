import { NextRequest, NextResponse } from 'next/server';
import { productService } from '@/lib/services/products';

/**
 * GET /api/products/[id]/related
 * Obtener productos relacionados a un producto específico
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const searchParams = request.nextUrl.searchParams;
    const categoryId = searchParams.get('category') || undefined;

    const result = await productService.getRelatedProducts(id, categoryId);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json(result.data, { status: 200 });
  } catch (error) {
    console.error('Error in GET /api/products/[id]/related:', error);
    return NextResponse.json(
      { error: 'Error al obtener productos relacionados' },
      { status: 500 }
    );
  }
}

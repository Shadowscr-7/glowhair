import { NextRequest, NextResponse } from 'next/server';
import { productService } from '@/lib/services/products';

/**
 * GET /api/products/featured
 * Obtener productos destacados
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 6;

    const result = await productService.getFeaturedProducts(limit);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json(result.data, { status: 200 });
  } catch (error) {
    console.error('Error in GET /api/products/featured:', error);
    return NextResponse.json(
      { error: 'Error al obtener productos destacados' },
      { status: 500 }
    );
  }
}

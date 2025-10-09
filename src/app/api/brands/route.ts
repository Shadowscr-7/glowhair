import { NextResponse } from 'next/server';
import { brandService } from '@/lib/services/products';

/**
 * GET /api/brands
 * Obtener todas las marcas activas
 */
export async function GET() {
  try {
    const result = await brandService.getBrands();

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json(result.data, { status: 200 });
  } catch (error) {
    console.error('Error in GET /api/brands:', error);
    return NextResponse.json(
      { error: 'Error al obtener marcas' },
      { status: 500 }
    );
  }
}

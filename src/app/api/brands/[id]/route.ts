import { NextRequest, NextResponse } from 'next/server';
import { brandService } from '@/lib/services/products';

/**
 * GET /api/brands/[id]
 * Obtener una marca por ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const result = await brandService.getBrandById(id);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 404 }
      );
    }

    return NextResponse.json(result.data, { status: 200 });
  } catch (error) {
    console.error('Error in GET /api/brands/[id]:', error);
    return NextResponse.json(
      { error: 'Error al obtener marca' },
      { status: 500 }
    );
  }
}

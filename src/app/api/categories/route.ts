import { NextResponse } from 'next/server';
import { categoryService } from '@/lib/services/products';

/**
 * GET /api/categories
 * Obtener todas las categorías activas
 */
export async function GET() {
  try {
    const result = await categoryService.getCategories();

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json(result.data, { status: 200 });
  } catch (error) {
    console.error('Error in GET /api/categories:', error);
    return NextResponse.json(
      { error: 'Error al obtener categorías' },
      { status: 500 }
    );
  }
}

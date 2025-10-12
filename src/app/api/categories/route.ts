import { NextResponse } from 'next/server';
import { categoryService } from '@/lib/services/products';

/**
 * GET /api/categories
 * Obtener todas las categorías activas
 */
export async function GET() {
  try {
    console.log('🔵 GET /api/categories - Inicio');
    
    const result = await categoryService.getCategories();

    console.log('📥 Resultado del servicio:', {
      success: result.success,
      dataLength: result.data?.length,
      error: result.error
    });

    if (!result.success) {
      console.error('❌ Error del servicio:', result.error);
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    console.log('✅ Categorías obtenidas exitosamente');
    return NextResponse.json(result.data, { status: 200 });
  } catch (error) {
    console.error('❌ Error en GET /api/categories:', error);
    return NextResponse.json(
      { error: 'Error al obtener categorías' },
      { status: 500 }
    );
  }
}

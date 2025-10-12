import { NextRequest, NextResponse } from 'next/server';
import { productService } from '@/lib/services/products';

/**
 * GET /api/products/[id]
 * Obtener un producto por ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    console.log('🔵 API GET /api/products/[id] - Start');
    const { id } = await params;
    console.log('📦 Product ID:', id);

    const result = await productService.getProductById(id);
    console.log('📊 Service result:', result);

    if (!result.success) {
      console.error('❌ Service returned error:', result.error);
      return NextResponse.json(
        { error: result.error },
        { status: 404 }
      );
    }

    console.log('✅ API GET /api/products/[id] - Success');
    return NextResponse.json(result.data, { status: 200 });
  } catch (error) {
    console.error('❌ Error in GET /api/products/[id]:', error);
    return NextResponse.json(
      { error: 'Error al obtener producto' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/products/[id]
 * Actualizar un producto (solo admin)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    console.log('🔵 API PUT /api/products/[id] - Start');
    const { id } = await params;
    const body = await request.json();
    
    console.log('📦 Product ID:', id);
    console.log('📥 Body recibido:', JSON.stringify(body, null, 2));

    // Aquí deberías verificar que el usuario sea admin
    // const userId = await getUserIdFromSession(request);
    // const isAdmin = await checkIfUserIsAdmin(userId);
    // if (!isAdmin) return NextResponse.json({ error: 'No autorizado' }, { status: 403 });

    // Preparar datos de actualización
    const updateData: Partial<Record<string, unknown>> = {};
    
    if (body.name !== undefined) updateData.name = body.name;
    if (body.slug !== undefined) updateData.slug = body.slug;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.price !== undefined) updateData.price = parseFloat(body.price);
    if (body.original_price !== undefined) updateData.original_price = body.original_price ? parseFloat(body.original_price) : null;
    if (body.category_id !== undefined) updateData.category_id = body.category_id;
    if (body.brand_id !== undefined) updateData.brand_id = body.brand_id;
    if (body.stock !== undefined) updateData.stock = parseInt(body.stock);
    if (body.sku !== undefined) updateData.sku = body.sku;
    if (body.images !== undefined) updateData.images = body.images;
    if (body.features !== undefined) updateData.features = body.features;
    if (body.benefits !== undefined) updateData.benefits = body.benefits;
    if (body.ingredients !== undefined) updateData.ingredients = body.ingredients;
    if (body.usage_instructions !== undefined) updateData.usage_instructions = body.usage_instructions;
    if (body.hair_types !== undefined) updateData.hair_types = body.hair_types;
    if (body.size !== undefined) updateData.size = body.size;
    if (body.rating !== undefined) updateData.rating = body.rating;
    if (body.review_count !== undefined) updateData.review_count = body.review_count;
    if (body.is_featured !== undefined) updateData.is_featured = body.is_featured;
    if (body.is_active !== undefined) updateData.is_active = body.is_active;

    console.log('📊 Datos preparados para actualizar:', JSON.stringify(updateData, null, 2));

    const result = await productService.updateProduct(id, updateData);
    
    console.log('🔄 Result del servicio:', result);

    if (!result.success) {
      console.error('❌ Error del servicio:', result.error);
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    console.log('✅ API PUT /api/products/[id] - Success');
    return NextResponse.json(result.data, { status: 200 });
  } catch (error) {
    console.error('Error in PUT /api/products/[id]:', error);
    return NextResponse.json(
      { error: 'Error al actualizar producto' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/products/[id]
 * Eliminar un producto (solo admin)
 * En realidad hace un soft delete (is_active = false)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Aquí deberías verificar que el usuario sea admin
    // const userId = await getUserIdFromSession(request);
    // const isAdmin = await checkIfUserIsAdmin(userId);
    // if (!isAdmin) return NextResponse.json({ error: 'No autorizado' }, { status: 403 });

    const result = await productService.deleteProduct(id);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: 'Producto eliminado correctamente' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in DELETE /api/products/[id]:', error);
    return NextResponse.json(
      { error: 'Error al eliminar producto' },
      { status: 500 }
    );
  }
}

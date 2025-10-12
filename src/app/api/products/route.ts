import { NextRequest, NextResponse } from 'next/server';
import { productService } from '@/lib/services/products';

/**
 * GET /api/products
 * Obtener lista de productos con filtros y paginación
 */
export async function GET(request: NextRequest) {
  try {
    console.log('🔵 GET /api/products - Inicio');
    const searchParams = request.nextUrl.searchParams;
    
    // Extraer parámetros de búsqueda
    const filters = {
      category: searchParams.get('category') || undefined,
      brand: searchParams.get('brand') || undefined,
      search: searchParams.get('search') || undefined,
      minPrice: searchParams.get('minPrice') ? parseFloat(searchParams.get('minPrice')!) : undefined,
      maxPrice: searchParams.get('maxPrice') ? parseFloat(searchParams.get('maxPrice')!) : undefined,
      sortBy: searchParams.get('sortBy') || searchParams.get('sort_by') || 'featured',
      page: searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 12,
    };

    console.log('📦 Filtros recibidos:', filters);

    const result = await productService.getProducts(filters);

    console.log('📥 Resultado del servicio:', {
      success: result.success,
      hasData: !!result.data,
      error: result.error
    });

    if (!result.success) {
      console.error('❌ Error del servicio:', result.error);
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    // Adaptar respuesta al formato esperado por el cliente (ProductsResponse)
    const response = {
      products: result.data?.data || [],
      total: result.data?.total || 0,
      limit: result.data?.limit || filters.limit,
      offset: ((result.data?.page || 1) - 1) * (result.data?.limit || filters.limit)
    };

    console.log('✅ Productos obtenidos exitosamente:', {
      productos: response.products.length,
      total: response.total
    });
    
    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('❌ Error en GET /api/products:', error);
    return NextResponse.json(
      { error: 'Error al obtener productos' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/products
 * Crear un nuevo producto (solo admin)
 */
export async function POST(request: NextRequest) {
  try {
    console.log('🔵 POST /api/products - Inicio');
    
    const body = await request.json();
    console.log('📦 Body recibido:', JSON.stringify(body, null, 2));
    
    // Validar campos requeridos
    const requiredFields = ['name', 'description', 'price', 'category_id', 'stock'];
    const missingFields = requiredFields.filter(field => !body[field] && body[field] !== 0);
    
    console.log('🔍 Validación de campos:');
    requiredFields.forEach(field => {
      console.log(`  - ${field}: ${body[field]} (${typeof body[field]})`);
    });
    
    if (missingFields.length > 0) {
      console.error('❌ Campos faltantes:', missingFields);
      return NextResponse.json(
        { error: `Campos requeridos faltantes: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    // Preparar datos del producto
    const productData = {
      name: body.name,
      slug: body.slug || body.name.toLowerCase().replace(/\s+/g, '-'),
      description: body.description,
      price: parseFloat(body.price),
      original_price: body.original_price ? parseFloat(body.original_price) : undefined,
      category_id: body.category_id,
      brand_id: body.brand_id || null,
      stock: parseInt(body.stock),
      sku: body.sku || `PROD-${Date.now()}`,
      images: body.images || [],
      rating: body.rating || 0,
      review_count: body.review_count || 0,
      is_featured: body.is_featured || false,
      is_active: body.is_active !== false,
      // Campos adicionales generados por IA
      benefits: body.benefits || [],
      features: body.features || [],
      // Convertir ingredients de string a array si es necesario
      ingredients: body.ingredients 
        ? (typeof body.ingredients === 'string' 
            ? body.ingredients.split(',').map((ing: string) => ing.trim())
            : body.ingredients)
        : [],
      usage_instructions: body.usage_instructions || null,
      hair_types: body.hair_types || [],
      size: body.size || null,
    };

    console.log('✅ Datos preparados para el servicio:', JSON.stringify(productData, null, 2));

    // Aquí deberías verificar que el usuario sea admin
    // const userId = await getUserIdFromSession(request);
    // const isAdmin = await checkIfUserIsAdmin(userId);
    // if (!isAdmin) return NextResponse.json({ error: 'No autorizado' }, { status: 403 });

    console.log('📞 Llamando a productService.createProduct...');
    const result = await productService.createProduct(productData);
    console.log('📥 Resultado del servicio:', result);

    if (!result.success) {
      console.error('❌ Error del servicio:', result.error);
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    console.log('✅ Producto creado exitosamente');
    return NextResponse.json(result.data, { status: 201 });
  } catch (error) {
    console.error('❌ Error en POST /api/products:', error);
    console.error('Stack trace:', error instanceof Error ? error.stack : 'No stack available');
    return NextResponse.json(
      { error: 'Error al crear producto' },
      { status: 500 }
    );
  }
}

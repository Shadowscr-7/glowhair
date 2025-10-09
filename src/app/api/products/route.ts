import { NextRequest, NextResponse } from 'next/server';
import { productService } from '@/lib/services/products';

/**
 * GET /api/products
 * Obtener lista de productos con filtros y paginación
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // Extraer parámetros de búsqueda
    const filters = {
      category: searchParams.get('category') || undefined,
      brand: searchParams.get('brand') || undefined,
      search: searchParams.get('search') || undefined,
      minPrice: searchParams.get('minPrice') ? parseFloat(searchParams.get('minPrice')!) : undefined,
      maxPrice: searchParams.get('maxPrice') ? parseFloat(searchParams.get('maxPrice')!) : undefined,
      sortBy: searchParams.get('sortBy') || 'featured',
      page: searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 12,
    };

    const result = await productService.getProducts(filters);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json(result.data, { status: 200 });
  } catch (error) {
    console.error('Error in GET /api/products:', error);
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
    const body = await request.json();
    
    // Validar campos requeridos
    const requiredFields = ['name', 'description', 'price', 'category_id', 'stock'];
    const missingFields = requiredFields.filter(field => !body[field]);
    
    if (missingFields.length > 0) {
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
      features: body.features || [],
      benefits: body.benefits || [],
      ingredients: body.ingredients || null,
      usage_instructions: body.usage_instructions || null,
      hair_types: body.hair_types || [],
      size: body.size || null,
      rating: body.rating || 0,
      review_count: body.review_count || 0,
      is_featured: body.is_featured || false,
      is_active: body.is_active !== false,
    };

    // Aquí deberías verificar que el usuario sea admin
    // const userId = await getUserIdFromSession(request);
    // const isAdmin = await checkIfUserIsAdmin(userId);
    // if (!isAdmin) return NextResponse.json({ error: 'No autorizado' }, { status: 403 });

    const result = await productService.createProduct(productData);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json(result.data, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/products:', error);
    return NextResponse.json(
      { error: 'Error al crear producto' },
      { status: 500 }
    );
  }
}

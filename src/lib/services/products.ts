import { supabase, supabaseAdmin } from '../supabase';
import type { Product, Category, Brand, ApiResponse, PaginatedResponse } from '@/types';

// ==========================================
// PRODUCTOS
// ==========================================

export const productService = {
  // Obtener todos los productos con filtros
  async getProducts(filters?: {
    category?: string;
    brand?: string;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    sortBy?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<PaginatedResponse<Product>>> {
    try {
      console.log('🔵 productService.getProducts - Inicio');
      console.log('📦 Filtros:', filters);
      
      // Usar cliente admin para evitar problemas de RLS
      const client = supabaseAdmin || supabase;
      
      let query = client
        .from('glowhair_products')
        .select(`
          *,
          category:glowhair_categories(id, name),
          brand:glowhair_brands(id, name)
        `, { count: 'exact' })  // Agregar count para obtener el total
        .eq('is_active', true);

      // Aplicar filtros
      if (filters?.category) {
        query = query.eq('category_id', filters.category);
      }
      if (filters?.brand) {
        query = query.eq('brand_id', filters.brand);
      }
      if (filters?.search) {
        query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }
      if (filters?.minPrice) {
        query = query.gte('price', filters.minPrice);
      }
      if (filters?.maxPrice) {
        query = query.lte('price', filters.maxPrice);
      }

      // Ordenamiento
      switch (filters?.sortBy) {
        case 'price-low':
          query = query.order('price', { ascending: true });
          break;
        case 'price-high':
          query = query.order('price', { ascending: false });
          break;
        case 'rating':
          query = query.order('rating', { ascending: false });
          break;
        case 'newest':
          query = query.order('created_at', { ascending: false });
          break;
        case 'name':
          query = query.order('name', { ascending: true });
          break;
        default: // featured
          query = query.order('is_featured', { ascending: false }).order('created_at', { ascending: false });
      }

      // Paginación
      const page = filters?.page || 1;
      const limit = filters?.limit || 12;
      const offset = (page - 1) * limit;

      const { data, error, count } = await query
        .range(offset, offset + limit - 1);

      console.log('📊 Respuesta de Supabase:');
      console.log('  - Data:', data ? `${data.length} productos` : 'null');
      console.log('  - Count:', count);
      console.log('  - Error:', error);

      if (error) {
        console.error('❌ Error de Supabase:', error);
        throw error;
      }

      console.log('✅ Productos obtenidos exitosamente');
      return {
        success: true,
        data: {
          data: data || [],
          total: count || 0,
          page,
          limit,
          totalPages: Math.ceil((count || 0) / limit)
        }
      };
    } catch (error) {
      console.error('❌ Error en getProducts:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al obtener productos'
      };
    }
  },

  // Obtener producto por ID
  async getProductById(id: string): Promise<ApiResponse<Product>> {
    try {
      console.log('🔵 productService.getProductById - ID:', id);
      
      // Si estamos en el cliente, usar el API route
      if (typeof window !== 'undefined') {
        console.log('🌐 Usando API route desde el cliente');
        const response = await fetch(`/api/products/${id}`);
        
        if (!response.ok) {
          console.error('❌ API response not ok:', response.status);
          throw new Error('Producto no encontrado');
        }
        
        const data = await response.json();
        console.log('✅ productService.getProductById - Success from API');
        return { success: true, data };
      }
      
      // Si estamos en el servidor, usar Supabase directamente
      console.log('🖥️ Usando Supabase desde el servidor');
      const client = supabaseAdmin || supabase;
      
      const { data, error } = await client
        .from('glowhair_products')
        .select(`
          *,
          category:glowhair_categories(id, name),
          brand:glowhair_brands(id, name)
        `)
        .eq('id', id)
        .eq('is_active', true)
        .single();

      console.log('📊 productService.getProductById - Response:', { data, error });

      if (error) {
        console.error('❌ productService.getProductById - Error:', error);
        throw error;
      }

      console.log('✅ productService.getProductById - Success from Supabase');
      return { success: true, data };
    } catch (error) {
      console.error('❌ productService.getProductById - Exception:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Producto no encontrado'
      };
    }
  },

  // Obtener producto por slug
  async getProductBySlug(slug: string): Promise<ApiResponse<Product>> {
    try {
      const { data, error } = await supabase
        .from('glowhair_products')
        .select(`
          *,
          category:glowhair_categories(id, name),
          brand:glowhair_brands(id, name)
        `)
        .eq('slug', slug)
        .eq('is_active', true)
        .single();

      if (error) throw error;

      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Producto no encontrado'
      };
    }
  },

  // Obtener productos relacionados
  async getRelatedProducts(productId: string, categoryId?: string): Promise<ApiResponse<Product[]>> {
    try {
      let query = supabase
        .from('glowhair_products')
        .select(`
          *,
          category:glowhair_categories(id, name),
          brand:glowhair_brands(id, name)
        `)
        .eq('is_active', true)
        .neq('id', productId)
        .limit(4);

      if (categoryId) {
        query = query.eq('category_id', categoryId);
      }

      const { data, error } = await query.order('rating', { ascending: false });

      if (error) throw error;

      return { success: true, data: data || [] };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al obtener productos relacionados'
      };
    }
  },

  // Obtener productos destacados
  async getFeaturedProducts(limit = 6): Promise<ApiResponse<Product[]>> {
    try {
      const { data, error } = await supabase
        .from('glowhair_products')
        .select(`
          *,
          category:glowhair_categories(id, name),
          brand:glowhair_brands(id, name)
        `)
        .eq('is_active', true)
        .eq('is_featured', true)
        .limit(limit)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return { success: true, data: data || [] };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al obtener productos destacados'
      };
    }
  },

  // Buscar productos
  async searchProducts(query: string, limit = 10): Promise<ApiResponse<Product[]>> {
    try {
      const { data, error } = await supabase
        .from('glowhair_products')
        .select(`
          *,
          category:glowhair_categories(id, name),
          brand:glowhair_brands(id, name)
        `)
        .eq('is_active', true)
        .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
        .limit(limit)
        .order('rating', { ascending: false });

      if (error) throw error;

      return { success: true, data: data || [] };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error en la búsqueda'
      };
    }
  },

  // Crear nuevo producto
  async createProduct(productData: Partial<Product>): Promise<ApiResponse<Product>> {
    try {
      console.log('🟢 productService.createProduct - Inicio');
      console.log('📦 Datos recibidos:', JSON.stringify(productData, null, 2));

      // Usar cliente admin para bypasear RLS y evitar recursión infinita
      const client = supabaseAdmin || supabase;
      
      const { data, error } = await client
        .from('glowhair_products')
        .insert(productData)
        .select(`
          *,
          category:glowhair_categories(id, name),
          brand:glowhair_brands(id, name)
        `)
        .single();

      console.log('📊 Respuesta de Supabase:');
      console.log('  - Data:', data);
      console.log('  - Error:', error);

      if (error) {
        console.error('❌ Error de Supabase:', error);
        throw error;
      }

      console.log('✅ Producto creado exitosamente');
      return { success: true, data };
    } catch (error) {
      console.error('❌ Error en createProduct:', error);
      console.error('  - Message:', error instanceof Error ? error.message : 'Unknown');
      console.error('  - Full error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al crear producto'
      };
    }
  },

  // Actualizar producto
  async updateProduct(id: string, updates: Partial<Product>): Promise<ApiResponse<Product>> {
    try {
      // Usar cliente admin para bypasear RLS
      const client = supabaseAdmin || supabase;
      
      const { data, error } = await client
        .from('glowhair_products')
        .update(updates)
        .eq('id', id)
        .select(`
          *,
          category:glowhair_categories(id, name),
          brand:glowhair_brands(id, name)
        `)
        .single();

      if (error) throw error;

      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al actualizar producto'
      };
    }
  },

  // Eliminar producto (soft delete)
  async deleteProduct(id: string): Promise<ApiResponse<void>> {
    try {
      // Usar cliente admin para bypasear RLS
      const client = supabaseAdmin || supabase;
      
      const { error } = await client
        .from('glowhair_products')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al eliminar producto'
      };
    }
  }
};

// ==========================================
// CATEGORÍAS
// ==========================================

export const categoryService = {
  // Obtener todas las categorías
  async getCategories(): Promise<ApiResponse<Category[]>> {
    try {
      console.log('📂 categoryService.getCategories - Inicio');
      
      // Usar cliente admin para evitar problemas de RLS
      const client = supabaseAdmin || supabase;
      
      const { data, error } = await client
        .from('glowhair_categories')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      console.log('📊 Respuesta de Supabase:');
      console.log('  - Data:', data ? `${data.length} categorías` : 'null');
      console.log('  - Error:', error);

      if (error) {
        console.error('❌ Error de Supabase:', error);
        throw error;
      }

      console.log('✅ Categorías obtenidas exitosamente:', data?.length || 0);
      return { success: true, data: data || [] };
    } catch (error) {
      console.error('❌ Error en getCategories:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al obtener categorías'
      };
    }
  },

  // Obtener categoría por ID
  async getCategoryById(id: string): Promise<ApiResponse<Category>> {
    try {
      // Usar cliente admin para evitar problemas de RLS
      const client = supabaseAdmin || supabase;
      
      const { data, error } = await client
        .from('glowhair_categories')
        .select('*')
        .eq('id', id)
        .eq('is_active', true)
        .single();

      if (error) throw error;

      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Categoría no encontrada'
      };
    }
  }
};

// ==========================================
// MARCAS
// ==========================================

export const brandService = {
  // Obtener todas las marcas
  async getBrands(): Promise<ApiResponse<Brand[]>> {
    try {
      // Usar cliente admin para evitar problemas de RLS
      const client = supabaseAdmin || supabase;
      
      const { data, error } = await client
        .from('glowhair_brands')
        .select('*')
        .eq('is_active', true)
        .order('name', { ascending: true });

      if (error) throw error;

      return { success: true, data: data || [] };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al obtener marcas'
      };
    }
  },

  // Obtener marca por ID
  async getBrandById(id: string): Promise<ApiResponse<Brand>> {
    try {
      // Usar cliente admin para evitar problemas de RLS
      const client = supabaseAdmin || supabase;
      
      const { data, error } = await client
        .from('glowhair_brands')
        .select('*')
        .eq('id', id)
        .eq('is_active', true)
        .single();

      if (error) throw error;

      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Marca no encontrada'
      };
    }
  }
};
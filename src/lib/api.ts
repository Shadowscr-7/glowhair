/**
 * API Helper - GlowHair
 * Utilidad centralizada para todas las llamadas a la API
 */

export class APIError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'APIError';
  }
}

interface FetchOptions extends RequestInit {
  requireAuth?: boolean;
  requireAdmin?: boolean;
}

/**
 * Helper principal para fetch con autenticación automática
 */
export async function fetchAPI<T = unknown>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const { /* requireAuth = false, requireAdmin = false, */ ...fetchOptions } = options;

  // Obtener headers de autenticación
  const userId = typeof window !== 'undefined' 
    ? localStorage.getItem('user_id') || 'temp-user-id'
    : 'temp-user-id';
  
  const isAdmin = typeof window !== 'undefined'
    ? localStorage.getItem('is_admin') === 'true'
    : false;

  // Construir headers
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'x-user-id': userId,
    ...(isAdmin && { 'x-is-admin': 'true' }),
    ...fetchOptions.headers,
  };

  // Realizar fetch
  const response = await fetch(endpoint, {
    ...fetchOptions,
    headers,
  });

  // Manejar errores
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Error desconocido' }));
    throw new APIError(response.status, errorData.error || 'Error en la petición');
  }

  // Retornar data
  return response.json();
}

// ============================================================================
// PRODUCTS API
// ============================================================================

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  original_price?: number;
  image?: string;
  stock: number;
  is_active: boolean;
  is_featured: boolean;
  category_id: string;
  brand_id: string;
  created_at: string;
  category?: { id: string; name: string };
  brand?: { id: string; name: string };
}

export interface ProductsResponse {
  products: Product[];
  total: number;
  limit: number;
  offset: number;
}

export interface ProductFilters {
  search?: string;
  category?: string;
  brand?: string;
  min_price?: number;
  max_price?: number;
  sort_by?: 'featured' | 'price_asc' | 'price_desc' | 'created_desc' | 'name_asc';
  limit?: number;
  offset?: number;
}

export const productsAPI = {
  getAll: (filters?: ProductFilters) => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }
    return fetchAPI<ProductsResponse>(`/api/products?${params}`);
  },

  getById: (id: string) => fetchAPI<Product>(`/api/products/${id}`),

  getBySlug: (slug: string) => fetchAPI<Product>(`/api/products/slug/${slug}`),

  getFeatured: (limit = 6) => fetchAPI<Product[]>(`/api/products/featured?limit=${limit}`),

  getRelated: (id: string, limit = 4) => 
    fetchAPI<Product[]>(`/api/products/${id}/related?limit=${limit}`),

  search: (query: string) => fetchAPI<Product[]>(`/api/products/search?q=${query}`),

  create: (data: Partial<Product>) =>
    fetchAPI<Product>('/api/products', {
      method: 'POST',
      body: JSON.stringify(data),
      requireAdmin: true,
    }),

  update: (id: string, data: Partial<Product>) =>
    fetchAPI<Product>(`/api/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
      requireAdmin: true,
    }),

  delete: (id: string) =>
    fetchAPI(`/api/products/${id}`, {
      method: 'DELETE',
      requireAdmin: true,
    }),
};

// ============================================================================
// CART API
// ============================================================================

export interface CartItem {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  created_at: string;
  product?: Product;
}

export interface CartTotal {
  subtotal: number;
  tax: number;
  discount: number;
  shipping: number;
  total: number;
  items: number;
  taxRate: number;
  freeShippingThreshold: number;
  freeShipping: boolean;
}

export const cartAPI = {
  get: () => fetchAPI<CartItem[]>('/api/cart', { requireAuth: true }),

  add: (product_id: string, quantity = 1) =>
    fetchAPI<CartItem>('/api/cart', {
      method: 'POST',
      body: JSON.stringify({ product_id, quantity }),
      requireAuth: true,
    }),

  update: (itemId: string, quantity: number) =>
    fetchAPI<CartItem | null>(`/api/cart/${itemId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity }),
      requireAuth: true,
    }),

  remove: (itemId: string) =>
    fetchAPI(`/api/cart/${itemId}`, {
      method: 'DELETE',
      requireAuth: true,
    }),

  clear: () =>
    fetchAPI('/api/cart', {
      method: 'DELETE',
      requireAuth: true,
    }),

  getCount: () =>
    fetchAPI<{ count: number; uniqueItems: number }>('/api/cart/count', {
      requireAuth: true,
    }),

  getTotal: () => fetchAPI<CartTotal>('/api/cart/total', { requireAuth: true }),
};

// ============================================================================
// ORDERS API
// ============================================================================

export interface Order {
  id: string;
  user_id: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  shipping_address: string;
  billing_address: string;
  payment_method: string;
  tracking_number?: string;
  notes?: string;
  created_at: string;
  shipped_at?: string;
  delivered_at?: string;
  cancelled_at?: string;
  items?: OrderItem[];
  user?: { id: string; email: string; full_name: string };
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price: number;
  product?: Product;
}

export interface OrdersResponse {
  orders: Order[];
  total: number;
  limit: number;
  offset: number;
}

export interface CreateOrderData {
  shipping_address: string;
  billing_address?: string;
  payment_method?: string;
  notes?: string;
}

export const ordersAPI = {
  getAll: (status?: string, limit = 50, offset = 0) => {
    const params = new URLSearchParams({ limit: limit.toString(), offset: offset.toString() });
    if (status) params.append('status', status);
    return fetchAPI<OrdersResponse>(`/api/orders?${params}`, { requireAuth: true });
  },

  getById: (id: string) => fetchAPI<Order>(`/api/orders/${id}`, { requireAuth: true }),

  create: (data: CreateOrderData) =>
    fetchAPI<Order>('/api/orders', {
      method: 'POST',
      body: JSON.stringify(data),
      requireAuth: true,
    }),

  updateStatus: (id: string, status: string, tracking_number?: string) =>
    fetchAPI<Order>(`/api/orders/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status, tracking_number }),
      requireAdmin: true,
    }),

  cancel: (id: string) =>
    fetchAPI(`/api/orders/${id}`, {
      method: 'DELETE',
      requireAuth: true,
    }),

  getByUser: (userId: string, limit = 20, offset = 0) =>
    fetchAPI<OrdersResponse>(
      `/api/orders/user/${userId}?limit=${limit}&offset=${offset}`,
      { requireAuth: true }
    ),

  getRecent: (limit = 10) =>
    fetchAPI<Order[]>(`/api/orders/recent?limit=${limit}`, { requireAuth: true }),

  getStats: () =>
    fetchAPI<{
      totalOrders: number;
      totalRevenue: number;
      averageOrderValue: number;
      ordersByStatus: Record<string, number>;
      ordersByMonth: Record<string, { count: number; revenue: number }>;
      successRate: number;
    }>('/api/orders/stats', { requireAdmin: true }),
};

// ============================================================================
// FAVORITES API
// ============================================================================

export interface Favorite {
  id: string;
  created_at: string;
  product: Product;
}

export const favoritesAPI = {
  getAll: () => fetchAPI<Favorite[]>('/api/favorites', { requireAuth: true }),

  add: (product_id: string) =>
    fetchAPI<Favorite>('/api/favorites', {
      method: 'POST',
      body: JSON.stringify({ product_id }),
      requireAuth: true,
    }),

  remove: (productId: string) =>
    fetchAPI(`/api/favorites/${productId}`, {
      method: 'DELETE',
      requireAuth: true,
    }),

  check: (productId: string) =>
    fetchAPI<{ isFavorite: boolean }>(`/api/favorites/${productId}`, {
      requireAuth: true,
    }),

  getCount: () =>
    fetchAPI<{ count: number }>('/api/favorites/count', { requireAuth: true }),

  clearAll: () =>
    fetchAPI('/api/favorites', {
      method: 'DELETE',
      requireAuth: true,
    }),
};

// ============================================================================
// REVIEWS API
// ============================================================================

export interface Review {
  id: string;
  user_id: string;
  product_id: string;
  rating: number;
  title?: string;
  comment: string;
  created_at: string;
  updated_at: string;
  user?: { id: string; full_name: string; email: string };
  product?: Product;
}

export interface ReviewsResponse {
  reviews: Review[];
  total: number;
  limit: number;
  offset: number;
}

export interface ProductReviewsResponse {
  reviews: Review[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
  };
  statistics: {
    totalReviews: number;
    averageRating: number;
    ratingDistribution: Record<number, number>;
  };
}

export interface CreateReviewData {
  product_id: string;
  rating: number;
  title?: string;
  comment: string;
}

export const reviewsAPI = {
  getAll: (product_id?: string, user_id?: string, limit = 50, offset = 0) => {
    const params = new URLSearchParams({ limit: limit.toString(), offset: offset.toString() });
    if (product_id) params.append('product_id', product_id);
    if (user_id) params.append('user_id', user_id);
    return fetchAPI<ReviewsResponse>(`/api/reviews?${params}`);
  },

  getById: (id: string) => fetchAPI<Review>(`/api/reviews/${id}`),

  getByProduct: (productId: string, limit = 20, offset = 0) =>
    fetchAPI<ProductReviewsResponse>(
      `/api/reviews/product/${productId}?limit=${limit}&offset=${offset}`
    ),

  getByUser: (userId: string, limit = 20, offset = 0) =>
    fetchAPI<ReviewsResponse>(
      `/api/reviews/user/${userId}?limit=${limit}&offset=${offset}`,
      { requireAuth: true }
    ),

  create: (data: CreateReviewData) =>
    fetchAPI<Review>('/api/reviews', {
      method: 'POST',
      body: JSON.stringify(data),
      requireAuth: true,
    }),

  update: (id: string, data: Partial<CreateReviewData>) =>
    fetchAPI<Review>(`/api/reviews/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
      requireAuth: true,
    }),

  delete: (id: string) =>
    fetchAPI(`/api/reviews/${id}`, {
      method: 'DELETE',
      requireAuth: true,
    }),
};

// ============================================================================
// CATEGORIES & BRANDS API
// ============================================================================

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  is_active: boolean;
  created_at: string;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logo?: string;
  is_active: boolean;
  created_at: string;
}

export const categoriesAPI = {
  getAll: () => fetchAPI<Category[]>('/api/categories'),
  getById: (id: string) => fetchAPI<Category>(`/api/categories/${id}`),
};

export const brandsAPI = {
  getAll: () => fetchAPI<Brand[]>('/api/brands'),
  getById: (id: string) => fetchAPI<Brand>(`/api/brands/${id}`),
};

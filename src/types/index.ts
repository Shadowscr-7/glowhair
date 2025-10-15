// ==========================================
// TIPOS PRINCIPALES
// ==========================================

export interface Product {
  id: string;
  name: string;
  slug?: string;
  description?: string;
  short_description?: string;
  price: number;
  original_price?: number;
  cost_price?: number;
  category_id?: string;
  brand_id?: string;
  sku?: string;
  barcode?: string;
  weight?: number;
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
  };
  images?: string[];
  image?: React.ReactNode; // Para compatibilidad con iconos
  image_url?: string;
  rating: number;
  review_count: number;
  is_new?: boolean;
  is_on_sale?: boolean;
  is_featured?: boolean;
  is_active?: boolean;
  stock?: number;
  min_stock?: number;
  max_stock?: number;
  ingredients?: string[];
  hair_types?: string[];
  usage_instructions?: string;
  benefits?: string[];
  seo_title?: string;
  seo_description?: string;
  seo_keywords?: string[];
  created_at?: string;
  updated_at?: string;
  
  // Relaciones
  category?: Category;
  brand?: Brand;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  image_url?: string;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface Brand {
  id: string;
  name: string;
  description?: string;
  logo_url?: string;
  website_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// ==========================================
// USUARIOS Y PERFILES
// ==========================================

export interface Profile {
  id: string;
  email?: string;
  full_name?: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  avatar_url?: string;
  date_of_birth?: string;
  gender?: string;
  hair_type?: string;
  hair_concerns?: string[];
  preferred_brands?: string[];
  skin_type?: string;
  role?: 'customer' | 'admin' | 'super_admin';
  admin_permissions?: Record<string, boolean>;
  preferences?: Record<string, unknown>;
  newsletter_subscribed?: boolean;
  is_verified: boolean;
  is_active: boolean;
  total_orders?: number;
  total_spent?: number;
  loyalty_points?: number;
  last_login?: string;
  created_at: string;
  updated_at: string;
}

export interface Address {
  id: string;
  user_id: string;
  type: 'shipping' | 'billing';
  first_name: string;
  last_name: string;
  company?: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  phone?: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

// ==========================================
// CARRITO Y COMPRAS
// ==========================================

export interface CartItem {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  created_at: string;
  product?: Product;
}

// Para compatibilidad con el contexto actual
export interface CartItemLegacy extends Product {
  quantity: number;
}

export interface Order {
  id: string;
  order_number: string;
  user_id: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  subtotal: number;
  tax_amount: number;
  shipping_amount: number;
  discount_amount: number;
  total: number;
  currency: string;
  shipping_address: Address;
  billing_address?: Address;
  shipping_method?: string;
  tracking_number?: string;
  payment_method?: string;
  payment_provider?: string;
  payment_provider_id?: string;
  coupon_code?: string;
  coupon_discount: number;
  ordered_at: string;
  shipped_at?: string;
  delivered_at?: string;
  cancelled_at?: string;
  customer_notes?: string;
  admin_notes?: string;
  created_at: string;
  updated_at: string;
  
  // Relaciones
  items?: OrderItem[];
  status_history?: OrderStatusHistory[];
  profile?: {
    full_name: string;
    email: string;
  };
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  product_image?: string;
  sku?: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  created_at: string;
  
  // Relación
  product?: Product;
}

export interface OrderStatusHistory {
  id: string;
  order_id: string;
  status: string;
  notes?: string;
  created_by?: string;
  created_at: string;
}

// ==========================================
// CUPONES Y DESCUENTOS
// ==========================================

export interface Coupon {
  id: string;
  code: string;
  name?: string;
  description?: string;
  type: 'percentage' | 'fixed_amount' | 'free_shipping';
  value?: number;
  min_order_amount: number;
  max_discount_amount?: number;
  usage_limit?: number;
  usage_limit_per_user: number;
  used_count: number;
  is_active: boolean;
  starts_at?: string;
  expires_at?: string;
  applicable_products?: string[];
  applicable_categories?: string[];
  created_at: string;
  updated_at: string;
}

export interface CouponUsage {
  id: string;
  coupon_id: string;
  user_id: string;
  order_id?: string;
  discount_amount: number;
  used_at: string;
  
  // Relaciones
  coupon?: Coupon;
  order?: Order;
}

// ==========================================
// RESEÑAS Y VALORACIONES
// ==========================================

export interface Review {
  id: string;
  user_id: string;
  product_id: string;
  order_id?: string;
  rating: number;
  title?: string;
  comment?: string;
  images?: string[];
  is_verified: boolean;
  is_approved: boolean;
  helpful_count: number;
  created_at: string;
  updated_at: string;
  
  // Relaciones
  user?: Profile;
  product?: Product;
}

export interface ReviewVote {
  id: string;
  review_id: string;
  user_id: string;
  is_helpful: boolean;
  created_at: string;
}

// ==========================================
// INVENTARIO
// ==========================================

export interface InventoryMovement {
  id: string;
  product_id: string;
  type: 'in' | 'out' | 'adjustment' | 'reserved' | 'released';
  quantity: number;
  reason?: string;
  reference_id?: string;
  notes?: string;
  created_by?: string;
  created_at: string;
  
  // Relaciones
  product?: Product;
}

// ==========================================
// NOTIFICACIONES
// ==========================================

export interface Notification {
  id: string;
  user_id: string;
  type: 'order_status' | 'stock_alert' | 'promotion' | 'system';
  title: string;
  message: string;
  data?: Record<string, unknown>;
  is_read: boolean;
  created_at: string;
}

// ==========================================
// CONFIGURACIÓN
// ==========================================

export interface SiteSetting {
  id: string;
  key: string;
  value: unknown;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface AdminUser {
  id: string;
  user_id: string;
  role: 'admin' | 'super_admin' | 'moderator';
  permissions: Record<string, boolean>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  
  // Relación
  user?: Profile;
}

// ==========================================
// NEWSLETTER Y MARKETING
// ==========================================

export interface NewsletterSubscriber {
  id: string;
  email: string;
  full_name?: string;
  is_active: boolean;
  subscribed_at: string;
  unsubscribed_at?: string;
  preferences: Record<string, unknown>;
}

export interface EmailCampaign {
  id: string;
  name: string;
  subject: string;
  content: string;
  status: 'draft' | 'scheduled' | 'sent';
  scheduled_at?: string;
  sent_at?: string;
  recipient_count: number;
  open_count: number;
  click_count: number;
  created_at: string;
  updated_at: string;
}

// ==========================================
// FILTROS Y PARÁMETROS
// ==========================================

export interface FilterState {
  category: string;
  brand: string;
  hairType: string;
  priceRange: [number, number];
  searchTerm: string;
  sortBy: string;
}

export type SortOption = 
  | "featured" 
  | "newest" 
  | "price-low" 
  | "price-high" 
  | "rating" 
  | "name";

// ==========================================
// FAVORITOS (LEGACY)
// ==========================================

export interface Favorite {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
  product?: Product;
}

export interface WishlistItem extends Product {
  dateAdded: Date;
}

// ==========================================
// TIPOS DE RESPUESTA API
// ==========================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ==========================================
// TIPOS DE FORMULARIOS
// ==========================================

export interface ProductFormData {
  name: string;
  description?: string;
  short_description?: string;
  price: number;
  original_price?: number;
  category_id: string;
  brand_id?: string;
  sku?: string;
  stock: number;
  ingredients?: string[];
  hair_types?: string[];
  benefits?: string[];
  images?: string[];
  is_new?: boolean;
  is_on_sale?: boolean;
  is_featured?: boolean;
}

export interface CheckoutFormData {
  shipping_address: Omit<Address, 'id' | 'user_id' | 'created_at' | 'updated_at'>;
  billing_address?: Omit<Address, 'id' | 'user_id' | 'created_at' | 'updated_at'>;
  payment_method: string;
  customer_notes?: string;
  coupon_code?: string;
}

export interface ProfileFormData {
  full_name?: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  date_of_birth?: string;
  gender?: string;
  hair_type?: string;
  skin_type?: string;
}
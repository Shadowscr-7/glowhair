export interface Product {
  id: string;
  name: string;
  price: number;
  original_price?: number;
  rating: number;
  review_count: number;
  image?: React.ReactNode;
  image_url?: string;
  category: string;
  brand?: string;
  is_new?: boolean;
  is_on_sale?: boolean;
  description: string;
  ingredients?: string[];
  hair_type?: string[];
  stock?: number;
  created_at?: string;
  updated_at?: string;
}

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

export interface CartItemDB {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  created_at: string;
  product?: Product;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface WishlistItem extends Product {
  dateAdded: Date;
}

export interface Order {
  id: string;
  user_id: string;
  total: number;
  status: string;
  shipping_address?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price: number;
  created_at: string;
  product?: Product;
}

export interface Profile {
  id: string;
  email?: string;
  full_name?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Favorite {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
  product?: Product;
}
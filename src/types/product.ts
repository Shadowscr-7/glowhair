export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewCount: number;
  image: React.ReactNode;
  category: string;
  brand: string;
  isNew?: boolean;
  isOnSale?: boolean;
  description: string;
  ingredients: string[];
  hairType: string[];
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

export interface CartItem extends Product {
  quantity: number;
}

export interface WishlistItem extends Product {
  dateAdded: Date;
}
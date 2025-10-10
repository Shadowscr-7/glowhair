// UI Product type for product detail page
export interface UIProduct {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewCount: number;
  image: React.ReactNode;
  category: string;
  brand: string;
  isNew: boolean;
  isOnSale: boolean;
  description: string;
  stock: number;
}

// Product state for the page
export interface ProductState {
  product: UIProduct | null;
  loading: boolean;
  error: string | null;
  quantity: number;
  isFavorite: boolean;
  addingToCart: boolean;
  togglingFavorite: boolean;
  showSuccessMessage: boolean;
}

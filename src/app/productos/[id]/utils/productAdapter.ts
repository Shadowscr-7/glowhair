import type { Product as APIProduct } from "@/types";
import type { UIProduct } from "./types";
import { getCategoryIcon } from "./iconHelper";

// Adapter: Convierte API Product a UI Product
export const adaptProductForUI = (apiProduct: APIProduct): UIProduct => {
  const isNew = () => {
    if (!apiProduct.created_at) return false;
    const createdDate = new Date(apiProduct.created_at);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return createdDate > thirtyDaysAgo;
  };

  return {
    id: apiProduct.id,
    name: apiProduct.name,
    price: apiProduct.price,
    originalPrice: apiProduct.original_price,
    rating: 4.5, // TODO: Calcular desde reviews
    reviewCount: 0, // TODO: Count real de reviews
    image: getCategoryIcon(apiProduct.category?.name || 'Producto'),
    category: apiProduct.category?.name || 'General',
    brand: apiProduct.brand?.name || 'GlowHair',
    isNew: isNew(),
    isOnSale: !!apiProduct.original_price && apiProduct.original_price > apiProduct.price,
    description: apiProduct.description || '',
    stock: apiProduct.stock || 0
  };
};

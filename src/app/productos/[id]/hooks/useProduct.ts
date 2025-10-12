import { useState, useEffect, useCallback } from "react";
import { productService } from "@/lib/services/products";
import { adaptProductForUI } from "../utils/productAdapter";
import type { UIProduct } from "../utils/types";

export const useProduct = (productId: string) => {
  const [product, setProduct] = useState<UIProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProduct = useCallback(async () => {
    try {
      console.log('🔵 useProduct - Fetching product:', productId);
      setLoading(true);
      setError(null);
      
      const response = await productService.getProductById(productId);
      console.log('📊 useProduct - Response:', response);
      
      if (response.success && response.data) {
        console.log('✅ useProduct - Product data received:', response.data);
        const uiProduct = adaptProductForUI(response.data);
        console.log('✅ useProduct - UI Product adapted:', uiProduct);
        setProduct(uiProduct);
      } else {
        console.error('❌ useProduct - Error:', response.error);
        setError(response.error || "Error al cargar el producto");
      }
    } catch (err) {
      console.error('❌ useProduct - Exception:', err);
      setError(err instanceof Error ? err.message : "Error al cargar el producto");
    } finally {
      setLoading(false);
      console.log('🏁 useProduct - Loading finished');
    }
  }, [productId]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  return { product, loading, error, refetch: fetchProduct };
};

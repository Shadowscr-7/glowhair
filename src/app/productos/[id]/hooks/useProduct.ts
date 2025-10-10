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
      setLoading(true);
      setError(null);
      
      const response = await productService.getProductById(productId);
      
      if (response.success && response.data) {
        const uiProduct = adaptProductForUI(response.data);
        setProduct(uiProduct);
      } else {
        setError(response.error || "Error al cargar el producto");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar el producto");
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  return { product, loading, error, refetch: fetchProduct };
};

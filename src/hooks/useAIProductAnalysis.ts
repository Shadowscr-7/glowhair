/**
 * Hook personalizado para análisis de productos con IA
 * Procesa imágenes y obtiene información del producto automáticamente
 */

import { useState } from "react";
import { analyzeProductImage } from "@/lib/services/openai";

interface ProductData {
  name: string;
  description: string;
  category: string;
  benefits: string[];
  usage: string;
  ingredients: string;
}

interface AIAnalysisState {
  isAnalyzing: boolean;
  error: string | null;
  productData: ProductData | null;
}

export function useAIProductAnalysis() {
  const [state, setState] = useState<AIAnalysisState>({
    isAnalyzing: false,
    error: null,
    productData: null,
  });

  /**
   * Convierte un archivo File a base64
   */
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        // Remover el prefijo "data:image/...;base64,"
        const base64 = result.split(",")[1];
        resolve(base64);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  /**
   * Analiza una imagen de producto y obtiene toda la información
   */
  const analyzeProduct = async (imageFile: File): Promise<ProductData | null> => {
    setState({
      isAnalyzing: true,
      error: null,
      productData: null,
    });

    try {
      // Convertir imagen a base64
      const imageBase64 = await fileToBase64(imageFile);

      // Analizar con OpenAI
      const result = await analyzeProductImage(imageBase64);

      if (!result.success || !result.data) {
        setState({
          isAnalyzing: false,
          error: result.error || "Error al analizar la imagen",
          productData: null,
        });
        return null;
      }

      // Mapear los datos al formato esperado
      const productData: ProductData = {
        name: result.data.nombre,
        description: result.data.descripcion,
        category: result.data.categoria,
        benefits: result.data.beneficios,
        usage: result.data.instrucciones,
        ingredients: result.data.ingredientes,
      };

      setState({
        isAnalyzing: false,
        error: null,
        productData,
      });

      return productData;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Error al procesar la imagen";

      setState({
        isAnalyzing: false,
        error: errorMessage,
        productData: null,
      });

      return null;
    }
  };

  /**
   * Resetea el estado del análisis
   */
  const reset = () => {
    setState({
      isAnalyzing: false,
      error: null,
      productData: null,
    });
  };

  return {
    isAnalyzing: state.isAnalyzing,
    error: state.error,
    productData: state.productData,
    analyzeProduct,
    reset,
  };
}

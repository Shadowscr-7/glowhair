/**
 * OpenAI Service
 * Servicio para procesar imágenes de productos con OpenAI Vision API
 */

interface ProductAnalysis {
  nombre: string;
  descripcion: string;
  categoria: string;
  beneficios: string[];
  instrucciones: string;
  ingredientes: string;
}

interface ImageAnalysisResult {
  success: boolean;
  data?: ProductAnalysis;
  error?: string;
}

/**
 * Analiza una imagen de producto usando OpenAI Vision API
 * @param imageBase64 - Imagen en formato base64
 * @returns Análisis completo del producto
 */
export async function analyzeProductImage(
  imageBase64: string
): Promise<ImageAnalysisResult> {
  try {
    const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;

    if (!apiKey) {
      return {
        success: false,
        error: "OpenAI API key no configurada. Agrega NEXT_PUBLIC_OPENAI_API_KEY en .env",
      };
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o", // Modelo con capacidades de visión
        messages: [
          {
            role: "system",
            content: `Eres un experto copywriter de e-commerce especializado en productos de cuidado capilar premium. 
            Tu tarea es analizar imágenes de productos para el cabello y crear contenido profesional, atractivo y detallado.
            
            IMPORTANTE - Estilo de escritura:
            - Usa un tono elegante, profesional y persuasivo
            - Enfócate en beneficios emocionales y resultados visibles
            - Usa lenguaje sensorial y descriptivo
            - Crea urgencia y deseo por el producto
            
            Categorías comunes: Champús, Acondicionadores, Mascarillas, Serums, Aceites, Tratamientos, Keratina, 
            Geles, Mousse, Ceras, Protectores, Tintes, Matizadores, etc. 
            IMPORTANTE: Usa el nombre de categoría más específico y descriptivo posible según el producto.
            
            Responde ÚNICAMENTE con un objeto JSON válido con esta estructura exacta:
            {
              "nombre": "nombre comercial atractivo y profesional del producto",
              "descripcion": "descripción rica y detallada de 4-6 oraciones que incluya: qué es el producto, para quién es ideal, sus características únicas, resultados que ofrece, y por qué elegirlo. Usa lenguaje persuasivo de e-commerce premium.",
              "categoria": "categoría específica del producto (ej: 'Geles de Peinado', 'Champús Sin Sulfatos', 'Serums', 'Protectores de Calor', etc.)",
              "beneficios": ["beneficio específico y atractivo 1", "beneficio específico 2", "beneficio específico 3", "beneficio específico 4", "beneficio específico 5"],
              "instrucciones": "instrucciones de uso muy detalladas, paso a paso, con tiempos específicos, cantidades recomendadas, frecuencia de uso, consejos profesionales y tips para mejores resultados. Mínimo 3-4 oraciones bien estructuradas.",
              "ingredientes": "lista completa y detallada de ingredientes en formato: Ingrediente Principal 1 (beneficio breve), Ingrediente 2 (beneficio), Ingrediente 3 (beneficio), etc. Separados por comas. Incluye al menos 8-12 ingredientes con sus beneficios específicos."
            }`,
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Analiza esta imagen de producto para el cabello y crea contenido profesional de e-commerce:

                1. NOMBRE: Crea un nombre comercial atractivo, memorable y profesional que suene premium
                
                2. DESCRIPCIÓN (4-6 oraciones): 
                   - Presenta el producto de forma cautivadora
                   - Describe su textura, aroma, experiencia de uso
                   - Menciona para qué tipo de cabello es ideal
                   - Destaca sus características únicas y diferenciadoras
                   - Enfatiza los resultados visibles que ofrece
                   - Cierra con una frase persuasiva
                
                3. CATEGORÍA: Selecciona la más apropiada
                
                4. BENEFICIOS (5 items): Lista específica y atractiva de beneficios tangibles y emocionales
                
                5. INSTRUCCIONES DE USO (muy detalladas):
                   - Paso 1 con detalles específicos
                   - Paso 2 con cantidades y tiempos
                   - Paso 3 con técnicas recomendadas
                   - Frecuencia de uso sugerida
                   - Tips profesionales para potenciar resultados
                   - Recomendaciones adicionales
                   Mínimo 4-5 oraciones completas y profesionales.
                
                6. INGREDIENTES (lista detallada con beneficios):
                   Formato: "Ingrediente 1 (para hidratación profunda), Ingrediente 2 (aporta brillo), Ingrediente 3 (fortalece), etc."
                   Incluye 8-12 ingredientes principales con su beneficio específico entre paréntesis.
                   Usa nombres científicos cuando sea apropiado junto con nombres comunes.
                
                Responde SOLO con el JSON, sin texto adicional. Usa lenguaje elegante y profesional de e-commerce premium.`,
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${imageBase64}`,
                },
              },
            ],
          },
        ],
        max_tokens: 2000,
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("OpenAI API error:", errorData);
      return {
        success: false,
        error: `Error de OpenAI API: ${errorData.error?.message || "Error desconocido"}`,
      };
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      return {
        success: false,
        error: "No se recibió respuesta de OpenAI",
      };
    }

    // Parsear el JSON de la respuesta
    let productData: ProductAnalysis;
    try {
      // Limpiar posibles markdown o texto extra
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        productData = JSON.parse(jsonMatch[0]);
      } else {
        productData = JSON.parse(content);
      }
    } catch {
      console.error("Error parsing OpenAI response:", content);
      return {
        success: false,
        error: "Error al parsear la respuesta de OpenAI",
      };
    }

    // Validar y normalizar la categoría
    // Ya no validamos contra una lista fija, dejamos que el matching inteligente lo maneje
    if (!productData.categoria) {
      productData.categoria = "Tratamientos"; // Categoría genérica por defecto
    }

    return {
      success: true,
      data: productData,
    };
  } catch (error) {
    console.error("Error analyzing product image:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error desconocido",
    };
  }
}

/**
 * Mejora una imagen de producto usando DALL-E 3
 * @param imageBase64 - Imagen original en base64
 * @param productName - Nombre del producto para contexto
 * @returns URL de la imagen mejorada o null si hay error
 */
export async function enhanceProductImage(
  imageBase64: string
): Promise<{ success: boolean; imageUrl?: string; error?: string }> {
  try {
    const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;

    if (!apiKey) {
      return {
        success: false,
        error: "OpenAI API key no configurada",
      };
    }

    // Nota: DALL-E 3 no puede editar imágenes directamente, solo generarlas
    // Para mejorar imágenes, usaremos la imagen original directamente
    // y solo analizaremos con Vision API
    
    // Si quisieras generar una imagen nueva basada en la descripción:
    // const response = await fetch("https://api.openai.com/v1/images/generations", {...});
    
    return {
      success: true,
      imageUrl: `data:image/jpeg;base64,${imageBase64}`,
    };
  } catch (error) {
    console.error("Error enhancing product image:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error desconocido",
    };
  }
}

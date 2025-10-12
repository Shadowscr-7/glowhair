import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { productName } = await request.json();

    if (!productName || typeof productName !== 'string') {
      return NextResponse.json(
        { error: 'Nombre de producto es requerido' },
        { status: 400 }
      );
    }

    console.log('🤖 Analizando producto por nombre:', productName);

    // Llamar a OpenAI para analizar el producto basándose en su nombre
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'Eres un experto en productos capilares. Respondes SOLO con JSON válido, sin texto adicional.',
        },
        {
          role: 'user',
          content: `Te voy a dar el nombre de un producto capilar y necesito que me proporciones información detallada sobre él.

Nombre del producto: "${productName}"

Por favor, proporcióname la siguiente información en formato JSON:
{
  "name": "nombre del producto (el mismo que te di)",
  "description": "descripción detallada del producto, sus propiedades y para qué tipo de cabello es ideal (mínimo 150 palabras, máximo 300 palabras)",
  "category": "categoría principal del producto (ej: Champús, Acondicionadores, Mascarillas, Serums, Aceites Capilares, Geles, Mousses, Ceras, Protectores Térmicos, Tintes, Tratamientos de Keratina, etc.)",
  "benefits": ["beneficio 1", "beneficio 2", "beneficio 3", "beneficio 4", "beneficio 5"] (lista de 5-7 beneficios clave, cada uno máximo 1 línea),
  "usage": "instrucciones detalladas de cómo aplicar y usar el producto paso a paso (mínimo 100 palabras)",
  "ingredients": "lista de ingredientes principales con sus funciones específicas entre paréntesis, separados por comas. Ejemplo: Theobroma Cacao Seed Extract (hidrata profundamente), Aqua (agua purificada, base), Glycerin (retiene la humedad), Hydrolyzed Keratin (fortalece), etc."
}

IMPORTANTE:
- La descripción debe ser promocional, detallada y atractiva
- Los beneficios deben ser específicos y concisos
- Las instrucciones de uso deben ser claras y paso a paso
- Los ingredientes deben tener sus funciones explicadas
- Responde SOLO con el JSON, sin texto adicional
- Si no conoces el producto exacto, infiere la información basándose en productos similares de la misma categoría`,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
    });

    const responseText = completion.choices[0].message.content || '';

    console.log('📄 Respuesta de OpenAI:', responseText);

    // Parsear JSON de la respuesta
    const productData = JSON.parse(responseText);

    console.log('✅ Datos del producto parseados:', productData);

    return NextResponse.json(productData, { status: 200 });
  } catch (error) {
    console.error('❌ Error al analizar producto:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Error al analizar el producto',
      },
      { status: 500 }
    );
  }
}

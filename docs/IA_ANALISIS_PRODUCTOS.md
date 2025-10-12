# 🤖 Análisis de Productos con IA - OpenAI Vision

## Descripción General

Este sistema permite analizar automáticamente imágenes de productos para el cabello usando **OpenAI Vision API (GPT-4o)**. La IA procesa la imagen y rellena automáticamente todos los campos del producto, facilitando enormemente la carga de productos.

## 🌟 Características

✅ **Análisis automático de imágenes** con OpenAI GPT-4o Vision
✅ **Auto-rellenado de campos con contenido premium**:
   - Nombre comercial atractivo y memorable
   - Descripción detallada de 4-6 oraciones (estilo e-commerce)
   - Categoría apropiada
   - Lista de 5 beneficios específicos y persuasivos
   - Instrucciones de uso muy detalladas con pasos, tiempos y tips
   - Ingredientes completos con beneficios (8-12 items)

✅ **Interfaz intuitiva** con arrastrar y soltar
✅ **Feedback visual** durante el procesamiento
✅ **Edición manual** de todos los campos después del análisis

## 📦 Estructura Modular

```
src/
├── lib/
│   └── services/
│       └── openai.ts                    # Servicio de OpenAI API
├── hooks/
│   └── useAIProductAnalysis.ts          # Hook personalizado para IA
├── components/
│   └── admin/
│       └── AIImageUpload.tsx            # Componente de subida con IA
└── app/
    └── admin/
        └── productos/
            └── nuevo/
                └── page.tsx             # Página integrada con IA
```

## 🔧 Configuración

### 1. Obtener API Key de OpenAI

1. Ve a [OpenAI Platform](https://platform.openai.com/)
2. Crea una cuenta o inicia sesión
3. Ve a [API Keys](https://platform.openai.com/api-keys)
4. Crea una nueva API key
5. **Importante**: Asegúrate de tener créditos en tu cuenta de OpenAI

### 2. Configurar Variables de Entorno

Crea o edita el archivo `.env.local` en la raíz del proyecto:

```env
# OpenAI Configuration
NEXT_PUBLIC_OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxx
```

**⚠️ IMPORTANTE**: Nunca compartas tu API key ni la subas a repositorios públicos.

### 3. Instalar Dependencias (si es necesario)

Las dependencias ya deberían estar instaladas, pero si necesitas reinstalar:

```bash
npm install
```

## 🚀 Uso

### Agregar Nuevo Producto con IA

1. Ve a **Panel Admin → Productos → Agregar Producto**
2. En la sección "Imagen del Producto con IA":
   - Arrastra una imagen del producto o haz clic para seleccionar
   - Espera mientras la IA analiza la imagen (10-20 segundos)
3. La IA rellenará automáticamente todos los campos
4. **Revisa y ajusta** la información si es necesario
5. Completa los precios manualmente
6. Guarda el producto

### Mejores Prácticas para las Imágenes

Para obtener mejores resultados del análisis de IA:

✅ Usa imágenes claras y bien iluminadas
✅ Fondo limpio o neutro
✅ Producto visible y en foco
✅ Etiquetas del producto legibles (si es posible)
✅ Tamaño máximo: 10MB
✅ Formatos: JPG, PNG

## 🔄 Flujo de Trabajo

```
1. Usuario sube imagen
   ↓
2. Imagen se convierte a base64
   ↓
3. Se envía a OpenAI Vision API (GPT-4o)
   ↓
4. IA analiza y genera datos del producto
   ↓
5. Datos se validan y formatean
   ↓
6. Formulario se rellena automáticamente
   ↓
7. Usuario revisa/ajusta y guarda
```

## 📝 API de OpenAI Utilizada

### Modelo
- **GPT-4o**: Modelo con capacidades de visión avanzadas

### Endpoint
```
POST https://api.openai.com/v1/chat/completions
```

### Prompt del Sistema
El sistema usa un prompt especializado que instruye a la IA para:
- Identificar productos de cuidado capilar
- Generar nombres profesionales
- Crear descripciones detalladas
- Clasificar en categorías válidas
- Sugerir beneficios específicos
- Proporcionar instrucciones de uso
- Listar ingredientes típicos

## 💰 Costos

El uso de la API de OpenAI tiene un costo:

- **GPT-4o Vision**: ~$0.005 por imagen analizada (varía según tokens)
- Los costos se cargan a tu cuenta de OpenAI
- Revisa los [precios actuales](https://openai.com/pricing) de OpenAI

## 🛠️ Mantenimiento

### Actualizar el Prompt

Para mejorar los resultados, puedes editar el prompt en:
```typescript
src/lib/services/openai.ts
```

### Agregar Nuevas Categorías

Para agregar categorías, actualiza ambos archivos:
1. `src/lib/services/openai.ts` - Lista de categorías válidas
2. `src/app/admin/productos/nuevo/page.tsx` - Array de categorías

### Manejo de Errores

El sistema maneja automáticamente:
- ❌ API key no configurada
- ❌ Errores de red
- ❌ Respuestas inválidas de la API
- ❌ Límites de rate limiting

Los usuarios pueden continuar rellenando manualmente si hay errores.

## 🔒 Seguridad

### Recomendaciones

1. **Variables de entorno**: Usa `.env.local` para claves sensibles
2. **Gitignore**: Asegúrate de que `.env.local` esté en `.gitignore`
3. **Límites de uso**: Considera implementar límites por usuario
4. **Validación**: Siempre valida los datos antes de guardar

### Archivo .gitignore

Asegúrate de incluir:
```
.env.local
.env*.local
```

## 🐛 Troubleshooting

### Error: "OpenAI API key no configurada"
- Verifica que `NEXT_PUBLIC_OPENAI_API_KEY` esté en `.env.local`
- Reinicia el servidor de desarrollo

### Error: "Error de OpenAI API"
- Verifica que tu API key sea válida
- Asegúrate de tener créditos en tu cuenta de OpenAI
- Revisa los logs de la consola para más detalles

### La IA no rellena los campos
- Verifica que la imagen sea clara y del producto correcto
- Revisa la consola del navegador para errores
- Intenta con otra imagen

### Análisis muy lento
- Es normal que tome 10-20 segundos
- Depende de la conexión a internet
- El tamaño de la imagen también influye

## 📚 Archivos Principales

### `src/lib/services/openai.ts`
Servicio principal que maneja la comunicación con OpenAI API.

**Funciones principales**:
- `analyzeProductImage()`: Analiza imagen y retorna datos del producto
- `enhanceProductImage()`: Placeholder para mejora de imágenes (futuro)

### `src/hooks/useAIProductAnalysis.ts`
Hook personalizado para gestionar el estado del análisis.

**Funciones principales**:
- `analyzeProduct()`: Inicia el análisis de una imagen
- `reset()`: Resetea el estado

### `src/components/admin/AIImageUpload.tsx`
Componente React para subida de imágenes con análisis IA.

**Props**:
- `onImageSelected`: Callback cuando se selecciona imagen
- `onProductDataAnalyzed`: Callback cuando la IA termina el análisis
- `maxSizeMB`: Tamaño máximo de archivo (default: 10MB)

## 🚀 Mejoras Futuras

Posibles mejoras para implementar:

1. **Mejora de imágenes**: Usar DALL-E para mejorar la calidad
2. **Múltiples imágenes**: Analizar varias imágenes del mismo producto
3. **Extracción de texto**: OCR para leer etiquetas de productos
4. **Estimación de precios**: Sugerir precios basados en productos similares
5. **Detección de marca**: Identificar automáticamente la marca
6. **Cache de análisis**: Guardar análisis previos para reducir costos

## 📞 Soporte

Para problemas o sugerencias:
1. Revisa la consola del navegador para errores
2. Verifica los logs del servidor
3. Consulta la [documentación de OpenAI](https://platform.openai.com/docs)

---

**Última actualización**: Octubre 2025
**Versión**: 1.0.0

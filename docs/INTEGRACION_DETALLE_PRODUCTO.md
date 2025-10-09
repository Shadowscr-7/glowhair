# 🎯 Integración de Página de Detalle de Producto

## 📋 Resumen
Esta guía documenta los cambios necesarios para integrar la página de detalle de producto (`src/app/productos/[id]/page.tsx`) con las APIs REST reales.

**Fecha**: Octubre 9, 2025  
**Estado**: ⚠️ **PENDIENTE** (Archivo actual está corrupto, requiere restauración manual)  
**Prioridad**: 🔴 **ALTA** - Completa el flujo de compra del cliente

---

## 🚨 Problema Actual

El archivo `src/app/productos/[id]/page.tsx` está **corrupto** debido a múltiples intentos de edición. 

**Síntomas**:
```
Unterminated string literal in import statement
Cannot find name 'Navbar'
Multiple compilation errors
```

**Solución**: Restaurar archivo desde el commit limpio `17e0461` antes de hacer las modificaciones.

---

## 🎯 Objetivos de la Integración

1. ✅ Fetch product data desde `productsAPI.getById()`
2. ✅ Estados de loading/error profesionales
3. ✅ Integrar `favoritesAPI` para botón de favoritos
4. ✅ Integrar `cartAPI.add()` para agregar al carrito
5. ✅ Mostrar componentes `<ReviewsList>` y `<ReviewForm>`
6. ✅ Adapter pattern para convertir API Product a UI Product

---

## 📝 Modificaciones Necesarias

### 1. Imports (Líneas 1-23)

**Agregar**:
```typescript
import { Loader2, AlertCircle } from "lucide-react";
import { ReviewsList } from "@/components/reviews/ReviewsList";
import { ReviewForm } from "@/components/reviews/ReviewForm";
import { productsAPI, favoritesAPI, cartAPI } from "@/lib/api";
import type { Product as APIProduct } from "@/lib/api";
```

**Remover**:
```typescript
// Ya no se necesita el import de useCallback si no había
```

---

### 2. Funciones Helper (Antes del componente)

**Agregar función getCategoryIcon**:
```typescript
// Helper to select icon based on category
const getCategoryIcon = (categoryName: string) => {
  const lowerCategory = categoryName.toLowerCase();
  if (lowerCategory.includes('shampoo') || lowerCategory.includes('limpieza')) {
    return <ShampooIcon className="w-full h-full" />;
  }
  if (lowerCategory.includes('acondicionador') || lowerCategory.includes('conditioner')) {
    return <ConditionerIcon className="w-full h-full" />;
  }
  if (lowerCategory.includes('mascarilla') || lowerCategory.includes('mask')) {
    return <MaskIcon className="w-full h-full" />;
  }
  if (lowerCategory.includes('serum')) {
    return <SerumIcon className="w-full h-full" />;
  }
  if (lowerCategory.includes('aceite') || lowerCategory.includes('oil')) {
    return <OilIcon className="w-full h-full" />;
  }
  return <ShampooIcon className="w-full h-full" />;
};
```

**Agregar función adaptProductForUI**:
```typescript
// Adapter to convert API product to UI format
const adaptProductForUI = (apiProduct: APIProduct) => {
  const categoryName = typeof apiProduct.category === 'object' 
    ? apiProduct.category.name 
    : apiProduct.category || 'General';
  
  const brandName = typeof apiProduct.brand === 'object'
    ? apiProduct.brand.name
    : apiProduct.brand || 'GlowHair';

  return {
    id: apiProduct.id,
    name: apiProduct.name,
    price: apiProduct.price,
    originalPrice: apiProduct.original_price || undefined,
    rating: 4.5, // Temporal: se puede calcular desde reviews
    reviewCount: 0, // Temporal: se puede obtener desde reviewsAPI
    image: getCategoryIcon(categoryName),
    category: categoryName,
    brand: brandName,
    isNew: false, // Se puede agregar campo en API
    isOnSale: !!apiProduct.original_price && apiProduct.original_price > apiProduct.price,
    description: apiProduct.description,
    detailedDescription: apiProduct.description, // API simple solo tiene description
    ingredients: [] as string[], // API no tiene este campo por ahora
    hairType: [] as string[], // Se puede agregar en API si es necesario
    benefits: [
      "Fórmula premium para cuidado capilar",
      "Ingredientes naturales de alta calidad",
      "Resultados visibles desde el primer uso",
      "Hidratación profunda y duradera",
      "Protección contra el daño ambiental"
    ], // Valores por defecto
    howToUse: [
      "Aplicar sobre cabello húmedo",
      "Masajear suavemente el cuero cabelludo",
      "Dejar actuar 2-3 minutos",
      "Enjuagar con agua tibia",
      "Usar regularmente para mejores resultados"
    ], // Instrucciones por defecto
    size: '300ml', // Valor por defecto
    inStock: apiProduct.stock
  };
};

type UIProduct = ReturnType<typeof adaptProductForUI>;
```

---

### 3. Estado del Componente

**Reemplazar**:
```typescript
const { state: authState, toggleFavorite, isFavorite } = useAuth();
const product = getProductData(params.id as string);
const isProductFavorite = product && authState.isAuthenticated && isFavorite(product.id);
```

**Por**:
```typescript
const { state: authState } = useAuth();
const [product, setProduct] = useState<UIProduct | null>(null);
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);
const [isFavorite, setIsFavorite] = useState(false);
```

---

### 4. Fetch Product (Agregar después del estado)

```typescript
// Fetch product details
const fetchProduct = useCallback(async () => {
  try {
    setLoading(true);
    setError(null);
    
    const apiProduct = await productsAPI.getById(params.id as string);
    const adaptedProduct = adaptProductForUI(apiProduct);
    setProduct(adaptedProduct);
    
    // Check if product is in favorites
    if (authState.isAuthenticated) {
      try {
        const response = await favoritesAPI.check(params.id as string);
        setIsFavorite(response.isFavorite);
      } catch (err) {
        console.error('Error checking favorite status:', err);
      }
    }
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Error al cargar el producto';
    setError(errorMessage);
  } finally {
    setLoading(false);
  }
}, [params.id, authState.isAuthenticated]);

useEffect(() => {
  fetchProduct();
}, [fetchProduct]);
```

---

### 5. Handler de Favoritos

**Reemplazar**:
```typescript
const handleToggleFavorite = () => {
  if (product && authState.isAuthenticated) {
    toggleFavorite(product.id);
  }
};
```

**Por**:
```typescript
const handleToggleFavorite = async () => {
  if (!product || !authState.isAuthenticated) return;
  
  try {
    if (isFavorite) {
      await favoritesAPI.remove(product.id);
      setIsFavorite(false);
    } else {
      await favoritesAPI.add(product.id);
      setIsFavorite(true);
    }
  } catch (err) {
    console.error('Error toggling favorite:', err);
  }
};
```

---

### 6. Estados de Loading y Error

**Agregar ANTES del `if (!product)` existente**:

```typescript
// Loading state
if (loading) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="pt-20 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-glow-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Cargando producto...</p>
        </div>
      </div>
    </div>
  );
}

// Error state
if (error || !product) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="pt-20 flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-md mx-auto px-4">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {error || 'Producto no encontrado'}
          </h2>
          <p className="text-gray-600 mb-6">
            El producto que buscas no existe o ha sido eliminado.
          </p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => router.push('/productos')}
              className="bg-glow-600 text-white px-6 py-3 rounded-lg hover:bg-glow-700 transition-colors"
            >
              Ver Productos
            </button>
            <button
              onClick={fetchProduct}
              className="bg-white text-gray-700 px-6 py-3 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
```

---

### 7. Handler de Add to Cart

**Reemplazar**:
```typescript
const handleAddToCart = async () => {
  setIsAddingToCart(true);
  
  // Convert product to the format expected by cart
  const cartProduct = {
    id: product.id,
    name: product.name,
    price: product.price,
    originalPrice: product.originalPrice,
    image: product.image,
    category: product.category,
    brand: product.brand,
    size: product.size,
    inStock: product.inStock
  };
  
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Add to cart with selected quantity
  addItem(cartProduct, quantity);
  
  setIsAddingToCart(false);
  setShowAddedToCart(true);
  
  // Open cart drawer to show the added item
  setTimeout(() => {
    openCart();
  }, 500);
  
  // Hide success message after 3 seconds
  setTimeout(() => setShowAddedToCart(false), 3000);
};
```

**Por**:
```typescript
const handleAddToCart = async () => {
  if (!product) return;
  
  setIsAddingToCart(true);
  
  try {
    // Add to cart via API
    await cartAPI.add(product.id, quantity);
    
    // Also add to local cart context for immediate UI update
    const cartProduct = {
      id: product.id,
      name: product.name,
      price: product.price,
      originalPrice: product.originalPrice,
      image: product.image,
      category: product.category,
      brand: product.brand,
      size: product.size,
      inStock: product.inStock
    };
    addItem(cartProduct, quantity);
    
    setShowAddedToCart(true);
    
    // Open cart drawer to show the added item
    setTimeout(() => {
      openCart();
    }, 500);
    
    // Hide success message after 3 seconds
    setTimeout(() => setShowAddedToCart(false), 3000);
  } catch (err) {
    console.error('Error adding to cart:', err);
    alert('Error al agregar al carrito. Por favor intenta de nuevo.');
  } finally {
    setIsAddingToCart(false);
  }
};
```

---

### 8. Botón de Favoritos (en el JSX)

**Reemplazar**:
```typescript
<motion.button
  whileHover={{ scale: 1.1 }}
  whileTap={{ scale: 0.9 }}
  onClick={handleToggleFavorite}
  className={`p-4 border rounded-xl transition-all duration-200 ${
    isProductFavorite 
      ? "border-red-500 bg-red-50 text-red-500" 
      : "border-gray-300 hover:bg-gray-50 text-gray-600"
  }`}
>
  <Heart 
    size={20} 
    className={isProductFavorite ? "fill-current" : ""}
  />
</motion.button>
```

**Por**:
```typescript
<motion.button
  whileHover={{ scale: 1.1 }}
  whileTap={{ scale: 0.9 }}
  onClick={handleToggleFavorite}
  disabled={!authState.isAuthenticated}
  className={`p-4 border rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
    isFavorite 
      ? "border-red-500 bg-red-50 text-red-500" 
      : "border-gray-300 hover:bg-gray-50 text-gray-600"
  }`}
  title={!authState.isAuthenticated ? "Inicia sesión para guardar favoritos" : ""}
>
  <Heart 
    size={20} 
    className={isFavorite ? "fill-current" : ""}
  />
</motion.button>
```

---

### 9. Tab de Reviews (en el JSX)

**Reemplazar**:
```typescript
{selectedTab === "reviews" && (
  <div>
    <h3 className="text-xl font-semibold text-gray-900 mb-4">
      Reseñas de Clientes
    </h3>
    <p className="text-gray-600">
      Las reseñas se cargarán próximamente...
    </p>
  </div>
)}
```

**Por**:
```typescript
{selectedTab === "reviews" && (
  <div className="space-y-8">
    {/* Review Form - Only if authenticated */}
    {authState.isAuthenticated && (
      <div>
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          Escribe tu reseña
        </h3>
        <ReviewForm productId={product.id} />
      </div>
    )}
    
    {/* Reviews List */}
    <div>
      <h3 className="text-xl font-semibold text-gray-900 mb-4">
        Reseñas de Clientes
      </h3>
      <ReviewsList productId={product.id} />
    </div>
  </div>
)}
```

---

### 10. HairType Section (opcional - solo si existe en el archivo original)

**Envolver en condicional**:
```typescript
{/* Hair Type - Only show if available */}
{product.hairType && product.hairType.length > 0 && (
  <div>
    <p className="text-sm font-medium text-gray-700 mb-2">Ideal para:</p>
    <div className="flex flex-wrap gap-2">
      {product.hairType.map((type: string) => (
        <span
          key={type}
          className="px-3 py-1 bg-glow-100 text-glow-700 text-sm rounded-full"
        >
          {type}
        </span>
      ))}
    </div>
  </div>
)}
```

---

## ✅ Verificación Final

Después de hacer los cambios, verifica:

1. **Compilación**: `npm run build` (o verificar errores en VS Code)
2. **TypeScript**: 0 errores
3. **Funcionalidad**:
   - ✅ Página carga product desde API
   - ✅ Loading spinner aparece durante carga
   - ✅ Error state muestra mensaje + botón reintentar
   - ✅ Botón favorito funciona (solo si autenticado)
   - ✅ Add to cart llama a `cartAPI.add()`
   - ✅ Tab Reviews muestra `ReviewsList` y `ReviewForm`
   - ✅ Todos los íconos se seleccionan automáticamente por categoría

---

## 🎯 Resultados Esperados

### Métricas
- **Líneas modificadas**: ~150 líneas
- **Nuevas funciones**: 2 (getCategoryIcon, adaptProductForUI)
- **Nuevos estados**: 3 (loading, error, isFavorite)
- **APIs integradas**: 3 (productsAPI, favoritesAPI, cartAPI)
- **Componentes agregados**: 2 (ReviewsList, ReviewForm)

### Funcionalidades
1. ✅ **Fetch real** desde Supabase
2. ✅ **Loading state** profesional
3. ✅ **Error handling** con retry
4. ✅ **Favoritos** sincronizados con API
5. ✅ **Carrito** integrado con API
6. ✅ **Reviews** completamente funcionales
7. ✅ **Íconos dinámicos** por categoría

---

## 🚀 Próximo Paso

Después de completar esta integración, continuar con:

**Página de Carrito** (`src/app/carrito/page.tsx`)
- Integrar `cartAPI.get()` para listar items
- Integrar `cartAPI.update()` para cambiar cantidades
- Integrar `cartAPI.remove()` para eliminar items
- Integrar `cartAPI.getTotal()` para totales
- Ver: `docs/GUIA_INTEGRACION_APIS.md` sección 3

---

## 📚 Referencias

- **Archivo creado**: `d:\Proyecto\glowhair\src\app\productos\[id]\page_integrated.tsx` (archivo limpio completo con todas las modificaciones)
- **Helper API**: `src/lib/api.ts`
- **Componentes Reviews**: `src/components/reviews/ReviewsList.tsx`, `ReviewForm.tsx`
- **Guía completa**: `docs/GUIA_INTEGRACION_APIS.md`
- **Commit limpio**: `17e0461` (antes de la corrupción)

---

**Autor**: GitHub Copilot  
**Proyecto**: GlowHair E-commerce  
**Estado**: ⚠️ Requiere acción manual para restaurar y aplicar cambios

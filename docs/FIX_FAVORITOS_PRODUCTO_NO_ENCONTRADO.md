# 🐛 Fix: Error "Producto no encontrado" en Favoritos

## 📝 Problema

Al intentar agregar productos a favoritos desde la lista de productos, se presentaba el error:

```
Error: Producto no encontrado
POST /api/favorites → 404
```

## 🔍 Causa Raíz

La página de productos (`/productos`) muestra una combinación de:
1. **Productos reales de la API** (con UUIDs válidos)
2. **Productos mock/fallback** (con IDs simples: "1", "2", "3", etc.)

Cuando un usuario intentaba agregar un producto mock a favoritos, la API buscaba ese ID en la base de datos de Supabase y no lo encontraba, resultando en un error 404.

## ✅ Solución Implementada

### 1. **Validación de UUID en ProductCard**

Se agregó validación para verificar que el producto tenga un UUID válido antes de intentar agregarlo a favoritos:

```typescript
// Verificar si el ID del producto es un UUID válido (productos de la API)
const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
if (!uuidRegex.test(product.id)) {
  console.warn('⚠️ Producto mock/local no se puede agregar a favoritos:', product.id);
  alert('Este producto no está disponible para agregar a favoritos. Solo los productos de la tienda pueden ser favoritos.');
  return;
}
```

**Archivo:** `src/components/product/ProductCard.tsx`

### 2. **Mejoras en Logging**

Se agregaron logs detallados en varios puntos:

#### API Endpoint (`src/app/api/favorites/route.ts`):
```typescript
console.log('🔖 POST /api/favorites - Request:', { userId, product_id: body.product_id });
console.log('🔍 Product search result:', { product, productError });
console.error('❌ Producto no encontrado:', body.product_id, productError);
```

#### Hook useFavorites (`src/hooks/useFavorites.ts`):
```typescript
console.log('➕ Agregando a favoritos:', productId);
console.log('✅ Favorito agregado:', data);
console.error('❌ Error del servidor:', error);
```

#### ProductCard (`src/components/product/ProductCard.tsx`):
```typescript
console.log('❤️ Toggle favorito para producto:', { id, name, isFavorite });
console.log('✅ Favorito actualizado correctamente');
console.error('❌ Error al actualizar favorito:', error);
```

### 3. **Mensajes de Error Mejorados**

Se mejoró la respuesta de error de la API para incluir más detalles:

```typescript
return NextResponse.json(
  { 
    error: 'Producto no encontrado en la base de datos',
    product_id: body.product_id,
    details: productError?.message
  },
  { status: 404 }
);
```

## 🎯 Comportamiento Actual

### Productos de la API (UUID válido):
✅ **Formato:** `550e8400-e29b-41d4-a716-446655440000`
✅ **Acción:** Se puede agregar/quitar de favoritos
✅ **Resultado:** Funciona correctamente

### Productos Mock (ID simple):
❌ **Formato:** `"1"`, `"2"`, `"product-123"`
⚠️ **Acción:** Se detecta y previene el intento
📢 **Mensaje:** "Este producto no está disponible para agregar a favoritos. Solo los productos de la tienda pueden ser favoritos."

## 🔄 Flujo de Validación

```
Usuario hace click en ❤️
       ↓
¿Usuario autenticado?
       ↓ No → Redirigir a /login
       ↓ Sí
¿ID es UUID válido?
       ↓ No → Mostrar alerta y cancelar
       ↓ Sí
¿Producto existe en DB?
       ↓ No → Error 404
       ↓ Sí
¿Ya está en favoritos?
       ↓ Sí → Eliminar (DELETE)
       ↓ No → Agregar (POST)
       ↓
Actualizar UI ✅
```

## 📊 Logs de Debug

Para facilitar el debug, ahora se pueden ver logs en la consola del navegador:

```
❤️ Toggle favorito para producto: { id: "...", name: "...", isFavorite: false }
➕ Agregando a favoritos: 550e8400-e29b-41d4-a716-446655440000
🔖 POST /api/favorites - Request: { userId: "temp-user-id", product_id: "..." }
🔍 Product search result: { product: {...}, productError: null }
✅ Favorito agregado: { id: "...", created_at: "...", product: {...} }
✅ Favorito actualizado correctamente
```

En caso de error:
```
❤️ Toggle favorito para producto: { id: "1", name: "...", isFavorite: false }
⚠️ Producto mock/local no se puede agregar a favoritos: 1
```

## 🚀 Recomendaciones

### Para Desarrollo:
1. **Usar solo productos de la API** en la página de productos
2. **Eliminar productos mock** una vez que haya suficientes productos reales
3. **Seed de datos** para desarrollo con productos reales en Supabase

### Para Producción:
1. **Cargar productos desde la API** exclusivamente
2. **Implementar paginación** para manejar muchos productos
3. **Cache** de productos favoritos para mejor performance
4. **Optimistic UI updates** para mejor UX

## 🛠️ Archivos Modificados

- ✅ `src/components/product/ProductCard.tsx`
- ✅ `src/hooks/useFavorites.ts`
- ✅ `src/app/api/favorites/route.ts`

## ✨ Beneficios

1. **Prevención proactiva** de errores
2. **Mensajes claros** para el usuario
3. **Debugging facilitado** con logs detallados
4. **Mejor UX** con validaciones antes de llamadas API
5. **Código más robusto** y mantenible

## 🎉 Estado

✅ **RESUELTO** - Los usuarios ahora solo pueden agregar a favoritos productos que existen realmente en la base de datos.

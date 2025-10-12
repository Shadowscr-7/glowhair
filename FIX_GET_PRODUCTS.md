# 🔧 FIX: Error 400 en GET /api/products

## ❌ Problema

```
GET /api/products?limit=50&offset=0&sort_by=featured
Status: 400 Bad Request
```

## 🔍 Causas Posibles

1. **RLS bloqueando consultas** (usando anon key en lugar de admin key)
2. **Falta `count: 'exact'`** en la query de Supabase para paginación
3. **Parámetro `sort_by`** vs `sortBy` (inconsistencia en nombres)

## ✅ Soluciones Implementadas

### 1. Usar `supabaseAdmin` en el servicio

```typescript
// ANTES ❌
let query = supabase.from('glowhair_products')

// AHORA ✅
const client = supabaseAdmin || supabase;
let query = client.from('glowhair_products')
```

### 2. Agregar `count: 'exact'` para paginación

```typescript
// ANTES ❌
.select(`
  *,
  category:glowhair_categories(id, name),
  brand:glowhair_brands(id, name)
`)

// AHORA ✅
.select(`
  *,
  category:glowhair_categories(id, name),
  brand:glowhair_brands(id, name)
`, { count: 'exact' })  // Permite obtener el total de registros
```

### 3. Aceptar ambos formatos de parámetro

```typescript
// Acepta tanto sortBy como sort_by
sortBy: searchParams.get('sortBy') || searchParams.get('sort_by') || 'featured'
```

### 4. Logging Completo

Agregado en ambos niveles:
- ✅ API Route (`/api/products`)
- ✅ Service (`productService.getProducts`)

## 📊 Logs Esperados

### ✅ Éxito:

**Terminal del servidor:**
```
🔵 GET /api/products - Inicio
📦 Filtros recibidos: {
  sortBy: 'featured',
  page: 1,
  limit: 50,
  ...
}
🔵 productService.getProducts - Inicio
📦 Filtros: { sortBy: 'featured', ... }
📊 Respuesta de Supabase:
  - Data: 1 productos
  - Count: 1
  - Error: null
✅ Productos obtenidos exitosamente
📥 Resultado del servicio: { success: true, hasData: true }
✅ Productos obtenidos exitosamente
```

### ❌ Si Falla:

```
🔵 GET /api/products - Inicio
🔵 productService.getProducts - Inicio
📊 Respuesta de Supabase:
  - Data: null
  - Count: null
  - Error: { code: '42P01', message: '...' }
❌ Error de Supabase: ...
❌ Error en getProducts: ...
```

## 🧪 PROBAR AHORA

### 1. Reiniciar el servidor
```bash
# Ctrl + C
npm run dev
```

### 2. Probar el endpoint

**Opción A: En el navegador**
```
http://localhost:3000/api/products?limit=50&sort_by=featured
```

**Opción B: Con curl/Postman**
```bash
curl http://localhost:3000/api/products?limit=50&offset=0&sort_by=featured
```

### 3. Verificar respuesta

Deberías recibir:
```json
{
  "data": [
    {
      "id": "...",
      "name": "Deluxe Liss Cacao...",
      "price": 1500,
      "category": {
        "id": "...",
        "name": "..."
      },
      ...
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 50,
  "totalPages": 1
}
```

### 4. Verificar logs en terminal

Busca los emojis:
- 🔵 Inicio de request
- 📦 Filtros recibidos
- 📊 Respuesta de Supabase
- ✅ Éxito

## 🔍 SI AÚN FALLA

### Verificar Service Role Key

```bash
# En .env.local, debe existir:
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIs...
```

### Verificar que hay productos en la BD

```sql
SELECT COUNT(*) FROM glowhair_products WHERE is_active = true;
```

Si retorna 0, no hay productos activos.

### Verificar políticas RLS

```sql
-- Ver políticas de productos
SELECT policyname, cmd, qual
FROM pg_policies
WHERE tablename = 'glowhair_products';
```

Si están mal configuradas, ejecuta `fix_rls_products.sql`.

## 📁 Archivos Modificados

- ✅ `src/app/api/products/route.ts`
  - Agregado logging detallado
  - Acepta `sort_by` y `sortBy`

- ✅ `src/lib/services/products.ts`
  - Usa `supabaseAdmin` para bypasear RLS
  - Agregado `{ count: 'exact' }` en la query
  - Logging completo en cada paso

## 🎯 Beneficios

1. ✅ **Bypasea RLS** - Admin key ignora políticas restrictivas
2. ✅ **Paginación correcta** - Count exact permite calcular totalPages
3. ✅ **Flexible** - Acepta diferentes formatos de parámetros
4. ✅ **Debuggeable** - Logging completo identifica problemas fácilmente
5. ✅ **Consistente** - Todos los servicios admin usan supabaseAdmin

## 📝 Parámetros Soportados

| Parámetro | Tipo | Descripción | Ejemplo |
|-----------|------|-------------|---------|
| `limit` | number | Productos por página | `?limit=50` |
| `page` | number | Número de página | `?page=2` |
| `offset` | number | Desplazamiento (alternativa a page) | `?offset=10` |
| `sort_by` o `sortBy` | string | Ordenamiento | `?sort_by=featured` |
| `category` | string | Filtrar por categoría ID | `?category=abc-123` |
| `brand` | string | Filtrar por marca ID | `?brand=def-456` |
| `search` | string | Búsqueda por nombre/descripción | `?search=gel` |
| `minPrice` | number | Precio mínimo | `?minPrice=100` |
| `maxPrice` | number | Precio máximo | `?maxPrice=5000` |

## 🚀 Opciones de Ordenamiento

- `featured` - Destacados primero (default)
- `price-low` - Precio ascendente
- `price-high` - Precio descendente
- `rating` - Mejor calificación
- `newest` - Más recientes
- `name` - Alfabético

---

**Estado:** ✅ Implementado  
**Próximo paso:** Probar en navegador  
**Última actualización:** 2025-10-12

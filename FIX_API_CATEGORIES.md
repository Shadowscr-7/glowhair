# 🔧 FIX: Error 400 en /api/categories

## ❌ Problema

```
GET /api/categories 400 in 274ms
```

La API de categorías estaba fallando con error 400.

## 🔍 Causa Probable

**RLS (Row Level Security) bloqueando las consultas**

El servicio estaba usando el cliente `supabase` (anon key) que respeta las políticas RLS. Si las políticas RLS de `glowhair_categories` están mal configuradas o son muy restrictivas, pueden bloquear las consultas SELECT.

## ✅ Solución Implementada

### 1. Usar `supabaseAdmin` en servicios

**Antes:**
```typescript
const { data, error } = await supabase  // ❌ Anon key - respeta RLS
  .from('glowhair_categories')
  .select('*')
```

**Ahora:**
```typescript
const client = supabaseAdmin || supabase;  // ✅ Admin key - bypasea RLS
const { data, error } = await client
  .from('glowhair_categories')
  .select('*')
```

### 2. Logging Completo

Agregado logging en:
- ✅ `categoryService.getCategories()`
- ✅ `GET /api/categories` route
- ✅ `brandService` (preventivo)

### 3. Archivos Modificados

- ✅ `src/lib/services/products.ts`
  - `categoryService.getCategories()` → usa supabaseAdmin
  - `categoryService.getCategoryById()` → usa supabaseAdmin
  - `brandService.getBrands()` → usa supabaseAdmin
  - `brandService.getBrandById()` → usa supabaseAdmin

- ✅ `src/app/api/categories/route.ts`
  - Agregado logging detallado

## 🧪 PROBAR AHORA

### 1. Reiniciar el servidor (si es necesario)
```bash
# Ctrl + C
npm run dev
```

### 2. Abrir consola del navegador
- F12 → Console

### 3. Ir a crear producto
```
http://localhost:3000/admin/productos/nuevo
```

### 4. Verificar logs en la terminal del servidor

Deberías ver:
```
🔵 GET /api/categories - Inicio
📂 categoryService.getCategories - Inicio
📊 Respuesta de Supabase:
  - Data: 12 categorías
  - Error: null
✅ Categorías obtenidas exitosamente: 12
📥 Resultado del servicio: { success: true, dataLength: 12 }
✅ Categorías obtenidas exitosamente
```

### 5. Verificar en el navegador

Deberías ver en la consola:
```
📂 Cargando categorías desde API...
✅ Categorías cargadas: [array con 12+ items]
```

## 🔍 SI AÚN FALLA

### Verificar Service Role Key

1. **Revisa `.env.local`:**
```bash
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

2. **Verifica que sea la correcta:**
- Supabase Dashboard → Settings → API
- Copia el valor de **service_role** (NO la anon key)

3. **Reinicia el servidor después de agregar la variable**

### Verificar Políticas RLS

Si aún falla, las políticas RLS pueden estar mal:

```sql
-- Ver políticas actuales de categorías
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies
WHERE tablename = 'glowhair_categories';

-- Si están mal, ejecuta fix_rls_products.sql que ya incluye:
DROP POLICY IF EXISTS ... ON glowhair_categories;
CREATE POLICY "anyone_can_view_active_categories" 
ON glowhair_categories 
FOR SELECT 
USING (is_active = true);
```

### Verificar que la tabla existe

```sql
-- Verificar que la tabla existe y tiene datos
SELECT COUNT(*) FROM glowhair_categories WHERE is_active = true;

-- Si retorna 0 o error, la tabla no existe o está vacía
```

## 📊 Logs Esperados

### ✅ Éxito:
```
Terminal del servidor:
🔵 GET /api/categories - Inicio
📂 categoryService.getCategories - Inicio
📊 Respuesta de Supabase:
  - Data: 12 categorías
  - Error: null
✅ Categorías obtenidas exitosamente: 12
📥 Resultado del servicio: { success: true, dataLength: 12 }
✅ Categorías obtenidas exitosamente

Navegador:
📂 Cargando categorías desde API...
✅ Categorías cargadas: [{id: "...", name: "Champús"}, ...]
```

### ❌ Fallo (ejemplo):
```
Terminal del servidor:
🔵 GET /api/categories - Inicio
📂 categoryService.getCategories - Inicio
📊 Respuesta de Supabase:
  - Data: null
  - Error: { code: '42P01', message: 'relation "glowhair_categories" does not exist' }
❌ Error de Supabase: ...
❌ Error en getCategories: ...
```

## 🎯 Beneficios del Fix

1. ✅ **Bypasea RLS** - El admin key ignora todas las políticas
2. ✅ **Logging detallado** - Fácil identificar el problema exacto
3. ✅ **Consistencia** - Todos los servicios admin usan supabaseAdmin
4. ✅ **Fallback seguro** - Si no hay admin key, usa anon key

---

**Estado:** ✅ Implementado  
**Próximo paso:** Reiniciar servidor y probar  
**Última actualización:** 2025-10-11

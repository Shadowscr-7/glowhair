# 🔧 Fix UUID en Sistema de Fa## 📝 Archivos Modificados

1. **src/app/api/favorites/route.ts**
   - GET endpoint (línea 10)
   - POST endpoint (línea 93)
   - DELETE endpoint (línea 192)

2. **src/app/api/favorites/[id]/route.ts**
   - DELETE endpoint (línea 13)

3. **src/app/api/favorites/count/route.ts** ⭐ NUEVO
   - GET endpoint (línea 10)
   - También corregido: `favorites` → `glowhair_favorites`

4. **src/hooks/useFavorites.ts**
   - fetchFavorites (línea 26)
   - addFavorite (línea 65)
   - removeFavorite (línea 123)

5. **src/app/productos/[id]/hooks/useFavorite.ts**
   - checkFavorite (línea 14)
   - DELETE request (línea 44)
   - POST request (línea 57)

6. **src/lib/api.ts** ⭐ NUEVO
   - fetchAPI helper (línea 29)
   - Usado por `favoritesAPI.getAll()` y otros métodosblema Encontrado

La tabla `glowhair_favorites` en Supabase tiene `user_id` como tipo **UUID**, pero el código estaba enviando `'temp-user-id'` (string) causando errores de tipo de dato.

```sql
-- Estructura real de la tabla
create table public.glowhair_favorites (
  id uuid not null default gen_random_uuid(),
  user_id uuid not null,  -- ⚠️ UUID, no TEXT
  product_id uuid null,
  created_at timestamp with time zone null default now(),
  constraint glowhair_favorites_pkey primary key (id),
  constraint glowhair_favorites_user_id_product_id_key unique (user_id, product_id),
  constraint glowhair_favorites_product_id_fkey foreign key (product_id) 
    references glowhair_products (id) on delete cascade
);
```

## ✅ Solución Implementada

### UUID Temporal para Desarrollo

Se reemplazó `'temp-user-id'` con un UUID válido en todos los archivos:

```typescript
const userId = request.headers.get('x-user-id') || '00000000-0000-0000-0000-000000000001';
```

### Archivos Modificados

1. **src/app/api/favorites/route.ts**
   - GET endpoint (línea 10)
   - POST endpoint (línea 93)
   - DELETE endpoint (línea 192)

2. **src/app/api/favorites/[id]/route.ts**
   - DELETE endpoint (línea 13)

3. **src/hooks/useFavorites.ts**
   - fetchFavorites (línea 26)
   - addFavorite (línea 65)
   - removeFavorite (línea 123)

4. **src/app/productos/[id]/hooks/useFavorite.ts**
   - checkFavorite (línea 14)
   - DELETE request (línea 44)
   - POST request (línea 57)

## 🔄 Siguientes Pasos

### Para Producción

Cuando implementes autenticación real, reemplaza el UUID temporal con el ID del usuario autenticado:

```typescript
// ❌ Desarrollo (actual)
const userId = request.headers.get('x-user-id') || '00000000-0000-0000-0000-000000000001';

// ✅ Producción (con Supabase Auth)
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(url, key);
const { data: { user } } = await supabase.auth.getUser();
const userId = user?.id || null; // UUID real del usuario
```

### Hooks del Cliente

En los hooks, obtener el user_id del contexto de autenticación:

```typescript
// src/hooks/useFavorites.ts
import { useAuth } from '@/context/AuthContext';

export const useFavorites = () => {
  const { user } = useAuth(); // Obtener usuario del contexto
  
  const fetchFavorites = async () => {
    const response = await fetch('/api/favorites', {
      headers: {
        'x-user-id': user?.id || '00000000-0000-0000-0000-000000000001',
      },
    });
    // ...
  };
};
```

## 🧪 Testing

### Verificar que funciona:

1. **Agregar a favoritos:**
   ```bash
   # Ver logs en consola del navegador
   # Debe mostrar: ✅ Favorito creado exitosamente
   ```

2. **Verificar en Supabase:**
   ```sql
   SELECT * FROM glowhair_favorites 
   WHERE user_id = '00000000-0000-0000-0000-000000000001';
   ```

3. **Quitar de favoritos:**
   ```bash
   # Debe eliminar correctamente
   # Navbar counter debe decrementar
   ```

## 📝 Notas Adicionales

### Ventajas del UUID Temporal

✅ Permite desarrollo sin sistema de autenticación  
✅ Todos los favoritos se asocian al mismo usuario de prueba  
✅ Fácil de testear y debuggear  
✅ Compatible con el tipo de dato UUID de PostgreSQL

### Por qué no verificamos si el producto existe

Para evitar **RLS infinite recursion**, eliminamos la verificación del producto en el POST endpoint:

```typescript
// ❌ ANTES (causaba RLS recursion)
const { data: product } = await supabase
  .from('glowhair_products')
  .select('id, name')
  .eq('id', body.product_id);

// ✅ AHORA (confía en foreign key constraint)
// PostgreSQL verifica automáticamente que el producto existe
// gracias al constraint:
// FOREIGN KEY (product_id) REFERENCES glowhair_products(id)
```

### Ventajas de este enfoque:

✅ Sin RLS recursion  
✅ Más rápido (una query menos)  
✅ La base de datos garantiza integridad referencial  
✅ Error de foreign key constraint es más claro

## 🚀 Estado Actual

- ✅ UUID válido en todos los endpoints
- ✅ UUID válido en todos los hooks
- ✅ Sin verificación de producto (evita RLS recursion)
- ✅ Foreign key constraint garantiza integridad
- ✅ Respuesta simplificada (sin JOIN a productos)
- ⏳ **Listo para testing**

## 🔐 Migración a Producción

### Checklist:

- [ ] Implementar Supabase Auth
- [ ] Crear AuthContext con user.id
- [ ] Actualizar todos los endpoints para usar auth.uid()
- [ ] Actualizar hooks para usar user.id del contexto
- [ ] Actualizar RLS policies (USING (user_id = auth.uid()))
- [ ] Eliminar UUID temporal
- [ ] Testing con múltiples usuarios

---

**Fecha:** 12 de Octubre 2025  
**Estado:** ✅ Completado - Listo para testing  
**Siguiente:** Probar agregar/quitar favoritos

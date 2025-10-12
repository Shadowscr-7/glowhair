# 🚨 Solución: Error al Agregar Favoritos

## 🔍 Problema Detectado

```
❌ Error del servidor: {}
Status: 500 Internal Server Error
```

Este error indica que la **tabla `favorites` no existe** en Supabase o hay un problema de permisos.

## ✅ Solución Rápida

### **Paso 1: Crear la tabla en Supabase**

1. Ve a tu proyecto en [Supabase Dashboard](https://app.supabase.com)
2. Navega a **SQL Editor**
3. Crea una nueva query
4. Copia y pega el contenido del archivo `setup_favorites_table.sql`
5. Haz click en **Run** o presiona `Ctrl/Cmd + Enter`

### **Paso 2: Verificar la creación**

Ejecuta esta query para verificar:

```sql
SELECT 
    table_name, 
    column_name, 
    data_type 
FROM information_schema.columns 
WHERE table_name = 'favorites'
ORDER BY ordinal_position;
```

Deberías ver:

| table_name | column_name | data_type |
|------------|-------------|-----------|
| favorites  | id          | uuid      |
| favorites  | user_id     | text      |
| favorites  | product_id  | uuid      |
| favorites  | created_at  | timestamp with time zone |

### **Paso 3: Verificar políticas RLS**

```sql
SELECT 
    schemaname, 
    tablename, 
    policyname, 
    permissive, 
    roles, 
    cmd 
FROM pg_policies 
WHERE tablename = 'favorites';
```

## 📋 Estructura de la Tabla

```sql
CREATE TABLE public.favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    product_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    
    CONSTRAINT favorites_user_product_unique 
        UNIQUE (user_id, product_id),
    
    CONSTRAINT favorites_product_id_fkey 
        FOREIGN KEY (product_id) 
        REFERENCES public.products(id) 
        ON DELETE CASCADE
);
```

## 🔐 Permisos Necesarios

La tabla necesita estos permisos:

```sql
-- RLS Habilitado
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

-- Permisos para authenticated users
GRANT SELECT, INSERT, DELETE ON public.favorites TO authenticated;

-- Permisos para service_role (API)
GRANT ALL ON public.favorites TO service_role;
```

## 🧪 Probar la Tabla

Después de crear la tabla, prueba con esta query:

```sql
-- Insertar un favorito de prueba
INSERT INTO public.favorites (user_id, product_id)
SELECT 
    'test-user-123' as user_id,
    id as product_id
FROM public.products
LIMIT 1;

-- Ver favoritos
SELECT * FROM public.favorites;

-- Limpiar datos de prueba
DELETE FROM public.favorites WHERE user_id = 'test-user-123';
```

## 🔄 Verificar en la Aplicación

Después de crear la tabla:

1. Recarga la página de productos
2. Intenta agregar un producto a favoritos
3. Revisa la consola del navegador - deberías ver:
   ```
   ➕ Agregando a favoritos: [uuid]
   📡 Response status: 201 Created
   ✅ Favorito agregado: { id: "...", ... }
   ```

## 🐛 Si Aún Hay Errores

### Error: "relation 'favorites' does not exist"

**Solución:**
- La tabla no se creó correctamente
- Ejecuta el script SQL nuevamente
- Verifica que estás conectado al proyecto correcto

### Error: "permission denied for table favorites"

**Solución:**
```sql
-- Dar permisos al service_role
GRANT ALL ON public.favorites TO service_role;

-- Verificar que RLS está habilitado
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
```

### Error: "duplicate key value violates unique constraint"

**Solución:**
- El producto ya está en favoritos
- Este es el comportamiento esperado
- La API devuelve 400 Bad Request con mensaje apropiado

## 📊 Monitoreo de Favoritos

Query para ver estadísticas:

```sql
SELECT 
    COUNT(*) as total_favoritos,
    COUNT(DISTINCT user_id) as usuarios_con_favoritos,
    COUNT(DISTINCT product_id) as productos_favoriteados,
    MAX(created_at) as ultimo_favorito
FROM public.favorites;
```

Top productos más favoriteados:

```sql
SELECT 
    p.name,
    p.slug,
    COUNT(f.id) as veces_favoriteado
FROM public.favorites f
JOIN public.products p ON f.product_id = p.id
GROUP BY p.id, p.name, p.slug
ORDER BY veces_favoriteado DESC
LIMIT 10;
```

## 🎯 Checklist de Verificación

- [ ] Tabla `favorites` creada en Supabase
- [ ] Índices creados correctamente
- [ ] RLS habilitado
- [ ] Políticas de seguridad configuradas
- [ ] Permisos otorgados a service_role
- [ ] Foreign key a `products` funciona
- [ ] Constraint único funciona
- [ ] La aplicación puede insertar favoritos
- [ ] La aplicación puede eliminar favoritos
- [ ] El contador en navbar se actualiza

## 📚 Archivos Relacionados

- `setup_favorites_table.sql` - Script de creación de tabla
- `src/app/api/favorites/route.ts` - API endpoints
- `src/app/api/favorites/[id]/route.ts` - Delete específico
- `src/hooks/useFavorites.ts` - Hook de favoritos
- `docs/FAVORITOS_INTEGRADOS.md` - Documentación completa

## 🆘 Soporte

Si el problema persiste:

1. Verifica los logs en Supabase:
   - Dashboard → Logs → Postgres Logs
   
2. Verifica la conexión a Supabase:
   - Revisa `NEXT_PUBLIC_SUPABASE_URL` en `.env.local`
   - Revisa `SUPABASE_SERVICE_ROLE_KEY` en `.env.local`

3. Verifica que la tabla `products` existe:
   ```sql
   SELECT COUNT(*) FROM public.products;
   ```

## ✅ Estado Esperado

Después de aplicar la solución, deberías poder:
- ✅ Agregar productos a favoritos
- ✅ Ver el contador en el navbar
- ✅ Eliminar productos de favoritos
- ✅ Ver los favoritos sincronizados en toda la aplicación

---

**Última actualización:** 12 de octubre, 2025

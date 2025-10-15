# 🔴 ERROR: Recursión Infinita en RLS Policies - SOLUCIÓN

## 📋 Historial de Errores

### Error #1: ✅ RESUELTO
```
column glowhair_products.image does not exist
→ CAUSA: Columna se llama 'images' (plural)
→ FIX: Cambiar image → images en API y frontend
```

### Error #2: 🔴 ACTUAL
```
infinite recursion detected in policy for relation "glowhair_profiles"
→ CAUSA: Política RLS con referencia circular
→ FIX: Simplificar políticas RLS
```

---

## 🔍 ¿Qué es la Recursión Infinita en RLS?

Row Level Security (RLS) en PostgreSQL permite controlar qué filas puede ver/modificar cada usuario. Pero si una política hace referencia a la misma tabla que está protegiendo, puede crear un **ciclo infinito**.

### Ejemplo de Política MALA (❌ Causa Recursión):
```sql
CREATE POLICY "recursiva_mala" 
ON glowhair_profiles
FOR SELECT 
USING (
  id IN (
    SELECT user_id 
    FROM glowhair_profiles  -- ⚠️ Referencia circular!
    WHERE is_active = true
  )
);
```

**¿Por qué falla?**
1. Usuario intenta hacer SELECT en `glowhair_profiles`
2. PostgreSQL evalúa la política RLS
3. La política necesita hacer SELECT en `glowhair_profiles` (la misma tabla)
4. PostgreSQL evalúa la política RLS otra vez...
5. **Loop infinito** → Error `42P17`

### Ejemplo de Política BUENA (✅ Sin Recursión):
```sql
CREATE POLICY "simple_buena" 
ON glowhair_profiles
FOR SELECT 
USING (true);  -- O: auth.uid() = id
```

---

## 🛠️ Solución Paso a Paso

### Paso 1: Diagnosticar el Problema

Ve a **Supabase Dashboard** → **SQL Editor** y ejecuta:

```sql
-- Ver todas las políticas actuales
SELECT 
    tablename,
    policyname,
    cmd,
    qual
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename LIKE 'glowhair_%'
ORDER BY tablename, policyname;
```

Busca políticas que contengan:
- Subqueries con `SELECT ... FROM glowhair_profiles`
- JOINs con la misma tabla
- Funciones que referencien la tabla protegida

### Paso 2: Deshabilitar RLS Temporalmente

```sql
-- SOLO para desarrollo/testing
ALTER TABLE glowhair_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE glowhair_products DISABLE ROW LEVEL SECURITY;
ALTER TABLE glowhair_favorites DISABLE ROW LEVEL SECURITY;
```

**⚠️ ADVERTENCIA:** Esto hace que TODOS los usuarios puedan acceder a TODO.  
**Solo usar en desarrollo local.**

### Paso 3: Probar la Aplicación

1. Recarga `http://localhost:3000/api/favorites` en el navegador
2. Si **ahora funciona** → El problema era RLS ✅
3. Si **sigue fallando** → Hay otro problema

### Paso 4: Limpiar Políticas Existentes

```sql
-- Eliminar TODAS las políticas problemáticas
DO $$ 
DECLARE 
    r RECORD;
BEGIN
    FOR r IN (
        SELECT policyname, tablename 
        FROM pg_policies 
        WHERE schemaname = 'public' 
          AND tablename IN ('glowhair_profiles', 'glowhair_products', 'glowhair_favorites')
    )
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I', r.policyname, r.tablename);
    END LOOP;
END $$;
```

### Paso 5: Crear Políticas Simples y Seguras

```sql
-- =============================================
-- POLÍTICAS PARA DESARROLLO (Permisivas)
-- =============================================

-- glowhair_profiles
ALTER TABLE glowhair_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "dev_profiles_all" 
ON glowhair_profiles 
FOR ALL 
USING (true);

-- glowhair_products
ALTER TABLE glowhair_products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "dev_products_all" 
ON glowhair_products 
FOR ALL 
USING (true);

-- glowhair_favorites
ALTER TABLE glowhair_favorites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "dev_favorites_all" 
ON glowhair_favorites 
FOR ALL 
USING (true);
```

### Paso 6: Verificar Configuración

```sql
-- Debe mostrar 1 política por tabla
SELECT 
    tablename,
    COUNT(*) as num_policies
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename LIKE 'glowhair_%'
GROUP BY tablename;

-- Resultado esperado:
-- glowhair_profiles  | 1
-- glowhair_products  | 1
-- glowhair_favorites | 1
```

---

## 🎯 Políticas para Producción

⚠️ **Las políticas actuales son INSEGURAS para producción.**

### Cuando implementes autenticación real, usar:

```sql
-- =============================================
-- POLÍTICAS PARA PRODUCCIÓN (Restrictivas)
-- =============================================

-- Solo cada usuario puede ver/editar su propio perfil
DROP POLICY IF EXISTS "dev_profiles_all" ON glowhair_profiles;

CREATE POLICY "profiles_select_own" 
ON glowhair_profiles 
FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "profiles_update_own" 
ON glowhair_profiles 
FOR UPDATE 
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Todos pueden ver productos, solo admins modifican
DROP POLICY IF EXISTS "dev_products_all" ON glowhair_products;

CREATE POLICY "products_select_all" 
ON glowhair_products 
FOR SELECT 
USING (true);

CREATE POLICY "products_modify_admin" 
ON glowhair_products 
FOR ALL
USING (
  auth.uid() IN (
    SELECT id FROM glowhair_profiles WHERE role = 'admin'
  )
);

-- Solo cada usuario ve sus propios favoritos
DROP POLICY IF EXISTS "dev_favorites_all" ON glowhair_favorites;

CREATE POLICY "favorites_select_own" 
ON glowhair_favorites 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "favorites_insert_own" 
ON glowhair_favorites 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "favorites_delete_own" 
ON glowhair_favorites 
FOR DELETE 
USING (auth.uid() = user_id);
```

---

## 📚 Recursos y Referencias

### Archivos SQL Creados:
- ✅ `fix_rls_recursion.sql` - Solución completa paso a paso
- ✅ `diagnostico_rls_recursion.sql` - Herramientas de diagnóstico
- ✅ `cleanup_orphan_favorites.sql` - Limpieza de datos

### Documentación Creada:
1. `docs/FIX_FAVORITOS_IMAGE_VS_IMAGES.md` - Error de columna
2. `docs/FIX_RLS_RECURSION.md` - Este documento

### Referencias Oficiales:
- [PostgreSQL RLS Documentation](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [Supabase RLS Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Common RLS Pitfalls](https://supabase.com/docs/guides/database/postgres/row-level-security#common-pitfalls)

---

## ✅ Checklist de Verificación

Después de aplicar la solución:

- [ ] Ejecutado query de diagnóstico (Paso 1)
- [ ] Deshabilitado RLS temporalmente (Paso 2)
- [ ] Probado que funciona sin RLS (Paso 3)
- [ ] Eliminado políticas problemáticas (Paso 4)
- [ ] Creado políticas simples (Paso 5)
- [ ] Verificado 1 política por tabla (Paso 6)
- [ ] Probado GET /api/favorites → 200 OK
- [ ] Probado página /favorites → Muestra productos
- [ ] Sin errores en consola del navegador
- [ ] Sin errores en logs del servidor

---

## 🎉 Estado Final Esperado

```bash
# En el navegador (Console)
🔄 Inicializando autenticación...
✅ Sesión encontrada: keila@glowhair.com
📥 Favoritos recibidos del API: [...]
✅ Favoritos procesados: {total: 1, validos: 1, ids: [...]}

# En el servidor (Terminal)
📋 GET /api/favorites - userId: 00000000-0000-0000-0000-000000000001
📋 Favorites result: { count: 1, error: null }
🔍 Buscando productos para favoritos: ['bdc7c54b-...']
📦 Products result: { count: 1, productsError: null }
✅ GET /api/favorites 200 in 150ms
```

**Resultado:** Sistema de favoritos 100% funcional ✅

---

**Fecha:** 15 de Octubre 2025  
**Usuario:** keila@glowhair.com  
**Error:** RLS Infinite Recursion (42P17)  
**Estado:** SOLUCIÓN DOCUMENTADA ✅

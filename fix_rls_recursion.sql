-- ============================================
-- FIX: Recursión Infinita en RLS Policies
-- ============================================
-- Error: infinite recursion detected in policy for relation "glowhair_profiles"
-- Causa: Política SELECT en glowhair_profiles que hace JOIN consigo misma

-- 1️⃣ VER POLÍTICAS ACTUALES DE glowhair_profiles
-- ============================================
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'glowhair_profiles'
ORDER BY policyname;

-- 2️⃣ VER POLÍTICAS ACTUALES DE glowhair_products
-- ============================================
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'glowhair_products'
ORDER BY policyname;

-- 3️⃣ ELIMINAR POLÍTICAS PROBLEMÁTICAS
-- ============================================
-- Primero elimina TODAS las políticas existentes
DROP POLICY IF EXISTS "Enable read access for all users" ON glowhair_profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON glowhair_profiles;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON glowhair_profiles;
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON glowhair_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON glowhair_profiles;

-- 4️⃣ CREAR POLÍTICAS SIMPLES Y SEGURAS
-- ============================================

-- Eliminar políticas si ya existen
DROP POLICY IF EXISTS "profiles_select_policy" ON glowhair_profiles;
DROP POLICY IF EXISTS "profiles_insert_policy" ON glowhair_profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON glowhair_profiles;
DROP POLICY IF EXISTS "profiles_delete_policy" ON glowhair_profiles;

-- Política para SELECT (leer perfiles)
-- IMPORTANTE: NO usar subqueries que referencien la misma tabla
CREATE POLICY "profiles_select_policy"
ON glowhair_profiles
FOR SELECT
USING (true);  -- Todos pueden ver todos los perfiles (para desarrollo)

-- Política para INSERT (crear perfil)
CREATE POLICY "profiles_insert_policy"
ON glowhair_profiles
FOR INSERT
WITH CHECK (true);  -- Cualquiera puede crear un perfil (para desarrollo)

-- Política para UPDATE (actualizar perfil)
CREATE POLICY "profiles_update_policy"
ON glowhair_profiles
FOR UPDATE
USING (true)  -- Cualquiera puede actualizar (para desarrollo)
WITH CHECK (true);

-- Política para DELETE (eliminar perfil)
CREATE POLICY "profiles_delete_policy"
ON glowhair_profiles
FOR DELETE
USING (true);  -- Cualquiera puede eliminar (para desarrollo)

-- 5️⃣ VERIFICAR POLÍTICAS DE glowhair_products
-- ============================================
-- Si glowhair_products también tiene recursión, arreglarlo:

DROP POLICY IF EXISTS "Enable read access for all users" ON glowhair_products;
DROP POLICY IF EXISTS "Products are viewable by everyone" ON glowhair_products;
DROP POLICY IF EXISTS "products_select_policy" ON glowhair_products;

CREATE POLICY "products_select_policy"
ON glowhair_products
FOR SELECT
USING (true);  -- Todos pueden ver todos los productos

-- 6️⃣ ARREGLAR POLÍTICAS DE glowhair_orders
-- ============================================
-- Este es el problema principal - la tabla de órdenes necesita políticas

-- Ver políticas actuales
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'glowhair_orders'
ORDER BY policyname;

-- Eliminar todas las políticas existentes
DROP POLICY IF EXISTS "Enable read access for all users" ON glowhair_orders;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON glowhair_orders;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON glowhair_orders;
DROP POLICY IF EXISTS "Users can view own orders" ON glowhair_orders;
DROP POLICY IF EXISTS "Users can insert own orders" ON glowhair_orders;
DROP POLICY IF EXISTS "orders_select_policy" ON glowhair_orders;
DROP POLICY IF EXISTS "orders_insert_policy" ON glowhair_orders;
DROP POLICY IF EXISTS "orders_update_policy" ON glowhair_orders;
DROP POLICY IF EXISTS "orders_delete_policy" ON glowhair_orders;

-- Crear políticas permisivas para desarrollo
CREATE POLICY "orders_select_policy"
ON glowhair_orders
FOR SELECT
USING (true);  -- Todos pueden ver todas las órdenes

CREATE POLICY "orders_insert_policy"
ON glowhair_orders
FOR INSERT
WITH CHECK (true);  -- Cualquiera puede crear órdenes

CREATE POLICY "orders_update_policy"
ON glowhair_orders
FOR UPDATE
USING (true)
WITH CHECK (true);  -- Cualquiera puede actualizar órdenes

CREATE POLICY "orders_delete_policy"
ON glowhair_orders
FOR DELETE
USING (true);  -- Cualquiera puede eliminar órdenes

-- 7️⃣ ARREGLAR POLÍTICAS DE glowhair_order_items
-- ============================================
-- También necesitamos políticas para los items de las órdenes

-- Ver políticas actuales
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'glowhair_order_items'
ORDER BY policyname;

-- Eliminar políticas existentes
DROP POLICY IF EXISTS "Enable read access for all users" ON glowhair_order_items;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON glowhair_order_items;
DROP POLICY IF EXISTS "order_items_select_policy" ON glowhair_order_items;
DROP POLICY IF EXISTS "order_items_insert_policy" ON glowhair_order_items;
DROP POLICY IF EXISTS "order_items_update_policy" ON glowhair_order_items;
DROP POLICY IF EXISTS "order_items_delete_policy" ON glowhair_order_items;

-- Crear políticas permisivas para desarrollo
CREATE POLICY "order_items_select_policy"
ON glowhair_order_items
FOR SELECT
USING (true);

CREATE POLICY "order_items_insert_policy"
ON glowhair_order_items
FOR INSERT
WITH CHECK (true);

CREATE POLICY "order_items_update_policy"
ON glowhair_order_items
FOR UPDATE
USING (true)
WITH CHECK (true);

CREATE POLICY "order_items_delete_policy"
ON glowhair_order_items
FOR DELETE
USING (true);

-- 8️⃣ VERIFICAR QUE RLS ESTÉ HABILITADO
-- ============================================
ALTER TABLE glowhair_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE glowhair_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE glowhair_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE glowhair_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE glowhair_order_items ENABLE ROW LEVEL SECURITY;

-- 9️⃣ VERIFICAR POLÍTICAS DESPUÉS DE APLICAR
-- ============================================
SELECT 
    tablename,
    policyname,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename IN ('glowhair_profiles', 'glowhair_products', 'glowhair_favorites', 'glowhair_orders', 'glowhair_order_items')
ORDER BY tablename, policyname;

-- ============================================
-- NOTAS IMPORTANTES:
-- ============================================
-- ❌ NUNCA hagas esto (causa recursión):
--    CREATE POLICY "recursiva" ON glowhair_profiles
--    FOR SELECT USING (
--      id IN (SELECT user_id FROM glowhair_profiles WHERE ...)
--    );
--
-- ✅ SIEMPRE usa políticas simples:
--    CREATE POLICY "simple" ON glowhair_profiles
--    FOR SELECT USING (true);
--
-- 🔒 Para producción, cambiar a:
--    USING (auth.uid() = id)  -- Solo el dueño puede ver/editar
--
-- 📝 Estas políticas permisivas son SOLO para desarrollo
-- 📝 Antes de producción, implementar auth.uid() correctamente

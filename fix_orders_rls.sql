-- ============================================
-- FIX: Políticas RLS para glowhair_orders
-- ============================================
-- Asegura que los administradores puedan ver todas las órdenes

-- 1️⃣ ELIMINAR POLÍTICAS EXISTENTES
-- ============================================
DROP POLICY IF EXISTS "Enable read access for all users" ON glowhair_orders;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON glowhair_orders;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON glowhair_orders;
DROP POLICY IF EXISTS "Users can view own orders" ON glowhair_orders;
DROP POLICY IF EXISTS "Users can insert own orders" ON glowhair_orders;
DROP POLICY IF EXISTS "orders_select_policy" ON glowhair_orders;
DROP POLICY IF EXISTS "orders_insert_policy" ON glowhair_orders;
DROP POLICY IF EXISTS "orders_update_policy" ON glowhair_orders;
DROP POLICY IF EXISTS "orders_delete_policy" ON glowhair_orders;

DROP POLICY IF EXISTS "Enable read access for all users" ON glowhair_order_items;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON glowhair_order_items;
DROP POLICY IF EXISTS "order_items_select_policy" ON glowhair_order_items;
DROP POLICY IF EXISTS "order_items_insert_policy" ON glowhair_order_items;
DROP POLICY IF EXISTS "order_items_update_policy" ON glowhair_order_items;
DROP POLICY IF EXISTS "order_items_delete_policy" ON glowhair_order_items;

-- 2️⃣ CREAR POLÍTICAS PERMISIVAS (DESARROLLO)
-- ============================================
-- Estas políticas permiten acceso total a todas las órdenes
-- ⚠️ CAMBIAR EN PRODUCCIÓN para restringir acceso

-- Políticas para glowhair_orders
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

-- Políticas para glowhair_order_items
CREATE POLICY "order_items_select_policy"
ON glowhair_order_items
FOR SELECT
USING (true);  -- Todos pueden ver todos los items

CREATE POLICY "order_items_insert_policy"
ON glowhair_order_items
FOR INSERT
WITH CHECK (true);  -- Cualquiera puede crear items

CREATE POLICY "order_items_update_policy"
ON glowhair_order_items
FOR UPDATE
USING (true)
WITH CHECK (true);  -- Cualquiera puede actualizar items

CREATE POLICY "order_items_delete_policy"
ON glowhair_order_items
FOR DELETE
USING (true);  -- Cualquiera puede eliminar items

-- 3️⃣ VERIFICAR QUE RLS ESTÉ HABILITADO
-- ============================================
ALTER TABLE glowhair_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE glowhair_order_items ENABLE ROW LEVEL SECURITY;

-- 4️⃣ VERIFICAR POLÍTICAS APLICADAS
-- ============================================
SELECT 
    tablename,
    policyname,
    cmd,
    roles,
    qual,
    with_check
FROM pg_policies
WHERE tablename IN ('glowhair_orders', 'glowhair_order_items')
ORDER BY tablename, policyname;

-- 5️⃣ VERIFICAR CONTENIDO DE LAS TABLAS
-- ============================================
SELECT 
    'glowhair_orders' as tabla,
    COUNT(*) as total_registros
FROM glowhair_orders
UNION ALL
SELECT 
    'glowhair_order_items' as tabla,
    COUNT(*) as total_registros
FROM glowhair_order_items;

-- 6️⃣ MOSTRAR SAMPLE DE ÓRDENES
-- ============================================
SELECT 
    id,
    user_id,
    status,
    total,
    created_at
FROM glowhair_orders
ORDER BY created_at DESC
LIMIT 5;

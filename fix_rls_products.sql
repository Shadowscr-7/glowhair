-- ==========================================
-- SOLUCIÓN PARA RECURSIÓN INFINITA EN RLS
-- ==========================================
-- Este script soluciona el problema de recursión infinita
-- permitiendo operaciones de administración en productos

-- OPCIÓN 1: Deshabilitar RLS en glowhair_products (TEMPORALMENTE PARA DESARROLLO)
-- Si estás en desarrollo y quieres deshabilitar RLS completamente:
-- ALTER TABLE glowhair_products DISABLE ROW LEVEL SECURITY;

-- OPCIÓN 2: Crear política permisiva para INSERT (RECOMENDADO)
-- Primero, eliminar políticas existentes que puedan causar conflicto
DROP POLICY IF EXISTS "Cualquiera puede ver productos activos" ON glowhair_products;
DROP POLICY IF EXISTS "Public products are viewable by everyone" ON glowhair_products;
DROP POLICY IF EXISTS "Admins can manage products" ON glowhair_products;
DROP POLICY IF EXISTS "Anyone can view active products" ON glowhair_products;

-- Asegurar que RLS está habilitado
ALTER TABLE glowhair_products ENABLE ROW LEVEL SECURITY;

-- Política 1: Permitir SELECT a todos (productos activos)
CREATE POLICY "anyone_can_view_active_products" 
ON glowhair_products 
FOR SELECT 
USING (is_active = true);

-- Política 2: Permitir INSERT a usuarios autenticados (sin verificar roles para evitar recursión)
CREATE POLICY "authenticated_users_can_insert_products" 
ON glowhair_products 
FOR INSERT 
TO authenticated
WITH CHECK (true);

-- Política 3: Permitir UPDATE a usuarios autenticados
CREATE POLICY "authenticated_users_can_update_products" 
ON glowhair_products 
FOR UPDATE 
TO authenticated
USING (true);

-- Política 4: Permitir DELETE a usuarios autenticados
CREATE POLICY "authenticated_users_can_delete_products" 
ON glowhair_products 
FOR DELETE 
TO authenticated
USING (true);

-- También agregar las columnas faltantes si no lo has hecho
ALTER TABLE glowhair_products 
ADD COLUMN IF NOT EXISTS benefits TEXT[] DEFAULT '{}';

ALTER TABLE glowhair_products 
ADD COLUMN IF NOT EXISTS features TEXT[] DEFAULT '{}';

ALTER TABLE glowhair_products 
ADD COLUMN IF NOT EXISTS ingredients TEXT;

ALTER TABLE glowhair_products 
ADD COLUMN IF NOT EXISTS usage_instructions TEXT;

ALTER TABLE glowhair_products 
ADD COLUMN IF NOT EXISTS hair_types TEXT[] DEFAULT '{}';

ALTER TABLE glowhair_products 
ADD COLUMN IF NOT EXISTS size VARCHAR(50);

-- Verificar las políticas creadas
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'glowhair_products'
ORDER BY policyname;

-- Verificar las columnas
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'glowhair_products'
ORDER BY ordinal_position;

-- ==========================================
-- CORREGIR TIPO DE COLUMNA INGREDIENTS
-- ==========================================
-- Si la columna 'ingredients' existe como TEXT, la convertimos a TEXT[]

-- Verificar el tipo actual
SELECT column_name, data_type, udt_name
FROM information_schema.columns
WHERE table_name = 'glowhair_products' AND column_name = 'ingredients';

-- Si es TEXT, convertir a TEXT[]
-- OPCIÓN 1: Eliminar y recrear (si la tabla está vacía o no te importa perder datos)
ALTER TABLE glowhair_products DROP COLUMN IF EXISTS ingredients;
ALTER TABLE glowhair_products ADD COLUMN ingredients TEXT[] DEFAULT '{}';

-- OPCIÓN 2: Convertir manteniendo datos (si ya tienes datos)
-- Esta opción intenta convertir strings existentes en arrays
-- ALTER TABLE glowhair_products 
-- ALTER COLUMN ingredients TYPE TEXT[] USING ARRAY[ingredients];

COMMENT ON COLUMN glowhair_products.ingredients IS 'Lista de ingredientes del producto con sus beneficios';

-- Verificar el cambio
SELECT column_name, data_type, udt_name
FROM information_schema.columns
WHERE table_name = 'glowhair_products' AND column_name = 'ingredients';

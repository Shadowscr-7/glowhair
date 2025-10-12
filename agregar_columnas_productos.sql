-- ==========================================
-- AGREGAR COLUMNAS FALTANTES A LA TABLA glowhair_products
-- ==========================================
-- Ejecuta esto en el SQL Editor de Supabase para agregar las columnas
-- necesarias para almacenar toda la información de los productos

-- 1. Agregar columna de beneficios (array de texto)
ALTER TABLE glowhair_products 
ADD COLUMN IF NOT EXISTS benefits TEXT[] DEFAULT '{}';

-- 2. Agregar columna de características (array de texto)
ALTER TABLE glowhair_products 
ADD COLUMN IF NOT EXISTS features TEXT[] DEFAULT '{}';

-- 3. Agregar columna de ingredientes (texto largo)
ALTER TABLE glowhair_products 
ADD COLUMN IF NOT EXISTS ingredients TEXT;

-- 4. Agregar columna de instrucciones de uso (texto largo)
ALTER TABLE glowhair_products 
ADD COLUMN IF NOT EXISTS usage_instructions TEXT;

-- 5. Agregar columna de tipos de cabello (array de texto)
ALTER TABLE glowhair_products 
ADD COLUMN IF NOT EXISTS hair_types TEXT[] DEFAULT '{}';

-- 6. Agregar columna de tamaño/presentación
ALTER TABLE glowhair_products 
ADD COLUMN IF NOT EXISTS size VARCHAR(50);

-- Comentarios para las columnas
COMMENT ON COLUMN glowhair_products.benefits IS 'Lista de beneficios del producto';
COMMENT ON COLUMN glowhair_products.features IS 'Lista de características especiales';
COMMENT ON COLUMN glowhair_products.ingredients IS 'Ingredientes del producto con sus beneficios';
COMMENT ON COLUMN glowhair_products.usage_instructions IS 'Instrucciones detalladas de uso';
COMMENT ON COLUMN glowhair_products.hair_types IS 'Tipos de cabello para los que es ideal el producto';
COMMENT ON COLUMN glowhair_products.size IS 'Tamaño o presentación del producto (ej: 250ml, 500ml)';

-- Verificar que las columnas se agregaron correctamente
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'glowhair_products'
  AND column_name IN ('benefits', 'features', 'ingredients', 'usage_instructions', 'hair_types', 'size')
ORDER BY column_name;

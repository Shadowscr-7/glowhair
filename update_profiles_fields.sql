-- ============================================
-- ACTUALIZACIÓN: Agregar campos a glowhair_profiles
-- ============================================
-- Agregar campos de dirección y teléfono que faltan

-- 1️⃣ VERIFICAR CAMPOS EXISTENTES
-- ============================================
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'glowhair_profiles'
ORDER BY ordinal_position;

-- 2️⃣ AGREGAR CAMPOS NUEVOS (si no existen)
-- ============================================

-- Phone
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'glowhair_profiles' AND column_name = 'phone'
    ) THEN
        ALTER TABLE glowhair_profiles ADD COLUMN phone VARCHAR(20);
    END IF;
END $$;

-- Address
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'glowhair_profiles' AND column_name = 'address'
    ) THEN
        ALTER TABLE glowhair_profiles ADD COLUMN address TEXT;
    END IF;
END $$;

-- City
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'glowhair_profiles' AND column_name = 'city'
    ) THEN
        ALTER TABLE glowhair_profiles ADD COLUMN city VARCHAR(100);
    END IF;
END $$;

-- Country
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'glowhair_profiles' AND column_name = 'country'
    ) THEN
        ALTER TABLE glowhair_profiles ADD COLUMN country VARCHAR(100) DEFAULT 'España';
    END IF;
END $$;

-- 3️⃣ VERIFICAR CAMPOS AGREGADOS
-- ============================================
SELECT 
    column_name,
    data_type,
    character_maximum_length,
    column_default,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'glowhair_profiles'
  AND column_name IN ('phone', 'address', 'city', 'country')
ORDER BY column_name;

-- 4️⃣ ACTUALIZAR PERFILES EXISTENTES CON VALORES POR DEFECTO
-- ============================================
UPDATE glowhair_profiles
SET country = 'España'
WHERE country IS NULL;

-- 5️⃣ EJEMPLO DE ACTUALIZACIÓN
-- ============================================
-- UPDATE glowhair_profiles
-- SET 
--   phone = '+34 600 000 000',
--   address = 'Calle Principal 123',
--   city = 'Madrid',
--   country = 'España'
-- WHERE id = 'UUID-DEL-USUARIO';

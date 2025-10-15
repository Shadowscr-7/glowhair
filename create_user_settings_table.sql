-- ============================================
-- TABLA: glowhair_user_settings
-- ============================================
-- Configuración personalizada de cada usuario
-- Incluye: tema, moneda, notificaciones

-- 1️⃣ CREAR TABLA
-- ============================================
CREATE TABLE IF NOT EXISTS glowhair_user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES glowhair_profiles(id) ON DELETE CASCADE,
  
  -- GENERAL
  theme VARCHAR(10) DEFAULT 'light' CHECK (theme IN ('light', 'dark', 'auto')),
  currency VARCHAR(3) DEFAULT 'EUR' CHECK (currency IN ('EUR', 'USD', 'GBP')),
  
  -- NOTIFICACIONES
  email_notifications BOOLEAN DEFAULT true,
  push_notifications BOOLEAN DEFAULT true,
  order_updates BOOLEAN DEFAULT true,
  promotions BOOLEAN DEFAULT false,
  newsletter BOOLEAN DEFAULT true,
  sound_enabled BOOLEAN DEFAULT true,
  
  -- METADATA
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraint: Un solo registro de settings por usuario
  UNIQUE(user_id)
);

-- 2️⃣ ÍNDICES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id 
ON glowhair_user_settings(user_id);

-- 3️⃣ TRIGGER PARA ACTUALIZAR updated_at
-- ============================================
CREATE OR REPLACE FUNCTION update_glowhair_user_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_user_settings_timestamp
BEFORE UPDATE ON glowhair_user_settings
FOR EACH ROW
EXECUTE FUNCTION update_glowhair_user_settings_updated_at();

-- 4️⃣ ROW LEVEL SECURITY (RLS)
-- ============================================
ALTER TABLE glowhair_user_settings ENABLE ROW LEVEL SECURITY;

-- Política: Los usuarios solo pueden ver/editar sus propias configuraciones
CREATE POLICY "users_select_own_settings"
ON glowhair_user_settings
FOR SELECT
USING (true);  -- Para desarrollo, permitir a todos (cambiar en producción a: auth.uid() = user_id)

CREATE POLICY "users_insert_own_settings"
ON glowhair_user_settings
FOR INSERT
WITH CHECK (true);  -- Para desarrollo (cambiar en producción)

CREATE POLICY "users_update_own_settings"
ON glowhair_user_settings
FOR UPDATE
USING (true)  -- Para desarrollo
WITH CHECK (true);

-- 5️⃣ FUNCIÓN PARA CREAR SETTINGS POR DEFECTO
-- ============================================
-- Esta función se llama automáticamente al crear un nuevo usuario
CREATE OR REPLACE FUNCTION create_default_user_settings()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO glowhair_user_settings (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Crear settings automáticamente al crear perfil
CREATE TRIGGER trigger_create_default_settings
AFTER INSERT ON glowhair_profiles
FOR EACH ROW
EXECUTE FUNCTION create_default_user_settings();

-- 6️⃣ DATOS DE EJEMPLO (Opcional)
-- ============================================
-- Crear settings para usuarios existentes que no tengan
INSERT INTO glowhair_user_settings (user_id, theme, currency)
SELECT 
  id,
  'light',
  'EUR'
FROM glowhair_profiles
WHERE id NOT IN (SELECT user_id FROM glowhair_user_settings)
ON CONFLICT (user_id) DO NOTHING;

-- 7️⃣ VERIFICAR TABLA CREADA
-- ============================================
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'glowhair_user_settings'
ORDER BY ordinal_position;

-- 8️⃣ VERIFICAR POLÍTICAS RLS
-- ============================================
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  cmd
FROM pg_policies
WHERE tablename = 'glowhair_user_settings';

-- ============================================
-- QUERIES DE EJEMPLO
-- ============================================

-- Obtener configuración de un usuario
-- SELECT * FROM glowhair_user_settings WHERE user_id = 'UUID-DEL-USUARIO';

-- Actualizar tema
-- UPDATE glowhair_user_settings 
-- SET theme = 'dark' 
-- WHERE user_id = 'UUID-DEL-USUARIO';

-- Actualizar notificaciones
-- UPDATE glowhair_user_settings 
-- SET 
--   email_notifications = true,
--   push_notifications = false,
--   promotions = true
-- WHERE user_id = 'UUID-DEL-USUARIO';

-- Ver todos los usuarios con tema oscuro
-- SELECT 
--   p.email,
--   p.full_name,
--   s.theme,
--   s.updated_at
-- FROM glowhair_user_settings s
-- JOIN glowhair_profiles p ON s.user_id = p.id
-- WHERE s.theme = 'dark';

-- ==========================================
-- SCRIPT PARA CREAR USUARIO ADMINISTRADOR KEILA
-- ==========================================

-- IMPORTANTE: Ejecutar en este orden:
-- 1. supabase_setup.sql (estructura principal)
-- 2. complete_database_setup.sql (completar estructura)
-- 3. Este script (crear admin)

-- PASO PREVIO MANUAL: Crear usuario en Supabase Authentication
-- 1. Ve a Authentication > Users en Supabase Dashboard
-- 2. Click "Add user"
-- 3. Email: keila@glowhair.com
-- 4. Password: keila123456 (o el que prefieras)
-- 5. Luego ejecutar este script

-- Actualizar o insertar el perfil de Keila como administrador
INSERT INTO public.profiles (
  id,
  first_name,
  last_name,
  email,
  full_name,
  role,
  phone,
  preferences,
  admin_permissions,
  is_verified,
  created_at,
  updated_at
) 
SELECT 
  auth_user.id,
  'Keila',
  'Admin',
  'keila@glowhair.com',
  'Keila Admin',
  'admin',
  '+34 600 000 000',
  jsonb_build_object(
    'notifications', jsonb_build_object(
      'email', true,
      'push', true,
      'sms', false
    ),
    'privacy', jsonb_build_object(
      'profileVisible', false,
      'shareData', false
    ),
    'language', 'es',
    'currency', 'EUR'
  ),
  jsonb_build_object(
    'products', true,
    'orders', true,
    'customers', true,
    'analytics', true,
    'settings', true,
    'users', true
  ),
  true,
  NOW(),
  NOW()
FROM auth.users auth_user 
WHERE auth_user.email = 'keila@glowhair.com'
ON CONFLICT (id) DO UPDATE SET
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  phone = EXCLUDED.phone,
  preferences = EXCLUDED.preferences,
  admin_permissions = EXCLUDED.admin_permissions,
  is_verified = EXCLUDED.is_verified,
  updated_at = NOW();

-- Insertar en tabla admin_users si existe
INSERT INTO public.admin_users (user_id, role, permissions, is_active)
SELECT 
  auth_user.id,
  'admin',
  jsonb_build_object(
    'products', true,
    'orders', true,
    'customers', true,
    'analytics', true,
    'settings', true,
    'users', true
  ),
  true
FROM auth.users auth_user 
WHERE auth_user.email = 'keila@glowhair.com'
ON CONFLICT (user_id) DO UPDATE SET
  role = EXCLUDED.role,
  permissions = EXCLUDED.permissions,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();

-- Verificar que el usuario se creó correctamente
SELECT 
  p.id,
  p.first_name,
  p.last_name,
  p.email,
  p.role,
  u.email as auth_email,
  u.created_at as auth_created_at
FROM profiles p
JOIN auth.users u ON u.id = p.id
WHERE p.email = 'keila@glowhair.com';
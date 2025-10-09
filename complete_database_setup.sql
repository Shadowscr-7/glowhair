-- Script para completar la estructura de la base de datos
-- Ejecutar DESPUÉS del script principal supabase_setup.sql

-- Agregar columna role a la tabla profiles si no existe
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'customer';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS admin_permissions JSONB DEFAULT '{}';

-- Crear índice para búsquedas por rol
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- Actualizar la función create_user_profile para incluir el rol
CREATE OR REPLACE FUNCTION create_user_profile()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, role)
  VALUES (
    NEW.id, 
    NEW.email, 
    NEW.raw_user_meta_data->>'full_name',
    'customer'
  );
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Política de seguridad adicional para administradores
CREATE POLICY IF NOT EXISTS "Admins can view all profiles" ON profiles 
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
  )
);

CREATE POLICY IF NOT EXISTS "Admins can update profiles" ON profiles 
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
  )
);
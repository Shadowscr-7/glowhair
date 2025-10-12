# 🔐 Crear Usuario Administrador en Supabase

## Opción 1: Desde Supabase Dashboard (Recomendado)

### Paso 1: Crear usuario en Authentication
1. Ve a tu proyecto en https://supabase.com/dashboard
2. Click en **Authentication** (icono de llave) en el menú izquierdo
3. Click en **Users**
4. Click en **"Add user"** (botón verde arriba a la derecha)
5. Selecciona **"Create new user"**
6. Llena los datos:
   - **Email**: `keila@glowhair.com`
   - **Password**: `Keila@2025!` (o el que prefieras)
   - **Auto Confirm User**: ✅ Marcar (para que esté verificado inmediatamente)
7. Click **"Create user"**

### Paso 2: Ejecutar script SQL
1. En Supabase Dashboard, ve a **SQL Editor** (icono de base de datos)
2. Click en **"New query"**
3. Copia y pega el siguiente script:

```sql
-- Actualizar perfil como administrador
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
```

4. Click **"Run"** (o presiona Ctrl+Enter)
5. Deberías ver el resultado mostrando el usuario creado

### Paso 3: Iniciar sesión
1. Ve a tu aplicación: `http://localhost:3000/login`
2. Ingresa:
   - **Email**: `keila@glowhair.com`
   - **Password**: `Keila@2025!` (o la que pusiste)
3. Click **"Iniciar Sesión"**
4. Deberías poder acceder a `/admin`

---

## Opción 2: Usuario de prueba rápido

Si prefieres un usuario de prueba más simple:

**Email**: `admin@test.com`  
**Password**: `Admin123!`

Ejecuta este script en SQL Editor:

```sql
-- Crear usuario en auth.users (si no tienes acceso directo, créalo desde UI)
-- Luego ejecuta esto:

INSERT INTO public.profiles (
  id,
  email,
  full_name,
  role,
  is_verified,
  created_at,
  updated_at
) 
SELECT 
  auth_user.id,
  'admin@test.com',
  'Admin Test',
  'admin',
  true,
  NOW(),
  NOW()
FROM auth.users auth_user 
WHERE auth_user.email = 'admin@test.com'
ON CONFLICT (id) DO UPDATE SET
  role = 'admin',
  is_verified = true,
  updated_at = NOW();

-- Verificar
SELECT * FROM profiles WHERE email = 'admin@test.com';
```

---

## 📝 Notas importantes:

1. **La tabla `auth.users`** es gestionada por Supabase Auth
2. **La tabla `profiles`** es nuestra tabla de perfiles personalizados
3. El **role = 'admin'** es lo que da permisos administrativos
4. Asegúrate de tener las **RLS policies** correctas para permitir el acceso

---

## 🔍 Verificar que funciona:

Ejecuta esto en SQL Editor para ver todos los admins:

```sql
SELECT 
  p.id,
  p.email,
  p.full_name,
  p.role,
  p.is_verified,
  p.created_at,
  u.email as auth_email,
  u.email_confirmed_at
FROM profiles p
LEFT JOIN auth.users u ON u.id = p.id
WHERE p.role = 'admin';
```

---

## ⚠️ Troubleshooting:

### Error: "Usuario no encontrado"
- Verifica que el email existe en **Authentication > Users**
- Ejecuta: `SELECT * FROM auth.users WHERE email = 'tu@email.com';`

### Error: "No tienes permisos"
- Verifica el role: `SELECT role FROM profiles WHERE email = 'tu@email.com';`
- Debe ser `'admin'`, no `'user'`

### Error: "Invalid login credentials"
- Verifica el password en Authentication > Users
- Resetea el password desde el dashboard si es necesario

---

¿Necesitas ayuda? Dime qué error te aparece y te ayudo a solucionarlo.

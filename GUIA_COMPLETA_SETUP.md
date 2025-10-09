# 🚀 Guía Completa de Configuración - GlowHair E-commerce

## 📋 Orden de Ejecución (MUY IMPORTANTE)

### 1. 🗄️ Configurar Base de Datos Supabase

#### Paso 1.1: Ejecutar Script Principal
1. Ve a **SQL Editor** en Supabase Dashboard
2. Copia y pega **TODO** el contenido de `supabase_setup.sql`
3. Haz clic en **"RUN"**
4. Espera a que termine (creará 14+ tablas)

#### Paso 1.2: Completar Estructura
1. En el mismo **SQL Editor**
2. Copia y pega el contenido de `complete_database_setup.sql`  
3. Haz clic en **"RUN"**
4. Esto agregará la columna `role` y permisos de admin

### 2. 👤 Crear Usuario Administrador "Keila"

#### Paso 2.1: Crear en Authentication (MANUAL)
1. Ve a **Authentication > Users**
2. Haz clic en **"Add user"**
3. Completa:
   - **Email**: `keila@glowhair.com`
   - **Password**: `keila123456`
   - **Confirm Password**: `keila123456`
4. **"Create user"**

#### Paso 2.2: Convertir en Admin (SQL)
1. Ve a **SQL Editor** nuevamente  
2. Copia y pega el contenido de `create_admin_user.sql`
3. Haz clic en **"RUN"**
4. Verificará que Keila tenga rol de admin

### 3. 🔑 Variables de Entorno
Tu archivo `.env.local` ya está configurado correctamente:
```env
NEXT_PUBLIC_SUPABASE_URL=https://mfcdxnfppgvyknbsdmzy.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=glowhair
# etc.
```

### 4. 🏃‍♂️ Probar el Sistema

```bash
npm run dev
```

Luego:
1. **Login**: http://localhost:3000/login
   - Email: `keila@glowhair.com`  
   - Password: `keila123456`
2. **Dashboard Admin**: http://localhost:3000/admin

## 📊 Tablas que se Crean

### 🛍️ **E-commerce Core**
- ✅ `categories` - Categorías de productos
- ✅ `brands` - Marcas 
- ✅ `products` - Productos principales
- ✅ `inventory_movements` - Control de stock

### 👥 **Usuarios**
- ✅ `profiles` - Perfiles de usuario (con rol admin/customer)
- ✅ `admin_users` - Usuarios administrativos
- ✅ `addresses` - Direcciones de envío

### 🛒 **Ventas**
- ✅ `orders` - Pedidos
- ✅ `order_items` - Items de pedidos
- ✅ `order_status_history` - Historial de estados
- ✅ `cart_items` - Carrito de compras

### 💰 **Marketing**
- ✅ `coupons` - Cupones de descuento
- ✅ `coupon_usage` - Uso de cupones
- ✅ `reviews` - Reseñas de productos
- ✅ `favorites` - Productos favoritos

### 🔧 **Sistema**
- ✅ `notifications` - Notificaciones
- ✅ `site_settings` - Configuración del sitio
- ✅ `newsletter_subscribers` - Suscriptores

## 🎯 Datos de Ejemplo Incluidos

### 📦 **Productos Demo**
- Shampoo Hidratante Premium ($29.99)
- Acondicionador Reparador ($24.99) 
- Mascarilla Nutritiva Intensiva ($34.99)
- Serum Anti-Frizz ($19.99)

### 🏷️ **Categorías**
- Limpieza, Tratamiento, Estilizado, Protección, Coloración, Herramientas

### 🎫 **Cupones de Ejemplo**
- `BIENVENIDO10` - 10% descuento
- `ENVIOGRATIS` - Envío gratis
- `MEGA50` - $50 de descuento

## ✅ **Verificar que Todo Funciona**

### 1. Verificar Tablas
En **Table Editor** deberías ver todas las tablas listadas arriba.

### 2. Verificar Usuario Admin
```sql
-- Ejecutar en SQL Editor para verificar
SELECT 
  p.email,
  p.first_name,
  p.role,
  p.admin_permissions
FROM profiles p 
WHERE p.email = 'keila@glowhair.com';
```

### 3. Verificar Login
- Ir a `/login`
- Email: `keila@glowhair.com`
- Password: `keila123456`
- Debería redirigir a `/admin`

## 🆘 Solución de Problemas

### ❌ "Error: relation does not exist"
- No ejecutaste el script principal `supabase_setup.sql`
- Ejecuta los scripts en el orden correcto

### ❌ "User not found" al hacer login
- No creaste el usuario en Authentication
- Ve a Authentication > Users y créalo manualmente

### ❌ "Access denied" en admin
- El usuario no tiene rol de admin
- Ejecuta `create_admin_user.sql` después de crear el usuario

### ❌ "Column role does not exist"
- No ejecutaste `complete_database_setup.sql`
- Ejecuta este script después del principal

---

**¡Siguiendo esta guía tu sistema estará 100% funcional! 🎉**
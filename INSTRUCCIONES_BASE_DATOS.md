# 🎯 Instrucciones para Configurar la Base de Datos GlowHair

## 📋 Resumen

Este archivo contiene las instrucciones completas para configurar la base de datos de tu e-commerce GlowHair con **todas las tablas usando el prefijo `glowhair_`**.

---

## 🚀 Paso 1: Ejecutar el Script SQL

### Opción A: Desde Supabase Dashboard (Recomendado)

1. **Accede a tu proyecto en Supabase**
   - Ve a [https://app.supabase.com](https://app.supabase.com)
   - Selecciona tu proyecto

2. **Abre el SQL Editor**
   - En el menú lateral, haz clic en **"SQL Editor"**
   - Haz clic en **"New query"**

3. **Copia y pega el contenido completo**
   - Abre el archivo: `glowhair_database_complete.sql`
   - Copia TODO el contenido (Ctrl+A, Ctrl+C)
   - Pega en el editor SQL de Supabase

4. **Ejecuta el script**
   - Haz clic en **"Run"** (o presiona Ctrl+Enter)
   - Espera a que termine (puede tomar 10-30 segundos)

5. **Revisa el resultado**
   - Verás mensajes en la consola indicando:
     - ✅ Tablas creadas
     - ✅ Productos insertados
     - ✅ Configuraciones aplicadas
     - ⚠️ Instrucciones para crear usuario Keila

---

## 👤 Paso 2: Crear Usuario Administrador Keila

### Desde Supabase Dashboard

1. **Ve a Authentication**
   - En el menú lateral: **Authentication > Users**

2. **Agregar nuevo usuario**
   - Haz clic en **"Add user"** o **"Invite user"**
   - Selecciona **"Create new user"**

3. **Completa los datos**
   ```
   Email: keila@glowhair.com
   Password: Keila2025!
   ```
   
4. **Importante: Auto-confirmar el usuario**
   - ✅ Marca la opción: **"Auto Confirm User"**
   - Esto evita que Keila tenga que confirmar su email

5. **Crear el usuario**
   - Haz clic en **"Create user"**
   - Espera la confirmación

---

## 🔧 Paso 3: Convertir a Keila en Administrador

Después de crear el usuario, debes ejecutar esta función para darle permisos de administrador:

1. **Vuelve al SQL Editor**
   - Menú lateral: **SQL Editor > New query**

2. **Ejecuta este comando**
   ```sql
   SELECT glowhair_make_user_admin('keila@glowhair.com');
   ```

3. **Verifica el resultado**
   - Deberías ver: `✅ SUCCESS: Usuario keila@glowhair.com convertido en administrador exitosamente`

---

## 📊 Estructura Creada

### Tablas Principales (20 tablas)

| Tabla | Descripción |
|-------|-------------|
| `glowhair_products` | Productos del catálogo |
| `glowhair_categories` | Categorías de productos |
| `glowhair_brands` | Marcas de productos |
| `glowhair_profiles` | Perfiles de usuarios |
| `glowhair_addresses` | Direcciones de envío |
| `glowhair_cart_items` | Items en el carrito |
| `glowhair_favorites` | Productos favoritos |
| `glowhair_orders` | Órdenes de compra |
| `glowhair_order_items` | Items de cada orden |
| `glowhair_order_status_history` | Historial de estados |
| `glowhair_reviews` | Reseñas de productos |
| `glowhair_review_votes` | Votos útiles en reseñas |
| `glowhair_coupons` | Cupones de descuento |
| `glowhair_coupon_usage` | Uso de cupones |
| `glowhair_notifications` | Notificaciones de usuarios |
| `glowhair_inventory_movements` | Movimientos de inventario |
| `glowhair_admin_users` | Usuarios administradores |
| `glowhair_site_settings` | Configuraciones del sitio |
| `glowhair_newsletter_subscribers` | Suscriptores al newsletter |
| `glowhair_email_campaigns` | Campañas de email marketing |

### Datos de Ejemplo Incluidos

- ✅ **12 Categorías**: Shampoos, Acondicionadores, Mascarillas, etc.
- ✅ **8 Marcas**: GlowHair, Keila Professional, Natural Care, etc.
- ✅ **15+ Productos**: Variedad de productos capilares con descripciones completas
- ✅ **5 Cupones**: Descuentos de bienvenida, envío gratis, etc.
- ✅ **25+ Configuraciones**: Precios de envío, impuestos, límites, etc.

---

## 🔐 Credenciales de Acceso

### Usuario Administrador

```
Email: keila@glowhair.com
Password: Keila2025!
```

**⚠️ IMPORTANTE**: Cambia la contraseña después del primer login

---

## 🎨 Paso 4: Configurar tu Aplicación Next.js

### 1. Actualizar Variables de Entorno

Crea o actualiza el archivo `.env.local`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=tu_proyecto_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key

# Opcional: Cloudinary para imágenes
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=tu_cloud_name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=tu_upload_preset
```

### 2. Obtener las Credenciales de Supabase

1. Ve a tu proyecto en Supabase
2. Menú lateral: **Settings > API**
3. Copia:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** (en API Keys) → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

## 🧪 Paso 5: Probar la Instalación

### 1. Iniciar la Aplicación

```bash
npm run dev
```

### 2. Probar el Login

1. Ve a: `http://localhost:3000/login`
2. Ingresa las credenciales de Keila
3. Deberías ser redirigido al dashboard

### 3. Acceder al Panel de Administración

1. Ve a: `http://localhost:3000/admin`
2. Deberías ver:
   - Lista de productos
   - Gestión de órdenes
   - Gestión de clientes
   - Estadísticas

### 4. Verificar Productos

1. Ve a: `http://localhost:3000/productos`
2. Deberías ver los productos de ejemplo
3. Prueba los filtros y búsqueda

---

## 🛠️ Funcionalidades Incluidas

### ✅ Sistema de Productos
- CRUD completo de productos
- Imágenes múltiples
- Categorías y marcas
- SKU y códigos de barras
- Control de stock automático
- Ingredientes y tipos de cabello
- SEO optimizado

### ✅ Sistema de Órdenes
- Creación de órdenes
- Estados múltiples (pendiente, confirmado, enviado, etc.)
- Historial de cambios de estado
- Gestión de envío y tracking
- Soporte para múltiples métodos de pago

### ✅ Sistema de Usuarios
- Registro y login
- Perfiles personalizados
- Múltiples direcciones de envío
- Historial de compras
- Sistema de puntos de lealtad

### ✅ Sistema de Reseñas
- Calificaciones de 1-5 estrellas
- Comentarios con imágenes
- Votos útiles/no útiles
- Moderación por admin
- Respuestas del vendedor

### ✅ Sistema de Cupones
- Descuentos por porcentaje
- Descuentos por monto fijo
- Envío gratis
- Límites de uso
- Validación automática

### ✅ Sistema de Inventario
- Control automático de stock
- Reservas en órdenes pendientes
- Liberación en cancelaciones
- Historial de movimientos
- Alertas de stock bajo

---

## 📝 Consultas SQL Útiles

### Ver todos los productos
```sql
SELECT 
  p.name, 
  c.name as category, 
  b.name as brand, 
  p.price, 
  p.stock
FROM glowhair_products p
LEFT JOIN glowhair_categories c ON p.category_id = c.id
LEFT JOIN glowhair_brands b ON p.brand_id = b.id
WHERE p.is_active = true
ORDER BY p.created_at DESC;
```

### Ver órdenes recientes
```sql
SELECT 
  o.order_number,
  p.full_name as customer,
  o.total,
  o.status,
  o.created_at
FROM glowhair_orders o
LEFT JOIN glowhair_profiles p ON o.user_id = p.id
ORDER BY o.created_at DESC
LIMIT 10;
```

### Ver cupones activos
```sql
SELECT 
  code,
  name,
  type,
  value,
  used_count,
  usage_limit
FROM glowhair_coupons
WHERE is_active = true
  AND (expires_at IS NULL OR expires_at > NOW())
ORDER BY created_at DESC;
```

### Verificar usuarios admin
```sql
SELECT 
  p.email,
  p.full_name,
  p.role,
  a.is_active
FROM glowhair_profiles p
LEFT JOIN glowhair_admin_users a ON p.id = a.user_id
WHERE p.role IN ('admin', 'super_admin');
```

---

## 🔄 Actualizar la Base de Datos

Si necesitas agregar más datos o modificar la estructura:

### Agregar más productos

```sql
INSERT INTO glowhair_products (
  name, slug, description, price, 
  category_id, brand_id, stock, 
  is_active
) VALUES (
  'Nuevo Producto',
  'nuevo-producto',
  'Descripción del producto',
  299.00,
  (SELECT id FROM glowhair_categories WHERE slug = 'shampoos'),
  (SELECT id FROM glowhair_brands WHERE slug = 'glowhair'),
  50,
  true
);
```

### Agregar más categorías

```sql
INSERT INTO glowhair_categories (
  name, slug, description, display_order
) VALUES (
  'Nueva Categoría',
  'nueva-categoria',
  'Descripción de la categoría',
  13
);
```

---

## 🐛 Solución de Problemas

### Error: "relation does not exist"
- **Causa**: Las tablas no se crearon correctamente
- **Solución**: Ejecuta nuevamente el script completo `glowhair_database_complete.sql`

### Error: "permission denied"
- **Causa**: RLS está bloqueando el acceso
- **Solución**: Verifica que el usuario esté logueado y tenga los permisos correctos

### No puedo ver productos en /productos
- **Causa**: Los productos no están marcados como activos
- **Solución**: 
  ```sql
  UPDATE glowhair_products SET is_active = true;
  ```

### El usuario Keila no puede acceder a /admin
- **Causa**: No tiene rol de administrador
- **Solución**: Ejecuta `SELECT glowhair_make_user_admin('keila@glowhair.com');`

---

## 📞 Soporte

Si tienes problemas con la configuración:

1. Revisa los mensajes de error en la consola de Supabase
2. Verifica que todas las tablas se hayan creado correctamente
3. Confirma que el usuario Keila existe y tiene rol de admin
4. Revisa que las variables de entorno estén configuradas correctamente

---

## 🎉 ¡Listo!

Tu base de datos GlowHair está completamente configurada y lista para usar. Todas las tablas tienen el prefijo `glowhair_` y el usuario administrador Keila está listo para gestionar el e-commerce.

**Próximos pasos sugeridos:**

1. ✅ Agregar más productos personalizados
2. ✅ Configurar imágenes con Cloudinary
3. ✅ Personalizar las configuraciones del sitio
4. ✅ Crear más cupones de promoción
5. ✅ Configurar métodos de pago reales
6. ✅ Configurar envíos con courier real

---

**¡Disfruta tu nuevo e-commerce GlowHair! 💇‍♀️✨**

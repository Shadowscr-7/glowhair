# 🚀 Guía de Configuración - GlowHair E-commerce

## 📋 Pasos para Configurar tu Sistema Completo

### 1. 🔑 Configurar Variables de Entorno

Crea un archivo `.env.local` en la raíz del proyecto con:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anonima_aqui

# Cloudinary Configuration  
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=glowhair
CLOUDINARY_API_KEY=tu_api_key_aqui
CLOUDINARY_API_SECRET=tu_api_secret_aqui
```

### 2. 🗄️ Configurar Base de Datos Supabase

1. Ve a tu proyecto en [Supabase Dashboard](https://supabase.com/dashboard)
2. Navega a **SQL Editor**
3. Ejecuta el archivo `supabase_setup.sql` (copia y pega todo el contenido)
4. Verifica que todas las tablas se crearon correctamente

### 3. 👤 Crear Usuario Administrador "Keila"

#### Paso 3.1: Crear usuario en Authentication
1. Ve a **Authentication > Users** en Supabase
2. Haz clic en **"Add user"**
3. Completa los datos:
   - **Email**: `keila@glowhair.com`
   - **Password**: `Admin123!` (o el password que prefieras)
   - **Confirm Password**: El mismo password
4. Haz clic en **"Create user"**

#### Paso 3.2: Ejecutar script de perfil
1. Ve a **SQL Editor** nuevamente
2. Ejecuta el archivo `create_admin_user.sql`
3. Verifica que el usuario aparece con rol "admin"

### 4. ☁️ Configurar Cloudinary

1. Ve a [Cloudinary Dashboard](https://cloudinary.com/console)
2. Copia tu **Cloud Name**, **API Key** y **API Secret**
3. Actualiza tu archivo `.env.local` con estos valores
4. Crea una carpeta llamada "glowhair" en tu Cloudinary para organizar las imágenes

### 5. 🛠️ Instalar Dependencias

```bash
npm install
```

### 6. 🏃‍♂️ Ejecutar la Aplicación

```bash
npm run dev
```

### 7. 🎯 Probar el Sistema

1. **Página principal**: http://localhost:3000
2. **Login admin**: http://localhost:3000/login
   - Email: `keila@glowhair.com`
   - Password: El que configuraste
3. **Dashboard admin**: http://localhost:3000/admin

## 🔧 Funcionalidades Implementadas

### ✅ Sistema de Autenticación
- Login/Register con Supabase Auth
- Protección de rutas administrativas
- Roles de usuario (admin/customer)

### ✅ Base de Datos Completa
- 14+ tablas para e-commerce completo
- Productos, pedidos, usuarios, reviews, cupones
- Sistema de inventario y categorías
- Row Level Security (RLS) implementado

### ✅ Panel Administrativo
- Dashboard con estadísticas
- Gestión de productos (CRUD completo)
- Gestión de pedidos
- Gestión de clientes
- Analytics y reportes

### ✅ Funcionalidades de Cliente
- Catálogo de productos con filtros
- Carrito de compras
- Sistema de favoritos
- Proceso de checkout
- Historial de pedidos

### ✅ Gestión de Imágenes
- Upload automático a Cloudinary
- Organización por carpetas
- Múltiples imágenes por producto
- Optimización automática

## 🎨 Próximos Pasos Sugeridos

1. **Personalizar productos**: Agrega productos reales desde el panel admin
2. **Configurar pagos**: Integrar Stripe o PayPal
3. **Emails**: Configurar envío de emails transaccionales
4. **SEO**: Optimizar para motores de búsqueda
5. **Analytics**: Integrar Google Analytics
6. **Performance**: Optimizar imágenes y carga

## 🆘 Solución de Problemas

### Error de conexión a Supabase
- Verifica que las URLs y keys están correctas en `.env.local`
- Asegúrate de que el proyecto de Supabase está activo

### Error de autenticación
- Verifica que el usuario existe en Supabase Auth
- Confirma que el perfil se creó correctamente con rol "admin"

### Problemas con imágenes
- Verifica la configuración de Cloudinary
- Asegúrate de que la carpeta "glowhair" existe

---

**¡Tu sistema de e-commerce GlowHair está listo para funcionar! 🎉**

Para cualquier duda, revisa los archivos de configuración o consulta la documentación de Supabase y Cloudinary.
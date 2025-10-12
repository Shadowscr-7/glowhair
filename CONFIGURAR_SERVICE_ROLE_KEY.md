# 🔑 Configurar Service Role Key de Supabase

## ¿Por qué es necesaria?

La **Service Role Key** permite realizar operaciones administrativas en Supabase **sin estar limitado por las políticas RLS (Row Level Security)**. Esto es esencial para:

- ✅ Crear/editar/eliminar productos desde el panel de administración
- ✅ Evitar errores de recursión infinita en políticas RLS
- ✅ Realizar operaciones que requieren permisos elevados

## 📋 Pasos para obtener la Service Role Key

### 1. Ir al Dashboard de Supabase
Abre tu proyecto en: https://supabase.com/dashboard

### 2. Navegar a Settings > API
- En el menú lateral, click en **Settings** (⚙️)
- Luego click en **API**

### 3. Encontrar la Service Role Key
Busca la sección **Project API keys** y encontrarás:
- `anon` / `public` - Ya la tienes configurada
- **`service_role`** - Esta es la que necesitas ⚠️

### 4. Copiar y agregar a .env.local
Copia el valor completo de `service_role` y agrégalo a tu archivo `.env.local`:

```env
# Supabase Service Role Key (NUNCA expongas esto al cliente)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...tu_key_completa_aqui
```

⚠️ **IMPORTANTE: Esta key tiene acceso TOTAL a tu base de datos**
- NUNCA la subas a GitHub
- NUNCA la pongas en variables que empiecen con `NEXT_PUBLIC_`
- Solo úsala en código del servidor (API routes)

### 5. Reiniciar el servidor de desarrollo
Después de agregar la variable de entorno:

```bash
# Detener el servidor (Ctrl + C)
# Volver a iniciar
npm run dev
```

## 🧪 Verificar que funciona

1. Ve a `/admin/productos/nuevo`
2. Sube una imagen de un producto
3. Llena los campos (se auto-completan con IA)
4. Click en **Guardar Producto**
5. Deberías ver el toast verde: **"¡Producto creado correctamente!"** ✅

Si aún ves errores, revisa la consola del servidor para más detalles.

## 🔒 Seguridad

El código está configurado para:
- Usar `supabaseAdmin` (service_role) solo en operaciones administrativas
- Si no está configurada, fallback a `supabase` (anon key)
- Nunca exponer la service_role key al navegador del cliente

## ❓ Problemas comunes

### Error: "supabaseAdmin is null"
- Asegúrate de que la variable `SUPABASE_SERVICE_ROLE_KEY` está en `.env.local`
- Verifica que no tiene espacios al principio o final
- Reinicia el servidor después de agregar la variable

### Error: "Invalid API key"
- La service_role key debe ser exactamente como aparece en Supabase
- No debe tener comillas alrededor
- Debe ser la key completa (muy larga, comienza con `eyJ...`)

### Sigue fallando
- Revisa la consola del navegador y del servidor
- Verifica que ejecutaste `fix_rls_products.sql` en Supabase
- Asegúrate de estar logueado en la aplicación

---

**Última actualización:** 2025-10-11

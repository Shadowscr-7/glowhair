# 📸 Configuración de Instagram OAuth - GlowHair

## ⚠️ Nota Importante

Instagram no tiene un proveedor OAuth independiente en Supabase. Instagram es propiedad de Meta (Facebook), por lo que el login con Instagram se realiza a través de **Facebook OAuth con permisos adicionales**.

---

## 🔧 Implementación Actual

### Lo que hemos implementado:

```typescript
// src/context/NewAuthContext.tsx
const signInWithInstagram = async () => {
  try {
    // Instagram usa Facebook OAuth con permisos adicionales
    await supabase.auth.signInWithOAuth({
      provider: 'facebook',
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback`,
        scopes: 'email,public_profile,instagram_basic',
      },
    });
  } catch (error) {
    console.error('Error con Instagram login:', error);
  }
};
```

### Cómo funciona:

1. **Usuario hace clic en botón de Instagram**
2. **Sistema usa Facebook OAuth** con permisos de Instagram
3. **Usuario autoriza con Facebook** (que está vinculado a Instagram)
4. **Sistema obtiene acceso** a datos básicos de Instagram

---

## 📋 Configuración Paso a Paso

### 1. Configurar Facebook App (Prerequisito)

Antes de Instagram, necesitas configurar Facebook OAuth:

1. Ve a [Facebook Developers](https://developers.facebook.com/)
2. Crea una nueva app o selecciona una existente
3. Agrega el producto **"Facebook Login"**
4. Configura las URLs:
   ```
   Valid OAuth Redirect URIs:
   - https://[TU-PROYECTO].supabase.co/auth/v1/callback
   - http://localhost:3000/api/auth/callback
   ```

### 2. Agregar Instagram Basic Display

1. En el Dashboard de tu app de Facebook
2. Ve a **"Products"** → **"Add Product"**
3. Busca y agrega **"Instagram Basic Display"**
4. Haz clic en **"Set Up"**

### 3. Crear una App de Instagram

1. Dentro de Instagram Basic Display, haz clic en **"Create New App"**
2. Completa los campos requeridos:
   ```
   Display Name: GlowHair
   ```

3. Configura las URLs:
   ```
   Valid OAuth Redirect URIs:
   - https://[TU-PROYECTO].supabase.co/auth/v1/callback
   - http://localhost:3000/api/auth/callback
   
   Deauthorize Callback URL:
   - https://[TU-PROYECTO].supabase.co/auth/v1/callback
   
   Data Deletion Request URL:
   - https://[TU-PROYECTO].supabase.co/auth/v1/callback
   ```

### 4. Obtener Credenciales

1. En **"Instagram Basic Display"** → **"Basic Display"**
2. Copia:
   - **Instagram App ID**
   - **Instagram App Secret**

### 5. Configurar Permisos

En la sección de permisos, asegúrate de tener:
- ✅ `instagram_basic` - Acceso básico al perfil
- ✅ `user_profile` - Información del perfil
- ✅ `user_media` - Acceso a fotos (opcional)

### 6. Agregar Testers

⚠️ **Importante**: Las apps de Instagram en modo desarrollo solo funcionan con usuarios testers.

1. Ve a **"Roles"** → **"Instagram Testers"**
2. Haz clic en **"Add Instagram Testers"**
3. Ingresa tu nombre de usuario de Instagram
4. **En Instagram**: Ve a Configuración → Apps y Sitios Web → Invitaciones de Testers → Acepta

### 7. Configurar en Supabase

1. Ve a **Supabase Dashboard** → **Authentication** → **Providers**
2. Activa **Facebook**
3. Ingresa:
   ```
   Facebook Client ID: [Tu Facebook App ID]
   Facebook Client Secret: [Tu Facebook App Secret]
   ```
4. En la sección de **"Scopes"**, agrega:
   ```
   email,public_profile,instagram_basic
   ```

---

## 🧪 Probar el Login

### En Desarrollo (localhost)

1. Inicia tu servidor: `npm run dev`
2. Ve a `http://localhost:3000/login`
3. Haz clic en el botón de Instagram
4. Deberías ser redirigido a Facebook para autorizar
5. Después de autorizar, regresarás a tu app

### ⚠️ Limitaciones en Desarrollo

- Solo funcionará con usuarios testers
- La app debe estar en modo desarrollo en Facebook
- Se requiere autorización manual de cada tester

---

## 🚀 Pasar a Producción

### 1. Cambiar a Modo Live

1. En Facebook Developers Dashboard
2. Ve a **"Settings"** → **"Basic"**
3. Cambia el switch de **"Development"** a **"Live"**

### 2. Completar App Review

Para usar Instagram con usuarios reales, necesitas:

1. **Completar la información de la app**:
   - Icono de la app (1024x1024)
   - Categoría de la app
   - Política de privacidad
   - Términos de servicio

2. **Solicitar revisión de permisos**:
   - Ve a **"App Review"** → **"Permissions and Features"**
   - Solicita revisión para `instagram_basic`
   - Proporciona:
     - Capturas de pantalla mostrando el flujo de login
     - Video demo de la funcionalidad
     - Descripción de cómo usarás los datos

3. **Tiempo de espera**: 
   - La revisión puede tomar de 3-5 días hábiles

---

## 💡 Alternativas Más Simples

Si Instagram es complicado de configurar, considera:

### Opción 1: Solo Google y Facebook
```tsx
// Remover el botón de Instagram temporalmente
<div className="mt-6 grid grid-cols-2 gap-3">
  <button onClick={signInWithGoogle}>Google</button>
  <button onClick={signInWithFacebook}>Facebook</button>
</div>
```

### Opción 2: Login con Email Solamente
```tsx
// Enfocarse en login tradicional
<form onSubmit={handleEmailLogin}>
  <input type="email" />
  <input type="password" />
  <button>Iniciar Sesión</button>
</form>
```

### Opción 3: Implementar más tarde
- Deja el botón visible pero deshabilitado
- Muestra un mensaje: "Próximamente"
- Implementa cuando tengas más tiempo

---

## 🔍 Debugging

### Problema: "URL no autorizada"
**Solución**: Verifica que todas las URLs de callback estén configuradas correctamente en Facebook Developers.

### Problema: "App no aprobada"
**Solución**: Asegúrate de que la app esté en modo "Live" y los permisos estén aprobados.

### Problema: "Usuario no es tester"
**Solución**: En desarrollo, solo usuarios testers pueden usar la app. Agrégalos en Roles → Instagram Testers.

### Problema: "Instagram no conecta con Facebook"
**Solución**: Asegúrate de que tu cuenta de Instagram esté vinculada a tu cuenta de Facebook.

---

## 📊 Datos que Puedes Obtener

Con `instagram_basic` obtienes:
- ✅ ID de usuario de Instagram
- ✅ Nombre de usuario
- ✅ Tipo de cuenta
- ✅ Recuento de medios

**NO obtienes**:
- ❌ Email (debe obtenerse de Facebook)
- ❌ Posts recientes
- ❌ Followers/Following
- ❌ Stories

---

## 🎯 Recomendación

**Para GlowHair, te recomiendo:**

### Fase 1 (Ahora):
1. ✅ Implementar Google OAuth (fácil y rápido)
2. ✅ Implementar Facebook OAuth (medianamente fácil)
3. ⏸️ Dejar Instagram para después

### Fase 2 (Más adelante):
1. Configurar Instagram cuando tengas más usuarios
2. Hacer el App Review de Facebook
3. Activar Instagram en producción

---

## 🔗 Enlaces Útiles

- [Facebook Developers](https://developers.facebook.com/)
- [Instagram Basic Display API](https://developers.facebook.com/docs/instagram-basic-display-api)
- [Supabase OAuth Docs](https://supabase.com/docs/guides/auth/social-login)
- [Meta App Review Process](https://developers.facebook.com/docs/app-review)

---

## ✅ Estado Actual

- ✅ Botón de Instagram agregado en UI
- ✅ Función `signInWithInstagram` implementada
- ✅ Redirige a Facebook OAuth con permisos de Instagram
- ⏸️ Requiere configuración adicional en Facebook Developers
- ⏸️ Requiere App Review para producción

---

**¿Deseas que te ayude con la configuración de Google y Facebook primero, que son más simples?**

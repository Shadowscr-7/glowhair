# ⚡ Guía Rápida - Configurar OAuth en 10 Minutos

Esta guía te ayudará a configurar Google y Facebook OAuth de forma rápida y sencilla.

---

## 🔵 GOOGLE OAUTH (5 minutos)

### Paso 1: Ir a Google Cloud Console
Ve a: https://console.cloud.google.com/

### Paso 2: Crear/Seleccionar Proyecto
```
1. Haz clic en el selector de proyectos (arriba)
2. Clic en "NEW PROJECT"
3. Nombre: "GlowHair"
4. Clic en "CREATE"
```

### Paso 3: Habilitar OAuth
```
1. En el menú lateral: APIs & Services → Credentials
2. Clic en "+ CREATE CREDENTIALS"
3. Selecciona "OAuth 2.0 Client ID"
```

### Paso 4: Configurar Pantalla de Consentimiento
```
Primera vez:
1. Clic en "CONFIGURE CONSENT SCREEN"
2. Selecciona "External"
3. Completa:
   - App name: GlowHair
   - User support email: tu@email.com
   - Developer contact: tu@email.com
4. Clic en "SAVE AND CONTINUE" (3 veces)
5. Clic en "BACK TO DASHBOARD"
```

### Paso 5: Crear Credenciales OAuth
```
1. Vuelve a: Credentials → "+ CREATE CREDENTIALS" → "OAuth 2.0 Client ID"
2. Application type: "Web application"
3. Name: "GlowHair Web"
4. Authorized JavaScript origins:
   - http://localhost:3000
   - https://tu-dominio.com (producción)
   
5. Authorized redirect URIs:
   ⚠️ IMPORTANTE - Copia exactamente de Supabase:
   
   a) Ve a tu Supabase Dashboard
   b) Authentication → Providers → Google
   c) Copia el "Callback URL (for OAuth)" que aparece
   d) Debería verse así:
      https://xxxxxxxxxxxxx.supabase.co/auth/v1/callback
   
   e) Pégalo en "Authorized redirect URIs"
   f) También agrega:
      http://localhost:3000/api/auth/callback

6. Clic en "CREATE"
```

### Paso 6: Copiar Credenciales
```
📋 Copia:
- Client ID: 1234567890-abcdefg.apps.googleusercontent.com
- Client Secret: GOCSPX-xxxxxxxxxxxxxxxx

⚠️ Guárdalos en un lugar seguro!
```

### Paso 7: Configurar en Supabase
```
1. Ve a tu Supabase Dashboard
2. Authentication → Providers
3. Busca "Google"
4. Actívalo (toggle a ON)
5. Pega:
   - Client ID (from Google)
   - Client Secret (from Google)
6. Clic en "Save"
```

### ✅ Probar Google OAuth
```
1. Ve a http://localhost:3000/login
2. Haz clic en "Google"
3. Selecciona tu cuenta de Google
4. Deberías regresar a tu app autenticado
```

---

## 🔵 FACEBOOK OAUTH (5 minutos)

### Paso 1: Ir a Facebook Developers
Ve a: https://developers.facebook.com/

### Paso 2: Crear App
```
1. Clic en "My Apps" (arriba derecha)
2. Clic en "Create App"
3. Selecciona "Consumer" o "None"
4. Clic en "Next"
```

### Paso 3: Información Básica
```
1. App name: GlowHair
2. App contact email: tu@email.com
3. Clic en "Create App"
4. Completa el captcha de seguridad
```

### Paso 4: Agregar Facebook Login
```
1. En el Dashboard de tu app
2. Busca "Add Product"
3. Encuentra "Facebook Login"
4. Clic en "Set Up"
```

### Paso 5: Configurar Facebook Login
```
1. En el menú lateral: Facebook Login → Settings
2. En "Valid OAuth Redirect URIs" agrega:
   
   ⚠️ IMPORTANTE - Obtén la URL de Supabase:
   
   a) Ve a tu Supabase Dashboard
   b) Authentication → Providers → Facebook
   c) Copia el "Callback URL (for OAuth)"
   d) Debería verse así:
      https://xxxxxxxxxxxxx.supabase.co/auth/v1/callback
   
   e) Pégala en "Valid OAuth Redirect URIs"
   f) También agrega:
      http://localhost:3000/api/auth/callback

3. Clic en "Save Changes"
```

### Paso 6: Obtener Credenciales
```
1. En el menú lateral: Settings → Basic
2. 📋 Copia:
   - App ID: 1234567890123456
   - App Secret: (clic en "Show") abcdef1234567890

⚠️ Guárdalos en un lugar seguro!
```

### Paso 7: Configurar en Supabase
```
1. Ve a tu Supabase Dashboard
2. Authentication → Providers
3. Busca "Facebook"
4. Actívalo (toggle a ON)
5. Pega:
   - Client ID: [Tu App ID de Facebook]
   - Client Secret: [Tu App Secret de Facebook]
6. Clic en "Save"
```

### Paso 8: Cambiar a Modo Live (Opcional)
```
Para que funcione con usuarios reales (no solo tú):

1. En Facebook Developers Dashboard
2. Arriba, donde dice "App Mode: Development"
3. Clic en el switch
4. Selecciona una categoría (ej: "Shopping")
5. Agrega:
   - Icono de la app (1024x1024)
   - Privacy Policy URL
   - Terms of Service URL
6. Clic en "Switch Mode"
```

### ✅ Probar Facebook OAuth
```
1. Ve a http://localhost:3000/login
2. Haz clic en "Facebook"
3. Autoriza la aplicación
4. Deberías regresar a tu app autenticado
```

---

## 🚨 Problemas Comunes

### "Invalid redirect_uri"
```
❌ Problema: La URL de callback no coincide
✅ Solución: 
   1. Verifica que copiaste EXACTAMENTE la URL de Supabase
   2. No debe tener espacios ni caracteres extra
   3. Debe empezar con https://
   4. Debe terminar con /auth/v1/callback
```

### "App not set up"
```
❌ Problema: No agregaste el producto correctamente
✅ Solución:
   - Google: Asegúrate de crear OAuth 2.0 Client ID
   - Facebook: Agrega el producto "Facebook Login"
```

### "This app is in development mode"
```
❌ Problema: Facebook app en modo desarrollo
✅ Solución:
   Opción A: Agrégale como "Tester" en Roles → Testers
   Opción B: Cambia la app a modo "Live"
```

### "OAuth flow failed"
```
❌ Problema: Configuración incorrecta en Supabase
✅ Solución:
   1. Verifica Client ID y Secret
   2. Guarda los cambios en Supabase
   3. Espera 1-2 minutos para que se apliquen
   4. Prueba de nuevo
```

---

## 🎯 Checklist Final

### Google OAuth
- [ ] Proyecto creado en Google Cloud Console
- [ ] Pantalla de consentimiento configurada
- [ ] OAuth 2.0 Client ID creado
- [ ] Redirect URI agregada (la de Supabase)
- [ ] Client ID y Secret copiados
- [ ] Configurado en Supabase Dashboard
- [ ] Probado en localhost

### Facebook OAuth
- [ ] App creada en Facebook Developers
- [ ] Facebook Login agregado como producto
- [ ] Redirect URI configurada (la de Supabase)
- [ ] App ID y App Secret copiados
- [ ] Configurado en Supabase Dashboard
- [ ] (Opcional) App en modo Live
- [ ] Probado en localhost

---

## 📱 URLs de Referencia Rápida

### Obtener tus URLs de Callback de Supabase:
```
1. Ve a: https://app.supabase.com
2. Selecciona tu proyecto
3. Authentication → Providers
4. Para cada provider (Google, Facebook), copia el "Callback URL"

Ejemplo:
https://abcdefghijklmnop.supabase.co/auth/v1/callback
```

### Configurar URLs en tu Proyecto:
```javascript
// En tu código, las redirecciones ya están configuradas:
redirectTo: `${window.location.origin}/api/auth/callback`

// localhost: http://localhost:3000/api/auth/callback
// producción: https://tudominio.com/api/auth/callback
```

---

## 🔐 Variables de Entorno (Opcional)

Si quieres agregar las credenciales a tu proyecto:

```env
# .env.local

# Supabase (ya las tienes)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxxxx

# Google OAuth (opcional - solo para referencia)
GOOGLE_CLIENT_ID=xxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxx

# Facebook OAuth (opcional - solo para referencia)
FACEBOOK_APP_ID=xxxxx
FACEBOOK_APP_SECRET=xxxxx
```

**Nota**: No necesitas estas variables en tu código ya que Supabase las maneja automáticamente.

---

## ✅ ¡Listo!

Una vez completados estos pasos:

1. ✅ Google OAuth funcionando
2. ✅ Facebook OAuth funcionando
3. ✅ Instagram usa Facebook (con permisos adicionales)

### Probar Todo:
```bash
# Inicia tu servidor
npm run dev

# Abre el navegador
http://localhost:3000/login

# Prueba cada botón:
1. Google → Debería funcionar ✅
2. Facebook → Debería funcionar ✅
3. Instagram → Usa Facebook OAuth ✅
```

---

## 🎓 Siguiente Paso

Ahora que tienes OAuth funcionando, puedes:

1. **Agregar más campos al registro**
   - Tipo de cabello
   - Teléfono
   - Dirección

2. **Mejorar el perfil de usuario**
   - Foto de perfil de OAuth
   - Información de redes sociales

3. **Continuar con APIs de productos**
   - Listar productos
   - Agregar al carrito
   - Checkout

**¿Deseas que continúe con alguna de estas opciones?**

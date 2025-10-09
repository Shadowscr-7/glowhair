# 🔧 Solución al Error DNS_PROBE_FINISHED_NXDOMAIN en OAuth

## ❌ Error Que Estás Viendo
```
DNS_PROBE_FINISHED_NXDOMAIN
mfcdxnfppgvyknbsdmzy.supabase.co/auth/v1/authorize?provider=google&redirect_to=https://glowhair.vercel.app/api/auth/callback
```

## 🎯 Causa del Problema
Las URLs de redirección no están configuradas correctamente en Google Cloud Console y/o Supabase.

---

## ✅ SOLUCIÓN COMPLETA

### PASO 1: Obtener tu URL de Callback de Supabase

1. Ve a tu **Supabase Dashboard**: https://supabase.com/dashboard
2. Selecciona tu proyecto
3. Ve a: **Authentication** → **URL Configuration**
4. Busca la sección **"Site URL"** y **"Redirect URLs"**

**Tu información actual:**
- Supabase URL: `https://mfcdxnfppgvyknbsdmzy.supabase.co`
- Callback URL correcta: `https://mfcdxnfppgvyknbsdmzy.supabase.co/auth/v1/callback`

---

### PASO 2: Configurar URLs en Supabase Dashboard

#### A. Site URL (URL principal de tu app)
```
Para desarrollo:
http://localhost:3000

Para producción (cuando esté lista):
https://glowhair.vercel.app
```

#### B. Redirect URLs (URLs permitidas después de login)
Agrega TODAS estas:
```
http://localhost:3000
http://localhost:3000/**
https://glowhair.vercel.app
https://glowhair.vercel.app/**
https://mfcdxnfppgvyknbsdmzy.supabase.co/auth/v1/callback
```

**Cómo hacerlo:**
1. En Supabase Dashboard → Authentication → URL Configuration
2. En "Site URL" pon: `http://localhost:3000` (para desarrollo)
3. En "Redirect URLs" agrega las URLs de arriba (una por línea)
4. Clic en **SAVE**

---

### PASO 3: Configurar Google Cloud Console

#### A. Ve a Google Cloud Console
https://console.cloud.google.com/

#### B. Selecciona tu proyecto "GlowHair"

#### C. Ve a: APIs & Services → Credentials

#### D. Edita tu OAuth 2.0 Client ID

**Authorized JavaScript origins:**
```
http://localhost:3000
https://glowhair.vercel.app
https://mfcdxnfppgvyknbsdmzy.supabase.co
```

**Authorized redirect URIs (MUY IMPORTANTE):**
```
http://localhost:3000/api/auth/callback
https://glowhair.vercel.app/api/auth/callback
https://mfcdxnfppgvyknbsdmzy.supabase.co/auth/v1/callback
```

#### E. Clic en **SAVE**

---

### PASO 4: Verificar Configuración en Supabase Providers

1. Ve a: **Authentication** → **Providers**
2. Busca **Google**
3. Verifica que esté **ENABLED** (toggle en ON)
4. Verifica que tengas:
   - ✅ Client ID copiado de Google
   - ✅ Client Secret copiado de Google
5. **IMPORTANTE:** En "Redirect URL" debe estar:
   ```
   https://mfcdxnfppgvyknbsdmzy.supabase.co/auth/v1/callback
   ```
6. Clic en **SAVE**

---

### PASO 5: Actualizar tu Código (si es necesario)

Verifica que tu archivo `.env.local` tenga:

```env
NEXT_PUBLIC_SUPABASE_URL=https://mfcdxnfppgvyknbsdmzy.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1mY2R4bmZwcGd2eWtuYnNkbXp5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkwMzQ2MDMsImV4cCI6MjA3NDYxMDYwM30.jMZJpu67wr6TEaq8YrGMDij6aJrerzPnNLpifv3GdIg
```

---

### PASO 6: Reiniciar tu Aplicación

```bash
# Detén el servidor si está corriendo (Ctrl+C)
# Luego reinicia:
npm run dev
```

---

### PASO 7: Probar OAuth

1. Ve a: http://localhost:3000/login
2. Haz clic en el botón de **Google**
3. Deberías ver la pantalla de selección de cuenta de Google
4. Selecciona tu cuenta
5. Deberías ser redirigido de vuelta a tu app autenticado

---

## 🔍 URLs Correctas Para Cada Entorno

### **Desarrollo (localhost)**
```
Site URL: http://localhost:3000
Callback: http://localhost:3000/api/auth/callback
OAuth Callback: https://mfcdxnfppgvyknbsdmzy.supabase.co/auth/v1/callback
```

### **Producción (Vercel)**
```
Site URL: https://glowhair.vercel.app
Callback: https://glowhair.vercel.app/api/auth/callback
OAuth Callback: https://mfcdxnfppgvyknbsdmzy.supabase.co/auth/v1/callback
```

---

## 🐛 Solución de Problemas Comunes

### Error: "redirect_uri_mismatch"
**Causa:** La URL de callback no está en Google Cloud Console
**Solución:** Asegúrate de que `https://mfcdxnfppgvyknbsdmzy.supabase.co/auth/v1/callback` esté en las "Authorized redirect URIs"

### Error: "DNS_PROBE_FINISHED_NXDOMAIN"
**Causa:** Estás siendo redirigido a una URL incorrecta
**Solución:** Verifica que en Supabase Dashboard, el "Site URL" sea `http://localhost:3000` para desarrollo

### Error: "Access Denied"
**Causa:** Las credenciales de Google no están configuradas correctamente en Supabase
**Solución:** 
1. Ve a Supabase → Authentication → Providers → Google
2. Verifica Client ID y Client Secret
3. Clic en SAVE

---

## ✅ Checklist Final

Antes de probar, asegúrate de que:

- [ ] Site URL en Supabase = `http://localhost:3000`
- [ ] Redirect URLs en Supabase incluyen localhost y Vercel
- [ ] Google Cloud Console tiene las 3 redirect URIs correctas
- [ ] Google Provider está ENABLED en Supabase
- [ ] Client ID y Secret están copiados correctamente
- [ ] Reiniciaste el servidor (`npm run dev`)
- [ ] Estás probando en http://localhost:3000 (no en otra URL)

---

## 📞 Si Sigue Sin Funcionar

1. Borra el caché del navegador (Ctrl+Shift+Del)
2. Abre una ventana de incógnito
3. Intenta de nuevo

Si el problema persiste, revisa:
- Los logs en Supabase Dashboard → Logs → Auth
- La consola del navegador (F12) para ver errores específicos

---

## 🎯 Resumen Rápido

**El problema principal:** Tu Site URL en Supabase probablemente está configurada como `https://glowhair.vercel.app`, pero estás probando en `localhost`.

**La solución:** Cambiar Site URL a `http://localhost:3000` en Supabase Dashboard → Authentication → URL Configuration.

**Después:** Cuando despliegues a producción, cámbiala a `https://glowhair.vercel.app`.

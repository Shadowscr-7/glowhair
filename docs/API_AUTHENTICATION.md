# 🔐 APIs de Autenticación - GlowHair

## Descripción General

Conjunto completo de endpoints para gestionar la autenticación de usuarios en GlowHair. Soporta registro con email/password y OAuth (Google, Facebook).

---

## 📋 Endpoints Disponibles

### 1. **POST** `/api/auth/signup` - Registro de Usuario

Crea una nueva cuenta de usuario con email y contraseña.

**Request Body:**
```json
{
  "email": "usuario@ejemplo.com",
  "password": "password123",
  "fullName": "María García",
  "phone": "+52 55 1234 5678",
  "hairType": "rizado"
}
```

**Campos:**
- `email` (requerido): Email del usuario
- `password` (requerido): Contraseña (mínimo 6 caracteres)
- `fullName` (opcional): Nombre completo del usuario
- `phone` (opcional): Teléfono de contacto
- `hairType` (opcional): Tipo de cabello (liso, ondulado, rizado, afro)

**Response Success (201):**
```json
{
  "user": {
    "id": "uuid-del-usuario",
    "email": "usuario@ejemplo.com",
    "created_at": "2024-01-15T10:30:00Z"
  },
  "message": "Usuario creado exitosamente. Por favor verifica tu email."
}
```

**Response Error (400):**
```json
{
  "error": "El email y la contraseña son requeridos"
}
```

**Response Error (409):**
```json
{
  "error": "Este email ya está registrado"
}
```

---

### 2. **POST** `/api/auth/signin` - Inicio de Sesión

Autentica un usuario existente.

**Request Body:**
```json
{
  "email": "usuario@ejemplo.com",
  "password": "password123"
}
```

**Response Success (200):**
```json
{
  "user": {
    "id": "uuid-del-usuario",
    "email": "usuario@ejemplo.com"
  },
  "session": {
    "access_token": "jwt-token",
    "refresh_token": "refresh-token",
    "expires_at": 1705320000
  },
  "message": "Inicio de sesión exitoso"
}
```

**Response Error (401):**
```json
{
  "error": "Email o contraseña incorrectos"
}
```

---

### 3. **POST** `/api/auth/signout` - Cerrar Sesión

Cierra la sesión del usuario actual.

**Request:** No requiere body

**Response Success (200):**
```json
{
  "message": "Sesión cerrada exitosamente"
}
```

**Response Error (500):**
```json
{
  "error": "Error al cerrar sesión"
}
```

---

### 4. **POST** `/api/auth/reset-password` - Solicitar Restablecimiento de Contraseña

Envía un email con link para restablecer la contraseña.

**Request Body:**
```json
{
  "email": "usuario@ejemplo.com"
}
```

**Response Success (200):**
```json
{
  "message": "Si el email existe, recibirás un correo para restablecer tu contraseña"
}
```

**Nota:** Por seguridad, siempre devuelve éxito aunque el email no exista.

---

### 5. **POST** `/api/auth/update-password` - Actualizar Contraseña

Actualiza la contraseña del usuario autenticado.

**Request Body:**
```json
{
  "newPassword": "nuevaPassword123"
}
```

**Campos:**
- `newPassword` (requerido): Nueva contraseña (mínimo 6 caracteres)

**Response Success (200):**
```json
{
  "message": "Contraseña actualizada exitosamente"
}
```

**Response Error (401):**
```json
{
  "error": "Error al actualizar la contraseña. Verifica que estés autenticado."
}
```

---

### 6. **GET** `/api/auth/me` - Obtener Usuario Actual

Devuelve la información del usuario autenticado y su perfil.

**Request:** No requiere body (usa sesión actual)

**Response Success (200):**
```json
{
  "user": {
    "id": "uuid-del-usuario",
    "email": "usuario@ejemplo.com",
    "email_verified": true,
    "created_at": "2024-01-15T10:30:00Z"
  },
  "profile": {
    "id": "uuid-del-usuario",
    "email": "usuario@ejemplo.com",
    "full_name": "María García",
    "first_name": "María",
    "last_name": "García",
    "phone": "+52 55 1234 5678",
    "avatar_url": "https://...",
    "hair_type": "rizado",
    "role": "customer",
    "is_verified": true,
    "is_active": true,
    "created_at": "2024-01-15T10:30:00Z"
  }
}
```

**Response Error (401):**
```json
{
  "error": "No autenticado"
}
```

---

### 7. **GET** `/api/auth/callback` - OAuth Callback

Endpoint para manejar el callback de autenticación OAuth (Google, Facebook).

**Parámetros URL:**
- `code`: Código de autorización de OAuth

**Response:** Redirección a la página principal o login con error

**Nota:** Este endpoint es utilizado internamente por Supabase durante el flujo OAuth.

---

## 🔑 Autenticación OAuth

### Google OAuth

Para habilitar login con Google:

1. Ve a Supabase Dashboard → Authentication → Providers
2. Activa "Google"
3. Configura las credenciales desde [Google Cloud Console](https://console.cloud.google.com/):
   - Client ID
   - Client Secret
   - Redirect URL: `https://[TU-PROYECTO].supabase.co/auth/v1/callback`

**Uso en Frontend:**
```typescript
import { signInWithGoogle } from '@/lib/services/auth';

const handleGoogleLogin = async () => {
  const { error } = await signInWithGoogle();
  if (error) {
    console.error('Error:', error);
  }
  // Supabase manejará la redirección automáticamente
};
```

---

### Facebook OAuth

Para habilitar login con Facebook:

1. Ve a Supabase Dashboard → Authentication → Providers
2. Activa "Facebook"
3. Configura las credenciales desde [Facebook Developers](https://developers.facebook.com/):
   - App ID
   - App Secret
   - Redirect URL: `https://[TU-PROYECTO].supabase.co/auth/v1/callback`

**Uso en Frontend:**
```typescript
import { signInWithFacebook } from '@/lib/services/auth';

const handleFacebookLogin = async () => {
  const { error } = await signInWithFacebook();
  if (error) {
    console.error('Error:', error);
  }
};
```

---

## 🔒 Configuración de Seguridad

### Variables de Entorno Requeridas

```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
```

### URL de Redirección OAuth

Configura en Supabase Dashboard:
- **Development:** `http://localhost:3000/api/auth/callback`
- **Production:** `https://tu-dominio.com/api/auth/callback`

---

## 📝 Ejemplos de Uso

### Registro con Email/Password

```typescript
const handleSignUp = async (e: FormEvent) => {
  e.preventDefault();
  
  const response = await fetch('/api/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'maria@ejemplo.com',
      password: 'password123',
      fullName: 'María García',
      hairType: 'rizado'
    })
  });
  
  const data = await response.json();
  
  if (response.ok) {
    alert('¡Registro exitoso! Verifica tu email.');
  } else {
    alert(data.error);
  }
};
```

---

### Login con Email/Password

```typescript
const handleSignIn = async (e: FormEvent) => {
  e.preventDefault();
  
  const response = await fetch('/api/auth/signin', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'maria@ejemplo.com',
      password: 'password123'
    })
  });
  
  const data = await response.json();
  
  if (response.ok) {
    // Redirigir al dashboard
    window.location.href = '/';
  } else {
    alert(data.error);
  }
};
```

---

### Obtener Usuario Actual

```typescript
const getCurrentUser = async () => {
  const response = await fetch('/api/auth/me');
  
  if (response.ok) {
    const data = await response.json();
    console.log('Usuario:', data.user);
    console.log('Perfil:', data.profile);
  } else {
    // Usuario no autenticado
    window.location.href = '/login';
  }
};
```

---

### Cerrar Sesión

```typescript
const handleLogout = async () => {
  const response = await fetch('/api/auth/signout', {
    method: 'POST'
  });
  
  if (response.ok) {
    window.location.href = '/login';
  }
};
```

---

### Recuperar Contraseña

```typescript
const handleResetPassword = async (email: string) => {
  const response = await fetch('/api/auth/reset-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  });
  
  const data = await response.json();
  alert(data.message);
};
```

---

## 🧪 Testing

### Probar Registro
```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@ejemplo.com",
    "password": "password123",
    "fullName": "Usuario Test"
  }'
```

### Probar Login
```bash
curl -X POST http://localhost:3000/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@ejemplo.com",
    "password": "password123"
  }'
```

---

## ✅ Estados de Respuesta

| Código | Significado | Cuándo se usa |
|--------|-------------|---------------|
| 200 | OK | Operación exitosa (login, logout, obtener perfil) |
| 201 | Created | Usuario creado exitosamente |
| 400 | Bad Request | Datos inválidos o faltantes |
| 401 | Unauthorized | No autenticado o credenciales incorrectas |
| 409 | Conflict | Email ya registrado |
| 500 | Server Error | Error interno del servidor |

---

## 🔄 Próximos Pasos

Ahora puedes continuar con las APIs de:
- **Productos** (`/api/products`)
- **Categorías** (`/api/categories`)
- **Carrito** (`/api/cart`)
- **Pedidos** (`/api/orders`)

¿Deseas que continúe con las APIs de productos?

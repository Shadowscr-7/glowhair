# 💡 Ejemplos de Uso - APIs de Autenticación

Guía práctica con ejemplos reales de cómo usar las APIs de autenticación en tu aplicación GlowHair.

---

## 🎯 Usando el Contexto de Autenticación (Recomendado)

La forma más sencilla es usar el contexto `NewAuthContext` que ya maneja todas las llamadas a las APIs.

### Setup en tu componente:

```tsx
import { useAuth } from '@/context/NewAuthContext';

function MiComponente() {
  const { 
    user,              // Usuario actual (null si no autenticado)
    isAuthenticated,   // Boolean: ¿está autenticado?
    isLoading,         // Boolean: ¿está cargando?
    isAdmin,           // Boolean: ¿es admin?
    signIn,            // Función: login con email/password
    signUp,            // Función: registro
    signOut,           // Función: cerrar sesión
    signInWithGoogle,  // Función: login con Google
    signInWithFacebook // Función: login con Facebook
  } = useAuth();

  // Tu código aquí
}
```

---

## 📋 Ejemplos por Caso de Uso

### 1. Formulario de Login

```tsx
'use client';

import { useState, FormEvent } from 'react';
import { useAuth } from '@/context/NewAuthContext';
import { useRouter } from 'next/navigation';

export default function LoginForm() {
  const { signIn, isLoading } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    const result = await signIn(formData.email, formData.password);
    
    if (result.success) {
      router.push('/'); // Redirigir al home
    } else {
      setError(result.error || 'Error al iniciar sesión');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={formData.email}
        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
        placeholder="Email"
        required
      />
      
      <input
        type="password"
        value={formData.password}
        onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
        placeholder="Contraseña"
        required
      />

      {error && <p className="text-red-500">{error}</p>}
      
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
      </button>
    </form>
  );
}
```

---

### 2. Formulario de Registro

```tsx
'use client';

import { useState, FormEvent } from 'react';
import { useAuth } from '@/context/NewAuthContext';
import { useRouter } from 'next/navigation';

export default function RegisterForm() {
  const { signUp, isLoading } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
    hairType: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    const result = await signUp(
      formData.email,
      formData.password,
      {
        first_name: formData.firstName,
        last_name: formData.lastName,
        phone: formData.phone,
        hair_type: formData.hairType
      }
    );
    
    if (result.success) {
      setSuccess(true);
      // Mostrar mensaje de verificación de email
      setTimeout(() => router.push('/login'), 3000);
    } else {
      setError(result.error || 'Error al registrarse');
    }
  };

  if (success) {
    return (
      <div className="text-center">
        <h2>¡Registro exitoso!</h2>
        <p>Por favor verifica tu email antes de iniciar sesión.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={formData.email}
        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
        placeholder="Email"
        required
      />
      
      <input
        type="password"
        value={formData.password}
        onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
        placeholder="Contraseña (mínimo 6 caracteres)"
        required
        minLength={6}
      />

      <input
        type="text"
        value={formData.firstName}
        onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
        placeholder="Nombre"
      />

      <input
        type="text"
        value={formData.lastName}
        onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
        placeholder="Apellido"
      />

      <input
        type="tel"
        value={formData.phone}
        onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
        placeholder="Teléfono"
      />

      <select
        value={formData.hairType}
        onChange={(e) => setFormData(prev => ({ ...prev, hairType: e.target.value }))}
      >
        <option value="">Selecciona tu tipo de cabello</option>
        <option value="liso">Liso</option>
        <option value="ondulado">Ondulado</option>
        <option value="rizado">Rizado</option>
        <option value="afro">Afro</option>
      </select>

      {error && <p className="text-red-500">{error}</p>}
      
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Registrando...' : 'Registrarse'}
      </button>
    </form>
  );
}
```

---

### 3. Botones de OAuth (Google y Facebook)

```tsx
'use client';

import { useAuth } from '@/context/NewAuthContext';

export default function SocialLoginButtons() {
  const { signInWithGoogle, signInWithFacebook, isLoading } = useAuth();

  return (
    <div className="flex gap-4">
      <button
        onClick={signInWithGoogle}
        disabled={isLoading}
        className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50"
      >
        <GoogleIcon />
        Continuar con Google
      </button>

      <button
        onClick={signInWithFacebook}
        disabled={isLoading}
        className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50"
      >
        <FacebookIcon />
        Continuar con Facebook
      </button>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg className="h-5 w-5" fill="#1877F2" viewBox="0 0 24 24">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  );
}
```

---

### 4. Botón de Logout

```tsx
'use client';

import { useAuth } from '@/context/NewAuthContext';
import { useRouter } from 'next/navigation';

export default function LogoutButton() {
  const { signOut } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut();
    router.push('/login');
  };

  return (
    <button 
      onClick={handleLogout}
      className="text-red-600 hover:text-red-700"
    >
      Cerrar Sesión
    </button>
  );
}
```

---

### 5. Mostrar Información del Usuario

```tsx
'use client';

import { useAuth } from '@/context/NewAuthContext';
import Image from 'next/image';

export default function UserProfile() {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div>Cargando...</div>;
  }

  if (!isAuthenticated || !user) {
    return <div>Por favor inicia sesión</div>;
  }

  return (
    <div className="flex items-center gap-3">
      {user.avatar_url ? (
        <Image
          src={user.avatar_url}
          alt={user.full_name || 'Usuario'}
          width={40}
          height={40}
          className="rounded-full"
        />
      ) : (
        <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
          {user.first_name?.[0] || user.email?.[0] || 'U'}
        </div>
      )}
      
      <div>
        <p className="font-medium">
          {user.full_name || `${user.first_name} ${user.last_name}` || 'Usuario'}
        </p>
        <p className="text-sm text-gray-500">{user.email}</p>
      </div>
    </div>
  );
}
```

---

### 6. Proteger Rutas (Middleware Pattern)

```tsx
'use client';

import { useEffect } from 'react';
import { useAuth } from '@/context/NewAuthContext';
import { useRouter } from 'next/navigation';

export default function ProtectedPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return <div>Cargando...</div>;
  }

  if (!isAuthenticated) {
    return null; // Se está redirigiendo
  }

  return (
    <div>
      <h1>Contenido Protegido</h1>
      <p>Solo usuarios autenticados pueden ver esto.</p>
    </div>
  );
}
```

---

### 7. Proteger Rutas de Admin

```tsx
'use client';

import { useEffect } from 'react';
import { useAuth } from '@/context/NewAuthContext';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push('/login');
      } else if (!isAdmin) {
        router.push('/'); // No es admin, redirect a home
      }
    }
  }, [isAuthenticated, isAdmin, isLoading, router]);

  if (isLoading) {
    return <div>Cargando...</div>;
  }

  if (!isAuthenticated || !isAdmin) {
    return null; // Se está redirigiendo
  }

  return (
    <div>
      <h1>Panel de Administración</h1>
      <p>Solo administradores pueden ver esto.</p>
    </div>
  );
}
```

---

### 8. Recuperar Contraseña

```tsx
'use client';

import { useState, FormEvent } from 'react';

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message);
        setEmail('');
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Error al enviar el correo');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Recuperar Contraseña</h2>
      <p>Ingresa tu email y te enviaremos un link para restablecer tu contraseña.</p>

      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="tu@email.com"
        required
      />

      {error && <p className="text-red-500">{error}</p>}
      {message && <p className="text-green-500">{message}</p>}

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Enviando...' : 'Enviar Link de Recuperación'}
      </button>
    </form>
  );
}
```

---

### 9. Actualizar Contraseña

```tsx
'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';

export default function UpdatePasswordForm() {
  const router = useRouter();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (newPassword.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/auth/update-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword }),
      });

      const data = await response.json();

      if (response.ok) {
        alert('Contraseña actualizada exitosamente');
        router.push('/');
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Error al actualizar la contraseña');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Actualizar Contraseña</h2>

      <input
        type="password"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        placeholder="Nueva contraseña"
        required
        minLength={6}
      />

      <input
        type="password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        placeholder="Confirmar contraseña"
        required
        minLength={6}
      />

      {error && <p className="text-red-500">{error}</p>}

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Actualizando...' : 'Actualizar Contraseña'}
      </button>
    </form>
  );
}
```

---

### 10. Obtener Usuario Actual (Sin Contexto)

```tsx
'use client';

import { useState, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  email_verified: boolean;
  created_at: string;
}

interface Profile {
  id: string;
  email: string;
  full_name?: string;
  // ... otros campos
}

export default function CurrentUserInfo() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const response = await fetch('/api/auth/me');
      
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setProfile(data.profile);
      }
    } catch (err) {
      console.error('Error fetching user:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <div>Cargando...</div>;
  if (!user) return <div>No autenticado</div>;

  return (
    <div>
      <h2>Información del Usuario</h2>
      <p>Email: {user.email}</p>
      <p>ID: {user.id}</p>
      <p>Email verificado: {user.email_verified ? 'Sí' : 'No'}</p>
      
      {profile && (
        <>
          <h3>Perfil</h3>
          <p>Nombre: {profile.full_name}</p>
        </>
      )}
    </div>
  );
}
```

---

## 🎨 Componente Reutilizable: AuthGuard

```tsx
'use client';

import { useEffect, ReactNode } from 'react';
import { useAuth } from '@/context/NewAuthContext';
import { useRouter } from 'next/navigation';

interface AuthGuardProps {
  children: ReactNode;
  requireAuth?: boolean;  // Requiere estar autenticado
  requireAdmin?: boolean; // Requiere ser admin
  redirectTo?: string;    // A dónde redirigir si no cumple
}

export default function AuthGuard({
  children,
  requireAuth = true,
  requireAdmin = false,
  redirectTo = '/login'
}: AuthGuardProps) {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (requireAuth && !isAuthenticated) {
        router.push(redirectTo);
      } else if (requireAdmin && !isAdmin) {
        router.push('/');
      }
    }
  }, [isAuthenticated, isAdmin, isLoading, requireAuth, requireAdmin, redirectTo, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-glow-600" />
      </div>
    );
  }

  if (requireAuth && !isAuthenticated) return null;
  if (requireAdmin && !isAdmin) return null;

  return <>{children}</>;
}

// Uso:
// <AuthGuard requireAuth>
//   <MiComponenteProtegido />
// </AuthGuard>
//
// <AuthGuard requireAdmin>
//   <PanelAdmin />
// </AuthGuard>
```

---

## 🔄 Hooks Personalizados

### Hook: useRequireAuth

```tsx
import { useEffect } from 'react';
import { useAuth } from '@/context/NewAuthContext';
import { useRouter } from 'next/navigation';

export function useRequireAuth(redirectTo = '/login') {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(redirectTo);
    }
  }, [isAuthenticated, isLoading, redirectTo, router]);

  return { isAuthenticated, isLoading };
}

// Uso:
// function MiComponente() {
//   const { isAuthenticated, isLoading } = useRequireAuth();
//   if (isLoading) return <Loading />;
//   return <ContenidoProtegido />;
// }
```

### Hook: useRequireAdmin

```tsx
import { useEffect } from 'react';
import { useAuth } from '@/context/NewAuthContext';
import { useRouter } from 'next/navigation';

export function useRequireAdmin(redirectTo = '/') {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push('/login');
      } else if (!isAdmin) {
        router.push(redirectTo);
      }
    }
  }, [isAuthenticated, isAdmin, isLoading, redirectTo, router]);

  return { isAuthenticated, isAdmin, isLoading };
}
```

---

## 📚 Recursos Adicionales

- [Documentación de APIs](./API_AUTHENTICATION.md)
- [Guía de Integración](./INTEGRACION_AUTH.md)
- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)

---

¿Necesitas más ejemplos o ayuda con algún caso de uso específico?

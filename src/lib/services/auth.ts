// ==========================================
// SERVICIO DE AUTENTICACIÓN - GLOWHAIR
// ==========================================
// Gestión completa de autenticación con Supabase
// Soporta: Email/Password, Google, Facebook, Instagram

import { supabase } from '@/lib/supabase';
import type { 
  User, 
  Session, 
  AuthError,
  OAuthResponse
} from '@supabase/supabase-js';

// ==========================================
// TIPOS Y INTERFACES
// ==========================================

export interface SignUpData {
  email: string;
  password: string;
  fullName?: string;
  phone?: string;
  hairType?: string;
}

export interface SignInData {
  email: string;
  password: string;
}

export interface AuthResult {
  user: User | null;
  session: Session | null;
  error: AuthError | null;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  avatar_url?: string;
  hair_type?: string;
  role: string;
  is_verified: boolean;
  is_active: boolean;
  created_at: string;
}

export type OAuthProvider = 'google' | 'facebook';

// ==========================================
// REGISTRO CON EMAIL Y PASSWORD
// ==========================================

/**
 * Registrar un nuevo usuario con email y password
 * @param data - Datos del usuario (email, password, nombre, etc.)
 * @returns AuthResult con usuario, sesión y posibles errores
 */
export async function signUpWithEmail(data: SignUpData): Promise<AuthResult> {
  try {
    const { email, password, fullName, phone, hairType } = data;

    // Validaciones básicas
    if (!email || !password) {
      return {
        user: null,
        session: null,
        error: {
          message: 'Email y contraseña son requeridos',
          name: 'ValidationError',
          status: 400
        } as AuthError
      };
    }

    if (password.length < 6) {
      return {
        user: null,
        session: null,
        error: {
          message: 'La contraseña debe tener al menos 6 caracteres',
          name: 'ValidationError',
          status: 400
        } as AuthError
      };
    }

    // Registrar usuario en Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName || email.split('@')[0],
          phone: phone || null,
          hair_type: hairType || null,
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`
      }
    });

    if (authError) {
      console.error('Error en signUp:', authError);
      return {
        user: null,
        session: null,
        error: authError
      };
    }

    // El perfil se crea automáticamente con el trigger
    // Pero podemos actualizarlo con información adicional
    if (authData.user) {
      const { error: profileError } = await supabase
        .from('glowhair_profiles')
        .update({
          full_name: fullName || email.split('@')[0],
          phone: phone || null,
          hair_type: hairType || null,
        })
        .eq('id', authData.user.id);

      if (profileError) {
        console.warn('Error actualizando perfil:', profileError);
      }
    }

    return {
      user: authData.user,
      session: authData.session,
      error: null
    };

  } catch (error) {
    console.error('Error inesperado en signUpWithEmail:', error);
    return {
      user: null,
      session: null,
      error: {
        message: 'Error inesperado durante el registro',
        name: 'UnexpectedError',
        status: 500
      } as AuthError
    };
  }
}

// ==========================================
// INICIO DE SESIÓN CON EMAIL Y PASSWORD
// ==========================================

/**
 * Iniciar sesión con email y password
 * @param data - Email y contraseña
 * @returns AuthResult con usuario, sesión y posibles errores
 */
export async function signInWithEmail(data: SignInData): Promise<AuthResult> {
  try {
    const { email, password } = data;

    // Validaciones básicas
    if (!email || !password) {
      return {
        user: null,
        session: null,
        error: {
          message: 'Email y contraseña son requeridos',
          name: 'ValidationError',
          status: 400
        } as AuthError
      };
    }

    // Iniciar sesión
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (authError) {
      console.error('Error en signIn:', authError);
      return {
        user: null,
        session: null,
        error: authError
      };
    }

    // Actualizar last_login en el perfil
    if (authData.user) {
      await supabase
        .from('glowhair_profiles')
        .update({ last_login: new Date().toISOString() })
        .eq('id', authData.user.id);
    }

    return {
      user: authData.user,
      session: authData.session,
      error: null
    };

  } catch (error) {
    console.error('Error inesperado en signInWithEmail:', error);
    return {
      user: null,
      session: null,
      error: {
        message: 'Error inesperado durante el inicio de sesión',
        name: 'UnexpectedError',
        status: 500
      } as AuthError
    };
  }
}

// ==========================================
// INICIO DE SESIÓN CON OAUTH (Google, Facebook)
// ==========================================

/**
 * Iniciar sesión con proveedor OAuth (Google, Facebook)
 * @param provider - Proveedor OAuth ('google', 'facebook')
 * @returns Promise con la respuesta de OAuth
 */
export async function signInWithOAuth(provider: OAuthProvider): Promise<OAuthResponse> {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        }
      }
    });

    if (error) {
      console.error(`Error en signInWithOAuth (${provider}):`, error);
      throw error;
    }

    return { data, error: null };

  } catch (error) {
    console.error(`Error inesperado en signInWithOAuth (${provider}):`, error);
    throw error;
  }
}

/**
 * Iniciar sesión con Google
 */
export async function signInWithGoogle(): Promise<OAuthResponse> {
  return signInWithOAuth('google');
}

/**
 * Iniciar sesión con Facebook
 */
export async function signInWithFacebook(): Promise<OAuthResponse> {
  return signInWithOAuth('facebook');
}

/**
 * Iniciar sesión con Instagram
 * Nota: Instagram OAuth requiere configuración adicional en Facebook Developers
 * ya que Instagram es parte del ecosistema de Meta
 */
export async function signInWithInstagram(): Promise<{ error: AuthError | null }> {
  try {
    // Instagram requiere usar Facebook Login con permisos especiales
    // Por ahora, redirigimos a una página de error amigable
    console.warn('Instagram login requiere configuración adicional en Facebook Developers');
    
    // Alternativa: Usar Facebook OAuth con permisos de Instagram
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'facebook',
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback`,
        scopes: 'email,public_profile,instagram_basic' // Incluir permisos de Instagram
      }
    });

    if (error) {
      return { error };
    }

    return { error: null };
  } catch (error) {
    console.error('Error con Instagram login:', error);
    return {
      error: {
        message: 'Instagram login no está disponible actualmente. Por favor usa Facebook o Google.',
        name: 'InstagramError',
        status: 503
      } as AuthError
    };
  }
}

// ==========================================
// CERRAR SESIÓN
// ==========================================

/**
 * Cerrar sesión del usuario actual
 */
export async function signOut(): Promise<{ error: AuthError | null }> {
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error('Error cerrando sesión:', error);
      return { error };
    }

    return { error: null };

  } catch (error) {
    console.error('Error inesperado en signOut:', error);
    return {
      error: {
        message: 'Error inesperado al cerrar sesión',
        name: 'UnexpectedError',
        status: 500
      } as AuthError
    };
  }
}

// ==========================================
// OBTENER USUARIO ACTUAL
// ==========================================

/**
 * Obtener el usuario actualmente autenticado
 * @returns Usuario actual o null si no está autenticado
 */
export async function getCurrentUser(): Promise<User | null> {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
      console.error('Error obteniendo usuario:', error);
      return null;
    }

    return user;

  } catch (error) {
    console.error('Error inesperado en getCurrentUser:', error);
    return null;
  }
}

/**
 * Obtener la sesión actual
 * @returns Sesión actual o null si no está autenticado
 */
export async function getCurrentSession(): Promise<Session | null> {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Error obteniendo sesión:', error);
      return null;
    }

    return session;

  } catch (error) {
    console.error('Error inesperado en getCurrentSession:', error);
    return null;
  }
}

/**
 * Obtener el perfil completo del usuario actual
 * @returns Perfil del usuario o null
 */
export async function getCurrentUserProfile(): Promise<UserProfile | null> {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return null;
    }

    const { data, error } = await supabase
      .from('glowhair_profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('Error obteniendo perfil:', error);
      return null;
    }

    return data;

  } catch (error) {
    console.error('Error inesperado en getCurrentUserProfile:', error);
    return null;
  }
}

// ==========================================
// RECUPERACIÓN DE CONTRASEÑA
// ==========================================

/**
 * Enviar email para recuperar contraseña
 * @param email - Email del usuario
 */
export async function sendPasswordResetEmail(email: string): Promise<{ error: AuthError | null }> {
  try {
    if (!email) {
      return {
        error: {
          message: 'Email es requerido',
          name: 'ValidationError',
          status: 400
        } as AuthError
      };
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`
    });

    if (error) {
      console.error('Error enviando email de recuperación:', error);
      return { error };
    }

    return { error: null };

  } catch (error) {
    console.error('Error inesperado en sendPasswordResetEmail:', error);
    return {
      error: {
        message: 'Error inesperado al enviar email',
        name: 'UnexpectedError',
        status: 500
      } as AuthError
    };
  }
}

/**
 * Actualizar contraseña (usuario debe estar autenticado)
 * @param newPassword - Nueva contraseña
 */
export async function updatePassword(newPassword: string): Promise<{ error: AuthError | null }> {
  try {
    if (!newPassword || newPassword.length < 6) {
      return {
        error: {
          message: 'La contraseña debe tener al menos 6 caracteres',
          name: 'ValidationError',
          status: 400
        } as AuthError
      };
    }

    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) {
      console.error('Error actualizando contraseña:', error);
      return { error };
    }

    return { error: null };

  } catch (error) {
    console.error('Error inesperado en updatePassword:', error);
    return {
      error: {
        message: 'Error inesperado al actualizar contraseña',
        name: 'UnexpectedError',
        status: 500
      } as AuthError
    };
  }
}

// ==========================================
// VERIFICACIÓN DE EMAIL
// ==========================================

/**
 * Reenviar email de verificación
 * @param email - Email del usuario
 */
export async function resendVerificationEmail(email: string): Promise<{ error: AuthError | null }> {
  try {
    if (!email) {
      return {
        error: {
          message: 'Email es requerido',
          name: 'ValidationError',
          status: 400
        } as AuthError
      };
    }

    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`
      }
    });

    if (error) {
      console.error('Error reenviando email de verificación:', error);
      return { error };
    }

    return { error: null };

  } catch (error) {
    console.error('Error inesperado en resendVerificationEmail:', error);
    return {
      error: {
        message: 'Error inesperado al reenviar email',
        name: 'UnexpectedError',
        status: 500
      } as AuthError
    };
  }
}

// ==========================================
// LISTENER DE CAMBIOS DE AUTENTICACIÓN
// ==========================================

/**
 * Suscribirse a cambios en el estado de autenticación
 * @param callback - Función a ejecutar cuando cambia el estado
 */
export function onAuthStateChange(
  callback: (event: string, session: Session | null) => void
) {
  return supabase.auth.onAuthStateChange((event, session) => {
    callback(event, session);
  });
}

// ==========================================
// UTILIDADES
// ==========================================

/**
 * Verificar si el usuario está autenticado
 */
export async function isAuthenticated(): Promise<boolean> {
  const user = await getCurrentUser();
  return user !== null;
}

/**
 * Verificar si el usuario es administrador
 */
export async function isAdmin(): Promise<boolean> {
  try {
    const profile = await getCurrentUserProfile();
    return profile?.role === 'admin' || profile?.role === 'super_admin';
  } catch (error) {
    console.error('Error verificando si es admin:', error);
    return false;
  }
}

/**
 * Verificar si el email del usuario está verificado
 */
export async function isEmailVerified(): Promise<boolean> {
  try {
    const user = await getCurrentUser();
    return user?.email_confirmed_at !== undefined && user?.email_confirmed_at !== null;
  } catch (error) {
    console.error('Error verificando email:', error);
    return false;
  }
}

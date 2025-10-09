import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    try {
      // Intercambiar el código por una sesión
      await supabase.auth.exchangeCodeForSession(code);
    } catch (error) {
      console.error('Error en OAuth callback:', error);
      // Redirigir a login con error
      return NextResponse.redirect(new URL('/login?error=callback_failed', requestUrl.origin));
    }
  }

  // Redirigir al usuario a la página principal después del login exitoso
  return NextResponse.redirect(new URL('/', requestUrl.origin));
}

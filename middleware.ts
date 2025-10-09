import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  // Verificar autenticación
  const { data: { session } } = await supabase.auth.getSession();

  // Proteger rutas de admin
  if (req.nextUrl.pathname.startsWith('/admin')) {
    if (!session) {
      // Redirigir a login si no está autenticado
      const redirectUrl = new URL('/login', req.url);
      redirectUrl.searchParams.set('redirect', req.nextUrl.pathname);
      return NextResponse.redirect(redirectUrl);
    }

    // Verificar si es admin
    const { data: adminData } = await supabase
      .from('admin_users')
      .select('role, is_active')
      .eq('user_id', session.user.id)
      .eq('is_active', true)
      .single();

    if (!adminData) {
      // Redirigir a home si no es admin
      return NextResponse.redirect(new URL('/', req.url));
    }
  }

  return res;
}

export const config = {
  matcher: ['/admin/:path*']
};
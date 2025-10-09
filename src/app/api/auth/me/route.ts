import { NextResponse } from 'next/server';
import { getCurrentUser, getCurrentUserProfile } from '@/lib/services/auth';

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }

    const profile = await getCurrentUserProfile();

    return NextResponse.json(
      {
        user: {
          id: user.id,
          email: user.email,
          email_verified: user.email_confirmed_at ? true : false,
          created_at: user.created_at,
        },
        profile: profile || null,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error en auth/me:', error);
    return NextResponse.json(
      { error: 'Error al procesar la solicitud' },
      { status: 500 }
    );
  }
}

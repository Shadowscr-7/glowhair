import { NextRequest, NextResponse } from 'next/server';
import { sendPasswordResetEmail } from '@/lib/services/auth';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'El email es requerido' },
        { status: 400 }
      );
    }

    const { error } = await sendPasswordResetEmail(email);

    if (error) {
      return NextResponse.json(
        { error: 'Error al enviar el email de recuperación' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: 'Si el email existe, recibirás un correo para restablecer tu contraseña' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error en reset-password:', error);
    return NextResponse.json(
      { error: 'Error al procesar la solicitud' },
      { status: 500 }
    );
  }
}

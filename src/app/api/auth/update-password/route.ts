import { NextRequest, NextResponse } from 'next/server';
import { updatePassword } from '@/lib/services/auth';

export async function POST(request: NextRequest) {
  try {
    const { newPassword } = await request.json();

    if (!newPassword) {
      return NextResponse.json(
        { error: 'La nueva contraseña es requerida' },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'La contraseña debe tener al menos 6 caracteres' },
        { status: 400 }
      );
    }

    const { error } = await updatePassword(newPassword);

    if (error) {
      return NextResponse.json(
        { error: 'Error al actualizar la contraseña. Verifica que estés autenticado.' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { message: 'Contraseña actualizada exitosamente' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error en update-password:', error);
    return NextResponse.json(
      { error: 'Error al procesar la solicitud' },
      { status: 500 }
    );
  }
}

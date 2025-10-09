// ==========================================
// API ROUTE - CERRAR SESIÓN
// ==========================================
// POST /api/auth/signout
// Cierra la sesión del usuario actual

import { NextResponse } from 'next/server';
import { signOut } from '@/lib/services/auth';

export async function POST() {
  try {
    // Cerrar sesión
    const { error } = await signOut();

    // Manejar errores
    if (error) {
      return NextResponse.json(
        { 
          success: false,
          error: error.message 
        },
        { status: error.status || 500 }
      );
    }

    // Respuesta exitosa
    return NextResponse.json(
      {
        success: true,
        message: 'Sesión cerrada exitosamente'
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error en /api/auth/signout:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Error interno del servidor' 
      },
      { status: 500 }
    );
  }
}

// Método no permitido para otros tipos de request
export async function GET() {
  return NextResponse.json(
    { error: 'Método no permitido' },
    { status: 405 }
  );
}

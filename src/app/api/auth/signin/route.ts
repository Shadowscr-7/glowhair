// ==========================================
// API ROUTE - INICIO DE SESIÓN
// ==========================================
// POST /api/auth/signin
// Inicia sesión con email y password

import { NextRequest, NextResponse } from 'next/server';
import { signInWithEmail } from '@/lib/services/auth';

export async function POST(request: NextRequest) {
  try {
    // Parsear el body
    const body = await request.json();
    const { email, password } = body;

    // Validaciones
    if (!email || !password) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Email y contraseña son requeridos' 
        },
        { status: 400 }
      );
    }

    // Iniciar sesión
    const result = await signInWithEmail({ email, password });

    // Manejar errores
    if (result.error) {
      // Mensajes de error más amigables
      let errorMessage = result.error.message;
      
      if (errorMessage.includes('Invalid login credentials')) {
        errorMessage = 'Email o contraseña incorrectos';
      } else if (errorMessage.includes('Email not confirmed')) {
        errorMessage = 'Por favor verifica tu email antes de iniciar sesión';
      }

      return NextResponse.json(
        { 
          success: false,
          error: errorMessage
        },
        { status: result.error.status || 401 }
      );
    }

    // Respuesta exitosa
    return NextResponse.json(
      {
        success: true,
        message: 'Inicio de sesión exitoso',
        data: {
          user: {
            id: result.user?.id,
            email: result.user?.email,
            email_confirmed: result.user?.email_confirmed_at !== null
          },
          session: result.session
        }
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error en /api/auth/signin:', error);
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

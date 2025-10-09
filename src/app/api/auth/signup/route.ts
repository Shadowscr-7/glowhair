// ==========================================
// API ROUTE - REGISTRO DE USUARIOS
// ==========================================
// POST /api/auth/signup
// Registra un nuevo usuario con email y password

import { NextRequest, NextResponse } from 'next/server';
import { signUpWithEmail } from '@/lib/services/auth';

export async function POST(request: NextRequest) {
  try {
    // Parsear el body
    const body = await request.json();
    const { email, password, fullName, phone, hairType } = body;

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

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Formato de email inválido' 
        },
        { status: 400 }
      );
    }

    // Validar longitud de contraseña
    if (password.length < 6) {
      return NextResponse.json(
        { 
          success: false,
          error: 'La contraseña debe tener al menos 6 caracteres' 
        },
        { status: 400 }
      );
    }

    // Registrar usuario
    const result = await signUpWithEmail({
      email,
      password,
      fullName,
      phone,
      hairType
    });

    // Manejar errores
    if (result.error) {
      return NextResponse.json(
        { 
          success: false,
          error: result.error.message 
        },
        { status: result.error.status || 500 }
      );
    }

    // Respuesta exitosa
    return NextResponse.json(
      {
        success: true,
        message: 'Usuario registrado exitosamente. Por favor verifica tu email.',
        data: {
          user: {
            id: result.user?.id,
            email: result.user?.email,
            email_confirmed: result.user?.email_confirmed_at !== null
          },
          session: result.session
        }
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Error en /api/auth/signup:', error);
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

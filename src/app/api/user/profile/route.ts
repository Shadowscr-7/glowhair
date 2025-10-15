import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * GET /api/user/profile
 * Obtener perfil del usuario
 */
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id') || '00000000-0000-0000-0000-000000000001';

    console.log('📋 GET /api/user/profile - userId:', userId);

    const { data: profile, error } = await supabase
      .from('glowhair_profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('❌ Error al obtener perfil:', error);
      return NextResponse.json({ error: 'Error al obtener perfil' }, { status: 500 });
    }

    console.log('✅ Perfil obtenido');
    return NextResponse.json(profile);

  } catch (error) {
    console.error('❌ Error en GET /api/user/profile:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

/**
 * PUT /api/user/profile
 * Actualizar perfil del usuario
 */
export async function PUT(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id') || '00000000-0000-0000-0000-000000000001';
    const body = await request.json();

    console.log('🔄 PUT /api/user/profile - userId:', userId);
    console.log('📦 Body:', body);

    // Campos permitidos para actualizar
    const allowedFields = [
      'first_name',
      'last_name',
      'full_name',
      'phone',
      'address',
      'city',
      'country',
      'avatar_url'
    ];

    const updateData: Record<string, string> = {};
    for (const field of allowedFields) {
      if (field in body && body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    // Si se actualiza first_name o last_name, actualizar full_name automáticamente
    if ('first_name' in updateData || 'last_name' in updateData) {
      const { data: currentProfile } = await supabase
        .from('glowhair_profiles')
        .select('first_name, last_name')
        .eq('id', userId)
        .single();

      const firstName = updateData.first_name || currentProfile?.first_name || '';
      const lastName = updateData.last_name || currentProfile?.last_name || '';
      updateData.full_name = `${firstName} ${lastName}`.trim();
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No hay campos para actualizar' }, { status: 400 });
    }

    console.log('📝 Datos a actualizar:', updateData);

    const { data: updatedProfile, error: updateError } = await supabase
      .from('glowhair_profiles')
      .update(updateData)
      .eq('id', userId)
      .select()
      .single();

    if (updateError) {
      console.error('❌ Error al actualizar perfil:', updateError);
      return NextResponse.json(
        { error: 'Error al actualizar perfil', details: updateError.message },
        { status: 500 }
      );
    }

    console.log('✅ Perfil actualizado');
    return NextResponse.json(updatedProfile);

  } catch (error) {
    console.error('❌ Error en PUT /api/user/profile:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * GET /api/user/settings
 * Obtener configuración del usuario
 */
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id') || '00000000-0000-0000-0000-000000000001';

    console.log('📋 GET /api/user/settings - userId:', userId);

    const { data: settings, error } = await supabase
      .from('glowhair_user_settings')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      // Si no existe, crear configuración por defecto
      if (error.code === 'PGRST116') {
        console.log('⚠️ No hay settings, creando por defecto...');
        
        const { data: newSettings, error: insertError } = await supabase
          .from('glowhair_user_settings')
          .insert({
            user_id: userId,
            theme: 'light',
            currency: 'UYU',
            email_notifications: true,
            push_notifications: true,
            order_updates: true,
            promotions: false,
            newsletter: true,
            sound_enabled: true
          })
          .select()
          .single();

        if (insertError) {
          console.error('❌ Error al crear settings:', insertError);
          return NextResponse.json({ error: 'Error al crear configuración' }, { status: 500 });
        }

        return NextResponse.json(newSettings);
      }

      console.error('❌ Error al obtener settings:', error);
      return NextResponse.json({ error: 'Error al obtener configuración' }, { status: 500 });
    }

    console.log('✅ Settings obtenidos:', settings);
    return NextResponse.json(settings);

  } catch (error) {
    console.error('❌ Error en GET /api/user/settings:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

/**
 * PUT /api/user/settings
 * Actualizar configuración del usuario
 */
export async function PUT(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id') || '00000000-0000-0000-0000-000000000001';
    const body = await request.json();

    console.log('🔄 PUT /api/user/settings - userId:', userId);
    console.log('📦 Body:', body);

    // Validar campos permitidos
    const allowedFields = [
      'theme',
      'currency',
      'email_notifications',
      'push_notifications',
      'order_updates',
      'promotions',
      'newsletter',
      'sound_enabled'
    ];

    const updateData: Record<string, string | boolean> = {};
    for (const field of allowedFields) {
      if (field in body) {
        updateData[field] = body[field];
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No hay campos para actualizar' }, { status: 400 });
    }

    console.log('📝 Datos a actualizar:', updateData);

    // Verificar si existe configuración
    const { data: existing } = await supabase
      .from('glowhair_user_settings')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (!existing) {
      // Crear si no existe
      const { data: newSettings, error: insertError } = await supabase
        .from('glowhair_user_settings')
        .insert({
          user_id: userId,
          ...updateData
        })
        .select()
        .single();

      if (insertError) {
        console.error('❌ Error al crear settings:', insertError);
        return NextResponse.json({ error: 'Error al crear configuración' }, { status: 500 });
      }

      console.log('✅ Settings creados:', newSettings);
      return NextResponse.json(newSettings);
    }

    // Actualizar
    const { data: updatedSettings, error: updateError } = await supabase
      .from('glowhair_user_settings')
      .update(updateData)
      .eq('user_id', userId)
      .select()
      .single();

    if (updateError) {
      console.error('❌ Error al actualizar settings:', updateError);
      return NextResponse.json({ error: 'Error al actualizar configuración' }, { status: 500 });
    }

    console.log('✅ Settings actualizados:', updatedSettings);
    return NextResponse.json(updatedSettings);

  } catch (error) {
    console.error('❌ Error en PUT /api/user/settings:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

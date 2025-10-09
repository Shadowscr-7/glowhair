-- ==========================================
-- SCRIPT DE VERIFICACIÓN - USUARIO KEILA
-- ==========================================
-- Este script verifica el estado del usuario administrador

-- ==========================================
-- VERIFICAR USUARIO EN AUTH.USERS
-- ==========================================

DO $$
DECLARE
    keila_user_record RECORD;
    keila_profile_record RECORD;
    keila_admin_record RECORD;
    table_count INTEGER;
BEGIN
    RAISE NOTICE '🔍 VERIFICANDO USUARIO ADMINISTRADOR KEILA';
    RAISE NOTICE '================================================';
    RAISE NOTICE '';
    
    -- Verificar si existe en auth.users
    SELECT 
        id,
        email,
        email_confirmed_at IS NOT NULL as email_confirmed,
        created_at,
        last_sign_in_at
    INTO keila_user_record
    FROM auth.users 
    WHERE email = 'keila@glowhair.com';
    
    IF keila_user_record.id IS NOT NULL THEN
        RAISE NOTICE '✅ USUARIO EN AUTH.USERS:';
        RAISE NOTICE '  📧 Email: %', keila_user_record.email;
        RAISE NOTICE '  🆔 ID: %', keila_user_record.id;
        RAISE NOTICE '  ✅ Email confirmado: %', 
            CASE WHEN keila_user_record.email_confirmed THEN 'SÍ' ELSE 'NO' END;
        RAISE NOTICE '  📅 Creado: %', keila_user_record.created_at;
        RAISE NOTICE '  🔐 Último login: %', 
            COALESCE(keila_user_record.last_sign_in_at::TEXT, 'Nunca');
        RAISE NOTICE '';
        
        -- Verificar perfil en profiles
        SELECT 
            role,
            first_name,
            last_name,
            full_name,
            admin_permissions,
            is_verified,
            is_active,
            created_at,
            updated_at
        INTO keila_profile_record
        FROM profiles 
        WHERE id = keila_user_record.id;
        
        IF keila_profile_record IS NOT NULL THEN
            RAISE NOTICE '✅ PERFIL EN PROFILES:';
            RAISE NOTICE '  👑 Rol: %', keila_profile_record.role;
            RAISE NOTICE '  👤 Nombre: %', 
                COALESCE(keila_profile_record.full_name, 
                        keila_profile_record.first_name || ' ' || keila_profile_record.last_name,
                        'Sin nombre');
            RAISE NOTICE '  ✅ Verificado: %', 
                CASE WHEN keila_profile_record.is_verified THEN 'SÍ' ELSE 'NO' END;
            RAISE NOTICE '  🟢 Activo: %', 
                CASE WHEN keila_profile_record.is_active THEN 'SÍ' ELSE 'NO' END;
            RAISE NOTICE '  🛡️ Permisos admin: %', 
                CASE WHEN keila_profile_record.admin_permissions IS NOT NULL 
                     AND keila_profile_record.admin_permissions != '{}'::jsonb
                THEN 'CONFIGURADOS' ELSE 'SIN CONFIGURAR' END;
            RAISE NOTICE '';
        ELSE
            RAISE NOTICE '❌ PERFIL NO ENCONTRADO EN PROFILES';
            RAISE NOTICE '  ⚠️ El usuario existe en auth.users pero no tiene perfil';
            RAISE NOTICE '';
        END IF;
        
        -- Verificar en admin_users
        SELECT 
            role,
            permissions,
            is_active,
            created_at
        INTO keila_admin_record
        FROM admin_users 
        WHERE user_id = keila_user_record.id;
        
        IF keila_admin_record IS NOT NULL THEN
            RAISE NOTICE '✅ REGISTRO EN ADMIN_USERS:';
            RAISE NOTICE '  👑 Rol admin: %', keila_admin_record.role;
            RAISE NOTICE '  🟢 Activo: %', 
                CASE WHEN keila_admin_record.is_active THEN 'SÍ' ELSE 'NO' END;
            RAISE NOTICE '  🛡️ Permisos: %', 
                CASE WHEN keila_admin_record.permissions IS NOT NULL 
                     AND keila_admin_record.permissions != '{}'::jsonb
                THEN 'CONFIGURADOS' ELSE 'SIN CONFIGURAR' END;
        ELSE
            RAISE NOTICE '⚠️ NO ENCONTRADO EN ADMIN_USERS';
            RAISE NOTICE '  💡 Ejecuta make_user_admin para completar configuración';
        END IF;
        
    ELSE
        RAISE NOTICE '❌ USUARIO NO ENCONTRADO EN AUTH.USERS';
        RAISE NOTICE '  📝 Para crear el usuario:';
        RAISE NOTICE '    1. Ve a Supabase Dashboard > Authentication > Users';
        RAISE NOTICE '    2. Haz clic en "Add user"';
        RAISE NOTICE '    3. Email: keila@glowhair.com';
        RAISE NOTICE '    4. Password: keila123456';
        RAISE NOTICE '';
    END IF;
    
    -- Verificar tablas del sistema
    SELECT COUNT(*) INTO table_count
    FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_type = 'BASE TABLE';
    
    RAISE NOTICE '📊 ESTADO DE LA BASE DE DATOS:';
    RAISE NOTICE '  📋 Tablas públicas: %', table_count;
    
    -- Verificar algunas tablas clave
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'products') THEN
        RAISE NOTICE '  ✅ Tabla products: existe';
    ELSE
        RAISE NOTICE '  ❌ Tabla products: no existe';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles') THEN
        RAISE NOTICE '  ✅ Tabla profiles: existe';
    ELSE
        RAISE NOTICE '  ❌ Tabla profiles: no existe';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'orders') THEN
        RAISE NOTICE '  ✅ Tabla orders: existe';
    ELSE
        RAISE NOTICE '  ❌ Tabla orders: no existe';
    END IF;
    
    RAISE NOTICE '';
    RAISE NOTICE '================================================';
    
    -- Dar recomendaciones basadas en el estado
    IF keila_user_record.id IS NULL THEN
        RAISE NOTICE '🎯 SIGUIENTE PASO: Crear usuario en Authentication';
    ELSIF keila_profile_record IS NULL THEN
        RAISE NOTICE '🎯 SIGUIENTE PASO: El perfil se creará automáticamente';
    ELSIF keila_profile_record.role != 'admin' OR keila_admin_record IS NULL THEN
        RAISE NOTICE '🎯 SIGUIENTE PASO: Ejecutar make_user_admin()';
        RAISE NOTICE '   SELECT make_user_admin(''keila@glowhair.com'');';
    ELSE
        RAISE NOTICE '🎉 TODO ESTÁ LISTO - Keila es administrador';
        RAISE NOTICE '🚀 Puedes hacer login con:';
        RAISE NOTICE '   Email: keila@glowhair.com';
        RAISE NOTICE '   Password: keila123456';
    END IF;
    
END $$;

-- ==========================================
-- CONSULTA RÁPIDA ADICIONAL
-- ==========================================

-- Mostrar información resumida en formato tabla
SELECT 
    'RESUMEN' as tipo,
    CASE 
        WHEN u.id IS NOT NULL THEN '✅ Existe'
        ELSE '❌ No existe'
    END as usuario_auth,
    CASE 
        WHEN p.id IS NOT NULL THEN '✅ Existe'
        ELSE '❌ No existe'
    END as perfil,
    COALESCE(p.role, 'Sin rol') as rol,
    CASE 
        WHEN au.user_id IS NOT NULL THEN '✅ Sí'
        ELSE '❌ No'
    END as es_admin,
    CASE 
        WHEN u.email_confirmed_at IS NOT NULL THEN '✅ Sí'
        ELSE '❌ No'
    END as email_confirmado
FROM (SELECT 'keila@glowhair.com' as email) e
LEFT JOIN auth.users u ON u.email = e.email
LEFT JOIN profiles p ON p.id = u.id
LEFT JOIN admin_users au ON au.user_id = u.id;

-- ==========================================
-- FUNCIÓN PARA VERIFICACIÓN RÁPIDA
-- ==========================================

CREATE OR REPLACE FUNCTION check_keila_status()
RETURNS TABLE (
    estado TEXT,
    usuario_existe BOOLEAN,
    perfil_existe BOOLEAN,
    es_admin BOOLEAN,
    email_confirmado BOOLEAN,
    puede_hacer_login BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        CASE 
            WHEN u.id IS NOT NULL AND p.role = 'admin' AND au.user_id IS NOT NULL 
            THEN 'LISTO PARA USAR'
            WHEN u.id IS NOT NULL AND p.id IS NOT NULL 
            THEN 'NECESITA SER ADMIN'
            WHEN u.id IS NOT NULL 
            THEN 'NECESITA PERFIL'
            ELSE 'USUARIO NO EXISTE'
        END::TEXT,
        u.id IS NOT NULL,
        p.id IS NOT NULL,
        p.role = 'admin' AND au.user_id IS NOT NULL,
        u.email_confirmed_at IS NOT NULL,
        u.id IS NOT NULL AND u.email_confirmed_at IS NOT NULL AND p.role = 'admin'
    FROM (SELECT 'keila@glowhair.com' as email) e
    LEFT JOIN auth.users u ON u.email = e.email
    LEFT JOIN profiles p ON p.id = u.id
    LEFT JOIN admin_users au ON au.user_id = u.id;
END;
$$ LANGUAGE plpgsql;

-- Ejecutar verificación rápida
SELECT * FROM check_keila_status();
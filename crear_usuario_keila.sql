-- ==========================================
-- SCRIPT RÁPIDO: CREAR USUARIO ADMINISTRADOR KEILA
-- ==========================================
-- Este script es para crear y configurar SOLO el usuario Keila
-- Úsalo si ya tienes las tablas creadas
-- ==========================================

-- PASO 1: Verificar si el usuario ya existe
DO $$
DECLARE
    keila_user_id UUID;
    keila_email TEXT := 'keila@glowhair.com';
BEGIN
    -- Buscar el usuario
    SELECT id INTO keila_user_id
    FROM auth.users
    WHERE email = keila_email;
    
    IF keila_user_id IS NOT NULL THEN
        RAISE NOTICE '✅ Usuario Keila encontrado con ID: %', keila_user_id;
        RAISE NOTICE '';
        RAISE NOTICE '🔧 Configurando permisos de administrador...';
    ELSE
        RAISE NOTICE '❌ Usuario Keila NO encontrado';
        RAISE NOTICE '';
        RAISE NOTICE '📝 DEBES CREAR EL USUARIO PRIMERO:';
        RAISE NOTICE '';
        RAISE NOTICE '1. Ve a Supabase Dashboard > Authentication > Users';
        RAISE NOTICE '2. Haz clic en "Add user"';
        RAISE NOTICE '3. Email: keila@glowhair.com';
        RAISE NOTICE '4. Password: Keila2025!';
        RAISE NOTICE '5. Marca: Auto Confirm User ✓';
        RAISE NOTICE '6. Crea el usuario';
        RAISE NOTICE '7. Vuelve a ejecutar este script';
        RAISE NOTICE '';
        
        -- Terminar aquí si no existe
        RETURN;
    END IF;
    
    -- Si existe, continuar con la configuración
    
    -- Actualizar o insertar en glowhair_profiles
    INSERT INTO glowhair_profiles (
        id, 
        email, 
        full_name, 
        first_name, 
        last_name, 
        role,
        admin_permissions,
        is_verified,
        is_active
    ) VALUES (
        keila_user_id,
        keila_email,
        'Keila Admin',
        'Keila',
        'Admin',
        'super_admin',
        jsonb_build_object(
            'products', true,
            'orders', true,
            'customers', true,
            'analytics', true,
            'settings', true,
            'users', true,
            'coupons', true,
            'reviews', true,
            'inventory', true
        ),
        true,
        true
    )
    ON CONFLICT (id) DO UPDATE SET
        role = EXCLUDED.role,
        first_name = EXCLUDED.first_name,
        last_name = EXCLUDED.last_name,
        full_name = EXCLUDED.full_name,
        admin_permissions = EXCLUDED.admin_permissions,
        is_verified = EXCLUDED.is_verified,
        is_active = EXCLUDED.is_active,
        updated_at = NOW();
    
    RAISE NOTICE '✅ Perfil actualizado en glowhair_profiles';
    
    -- Insertar o actualizar en glowhair_admin_users
    INSERT INTO glowhair_admin_users (
        user_id,
        role,
        permissions,
        is_active
    ) VALUES (
        keila_user_id,
        'super_admin',
        jsonb_build_object(
            'products', true,
            'orders', true,
            'customers', true,
            'analytics', true,
            'settings', true,
            'users', true,
            'coupons', true,
            'reviews', true,
            'inventory', true
        ),
        true
    )
    ON CONFLICT (user_id) DO UPDATE SET
        role = EXCLUDED.role,
        permissions = EXCLUDED.permissions,
        is_active = EXCLUDED.is_active,
        updated_at = NOW();
    
    RAISE NOTICE '✅ Registro actualizado en glowhair_admin_users';
    RAISE NOTICE '';
    RAISE NOTICE '════════════════════════════════════════════════';
    RAISE NOTICE '🎉 ¡USUARIO KEILA CONFIGURADO EXITOSAMENTE! 🎉';
    RAISE NOTICE '════════════════════════════════════════════════';
    RAISE NOTICE '';
    RAISE NOTICE '👤 CREDENCIALES:';
    RAISE NOTICE '   Email: keila@glowhair.com';
    RAISE NOTICE '   Password: Keila2025!';
    RAISE NOTICE '   Rol: Super Administrador';
    RAISE NOTICE '';
    RAISE NOTICE '🔐 PERMISOS ASIGNADOS:';
    RAISE NOTICE '   ✅ Gestión de productos';
    RAISE NOTICE '   ✅ Gestión de órdenes';
    RAISE NOTICE '   ✅ Gestión de clientes';
    RAISE NOTICE '   ✅ Analytics y reportes';
    RAISE NOTICE '   ✅ Configuraciones del sitio';
    RAISE NOTICE '   ✅ Gestión de usuarios';
    RAISE NOTICE '   ✅ Gestión de cupones';
    RAISE NOTICE '   ✅ Moderación de reseñas';
    RAISE NOTICE '   ✅ Control de inventario';
    RAISE NOTICE '';
    RAISE NOTICE '🚀 PRÓXIMOS PASOS:';
    RAISE NOTICE '   1. Ve a http://localhost:3000/login';
    RAISE NOTICE '   2. Inicia sesión con las credenciales de Keila';
    RAISE NOTICE '   3. Accede al panel de admin en /admin';
    RAISE NOTICE '   4. ¡Comienza a gestionar tu e-commerce!';
    RAISE NOTICE '';
    RAISE NOTICE '⚠️  RECOMENDACIÓN DE SEGURIDAD:';
    RAISE NOTICE '   Cambia la contraseña después del primer login';
    RAISE NOTICE '';
    RAISE NOTICE '════════════════════════════════════════════════';
    
END $$;

-- ==========================================
-- VERIFICACIÓN ADICIONAL
-- ==========================================

-- Mostrar información del usuario Keila
SELECT 
    p.id,
    p.email,
    p.full_name,
    p.role,
    p.is_active,
    p.is_verified,
    a.role as admin_role,
    a.is_active as admin_active
FROM glowhair_profiles p
LEFT JOIN glowhair_admin_users a ON p.id = a.user_id
WHERE p.email = 'keila@glowhair.com';

-- ==========================================
-- ALTERNATIVA: Usar la función helper
-- ==========================================

-- Si prefieres, puedes usar la función creada:
-- SELECT glowhair_make_user_admin('keila@glowhair.com');

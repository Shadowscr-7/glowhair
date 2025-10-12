-- ===============================================
-- TABLA DE FAVORITOS - GLOWHAIR
-- ===============================================
-- Este script crea la tabla de favoritos si no existe
-- y configura las políticas de seguridad (RLS)

-- 1. CREAR TABLA DE FAVORITOS
-- ===============================================

CREATE TABLE IF NOT EXISTS public.glowhair_favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    product_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    -- Constraint única para evitar duplicados
    CONSTRAINT glowhair_favorites_user_product_unique UNIQUE (user_id, product_id),
    
    -- Foreign key a productos
    CONSTRAINT glowhair_favorites_product_id_fkey 
        FOREIGN KEY (product_id) 
        REFERENCES public.glowhair_products(id) 
        ON DELETE CASCADE
);

-- 2. CREAR ÍNDICES PARA MEJOR PERFORMANCE
-- ===============================================

-- Índice para búsquedas por usuario
CREATE INDEX IF NOT EXISTS idx_glowhair_favorites_user_id 
    ON public.glowhair_favorites(user_id);

-- Índice para búsquedas por producto
CREATE INDEX IF NOT EXISTS idx_glowhair_favorites_product_id 
    ON public.glowhair_favorites(product_id);

-- Índice compuesto para búsquedas usuario-producto
CREATE INDEX IF NOT EXISTS idx_glowhair_favorites_user_product 
    ON public.glowhair_favorites(user_id, product_id);

-- 3. HABILITAR ROW LEVEL SECURITY (RLS)
-- ===============================================

ALTER TABLE public.glowhair_favorites ENABLE ROW LEVEL SECURITY;

-- 4. POLÍTICAS DE SEGURIDAD
-- ===============================================

-- Eliminar políticas existentes si existen
DROP POLICY IF EXISTS "Users can view own favorites" ON public.glowhair_favorites;
DROP POLICY IF EXISTS "Users can insert own favorites" ON public.glowhair_favorites;
DROP POLICY IF EXISTS "Users can delete own favorites" ON public.glowhair_favorites;
DROP POLICY IF EXISTS "Public can view all favorites" ON public.glowhair_favorites;

-- Política: Usuarios pueden ver sus propios favoritos
CREATE POLICY "Users can view own favorites"
    ON public.glowhair_favorites
    FOR SELECT
    USING (true); -- Cambiar a user_id match cuando tengas auth real

-- Política: Usuarios pueden insertar sus propios favoritos
CREATE POLICY "Users can insert own favorites"
    ON public.glowhair_favorites
    FOR INSERT
    WITH CHECK (true); -- Cambiar a user_id match cuando tengas auth real

-- Política: Usuarios pueden eliminar sus propios favoritos
CREATE POLICY "Users can delete own favorites"
    ON public.glowhair_favorites
    FOR DELETE
    USING (true); -- Cambiar a user_id match cuando tengas auth real

-- Nota: Las políticas están en modo permisivo (true) para desarrollo
-- En producción, reemplaza 'true' con:
-- user_id = auth.uid()::text
-- o
-- user_id = current_setting('request.jwt.claims')::json->>'sub'

-- 5. GRANTS DE PERMISOS
-- ===============================================

-- Dar permisos a usuarios autenticados
GRANT SELECT, INSERT, DELETE ON public.glowhair_favorites TO authenticated;

-- Dar permisos a anónimos (solo lectura)
GRANT SELECT ON public.glowhair_favorites TO anon;

-- Dar todos los permisos al rol de servicio
GRANT ALL ON public.glowhair_favorites TO service_role;

-- Nota: No hay SEQUENCE porque usamos gen_random_uuid() para el ID

-- 6. VERIFICACIÓN
-- ===============================================

-- Verificar que la tabla existe
DO $$ 
BEGIN
    IF EXISTS (
        SELECT FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename = 'glowhair_favorites'
    ) THEN
        RAISE NOTICE '✅ Tabla glowhair_favorites creada correctamente';
    ELSE
        RAISE EXCEPTION '❌ Error: La tabla glowhair_favorites no fue creada';
    END IF;
END $$;

-- 7. DATOS DE EJEMPLO (OPCIONAL)
-- ===============================================
-- Descomentar para insertar datos de prueba

/*
-- Obtener un producto de ejemplo
DO $$ 
DECLARE
    test_product_id UUID;
    test_user_id TEXT := 'test-user-123';
BEGIN
    -- Obtener el primer producto disponible
    SELECT id INTO test_product_id 
    FROM public.glowhair_products 
    LIMIT 1;
    
    IF test_product_id IS NOT NULL THEN
        -- Insertar favorito de prueba
        INSERT INTO public.glowhair_favorites (user_id, product_id)
        VALUES (test_user_id, test_product_id)
        ON CONFLICT (user_id, product_id) DO NOTHING;
        
        RAISE NOTICE '✅ Favorito de prueba creado: user=%, product=%', 
            test_user_id, test_product_id;
    ELSE
        RAISE NOTICE '⚠️ No hay productos disponibles para crear favorito de prueba';
    END IF;
END $$;
*/

-- 8. FUNCIONES AUXILIARES
-- ===============================================

-- Función para contar favoritos de un usuario
CREATE OR REPLACE FUNCTION count_user_favorites(p_user_id TEXT)
RETURNS INTEGER AS $$
BEGIN
    RETURN (
        SELECT COUNT(*)::INTEGER 
        FROM public.glowhair_favorites 
        WHERE user_id = p_user_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para verificar si un producto es favorito
CREATE OR REPLACE FUNCTION is_product_favorite(
    p_user_id TEXT,
    p_product_id UUID
)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 
        FROM public.glowhair_favorites 
        WHERE user_id = p_user_id 
        AND product_id = p_product_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. COMENTARIOS EN LA TABLA
-- ===============================================

COMMENT ON TABLE public.glowhair_favorites IS 
    'Tabla de productos favoritos de usuarios. Permite a los usuarios guardar productos para acceso rápido.';

COMMENT ON COLUMN public.glowhair_favorites.id IS 
    'Identificador único del favorito';

COMMENT ON COLUMN public.glowhair_favorites.user_id IS 
    'Identificador del usuario (temporal o auth UID)';

COMMENT ON COLUMN public.glowhair_favorites.product_id IS 
    'Referencia al producto favorito';

COMMENT ON COLUMN public.glowhair_favorites.created_at IS 
    'Fecha y hora de creación del favorito';

-- ===============================================
-- FIN DEL SCRIPT
-- ===============================================

-- Para ejecutar este script en Supabase:
-- 1. Ir a SQL Editor en el dashboard de Supabase
-- 2. Copiar y pegar este script
-- 3. Hacer click en "Run"
-- 4. Verificar los mensajes de éxito

-- Verificación final
SELECT 
    'Tabla glowhair_favorites' as tabla,
    COUNT(*) as total_favoritos,
    COUNT(DISTINCT user_id) as usuarios_unicos,
    COUNT(DISTINCT product_id) as productos_unicos
FROM public.glowhair_favorites;

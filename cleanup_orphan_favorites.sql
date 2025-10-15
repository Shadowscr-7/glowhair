-- ============================================
-- VERIFICAR Y LIMPIAR FAVORITOS HUÉRFANOS
-- ============================================
-- Ejecuta en: Supabase Dashboard → SQL Editor
-- Fecha: 15 de Octubre 2025

-- 1. VER TODOS LOS FAVORITOS CON SU ESTADO
-- ============================================
SELECT 
    f.id as favorito_id,
    f.user_id,
    f.product_id,
    f.created_at,
    p.name as producto_nombre,
    p.is_active as producto_activo,
    CASE 
        WHEN p.id IS NULL THEN '❌ HUÉRFANO (producto no existe)'
        WHEN p.is_active = false THEN '⚠️ INACTIVO'
        ELSE '✅ VÁLIDO'
    END as estado
FROM glowhair_favorites f
LEFT JOIN glowhair_products p ON f.product_id = p.id
ORDER BY f.created_at DESC;

-- 2. CONTAR FAVORITOS POR ESTADO
-- ============================================
SELECT 
    COUNT(*) as total_favoritos,
    COUNT(p.id) as con_producto_valido,
    COUNT(*) - COUNT(p.id) as huerfanos
FROM glowhair_favorites f
LEFT JOIN glowhair_products p ON f.product_id = p.id;

-- 3. VER SOLO FAVORITOS HUÉRFANOS
-- ============================================
SELECT 
    f.id,
    f.user_id,
    f.product_id,
    f.created_at
FROM glowhair_favorites f
LEFT JOIN glowhair_products p ON f.product_id = p.id
WHERE p.id IS NULL;

-- 4. ELIMINAR FAVORITO ESPECÍFICO (el que tienes ahora)
-- ============================================
-- CUIDADO: Esto eliminará el favorito permanentemente
-- Descomenta la siguiente línea para ejecutar:

-- DELETE FROM glowhair_favorites 
-- WHERE id = 'faa032b5-eec3-432a-b420-7d7b7d5f02c3';

-- 5. LIMPIAR TODOS LOS FAVORITOS HUÉRFANOS
-- ============================================
-- CUIDADO: Esto eliminará TODOS los favoritos sin producto
-- Descomenta las siguientes líneas para ejecutar:

-- DELETE FROM glowhair_favorites 
-- WHERE product_id NOT IN (SELECT id FROM glowhair_products);

-- 6. VERIFICAR DESPUÉS DE LIMPIAR
-- ============================================
-- Ejecuta esto después de eliminar para confirmar:

-- SELECT COUNT(*) as favoritos_restantes FROM glowhair_favorites;
-- SELECT COUNT(*) as productos_totales FROM glowhair_products;

-- ============================================
-- NOTAS:
-- ============================================
-- - Los favoritos huérfanos NO afectan el funcionamiento
-- - El sistema los filtra automáticamente en el frontend
-- - Es buena práctica limpiarlos periódicamente
-- - Puedes ejecutar la query #5 como mantenimiento mensual

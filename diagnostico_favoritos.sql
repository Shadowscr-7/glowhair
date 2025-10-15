-- ============================================
-- DIAGNÓSTICO COMPLETO DE FAVORITOS
-- ============================================
-- Ejecuta paso a paso en: Supabase Dashboard → SQL Editor
-- Usuario: keila@glowhair.com (4f2af4c0-a1f4-4f82-8f13-c0cf86600735)

-- 1️⃣ VER TUS FAVORITOS ACTUALES CON DETALLES
-- ============================================
SELECT 
    f.id as favorito_id,
    f.product_id,
    f.created_at,
    p.id as producto_existe,
    p.name as producto_nombre,
    p.slug as producto_slug,
    p.is_active,
    CASE 
        WHEN p.id IS NULL THEN '❌ PRODUCTO NO EXISTE'
        WHEN p.is_active = false THEN '⚠️ PRODUCTO INACTIVO'
        ELSE '✅ VÁLIDO'
    END as diagnostico
FROM glowhair_favorites f
LEFT JOIN glowhair_products p ON f.product_id = p.id
WHERE f.user_id = '4f2af4c0-a1f4-4f82-8f13-c0cf86600735'
ORDER BY f.created_at DESC;

-- 2️⃣ ¿CUÁNTOS PRODUCTOS VÁLIDOS TIENES EN LA BD?
-- ============================================
SELECT 
    COUNT(*) as total_productos,
    COUNT(CASE WHEN is_active = true THEN 1 END) as activos,
    COUNT(CASE WHEN is_active = false THEN 1 END) as inactivos
FROM glowhair_products;

-- 3️⃣ VER LOS PRIMEROS 5 PRODUCTOS DISPONIBLES
-- ============================================
SELECT id, name, slug, price, is_active, stock
FROM glowhair_products
WHERE is_active = true
ORDER BY created_at DESC
LIMIT 5;

-- 4️⃣ BUSCAR EL PRODUCT_ID DEL FAVORITO HUÉRFANO
-- ============================================
SELECT 
    f.id as favorito_id,
    f.product_id as product_id_buscado,
    f.created_at,
    'Este product_id NO existe en glowhair_products' as problema
FROM glowhair_favorites f
WHERE f.id = 'faa032b5-eec3-432a-b420-7d7b7d5f02c3';

-- 5️⃣ VERIFICAR SI ESE PRODUCT_ID EXISTE
-- ============================================
-- Primero ejecuta la query #4, copia el product_id_buscado
-- Luego ejecuta esto (reemplaza 'PEGA-EL-UUID-AQUI'):

-- SELECT * FROM glowhair_products 
-- WHERE id = 'PEGA-EL-UUID-AQUI';

-- Si retorna 0 rows → Producto fue eliminado o nunca existió
-- Si retorna 1 row → Problema con la query del API

-- 6️⃣ LIMPIAR TODOS LOS HUÉRFANOS DE TU USUARIO
-- ============================================
-- Esta query eliminará SOLO los favoritos con productos inexistentes

DELETE FROM glowhair_favorites
WHERE user_id = '4f2af4c0-a1f4-4f82-8f13-c0cf86600735'
  AND product_id NOT IN (SELECT id FROM glowhair_products);

-- 7️⃣ VERIFICAR DESPUÉS DE LIMPIAR
-- ============================================
SELECT COUNT(*) as favoritos_restantes 
FROM glowhair_favorites 
WHERE user_id = '4f2af4c0-a1f4-4f82-8f13-c0cf86600735';

-- ============================================
-- 🎯 PLAN DE ACCIÓN:
-- ============================================
-- 1. Ejecuta queries 1-4 para diagnóstico
-- 2. Si confirmas que el producto NO existe → Ejecuta query #6
-- 3. Refresca la página /favoritos
-- 4. Agrega un favorito NUEVO desde /productos
-- 5. Verifica que ahora SÍ aparezca con imagen y nombre

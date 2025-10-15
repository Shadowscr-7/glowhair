-- ============================================
-- DIAGNÓSTICO COMPLETO DE RECURSIÓN RLS
-- ============================================

-- 1️⃣ VER TODAS LAS POLÍTICAS RLS ACTUALES
-- ============================================
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    CASE 
        WHEN qual LIKE '%glowhair_profiles%' THEN '⚠️ REFERENCIA PROFILES'
        WHEN qual LIKE '%auth.uid()%' THEN '✅ USA auth.uid()'
        ELSE '📝 Otra política'
    END as tipo_policy,
    qual as condicion_using,
    with_check as condicion_with_check
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename LIKE 'glowhair_%'
ORDER BY tablename, policyname;

-- 2️⃣ VER TRIGGERS QUE PUEDAN CAUSAR RECURSIÓN
-- ============================================
SELECT 
    trigger_name,
    event_object_table,
    action_statement,
    action_timing,
    event_manipulation
FROM information_schema.triggers
WHERE event_object_schema = 'public'
  AND event_object_table LIKE 'glowhair_%'
ORDER BY event_object_table, trigger_name;

-- 3️⃣ VER FUNCIONES QUE PUEDAN ESTAR INVOLUCRADAS
-- ============================================
SELECT 
    routine_name,
    routine_type,
    routine_definition
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name LIKE '%profile%'
ORDER BY routine_name;

-- 4️⃣ SOLUCIÓN RÁPIDA: DESHABILITAR RLS TEMPORALMENTE
-- ============================================
-- CUIDADO: Esto hace que TODOS puedan acceder a TODO
-- SOLO para desarrollo/debugging

ALTER TABLE glowhair_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE glowhair_products DISABLE ROW LEVEL SECURITY;
ALTER TABLE glowhair_favorites DISABLE ROW LEVEL SECURITY;

-- 5️⃣ PROBAR SI FUNCIONA SIN RLS
-- ============================================
-- Después de deshabilitar RLS, prueba:
-- GET http://localhost:3000/api/favorites
-- Si funciona, el problema es definitivamente las políticas RLS

-- 6️⃣ RE-HABILITAR RLS CON POLÍTICAS LIMPIAS
-- ============================================
-- Una vez confirmado que funciona sin RLS:

-- Eliminar TODAS las políticas problemáticas
DO $$ 
DECLARE 
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname, tablename 
              FROM pg_policies 
              WHERE schemaname = 'public' 
                AND tablename IN ('glowhair_profiles', 'glowhair_products', 'glowhair_favorites'))
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I', r.policyname, r.tablename);
    END LOOP;
END $$;

-- Crear políticas SUPER SIMPLES (desarrollo)
ALTER TABLE glowhair_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "dev_profiles_all" ON glowhair_profiles FOR ALL USING (true);

ALTER TABLE glowhair_products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "dev_products_all" ON glowhair_products FOR ALL USING (true);

ALTER TABLE glowhair_favorites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "dev_favorites_all" ON glowhair_favorites FOR ALL USING (true);

-- 7️⃣ VERIFICAR CONFIGURACIÓN FINAL
-- ============================================
SELECT 
    tablename,
    COUNT(*) as num_policies
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename LIKE 'glowhair_%'
GROUP BY tablename;

-- Debería mostrar:
-- glowhair_profiles  | 1
-- glowhair_products  | 1
-- glowhair_favorites | 1

-- ============================================
-- PLAN DE ACCIÓN:
-- ============================================
-- 1. Ejecuta la query #4 (deshabilitar RLS)
-- 2. Prueba GET /api/favorites en tu navegador
-- 3. Si funciona → El problema son las políticas RLS
-- 4. Ejecuta la query #6 (políticas limpias)
-- 5. Prueba nuevamente GET /api/favorites
-- 6. Debería funcionar perfectamente ✅

# 🔧 Cómo Ejecutar el Fix de RLS

## Problema Actual
❌ **Error**: `new row violates row-level security policy for table "glowhair_orders"`

Esto significa que las políticas de seguridad (RLS) de Supabase están bloqueando la inserción de órdenes.

## Solución: Ejecutar el Script SQL

### Opción 1: Desde Supabase Dashboard (RECOMENDADO)

1. **Ir a Supabase Dashboard**
   - Abre tu navegador
   - Ve a: https://supabase.com/dashboard
   - Selecciona tu proyecto "glowhair"

2. **Abrir SQL Editor**
   - En el menú lateral izquierdo, busca "SQL Editor"
   - Click en "SQL Editor"

3. **Ejecutar el Script**
   - Click en "+ New Query"
   - Copia TODO el contenido del archivo `fix_rls_recursion.sql`
   - Pégalo en el editor
   - Click en "Run" (botón verde) o presiona `Ctrl + Enter`

4. **Verificar Ejecución**
   - Deberías ver mensajes de éxito
   - La última query mostrará todas las políticas creadas
   - Verifica que aparezcan políticas para:
     * `glowhair_profiles`
     * `glowhair_products`
     * `glowhair_favorites`
     * `glowhair_orders` ✅ (lo más importante)
     * `glowhair_order_items` ✅ (lo más importante)

### Opción 2: Desde VSCode con PostgreSQL Extension

Si tienes la extensión PostgreSQL instalada:

1. Conecta a tu base de datos Supabase
2. Abre `fix_rls_recursion.sql`
3. Selecciona todo el contenido
4. Click derecho → "Run Selected Query"

## ¿Qué Hace el Script?

### 1. Limpia Políticas Antiguas
Elimina todas las políticas problemáticas que causan recursión o bloqueos

### 2. Crea Políticas Permisivas (Solo Desarrollo)
```sql
-- Permite TODAS las operaciones en las tablas
USING (true)  -- Cualquiera puede leer
WITH CHECK (true)  -- Cualquiera puede escribir
```

⚠️ **IMPORTANTE**: Estas políticas son MUY permisivas y solo para desarrollo.

### 3. Habilita RLS
Asegura que Row Level Security esté activo en todas las tablas

## Después de Ejecutar el Script

### 1. Reinicia el Servidor Next.js
```bash
# Detener servidor (Ctrl + C)
# Reiniciar
pnpm dev
```

### 2. Prueba el Checkout
- Ve a http://localhost:3000/checkout
- Completa el formulario
- Click en "Confirmar y Pagar"
- ✅ Debería crear la orden exitosamente

### 3. Verifica en Supabase
1. Ve a Supabase Dashboard
2. Click en "Table Editor"
3. Abre tabla `glowhair_orders`
4. Deberías ver tu nueva orden creada

## Si Sigue Sin Funcionar

### Verificar Políticas Manualmente

Ejecuta este query en Supabase SQL Editor:

```sql
-- Ver todas las políticas de órdenes
SELECT 
    policyname,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'glowhair_orders';
```

**Deberías ver**:
- `orders_select_policy` - FOR SELECT - USING: true
- `orders_insert_policy` - FOR INSERT - WITH CHECK: true
- `orders_update_policy` - FOR UPDATE - USING: true
- `orders_delete_policy` - FOR DELETE - USING: true

### Deshabilitar RLS Temporalmente (Última Opción)

⚠️ **Solo si absolutamente nada funciona**:

```sql
-- QUITAR RLS (NO RECOMENDADO PARA PRODUCCIÓN)
ALTER TABLE glowhair_orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE glowhair_order_items DISABLE ROW LEVEL SECURITY;
```

Luego vuelve a habilitar con el script cuando esté funcionando.

## 🔒 Para Producción (Futuro)

Cuando estés listo para producción, cambia las políticas a:

```sql
-- Solo el usuario puede ver sus propias órdenes
CREATE POLICY "orders_select_own"
ON glowhair_orders
FOR SELECT
USING (auth.uid() = user_id);

-- Solo el usuario puede crear órdenes con su propio user_id
CREATE POLICY "orders_insert_own"
ON glowhair_orders
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Solo admins pueden actualizar órdenes
CREATE POLICY "orders_update_admin"
ON glowhair_orders
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM glowhair_profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);
```

## Resumen de Pasos

1. ✅ Actualizar `fix_rls_recursion.sql` (ya hecho)
2. ⏳ Ir a Supabase Dashboard
3. ⏳ Abrir SQL Editor
4. ⏳ Copiar y pegar el script completo
5. ⏳ Click en "Run"
6. ⏳ Verificar que no haya errores
7. ⏳ Reiniciar servidor Next.js
8. ⏳ Probar checkout nuevamente

¡Después de ejecutar el script, el sistema de órdenes debería funcionar perfectamente! 🚀

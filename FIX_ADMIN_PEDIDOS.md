# 🚨 FIX: Admin de Pedidos No Muestra Nada

## 🔍 Problema Detectado
El panel de administración de pedidos (`/admin/pedidos`) no muestra ningún pedido aunque existen 2 pedidos en la base de datos.

## 🎯 Causa Raíz
Las políticas RLS (Row Level Security) de Supabase para las tablas `glowhair_orders` y `glowhair_order_items` **NO están configuradas o están bloqueando el acceso**.

## ✅ Solución

### Opción 1: Aplicar SQL en Supabase Dashboard (RECOMENDADO)

1. **Ir a Supabase Dashboard**
   - Abre: https://supabase.com/dashboard
   - Selecciona tu proyecto "glowhair"
   - Ve a la sección **SQL Editor**

2. **Copiar y Pegar el SQL**
   - Abre el archivo: `fix_orders_rls.sql`
   - Copia TODO el contenido
   - Pégalo en el SQL Editor de Supabase
   - Click en **Run** (▶)

3. **Verificar Resultados**
   - Deberías ver 3 secciones de resultados:
     * Políticas aplicadas
     * Total de registros en las tablas
     * Sample de las últimas 5 órdenes

### Opción 2: Aplicar desde Terminal (Alternativa)

```bash
# Si tienes Supabase CLI configurado
supabase db push --file fix_orders_rls.sql
```

## 🔄 Verificar que Funcionó

Después de aplicar el SQL:

1. **Recargar la página de admin**
   - Ve a: http://localhost:3000/admin/pedidos
   - Presiona Ctrl+Shift+R (recarga forzada)

2. **Verificar en consola**
   - Abre DevTools (F12)
   - Ve a la pestaña Console
   - Busca estos logs:
     ```
     🔵 GET /api/orders - Inicio
     👑 Usuario admin - obteniendo todas las órdenes
     📊 Resultado getAllOrders: { ordersCount: 2, total: 2 }
     ```

3. **Verificar en Network**
   - En DevTools, ve a Network
   - Filtra por "orders"
   - El endpoint `/api/orders?is_admin=true&limit=1000` debería retornar:
     ```json
     {
       "orders": [...],  // Array con tus 2 pedidos
       "total": 2,
       "page": 1,
       "limit": 1000
     }
     ```

## 🧪 Debug Adicional

Si después de aplicar el SQL **TODAVÍA** no funciona:

### 1. Verificar políticas directamente en Supabase

```sql
-- Ejecutar en SQL Editor
SELECT 
    tablename,
    policyname,
    cmd,
    roles,
    qual,
    with_check
FROM pg_policies
WHERE tablename IN ('glowhair_orders', 'glowhair_order_items')
ORDER BY tablename, policyname;
```

Deberías ver:
- `glowhair_orders`: 4 políticas (select, insert, update, delete)
- `glowhair_order_items`: 4 políticas (select, insert, update, delete)
- Todas con `USING (true)` para desarrollo

### 2. Verificar que existen órdenes

```sql
-- Ejecutar en SQL Editor
SELECT COUNT(*) as total_orders FROM glowhair_orders;
SELECT COUNT(*) as total_items FROM glowhair_order_items;
```

### 3. Usar endpoint de debug

Visita en el navegador:
```
http://localhost:3000/api/debug/orders
```

Te mostrará información detallada de las órdenes y errores.

## 📝 Notas Importantes

### ⚠️ Políticas Permisivas (Desarrollo)
Las políticas aplicadas son **MUY permisivas** (`USING (true)`), lo que significa que cualquiera puede ver/editar todas las órdenes. Esto es correcto para **desarrollo local**.

### 🔒 Para Producción
Antes de deploy a producción, cambiar las políticas a:

```sql
-- Solo usuarios autenticados pueden ver sus propias órdenes
CREATE POLICY "orders_select_policy"
ON glowhair_orders
FOR SELECT
USING (auth.uid() = user_id);

-- Admins pueden ver todas las órdenes
CREATE POLICY "admin_orders_select_policy"
ON glowhair_orders
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM glowhair_profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);
```

## 🎬 Siguiente Paso

**Aplica el SQL ahora mismo siguiendo la Opción 1 y luego recarga la página de admin.**

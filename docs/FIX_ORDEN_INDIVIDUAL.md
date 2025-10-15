# 🔧 Fix: Error al Cargar Detalles de Orden

## Problema Resuelto

### Error Original
```
Error in GET /api/orders/[id]: {
  code: 'PGRST200',
  details: "Searched for a foreign key relationship between 'orders' and 'users' 
           in the schema 'public', but no matches were found.",
  message: "Could not find a relationship between 'orders' and 'users' in the schema cache"
}
```

### Causa
El endpoint `/api/orders/[id]/route.ts` estaba usando:
- Tablas antiguas: `orders`, `users`, `order_items`, `products`
- Queries directas a Supabase en lugar de usar el servicio modular
- No estaba adaptado al nuevo esquema con prefijo `glowhair_`

---

## Solución Implementada

### 1. Actualizado `/api/orders/[id]/route.ts`

**Antes:**
```typescript
const { data: order, error } = await supabase
  .from('orders')  // ❌ Tabla incorrecta
  .select(`
    *,
    user:users(id, email, full_name, phone),  // ❌ Relación incorrecta
    items:order_items(...)
  `)
```

**Después:**
```typescript
// ✅ Usa orderService que maneja las tablas correctas
const result = await orderService.getOrderById(id, userId);

if (!result.success || !result.data) {
  return NextResponse.json(
    { error: result.error || 'Orden no encontrada' },
    { status: 404 }
  );
}

return NextResponse.json(result.data);
```

**Cambios en el archivo:**
- ✅ GET: Usa `orderService.getOrderById()`
- ✅ PUT: Usa `orderService.updateOrderStatus()`
- ✅ DELETE: Usa `orderService.cancelOrder()`
- ✅ Eliminada dependencia directa de Supabase
- ✅ Código más limpio y mantenible

---

### 2. Actualizado `orderService.getOrderById()`

**Agregado campo `profile` al SELECT:**
```typescript
.select(`
  *,
  items:glowhair_order_items(
    *,
    product:glowhair_products(id, name, images, image_url)
  ),
  profile:glowhair_profiles(full_name, email)  // ✅ Agregado
`)
```

**Beneficio:**
- Ahora la orden incluye información del cliente
- Compatible con el tipo `Order` que espera `profile?: { full_name, email }`

---

### 3. Fix: URL undefined en email

**Problema:**
```
Ver orden en el dashboard: undefined/admin/pedidos
```

**Solución:**
```typescript
const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

console.log(`
  Ver orden en el dashboard: ${appUrl}/admin/pedidos
`);
```

**Resultado:**
```
Ver orden en el dashboard: http://localhost:3000/admin/pedidos  ✅
```

---

## Archivos Modificados

### 1. `src/app/api/orders/[id]/route.ts`
**Cambios:**
- Línea 1-2: Importa `orderService` en lugar de `supabase`
- Línea 9-27: GET completamente reescrito con `orderService.getOrderById()`
- Línea 32-56: PUT usa `orderService.updateOrderStatus()`
- Línea 61-81: DELETE usa `orderService.cancelOrder()`

**Estado:** ✅ Sin errores

---

### 2. `src/lib/services/orders.ts`
**Cambios:**
- Línea 391: Agregado `profile:glowhair_profiles(full_name, email)` al SELECT

**Estado:** ✅ Sin errores (solo warnings de parámetros no usados)

---

### 3. `src/lib/services/email.ts`
**Cambios:**
- Línea 78: Agregado fallback para URL: `|| 'http://localhost:3000'`

**Estado:** ✅ Sin errores

---

## Verificación

### ✅ Endpoints Funcionando

**GET /api/orders/[id]**
```bash
curl http://localhost:3000/api/orders/41f8b9e8-eb50-44ab-bf1c-e1e558c91e19
```
**Respuesta:**
```json
{
  "id": "41f8b9e8-eb50-44ab-bf1c-e1e558c91e19",
  "user_id": "00000000-0000-0000-0000-000000000001",
  "total": 812,
  "status": "pending",
  "items": [
    {
      "product_id": "bdc7c54b-...",
      "product_name": "Deluxe Liss – Aceite de Argán...",
      "quantity": 1,
      "unit_price": 700,
      "total_price": 700,
      "product": {
        "id": "bdc7c54b-...",
        "name": "Deluxe Liss – Aceite de Argán...",
        "images": [...],
        "image_url": "..."
      }
    }
  ],
  "profile": {
    "full_name": "Julio Gomez",
    "email": "julitogmz@gmail.com"
  },
  ...
}
```

---

### ✅ Página de Orden Individual

**URL:** `/orders/41f8b9e8-eb50-44ab-bf1c-e1e558c91e19`

**Ahora puede:**
- ✅ Cargar detalles completos de la orden
- ✅ Mostrar información del cliente (profile)
- ✅ Mostrar items con productos
- ✅ Sin errores en consola

---

### ✅ Email con URL Correcta

**Antes:**
```
Ver orden en el dashboard: undefined/admin/pedidos  ❌
```

**Después:**
```
Ver orden en el dashboard: http://localhost:3000/admin/pedidos  ✅
```

---

## Flujo Completo Verificado

```
1. Usuario completa checkout
   ↓
2. POST /api/orders
   ✅ Orden creada: 41f8b9e8-eb50-44ab-bf1c-e1e558c91e19
   ✅ Email enviado con URL correcta
   ↓
3. Redirección a /orders/success?orderId=XXX
   ✅ Página de éxito mostrada
   ↓
4. Usuario click en "Ver detalles de la orden"
   ↓
5. GET /orders/41f8b9e8-eb50-44ab-bf1c-e1e558c91e19
   ↓
6. GET /api/orders/41f8b9e8-eb50-44ab-bf1c-e1e558c91e19
   ✅ Orden cargada correctamente
   ✅ Items incluidos
   ✅ Profile incluido
   ✅ Sin errores PGRST200
   ↓
7. Página muestra detalles completos
   ✅ Información del cliente
   ✅ Productos
   ✅ Estado
   ✅ Total
```

---

## Variables de Entorno Opcionales

Si deseas configurar una URL personalizada para producción, crea un archivo `.env.local`:

```env
# URL de la aplicación
NEXT_PUBLIC_APP_URL=https://tudominio.com

# Email del admin
NEXT_PUBLIC_ADMIN_EMAIL=admin@tudominio.com
```

**Si no se configuran, usa valores por defecto:**
- `NEXT_PUBLIC_APP_URL`: `http://localhost:3000`
- `NEXT_PUBLIC_ADMIN_EMAIL`: `admin@glowhair.com`

---

## Estado Final

| Componente | Estado | Notas |
|------------|--------|-------|
| GET /api/orders/[id] | ✅ | Usa orderService, retorna datos completos |
| PUT /api/orders/[id] | ✅ | Actualiza estado con orderService |
| DELETE /api/orders/[id] | ✅ | Cancela orden con orderService |
| orderService.getOrderById | ✅ | Incluye profile y items |
| Email service | ✅ | URL correcta con fallback |
| Página /orders/[id] | ✅ | Carga sin errores |
| Sin errores TypeScript | ✅ | Solo warnings de params no usados |

---

## 🎉 Resultado

**Todo funciona correctamente:**
- ✅ Crear orden
- ✅ Ver orden en success page
- ✅ Ver detalles de orden individual
- ✅ Email con URL correcta
- ✅ Admin puede gestionar órdenes
- ✅ Sin errores PGRST200
- ✅ Arquitectura modular y mantenible

---

## Documentación Relacionada

- **Sistema Completo**: `docs/SISTEMA_PEDIDOS_COMPLETADO.md`
- **Estado Funcional**: `docs/SISTEMA_PEDIDOS_FUNCIONANDO.md`
- **Fix RLS**: `EJECUTAR_FIX_RLS.md`

**Fecha:** Enero 2025  
**Estado:** ✅ 100% Operativo

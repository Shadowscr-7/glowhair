# 📦 API de Órdenes - Documentación Completa

Esta documentación cubre todas las APIs REST para el manejo de órdenes (orders) en GlowHair.

## 📋 Tabla de Contenidos
- [Endpoints Disponibles](#endpoints-disponibles)
- [Estados de Orden](#estados-de-orden)
- [Autenticación](#autenticación)
- [Modelos de Datos](#modelos-de-datos)
- [Ejemplos de Uso](#ejemplos-de-uso)
- [Códigos de Error](#códigos-de-error)

---

## 🔗 Endpoints Disponibles

### 1. Listar Órdenes
**GET** `/api/orders`

Obtiene todas las órdenes. Los usuarios ven solo sus órdenes, los admins ven todas.

**Headers:**
```
x-user-id: string (requerido temporalmente)
x-is-admin: boolean (opcional, "true" para admins)
```

**Query Parameters:**
- `status` (string, opcional) - Filtrar por estado: pending, processing, shipped, delivered, cancelled
- `limit` (number, opcional) - Número de resultados (default: 50, max: 100)
- `offset` (number, opcional) - Offset para paginación (default: 0)

**Ejemplo:**
```
GET /api/orders?status=pending&limit=10&offset=0
```

**Respuesta Exitosa (200):**
```json
{
  "orders": [
    {
      "id": "order-123",
      "user_id": "user-456",
      "status": "pending",
      "subtotal": 51.98,
      "tax": 8.32,
      "shipping": 0,
      "total": 60.30,
      "shipping_address": "123 Main St, City",
      "billing_address": "123 Main St, City",
      "payment_method": "credit_card",
      "tracking_number": null,
      "notes": null,
      "created_at": "2024-01-15T10:30:00Z",
      "shipped_at": null,
      "delivered_at": null,
      "cancelled_at": null,
      "user": {
        "id": "user-456",
        "email": "user@example.com",
        "full_name": "John Doe"
      },
      "items": [
        {
          "id": "item-789",
          "product_id": "prod-111",
          "quantity": 2,
          "price": 25.99,
          "product": {
            "id": "prod-111",
            "name": "Shampoo Hidratante",
            "image": "https://example.com/image.jpg",
            "slug": "shampoo-hidratante"
          }
        }
      ]
    }
  ],
  "total": 45,
  "limit": 10,
  "offset": 0
}
```

**Errores:**
- `500` - Error del servidor

---

### 2. Crear Orden
**POST** `/api/orders`

Crea una nueva orden desde el carrito actual del usuario.

**Headers:**
```
x-user-id: string (requerido temporalmente)
Content-Type: application/json
```

**Body:**
```json
{
  "shipping_address": "123 Main St, City, State, ZIP",
  "billing_address": "123 Main St, City, State, ZIP",
  "payment_method": "credit_card",
  "notes": "Entregar en la puerta principal"
}
```

**Campos del Body:**
- `shipping_address` (string, requerido) - Dirección de envío completa
- `billing_address` (string, opcional) - Dirección de facturación (usa shipping_address si no se proporciona)
- `payment_method` (string, opcional) - Método de pago: credit_card, debit_card, paypal, etc. (default: "pending")
- `notes` (string, opcional) - Notas adicionales para la orden

**Respuesta Exitosa (201):**
```json
{
  "id": "order-123",
  "user_id": "user-456",
  "status": "pending",
  "subtotal": 51.98,
  "tax": 8.32,
  "shipping": 0,
  "total": 60.30,
  "shipping_address": "123 Main St, City",
  "billing_address": "123 Main St, City",
  "payment_method": "credit_card",
  "tracking_number": null,
  "notes": "Entregar en la puerta principal",
  "created_at": "2024-01-15T10:30:00Z",
  "items": [
    {
      "id": "item-789",
      "product_id": "prod-111",
      "quantity": 2,
      "price": 25.99,
      "product": {
        "id": "prod-111",
        "name": "Shampoo Hidratante",
        "image": "https://example.com/image.jpg",
        "slug": "shampoo-hidratante"
      }
    }
  ]
}
```

**Proceso Automático:**
1. ✅ Valida que el carrito no esté vacío
2. ✅ Verifica stock de todos los productos
3. ✅ Calcula totales (subtotal, impuestos, envío)
4. ✅ Crea la orden con estado "pending"
5. ✅ Copia items del carrito a order_items
6. ✅ Reduce el stock de los productos
7. ✅ Vacía el carrito del usuario

**Errores:**
- `400` - shipping_address es requerido
- `400` - El carrito está vacío
- `400` - Stock insuficiente para [producto]
- `500` - Error del servidor

---

### 3. Obtener Orden por ID
**GET** `/api/orders/[id]`

Obtiene detalles completos de una orden específica.

**Parámetros de URL:**
- `id` - ID de la orden

**Headers:**
```
x-user-id: string (requerido temporalmente)
x-is-admin: boolean (opcional)
```

**Respuesta Exitosa (200):**
```json
{
  "id": "order-123",
  "user_id": "user-456",
  "status": "shipped",
  "subtotal": 51.98,
  "tax": 8.32,
  "shipping": 0,
  "total": 60.30,
  "shipping_address": "123 Main St, City",
  "billing_address": "123 Main St, City",
  "payment_method": "credit_card",
  "tracking_number": "TRACK123456",
  "notes": "Entregar en la puerta principal",
  "created_at": "2024-01-15T10:30:00Z",
  "shipped_at": "2024-01-16T14:20:00Z",
  "delivered_at": null,
  "cancelled_at": null,
  "user": {
    "id": "user-456",
    "email": "user@example.com",
    "full_name": "John Doe",
    "phone": "+1234567890"
  },
  "items": [
    {
      "id": "item-789",
      "product_id": "prod-111",
      "quantity": 2,
      "price": 25.99,
      "product": {
        "id": "prod-111",
        "name": "Shampoo Hidratante",
        "image": "https://example.com/image.jpg",
        "slug": "shampoo-hidratante",
        "description": "Shampoo para cabello seco"
      }
    }
  ]
}
```

**Errores:**
- `403` - No autorizado para ver esta orden
- `404` - Orden no encontrada
- `500` - Error del servidor

---

### 4. Actualizar Estado de Orden
**PUT** `/api/orders/[id]`

Actualiza el estado y tracking de una orden (solo admin).

**Parámetros de URL:**
- `id` - ID de la orden

**Headers:**
```
x-is-admin: boolean (requerido - debe ser "true")
Content-Type: application/json
```

**Body:**
```json
{
  "status": "shipped",
  "tracking_number": "TRACK123456",
  "notes": "Enviado con DHL"
}
```

**Campos del Body (todos opcionales):**
- `status` (string) - Nuevo estado: pending, processing, shipped, delivered, cancelled
- `tracking_number` (string) - Número de rastreo del envío
- `notes` (string) - Notas adicionales sobre la orden

**Respuesta Exitosa (200):**
```json
{
  "id": "order-123",
  "status": "shipped",
  "tracking_number": "TRACK123456",
  "shipped_at": "2024-01-16T14:20:00Z",
  ...
}
```

**Notas:**
- Si `status` cambia a "shipped", se actualiza automáticamente `shipped_at`
- Si `status` cambia a "delivered", se actualiza automáticamente `delivered_at`

**Errores:**
- `400` - No hay campos para actualizar
- `403` - No autorizado (solo admin)
- `404` - Orden no encontrada
- `500` - Error del servidor

---

### 5. Cancelar Orden
**DELETE** `/api/orders/[id]`

Cancela una orden y restaura el stock (solo si está en estado "pending").

**Parámetros de URL:**
- `id` - ID de la orden

**Headers:**
```
x-user-id: string (requerido temporalmente)
x-is-admin: boolean (opcional)
```

**Respuesta Exitosa (200):**
```json
{
  "message": "Orden cancelada correctamente"
}
```

**Proceso Automático:**
1. ✅ Verifica que la orden esté en estado "pending"
2. ✅ Restaura el stock de todos los productos
3. ✅ Cambia el estado a "cancelled"
4. ✅ Actualiza `cancelled_at` con la fecha actual

**Errores:**
- `400` - Solo se pueden cancelar órdenes en estado pendiente
- `403` - No autorizado para cancelar esta orden
- `404` - Orden no encontrada
- `500` - Error del servidor

---

### 6. Obtener Órdenes por Usuario
**GET** `/api/orders/user/[userId]`

Obtiene todas las órdenes de un usuario específico.

**Parámetros de URL:**
- `userId` - ID del usuario

**Headers:**
```
x-user-id: string (requerido temporalmente)
x-is-admin: boolean (opcional)
```

**Query Parameters:**
- `limit` (number, opcional) - Número de resultados (default: 20)
- `offset` (number, opcional) - Offset para paginación (default: 0)

**Respuesta Exitosa (200):**
```json
{
  "orders": [...],
  "total": 12,
  "limit": 20,
  "offset": 0
}
```

**Errores:**
- `403` - No autorizado para ver órdenes de este usuario
- `500` - Error del servidor

---

### 7. Obtener Órdenes Recientes
**GET** `/api/orders/recent`

Obtiene las órdenes más recientes (útil para dashboards).

**Headers:**
```
x-user-id: string (requerido temporalmente)
x-is-admin: boolean (opcional)
```

**Query Parameters:**
- `limit` (number, opcional) - Número de órdenes (default: 10, max: 50)

**Respuesta Exitosa (200):**
```json
[
  {
    "id": "order-123",
    "status": "pending",
    "total": 60.30,
    "created_at": "2024-01-15T10:30:00Z",
    "user": {
      "id": "user-456",
      "email": "user@example.com",
      "full_name": "John Doe"
    },
    "items": [
      {
        "id": "item-789",
        "quantity": 2,
        "product": {
          "id": "prod-111",
          "name": "Shampoo Hidratante",
          "image": "https://example.com/image.jpg"
        }
      }
    ]
  }
]
```

**Errores:**
- `500` - Error del servidor

---

### 8. Estadísticas de Órdenes
**GET** `/api/orders/stats`

Obtiene estadísticas agregadas de todas las órdenes (solo admin).

**Headers:**
```
x-is-admin: boolean (requerido - debe ser "true")
```

**Respuesta Exitosa (200):**
```json
{
  "totalOrders": 145,
  "totalRevenue": 8745.50,
  "averageOrderValue": 60.31,
  "ordersByStatus": {
    "pending": 12,
    "processing": 8,
    "shipped": 15,
    "delivered": 105,
    "cancelled": 5
  },
  "ordersByMonth": {
    "2024-01": {
      "count": 25,
      "revenue": 1523.50
    },
    "2024-02": {
      "count": 30,
      "revenue": 1842.75
    }
  },
  "successRate": 72.41
}
```

**Campos de la Respuesta:**
- `totalOrders` - Total de órdenes creadas
- `totalRevenue` - Ingresos totales de todas las órdenes
- `averageOrderValue` - Valor promedio por orden
- `ordersByStatus` - Conteo de órdenes por cada estado
- `ordersByMonth` - Órdenes y revenue por mes (últimos 6 meses)
- `successRate` - Porcentaje de órdenes entregadas exitosamente

**Errores:**
- `403` - No autorizado (solo admin)
- `500` - Error del servidor

---

## 🏷️ Estados de Orden

| Estado | Descripción | Puede Cancelar |
|--------|-------------|----------------|
| `pending` | Orden creada, esperando confirmación de pago | ✅ Sí |
| `processing` | Orden confirmada, preparando para envío | ❌ No |
| `shipped` | Orden enviada, en tránsito | ❌ No |
| `delivered` | Orden entregada al cliente | ❌ No |
| `cancelled` | Orden cancelada por usuario o admin | ❌ No |

---

## 🔐 Autenticación

**Temporalmente**, las APIs usan headers personalizados:

```bash
x-user-id: user-123          # ID del usuario
x-is-admin: true             # Si es administrador
```

**En producción**, se debe:
1. Implementar JWT con Supabase Auth
2. Extraer `userId` y `role` del token
3. Validar permisos en cada endpoint

---

## 📦 Modelos de Datos

### Order
```typescript
{
  id: string;
  user_id: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  shipping_address: string;
  billing_address: string;
  payment_method: string;
  tracking_number: string | null;
  notes: string | null;
  created_at: string;
  shipped_at: string | null;
  delivered_at: string | null;
  cancelled_at: string | null;
}
```

### OrderItem
```typescript
{
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price: number;
  created_at: string;
}
```

---

## 💡 Ejemplos de Uso

### Ejemplo 1: Crear Orden desde Carrito
```javascript
const createOrder = async (shippingInfo) => {
  try {
    const response = await fetch('/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': 'user-123'
      },
      body: JSON.stringify({
        shipping_address: shippingInfo.address,
        billing_address: shippingInfo.billingAddress,
        payment_method: 'credit_card',
        notes: shippingInfo.notes
      })
    });

    const order = await response.json();

    if (response.ok) {
      console.log('Orden creada:', order.id);
      console.log('Total:', order.total);
      // Redirigir a página de confirmación
      window.location.href = `/orders/${order.id}`;
    } else {
      console.error('Error:', order.error);
      alert(order.error);
    }
  } catch (error) {
    console.error('Error al crear orden:', error);
  }
};
```

### Ejemplo 2: Ver Historial de Órdenes
```javascript
const getMyOrders = async () => {
  try {
    const response = await fetch('/api/orders?limit=10&offset=0', {
      headers: {
        'x-user-id': 'user-123'
      }
    });

    const data = await response.json();

    if (response.ok) {
      console.log(`Total de órdenes: ${data.total}`);
      data.orders.forEach(order => {
        console.log(`Orden ${order.id}: $${order.total} - ${order.status}`);
      });
    }
  } catch (error) {
    console.error('Error:', error);
  }
};
```

### Ejemplo 3: Actualizar Estado (Admin)
```javascript
const updateOrderStatus = async (orderId, newStatus, trackingNumber) => {
  try {
    const response = await fetch(`/api/orders/${orderId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-is-admin': 'true'
      },
      body: JSON.stringify({
        status: newStatus,
        tracking_number: trackingNumber
      })
    });

    const order = await response.json();

    if (response.ok) {
      console.log('Orden actualizada:', order);
      // Enviar email de notificación al cliente
      sendOrderStatusEmail(order);
    }
  } catch (error) {
    console.error('Error:', error);
  }
};
```

### Ejemplo 4: Cancelar Orden
```javascript
const cancelOrder = async (orderId) => {
  if (!confirm('¿Estás seguro de cancelar esta orden?')) {
    return;
  }

  try {
    const response = await fetch(`/api/orders/${orderId}`, {
      method: 'DELETE',
      headers: {
        'x-user-id': 'user-123'
      }
    });

    const result = await response.json();

    if (response.ok) {
      console.log(result.message);
      alert('Orden cancelada. El stock ha sido restaurado.');
      // Recargar lista de órdenes
      loadOrders();
    } else {
      alert(result.error);
    }
  } catch (error) {
    console.error('Error:', error);
  }
};
```

### Ejemplo 5: Dashboard de Admin
```javascript
const loadAdminDashboard = async () => {
  try {
    // Obtener estadísticas
    const statsResponse = await fetch('/api/orders/stats', {
      headers: { 'x-is-admin': 'true' }
    });
    const stats = await statsResponse.json();

    console.log('Total de órdenes:', stats.totalOrders);
    console.log('Ingresos totales:', `$${stats.totalRevenue}`);
    console.log('Valor promedio:', `$${stats.averageOrderValue}`);
    console.log('Tasa de éxito:', `${stats.successRate}%`);

    // Obtener órdenes recientes
    const recentResponse = await fetch('/api/orders/recent?limit=5', {
      headers: { 'x-is-admin': 'true' }
    });
    const recentOrders = await recentResponse.json();

    console.log('Órdenes recientes:');
    recentOrders.forEach(order => {
      console.log(`- ${order.id}: $${order.total} (${order.status})`);
    });

    // Renderizar dashboard
    renderDashboard(stats, recentOrders);
  } catch (error) {
    console.error('Error:', error);
  }
};
```

### Ejemplo 6: Componente React de Lista de Órdenes
```typescript
import { useState, useEffect } from 'react';

interface Order {
  id: string;
  status: string;
  total: number;
  created_at: string;
  items: Array<{
    product: {
      name: string;
      image: string;
    };
    quantity: number;
  }>;
}

const OrdersList = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const response = await fetch('/api/orders', {
        headers: { 'x-user-id': 'user-123' }
      });
      const data = await response.json();
      setOrders(data.orders);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'yellow',
      processing: 'blue',
      shipped: 'purple',
      delivered: 'green',
      cancelled: 'red'
    };
    return colors[status] || 'gray';
  };

  if (loading) return <div>Cargando órdenes...</div>;

  return (
    <div className="orders-list">
      <h2>Mis Órdenes</h2>
      {orders.length === 0 ? (
        <p>No tienes órdenes aún</p>
      ) : (
        orders.map(order => (
          <div key={order.id} className="order-card">
            <div className="order-header">
              <span className="order-id">#{order.id}</span>
              <span className={`status ${getStatusColor(order.status)}`}>
                {order.status}
              </span>
            </div>
            <div className="order-items">
              {order.items.map((item, idx) => (
                <div key={idx} className="order-item">
                  <img src={item.product.image} alt={item.product.name} />
                  <span>{item.product.name} x{item.quantity}</span>
                </div>
              ))}
            </div>
            <div className="order-footer">
              <span className="order-date">
                {new Date(order.created_at).toLocaleDateString()}
              </span>
              <span className="order-total">${order.total.toFixed(2)}</span>
            </div>
            <button onClick={() => window.location.href = `/orders/${order.id}`}>
              Ver Detalles
            </button>
          </div>
        ))
      )}
    </div>
  );
};
```

---

## ⚠️ Códigos de Error

| Código | Descripción |
|--------|-------------|
| 200 | Operación exitosa |
| 201 | Orden creada exitosamente |
| 400 | Solicitud inválida (campos faltantes, validación fallida) |
| 403 | No autorizado (permisos insuficientes) |
| 404 | Orden no encontrada |
| 500 | Error interno del servidor |

---

## 🔄 Flujo Completo de Orden

1. **Agregar Productos** → Usuario agrega productos al carrito
2. **Ver Carrito** → Usuario revisa carrito y total
3. **Checkout** → Usuario ingresa dirección de envío
4. **Crear Orden** → `POST /api/orders` convierte carrito en orden
5. **Confirmación** → Sistema muestra orden con número de tracking
6. **Notificación** → Usuario recibe email con detalles
7. **Admin Procesa** → Admin actualiza estado: `PUT /api/orders/[id]`
8. **Envío** → Admin marca como "shipped" con tracking
9. **Entrega** → Admin marca como "delivered"
10. **Opcional: Cancelar** → Usuario puede cancelar si está "pending"

---

## 📝 Notas Importantes

1. **Stock Management**: El stock se reduce automáticamente al crear la orden
2. **Stock Restoration**: El stock se restaura automáticamente al cancelar
3. **Only Pending Can Cancel**: Solo órdenes "pending" pueden ser canceladas
4. **Auto Timestamps**: `shipped_at`, `delivered_at`, `cancelled_at` se actualizan automáticamente
5. **Tax Calculation**: Se calcula 16% de impuestos sobre el subtotal
6. **Free Shipping**: Envío gratis si subtotal ≥ $50
7. **Cart Clearing**: El carrito se vacía automáticamente al crear la orden

---

## 🚀 Testing con cURL

```bash
# 1. Listar mis órdenes
curl http://localhost:3000/api/orders \
  -H "x-user-id: user-123"

# 2. Crear orden desde carrito
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -H "x-user-id: user-123" \
  -d '{
    "shipping_address": "123 Main St, City, State, ZIP",
    "payment_method": "credit_card",
    "notes": "Entregar en la tarde"
  }'

# 3. Ver orden específica
curl http://localhost:3000/api/orders/order-123 \
  -H "x-user-id: user-123"

# 4. Actualizar estado (admin)
curl -X PUT http://localhost:3000/api/orders/order-123 \
  -H "Content-Type: application/json" \
  -H "x-is-admin: true" \
  -d '{
    "status": "shipped",
    "tracking_number": "TRACK123456"
  }'

# 5. Ver estadísticas (admin)
curl http://localhost:3000/api/orders/stats \
  -H "x-is-admin: true"

# 6. Ver órdenes recientes
curl http://localhost:3000/api/orders/recent?limit=5 \
  -H "x-user-id: user-123"

# 7. Cancelar orden
curl -X DELETE http://localhost:3000/api/orders/order-123 \
  -H "x-user-id: user-123"

# 8. Filtrar por estado
curl "http://localhost:3000/api/orders?status=pending&limit=10" \
  -H "x-user-id: user-123"
```

---

## 🔧 Próximos Pasos

- [ ] Implementar autenticación JWT con Supabase
- [ ] Agregar notificaciones por email de cambios de estado
- [ ] Implementar webhooks para pagos (Stripe, PayPal)
- [ ] Agregar sistema de reembolsos
- [ ] Implementar tracking en tiempo real
- [ ] Agregar valoraciones de órdenes entregadas
- [ ] Implementar exportación de órdenes a CSV/PDF
- [ ] Agregar filtros avanzados (rango de fechas, precio)

---

**Documentación creada el:** 9 de Octubre, 2025  
**Última actualización:** 9 de Octubre, 2025  
**Versión:** 1.0.0

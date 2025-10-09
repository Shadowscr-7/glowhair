# 🛒 API de Carrito - Documentación Completa

Esta documentación cubre todas las APIs REST para el manejo del carrito de compras en GlowHair.

## 📋 Tabla de Contenidos
- [Endpoints Disponibles](#endpoints-disponibles)
- [Autenticación](#autenticación)
- [Modelos de Datos](#modelos-de-datos)
- [Ejemplos de Uso](#ejemplos-de-uso)
- [Códigos de Error](#códigos-de-error)

---

## 🔗 Endpoints Disponibles

### 1. Obtener Carrito
**GET** `/api/cart`

Obtiene todos los items del carrito del usuario actual con información completa del producto.

**Headers:**
```
x-user-id: string (requerido temporalmente)
```

**Respuesta Exitosa (200):**
```json
[
  {
    "id": "cart-item-id",
    "user_id": "user-123",
    "product_id": "prod-456",
    "quantity": 2,
    "created_at": "2024-01-15T10:30:00Z",
    "product": {
      "id": "prod-456",
      "name": "Shampoo Hidratante",
      "price": 25.99,
      "original_price": 29.99,
      "image": "https://example.com/image.jpg",
      "slug": "shampoo-hidratante",
      "stock": 50,
      "category_name": "Shampoos"
    }
  }
]
```

**Errores:**
- `400` - Error al obtener carrito
- `500` - Error del servidor

---

### 2. Agregar al Carrito
**POST** `/api/cart`

Agrega un producto al carrito o incrementa la cantidad si ya existe.

**Headers:**
```
x-user-id: string (requerido temporalmente)
Content-Type: application/json
```

**Body:**
```json
{
  "product_id": "prod-456",
  "quantity": 2
}
```

**Campos del Body:**
- `product_id` (string, requerido) - ID del producto a agregar
- `quantity` (number, opcional) - Cantidad a agregar (default: 1)

**Respuesta Exitosa (201):**
```json
{
  "id": "cart-item-id",
  "user_id": "user-123",
  "product_id": "prod-456",
  "quantity": 2,
  "created_at": "2024-01-15T10:30:00Z"
}
```

**Errores:**
- `400` - product_id es requerido
- `400` - La cantidad debe ser mayor a 0
- `400` - Producto no disponible en stock
- `500` - Error del servidor

---

### 3. Actualizar Item del Carrito
**PUT** `/api/cart/[itemId]`

Actualiza la cantidad de un item específico en el carrito.

**Parámetros de URL:**
- `itemId` - ID del item del carrito

**Headers:**
```
x-user-id: string (requerido temporalmente)
Content-Type: application/json
```

**Body:**
```json
{
  "quantity": 3
}
```

**Campos del Body:**
- `quantity` (number, requerido) - Nueva cantidad (0 elimina el item)

**Respuesta Exitosa (200):**
```json
{
  "id": "cart-item-id",
  "user_id": "user-123",
  "product_id": "prod-456",
  "quantity": 3,
  "created_at": "2024-01-15T10:30:00Z"
}
```

**Nota:** Si `quantity` es 0, el item se eliminará y la respuesta será `null`.

**Errores:**
- `400` - quantity es requerido
- `400` - La cantidad debe ser un número mayor o igual a 0
- `400` - Item no encontrado en el carrito
- `500` - Error del servidor

---

### 4. Eliminar Item del Carrito
**DELETE** `/api/cart/[itemId]`

Elimina un item específico del carrito.

**Parámetros de URL:**
- `itemId` - ID del item del carrito

**Headers:**
```
x-user-id: string (requerido temporalmente)
```

**Respuesta Exitosa (200):**
```json
{
  "message": "Item eliminado del carrito correctamente"
}
```

**Errores:**
- `400` - Item no encontrado en el carrito
- `500` - Error del servidor

---

### 5. Vaciar Carrito
**DELETE** `/api/cart`

Elimina todos los items del carrito del usuario.

**Headers:**
```
x-user-id: string (requerido temporalmente)
```

**Respuesta Exitosa (200):**
```json
{
  "message": "Carrito vaciado correctamente"
}
```

**Errores:**
- `400` - Error al vaciar carrito
- `500` - Error del servidor

---

### 6. Contador del Carrito
**GET** `/api/cart/count`

Obtiene el número total de items en el carrito (suma de cantidades).

**Headers:**
```
x-user-id: string (requerido temporalmente)
```

**Respuesta Exitosa (200):**
```json
{
  "count": 5,
  "uniqueItems": 3
}
```

**Campos de la Respuesta:**
- `count` - Número total de items (suma de cantidades)
- `uniqueItems` - Número de productos únicos en el carrito

**Errores:**
- `500` - Error del servidor

---

### 7. Total del Carrito
**GET** `/api/cart/total`

Calcula el total del carrito incluyendo subtotal, impuestos, descuentos y envío.

**Headers:**
```
x-user-id: string (requerido temporalmente)
```

**Respuesta Exitosa (200):**
```json
{
  "subtotal": 51.98,
  "tax": 8.32,
  "discount": 8.00,
  "shipping": 0,
  "total": 60.30,
  "items": 2,
  "taxRate": 0.16,
  "freeShippingThreshold": 50,
  "freeShipping": true
}
```

**Campos de la Respuesta:**
- `subtotal` - Suma de (precio × cantidad) de todos los items
- `tax` - Impuestos calculados (16% del subtotal)
- `discount` - Descuentos totales aplicados
- `shipping` - Costo de envío ($5.99 o gratis si subtotal ≥ $50)
- `total` - Total final a pagar (subtotal + tax + shipping)
- `items` - Número de productos únicos
- `taxRate` - Tasa de impuesto aplicada (0.16 = 16%)
- `freeShippingThreshold` - Umbral para envío gratis ($50)
- `freeShipping` - Si el usuario califica para envío gratis

**Errores:**
- `500` - Error del servidor

---

## 🔐 Autenticación

**Temporalmente**, las APIs usan el header `x-user-id` para identificar al usuario:

```bash
curl -H "x-user-id: user-123" http://localhost:3000/api/cart
```

**En producción**, se debe:
1. Implementar autenticación con Supabase Auth
2. Extraer el `userId` del token JWT
3. Validar la sesión en cada request

---

## 📦 Modelos de Datos

### CartItem
```typescript
{
  id: string;                    // ID del item en el carrito
  user_id: string;               // ID del usuario
  product_id: string;            // ID del producto
  quantity: number;              // Cantidad
  created_at: string;            // Fecha de creación (ISO 8601)
}
```

### CartItemWithProduct (GET /api/cart)
```typescript
{
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  created_at: string;
  product: {
    id: string;
    name: string;
    price: number;
    original_price?: number;
    image?: string;
    slug: string;
    stock: number;
    category_name?: string;
  }
}
```

---

## 💡 Ejemplos de Uso

### Ejemplo 1: Agregar Producto al Carrito
```javascript
const addToCart = async (productId, quantity = 1) => {
  const response = await fetch('/api/cart', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-user-id': 'user-123'
    },
    body: JSON.stringify({
      product_id: productId,
      quantity: quantity
    })
  });

  const data = await response.json();
  
  if (response.ok) {
    console.log('Producto agregado:', data);
    // Actualizar contador del carrito
    updateCartCount();
  } else {
    console.error('Error:', data.error);
  }
};
```

### Ejemplo 2: Obtener Carrito Completo
```javascript
const getCart = async () => {
  const response = await fetch('/api/cart', {
    headers: {
      'x-user-id': 'user-123'
    }
  });

  const cartItems = await response.json();
  
  if (response.ok) {
    console.log('Items en carrito:', cartItems);
    // Renderizar items del carrito
    renderCartItems(cartItems);
  }
};
```

### Ejemplo 3: Actualizar Cantidad
```javascript
const updateQuantity = async (itemId, newQuantity) => {
  const response = await fetch(`/api/cart/${itemId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'x-user-id': 'user-123'
    },
    body: JSON.stringify({
      quantity: newQuantity
    })
  });

  const data = await response.json();
  
  if (response.ok) {
    if (data === null) {
      console.log('Item eliminado (cantidad = 0)');
    } else {
      console.log('Cantidad actualizada:', data);
    }
    // Recalcular total
    updateCartTotal();
  }
};
```

### Ejemplo 4: Obtener Total del Carrito
```javascript
const getCartTotal = async () => {
  const response = await fetch('/api/cart/total', {
    headers: {
      'x-user-id': 'user-123'
    }
  });

  const totals = await response.json();
  
  if (response.ok) {
    console.log('Subtotal:', totals.subtotal);
    console.log('Impuestos:', totals.tax);
    console.log('Envío:', totals.shipping);
    console.log('Total:', totals.total);
    
    if (totals.freeShipping) {
      console.log('¡Envío gratis!');
    } else {
      const remaining = totals.freeShippingThreshold - totals.subtotal;
      console.log(`Agrega $${remaining.toFixed(2)} más para envío gratis`);
    }
  }
};
```

### Ejemplo 5: Flujo Completo - Agregar y Ver Total
```javascript
const addProductAndShowTotal = async (productId, quantity) => {
  try {
    // 1. Agregar producto al carrito
    const addResponse = await fetch('/api/cart', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': 'user-123'
      },
      body: JSON.stringify({ product_id: productId, quantity })
    });

    if (!addResponse.ok) throw new Error('Error al agregar producto');

    // 2. Obtener contador actualizado
    const countResponse = await fetch('/api/cart/count', {
      headers: { 'x-user-id': 'user-123' }
    });
    const countData = await countResponse.json();
    
    // Actualizar badge del carrito
    updateCartBadge(countData.count);

    // 3. Obtener total actualizado
    const totalResponse = await fetch('/api/cart/total', {
      headers: { 'x-user-id': 'user-123' }
    });
    const totalData = await totalResponse.json();
    
    // Mostrar notificación
    showNotification(`
      Producto agregado! 
      Total: $${totalData.total}
      ${totalData.freeShipping ? '¡Envío gratis!' : ''}
    `);

  } catch (error) {
    console.error('Error:', error);
    showError('No se pudo agregar el producto');
  }
};
```

### Ejemplo 6: Componente React de Carrito
```typescript
import { useState, useEffect } from 'react';

interface CartTotal {
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  freeShipping: boolean;
}

const CartSummary = () => {
  const [totals, setTotals] = useState<CartTotal | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCartTotal();
  }, []);

  const loadCartTotal = async () => {
    try {
      const response = await fetch('/api/cart/total', {
        headers: { 'x-user-id': 'user-123' }
      });
      const data = await response.json();
      setTotals(data);
    } catch (error) {
      console.error('Error loading cart total:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Cargando...</div>;
  if (!totals) return <div>Error al cargar carrito</div>;

  return (
    <div className="cart-summary">
      <div className="row">
        <span>Subtotal:</span>
        <span>${totals.subtotal.toFixed(2)}</span>
      </div>
      <div className="row">
        <span>Impuestos:</span>
        <span>${totals.tax.toFixed(2)}</span>
      </div>
      <div className="row">
        <span>Envío:</span>
        <span>
          {totals.freeShipping ? (
            <span className="free">¡GRATIS!</span>
          ) : (
            `$${totals.shipping.toFixed(2)}`
          )}
        </span>
      </div>
      {totals.discount > 0 && (
        <div className="row discount">
          <span>Descuento:</span>
          <span>-${totals.discount.toFixed(2)}</span>
        </div>
      )}
      <div className="row total">
        <span>Total:</span>
        <span>${totals.total.toFixed(2)}</span>
      </div>
    </div>
  );
};
```

---

## ⚠️ Códigos de Error

| Código | Descripción |
|--------|-------------|
| 200 | Operación exitosa |
| 201 | Producto agregado al carrito |
| 400 | Solicitud inválida (faltan campos, valores incorrectos) |
| 401 | No autenticado (futuro) |
| 404 | Item no encontrado |
| 500 | Error interno del servidor |

---

## 🔄 Flujo de Usuario Típico

1. **Ver Producto** → Usuario ve un producto en la tienda
2. **Agregar al Carrito** → `POST /api/cart` con product_id y quantity
3. **Ver Badge** → `GET /api/cart/count` para actualizar contador
4. **Ver Carrito** → `GET /api/cart` para mostrar página del carrito
5. **Modificar Cantidad** → `PUT /api/cart/[itemId]` para cambiar cantidad
6. **Ver Total** → `GET /api/cart/total` para mostrar resumen
7. **Eliminar Item** → `DELETE /api/cart/[itemId]` si cambia de opinión
8. **Checkout** → Proceder a pago con el total calculado

---

## 📝 Notas Importantes

1. **Stock Validation**: Las APIs verifican stock disponible antes de agregar/actualizar
2. **Envío Gratis**: Se otorga automáticamente si el subtotal ≥ $50
3. **Impuestos**: Se calcula 16% sobre el subtotal
4. **Descuentos**: Se calculan automáticamente si hay `original_price`
5. **Eliminación Suave**: `quantity = 0` elimina el item automáticamente

---

## 🚀 Testing con cURL

```bash
# 1. Ver carrito
curl http://localhost:3000/api/cart \
  -H "x-user-id: user-123"

# 2. Agregar producto
curl -X POST http://localhost:3000/api/cart \
  -H "Content-Type: application/json" \
  -H "x-user-id: user-123" \
  -d '{"product_id":"prod-456","quantity":2}'

# 3. Actualizar cantidad
curl -X PUT http://localhost:3000/api/cart/item-789 \
  -H "Content-Type: application/json" \
  -H "x-user-id: user-123" \
  -d '{"quantity":3}'

# 4. Ver total
curl http://localhost:3000/api/cart/total \
  -H "x-user-id: user-123"

# 5. Ver contador
curl http://localhost:3000/api/cart/count \
  -H "x-user-id: user-123"

# 6. Eliminar item
curl -X DELETE http://localhost:3000/api/cart/item-789 \
  -H "x-user-id: user-123"

# 7. Vaciar carrito
curl -X DELETE http://localhost:3000/api/cart \
  -H "x-user-id: user-123"
```

---

## 🔧 Próximos Pasos

- [ ] Implementar autenticación con JWT
- [ ] Agregar validación de stock en tiempo real
- [ ] Implementar límites de cantidad por producto
- [ ] Agregar cupones de descuento
- [ ] Implementar carrito persistente (guardar para después)
- [ ] Agregar notificaciones de cambios de precio
- [ ] Implementar rate limiting

---

**Documentación creada el:** 9 de Octubre, 2025  
**Última actualización:** 9 de Octubre, 2025  
**Versión:** 1.0.0

# Integración con Mercado Pago

## 📋 Requisitos Previos

1. **Cuenta de Mercado Pago**
   - Crear cuenta en [Mercado Pago Uruguay](https://www.mercadopago.com.uy/)
   - Verificar la cuenta (puede requerir documentos)

2. **Credenciales de API**
   - Ir a [Credenciales](https://www.mercadopago.com.uy/developers/panel/credentials)
   - Obtener `Access Token` de prueba y producción

## 🔧 Configuración

### 1. Instalar SDK de Mercado Pago

```bash
npm install mercadopago
```

### 2. Configurar Variables de Entorno

Agregar en `.env.local`:

```env
# Mercado Pago - Modo Prueba
MERCADOPAGO_ACCESS_TOKEN=TEST-xxxxxxxxxx-xxxxxx-xxxxxx-xxxxxxxxx

# Mercado Pago - Producción (cuando estés listo)
# MERCADOPAGO_ACCESS_TOKEN=APP_USR-xxxxxxxxxx-xxxxxx-xxxxxx-xxxxxxxxx

# URL pública de tu aplicación (para webhooks)
NEXT_PUBLIC_APP_URL=https://tu-dominio.com
```

### 3. Habilitar el Código en los Endpoints

#### En `/api/mercadopago/create-preference/route.ts`:
- Descomentar el código de PRODUCCIÓN
- Comentar o eliminar la SIMULACIÓN

#### En `/api/mercadopago/webhook/route.ts`:
- Descomentar el código de PRODUCCIÓN
- Implementar las funciones de actualización de pedidos

### 4. Configurar Webhook en Mercado Pago

1. Ir a [Webhooks](https://www.mercadopago.com.uy/developers/panel/webhooks)
2. Agregar nueva notificación
3. URL: `https://tu-dominio.com/api/mercadopago/webhook`
4. Eventos: Seleccionar "Pagos"

## 🧪 Modo de Pruebas

### Credenciales de Prueba

Mercado Pago proporciona credenciales de prueba para desarrollo:
- Access Token de prueba
- Usuarios de prueba para comprador y vendedor

### Tarjetas de Prueba

Para probar diferentes escenarios:

**Tarjeta Aprobada:**
- Número: `5031 7557 3453 0604`
- CVV: `123`
- Fecha: Cualquier fecha futura

**Tarjeta Rechazada:**
- Número: `5031 4332 1540 6351`
- CVV: `123`
- Fecha: Cualquier fecha futura

Más tarjetas de prueba en: https://www.mercadopago.com.uy/developers/es/docs/checkout-api/integration-test/test-cards

## 💳 Flujo de Pago

### 1. Cliente Confirma Pedido
```
Cliente → Frontend → POST /api/orders (crear pedido)
```

### 2. Crear Preferencia de Pago
```typescript
const preference = await fetch('/api/mercadopago/create-preference', {
  method: 'POST',
  body: JSON.stringify({
    orderId: order.id,
    items: [...],
    payer: {...},
    back_urls: {...}
  })
});

const { init_point } = await preference.json();
window.location.href = init_point; // Redirigir a Mercado Pago
```

### 3. Cliente Paga en Mercado Pago
- Cliente completa el pago
- Mercado Pago procesa la transacción

### 4. Mercado Pago Notifica
```
Mercado Pago → POST /api/mercadopago/webhook
```

### 5. Actualizar Estado del Pedido
```typescript
// En el webhook
switch (payment.status) {
  case 'approved':
    // Actualizar pedido como pagado
    // Enviar email de confirmación
    break;
  case 'rejected':
    // Notificar rechazo
    break;
}
```

### 6. Redirigir al Cliente
Según los `back_urls` configurados:
- **success**: `https://tu-dominio.com/orders/:id?status=success`
- **pending**: `https://tu-dominio.com/orders/:id?status=pending`
- **failure**: `https://tu-dominio.com/checkout?status=failure`

## 🔒 Seguridad

### Validar Notificaciones del Webhook

```typescript
// Verificar que la petición viene de Mercado Pago
const signature = request.headers.get('x-signature');
const requestId = request.headers.get('x-request-id');

// Validar firma
const isValid = mercadopago.webhooks.validateSignature(
  signature,
  requestId,
  notification
);

if (!isValid) {
  return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
}
```

## 📊 Estados de Pago

| Estado | Descripción | Acción |
|--------|-------------|--------|
| `approved` | Pago aprobado | Marcar pedido como pagado, enviar confirmación |
| `pending` | Pago pendiente | Esperar confirmación bancaria |
| `rejected` | Pago rechazado | Notificar al cliente, permitir reintento |
| `refunded` | Pago reembolsado | Actualizar inventario, notificar |
| `cancelled` | Pago cancelado | Liberar productos del inventario |

## 🌍 Configuración Regional

Para Uruguay:
- **Moneda**: `UYU` (Peso uruguayo)
- **Site ID**: `MLU`
- **Métodos de pago disponibles**: 
  - Tarjetas de crédito (Visa, Mastercard, OCA)
  - Tarjetas de débito
  - Pagofácil
  - Abitab
  - Transferencia bancaria

## 📱 Experiencia Mobile

Mercado Pago proporciona un checkout responsive optimizado para mobile. No requiere configuración adicional.

## 🔍 Monitoreo

### Dashboard de Mercado Pago
- Ver todas las transacciones
- Análisis de conversión
- Reportes de ventas

### Logs en tu Aplicación
```typescript
console.log('💳 Pago procesado:', {
  orderId,
  paymentId,
  status,
  amount
});
```

## 🆘 Soporte

- [Documentación oficial](https://www.mercadopago.com.uy/developers/es/docs)
- [Comunidad de desarrolladores](https://www.mercadopago.com.uy/developers/es/community)
- Soporte técnico: developers@mercadopago.com

## ✅ Checklist de Producción

- [ ] Credenciales de producción configuradas
- [ ] Webhook configurado y probado
- [ ] Manejo de errores implementado
- [ ] Emails de confirmación/rechazo
- [ ] Tests de integración pasando
- [ ] Monitoreo de transacciones activo
- [ ] Política de reembolsos definida
- [ ] Cumplimiento con normativas locales

## 💡 Tips

1. **Siempre usa modo prueba primero** antes de producción
2. **Guarda logs** de todas las transacciones para debugging
3. **Implementa retry logic** para webhooks (Mercado Pago reintentará varias veces)
4. **Valida siempre** la información del webhook consultando la API
5. **No confíes solo en los back_urls** - usa webhooks para confirmar pagos

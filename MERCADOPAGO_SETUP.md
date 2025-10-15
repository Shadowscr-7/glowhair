# Guía de Integración de Mercado Pago

## ✅ Completado

✅ SDK de Mercado Pago instalado (`mercadopago`)
✅ Endpoints de API creados (create-preference, webhook)
✅ Integración en checkout
✅ Páginas de estado (success, pending)
✅ Variables de entorno configuradas

## 🔑 Paso 1: Obtener Credenciales

### Para Testing (Sandbox):

1. Ve a [developers.mercadopago.com](https://developers.mercadopago.com)
2. Inicia sesión o crea una cuenta
3. Ve a **"Tus integraciones"** → **"Credenciales"**
4. Selecciona **"Credenciales de prueba"**
5. Copia:
   - **Public Key de prueba** (comienza con `TEST-`)
   - **Access Token de prueba** (comienza con `TEST-`)

### Para Producción:

1. En el mismo panel, selecciona **"Credenciales de producción"**
2. Completa el formulario de activación de cuenta productiva
3. Una vez aprobado, copia:
   - **Public Key de producción** (comienza con `APP_USR-`)
   - **Access Token de producción** (comienza con `APP_USR-`)

## 🔐 Paso 2: Configurar Variables de Entorno

### En `.env.local` (Local):

```bash
# Mercado Pago Configuration
NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY=TEST-tu-public-key-aqui
MERCADOPAGO_ACCESS_TOKEN=TEST-tu-access-token-aqui
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### En Vercel (Producción):

1. Ve a tu proyecto en Vercel
2. Settings → Environment Variables
3. Agrega:
   - `NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY` = Tu public key de producción
   - `MERCADOPAGO_ACCESS_TOKEN` = Tu access token de producción
   - `NEXT_PUBLIC_BASE_URL` = https://tu-dominio.vercel.app

## 📡 Paso 3: Configurar Webhook en Mercado Pago

1. Ve a [developers.mercadopago.com](https://developers.mercadopago.com)
2. Tu integración → **"Webhooks"**
3. Crea un nuevo webhook:
   - **URL**: `https://tu-dominio.vercel.app/api/mercadopago/webhook`
   - **Eventos**: Selecciona `payment`
4. Guarda y activa el webhook

## 🧪 Paso 4: Probar en Modo Sandbox

### Tarjetas de Prueba para Uruguay:

#### ✅ Aprobadas:
- **Visa**: `4509 9535 6623 3704`
- **Mastercard**: `5031 7557 3453 0604`
- Código de seguridad: `123`
- Fecha de expiración: cualquier fecha futura
- Titular: cualquier nombre

#### ❌ Rechazadas:
- **Visa**: `4774 0611 4732 4479`

### Flujo de prueba:

1. Agrega productos al carrito
2. Ve al checkout
3. Selecciona "Mercado Pago"
4. Completa el formulario
5. Haz clic en "Confirmar Pedido"
6. Serás redirigido a Mercado Pago (sandbox)
7. Usa una tarjeta de prueba
8. Completa el pago
9. Deberías ser redirigido a `/orders/success`

## 🚀 Paso 5: Ir a Producción

### Checklist antes de activar producción:

- [ ] Credenciales de producción configuradas en Vercel
- [ ] Webhook configurado con URL de producción
- [ ] Cuenta de Mercado Pago verificada
- [ ] Certificado SSL activo (HTTPS)
- [ ] Políticas de privacidad y términos de servicio publicados
- [ ] Probado en sandbox completamente

### Cambiar a producción:

1. En Vercel, reemplaza las variables de entorno con las de producción
2. Redeploy la aplicación
3. Verifica que el webhook esté recibiendo notificaciones
4. Haz una compra de prueba con tu propia tarjeta (monto pequeño)

## 📊 Monitoreo

### Ver pagos en el panel:

1. Ve a [mercadopago.com.uy/activities](https://www.mercadopago.com.uy/activities)
2. Verás todos los pagos procesados
3. Filtra por estado, fecha, etc.

### Logs importantes:

- **Checkout**: Consola del navegador muestra creación de preferencia
- **Webhook**: Vercel logs muestran notificaciones recibidas
- **Base de datos**: Supabase muestra actualizaciones de órdenes

## 🔒 Seguridad

### Buenas prácticas:

✅ **NUNCA** expongas tu Access Token en el frontend
✅ **SIEMPRE** usa variables de entorno
✅ **VERIFICA** la firma del webhook en producción
✅ **VALIDA** que el payment_id sea único
✅ **REGISTRA** todas las transacciones en logs

### Verificar firma del webhook (opcional pero recomendado):

```typescript
// En webhook/route.ts
const signature = request.headers.get('x-signature');
const xRequestId = request.headers.get('x-request-id');

// Verificar firma según documentación de MP
// https://www.mercadopago.com.uy/developers/es/docs/your-integrations/notifications/webhooks#verificar-firma
```

## 🆘 Troubleshooting

### Error: "Credenciales inválidas"
- Verifica que copiaste correctamente el Access Token
- Asegúrate de usar credenciales de TEST en desarrollo
- Revisa que no haya espacios al inicio/final

### Error: "Webhook no recibe notificaciones"
- Verifica que la URL del webhook sea HTTPS
- Asegúrate de que la URL esté accesible públicamente
- Revisa los logs de Vercel para ver si llegan requests

### Pago aprobado pero orden no se actualiza
- Revisa los logs del webhook en Vercel
- Verifica que el `external_reference` coincida con el `order_id`
- Chequea los permisos de Supabase (RLS policies)

### Redireccionamiento falla después del pago
- Verifica `NEXT_PUBLIC_BASE_URL` en variables de entorno
- Asegúrate de que las `back_urls` sean correctas
- Revisa si hay errores en consola del navegador

## 📚 Recursos Adicionales

- [Documentación oficial de Mercado Pago](https://www.mercadopago.com.uy/developers/es/docs)
- [SDK de Node.js](https://github.com/mercadopago/sdk-nodejs)
- [Tarjetas de prueba](https://www.mercadopago.com.uy/developers/es/docs/checkout-api/integration-test/test-cards)
- [Webhooks](https://www.mercadopago.com.uy/developers/es/docs/your-integrations/notifications/webhooks)

## 💡 Próximas Mejoras

- [ ] Agregar selector de cuotas (installments)
- [ ] Implementar 3DS (3D Secure) para mayor seguridad
- [ ] Agregar más métodos de pago (PagoFácil, RedPagos, etc.)
- [ ] Dashboard de analytics de pagos
- [ ] Sistema de reembolsos automático
- [ ] Envío de facturas por email

---

**¿Necesitas ayuda?** Contacta al equipo de soporte de Mercado Pago o revisa su comunidad de desarrolladores.

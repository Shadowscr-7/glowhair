/**
 * Servicio de envío de emails
 * TODO: Implementar con servicio real (Resend, SendGrid, etc.)
 */

export interface OrderEmailData {
  orderId: string;
  customerEmail: string;
  customerName: string;
  total: number;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  shippingAddress: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
}

class EmailService {
  /**
   * Enviar confirmación de orden al cliente
   */
  async sendOrderConfirmation(data: OrderEmailData): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('📧 Enviando confirmación de orden al cliente:', data.customerEmail);
      
      // TODO: Implementar envío real de email
      // Por ahora solo logueamos
      console.log(`
        ✉️ EMAIL DE CONFIRMACIÓN
        Para: ${data.customerEmail}
        Asunto: Confirmación de Pedido #${data.orderId}
        
        Hola ${data.customerName},
        
        Tu pedido ha sido recibido exitosamente.
        
        Número de Orden: ${data.orderId}
        Total: $${data.total.toFixed(2)}
        
        Productos:
        ${data.items.map(item => `- ${item.name} x ${item.quantity} = $${(item.price * item.quantity).toFixed(2)}`).join('\n        ')}
        
        Dirección de Envío:
        ${data.shippingAddress.address}
        ${data.shippingAddress.city}, ${data.shippingAddress.state} ${data.shippingAddress.zipCode}
        ${data.shippingAddress.country}
        
        Gracias por tu compra!
        GlowHair Team
      `);

      return { success: true };
    } catch (error) {
      console.error('❌ Error al enviar email de confirmación:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
      };
    }
  }

  /**
   * Notificar al admin sobre nueva orden
   */
  async notifyAdminNewOrder(data: OrderEmailData): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('📧 Notificando al admin sobre nueva orden');
      
      // TODO: Implementar envío real de email al admin
      // Por ahora solo logueamos
      const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'admin@glowhair.com';
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      
      console.log(`
        ✉️ NOTIFICACIÓN AL ADMIN
        Para: ${adminEmail}
        Asunto: Nueva Orden #${data.orderId}
        
        Se ha recibido una nueva orden:
        
        Cliente: ${data.customerName} (${data.customerEmail})
        Número de Orden: ${data.orderId}
        Total: $${data.total.toFixed(2)}
        
        Productos:
        ${data.items.map(item => `- ${item.name} x ${item.quantity}`).join('\n        ')}
        
        Ver orden en el dashboard: ${appUrl}/admin/pedidos
      `);

      return { success: true };
    } catch (error) {
      console.error('❌ Error al notificar al admin:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
      };
    }
  }

  /**
   * Enviar actualización de estado de orden
   */
  async sendOrderStatusUpdate(
    orderId: string,
    customerEmail: string,
    customerName: string,
    status: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('📧 Enviando actualización de estado al cliente:', customerEmail);
      
      const statusMessages: Record<string, string> = {
        pending: 'Tu pedido está pendiente de confirmación',
        processing: 'Tu pedido está siendo procesado',
        shipped: 'Tu pedido ha sido enviado',
        delivered: 'Tu pedido ha sido entregado',
        cancelled: 'Tu pedido ha sido cancelado',
      };

      const message = statusMessages[status] || 'Tu pedido ha sido actualizado';

      console.log(`
        ✉️ EMAIL DE ACTUALIZACIÓN DE ESTADO
        Para: ${customerEmail}
        Asunto: Actualización de Pedido #${orderId}
        
        Hola ${customerName},
        
        ${message}
        
        Número de Orden: ${orderId}
        Estado: ${status}
        
        Gracias por tu compra!
        GlowHair Team
      `);

      return { success: true };
    } catch (error) {
      console.error('❌ Error al enviar actualización de estado:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
      };
    }
  }
}

export const emailService = new EmailService();

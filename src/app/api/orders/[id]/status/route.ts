import { NextRequest, NextResponse } from "next/server";
import { orderService } from "@/lib/services/orders";
import { emailService } from "@/lib/services/email";

/**
 * PATCH /api/orders/[id]/status
 * Actualizar el estado de un pedido
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    console.log('🔵 PATCH /api/orders/[id]/status - Inicio', { orderId: id });
    
    const body = await request.json();
    const { status, payment_status } = body;

    console.log('📦 Body recibido:', { status, payment_status });

    if (!status) {
      return NextResponse.json(
        { error: "Status is required" },
        { status: 400 }
      );
    }

    // Validar que el status sea válido
    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: `Estado inválido. Debe ser uno de: ${validStatuses.join(', ')}` },
        { status: 400 }
      );
    }

    console.log('🔄 Actualizando orden:', id, 'a estado:', status);

    // Update order status
    const response = await orderService.updateOrderStatus(
      id,
      status,
      payment_status
    );

    console.log('📊 Resultado updateOrderStatus:', { success: response.success, hasData: !!response.data });

    if (!response.success || !response.data) {
      console.error('❌ Error en updateOrderStatus:', response.error);
      return NextResponse.json(
        { error: response.error || "Order not found" },
        { status: 404 }
      );
    }

    // Get full order details with profile for email notification
    const orderDetails = await orderService.getOrderById(id);
    
    // Send email notification about status change (non-blocking)
    if (orderDetails.success && orderDetails.data?.shipping_address?.email) {
      const customerName = orderDetails.data.shipping_address.firstName && orderDetails.data.shipping_address.lastName
        ? `${orderDetails.data.shipping_address.firstName} ${orderDetails.data.shipping_address.lastName}`
        : 'Cliente';
      
      emailService.sendOrderStatusUpdate(
        id,
        orderDetails.data.shipping_address.email,
        customerName,
        status
      ).catch(err => {
        console.error("Error sending status update email:", err);
      });
    }

    console.log('✅ Estado actualizado exitosamente');

    return NextResponse.json({
      success: true,
      message: "Order status updated successfully",
      order: response.data,
    });
  } catch (error) {
    console.error("❌ Error updating order status:", error);
    return NextResponse.json(
      { error: "Failed to update order status" },
      { status: 500 }
    );
  }
}

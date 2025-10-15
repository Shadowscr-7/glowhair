import { NextRequest, NextResponse } from "next/server";
import { orderService } from "@/lib/services/orders";
import { emailService } from "@/lib/services/email";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { status, payment_status } = body;

    if (!status) {
      return NextResponse.json(
        { error: "Status is required" },
        { status: 400 }
      );
    }

    // Update order status
    const response = await orderService.updateOrderStatus(
      id,
      status,
      payment_status
    );

    if (!response.success || !response.data) {
      return NextResponse.json(
        { error: response.error || "Order not found" },
        { status: 404 }
      );
    }

    // Get full order details with profile for email notification
    const orderDetails = await orderService.getOrderById(id);
    
    // Send email notification about status change (non-blocking)
    if (orderDetails.success && orderDetails.data?.profile?.email && orderDetails.data?.profile?.full_name) {
      emailService.sendOrderStatusUpdate(
        id,
        orderDetails.data.profile.email,
        orderDetails.data.profile.full_name,
        status
      ).catch(err => {
        console.error("Error sending status update email:", err);
      });
    }

    return NextResponse.json({
      message: "Order status updated successfully",
      order: response.data,
    });
  } catch (error) {
    console.error("Error updating order status:", error);
    return NextResponse.json(
      { error: "Failed to update order status" },
      { status: 500 }
    );
  }
}

"use client";

import { motion } from "framer-motion";
import { Package, Calendar, DollarSign, ChevronRight, Clock, CheckCircle, XCircle, Truck, FileDown } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Order } from "@/types";
import { generateInvoicePDF } from "@/lib/utils/invoiceGenerator";

interface OrderCardProps {
  order: Order;
}

const statusConfig = {
  pending: {
    label: "Pendiente",
    icon: Clock,
    color: "text-yellow-600 bg-yellow-100",
    borderColor: "border-yellow-200"
  },
  processing: {
    label: "Procesando",
    icon: Package,
    color: "text-blue-600 bg-blue-100",
    borderColor: "border-blue-200"
  },
  shipped: {
    label: "Enviado",
    icon: Truck,
    color: "text-purple-600 bg-purple-100",
    borderColor: "border-purple-200"
  },
  delivered: {
    label: "Entregado",
    icon: CheckCircle,
    color: "text-green-600 bg-green-100",
    borderColor: "border-green-200"
  },
  cancelled: {
    label: "Cancelado",
    icon: XCircle,
    color: "text-red-600 bg-red-100",
    borderColor: "border-red-200"
  }
};

export default function OrderCard({ order }: OrderCardProps) {
  const status = statusConfig[order.status as keyof typeof statusConfig] || statusConfig.pending;
  const StatusIcon = status.icon;
  
  // Formatear fecha
  const orderDate = new Date(order.created_at);
  const formattedDate = orderDate.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Calcular cantidad de productos
  const totalItems = order.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  // Función para descargar factura
  const handleDownloadInvoice = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      generateInvoicePDF(order);
    } catch (error) {
      console.error('Error al generar factura:', error);
      alert('Error al generar la factura. Por favor, inténtelo de nuevo.');
    }
  };

  return (
    <Link href={`/orders/${order.id}`}>
      <motion.div
        whileHover={{ scale: 1.02, boxShadow: "0 10px 30px rgba(0,0,0,0.1)" }}
        whileTap={{ scale: 0.98 }}
        className={`bg-white rounded-xl border-2 ${status.borderColor} p-6 cursor-pointer transition-all duration-300`}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${status.color}`}>
              <StatusIcon size={20} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">
                Pedido #{order.order_number || order.id.substring(0, 8).toUpperCase()}
              </h3>
              <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                <Calendar size={14} />
                <span>{formattedDate}</span>
              </div>
            </div>
          </div>
          <ChevronRight className="text-gray-400" size={20} />
        </div>

        {/* Status Badge */}
        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${status.color} text-sm font-medium mb-4`}>
          <StatusIcon size={16} />
          {status.label}
        </div>

        {/* Products Preview */}
        {order.items && order.items.length > 0 && (
          <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-100">
            {/* Si es un solo producto, mostrar imagen más grande */}
            {order.items.length === 1 ? (
              <div className="flex items-center gap-3 flex-1">
                <div className="relative w-16 h-16 rounded-lg border-2 border-gray-200 overflow-hidden bg-white flex-shrink-0">
                  {(order.items[0].product?.images?.[0] || order.items[0].product_image) ? (
                    <Image
                      src={order.items[0].product?.images?.[0] || order.items[0].product_image || ''}
                      alt={order.items[0].product?.name || order.items[0].product_name || "Producto"}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                      <Package size={24} className="text-gray-400" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {order.items[0].product?.name || order.items[0].product_name || "Producto"}
                  </p>
                  <p className="text-xs text-gray-500">
                    Cantidad: {order.items[0].quantity}
                  </p>
                </div>
              </div>
            ) : (
              /* Si son múltiples productos, mostrar preview con overlap */
              <>
                <div className="flex -space-x-2">
                  {order.items.slice(0, 3).map((item, index) => (
                    <div
                      key={index}
                      className="relative w-12 h-12 rounded-lg border-2 border-white overflow-hidden bg-white shadow-sm"
                    >
                      {(item.product?.images?.[0] || item.product_image) ? (
                        <Image
                          src={item.product?.images?.[0] || item.product_image || ''}
                          alt={item.product?.name || item.product_name || "Producto"}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-100">
                          <Package size={20} className="text-gray-400" />
                        </div>
                      )}
                    </div>
                  ))}
                  {/* Si hay más de 3 productos, mostrar contador */}
                  {order.items.length > 3 && (
                    <div className="relative w-12 h-12 rounded-lg border-2 border-white overflow-hidden bg-gradient-to-br from-glow-500 to-glow-600 shadow-sm flex items-center justify-center">
                      <span className="text-white text-xs font-bold">+{order.items.length - 3}</span>
                    </div>
                  )}
                </div>
                <div className="text-sm text-gray-600">
                  {totalItems} {totalItems === 1 ? 'producto' : 'productos'}
                </div>
              </>
            )}
          </div>
        )}

        {/* Total */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-gray-700">
            <DollarSign size={18} />
            <span className="text-sm font-medium">Total</span>
          </div>
          <span className="text-2xl font-bold text-glow-600">
            ${order.total.toFixed(2)}
          </span>
        </div>

        {/* Payment Status */}
        {order.payment_status && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Estado de pago:</span>
              <span className={`font-medium ${
                order.payment_status === 'paid' ? 'text-green-600' : 
                order.payment_status === 'failed' ? 'text-red-600' : 
                'text-yellow-600'
              }`}>
                {order.payment_status === 'paid' ? 'Pagado' : 
                 order.payment_status === 'failed' ? 'Fallido' : 
                 'Pendiente'}
              </span>
            </div>
          </div>
        )}

        {/* Download Invoice Button */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleDownloadInvoice}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-glow-600 to-glow-500 text-white rounded-lg font-medium hover:from-glow-700 hover:to-glow-600 transition-all duration-200 shadow-sm hover:shadow-md"
          >
            <FileDown size={18} />
            <span>Descargar Factura</span>
          </motion.button>
        </div>
      </motion.div>
    </Link>
  );
}

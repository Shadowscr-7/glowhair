"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Package,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  MapPin,
  CreditCard,
  Calendar,
  AlertCircle,
  Loader2,
  FileText,
} from "lucide-react";
import Image from "next/image";
import { ordersAPI, Order } from "@/lib/api";
import { useAuth } from "@/context/NewAuthContext";

const statusConfig = {
  pending: {
    icon: Clock,
    label: "Pendiente",
    color: "text-yellow-500",
    bg: "bg-yellow-50",
    description: "Tu pedido está siendo verificado",
  },
  processing: {
    icon: Package,
    label: "Procesando",
    color: "text-blue-500",
    bg: "bg-blue-50",
    description: "Estamos preparando tu pedido",
  },
  shipped: {
    icon: Truck,
    label: "Enviado",
    color: "text-purple-500",
    bg: "bg-purple-50",
    description: "Tu pedido está en camino",
  },
  delivered: {
    icon: CheckCircle,
    label: "Entregado",
    color: "text-green-500",
    bg: "bg-green-50",
    description: "Tu pedido ha sido entregado",
  },
  cancelled: {
    icon: XCircle,
    label: "Cancelado",
    color: "text-red-500",
    bg: "bg-red-50",
    description: "Este pedido ha sido cancelado",
  },
};

export default function OrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params.id as string;
  useAuth(); // Ensure user is authenticated

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);

  const fetchOrderDetail = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await ordersAPI.getById(orderId);
      setOrder(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al cargar el pedido"
      );
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    fetchOrderDetail();
  }, [fetchOrderDetail]);

  const handleCancelOrder = async () => {
    if (!order || order.status !== "pending") return;

    if (
      !confirm(
        "¿Estás seguro de que deseas cancelar este pedido? Esta acción no se puede deshacer."
      )
    ) {
      return;
    }

    try {
      setCancelling(true);
      await ordersAPI.cancel(orderId);
      // Refresh order data
      await fetchOrderDetail();
    } catch (err) {
      alert(
        err instanceof Error ? err.message : "Error al cancelar el pedido"
      );
    } finally {
      setCancelling(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "EUR",
    }).format(amount);
  };

  const calculateSubtotal = () => {
    if (!order || !order.items) return 0;
    return order.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-rose-500 mx-auto mb-4" />
          <p className="text-gray-600">Cargando detalles del pedido...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Error al cargar el pedido
          </h2>
          <p className="text-gray-600 mb-6">
            {error || "No se pudo encontrar el pedido"}
          </p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => fetchOrderDetail()}
              className="bg-rose-500 text-white px-6 py-2 rounded-lg hover:bg-rose-600 transition-colors"
            >
              Reintentar
            </button>
            <button
              onClick={() => router.push("/orders")}
              className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Volver a pedidos
            </button>
          </div>
        </div>
      </div>
    );
  }

  const statusInfo = statusConfig[order.status];
  const StatusIcon = statusInfo.icon;
  const subtotal = calculateSubtotal();
  const shipping = order.total - subtotal > 0 ? order.total - subtotal : 0;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Back button */}
        <button
          onClick={() => router.push("/orders")}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Volver a mis pedidos
        </button>

        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-start justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Pedido #{order.id.slice(0, 8).toUpperCase()}
              </h1>
              <p className="text-gray-600">
                Realizado el {formatDate(order.created_at)}
              </p>
            </div>
            <div
              className={`flex items-center gap-2 px-4 py-2 rounded-full ${statusInfo.bg}`}
            >
              <StatusIcon className={`w-5 h-5 ${statusInfo.color}`} />
              <span className={`font-medium ${statusInfo.color}`}>
                {statusInfo.label}
              </span>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-gray-700">{statusInfo.description}</p>
            {order.tracking_number && (
              <p className="text-sm text-gray-600 mt-2">
                Número de seguimiento:{" "}
                <span className="font-medium">{order.tracking_number}</span>
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column - Order items */}
          <div className="lg:col-span-2 space-y-6">
            {/* Products */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Package className="w-5 h-5" />
                Productos
              </h2>
              <div className="space-y-4">
                {order.items && order.items.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex gap-4 p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="w-20 h-20 bg-white rounded-lg overflow-hidden flex-shrink-0">
                      <Image
                        src={item.product?.image || "/placeholder.png"}
                        alt={item.product?.name || "Producto"}
                        width={80}
                        height={80}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-800 mb-1">
                        {item.product?.name || "Producto"}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Cantidad: {item.quantity}
                      </p>
                      <p className="text-sm text-gray-600">
                        Precio unitario: {formatCurrency(item.price)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-800">
                        {formatCurrency(item.price * item.quantity)}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Notes */}
            {order.notes && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Notas del pedido
                </h2>
                <p className="text-gray-700 text-sm whitespace-pre-wrap">
                  {order.notes}
                </p>
              </div>
            )}
          </div>

          {/* Right column - Order info */}
          <div className="space-y-6">
            {/* Summary */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Resumen</h2>
              <div className="space-y-3">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Envío</span>
                  <span>
                    {shipping === 0 ? "Gratis" : formatCurrency(shipping)}
                  </span>
                </div>
                <div className="border-t pt-3 flex justify-between font-bold text-gray-800 text-lg">
                  <span>Total</span>
                  <span>{formatCurrency(order.total)}</span>
                </div>
              </div>
            </div>

            {/* Shipping address */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Dirección de envío
              </h2>
              <p className="text-gray-700 text-sm">{order.shipping_address}</p>
            </div>

            {/* Payment method */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Método de pago
              </h2>
              <p className="text-gray-700 text-sm">
                {order.payment_method === "credit_card"
                  ? "Tarjeta de crédito"
                  : "MercadoPago"}
              </p>
            </div>

            {/* Last updated */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Pedido creado
              </h2>
              <p className="text-gray-700 text-sm">
                {formatDate(order.created_at)}
              </p>
            </div>

            {/* Cancel button */}
            {order.status === "pending" && (
              <button
                onClick={handleCancelOrder}
                disabled={cancelling}
                className="w-full bg-red-500 text-white py-3 rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {cancelling ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Cancelando...
                  </>
                ) : (
                  <>
                    <XCircle className="w-5 h-5" />
                    Cancelar pedido
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

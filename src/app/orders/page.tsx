"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Package,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  ChevronRight,
  Loader2,
  AlertCircle,
  ShoppingBag,
} from "lucide-react";
import { ordersAPI, Order } from "@/lib/api";
import { useAuth } from "@/context/NewAuthContext";

const statusConfig = {
  pending: {
    icon: Clock,
    label: "Pendiente",
    color: "text-yellow-500",
    bg: "bg-yellow-50",
  },
  processing: {
    icon: Package,
    label: "Procesando",
    color: "text-blue-500",
    bg: "bg-blue-50",
  },
  shipped: {
    icon: Truck,
    label: "Enviado",
    color: "text-purple-500",
    bg: "bg-purple-50",
  },
  delivered: {
    icon: CheckCircle,
    label: "Entregado",
    color: "text-green-500",
    bg: "bg-green-50",
  },
  cancelled: {
    icon: XCircle,
    label: "Cancelado",
    color: "text-red-500",
    bg: "bg-red-50",
  },
};

export default function OrdersPage() {
  const router = useRouter();
  useAuth(); // Ensure user is authenticated
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await ordersAPI.getAll();
      setOrders(data.orders); // Extract orders array from response
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al cargar los pedidos"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "EUR",
    }).format(amount);
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-rose-500 mx-auto mb-4" />
          <p className="text-gray-600">Cargando tus pedidos...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Error al cargar pedidos
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => fetchOrders()}
              className="bg-rose-500 text-white px-6 py-2 rounded-lg hover:bg-rose-600 transition-colors"
            >
              Reintentar
            </button>
            <button
              onClick={() => router.push("/")}
              className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Volver al inicio
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Empty state
  if (orders.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            No tienes pedidos
          </h2>
          <p className="text-gray-600 mb-6">
            Cuando realices una compra, tus pedidos aparecerán aquí
          </p>
          <button
            onClick={() => router.push("/productos")}
            className="bg-rose-500 text-white px-6 py-3 rounded-lg hover:bg-rose-600 transition-colors"
          >
            Explorar productos
          </button>
        </div>
      </div>
    );
  }

  // Orders list
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Mis Pedidos
          </h1>
          <p className="text-gray-600">
            Historial de {orders.length}{" "}
            {orders.length === 1 ? "pedido" : "pedidos"}
          </p>
        </div>

        {/* Orders list */}
        <div className="space-y-4">
          {orders.map((order, index) => {
            const statusInfo = statusConfig[order.status];
            const StatusIcon = statusInfo.icon;

            return (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden"
              >
                <button
                  onClick={() => router.push(`/orders/${order.id}`)}
                  className="w-full p-6 text-left hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    {/* Left section */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-sm font-medium text-gray-500">
                          Pedido #{order.id.slice(0, 8).toUpperCase()}
                        </span>
                        <span
                          className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${statusInfo.bg} ${statusInfo.color}`}
                        >
                          <StatusIcon className="w-3 h-3" />
                          {statusInfo.label}
                        </span>
                      </div>

                      <div className="text-sm text-gray-600 mb-3">
                        <p className="mb-1">
                          Fecha: {formatDate(order.created_at)}
                        </p>
                        {order.tracking_number && (
                          <p className="mb-1">
                            Seguimiento: {order.tracking_number}
                          </p>
                        )}
                        <p className="text-xs text-gray-500 truncate">
                          {order.shipping_address}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500 uppercase">
                          {order.payment_method === "credit_card"
                            ? "Tarjeta de crédito"
                            : "MercadoPago"}
                        </span>
                      </div>
                    </div>

                    {/* Right section */}
                    <div className="flex flex-col items-end justify-between h-full">
                      <div className="text-2xl font-bold text-gray-800">
                        {formatCurrency(order.total)}
                      </div>
                      <div className="flex items-center gap-2 text-rose-500 text-sm font-medium">
                        Ver detalles
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </button>
              </motion.div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <button
            onClick={() => router.push("/productos")}
            className="text-rose-500 hover:text-rose-600 font-medium"
          >
            Continuar comprando
          </button>
        </div>
      </div>
    </div>
  );
}

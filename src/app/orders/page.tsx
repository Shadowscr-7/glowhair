"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Loader2, AlertCircle, ShoppingBag, Package, Search, Filter } from "lucide-react";
import { useAuth } from "@/context/NewAuthContext";
import Navbar from "@/components/layout/Navbar";
import OrderCard from "@/components/orders/OrderCard";
import { Order } from "@/types";

export default function OrdersPage() {
  const router = useRouter();
  const { state } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);

      // Obtener userId del contexto de autenticación
      const userId = state.user?.id;
      if (!userId) {
        throw new Error("No se encontró el ID de usuario");
      }

      console.log("🔵 Fetching orders for user:", userId);

      const response = await fetch(`/api/orders?limit=50&offset=0`, {
        headers: {
          "x-user-id": userId,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al cargar pedidos");
      }

      const data = await response.json();
      console.log(" Orders loaded:", data);

      setOrders(data.orders || []);
      setFilteredOrders(data.orders || []);
    } catch (err) {
      console.error(" Error loading orders:", err);
      setError(err instanceof Error ? err.message : "Error al cargar los pedidos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!state.isAuthenticated || !state.user?.id) {
      router.push("/login");
      return;
    }
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, router]);

  useEffect(() => {
    let filtered = [...orders];

    if (statusFilter !== "all") {
      filtered = filtered.filter((order) => order.status === statusFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (order) =>
          order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (order.order_number && order.order_number.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    setFilteredOrders(filtered);
  }, [orders, statusFilter, searchTerm]);

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 pt-24 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-glow-500 mx-auto mb-4" />
            <p className="text-gray-600">Cargando tus pedidos...</p>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 pt-24 flex items-center justify-center p-4">
          <div className="max-w-md w-full text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Error al cargar pedidos</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => fetchOrders()}
                className="bg-glow-500 text-white px-6 py-2 rounded-lg hover:bg-glow-600 transition-colors"
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
      </>
    );
  }

  if (orders.length === 0) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 pt-24 flex items-center justify-center p-4">
          <div className="max-w-md w-full text-center">
            <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">No tienes pedidos</h2>
            <p className="text-gray-600 mb-6">Cuando realices una compra, tus pedidos aparecerán aquí</p>
            <button
              onClick={() => router.push("/productos")}
              className="bg-glow-500 text-white px-6 py-3 rounded-lg hover:bg-glow-600 transition-colors"
            >
              Explorar productos
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-4">
        <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-glow-500 rounded-xl">
              <Package className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Mis Pedidos</h1>
              <p className="text-gray-600">
                {orders.length} {orders.length === 1 ? "pedido" : "pedidos"} en total
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Buscar por número de pedido..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-glow-500 focus:border-transparent"
                />
              </div>

              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-glow-500 focus:border-transparent appearance-none cursor-pointer"
                >
                  <option value="all">Todos los estados</option>
                  <option value="pending">Pendiente</option>
                  <option value="processing">Procesando</option>
                  <option value="shipped">Enviado</option>
                  <option value="delivered">Entregado</option>
                  <option value="cancelled">Cancelado</option>
                </select>
              </div>
            </div>

            {(searchTerm || statusFilter !== "all") && (
              <div className="mt-3 pt-3 border-t border-gray-100">
                <p className="text-sm text-gray-600">
                  Mostrando {filteredOrders.length} de {orders.length} pedidos
                </p>
              </div>
            )}
          </div>
        </div>

        {filteredOrders.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">No se encontraron pedidos con esos filtros</p>
            <button
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("all");
              }}
              className="mt-4 text-glow-500 hover:text-glow-600 font-medium"
            >
              Limpiar filtros
            </button>
          </div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredOrders.map((order, index) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <OrderCard order={order} />
              </motion.div>
            ))}
          </motion.div>
        )}

        <div className="mt-12 text-center">
          <button
            onClick={() => router.push("/productos")}
            className="text-glow-500 hover:text-glow-600 font-medium text-lg"
          >
            Continuar comprando →
          </button>
        </div>
      </div>
    </div>
    </>
  );
}

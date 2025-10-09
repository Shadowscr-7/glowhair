"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import { 
  Package, 
  Users, 
  Euro, 
  Eye, 
  Download,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  Loader2,
  AlertCircle,
  Edit
} from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { useAuth } from "@/context/NewAuthContext";
import { useRouter } from "next/navigation";
import { 
  DateRangeFilter, 
  SearchFilter, 
  SelectFilter, 
  FiltersSummary, 
  QuickDateFilters 
} from "@/components/admin/Filters";
import { 
  StatCard, 
  SalesChart, 
  OrdersChart, 
  StatusPieChart,
  generateSampleData 
} from "@/components/admin/Charts";
import { ordersAPI, Order } from "@/lib/api";

const OrdersPage = () => {
  const { state: authState } = useAuth();
  const router = useRouter();

  // State
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  // Filters state
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return date.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [quickFilter, setQuickFilter] = useState<number | undefined>(30);

  // Fetch orders from API
  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await ordersAPI.getAll(statusFilter || undefined, 1000, 0);
      setOrders(data.orders);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar pedidos");
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  // Load orders on mount and when statusFilter changes
  useEffect(() => {
    if (authState.isAuthenticated && authState.user?.role === "admin") {
      fetchOrders();
    }
  }, [authState, fetchOrders]);

  // Update order status
  const handleUpdateStatus = async (orderId: string, newStatus: string, trackingNumber?: string) => {
    try {
      setUpdatingStatus(orderId);
      await ordersAPI.updateStatus(orderId, newStatus, trackingNumber);
      // Refresh orders
      await fetchOrders();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error al actualizar estado");
    } finally {
      setUpdatingStatus(null);
    }
  };

  // Check authentication
  useEffect(() => {
    if (!authState.isAuthenticated || authState.user?.role !== "admin") {
      router.push("/");
    }
  }, [authState, router]);

  // Quick date filter handler
  const handleQuickFilter = (days: number) => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    setStartDate(startDate.toISOString().split('T')[0]);
    setEndDate(endDate.toISOString().split('T')[0]);
    setQuickFilter(days);
  };

  // Filter orders
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const orderDate = new Date(order.created_at);
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999); // Include full end date
      
      const matchesDate = orderDate >= start && orderDate <= end;
      const matchesSearch = 
        (order.user?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
        (order.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
        order.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = !statusFilter || order.status === statusFilter;
      
      return matchesDate && matchesSearch && matchesStatus;
    });
  }, [orders, startDate, endDate, searchTerm, statusFilter]);

  // Calculate statistics
  const stats = useMemo(() => {
    const totalOrders = filteredOrders.length;
    const totalRevenue = filteredOrders.reduce((sum, order) => sum + order.total, 0);
    const uniqueCustomers = new Set(
      filteredOrders
        .map(order => order.user?.email)
        .filter(email => email)
    ).size;
    const completedOrders = filteredOrders.filter(order => order.status === 'delivered').length;
    const completionRate = totalOrders > 0 ? (completedOrders / totalOrders) * 100 : 0;

    return {
      totalOrders,
      totalRevenue,
      uniqueCustomers,
      completionRate
    };
  }, [filteredOrders]);

  // Generate chart data
  const { salesData, ordersData } = generateSampleData();

  // Status options for filter
  const statusOptions = [
    { value: 'pending', label: 'Pendiente' },
    { value: 'processing', label: 'Procesando' },
    { value: 'shipped', label: 'Enviado' },
    { value: 'delivered', label: 'Entregado' },
    { value: 'cancelled', label: 'Cancelado' }
  ];

  // Get status color and icon
  const getStatusDisplay = (status: string) => {
    const displays = {
      pending: { color: 'text-yellow-600 bg-yellow-100', icon: Clock, label: 'Pendiente' },
      processing: { color: 'text-blue-600 bg-blue-100', icon: Package, label: 'Procesando' },
      shipped: { color: 'text-purple-600 bg-purple-100', icon: Truck, label: 'Enviado' },
      delivered: { color: 'text-green-600 bg-green-100', icon: CheckCircle, label: 'Entregado' },
      cancelled: { color: 'text-red-600 bg-red-100', icon: XCircle, label: 'Cancelado' }
    };
    return displays[status as keyof typeof displays];
  };

  // Active filters for summary
  const activeFilters = [
    ...(searchTerm ? [{ label: 'Búsqueda', value: searchTerm }] : []),
    ...(statusFilter ? [{ label: 'Estado', value: statusOptions.find(s => s.value === statusFilter)?.label || statusFilter }] : []),
    { label: 'Fecha', value: `${startDate} - ${endDate}` }
  ];

  const clearFilter = (index: number) => {
    if (activeFilters[index].label === 'Búsqueda') {
      setSearchTerm('');
    } else if (activeFilters[index].label === 'Estado') {
      setStatusFilter('');
    }
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
    handleQuickFilter(30);
  };

  // Pie chart data for order status
  const statusPieData = [
    { name: 'Entregado', value: filteredOrders.filter(o => o.status === 'delivered').length, color: '#10b981' },
    { name: 'Procesando', value: filteredOrders.filter(o => o.status === 'processing').length, color: '#3b82f6' },
    { name: 'Enviado', value: filteredOrders.filter(o => o.status === 'shipped').length, color: '#8b5cf6' },
    { name: 'Pendiente', value: filteredOrders.filter(o => o.status === 'pending').length, color: '#f59e0b' },
    { name: 'Cancelado', value: filteredOrders.filter(o => o.status === 'cancelled').length, color: '#ef4444' }
  ].filter(item => item.value > 0);

  if (!authState.isAuthenticated || authState.user?.role !== "admin") {
    return null;
  }

  // Loading state
  if (loading) {
    return (
      <AdminLayout>
        <div className="p-6 flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-rose-500 mx-auto mb-4" />
            <p className="text-gray-600">Cargando pedidos...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  // Error state
  if (error) {
    return (
      <AdminLayout>
        <div className="p-6 flex items-center justify-center min-h-[60vh]">
          <div className="max-w-md w-full text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Error al cargar pedidos
            </h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => fetchOrders()}
              className="bg-rose-500 text-white px-6 py-2 rounded-lg hover:bg-rose-600 transition-colors"
            >
              Reintentar
            </button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Pedidos Recientes</h1>
            <p className="text-gray-600 mt-1">
              Gestiona y analiza todos los pedidos de tu tienda
            </p>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 bg-glow-600 text-white px-4 py-2 rounded-lg hover:bg-glow-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            Exportar
          </motion.button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Pedidos"
            value={stats.totalOrders}
            icon={<Package className="w-6 h-6" />}
            color="blue"
          />
          <StatCard
            title="Ingresos Totales"
            value={`€${stats.totalRevenue.toFixed(2)}`}
            icon={<Euro className="w-6 h-6" />}
            color="green"
          />
          <StatCard
            title="Clientes Únicos"
            value={stats.uniqueCustomers}
            icon={<Users className="w-6 h-6" />}
            color="purple"
          />
          <StatCard
            title="Tasa de Finalización"
            value={`${stats.completionRate.toFixed(1)}%`}
            icon={<CheckCircle className="w-6 h-6" />}
            color="orange"
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SalesChart data={salesData} />
          <OrdersChart data={ordersData} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <StatusPieChart 
              data={statusPieData} 
              title="Distribución de Estados de Pedidos" 
            />
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <DateRangeFilter
            startDate={startDate}
            endDate={endDate}
            onStartDateChange={setStartDate}
            onEndDateChange={setEndDate}
          />
          
          <SearchFilter
            placeholder="Buscar por cliente, email o ID..."
            value={searchTerm}
            onChange={setSearchTerm}
          />
          
          <SelectFilter
            title="Estado"
            options={statusOptions}
            value={statusFilter}
            onChange={setStatusFilter}
            placeholder="Todos los estados"
          />
          
          <QuickDateFilters
            onQuickFilter={handleQuickFilter}
            activeFilter={quickFilter}
          />
        </div>

        {/* Active Filters Summary */}
        <FiltersSummary
          activeFilters={activeFilters}
          onClearFilter={clearFilter}
          onClearAll={clearAllFilters}
        />

        {/* Orders Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Pedidos ({filteredOrders.length})
            </h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-6 font-medium text-gray-700">ID Pedido</th>
                  <th className="text-left py-3 px-6 font-medium text-gray-700">Cliente</th>
                  <th className="text-left py-3 px-6 font-medium text-gray-700">Fecha</th>
                  <th className="text-left py-3 px-6 font-medium text-gray-700">Estado</th>
                  <th className="text-left py-3 px-6 font-medium text-gray-700">Total</th>
                  <th className="text-left py-3 px-6 font-medium text-gray-700">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => {
                  const statusDisplay = getStatusDisplay(order.status);
                  const StatusIcon = statusDisplay.icon;
                  
                  return (
                    <motion.tr
                      key={order.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-4 px-6">
                        <span className="font-medium text-gray-900">{order.id.slice(0, 8).toUpperCase()}</span>
                      </td>
                      <td className="py-4 px-6">
                        <div>
                          <p className="font-medium text-gray-900">
                            {order.user?.full_name || "Cliente sin nombre"}
                          </p>
                          <p className="text-sm text-gray-500">
                            {order.user?.email || "Sin email"}
                          </p>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-gray-700">
                          {new Date(order.created_at).toLocaleDateString('es-ES')}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${statusDisplay.color}`}>
                          <StatusIcon className="w-4 h-4" />
                          {statusDisplay.label}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="font-medium text-gray-900">€{order.total.toFixed(2)}</span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => router.push(`/orders/${order.id}`)}
                            className="p-2 text-glow-600 hover:bg-glow-50 rounded-lg transition-colors"
                            title="Ver detalles"
                          >
                            <Eye className="w-4 h-4" />
                          </motion.button>
                          
                          {order.status === 'pending' && (
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleUpdateStatus(order.id, 'processing')}
                              disabled={updatingStatus === order.id}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
                              title="Marcar como procesando"
                            >
                              {updatingStatus === order.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Edit className="w-4 h-4" />
                              )}
                            </motion.button>
                          )}
                          
                          {order.status === 'processing' && (
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => {
                                const tracking = prompt("Ingresa el número de seguimiento:");
                                if (tracking) {
                                  handleUpdateStatus(order.id, 'shipped', tracking);
                                }
                              }}
                              disabled={updatingStatus === order.id}
                              className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors disabled:opacity-50"
                              title="Marcar como enviado"
                            >
                              {updatingStatus === order.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Truck className="w-4 h-4" />
                              )}
                            </motion.button>
                          )}
                          
                          {order.status === 'shipped' && (
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleUpdateStatus(order.id, 'delivered')}
                              disabled={updatingStatus === order.id}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
                              title="Marcar como entregado"
                            >
                              {updatingStatus === order.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <CheckCircle className="w-4 h-4" />
                              )}
                            </motion.button>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default OrdersPage;
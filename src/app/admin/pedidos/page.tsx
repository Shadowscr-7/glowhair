"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { 
  Package, 
  Users, 
  DollarSign, 
  Download,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  Loader2,
  AlertCircle
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
  StatusPieChart
} from "@/components/admin/Charts";

interface Order {
  id: string;
  user_id: string;
  total: number;
  subtotal: number;
  tax: number;
  shipping: number;
  status: string;
  payment_method: string;
  payment_status: string;
  shipping_address: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  created_at: string;
  updated_at: string;
  items?: Array<{
    id: string;
    product_id: string;
    quantity: number;
    price: number;
    product?: {
      id: string;
      name: string;
      images?: string[];
      image_url?: string;
    };
  }>;
  profile?: {
    full_name: string;
    email: string;
  };
}

const OrdersPage = () => {
  const { state: authState } = useAuth();
  const router = useRouter();

  // State
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Stats state
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    uniqueCustomers: 0,
    completionRate: 0,
  });
  const [salesData, setSalesData] = useState<Array<{ date: string; sales: number; orders: number }>>([]);
  const [ordersData, setOrdersData] = useState<Array<{ date: string; orders: number; completed: number; cancelled: number }>>([]);

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
      
      // Construir URL con parámetros
      const params = new URLSearchParams({
        is_admin: 'true',
        limit: '1000',
      });
      
      if (statusFilter) {
        params.append('status', statusFilter);
      }
      
      const response = await fetch(`/api/orders?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Error al cargar pedidos');
      }
      
      const data = await response.json();
      setOrders(data.orders || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar pedidos");
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  // Fetch statistics from API
  const fetchStats = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      
      if (startDate) {
        params.append('start_date', startDate);
      }
      if (endDate) {
        params.append('end_date', endDate);
      }
      
      const response = await fetch(`/api/orders/stats?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Error al cargar estadísticas');
      }
      
      const data = await response.json();
      
      setStats({
        totalOrders: data.totalOrders || 0,
        totalRevenue: data.totalRevenue || 0,
        uniqueCustomers: data.uniqueCustomers || 0,
        completionRate: data.completionRate || 0,
      });
      
      setSalesData(data.salesByDate || []);
      setOrdersData(data.ordersByDate || []);
    } catch (err) {
      console.error('Error al cargar estadísticas:', err);
    }
  }, [startDate, endDate]);

  // Load orders on mount and when statusFilter changes
  useEffect(() => {
    if (authState.isAuthenticated && authState.user?.role === "admin") {
      fetchOrders();
      fetchStats();
    }
  }, [authState, fetchOrders, fetchStats]);

  // Reload stats when date range changes
  useEffect(() => {
    if (authState.isAuthenticated && authState.user?.role === "admin") {
      fetchStats();
    }
  }, [authState, startDate, endDate, fetchStats]);

  // Open detail modal
  const openDetailModal = (order: Order) => {
    setSelectedOrder(order);
    setShowDetailModal(true);
  };

  // Close detail modal
  const closeDetailModal = () => {
    setShowDetailModal(false);
    setSelectedOrder(null);
  };

  // Update order status (inline or from modal)
  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      setUpdatingStatus(orderId);
      
      // Update order status via API
      const response = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: newStatus,
        }),
      });

      if (!response.ok) {
        throw new Error('Error al actualizar el estado de la orden');
      }

      // Refresh orders and stats
      await fetchOrders();
      await fetchStats();
      
      return true;
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error al actualizar estado");
      return false;
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
      const start = new Date(startDate + 'T00:00:00');
      const end = new Date(endDate + 'T23:59:59');
      
      const matchesDate = orderDate >= start && orderDate <= end;
      
      const customerName = order.shipping_address?.firstName && order.shipping_address?.lastName
        ? `${order.shipping_address.firstName} ${order.shipping_address.lastName}`.toLowerCase()
        : '';
      const customerEmail = order.shipping_address?.email?.toLowerCase() || '';
      const orderId = order.id.toLowerCase();
      const searchLower = searchTerm.toLowerCase();
      
      const matchesSearch = 
        customerName.includes(searchLower) ||
        customerEmail.includes(searchLower) ||
        orderId.includes(searchLower);
        
      const matchesStatus = !statusFilter || order.status === statusFilter;
      
      return matchesDate && matchesSearch && matchesStatus;
    });
  }, [orders, startDate, endDate, searchTerm, statusFilter]);

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
            value={`$${stats.totalRevenue.toFixed(2)}`}
            icon={<DollarSign className="w-6 h-6" />}
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
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => {
                  const statusDisplay = getStatusDisplay(order.status);
                  
                  return (
                    <motion.tr
                      key={order.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      onClick={() => openDetailModal(order)}
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                      <td className="py-4 px-6">
                        <span className="font-medium text-gray-900">{order.id.slice(0, 8).toUpperCase()}</span>
                      </td>
                      <td className="py-4 px-6">
                        <div>
                          <p className="font-medium text-gray-900">
                            {order.shipping_address?.firstName && order.shipping_address?.lastName 
                              ? `${order.shipping_address.firstName} ${order.shipping_address.lastName}`
                              : "Cliente sin nombre"}
                          </p>
                          <p className="text-sm text-gray-500">
                            {order.shipping_address?.email || "Sin email"}
                          </p>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-gray-700">
                          {new Date(order.created_at).toLocaleDateString('es-ES')}
                        </span>
                      </td>
                      <td className="py-4 px-6" onClick={(e) => e.stopPropagation()}>
                        <select
                          value={order.status}
                          onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                          disabled={updatingStatus === order.id}
                          className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium border-2 ${statusDisplay.color} cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                          <option value="pending">🕐 Pendiente</option>
                          <option value="processing">📦 Procesando</option>
                          <option value="shipped">🚚 Enviado</option>
                          <option value="delivered">✅ Entregado</option>
                          <option value="cancelled">❌ Cancelado</option>
                        </select>
                      </td>
                      <td className="py-4 px-6">
                        <span className="font-medium text-gray-900">${order.total.toFixed(2)}</span>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Order Detail Modal */}
        {showDetailModal && selectedOrder && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={closeDetailModal}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-glow-500 to-glow-600 px-6 py-4 sticky top-0 z-10">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold text-white">
                      Pedido #{selectedOrder.id.slice(0, 8).toUpperCase()}
                    </h3>
                    <p className="text-glow-100 text-sm mt-1">
                      {new Date(selectedOrder.created_at).toLocaleString('es-UY', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <button
                    onClick={closeDetailModal}
                    className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
                  >
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Body */}
              <div className="p-6 space-y-6">
                {/* Estado y Métodos de Pago */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Estado del Pedido
                    </label>
                    <select
                      value={selectedOrder.status}
                      onChange={(e) => handleUpdateStatus(selectedOrder.id, e.target.value)}
                      disabled={updatingStatus === selectedOrder.id}
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-glow-500 focus:border-transparent disabled:opacity-50 text-base font-medium"
                    >
                      <option value="pending">🕐 Pendiente</option>
                      <option value="processing">📦 Procesando</option>
                      <option value="shipped">🚚 Enviado</option>
                      <option value="delivered">✅ Entregado</option>
                      <option value="cancelled">❌ Cancelado</option>
                    </select>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Método de Pago:</span>
                      <span className="font-medium text-gray-900">{selectedOrder.payment_method}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Estado de Pago:</span>
                      <span className="font-medium text-gray-900">{selectedOrder.payment_status}</span>
                    </div>
                  </div>
                </div>

                {/* Cliente */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Users className="w-5 h-5 text-glow-600" />
                    Información del Cliente
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Nombre</p>
                      <p className="font-medium text-gray-900">
                        {selectedOrder.shipping_address?.firstName} {selectedOrder.shipping_address?.lastName}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-medium text-gray-900">{selectedOrder.shipping_address?.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Teléfono</p>
                      <p className="font-medium text-gray-900">{selectedOrder.shipping_address?.phone}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">País</p>
                      <p className="font-medium text-gray-900">{selectedOrder.shipping_address?.country}</p>
                    </div>
                  </div>
                </div>

                {/* Dirección de Envío */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Truck className="w-5 h-5 text-glow-600" />
                    Dirección de Envío
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <p className="text-sm text-gray-600">Dirección</p>
                      <p className="font-medium text-gray-900">{selectedOrder.shipping_address?.address}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Ciudad</p>
                      <p className="font-medium text-gray-900">{selectedOrder.shipping_address?.city}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Estado/Departamento</p>
                      <p className="font-medium text-gray-900">{selectedOrder.shipping_address?.state}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Código Postal</p>
                      <p className="font-medium text-gray-900">{selectedOrder.shipping_address?.zipCode}</p>
                    </div>
                  </div>
                </div>

                {/* Productos */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Package className="w-5 h-5 text-glow-600" />
                    Productos ({selectedOrder.items?.length || 0})
                  </h4>
                  <div className="space-y-3">
                    {selectedOrder.items?.map((item) => (
                      <div key={item.id} className="flex items-center gap-4 bg-white p-3 rounded-lg">
                        {item.product?.images?.[0] || item.product?.image_url ? (
                          <div className="relative w-16 h-16">
                            <Image
                              src={item.product?.images?.[0] || item.product?.image_url || ''}
                              alt={item.product?.name || 'Producto'}
                              fill
                              sizes="64px"
                              className="object-cover rounded-lg"
                            />
                          </div>
                        ) : (
                          <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                            <Package className="w-8 h-8 text-gray-400" />
                          </div>
                        )}
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{item.product?.name || 'Producto'}</p>
                          <p className="text-sm text-gray-600">Cantidad: {item.quantity}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-gray-900">${item.price.toFixed(2)}</p>
                          <p className="text-sm text-gray-600">Total: ${(item.price * item.quantity).toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Resumen de Pago */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-glow-600" />
                    Resumen de Pago
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal:</span>
                      <span className="font-medium text-gray-900">${selectedOrder.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Impuestos:</span>
                      <span className="font-medium text-gray-900">${(selectedOrder.tax || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Envío:</span>
                      <span className="font-medium text-gray-900">${(selectedOrder.shipping || 0).toFixed(2)}</span>
                    </div>
                    <div className="border-t pt-2 flex justify-between">
                      <span className="font-bold text-gray-900 text-lg">Total:</span>
                      <span className="font-bold text-glow-600 text-lg">${selectedOrder.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="bg-gray-50 px-6 py-4 flex items-center justify-end gap-3 sticky bottom-0">
                <button
                  onClick={closeDetailModal}
                  className="px-6 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Cerrar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default OrdersPage;
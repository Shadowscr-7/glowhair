"use client";

import { motion } from "framer-motion";
import { 
  DollarSign, 
  ShoppingBag, 
  Package, 
  Users, 
  TrendingUp, 
  TrendingDown,
  Eye,
  MoreHorizontal,
  BarChart3,
  PieChart,
  Calendar,
  Award
} from "lucide-react";
import { useAuth } from "@/context/NewAuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";

const AdminDashboard = () => {
  const { isAuthenticated, isLoading, isAdmin } = useAuth();
  const router = useRouter();

  // Check if user is admin
  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !isAdmin)) {
      router.push("/login");
    }
  }, [isLoading, isAuthenticated, isAdmin, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-glow-600"></div>
          <p className="text-gray-600 mt-4">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Acceso Denegado</h2>
          <p className="text-gray-600 mb-6">No tienes permisos para acceder a esta área.</p>
          <button
            onClick={() => router.push("/")}
            className="bg-glow-600 text-white px-6 py-3 rounded-lg hover:bg-glow-700 transition-colors"
          >
            Volver al Inicio
          </button>
        </div>
      </div>
    );
  }

  // Datos de ejemplo para las estadísticas
  const stats = [
    {
      name: "Ingresos Totales",
      value: "€45,231",
      change: "+20.1%",
      changeType: "increase",
      icon: DollarSign
    },
    {
      name: "Pedidos",
      value: "1,429",
      change: "+15.3%",
      changeType: "increase",
      icon: ShoppingBag
    },
    {
      name: "Productos",
      value: "156",
      change: "+2 nuevos",
      changeType: "neutral",
      icon: Package
    },
    {
      name: "Clientes",
      value: "893",
      change: "+12 nuevos",
      changeType: "increase",
      icon: Users
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
        return "bg-green-100 text-green-800";
      case "shipped":
        return "bg-blue-100 text-blue-800";
      case "processing":
        return "bg-yellow-100 text-yellow-800";
      case "pending":
        return "bg-gray-100 text-gray-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "delivered":
        return "Entregado";
      case "shipped":
        return "Enviado";
      case "processing":
        return "Procesando";
      case "pending":
        return "Pendiente";
      case "cancelled":
        return "Cancelado";
      default:
        return status;
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              ¡Bienvenido, Keila!
            </h1>
            <p className="text-gray-600 mt-2">
              Resumen de tu tienda GlowHair
            </p>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => window.location.reload()}
            className="bg-gradient-to-r from-glow-600 to-glow-500 text-white px-6 py-3 rounded-lg hover:from-glow-700 hover:to-glow-600 transition-all duration-200 font-medium"
          >
            Actualizar Datos
          </motion.button>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      {stat.name}
                    </p>
                    <p className="text-2xl font-bold text-gray-900 mt-2">
                      {stat.value}
                    </p>
                    <div className="flex items-center mt-2">
                      {stat.changeType === "increase" ? (
                        <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                      ) : stat.changeType === "decrease" ? (
                        <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                      ) : null}
                      <span className={`text-sm ${
                        stat.changeType === "increase" ? "text-green-600" :
                        stat.changeType === "decrease" ? "text-red-600" :
                        "text-gray-600"
                      }`}>
                        {stat.change}
                      </span>
                    </div>
                  </div>
                  <div className="p-3 bg-gradient-to-r from-glow-100 to-glow-50 rounded-xl">
                    <Icon className="h-8 w-8 text-glow-600" />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Analytics Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-6">
            Análisis y Reportes
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push("/admin/pedidos")}
              className="p-6 border-2 border-gray-200 rounded-lg hover:border-glow-300 hover:shadow-md transition-all duration-200 cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                  <BarChart3 className="h-6 w-6 text-blue-600" />
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900">1,429</p>
                  <p className="text-sm text-gray-500">Total</p>
                </div>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Pedidos Recientes</h4>
              <p className="text-sm text-gray-600 mb-3">
                Analiza tus pedidos con filtros avanzados y gráficas detalladas
              </p>
              <div className="flex items-center text-glow-600 text-sm font-medium">
                <span>Ver análisis completo</span>
                <TrendingUp className="h-4 w-4 ml-2" />
              </div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push("/admin/productos-vendidos")}
              className="p-6 border-2 border-gray-200 rounded-lg hover:border-glow-300 hover:shadow-md transition-all duration-200 cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                  <Award className="h-6 w-6 text-green-600" />
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900">156</p>
                  <p className="text-sm text-gray-500">Productos</p>
                </div>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Productos Más Vendidos</h4>
              <p className="text-sm text-gray-600 mb-3">
                Descubre qué productos generan más ingresos y cuáles son tendencia
              </p>
              <div className="flex items-center text-glow-600 text-sm font-medium">
                <span>Ver ranking completo</span>
                <TrendingUp className="h-4 w-4 ml-2" />
              </div>
            </motion.div>
          </div>

          {/* Additional Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-200">
            <div className="text-center">
              <div className="p-3 bg-purple-100 rounded-lg mx-auto w-fit mb-2">
                <Calendar className="h-5 w-5 text-purple-600" />
              </div>
              <p className="text-lg font-bold text-gray-900">30 días</p>
              <p className="text-sm text-gray-500">Período por defecto</p>
            </div>
            
            <div className="text-center">
              <div className="p-3 bg-orange-100 rounded-lg mx-auto w-fit mb-2">
                <PieChart className="h-5 w-5 text-orange-600" />
              </div>
              <p className="text-lg font-bold text-gray-900">Gráficas</p>
              <p className="text-sm text-gray-500">Visualización avanzada</p>
            </div>
            
            <div className="text-center">
              <div className="p-3 bg-indigo-100 rounded-lg mx-auto w-fit mb-2">
                <DollarSign className="h-5 w-5 text-indigo-600" />
              </div>
              <p className="text-lg font-bold text-gray-900">€45,231</p>
              <p className="text-sm text-gray-500">Ingresos totales</p>
            </div>
            
            <div className="text-center">
              <div className="p-3 bg-pink-100 rounded-lg mx-auto w-fit mb-2">
                <Users className="h-5 w-5 text-pink-600" />
              </div>
              <p className="text-lg font-bold text-gray-900">893</p>
              <p className="text-sm text-gray-500">Clientes únicos</p>
            </div>
          </div>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Orders */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-xl shadow-lg"
          >
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Pedidos Recientes
                </h3>
                <button 
                  onClick={() => router.push("/admin/pedidos")}
                  className="text-glow-600 hover:text-glow-700 font-medium"
                >
                  Ver todos
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                {[
                  { id: "ORD-001", customerName: "María García", total: 89.99, status: "delivered" },
                  { id: "ORD-002", customerName: "Ana López", total: 156.50, status: "shipped" },
                  { id: "ORD-003", customerName: "Carmen Silva", total: 234.00, status: "processing" },
                  { id: "ORD-004", customerName: "Laura Martín", total: 67.25, status: "pending" }
                ].map((order) => (
                  <motion.div
                    key={order.id}
                    whileHover={{ scale: 1.02 }}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gradient-to-r from-glow-500 to-glow-400 rounded-full flex items-center justify-center">
                        <ShoppingBag className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {order.customerName}
                        </p>
                        <p className="text-sm text-gray-600">
                          {order.id} • €{order.total.toFixed(2)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {getStatusText(order.status)}
                      </span>
                      <button className="text-gray-400 hover:text-gray-600">
                        <MoreHorizontal size={16} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Top Products */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-xl shadow-lg"
          >
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Productos Más Vendidos
                </h3>
                <button 
                  onClick={() => router.push("/admin/productos-vendidos")}
                  className="text-glow-600 hover:text-glow-700 font-medium"
                >
                  Ver todos
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                {[
                  { id: "1", name: "Serum Reparador Intensivo", sales: 89, revenue: 2670.00 },
                  { id: "2", name: "Mascarilla Hidratante Premium", sales: 67, revenue: 2010.00 },
                  { id: "3", name: "Aceite Nutritivo Natural", sales: 54, revenue: 1620.00 },
                  { id: "4", name: "Champú Revitalizante", sales: 43, revenue: 1290.00 }
                ].map((product, index) => (
                  <motion.div
                    key={product.id}
                    whileHover={{ scale: 1.02 }}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gradient-to-r from-glow-500 to-glow-400 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold">
                          #{index + 1}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {product.name}
                        </p>
                        <p className="text-sm text-gray-600">
                          {product.sales} ventas • €{product.revenue.toFixed(2)}
                        </p>
                      </div>
                    </div>
                    
                    <button className="text-gray-400 hover:text-gray-600">
                      <Eye size={16} />
                    </button>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-6">
            Acciones Rápidas
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push("/admin/productos/nuevo")}
              className="p-6 bg-gradient-to-r from-glow-600 to-glow-500 text-white rounded-lg hover:from-glow-700 hover:to-glow-600 transition-all duration-200"
            >
              <Package className="h-8 w-8 mb-3" />
              <h4 className="font-semibold mb-2">Agregar Producto</h4>
              <p className="text-sm opacity-90">
                Añade nuevos productos a tu catálogo
              </p>
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push("/admin/pedidos")}
              className="p-6 bg-white border-2 border-glow-200 text-glow-700 rounded-lg hover:bg-glow-50 transition-all duration-200"
            >
              <ShoppingBag className="h-8 w-8 mb-3" />
              <h4 className="font-semibold mb-2">Gestionar Pedidos</h4>
              <p className="text-sm opacity-75">
                Revisa y actualiza el estado de los pedidos
              </p>
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push("/admin/clientes")}
              className="p-6 bg-white border-2 border-glow-200 text-glow-700 rounded-lg hover:bg-glow-50 transition-all duration-200"
            >
              <Users className="h-8 w-8 mb-3" />
              <h4 className="font-semibold mb-2">Ver Clientes</h4>
              <p className="text-sm opacity-75">
                Consulta la información de tus clientes
              </p>
            </motion.button>
          </div>
        </motion.div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
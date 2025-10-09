"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Search, 
  Filter, 
  Users,
  Mail,
  Calendar,
  ShoppingBag,
  Star,
  MoreHorizontal,
  Eye,
  Shield,
  User
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/NewAuthContext";
import AdminLayout from "@/components/admin/AdminLayout";

// Mock customer data
interface Customer {
  id: string;
  name: string;
  email: string;
  joinDate: string;
  totalOrders: number;
  totalSpent: number;
  averageRating: number;
  status: "active" | "inactive";
  lastOrderDate?: string;
}

const mockCustomers: Customer[] = [
  {
    id: "1",
    name: "María García",
    email: "maria.garcia@email.com",
    joinDate: "2024-01-15",
    totalOrders: 12,
    totalSpent: 485.50,
    averageRating: 4.8,
    status: "active",
    lastOrderDate: "2024-03-15"
  },
  {
    id: "2",
    name: "Carmen López",
    email: "carmen.lopez@email.com",
    joinDate: "2024-02-03",
    totalOrders: 8,
    totalSpent: 320.75,
    averageRating: 4.6,
    status: "active",
    lastOrderDate: "2024-03-12"
  },
  {
    id: "3",
    name: "Ana Martínez",
    email: "ana.martinez@email.com",
    joinDate: "2024-01-28",
    totalOrders: 15,
    totalSpent: 675.20,
    averageRating: 4.9,
    status: "active",
    lastOrderDate: "2024-03-18"
  },
  {
    id: "4",
    name: "Isabel Ruiz",
    email: "isabel.ruiz@email.com",
    joinDate: "2023-12-10",
    totalOrders: 5,
    totalSpent: 198.30,
    averageRating: 4.2,
    status: "inactive",
    lastOrderDate: "2024-02-05"
  },
  {
    id: "5",
    name: "Lucía Fernández",
    email: "lucia.fernandez@email.com",
    joinDate: "2024-02-20",
    totalOrders: 3,
    totalSpent: 125.40,
    averageRating: 4.7,
    status: "active",
    lastOrderDate: "2024-03-10"
  }
];

const AdminCustomersPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("Todos");
  const [customers] = useState<Customer[]>(mockCustomers);
  
  const { state: authState } = useAuth();
  const router = useRouter();

  // Check if user is admin
  useEffect(() => {
    if (!authState.isAuthenticated || authState.user?.role !== "admin") {
      router.push("/");
    }
  }, [authState, router]);

  if (!authState.isAuthenticated || authState.user?.role !== "admin") {
    return null;
  }

  // Filter customers
  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === "Todos" || customer.status === selectedStatus;
    
    return matchesSearch && matchesStatus;
  });

  // Status options
  const statusOptions = [
    { value: "Todos", label: "Todos", color: "gray" },
    { value: "active", label: "Activo", color: "green" },
    { value: "inactive", label: "Inactivo", color: "red" }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "inactive":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Calculate stats
  const totalCustomers = customers.length;
  const activeCustomers = customers.filter(c => c.status === "active").length;
  const inactiveCustomers = customers.filter(c => c.status === "inactive").length;
  const averageOrderValue = customers.reduce((sum, c) => sum + (c.totalSpent / c.totalOrders || 0), 0) / customers.length;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Clientes</h1>
            <p className="text-gray-600 mt-2">
              Gestiona la información y actividad de tus clientes
            </p>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6"
        >
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Clientes</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{totalCustomers}</p>
              </div>
              <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                <Users className="w-6 h-6" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Clientes Activos</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{activeCustomers}</p>
              </div>
              <div className="p-3 rounded-full bg-green-100 text-green-600">
                <User className="w-6 h-6" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Clientes Inactivos</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{inactiveCustomers}</p>
              </div>
              <div className="p-3 rounded-full bg-red-100 text-red-600">
                <Shield className="w-6 h-6" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Valor Promedio</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">€{averageOrderValue.toFixed(0)}</p>
              </div>
              <div className="p-3 rounded-full bg-glow-100 text-glow-600">
                <ShoppingBag className="w-6 h-6" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Buscar por nombre o email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-glow-500 focus:border-transparent"
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Filter size={20} className="text-gray-400" />
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-glow-500 focus:border-transparent"
                >
                  {statusOptions.map(status => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="text-sm text-gray-600">
                {filteredCustomers.length} cliente{filteredCustomers.length !== 1 ? 's' : ''}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Customers Table */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-lg overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha de Registro
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pedidos
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Gastado
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Valoración
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCustomers.map((customer, index) => (
                  <motion.tr
                    key={customer.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-glow-400 to-glow-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-medium text-sm">
                            {customer.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">{customer.name}</div>
                          <div className="text-sm text-gray-500 flex items-center">
                            <Mail size={12} className="mr-1" />
                            {customer.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar size={14} className="mr-2" />
                        {formatDate(customer.joinDate)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{customer.totalOrders}</div>
                      {customer.lastOrderDate && (
                        <div className="text-sm text-gray-500">
                          Último: {formatDate(customer.lastOrderDate)}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      €{customer.totalSpent.toFixed(2)}
                      <div className="text-sm text-gray-500">
                        €{(customer.totalSpent / customer.totalOrders).toFixed(2)} promedio
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                        <span className="text-sm font-medium text-gray-900">
                          {customer.averageRating.toFixed(1)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(customer.status)}`}>
                        {statusOptions.find(s => s.value === customer.status)?.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="text-glow-600 hover:text-glow-700 p-2 hover:bg-glow-50 rounded-lg transition-colors"
                          title="Ver perfil"
                        >
                          <Eye size={16} />
                        </motion.button>
                        
                        <div className="relative group">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="text-gray-600 hover:text-gray-700 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            <MoreHorizontal size={16} />
                          </motion.button>
                          
                          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                            <button className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                              <Eye size={16} className="mr-2" />
                              Ver Historial
                            </button>
                            <button className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                              <Mail size={16} className="mr-2" />
                              Enviar Email
                            </button>
                          </div>
                        </div>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Empty State */}
          {filteredCustomers.length === 0 && (
            <div className="text-center py-12">
              <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No se encontraron clientes
              </h3>
              <p className="text-gray-600">
                {searchTerm || selectedStatus !== "Todos" 
                  ? "Intenta ajustar tus filtros de búsqueda"
                  : "Aún no hay clientes registrados"}
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </AdminLayout>
  );
};

export default AdminCustomersPage;
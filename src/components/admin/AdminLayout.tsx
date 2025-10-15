"use client";

import { motion } from "framer-motion";
import { 
  BarChart3, 
  Package, 
  ShoppingCart, 
  Users, 
  Settings, 
  LogOut,
  Menu,
  TrendingUp,
  X,
  Home
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/context/NewAuthContext";
import { handleLogout as performLogout } from "@/lib/auth-helpers";
import Navbar from "@/components/layout/Navbar";

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const { logout, user, isAdmin } = useAuth();

  const navigation = [
    { name: "Dashboard", href: "/admin", icon: BarChart3, section: "general" },
    
    // Productos
    { name: "Productos", href: "/admin/productos", icon: Package, section: "productos" },
    { name: "Nuevo Producto", href: "/admin/productos/nuevo", icon: Package, section: "productos", indent: true },
    { name: "Productos Vendidos", href: "/admin/productos-vendidos", icon: TrendingUp, section: "productos", indent: true },
    
    // Pedidos
    { name: "Pedidos", href: "/admin/pedidos", icon: ShoppingCart, section: "ventas" },
    { name: "Gestionar Estados", href: "/admin/pedidos", icon: ShoppingCart, section: "ventas", indent: true },
    
    // Clientes
    { name: "Clientes", href: "/admin/clientes", icon: Users, section: "clientes" },
    
    // Configuración
    { name: "Configuración", href: "/admin/configuracion", icon: Settings, section: "sistema" },
  ];

  const sections = [
    { id: "general", label: "General" },
    { id: "productos", label: "Productos" },
    { id: "ventas", label: "Ventas" },
    { id: "clientes", label: "Clientes" },
    { id: "sistema", label: "Sistema" },
  ];

  const handleLogout = async () => {
    await performLogout(logout, {
      redirectUrl: "/"
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Navbar */}
      <Navbar />
      
      <div className="flex pt-16"> {/* Add padding-top for fixed navbar */}
        {/* Mobile Hamburger Button */}
        <div className="lg:hidden fixed top-20 left-4 z-50">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSidebarOpen(true)}
            className="p-2 bg-white rounded-lg shadow-lg border border-gray-200 text-gray-600 hover:text-glow-600 transition-colors"
          >
            <Menu size={20} />
          </motion.button>
        </div>

        {/* Mobile sidebar backdrop */}
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-gray-600 bg-opacity-75 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <div
          className={`fixed inset-y-0 left-0 top-0 z-50 w-72 bg-white shadow-xl transition-transform duration-300 ease-in-out lg:transition-none lg:w-64 lg:flex-shrink-0 lg:translate-x-0 lg:static lg:inset-0 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          }`}
        >
          <div className="flex flex-col h-full pt-16"> {/* Add padding-top for navbar space */}
            {/* Admin Header */}
            <div className="flex items-center justify-between h-16 px-4 sm:px-6 border-b border-gray-200">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-glow-400 to-glow-600 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-4 h-4 text-white" />
                </div>
                <span className="text-base sm:text-lg font-semibold text-gray-900">
                  Admin Panel
                </span>
              </div>
              
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 sm:px-6 py-4 sm:py-6 space-y-1 sm:space-y-2 overflow-y-auto">
              {/* Back to Site */}
              <Link href="/">
                <motion.div
                  whileHover={{ backgroundColor: "#f3f4f6" }}
                  onClick={() => setSidebarOpen(false)}
                  className="flex items-center px-3 py-3 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 transition-colors mb-4"
                >
                  <Home className="mr-3 h-5 w-5 flex-shrink-0" />
                  <span className="truncate">Volver a la Tienda</span>
                </motion.div>
              </Link>

              <div className="border-t border-gray-200 pt-4">
                {sections.map((section) => {
                  const sectionItems = navigation.filter(item => item.section === section.id);
                  if (sectionItems.length === 0) return null;

                  return (
                    <div key={section.id} className="mb-6">
                      <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                        {section.label}
                      </h3>
                      <div className="space-y-1">
                        {sectionItems.map((item) => {
                          const isActive = pathname === item.href || 
                            (item.href !== "/admin" && pathname.startsWith(item.href));
                          
                          return (
                            <Link key={item.name} href={item.href}>
                              <motion.div
                                whileHover={{ backgroundColor: isActive ? "#e0e7ff" : "#f3f4f6" }}
                                onClick={() => setSidebarOpen(false)}
                                className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                                  item.indent ? "ml-6" : ""
                                } ${
                                  isActive
                                    ? "bg-glow-50 text-glow-700 border-l-4 border-glow-600"
                                    : "text-gray-700 hover:bg-gray-100"
                                }`}
                              >
                                <item.icon className={`mr-3 h-5 w-5 flex-shrink-0 ${
                                  isActive ? "text-glow-600" : "text-gray-400"
                                }`} />
                                <span className="truncate">{item.name}</span>
                              </motion.div>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </nav>

            {/* User info */}
            <div className="px-6 py-4 border-t border-gray-200">
              <div className="flex items-center space-x-3">
                {user?.avatar_url ? (
                  <Image 
                    src={user.avatar_url} 
                    alt={user.first_name || 'Admin'} 
                    width={40}
                    height={40}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 bg-gradient-to-br from-glow-400 to-glow-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-semibold">
                      {user?.first_name?.[0] || 'A'}
                    </span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {user?.first_name} {user?.last_name}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {isAdmin ? 'Administrador' : 'Usuario'}
                  </p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleLogout}
                  className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                  title="Cerrar sesión"
                >
                  <LogOut size={18} />
                </motion.button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Admin Header */}
          <div className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Menu size={20} />
                </motion.button>
                
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Panel de Administración
                  </h1>
                  <p className="text-sm text-gray-600">
                    Gestiona tu tienda GlowHair
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="hidden sm:block">
                  <span className="text-sm text-gray-600">Admin Panel</span>
                </div>
              </div>
            </div>
          </div>

          {/* Page Content */}
          <main className="flex-1 p-6 lg:p-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
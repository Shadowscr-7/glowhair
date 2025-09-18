"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, Search, Menu, X, User, Heart, LogOut, Settings, ChevronDown, Shield } from "lucide-react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { state: cartState, toggleCart } = useCart();
  const { state: authState, logout } = useAuth();

  const navItems = [
    { name: "Inicio", href: "/" },
    { name: "Productos", href: "/productos" },
    { name: "Cuidado", href: "/cuidado" },
    { name: "Tratamientos", href: "/tratamientos" },
    { name: "Blog", href: "/blog" },
    { name: "Contacto", href: "/contacto" },
  ];

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-glow-200/30 shadow-lg"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center space-x-2 cursor-pointer"
            >
              <div className="relative">
                {/* Logo Icon */}
                <motion.div
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  className="w-8 h-8 bg-gradient-to-br from-glow-400 to-glow-600 rounded-full flex items-center justify-center"
                >
                  <div className="w-4 h-4 bg-white rounded-full relative">
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="absolute top-0 right-0 w-1 h-1 bg-glow-300 rounded-full"
                    />
                  </div>
                </motion.div>
              </div>
              <h1 className="text-2xl font-display font-bold bg-gradient-to-r from-glow-600 to-glow-400 bg-clip-text text-transparent">
                GlowHair
              </h1>
            </motion.div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item, index) => (
              <Link key={item.name} href={item.href}>
                <motion.span
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 + 0.3 }}
                  whileHover={{ y: -2 }}
                  className="text-gray-700 hover:text-glow-600 transition-colors duration-200 font-medium relative group cursor-pointer"
                >
                  {item.name}
                  <motion.div
                    className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-glow-400 to-glow-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-200"
                  />
                </motion.span>
              </Link>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-4">
            {/* Search */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-2 text-gray-600 hover:text-glow-600 transition-colors duration-200 hidden sm:block"
            >
              <Search size={20} />
            </motion.button>

            {/* User Authentication */}
            {authState.isAuthenticated ? (
              <div className="flex items-center space-x-4">
                {/* User Menu */}
                <div className="relative hidden sm:block">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center space-x-2 p-2 text-gray-600 hover:text-glow-600 transition-colors duration-200"
                  >
                    {authState.user?.avatar ? (
                      <img 
                        src={authState.user.avatar} 
                        alt={authState.user.firstName}
                        className="w-8 h-8 rounded-full"
                      />
                    ) : (
                      <User size={20} />
                    )}
                    <ChevronDown size={16} className={`transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                  </motion.button>

                  {/* User Dropdown */}
                  <AnimatePresence>
                    {isUserMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50"
                      >
                        <div className="px-4 py-2 border-b border-gray-200">
                          <p className="text-sm font-medium text-gray-900">
                            {authState.user?.firstName} {authState.user?.lastName}
                          </p>
                          <p className="text-xs text-gray-500">{authState.user?.email}</p>
                        </div>
                        
                        <Link href="/profile">
                          <motion.button
                            whileHover={{ backgroundColor: "#f3f4f6" }}
                            onClick={() => setIsUserMenuOpen(false)}
                            className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            <User size={16} className="mr-2" />
                            Mi Perfil
                          </motion.button>
                        </Link>
                        
                        <Link href="/favorites">
                          <motion.button
                            whileHover={{ backgroundColor: "#f3f4f6" }}
                            onClick={() => setIsUserMenuOpen(false)}
                            className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            <Heart size={16} className="mr-2" />
                            Mis Favoritos
                            {authState.favorites.length > 0 && (
                              <span className="ml-auto bg-glow-500 text-white text-xs rounded-full px-2 py-0.5">
                                {authState.favorites.length}
                              </span>
                            )}
                          </motion.button>
                        </Link>
                        
                        {/* Admin Menu - Only for admin users */}
                        {authState.user?.role === "admin" && (
                          <Link href="/admin">
                            <motion.button
                              whileHover={{ backgroundColor: "#f3f4f6" }}
                              onClick={() => setIsUserMenuOpen(false)}
                              className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                              <Shield size={16} className="mr-2" />
                              Administración
                            </motion.button>
                          </Link>
                        )}
                        
                        <Link href="/settings">
                          <motion.button
                            whileHover={{ backgroundColor: "#f3f4f6" }}
                            onClick={() => setIsUserMenuOpen(false)}
                            className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            <Settings size={16} className="mr-2" />
                            Configuración
                          </motion.button>
                        </Link>
                        
                        <div className="border-t border-gray-200">
                          <motion.button
                            whileHover={{ backgroundColor: "#fef2f2" }}
                            onClick={() => {
                              logout();
                              setIsUserMenuOpen(false);
                            }}
                            className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                          >
                            <LogOut size={16} className="mr-2" />
                            Cerrar Sesión
                          </motion.button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Favorites */}
                <Link href="/favorites">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-2 text-gray-600 hover:text-glow-600 transition-colors duration-200 relative"
                  >
                    <Heart size={20} />
                    {authState.favorites.length > 0 && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium"
                      >
                        {authState.favorites.length}
                      </motion.span>
                    )}
                  </motion.button>
                </Link>
              </div>
            ) : (
              <div className="hidden sm:flex items-center space-x-2">
                <Link href="/login">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-4 py-2 text-glow-600 hover:text-glow-700 font-medium transition-colors"
                  >
                    Iniciar Sesión
                  </motion.button>
                </Link>
                <Link href="/register">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-4 py-2 bg-gradient-to-r from-glow-600 to-glow-500 text-white rounded-lg font-medium hover:from-glow-700 hover:to-glow-600 transition-all duration-200"
                  >
                    Registrarse
                  </motion.button>
                </Link>
              </div>
            )}

            {/* Shopping Cart */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleCart}
              className="p-2 text-gray-600 hover:text-glow-600 transition-colors duration-200 relative"
            >
              <ShoppingCart size={20} />
              {cartState.itemCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 w-5 h-5 bg-glow-500 text-white text-xs rounded-full flex items-center justify-center font-medium"
                >
                  {cartState.itemCount}
                </motion.span>
              )}
            </motion.button>

            {/* Mobile Menu Button */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 text-gray-600 hover:text-glow-600 transition-colors duration-200 md:hidden"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden bg-white border-t border-glow-200/30"
          >
            <div className="px-4 py-4 space-y-4">
              {navItems.map((item, index) => (
                <Link key={item.name} href={item.href}>
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => setIsMenuOpen(false)}
                    className="block text-gray-700 hover:text-glow-600 transition-colors duration-200 font-medium py-2 cursor-pointer"
                  >
                    {item.name}
                  </motion.div>
                </Link>
              ))}
              
              {/* Mobile Authentication */}
              <div className="pt-4 border-t border-glow-200/30">
                {authState.isAuthenticated ? (
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 pb-3 border-b border-gray-200">
                      {authState.user?.avatar ? (
                        <img 
                          src={authState.user.avatar} 
                          alt={authState.user.firstName}
                          className="w-10 h-10 rounded-full"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-gradient-to-br from-glow-400 to-glow-600 rounded-full flex items-center justify-center">
                          <User size={20} className="text-white" />
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {authState.user?.firstName} {authState.user?.lastName}
                        </p>
                        <p className="text-xs text-gray-500">{authState.user?.email}</p>
                      </div>
                    </div>
                    
                    <Link href="/profile">
                      <motion.button
                        whileHover={{ backgroundColor: "#f8fafc" }}
                        onClick={() => setIsMenuOpen(false)}
                        className="w-full flex items-center space-x-3 px-2 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        <User size={18} />
                        <span>Mi Perfil</span>
                      </motion.button>
                    </Link>
                    
                    <Link href="/favorites">
                      <motion.button
                        whileHover={{ backgroundColor: "#f8fafc" }}
                        onClick={() => setIsMenuOpen(false)}
                        className="w-full flex items-center space-x-3 px-2 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        <Heart size={18} />
                        <span>Mis Favoritos</span>
                        {authState.favorites.length > 0 && (
                          <span className="ml-auto bg-glow-500 text-white text-xs rounded-full px-2 py-0.5">
                            {authState.favorites.length}
                          </span>
                        )}
                      </motion.button>
                    </Link>
                    
                    <motion.button
                      whileHover={{ backgroundColor: "#fef2f2" }}
                      onClick={() => {
                        logout();
                        setIsMenuOpen(false);
                      }}
                      className="w-full flex items-center space-x-3 px-2 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <LogOut size={18} />
                      <span>Cerrar Sesión</span>
                    </motion.button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Link href="/login">
                      <motion.button
                        whileHover={{ backgroundColor: "#f8fafc" }}
                        onClick={() => setIsMenuOpen(false)}
                        className="w-full py-3 text-glow-600 hover:bg-gray-50 transition-colors duration-200 rounded-lg font-medium"
                      >
                        Iniciar Sesión
                      </motion.button>
                    </Link>
                    <Link href="/register">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setIsMenuOpen(false)}
                        className="w-full py-3 bg-gradient-to-r from-glow-600 to-glow-500 text-white rounded-lg font-medium hover:from-glow-700 hover:to-glow-600 transition-all duration-200"
                      >
                        Registrarse
                      </motion.button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;
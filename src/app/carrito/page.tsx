"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  Minus, 
  Plus, 
  Trash2, 
  ShoppingBag, 
  CreditCard,
  Lock,
  Truck,
  Loader2,
  AlertCircle
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import { useCart } from "@/context/CartContext";
import { cartAPI } from "@/lib/api";

export default function CartPage() {
  const router = useRouter();
  const { state, updateQuantity, removeItem } = useCart();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totals, setTotals] = useState({
    subtotal: 0,
    shipping: 0,
    tax: 0,
    total: 0
  });

  // Fetch cart from API
  const fetchCart = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Cart data is already in local state from CartContext
      // Just fetch totals from API
      const totalsData = await cartAPI.getTotal();
      setTotals({
        subtotal: totalsData.subtotal,
        shipping: totalsData.shipping,
        tax: totalsData.tax,
        total: totalsData.total
      });
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar el carrito';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const subtotal = totals.subtotal;
  const shipping = totals.shipping;
  const tax = totals.tax;
  const total = totals.total;

  const handleCheckout = () => {
    router.push('/checkout');
  };

  const handleUpdateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      handleRemoveItem(itemId);
      return;
    }

    try {
      await cartAPI.update(itemId, newQuantity);
      // Update local state
      updateQuantity(itemId, newQuantity);
      // Refresh cart totals
      await fetchCart();
    } catch (err) {
      console.error('Error updating quantity:', err);
      alert('Error al actualizar cantidad');
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    try {
      await cartAPI.remove(itemId);
      // Update local state
      removeItem(itemId);
      // Refresh cart
      await fetchCart();
    } catch (err) {
      console.error('Error removing item:', err);
      alert('Error al eliminar producto');
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="pt-20 flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="h-12 w-12 text-glow-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Cargando carrito...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="pt-20 flex items-center justify-center min-h-[60vh]">
          <div className="text-center max-w-md mx-auto px-4">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Error al cargar el carrito</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={fetchCart}
                className="bg-glow-600 text-white px-6 py-3 rounded-lg hover:bg-glow-700 transition-colors"
              >
                Reintentar
              </button>
              <button
                onClick={() => router.push('/productos')}
                className="bg-white text-gray-700 px-6 py-3 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
              >
                Ver Productos
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Header */}
      <div className="pt-20 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            whileHover={{ x: -5 }}
            onClick={() => router.back()}
            className="flex items-center gap-2 text-glow-600 hover:text-glow-700 transition-colors mb-6"
          >
            <ArrowLeft size={20} />
            <span>Continuar comprando</span>
          </motion.button>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h1 className="text-3xl font-display font-bold text-gray-900">
              Carrito de Compras
            </h1>
            <p className="text-gray-600 mt-2">
              {state.itemCount === 0 
                ? "Tu carrito está vacío" 
                : `${state.itemCount} ${state.itemCount === 1 ? 'producto' : 'productos'} en tu carrito`
              }
            </p>
          </motion.div>
        </div>
      </div>

      {state.items.length === 0 ? (
        /* Empty Cart */
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md mx-auto px-4 py-20 text-center"
        >
          <motion.div
            animate={{ 
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="mb-8"
          >
            <ShoppingBag className="h-24 w-24 text-gray-300 mx-auto" />
          </motion.div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Tu carrito está vacío
          </h2>
          <p className="text-gray-600 mb-8">
            Descubre nuestros productos premium para el cuidado capilar
          </p>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push('/productos')}
            className="bg-gradient-to-r from-glow-600 to-glow-500 text-white px-8 py-4 rounded-lg font-semibold hover:from-glow-700 hover:to-glow-600 transition-all duration-200"
          >
            Explorar Productos
          </motion.button>
        </motion.div>
      ) : (
        /* Cart with Items */
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          <div className="grid lg:grid-cols-3 gap-8">
            
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-lg overflow-hidden"
              >
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Productos ({state.itemCount})
                  </h2>
                </div>

                <div className="divide-y divide-gray-200">
                  <AnimatePresence>
                    {state.items.map((item) => (
                      <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -100 }}
                        transition={{ duration: 0.3 }}
                        className="p-6"
                      >
                        <div className="flex items-start gap-4">
                          {/* Product Image */}
                          <div className="w-20 h-20 bg-gradient-to-br from-glow-50 to-glow-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <div className="w-12 h-12">
                              {item.image}
                            </div>
                          </div>

                          {/* Product Info */}
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900">
                              {item.name}
                            </h3>
                            <p className="text-gray-600 text-sm">
                              {item.brand} • {item.category}
                            </p>
                            {item.size && (
                              <p className="text-gray-500 text-sm">{item.size}</p>
                            )}
                            
                            <div className="flex items-center justify-between mt-4">
                              {/* Quantity Controls */}
                              <div className="flex items-center border border-gray-300 rounded-lg">
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                                  className="p-2 hover:bg-gray-100 transition-colors"
                                >
                                  <Minus size={16} />
                                </motion.button>
                                <span className="px-4 py-2 border-x border-gray-300 min-w-[60px] text-center">
                                  {item.quantity}
                                </span>
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                                  disabled={item.quantity >= item.inStock}
                                  className="p-2 hover:bg-gray-100 transition-colors disabled:opacity-50"
                                >
                                  <Plus size={16} />
                                </motion.button>
                              </div>

                              {/* Price */}
                              <div className="text-right">
                                <p className="font-semibold text-glow-600">
                                  ${(item.price * item.quantity).toFixed(2)}
                                </p>
                                <p className="text-sm text-gray-500">
                                  ${item.price.toFixed(2)} c/u
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Remove Button */}
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleRemoveItem(item.id)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 size={20} />
                          </motion.button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </motion.div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-2xl shadow-lg p-6 sticky top-6"
              >
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  Resumen del Pedido
                </h2>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">${subtotal.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Envío</span>
                    <span className="font-medium">
                      {shipping === 0 ? (
                        <span className="text-green-600">Gratis</span>
                      ) : (
                        `$${shipping.toFixed(2)}`
                      )}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Impuestos</span>
                    <span className="font-medium">${tax.toFixed(2)}</span>
                  </div>
                  
                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex justify-between">
                      <span className="text-lg font-semibold text-gray-900">Total</span>
                      <span className="text-lg font-bold text-glow-600">
                        ${total.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Shipping Notice */}
                <div className="bg-glow-50 p-4 rounded-lg mb-6">
                  <div className="flex items-center gap-2 text-glow-700">
                    <Truck size={16} />
                    <span className="text-sm font-medium">
                      {shipping === 0 
                        ? "¡Envío gratis incluido!" 
                        : `Agrega $${(50 - subtotal).toFixed(2)} más para envío gratis`
                      }
                    </span>
                  </div>
                </div>

                {/* Checkout Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleCheckout}
                  className="w-full bg-gradient-to-r from-glow-600 to-glow-500 text-white py-4 rounded-xl font-semibold text-lg hover:from-glow-700 hover:to-glow-600 transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <CreditCard size={20} />
                  Proceder al Checkout
                </motion.button>

                {/* Security Notice */}
                <div className="flex items-center justify-center gap-2 mt-4 text-gray-500 text-sm">
                  <Lock size={14} />
                  <span>Pago 100% seguro</span>
                </div>

                {/* Continue Shopping */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => router.push('/productos')}
                  className="w-full mt-4 border border-gray-300 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                >
                  Continuar Comprando
                </motion.button>
              </motion.div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
"use client";

import { useEffect, useState, Suspense } from 'react';
import { motion } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import { Clock, Package, ArrowRight, Home, Loader2 } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';

function OrderPendingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    // Countdown para redirigir
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push(orderId ? `/orders/${orderId}` : '/orders');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router, orderId]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-orange-50">
      <Navbar />
      
      <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-3xl shadow-2xl overflow-hidden"
          >
            {/* Pending Icon */}
            <div className="bg-gradient-to-br from-yellow-500 to-orange-500 p-8 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-4"
              >
                <Clock className="w-12 h-12 text-yellow-600" strokeWidth={3} />
              </motion.div>
              
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-3xl md:text-4xl font-display font-bold text-white mb-2"
              >
                Pago Pendiente
              </motion.h1>
              
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-yellow-100 text-lg"
              >
                Tu pago está siendo procesado
              </motion.p>
            </div>

            {/* Order Details */}
            <div className="p-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="space-y-6"
              >
                {orderId && (
                  <div className="bg-yellow-50 rounded-xl p-6 border border-yellow-200">
                    <div className="flex items-center gap-3 mb-2">
                      <Package className="w-5 h-5 text-yellow-600" />
                      <h2 className="font-semibold text-gray-900">Número de Orden</h2>
                    </div>
                    <p className="text-2xl font-mono font-bold text-yellow-600">
                      #{orderId.slice(0, 8).toUpperCase()}
                    </p>
                  </div>
                )}

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0 mt-1">
                      <Clock className="w-4 h-4 text-yellow-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">
                        Esperando Confirmación
                      </h3>
                      <p className="text-gray-600 text-sm">
                        Tu pago está siendo procesado por Mercado Pago. Esto puede tomar algunos minutos.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-1">
                      <Package className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">
                        ¿Qué significa esto?
                      </h3>
                      <p className="text-gray-600 text-sm">
                        Algunos métodos de pago requieren aprobación manual o pueden tardar en procesarse. 
                        Te notificaremos por email cuando se confirme tu pago.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-1">
                      <Package className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">
                        Próximos Pasos
                      </h3>
                      <p className="text-gray-600 text-sm">
                        Una vez confirmado el pago, comenzaremos a preparar tu pedido inmediatamente.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-6 space-y-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => router.push(orderId ? `/orders/${orderId}` : '/orders')}
                    className="w-full bg-gradient-to-r from-yellow-600 to-orange-500 text-white py-4 rounded-xl font-semibold hover:from-yellow-700 hover:to-orange-600 transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    Ver Estado del Pedido
                    <ArrowRight className="w-5 h-5" />
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => router.push('/')}
                    className="w-full bg-white border-2 border-gray-200 text-gray-700 py-4 rounded-xl font-semibold hover:border-gray-300 hover:bg-gray-50 transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    <Home className="w-5 h-5" />
                    Volver al Inicio
                  </motion.button>
                </div>

                {/* Countdown */}
                <div className="text-center pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-500">
                    Serás redirigido automáticamente en{' '}
                    <span className="font-semibold text-yellow-600">{countdown}</span>{' '}
                    segundos
                  </p>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Additional Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-8 text-center"
          >
            <p className="text-gray-600 text-sm">
              ¿Tienes alguna pregunta sobre tu pedido?{' '}
              <a href="/contacto" className="text-yellow-600 hover:text-yellow-700 font-semibold underline">
                Contáctanos
              </a>
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default function OrderPendingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-orange-50">
          <Navbar />
          <div className="pt-24 flex items-center justify-center">
            <div className="text-center">
              <Loader2 className="w-12 h-12 animate-spin text-yellow-500 mx-auto mb-4" />
              <p className="text-gray-600">Cargando...</p>
            </div>
          </div>
        </div>
      }
    >
      <OrderPendingContent />
    </Suspense>
  );
}

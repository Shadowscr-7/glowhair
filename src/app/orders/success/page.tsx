"use client";

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import { Check, Package, ArrowRight, Home } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';

export default function OrderSuccessPage() {
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
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-glow-50">
      <Navbar />
      
      <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-3xl shadow-2xl overflow-hidden"
          >
            {/* Success Icon */}
            <div className="bg-gradient-to-br from-green-500 to-green-600 p-8 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-4"
              >
                <Check className="w-12 h-12 text-green-600" strokeWidth={3} />
              </motion.div>
              
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-3xl md:text-4xl font-display font-bold text-white mb-2"
              >
                ¡Orden Confirmada!
              </motion.h1>
              
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-green-100 text-lg"
              >
                Tu pedido ha sido procesado exitosamente
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
                  <div className="bg-glow-50 rounded-xl p-6 border border-glow-200">
                    <div className="flex items-center gap-3 mb-2">
                      <Package className="w-5 h-5 text-glow-600" />
                      <h2 className="font-semibold text-gray-900">Número de Orden</h2>
                    </div>
                    <p className="text-2xl font-mono font-bold text-glow-600">
                      #{orderId.slice(0, 8).toUpperCase()}
                    </p>
                  </div>
                )}

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-1">
                      <Check className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">
                        Confirmación Enviada
                      </h3>
                      <p className="text-gray-600 text-sm">
                        Hemos enviado un email de confirmación con los detalles de tu pedido
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-1">
                      <Check className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">
                        Pedido en Proceso
                      </h3>
                      <p className="text-gray-600 text-sm">
                        Estamos preparando tu pedido para el envío
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 mt-1">
                      <Package className="w-4 h-4 text-gray-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">
                        Próximos Pasos
                      </h3>
                      <p className="text-gray-600 text-sm">
                        Te notificaremos cuando tu pedido sea enviado con un número de seguimiento
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
                    className="w-full bg-gradient-to-r from-glow-600 to-glow-500 text-white py-4 rounded-xl font-semibold hover:from-glow-700 hover:to-glow-600 transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    Ver Detalles del Pedido
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
                    <span className="font-semibold text-glow-600">{countdown}</span>{' '}
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
              <a href="/contacto" className="text-glow-600 hover:text-glow-700 font-semibold underline">
                Contáctanos
              </a>
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

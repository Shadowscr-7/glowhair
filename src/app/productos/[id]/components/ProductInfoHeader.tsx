import { motion } from "framer-motion";
import { Star, Truck, Package } from "lucide-react";
import type { UIProduct } from "../utils/types";

interface ProductInfoHeaderProps {
  product: UIProduct;
}

const getDeliveryMessage = () => {
  // Obtener la hora actual en Uruguay (GMT-3)
  const now = new Date();
  const uruguayTime = new Date(now.toLocaleString("en-US", { timeZone: "America/Montevideo" }));
  const currentHour = uruguayTime.getHours();
  
  // Si es antes de las 14:00 (2:00 PM), llega hoy
  if (currentHour < 14) {
    return {
      message: "Llega el día de hoy",
      subMessage: "Si realizas tu pedido antes de las 14:00",
      color: "green"
    };
  } else {
    return {
      message: "Llega el día de mañana",
      subMessage: "Pedido procesado para envío mañana",
      color: "blue"
    };
  }
};

export const ProductInfoHeader = ({ product }: ProductInfoHeaderProps) => {
  const deliveryInfo = getDeliveryMessage();
  
  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
    >
      <p className="text-sm text-gray-500 mb-2">
        {product.brand} • {product.category}
      </p>

      <h1 className="text-4xl font-bold text-gray-900 mb-4">
        {product.name}
      </h1>

      {/* Rating */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex items-center gap-1">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`w-5 h-5 ${
                i < Math.floor(product.rating)
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-gray-300"
              }`}
            />
          ))}
        </div>
        <span className="text-gray-600">
          {product.rating.toFixed(1)} ({product.reviewCount} reseñas)
        </span>
      </div>

      {/* Price */}
      <div className="mb-8">
        <div className="flex items-baseline gap-3">
          <span className="text-5xl font-bold text-gray-900">
            ${product.price.toFixed(2)}
          </span>
          {product.originalPrice && (
            <>
              <span className="text-2xl text-gray-400 line-through">
                ${product.originalPrice.toFixed(2)}
              </span>
              <span className="bg-red-100 text-red-800 text-sm font-medium px-3 py-1 rounded-full">
                -{Math.round((1 - product.price / product.originalPrice) * 100)}%
              </span>
            </>
          )}
        </div>
      </div>

      {/* Description */}
      <p className="text-gray-600 mb-6 leading-relaxed">
        {product.description}
      </p>

      {/* Delivery Information */}
      <div className={`bg-gradient-to-r ${
        deliveryInfo.color === 'green' 
          ? 'from-green-50 to-emerald-50 border-green-200' 
          : 'from-blue-50 to-cyan-50 border-blue-200'
      } border-2 rounded-xl p-4 mb-6`}>
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-lg ${
            deliveryInfo.color === 'green' 
              ? 'bg-green-500' 
              : 'bg-blue-500'
          }`}>
            <Truck className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <p className={`font-bold text-lg ${
              deliveryInfo.color === 'green' 
                ? 'text-green-700' 
                : 'text-blue-700'
            }`}>
              {deliveryInfo.message}
            </p>
            <p className="text-sm text-gray-600 mt-1">
              {deliveryInfo.subMessage}
            </p>
          </div>
        </div>
        
        {/* Shipping features */}
        <div className="mt-4 pt-4 border-t border-gray-200 space-y-2">
          <div className="flex items-start gap-2 text-sm text-gray-700">
            <Package className="w-4 h-4 text-purple-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Envío a todo Montevideo: $160</p>
              <p className="text-gray-600">Canelones: $250</p>
              <p className="text-gray-600">Otros departamentos: por encomienda (pagan en destino)</p>
            </div>
          </div>
          <div className="flex items-start gap-2 text-sm text-gray-700">
            <svg className="w-4 h-4 text-purple-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="font-medium">Retiro en domicilio disponible (sin costo)</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

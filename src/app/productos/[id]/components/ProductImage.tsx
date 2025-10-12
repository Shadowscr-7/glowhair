import { motion } from "framer-motion";
import { Truck, Shield, RotateCcw } from "lucide-react";
import Image from "next/image";
import type { UIProduct } from "../utils/types";

interface ProductImageProps {
  product: UIProduct;
}

export const ProductImage = ({ product }: ProductImageProps) => {
  const discountPercentage = product.originalPrice 
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : 0;

  // Obtener la imagen real del producto
  const productImageUrl = product.images && product.images.length > 0 
    ? product.images[0] 
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-white rounded-2xl shadow-xl p-8 lg:sticky lg:top-24 lg:self-start"
    >
      <div className="aspect-square w-full mb-6 relative bg-white rounded-xl overflow-hidden shadow-inner">
        {productImageUrl ? (
          <Image
            src={productImageUrl}
            alt={product.name}
            fill
            className="object-contain p-4"
            sizes="(max-width: 768px) 100vw, 50vw"
            priority
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-rose-100 to-purple-100">
            <span className="text-6xl font-bold text-white">
              {product.name.charAt(0)}
            </span>
          </div>
        )}
      </div>

      {/* Badges */}
      <div className="flex gap-2 mb-4">
        {product.isNew && (
          <span className="bg-blue-100 text-blue-800 text-xs font-medium px-3 py-1 rounded-full">
            Nuevo
          </span>
        )}
        {product.isOnSale && (
          <span className="bg-red-100 text-red-800 text-xs font-medium px-3 py-1 rounded-full">
            Oferta -{discountPercentage}%
          </span>
        )}
        {product.stock < 10 && product.stock > 0 && (
          <span className="bg-orange-100 text-orange-800 text-xs font-medium px-3 py-1 rounded-full">
            ¡Últimas unidades!
          </span>
        )}
        {product.stock === 0 && (
          <span className="bg-gray-100 text-gray-800 text-xs font-medium px-3 py-1 rounded-full">
            Agotado
          </span>
        )}
      </div>

      {/* Trust badges */}
      <div className="grid grid-cols-3 gap-4 pt-6 border-t">
        <div className="text-center">
          <Truck className="w-6 h-6 text-rose-500 mx-auto mb-2" />
          <p className="text-xs text-gray-600">Envío gratis desde €50</p>
        </div>
        <div className="text-center">
          <Shield className="w-6 h-6 text-rose-500 mx-auto mb-2" />
          <p className="text-xs text-gray-600">Compra segura</p>
        </div>
        <div className="text-center">
          <RotateCcw className="w-6 h-6 text-rose-500 mx-auto mb-2" />
          <p className="text-xs text-gray-600">Devolución 30 días</p>
        </div>
      </div>
    </motion.div>
  );
};

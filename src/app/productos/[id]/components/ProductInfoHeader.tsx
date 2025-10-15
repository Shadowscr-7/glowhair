import { motion } from "framer-motion";
import { Star } from "lucide-react";
import type { UIProduct } from "../utils/types";

interface ProductInfoHeaderProps {
  product: UIProduct;
}

export const ProductInfoHeader = ({ product }: ProductInfoHeaderProps) => {
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
      <p className="text-gray-600 mb-8 leading-relaxed">
        {product.description}
      </p>
    </motion.div>
  );
};

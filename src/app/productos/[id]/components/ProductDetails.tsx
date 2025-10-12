import { motion } from "framer-motion";
import { Sparkles, Heart, Droplet, Info } from "lucide-react";
import type { UIProduct } from "../utils/types";

interface ProductDetailsProps {
  product: UIProduct;
}

export const ProductDetails = ({ product }: ProductDetailsProps) => {
  const hasBenefits = product.benefits && product.benefits.length > 0;
  const hasIngredients = product.ingredients && product.ingredients.length > 0;
  const hasInstructions = product.usageInstructions && product.usageInstructions.length > 0;

  if (!hasBenefits && !hasIngredients && !hasInstructions) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="mt-12"
    >
      {/* Grid responsive: 1 columna en móvil, 2 en tablet, 3 en desktop */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Beneficios */}
        {hasBenefits && (
          <div className="bg-gradient-to-br from-rose-50 to-purple-50 rounded-2xl shadow-lg p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-rose-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-rose-600 to-purple-600 bg-clip-text text-transparent">
                Beneficios
              </h3>
            </div>
            <ul className="space-y-3">
              {product.benefits!.map((benefit, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="flex items-start gap-3 text-gray-700"
                >
                  <Heart className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{benefit}</span>
                </motion.li>
              ))}
            </ul>
          </div>
        )}

        {/* Modo de Uso */}
        {hasInstructions && (
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl shadow-lg p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
                <Droplet className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                Modo de Uso
              </h3>
            </div>
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">
              {product.usageInstructions}
            </p>
          </div>
        )}

        {/* Ingredientes */}
        {hasIngredients && (
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl shadow-lg p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center shadow-lg">
                <Info className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                Ingredientes
              </h3>
            </div>
            <p className="text-gray-700 leading-relaxed">
              {product.ingredients}
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

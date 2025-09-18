"use client";

import { motion } from "framer-motion";
import { ShoppingCart, Heart, Star, Eye } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewCount: number;
  image: React.ReactNode;
  category: string;
  brand?: string;
  isNew?: boolean;
  isOnSale?: boolean;
  description?: string;
}

interface ProductCardProps {
  product: Product;
  className?: string;
}

const ProductCard = ({ product, className }: ProductCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const router = useRouter();
  const { addItem, openCart } = useCart();
  const { state: authState, toggleFavorite, isFavorite } = useAuth();

  const discountPercentage = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const isProductFavorite = authState.isAuthenticated && isFavorite(product.id);

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (authState.isAuthenticated) {
      toggleFavorite(product.id);
    }
  };

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsAddingToCart(true);
    
    // Convert product to the format expected by cart
    const cartProduct = {
      id: product.id,
      name: product.name,
      price: product.price,
      originalPrice: product.originalPrice,
      image: product.image,
      category: product.category,
      brand: product.brand || "GlowHair",
      size: "300ml", // Default size
      inStock: 50 // Default stock
    };
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    addItem(cartProduct, 1);
    setIsAddingToCart(false);
    
    // Open cart drawer to show the added item
    openCart();
  };

  const handleViewDetails = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/productos/${product.id}`);
  };

  const handleCardClick = () => {
    router.push(`/productos/${product.id}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8 }}
      transition={{ duration: 0.3 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={handleCardClick}
      className={cn(
        "group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-glow-100/50 cursor-pointer",
        className
      )}
    >
      {/* Badges */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
        {product.isNew && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="px-2 py-1 bg-gradient-to-r from-glow-500 to-glow-400 text-white text-xs font-medium rounded-full"
          >
            Nuevo
          </motion.span>
        )}
        {product.isOnSale && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1 }}
            className="px-2 py-1 bg-red-500 text-white text-xs font-medium rounded-full"
          >
            -{discountPercentage}%
          </motion.span>
        )}
      </div>

      {/* Wishlist Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={handleToggleFavorite}
        className={cn(
          "absolute top-3 right-3 z-10 w-8 h-8 rounded-full flex items-center justify-center shadow-lg transition-all duration-200",
          isProductFavorite 
            ? "bg-red-500 text-white" 
            : "bg-white/90 backdrop-blur-sm text-gray-600 hover:bg-white"
        )}
      >
        <Heart 
          size={16} 
          className={cn(
            "transition-colors duration-200",
            isProductFavorite ? "fill-current" : ""
          )}
        />
      </motion.button>

      {/* Product Image */}
      <div className="relative h-48 bg-gradient-to-br from-glow-50 to-glow-100 flex items-center justify-center p-8">
        <motion.div
          animate={{ 
            scale: isHovered ? 1.1 : 1,
            rotate: isHovered ? 5 : 0
          }}
          transition={{ duration: 0.3 }}
          className="w-20 h-20"
        >
          {product.image}
        </motion.div>

        {/* Quick Actions - Appear on Hover */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ 
            opacity: isHovered ? 1 : 0,
            y: isHovered ? 0 : 10
          }}
          transition={{ duration: 0.2 }}
          className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex gap-2"
        >
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleViewDetails}
            className="w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-glow-500 hover:text-white transition-all duration-200"
          >
            <Eye size={14} />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleAddToCart}
            disabled={isAddingToCart}
            className="w-8 h-8 bg-glow-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-glow-600 transition-all duration-200 disabled:opacity-50"
          >
            {isAddingToCart ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-3 h-3 border border-white border-t-transparent rounded-full"
              />
            ) : (
              <ShoppingCart size={14} />
            )}
          </motion.button>
        </motion.div>
      </div>

      {/* Product Info */}
      <div className="p-6">
        {/* Category */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-sm text-glow-600 font-medium mb-2"
        >
          {product.category}
        </motion.p>

        {/* Product Name */}
        <motion.h3
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-glow-700 transition-colors duration-200"
        >
          {product.name}
        </motion.h3>

        {/* Description */}
        {product.description && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-sm text-gray-600 mb-3 line-clamp-2"
          >
            {product.description}
          </motion.p>
        )}

        {/* Rating */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex items-center gap-2 mb-3"
        >
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={14}
                className={cn(
                  "transition-colors duration-200",
                  i < Math.floor(product.rating)
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-gray-300"
                )}
              />
            ))}
          </div>
          <span className="text-sm text-gray-600">
            {product.rating} ({product.reviewCount})
          </span>
        </motion.div>

        {/* Price */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-gray-900">
              ${product.price.toFixed(2)}
            </span>
            {product.originalPrice && (
              <span className="text-sm text-gray-500 line-through">
                ${product.originalPrice.toFixed(2)}
              </span>
            )}
          </div>
        </motion.div>

        {/* Add to Cart Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          onClick={handleAddToCart}
          disabled={isAddingToCart}
          className="w-full mt-4 bg-gradient-to-r from-glow-600 to-glow-500 text-white py-3 px-4 rounded-xl font-medium hover:from-glow-700 hover:to-glow-600 transition-all duration-200 flex items-center justify-center gap-2 group disabled:opacity-50"
        >
          {isAddingToCart ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
            />
          ) : (
            <>
              <ShoppingCart size={18} className="group-hover:scale-110 transition-transform duration-200" />
              Agregar al Carrito
            </>
          )}
        </motion.button>
      </div>

      {/* Hover Glow Effect */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isHovered ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        className="absolute inset-0 bg-gradient-to-r from-glow-500/5 to-glow-400/5 pointer-events-none rounded-2xl"
      />
    </motion.div>
  );
};

export default ProductCard;
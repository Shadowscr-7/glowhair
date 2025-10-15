"use client";

import { motion } from "framer-motion";
import { ShoppingCart, Heart, Star, Eye } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/NewAuthContext";
import { useFavorites } from "@/hooks/useFavorites";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { Product } from "@/types/product";

interface ProductCardProps {
  product: Product;
  className?: string;
}

const ProductCard = ({ product, className }: ProductCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const router = useRouter();
  const { addItem, openCart } = useCart();
  const { state: authState } = useAuth();
  const { isFavorite, toggle: toggleFavorite, loading: favoriteLoading } = useFavorites();

  const discountPercentage = product.original_price 
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
    : 0;

  const isProductFavorite = authState.isAuthenticated && isFavorite(product.id);

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!authState.isAuthenticated) {
      router.push("/login");
      return;
    }

    // Verificar si el ID del producto es un UUID válido (productos de la API)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(product.id)) {
      console.warn('⚠️ Producto mock/local no se puede agregar a favoritos:', product.id);
      alert('Este producto no está disponible para agregar a favoritos. Solo los productos de la tienda pueden ser favoritos.');
      return;
    }

    console.log('❤️ Toggle favorito para producto:', {
      id: product.id,
      name: product.name,
      isFavorite: isProductFavorite
    });

    try {
      await toggleFavorite(product.id);
      console.log('✅ Favorito actualizado correctamente');
    } catch (error) {
      console.error('❌ Error al actualizar favorito:', error);
      
      // Mostrar mensaje de error más específico
      if (error instanceof Error) {
        alert(`Error: ${error.message}`);
      } else {
        alert('Error al actualizar favoritos. Por favor, intenta de nuevo.');
      }
    }
  };

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsAddingToCart(true);
    
    // Obtener la URL de la imagen (priorizar images[0], luego image_url, luego image)
    let imageUrl = "";
    if (product.images && Array.isArray(product.images) && product.images.length > 0) {
      imageUrl = product.images[0];
    } else if (product.image_url && typeof product.image_url === 'string') {
      imageUrl = product.image_url;
    } else if (typeof product.image === 'string') {
      imageUrl = product.image;
    }
    
    // Convert product to the format expected by cart
    const cartProduct = {
      id: product.id,
      name: product.name,
      price: product.price,
      original_price: product.original_price,
      image: imageUrl,
      category: typeof product.category === 'string' ? product.category : product.category?.name || 'Sin categoría',
      brand: typeof product.brand === 'string' ? product.brand : product.brand?.name || "GlowHair",
      size: "300ml", // Default size
      inStock: 50 // Default stock
    };
    
    console.log('🛒 ProductCard - Agregando al carrito:', cartProduct);
    
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
        "group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-glow-100/50 cursor-pointer flex flex-col h-full",
        className
      )}
    >
      {/* Badges */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
        {product.is_new && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="px-2 py-1 bg-gradient-to-r from-glow-500 to-glow-400 text-white text-xs font-medium rounded-full"
          >
            Nuevo
          </motion.span>
        )}
        {product.is_on_sale && (
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
        disabled={favoriteLoading}
        className={cn(
          "absolute top-3 right-3 z-10 w-8 h-8 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 disabled:opacity-50",
          isProductFavorite 
            ? "bg-red-500 text-white" 
            : "bg-white/90 backdrop-blur-sm text-gray-600 hover:bg-white"
        )}
      >
        {favoriteLoading ? (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-3 h-3 border border-current border-t-transparent rounded-full"
          />
        ) : (
          <Heart 
            size={16} 
            className={cn(
              "transition-colors duration-200",
              isProductFavorite ? "fill-current" : ""
            )}
          />
        )}
      </motion.button>

      {/* Product Image */}
      <div className="relative h-48 sm:h-56 bg-gradient-to-br from-glow-50 to-glow-100 flex items-center justify-center p-4 sm:p-6 overflow-hidden flex-shrink-0">
        <motion.div
          animate={{
            scale: isHovered ? 1.05 : 1,
            rotate: isHovered ? 2 : 0
          }}
          transition={{ duration: 0.3 }}
          className="w-full h-full flex items-center justify-center"
        >
          {/* Prioridad: images[0] > image_url > fallback */}
          {(product.images && product.images.length > 0) || product.image_url ? (
            <div className="relative w-full h-full bg-white rounded-lg shadow-sm p-2">
              <Image
                src={product.images?.[0] || product.image_url || ''}
                alt={product.name}
                fill
                className="object-contain rounded-md"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                priority={false}
              />
            </div>
          ) : (
            <div className="w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center text-gray-400">
              {product.image && typeof product.image !== 'string' ? product.image : (
                <div className="text-center text-sm">Sin imagen</div>
              )}
            </div>
          )}
        </motion.div>        {/* Quick Actions - Mobile: Always visible, Desktop: On hover */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ 
            opacity: 1, // Always visible on mobile
            y: 0
          }}
          className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex gap-2 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200"
        >
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleViewDetails}
            className="w-8 h-8 sm:w-8 sm:h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-glow-500 hover:text-white transition-all duration-200"
          >
            <Eye size={14} />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleAddToCart}
            disabled={isAddingToCart}
            className="w-8 h-8 sm:w-8 sm:h-8 bg-glow-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-glow-600 transition-all duration-200 disabled:opacity-50"
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
      <div className="p-4 sm:p-6 flex flex-col flex-grow">
        {/* Category */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-xs sm:text-sm text-glow-600 font-medium mb-1 sm:mb-2"
        >
          {typeof product.category === 'string' 
            ? product.category 
            : product.category?.name || 'Sin categoría'}
        </motion.p>

        {/* Product Name */}
        <motion.h3
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="font-semibold text-sm sm:text-base text-gray-900 mb-2 line-clamp-2 min-h-[2.5rem] group-hover:text-glow-700 transition-colors duration-200"
        >
          {product.name}
        </motion.h3>

        {/* Description - Always visible with fixed height */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-xs sm:text-sm text-gray-600 mb-3 line-clamp-2 min-h-[2.5rem]"
          title={product.description}
        >
          {product.description || 'Producto de alta calidad para el cuidado capilar profesional.'}
        </motion.p>

        {/* Rating */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex items-center gap-2 mb-2 sm:mb-3"
        >
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={12}
                className={cn(
                  "transition-colors duration-200",
                  i < Math.floor(product.rating)
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-gray-300"
                )}
              />
            ))}
          </div>
          <span className="text-xs sm:text-sm text-gray-600">
            {product.rating} ({product.review_count})
          </span>
        </motion.div>

        {/* Price */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex items-center justify-between mb-3 sm:mb-0 mt-auto"
        >
          <div className="flex items-center gap-2">
            <span className="text-lg sm:text-xl font-bold text-gray-900">
              ${product.price.toFixed(2)}
            </span>
            {product.original_price && (
              <span className="text-xs sm:text-sm text-gray-500 line-through">
                ${product.original_price.toFixed(2)}
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
          className="w-full mt-3 sm:mt-4 bg-gradient-to-r from-glow-600 to-glow-500 text-white py-2.5 sm:py-3 px-4 rounded-xl font-medium hover:from-glow-700 hover:to-glow-600 transition-all duration-200 flex items-center justify-center gap-2 group disabled:opacity-50 text-sm sm:text-base"
        >
          {isAddingToCart ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full"
            />
          ) : (
            <>
              <ShoppingCart size={16} className="sm:w-[18px] sm:h-[18px] group-hover:scale-110 transition-transform duration-200" />
              <span className="hidden sm:inline">Agregar al Carrito</span>
              <span className="sm:hidden">Agregar</span>
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
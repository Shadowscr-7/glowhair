"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Heart, ShoppingCart, Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import { favoritesAPI, cartAPI, type Favorite } from "@/lib/api";
import { useAuth } from "@/context/NewAuthContext";

const FavoritesPage = () => {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [addingToCartId, setAddingToCartId] = useState<string | null>(null);

  // Get authentication state from context
  const { isAuthenticated } = useAuth();

  // Load favorites on mount
  useEffect(() => {
    if (isAuthenticated) {
      loadFavorites();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  async function loadFavorites() {
    try {
      setLoading(true);
      setError(null);
      const data = await favoritesAPI.getAll();
      setFavorites(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar favoritos');
    } finally {
      setLoading(false);
    }
  }

  async function handleRemoveFavorite(productId: string) {
    try {
      setRemovingId(productId);
      await favoritesAPI.remove(productId);
      setFavorites(prevFavs => prevFavs.filter(fav => fav.product.id !== productId));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al eliminar favorito');
    } finally {
      setRemovingId(null);
    }
  }

  async function handleAddToCart(productId: string) {
    try {
      setAddingToCartId(productId);
      await cartAPI.add(productId, 1);
      // Optionally show success message
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al agregar al carrito');
    } finally {
      setAddingToCartId(null);
    }
  }

  // Not authenticated view
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="pt-20 max-w-4xl mx-auto px-4 py-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-lg p-8"
          >
            <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Inicia sesión para ver tus favoritos
            </h1>
            <p className="text-gray-600 mb-6">
              Guarda tus productos favoritos y accede a ellos desde cualquier dispositivo
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/login">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-3 bg-gradient-to-r from-glow-600 to-glow-500 text-white rounded-lg font-medium hover:from-glow-700 hover:to-glow-600 transition-all duration-200"
                >
                  Iniciar Sesión
                </motion.button>
              </Link>
              <Link href="/register">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-3 border border-glow-300 text-glow-600 rounded-lg font-medium hover:bg-glow-50 transition-all duration-200"
                >
                  Crear Cuenta
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="pt-20 flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-glow-600 mx-auto mb-4" />
            <p className="text-gray-600">Cargando favoritos...</p>
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
        <div className="pt-20 max-w-4xl mx-auto px-4 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-lg p-8 text-center"
          >
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Error</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={loadFavorites}
              className="px-6 py-3 bg-gradient-to-r from-glow-600 to-glow-500 text-white rounded-lg font-medium hover:from-glow-700 hover:to-glow-600 transition-all duration-200"
            >
              Reintentar
            </motion.button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Header Section */}
      <section className="pt-20 pb-8 bg-gradient-to-r from-glow-600 to-glow-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center text-white"
          >
            <div className="flex items-center justify-center mb-4">
              <Heart className="w-12 h-12 mr-4" fill="white" />
              <h1 className="text-4xl md:text-5xl font-display font-bold">
                Mis Favoritos
              </h1>
            </div>
            <p className="text-xl text-glow-100 max-w-3xl mx-auto">
              {favorites.length} producto{favorites.length !== 1 ? 's' : ''} guardado{favorites.length !== 1 ? 's' : ''}
            </p>
          </motion.div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Content */}
        {favorites.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md mx-auto">
              <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Aún no tienes favoritos
              </h2>
              <p className="text-gray-600 mb-6">
                Explora nuestros productos y marca como favoritos los que más te gusten
              </p>
              <Link href="/productos">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-3 bg-gradient-to-r from-glow-600 to-glow-500 text-white rounded-lg font-medium hover:from-glow-700 hover:to-glow-600 transition-all duration-200"
                >
                  Explorar Productos
                </motion.button>
              </Link>
            </div>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {favorites.map((favorite, index) => {
              const product = favorite.product;
              
              // Skip si el producto no existe (fue eliminado)
              if (!product) return null;
              
              const isRemoving = removingId === product.id;
              const isAddingToCart = addingToCartId === product.id;
              const discount = product.original_price 
                ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
                : 0;

              return (
                <motion.div
                  key={favorite.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-xl shadow-lg overflow-hidden group hover:shadow-xl transition-all duration-300"
                >
                  <div className="relative aspect-square bg-gradient-to-br from-glow-50 to-glow-100">
                    {product.images && product.images.length > 0 ? (
                      <img 
                        src={product.images[0]} 
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-glow-400">
                        <Heart className="w-24 h-24" />
                      </div>
                    )}
                    
                    {/* Favorite Button */}
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleRemoveFavorite(product.id)}
                      disabled={isRemoving}
                      className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-colors disabled:opacity-50"
                    >
                      {isRemoving ? (
                        <Loader2 size={20} className="text-gray-400 animate-spin" />
                      ) : (
                        <Heart
                          size={20}
                          className="text-red-500"
                          fill="currentColor"
                        />
                      )}
                    </motion.button>

                    {/* Discount Badge */}
                    {discount > 0 && (
                      <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded-lg text-sm font-medium">
                        -{discount}%
                      </div>
                    )}

                    {/* Stock indicator */}
                    {product.stock === 0 && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <span className="bg-white px-4 py-2 rounded-lg font-semibold text-red-600">
                          Sin Stock
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="p-4">
                    <div className="mb-2">
                      <span className="text-xs text-glow-600 bg-glow-50 px-2 py-1 rounded-full">
                        {product.category?.name || 'Sin categoría'}
                      </span>
                    </div>
                    
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                      {product.name}
                    </h3>
                    
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {product.description}
                    </p>
                    
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <span className="text-lg font-bold text-gray-900">
                          ${product.price.toFixed(2)}
                        </span>
                        {product.original_price && (
                          <span className="text-sm text-gray-500 line-through ml-2">
                            ${product.original_price.toFixed(2)}
                          </span>
                        )}
                      </div>
                      
                      <span className="text-xs text-gray-500">
                        Stock: {product.stock}
                      </span>
                    </div>

                    <div className="flex space-x-2">
                      <Link href={`/productos/${product.id}`} className="flex-1">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="w-full py-2 text-glow-600 border border-glow-300 rounded-lg font-medium hover:bg-glow-50 transition-all duration-200"
                        >
                          Ver Detalles
                        </motion.button>
                      </Link>
                      
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleAddToCart(product.id)}
                        disabled={isAddingToCart || product.stock === 0}
                        className="px-4 py-2 bg-gradient-to-r from-glow-600 to-glow-500 text-white rounded-lg hover:from-glow-700 hover:to-glow-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                      >
                        {isAddingToCart ? (
                          <Loader2 size={18} className="animate-spin" />
                        ) : (
                          <ShoppingCart size={18} />
                        )}
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default FavoritesPage;
"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams, useRouter } from "next/navigation";
import {
  Star,
  ShoppingCart,
  Heart,
  Minus,
  Plus,
  ArrowLeft,
  Truck,
  Shield,
  RotateCcw,
  Check,
  Loader2,
  AlertCircle
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/NewAuthContext";
import { ShampooIcon, ConditionerIcon, MaskIcon, SerumIcon, OilIcon } from "@/components/ui/ProductIcons";
import { productService } from "@/lib/services/products";
import type { Product as APIProduct } from "@/types";

// UI Product type
interface UIProduct {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewCount: number;
  image: React.ReactNode;
  category: string;
  brand: string;
  isNew: boolean;
  isOnSale: boolean;
  description: string;
  stock: number;
}

// Helper para seleccionar icono según categoría
const getCategoryIcon = (categoryName: string) => {
  const lower = categoryName.toLowerCase();
  if (lower.includes('shampoo') || lower.includes('champú')) {
    return <ShampooIcon className="w-full h-full" />;
  }
  if (lower.includes('acondicionador') || lower.includes('conditioner')) {
    return <ConditionerIcon className="w-full h-full" />;
  }
  if (lower.includes('mascarilla') || lower.includes('mask')) {
    return <MaskIcon className="w-full h-full" />;
  }
  if (lower.includes('serum')) {
    return <SerumIcon className="w-full h-full" />;
  }
  if (lower.includes('aceite') || lower.includes('oil')) {
    return <OilIcon className="w-full h-full" />;
  }
  
  return (
    <div className="w-full h-full bg-gradient-to-br from-rose-400 to-rose-600 rounded-xl flex items-center justify-center">
      <span className="text-white text-6xl font-bold">
        {categoryName.charAt(0).toUpperCase()}
      </span>
    </div>
  );
};

// Adapter: Convierte API Product a UI Product
const adaptProductForUI = (apiProduct: APIProduct): UIProduct => {
  const isNew = () => {
    if (!apiProduct.created_at) return false;
    const createdDate = new Date(apiProduct.created_at);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return createdDate > thirtyDaysAgo;
  };

  return {
    id: apiProduct.id,
    name: apiProduct.name,
    price: apiProduct.price,
    originalPrice: apiProduct.original_price,
    rating: 4.5,
    reviewCount: 0,
    image: getCategoryIcon(apiProduct.category?.name || 'Producto'),
    category: apiProduct.category?.name || 'General',
    brand: apiProduct.brand?.name || 'GlowHair',
    isNew: isNew(),
    isOnSale: !!apiProduct.original_price && apiProduct.original_price > apiProduct.price,
    description: apiProduct.description || '',
    stock: apiProduct.stock || 0
  };
};

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;
  const { addItem } = useCart();
  const { state: authState } = useAuth();

  const [product, setProduct] = useState<UIProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [togglingFavorite, setTogglingFavorite] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const fetchProduct = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await productService.getProductById(productId);
      if (response.success && response.data) {
        const uiProduct = adaptProductForUI(response.data);
        setProduct(uiProduct);
      } else {
        setError(response.error || "Error al cargar el producto");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar el producto");
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  useEffect(() => {
    const checkFavorite = async () => {
      if (!authState.isAuthenticated || !product) return;
      
      // TODO: Implement favorites API
      console.log("Check favorite status");
    };

    checkFavorite();
  }, [authState.isAuthenticated, product]);

  const handleToggleFavorite = async () => {
    if (!authState.isAuthenticated) {
      router.push("/login");
      return;
    }

    if (!product) return;

    try {
      setTogglingFavorite(true);
      // TODO: Implement favorites API
      if (isFavorite) {
        console.log("Remove from favorites", product.id);
        setIsFavorite(false);
      } else {
        console.log("Add to favorites", product.id);
        setIsFavorite(true);
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error al actualizar favoritos");
    } finally {
      setTogglingFavorite(false);
    }
  };

  const handleAddToCart = async () => {
    if (!product) return;

    if (!authState.isAuthenticated) {
      router.push("/login");
      return;
    }

    try {
      setAddingToCart(true);
      
      // TODO: Implement cart API
      console.log("Add to cart", product.id, quantity);
      
      // Update local context
      // @ts-expect-error - TODO: Fix Product type compatibility
      addItem(product, quantity);

      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 3000);
      setQuantity(1);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error al agregar al carrito");
    } finally {
      setAddingToCart(false);
    }
  };

  const decreaseQuantity = () => setQuantity(prev => Math.max(1, prev - 1));
  const increaseQuantity = () => {
    if (!product) return;
    setQuantity(prev => Math.min(product.stock, prev + 1));
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-rose-500 mx-auto mb-4" />
            <p className="text-gray-600">Cargando producto...</p>
          </div>
        </div>
      </>
    );
  }

  if (error || !product) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Error al cargar producto</h2>
            <p className="text-gray-600 mb-6">{error || "No se pudo encontrar el producto"}</p>
            <div className="flex gap-4 justify-center">
              <button onClick={() => fetchProduct()} className="bg-rose-500 text-white px-6 py-2 rounded-lg hover:bg-rose-600">Reintentar</button>
              <button onClick={() => router.push("/productos")} className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300">Volver a productos</button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8">
            <ArrowLeft className="w-5 h-5" />
            Volver
          </button>

          <AnimatePresence>
            {showSuccessMessage && (
              <motion.div
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -50 }}
                className="fixed top-24 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 z-50"
              >
                <Check className="w-5 h-5" />
                Producto agregado al carrito
              </motion.div>
            )}
          </AnimatePresence>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} className="bg-white rounded-2xl shadow-xl p-8 sticky top-24 self-start">
              <div className="aspect-square w-full mb-6">{product.image}</div>

              <div className="flex gap-2 mb-4">
                {product.isNew && <span className="bg-blue-100 text-blue-800 text-xs font-medium px-3 py-1 rounded-full">Nuevo</span>}
                {product.isOnSale && <span className="bg-red-100 text-red-800 text-xs font-medium px-3 py-1 rounded-full">Oferta</span>}
                {product.stock < 10 && product.stock > 0 && <span className="bg-orange-100 text-orange-800 text-xs font-medium px-3 py-1 rounded-full">¡Últimas unidades!</span>}
                {product.stock === 0 && <span className="bg-gray-100 text-gray-800 text-xs font-medium px-3 py-1 rounded-full">Agotado</span>}
              </div>

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

            <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }}>
              <p className="text-sm text-gray-500 mb-2">{product.brand} • {product.category}</p>

              <h1 className="text-4xl font-bold text-gray-900 mb-4">{product.name}</h1>

              <div className="flex items-center gap-3 mb-6">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-5 h-5 ${i < Math.floor(product.rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
                  ))}
                </div>
                <span className="text-gray-600">{product.rating.toFixed(1)} ({product.reviewCount} reseñas)</span>
              </div>

              <div className="mb-8">
                <div className="flex items-baseline gap-3">
                  <span className="text-5xl font-bold text-gray-900">€{product.price.toFixed(2)}</span>
                  {product.originalPrice && (
                    <>
                      <span className="text-2xl text-gray-400 line-through">€{product.originalPrice.toFixed(2)}</span>
                      <span className="bg-red-100 text-red-800 text-sm font-medium px-3 py-1 rounded-full">-{Math.round((1 - product.price / product.originalPrice) * 100)}%</span>
                    </>
                  )}
                </div>
              </div>

              <p className="text-gray-600 mb-8 leading-relaxed">{product.description}</p>

              <div className="flex items-center gap-4 mb-8">
                <div className="flex items-center gap-3 bg-gray-100 rounded-lg p-2">
                  <button onClick={decreaseQuantity} disabled={quantity <= 1} className="p-2 hover:bg-white rounded-lg transition-colors disabled:opacity-50">
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-12 text-center font-medium">{quantity}</span>
                  <button onClick={increaseQuantity} disabled={quantity >= product.stock || product.stock === 0} className="p-2 hover:bg-white rounded-lg transition-colors disabled:opacity-50">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                <button onClick={handleAddToCart} disabled={addingToCart || product.stock === 0} className="flex-1 bg-rose-500 text-white py-4 rounded-lg hover:bg-rose-600 flex items-center justify-center gap-2 font-medium disabled:opacity-50">
                  {addingToCart ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Agregando...
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-5 h-5" />
                      {product.stock === 0 ? 'Agotado' : 'Agregar al carrito'}
                    </>
                  )}
                </button>

                <button onClick={handleToggleFavorite} disabled={togglingFavorite} className={`p-4 rounded-lg border-2 transition-colors ${isFavorite ? "bg-rose-50 border-rose-500 text-rose-500" : "border-gray-300 text-gray-400 hover:border-rose-500 hover:text-rose-500"} disabled:opacity-50`}>
                  {togglingFavorite ? <Loader2 className="w-6 h-6 animate-spin" /> : <Heart className={`w-6 h-6 ${isFavorite ? "fill-current" : ""}`} />}
                </button>
              </div>

              <p className="text-sm text-gray-600 mb-8">
                {product.stock > 10 ? (
                  <span className="text-green-600 font-medium">✓ En stock</span>
                ) : product.stock > 0 ? (
                  <span className="text-orange-600 font-medium">⚠ Solo quedan {product.stock} unidades</span>
                ) : (
                  <span className="text-red-600 font-medium">✗ Agotado</span>
                )}
              </p>
            </motion.div>
          </div>

          <div className="mt-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Reseñas de clientes</h2>
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <p className="text-gray-500 text-center">Sistema de reseñas próximamente disponible</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

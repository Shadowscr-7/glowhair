"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/NewAuthContext";

// Custom hooks
import { useProduct } from "./hooks/useProduct";
import { useFavorite } from "./hooks/useFavorite";
import { useQuantity } from "./hooks/useQuantity";

// Components
import { LoadingState } from "./components/LoadingState";
import { ErrorState } from "./components/ErrorState";
import { SuccessMessage } from "./components/SuccessMessage";
import { ProductImage } from "./components/ProductImage";
import { ProductInfoHeader } from "./components/ProductInfoHeader";
import { ProductActions } from "./components/ProductActions";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;
  
  const { addItem } = useCart();
  const { state: authState } = useAuth();
  
  // Custom hooks
  const { product, loading, error, refetch } = useProduct(productId);
  const { isFavorite, loading: favoriteLoading, toggleFavorite } = useFavorite(
    product?.id || null,
    authState.isAuthenticated
  );
  const { quantity, increase, decrease, reset } = useQuantity(product?.stock || 0);
  
  // Local state
  const [addingToCart, setAddingToCart] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  // Handlers
  const handleToggleFavorite = async () => {
    if (!authState.isAuthenticated) {
      router.push("/login");
      return;
    }

    try {
      await toggleFavorite();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error al actualizar favoritos");
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
      reset();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error al agregar al carrito");
    } finally {
      setAddingToCart(false);
    }
  };

  // Loading state
  if (loading) {
    return <LoadingState />;
  }

  // Error state
  if (error || !product) {
    return (
      <ErrorState
        error={error}
        onRetry={refetch}
        onBackToProducts={() => router.push("/productos")}
      />
    );
  }

  // Main content
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Back button */}
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8"
          >
            <ArrowLeft className="w-5 h-5" />
            Volver
          </button>

          {/* Success message */}
          <SuccessMessage show={showSuccessMessage} />

          {/* Product grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Left: Image */}
            <ProductImage product={product} />

            {/* Right: Info */}
            <div>
              <ProductInfoHeader product={product} />
              
              <ProductActions
                quantity={quantity}
                stock={product.stock}
                isFavorite={isFavorite}
                addingToCart={addingToCart}
                togglingFavorite={favoriteLoading}
                onIncrease={increase}
                onDecrease={decrease}
                onAddToCart={handleAddToCart}
                onToggleFavorite={handleToggleFavorite}
              />
            </div>
          </div>

          {/* Reviews section */}
          <div className="mt-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              Reseñas de clientes
            </h2>
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <p className="text-gray-500 text-center">
                Sistema de reseñas próximamente disponible
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

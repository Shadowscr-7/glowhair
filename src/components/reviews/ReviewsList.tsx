'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { reviewsAPI, type ProductReviewsResponse } from '@/lib/api';
import { Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ReviewsListProps {
  productId: string;
  showStats?: boolean;
  limit?: number;
}

export function ReviewsList({ productId, showStats = true, limit = 10 }: ReviewsListProps) {
  const [data, setData] = useState<ProductReviewsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [offset, setOffset] = useState(0);

  const loadReviews = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await reviewsAPI.getByProduct(productId, limit, offset);
      setData(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar reseñas');
    } finally {
      setLoading(false);
    }
  }, [productId, limit, offset]);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  if (loading && !data) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-600 p-4 rounded-lg">
        {error}
      </div>
    );
  }

  if (!data || data.reviews.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>Aún no hay reseñas para este producto.</p>
        <p className="text-sm mt-2">¡Sé el primero en dejar una reseña!</p>
      </div>
    );
  }

  const { reviews, statistics, pagination } = data;
  const hasMore = pagination.offset + pagination.limit < pagination.total;

  return (
    <div className="space-y-6">
      {/* Statistics */}
      {showStats && statistics && (
        <div className="bg-gradient-to-br from-pink-50 to-purple-50 p-6 rounded-xl">
          <div className="flex items-center gap-6">
            {/* Average Rating */}
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-900">
                {statistics.averageRating.toFixed(1)}
              </div>
              <div className="flex items-center justify-center mt-1">
                {renderStars(statistics.averageRating)}
              </div>
              <div className="text-sm text-gray-600 mt-1">
                {statistics.totalReviews} {statistics.totalReviews === 1 ? 'reseña' : 'reseñas'}
              </div>
            </div>

            {/* Rating Distribution */}
            <div className="flex-1">
              {[5, 4, 3, 2, 1].map((rating) => {
                const count = statistics.ratingDistribution[rating] || 0;
                const percentage = statistics.totalReviews > 0
                  ? (count / statistics.totalReviews) * 100
                  : 0;

                return (
                  <div key={rating} className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-gray-600 w-12">
                      {rating} estrellas
                    </span>
                    <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        className="bg-gradient-to-r from-yellow-400 to-orange-500 h-full"
                      />
                    </div>
                    <span className="text-xs text-gray-600 w-8">
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Reviews List */}
      <AnimatePresence mode="popLayout">
        {reviews.map((review) => (
          <motion.div
            key={review.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="border-b border-gray-200 pb-6 last:border-0"
          >
            <div className="flex items-start gap-4">
              {/* User Avatar */}
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-white font-semibold flex-shrink-0">
                {review.user?.full_name?.charAt(0).toUpperCase() || 'U'}
              </div>

              {/* Review Content */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-semibold text-gray-900">
                    {review.user?.full_name || 'Usuario'}
                  </h4>
                  <span className="text-gray-400">•</span>
                  <span className="text-sm text-gray-500">
                    {new Date(review.created_at).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                </div>

                {/* Stars */}
                <div className="flex items-center mb-2">
                  {renderStars(review.rating)}
                </div>

                {/* Title */}
                {review.title && (
                  <h5 className="font-semibold text-gray-800 mb-1">
                    {review.title}
                  </h5>
                )}

                {/* Comment */}
                <p className="text-gray-600 leading-relaxed">
                  {review.comment}
                </p>

                {/* Updated indicator */}
                {review.updated_at !== review.created_at && (
                  <span className="text-xs text-gray-400 mt-2 inline-block">
                    Editado
                  </span>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Load More Button */}
      {hasMore && (
        <div className="text-center pt-4">
          <button
            onClick={() => setOffset(offset + limit)}
            disabled={loading}
            className="px-6 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-full hover:shadow-lg transition-shadow disabled:opacity-50"
          >
            {loading ? 'Cargando...' : 'Ver más reseñas'}
          </button>
        </div>
      )}
    </div>
  );
}

// Helper to render stars
function renderStars(rating: number) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= Math.round(rating);
        return (
          <Star
            key={star}
            className={`w-5 h-5 ${filled ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
          />
        );
      })}
    </div>
  );
}

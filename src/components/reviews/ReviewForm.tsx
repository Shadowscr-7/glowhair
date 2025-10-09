'use client';

import React, { useState } from 'react';
import { reviewsAPI, type CreateReviewData } from '@/lib/api';
import { Star } from 'lucide-react';
import { motion } from 'framer-motion';

interface ReviewFormProps {
  productId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
  existingReview?: {
    id: string;
    rating: number;
    title?: string;
    comment: string;
  };
}

export function ReviewForm({ productId, onSuccess, onCancel, existingReview }: ReviewFormProps) {
  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState(existingReview?.title || '');
  const [comment, setComment] = useState(existingReview?.comment || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEdit = !!existingReview;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (rating === 0) {
      setError('Por favor selecciona una calificación');
      return;
    }

    if (comment.trim().length < 10) {
      setError('El comentario debe tener al menos 10 caracteres');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const data: CreateReviewData = {
        product_id: productId,
        rating,
        title: title.trim() || undefined,
        comment: comment.trim(),
      };

      if (isEdit) {
        await reviewsAPI.update(existingReview.id, data);
      } else {
        await reviewsAPI.create(data);
      }

      onSuccess?.();
      
      // Reset form if creating new
      if (!isEdit) {
        setRating(0);
        setTitle('');
        setComment('');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al enviar reseña');
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-6 rounded-xl shadow-lg border border-gray-100"
    >
      <h3 className="text-xl font-bold mb-4">
        {isEdit ? 'Editar tu reseña' : 'Escribe una reseña'}
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Rating Stars */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Calificación *
          </label>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => {
              const filled = star <= (hoverRating || rating);
              
              return (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-8 h-8 ${
                      filled ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                    }`}
                  />
                </button>
              );
            })}
            {rating > 0 && (
              <span className="ml-2 text-sm text-gray-600">
                {rating === 1 && 'Muy malo'}
                {rating === 2 && 'Malo'}
                {rating === 3 && 'Regular'}
                {rating === 4 && 'Bueno'}
                {rating === 5 && '¡Excelente!'}
              </span>
            )}
          </div>
        </div>

        {/* Title */}
        <div>
          <label htmlFor="review-title" className="block text-sm font-medium text-gray-700 mb-2">
            Título (opcional)
          </label>
          <input
            id="review-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Resume tu experiencia"
            maxLength={100}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
          />
        </div>

        {/* Comment */}
        <div>
          <label htmlFor="review-comment" className="block text-sm font-medium text-gray-700 mb-2">
            Comentario *
          </label>
          <textarea
            id="review-comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Cuéntanos sobre tu experiencia con este producto..."
            rows={5}
            minLength={10}
            maxLength={1000}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 resize-none"
          />
          <div className="flex justify-between mt-1">
            <span className="text-xs text-gray-500">
              Mínimo 10 caracteres
            </span>
            <span className="text-xs text-gray-500">
              {comment.length}/1000
            </span>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading || rating === 0}
            className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600 text-white py-2 px-4 rounded-lg font-semibold hover:shadow-lg transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Enviando...' : isEdit ? 'Actualizar reseña' : 'Publicar reseña'}
          </button>
          
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
          )}
        </div>
      </form>
    </motion.div>
  );
}

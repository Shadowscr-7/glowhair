import { useState, useEffect } from "react";

export const useFavorite = (productId: string | null, isAuthenticated: boolean) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkFavorite = async () => {
      if (!isAuthenticated || !productId) return;
      
      try {
        const response = await fetch('/api/favorites', {
          headers: {
            'x-user-id': '00000000-0000-0000-0000-000000000001', // UUID temporal para desarrollo
          },
        });

        if (!response.ok) return;

        const favorites = await response.json();
        const isFav = favorites.some(
          (fav: { product: { id: string } }) => fav.product.id === productId
        );
        setIsFavorite(isFav);
      } catch (error) {
        console.error('Error checking favorite status:', error);
      }
    };

    checkFavorite();
  }, [isAuthenticated, productId]);

  const toggleFavorite = async () => {
    if (!productId) return;
    
    try {
      setLoading(true);
      
      if (isFavorite) {
        // Remove from favorites
        const response = await fetch(`/api/favorites/${productId}`, {
          method: 'DELETE',
          headers: {
            'x-user-id': '00000000-0000-0000-0000-000000000001', // UUID temporal para desarrollo
          },
        });

        if (!response.ok) throw new Error('Error al eliminar de favoritos');
        
        setIsFavorite(false);
      } else {
        // Add to favorites
        const response = await fetch('/api/favorites', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-user-id': '00000000-0000-0000-0000-000000000001', // UUID temporal para desarrollo
          },
          body: JSON.stringify({ product_id: productId }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Error al agregar a favoritos');
        }
        
        setIsFavorite(true);
      }
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { isFavorite, loading, toggleFavorite };
};

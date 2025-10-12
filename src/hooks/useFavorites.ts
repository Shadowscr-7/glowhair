"use client";

import { useState, useEffect, useCallback } from "react";

interface FavoritesState {
  favorites: Set<string>;
  count: number;
  loading: boolean;
}

let favoritesState: FavoritesState = {
  favorites: new Set<string>(),
  count: 0,
  loading: true,
};

const listeners = new Set<(state: FavoritesState) => void>();

const notifyListeners = () => {
  listeners.forEach(listener => listener(favoritesState));
};

// Fetch favorites from API
const fetchFavorites = async () => {
  try {
    const response = await fetch('/api/favorites', {
      headers: {
        'x-user-id': '00000000-0000-0000-0000-000000000001', // UUID temporal para desarrollo
      },
    });

    if (!response.ok) throw new Error('Error al obtener favoritos');

    const data = await response.json();
    const favoriteIds = new Set<string>(
      data.map((fav: { product: { id: string } }) => fav.product.id)
    );

    favoritesState = {
      favorites: favoriteIds,
      count: favoriteIds.size,
      loading: false,
    };

    notifyListeners();
  } catch (error) {
    console.error('Error fetching favorites:', error);
    favoritesState.loading = false;
    notifyListeners();
  }
};

// Add favorite
const addFavorite = async (productId: string) => {
  try {
    console.log('➕ Agregando a favoritos:', productId);
    
    const requestBody = { product_id: productId };
    console.log('📤 Request body:', requestBody);
    
    const response = await fetch('/api/favorites', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': '00000000-0000-0000-0000-000000000001', // UUID temporal para desarrollo
      },
      body: JSON.stringify(requestBody),
    });

    console.log('📡 Response status:', response.status, response.statusText);
    console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      let errorMessage = 'Error al agregar favorito';
      let errorDetails = '';
      
      // Intentar leer el cuerpo de la respuesta
      const contentType = response.headers.get('content-type');
      console.log('📄 Content-Type:', contentType);
      
      try {
        if (contentType?.includes('application/json')) {
          const error = await response.json();
          console.error('❌ Error del servidor (JSON):', error);
          errorMessage = error.error || error.message || errorMessage;
          errorDetails = JSON.stringify(error);
        } else {
          const errorText = await response.text();
          console.error('❌ Error del servidor (texto):', errorText);
          errorDetails = errorText;
          errorMessage = errorText || `Error ${response.status}: ${response.statusText}`;
        }
      } catch (parseError) {
        console.error('❌ Error al parsear respuesta:', parseError);
        errorMessage = `Error ${response.status}: ${response.statusText}`;
      }
      
      console.error('💥 Error final:', { status: response.status, message: errorMessage, details: errorDetails });
      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log('✅ Favorito agregado:', data);

    // Update local state
    favoritesState.favorites.add(productId);
    favoritesState.count = favoritesState.favorites.size;
    notifyListeners();

    return true;
  } catch (error) {
    console.error('❌ Error adding favorite:', error);
    throw error;
  }
};

// Remove favorite
const removeFavorite = async (productId: string) => {
  try {
    const response = await fetch(`/api/favorites/${productId}`, {
      method: 'DELETE',
      headers: {
        'x-user-id': '00000000-0000-0000-0000-000000000001', // UUID temporal para desarrollo
      },
    });

    if (!response.ok) throw new Error('Error al eliminar favorito');

    // Update local state
    favoritesState.favorites.delete(productId);
    favoritesState.count = favoritesState.favorites.size;
    notifyListeners();

    return true;
  } catch (error) {
    console.error('Error removing favorite:', error);
    throw error;
  }
};

// Toggle favorite
const toggleFavorite = async (productId: string) => {
  const isFavorite = favoritesState.favorites.has(productId);
  
  if (isFavorite) {
    await removeFavorite(productId);
  } else {
    await addFavorite(productId);
  }
};

// Hook
export function useFavorites() {
  const [state, setState] = useState<FavoritesState>(favoritesState);

  useEffect(() => {
    // Subscribe to changes
    const listener = (newState: FavoritesState) => {
      setState({ ...newState });
    };
    listeners.add(listener);

    // Initial fetch if not loaded
    if (favoritesState.loading) {
      fetchFavorites();
    } else {
      setState({ ...favoritesState });
    }

    return () => {
      listeners.delete(listener);
    };
  }, []);

  const isFavorite = useCallback(
    (productId: string) => state.favorites.has(productId),
    [state.favorites]
  );

  const toggle = useCallback(async (productId: string) => {
    await toggleFavorite(productId);
  }, []);

  const refresh = useCallback(async () => {
    await fetchFavorites();
  }, []);

  return {
    favorites: Array.from(state.favorites),
    count: state.count,
    loading: state.loading,
    isFavorite,
    toggle,
    refresh,
  };
}

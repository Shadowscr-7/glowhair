import { supabase } from '../supabase';
import type { Profile, Address, Favorite, Review, ApiResponse } from '@/types';

// ==========================================
// PERFILES DE USUARIO
// ==========================================

export const profileService = {
  // Obtener perfil del usuario
  async getProfile(userId: string): Promise<ApiResponse<Profile>> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;

      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al obtener perfil'
      };
    }
  },

  // Actualizar perfil del usuario
  async updateProfile(userId: string, profileData: Partial<Profile>): Promise<ApiResponse<Profile>> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('id', userId)
        .select('*')
        .single();

      if (error) throw error;

      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al actualizar perfil'
      };
    }
  },

  // Actualizar avatar
  async updateAvatar(userId: string, avatarUrl: string): Promise<ApiResponse<Profile>> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({ avatar_url: avatarUrl })
        .eq('id', userId)
        .select('*')
        .single();

      if (error) throw error;

      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al actualizar avatar'
      };
    }
  }
};

// ==========================================
// DIRECCIONES
// ==========================================

export const addressService = {
  // Obtener direcciones del usuario
  async getUserAddresses(userId: string): Promise<ApiResponse<Address[]>> {
    try {
      const { data, error } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', userId)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;

      return { success: true, data: data || [] };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al obtener direcciones'
      };
    }
  },

  // Crear nueva dirección
  async createAddress(userId: string, addressData: Omit<Address, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<ApiResponse<Address>> {
    try {
      // Si es la dirección predeterminada, desmarcar las demás
      if (addressData.is_default) {
        await supabase
          .from('addresses')
          .update({ is_default: false })
          .eq('user_id', userId);
      }

      const { data, error } = await supabase
        .from('addresses')
        .insert({ ...addressData, user_id: userId })
        .select('*')
        .single();

      if (error) throw error;

      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al crear dirección'
      };
    }
  },

  // Actualizar dirección
  async updateAddress(userId: string, addressId: string, addressData: Partial<Address>): Promise<ApiResponse<Address>> {
    try {
      // Si es la dirección predeterminada, desmarcar las demás
      if (addressData.is_default) {
        await supabase
          .from('addresses')
          .update({ is_default: false })
          .eq('user_id', userId);
      }

      const { data, error } = await supabase
        .from('addresses')
        .update(addressData)
        .eq('id', addressId)
        .eq('user_id', userId)
        .select('*')
        .single();

      if (error) throw error;

      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al actualizar dirección'
      };
    }
  },

  // Eliminar dirección
  async deleteAddress(userId: string, addressId: string): Promise<ApiResponse<void>> {
    try {
      const { error } = await supabase
        .from('addresses')
        .delete()
        .eq('id', addressId)
        .eq('user_id', userId);

      if (error) throw error;

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al eliminar dirección'
      };
    }
  },

  // Establecer dirección predeterminada
  async setDefaultAddress(userId: string, addressId: string): Promise<ApiResponse<Address>> {
    try {
      // Desmarcar todas las direcciones como predeterminadas
      await supabase
        .from('addresses')
        .update({ is_default: false })
        .eq('user_id', userId);

      // Marcar la nueva como predeterminada
      const { data, error } = await supabase
        .from('addresses')
        .update({ is_default: true })
        .eq('id', addressId)
        .eq('user_id', userId)
        .select('*')
        .single();

      if (error) throw error;

      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al establecer dirección predeterminada'
      };
    }
  }
};

// ==========================================
// FAVORITOS
// ==========================================

export const favoriteService = {
  // Obtener favoritos del usuario
  async getUserFavorites(userId: string): Promise<ApiResponse<Favorite[]>> {
    try {
      const { data, error } = await supabase
        .from('favorites')
        .select(`
          *,
          product:products(
            *,
            category:categories(id, name),
            brand:brands(id, name)
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return { success: true, data: data || [] };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al obtener favoritos'
      };
    }
  },

  // Agregar a favoritos
  async addToFavorites(userId: string, productId: string): Promise<ApiResponse<Favorite>> {
    try {
      const { data, error } = await supabase
        .from('favorites')
        .insert({ user_id: userId, product_id: productId })
        .select(`
          *,
          product:products(
            *,
            category:categories(id, name),
            brand:brands(id, name)
          )
        `)
        .single();

      if (error) throw error;

      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al agregar a favoritos'
      };
    }
  },

  // Eliminar de favoritos
  async removeFromFavorites(userId: string, productId: string): Promise<ApiResponse<void>> {
    try {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', userId)
        .eq('product_id', productId);

      if (error) throw error;

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al eliminar de favoritos'
      };
    }
  },

  // Verificar si un producto está en favoritos
  async isFavorite(userId: string, productId: string): Promise<ApiResponse<boolean>> {
    try {
      const { data, error } = await supabase
        .from('favorites')
        .select('id')
        .eq('user_id', userId)
        .eq('product_id', productId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      return { success: true, data: !!data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al verificar favorito'
      };
    }
  }
};

// ==========================================
// RESEÑAS
// ==========================================

export const reviewService = {
  // Obtener reseñas de un producto
  async getProductReviews(productId: string, page = 1, limit = 10): Promise<ApiResponse<{ reviews: Review[], total: number }>> {
    try {
      const offset = (page - 1) * limit;

      const { data, error, count } = await supabase
        .from('reviews')
        .select(`
          *,
          user:profiles(id, full_name, avatar_url)
        `, { count: 'exact' })
        .eq('product_id', productId)
        .eq('is_approved', true)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      return {
        success: true,
        data: {
          reviews: data || [],
          total: count || 0
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al obtener reseñas'
      };
    }
  },

  // Obtener reseñas del usuario
  async getUserReviews(userId: string): Promise<ApiResponse<Review[]>> {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          product:products(id, name, images)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return { success: true, data: data || [] };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al obtener reseñas del usuario'
      };
    }
  },

  // Crear nueva reseña
  async createReview(reviewData: Omit<Review, 'id' | 'created_at' | 'updated_at' | 'is_approved' | 'helpful_count'>): Promise<ApiResponse<Review>> {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .insert({
          ...reviewData,
          is_approved: false, // Requiere aprobación
          helpful_count: 0
        })
        .select('*')
        .single();

      if (error) throw error;

      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al crear reseña'
      };
    }
  },

  // Actualizar reseña
  async updateReview(userId: string, reviewId: string, reviewData: Partial<Review>): Promise<ApiResponse<Review>> {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .update({
          ...reviewData,
          is_approved: false // Vuelve a requerir aprobación
        })
        .eq('id', reviewId)
        .eq('user_id', userId)
        .select('*')
        .single();

      if (error) throw error;

      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al actualizar reseña'
      };
    }
  },

  // Eliminar reseña
  async deleteReview(userId: string, reviewId: string): Promise<ApiResponse<void>> {
    try {
      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', reviewId)
        .eq('user_id', userId);

      if (error) throw error;

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al eliminar reseña'
      };
    }
  },

  // Votar por una reseña útil
  async voteReview(userId: string, reviewId: string, isHelpful: boolean): Promise<ApiResponse<void>> {
    try {
      // Insertar o actualizar voto
      const { error: voteError } = await supabase
        .from('review_votes')
        .upsert({ 
          review_id: reviewId, 
          user_id: userId, 
          is_helpful: isHelpful 
        });

      if (voteError) throw voteError;

      // Actualizar contador de votos útiles
      const { data: votes } = await supabase
        .from('review_votes')
        .select('is_helpful')
        .eq('review_id', reviewId)
        .eq('is_helpful', true);

      const { error: updateError } = await supabase
        .from('reviews')
        .update({ helpful_count: votes?.length || 0 })
        .eq('id', reviewId);

      if (updateError) throw updateError;

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al votar reseña'
      };
    }
  }
};
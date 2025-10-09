import { supabase } from '../supabase';
import type { Order, OrderItem, CartItem, ApiResponse } from '@/types';

// ==========================================
// CARRITO
// ==========================================

export const cartService = {
  // Obtener carrito del usuario
  async getCart(userId: string): Promise<ApiResponse<CartItem[]>> {
    try {
      const { data, error } = await supabase
        .from('cart_items')
        .select(`
          *,
          product:products(*)
        `)
        .eq('user_id', userId);

      if (error) throw error;

      return { success: true, data: data || [] };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al obtener carrito'
      };
    }
  },

  // Agregar producto al carrito
  async addToCart(userId: string, productId: string, quantity: number = 1): Promise<ApiResponse<CartItem>> {
    try {
      // Verificar si el producto ya está en el carrito
      const { data: existing } = await supabase
        .from('cart_items')
        .select('*')
        .eq('user_id', userId)
        .eq('product_id', productId)
        .single();

      if (existing) {
        // Si existe, actualizar cantidad
        const { data, error } = await supabase
          .from('cart_items')
          .update({ quantity: existing.quantity + quantity })
          .eq('id', existing.id)
          .select(`
            *,
            product:products(*)
          `)
          .single();

        if (error) throw error;
        return { success: true, data };
      } else {
        // Si no existe, crear nuevo
        const { data, error } = await supabase
          .from('cart_items')
          .insert({ user_id: userId, product_id: productId, quantity })
          .select(`
            *,
            product:products(*)
          `)
          .single();

        if (error) throw error;
        return { success: true, data };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al agregar al carrito'
      };
    }
  },

  // Actualizar cantidad en carrito
  async updateCartItem(userId: string, itemId: string, quantity: number): Promise<ApiResponse<CartItem>> {
    try {
      if (quantity <= 0) {
        return await this.removeFromCart(userId, itemId);
      }

      const { data, error } = await supabase
        .from('cart_items')
        .update({ quantity })
        .eq('id', itemId)
        .eq('user_id', userId)
        .select(`
          *,
          product:products(*)
        `)
        .single();

      if (error) throw error;

      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al actualizar carrito'
      };
    }
  },

  // Eliminar producto del carrito
  async removeFromCart(userId: string, itemId: string): Promise<ApiResponse<void>> {
    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', itemId)
        .eq('user_id', userId);

      if (error) throw error;

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al eliminar del carrito'
      };
    }
  },

  // Limpiar carrito
  async clearCart(userId: string): Promise<ApiResponse<void>> {
    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', userId);

      if (error) throw error;

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al limpiar carrito'
      };
    }
  }
};

// ==========================================
// PEDIDOS
// ==========================================

export const orderService = {
  // Crear nuevo pedido
  async createOrder(orderData: Partial<Order>): Promise<ApiResponse<Order>> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .insert(orderData)
        .select('*')
        .single();

      if (error) throw error;

      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al crear pedido'
      };
    }
  },

  // Agregar items al pedido
  async addOrderItems(orderId: string, items: Omit<OrderItem, 'id' | 'order_id' | 'created_at'>[]): Promise<ApiResponse<OrderItem[]>> {
    try {
      const orderItems = items.map(item => ({
        ...item,
        order_id: orderId
      }));

      const { data, error } = await supabase
        .from('order_items')
        .insert(orderItems)
        .select('*');

      if (error) throw error;

      return { success: true, data: data || [] };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al agregar items del pedido'
      };
    }
  },

  // Obtener pedidos del usuario
  async getUserOrders(userId: string, page = 1, limit = 10): Promise<ApiResponse<{ orders: Order[], total: number }>> {
    try {
      const offset = (page - 1) * limit;

      const { data, error, count } = await supabase
        .from('orders')
        .select(`
          *,
          items:order_items(
            *,
            product:products(id, name, images)
          )
        `, { count: 'exact' })
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      return {
        success: true,
        data: {
          orders: data || [],
          total: count || 0
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al obtener pedidos'
      };
    }
  },

  // Obtener pedido por ID
  async getOrderById(orderId: string, userId?: string): Promise<ApiResponse<Order>> {
    try {
      let query = supabase
        .from('orders')
        .select(`
          *,
          items:order_items(
            *,
            product:products(id, name, images)
          ),
          status_history:order_status_history(*)
        `)
        .eq('id', orderId);

      if (userId) {
        query = query.eq('user_id', userId);
      }

      const { data, error } = await query.single();

      if (error) throw error;

      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Pedido no encontrado'
      };
    }
  },

  // Actualizar estado del pedido
  async updateOrderStatus(orderId: string, status: string, notes?: string, updatedBy?: string): Promise<ApiResponse<Order>> {
    try {
      // Actualizar el pedido
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .update({ 
          status,
          ...(status === 'shipped' && { shipped_at: new Date().toISOString() }),
          ...(status === 'delivered' && { delivered_at: new Date().toISOString() }),
          ...(status === 'cancelled' && { cancelled_at: new Date().toISOString() })
        })
        .eq('id', orderId)
        .select('*')
        .single();

      if (orderError) throw orderError;

      // Agregar al historial de estados
      const { error: historyError } = await supabase
        .from('order_status_history')
        .insert({
          order_id: orderId,
          status,
          notes,
          created_by: updatedBy
        });

      if (historyError) throw historyError;

      return { success: true, data: order };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al actualizar pedido'
      };
    }
  },

  // Cancelar pedido
  async cancelOrder(orderId: string, userId: string, reason?: string): Promise<ApiResponse<Order>> {
    try {
      return await this.updateOrderStatus(orderId, 'cancelled', reason, userId);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al cancelar pedido'
      };
    }
  }
};
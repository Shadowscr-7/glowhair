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
  async updateCartItem(userId: string, itemId: string, quantity: number): Promise<ApiResponse<CartItem | null>> {
    try {
      if (quantity <= 0) {
        // Si la cantidad es 0 o menor, eliminar el item
        const { error } = await supabase
          .from('cart_items')
          .delete()
          .eq('id', itemId)
          .eq('user_id', userId);

        if (error) throw error;

        return { success: true, data: null };
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

export interface CreateOrderData {
  user_id: string;
  total: number;
  subtotal: number;
  tax: number;
  shipping: number;
  status?: string;
  payment_method: string;
  payment_status?: string;
  shipping_address: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  items: Array<{
    product_id: string;
    quantity: number;
    price: number;
    product_name?: string;
    product_image?: string;
  }>;
}

export const orderService = {
  // Crear nuevo pedido con items
  async createOrder(orderData: CreateOrderData): Promise<ApiResponse<Order>> {
    try {
      console.log('🔵 orderService.createOrder - Inicio', orderData);

      // 1. Crear la orden principal
      const { data: order, error: orderError } = await supabase
        .from('glowhair_orders')
        .insert({
          user_id: orderData.user_id,
          total: orderData.total,
          subtotal: orderData.subtotal,
          tax_amount: orderData.tax,
          shipping_amount: orderData.shipping,
          status: orderData.status || 'pending',
          payment_method: orderData.payment_method,
          payment_status: orderData.payment_status || 'pending',
          shipping_address: orderData.shipping_address,
        })
        .select()
        .single();

      if (orderError) {
        console.error('❌ Error al crear orden:', orderError);
        return {
          success: false,
          error: orderError.message,
        };
      }

      console.log('✅ Orden creada:', order.id);

      // 2. Crear los items de la orden
      const orderItems = orderData.items.map(item => ({
        order_id: order.id,
        product_id: item.product_id,
        product_name: item.product_name,
        product_image: item.product_image || null,
        quantity: item.quantity,
        unit_price: item.price,
        total_price: item.price * item.quantity,
      }));

      const { error: itemsError } = await supabase
        .from('glowhair_order_items')
        .insert(orderItems);

      if (itemsError) {
        console.error('❌ Error al crear items de orden:', itemsError);
        // Intentar eliminar la orden si falla la creación de items
        await supabase.from('glowhair_orders').delete().eq('id', order.id);
        return {
          success: false,
          error: 'Error al crear items de la orden',
        };
      }

      console.log('✅ Items de orden creados');

      return {
        success: true,
        data: order,
      };
    } catch (error) {
      console.error('❌ Error en createOrder:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
      };
    }
  },

  // Agregar items al pedido (método legacy - mantener por compatibilidad)
  async addOrderItems(orderId: string, items: Omit<OrderItem, 'id' | 'order_id' | 'created_at'>[]): Promise<ApiResponse<OrderItem[]>> {
    try {
      const orderItems = items.map(item => ({
        ...item,
        order_id: orderId
      }));

      const { data, error } = await supabase
        .from('glowhair_order_items')
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
      console.log('🔵 getUserOrders - Inicio', { userId, page, limit });
      
      const offset = (page - 1) * limit;

      const { data, error, count } = await supabase
        .from('glowhair_orders')
        .select(`
          *,
          items:glowhair_order_items(
            *,
            product:glowhair_products(id, name, images)
          )
        `, { count: 'exact' })
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        console.error('❌ Error en getUserOrders:', error);
        throw error;
      }

      console.log('✅ getUserOrders - Éxito', { ordersCount: data?.length, total: count });

      return {
        success: true,
        data: {
          orders: data || [],
          total: count || 0
        }
      };
    } catch (error) {
      console.error('❌ Exception en getUserOrders:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al obtener pedidos'
      };
    }
  },

  // Obtener todas las órdenes (admin)
  async getAllOrders(filters?: {
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<{ orders: Order[]; total: number }>> {
    try {
      console.log('🔵 getAllOrders - Inicio', filters);
      
      let query = supabase
        .from('glowhair_orders')
        .select(`
          *,
          items:glowhair_order_items(
            *,
            product:glowhair_products(id, name, images)
          )
        `, { count: 'exact' });

      // Filtros
      if (filters?.status) {
        console.log('🔍 Filtrando por status:', filters.status);
        query = query.eq('status', filters.status);
      }

      // Orden
      query = query.order('created_at', { ascending: false });

      // Paginación
      const page = filters?.page || 1;
      const limit = filters?.limit || 20;
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      console.log('📄 Paginación:', { page, limit, from, to });
      query = query.range(from, to);

      const { data: orders, error, count } = await query;
      
      console.log('📊 Query result:', { 
        ordersCount: orders?.length, 
        totalCount: count, 
        hasError: !!error,
        errorMessage: error?.message 
      });

      if (error) {
        console.error('❌ Error al obtener todas las órdenes:', error);
        return {
          success: false,
          error: error.message,
        };
      }

      return {
        success: true,
        data: {
          orders: orders || [],
          total: count || 0,
        },
      };
    } catch (error) {
      console.error('❌ Error en getAllOrders:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
      };
    }
  },

  // Obtener pedido por ID
  async getOrderById(orderId: string, userId?: string): Promise<ApiResponse<Order>> {
    try {
      console.log('🔵 getOrderById - Inicio', { orderId, userId });
      
      let query = supabase
        .from('glowhair_orders')
        .select(`
          *,
          items:glowhair_order_items(
            *,
            product:glowhair_products(id, name, images)
          )
        `)
        .eq('id', orderId);

      if (userId) {
        console.log('🔒 Filtrando por userId:', userId);
        query = query.eq('user_id', userId);
      }

      const { data, error } = await query.single();

      if (error) {
        console.error('❌ Error en getOrderById:', error);
        throw error;
      }

      console.log('✅ getOrderById - Éxito', { hasData: !!data, hasItems: !!data?.items?.length });

      return { success: true, data };
    } catch (error) {
      console.error('❌ Exception en getOrderById:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Pedido no encontrado'
      };
    }
  },

  // Actualizar estado del pedido
  async updateOrderStatus(orderId: string, status: string, paymentStatus?: string): Promise<ApiResponse<Order>> {
    try {
      const updateData: Record<string, unknown> = { 
        status,
        updated_at: new Date().toISOString(),
      };

      if (paymentStatus) {
        updateData.payment_status = paymentStatus;
      }

      // Actualizar el pedido
      const { data: order, error: orderError } = await supabase
        .from('glowhair_orders')
        .update(updateData)
        .eq('id', orderId)
        .select('*')
        .single();

      if (orderError) throw orderError;

      return { success: true, data: order };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al actualizar pedido'
      };
    }
  },

  // Cancelar pedido
  async cancelOrder(orderId: string, _userId: string, _reason?: string): Promise<ApiResponse<Order>> {
    try {
      return await this.updateOrderStatus(orderId, 'cancelled');
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al cancelar pedido'
      };
    }
  }
};
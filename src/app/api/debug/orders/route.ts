import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * Endpoint temporal para debuggear órdenes
 * GET /api/debug/orders
 */
export async function GET() {
  try {
    console.log('🔍 DEBUG: Verificando órdenes en Supabase');
    
    // 1. Count total de órdenes
    const { count: totalCount, error: countError } = await supabase
      .from('glowhair_orders')
      .select('*', { count: 'exact', head: true });
    
    console.log('📊 Total órdenes:', totalCount, 'Error:', countError);
    
    // 2. Obtener todas las órdenes sin filtro
    const { data: allOrders, error: allError } = await supabase
      .from('glowhair_orders')
      .select('id, user_id, status, total, created_at')
      .order('created_at', { ascending: false });
    
    console.log('📦 Órdenes obtenidas:', allOrders?.length, 'Error:', allError);
    
    // 3. Obtener órdenes con items
    const { data: ordersWithItems, error: joinError } = await supabase
      .from('glowhair_orders')
      .select(`
        *,
        items:glowhair_order_items(
          *,
          product:glowhair_products(id, name, images)
        )
      `)
      .order('created_at', { ascending: false })
      .limit(10);
    
    console.log('📊 Órdenes con items:', ordersWithItems?.length, 'Error:', joinError);
    
    // 4. Verificar items directamente
    const { data: items, error: itemsError, count: itemsCount } = await supabase
      .from('glowhair_order_items')
      .select('*', { count: 'exact' });
    
    console.log('🛍️ Items en DB:', itemsCount, 'Error:', itemsError);
    
    return NextResponse.json({
      success: true,
      debug: {
        totalOrders: totalCount,
        ordersRetrieved: allOrders?.length || 0,
        ordersWithItemsRetrieved: ordersWithItems?.length || 0,
        totalItems: itemsCount,
        errors: {
          count: countError?.message,
          allOrders: allError?.message,
          joinOrders: joinError?.message,
          items: itemsError?.message,
        },
      },
      orders: allOrders?.map(o => ({
        id: o.id.slice(0, 8),
        user_id: o.user_id,
        status: o.status,
        total: o.total,
        created_at: o.created_at,
      })),
      ordersWithItems: ordersWithItems?.map(o => ({
        id: o.id.slice(0, 8),
        status: o.status,
        total: o.total,
        itemsCount: o.items?.length || 0,
        items: o.items?.map((item: { product_name?: string; quantity: number; unit_price: number }) => ({
          name: item.product_name,
          quantity: item.quantity,
          price: item.unit_price,
        })),
      })),
      sampleItems: items?.slice(0, 5).map((item: {
        order_id: string; product_id: string; quantity: number; unit_price: number;
      }) => ({
        order_id: item.order_id.slice(0, 8),
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.unit_price,
      })),
    });
  } catch (error) {
    console.error('❌ Error en debug endpoint:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    }, { status: 500 });
  }
}

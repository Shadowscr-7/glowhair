import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * GET /api/orders/stats
 * Obtener estadísticas de órdenes (admin)
 */
export async function GET() {
  try {
    // const isAdmin = request.headers.get('x-is-admin') === 'true';

    // TODO: Implementar validación real de admin
    // if (!isAdmin) {
    //   return NextResponse.json(
    //     { error: 'No autorizado' },
    //     { status: 403 }
    //   );
    // }

    // Obtener todas las órdenes
    const { data: orders, error } = await supabase
      .from('orders')
      .select('id, status, total, created_at');

    if (error) throw error;

    // Calcular estadísticas
    const totalOrders = orders?.length || 0;
    const totalRevenue = orders?.reduce((sum, order) => sum + order.total, 0) || 0;

    const ordersByStatus = {
      pending: orders?.filter(o => o.status === 'pending').length || 0,
      processing: orders?.filter(o => o.status === 'processing').length || 0,
      shipped: orders?.filter(o => o.status === 'shipped').length || 0,
      delivered: orders?.filter(o => o.status === 'delivered').length || 0,
      cancelled: orders?.filter(o => o.status === 'cancelled').length || 0
    };

    // Órdenes por mes (últimos 6 meses)
    const now = new Date();
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, 1);
    
    const ordersByMonth: Record<string, { count: number; revenue: number }> = {};
    
    orders?.forEach(order => {
      const orderDate = new Date(order.created_at);
      if (orderDate >= sixMonthsAgo) {
        const monthKey = `${orderDate.getFullYear()}-${String(orderDate.getMonth() + 1).padStart(2, '0')}`;
        if (!ordersByMonth[monthKey]) {
          ordersByMonth[monthKey] = { count: 0, revenue: 0 };
        }
        ordersByMonth[monthKey].count++;
        ordersByMonth[monthKey].revenue += order.total;
      }
    });

    // Promedio de orden
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    return NextResponse.json({
      totalOrders,
      totalRevenue: parseFloat(totalRevenue.toFixed(2)),
      averageOrderValue: parseFloat(averageOrderValue.toFixed(2)),
      ordersByStatus,
      ordersByMonth,
      successRate: totalOrders > 0 
        ? parseFloat(((ordersByStatus.delivered / totalOrders) * 100).toFixed(2))
        : 0
    });
  } catch (error) {
    console.error('Error in GET /api/orders/stats:', error);
    return NextResponse.json(
      { error: 'Error al obtener estadísticas' },
      { status: 500 }
    );
  }
}

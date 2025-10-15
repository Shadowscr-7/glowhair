import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * GET /api/orders/stats
 * Obtener estadísticas de órdenes (admin)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');

    console.log('🔵 GET /api/orders/stats - Inicio', { startDate, endDate });

    // Query base para obtener todas las órdenes
    let query = supabase
      .from('glowhair_orders')
      .select('id, user_id, status, total, created_at');

    // Aplicar filtros de fecha si existen
    if (startDate) {
      const startDateTime = new Date(startDate + 'T00:00:00');
      query = query.gte('created_at', startDateTime.toISOString());
      console.log('📅 Start filter:', startDateTime.toISOString());
    }
    if (endDate) {
      // Incluir todo el día del endDate
      const endDateTime = new Date(endDate + 'T23:59:59');
      query = query.lte('created_at', endDateTime.toISOString());
      console.log('📅 End filter:', endDateTime.toISOString());
    }

    const { data: orders, error } = await query;

    if (error) {
      console.error('❌ Error en stats:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    if (!orders || orders.length === 0) {
      return NextResponse.json({
        totalOrders: 0,
        totalRevenue: 0,
        uniqueCustomers: 0,
        completionRate: 0,
        averageOrderValue: 0,
        salesByDate: [],
        ordersByDate: [],
        ordersByStatus: {
          pending: 0,
          processing: 0,
          shipped: 0,
          delivered: 0,
          cancelled: 0,
        },
      });
    }

    // Calcular estadísticas generales
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);
    const uniqueCustomers = new Set(orders.map(order => order.user_id)).size;
    const completedOrders = orders.filter(order => order.status === 'delivered').length;
    const completionRate = totalOrders > 0 ? (completedOrders / totalOrders) * 100 : 0;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Agrupar por fecha para gráficas
    const salesByDate: { [key: string]: number } = {};
    const ordersByDate: { [key: string]: { total: number; completed: number; cancelled: number } } = {};

    orders.forEach(order => {
      const date = new Date(order.created_at).toISOString().split('T')[0];
      
      // Sales by date
      if (!salesByDate[date]) {
        salesByDate[date] = 0;
      }
      salesByDate[date] += order.total || 0;

      // Orders by date
      if (!ordersByDate[date]) {
        ordersByDate[date] = { total: 0, completed: 0, cancelled: 0 };
      }
      ordersByDate[date].total += 1;
      if (order.status === 'delivered') {
        ordersByDate[date].completed += 1;
      } else if (order.status === 'cancelled') {
        ordersByDate[date].cancelled += 1;
      }
    });

    // Convertir a arrays para las gráficas
    const salesData = Object.entries(salesByDate)
      .map(([date, sales]) => ({
        date,
        sales: Number(sales.toFixed(2)),
        orders: ordersByDate[date]?.total || 0,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    const ordersChartData = Object.entries(ordersByDate)
      .map(([date, counts]) => ({
        date,
        orders: counts.total,
        completed: counts.completed,
        cancelled: counts.cancelled,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Órdenes por estado
    const ordersByStatus = {
      pending: orders.filter(o => o.status === 'pending').length,
      processing: orders.filter(o => o.status === 'processing').length,
      shipped: orders.filter(o => o.status === 'shipped').length,
      delivered: orders.filter(o => o.status === 'delivered').length,
      cancelled: orders.filter(o => o.status === 'cancelled').length,
    };

    console.log('✅ Stats calculadas:', {
      totalOrders,
      totalRevenue,
      uniqueCustomers,
      completionRate,
    });

    return NextResponse.json({
      totalOrders,
      totalRevenue: parseFloat(totalRevenue.toFixed(2)),
      uniqueCustomers,
      completionRate: parseFloat(completionRate.toFixed(2)),
      averageOrderValue: parseFloat(averageOrderValue.toFixed(2)),
      salesByDate: salesData,
      ordersByDate: ordersChartData,
      ordersByStatus,
    });
  } catch (error) {
    console.error('❌ Error en GET /api/orders/stats:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error desconocido' },
      { status: 500 }
    );
  }
}

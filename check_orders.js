// Script rápido para verificar órdenes en Supabase
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables de entorno no configuradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkOrders() {
  console.log('🔍 Verificando órdenes en Supabase...\n');
  
  try {
    // 1. Verificar tabla glowhair_orders
    const { data: orders, error: ordersError, count } = await supabase
      .from('glowhair_orders')
      .select('*', { count: 'exact' });
    
    if (ordersError) {
      console.error('❌ Error al consultar órdenes:', ordersError);
      return;
    }
    
    console.log(`✅ Total de órdenes en glowhair_orders: ${count}`);
    
    if (orders && orders.length > 0) {
      console.log('\n📦 Órdenes encontradas:');
      orders.forEach((order, i) => {
        console.log(`\n${i + 1}. Orden ${order.id.slice(0, 8)}`);
        console.log(`   - Usuario: ${order.user_id}`);
        console.log(`   - Total: $${order.total}`);
        console.log(`   - Estado: ${order.status}`);
        console.log(`   - Fecha: ${new Date(order.created_at).toLocaleString('es-ES')}`);
      });
    }
    
    // 2. Verificar tabla glowhair_order_items
    const { data: items, error: itemsError, count: itemsCount } = await supabase
      .from('glowhair_order_items')
      .select('*', { count: 'exact' });
    
    if (itemsError) {
      console.error('\n❌ Error al consultar items:', itemsError);
      return;
    }
    
    console.log(`\n✅ Total de items en glowhair_order_items: ${itemsCount}`);
    
    // 3. Verificar órdenes con sus items
    const { data: ordersWithItems, error: joinError } = await supabase
      .from('glowhair_orders')
      .select(`
        *,
        items:glowhair_order_items(
          *,
          product:glowhair_products(id, name, images)
        )
      `);
    
    if (joinError) {
      console.error('\n❌ Error al hacer JOIN:', joinError);
      return;
    }
    
    console.log(`\n✅ Órdenes con items cargadas: ${ordersWithItems?.length || 0}`);
    
    if (ordersWithItems && ordersWithItems.length > 0) {
      console.log('\n📊 Detalle de órdenes con items:');
      ordersWithItems.forEach((order, i) => {
        console.log(`\n${i + 1}. Orden ${order.id.slice(0, 8)}`);
        console.log(`   - Items: ${order.items?.length || 0}`);
        if (order.items && order.items.length > 0) {
          order.items.forEach((item, j) => {
            console.log(`     ${j + 1}. ${item.product_name || 'Sin nombre'} x${item.quantity} ($${item.unit_price})`);
          });
        }
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkOrders();

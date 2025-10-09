-- ==========================================
-- SCRIPT PRINCIPAL - VERSIÓN SEGURA
-- ==========================================
-- Este script puede ejecutarse múltiples veces sin errores

-- ==========================================
-- PRODUCTOS Y CATEGORÍAS
-- ==========================================

-- Tabla de categorías
CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de marcas
CREATE TABLE IF NOT EXISTS brands (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  logo_url TEXT,
  website_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de productos (actualizada)
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE,
  description TEXT,
  short_description TEXT,
  price DECIMAL(10,2) NOT NULL,
  original_price DECIMAL(10,2),
  cost_price DECIMAL(10,2),
  category_id UUID REFERENCES categories(id),
  brand_id UUID REFERENCES brands(id),
  sku VARCHAR(100) UNIQUE,
  barcode VARCHAR(100),
  weight DECIMAL(8,3),
  dimensions JSONB, -- {length, width, height}
  images JSONB DEFAULT '[]', -- Array de URLs de imágenes
  rating DECIMAL(2,1) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  is_new BOOLEAN DEFAULT false,
  is_on_sale BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  stock INTEGER DEFAULT 0,
  min_stock INTEGER DEFAULT 5,
  max_stock INTEGER DEFAULT 1000,
  ingredients TEXT[],
  hair_types TEXT[],
  usage_instructions TEXT,
  benefits TEXT[],
  seo_title VARCHAR(255),
  seo_description TEXT,
  seo_keywords TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- USUARIOS Y PERFILES
-- ==========================================

-- Tabla de perfiles de usuario (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  email VARCHAR(255),
  full_name VARCHAR(255),
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  phone VARCHAR(20),
  avatar_url TEXT,
  date_of_birth DATE,
  gender VARCHAR(20),
  hair_type VARCHAR(50),
  skin_type VARCHAR(50),
  preferences JSONB DEFAULT '{}',
  is_verified BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Agregar columnas faltantes si no existen
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'customer';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS admin_permissions JSONB DEFAULT '{}';

-- Tabla de direcciones
CREATE TABLE IF NOT EXISTS addresses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  type VARCHAR(50) DEFAULT 'shipping', -- shipping, billing
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  company VARCHAR(255),
  address_line1 VARCHAR(255) NOT NULL,
  address_line2 VARCHAR(255),
  city VARCHAR(100) NOT NULL,
  state VARCHAR(100) NOT NULL,
  postal_code VARCHAR(20) NOT NULL,
  country VARCHAR(100) NOT NULL DEFAULT 'México',
  phone VARCHAR(20),
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de carrito
CREATE TABLE IF NOT EXISTS cart_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  product_id UUID REFERENCES products(id),
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- ==========================================
-- CUPONES Y DESCUENTOS
-- ==========================================

-- Tabla de cupones
CREATE TABLE IF NOT EXISTS coupons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(255),
  description TEXT,
  type VARCHAR(50) NOT NULL, -- percentage, fixed_amount, free_shipping
  value DECIMAL(10,2), -- porcentaje o cantidad fija
  min_order_amount DECIMAL(10,2) DEFAULT 0,
  max_discount_amount DECIMAL(10,2),
  usage_limit INTEGER,
  usage_limit_per_user INTEGER DEFAULT 1,
  used_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  starts_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  applicable_products UUID[] DEFAULT '{}', -- Array de product IDs
  applicable_categories UUID[] DEFAULT '{}', -- Array de category IDs
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de uso de cupones
CREATE TABLE IF NOT EXISTS coupon_usage (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  coupon_id UUID REFERENCES coupons(id),
  user_id UUID REFERENCES auth.users,
  order_id UUID,
  discount_amount DECIMAL(10,2),
  used_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- PEDIDOS Y TRANSACCIONES
-- ==========================================

-- Tabla de pedidos (actualizada)
CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_number VARCHAR(50) UNIQUE,
  user_id UUID REFERENCES auth.users,
  status VARCHAR(50) DEFAULT 'pending', -- pending, processing, shipped, delivered, cancelled, refunded
  payment_status VARCHAR(50) DEFAULT 'pending', -- pending, paid, failed, refunded
  subtotal DECIMAL(10,2) NOT NULL,
  tax_amount DECIMAL(10,2) DEFAULT 0,
  shipping_amount DECIMAL(10,2) DEFAULT 0,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'MXN',
  
  -- Información de envío
  shipping_address JSONB NOT NULL,
  billing_address JSONB,
  shipping_method VARCHAR(100),
  tracking_number VARCHAR(255),
  
  -- Información de pago
  payment_method VARCHAR(50), -- card, paypal, oxxo, transfer
  payment_provider VARCHAR(50), -- stripe, paypal, mercadopago
  payment_provider_id VARCHAR(255),
  
  -- Cupones aplicados
  coupon_code VARCHAR(50),
  coupon_discount DECIMAL(10,2) DEFAULT 0,
  
  -- Fechas importantes
  ordered_at TIMESTAMPTZ DEFAULT NOW(),
  shipped_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  
  -- Notas
  customer_notes TEXT,
  admin_notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de items del pedido (actualizada)
CREATE TABLE IF NOT EXISTS order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  product_name VARCHAR(255) NOT NULL, -- snapshot del nombre
  product_image TEXT, -- snapshot de la imagen
  sku VARCHAR(100), -- snapshot del SKU
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de estados del pedido
CREATE TABLE IF NOT EXISTS order_status_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  status VARCHAR(50) NOT NULL,
  notes TEXT,
  created_by UUID REFERENCES auth.users, -- admin que cambió el estado
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de favoritos
CREATE TABLE IF NOT EXISTS favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- ==========================================
-- RESEÑAS Y VALORACIONES
-- ==========================================

-- Tabla de reseñas
CREATE TABLE IF NOT EXISTS reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id), -- para verificar compra
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title VARCHAR(255),
  comment TEXT,
  images TEXT[] DEFAULT '{}',
  is_verified BOOLEAN DEFAULT false, -- compra verificada
  is_approved BOOLEAN DEFAULT false, -- aprobada por admin
  helpful_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, product_id) -- un usuario solo puede reseñar un producto una vez
);

-- Tabla de votos útiles en reseñas
CREATE TABLE IF NOT EXISTS review_votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  review_id UUID REFERENCES reviews(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users,
  is_helpful BOOLEAN NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(review_id, user_id)
);

-- ==========================================
-- INVENTARIO Y STOCK
-- ==========================================

-- Tabla de movimientos de inventario
CREATE TABLE IF NOT EXISTS inventory_movements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES products(id),
  type VARCHAR(50) NOT NULL, -- in, out, adjustment, reserved, released
  quantity INTEGER NOT NULL, -- positivo para entrada, negativo para salida
  reason VARCHAR(255), -- purchase, sale, adjustment, damaged, expired
  reference_id UUID, -- order_id, purchase_id, etc.
  notes TEXT,
  created_by UUID REFERENCES auth.users,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- NOTIFICACIONES
-- ==========================================

-- Tabla de notificaciones
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  type VARCHAR(50) NOT NULL, -- order_status, stock_alert, promotion, system
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  data JSONB DEFAULT '{}', -- datos adicionales
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- CONFIGURACIÓN Y ADMIN
-- ==========================================

-- Tabla de configuraciones del sitio
CREATE TABLE IF NOT EXISTS site_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key VARCHAR(255) UNIQUE NOT NULL,
  value JSONB,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de usuarios admin
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users UNIQUE,
  role VARCHAR(50) DEFAULT 'admin', -- admin, super_admin, moderator
  permissions JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- NEWSLETTER Y MARKETING
-- ==========================================

-- Tabla de suscriptores al newsletter
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255),
  is_active BOOLEAN DEFAULT true,
  subscribed_at TIMESTAMPTZ DEFAULT NOW(),
  unsubscribed_at TIMESTAMPTZ,
  preferences JSONB DEFAULT '{}'
);

-- Tabla de campañas de email
CREATE TABLE IF NOT EXISTS email_campaigns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  subject VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'draft', -- draft, scheduled, sent
  scheduled_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  recipient_count INTEGER DEFAULT 0,
  open_count INTEGER DEFAULT 0,
  click_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- DATOS DE EJEMPLO (SOLO SI NO EXISTEN)
-- ==========================================

-- Insertar categorías solo si no existen
INSERT INTO categories (name, description, display_order) 
SELECT 'Limpieza', 'Shampoos y productos de limpieza capilar', 1
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Limpieza');

INSERT INTO categories (name, description, display_order) 
SELECT 'Tratamiento', 'Mascarillas, acondicionadores y tratamientos intensivos', 2
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Tratamiento');

INSERT INTO categories (name, description, display_order) 
SELECT 'Estilizado', 'Productos para peinar y dar forma al cabello', 3
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Estilizado');

INSERT INTO categories (name, description, display_order) 
SELECT 'Protección', 'Protectores térmicos y solares', 4
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Protección');

INSERT INTO categories (name, description, display_order) 
SELECT 'Coloración', 'Tintes y productos para el color del cabello', 5
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Coloración');

INSERT INTO categories (name, description, display_order) 
SELECT 'Herramientas', 'Cepillos, peines y herramientas de peinado', 6
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Herramientas');

-- Insertar marcas solo si no existen
INSERT INTO brands (name, description) 
SELECT 'GlowHair', 'Marca premium de productos capilares naturales'
WHERE NOT EXISTS (SELECT 1 FROM brands WHERE name = 'GlowHair');

INSERT INTO brands (name, description) 
SELECT 'Deluxe Liss', 'Especialistas en alisado y tratamientos de keratina'
WHERE NOT EXISTS (SELECT 1 FROM brands WHERE name = 'Deluxe Liss');

INSERT INTO brands (name, description) 
SELECT 'Natural Care', 'Productos 100% naturales y orgánicos'
WHERE NOT EXISTS (SELECT 1 FROM brands WHERE name = 'Natural Care');

INSERT INTO brands (name, description) 
SELECT 'ProStyle', 'Herramientas profesionales de peluquería'
WHERE NOT EXISTS (SELECT 1 FROM brands WHERE name = 'ProStyle');

-- ==========================================
-- ROW LEVEL SECURITY
-- ==========================================

-- Habilitar RLS en todas las tablas
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupon_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- POLÍTICAS DE SEGURIDAD (CREAR O REEMPLAZAR)
-- ==========================================

-- Eliminar políticas existentes si existen
DROP POLICY IF EXISTS "Public categories are viewable by everyone" ON categories;
DROP POLICY IF EXISTS "Public brands are viewable by everyone" ON brands;
DROP POLICY IF EXISTS "Public products are viewable by everyone" ON products;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can manage own addresses" ON addresses;
DROP POLICY IF EXISTS "Users can manage their own cart" ON cart_items;
DROP POLICY IF EXISTS "Users can view own orders" ON orders;
DROP POLICY IF EXISTS "Users can create own orders" ON orders;
DROP POLICY IF EXISTS "Users can update own orders" ON orders;
DROP POLICY IF EXISTS "Users can view own order items" ON order_items;
DROP POLICY IF EXISTS "Users can manage their own favorites" ON favorites;
DROP POLICY IF EXISTS "Anyone can view approved reviews" ON reviews;
DROP POLICY IF EXISTS "Users can manage own reviews" ON reviews;
DROP POLICY IF EXISTS "Users can vote on reviews" ON review_votes;
DROP POLICY IF EXISTS "Public coupons are viewable" ON coupons;
DROP POLICY IF EXISTS "Users can view own coupon usage" ON coupon_usage;
DROP POLICY IF EXISTS "Users can insert own coupon usage" ON coupon_usage;
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
DROP POLICY IF EXISTS "Anyone can subscribe to newsletter" ON newsletter_subscribers;
DROP POLICY IF EXISTS "Users can view own subscription" ON newsletter_subscribers;

-- Crear nuevas políticas
CREATE POLICY "Public categories are viewable by everyone" ON categories FOR SELECT USING (is_active = true);
CREATE POLICY "Public brands are viewable by everyone" ON brands FOR SELECT USING (is_active = true);
CREATE POLICY "Public products are viewable by everyone" ON products FOR SELECT USING (is_active = true);

-- Perfiles
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Direcciones
CREATE POLICY "Users can manage own addresses" ON addresses FOR ALL USING (auth.uid() = user_id);

-- Carrito
CREATE POLICY "Users can manage their own cart" ON cart_items FOR ALL USING (auth.uid() = user_id);

-- Pedidos
CREATE POLICY "Users can view own orders" ON orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own orders" ON orders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own orders" ON orders FOR UPDATE USING (auth.uid() = user_id AND status IN ('pending', 'processing'));

-- Items de pedido
CREATE POLICY "Users can view own order items" ON order_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid())
);

-- Favoritos
CREATE POLICY "Users can manage their own favorites" ON favorites FOR ALL USING (auth.uid() = user_id);

-- Reseñas
CREATE POLICY "Anyone can view approved reviews" ON reviews FOR SELECT USING (is_approved = true);
CREATE POLICY "Users can manage own reviews" ON reviews FOR ALL USING (auth.uid() = user_id);

-- Votos de reseñas
CREATE POLICY "Users can vote on reviews" ON review_votes FOR ALL USING (auth.uid() = user_id);

-- Cupones
CREATE POLICY "Public coupons are viewable" ON coupons FOR SELECT USING (is_active = true AND (starts_at IS NULL OR starts_at <= NOW()) AND (expires_at IS NULL OR expires_at >= NOW()));

-- Uso de cupones
CREATE POLICY "Users can view own coupon usage" ON coupon_usage FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own coupon usage" ON coupon_usage FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Notificaciones
CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE USING (auth.uid() = user_id);

-- Newsletter
CREATE POLICY "Anyone can subscribe to newsletter" ON newsletter_subscribers FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can view own subscription" ON newsletter_subscribers FOR SELECT USING (
  auth.uid() IS NOT NULL AND email IN (SELECT email FROM profiles WHERE id = auth.uid())
);

-- ==========================================
-- FUNCIONES Y TRIGGERS (CREAR O REEMPLAZAR)
-- ==========================================

-- Función para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Función para crear perfil automáticamente
CREATE OR REPLACE FUNCTION create_user_profile()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, role)
  VALUES (
    NEW.id, 
    NEW.email, 
    NEW.raw_user_meta_data->>'full_name',
    'customer'
  );
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Eliminar triggers existentes si existen
DROP TRIGGER IF EXISTS create_profile_trigger ON auth.users;
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
DROP TRIGGER IF EXISTS update_categories_updated_at ON categories;
DROP TRIGGER IF EXISTS update_brands_updated_at ON brands;
DROP TRIGGER IF EXISTS update_products_updated_at ON products;
DROP TRIGGER IF EXISTS update_addresses_updated_at ON addresses;
DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
DROP TRIGGER IF EXISTS update_reviews_updated_at ON reviews;
DROP TRIGGER IF EXISTS update_coupons_updated_at ON coupons;

-- Crear triggers
CREATE TRIGGER create_profile_trigger AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION create_user_profile();
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_brands_updated_at BEFORE UPDATE ON brands FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_addresses_updated_at BEFORE UPDATE ON addresses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_coupons_updated_at BEFORE UPDATE ON coupons FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==========================================
-- CONFIGURACIONES INICIALES
-- ==========================================

-- Insertar configuraciones del sitio solo si no existen
INSERT INTO site_settings (key, value, description) 
SELECT 'site_name', '"GlowHair"', 'Nombre del sitio web'
WHERE NOT EXISTS (SELECT 1 FROM site_settings WHERE key = 'site_name');

INSERT INTO site_settings (key, value, description) 
SELECT 'site_description', '"Productos premium para el cuidado capilar"', 'Descripción del sitio'
WHERE NOT EXISTS (SELECT 1 FROM site_settings WHERE key = 'site_description');

INSERT INTO site_settings (key, value, description) 
SELECT 'currency', '"MXN"', 'Moneda principal'
WHERE NOT EXISTS (SELECT 1 FROM site_settings WHERE key = 'currency');

INSERT INTO site_settings (key, value, description) 
SELECT 'tax_rate', '16', 'Tasa de impuesto (IVA) en porcentaje'
WHERE NOT EXISTS (SELECT 1 FROM site_settings WHERE key = 'tax_rate');

INSERT INTO site_settings (key, value, description) 
SELECT 'free_shipping_threshold', '500', 'Monto mínimo para envío gratis'
WHERE NOT EXISTS (SELECT 1 FROM site_settings WHERE key = 'free_shipping_threshold');

-- Insertar cupones de ejemplo solo si no existen
INSERT INTO coupons (code, name, description, type, value, min_order_amount, usage_limit, expires_at) 
SELECT 'BIENVENIDO10', 'Descuento de Bienvenida', 'Descuento del 10% para nuevos clientes', 'percentage', 10, 200, 1000, NOW() + INTERVAL '1 year'
WHERE NOT EXISTS (SELECT 1 FROM coupons WHERE code = 'BIENVENIDO10');

INSERT INTO coupons (code, name, description, type, value, min_order_amount, usage_limit, expires_at) 
SELECT 'ENVIOGRATIS', 'Envío Gratis', 'Envío gratis en cualquier compra', 'free_shipping', 0, 0, NULL, NOW() + INTERVAL '6 months'
WHERE NOT EXISTS (SELECT 1 FROM coupons WHERE code = 'ENVIOGRATIS');

-- ==========================================
-- CREAR ÍNDICES IMPORTANTES
-- ==========================================

CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);

-- ==========================================
-- MENSAJE DE ÉXITO
-- ==========================================

DO $$
BEGIN
    RAISE NOTICE '✅ Base de datos configurada correctamente. Tablas creadas: categories, brands, products, profiles, addresses, cart_items, orders, order_items, favorites, reviews, coupons, notifications, site_settings, admin_users, newsletter_subscribers';
END $$;
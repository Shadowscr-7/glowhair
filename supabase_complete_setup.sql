-- ==========================================
-- SCRIPT COMPLETO - LIMPIEZA TOTAL Y CONFIGURACIÓN
-- ==========================================
-- ⚠️  CUIDADO: Este script borra TODAS las tablas existentes y las recrea
-- Solo ejecutar en desarrollo, NUNCA en producción con datos importantes

-- ==========================================
-- PASO 1: LIMPIAR TODO LO EXISTENTE
-- ==========================================

-- Eliminar triggers existentes
DROP TRIGGER IF EXISTS create_profile_trigger ON auth.users;
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
DROP TRIGGER IF EXISTS update_categories_updated_at ON categories;
DROP TRIGGER IF EXISTS update_brands_updated_at ON brands;
DROP TRIGGER IF EXISTS update_products_updated_at ON products;
DROP TRIGGER IF EXISTS update_addresses_updated_at ON addresses;
DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
DROP TRIGGER IF EXISTS update_reviews_updated_at ON reviews;
DROP TRIGGER IF EXISTS update_coupons_updated_at ON coupons;
DROP TRIGGER IF EXISTS generate_order_number_trigger ON orders;
DROP TRIGGER IF EXISTS update_product_rating_trigger ON reviews;
DROP TRIGGER IF EXISTS update_stock_trigger ON orders;

-- Eliminar funciones existentes
DROP FUNCTION IF EXISTS update_updated_at_column();
DROP FUNCTION IF EXISTS create_user_profile();
DROP FUNCTION IF EXISTS generate_order_number();
DROP FUNCTION IF EXISTS update_product_rating();
DROP FUNCTION IF EXISTS update_stock_after_order();

-- Eliminar tablas en orden para evitar dependencias (CASCADE borrará datos relacionados)
DROP TABLE IF EXISTS email_campaigns CASCADE;
DROP TABLE IF EXISTS newsletter_subscribers CASCADE;
DROP TABLE IF EXISTS coupon_usage CASCADE;
DROP TABLE IF EXISTS review_votes CASCADE;
DROP TABLE IF EXISTS inventory_movements CASCADE;
DROP TABLE IF EXISTS order_status_history CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS favorites CASCADE;
DROP TABLE IF EXISTS cart_items CASCADE;
DROP TABLE IF EXISTS coupons CASCADE;
DROP TABLE IF EXISTS addresses CASCADE;
DROP TABLE IF EXISTS admin_users CASCADE;
DROP TABLE IF EXISTS site_settings CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS brands CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Limpiar usuarios existentes de auth (CUIDADO: borra todos los usuarios)
-- DELETE FROM auth.users; -- Descomenta solo si quieres borrar todos los usuarios

-- ==========================================
-- PASO 2: CREAR TODAS LAS TABLAS
-- ==========================================

-- Tabla de categorías
CREATE TABLE categories (
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
CREATE TABLE brands (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  logo_url TEXT,
  website_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de productos
CREATE TABLE products (
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
  dimensions JSONB,
  images JSONB DEFAULT '[]',
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

-- Tabla de perfiles de usuario (con columnas de admin incluidas)
CREATE TABLE profiles (
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
  role VARCHAR(50) DEFAULT 'customer',
  admin_permissions JSONB DEFAULT '{}',
  preferences JSONB DEFAULT '{}',
  is_verified BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de direcciones
CREATE TABLE addresses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  type VARCHAR(50) DEFAULT 'shipping',
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
CREATE TABLE cart_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  product_id UUID REFERENCES products(id),
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- Tabla de cupones
CREATE TABLE coupons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(255),
  description TEXT,
  type VARCHAR(50) NOT NULL,
  value DECIMAL(10,2),
  min_order_amount DECIMAL(10,2) DEFAULT 0,
  max_discount_amount DECIMAL(10,2),
  usage_limit INTEGER,
  usage_limit_per_user INTEGER DEFAULT 1,
  used_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  starts_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  applicable_products UUID[] DEFAULT '{}',
  applicable_categories UUID[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de uso de cupones
CREATE TABLE coupon_usage (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  coupon_id UUID REFERENCES coupons(id),
  user_id UUID REFERENCES auth.users,
  order_id UUID,
  discount_amount DECIMAL(10,2),
  used_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de pedidos
CREATE TABLE orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_number VARCHAR(50) UNIQUE,
  user_id UUID REFERENCES auth.users,
  status VARCHAR(50) DEFAULT 'pending',
  payment_status VARCHAR(50) DEFAULT 'pending',
  subtotal DECIMAL(10,2) NOT NULL,
  tax_amount DECIMAL(10,2) DEFAULT 0,
  shipping_amount DECIMAL(10,2) DEFAULT 0,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'MXN',
  shipping_address JSONB NOT NULL,
  billing_address JSONB,
  shipping_method VARCHAR(100),
  tracking_number VARCHAR(255),
  payment_method VARCHAR(50),
  payment_provider VARCHAR(50),
  payment_provider_id VARCHAR(255),
  coupon_code VARCHAR(50),
  coupon_discount DECIMAL(10,2) DEFAULT 0,
  ordered_at TIMESTAMPTZ DEFAULT NOW(),
  shipped_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  customer_notes TEXT,
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de items del pedido
CREATE TABLE order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  product_name VARCHAR(255) NOT NULL,
  product_image TEXT,
  sku VARCHAR(100),
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de estados del pedido
CREATE TABLE order_status_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  status VARCHAR(50) NOT NULL,
  notes TEXT,
  created_by UUID REFERENCES auth.users,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de favoritos
CREATE TABLE favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- Tabla de reseñas
CREATE TABLE reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id),
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title VARCHAR(255),
  comment TEXT,
  images TEXT[] DEFAULT '{}',
  is_verified BOOLEAN DEFAULT false,
  is_approved BOOLEAN DEFAULT false,
  helpful_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- Tabla de votos útiles en reseñas
CREATE TABLE review_votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  review_id UUID REFERENCES reviews(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users,
  is_helpful BOOLEAN NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(review_id, user_id)
);

-- Tabla de movimientos de inventario
CREATE TABLE inventory_movements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES products(id),
  type VARCHAR(50) NOT NULL,
  quantity INTEGER NOT NULL,
  reason VARCHAR(255),
  reference_id UUID,
  notes TEXT,
  created_by UUID REFERENCES auth.users,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de notificaciones
CREATE TABLE notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  data JSONB DEFAULT '{}',
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de configuraciones del sitio
CREATE TABLE site_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key VARCHAR(255) UNIQUE NOT NULL,
  value JSONB,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de usuarios admin
CREATE TABLE admin_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users UNIQUE,
  role VARCHAR(50) DEFAULT 'admin',
  permissions JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de suscriptores al newsletter
CREATE TABLE newsletter_subscribers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255),
  is_active BOOLEAN DEFAULT true,
  subscribed_at TIMESTAMPTZ DEFAULT NOW(),
  unsubscribed_at TIMESTAMPTZ,
  preferences JSONB DEFAULT '{}'
);

-- Tabla de campañas de email
CREATE TABLE email_campaigns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  subject VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'draft',
  scheduled_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  recipient_count INTEGER DEFAULT 0,
  open_count INTEGER DEFAULT 0,
  click_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- PASO 3: INSERTAR DATOS DE EJEMPLO
-- ==========================================

-- Insertar categorías
INSERT INTO categories (name, description, display_order) VALUES
('Limpieza', 'Shampoos y productos de limpieza capilar', 1),
('Tratamiento', 'Mascarillas, acondicionadores y tratamientos intensivos', 2),
('Estilizado', 'Productos para peinar y dar forma al cabello', 3),
('Protección', 'Protectores térmicos y solares', 4),
('Coloración', 'Tintes y productos para el color del cabello', 5),
('Herramientas', 'Cepillos, peines y herramientas de peinado', 6);

-- Insertar marcas
INSERT INTO brands (name, description) VALUES
('GlowHair', 'Marca premium de productos capilares naturales'),
('Deluxe Liss', 'Especialistas en alisado y tratamientos de keratina'),
('Natural Care', 'Productos 100% naturales y orgánicos'),
('ProStyle', 'Herramientas profesionales de peluquería');

-- Insertar productos de ejemplo
DO $$ 
DECLARE 
    cat_limpieza UUID;
    cat_tratamiento UUID;
    cat_estilizado UUID;
    cat_proteccion UUID;
    brand_glowhair UUID;
    brand_deluxe UUID;
BEGIN
    SELECT id INTO cat_limpieza FROM categories WHERE name = 'Limpieza';
    SELECT id INTO cat_tratamiento FROM categories WHERE name = 'Tratamiento';
    SELECT id INTO cat_estilizado FROM categories WHERE name = 'Estilizado';
    SELECT id INTO cat_proteccion FROM categories WHERE name = 'Protección';
    SELECT id INTO brand_glowhair FROM brands WHERE name = 'GlowHair';
    SELECT id INTO brand_deluxe FROM brands WHERE name = 'Deluxe Liss';

    INSERT INTO products (
        name, slug, description, short_description, price, original_price, 
        category_id, brand_id, sku, rating, review_count, is_new, is_on_sale, 
        stock, ingredients, hair_types, benefits
    ) VALUES
    (
        'Shampoo Hidratante Premium', 
        'shampoo-hidratante-premium',
        'Fórmula avanzada con keratina y aceites naturales para cabello sedoso y brillante. Perfecto para cabellos secos y dañados.',
        'Shampoo hidratante con keratina y aceites naturales',
        29.99, 39.99, cat_limpieza, brand_glowhair, 'GH-SH-001',
        4.8, 124, true, true, 50,
        ARRAY['Keratina', 'Aceite de Argán', 'Aceite de Coco', 'Vitamina E'],
        ARRAY['Seco', 'Dañado', 'Teñido'],
        ARRAY['Hidratación profunda', 'Brillo natural', 'Suavidad']
    ),
    (
        'Acondicionador Reparador',
        'acondicionador-reparador',
        'Repara y fortalece el cabello dañado con extractos botánicos y proteínas. Uso diario.',
        'Acondicionador reparador con extractos botánicos',
        24.99, NULL, cat_tratamiento, brand_glowhair, 'GH-AC-001',
        4.7, 89, false, false, 35,
        ARRAY['Proteínas de Trigo', 'Extracto de Aloe Vera', 'Pantenol'],
        ARRAY['Dañado', 'Quebradizo', 'Procesado'],
        ARRAY['Reparación', 'Fortalecimiento', 'Protección']
    ),
    (
        'Mascarilla Nutritiva Intensiva',
        'mascarilla-nutritiva-intensiva',
        'Tratamiento profundo semanal para cabello extremadamente seco y dañado. Resultados visibles desde la primera aplicación.',
        'Mascarilla intensiva para cabello muy seco',
        34.99, 44.99, cat_tratamiento, brand_deluxe, 'DL-MN-001',
        4.9, 156, false, true, 25,
        ARRAY['Keratina Hidrolizada', 'Aceite de Macadamia', 'Colágeno'],
        ARRAY['Muy seco', 'Extremadamente dañado', 'Rizado'],
        ARRAY['Nutrición profunda', 'Restauración', 'Elasticidad']
    ),
    (
        'Serum Anti-Frizz',
        'serum-anti-frizz',
        'Control total del frizz y protección térmica hasta 230°C. Ideal para cabello rebelde y encrespado.',
        'Serum anti-frizz con protección térmica',
        19.99, NULL, cat_estilizado, brand_glowhair, 'GH-SF-001',
        4.6, 78, true, false, 40,
        ARRAY['Siliconas', 'Aceite de Argán', 'Filtros UV'],
        ARRAY['Encrespado', 'Rebelde', 'Húmedo'],
        ARRAY['Control de frizz', 'Protección térmica', 'Brillo']
    );
END $$;

-- Insertar configuraciones del sitio
INSERT INTO site_settings (key, value, description) VALUES
('site_name', '"GlowHair"', 'Nombre del sitio web'),
('site_description', '"Productos premium para el cuidado capilar"', 'Descripción del sitio'),
('currency', '"MXN"', 'Moneda principal'),
('tax_rate', '16', 'Tasa de impuesto (IVA) en porcentaje'),
('free_shipping_threshold', '500', 'Monto mínimo para envío gratis'),
('shipping_cost', '99', 'Costo de envío estándar'),
('max_cart_items', '50', 'Máximo de items en el carrito'),
('low_stock_threshold', '10', 'Alerta de stock bajo'),
('enable_reviews', 'true', 'Permitir reseñas de productos'),
('require_review_approval', 'true', 'Requiere aprobación de reseñas');

-- Insertar cupones de ejemplo
INSERT INTO coupons (code, name, description, type, value, min_order_amount, usage_limit, expires_at) VALUES
('BIENVENIDO10', 'Descuento de Bienvenida', 'Descuento del 10% para nuevos clientes', 'percentage', 10, 200, 1000, NOW() + INTERVAL '1 year'),
('ENVIOGRATIS', 'Envío Gratis', 'Envío gratis en cualquier compra', 'free_shipping', 0, 0, NULL, NOW() + INTERVAL '6 months'),
('MEGA50', 'Mega Descuento', 'Descuento de $50 en compras superiores a $500', 'fixed_amount', 50, 500, 500, NOW() + INTERVAL '3 months');

-- ==========================================
-- PASO 4: CREAR FUNCIÓN PARA PERFIL AUTOMÁTICO
-- ==========================================

-- Función para crear perfil automáticamente
CREATE OR REPLACE FUNCTION create_user_profile()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, role)
  VALUES (
    NEW.id, 
    NEW.email, 
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Usuario'),
    'customer'
  );
  RETURN NEW;
EXCEPTION
  WHEN unique_violation THEN
    -- Si el perfil ya existe, solo actualizar
    UPDATE profiles 
    SET email = NEW.email, 
        full_name = COALESCE(NEW.raw_user_meta_data->>'full_name', full_name)
    WHERE id = NEW.id;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Crear trigger para auto-crear perfiles
CREATE TRIGGER create_profile_trigger 
  AFTER INSERT ON auth.users 
  FOR EACH ROW EXECUTE FUNCTION create_user_profile();

-- ==========================================
-- NOTA IMPORTANTE PARA CREAR USUARIO KEILA
-- ==========================================
-- 
-- El usuario administrador debe crearse manualmente desde:
-- 1. Supabase Dashboard > Authentication > Users > "Add user"
-- 2. Email: keila@glowhair.com
-- 3. Password: keila123456
-- 
-- Luego ejecutar este SQL para convertirlo en admin:

-- Función para convertir usuario existente en admin
CREATE OR REPLACE FUNCTION make_user_admin(user_email TEXT)
RETURNS TEXT AS $$
DECLARE
    user_found UUID;
    result_message TEXT;
BEGIN
    -- Buscar el usuario por email
    SELECT id INTO user_found 
    FROM auth.users 
    WHERE email = user_email;
    
    IF user_found IS NULL THEN
        RETURN 'ERROR: Usuario con email ' || user_email || ' no encontrado. Crear primero en Authentication > Users';
    END IF;
    
    -- Actualizar perfil para ser admin
    UPDATE profiles 
    SET 
        role = 'admin',
        first_name = 'Keila',
        last_name = 'Admin',
        full_name = 'Keila Admin',
        admin_permissions = jsonb_build_object(
            'products', true,
            'orders', true,
            'customers', true,
            'analytics', true,
            'settings', true,
            'users', true
        ),
        is_verified = true,
        updated_at = NOW()
    WHERE id = user_found;
    
    -- Insertar en tabla admin_users
    INSERT INTO admin_users (user_id, role, permissions, is_active)
    VALUES (
        user_found,
        'admin',
        jsonb_build_object(
            'products', true,
            'orders', true,
            'customers', true,
            'analytics', true,
            'settings', true,
            'users', true
        ),
        true
    )
    ON CONFLICT (user_id) DO UPDATE SET
        role = EXCLUDED.role,
        permissions = EXCLUDED.permissions,
        is_active = EXCLUDED.is_active,
        updated_at = NOW();
    
    RETURN 'SUCCESS: Usuario ' || user_email || ' convertido en administrador exitosamente';
END;
$$ language 'plpgsql';

-- ==========================================
-- PASO 5: CONFIGURAR ROW LEVEL SECURITY
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

-- Políticas básicas
CREATE POLICY "Public categories are viewable by everyone" ON categories FOR SELECT USING (is_active = true);
CREATE POLICY "Public brands are viewable by everyone" ON brands FOR SELECT USING (is_active = true);
CREATE POLICY "Public products are viewable by everyone" ON products FOR SELECT USING (is_active = true);
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can manage own addresses" ON addresses FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own cart" ON cart_items FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view own orders" ON orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own orders" ON orders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can manage their own favorites" ON favorites FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Anyone can view approved reviews" ON reviews FOR SELECT USING (is_approved = true);
CREATE POLICY "Users can manage own reviews" ON reviews FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Public coupons are viewable" ON coupons FOR SELECT USING (is_active = true);
CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);

-- Políticas especiales para administradores
CREATE POLICY "Admins can view all profiles" ON profiles FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
);

CREATE POLICY "Admins can manage all products" ON products FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
);

CREATE POLICY "Admins can manage all orders" ON orders FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
);

-- ==========================================
-- PASO 6: CREAR FUNCIONES Y TRIGGERS ADICIONALES
-- ==========================================

-- Función para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar triggers de updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_brands_updated_at BEFORE UPDATE ON brands FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_addresses_updated_at BEFORE UPDATE ON addresses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_coupons_updated_at BEFORE UPDATE ON coupons FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==========================================
-- PASO 7: CREAR ÍNDICES PARA PERFORMANCE
-- ==========================================

CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_products_active ON products(is_active);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_brand ON products(brand_id);
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_favorites_user ON favorites(user_id);
CREATE INDEX idx_cart_items_user ON cart_items(user_id);
CREATE INDEX idx_reviews_product ON reviews(product_id);
CREATE INDEX idx_reviews_approved ON reviews(is_approved);

-- ==========================================
-- VERIFICACIÓN Y MENSAJE FINAL
-- ==========================================

DO $$
DECLARE
    table_count INTEGER;
    keila_user_id UUID;
    keila_role VARCHAR(50);
BEGIN
    -- Contar tablas creadas
    SELECT COUNT(*) INTO table_count
    FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_type = 'BASE TABLE';
    
    -- Verificar usuario Keila
    SELECT u.id, p.role INTO keila_user_id, keila_role
    FROM auth.users u
    LEFT JOIN profiles p ON u.id = p.id
    WHERE u.email = 'keila@glowhair.com';
    
    RAISE NOTICE '🎉 ¡CONFIGURACIÓN DE BASE DE DATOS COMPLETADA! 🎉';
    RAISE NOTICE '';
    RAISE NOTICE '📊 ESTADÍSTICAS:';
    RAISE NOTICE '  ✅ Tablas creadas: %', table_count;
    RAISE NOTICE '  ✅ Categorías insertadas: 6';
    RAISE NOTICE '  ✅ Marcas insertadas: 4';
    RAISE NOTICE '  ✅ Productos de ejemplo: 4';
    RAISE NOTICE '  ✅ Cupones de ejemplo: 3';
    RAISE NOTICE '  ✅ Políticas RLS configuradas';
    RAISE NOTICE '  ✅ Triggers e índices creados';
    RAISE NOTICE '';
    
    IF keila_user_id IS NOT NULL THEN
        RAISE NOTICE '👤 USUARIO ADMINISTRADOR ENCONTRADO:';
        RAISE NOTICE '  ✅ Email: keila@glowhair.com';
        RAISE NOTICE '  ✅ Rol: %', keila_role;
        RAISE NOTICE '  ✅ ID: %', keila_user_id;
        RAISE NOTICE '';
        RAISE NOTICE '🚀 LISTO PARA USAR:';
        RAISE NOTICE '  1. npm run dev';
        RAISE NOTICE '  2. Login en /login con keila@glowhair.com';
        RAISE NOTICE '  3. Acceso admin en /admin';
    ELSE
        RAISE NOTICE '� SIGUIENTE PASO - CREAR USUARIO ADMIN:';
        RAISE NOTICE '';
        RAISE NOTICE '  1. Ve a Supabase Dashboard > Authentication > Users';
        RAISE NOTICE '  2. Haz clic en "Add user"';
        RAISE NOTICE '  3. Email: keila@glowhair.com';
        RAISE NOTICE '  4. Password: keila123456';
        RAISE NOTICE '  5. Luego ejecuta este SQL:';
        RAISE NOTICE '';
        RAISE NOTICE '     SELECT make_user_admin(''keila@glowhair.com'');';
        RAISE NOTICE '';
    END IF;
    
    RAISE NOTICE '🛍️ BASE DE DATOS LISTA PARA E-COMMERCE COMPLETO';
END $$;
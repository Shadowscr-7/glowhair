-- ==========================================
-- GLOWHAIR E-COMMERCE - BASE DE DATOS COMPLETA
-- ==========================================
-- Script completo para crear toda la estructura de base de datos
-- con prefijo "glowhair_" en todas las tablas
-- Incluye usuario administrador Keila
-- ==========================================

-- ==========================================
-- PASO 1: LIMPIAR ESTRUCTURA EXISTENTE
-- ==========================================

-- Eliminar triggers existentes
DROP TRIGGER IF EXISTS glowhair_create_profile_trigger ON auth.users;
DROP TRIGGER IF EXISTS glowhair_update_profiles_updated_at ON glowhair_profiles;
DROP TRIGGER IF EXISTS glowhair_update_categories_updated_at ON glowhair_categories;
DROP TRIGGER IF EXISTS glowhair_update_brands_updated_at ON glowhair_brands;
DROP TRIGGER IF EXISTS glowhair_update_products_updated_at ON glowhair_products;
DROP TRIGGER IF EXISTS glowhair_update_addresses_updated_at ON glowhair_addresses;
DROP TRIGGER IF EXISTS glowhair_update_orders_updated_at ON glowhair_orders;
DROP TRIGGER IF EXISTS glowhair_update_reviews_updated_at ON glowhair_reviews;
DROP TRIGGER IF EXISTS glowhair_update_coupons_updated_at ON glowhair_coupons;

-- Eliminar funciones existentes
DROP FUNCTION IF EXISTS glowhair_update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS glowhair_create_user_profile() CASCADE;
DROP FUNCTION IF EXISTS glowhair_make_user_admin(TEXT) CASCADE;
DROP FUNCTION IF EXISTS glowhair_update_product_rating() CASCADE;
DROP FUNCTION IF EXISTS glowhair_generate_order_number() CASCADE;

-- Eliminar tablas en orden para evitar dependencias
DROP TABLE IF EXISTS glowhair_email_campaigns CASCADE;
DROP TABLE IF EXISTS glowhair_newsletter_subscribers CASCADE;
DROP TABLE IF EXISTS glowhair_coupon_usage CASCADE;
DROP TABLE IF EXISTS glowhair_review_votes CASCADE;
DROP TABLE IF EXISTS glowhair_inventory_movements CASCADE;
DROP TABLE IF EXISTS glowhair_order_status_history CASCADE;
DROP TABLE IF EXISTS glowhair_order_items CASCADE;
DROP TABLE IF EXISTS glowhair_orders CASCADE;
DROP TABLE IF EXISTS glowhair_notifications CASCADE;
DROP TABLE IF EXISTS glowhair_reviews CASCADE;
DROP TABLE IF EXISTS glowhair_favorites CASCADE;
DROP TABLE IF EXISTS glowhair_cart_items CASCADE;
DROP TABLE IF EXISTS glowhair_coupons CASCADE;
DROP TABLE IF EXISTS glowhair_addresses CASCADE;
DROP TABLE IF EXISTS glowhair_admin_users CASCADE;
DROP TABLE IF EXISTS glowhair_site_settings CASCADE;
DROP TABLE IF EXISTS glowhair_products CASCADE;
DROP TABLE IF EXISTS glowhair_brands CASCADE;
DROP TABLE IF EXISTS glowhair_categories CASCADE;
DROP TABLE IF EXISTS glowhair_profiles CASCADE;

-- ==========================================
-- PASO 2: CREAR TABLAS PRINCIPALES
-- ==========================================

-- Tabla de categorías de productos
CREATE TABLE glowhair_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  slug VARCHAR(255) UNIQUE,
  description TEXT,
  image_url TEXT,
  parent_id UUID REFERENCES glowhair_categories(id),
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  meta_title VARCHAR(255),
  meta_description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de marcas
CREATE TABLE glowhair_brands (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  slug VARCHAR(255) UNIQUE,
  description TEXT,
  logo_url TEXT,
  website_url TEXT,
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de productos
CREATE TABLE glowhair_products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE,
  description TEXT,
  short_description TEXT,
  
  -- Precios
  price DECIMAL(10,2) NOT NULL,
  original_price DECIMAL(10,2),
  cost_price DECIMAL(10,2),
  
  -- Referencias
  category_id UUID REFERENCES glowhair_categories(id),
  brand_id UUID REFERENCES glowhair_brands(id),
  
  -- SKU e identificadores
  sku VARCHAR(100) UNIQUE,
  barcode VARCHAR(100),
  
  -- Dimensiones y peso
  weight DECIMAL(8,3),
  dimensions JSONB,
  
  -- Imágenes (array de URLs)
  images JSONB DEFAULT '[]'::jsonb,
  
  -- Ratings y reviews
  rating DECIMAL(2,1) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  review_count INTEGER DEFAULT 0,
  
  -- Estados y flags
  is_new BOOLEAN DEFAULT false,
  is_on_sale BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  
  -- Inventario
  stock INTEGER DEFAULT 0,
  min_stock INTEGER DEFAULT 5,
  max_stock INTEGER DEFAULT 1000,
  reserved_stock INTEGER DEFAULT 0,
  
  -- Información específica de productos capilares
  ingredients TEXT[],
  hair_types TEXT[], -- Ej: ['Seco', 'Graso', 'Normal', 'Mixto', 'Rizado', 'Lacio']
  usage_instructions TEXT,
  benefits TEXT[],
  volume VARCHAR(50), -- Ej: '250ml', '500ml', '1L'
  
  -- SEO
  seo_title VARCHAR(255),
  seo_description TEXT,
  seo_keywords TEXT[],
  
  -- Fechas
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de perfiles de usuario
CREATE TABLE glowhair_profiles (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE,
  
  -- Información personal
  full_name VARCHAR(255),
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  phone VARCHAR(20),
  avatar_url TEXT,
  date_of_birth DATE,
  gender VARCHAR(20),
  
  -- Información específica para productos capilares
  hair_type VARCHAR(50), -- Tipo de cabello del usuario
  hair_concerns TEXT[], -- Preocupaciones: ['Caída', 'Caspa', 'Resequedad', etc.]
  preferred_brands UUID[], -- IDs de marcas favoritas
  
  -- Roles y permisos
  role VARCHAR(50) DEFAULT 'customer', -- 'customer', 'admin', 'super_admin'
  admin_permissions JSONB DEFAULT '{}'::jsonb,
  
  -- Preferencias
  preferences JSONB DEFAULT '{}'::jsonb,
  newsletter_subscribed BOOLEAN DEFAULT false,
  
  -- Estados
  is_verified BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  
  -- Estadísticas
  total_orders INTEGER DEFAULT 0,
  total_spent DECIMAL(10,2) DEFAULT 0,
  loyalty_points INTEGER DEFAULT 0,
  
  -- Fechas
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de direcciones
CREATE TABLE glowhair_addresses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  type VARCHAR(50) DEFAULT 'shipping', -- 'shipping', 'billing', 'both'
  
  -- Información del destinatario
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  company VARCHAR(255),
  
  -- Dirección
  address_line1 VARCHAR(255) NOT NULL,
  address_line2 VARCHAR(255),
  city VARCHAR(100) NOT NULL,
  state VARCHAR(100) NOT NULL,
  postal_code VARCHAR(20) NOT NULL,
  country VARCHAR(100) NOT NULL DEFAULT 'México',
  
  -- Contacto
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(255),
  
  -- Referencias
  reference_notes TEXT, -- Ej: "Casa azul con portón negro"
  
  -- Estado
  is_default BOOLEAN DEFAULT false,
  
  -- Fechas
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- PASO 3: CREAR TABLAS DE CARRITO Y FAVORITOS
-- ==========================================

-- Tabla de carrito de compras
CREATE TABLE glowhair_cart_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  product_id UUID REFERENCES glowhair_products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  price_at_addition DECIMAL(10,2), -- Precio cuando se agregó al carrito
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- Tabla de favoritos/wishlist
CREATE TABLE glowhair_favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  product_id UUID REFERENCES glowhair_products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- ==========================================
-- PASO 4: CREAR TABLAS DE CUPONES Y DESCUENTOS
-- ==========================================

-- Tabla de cupones
CREATE TABLE glowhair_coupons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(255),
  description TEXT,
  
  -- Tipo de descuento
  type VARCHAR(50) NOT NULL, -- 'percentage', 'fixed_amount', 'free_shipping', 'buy_x_get_y'
  value DECIMAL(10,2), -- Valor del descuento (porcentaje o cantidad fija)
  
  -- Condiciones
  min_order_amount DECIMAL(10,2) DEFAULT 0,
  max_discount_amount DECIMAL(10,2), -- Máximo descuento para porcentajes
  
  -- Límites de uso
  usage_limit INTEGER, -- NULL = ilimitado
  usage_limit_per_user INTEGER DEFAULT 1,
  used_count INTEGER DEFAULT 0,
  
  -- Aplicabilidad
  applicable_products UUID[], -- NULL = todos los productos
  applicable_categories UUID[], -- NULL = todas las categorías
  applicable_brands UUID[], -- NULL = todas las marcas
  excluded_products UUID[],
  
  -- Estado
  is_active BOOLEAN DEFAULT true,
  is_public BOOLEAN DEFAULT true, -- false = solo por invitación
  
  -- Fechas
  starts_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de uso de cupones
CREATE TABLE glowhair_coupon_usage (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  coupon_id UUID REFERENCES glowhair_coupons(id) NOT NULL,
  user_id UUID NOT NULL,
  order_id UUID, -- Se llenará cuando se cree la orden
  discount_amount DECIMAL(10,2) NOT NULL,
  used_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- PASO 5: CREAR TABLAS DE ÓRDENES
-- ==========================================

-- Tabla de órdenes/pedidos
CREATE TABLE glowhair_orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_number VARCHAR(50) UNIQUE NOT NULL,
  user_id UUID NOT NULL,
  
  -- Estados
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'
  payment_status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'paid', 'failed', 'refunded', 'partially_refunded'
  
  -- Montos
  subtotal DECIMAL(10,2) NOT NULL,
  tax_amount DECIMAL(10,2) DEFAULT 0,
  shipping_amount DECIMAL(10,2) DEFAULT 0,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'MXN',
  
  -- Direcciones (guardadas como JSON para mantener historial)
  shipping_address JSONB NOT NULL,
  billing_address JSONB,
  
  -- Envío
  shipping_method VARCHAR(100),
  shipping_carrier VARCHAR(100),
  tracking_number VARCHAR(255),
  estimated_delivery_date DATE,
  
  -- Pago
  payment_method VARCHAR(50), -- 'card', 'transfer', 'paypal', 'cash_on_delivery'
  payment_provider VARCHAR(50), -- 'stripe', 'mercadopago', 'paypal'
  payment_provider_id VARCHAR(255),
  payment_provider_data JSONB,
  
  -- Cupón aplicado
  coupon_code VARCHAR(50),
  coupon_discount DECIMAL(10,2) DEFAULT 0,
  
  -- Fechas importantes
  ordered_at TIMESTAMPTZ DEFAULT NOW(),
  confirmed_at TIMESTAMPTZ,
  shipped_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  
  -- Notas
  customer_notes TEXT,
  admin_notes TEXT,
  cancellation_reason TEXT,
  
  -- Fechas de sistema
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de items de la orden
CREATE TABLE glowhair_order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES glowhair_orders(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES glowhair_products(id),
  
  -- Información del producto (snapshot al momento de la compra)
  product_name VARCHAR(255) NOT NULL,
  product_sku VARCHAR(100),
  product_image TEXT,
  
  -- Cantidades y precios
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  
  -- Descuentos específicos del item
  discount_amount DECIMAL(10,2) DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de historial de estados de orden
CREATE TABLE glowhair_order_status_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES glowhair_orders(id) ON DELETE CASCADE NOT NULL,
  status VARCHAR(50) NOT NULL,
  notes TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- PASO 6: CREAR TABLAS DE RESEÑAS
-- ==========================================

-- Tabla de reseñas de productos
CREATE TABLE glowhair_reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID  NOT NULL,
  product_id UUID REFERENCES glowhair_products(id) ON DELETE CASCADE NOT NULL,
  order_id UUID REFERENCES glowhair_orders(id), -- Orden donde se compró el producto
  
  -- Calificación
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  
  -- Contenido
  title VARCHAR(255),
  comment TEXT,
  
  -- Imágenes de la reseña
  images TEXT[] DEFAULT '{}',
  
  -- Calificaciones específicas (para productos capilares)
  effectiveness_rating INTEGER CHECK (effectiveness_rating >= 1 AND effectiveness_rating <= 5),
  scent_rating INTEGER CHECK (scent_rating >= 1 AND scent_rating <= 5),
  value_rating INTEGER CHECK (value_rating >= 1 AND value_rating <= 5),
  
  -- Información adicional
  skin_type VARCHAR(50), -- Tipo de piel/cabello del revisor en ese momento
  would_recommend BOOLEAN,
  
  -- Moderación
  is_verified BOOLEAN DEFAULT false, -- Compra verificada
  is_approved BOOLEAN DEFAULT false, -- Aprobada por admin
  is_featured BOOLEAN DEFAULT false,
  
  -- Interacción
  helpful_count INTEGER DEFAULT 0,
  not_helpful_count INTEGER DEFAULT 0,
  
  -- Respuesta del vendedor
  seller_response TEXT,
  seller_response_at TIMESTAMPTZ,
  
  -- Fechas
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, product_id, order_id)
);

-- Tabla de votos en reseñas
CREATE TABLE glowhair_review_votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  review_id UUID REFERENCES glowhair_reviews(id) ON DELETE CASCADE NOT NULL,
  user_id UUID  NOT NULL,
  is_helpful BOOLEAN NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(review_id, user_id)
);

-- ==========================================
-- PASO 7: CREAR TABLAS DE INVENTARIO
-- ==========================================

-- Tabla de movimientos de inventario
CREATE TABLE glowhair_inventory_movements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES glowhair_products(id) NOT NULL,
  
  -- Tipo de movimiento
  type VARCHAR(50) NOT NULL, -- 'in', 'out', 'adjustment', 'reserved', 'released', 'returned', 'damaged'
  
  -- Cantidad (positiva o negativa)
  quantity INTEGER NOT NULL,
  stock_before INTEGER NOT NULL,
  stock_after INTEGER NOT NULL,
  
  -- Referencia
  reason VARCHAR(255),
  reference_id UUID, -- Puede ser order_id u otro
  reference_type VARCHAR(50), -- 'order', 'manual', 'return', etc.
  
  -- Notas
  notes TEXT,
  
  -- Auditoría
  created_by UUID ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- PASO 8: CREAR TABLAS DE NOTIFICACIONES
-- ==========================================

-- Tabla de notificaciones
CREATE TABLE glowhair_notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID  NOT NULL,
  
  -- Tipo y contenido
  type VARCHAR(50) NOT NULL, -- 'order_status', 'stock_alert', 'promotion', 'review_response', 'system'
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  
  -- Datos adicionales
  data JSONB DEFAULT '{}'::jsonb,
  action_url TEXT,
  
  -- Estado
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  
  -- Fechas
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- PASO 9: CREAR TABLAS ADMINISTRATIVAS
-- ==========================================

-- Tabla de usuarios administradores
CREATE TABLE glowhair_admin_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID  UNIQUE NOT NULL,
  role VARCHAR(50) DEFAULT 'admin', -- 'admin', 'super_admin', 'moderator', 'content_manager'
  
  -- Permisos granulares
  permissions JSONB DEFAULT '{
    "products": true,
    "orders": true,
    "customers": true,
    "analytics": true,
    "settings": false,
    "users": false,
    "coupons": true,
    "reviews": true
  }'::jsonb,
  
  -- Estado
  is_active BOOLEAN DEFAULT true,
  
  -- Fechas
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de configuraciones del sitio
CREATE TABLE glowhair_site_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key VARCHAR(255) UNIQUE NOT NULL,
  value JSONB,
  type VARCHAR(50) DEFAULT 'string', -- 'string', 'number', 'boolean', 'json'
  description TEXT,
  is_public BOOLEAN DEFAULT false, -- Si puede ser accedido por el frontend
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- PASO 10: CREAR TABLAS DE MARKETING
-- ==========================================

-- Tabla de suscriptores al newsletter
CREATE TABLE glowhair_newsletter_subscribers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255),
  
  -- Preferencias
  preferences JSONB DEFAULT '{
    "new_products": true,
    "promotions": true,
    "tips": true
  }'::jsonb,
  
  -- Estado
  is_active BOOLEAN DEFAULT true,
  
  -- Fechas
  subscribed_at TIMESTAMPTZ DEFAULT NOW(),
  unsubscribed_at TIMESTAMPTZ,
  confirmed_at TIMESTAMPTZ
);

-- Tabla de campañas de email
CREATE TABLE glowhair_email_campaigns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  subject VARCHAR(255) NOT NULL,
  preview_text VARCHAR(255),
  content TEXT NOT NULL,
  template_name VARCHAR(100),
  
  -- Segmentación
  target_segment JSONB, -- Filtros para seleccionar destinatarios
  
  -- Estado
  status VARCHAR(50) DEFAULT 'draft', -- 'draft', 'scheduled', 'sending', 'sent', 'cancelled'
  
  -- Programación
  scheduled_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  
  -- Estadísticas
  recipient_count INTEGER DEFAULT 0,
  delivered_count INTEGER DEFAULT 0,
  open_count INTEGER DEFAULT 0,
  click_count INTEGER DEFAULT 0,
  bounce_count INTEGER DEFAULT 0,
  unsubscribe_count INTEGER DEFAULT 0,
  
  -- Auditoría
  created_by UUID ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- PARTE 2: FUNCIONES Y TRIGGERS
-- ==========================================

-- Función para actualizar campo updated_at automáticamente
CREATE OR REPLACE FUNCTION glowhair_update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

-- Función para crear perfil automáticamente cuando se registra un usuario
CREATE OR REPLACE FUNCTION glowhair_create_user_profile()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.glowhair_profiles (id, email, full_name, role, is_active)
  VALUES (
    NEW.id, 
    NEW.email, 
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Usuario'),
    'customer',
    true
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    updated_at = NOW();
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Error creating profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE 'plpgsql' SECURITY DEFINER SET search_path = public;

-- Función para generar número de orden único
CREATE OR REPLACE FUNCTION glowhair_generate_order_number()
RETURNS TRIGGER AS $$
DECLARE
  order_date TEXT;
  random_suffix TEXT;
  new_order_number TEXT;
BEGIN
  -- Formato: GH-YYYYMMDD-XXXX (GH = GlowHair)
  order_date := TO_CHAR(NOW(), 'YYYYMMDD');
  random_suffix := LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
  new_order_number := 'GH-' || order_date || '-' || random_suffix;
  
  -- Verificar si ya existe (muy improbable)
  WHILE EXISTS (SELECT 1 FROM glowhair_orders WHERE order_number = new_order_number) LOOP
    random_suffix := LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
    new_order_number := 'GH-' || order_date || '-' || random_suffix;
  END LOOP;
  
  NEW.order_number := new_order_number;
  RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

-- Función para actualizar rating del producto cuando se agrega/modifica una reseña
CREATE OR REPLACE FUNCTION glowhair_update_product_rating()
RETURNS TRIGGER AS $$
DECLARE
  avg_rating DECIMAL(2,1);
  total_reviews INTEGER;
BEGIN
  -- Solo contar reseñas aprobadas
  SELECT 
    COALESCE(AVG(rating), 0),
    COUNT(*)
  INTO avg_rating, total_reviews
  FROM glowhair_reviews
  WHERE product_id = COALESCE(NEW.product_id, OLD.product_id)
    AND is_approved = true;
  
  UPDATE glowhair_products
  SET 
    rating = ROUND(avg_rating, 1),
    review_count = total_reviews,
    updated_at = NOW()
  WHERE id = COALESCE(NEW.product_id, OLD.product_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE 'plpgsql';

-- Función para actualizar stock cuando se crea/cancela una orden
CREATE OR REPLACE FUNCTION glowhair_manage_stock_on_order()
RETURNS TRIGGER AS $$
DECLARE
  item RECORD;
BEGIN
  -- Cuando se crea una orden, reducir stock
  IF TG_OP = 'INSERT' THEN
    FOR item IN 
      SELECT product_id, quantity 
      FROM glowhair_order_items 
      WHERE order_id = NEW.id
    LOOP
      UPDATE glowhair_products
      SET 
        stock = stock - item.quantity,
        reserved_stock = reserved_stock + item.quantity,
        updated_at = NOW()
      WHERE id = item.product_id;
      
      -- Registrar movimiento de inventario
      INSERT INTO glowhair_inventory_movements (
        product_id, type, quantity, 
        stock_before, stock_after,
        reference_id, reference_type,
        reason, created_by
      )
      SELECT 
        item.product_id,
        'reserved',
        -item.quantity,
        p.stock + item.quantity,
        p.stock,
        NEW.id,
        'order',
        'Stock reservado para orden ' || NEW.order_number,
        NEW.user_id
      FROM glowhair_products p
      WHERE p.id = item.product_id;
    END LOOP;
  END IF;
  
  -- Cuando se cancela una orden, restaurar stock
  IF TG_OP = 'UPDATE' AND NEW.status = 'cancelled' AND OLD.status != 'cancelled' THEN
    FOR item IN 
      SELECT product_id, quantity 
      FROM glowhair_order_items 
      WHERE order_id = NEW.id
    LOOP
      UPDATE glowhair_products
      SET 
        stock = stock + item.quantity,
        reserved_stock = reserved_stock - item.quantity,
        updated_at = NOW()
      WHERE id = item.product_id;
      
      -- Registrar movimiento de inventario
      INSERT INTO glowhair_inventory_movements (
        product_id, type, quantity,
        stock_before, stock_after,
        reference_id, reference_type,
        reason, created_by
      )
      SELECT 
        item.product_id,
        'released',
        item.quantity,
        p.stock - item.quantity,
        p.stock,
        NEW.id,
        'order_cancelled',
        'Stock liberado por cancelación de orden ' || NEW.order_number,
        NEW.user_id
      FROM glowhair_products p
      WHERE p.id = item.product_id;
    END LOOP;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

-- Función para registrar cambios de estado en historial
CREATE OR REPLACE FUNCTION glowhair_log_order_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND NEW.status != OLD.status THEN
    INSERT INTO glowhair_order_status_history (order_id, status, notes)
    VALUES (NEW.id, NEW.status, 'Estado cambiado de ' || OLD.status || ' a ' || NEW.status);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

-- Función para actualizar contador de votos útiles en reseñas
CREATE OR REPLACE FUNCTION glowhair_update_review_helpful_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.is_helpful THEN
      UPDATE glowhair_reviews 
      SET helpful_count = helpful_count + 1 
      WHERE id = NEW.review_id;
    ELSE
      UPDATE glowhair_reviews 
      SET not_helpful_count = not_helpful_count + 1 
      WHERE id = NEW.review_id;
    END IF;
  ELSIF TG_OP = 'UPDATE' AND NEW.is_helpful != OLD.is_helpful THEN
    IF NEW.is_helpful THEN
      UPDATE glowhair_reviews 
      SET 
        helpful_count = helpful_count + 1,
        not_helpful_count = not_helpful_count - 1
      WHERE id = NEW.review_id;
    ELSE
      UPDATE glowhair_reviews 
      SET 
        helpful_count = helpful_count - 1,
        not_helpful_count = not_helpful_count + 1
      WHERE id = NEW.review_id;
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.is_helpful THEN
      UPDATE glowhair_reviews 
      SET helpful_count = helpful_count - 1 
      WHERE id = OLD.review_id;
    ELSE
      UPDATE glowhair_reviews 
      SET not_helpful_count = not_helpful_count - 1 
      WHERE id = OLD.review_id;
    END IF;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE 'plpgsql';

-- Función para convertir un usuario en administrador
CREATE OR REPLACE FUNCTION glowhair_make_user_admin(user_email TEXT)
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
    RETURN 'ERROR: Usuario con email ' || user_email || ' no encontrado. Debe crear el usuario primero en Authentication > Users';
  END IF;
  
  -- Actualizar perfil para ser admin
  UPDATE public.glowhair_profiles 
  SET 
    role = 'super_admin',
    first_name = COALESCE(first_name, 'Keila'),
    last_name = COALESCE(last_name, 'Admin'),
    full_name = COALESCE(full_name, 'Keila Admin'),
    admin_permissions = jsonb_build_object(
      'products', true,
      'orders', true,
      'customers', true,
      'analytics', true,
      'settings', true,
      'users', true,
      'coupons', true,
      'reviews', true,
      'inventory', true
    ),
    is_verified = true,
    is_active = true,
    updated_at = NOW()
  WHERE id = user_found;
  
  -- Insertar en tabla admin_users
  INSERT INTO public.glowhair_admin_users (user_id, role, permissions, is_active)
  VALUES (
    user_found,
    'super_admin',
    jsonb_build_object(
      'products', true,
      'orders', true,
      'customers', true,
      'analytics', true,
      'settings', true,
      'users', true,
      'coupons', true,
      'reviews', true,
      'inventory', true
    ),
    true
  )
  ON CONFLICT (user_id) DO UPDATE SET
    role = EXCLUDED.role,
    permissions = EXCLUDED.permissions,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();
  
  result_message := '✅ SUCCESS: Usuario ' || user_email || ' convertido en administrador exitosamente';
  RETURN result_message;
END;
$$ LANGUAGE 'plpgsql' SECURITY DEFINER SET search_path = public;

-- ==========================================
-- CREAR TODOS LOS TRIGGERS
-- ==========================================

-- Trigger para auto-crear perfil cuando se registra usuario
CREATE TRIGGER glowhair_create_profile_trigger 
  AFTER INSERT ON auth.users 
  FOR EACH ROW 
  EXECUTE FUNCTION glowhair_create_user_profile();

-- Triggers para actualizar updated_at automáticamente
CREATE TRIGGER glowhair_update_profiles_updated_at 
  BEFORE UPDATE ON glowhair_profiles 
  FOR EACH ROW 
  EXECUTE FUNCTION glowhair_update_updated_at_column();

CREATE TRIGGER glowhair_update_categories_updated_at 
  BEFORE UPDATE ON glowhair_categories 
  FOR EACH ROW 
  EXECUTE FUNCTION glowhair_update_updated_at_column();

CREATE TRIGGER glowhair_update_brands_updated_at 
  BEFORE UPDATE ON glowhair_brands 
  FOR EACH ROW 
  EXECUTE FUNCTION glowhair_update_updated_at_column();

CREATE TRIGGER glowhair_update_products_updated_at 
  BEFORE UPDATE ON glowhair_products 
  FOR EACH ROW 
  EXECUTE FUNCTION glowhair_update_updated_at_column();

CREATE TRIGGER glowhair_update_addresses_updated_at 
  BEFORE UPDATE ON glowhair_addresses 
  FOR EACH ROW 
  EXECUTE FUNCTION glowhair_update_updated_at_column();

CREATE TRIGGER glowhair_update_orders_updated_at 
  BEFORE UPDATE ON glowhair_orders 
  FOR EACH ROW 
  EXECUTE FUNCTION glowhair_update_updated_at_column();

CREATE TRIGGER glowhair_update_reviews_updated_at 
  BEFORE UPDATE ON glowhair_reviews 
  FOR EACH ROW 
  EXECUTE FUNCTION glowhair_update_updated_at_column();

CREATE TRIGGER glowhair_update_coupons_updated_at 
  BEFORE UPDATE ON glowhair_coupons 
  FOR EACH ROW 
  EXECUTE FUNCTION glowhair_update_updated_at_column();

CREATE TRIGGER glowhair_update_cart_items_updated_at 
  BEFORE UPDATE ON glowhair_cart_items 
  FOR EACH ROW 
  EXECUTE FUNCTION glowhair_update_updated_at_column();

-- Trigger para generar número de orden
CREATE TRIGGER glowhair_generate_order_number_trigger 
  BEFORE INSERT ON glowhair_orders 
  FOR EACH ROW 
  WHEN (NEW.order_number IS NULL)
  EXECUTE FUNCTION glowhair_generate_order_number();

-- Trigger para actualizar rating de productos
CREATE TRIGGER glowhair_update_product_rating_trigger 
  AFTER INSERT OR UPDATE OR DELETE ON glowhair_reviews 
  FOR EACH ROW 
  EXECUTE FUNCTION glowhair_update_product_rating();

-- Trigger para gestionar stock en órdenes
CREATE TRIGGER glowhair_manage_stock_trigger 
  AFTER INSERT OR UPDATE ON glowhair_orders 
  FOR EACH ROW 
  EXECUTE FUNCTION glowhair_manage_stock_on_order();

-- Trigger para registrar cambios de estado
CREATE TRIGGER glowhair_log_status_change_trigger 
  AFTER UPDATE ON glowhair_orders 
  FOR EACH ROW 
  EXECUTE FUNCTION glowhair_log_order_status_change();

-- Trigger para actualizar contadores de votos
CREATE TRIGGER glowhair_update_helpful_count_trigger 
  AFTER INSERT OR UPDATE OR DELETE ON glowhair_review_votes 
  FOR EACH ROW 
  EXECUTE FUNCTION glowhair_update_review_helpful_count();

-- ==========================================
-- CREAR ÍNDICES PARA OPTIMIZAR RENDIMIENTO
-- ==========================================

-- Índices para búsquedas frecuentes
CREATE INDEX idx_glowhair_profiles_role ON glowhair_profiles(role);
CREATE INDEX idx_glowhair_profiles_email ON glowhair_profiles(email);
CREATE INDEX idx_glowhair_profiles_is_active ON glowhair_profiles(is_active);

-- Índices para productos
CREATE INDEX idx_glowhair_products_active ON glowhair_products(is_active);
CREATE INDEX idx_glowhair_products_category ON glowhair_products(category_id);
CREATE INDEX idx_glowhair_products_brand ON glowhair_products(brand_id);
CREATE INDEX idx_glowhair_products_slug ON glowhair_products(slug);
CREATE INDEX idx_glowhair_products_sku ON glowhair_products(sku);
CREATE INDEX idx_glowhair_products_featured ON glowhair_products(is_featured) WHERE is_featured = true;
CREATE INDEX idx_glowhair_products_sale ON glowhair_products(is_on_sale) WHERE is_on_sale = true;
CREATE INDEX idx_glowhair_products_new ON glowhair_products(is_new) WHERE is_new = true;
CREATE INDEX idx_glowhair_products_rating ON glowhair_products(rating DESC);
CREATE INDEX idx_glowhair_products_stock ON glowhair_products(stock) WHERE stock <= min_stock;

-- Índices para categorías y marcas
CREATE INDEX idx_glowhair_categories_active ON glowhair_categories(is_active);
CREATE INDEX idx_glowhair_categories_slug ON glowhair_categories(slug);
CREATE INDEX idx_glowhair_brands_active ON glowhair_brands(is_active);
CREATE INDEX idx_glowhair_brands_slug ON glowhair_brands(slug);

-- Índices para órdenes
CREATE INDEX idx_glowhair_orders_user ON glowhair_orders(user_id);
CREATE INDEX idx_glowhair_orders_status ON glowhair_orders(status);
CREATE INDEX idx_glowhair_orders_payment_status ON glowhair_orders(payment_status);
CREATE INDEX idx_glowhair_orders_number ON glowhair_orders(order_number);
CREATE INDEX idx_glowhair_orders_created ON glowhair_orders(created_at DESC);

-- Índices para items de orden
CREATE INDEX idx_glowhair_order_items_order ON glowhair_order_items(order_id);
CREATE INDEX idx_glowhair_order_items_product ON glowhair_order_items(product_id);

-- Índices para carrito y favoritos
CREATE INDEX idx_glowhair_cart_user ON glowhair_cart_items(user_id);
CREATE INDEX idx_glowhair_cart_product ON glowhair_cart_items(product_id);
CREATE INDEX idx_glowhair_favorites_user ON glowhair_favorites(user_id);
CREATE INDEX idx_glowhair_favorites_product ON glowhair_favorites(product_id);

-- Índices para reseñas
CREATE INDEX idx_glowhair_reviews_product ON glowhair_reviews(product_id);
CREATE INDEX idx_glowhair_reviews_user ON glowhair_reviews(user_id);
CREATE INDEX idx_glowhair_reviews_approved ON glowhair_reviews(is_approved) WHERE is_approved = true;
CREATE INDEX idx_glowhair_reviews_rating ON glowhair_reviews(rating);
CREATE INDEX idx_glowhair_review_votes_review ON glowhair_review_votes(review_id);

-- Índices para cupones
CREATE INDEX idx_glowhair_coupons_code ON glowhair_coupons(code);
CREATE INDEX idx_glowhair_coupons_active ON glowhair_coupons(is_active) WHERE is_active = true;
CREATE INDEX idx_glowhair_coupon_usage_user ON glowhair_coupon_usage(user_id);
CREATE INDEX idx_glowhair_coupon_usage_coupon ON glowhair_coupon_usage(coupon_id);

-- Índices para notificaciones
CREATE INDEX idx_glowhair_notifications_user ON glowhair_notifications(user_id);
CREATE INDEX idx_glowhair_notifications_unread ON glowhair_notifications(user_id, is_read) WHERE is_read = false;

-- Índices para inventario
CREATE INDEX idx_glowhair_inventory_product ON glowhair_inventory_movements(product_id);
CREATE INDEX idx_glowhair_inventory_created ON glowhair_inventory_movements(created_at DESC);

-- Índices para búsqueda de texto completo (para productos)
CREATE INDEX idx_glowhair_products_search ON glowhair_products USING gin(to_tsvector('spanish', name || ' ' || COALESCE(description, '')));

-- ==========================================
-- PARTE 3: ROW LEVEL SECURITY (RLS)
-- ==========================================

-- Habilitar RLS en todas las tablas
ALTER TABLE glowhair_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE glowhair_brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE glowhair_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE glowhair_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE glowhair_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE glowhair_cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE glowhair_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE glowhair_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE glowhair_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE glowhair_order_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE glowhair_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE glowhair_review_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE glowhair_coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE glowhair_coupon_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE glowhair_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE glowhair_inventory_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE glowhair_admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE glowhair_site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE glowhair_newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE glowhair_email_campaigns ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- POLÍTICAS PARA CATEGORÍAS
-- ==========================================
CREATE POLICY "Categorías activas son públicas" 
  ON glowhair_categories FOR SELECT 
  USING (is_active = true);

CREATE POLICY "Admins pueden gestionar categorías" 
  ON glowhair_categories FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM glowhair_profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- ==========================================
-- POLÍTICAS PARA MARCAS
-- ==========================================
CREATE POLICY "Marcas activas son públicas" 
  ON glowhair_brands FOR SELECT 
  USING (is_active = true);

CREATE POLICY "Admins pueden gestionar marcas" 
  ON glowhair_brands FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM glowhair_profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- ==========================================
-- POLÍTICAS PARA PRODUCTOS
-- ==========================================
CREATE POLICY "Productos activos son públicos" 
  ON glowhair_products FOR SELECT 
  USING (is_active = true);

CREATE POLICY "Admins pueden gestionar productos" 
  ON glowhair_products FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM glowhair_profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- ==========================================
-- POLÍTICAS PARA PERFILES
-- ==========================================
CREATE POLICY "Usuarios ven su propio perfil" 
  ON glowhair_profiles FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Usuarios actualizan su propio perfil" 
  ON glowhair_profiles FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "Usuarios insertan su propio perfil" 
  ON glowhair_profiles FOR INSERT 
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins ven todos los perfiles" 
  ON glowhair_profiles FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM glowhair_profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Admins actualizan perfiles" 
  ON glowhair_profiles FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM glowhair_profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- ==========================================
-- POLÍTICAS PARA DIRECCIONES
-- ==========================================
CREATE POLICY "Usuarios gestionan sus direcciones" 
  ON glowhair_addresses FOR ALL 
  USING (auth.uid() = user_id);

CREATE POLICY "Admins ven todas las direcciones" 
  ON glowhair_addresses FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM glowhair_profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- ==========================================
-- POLÍTICAS PARA CARRITO
-- ==========================================
CREATE POLICY "Usuarios gestionan su carrito" 
  ON glowhair_cart_items FOR ALL 
  USING (auth.uid() = user_id);

-- ==========================================
-- POLÍTICAS PARA FAVORITOS
-- ==========================================
CREATE POLICY "Usuarios gestionan sus favoritos" 
  ON glowhair_favorites FOR ALL 
  USING (auth.uid() = user_id);

-- ==========================================
-- POLÍTICAS PARA ÓRDENES
-- ==========================================
CREATE POLICY "Usuarios ven sus propias órdenes" 
  ON glowhair_orders FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Usuarios crean sus propias órdenes" 
  ON glowhair_orders FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuarios actualizan sus órdenes pendientes" 
  ON glowhair_orders FOR UPDATE 
  USING (auth.uid() = user_id AND status = 'pending');

CREATE POLICY "Admins gestionan todas las órdenes" 
  ON glowhair_orders FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM glowhair_profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- ==========================================
-- POLÍTICAS PARA ITEMS DE ORDEN
-- ==========================================
CREATE POLICY "Usuarios ven items de sus órdenes" 
  ON glowhair_order_items FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM glowhair_orders 
      WHERE id = order_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Admins gestionan items de órdenes" 
  ON glowhair_order_items FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM glowhair_profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- ==========================================
-- POLÍTICAS PARA HISTORIAL DE ÓRDENES
-- ==========================================
CREATE POLICY "Usuarios ven historial de sus órdenes" 
  ON glowhair_order_status_history FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM glowhair_orders 
      WHERE id = order_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Admins gestionan historial de órdenes" 
  ON glowhair_order_status_history FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM glowhair_profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- ==========================================
-- POLÍTICAS PARA RESEÑAS
-- ==========================================
CREATE POLICY "Reseñas aprobadas son públicas" 
  ON glowhair_reviews FOR SELECT 
  USING (is_approved = true);

CREATE POLICY "Usuarios ven sus propias reseñas" 
  ON glowhair_reviews FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Usuarios crean sus reseñas" 
  ON glowhair_reviews FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuarios actualizan sus reseñas" 
  ON glowhair_reviews FOR UPDATE 
  USING (auth.uid() = user_id AND is_approved = false);

CREATE POLICY "Usuarios eliminan sus reseñas" 
  ON glowhair_reviews FOR DELETE 
  USING (auth.uid() = user_id);

CREATE POLICY "Admins gestionan todas las reseñas" 
  ON glowhair_reviews FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM glowhair_profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- ==========================================
-- POLÍTICAS PARA VOTOS DE RESEÑAS
-- ==========================================
CREATE POLICY "Usuarios ven votos de reseñas aprobadas" 
  ON glowhair_review_votes FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM glowhair_reviews 
      WHERE id = review_id AND is_approved = true
    )
  );

CREATE POLICY "Usuarios gestionan sus votos" 
  ON glowhair_review_votes FOR ALL 
  USING (auth.uid() = user_id);

-- ==========================================
-- POLÍTICAS PARA CUPONES
-- ==========================================
CREATE POLICY "Cupones activos y públicos son visibles" 
  ON glowhair_coupons FOR SELECT 
  USING (is_active = true AND is_public = true);

CREATE POLICY "Admins gestionan cupones" 
  ON glowhair_coupons FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM glowhair_profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- ==========================================
-- POLÍTICAS PARA USO DE CUPONES
-- ==========================================
CREATE POLICY "Usuarios ven su historial de cupones" 
  ON glowhair_coupon_usage FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Sistema registra uso de cupones" 
  ON glowhair_coupon_usage FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins ven todos los usos de cupones" 
  ON glowhair_coupon_usage FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM glowhair_profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- ==========================================
-- POLÍTICAS PARA NOTIFICACIONES
-- ==========================================
CREATE POLICY "Usuarios ven sus notificaciones" 
  ON glowhair_notifications FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Usuarios actualizan sus notificaciones" 
  ON glowhair_notifications FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Sistema crea notificaciones" 
  ON glowhair_notifications FOR INSERT 
  WITH CHECK (true);

-- ==========================================
-- POLÍTICAS PARA MOVIMIENTOS DE INVENTARIO
-- ==========================================
CREATE POLICY "Admins gestionan inventario" 
  ON glowhair_inventory_movements FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM glowhair_profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- ==========================================
-- POLÍTICAS PARA USUARIOS ADMIN
-- ==========================================
CREATE POLICY "Super admins ven todos los admins" 
  ON glowhair_admin_users FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM glowhair_profiles 
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

CREATE POLICY "Super admins gestionan admins" 
  ON glowhair_admin_users FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM glowhair_profiles 
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

-- ==========================================
-- POLÍTICAS PARA CONFIGURACIONES
-- ==========================================
CREATE POLICY "Configuraciones públicas son visibles" 
  ON glowhair_site_settings FOR SELECT 
  USING (is_public = true);

CREATE POLICY "Admins ven todas las configuraciones" 
  ON glowhair_site_settings FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM glowhair_profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Super admins gestionan configuraciones" 
  ON glowhair_site_settings FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM glowhair_profiles 
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

-- ==========================================
-- POLÍTICAS PARA NEWSLETTER
-- ==========================================
CREATE POLICY "Usuarios se suscriben al newsletter" 
  ON glowhair_newsletter_subscribers FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Usuarios actualizan su suscripción" 
  ON glowhair_newsletter_subscribers FOR UPDATE 
  USING (email = (SELECT email FROM glowhair_profiles WHERE id = auth.uid()));

CREATE POLICY "Admins gestionan suscriptores" 
  ON glowhair_newsletter_subscribers FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM glowhair_profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- ==========================================
-- POLÍTICAS PARA CAMPAÑAS DE EMAIL
-- ==========================================
CREATE POLICY "Admins gestionan campañas" 
  ON glowhair_email_campaigns FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM glowhair_profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- ==========================================
-- PARTE 4: DATOS INICIALES
-- ==========================================

-- ==========================================
-- INSERTAR CATEGORÍAS PRINCIPALES
-- ==========================================
INSERT INTO glowhair_categories (name, slug, description, display_order, is_active) VALUES
('Shampoos', 'shampoos', 'Shampoos para todo tipo de cabello', 1, true),
('Acondicionadores', 'acondicionadores', 'Acondicionadores hidratantes y reparadores', 2, true),
('Mascarillas', 'mascarillas', 'Tratamientos intensivos y mascarillas nutritivas', 3, true),
('Tratamientos', 'tratamientos', 'Tratamientos especializados para el cabello', 4, true),
('Aceites Capilares', 'aceites-capilares', 'Aceites naturales para nutrición y brillo', 5, true),
('Serums', 'serums', 'Serums y concentrados reparadores', 6, true),
('Protección Térmica', 'proteccion-termica', 'Protectores térmicos para herramientas de calor', 7, true),
('Estilizado', 'estilizado', 'Productos para peinar y dar forma', 8, true),
('Coloración', 'coloracion', 'Tintes y productos para el color', 9, true),
('Anti-Caída', 'anti-caida', 'Productos para fortalecer y prevenir la caída', 10, true),
('Keratina', 'keratina', 'Tratamientos de keratina y alisados', 11, true),
('Hidratación Profunda', 'hidratacion-profunda', 'Productos para cabello seco y dañado', 12, true);

-- ==========================================
-- INSERTAR MARCAS PRINCIPALES
-- ==========================================
INSERT INTO glowhair_brands (name, slug, description, is_featured, is_active, display_order) VALUES
('GlowHair', 'glowhair', 'Línea premium de productos capilares con ingredientes naturales', true, true, 1),
('Keila Professional', 'keila-professional', 'Línea profesional para salones de belleza', true, true, 2),
('Natural Care', 'natural-care', 'Productos 100% naturales y orgánicos certificados', true, true, 3),
('Deluxe Liss', 'deluxe-liss', 'Especialistas en alisado y tratamientos de keratina', true, true, 4),
('Hydra Plus', 'hydra-plus', 'Hidratación intensiva para cabello seco', false, true, 5),
('Repair & Shine', 'repair-shine', 'Reparación y brillo extremo', false, true, 6),
('Volume Pro', 'volume-pro', 'Volumen y cuerpo para cabello fino', false, true, 7),
('Color Guard', 'color-guard', 'Protección y cuidado para cabello teñido', false, true, 8);

-- ==========================================
-- INSERTAR PRODUCTOS VARIADOS
-- ==========================================

-- Variable para almacenar IDs de categorías y marcas
DO $$ 
DECLARE 
    cat_shampoos UUID;
    cat_acondicionadores UUID;
    cat_mascarillas UUID;
    cat_tratamientos UUID;
    cat_aceites UUID;
    cat_serums UUID;
    cat_proteccion UUID;
    cat_estilizado UUID;
    cat_anticaida UUID;
    cat_keratina UUID;
    cat_hidratacion UUID;
    
    brand_glowhair UUID;
    brand_keila UUID;
    brand_natural UUID;
    brand_deluxe UUID;
    brand_hydra UUID;
    brand_repair UUID;
BEGIN
    -- Obtener IDs de categorías
    SELECT id INTO cat_shampoos FROM glowhair_categories WHERE slug = 'shampoos';
    SELECT id INTO cat_acondicionadores FROM glowhair_categories WHERE slug = 'acondicionadores';
    SELECT id INTO cat_mascarillas FROM glowhair_categories WHERE slug = 'mascarillas';
    SELECT id INTO cat_tratamientos FROM glowhair_categories WHERE slug = 'tratamientos';
    SELECT id INTO cat_aceites FROM glowhair_categories WHERE slug = 'aceites-capilares';
    SELECT id INTO cat_serums FROM glowhair_categories WHERE slug = 'serums';
    SELECT id INTO cat_proteccion FROM glowhair_categories WHERE slug = 'proteccion-termica';
    SELECT id INTO cat_estilizado FROM glowhair_categories WHERE slug = 'estilizado';
    SELECT id INTO cat_anticaida FROM glowhair_categories WHERE slug = 'anti-caida';
    SELECT id INTO cat_keratina FROM glowhair_categories WHERE slug = 'keratina';
    SELECT id INTO cat_hidratacion FROM glowhair_categories WHERE slug = 'hidratacion-profunda';
    
    -- Obtener IDs de marcas
    SELECT id INTO brand_glowhair FROM glowhair_brands WHERE slug = 'glowhair';
    SELECT id INTO brand_keila FROM glowhair_brands WHERE slug = 'keila-professional';
    SELECT id INTO brand_natural FROM glowhair_brands WHERE slug = 'natural-care';
    SELECT id INTO brand_deluxe FROM glowhair_brands WHERE slug = 'deluxe-liss';
    SELECT id INTO brand_hydra FROM glowhair_brands WHERE slug = 'hydra-plus';
    SELECT id INTO brand_repair FROM glowhair_brands WHERE slug = 'repair-shine';

    -- SHAMPOOS
    INSERT INTO glowhair_products (
        name, slug, description, short_description, 
        price, original_price, category_id, brand_id, 
        sku, rating, review_count, is_new, is_on_sale, is_featured,
        stock, volume, ingredients, hair_types, benefits
    ) VALUES
    (
        'Shampoo Hidratante Intensivo',
        'shampoo-hidratante-intensivo',
        'Fórmula avanzada con keratina hidrolizada y aceite de argán que limpia profundamente mientras hidrata. Perfecto para cabello seco y dañado. Sin sulfatos ni parabenos. Apto para uso diario.',
        'Shampoo hidratante con keratina y aceite de argán',
        299.00, 399.00, cat_shampoos, brand_glowhair,
        'GH-SH-001', 4.8, 156, true, true, true,
        45, '500ml',
        ARRAY['Keratina Hidrolizada', 'Aceite de Argán', 'Pantenol', 'Proteínas de Trigo', 'Vitamina E'],
        ARRAY['Seco', 'Dañado', 'Teñido'],
        ARRAY['Hidratación profunda', 'Brillo natural', 'Reparación', 'Suavidad']
    ),
    (
        'Shampoo Anti-Caída Fortalecedor',
        'shampoo-anti-caida-fortalecedor',
        'Shampoo especializado con biotina y extractos naturales que fortalece desde la raíz. Reduce la caída del cabello en un 85% en 4 semanas. Clínicamente probado.',
        'Reduce la caída del cabello con biotina',
        349.00, NULL, cat_shampoos, brand_keila,
        'KP-SH-002', 4.9, 203, false, false, true,
        30, '400ml',
        ARRAY['Biotina', 'Cafeína', 'Saw Palmetto', 'Niacinamida', 'Zinc PCA'],
        ARRAY['Débil', 'Fino', 'Con caída'],
        ARRAY['Fortalecimiento', 'Prevención de caída', 'Estimula crecimiento', 'Volumen']
    ),
    (
        'Shampoo Nutritivo con Aceite de Coco',
        'shampoo-nutritivo-coco',
        'Shampoo natural con aceite de coco virgen y aloe vera. Limpia suavemente sin resecar. Ideal para cabello rizado y afro. 95% ingredientes naturales.',
        'Shampoo natural con aceite de coco',
        279.00, NULL, cat_shampoos, brand_natural,
        'NC-SH-003', 4.7, 89, false, false, false,
        60, '500ml',
        ARRAY['Aceite de Coco Virgen', 'Aloe Vera', 'Manteca de Karité', 'Aceite de Jojoba'],
        ARRAY['Rizado', 'Afro', 'Seco'],
        ARRAY['Nutrición', 'Definición de rizos', 'Hidratación', 'Brillo']
    );

    -- ACONDICIONADORES
    INSERT INTO glowhair_products (
        name, slug, description, short_description,
        price, original_price, category_id, brand_id,
        sku, rating, review_count, is_new, is_on_sale, is_featured,
        stock, volume, ingredients, hair_types, benefits
    ) VALUES
    (
        'Acondicionador Reparador Extremo',
        'acondicionador-reparador-extremo',
        'Acondicionador intensivo con complejo de aminoácidos y ceramidas. Repara las puntas abiertas y sella la cutícula. Resultados desde la primera aplicación.',
        'Repara puntas abiertas con ceramidas',
        269.00, 329.00, cat_acondicionadores, brand_repair,
        'RS-AC-001', 4.6, 124, false, true, false,
        50, '500ml',
        ARRAY['Ceramidas', 'Aminoácidos', 'Colágeno', 'Silk Protein', 'Vitamina B5'],
        ARRAY['Dañado', 'Quebradizo', 'Procesado'],
        ARRAY['Reparación profunda', 'Sella puntas', 'Suavidad', 'Desenredo fácil']
    ),
    (
        'Acondicionador Voluminizador',
        'acondicionador-voluminizador',
        'Fórmula ligera que da volumen sin apelmazar. Con proteínas vegetales que fortalecen. Ideal para cabello fino y sin cuerpo.',
        'Da volumen a cabello fino',
        239.00, NULL, cat_acondicionadores, brand_glowhair,
        'GH-AC-002', 4.5, 67, true, false, false,
        40, '400ml',
        ARRAY['Proteínas de Arroz', 'Colágeno Vegetal', 'Extracto de Bambú', 'Biotina'],
        ARRAY['Fino', 'Sin volumen', 'Lacio'],
        ARRAY['Volumen natural', 'Cuerpo', 'Ligereza', 'Fortalecimiento']
    );

    -- MASCARILLAS
    INSERT INTO glowhair_products (
        name, slug, description, short_description,
        price, original_price, category_id, brand_id,
        sku, rating, review_count, is_new, is_on_sale, is_featured,
        stock, volume, ingredients, hair_types, benefits
    ) VALUES
    (
        'Mascarilla Hidratación Extrema',
        'mascarilla-hidratacion-extrema',
        'Tratamiento intensivo semanal con manteca de karité y aceites nutritivos. Transforma el cabello seco en sedoso y manejable. Uso semanal.',
        'Hidratación extrema con manteca de karité',
        449.00, 599.00, cat_mascarillas, brand_hydra,
        'HP-MA-001', 4.9, 289, false, true, true,
        35, '300ml',
        ARRAY['Manteca de Karité', 'Aceite de Macadamia', 'Aceite de Aguacate', 'Keratina', 'Ácido Hialurónico'],
        ARRAY['Muy seco', 'Dañado', 'Encrespado'],
        ARRAY['Hidratación profunda', 'Suavidad extrema', 'Brillo', 'Control de frizz']
    ),
    (
        'Mascarilla Reconstructora de Keratina',
        'mascarilla-reconstructora-keratina',
        'Mascarilla profesional con keratina pura que reconstruye la fibra capilar. Ideal para cabellos muy dañados por químicos o calor.',
        'Reconstruye con keratina pura',
        549.00, NULL, cat_mascarillas, brand_deluxe,
        'DL-MA-002', 4.8, 198, true, false, true,
        25, '250ml',
        ARRAY['Keratina Hidrolizada', 'Cistina', 'Colágeno', 'Aminoácidos', 'Pantenol'],
        ARRAY['Extremadamente dañado', 'Procesado', 'Decolorado'],
        ARRAY['Reconstrucción', 'Alisado', 'Suavidad', 'Brillo intenso']
    );

    -- TRATAMIENTOS
    INSERT INTO glowhair_products (
        name, slug, description, short_description,
        price, original_price, category_id, brand_id,
        sku, rating, review_count, is_new, is_on_sale, is_featured,
        stock, volume, ingredients, hair_types, benefits
    ) VALUES
    (
        'Tratamiento Anti-Caída 12 Semanas',
        'tratamiento-anti-caida-12-semanas',
        'Programa completo de 12 semanas con minoxidil y extractos naturales. Estimula el crecimiento y reduce la caída progresivamente.',
        'Programa anti-caída de 12 semanas',
        899.00, 1199.00, cat_tratamientos, brand_keila,
        'KP-TR-001', 4.7, 145, false, true, false,
        20, '90ml x 12',
        ARRAY['Minoxidil 5%', 'Biotina', 'Cafeína', 'Saw Palmetto', 'Adenosina'],
        ARRAY['Con caída', 'Debilitado'],
        ARRAY['Reduce caída', 'Estimula crecimiento', 'Fortalece raíz', 'Mayor densidad']
    );

    -- ACEITES CAPILARES
    INSERT INTO glowhair_products (
        name, slug, description, short_description,
        price, original_price, category_id, brand_id,
        sku, rating, review_count, is_new, is_on_sale, is_featured,
        stock, volume, ingredients, hair_types, benefits
    ) VALUES
    (
        'Aceite de Argán Marroquí Puro',
        'aceite-argan-marroqui-puro',
        'Aceite de argán 100% puro extraído en frío. Rico en vitamina E y ácidos grasos. Múltiples usos: puntas, pre-shampoo, styling.',
        'Aceite de argán 100% puro',
        429.00, NULL, cat_aceites, brand_natural,
        'NC-OI-001', 4.9, 234, false, false, true,
        40, '50ml',
        ARRAY['Aceite de Argán Puro 100%', 'Vitamina E Natural', 'Omega 6', 'Omega 9'],
        ARRAY['Todos los tipos'],
        ARRAY['Brillo extremo', 'Nutrición', 'Suavidad', 'Anti-frizz']
    ),
    (
        'Aceite Reparador Nocturno',
        'aceite-reparador-nocturno',
        'Blend de 7 aceites naturales para tratamiento nocturno. Repara mientras duermes. Aroma relajante de lavanda.',
        'Blend de 7 aceites para tratamiento nocturno',
        389.00, 459.00, cat_aceites, brand_glowhair,
        'GH-OI-002', 4.6, 112, true, true, false,
        30, '100ml',
        ARRAY['Aceite de Argán', 'Aceite de Coco', 'Aceite de Jojoba', 'Aceite de Almendras', 'Aceite de Lavanda'],
        ARRAY['Seco', 'Dañado'],
        ARRAY['Reparación nocturna', 'Hidratación', 'Aroma relajante', 'Brillo']
    );

    -- SERUMS
    INSERT INTO glowhair_products (
        name, slug, description, short_description,
        price, original_price, category_id, brand_id,
        sku, rating, review_count, is_new, is_on_sale, is_featured,
        stock, volume, ingredients, hair_types, benefits
    ) VALUES
    (
        'Serum Anti-Frizz Efecto Inmediato',
        'serum-anti-frizz-inmediato',
        'Serum ligero que controla el frizz al instante. Con siliconas de última generación y aceites naturales. No engrasa.',
        'Control de frizz instantáneo',
        319.00, NULL, cat_serums, brand_glowhair,
        'GH-SE-001', 4.7, 178, false, false, false,
        50, '75ml',
        ARRAY['Cyclopentasiloxane', 'Aceite de Argán', 'Vitamina E', 'Dimethicone'],
        ARRAY['Encrespado', 'Rebelde', 'Húmedo'],
        ARRAY['Control de frizz', 'Brillo', 'Suavidad', 'Protección']
    ),
    (
        'Serum Reparador de Puntas',
        'serum-reparador-puntas',
        'Serum concentrado para puntas abiertas. Sella y repara visiblemente. Con tecnología molecular para penetración profunda.',
        'Sella y repara puntas abiertas',
        279.00, 349.00, cat_serums, brand_repair,
        'RS-SE-002', 4.5, 95, false, true, false,
        45, '60ml',
        ARRAY['Ceramidas', 'Aminoácidos', 'Aceite de Argán', 'Silk Protein'],
        ARRAY['Puntas abiertas', 'Dañado'],
        ARRAY['Sella puntas', 'Reparación visible', 'Previene quiebre']
    );

    -- PROTECCIÓN TÉRMICA
    INSERT INTO glowhair_products (
        name, slug, description, short_description,
        price, original_price, category_id, brand_id,
        sku, rating, review_count, is_new, is_on_sale, is_featured,
        stock, volume, ingredients, hair_types, benefits
    ) VALUES
    (
        'Protector Térmico Spray 230°C',
        'protector-termico-spray-230',
        'Protección térmica profesional hasta 230°C. Para plancha, secadora y tenazas. Fórmula ligera que no deja residuos.',
        'Protección hasta 230°C',
        249.00, NULL, cat_proteccion, brand_keila,
        'KP-PT-001', 4.8, 167, false, false, true,
        55, '200ml',
        ARRAY['Polímeros Térmicos', 'Pantenol', 'Silk Protein', 'Vitamina E'],
        ARRAY['Todos los tipos'],
        ARRAY['Protección térmica', 'Brillo', 'Facilita planchado', 'No engrasa']
    );

    -- PRODUCTOS PARA KERATINA
    INSERT INTO glowhair_products (
        name, slug, description, short_description,
        price, original_price, category_id, brand_id,
        sku, rating, review_count, is_new, is_on_sale, is_featured,
        stock, volume, ingredients, hair_types, benefits
    ) VALUES
    (
        'Kit Keratina Brasileña Profesional',
        'kit-keratina-brasilena-profesional',
        'Kit completo de keratina brasileña para alisado permanente. Incluye shampoo clarificante, tratamiento de keratina y shampoo post-keratina. Resultados hasta 5 meses.',
        'Kit completo de keratina brasileña',
        1499.00, 1999.00, cat_keratina, brand_deluxe,
        'DL-KT-001', 4.9, 312, false, true, true,
        15, 'Kit completo',
        ARRAY['Keratina Brasileña', 'Formol bajo', 'Colágeno', 'Aminoácidos', 'Aceite de Argán'],
        ARRAY['Rizado', 'Ondulado', 'Encrespado'],
        ARRAY['Alisado permanente', 'Brillo extremo', 'Suavidad', 'Duración 5 meses']
    );

END $$;

-- ==========================================
-- INSERTAR CONFIGURACIONES DEL SITIO
-- ==========================================
INSERT INTO glowhair_site_settings (key, value, type, description, is_public) VALUES
('site_name', '"GlowHair - Tu Salón de Belleza en Casa"', 'string', 'Nombre del sitio web', true),
('site_tagline', '"Productos profesionales para el cuidado capilar"', 'string', 'Eslogan del sitio', true),
('currency', '"MXN"', 'string', 'Moneda principal', true),
('currency_symbol', '"$"', 'string', 'Símbolo de moneda', true),
('tax_rate', '16', 'number', 'Tasa de IVA en porcentaje', false),
('tax_included', 'false', 'boolean', 'Si los precios incluyen impuestos', true),
('free_shipping_threshold', '500', 'number', 'Monto mínimo para envío gratis (MXN)', true),
('shipping_cost_standard', '99', 'number', 'Costo de envío estándar (MXN)', true),
('shipping_cost_express', '199', 'number', 'Costo de envío express (MXN)', true),
('max_cart_items', '50', 'number', 'Máximo de items diferentes en el carrito', false),
('max_item_quantity', '10', 'number', 'Cantidad máxima por producto', false),
('low_stock_threshold', '10', 'number', 'Alerta de stock bajo', false),
('enable_reviews', 'true', 'boolean', 'Permitir reseñas de productos', true),
('require_review_approval', 'true', 'boolean', 'Requiere aprobación admin de reseñas', false),
('min_review_rating', '1', 'number', 'Calificación mínima (1-5)', false),
('enable_wishlist', 'true', 'boolean', 'Habilitar lista de deseos', true),
('enable_coupons', 'true', 'boolean', 'Habilitar sistema de cupones', true),
('enable_loyalty_points', 'true', 'boolean', 'Habilitar puntos de lealtad', false),
('points_per_peso', '1', 'number', 'Puntos ganados por cada peso gastado', false),
('contact_email', '"contacto@glowhair.com"', 'string', 'Email de contacto', true),
('contact_phone', '"+52 55 1234 5678"', 'string', 'Teléfono de contacto', true),
('contact_whatsapp', '"+52 55 1234 5678"', 'string', 'WhatsApp de contacto', true),
('business_hours', '"Lun-Vie: 9am-7pm, Sáb: 10am-5pm"', 'string', 'Horario de atención', true),
('facebook_url', '"https://facebook.com/glowhair"', 'string', 'URL de Facebook', true),
('instagram_url', '"https://instagram.com/glowhair"', 'string', 'URL de Instagram', true),
('tiktok_url', '"https://tiktok.com/@glowhair"', 'string', 'URL de TikTok', true),
('youtube_url', '"https://youtube.com/glowhair"', 'string', 'URL de YouTube', true);

-- ==========================================
-- INSERTAR CUPONES DE EJEMPLO
-- ==========================================
INSERT INTO glowhair_coupons (
    code, name, description, type, value, 
    min_order_amount, usage_limit, usage_limit_per_user,
    is_active, is_public, starts_at, expires_at
) VALUES
(
    'BIENVENIDO10',
    'Descuento de Bienvenida',
    '10% de descuento en tu primera compra. Válido para nuevos clientes.',
    'percentage', 10,
    200, 1000, 1,
    true, true, NOW(), NOW() + INTERVAL '1 year'
),
(
    'ENVIOGRATIS',
    'Envío Gratis',
    'Envío gratis en cualquier compra sin mínimo.',
    'free_shipping', 0,
    0, NULL, 5,
    true, true, NOW(), NOW() + INTERVAL '6 months'
),
(
    'MEGA100',
    'Mega Descuento $100',
    '$100 de descuento en compras mayores a $500',
    'fixed_amount', 100,
    500, 500, 1,
    true, true, NOW(), NOW() + INTERVAL '3 months'
),
(
    'KEILA20',
    'Especial Keila',
    '20% de descuento en productos seleccionados',
    'percentage', 20,
    300, 200, 2,
    true, false, NOW(), NOW() + INTERVAL '1 month'
),
(
    'VERANO2025',
    'Promoción de Verano',
    '15% de descuento en toda la tienda',
    'percentage', 15,
    400, NULL, 3,
    true, true, NOW(), NOW() + INTERVAL '3 months'
);

-- ==========================================
-- PARTE 5: USUARIO ADMINISTRADOR KEILA
-- ==========================================

-- INSTRUCCIONES PARA CREAR USUARIO KEILA:
-- 
-- El usuario administrador debe crearse desde Supabase Dashboard:
-- 1. Ve a: Authentication > Users > "Add user"
-- 2. Email: keila@glowhair.com
-- 3. Password: Keila2025!
-- 4. Confirmar email: marcar checkbox "Auto Confirm User"
-- 
-- Después de crear el usuario, ejecuta la siguiente línea:

-- SELECT glowhair_make_user_admin('keila@glowhair.com');

-- Esto convertirá al usuario en Super Administrador con todos los permisos

-- ==========================================
-- VERIFICACIÓN ALTERNATIVA: Si ya existe el usuario
-- ==========================================

DO $$
DECLARE
    keila_user_id UUID;
    keila_email TEXT := 'keila@glowhair.com';
BEGIN
    -- Buscar si ya existe el usuario Keila
    SELECT id INTO keila_user_id
    FROM auth.users
    WHERE email = keila_email;
    
    IF keila_user_id IS NOT NULL THEN
        -- Si existe, convertirlo en admin automáticamente
        PERFORM glowhair_make_user_admin(keila_email);
        
        RAISE NOTICE '✅ Usuario Keila encontrado y configurado como administrador';
    ELSE
        RAISE NOTICE '⚠️  Usuario Keila NO encontrado';
        RAISE NOTICE '📝 INSTRUCCIONES PARA CREAR USUARIO ADMINISTRADOR:';
        RAISE NOTICE '';
        RAISE NOTICE '1. Ve a Supabase Dashboard > Authentication > Users';
        RAISE NOTICE '2. Haz clic en "Add user"';
        RAISE NOTICE '3. Completa los datos:';
        RAISE NOTICE '   - Email: keila@glowhair.com';
        RAISE NOTICE '   - Password: Keila2025!';
        RAISE NOTICE '   - Auto Confirm User: ✓ (marcar checkbox)';
        RAISE NOTICE '4. Haz clic en "Create user"';
        RAISE NOTICE '5. Ejecuta este comando SQL:';
        RAISE NOTICE '';
        RAISE NOTICE '   SELECT glowhair_make_user_admin(''keila@glowhair.com'');';
        RAISE NOTICE '';
    END IF;
END $$;

-- ==========================================
-- FINALIZADO: PARTE 5 - USUARIO ADMINISTRADOR
-- ==========================================

-- ==========================================
-- PARTE 6: VERIFICACIÓN Y REPORTE FINAL
-- ==========================================

DO $$
DECLARE
    table_count INTEGER;
    product_count INTEGER;
    category_count INTEGER;
    brand_count INTEGER;
    coupon_count INTEGER;
    setting_count INTEGER;
    keila_exists BOOLEAN;
    keila_role TEXT;
BEGIN
    -- Contar tablas creadas
    SELECT COUNT(*) INTO table_count
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      AND table_name LIKE 'glowhair_%';
    
    -- Contar registros insertados
    SELECT COUNT(*) INTO product_count FROM glowhair_products;
    SELECT COUNT(*) INTO category_count FROM glowhair_categories;
    SELECT COUNT(*) INTO brand_count FROM glowhair_brands;
    SELECT COUNT(*) INTO coupon_count FROM glowhair_coupons;
    SELECT COUNT(*) INTO setting_count FROM glowhair_site_settings;
    
    -- Verificar usuario Keila
    SELECT 
        EXISTS(SELECT 1 FROM auth.users WHERE email = 'keila@glowhair.com'),
        (SELECT role FROM glowhair_profiles WHERE email = 'keila@glowhair.com')
    INTO keila_exists, keila_role;
    
    RAISE NOTICE '';
    RAISE NOTICE '╔════════════════════════════════════════════════════════════════╗';
    RAISE NOTICE '║                                                                ║';
    RAISE NOTICE '║        🎉 GLOWHAIR E-COMMERCE - INSTALACIÓN COMPLETADA 🎉      ║';
    RAISE NOTICE '║                                                                ║';
    RAISE NOTICE '╚════════════════════════════════════════════════════════════════╝';
    RAISE NOTICE '';
    RAISE NOTICE '📊 ESTADÍSTICAS DE INSTALACIÓN:';
    RAISE NOTICE '   ├─ Tablas creadas: % (con prefijo glowhair_)', table_count;
    RAISE NOTICE '   ├─ Productos insertados: %', product_count;
    RAISE NOTICE '   ├─ Categorías creadas: %', category_count;
    RAISE NOTICE '   ├─ Marcas creadas: %', brand_count;
    RAISE NOTICE '   ├─ Cupones activos: %', coupon_count;
    RAISE NOTICE '   └─ Configuraciones: %', setting_count;
    RAISE NOTICE '';
    RAISE NOTICE '⚙️  COMPONENTES INSTALADOS:';
    RAISE NOTICE '   ✅ Estructura de tablas completa';
    RAISE NOTICE '   ✅ Funciones y triggers configurados';
    RAISE NOTICE '   ✅ Row Level Security (RLS) habilitado';
    RAISE NOTICE '   ✅ Índices de rendimiento creados';
    RAISE NOTICE '   ✅ Datos de ejemplo insertados';
    RAISE NOTICE '   ✅ Sistema de inventario automático';
    RAISE NOTICE '   ✅ Sistema de reseñas y calificaciones';
    RAISE NOTICE '   ✅ Sistema de cupones y descuentos';
    RAISE NOTICE '   ✅ Sistema de notificaciones';
    RAISE NOTICE '';
    
    IF keila_exists THEN
        RAISE NOTICE '👤 USUARIO ADMINISTRADOR:';
        RAISE NOTICE '   ✅ Usuario Keila encontrado';
        RAISE NOTICE '   ├─ Email: keila@glowhair.com';
        RAISE NOTICE '   ├─ Rol actual: %', COALESCE(keila_role, 'NO CONFIGURADO');
        IF keila_role IN ('admin', 'super_admin') THEN
            RAISE NOTICE '   └─ Estado: ✅ CONFIGURADO CORRECTAMENTE';
        ELSE
            RAISE NOTICE '   └─ Estado: ⚠️  NECESITA CONFIGURACIÓN';
            RAISE NOTICE '';
            RAISE NOTICE '   Ejecuta: SELECT glowhair_make_user_admin(''keila@glowhair.com'');';
        END IF;
    ELSE
        RAISE NOTICE '⚠️  PENDIENTE - CREAR USUARIO ADMINISTRADOR:';
        RAISE NOTICE '';
        RAISE NOTICE '   📝 PASOS PARA CREAR USUARIO KEILA:';
        RAISE NOTICE '   1. Supabase Dashboard > Authentication > Users';
        RAISE NOTICE '   2. Click en "Add user"';
        RAISE NOTICE '   3. Email: keila@glowhair.com';
        RAISE NOTICE '   4. Password: Keila2025!';
        RAISE NOTICE '   5. Marcar: Auto Confirm User ✓';
        RAISE NOTICE '   6. Click "Create user"';
        RAISE NOTICE '   7. Ejecutar SQL:';
        RAISE NOTICE '      SELECT glowhair_make_user_admin(''keila@glowhair.com'');';
    END IF;
    
    RAISE NOTICE '';
    RAISE NOTICE '🛍️  FUNCIONALIDADES DEL E-COMMERCE:';
    RAISE NOTICE '   ✅ Gestión de productos (CRUD completo)';
    RAISE NOTICE '   ✅ Categorías y marcas';
    RAISE NOTICE '   ✅ Carrito de compras por usuario';
    RAISE NOTICE '   ✅ Lista de favoritos';
    RAISE NOTICE '   ✅ Sistema de órdenes completo';
    RAISE NOTICE '   ✅ Múltiples direcciones de envío';
    RAISE NOTICE '   ✅ Cupones de descuento (porcentaje, monto fijo, envío gratis)';
    RAISE NOTICE '   ✅ Reseñas y calificaciones de productos';
    RAISE NOTICE '   ✅ Control de inventario con historial';
    RAISE NOTICE '   ✅ Notificaciones para usuarios';
    RAISE NOTICE '   ✅ Sistema de administración con roles';
    RAISE NOTICE '   ✅ Configuraciones del sitio';
    RAISE NOTICE '   ✅ Newsletter y campañas de email';
    RAISE NOTICE '';
    RAISE NOTICE '🎯 PRODUCTOS ESPECÍFICOS PARA CABELLO:';
    RAISE NOTICE '   ├─ Tipos de cabello (seco, graso, rizado, etc.)';
    RAISE NOTICE '   ├─ Ingredientes naturales';
    RAISE NOTICE '   ├─ Beneficios específicos';
    RAISE NOTICE '   ├─ Volúmenes y presentaciones';
    RAISE NOTICE '   └─ Instrucciones de uso';
    RAISE NOTICE '';
    RAISE NOTICE '📋 PRÓXIMOS PASOS:';
    
    IF NOT keila_exists THEN
        RAISE NOTICE '   1. ⚠️  CREAR usuario administrador Keila';
    ELSE
        RAISE NOTICE '   1. ✅ Usuario administrador creado';
    END IF;
    
    RAISE NOTICE '   2. 🔄 Actualizar variables de entorno en tu proyecto:';
    RAISE NOTICE '      - NEXT_PUBLIC_SUPABASE_URL';
    RAISE NOTICE '      - NEXT_PUBLIC_SUPABASE_ANON_KEY';
    RAISE NOTICE '   3. 🚀 Iniciar aplicación: npm run dev';
    RAISE NOTICE '   4. 🔐 Login en /login con credenciales de Keila';
    RAISE NOTICE '   5. 👨‍💼 Acceder al panel de administración en /admin';
    RAISE NOTICE '   6. ➕ Agregar más productos según necesites';
    RAISE NOTICE '';
    RAISE NOTICE '📚 TABLAS PRINCIPALES CREADAS:';
    RAISE NOTICE '   ├─ glowhair_products (productos)';
    RAISE NOTICE '   ├─ glowhair_categories (categorías)';
    RAISE NOTICE '   ├─ glowhair_brands (marcas)';
    RAISE NOTICE '   ├─ glowhair_profiles (perfiles de usuario)';
    RAISE NOTICE '   ├─ glowhair_cart_items (carrito)';
    RAISE NOTICE '   ├─ glowhair_favorites (favoritos)';
    RAISE NOTICE '   ├─ glowhair_orders (órdenes)';
    RAISE NOTICE '   ├─ glowhair_order_items (items de órdenes)';
    RAISE NOTICE '   ├─ glowhair_addresses (direcciones)';
    RAISE NOTICE '   ├─ glowhair_reviews (reseñas)';
    RAISE NOTICE '   ├─ glowhair_coupons (cupones)';
    RAISE NOTICE '   ├─ glowhair_notifications (notificaciones)';
    RAISE NOTICE '   ├─ glowhair_inventory_movements (inventario)';
    RAISE NOTICE '   ├─ glowhair_admin_users (administradores)';
    RAISE NOTICE '   └─ glowhair_site_settings (configuraciones)';
    RAISE NOTICE '';
    RAISE NOTICE '💡 TIPS DE USO:';
    RAISE NOTICE '   • Todos los precios están en MXN (Pesos Mexicanos)';
    RAISE NOTICE '   • Envío gratis en compras mayores a $500';
    RAISE NOTICE '   • Las reseñas requieren aprobación de admin';
    RAISE NOTICE '   • El stock se actualiza automáticamente con las órdenes';
    RAISE NOTICE '   • Los cupones tienen límites de uso configurables';
    RAISE NOTICE '';
    RAISE NOTICE '🔒 SEGURIDAD:';
    RAISE NOTICE '   ✅ Row Level Security habilitado en todas las tablas';
    RAISE NOTICE '   ✅ Usuarios solo ven sus propios datos';
    RAISE NOTICE '   ✅ Admins tienen acceso completo según permisos';
    RAISE NOTICE '   ✅ Triggers para mantener integridad de datos';
    RAISE NOTICE '';
    RAISE NOTICE '📞 CONTACTO CONFIGURADO:';
    RAISE NOTICE '   Email: contacto@glowhair.com';
    RAISE NOTICE '   Teléfono: +52 55 1234 5678';
    RAISE NOTICE '   WhatsApp: +52 55 1234 5678';
    RAISE NOTICE '';
    RAISE NOTICE '🌟 ¡BASE DE DATOS LISTA PARA PRODUCCIÓN!';
    RAISE NOTICE '';
    RAISE NOTICE '═══════════════════════════════════════════════════════════════';
    RAISE NOTICE '';

END $$;

-- ==========================================
-- 🎉 INSTALACIÓN COMPLETADA EXITOSAMENTE 🎉
-- ==========================================

-- Este script ha creado una base de datos completa para un e-commerce
-- de productos capilares con todas las funcionalidades necesarias:
--
-- ✅ 20 tablas con prefijo "glowhair_"
-- ✅ Funciones automáticas (triggers)
-- ✅ Seguridad (RLS)
-- ✅ Datos de ejemplo
-- ✅ Índices de rendimiento
-- ✅ Sistema de inventario
-- ✅ Sistema de órdenes
-- ✅ Sistema de reseñas
-- ✅ Sistema de cupones
-- ✅ Sistema de notificaciones
-- ✅ Panel de administración
--
-- RECUERDA: Crear el usuario administrador Keila siguiendo las
-- instrucciones mostradas en el reporte arriba.
--
-- ¡Disfruta tu nuevo e-commerce GlowHair! 💇‍♀️✨

-- =====================================================
-- COMPLETE E-COMMERCE DATABASE SCHEMA
-- Samsung Shop - Optimized for Frontend Performance
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- CORE TABLES
-- =====================================================

-- Profiles/Users Table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Basic Info
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  
  -- Role Management
  role TEXT DEFAULT 'customer',
  -- Roles: admin, manager, staff, customer
  
  -- User Status
  is_active BOOLEAN DEFAULT true,
  is_verified BOOLEAN DEFAULT false,
  
  -- Activity Tracking
  last_login TIMESTAMP WITH TIME ZONE,
  login_count INTEGER DEFAULT 0,
  
  -- Admin Notes
  notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT valid_role CHECK (role IN ('admin', 'manager', 'staff', 'customer'))
);

-- =====================================================
-- CATEGORIES
-- =====================================================

CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Basic Info
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  image_url TEXT,
  
  -- Hierarchy
  parent_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  level INTEGER DEFAULT 0,
  display_order INTEGER DEFAULT 0,
  
  -- Meta
  status TEXT DEFAULT 'published',
  meta_title TEXT,
  meta_description TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT valid_status CHECK (status IN ('published', 'draft', 'archived'))
);

-- =====================================================
-- PRODUCTS
-- =====================================================

CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Basic Info
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  short_description TEXT,
  sku TEXT UNIQUE,
  
  -- Category
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  
  -- Pricing
  price DECIMAL(10, 2) NOT NULL,
  compare_at_price DECIMAL(10, 2), -- Original price for discounts
  cost_price DECIMAL(10, 2), -- For profit calculations
  
  -- Inventory
  quantity INTEGER DEFAULT 0,
  low_stock_threshold INTEGER DEFAULT 5,
  track_inventory BOOLEAN DEFAULT true,
  allow_backorder BOOLEAN DEFAULT false,
  
  -- Product Flags
  is_featured BOOLEAN DEFAULT false,
  is_bestseller BOOLEAN DEFAULT false,
  is_new_arrival BOOLEAN DEFAULT false,
  on_sale BOOLEAN DEFAULT false,
  
  -- Media
  featured_image TEXT,
  gallery_images TEXT[], -- Array of image URLs
  video_url TEXT,
  
  -- SEO
  meta_title TEXT,
  meta_description TEXT,
  meta_keywords TEXT[],
  
  -- Shipping
  weight DECIMAL(10, 3), -- in kg
  dimensions JSONB, -- {length, width, height}
  requires_shipping BOOLEAN DEFAULT true,
  shipping_class TEXT, -- standard, express, fragile
  
  -- Status
  status TEXT DEFAULT 'published',
  visibility TEXT DEFAULT 'visible',
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  published_at TIMESTAMP WITH TIME ZONE,
  
  -- Constraints
  CONSTRAINT valid_status CHECK (status IN ('published', 'draft', 'archived', 'out_of_stock')),
  CONSTRAINT valid_visibility CHECK (visibility IN ('visible', 'hidden', 'search_only')),
  CONSTRAINT positive_price CHECK (price >= 0),
  CONSTRAINT positive_quantity CHECK (quantity >= 0)
);

-- =====================================================
-- PRODUCT SPECIFICATIONS
-- =====================================================

CREATE TABLE IF NOT EXISTS product_specifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  
  -- Spec Group (e.g., "Display", "Memory", "Camera", "Battery")
  spec_group TEXT NOT NULL,
  group_order INTEGER DEFAULT 0,
  
  -- Spec Details
  spec_key TEXT NOT NULL, -- e.g., "Screen Size", "RAM", "Storage"
  spec_value TEXT NOT NULL, -- e.g., "6.7 inches", "12GB", "512GB"
  spec_order INTEGER DEFAULT 0,
  
  -- Additional Info
  spec_icon TEXT, -- Optional icon identifier
  is_highlight BOOLEAN DEFAULT false, -- Show in quick specs
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure no duplicate specs per product
  CONSTRAINT unique_product_spec UNIQUE (product_id, spec_group, spec_key)
);

-- =====================================================
-- PRODUCT REVIEWS
-- =====================================================

CREATE TABLE IF NOT EXISTS product_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  
  -- Reviewer Info
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  reviewer_name TEXT NOT NULL,
  reviewer_email TEXT,
  
  -- Review Content
  rating INTEGER NOT NULL,
  title TEXT,
  comment TEXT NOT NULL,
  
  -- Verification
  is_verified_purchase BOOLEAN DEFAULT false,
  
  -- Media
  images TEXT[], -- Array of review image URLs
  
  -- Moderation
  status TEXT DEFAULT 'pending',
  moderated_by UUID REFERENCES profiles(id),
  moderation_notes TEXT,
  
  -- Helpfulness
  helpful_count INTEGER DEFAULT 0,
  not_helpful_count INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT valid_rating CHECK (rating >= 1 AND rating <= 5),
  CONSTRAINT valid_review_status CHECK (status IN ('pending', 'approved', 'rejected', 'spam'))
);

-- =====================================================
-- REVIEW HELPFULNESS VOTES
-- =====================================================

CREATE TABLE IF NOT EXISTS review_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id UUID NOT NULL REFERENCES product_reviews(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  
  is_helpful BOOLEAN NOT NULL, -- true = helpful, false = not helpful
  ip_address INET, -- For guest tracking
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Prevent duplicate votes
  CONSTRAINT unique_review_vote UNIQUE (review_id, user_id, ip_address)
);

-- =====================================================
-- PAGES (CMS)
-- =====================================================

CREATE TABLE IF NOT EXISTS pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Basic Info
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content TEXT,
  excerpt TEXT,
  
  -- Page Type
  template TEXT DEFAULT 'default',
  -- Templates: default, about, contact, faq, terms, privacy
  
  -- SEO
  meta_title TEXT,
  meta_description TEXT,
  
  -- Status
  status TEXT DEFAULT 'published',
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  published_at TIMESTAMP WITH TIME ZONE,
  
  CONSTRAINT valid_page_status CHECK (status IN ('published', 'draft', 'archived'))
);

-- =====================================================
-- ORDERS
-- =====================================================

CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE NOT NULL,
  
  -- Customer Info
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  
  -- Delivery Address (Google Maps Integration)
  delivery_location TEXT NOT NULL,
  delivery_lat DECIMAL(10, 8),
  delivery_lng DECIMAL(11, 8),
  delivery_place_id TEXT,
  delivery_notes TEXT,
  
  -- Order Totals
  subtotal DECIMAL(10, 2) NOT NULL,
  discount_amount DECIMAL(10, 2) DEFAULT 0,
  tax_amount DECIMAL(10, 2) DEFAULT 0,
  shipping_fee DECIMAL(10, 2) DEFAULT 0,
  total DECIMAL(10, 2) NOT NULL,
  
  -- Discount/Coupon
  coupon_code TEXT,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'pending',
  -- Status flow: pending → confirmed → processing → shipped → delivered
  -- Can also be: cancelled, refunded
  
  -- Payment
  payment_method TEXT NOT NULL,
  payment_status TEXT DEFAULT 'pending',
  payment_reference TEXT,
  
  -- Fulfillment
  tracking_number TEXT,
  carrier TEXT,
  estimated_delivery DATE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  
  -- Notes
  customer_notes TEXT,
  staff_notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT valid_order_status CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded')),
  CONSTRAINT valid_payment_status CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded', 'partially_refunded')),
  CONSTRAINT valid_payment_method CHECK (payment_method IN ('cash_on_delivery', 'mpesa', 'card', 'bank_transfer'))
);

-- =====================================================
-- ORDER ITEMS
-- =====================================================

CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  
  -- Product Snapshot (at time of order)
  product_title TEXT NOT NULL,
  product_slug TEXT NOT NULL,
  product_image TEXT,
  product_sku TEXT,
  
  -- Pricing (at time of order)
  unit_price DECIMAL(10, 2) NOT NULL,
  quantity INTEGER NOT NULL,
  subtotal DECIMAL(10, 2) NOT NULL,
  discount_amount DECIMAL(10, 2) DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT positive_quantity CHECK (quantity > 0),
  CONSTRAINT positive_price CHECK (unit_price >= 0)
);

-- =====================================================
-- ORDER STATUS HISTORY
-- =====================================================

CREATE TABLE IF NOT EXISTS order_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  
  status TEXT NOT NULL,
  notes TEXT,
  
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- USER ACTIVITY LOGS
-- =====================================================

CREATE TABLE IF NOT EXISTS user_activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  
  -- Activity Details
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  entity_name TEXT,
  
  -- Change Tracking
  changes JSONB,
  
  -- Context
  ip_address INET,
  user_agent TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- USER SESSIONS
-- =====================================================

CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  session_token TEXT UNIQUE NOT NULL,
  ip_address INET,
  user_agent TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  
  CONSTRAINT valid_expiry CHECK (expires_at > created_at)
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Profiles
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_is_active ON profiles(is_active);

-- Categories
CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_categories_parent_id ON categories(parent_id);
CREATE INDEX idx_categories_level ON categories(level);
CREATE INDEX idx_categories_display_order ON categories(display_order);
CREATE INDEX idx_categories_status ON categories(status);

-- Products
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_is_featured ON products(is_featured) WHERE is_featured = true;
CREATE INDEX idx_products_is_bestseller ON products(is_bestseller) WHERE is_bestseller = true;
CREATE INDEX idx_products_on_sale ON products(on_sale) WHERE on_sale = true;
CREATE INDEX idx_products_created_at ON products(created_at DESC);
CREATE INDEX idx_products_price ON products(price);

-- Product Specifications
CREATE INDEX idx_product_specs_product_id ON product_specifications(product_id);
CREATE INDEX idx_product_specs_group ON product_specifications(spec_group);
CREATE INDEX idx_product_specs_is_highlight ON product_specifications(is_highlight) WHERE is_highlight = true;

-- Product Reviews
CREATE INDEX idx_reviews_product_id ON product_reviews(product_id);
CREATE INDEX idx_reviews_user_id ON product_reviews(user_id);
CREATE INDEX idx_reviews_status ON product_reviews(status);
CREATE INDEX idx_reviews_rating ON product_reviews(rating);
CREATE INDEX idx_reviews_created_at ON product_reviews(created_at DESC);

-- Review Votes
CREATE INDEX idx_review_votes_review_id ON review_votes(review_id);
CREATE INDEX idx_review_votes_user_id ON review_votes(user_id);

-- Pages
CREATE INDEX idx_pages_slug ON pages(slug);
CREATE INDEX idx_pages_status ON pages(status);

-- Orders
CREATE INDEX idx_orders_order_number ON orders(order_number);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_customer_email ON orders(customer_email);
CREATE INDEX idx_orders_customer_phone ON orders(customer_phone);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_payment_status ON orders(payment_status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);

-- Order Items
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);

-- Order Status History
CREATE INDEX idx_order_status_history_order_id ON order_status_history(order_id);

-- Activity Logs
CREATE INDEX idx_activity_logs_user_id ON user_activity_logs(user_id);
CREATE INDEX idx_activity_logs_action ON user_activity_logs(action);
CREATE INDEX idx_activity_logs_entity_type ON user_activity_logs(entity_type);
CREATE INDEX idx_activity_logs_created_at ON user_activity_logs(created_at DESC);

-- Sessions
CREATE INDEX idx_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_sessions_token ON user_sessions(session_token);
CREATE INDEX idx_sessions_last_activity ON user_sessions(last_activity DESC);

-- =====================================================
-- UTILITY FUNCTIONS
-- =====================================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Generate order number (ORD-YYYYMMDD-XXXX)
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
DECLARE
  today TEXT;
  count INTEGER;
  order_num TEXT;
BEGIN
  today := TO_CHAR(NOW(), 'YYYYMMDD');
  
  SELECT COUNT(*) INTO count
  FROM orders
  WHERE order_number LIKE 'ORD-' || today || '-%';
  
  order_num := 'ORD-' || today || '-' || LPAD((count + 1)::TEXT, 4, '0');
  
  RETURN order_num;
END;
$$ LANGUAGE plpgsql;

-- Get category path (breadcrumb)
CREATE OR REPLACE FUNCTION get_category_path(category_id UUID)
RETURNS TEXT AS $$
DECLARE
  path TEXT := '';
  current_id UUID := category_id;
  current_name TEXT;
  current_parent UUID;
BEGIN
  LOOP
    SELECT name, parent_id INTO current_name, current_parent
    FROM categories
    WHERE id = current_id;
    
    IF current_name IS NULL THEN
      EXIT;
    END IF;
    
    IF path = '' THEN
      path := current_name;
    ELSE
      path := current_name || ' > ' || path;
    END IF;
    
    IF current_parent IS NULL THEN
      EXIT;
    END IF;
    
    current_id := current_parent;
  END LOOP;
  
  RETURN path;
END;
$$ LANGUAGE plpgsql;

-- Get all subcategories (recursive)
CREATE OR REPLACE FUNCTION get_subcategories(parent_category_id UUID)
RETURNS TABLE(id UUID, name TEXT, slug TEXT, level INTEGER) AS $$
BEGIN
  RETURN QUERY
  WITH RECURSIVE subcats AS (
    SELECT c.id, c.name, c.slug, c.level, c.parent_id
    FROM categories c
    WHERE c.parent_id = parent_category_id
    
    UNION ALL
    
    SELECT c.id, c.name, c.slug, c.level, c.parent_id
    FROM categories c
    INNER JOIN subcats s ON c.parent_id = s.id
  )
  SELECT subcats.id, subcats.name, subcats.slug, subcats.level
  FROM subcats
  ORDER BY subcats.level, subcats.name;
END;
$$ LANGUAGE plpgsql;

-- Inventory Management: Decrement quantity
CREATE OR REPLACE FUNCTION decrement_product_quantity(
  product_id UUID,
  quantity_to_remove INTEGER
)
RETURNS VOID AS $$
BEGIN
  UPDATE products
  SET quantity = quantity - quantity_to_remove
  WHERE id = product_id
  AND quantity >= quantity_to_remove;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Insufficient stock for product %', product_id;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Inventory Management: Increment quantity
CREATE OR REPLACE FUNCTION increment_product_quantity(
  product_id UUID,
  quantity_to_add INTEGER
)
RETURNS VOID AS $$
BEGIN
  UPDATE products
  SET quantity = quantity + quantity_to_add
  WHERE id = product_id;
END;
$$ LANGUAGE plpgsql;

-- Log user activity
CREATE OR REPLACE FUNCTION log_user_activity(
  p_user_id UUID,
  p_action TEXT,
  p_entity_type TEXT DEFAULT NULL,
  p_entity_id UUID DEFAULT NULL,
  p_entity_name TEXT DEFAULT NULL,
  p_changes JSONB DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO user_activity_logs (
    user_id,
    action,
    entity_type,
    entity_id,
    entity_name,
    changes
  ) VALUES (
    p_user_id,
    p_action,
    p_entity_type,
    p_entity_id,
    p_entity_name,
    p_changes
  );
END;
$$ LANGUAGE plpgsql;

-- Get product average rating
CREATE OR REPLACE FUNCTION get_product_avg_rating(p_product_id UUID)
RETURNS NUMERIC AS $$
DECLARE
  avg_rating NUMERIC;
BEGIN
  SELECT ROUND(AVG(rating)::NUMERIC, 2) INTO avg_rating
  FROM product_reviews
  WHERE product_id = p_product_id
  AND status = 'approved';
  
  RETURN COALESCE(avg_rating, 0);
END;
$$ LANGUAGE plpgsql;

-- Get product review count
CREATE OR REPLACE FUNCTION get_product_review_count(p_product_id UUID)
RETURNS INTEGER AS $$
DECLARE
  review_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO review_count
  FROM product_reviews
  WHERE product_id = p_product_id
  AND status = 'approved';
  
  RETURN COALESCE(review_count, 0);
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Auto-update updated_at for tables
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at
  BEFORE UPDATE ON product_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pages_updated_at
  BEFORE UPDATE ON pages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Auto-generate order number
CREATE OR REPLACE FUNCTION set_order_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.order_number IS NULL OR NEW.order_number = '' THEN
    NEW.order_number := generate_order_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_order_number
  BEFORE INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION set_order_number();

-- Track order status changes
CREATE OR REPLACE FUNCTION track_order_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status) OR TG_OP = 'INSERT' THEN
    INSERT INTO order_status_history (order_id, status, notes)
    VALUES (NEW.id, NEW.status, 'Status changed to ' || NEW.status);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_track_order_status
  AFTER INSERT OR UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION track_order_status_change();

-- Update review helpfulness counts
CREATE OR REPLACE FUNCTION update_review_helpfulness()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.is_helpful THEN
      UPDATE product_reviews
      SET helpful_count = helpful_count + 1
      WHERE id = NEW.review_id;
    ELSE
      UPDATE product_reviews
      SET not_helpful_count = not_helpful_count + 1
      WHERE id = NEW.review_id;
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.is_helpful THEN
      UPDATE product_reviews
      SET helpful_count = helpful_count - 1
      WHERE id = OLD.review_id;
    ELSE
      UPDATE product_reviews
      SET not_helpful_count = not_helpful_count - 1
      WHERE id = OLD.review_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_review_helpfulness
  AFTER INSERT OR DELETE ON review_votes
  FOR EACH ROW
  EXECUTE FUNCTION update_review_helpfulness();

-- =====================================================
-- OPTIMIZED VIEWS FOR FRONTEND
-- =====================================================

-- Products with all related data (for product listing pages)
CREATE OR REPLACE VIEW products_with_details AS
SELECT 
  p.*,
  c.name as category_name,
  c.slug as category_slug,
  get_product_avg_rating(p.id) as avg_rating,
  get_product_review_count(p.id) as review_count,
  CASE 
    WHEN p.compare_at_price IS NOT NULL AND p.compare_at_price > p.price 
    THEN ROUND(((p.compare_at_price - p.price) / p.compare_at_price * 100)::NUMERIC, 0)
    ELSE 0
  END as discount_percentage,
  CASE 
    WHEN p.quantity <= 0 THEN 'out_of_stock'
    WHEN p.quantity <= p.low_stock_threshold THEN 'low_stock'
    ELSE 'in_stock'
  END as stock_status
FROM products p
LEFT JOIN categories c ON p.category_id = c.id;

-- Categories with product counts
CREATE OR REPLACE VIEW categories_with_counts AS
SELECT 
  c.*,
  COUNT(DISTINCT p.id) as product_count,
  p_parent.name as parent_name,
  p_parent.slug as parent_slug
FROM categories c
LEFT JOIN products p ON p.category_id = c.id AND p.status = 'published'
LEFT JOIN categories p_parent ON c.parent_id = p_parent.id
GROUP BY c.id, p_parent.name, p_parent.slug;

-- Orders with customer details
CREATE OR REPLACE VIEW orders_with_details AS
SELECT 
  o.*,
  u.full_name as user_full_name,
  u.email as user_email,
  COUNT(oi.id) as item_count
FROM orders o
LEFT JOIN profiles u ON o.user_id = u.id
LEFT JOIN order_items oi ON o.id = oi.order_id
GROUP BY o.id, u.full_name, u.email;

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_specifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Categories Policies (Public read, Admin write)
CREATE POLICY "Categories are viewable by everyone"
  ON categories FOR SELECT
  USING (status = 'published' OR auth.role() = 'authenticated');

CREATE POLICY "Admins can manage categories"
  ON categories FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'manager')
    )
  );

-- Products Policies (Public read, Admin write)
CREATE POLICY "Published products are viewable by everyone"
  ON products FOR SELECT
  USING (status = 'published' OR auth.role() = 'authenticated');

CREATE POLICY "Admins can manage products"
  ON products FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'manager', 'staff')
    )
  );

-- Product Specifications Policies
CREATE POLICY "Specifications are viewable by everyone"
  ON product_specifications FOR SELECT
  USING (true);

CREATE POLICY "Staff can manage specifications"
  ON product_specifications FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'manager', 'staff')
    )
  );

-- Product Reviews Policies
CREATE POLICY "Approved reviews are viewable by everyone"
  ON product_reviews FOR SELECT
  USING (status = 'approved' OR auth.role() = 'authenticated');

CREATE POLICY "Anyone can create reviews"
  ON product_reviews FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Users can update own reviews"
  ON product_reviews FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid() OR EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'manager')
  ));

-- Review Votes Policies
CREATE POLICY "Review votes are viewable by everyone"
  ON review_votes FOR SELECT
  USING (true);

CREATE POLICY "Anyone can vote on reviews"
  ON review_votes FOR INSERT
  TO public
  WITH CHECK (true);

-- Pages Policies
CREATE POLICY "Published pages are viewable by everyone"
  ON pages FOR SELECT
  USING (status = 'published' OR auth.role() = 'authenticated');

CREATE POLICY "Admins can manage pages"
  ON pages FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'manager')
    )
  );

-- Orders Policies
CREATE POLICY "Anyone can create orders"
  ON orders FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Users can view own orders"
  ON orders FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'manager', 'staff')
    )
  );

CREATE POLICY "Staff can update orders"
  ON orders FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'manager', 'staff')
    )
  );

-- Order Items Policies
CREATE POLICY "Anyone can create order items"
  ON order_items FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Order items viewable with order access"
  ON order_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND (orders.user_id = auth.uid() OR EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role IN ('admin', 'manager', 'staff')
      ))
    )
  );

-- Order Status History Policies
CREATE POLICY "Anyone can create status history"
  ON order_status_history FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Status history viewable with order access"
  ON order_status_history FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_status_history.order_id
      AND (orders.user_id = auth.uid() OR EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role IN ('admin', 'manager', 'staff')
      ))
    )
  );

-- Activity Logs Policies
CREATE POLICY "Admins can view all activity"
  ON user_activity_logs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Users can view own activity"
  ON user_activity_logs FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Authenticated users can log activity"
  ON user_activity_logs FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Sessions Policies
CREATE POLICY "Users can manage own sessions"
  ON user_sessions FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

-- =====================================================
-- SEED DATA
-- =====================================================

-- Main Categories
INSERT INTO categories (name, slug, description, level, display_order, status, image_url) VALUES
  ('Phones', 'phones', 'All Samsung Phones', 0, 1, 'published', '/images/categoryimages/phones.jpeg'),
  ('Tablets', 'tablets', 'Samsung Galaxy Tablets', 0, 2, 'published', '/images/categoryimages/tablets.jpeg'),
  ('Wearables', 'wearables', 'Smartwatches and Fitness Bands', 0, 3, 'published', '/images/categoryimages/watches.jpeg'),
  ('Accessories', 'accessories', 'Phone and Tablet Accessories', 0, 4, 'published', '/images/categoryimages/otheraccessories.jpeg'),
  ('Audio', 'audio', 'Earbuds and Headphones', 0, 5, 'published', '/images/categoryimages/budsandearphones.jpeg')
ON CONFLICT (slug) DO UPDATE SET
  level = EXCLUDED.level,
  display_order = EXCLUDED.display_order,
  image_url = EXCLUDED.image_url;

-- Phone Subcategories
INSERT INTO categories (name, slug, description, parent_id, level, display_order, status, image_url)
SELECT 'Galaxy S Series', 'galaxy-s-series', 'Flagship Samsung Galaxy S phones', id, 1, 1, 'published', '/images/categoryimages/phones.jpeg'
FROM categories WHERE slug = 'phones'
ON CONFLICT (slug) DO UPDATE SET parent_id = EXCLUDED.parent_id, level = EXCLUDED.level;

INSERT INTO categories (name, slug, description, parent_id, level, display_order, status, image_url)
SELECT 'Galaxy A Series', 'galaxy-a-series', 'Mid-range Samsung Galaxy A phones', id, 1, 2, 'published', '/images/categoryimages/phones.jpeg'
FROM categories WHERE slug = 'phones'
ON CONFLICT (slug) DO UPDATE SET parent_id = EXCLUDED.parent_id, level = EXCLUDED.level;

INSERT INTO categories (name, slug, description, parent_id, level, display_order, status, image_url)
SELECT 'Galaxy M Series', 'galaxy-m-series', 'Budget-friendly Samsung Galaxy M phones', id, 1, 3, 'published', '/images/categoryimages/phones.jpeg'
FROM categories WHERE slug = 'phones'
ON CONFLICT (slug) DO UPDATE SET parent_id = EXCLUDED.parent_id, level = EXCLUDED.level;

INSERT INTO categories (name, slug, description, parent_id, level, display_order, status, image_url)
SELECT 'Foldable Phones', 'foldable-phones', 'Samsung Galaxy Z Fold and Z Flip', id, 1, 4, 'published', '/images/categoryimages/phones.jpeg'
FROM categories WHERE slug = 'phones'
ON CONFLICT (slug) DO UPDATE SET parent_id = EXCLUDED.parent_id, level = EXCLUDED.level;

-- Tablet Subcategories
INSERT INTO categories (name, slug, description, parent_id, level, display_order, status, image_url)
SELECT 'Galaxy Tab A', 'galaxy-tab-a', 'Samsung Galaxy Tab A series', id, 1, 1, 'published', '/images/categoryimages/tablets.jpeg'
FROM categories WHERE slug = 'tablets'
ON CONFLICT (slug) DO UPDATE SET parent_id = EXCLUDED.parent_id, level = EXCLUDED.level;

INSERT INTO categories (name, slug, description, parent_id, level, display_order, status, image_url)
SELECT 'Galaxy Tab S', 'galaxy-tab-s', 'Premium Samsung Galaxy Tab S series', id, 1, 2, 'published', '/images/categoryimages/tablets.jpeg'
FROM categories WHERE slug = 'tablets'
ON CONFLICT (slug) DO UPDATE SET parent_id = EXCLUDED.parent_id, level = EXCLUDED.level;

-- Wearables Subcategories
INSERT INTO categories (name, slug, description, parent_id, level, display_order, status, image_url)
SELECT 'Galaxy Watch', 'galaxy-watch', 'Samsung Galaxy Watch series', id, 1, 1, 'published', '/images/categoryimages/watches.jpeg'
FROM categories WHERE slug = 'wearables'
ON CONFLICT (slug) DO UPDATE SET parent_id = EXCLUDED.parent_id, level = EXCLUDED.level;

INSERT INTO categories (name, slug, description, parent_id, level, display_order, status, image_url)
SELECT 'Fitness Bands', 'fitness-bands', 'Samsung fitness trackers', id, 1, 2, 'published', '/images/categoryimages/watches.jpeg'
FROM categories WHERE slug = 'wearables'
ON CONFLICT (slug) DO UPDATE SET parent_id = EXCLUDED.parent_id, level = EXCLUDED.level;

-- Audio Subcategories
INSERT INTO categories (name, slug, description, parent_id, level, display_order, status, image_url)
SELECT 'Galaxy Buds', 'galaxy-buds', 'Samsung Galaxy Buds series', id, 1, 1, 'published', '/images/categoryimages/budsandearphones.jpeg'
FROM categories WHERE slug = 'audio'
ON CONFLICT (slug) DO UPDATE SET parent_id = EXCLUDED.parent_id, level = EXCLUDED.level;

INSERT INTO categories (name, slug, description, parent_id, level, display_order, status, image_url)
SELECT 'Headphones', 'headphones', 'Over-ear and on-ear headphones', id, 1, 2, 'published', '/images/categoryimages/budsandearphones.jpeg'
FROM categories WHERE slug = 'audio'
ON CONFLICT (slug) DO UPDATE SET parent_id = EXCLUDED.parent_id, level = EXCLUDED.level;

-- Accessories Subcategories
INSERT INTO categories (name, slug, description, parent_id, level, display_order, status, image_url)
SELECT 'Cases', 'cases', 'Phone and tablet cases', id, 1, 1, 'published', '/images/categoryimages/otheraccessories.jpeg'
FROM categories WHERE slug = 'accessories'
ON CONFLICT (slug) DO UPDATE SET parent_id = EXCLUDED.parent_id, level = EXCLUDED.level;

INSERT INTO categories (name, slug, description, parent_id, level, display_order, status, image_url)
SELECT 'Chargers', 'chargers', 'Wall chargers and cables', id, 1, 2, 'published', '/images/categoryimages/otheraccessories.jpeg'
FROM categories WHERE slug = 'accessories'
ON CONFLICT (slug) DO UPDATE SET parent_id = EXCLUDED.parent_id, level = EXCLUDED.level;

INSERT INTO categories (name, slug, description, parent_id, level, display_order, status, image_url)
SELECT 'Screen Protectors', 'screen-protectors', 'Tempered glass and film protectors', id, 1, 3, 'published', '/images/categoryimages/otheraccessories.jpeg'
FROM categories WHERE slug = 'accessories'
ON CONFLICT (slug) DO UPDATE SET parent_id = EXCLUDED.parent_id, level = EXCLUDED.level;

INSERT INTO categories (name, slug, description, parent_id, level, display_order, status, image_url)
SELECT 'Power Banks', 'power-banks', 'Portable battery chargers', id, 1, 4, 'published', '/images/categoryimages/otheraccessories.jpeg'
FROM categories WHERE slug = 'accessories'
ON CONFLICT (slug) DO UPDATE SET parent_id = EXCLUDED.parent_id, level = EXCLUDED.level;

-- =====================================================
-- HELPFUL COMMENTS FOR FRONTEND DEVELOPERS
-- =====================================================

/*
FRONTEND USAGE GUIDE:

1. FETCHING PRODUCTS WITH ALL DATA:
   Use the `products_with_details` view for product listing pages:
   
   SELECT * FROM products_with_details
   WHERE status = 'published'
   ORDER BY created_at DESC;

2. GETTING PRODUCT SPECIFICATIONS:
   SELECT * FROM product_specifications
   WHERE product_id = 'YOUR-PRODUCT-ID'
   ORDER BY group_order, spec_order;

3. GETTING PRODUCT REVIEWS:
   SELECT * FROM product_reviews
   WHERE product_id = 'YOUR-PRODUCT-ID'
   AND status = 'approved'
   ORDER BY created_at DESC;

4. FEATURED/BESTSELLER PRODUCTS:
   SELECT * FROM products_with_details
   WHERE is_featured = true
   AND status = 'published'
   LIMIT 10;

5. PRODUCTS ON SALE:
   SELECT * FROM products_with_details
   WHERE on_sale = true
   AND status = 'published';

6. CATEGORY TREE:
   SELECT * FROM categories_with_counts
   WHERE parent_id IS NULL
   ORDER BY display_order;

7. PRODUCT SEARCH WITH FILTERS:
   SELECT * FROM products_with_details
   WHERE status = 'published'
   AND (
     title ILIKE '%search-term%'
     OR description ILIKE '%search-term%'
   )
   AND category_id = 'category-id' -- optional
   AND price BETWEEN min_price AND max_price -- optional
   ORDER BY created_at DESC;
*/

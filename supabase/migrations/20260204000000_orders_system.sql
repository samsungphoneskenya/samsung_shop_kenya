-- =====================================================
-- ORDERS SYSTEM MIGRATION
-- =====================================================

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE NOT NULL,
  
  -- Customer info
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT,
  
  -- Delivery address (Google Maps)
  delivery_location TEXT NOT NULL, -- Full address from Google Maps
  delivery_lat DECIMAL(10, 8), -- Latitude for mapping
  delivery_lng DECIMAL(11, 8), -- Longitude for mapping
  delivery_place_id TEXT, -- Google Maps Place ID
  delivery_notes TEXT, -- Additional delivery instructions
  
  -- Order details
  subtotal DECIMAL(10, 2) NOT NULL,
  tax DECIMAL(10, 2) DEFAULT 0,
  shipping_fee DECIMAL(10, 2) DEFAULT 0,
  total DECIMAL(10, 2) NOT NULL,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'pending',
  -- Status options: pending, confirmed, processing, shipped, delivered, cancelled
  
  -- Payment
  payment_method TEXT, -- cash_on_delivery, mpesa, card
  payment_status TEXT DEFAULT 'pending',
  -- Payment status: pending, paid, failed, refunded
  
  -- Tracking
  tracking_number TEXT,
  estimated_delivery DATE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_status CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled')),
  CONSTRAINT valid_payment_status CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  CONSTRAINT valid_payment_method CHECK (payment_method IN ('cash_on_delivery', 'mpesa', 'card', NULL))
);

-- Create order items table
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  
  -- Product snapshot (in case product changes/deleted)
  product_title TEXT NOT NULL,
  product_slug TEXT NOT NULL,
  product_image TEXT,
  product_sku TEXT,
  
  -- Pricing
  unit_price DECIMAL(10, 2) NOT NULL,
  quantity INTEGER NOT NULL,
  subtotal DECIMAL(10, 2) NOT NULL,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT positive_quantity CHECK (quantity > 0),
  CONSTRAINT positive_price CHECK (unit_price >= 0)
);

-- Create order status history table
CREATE TABLE IF NOT EXISTS order_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  
  status TEXT NOT NULL,
  notes TEXT,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INDEXES
-- =====================================================

CREATE INDEX idx_orders_order_number ON orders(order_number);
CREATE INDEX idx_orders_customer_phone ON orders(customer_phone);
CREATE INDEX idx_orders_customer_email ON orders(customer_email);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_payment_status ON orders(payment_status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);

CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);

CREATE INDEX idx_order_status_history_order_id ON order_status_history(order_id);

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Updated at trigger for orders
CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- FUNCTIONS
-- =====================================================

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

-- Auto-generate order number on insert
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

-- Auto-create status history on status change
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

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_status_history ENABLE ROW LEVEL SECURITY;

-- Public: Can create orders (checkout)
CREATE POLICY "Anyone can create orders"
  ON orders FOR INSERT
  TO public
  WITH CHECK (true);

-- Authenticated: Can view all orders (admin/staff)
CREATE POLICY "Authenticated users can view all orders"
  ON orders FOR SELECT
  TO authenticated
  USING (true);

-- Authenticated: Can update orders
CREATE POLICY "Authenticated users can update orders"
  ON orders FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Authenticated: Can delete orders (admins only in practice)
CREATE POLICY "Admins can delete orders"
  ON orders FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Order Items policies
CREATE POLICY "Anyone can create order items"
  ON order_items FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Authenticated users can view order items"
  ON order_items FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can update order items"
  ON order_items FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Admins can delete order items"
  ON order_items FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Order Status History policies
CREATE POLICY "Anyone can create status history"
  ON order_status_history FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Authenticated users can view status history"
  ON order_status_history FOR SELECT
  TO authenticated
  USING (true);

-- =====================================================
-- SEED DATA (Optional - for testing)
-- =====================================================

-- Uncomment to add sample order
/*
INSERT INTO orders (
  customer_name,
  customer_phone,
  customer_email,
  delivery_location,
  delivery_lat,
  delivery_lng,
  subtotal,
  total,
  status,
  payment_method
) VALUES (
  'John Doe',
  '+254712345678',
  'john@example.com',
  'Mombasa, Kenya',
  -4.0435,
  39.6682,
  2500.00,
  2500.00,
  'pending',
  'cash_on_delivery'
);
*/
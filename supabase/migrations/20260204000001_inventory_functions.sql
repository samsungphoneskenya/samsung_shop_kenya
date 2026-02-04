-- =====================================================
-- INVENTORY MANAGEMENT FUNCTIONS
-- =====================================================

-- Function to decrement product quantity
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

-- Function to increment product quantity (for cancellations/returns)
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

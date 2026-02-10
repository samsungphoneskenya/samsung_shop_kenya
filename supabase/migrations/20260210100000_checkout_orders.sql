-- Checkout & orders: optional customer_email, WhatsApp notification tracking
-- Phone and address remain required; name/email/notes optional on frontend.

ALTER TABLE orders
  ALTER COLUMN customer_email DROP NOT NULL;

-- Track when customer was notified via WhatsApp (e.g. order confirmation, payment request)
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS whatsapp_sent_at TIMESTAMP WITH TIME ZONE;

COMMENT ON COLUMN orders.whatsapp_sent_at IS 'When a WhatsApp notification was last sent for this order';

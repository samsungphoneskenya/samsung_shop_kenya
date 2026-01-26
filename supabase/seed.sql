-- Seed Data for Development
-- This file contains sample data for testing

-- Sample Categories
INSERT INTO public.categories (name, slug, description, status) VALUES
  ('Electronics', 'electronics', 'Electronic devices and gadgets', 'published'),
  ('Clothing', 'clothing', 'Apparel and fashion items', 'published'),
  ('Books', 'books', 'Books and reading materials', 'published'),
  ('Home & Garden', 'home-garden', 'Home improvement and garden supplies', 'published'),
  ('Sports', 'sports', 'Sports equipment and gear', 'published')
ON CONFLICT (slug) DO NOTHING;

-- Sample Products
INSERT INTO public.products (
  title,
  slug,
  description,
  price,
  compare_at_price,
  sku,
  quantity,
  category_id,
  status,
  featured
)
SELECT
  'Premium Wireless Headphones',
  'premium-wireless-headphones',
  'High-quality wireless headphones with noise cancellation and 30-hour battery life.',
  299.99,
  399.99,
  'WH-001',
  50,
  c.id,
  'published',
  true
FROM public.categories c
WHERE c.slug = 'electronics'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.products (
  title,
  slug,
  description,
  price,
  sku,
  quantity,
  category_id,
  status,
  featured
)
SELECT
  'Classic Cotton T-Shirt',
  'classic-cotton-tshirt',
  'Comfortable 100% cotton t-shirt available in multiple colors.',
  24.99,
  'TS-001',
  200,
  c.id,
  'published',
  true
FROM public.categories c
WHERE c.slug = 'clothing'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.products (
  title,
  slug,
  description,
  price,
  sku,
  quantity,
  category_id,
  status,
  featured
)
SELECT
  'The Art of Programming',
  'art-of-programming',
  'Comprehensive guide to modern software development practices.',
  49.99,
  'BK-001',
  30,
  c.id,
  'published',
  false
FROM public.categories c
WHERE c.slug = 'books'
ON CONFLICT (slug) DO NOTHING;

-- Sample SEO Metadata
INSERT INTO public.seo_metadata (
  entity_type,
  entity_id,
  meta_title,
  meta_description,
  og_title,
  og_description,
  robots,
  focus_keyword
)
SELECT
  'product',
  p.id,
  'Premium Wireless Headphones - Best Noise Cancelling',
  'Experience superior sound quality with our premium wireless headphones. 30-hour battery, noise cancellation, and comfort.',
  'Premium Wireless Headphones',
  'The best wireless headphones for music lovers and professionals.',
  'index, follow',
  'wireless headphones'
FROM public.products p
WHERE p.slug = 'premium-wireless-headphones'
ON CONFLICT (entity_type, entity_id) DO NOTHING;

INSERT INTO public.seo_metadata (
  entity_type,
  entity_id,
  meta_title,
  meta_description,
  og_title,
  og_description,
  robots,
  focus_keyword
)
SELECT
  'category',
  c.id,
  'Electronics - Latest Gadgets and Devices',
  'Browse our collection of the latest electronics, gadgets, and tech accessories at great prices.',
  'Electronics Category',
  'Discover the latest in tech and electronics.',
  'index, follow',
  'electronics'
FROM public.categories c
WHERE c.slug = 'electronics'
ON CONFLICT (entity_type, entity_id) DO NOTHING;
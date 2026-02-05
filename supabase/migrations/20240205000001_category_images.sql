-- =====================================================
-- ADD IMAGES TO CATEGORIES
-- =====================================================

-- Add image column to categories table
ALTER TABLE public.categories 
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_categories_image_url ON categories(image_url);

-- =====================================================
-- UPDATE SEED DATA WITH IMAGE PLACEHOLDERS
-- =====================================================

-- You can update these with real image URLs after uploading to Supabase Storage
-- For now, using placeholder structure

-- Main Categories Images
UPDATE categories 
SET image_url = '/images/categoryimages/phones.jpeg'
WHERE slug = 'phones';

UPDATE categories 
SET image_url = '/images/categoryimages/tablets.jpeg'
WHERE slug = 'tablets';

UPDATE categories 
SET image_url = '/images/categoryimages/watches.jpeg'
WHERE slug = 'wearables';

UPDATE categories 
SET image_url = '/images/categoryimages/otheraccessories.jpeg'
WHERE slug = 'accessories';

UPDATE categories 
SET image_url = '/images/categoryimages/budsandearphones.jpeg'
WHERE slug = 'audio';

-- Phone Subcategories Images
UPDATE categories 
SET image_url = '/images/categoryimages/phones.jpeg'
WHERE slug = 'galaxy-s-series';

UPDATE categories 
SET image_url = '/images/categoryimages/phones.jpeg'
WHERE slug = 'galaxy-a-series';

UPDATE categories 
SET image_url = '/images/categoryimages/phones.jpeg'
WHERE slug = 'galaxy-m-series';

UPDATE categories 
SET image_url = '/images/categoryimages/phones.jpeg'
WHERE slug = 'foldable-phones';

-- Tablet Subcategories Images
UPDATE categories 
SET image_url = '/images/categoryimages/tablets.jpeg'
WHERE slug = 'galaxy-tab-a';

UPDATE categories 
SET image_url = '/images/categoryimages/tablets.jpeg'
WHERE slug = 'galaxy-tab-s';

-- Wearables Subcategories Images
UPDATE categories 
SET image_url = '/images/categoryimages/watches.jpeg'
WHERE slug = 'galaxy-watch';

UPDATE categories 
SET image_url = '/images/categoryimages/watches.jpeg'
WHERE slug = 'fitness-bands';

-- Audio Subcategories Images
UPDATE categories 
SET image_url = '/images/categoryimages/budsandearphones.jpeg'
WHERE slug = 'galaxy-buds';

UPDATE categories 
SET image_url = '/images/categoryimages/budsandearphones.jpeg'
WHERE slug = 'headphones';

-- Accessories Subcategories Images
UPDATE categories 
SET image_url = '/images/categoryimages/budsandearphones.jpeg'
WHERE slug = 'cases';

UPDATE categories 
SET image_url = '/images/categoryimages/budsandearphones.jpeg'
WHERE slug = 'chargers';

UPDATE categories 
SET image_url = '/images/categoryimages/budsandearphones.jpeg'
WHERE slug = 'screen-protectors';

UPDATE categories 
SET image_url = '/images/categoryimages/budsandearphones.jpeg'
WHERE slug = 'power-banks';

-- =====================================================
-- NOTES
-- =====================================================

-- To upload category images:
-- 1. Go to Supabase Dashboard → Storage
-- 2. Create bucket: 'category-images' (public)
-- 3. Upload images for each category
-- 4. Update image_url with Supabase Storage URLs:
--    UPDATE categories 
--    SET image_url = 'https://[project].supabase.co/storage/v1/object/public/category-images/phones.jpg'
--    WHERE slug = 'phones';
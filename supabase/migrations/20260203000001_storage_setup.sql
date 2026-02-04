-- =====================================================
-- SUPABASE STORAGE SETUP FOR PRODUCT IMAGES
-- =====================================================
-- Run this after your main migration
-- =====================================================

-- Create storage bucket for product images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-images',
  'product-images',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- STORAGE POLICIES
-- =====================================================

-- Allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload product images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'product-images'
  AND (storage.foldername(name))[1] ~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$'
);

-- Allow authenticated users to update their uploaded images
CREATE POLICY "Authenticated users can update product images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'product-images')
WITH CHECK (bucket_id = 'product-images');

-- Allow authenticated users to delete images
CREATE POLICY "Authenticated users can delete product images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'product-images');

-- Allow public to read images
CREATE POLICY "Public can read product images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'product-images');

-- =====================================================
-- NOTES
-- =====================================================
-- 
-- This creates a public storage bucket for product images with:
-- - 5MB file size limit
-- - Allowed types: JPEG, PNG, GIF, WebP
-- - Public read access (for displaying on storefront)
-- - Authenticated write access (for uploading via dashboard)
-- - Folder structure: {product-id}/{timestamp}-filename.ext
--
-- Images are automatically optimized on upload via Sharp:
-- - Main image: Max 1200x1200px, 85% quality
-- - Thumbnail: 400x400px crop, 80% quality
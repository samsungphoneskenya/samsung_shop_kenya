-- =====================================================
-- SUPABASE STORAGE SETUP FOR E-COMMERCE IMAGES
-- =====================================================
-- Run this AFTER your main migration (complete_schema.sql)
-- This creates storage buckets for all image types
-- =====================================================

-- =====================================================
-- CREATE STORAGE BUCKETS
-- =====================================================

-- Product images bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-images',
  'product-images',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Category images bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'category-images',
  'category-images',
  true,
  3145728, -- 3MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Review images bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'review-images',
  'review-images',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- User avatars bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  2097152, -- 2MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Page/CMS images bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'page-images',
  'page-images',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- PRODUCT IMAGES POLICIES
-- =====================================================

-- Allow authenticated users to upload product images
CREATE POLICY "Authenticated users can upload product images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'product-images'
  AND (storage.foldername(name))[1] ~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$'
);

-- Allow authenticated users to update product images
CREATE POLICY "Authenticated users can update product images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'product-images')
WITH CHECK (bucket_id = 'product-images');

-- Allow authenticated users to delete product images
CREATE POLICY "Authenticated users can delete product images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'product-images');

-- Allow public to read product images
CREATE POLICY "Public can read product images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'product-images');

-- =====================================================
-- CATEGORY IMAGES POLICIES
-- =====================================================

-- Allow authenticated users to upload category images
CREATE POLICY "Authenticated users can upload category images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'category-images'
  AND EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'manager')
  )
);

-- Allow authenticated users to update category images
CREATE POLICY "Admins can update category images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'category-images'
  AND EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'manager')
  )
)
WITH CHECK (bucket_id = 'category-images');

-- Allow authenticated users to delete category images
CREATE POLICY "Admins can delete category images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'category-images'
  AND EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'manager')
  )
);

-- Allow public to read category images
CREATE POLICY "Public can read category images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'category-images');

-- =====================================================
-- REVIEW IMAGES POLICIES
-- =====================================================

-- Allow anyone to upload review images
CREATE POLICY "Anyone can upload review images"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'review-images');

-- Allow users to update their own review images
CREATE POLICY "Users can update own review images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'review-images'
  AND (auth.uid()::text = (storage.foldername(name))[1])
)
WITH CHECK (bucket_id = 'review-images');

-- Allow users to delete their own review images
CREATE POLICY "Users can delete own review images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'review-images'
  AND (auth.uid()::text = (storage.foldername(name))[1])
);

-- Allow public to read review images
CREATE POLICY "Public can read review images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'review-images');

-- =====================================================
-- USER AVATAR POLICIES
-- =====================================================

-- Allow authenticated users to upload their own avatar
CREATE POLICY "Users can upload own avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to update their own avatar
CREATE POLICY "Users can update own avatar"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars'
  AND (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (bucket_id = 'avatars');

-- Allow users to delete their own avatar
CREATE POLICY "Users can delete own avatar"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow public to read avatars
CREATE POLICY "Public can read avatars"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');

-- =====================================================
-- PAGE/CMS IMAGES POLICIES
-- =====================================================

-- Allow admins to upload page images
CREATE POLICY "Admins can upload page images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'page-images'
  AND EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'manager')
  )
);

-- Allow admins to update page images
CREATE POLICY "Admins can update page images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'page-images'
  AND EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'manager')
  )
)
WITH CHECK (bucket_id = 'page-images');

-- Allow admins to delete page images
CREATE POLICY "Admins can delete page images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'page-images'
  AND EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'manager')
  )
);

-- Allow public to read page images
CREATE POLICY "Public can read page images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'page-images');

-- =====================================================
-- HELPER FUNCTIONS FOR STORAGE
-- =====================================================

-- Function to get product image URL
CREATE OR REPLACE FUNCTION get_product_image_url(
  bucket TEXT,
  path TEXT
)
RETURNS TEXT AS $$
BEGIN
  RETURN 'https://' || current_setting('app.settings.project_ref') || '.supabase.co/storage/v1/object/public/' || bucket || '/' || path;
END;
$$ LANGUAGE plpgsql;

-- Function to validate image file
CREATE OR REPLACE FUNCTION validate_image_upload()
RETURNS TRIGGER AS $$
DECLARE
  file_ext TEXT;
  max_size INTEGER;
BEGIN
  -- Get file extension
  file_ext := LOWER(SUBSTRING(NEW.name FROM '\.([^\.]*)$'));
  
  -- Set max size based on bucket
  CASE NEW.bucket_id
    WHEN 'product-images', 'review-images', 'page-images' THEN max_size := 5242880;  -- 5MB
    WHEN 'category-images' THEN max_size := 3145728;  -- 3MB
    WHEN 'avatars' THEN max_size := 2097152;  -- 2MB
    ELSE max_size := 5242880;
  END CASE;
  
  -- Validate extension
  IF file_ext NOT IN ('jpg', 'jpeg', 'png', 'gif', 'webp') THEN
    RAISE EXCEPTION 'Invalid file type. Only JPG, PNG, GIF, and WebP are allowed.';
  END IF;
  
  -- Validate size
  IF NEW.metadata->>'size' IS NOT NULL AND (NEW.metadata->>'size')::INTEGER > max_size THEN
    RAISE EXCEPTION 'File too large. Maximum size is % bytes.', max_size;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- STORAGE FOLDER STRUCTURE
-- =====================================================

/*
RECOMMENDED FOLDER STRUCTURE:

product-images/
  └── {product-id}/
      ├── featured-{timestamp}.webp
      ├── gallery-1-{timestamp}.webp
      ├── gallery-2-{timestamp}.webp
      └── thumbnails/
          ├── featured-thumb-{timestamp}.webp
          └── gallery-1-thumb-{timestamp}.webp

category-images/
  └── {category-slug}-{timestamp}.webp

review-images/
  └── {user-id}/
      └── {review-id}/
          ├── image-1-{timestamp}.webp
          └── image-2-{timestamp}.webp

avatars/
  └── {user-id}/
      └── avatar-{timestamp}.webp

page-images/
  └── {page-slug}/
      └── {image-name}-{timestamp}.webp
*/

-- =====================================================
-- NOTES & BEST PRACTICES
-- =====================================================

/*
STORAGE BUCKETS CREATED:
- product-images: 5MB limit - Product photos and galleries
- category-images: 3MB limit - Category banner images
- review-images: 5MB limit - Customer review photos
- avatars: 2MB limit - User profile pictures
- page-images: 5MB limit - CMS/static page images

SECURITY:
- All buckets are PUBLIC for read access
- Product images: Any authenticated user can upload
- Category images: Only admins/managers can upload
- Review images: Anyone can upload (for guest reviews)
- Avatars: Users can only upload their own
- Page images: Only admins/managers can upload

RECOMMENDED IMAGE OPTIMIZATION:
Before uploading, optimize images:
1. Product featured: Max 1200x1200px, 85% quality, WebP format
2. Product thumbnails: 400x400px, 80% quality, WebP format
3. Product gallery: Max 1200x1200px, 85% quality, WebP format
4. Category images: Max 800x400px, 85% quality, WebP format
5. Review images: Max 800x800px, 80% quality, WebP format
6. Avatars: 200x200px, 80% quality, WebP format

FILE NAMING CONVENTION:
- Use descriptive names with timestamps
- Example: product-{sku}-featured-{timestamp}.webp
- Example: category-{slug}-{timestamp}.webp
- Example: review-{review-id}-1-{timestamp}.webp

FRONTEND USAGE:
// Upload product image
const { data, error } = await supabase.storage
  .from('product-images')
  .upload(`${productId}/featured-${Date.now()}.webp`, file);

// Get public URL
const { data: { publicUrl } } = supabase.storage
  .from('product-images')
  .getPublicUrl(`${productId}/featured-${timestamp}.webp`);

// Update product with image URL
await supabase
  .from('products')
  .update({ featured_image: publicUrl })
  .eq('id', productId);

CLEANUP:
- Set up a cron job to delete orphaned images (images not referenced in database)
- Implement soft delete for products to prevent broken image links
- Keep old images for 30 days before permanent deletion

PERFORMANCE:
- Use Supabase's built-in image transformation:
  ?width=400&height=400&resize=cover
- Example: publicUrl + '?width=400&height=400&resize=cover'
- Cache images on CDN for faster loading

MIGRATION STEPS:
1. Run complete_schema.sql first
2. Run this storage_setup.sql second
3. Test upload/download permissions
4. Set up image optimization pipeline
5. Configure CDN caching rules
*/

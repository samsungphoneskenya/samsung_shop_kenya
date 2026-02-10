-- =====================================================
-- Sync `auth.users` <-> `public.profiles`
-- - Restores automatic profile creation when users are
--   created from the Supabase dashboard (or any other path)
-- - Keeps key fields updated on auth user changes
-- - Expands allowed roles to match app roles
-- =====================================================

-- 1) Ensure `profiles.role` supports app roles
ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS valid_role;

ALTER TABLE public.profiles
  ADD CONSTRAINT valid_role
  CHECK (role IN ('admin', 'manager', 'staff', 'customer', 'editor', 'seo_manager'));

-- 2) Update RLS policies to include `editor` where appropriate
-- Also add missing `profiles` INSERT/ADMIN UPDATE policies so profiles can be
-- created/managed through the app (and by admins) when needed.

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;
CREATE POLICY "Admins can update any profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
      AND p.role = 'admin'
    )
  )
  WITH CHECK (true);

-- Categories: editor can manage (admin already included)
DROP POLICY IF EXISTS "Admins can manage categories" ON public.categories;
CREATE POLICY "Admins can manage categories"
  ON public.categories FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'manager', 'editor')
    )
  );

-- Products: editor can manage (seo_manager should not)
DROP POLICY IF EXISTS "Admins can manage products" ON public.products;
CREATE POLICY "Admins can manage products"
  ON public.products FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'manager', 'staff', 'editor')
    )
  );

-- Specs: editor can manage
DROP POLICY IF EXISTS "Staff can manage specifications" ON public.product_specifications;
CREATE POLICY "Staff can manage specifications"
  ON public.product_specifications FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'manager', 'staff', 'editor')
    )
  );

-- Pages: editor can manage
DROP POLICY IF EXISTS "Admins can manage pages" ON public.pages;
CREATE POLICY "Admins can manage pages"
  ON public.pages FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'manager', 'editor')
    )
  );

-- Orders: editor can view/update orders in dashboard
DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;
CREATE POLICY "Users can view own orders"
  ON public.orders FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'manager', 'staff', 'editor')
    )
  );

DROP POLICY IF EXISTS "Staff can update orders" ON public.orders;
CREATE POLICY "Staff can update orders"
  ON public.orders FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'manager', 'staff', 'editor')
    )
  );

-- Order item access: editor can view via order access
DROP POLICY IF EXISTS "Order items viewable with order access" ON public.order_items;
CREATE POLICY "Order items viewable with order access"
  ON public.order_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
      AND (orders.user_id = auth.uid() OR EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role IN ('admin', 'manager', 'staff', 'editor')
      ))
    )
  );

-- Order status history: editor can view via order access
DROP POLICY IF EXISTS "Status history viewable with order access" ON public.order_status_history;
CREATE POLICY "Status history viewable with order access"
  ON public.order_status_history FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_status_history.order_id
      AND (orders.user_id = auth.uid() OR EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role IN ('admin', 'manager', 'staff', 'editor')
      ))
    )
  );

-- 3) Create triggers to keep `public.profiles` in sync with `auth.users`

CREATE OR REPLACE FUNCTION public.handle_auth_user_upsert_profile()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_full_name text;
  v_avatar_url text;
  v_admin_count integer;
  v_role text;
BEGIN
  -- Defensive: profiles.email is NOT NULL
  IF NEW.email IS NULL OR NEW.email = '' THEN
    RETURN NEW;
  END IF;

  v_full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name');
  v_avatar_url := NEW.raw_user_meta_data->>'avatar_url';

  -- If profile already exists, just sync fields.
  IF EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = NEW.id) THEN
    UPDATE public.profiles
      SET email = NEW.email,
          full_name = v_full_name,
          avatar_url = v_avatar_url,
          is_verified = (NEW.email_confirmed_at IS NOT NULL)
      WHERE id = NEW.id;
    RETURN NEW;
  END IF;

  -- Default role: first user becomes admin, otherwise editor
  SELECT COUNT(*) INTO v_admin_count FROM public.profiles WHERE role = 'admin';
  v_role := CASE WHEN v_admin_count > 0 THEN 'editor' ELSE 'admin' END;

  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    avatar_url,
    role,
    is_active,
    is_verified
  ) VALUES (
    NEW.id,
    NEW.email,
    v_full_name,
    v_avatar_url,
    v_role,
    true,
    (NEW.email_confirmed_at IS NOT NULL)
  );

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created_profile ON auth.users;
CREATE TRIGGER on_auth_user_created_profile
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_auth_user_upsert_profile();

DROP TRIGGER IF EXISTS on_auth_user_updated_profile ON auth.users;
CREATE TRIGGER on_auth_user_updated_profile
  AFTER UPDATE OF email, raw_user_meta_data, email_confirmed_at ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_auth_user_upsert_profile();

-- 4) Storage policies: allow editors to manage CMS/category images (same as managers)
DROP POLICY IF EXISTS "Authenticated users can upload category images" ON storage.objects;
CREATE POLICY "Authenticated users can upload category images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'category-images'
  AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'manager', 'editor')
  )
);

DROP POLICY IF EXISTS "Admins can update category images" ON storage.objects;
CREATE POLICY "Admins can update category images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'category-images'
  AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'manager', 'editor')
  )
)
WITH CHECK (bucket_id = 'category-images');

DROP POLICY IF EXISTS "Admins can delete category images" ON storage.objects;
CREATE POLICY "Admins can delete category images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'category-images'
  AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'manager', 'editor')
  )
);

DROP POLICY IF EXISTS "Admins can upload page images" ON storage.objects;
CREATE POLICY "Admins can upload page images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'page-images'
  AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'manager', 'editor')
  )
);

DROP POLICY IF EXISTS "Admins can update page images" ON storage.objects;
CREATE POLICY "Admins can update page images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'page-images'
  AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'manager', 'editor')
  )
)
WITH CHECK (bucket_id = 'page-images');

DROP POLICY IF EXISTS "Admins can delete page images" ON storage.objects;
CREATE POLICY "Admins can delete page images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'page-images'
  AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'manager', 'editor')
  )
);


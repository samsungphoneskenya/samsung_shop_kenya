-- =====================================================
-- BLOGS (CMS)
-- Adds blogs table + role constraint updates
-- =====================================================

-- 1) Extend allowed roles used by the app code
ALTER TABLE profiles
  DROP CONSTRAINT IF EXISTS valid_role;

ALTER TABLE profiles
  ADD CONSTRAINT valid_role CHECK (
    role IN ('admin', 'manager', 'staff', 'editor', 'seo_manager', 'customer')
  );

-- 2) Blogs table
CREATE TABLE IF NOT EXISTS blogs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  category TEXT,

  status TEXT NOT NULL DEFAULT 'draft',
  content_html TEXT NOT NULL,

  cover_image_url TEXT,
  cover_image_alt TEXT,

  meta_title TEXT,
  meta_description TEXT,
  meta_keywords TEXT[],

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CONSTRAINT valid_blog_status CHECK (status IN ('draft', 'published', 'archived'))
);

CREATE INDEX IF NOT EXISTS idx_blogs_slug ON blogs(slug);
CREATE INDEX IF NOT EXISTS idx_blogs_status ON blogs(status);
CREATE INDEX IF NOT EXISTS idx_blogs_created_at ON blogs(created_at DESC);

-- Auto-update updated_at
DROP TRIGGER IF EXISTS update_blogs_updated_at ON blogs;
CREATE TRIGGER update_blogs_updated_at
  BEFORE UPDATE ON blogs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 3) RLS
ALTER TABLE blogs ENABLE ROW LEVEL SECURITY;

-- Public: only published blogs
DROP POLICY IF EXISTS "Public can read published blogs" ON blogs;
CREATE POLICY "Public can read published blogs"
  ON blogs FOR SELECT
  USING (status = 'published');

-- Staff: read all blogs (drafts included)
DROP POLICY IF EXISTS "Staff can read all blogs" ON blogs;
CREATE POLICY "Staff can read all blogs"
  ON blogs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role IN ('admin', 'editor')
    )
  );

-- Staff: create blogs
DROP POLICY IF EXISTS "Staff can create blogs" ON blogs;
CREATE POLICY "Staff can create blogs"
  ON blogs FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role IN ('admin', 'editor')
    )
  );

-- Staff: update blogs
DROP POLICY IF EXISTS "Staff can update blogs" ON blogs;
CREATE POLICY "Staff can update blogs"
  ON blogs FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role IN ('admin', 'editor')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role IN ('admin', 'editor')
    )
  );

-- Staff: delete blogs
DROP POLICY IF EXISTS "Staff can delete blogs" ON blogs;
CREATE POLICY "Staff can delete blogs"
  ON blogs FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role IN ('admin', 'editor')
    )
  );


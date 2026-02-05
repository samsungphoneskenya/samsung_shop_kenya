-- =====================================================
-- SUBCATEGORIES MIGRATION
-- Add parent-child relationships to categories
-- =====================================================

-- Add parent_id column to categories table
ALTER TABLE public.categories 
ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES categories(id) ON DELETE CASCADE;

-- Add level column to track hierarchy depth
ALTER TABLE public.categories 
ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 0;

-- Add order column for custom sorting
ALTER TABLE public.categories 
ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;

-- Add index for parent_id lookups
CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON public.categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_categories_level ON public.categories(level);
CREATE INDEX IF NOT EXISTS idx_categories_display_order ON public.categories(display_order);

-- =====================================================
-- UPDATE RLS POLICIES (no changes needed - existing policies work)
-- =====================================================

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function to get category path (breadcrumb)
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
    FROM public.categories
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

-- Function to get all subcategories (recursive)
CREATE OR REPLACE FUNCTION get_subcategories(parent_category_id UUID)
RETURNS TABLE(id UUID, name TEXT, slug TEXT, level INTEGER) AS $$
BEGIN
  RETURN QUERY
  WITH RECURSIVE subcats AS (
    -- Base case: direct children
    SELECT c.id, c.name, c.slug, c.level, c.parent_id
    FROM public.categories c
    WHERE c.parent_id = parent_category_id
    
    UNION ALL
    
    -- Recursive case: children of children
    SELECT c.id, c.name, c.slug, c.level, c.parent_id
    FROM public.categories c
    INNER JOIN subcats s ON c.parent_id = s.id
  )
  SELECT subcats.id, subcats.name, subcats.slug, subcats.level
  FROM subcats
  ORDER BY subcats.level, subcats.name;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- SEED DATA - Create Category Hierarchy
-- =====================================================

-- Clear existing categories (optional - comment out if you have data)
-- DELETE FROM public.categories;

-- LEVEL 0: Main public.categories
INSERT INTO public.categories (name, slug, description, level, display_order, status) VALUES
  ('Phones', 'phones', 'All Samsung Phones', 0, 1, 'published'),
  ('Tablets', 'tablets', 'Samsung Galaxy Tablets', 0, 2, 'published'),
  ('Wearables', 'wearables', 'Smartwatches and Fitness Bands', 0, 3, 'published'),
  ('Accessories', 'accessories', 'Phone and Tablet Accessories', 0, 4, 'published'),
  ('Audio', 'audio', 'Earbuds and Headphones', 0, 5, 'published')
ON CONFLICT (slug) DO UPDATE SET
  level = EXCLUDED.level,
  display_order = EXCLUDED.display_order;

-- LEVEL 1: Phone Subcategories
INSERT INTO public.categories (name, slug, description, parent_id, level, display_order, status)
SELECT 
  'Galaxy S Series', 
  'galaxy-s-series', 
  'Flagship Samsung Galaxy S phones',
  id,
  1,
  1,
  'published'
FROM public.categories WHERE slug = 'phones'
ON CONFLICT (slug) DO UPDATE SET
  parent_id = EXCLUDED.parent_id,
  level = EXCLUDED.level;

INSERT INTO public.categories (name, slug, description, parent_id, level, display_order, status)
SELECT 
  'Galaxy A Series', 
  'galaxy-a-series', 
  'Mid-range Samsung Galaxy A phones',
  id,
  1,
  2,
  'published'
FROM public.categories WHERE slug = 'phones'
ON CONFLICT (slug) DO UPDATE SET
  parent_id = EXCLUDED.parent_id,
  level = EXCLUDED.level;

INSERT INTO public.categories (name, slug, description, parent_id, level, display_order, status)
SELECT 
  'Galaxy M Series', 
  'galaxy-m-series', 
  'Budget-friendly Samsung Galaxy M phones',
  id,
  1,
  3,
  'published'
FROM public.categories WHERE slug = 'phones'
ON CONFLICT (slug) DO UPDATE SET
  parent_id = EXCLUDED.parent_id,
  level = EXCLUDED.level;

INSERT INTO public.categories (name, slug, description, parent_id, level, display_order, status)
SELECT 
  'Foldable Phones', 
  'foldable-phones', 
  'Samsung Galaxy Z Fold and Z Flip',
  id,
  1,
  4,
  'published'
FROM public.categories WHERE slug = 'phones'
ON CONFLICT (slug) DO UPDATE SET
  parent_id = EXCLUDED.parent_id,
  level = EXCLUDED.level;

-- LEVEL 1: Tablet Subcategories
INSERT INTO public.categories (name, slug, description, parent_id, level, display_order, status)
SELECT 
  'Galaxy Tab A', 
  'galaxy-tab-a', 
  'Samsung Galaxy Tab A series',
  id,
  1,
  1,
  'published'
FROM public.categories WHERE slug = 'tablets'
ON CONFLICT (slug) DO UPDATE SET
  parent_id = EXCLUDED.parent_id,
  level = EXCLUDED.level;

INSERT INTO public.categories (name, slug, description, parent_id, level, display_order, status)
SELECT 
  'Galaxy Tab S', 
  'galaxy-tab-s', 
  'Premium Samsung Galaxy Tab S series',
  id,
  1,
  2,
  'published'
FROM public.categories WHERE slug = 'tablets'
ON CONFLICT (slug) DO UPDATE SET
  parent_id = EXCLUDED.parent_id,
  level = EXCLUDED.level;

-- LEVEL 1: Wearables Subcategories
INSERT INTO public.categories (name, slug, description, parent_id, level, display_order, status)
SELECT 
  'Galaxy Watch', 
  'galaxy-watch', 
  'Samsung Galaxy Watch series',
  id,
  1,
  1,
  'published'
FROM public.categories WHERE slug = 'wearables'
ON CONFLICT (slug) DO UPDATE SET
  parent_id = EXCLUDED.parent_id,
  level = EXCLUDED.level;

INSERT INTO public.categories (name, slug, description, parent_id, level, display_order, status)
SELECT 
  'Fitness Bands', 
  'fitness-bands', 
  'Samsung fitness trackers',
  id,
  1,
  2,
  'published'
FROM public.categories WHERE slug = 'wearables'
ON CONFLICT (slug) DO UPDATE SET
  parent_id = EXCLUDED.parent_id,
  level = EXCLUDED.level;

-- LEVEL 1: Accessories Subcategories
INSERT INTO public.categories (name, slug, description, parent_id, level, display_order, status)
SELECT 
  'Cases', 
  'cases', 
  'Phone and tablet cases',
  id,
  1,
  1,
  'published'
FROM public.categories WHERE slug = 'accessories'
ON CONFLICT (slug) DO UPDATE SET
  parent_id = EXCLUDED.parent_id,
  level = EXCLUDED.level;

INSERT INTO public.categories (name, slug, description, parent_id, level, display_order, status)
SELECT 
  'Chargers', 
  'chargers', 
  'Wall chargers and cables',
  id,
  1,
  2,
  'published'
FROM public.categories WHERE slug = 'accessories'
ON CONFLICT (slug) DO UPDATE SET
  parent_id = EXCLUDED.parent_id,
  level = EXCLUDED.level;

INSERT INTO public.categories (name, slug, description, parent_id, level, display_order, status)
SELECT 
  'Screen Protectors', 
  'screen-protectors', 
  'Tempered glass and film protectors',
  id,
  1,
  3,
  'published'
FROM public.categories WHERE slug = 'accessories'
ON CONFLICT (slug) DO UPDATE SET
  parent_id = EXCLUDED.parent_id,
  level = EXCLUDED.level;

INSERT INTO public.categories (name, slug, description, parent_id, level, display_order, status)
SELECT 
  'Power Banks', 
  'power-banks', 
  'Portable battery chargers',
  id,
  1,
  4,
  'published'
FROM public.categories WHERE slug = 'accessories'
ON CONFLICT (slug) DO UPDATE SET
  parent_id = EXCLUDED.parent_id,
  level = EXCLUDED.level;

-- LEVEL 1: Audio Subcategories (Buds under Audio parent)
INSERT INTO public.categories (name, slug, description, parent_id, level, display_order, status)
SELECT 
  'Galaxy Buds', 
  'galaxy-buds', 
  'Samsung Galaxy Buds series',
  id,
  1,
  1,
  'published'
FROM public.categories WHERE slug = 'audio'
ON CONFLICT (slug) DO UPDATE SET
  parent_id = EXCLUDED.parent_id,
  level = EXCLUDED.level;

INSERT INTO public.categories (name, slug, description, parent_id, level, display_order, status)
SELECT 
  'Headphones', 
  'headphones', 
  'Over-ear and on-ear headphones',
  id,
  1,
  2,
  'published'
FROM public.categories WHERE slug = 'audio'
ON CONFLICT (slug) DO UPDATE SET
  parent_id = EXCLUDED.parent_id,
  level = EXCLUDED.level;

-- =====================================================
-- VIEWS FOR EASY QUERYING
-- =====================================================

-- View: Categories with parent information
CREATE OR REPLACE VIEW categories_with_parent AS
SELECT 
  c.*,
  p.name as parent_name,
  p.slug as parent_slug,
  get_category_path(c.id) as full_path
FROM public.categories c
LEFT JOIN public.categories p ON c.parent_id = p.id;

-- View: Main public.categories only (level 0)
CREATE OR REPLACE VIEW main_categories AS
SELECT * FROM public.categories
WHERE parent_id IS NULL OR level = 0
ORDER BY display_order;

-- View: Category tree (hierarchical)
CREATE OR REPLACE VIEW category_tree AS
WITH RECURSIVE tree AS (
  -- Root categories
  SELECT 
    id, 
    name, 
    slug, 
    parent_id, 
    level,
    display_order,
    ARRAY[name] as path,
    name::TEXT as path_string
  FROM public.categories
  WHERE parent_id IS NULL
  
  UNION ALL
  
  -- Child categories
  SELECT 
    c.id,
    c.name,
    c.slug,
    c.parent_id,
    c.level,
    c.display_order,
    t.path || c.name,
    t.path_string || ' > ' || c.name
  FROM public.categories c
  INNER JOIN tree t ON c.parent_id = t.id
)
SELECT * FROM tree
ORDER BY level, display_order, name;

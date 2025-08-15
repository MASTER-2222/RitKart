-- ====================================================================================================
-- RitZone Dynamic Homepage Management Database Schema
-- ====================================================================================================
-- Complete database schema for dynamic homepage content management system
-- Allows admin panel to control all homepage sections dynamically

-- ====================================================================================================
-- 1. HOMEPAGE SECTIONS TABLE
-- ====================================================================================================
-- Controls different sections of the homepage (Hero, Categories, Featured Products, etc.)

CREATE TABLE IF NOT EXISTS homepage_sections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    section_name VARCHAR(100) NOT NULL UNIQUE,
    section_title VARCHAR(200) NOT NULL,
    section_subtitle TEXT,
    section_type VARCHAR(50) NOT NULL, -- 'hero', 'category', 'products', 'content', 'banner'
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default homepage sections
INSERT INTO homepage_sections (section_name, section_title, section_subtitle, section_type, display_order) VALUES
('hero', 'Hero Section', 'Main banner slider with promotional content', 'hero', 1),
('categories', 'Shop by Category', 'Browse products by category', 'category', 2),
('featured_products', 'Featured Products', 'Handpicked products for you', 'products', 3),
('bestsellers_electronics', 'Bestsellers in Electronics', 'Top-selling electronic products', 'products', 4),
('prime_benefits', 'Prime Benefits', 'Membership benefits section', 'content', 5)
ON CONFLICT (section_name) DO NOTHING;

-- ====================================================================================================
-- 2. HOMEPAGE CONTENT TABLE
-- ====================================================================================================
-- Stores dynamic text content for different homepage sections

CREATE TABLE IF NOT EXISTS homepage_content (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    section_id UUID REFERENCES homepage_sections(id) ON DELETE CASCADE,
    content_key VARCHAR(100) NOT NULL, -- 'title', 'subtitle', 'description', 'button_text', etc.
    content_value TEXT NOT NULL,
    content_type VARCHAR(50) DEFAULT 'text', -- 'text', 'html', 'markdown'
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(section_id, content_key)
);

-- Insert default content for hero section
INSERT INTO homepage_content (section_id, content_key, content_value, content_type)
SELECT 
    hs.id,
    unnest(ARRAY['welcome_title', 'welcome_subtitle', 'cta_button_text']),
    unnest(ARRAY['Welcome to RitZone - Your One-Stop Shopping Destination', 'Discover millions of products with fast delivery, great deals, and excellent customer service', 'Shop Now']),
    'text'
FROM homepage_sections hs WHERE hs.section_name = 'hero'
ON CONFLICT (section_id, content_key) DO NOTHING;

-- Insert default content for other sections
INSERT INTO homepage_content (section_id, content_key, content_value, content_type)
SELECT 
    hs.id,
    'section_description',
    CASE hs.section_name
        WHEN 'categories' THEN 'Browse our wide range of product categories'
        WHEN 'featured_products' THEN 'Carefully curated products just for you'
        WHEN 'bestsellers_electronics' THEN 'Most popular electronics this month'
        WHEN 'prime_benefits' THEN 'Get exclusive benefits with Prime membership'
        ELSE 'Section content'
    END,
    'text'
FROM homepage_sections hs 
WHERE hs.section_name IN ('categories', 'featured_products', 'bestsellers_electronics', 'prime_benefits')
ON CONFLICT (section_id, content_key) DO NOTHING;

-- ====================================================================================================
-- 3. HOMEPAGE IMAGES TABLE
-- ====================================================================================================
-- Stores all images used in homepage sections

CREATE TABLE IF NOT EXISTS homepage_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    section_id UUID REFERENCES homepage_sections(id) ON DELETE CASCADE,
    image_key VARCHAR(100) NOT NULL, -- 'background', 'category_electronics', 'category_fashion', etc.
    image_url TEXT NOT NULL,
    image_alt VARCHAR(200),
    image_title VARCHAR(200),
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    upload_type VARCHAR(20) DEFAULT 'url', -- 'url' or 'upload'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default images for hero section
INSERT INTO homepage_images (section_id, image_key, image_url, image_alt, image_title, display_order)
SELECT 
    hs.id,
    'hero_background',
    'https://images.unsplash.com/photo-1534452203293-494d7ddbf7e0?w=1200&h=400&fit=crop&crop=center',
    'RitZone Hero Banner',
    'Premium Shopping Experience',
    1
FROM homepage_sections hs WHERE hs.section_name = 'hero'
ON CONFLICT DO NOTHING;

-- Insert default category images
INSERT INTO homepage_images (section_id, image_key, image_url, image_alt, image_title, display_order)
SELECT 
    hs.id,
    unnest(ARRAY['category_electronics', 'category_fashion', 'category_books', 'category_home', 'category_sports', 'category_grocery']),
    unnest(ARRAY[
        'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=300&h=200&fit=crop',
        'https://images.unsplash.com/photo-1445205170230-053b83016050?w=300&h=200&fit=crop',
        'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300&h=200&fit=crop',
        'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=300&h=200&fit=crop',
        'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=200&fit=crop',
        'https://images.unsplash.com/photo-1542838132-92c53300491e?w=300&h=200&fit=crop'
    ]),
    unnest(ARRAY['Electronics Category', 'Fashion Category', 'Books Category', 'Home & Garden Category', 'Sports & Outdoors Category', 'Grocery Category']),
    unnest(ARRAY['Latest tech gadgets and electronics', 'Trendy styles and fashion items', 'Books and educational books', 'Home decor and garden essentials', 'Sports gear and outdoor equipment', 'Fresh grocery and staples']),
    unnest(ARRAY[1, 2, 3, 4, 5, 6])
FROM homepage_sections hs WHERE hs.section_name = 'categories'
ON CONFLICT DO NOTHING;

-- ====================================================================================================
-- 4. CATEGORY HOMEPAGE MAPPING TABLE  
-- ====================================================================================================
-- Links database categories to homepage category display

CREATE TABLE IF NOT EXISTS homepage_category_mapping (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    section_id UUID REFERENCES homepage_sections(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
    display_order INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT true,
    custom_title VARCHAR(200), -- Override category name if needed
    custom_description TEXT, -- Override category description if needed
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(section_id, category_id)
);

-- Map existing categories to homepage display
INSERT INTO homepage_category_mapping (section_id, category_id, display_order, is_featured)
SELECT 
    hs.id,
    c.id,
    ROW_NUMBER() OVER (ORDER BY c.sort_order),
    true
FROM homepage_sections hs
CROSS JOIN categories c
WHERE hs.section_name = 'categories' 
    AND c.is_active = true
    AND c.slug IN ('electronics', 'fashion', 'books', 'home-garden', 'sports-outdoors', 'grocery')
ON CONFLICT (section_id, category_id) DO NOTHING;

-- ====================================================================================================
-- 5. FEATURED PRODUCTS MAPPING TABLE
-- ====================================================================================================
-- Controls which products appear in featured sections

CREATE TABLE IF NOT EXISTS homepage_featured_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    section_id UUID REFERENCES homepage_sections(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    feature_type VARCHAR(50) DEFAULT 'featured', -- 'featured', 'bestseller', 'deal', 'new'
    custom_title VARCHAR(200), -- Override product name if needed
    custom_price DECIMAL(10,2), -- Override product price if needed (for special pricing)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(section_id, product_id)
);

-- Auto-populate featured products from existing is_featured products
INSERT INTO homepage_featured_products (section_id, product_id, display_order, feature_type)
SELECT 
    hs.id,
    p.id,
    ROW_NUMBER() OVER (ORDER BY p.rating_average DESC),
    'featured'
FROM homepage_sections hs
CROSS JOIN products p
WHERE hs.section_name = 'featured_products' 
    AND p.is_featured = true 
    AND p.is_active = true
LIMIT 10
ON CONFLICT (section_id, product_id) DO NOTHING;

-- Auto-populate electronics bestsellers
INSERT INTO homepage_featured_products (section_id, product_id, display_order, feature_type)
SELECT 
    hs.id,
    p.id,
    ROW_NUMBER() OVER (ORDER BY p.rating_average DESC, p.total_reviews DESC),
    'bestseller'
FROM homepage_sections hs
CROSS JOIN products p
INNER JOIN categories c ON p.category_id = c.id
WHERE hs.section_name = 'bestsellers_electronics' 
    AND c.slug = 'electronics'
    AND p.is_active = true
LIMIT 10
ON CONFLICT (section_id, product_id) DO NOTHING;

-- ====================================================================================================
-- 6. CREATE INDEXES FOR PERFORMANCE
-- ====================================================================================================

-- Indexes for homepage_sections
CREATE INDEX IF NOT EXISTS idx_homepage_sections_active ON homepage_sections(is_active);
CREATE INDEX IF NOT EXISTS idx_homepage_sections_type ON homepage_sections(section_type);
CREATE INDEX IF NOT EXISTS idx_homepage_sections_order ON homepage_sections(display_order);

-- Indexes for homepage_content
CREATE INDEX IF NOT EXISTS idx_homepage_content_section ON homepage_content(section_id);
CREATE INDEX IF NOT EXISTS idx_homepage_content_active ON homepage_content(is_active);
CREATE INDEX IF NOT EXISTS idx_homepage_content_key ON homepage_content(content_key);

-- Indexes for homepage_images
CREATE INDEX IF NOT EXISTS idx_homepage_images_section ON homepage_images(section_id);
CREATE INDEX IF NOT EXISTS idx_homepage_images_active ON homepage_images(is_active);
CREATE INDEX IF NOT EXISTS idx_homepage_images_order ON homepage_images(display_order);

-- Indexes for homepage_category_mapping
CREATE INDEX IF NOT EXISTS idx_homepage_category_section ON homepage_category_mapping(section_id);
CREATE INDEX IF NOT EXISTS idx_homepage_category_featured ON homepage_category_mapping(is_featured);
CREATE INDEX IF NOT EXISTS idx_homepage_category_order ON homepage_category_mapping(display_order);

-- Indexes for homepage_featured_products
CREATE INDEX IF NOT EXISTS idx_homepage_featured_section ON homepage_featured_products(section_id);
CREATE INDEX IF NOT EXISTS idx_homepage_featured_active ON homepage_featured_products(is_active);
CREATE INDEX IF NOT EXISTS idx_homepage_featured_type ON homepage_featured_products(feature_type);
CREATE INDEX IF NOT EXISTS idx_homepage_featured_order ON homepage_featured_products(display_order);

-- ====================================================================================================
-- 7. ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================================================

-- Enable RLS
ALTER TABLE homepage_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE homepage_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE homepage_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE homepage_category_mapping ENABLE ROW LEVEL SECURITY;
ALTER TABLE homepage_featured_products ENABLE ROW LEVEL SECURITY;

-- Public read access for all tables
CREATE POLICY "Public read access" ON homepage_sections FOR SELECT USING (true);
CREATE POLICY "Public read access" ON homepage_content FOR SELECT USING (true);
CREATE POLICY "Public read access" ON homepage_images FOR SELECT USING (true);
CREATE POLICY "Public read access" ON homepage_category_mapping FOR SELECT USING (true);
CREATE POLICY "Public read access" ON homepage_featured_products FOR SELECT USING (true);

-- Admin full access policies (will be used by admin API)
CREATE POLICY "Admin full access" ON homepage_sections FOR ALL USING (true);
CREATE POLICY "Admin full access" ON homepage_content FOR ALL USING (true);
CREATE POLICY "Admin full access" ON homepage_images FOR ALL USING (true);
CREATE POLICY "Admin full access" ON homepage_category_mapping FOR ALL USING (true);
CREATE POLICY "Admin full access" ON homepage_featured_products FOR ALL USING (true);

-- ====================================================================================================
-- 8. HELPFUL VIEWS FOR API QUERIES
-- ====================================================================================================

-- View for complete homepage section data
CREATE OR REPLACE VIEW homepage_section_complete AS
SELECT 
    hs.id,
    hs.section_name,
    hs.section_title,
    hs.section_subtitle,
    hs.section_type,
    hs.display_order,
    hs.is_active,
    -- Aggregate content
    json_agg(
        DISTINCT jsonb_build_object(
            'key', hc.content_key,
            'value', hc.content_value,
            'type', hc.content_type
        )
    ) FILTER (WHERE hc.id IS NOT NULL) as content,
    -- Aggregate images  
    json_agg(
        DISTINCT jsonb_build_object(
            'id', hi.id,
            'key', hi.image_key,
            'url', hi.image_url,
            'alt', hi.image_alt,
            'title', hi.image_title,
            'order', hi.display_order,
            'upload_type', hi.upload_type
        ) ORDER BY hi.display_order
    ) FILTER (WHERE hi.id IS NOT NULL) as images
FROM homepage_sections hs
LEFT JOIN homepage_content hc ON hs.id = hc.section_id AND hc.is_active = true
LEFT JOIN homepage_images hi ON hs.id = hi.section_id AND hi.is_active = true
WHERE hs.is_active = true
GROUP BY hs.id, hs.section_name, hs.section_title, hs.section_subtitle, hs.section_type, hs.display_order, hs.is_active
ORDER BY hs.display_order;

-- View for homepage categories with images
CREATE OR REPLACE VIEW homepage_categories_display AS
SELECT 
    hs.id as section_id,
    hs.section_name,
    c.id as category_id,
    c.name as category_name,
    c.slug as category_slug,
    c.description as category_description,
    c.image_url as category_image,
    hcm.display_order,
    hcm.custom_title,
    hcm.custom_description,
    hi.image_url as homepage_image_url,
    hi.image_alt,
    hi.image_title
FROM homepage_sections hs
INNER JOIN homepage_category_mapping hcm ON hs.id = hcm.section_id AND hcm.is_featured = true
INNER JOIN categories c ON hcm.category_id = c.id AND c.is_active = true
LEFT JOIN homepage_images hi ON hs.id = hi.section_id AND hi.image_key = CONCAT('category_', c.slug)
WHERE hs.is_active = true AND hs.section_type = 'category'
ORDER BY hs.display_order, hcm.display_order;

-- View for homepage featured products
CREATE OR REPLACE VIEW homepage_products_display AS
SELECT 
    hs.id as section_id,
    hs.section_name,
    hs.section_title,
    p.id as product_id,
    COALESCE(hfp.custom_title, p.name) as product_name,
    p.slug as product_slug,
    p.description as product_description,
    COALESCE(hfp.custom_price, p.price) as product_price,
    p.original_price,
    p.images as product_images,
    p.brand,
    p.rating_average,
    p.total_reviews,
    p.stock_quantity,
    hfp.display_order,
    hfp.feature_type
FROM homepage_sections hs
INNER JOIN homepage_featured_products hfp ON hs.id = hfp.section_id AND hfp.is_active = true
INNER JOIN products p ON hfp.product_id = p.id AND p.is_active = true
WHERE hs.is_active = true AND hs.section_type = 'products'
ORDER BY hs.display_order, hfp.display_order;

-- ====================================================================================================
-- SUCCESS MESSAGE
-- ====================================================================================================

DO $$
BEGIN
    RAISE NOTICE '✅ RitZone Dynamic Homepage Management Database Schema Created Successfully!';
    RAISE NOTICE '📊 Tables Created: homepage_sections, homepage_content, homepage_images, homepage_category_mapping, homepage_featured_products';
    RAISE NOTICE '🔍 Views Created: homepage_section_complete, homepage_categories_display, homepage_products_display';
    RAISE NOTICE '🛡️ RLS Policies: Enabled with public read and admin full access';
    RAISE NOTICE '🚀 Ready for Admin Panel Integration!';
END $$;
-- =====================================================
-- RITZONE DYNAMIC CONTENT DATABASE MIGRATION
-- =====================================================
-- Adding hero banners and deals tables for dynamic content

-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- HERO BANNERS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.hero_banners (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    title TEXT NOT NULL,
    subtitle TEXT,
    image_url TEXT NOT NULL,
    button_text TEXT DEFAULT 'Shop Now',
    button_link TEXT DEFAULT '#',
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true
);

-- =====================================================
-- DEALS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.deals (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    product_id UUID REFERENCES public.products(id) NOT NULL,
    deal_title TEXT,
    deal_description TEXT,
    original_price DECIMAL(10,2) NOT NULL,
    deal_price DECIMAL(10,2) NOT NULL,
    discount_percentage INTEGER GENERATED ALWAYS AS (
        CASE 
            WHEN original_price > 0 THEN ROUND(((original_price - deal_price) / original_price * 100)::numeric, 0)::integer
            ELSE 0
        END
    ) STORED,
    start_date TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    max_quantity INTEGER,
    used_quantity INTEGER DEFAULT 0,
    deal_type TEXT DEFAULT 'flash_sale' CHECK (deal_type IN ('flash_sale', 'daily_deal', 'weekly_deal', 'clearance')),
    category TEXT
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Hero banners indexes
CREATE INDEX IF NOT EXISTS idx_hero_banners_is_active ON public.hero_banners(is_active);
CREATE INDEX IF NOT EXISTS idx_hero_banners_sort_order ON public.hero_banners(sort_order);

-- Deals indexes
CREATE INDEX IF NOT EXISTS idx_deals_product_id ON public.deals(product_id);
CREATE INDEX IF NOT EXISTS idx_deals_is_active ON public.deals(is_active);
CREATE INDEX IF NOT EXISTS idx_deals_start_date ON public.deals(start_date);
CREATE INDEX IF NOT EXISTS idx_deals_end_date ON public.deals(end_date);
CREATE INDEX IF NOT EXISTS idx_deals_category ON public.deals(category);
CREATE INDEX IF NOT EXISTS idx_deals_deal_type ON public.deals(deal_type);

-- =====================================================
-- TRIGGERS FOR UPDATED_AT TIMESTAMPS
-- =====================================================

-- Hero banners trigger
CREATE TRIGGER IF NOT EXISTS update_hero_banners_updated_at 
    BEFORE UPDATE ON public.hero_banners 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Deals trigger  
CREATE TRIGGER IF NOT EXISTS update_deals_updated_at 
    BEFORE UPDATE ON public.deals 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY POLICIES
-- =====================================================

-- Enable RLS on new tables
ALTER TABLE public.hero_banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;

-- Hero banners policies (public read access)
CREATE POLICY IF NOT EXISTS "Hero banners are publicly readable" ON public.hero_banners 
    FOR SELECT USING (is_active = true);

-- Deals policies (public read access for active deals)
CREATE POLICY IF NOT EXISTS "Active deals are publicly readable" ON public.deals 
    FOR SELECT USING (is_active = true AND NOW() BETWEEN start_date AND end_date);

-- =====================================================
-- FUNCTIONS FOR DEALS BUSINESS LOGIC
-- =====================================================

-- Function to check if a deal is currently active
CREATE OR REPLACE FUNCTION is_deal_active(deal_id_param UUID)
RETURNS BOOLEAN AS $$
DECLARE
    deal_record RECORD;
BEGIN
    SELECT is_active, start_date, end_date, max_quantity, used_quantity
    INTO deal_record
    FROM public.deals 
    WHERE id = deal_id_param;
    
    IF NOT FOUND THEN
        RETURN false;
    END IF;
    
    -- Check if deal is active, within date range, and has quantity available
    RETURN deal_record.is_active = true 
           AND NOW() BETWEEN deal_record.start_date AND deal_record.end_date
           AND (deal_record.max_quantity IS NULL OR deal_record.used_quantity < deal_record.max_quantity);
END;
$$ language 'plpgsql';

-- Function to get active deals
CREATE OR REPLACE FUNCTION get_active_deals(category_filter TEXT DEFAULT NULL, limit_param INTEGER DEFAULT NULL)
RETURNS TABLE(
    id UUID,
    product_id UUID,
    deal_title TEXT,
    deal_description TEXT,
    original_price DECIMAL(10,2),
    deal_price DECIMAL(10,2),
    discount_percentage INTEGER,
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    category TEXT,
    deal_type TEXT,
    product_name TEXT,
    product_images TEXT[],
    product_brand TEXT,
    product_rating_average DECIMAL(3,2),
    product_total_reviews INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        d.id,
        d.product_id,
        d.deal_title,
        d.deal_description,
        d.original_price,
        d.deal_price,
        d.discount_percentage,
        d.start_date,
        d.end_date,
        d.category,
        d.deal_type,
        p.name as product_name,
        p.images as product_images,
        p.brand as product_brand,
        p.rating_average as product_rating_average,
        p.total_reviews as product_total_reviews
    FROM public.deals d
    JOIN public.products p ON d.product_id = p.id
    WHERE d.is_active = true 
          AND NOW() BETWEEN d.start_date AND d.end_date
          AND (d.max_quantity IS NULL OR d.used_quantity < d.max_quantity)
          AND p.is_active = true
          AND (category_filter IS NULL OR d.category = category_filter)
    ORDER BY d.discount_percentage DESC, d.end_date ASC
    LIMIT limit_param;
END;
$$ language 'plpgsql';

-- =====================================================
-- INSERT SAMPLE HERO BANNERS DATA
-- =====================================================

-- Insert the 8 hero banners (keeping exact same data from frontend)
INSERT INTO public.hero_banners (title, subtitle, image_url, sort_order) VALUES
('Fashion & Lifestyle', 'Discover trendy styles and accessories for every occasion', 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1200&h=400&fit=crop&crop=center', 1),
('Premium Shopping Experience', 'Quality products delivered straight to your door', 'https://images.unsplash.com/photo-1534452203293-494d7ddbf7e0?w=1200&h=400&fit=crop&crop=center', 2),
('Shop with Confidence', 'Explore our vast selection in our modern retail space', 'https://images.unsplash.com/photo-1481437156560-3205f6a55735?w=1200&h=400&fit=crop&crop=center', 3),
('Weekend Shopping Spree', 'Get amazing deals on all your favorite brands', 'https://images.unsplash.com/photo-1573855619003-97b4799dcd8b?w=1200&h=400&fit=crop&crop=center', 4),
('MEGA SALE EVENT', 'Up to 70% off on electronics, fashion, and more!', 'https://images.unsplash.com/photo-1532795986-dbef1643a596?w=1200&h=400&fit=crop&crop=center', 5),
('Black Friday Deals', 'Massive discounts across all categories - Limited time only', 'https://images.unsplash.com/photo-1607083206968-13611e3d76db?w=1200&h=400&fit=crop&crop=center', 6),
('Special Offers', 'Exclusive deals and promotional prices just for you', 'https://images.pexels.com/photos/5868722/pexels-photo-5868722.jpeg?w=1200&h=400&fit=crop&crop=center', 7),
('Shop Online Anytime', 'Convenient online shopping with fast delivery options', 'https://images.unsplash.com/photo-1586880244406-556ebe35f282?w=1200&h=400&fit=crop&crop=center', 8)
ON CONFLICT DO NOTHING;

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================
-- Dynamic content tables created successfully!
-- Next steps:
-- 1. Migrate product data from hardcoded arrays
-- 2. Create sample deals data
-- 3. Update backend APIs to serve dynamic data
-- 4. Update frontend to consume dynamic APIs
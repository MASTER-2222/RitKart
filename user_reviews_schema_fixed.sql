-- =====================================================
-- RITZONE USER REVIEWS TABLE SCHEMA - FIXED
-- =====================================================
-- Run this SQL in your Supabase SQL Editor to create user_reviews table
-- This enables registered users to submit reviews with images for products

-- Create user_reviews table
CREATE TABLE IF NOT EXISTS public.user_reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT NOT NULL CHECK (length(review_text) >= 10 AND length(review_text) <= 2000),
    images JSONB DEFAULT '[]'::jsonb,
    is_approved BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    -- Ensure one review per user per product
    UNIQUE(user_id, product_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_reviews_product_id ON public.user_reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_user_reviews_user_id ON public.user_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_user_reviews_rating ON public.user_reviews(rating);
CREATE INDEX IF NOT EXISTS idx_user_reviews_created_at ON public.user_reviews(created_at DESC);

-- Add comments for documentation
COMMENT ON TABLE public.user_reviews IS 'User-submitted reviews for products with rating, text, and images';
COMMENT ON COLUMN public.user_reviews.rating IS 'User rating from 1 to 5 stars';
COMMENT ON COLUMN public.user_reviews.review_text IS 'User review text content (10-2000 characters)';
COMMENT ON COLUMN public.user_reviews.images IS 'Array of image URLs uploaded by user (max 5 images)';
COMMENT ON COLUMN public.user_reviews.is_approved IS 'Admin approval status (default true for auto-approval)';

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to auto-update updated_at
DROP TRIGGER IF EXISTS update_user_reviews_updated_at ON public.user_reviews;
CREATE TRIGGER update_user_reviews_updated_at
    BEFORE UPDATE ON public.user_reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE public.user_reviews ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only see approved reviews or their own reviews
DROP POLICY IF EXISTS "Users can view approved reviews or own reviews" ON public.user_reviews;
CREATE POLICY "Users can view approved reviews or own reviews"
    ON public.user_reviews FOR SELECT
    USING (
        is_approved = true 
        OR 
        auth.uid() = user_id
    );

-- RLS Policy: Authenticated users can insert their own reviews
DROP POLICY IF EXISTS "Users can insert their own reviews" ON public.user_reviews;
CREATE POLICY "Users can insert their own reviews"
    ON public.user_reviews FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can update their own reviews
DROP POLICY IF EXISTS "Users can update their own reviews" ON public.user_reviews;
CREATE POLICY "Users can update their own reviews"
    ON public.user_reviews FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can delete their own reviews
DROP POLICY IF EXISTS "Users can delete their own reviews" ON public.user_reviews;
CREATE POLICY "Users can delete their own reviews"
    ON public.user_reviews FOR DELETE
    USING (auth.uid() = user_id);

-- Create a view for product reviews with user information
CREATE OR REPLACE VIEW public.product_reviews_with_users AS
SELECT 
    ur.id,
    ur.product_id,
    ur.rating,
    ur.review_text,
    ur.images,
    ur.created_at,
    ur.updated_at,
    ur.is_approved,
    u.email as user_email,
    COALESCE(u.full_name, 'Anonymous User') as user_name
FROM public.user_reviews ur
LEFT JOIN public.users u ON ur.user_id = u.id
WHERE ur.is_approved = true
ORDER BY ur.created_at DESC;

-- Grant necessary permissions (FIXED - removed non-existent sequence)
GRANT SELECT ON public.product_reviews_with_users TO anon, authenticated;
GRANT ALL ON public.user_reviews TO authenticated;

-- Verification queries
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'user_reviews' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Show success message
SELECT 'SUCCESS: User reviews table created with RLS policies! 🎉' as status,
       'Users can now submit reviews with ratings and images' as description;
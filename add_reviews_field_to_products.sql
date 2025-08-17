-- =====================================================
-- RITZONE PRODUCTS TABLE - ADD REVIEWS FIELD
-- =====================================================
-- Run this SQL in your Supabase SQL Editor to add the reviews field
-- This will enable full Reviews functionality in the admin panel

-- Add reviews column to products table
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS reviews TEXT DEFAULT '';

-- Add comment for documentation
COMMENT ON COLUMN public.products.reviews IS 'Product reviews content, customer feedback, or review summary for admin management';

-- Verify the column was added successfully
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'products' 
AND table_schema = 'public'
AND column_name = 'reviews';

-- Show success message
SELECT 'SUCCESS: Reviews field added to products table! 🎉' as status;
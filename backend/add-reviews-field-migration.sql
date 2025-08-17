-- =====================================================
-- ADD REVIEWS FIELD TO PRODUCTS TABLE
-- =====================================================
-- Migration to add reviews text field to products table
-- This will store product reviews content/summary

ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS reviews TEXT DEFAULT '';

-- Update the updated_at timestamp
UPDATE public.products 
SET updated_at = TIMEZONE('utc'::text, NOW())
WHERE reviews IS NULL;

-- Add comment to the column
COMMENT ON COLUMN public.products.reviews IS 'Product reviews content, customer feedback, or review summary';

-- Verify the column was added
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'products' 
AND column_name = 'reviews';
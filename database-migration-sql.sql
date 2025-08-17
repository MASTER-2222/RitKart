-- =============================================
-- RITZONE DATABASE MIGRATION - Add is_bestseller Column
-- =============================================
-- Execute this script in Supabase Dashboard > SQL Editor
-- This will fix the Electronics CRUD functionality in Admin Panel

-- Step 1: Add the missing is_bestseller column to products table
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS is_bestseller BOOLEAN DEFAULT false;

-- Step 2: Create index for better performance on bestseller queries
CREATE INDEX IF NOT EXISTS idx_products_is_bestseller 
ON public.products(is_bestseller) 
WHERE is_bestseller = true;

-- Step 3: Set some sample products as bestsellers for testing
-- Update popular electronics brands to be bestsellers
UPDATE public.products 
SET is_bestseller = true 
WHERE is_active = true 
  AND brand IN ('Samsung', 'Apple', 'Sony', 'LG', 'Dell', 'HP')
  AND is_bestseller IS NOT NULL;

-- Step 4: Verification - Check if column was added successfully
SELECT 
    column_name, 
    data_type, 
    column_default, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'products' 
  AND column_name = 'is_bestseller';

-- Step 5: Sample query to verify bestseller products
SELECT 
    id,
    name,
    brand,
    price,
    is_bestseller,
    is_featured,
    is_active
FROM public.products 
WHERE is_bestseller = true 
  AND is_active = true
ORDER BY brand, name
LIMIT 10;

-- Step 6: Count verification
SELECT 
    COUNT(*) as total_products,
    COUNT(CASE WHEN is_bestseller = true THEN 1 END) as bestseller_count,
    COUNT(CASE WHEN is_featured = true THEN 1 END) as featured_count,
    COUNT(CASE WHEN is_active = true THEN 1 END) as active_count
FROM public.products;

-- =============================================
-- EXPECTED RESULTS AFTER RUNNING THIS SCRIPT:
-- =============================================
-- 1. products table will have 'is_bestseller' column (BOOLEAN DEFAULT false)
-- 2. Some Samsung, Apple, Sony, LG, Dell, HP products will be marked as bestsellers
-- 3. Admin Panel Electronics CRUD operations will work correctly
-- 4. Backend APIs will successfully query products with is_bestseller column
-- =============================================
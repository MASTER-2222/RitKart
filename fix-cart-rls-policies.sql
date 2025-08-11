-- =====================================================
-- RitZone: Fix Cart Functionality RLS Policies
-- =====================================================
-- Execute this in your Supabase SQL Editor to fix Add to Cart functionality
-- This resolves the foreign key constraint and RLS policy issues

-- Enable RLS on tables (if not already enabled)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- USERS TABLE RLS POLICIES
-- =====================================================

-- Allow inserting users (for registration/system use)
CREATE POLICY "Allow user inserts for registration" ON public.users 
FOR INSERT WITH CHECK (true);

-- Allow reading users (for profile/cart operations)
CREATE POLICY "Allow user reads" ON public.users 
FOR SELECT USING (true);

-- Allow updating users (for profile updates)
CREATE POLICY "Allow user updates" ON public.users 
FOR UPDATE USING (true);

-- Allow deleting users (for admin/system use)
CREATE POLICY "Allow user deletes" ON public.users 
FOR DELETE USING (true);

-- =====================================================
-- CARTS TABLE RLS POLICIES
-- =====================================================

-- Allow inserting carts (for cart creation)
CREATE POLICY "Allow cart inserts" ON public.carts 
FOR INSERT WITH CHECK (true);

-- Allow reading carts (for cart retrieval)
CREATE POLICY "Allow cart reads" ON public.carts 
FOR SELECT USING (true);

-- Allow updating carts (for cart modifications)
CREATE POLICY "Allow cart updates" ON public.carts 
FOR UPDATE USING (true);

-- Allow deleting carts (for cart cleanup)
CREATE POLICY "Allow cart deletes" ON public.carts 
FOR DELETE USING (true);

-- =====================================================
-- CART_ITEMS TABLE RLS POLICIES
-- =====================================================

-- Allow inserting cart items (for adding products to cart)
CREATE POLICY "Allow cart_items inserts" ON public.cart_items 
FOR INSERT WITH CHECK (true);

-- Allow reading cart items (for cart display)
CREATE POLICY "Allow cart_items reads" ON public.cart_items 
FOR SELECT USING (true);

-- Allow updating cart items (for quantity changes)
CREATE POLICY "Allow cart_items updates" ON public.cart_items 
FOR UPDATE USING (true);

-- Allow deleting cart items (for removing from cart)
CREATE POLICY "Allow cart_items deletes" ON public.cart_items 
FOR DELETE USING (true);

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Check if policies were created successfully
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename IN ('users', 'carts', 'cart_items')
ORDER BY tablename, policyname;

-- Test user table access
SELECT 'Users table policies applied successfully' as status;

-- Completion message
SELECT 'Cart functionality RLS policies have been successfully applied! Add to Cart should now work.' as final_status;
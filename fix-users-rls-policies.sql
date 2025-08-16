-- =====================================================
-- RitZone: Fix Users RLS Policies for Cart Functionality
-- =====================================================
-- Add missing INSERT/UPDATE/DELETE policies for users table
-- This fixes the cart functionality by allowing user creation

-- Add policy to allow inserting users (for registration/system use)
CREATE POLICY "Allow user inserts" ON public.users 
FOR INSERT WITH CHECK (true);

-- Add policy to allow updating users (for profile updates)
CREATE POLICY "Allow user updates" ON public.users 
FOR UPDATE USING (true);

-- Add policy to allow reading users (for profile/cart operations)
CREATE POLICY "Allow user reads" ON public.users 
FOR SELECT USING (true);

-- Add policy to allow deleting users (for admin/system use)
CREATE POLICY "Allow user deletes" ON public.users 
FOR DELETE USING (true);

-- Also ensure cart tables have proper policies
CREATE POLICY "Allow cart inserts" ON public.carts 
FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow cart updates" ON public.carts 
FOR UPDATE USING (true);

CREATE POLICY "Allow cart reads" ON public.carts 
FOR SELECT USING (true);

CREATE POLICY "Allow cart deletes" ON public.carts 
FOR DELETE USING (true);

-- Cart items policies
CREATE POLICY "Allow cart_items inserts" ON public.cart_items 
FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow cart_items updates" ON public.cart_items 
FOR UPDATE USING (true);

CREATE POLICY "Allow cart_items reads" ON public.cart_items 
FOR SELECT USING (true);

CREATE POLICY "Allow cart_items deletes" ON public.cart_items 
FOR DELETE USING (true);

-- Completion message
SELECT 'Users and Cart RLS policies added successfully! Cart functionality should now work.' as status;
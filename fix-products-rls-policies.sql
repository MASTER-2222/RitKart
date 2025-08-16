-- =====================================================
-- RitZone: Fix Products RLS Policies
-- =====================================================
-- Add missing INSERT/UPDATE/DELETE policies for products table
-- Based on successful approach used for hero_banners and deals

-- Add policy to allow inserting products (for admin/system use)
CREATE POLICY "Allow product inserts" ON public.products 
FOR INSERT WITH CHECK (true);

-- Add policy to allow updating products (for admin/system use) 
CREATE POLICY "Allow product updates" ON public.products 
FOR UPDATE USING (true);

-- Add policy to allow deleting products (for admin/system use)
CREATE POLICY "Allow product deletes" ON public.products 
FOR DELETE USING (true);

-- Also add policies for categories
CREATE POLICY "Allow category inserts" ON public.categories 
FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow category updates" ON public.categories 
FOR UPDATE USING (true);

CREATE POLICY "Allow category deletes" ON public.categories 
FOR DELETE USING (true);

-- Completion message
SELECT 'Products RLS policies added successfully! Product creation should now work.' as status;
-- =============================================
-- RitZone Auto-Synchronization Setup
-- =============================================
-- One-time setup for automatic user synchronization between 
-- Supabase Auth and Express Node.js backend
-- Run this in Supabase SQL Editor

-- =============================================
-- 🔄 CREATE UNIVERSAL RLS POLICIES
-- =============================================

-- Users Table Policies
DROP POLICY IF EXISTS "Users can read own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Allow authenticated users to insert" ON public.users;
DROP POLICY IF EXISTS "Allow service role full access" ON public.users;

CREATE POLICY "Users can read own profile" ON public.users
FOR SELECT USING (auth.uid() = id OR auth.role() = 'service_role');

CREATE POLICY "Users can update own profile" ON public.users
FOR UPDATE USING (auth.uid() = id OR auth.role() = 'service_role');

CREATE POLICY "Allow authenticated users to insert" ON public.users
FOR INSERT WITH CHECK (auth.uid() = id OR auth.role() = 'service_role');

CREATE POLICY "Allow service role full access" ON public.users
FOR ALL USING (auth.role() = 'service_role');

-- Carts Table Policies
DROP POLICY IF EXISTS "Users can manage own cart" ON public.carts;
DROP POLICY IF EXISTS "Allow service role full access to carts" ON public.carts;

CREATE POLICY "Users can manage own cart" ON public.carts
FOR ALL USING (auth.uid() = user_id OR auth.role() = 'service_role');

CREATE POLICY "Allow service role full access to carts" ON public.carts
FOR ALL USING (auth.role() = 'service_role');

-- Cart Items Table Policies  
DROP POLICY IF EXISTS "Users can manage own cart items" ON public.cart_items;
DROP POLICY IF EXISTS "Allow service role full access to cart items" ON public.cart_items;

CREATE POLICY "Users can manage own cart items" ON public.cart_items
FOR ALL USING (
  auth.uid() IN (
    SELECT user_id FROM public.carts WHERE id = cart_id
  ) OR auth.role() = 'service_role'
);

CREATE POLICY "Allow service role full access to cart items" ON public.cart_items
FOR ALL USING (auth.role() = 'service_role');

-- Orders Table Policies
DROP POLICY IF EXISTS "Users can manage own orders" ON public.orders;
DROP POLICY IF EXISTS "Allow service role full access to orders" ON public.orders;

CREATE POLICY "Users can manage own orders" ON public.orders
FOR ALL USING (auth.uid() = user_id OR auth.role() = 'service_role');

CREATE POLICY "Allow service role full access to orders" ON public.orders
FOR ALL USING (auth.role() = 'service_role');

-- Order Items Table Policies
DROP POLICY IF EXISTS "Users can view own order items" ON public.order_items;
DROP POLICY IF EXISTS "Allow service role full access to order items" ON public.order_items;

CREATE POLICY "Users can view own order items" ON public.order_items
FOR SELECT USING (
  auth.uid() IN (
    SELECT user_id FROM public.orders WHERE id = order_id
  ) OR auth.role() = 'service_role'
);

CREATE POLICY "Allow service role full access to order items" ON public.order_items
FOR ALL USING (auth.role() = 'service_role');

-- =============================================
-- 🚀 AUTO-SYNC TRIGGER FUNCTION
-- =============================================

-- Function to automatically sync new auth users to users table
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger 
LANGUAGE plpgsql 
SECURITY DEFINER
AS $$
BEGIN
  -- Insert new user into public.users table
  INSERT INTO public.users (
    id, 
    email, 
    full_name, 
    phone, 
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', 'User'),
    NEW.raw_user_meta_data->>'phone',
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, public.users.full_name),
    phone = COALESCE(EXCLUDED.phone, public.users.phone),
    updated_at = NOW();
  
  RETURN NEW;
END;
$$;

-- =============================================
-- 🎯 CREATE AUTO-SYNC TRIGGER
-- =============================================

-- Remove existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger to automatically sync new users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- 🔄 SYNC EXISTING USERS (One-time migration)
-- =============================================

-- Sync all existing auth users to public.users table
INSERT INTO public.users (
  id, 
  email, 
  full_name, 
  phone, 
  created_at,
  updated_at
)
SELECT 
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'full_name', au.raw_user_meta_data->>'name', 'User'),
  au.raw_user_meta_data->>'phone',
  au.created_at,
  NOW()
FROM auth.users au
WHERE au.id NOT IN (SELECT id FROM public.users)
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = COALESCE(EXCLUDED.full_name, public.users.full_name),
  phone = COALESCE(EXCLUDED.phone, public.users.phone),
  updated_at = NOW();

-- =============================================
-- 🔧 CREATE SERVICE FUNCTIONS
-- =============================================

-- Function to get user info including auth data
CREATE OR REPLACE FUNCTION public.get_user_with_auth(user_uuid uuid)
RETURNS TABLE (
  id uuid,
  email text,
  full_name text,
  phone text,
  created_at timestamptz,
  updated_at timestamptz,
  auth_email text,
  auth_confirmed_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id,
    u.email,
    u.full_name,
    u.phone,
    u.created_at,
    u.updated_at,
    au.email as auth_email,
    au.email_confirmed_at as auth_confirmed_at
  FROM public.users u
  LEFT JOIN auth.users au ON u.id = au.id
  WHERE u.id = user_uuid;
END;
$$;

-- Function to force sync a specific user
CREATE OR REPLACE FUNCTION public.force_sync_user(user_uuid uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_record auth.users%ROWTYPE;
BEGIN
  -- Get auth user data
  SELECT * INTO user_record FROM auth.users WHERE id = user_uuid;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'User not found in auth.users: %', user_uuid;
  END IF;
  
  -- Upsert into public.users
  INSERT INTO public.users (
    id, 
    email, 
    full_name, 
    phone, 
    created_at,
    updated_at
  )
  VALUES (
    user_record.id,
    user_record.email,
    COALESCE(user_record.raw_user_meta_data->>'full_name', user_record.raw_user_meta_data->>'name', 'User'),
    user_record.raw_user_meta_data->>'phone',
    user_record.created_at,
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, public.users.full_name),
    phone = COALESCE(EXCLUDED.phone, public.users.phone),
    updated_at = NOW();
  
  RETURN TRUE;
END;
$$;

-- =============================================
-- 🔍 VERIFICATION QUERIES
-- =============================================

-- Check sync status
SELECT 
  'Auth Users' as table_name, 
  COUNT(*) as count 
FROM auth.users
UNION ALL
SELECT 
  'Public Users' as table_name, 
  COUNT(*) as count 
FROM public.users
UNION ALL
SELECT 
  'Synced Users' as table_name, 
  COUNT(*) as count 
FROM auth.users au 
INNER JOIN public.users pu ON au.id = pu.id;

-- =============================================
-- 💡 USAGE INSTRUCTIONS
-- =============================================

-- This setup provides:
-- 1. ✅ Universal RLS policies that work with both Supabase Auth and service role
-- 2. ✅ Automatic user synchronization via database triggers
-- 3. ✅ One-time migration of existing users
-- 4. ✅ Helper functions for manual sync if needed
-- 5. ✅ Verification queries to check sync status

-- After running this:
-- - New users will be automatically synced to public.users table
-- - Cart operations will work seamlessly with Supabase tokens
-- - No more manual RLS policy creation needed
-- - Express backend will have access to user data automatically

SELECT '🎉 Auto-synchronization setup completed successfully!' as status;
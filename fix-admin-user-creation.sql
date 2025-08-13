-- ===============================================
-- FIX ADMIN USER CREATION - RitZone Admin Panel
-- ===============================================
-- Execute this in Supabase SQL Editor to create the admin user and fix RLS policies
-- This will resolve the "Invalid email or password" error

-- Step 1: Check if admin tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('admin_users', 'admin_sessions', 'admin_activity_logs', 'dashboard_analytics');

-- Step 2: Temporarily disable RLS for admin_users table to allow insert
ALTER TABLE admin_users DISABLE ROW LEVEL SECURITY;

-- Step 3: Delete any existing admin user (in case there are duplicates)
DELETE FROM admin_users WHERE email = 'admin@ritzone.com';

-- Step 4: Insert the admin user with the correct hashed password
-- Password: RitZone@Admin2025!
-- Hash: $2a$12$Zt8zOGI8iOxIDqLbmXn2h.kxJLkJm07bvkoSx3JG71D2V4TcHhYAK
INSERT INTO admin_users (
  id,
  email, 
  password_hash, 
  full_name, 
  role, 
  is_active,
  login_attempts,
  locked_until,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'admin@ritzone.com',
  '$2a$12$Zt8zOGI8iOxIDqLbmXn2h.kxJLkJm07bvkoSx3JG71D2V4TcHhYAK',
  'Rit Mukherjee',
  'super_admin',
  true,
  0,
  null,
  NOW(),
  NOW()
);

-- Step 5: Create RLS policies for admin_users table
-- Policy to allow admin users to read their own data
CREATE POLICY "Admin users can read own data" ON admin_users
FOR SELECT USING (auth.uid()::text = id::text OR email = current_setting('request.jwt.claims', true)::json->>'email');

-- Policy to allow admin users to update their own data
CREATE POLICY "Admin users can update own data" ON admin_users
FOR UPDATE USING (auth.uid()::text = id::text OR email = current_setting('request.jwt.claims', true)::json->>'email');

-- Policy to allow admin login (public access for authentication)  
CREATE POLICY "Allow admin login" ON admin_users
FOR SELECT USING (true);

-- Step 6: Re-enable RLS for admin_users table
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Step 7: Create RLS policies for admin_sessions table
CREATE POLICY "Admin users can manage their sessions" ON admin_sessions
FOR ALL USING (
  admin_user_id IN (
    SELECT id FROM admin_users 
    WHERE email = current_setting('request.jwt.claims', true)::json->>'email'
  )
);

-- Policy to allow session validation (public access for authentication)
CREATE POLICY "Allow session validation" ON admin_sessions
FOR SELECT USING (true);

-- Step 8: Create RLS policies for admin_activity_logs table
CREATE POLICY "Admin users can read activity logs" ON admin_activity_logs
FOR SELECT USING (
  admin_user_id IN (
    SELECT id FROM admin_users 
    WHERE email = current_setting('request.jwt.claims', true)::json->>'email'
  )
);

-- Policy to allow activity logging (public access for logging)
CREATE POLICY "Allow activity logging" ON admin_activity_logs
FOR INSERT WITH CHECK (true);

-- Step 9: Create RLS policies for dashboard_analytics table
CREATE POLICY "Admin users can read dashboard analytics" ON dashboard_analytics
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM admin_users 
    WHERE email = current_setting('request.jwt.claims', true)::json->>'email'
    AND is_active = true
  )
);

-- Step 10: Verify the admin user was created successfully
SELECT 
  id,
  email, 
  full_name, 
  role, 
  is_active, 
  login_attempts,
  created_at,
  'Password hash exists: ' || CASE WHEN password_hash IS NOT NULL THEN 'YES' ELSE 'NO' END as password_status
FROM admin_users 
WHERE email = 'admin@ritzone.com';

-- Step 11: Test password hash validation (this should return true)
SELECT 
  email,
  full_name,
  crypt('RitZone@Admin2025!', password_hash) = password_hash as password_valid
FROM admin_users 
WHERE email = 'admin@ritzone.com';

-- Success message
SELECT 'Admin user creation completed! You can now login with admin@ritzone.com and password RitZone@Admin2025!' as success_message;
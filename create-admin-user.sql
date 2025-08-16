-- Create Admin User SQL Script
-- Execute this in Supabase SQL Editor to create the admin user

-- Temporarily disable RLS for admin_users table
ALTER TABLE admin_users DISABLE ROW LEVEL SECURITY;

-- Insert the admin user with hashed password
INSERT INTO admin_users (
  email, 
  password_hash, 
  full_name, 
  role, 
  is_active,
  login_attempts,
  locked_until,
  created_at
) VALUES (
  'admin@ritzone.com',
  '$2a$12$Zt8zOGI8iOxIDqLbmXn2h.kxJLkJm07bvkoSx3JG71D2V4TcHhYAK',
  'Rit Mukherjee',
  'super_admin',
  true,
  0,
  null,
  NOW()
) ON CONFLICT (email) DO UPDATE SET
  password_hash = EXCLUDED.password_hash,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  is_active = EXCLUDED.is_active,
  login_attempts = 0,
  locked_until = null;

-- Re-enable RLS for admin_users table
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Verify the admin user was created
SELECT email, full_name, role, is_active, created_at FROM admin_users WHERE email = 'admin@ritzone.com';
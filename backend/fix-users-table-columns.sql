-- ============================================================================
-- FIX: Add Missing Columns to Users Table
-- ============================================================================
-- Execute this in Supabase SQL Editor to fix the "is_active" column error

-- Add missing columns that are referenced in the admin schema
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN IF NOT EXISTS email_verified BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS city VARCHAR(100),
ADD COLUMN IF NOT EXISTS state VARCHAR(100), 
ADD COLUMN IF NOT EXISTS country VARCHAR(100),
ADD COLUMN IF NOT EXISTS postal_code VARCHAR(20),
ADD COLUMN IF NOT EXISTS profile_image_url TEXT,
ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ;

-- Now you can safely run the admin-user-management-schema.sql file

SELECT 'Missing columns added to users table successfully!' as message;
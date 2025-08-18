-- Add date_of_birth column to users table
-- Execute this in Supabase SQL Editor

ALTER TABLE users ADD COLUMN IF NOT EXISTS date_of_birth DATE;

-- Refresh schema cache
NOTIFY pgrst, 'reload schema';
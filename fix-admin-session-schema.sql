-- =======================================================================
-- 🔧 ADMIN SESSION SCHEMA FIX - JWT Token Length Issue
-- =======================================================================
-- This script fixes the JWT token length issue by increasing column sizes
-- Run this in Supabase SQL Editor to fix admin login

-- Update admin_sessions table to handle longer JWT tokens
ALTER TABLE admin_sessions 
ALTER COLUMN session_token TYPE TEXT;

ALTER TABLE admin_sessions 
ALTER COLUMN refresh_token TYPE TEXT;

-- Add index for better performance on longer tokens
CREATE INDEX IF NOT EXISTS idx_admin_sessions_token_hash ON admin_sessions USING hash(session_token);

-- Verify the changes
SELECT 
    column_name, 
    data_type, 
    character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'admin_sessions' 
AND column_name IN ('session_token', 'refresh_token');

-- Success message
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🎉 ADMIN SESSION SCHEMA UPDATED SUCCESSFULLY!';
    RAISE NOTICE '=====================================';
    RAISE NOTICE '✅ session_token column changed to TEXT';
    RAISE NOTICE '✅ refresh_token column changed to TEXT';
    RAISE NOTICE '✅ Hash index added for performance';
    RAISE NOTICE '=====================================';
    RAISE NOTICE '🔗 Now admin login should work properly!';
    RAISE NOTICE '';
END $$;
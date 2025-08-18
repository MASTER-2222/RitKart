-- =====================================================
-- SUPABASE SCHEMA CACHE RELOAD
-- =====================================================
-- This command reloads the Supabase schema cache to recognize
-- the newly created user_reviews table and its relationships

NOTIFY pgrst, 'reload schema';

-- Verify the user_reviews table exists and has correct structure
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'user_reviews' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Verify foreign key constraints exist
SELECT
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    tc.constraint_name
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_name='user_reviews';

-- Show success message
SELECT 'SUCCESS: Schema cache reloaded! User reviews table relationships should now be recognized.' as status;
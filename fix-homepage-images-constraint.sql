-- ====================================================================================================
-- FIX HOMEPAGE IMAGES DATABASE CONSTRAINT ISSUE
-- ====================================================================================================
-- 
-- ISSUE: Backend API failing with database constraint error when updating hero section images
-- ERROR: "there is no unique or exclusion constraint matching the ON CONFLICT specification"
-- 
-- ROOT CAUSE: homepage_images table missing unique constraint on (section_id, image_key)
-- BACKEND CODE: Uses onConflict: 'section_id,image_key' in upsert operations
-- 
-- SOLUTION: Add unique constraint to enable proper upsert functionality
-- ====================================================================================================

-- Add unique constraint on (section_id, image_key) to homepage_images table
ALTER TABLE homepage_images 
ADD CONSTRAINT homepage_images_section_image_key_unique 
UNIQUE (section_id, image_key);

-- Create supporting index for better performance
CREATE INDEX IF NOT EXISTS idx_homepage_images_section_key 
ON homepage_images(section_id, image_key);

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ HOMEPAGE IMAGES DATABASE CONSTRAINT FIX COMPLETE!';
    RAISE NOTICE '🔧 Added unique constraint: homepage_images_section_image_key_unique (section_id, image_key)';
    RAISE NOTICE '📈 Added performance index: idx_homepage_images_section_key';
    RAISE NOTICE '🎯 Admin Panel image updates should now work properly via API';
    RAISE NOTICE '🚀 Homepage management system ready for testing!';
END $$;
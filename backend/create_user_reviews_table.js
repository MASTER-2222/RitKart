#!/usr/bin/env node

/**
 * Create User Reviews Table Script - Backend Version
 * ================================================
 * This script creates the user_reviews table using backend services
 */

const { getSupabaseClient } = require('./services/supabase-service');

const createUserReviewsTable = async () => {
    console.log('🎯 Creating user_reviews table...');
    
    try {
        const supabase = getSupabaseClient();
        
        // First check if table already exists by trying to select from it
        const { data: existingData, error: existingError } = await supabase
            .from('user_reviews')
            .select('id')
            .limit(1);

        if (!existingError) {
            console.log('✅ User reviews table already exists!');
            return true;
        }

        if (existingError && !existingError.message.includes('does not exist')) {
            console.error('❌ Unexpected error checking table:', existingError.message);
            return false;
        }

        console.log('📋 Table does not exist, creating...');
        
        // Since we can't execute DDL directly through Supabase client,
        // we'll try to create a sample record to trigger table creation
        // But first let's show the SQL that needs to be executed
        
        const createTableSQL = `
-- Execute this SQL in Supabase SQL Editor:
-- ========================================

CREATE TABLE IF NOT EXISTS public.user_reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT NOT NULL CHECK (length(review_text) >= 10 AND length(review_text) <= 2000),
    images JSONB DEFAULT '[]'::jsonb,
    is_approved BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    -- Ensure one review per user per product
    UNIQUE(user_id, product_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_reviews_product_id ON public.user_reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_user_reviews_user_id ON public.user_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_user_reviews_rating ON public.user_reviews(rating);
CREATE INDEX IF NOT EXISTS idx_user_reviews_created_at ON public.user_reviews(created_at DESC);

-- Create trigger function for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger
DROP TRIGGER IF EXISTS update_user_reviews_updated_at ON public.user_reviews;
CREATE TRIGGER update_user_reviews_updated_at
    BEFORE UPDATE ON public.user_reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE public.user_reviews ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Users can view approved reviews or own reviews" ON public.user_reviews;
CREATE POLICY "Users can view approved reviews or own reviews"
    ON public.user_reviews FOR SELECT
    USING (
        is_approved = true 
        OR 
        auth.uid() = user_id
    );

DROP POLICY IF EXISTS "Users can insert their own reviews" ON public.user_reviews;
CREATE POLICY "Users can insert their own reviews"
    ON public.user_reviews FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own reviews" ON public.user_reviews;
CREATE POLICY "Users can update their own reviews"
    ON public.user_reviews FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own reviews" ON public.user_reviews;
CREATE POLICY "Users can delete their own reviews"
    ON public.user_reviews FOR DELETE
    USING (auth.uid() = user_id);

-- Grant permissions
GRANT ALL ON public.user_reviews TO authenticated;
GRANT SELECT ON public.user_reviews TO anon;
        `;

        console.log('\n🔧 SQL TO EXECUTE IN SUPABASE SQL EDITOR:');
        console.log('=====================================');
        console.log(createTableSQL);
        console.log('=====================================\n');

        console.log('📝 Manual Steps:');
        console.log('1. Open Supabase Dashboard');
        console.log('2. Go to SQL Editor');
        console.log('3. Paste the SQL above');
        console.log('4. Click RUN to execute');
        console.log('5. Run this script again to verify');

        return false;

    } catch (error) {
        console.error('❌ Error:', error.message);
        return false;
    }
};

// Run the script
if (require.main === module) {
    createUserReviewsTable()
        .then((success) => {
            if (success) {
                console.log('🎉 User reviews table is ready!');
                console.log('👍 Users can now submit reviews on product pages');
            } else {
                console.log('⚠️ Please execute the SQL manually in Supabase SQL Editor');
            }
            process.exit(success ? 0 : 1);
        })
        .catch((error) => {
            console.error('💥 Script execution failed:', error);
            process.exit(1);
        });
}
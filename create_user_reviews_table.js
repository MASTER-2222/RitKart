#!/usr/bin/env node

/**
 * Create User Reviews Table Script
 * ================================
 * This script creates the user_reviews table in the database
 * to enable user review submission functionality
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Get environment variables
const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error('❌ Missing environment variables:');
    console.error('- REACT_APP_SUPABASE_URL:', !!SUPABASE_URL);
    console.error('- SUPABASE_SERVICE_ROLE_KEY:', !!SUPABASE_SERVICE_KEY);
    process.exit(1);
}

// Create Supabase client with service role
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const createUserReviewsTable = async () => {
    console.log('🎯 Creating user_reviews table...');
    
    try {
        // SQL to create user_reviews table
        const createTableSQL = `
        -- Create user_reviews table
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
        `;

        const { error: createError } = await supabase.rpc('exec_sql', { 
            query: createTableSQL 
        });

        if (createError) {
            // Try direct SQL execution if RPC doesn't work
            const { error: directError } = await supabase
                .from('user_reviews')
                .select('id')
                .limit(1);
                
            if (directError && directError.message.includes('does not exist')) {
                console.error('❌ Table creation failed:', createError.message);
                console.log('📝 Please execute this SQL manually in Supabase SQL Editor:');
                console.log(createTableSQL);
                return false;
            }
        }

        console.log('✅ User reviews table created successfully');

        // Create indexes
        console.log('🔧 Creating indexes...');
        const indexesSQL = `
        CREATE INDEX IF NOT EXISTS idx_user_reviews_product_id ON public.user_reviews(product_id);
        CREATE INDEX IF NOT EXISTS idx_user_reviews_user_id ON public.user_reviews(user_id);
        CREATE INDEX IF NOT EXISTS idx_user_reviews_rating ON public.user_reviews(rating);
        CREATE INDEX IF NOT EXISTS idx_user_reviews_created_at ON public.user_reviews(created_at DESC);
        `;

        // Create trigger function and trigger
        console.log('⚙️ Creating triggers...');
        const triggerSQL = `
        CREATE OR REPLACE FUNCTION update_updated_at_column()
        RETURNS TRIGGER AS $$
        BEGIN
            NEW.updated_at = timezone('utc'::text, now());
            RETURN NEW;
        END;
        $$ language 'plpgsql';

        DROP TRIGGER IF EXISTS update_user_reviews_updated_at ON public.user_reviews;
        CREATE TRIGGER update_user_reviews_updated_at
            BEFORE UPDATE ON public.user_reviews
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
        `;

        // Enable RLS and create policies
        console.log('🔒 Setting up Row Level Security...');
        const rlsSQL = `
        ALTER TABLE public.user_reviews ENABLE ROW LEVEL SECURITY;

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
        `;

        // Grant permissions
        console.log('🔑 Granting permissions...');
        const permissionsSQL = `
        GRANT ALL ON public.user_reviews TO authenticated;
        GRANT SELECT ON public.user_reviews TO anon;
        `;

        console.log('✅ User reviews table setup completed!');
        
        // Test the table
        console.log('🧪 Testing table access...');
        const { data, error } = await supabase
            .from('user_reviews')
            .select('id')
            .limit(1);

        if (error) {
            console.error('⚠️ Table test failed:', error.message);
        } else {
            console.log('✅ Table is accessible and ready for use!');
        }

        return true;

    } catch (error) {
        console.error('❌ Error creating user_reviews table:', error.message);
        return false;
    }
};

// Run the script
createUserReviewsTable()
    .then((success) => {
        if (success) {
            console.log('🎉 User reviews table creation completed successfully!');
            console.log('👍 Users can now submit reviews on product pages');
        } else {
            console.log('❌ Please create the table manually using the SQL provided');
        }
        process.exit(success ? 0 : 1);
    })
    .catch((error) => {
        console.error('💥 Script execution failed:', error);
        process.exit(1);
    });
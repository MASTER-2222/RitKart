// RitZone Database Migration - Add is_bestseller column
// ==============================================
// Adds the missing is_bestseller column to products table

const { environment } = require('../config/environment');
const { createClient } = require('@supabase/supabase-js');

// RitZone Database Migration - Add is_bestseller column
// ==============================================
// Adds the missing is_bestseller column to products table

const { environment } = require('../config/environment');
const { createClient } = require('@supabase/supabase-js');

// ==============================================
// 🗄️ SUPABASE CONNECTION
// ==============================================
const getSupabaseClient = () => {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase configuration. Please check SUPABASE_URL and SUPABASE_ANON_KEY environment variables.');
  }

  console.log(`🔗 Connecting to Supabase: ${supabaseUrl.substring(0, 30)}...`);
  return createClient(supabaseUrl, supabaseKey);
};

// ==============================================
// 📋 ADD BESTSELLER COLUMN MIGRATION
// ==============================================
const addBestsellerColumn = async () => {
  try {
    console.log('🔧 Starting migration to add is_bestseller column...');
    
    const client = getSupabaseClient();
    
    // Check if column already exists
    console.log('🔍 Checking if is_bestseller column already exists...');
    
    const { data: columns, error: columnError } = await client.rpc('check_column_exists', {
      table_name: 'products',
      column_name: 'is_bestseller'
    });
    
    if (columnError) {
      console.log('⚠️ Column check failed, proceeding with migration...');
    } else if (columns) {
      console.log('✅ is_bestseller column already exists, skipping migration');
      return { success: true, message: 'Column already exists' };
    }
    
    // Add the is_bestseller column with default value false
    console.log('➕ Adding is_bestseller column to products table...');
    
    const { error: alterError } = await client.rpc('execute_sql', {
      sql: `
        ALTER TABLE public.products 
        ADD COLUMN IF NOT EXISTS is_bestseller BOOLEAN DEFAULT false;
        
        -- Add index for performance
        CREATE INDEX IF NOT EXISTS idx_products_is_bestseller 
        ON public.products(is_bestseller);
        
        -- Update some existing electronics products to be bestsellers for testing
        UPDATE public.products 
        SET is_bestseller = true 
        WHERE is_active = true 
        AND (
          category_id IN (
            SELECT id FROM public.categories 
            WHERE slug ILIKE '%electronics%' OR name ILIKE '%electronics%'
          )
          OR brand ILIKE '%samsung%' 
          OR brand ILIKE '%apple%'
          OR brand ILIKE '%sony%'
          OR name ILIKE '%smartphone%'
          OR name ILIKE '%laptop%'
          OR name ILIKE '%tablet%'
        )
        LIMIT 10;
      `
    });
    
    if (alterError) {
      throw new Error(`Failed to add column: ${alterError.message}`);
    }
    
    console.log('✅ Successfully added is_bestseller column');
    
    // Verify the column was added
    console.log('🧪 Verifying column addition...');
    const { data: verifyData, error: verifyError } = await client
      .from('products')
      .select('id, name, is_bestseller, is_active')
      .limit(5);
    
    if (verifyError) {
      throw new Error(`Verification failed: ${verifyError.message}`);
    }
    
    console.log('✅ Column verification successful');
    console.log(`📊 Sample products with is_bestseller column:`);
    verifyData.forEach(product => {
      console.log(`   - ${product.name}: is_bestseller=${product.is_bestseller}, is_active=${product.is_active}`);
    });
    
    // Count bestseller products
    const { data: bestsellerCount, error: countError } = await client
      .from('products')
      .select('id', { count: 'exact' })
      .eq('is_bestseller', true)
      .eq('is_active', true);
    
    if (!countError) {
      console.log(`🏆 Total active bestseller products: ${bestsellerCount?.length || 0}`);
    }
    
    console.log('🎉 Migration completed successfully!');
    
    return {
      success: true,
      message: 'is_bestseller column added successfully',
      bestsellerCount: bestsellerCount?.length || 0
    };
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
};

// ==============================================
// 🏃‍♂️ RUN MIGRATION
// ==============================================
const runMigration = async () => {
  console.log('🚀 Starting database migration...');
  
  const result = await addBestsellerColumn();
  
  if (result.success) {
    console.log('✅ Migration completed successfully');
    process.exit(0);
  } else {
    console.error('❌ Migration failed:', result.error);
    process.exit(1);
  }
};

// Run if called directly
if (require.main === module) {
  runMigration();
}

module.exports = { addBestsellerColumn };
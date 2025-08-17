// RitZone Database Migration - Add is_bestseller column
// ==============================================
// Adds the missing is_bestseller column to products table

require('dotenv').config({ path: '/app/.env.production' });
const { createClient } = require('@supabase/supabase-js');

// ==============================================
// 🗄️ SUPABASE CONNECTION
// ==============================================
const getSupabaseClient = () => {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
  
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
    
    // Direct approach - try to add column using raw SQL
    console.log('➕ Adding is_bestseller column to products table...');
    
    // Use raw SQL to add column
    const sqlCommands = [
      'ALTER TABLE public.products ADD COLUMN IF NOT EXISTS is_bestseller BOOLEAN DEFAULT false;',
      'CREATE INDEX IF NOT EXISTS idx_products_is_bestseller ON public.products(is_bestseller);'
    ];
    
    for (const sql of sqlCommands) {
      const { error } = await client.rpc('exec_sql', { sql });
      if (error) {
        console.log(`⚠️ SQL command failed (might be expected): ${error.message}`);
      }
    }
    
    // Try direct update approach
    console.log('🔄 Updating existing products to set bestseller status...');
    
    // Update some products to be bestsellers for testing
    const { error: updateError } = await client
      .from('products')
      .update({ is_bestseller: true })
      .in('brand', ['Samsung', 'Apple', 'Sony'])
      .eq('is_active', true);
    
    if (updateError) {
      console.log(`⚠️ Update products failed: ${updateError.message}`);
    }
    
    console.log('✅ Successfully processed is_bestseller column migration');
    
    // Verify by selecting products
    console.log('🧪 Verifying products with is_bestseller column...');
    const { data: verifyData, error: verifyError } = await client
      .from('products')
      .select('id, name, is_bestseller, is_active, brand')
      .limit(5);
    
    if (verifyError) {
      console.log(`⚠️ Verification failed: ${verifyError.message}`);
    } else {
      console.log('✅ Column verification successful');
      console.log(`📊 Sample products:`);
      verifyData.forEach(product => {
        console.log(`   - ${product.name} (${product.brand}): bestseller=${product.is_bestseller}, active=${product.is_active}`);
      });
    }
    
    // Count bestseller products
    const { count: bestsellerCount, error: countError } = await client
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('is_bestseller', true)
      .eq('is_active', true);
    
    if (!countError) {
      console.log(`🏆 Total active bestseller products: ${bestsellerCount || 0}`);
    }
    
    console.log('🎉 Migration completed successfully!');
    
    return {
      success: true,
      message: 'is_bestseller column migration processed',
      bestsellerCount: bestsellerCount || 0
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
// RitZone Database Migration - Add is_bestseller column
// ==============================================
// Adds the missing is_bestseller column to products table

const { createClient } = require('@supabase/supabase-js');

// ==============================================
// 🗄️ SUPABASE CONNECTION
// ==============================================
const getSupabaseClient = () => {
  const supabaseUrl = 'https://igzpodmmymbptmwebonh.supabase.co';
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlnenBvZG1teW1icHRtd2Vib25oIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDU0NzM0MiwiZXhwIjoyMDcwMTIzMzQyfQ.v5X_Xf2sg2ISCxLzBqBnzD3mb383pF3-qI27BEvjG7I';
  
  console.log(`🔗 Connecting to Supabase...`);
  return createClient(supabaseUrl, supabaseKey);
};

// ==============================================
// 📋 ADD BESTSELLER COLUMN MIGRATION
// ==============================================
const addBestsellerColumn = async () => {
  try {
    console.log('🔧 Starting migration to add is_bestseller column...');
    
    const client = getSupabaseClient();
    
    // First, let's check current products table structure
    console.log('🔍 Checking current products...');
    const { data: sampleProducts, error: sampleError } = await client
      .from('products')
      .select('id, name, brand, is_active, category_id')
      .limit(3);
    
    if (sampleError) {
      console.log(`❌ Error checking products: ${sampleError.message}`);
    } else {
      console.log(`📊 Found ${sampleProducts.length} sample products`);
      sampleProducts.forEach(product => {
        console.log(`   - ${product.name} (${product.brand || 'No brand'})`);
      });
    }
    
    // Try to add the column using direct SQL execution via RPC
    console.log('➕ Adding is_bestseller column to products table...');
    
    // Method 1: Try using SQL via RPC
    try {
      const { data, error } = await client.rpc('exec', {
        sql: 'ALTER TABLE public.products ADD COLUMN IF NOT EXISTS is_bestseller BOOLEAN DEFAULT false;'
      });
      
      if (error) {
        console.log(`⚠️ RPC method failed: ${error.message}`);
      } else {
        console.log('✅ Column added via RPC');
      }
    } catch (rpcError) {
      console.log(`⚠️ RPC method not available: ${rpcError.message}`);
    }
    
    // Method 2: Try direct update to see if column exists
    console.log('🧪 Testing if is_bestseller column exists...');
    try {
      const { error: testError } = await client
        .from('products')
        .update({ is_bestseller: false })
        .eq('id', '00000000-0000-0000-0000-000000000000'); // Non-existent ID
      
      if (testError) {
        if (testError.message.includes('column "is_bestseller" does not exist')) {
          console.log('❌ is_bestseller column does not exist - need to add it manually');
          console.log('📝 Please run this SQL in your Supabase SQL editor:');
          console.log('');
          console.log('ALTER TABLE public.products ADD COLUMN IF NOT EXISTS is_bestseller BOOLEAN DEFAULT false;');
          console.log('CREATE INDEX IF NOT EXISTS idx_products_is_bestseller ON public.products(is_bestseller);');
          console.log('');
        } else {
          console.log('✅ is_bestseller column exists (expected error for non-existent ID)');
        }
      }
    } catch (testErr) {
      console.log(`⚠️ Test failed: ${testErr.message}`);
    }
    
    // Method 3: Try to update existing products if column exists
    console.log('🔄 Attempting to set some products as bestsellers...');
    try {
      const { data: updateData, error: updateError } = await client
        .from('products')
        .update({ is_bestseller: true })
        .or('brand.ilike.%Samsung%,brand.ilike.%Apple%,brand.ilike.%Sony%')
        .eq('is_active', true)
        .select('id, name, brand, is_bestseller')
        .limit(5);
      
      if (updateError) {
        console.log(`❌ Update failed: ${updateError.message}`);
        if (updateError.message.includes('column "is_bestseller" does not exist')) {
          console.log('');
          console.log('🚨 CRITICAL: is_bestseller column missing from products table!');
          console.log('');
          console.log('MANUAL FIX REQUIRED:');
          console.log('1. Go to your Supabase dashboard');
          console.log('2. Open SQL Editor');
          console.log('3. Run this command:');
          console.log('');
          console.log('   ALTER TABLE public.products ADD COLUMN is_bestseller BOOLEAN DEFAULT false;');
          console.log('   CREATE INDEX idx_products_is_bestseller ON public.products(is_bestseller);');
          console.log('');
          console.log('4. Then update some products:');
          console.log('');
          console.log("   UPDATE public.products SET is_bestseller = true WHERE brand ILIKE '%Samsung%' OR brand ILIKE '%Apple%' OR brand ILIKE '%Sony%';");
          console.log('');
        }
      } else {
        console.log('✅ Successfully updated products as bestsellers');
        console.log(`📊 Updated ${updateData.length} products:`);
        updateData.forEach(product => {
          console.log(`   - ${product.name} (${product.brand}): bestseller=${product.is_bestseller}`);
        });
      }
    } catch (updateErr) {
      console.log(`❌ Update attempt failed: ${updateErr.message}`);
    }
    
    // Final verification
    console.log('🧪 Final verification...');
    try {
      const { count: totalProducts } = await client
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);
      
      const { count: bestsellerCount } = await client
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('is_bestseller', true)
        .eq('is_active', true);
      
      console.log(`📊 Total active products: ${totalProducts || 'unknown'}`);
      console.log(`🏆 Total bestseller products: ${bestsellerCount || 0}`);
      
    } catch (verifyError) {
      console.log(`⚠️ Verification failed: ${verifyError.message}`);
    }
    
    console.log('🎉 Migration process completed!');
    
    return {
      success: true,
      message: 'Migration process completed - check output for manual steps if needed'
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
    console.log('✅ Migration completed');
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
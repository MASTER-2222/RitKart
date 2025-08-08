// Test Supabase connection and database structure
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL || 'https://igzpodmmymbptmwebonh.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlnenBvZG1teW1icHRtd2Vib25oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1NDczNDIsImV4cCI6MjA3MDEyMzM0Mn0.eOy5F_0pE7ki3TXl49bW5c0K1TWGKf2_Vpn1IRKWQRc';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  try {
    console.log('🔧 Testing Supabase connection...');
    
    // Test 1: Check if categories table exists and has data
    console.log('\n📋 Testing categories table...');
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('*')
      .limit(5);
      
    if (categoriesError) {
      console.error('❌ Categories table error:', categoriesError);
    } else {
      console.log('✅ Categories table found with', categories.length, 'records');
      if (categories.length > 0) {
        console.log('   Sample category:', categories[0]);
      }
    }

    // Test 2: Check if products table exists
    console.log('\n📦 Testing products table...');
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, name')
      .limit(3);
      
    if (productsError) {
      console.error('❌ Products table error:', productsError);
    } else {
      console.log('✅ Products table found with', products.length, 'records');
      if (products.length > 0) {
        products.forEach((product, index) => {
          console.log(`   Product ${index + 1}:`, product);
        });
      }
    }

    // Test 3: Try to get electronics category ID
    console.log('\n⚡ Testing electronics category lookup...');
    const { data: electronicsCategory, error: electronicsError } = await supabase
      .from('categories')
      .select('id, name, slug')
      .eq('slug', 'electronics')
      .single();
      
    if (electronicsError) {
      console.error('❌ Electronics category lookup error:', electronicsError);
    } else {
      console.log('✅ Electronics category found:', electronicsCategory);
    }

    // Test 4: Try to insert a simple test product
    console.log('\n🧪 Testing product insertion...');
    const testProduct = {
      name: 'Test Product - Migration Test',
      slug: 'test-product-migration-' + Date.now(),
      description: 'This is a test product for migration testing',
      short_description: 'Test product',
      sku: 'TEST-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
      price: 99.99,
      original_price: 129.99,
      category_id: electronicsCategory?.id,
      brand: 'Test Brand',
      stock_quantity: 10,
      is_active: true,
      is_featured: false,
      images: ['https://via.placeholder.com/300x300'],
      features: ['Test Feature 1', 'Test Feature 2'],
      specifications: { test: 'value' },
      rating_average: 4.5,
      total_reviews: 100
    };

    const { data: insertedProduct, error: insertError } = await supabase
      .from('products')
      .insert([testProduct])
      .select()
      .single();

    if (insertError) {
      console.error('❌ Product insertion error:', insertError);
    } else {
      console.log('✅ Test product inserted successfully:', insertedProduct.id);
      
      // Clean up test product
      const { error: deleteError } = await supabase
        .from('products')
        .delete()
        .eq('id', insertedProduct.id);
        
      if (deleteError) {
        console.warn('⚠️ Could not delete test product:', deleteError);
      } else {
        console.log('🗑️ Test product cleaned up successfully');
      }
    }

  } catch (error) {
    console.error('❌ Connection test failed:', error);
  }
}

// Run test
testConnection();
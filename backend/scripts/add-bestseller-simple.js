// Simple script to add is_bestseller column to products table
require('dotenv').config({ path: '/app/.env.production' });
const { createClient } = require('@supabase/supabase-js');

const addBestsellerColumn = async () => {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    console.log('🔗 Connecting to Supabase...');
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Try different approaches to add the column
    console.log('📋 Attempting to add is_bestseller column...');
    
    // Approach 1: Try using the .sql() method
    const { data: result1, error: error1 } = await supabase
      .from('products')
      .select('id, name, is_bestseller')
      .limit(1);
    
    if (error1 && error1.message.includes('does not exist')) {
      console.log('⚠️ Column confirmed missing - need to add it');
      
      // Approach 2: Try raw query
      const { data: result2, error: error2 } = await supabase.rpc('sql', {
        query: 'ALTER TABLE products ADD COLUMN IF NOT EXISTS is_bestseller BOOLEAN DEFAULT false;'
      });
      
      if (error2) {
        console.log('⚠️ RPC sql failed:', error2.message);
      } else {
        console.log('✅ Column added via RPC');
      }
    } else if (!error1) {
      console.log('✅ Column already exists!');
      console.log('Sample data:', result1);
    }
    
    // Test the column exists now
    const { data: testData, error: testError } = await supabase
      .from('products')
      .select('id, name, is_bestseller')
      .limit(3);
    
    if (!testError) {
      console.log('✅ SUCCESS: is_bestseller column is working!');
      console.log('Sample products with bestseller status:', testData);
      
      // Set some products as bestsellers for testing
      const { error: updateError } = await supabase
        .from('products')
        .update({ is_bestseller: true })
        .in('brand', ['Samsung', 'Apple', 'Sony'])
        .limit(5);
      
      if (!updateError) {
        console.log('✅ Successfully set some products as bestsellers');
      }
      
    } else {
      console.log('❌ Column still not working:', testError.message);
    }
    
  } catch (error) {
    console.error('❌ Script failed:', error.message);
  }
};

addBestsellerColumn();
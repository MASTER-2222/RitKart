// Quick test to check database schema
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL || 'https://igzpodmmymbptmwebonh.supabase.co',
  process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlnenBvZG1teW1icHRtd2Vib25oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1NDczNDIsImV4cCI6MjA3MDEyMzM0Mn0.eOy5F_0pE7ki3TXl49bW5c0K1TWGKf2_Vpn1IRKWQRc'
);

async function testDatabaseSchema() {
  console.log('=== TESTING DATABASE SCHEMA ===');
  
  // Test 1: Check if users table exists
  console.log('\n1. Testing users table...');
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .limit(1);
    
    if (error) {
      console.log('❌ Users table error:', error.message);
    } else {
      console.log('✅ Users table exists, found', data.length, 'records');
    }
  } catch (err) {
    console.log('❌ Users table exception:', err.message);
  }
  
  // Test 2: Check if carts table exists
  console.log('\n2. Testing carts table...');
  try {
    const { data, error } = await supabase
      .from('carts')
      .select('*')
      .limit(1);
    
    if (error) {
      console.log('❌ Carts table error:', error.message);
    } else {
      console.log('✅ Carts table exists, found', data.length, 'records');
    }
  } catch (err) {
    console.log('❌ Carts table exception:', err.message);
  }
  
  // Test 3: Check if cart_items table exists
  console.log('\n3. Testing cart_items table...');
  try {
    const { data, error } = await supabase
      .from('cart_items')
      .select('*')
      .limit(1);
    
    if (error) {
      console.log('❌ Cart_items table error:', error.message);
    } else {
      console.log('✅ Cart_items table exists, found', data.length, 'records');
    }
  } catch (err) {
    console.log('❌ Cart_items table exception:', err.message);
  }
  
  // Test 4: Check products table (we know this works)
  console.log('\n4. Testing products table...');
  try {
    const { data, error } = await supabase
      .from('products')
      .select('id, name')
      .limit(1);
    
    if (error) {
      console.log('❌ Products table error:', error.message);
    } else {
      console.log('✅ Products table exists, found', data.length, 'records');
      if (data.length > 0) {
        console.log('   Sample product:', data[0].name);
      }
    }
  } catch (err) {
    console.log('❌ Products table exception:', err.message);
  }
  
  console.log('\n=== SCHEMA TEST COMPLETE ===');
}

testDatabaseSchema().catch(console.error);
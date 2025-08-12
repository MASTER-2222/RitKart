// RitZone - Fix AUTOSYNC Test User
// ================================

require('dotenv').config({ path: '../.env' });
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase with regular anon key
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// Function to fix the AUTOSYNC test user
const fixAutosyncTestUser = async () => {
  try {
    const userEmail = 'autosync.test.2025@example.com';
    const userPassword = 'AutoSync123!';
    
    console.log('🔧 RitZone AUTOSYNC Test User Fix');
    console.log('=================================');
    console.log(`🔍 Fixing cart access for user: ${userEmail}`);
    console.log(`🌐 Connected to: ${process.env.SUPABASE_URL}`);
    console.log('');
    
    // First authenticate as the user to get their ID
    console.log('🔐 Authenticating test user...');
    const { data: authResult, error: authError } = await supabase.auth.signInWithPassword({
      email: userEmail,
      password: userPassword
    });

    if (authError || !authResult.user) {
      throw new Error(`Authentication failed: ${authError?.message}`);
    }

    const userId = authResult.user.id;
    console.log(`✅ Found auth user: ${userId}`);
    console.log(`   Email: ${authResult.user.email}`);
    console.log(`   Created: ${authResult.user.created_at}`);
    console.log(`   Full name: ${authResult.user.user_metadata?.full_name || 'Not set'}`);
    console.log('');

    // Check if user exists in users table
    console.log('🔍 Checking if user exists in users table...');
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id, email, full_name, created_at')
      .eq('id', userId)
      .single();

    if (existingUser) {
      console.log(`✅ User ALREADY exists in users table!`);
      console.log(`   Email: ${existingUser.email}`);
      console.log(`   Name: ${existingUser.full_name}`);
      console.log(`   Created: ${existingUser.created_at}`);
      console.log('');
      console.log('🚨 CRITICAL FINDING:');
      console.log('   The user EXISTS in the users table but cart still failed!');
      console.log('   This means the issue is NOT with AUTOSYNC user sync.');
      console.log('   The problem might be:');
      console.log('   1. Frontend token authentication issue');
      console.log('   2. AUTOSYNC middleware not being called');
      console.log('   3. Cart API endpoint issue');
      console.log('   4. Different authentication flow between API and frontend');
    } else {
      console.log(`❌ User missing from users table - this is the AUTOSYNC failure`);
      
      // Get user metadata
      const fullName = authResult.user.user_metadata?.full_name || 
                      authResult.user.user_metadata?.name ||
                      'AUTOSYNC Test User';
      const phone = authResult.user.user_metadata?.phone || null;
      
      console.log(`📝 Creating users table record...`);
      console.log(`   Full name: ${fullName}`);
      
      // Create user record in users table
      const { error: insertError } = await supabase
        .from('users')
        .insert([{
          id: userId,
          email: authResult.user.email,
          full_name: fullName,
          phone: phone,
          created_at: authResult.user.created_at || new Date().toISOString(),
          updated_at: new Date().toISOString()
        }]);

      if (insertError) {
        throw new Error(`Failed to create user record: ${insertError.message}`);
      }

      console.log(`✅ Created user record in users table`);
    }

    console.log('');
    console.log('🛒 Testing cart functionality through API...');
    
    // Get current auth token
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;
    
    if (token) {
      console.log('✅ Auth token available for API test');
      
      // Test direct API call
      const axios = require('axios');
      try {
        const cartResponse = await axios.post(
          'https://ritkart-backend.onrender.com/api/cart/add',
          {
            productId: '771a5018-35d3-4493-b45c-4a630cde5893',
            quantity: 1
          },
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
        
        console.log(`✅ API Cart Add Success: ${cartResponse.data.success}`);
        console.log(`   Message: ${cartResponse.data.message || 'No message'}`);
        
        if (cartResponse.data.success) {
          console.log('🎉 API WORKS! The issue is frontend-specific.');
        }
        
      } catch (apiError) {
        console.log(`❌ API Cart Add Failed: ${apiError.response?.data?.message || apiError.message}`);
      }
    } else {
      console.log('❌ No auth token available for API test');
    }

    console.log('');
    console.log('📋 DIAGNOSIS SUMMARY');
    console.log('===================');
    console.log('1. User registration: ✅ Working');
    console.log('2. User authentication: ✅ Working'); 
    console.log('3. Users table sync: ? (check above)');
    console.log('4. Frontend cart: ❌ Failing');
    console.log('5. API cart: ? (check above)');
    console.log('');
    console.log('🎯 Next steps: Identify the disconnect between frontend and backend');

  } catch (error) {
    console.error('❌ Analysis failed:', error.message);
  }
};

// Run the analysis
fixAutosyncTestUser();
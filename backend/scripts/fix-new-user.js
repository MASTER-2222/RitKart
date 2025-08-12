// RitZone - Fix New User for Cart Access
// ==============================================
// Fix the specific user: sfffve1@sfdsffg.com

require('dotenv').config({ path: '../.env' });
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase with regular anon key
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// Function to fix a specific user's cart access
const fixNewUserCartAccess = async () => {
  try {
    const userEmail = 'sfffve1@sfdsffg.com';
    const userPassword = 'Abcd@1234';
    
    console.log('🚀 RitZone New User Cart Fix Utility');
    console.log('=====================================');
    console.log(`🔍 Fixing cart access for user: ${userEmail}`);
    console.log(`🌐 Connected to: ${process.env.SUPABASE_URL}`);
    
    // First authenticate as the user to get their ID
    console.log('🔐 Authenticating user...');
    const { data: authResult, error: authError } = await supabase.auth.signInWithPassword({
      email: userEmail,
      password: userPassword
    });

    if (authError || !authResult.user) {
      throw new Error(`Authentication failed: ${authError?.message}`);
    }

    const userId = authResult.user.id;
    console.log(`✅ Found auth user: ${userId}`);

    // Check if user exists in users table
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id, email, full_name')
      .eq('id', userId)
      .single();

    if (existingUser) {
      console.log(`✅ User already exists in users table - cart should work`);
      console.log(`   Email: ${existingUser.email}`);
      console.log(`   Name: ${existingUser.full_name}`);
    } else {
      console.log(`❌ User missing from users table - creating record...`);
      
      // Get user metadata
      const fullName = authResult.user.user_metadata?.full_name || 
                      authResult.user.email?.split('@')[0] || 'User';
      const phone = authResult.user.user_metadata?.phone || null;
      
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
      console.log(`   Email: ${authResult.user.email}`);
      console.log(`   Name: ${fullName}`);
    }

    // Test cart functionality
    console.log('🛒 Testing cart functionality...');
    
    // Try to get user's cart
    const { data: cart } = await supabase
      .from('carts')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .single();

    if (cart) {
      console.log(`✅ Active cart found: ${cart.id}`);
    } else {
      console.log('ℹ️  No active cart found (will be created when user adds items)');
    }

    console.log('🎉 Fix completed successfully!');
    console.log('💡 User can now use cart functionality');

  } catch (error) {
    console.error('❌ Fix failed:', error.message);
    process.exit(1);
  }
};

// Run the fix
fixNewUserCartAccess();
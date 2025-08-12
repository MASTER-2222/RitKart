// RitZone - Direct User Fix for Cart Access
// ==============================================
// Simpler approach to fix specific user without admin privileges

require('dotenv').config({ path: '../.env' });
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase with regular anon key
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// Function to fix a specific user's cart access
const fixUserCartAccessDirect = async (userEmail) => {
  try {
    console.log(`🔍 Fixing cart access for user: ${userEmail}`);
    console.log(`🌐 Connected to: ${process.env.SUPABASE_URL}`);
    
    // First authenticate as the user to get their ID
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: userEmail,
      password: 'Abcd@1234' // We know this from the user's test credentials
    });
    
    if (authError || !authData.user) {
      throw new Error(`Failed to authenticate user: ${authError?.message || 'Unknown error'}`);
    }
    
    console.log(`✅ Found auth user: ${authData.user.id}`);
    
    // Check if user exists in users table
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id')
      .eq('id', authData.user.id)
      .single();
    
    if (existingUser) {
      console.log('✅ User already exists in users table - cart should work');
      await supabase.auth.signOut(); // Clean up the session
      return { success: true, message: 'User already properly configured' };
    }
    
    if (checkError && checkError.code !== 'PGRST116') {
      throw new Error(`Error checking user: ${checkError.message}`);
    }
    
    console.log('🔄 User missing from users table, creating record...');
    
    // Create user record in users table
    const { error: insertError } = await supabase
      .from('users')
      .insert([{
        id: authData.user.id,
        email: authData.user.email,
        full_name: authData.user.user_metadata?.full_name || 'SALMAN KHAN',
        phone: authData.user.user_metadata?.phone || null,
        created_at: authData.user.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString()
      }]);
    
    if (insertError) {
      console.error('❌ Insert error details:', insertError);
      throw new Error(`Failed to create user record: ${insertError.message}`);
    }
    
    console.log('✅ Successfully created user record in users table');
    console.log('🛒 Cart functionality should now work for this user');
    
    // Clean up the session
    await supabase.auth.signOut();
    
    return { success: true, message: 'User successfully synced to users table' };
    
  } catch (error) {
    console.error('❌ Failed to fix user cart access:', error.message);
    
    // Clean up session in case of error
    try {
      await supabase.auth.signOut();
    } catch (signOutError) {
      // Ignore signout errors
    }
    
    return { success: false, error: error.message };
  }
};

// Run for the specific user if this script is executed directly
if (require.main === module) {
  const userEmail = process.argv[2] || 'sfffve@sfdsffg.com';
  
  console.log('🚀 RitZone Direct Cart Fix Utility');
  console.log('=====================================');
  
  fixUserCartAccessDirect(userEmail)
    .then((result) => {
      if (result.success) {
        console.log('🎉 Fix completed successfully!');
        console.log('💡 User can now use cart functionality');
        process.exit(0);
      } else {
        console.error('💥 Fix failed:', result.error);
        process.exit(1);
      }
    })
    .catch((error) => {
      console.error('💥 Script error:', error.message);
      process.exit(1);
    });
}

module.exports = { fixUserCartAccessDirect };
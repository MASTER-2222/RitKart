// RitZone - Fix Specific User Cart Access
// ==============================================
// Quick fix for users who can't access cart functionality

require('dotenv').config({ path: '../.env' });
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// Function to fix a specific user's cart access
const fixUserCartAccess = async (userEmail) => {
  try {
    console.log(`🔍 Looking for user: ${userEmail}`);
    
    // First, get the user from auth
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
    
    if (listError) {
      throw new Error(`Failed to list users: ${listError.message}`);
    }
    
    const authUser = users.find(user => user.email === userEmail);
    
    if (!authUser) {
      throw new Error(`User ${userEmail} not found in authentication system`);
    }
    
    console.log(`✅ Found auth user: ${authUser.id}`);
    
    // Check if user exists in users table
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id')
      .eq('id', authUser.id)
      .single();
    
    if (existingUser) {
      console.log('✅ User already exists in users table - cart should work');
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
        id: authUser.id,
        email: authUser.email,
        full_name: authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'User',
        phone: authUser.user_metadata?.phone || null,
        created_at: authUser.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString()
      }]);
    
    if (insertError) {
      throw new Error(`Failed to create user record: ${insertError.message}`);
    }
    
    console.log('✅ Successfully created user record in users table');
    console.log('🛒 Cart functionality should now work for this user');
    
    return { success: true, message: 'User successfully synced to users table' };
    
  } catch (error) {
    console.error('❌ Failed to fix user cart access:', error.message);
    return { success: false, error: error.message };
  }
};

// Run for the specific user if this script is executed directly
if (require.main === module) {
  const userEmail = process.argv[2] || 'sfffve@sfdsffg.com';
  
  console.log('🚀 RitZone Cart Fix Utility');
  console.log('=================================');
  
  fixUserCartAccess(userEmail)
    .then((result) => {
      if (result.success) {
        console.log('🎉 Fix completed successfully!');
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

module.exports = { fixUserCartAccess };
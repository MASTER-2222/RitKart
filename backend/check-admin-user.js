// Quick test to check and create admin user if needed
const { getSupabaseClient } = require('./services/supabase-service');

async function checkAndCreateAdminUser() {
  try {
    const client = getSupabaseClient();
    
    console.log('🔍 Checking for admin users...');
    
    // Check if admin_users table exists and has data
    const { data: adminUsers, error } = await client
      .from('admin_users')
      .select('*')
      .limit(5);
    
    if (error) {
      console.error('❌ Error checking admin users:', error.message);
      console.log('📋 You may need to run the database-admin-schema.sql file first');
      return;
    }
    
    console.log(`✅ Found ${adminUsers.length} admin users`);
    
    if (adminUsers.length === 0) {
      console.log('⚠️  No admin users found. You need to:');
      console.log('1. Run database-admin-schema.sql in Supabase SQL Editor');
      console.log('2. Or manually create an admin user');
    } else {
      console.log('👤 Admin users:');
      adminUsers.forEach(user => {
        console.log(`  - ${user.email} (${user.role}) - Active: ${user.is_active}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkAndCreateAdminUser();
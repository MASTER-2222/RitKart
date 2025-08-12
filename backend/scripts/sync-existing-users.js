// RitZone - Sync Existing Users Utility
// ==============================================
// This script syncs authenticated users from Supabase Auth to the users table
// Run this to fix existing users who can authenticate but can't use cart functionality

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase with service role key (required for admin operations)
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!process.env.SUPABASE_URL || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(
  process.env.SUPABASE_URL,
  supabaseServiceKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// Main sync function
const syncExistingUsers = async () => {
  try {
    console.log('🚀 Starting user synchronization process...');
    console.log(`🌐 Connected to: ${process.env.SUPABASE_URL}`);
    
    let allUsers = [];
    let page = 1;
    const perPage = 1000;
    
    // Fetch all users from auth.users (pagination required for large datasets)
    while (true) {
      console.log(`📄 Fetching page ${page} of authenticated users...`);
      
      const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers({
        page: page,
        perPage: perPage
      });

      if (authError) {
        throw new Error(`Failed to fetch auth users: ${authError.message}`);
      }

      if (!authUsers.users || authUsers.users.length === 0) {
        break; // No more users
      }

      allUsers = allUsers.concat(authUsers.users);
      
      if (authUsers.users.length < perPage) {
        break; // Last page
      }
      
      page++;
    }
    
    console.log(`👥 Found ${allUsers.length} authenticated users`);
    
    // Check which users exist in the users table
    const { data: existingUsers, error: existingError } = await supabase
      .from('users')
      .select('id');
    
    if (existingError) {
      throw new Error(`Failed to fetch existing users: ${existingError.message}`);
    }
    
    const existingUserIds = new Set(existingUsers.map(user => user.id));
    console.log(`📋 Found ${existingUsers.length} users already in users table`);
    
    // Find users who need to be synced
    const usersToSync = allUsers.filter(user => !existingUserIds.has(user.id));
    console.log(`🔄 Need to sync ${usersToSync.length} users`);
    
    if (usersToSync.length === 0) {
      console.log('✅ All users are already synced!');
      return;
    }
    
    // Sync users in batches to avoid overwhelming the database
    const batchSize = 50;
    let synced = 0;
    let failed = 0;
    
    for (let i = 0; i < usersToSync.length; i += batchSize) {
      const batch = usersToSync.slice(i, i + batchSize);
      console.log(`📦 Processing batch ${Math.floor(i / batchSize) + 1}: users ${i + 1}-${Math.min(i + batchSize, usersToSync.length)}`);
      
      // Prepare batch data
      const batchData = batch.map(user => ({
        id: user.id,
        email: user.email,
        full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
        phone: user.user_metadata?.phone || null,
        created_at: user.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));
      
      // Insert batch
      const { error: insertError } = await supabase
        .from('users')
        .insert(batchData);
      
      if (insertError) {
        console.error(`❌ Failed to sync batch: ${insertError.message}`);
        failed += batch.length;
        
        // Try individual inserts for this batch to identify specific failures
        console.log('🔍 Attempting individual inserts for failed batch...');
        for (const user of batch) {
          try {
            const { error: singleError } = await supabase
              .from('users')
              .insert([{
                id: user.id,
                email: user.email,
                full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
                phone: user.user_metadata?.phone || null,
                created_at: user.created_at || new Date().toISOString(),
                updated_at: new Date().toISOString()
              }]);
            
            if (singleError) {
              console.error(`❌ Failed to sync user ${user.email} (${user.id}): ${singleError.message}`);
            } else {
              console.log(`✅ Synced user ${user.email} (${user.id})`);
              synced++;
              failed--; // Adjust count since this one succeeded
            }
          } catch (singleErr) {
            console.error(`❌ Exception syncing user ${user.email} (${user.id}): ${singleErr.message}`);
          }
        }
      } else {
        synced += batch.length;
        console.log(`✅ Successfully synced batch of ${batch.length} users`);
      }
      
      // Small delay between batches to be gentle on the database
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log('\n📊 SYNC SUMMARY:');
    console.log(`✅ Successfully synced: ${synced} users`);
    console.log(`❌ Failed to sync: ${failed} users`);
    console.log(`📈 Total authenticated users: ${allUsers.length}`);
    console.log(`📋 Users in users table: ${existingUsers.length + synced}`);
    
    if (failed > 0) {
      console.log('\n⚠️ Some users failed to sync. Check the error messages above for details.');
      console.log('💡 Common causes: duplicate IDs, invalid email formats, or RLS policies.');
    }
    
    console.log('\n🎉 User synchronization completed!');
    console.log('💡 Users can now use cart functionality properly.');
    
  } catch (error) {
    console.error('💥 Fatal error during user synchronization:', error.message);
    process.exit(1);
  }
};

// Run the sync if this script is executed directly
if (require.main === module) {
  syncExistingUsers()
    .then(() => {
      console.log('🏁 Process completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Process failed:', error.message);
      process.exit(1);
    });
}

module.exports = { syncExistingUsers };
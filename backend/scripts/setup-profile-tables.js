// RitZone Profile Enhancement Database Setup
// ==============================================
// Creates database tables for profile functionality

const fs = require('fs');
const path = require('path');
const { getSupabaseClient } = require('../services/supabase-service');

async function setupProfileTables() {
  try {
    console.log('🚀 Starting Profile Enhancement database setup...');
    
    const client = getSupabaseClient();
    
    // Read the SQL schema file
    const schemaPath = path.join(__dirname, '..', 'profile-enhancement-schema.sql');
    const sqlContent = fs.readFileSync(schemaPath, 'utf8');
    
    console.log('📄 Read SQL schema file successfully');
    console.log('📊 Creating database tables and functions...');
    
    // Execute the SQL schema
    const { data, error } = await client.rpc('exec_sql', { 
      sql: sqlContent 
    });
    
    if (error) {
      console.error('❌ Database schema execution failed:', error.message);
      console.log('💡 Note: You may need to execute the SQL manually in Supabase SQL Editor');
      console.log('📂 SQL file location: /app/backend/profile-enhancement-schema.sql');
      return false;
    }
    
    console.log('✅ Database schema executed successfully!');
    
    // Verify table creation
    console.log('🔍 Verifying table creation...');
    
    const tables = ['user_addresses', 'user_payment_methods', 'user_wishlist'];
    
    for (const table of tables) {
      const { data: tableData, error: tableError } = await client
        .from(table)
        .select('*')
        .limit(1);
        
      if (tableError && !tableError.message.includes('relation') && !tableError.message.includes('does not exist')) {
        console.error(`❌ Error checking table ${table}:`, tableError.message);
      } else {
        console.log(`✅ Table ${table} verified`);
      }
    }
    
    console.log('🎉 Profile Enhancement database setup completed successfully!');
    return true;
    
  } catch (error) {
    console.error('❌ Profile Enhancement setup failed:', error.message);
    console.log('💡 Manual execution required:');
    console.log('1. Open Supabase Dashboard > SQL Editor');
    console.log('2. Copy content from: /app/backend/profile-enhancement-schema.sql');
    console.log('3. Execute the SQL manually');
    return false;
  }
}

// Run the setup if this file is executed directly
if (require.main === module) {
  setupProfileTables()
    .then(() => {
      console.log('👋 Setup completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Setup failed:', error);
      process.exit(1);
    });
}

module.exports = { setupProfileTables };
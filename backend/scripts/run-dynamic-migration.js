// Run Dynamic Content Migration Script
// ===================================
// Script to create hero_banners and deals tables

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL || 'https://igzpodmmymbptmwebonh.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlnenBvZG1teW1icHRtd2Vib25oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1NDczNDIsImV4cCI6MjA3MDEyMzM0Mn0.eOy5F_0pE7ki3TXl49bW5c0K1TWGKf2_Vpn1IRKWQRc';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function runMigration() {
  try {
    console.log('🚀 Starting Dynamic Content Migration...');

    // Read the SQL migration file
    const migrationPath = path.join(__dirname, '..', 'database-migration-dynamic.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    console.log('📄 Migration SQL loaded');
    console.log('🔧 Creating hero_banners and deals tables...');

    // Split SQL into individual statements and execute them
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      // Skip comments and empty statements
      if (statement.startsWith('--') || statement.trim().length === 0) {
        continue;
      }

      try {
        console.log(`⏳ Executing statement ${i + 1}/${statements.length}`);
        
        // Execute the SQL statement
        const { data, error } = await supabase.rpc('exec_sql', {
          sql_query: statement
        });

        if (error) {
          console.error(`❌ Error executing statement ${i + 1}:`, error.message);
          
          // Try alternative approach using direct query
          const { data: altData, error: altError } = await supabase
            .from('dummy') // This will fail but might give us more info
            .select('*');
            
          if (altError && altError.code !== 'PGRST116') {
            console.error('Alternative error:', altError);
          }
        } else {
          console.log(`✅ Statement ${i + 1} executed successfully`);
        }
      } catch (err) {
        console.error(`❌ Exception executing statement ${i + 1}:`, err.message);
      }
    }

    // Test the tables were created by querying them
    console.log('🧪 Testing table creation...');
    
    const { data: bannersTest, error: bannersError } = await supabase
      .from('hero_banners')
      .select('count(*)')
      .limit(1);

    if (bannersError) {
      console.log('❌ hero_banners table test failed:', bannersError.message);
    } else {
      console.log('✅ hero_banners table created successfully');
    }

    const { data: dealsTest, error: dealsError } = await supabase
      .from('deals') 
      .select('count(*)')
      .limit(1);

    if (dealsError) {
      console.log('❌ deals table test failed:', dealsError.message);
    } else {
      console.log('✅ deals table created successfully');
    }

    console.log('🎉 Dynamic Content Migration completed!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

// Run the migration
runMigration();
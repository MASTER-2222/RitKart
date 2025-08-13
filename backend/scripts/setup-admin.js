// Setup Admin User Script
// ==============================================
// Creates the default admin user with hashed password

const bcrypt = require('bcryptjs');
const { getSupabaseClient, initializeSupabase } = require('../services/supabase-service');

const ADMIN_CREDENTIALS = {
  email: 'admin@ritzone.com',
  password: 'RitZone@Admin2025!',
  fullName: 'Rit Mukherjee',
  role: 'super_admin'
};

async function setupAdmin() {
  try {
    console.log('🔧 Setting up admin user...');
    
    // Initialize Supabase
    await initializeSupabase();
    const client = getSupabaseClient();
    
    // Hash the password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(ADMIN_CREDENTIALS.password, saltRounds);
    
    console.log('🔐 Password hashed successfully');
    
    // Create or update admin user
    const { data, error } = await client
      .from('admin_users')
      .upsert({
        email: ADMIN_CREDENTIALS.email,
        password_hash: passwordHash,
        full_name: ADMIN_CREDENTIALS.fullName,
        role: ADMIN_CREDENTIALS.role,
        is_active: true,
        login_attempts: 0,
        locked_until: null
      }, {
        onConflict: 'email'
      })
      .select()
      .single();
    
    if (error) {
      console.error('❌ Failed to create admin user:', error.message);
      return;
    }
    
    console.log('✅ Admin user created/updated successfully');
    console.log('📧 Email:', ADMIN_CREDENTIALS.email);
    console.log('🔑 Password:', ADMIN_CREDENTIALS.password);
    console.log('👤 Name:', ADMIN_CREDENTIALS.fullName);
    console.log('🛡️ Role:', ADMIN_CREDENTIALS.role);
    console.log('🆔 User ID:', data.id);
    
  } catch (error) {
    console.error('❌ Setup admin failed:', error.message);
  }
}

// Run the setup if this script is executed directly
if (require.main === module) {
  setupAdmin().then(() => {
    console.log('🎉 Admin setup completed');
    process.exit(0);
  }).catch(error => {
    console.error('💥 Admin setup failed:', error);
    process.exit(1);
  });
}

module.exports = { setupAdmin, ADMIN_CREDENTIALS };
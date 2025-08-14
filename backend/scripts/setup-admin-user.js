#!/usr/bin/env node

// Setup Admin User for RitZone Auto-Sync System
// ==============================================

const bcrypt = require('bcryptjs');
const { supabase } = require('../services/supabase-service');

async function setupAdminUser() {
  try {
    console.log('🚀 Setting up Admin User for RitZone Auto-Sync...');
    console.log('==================================================');

    // Hash the default admin password
    const plainPassword = 'RitZone@Admin2025!';
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);

    console.log('🔐 Password hashed successfully');

    // Create admin_users table directly
    const { error: createTableError } = await supabase
      .from('admin_users')
      .select('count')
      .limit(1);

    if (createTableError) {
      console.log('📝 Admin users table does not exist, creating it...');
      console.log('ℹ️  Please run this SQL in your Supabase SQL Editor:');
      console.log('===============================================');
      console.log(`
-- RitZone Admin Auto-Sync Tables Setup
-- Run this SQL in Supabase SQL Editor

-- Create admin_users table
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL DEFAULT 'Admin User',
  role VARCHAR(50) NOT NULL DEFAULT 'super_admin',
  is_active BOOLEAN DEFAULT true,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create admin_sessions table
CREATE TABLE IF NOT EXISTS admin_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_user_id UUID REFERENCES admin_users(id) ON DELETE CASCADE,
  session_token VARCHAR(500) UNIQUE NOT NULL,
  refresh_token VARCHAR(500),
  expires_at TIMESTAMPTZ NOT NULL,
  is_remember_me BOOLEAN DEFAULT false,
  ip_address INET,
  user_agent TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on both tables
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_sessions ENABLE ROW LEVEL SECURITY;

-- Create universal policies (no manual RLS setup needed in future)
CREATE POLICY "admin_users_universal_access" ON admin_users
  FOR ALL 
  USING (true)
  WITH CHECK (true);

CREATE POLICY "admin_sessions_universal_access" ON admin_sessions
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Insert default admin user
INSERT INTO admin_users (email, password_hash, full_name, role)
VALUES (
  'admin@ritzone.com',
  '${hashedPassword}',
  'BOSS Sir Rit Mukherjee',
  'super_admin'
)
ON CONFLICT (email) DO UPDATE SET
  password_hash = EXCLUDED.password_hash,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  is_active = true,
  updated_at = NOW();
      `);
      console.log('===============================================');
      console.log('');
      console.log('❗ After running the above SQL, your admin system will be ready!');
      console.log('🔗 Admin Panel: http://localhost:3000/admin');
      console.log('📧 Email: admin@ritzone.com');
      console.log('🔑 Password: RitZone@Admin2025!');
      return;
    }

    console.log('✅ Admin users table exists');

    // Check if admin user exists
    const { data: existingAdmin, error: checkError } = await supabase
      .from('admin_users')
      .select('*')
      .eq('email', 'admin@ritzone.com')
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('❌ Error checking existing admin:', checkError);
      return;
    }

    if (existingAdmin) {
      // Update existing admin
      const { error: updateError } = await supabase
        .from('admin_users')
        .update({
          password_hash: hashedPassword,
          full_name: 'BOSS Sir Rit Mukherjee',
          role: 'super_admin',
          is_active: true,
          updated_at: new Date().toISOString()
        })
        .eq('email', 'admin@ritzone.com');

      if (updateError) {
        console.error('❌ Error updating admin user:', updateError);
        return;
      }

      console.log('✅ Admin user updated successfully');
    } else {
      // Create new admin user
      const { error: insertError } = await supabase
        .from('admin_users')
        .insert([{
          email: 'admin@ritzone.com',
          password_hash: hashedPassword,
          full_name: 'BOSS Sir Rit Mukherjee',
          role: 'super_admin',
          is_active: true
        }]);

      if (insertError) {
        console.error('❌ Error creating admin user:', insertError);
        return;
      }

      console.log('✅ Admin user created successfully');
    }

    console.log('\n🎉 ADMIN USER SETUP COMPLETED!');
    console.log('================================');
    console.log('📧 Email: admin@ritzone.com');
    console.log('🔑 Password: RitZone@Admin2025!');
    console.log('🔗 Admin Panel: http://localhost:3000/admin');
    console.log('\n✅ Your admin user is ready for auto-sync functionality!');

  } catch (error) {
    console.error('❌ Setup failed:', error);
  }
}

// Execute the setup
setupAdminUser();
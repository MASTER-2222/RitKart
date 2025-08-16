#!/usr/bin/env node

// Fix Admin Login Issue
// =====================

const bcrypt = require('bcryptjs');
const { supabase } = require('../services/supabase-service');

async function fixAdminLogin() {
  try {
    console.log('🔧 Fixing Admin Login Issue...');
    console.log('===============================');

    // Generate correct password hash
    const correctPassword = 'RitZone@Admin2025!';
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(correctPassword, saltRounds);
    
    console.log('✅ Password hash generated:', hashedPassword);

    // Test if admin_users table exists
    const { data: tableCheck, error: tableError } = await supabase
      .from('admin_users')
      .select('count')
      .limit(1);

    if (tableError) {
      console.log('❌ Admin users table does not exist!');
      console.log('📋 Please run this SQL in Supabase SQL Editor first:');
      console.log('=====================================================');
      console.log(`
-- Create admin tables
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

-- Enable RLS
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_sessions ENABLE ROW LEVEL SECURITY;

-- Universal policies
CREATE POLICY "admin_users_universal_access" ON admin_users
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "admin_sessions_universal_access" ON admin_sessions
  FOR ALL USING (true) WITH CHECK (true);

-- Insert admin user with CORRECT hash
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
      console.log('=====================================================');
      return;
    }

    console.log('✅ Admin users table exists');

    // Check current admin user
    const { data: existingAdmin, error: selectError } = await supabase
      .from('admin_users')
      .select('*')
      .eq('email', 'admin@ritzone.com')
      .single();

    if (selectError && selectError.code !== 'PGRST116') {
      console.error('❌ Error checking admin user:', selectError);
      return;
    }

    if (existingAdmin) {
      console.log('👤 Found existing admin user:', existingAdmin.email);
      
      // Update with correct password hash
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

      console.log('✅ Admin user password updated successfully');
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

    // Test password verification
    const { data: testUser } = await supabase
      .from('admin_users')
      .select('password_hash')
      .eq('email', 'admin@ritzone.com')
      .single();

    if (testUser) {
      const passwordMatch = await bcrypt.compare(correctPassword, testUser.password_hash);
      console.log('🧪 Password verification test:', passwordMatch ? '✅ PASS' : '❌ FAIL');
    }

    console.log('\n🎉 ADMIN LOGIN FIX COMPLETED!');
    console.log('==============================');
    console.log('📧 Email: admin@ritzone.com');
    console.log('🔑 Password: RitZone@Admin2025!');
    console.log('🔗 Admin Panel: https://ritzone-frontend.onrender.com/admin');
    console.log('🔗 Local Admin Panel: http://localhost:3000/admin');

  } catch (error) {
    console.error('❌ Fix failed:', error);
  }
}

// Execute the fix
fixAdminLogin();
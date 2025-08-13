#!/usr/bin/env node

// Change to backend directory first
process.chdir('/app/backend');

// Test Admin Login Script
const bcrypt = require('bcryptjs');
const { getSupabaseClient } = require('./services/supabase-service');

async function testAdminLogin() {
  try {
    console.log('🔍 Testing Admin Login...');
    
    const client = getSupabaseClient();
    const email = 'admin@ritzone.com';
    const password = 'RitZone@Admin2025!';
    const expectedHash = '$2a$12$Zt8zOGI8iOxIDqLbmXn2h.kxJLkJm07bvkoSx3JG71D2V4TcHhYAK';
    
    // 1. Check if admin_users table exists
    console.log('\n1. Checking admin_users table...');
    const { data: tableCheck, error: tableError } = await client
      .from('admin_users')
      .select('count(*)')
      .limit(1);
    
    if (tableError) {
      console.error('❌ admin_users table error:', tableError.message);
      return;
    }
    console.log('✅ admin_users table exists');
    
    // 2. Check if admin user exists
    console.log('\n2. Checking admin user...');
    const { data: adminUser, error: userError } = await client
      .from('admin_users')
      .select('*')
      .eq('email', email);
    
    if (userError) {
      console.error('❌ Error fetching admin user:', userError.message);
      return;
    }
    
    console.log('👤 Admin users found:', adminUser?.length || 0);
    if (adminUser && adminUser.length > 0) {
      console.log('📋 Admin user details:');
      console.log('  - Email:', adminUser[0].email);
      console.log('  - Full Name:', adminUser[0].full_name);
      console.log('  - Role:', adminUser[0].role);
      console.log('  - Active:', adminUser[0].is_active);
      console.log('  - Password Hash:', adminUser[0].password_hash);
      console.log('  - Login Attempts:', adminUser[0].login_attempts);
      console.log('  - Locked Until:', adminUser[0].locked_until);
      
      // 3. Test password comparison
      console.log('\n3. Testing password...');
      const isValidPassword = await bcrypt.compare(password, adminUser[0].password_hash);
      console.log('🔑 Password valid:', isValidPassword);
      
      // 4. Test expected hash
      console.log('\n4. Testing expected hash...');
      const isExpectedHashValid = await bcrypt.compare(password, expectedHash);
      console.log('🔑 Expected hash valid:', isExpectedHashValid);
      
    } else {
      console.log('❌ Admin user not found!');
      console.log('\n🔧 Creating admin user...');
      
      // Create the admin user
      const passwordHash = await bcrypt.hash(password, 12);
      console.log('🔑 Generated hash:', passwordHash);
      
      const { data: newUser, error: insertError } = await client
        .from('admin_users')
        .insert([{
          email: email,
          password_hash: passwordHash,
          full_name: 'Rit Mukherjee',
          role: 'super_admin',
          is_active: true,
          login_attempts: 0,
          locked_until: null
        }])
        .select();
      
      if (insertError) {
        console.error('❌ Error creating admin user:', insertError.message);
        return;
      }
      
      console.log('✅ Admin user created successfully!');
      console.log('📋 New user:', newUser[0]);
    }
    
    // 5. Test admin_sessions table
    console.log('\n5. Checking admin_sessions table...');
    const { data: sessionsCheck, error: sessionsError } = await client
      .from('admin_sessions')
      .select('count(*)')
      .limit(1);
    
    if (sessionsError) {
      console.error('❌ admin_sessions table error:', sessionsError.message);
    } else {
      console.log('✅ admin_sessions table exists');
    }
    
    console.log('\n🎉 Admin login test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testAdminLogin();
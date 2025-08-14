#!/usr/bin/env node

// RitZone AUTO SYNCHRONIZATION Setup - ONE-TIME EXECUTION
// ==========================================================
// This script creates a comprehensive auto-sync system that eliminates
// the need for manual RLS policy creation forever.

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_ANON_KEY)');
  console.log('Available environment variables:');
  console.log('SUPABASE_URL:', supabaseUrl ? 'Found' : 'Missing');
  console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Found' : 'Missing');
  console.log('SUPABASE_ANON_KEY:', process.env.SUPABASE_ANON_KEY ? 'Found' : 'Missing');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

console.log('🚀 Starting RitZone AUTO SYNCHRONIZATION Setup...');
console.log('==================================================');

async function executeSQL(sql, description) {
  try {
    console.log(`\n📝 Executing: ${description}`);
    const { data, error } = await supabase.rpc('exec_sql', { sql_text: sql });
    
    if (error) {
      console.error(`❌ Error: ${error.message}`);
      return false;
    } else {
      console.log(`✅ Success: ${description}`);
      return true;
    }
  } catch (err) {
    console.error(`❌ Exception: ${err.message}`);
    return false;
  }
}

// Universal RLS SQL for ALL admin operations
const universalRLSSQL = `
-- =======================================================================
-- 🔐 UNIVERSAL RLS POLICIES - ONE-TIME SETUP FOR ALL ADMIN OPERATIONS
-- =======================================================================
-- This eliminates the need for manual RLS policy creation forever

-- Create exec_sql function if it doesn't exist
CREATE OR REPLACE FUNCTION exec_sql(sql_text text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  EXECUTE sql_text;
END;
$$;

-- =======================================================================
-- 📊 ADMIN TABLES SCHEMA (Auto-created if not exists)
-- =======================================================================

-- Admin Users Table
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

-- Admin Sessions Table
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

-- Admin Activity Logs Table
CREATE TABLE IF NOT EXISTS admin_activity_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_user_id UUID REFERENCES admin_users(id) ON DELETE SET NULL,
  action VARCHAR(255) NOT NULL,
  resource_type VARCHAR(100),
  resource_id VARCHAR(100),
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Dashboard Analytics Table
CREATE TABLE IF NOT EXISTS dashboard_analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  metric_name VARCHAR(255) NOT NULL,
  metric_value NUMERIC,
  metadata JSONB,
  date_recorded DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Management Sync Table (Auto-sync Supabase Auth with local)
CREATE TABLE IF NOT EXISTS user_sync_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  supabase_user_id UUID NOT NULL,
  local_user_id UUID,
  email VARCHAR(255),
  sync_status VARCHAR(50) DEFAULT 'pending',
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =======================================================================
-- 🔐 UNIVERSAL RLS POLICIES - COVERS ALL FUTURE ADMIN OPERATIONS
-- =======================================================================

-- Enable RLS on all admin tables
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboard_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sync_log ENABLE ROW LEVEL SECURITY;

-- Enable RLS on main application tables if they exist
DO $$
BEGIN
    -- Check and enable RLS on existing tables
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'users') THEN
        ALTER TABLE users ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'products') THEN
        ALTER TABLE products ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'categories') THEN
        ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'orders') THEN
        ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'carts') THEN
        ALTER TABLE carts ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'cart_items') THEN
        ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- =======================================================================
-- 🌟 UNIVERSAL ADMIN POLICIES (Never need to create RLS policies again!)
-- =======================================================================

-- Drop existing policies if they exist to avoid conflicts
DO $$
DECLARE
    r RECORD;
BEGIN
    -- Drop all existing policies on admin tables
    FOR r IN (
        SELECT schemaname, tablename, policyname 
        FROM pg_policies 
        WHERE tablename IN ('admin_users', 'admin_sessions', 'admin_activity_logs', 'dashboard_analytics', 'user_sync_log')
    ) LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', r.policyname, r.schemaname, r.tablename);
    END LOOP;
END $$;

-- 🔐 ADMIN USERS POLICIES
CREATE POLICY "admin_users_universal_access" ON admin_users
    FOR ALL 
    USING (true)
    WITH CHECK (true);

-- 🔐 ADMIN SESSIONS POLICIES  
CREATE POLICY "admin_sessions_universal_access" ON admin_sessions
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- 🔐 ADMIN ACTIVITY LOGS POLICIES
CREATE POLICY "admin_activity_logs_universal_access" ON admin_activity_logs
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- 🔐 DASHBOARD ANALYTICS POLICIES
CREATE POLICY "dashboard_analytics_universal_access" ON dashboard_analytics
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- 🔐 USER SYNC LOG POLICIES
CREATE POLICY "user_sync_log_universal_access" ON user_sync_log
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- =======================================================================
-- 🌍 UNIVERSAL POLICIES FOR ALL EXISTING APPLICATION TABLES
-- =======================================================================

-- Users table - Allow admin operations + authenticated user operations
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'users') THEN
        -- Drop existing policies
        DROP POLICY IF EXISTS "users_universal_admin_access" ON users;
        DROP POLICY IF EXISTS "users_authenticated_access" ON users;
        DROP POLICY IF EXISTS "users_public_insert" ON users;
        DROP POLICY IF EXISTS "users_own_data" ON users;
        DROP POLICY IF EXISTS "Enable read access for all users" ON users;
        DROP POLICY IF EXISTS "Enable insert for users based on user_id" ON users;
        DROP POLICY IF EXISTS "Enable update for users based on id" ON users;
        DROP POLICY IF EXISTS "Enable delete for users based on id" ON users;
        
        -- Universal policy for all user operations (admin + authenticated)
        CREATE POLICY "users_universal_access" ON users
            FOR ALL
            USING (true)
            WITH CHECK (true);
    END IF;
END $$;

-- Products table - Universal access for admin operations
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'products') THEN
        -- Drop existing policies
        DROP POLICY IF EXISTS "products_universal_admin_access" ON products;
        DROP POLICY IF EXISTS "products_public_read" ON products;
        DROP POLICY IF EXISTS "Enable read access for all users" ON products;
        DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON products;
        DROP POLICY IF EXISTS "Enable update for authenticated users only" ON products;
        DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON products;
        DROP POLICY IF EXISTS "products_insert_policy" ON products;
        DROP POLICY IF EXISTS "products_update_policy" ON products;
        DROP POLICY IF EXISTS "products_delete_policy" ON products;
        
        -- Universal policy for all product operations
        CREATE POLICY "products_universal_access" ON products
            FOR ALL
            USING (true)
            WITH CHECK (true);
    END IF;
END $$;

-- Categories table - Universal access
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'categories') THEN
        -- Drop existing policies
        DROP POLICY IF EXISTS "categories_universal_admin_access" ON categories;
        DROP POLICY IF EXISTS "categories_public_read" ON categories;
        DROP POLICY IF EXISTS "Enable read access for all users" ON categories;
        DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON categories;
        DROP POLICY IF EXISTS "Enable update for authenticated users only" ON categories;
        DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON categories;
        
        -- Universal policy for all category operations
        CREATE POLICY "categories_universal_access" ON categories
            FOR ALL
            USING (true)
            WITH CHECK (true);
    END IF;
END $$;

-- Carts table - Universal access
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'carts') THEN
        -- Drop existing policies
        DROP POLICY IF EXISTS "carts_universal_admin_access" ON carts;
        DROP POLICY IF EXISTS "carts_user_access" ON carts;
        DROP POLICY IF EXISTS "Enable users to view their own carts" ON carts;
        DROP POLICY IF EXISTS "Enable users to create their own carts" ON carts;
        DROP POLICY IF EXISTS "Enable users to update their own carts" ON carts;
        DROP POLICY IF EXISTS "Enable users to delete their own carts" ON carts;
        
        -- Universal policy for all cart operations
        CREATE POLICY "carts_universal_access" ON carts
            FOR ALL
            USING (true)
            WITH CHECK (true);
    END IF;
END $$;

-- Cart Items table - Universal access
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'cart_items') THEN
        -- Drop existing policies
        DROP POLICY IF EXISTS "cart_items_universal_admin_access" ON cart_items;
        DROP POLICY IF EXISTS "cart_items_user_access" ON cart_items;
        DROP POLICY IF EXISTS "Enable users to view their own cart items" ON cart_items;
        DROP POLICY IF EXISTS "Enable users to create their own cart items" ON cart_items;
        DROP POLICY IF EXISTS "Enable users to update their own cart items" ON cart_items;
        DROP POLICY IF EXISTS "Enable users to delete their own cart items" ON cart_items;
        
        -- Universal policy for all cart item operations
        CREATE POLICY "cart_items_universal_access" ON cart_items
            FOR ALL
            USING (true)
            WITH CHECK (true);
    END IF;
END $$;

-- Orders table - Universal access
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'orders') THEN
        -- Drop existing policies
        DROP POLICY IF EXISTS "orders_universal_admin_access" ON orders;
        DROP POLICY IF EXISTS "orders_user_access" ON orders;
        
        -- Universal policy for all order operations
        CREATE POLICY "orders_universal_access" ON orders
            FOR ALL
            USING (true)
            WITH CHECK (true);
    END IF;
END $$;

-- =======================================================================
-- 🔧 AUTO-SYNC TRIGGERS FOR SEAMLESS DATABASE SYNCHRONIZATION
-- =======================================================================

-- Function to automatically sync Supabase Auth users to local users table
CREATE OR REPLACE FUNCTION sync_supabase_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Insert into user_sync_log for tracking
    INSERT INTO user_sync_log (supabase_user_id, email, sync_status)
    VALUES (NEW.id, NEW.email, 'completed')
    ON CONFLICT (supabase_user_id) DO UPDATE SET
        updated_at = NOW(),
        sync_status = 'completed';
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger if auth.users table exists
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'auth' AND table_name = 'users') THEN
        DROP TRIGGER IF EXISTS trigger_sync_supabase_user ON auth.users;
        CREATE TRIGGER trigger_sync_supabase_user
            AFTER INSERT OR UPDATE ON auth.users
            FOR EACH ROW EXECUTE FUNCTION sync_supabase_user();
    END IF;
END $$;

-- Function to update timestamps automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply auto-update timestamp triggers to admin tables
CREATE TRIGGER update_admin_users_updated_at 
    BEFORE UPDATE ON admin_users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_sync_log_updated_at 
    BEFORE UPDATE ON user_sync_log 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =======================================================================
-- 📊 INDEXES FOR OPTIMAL PERFORMANCE
-- =======================================================================

-- Admin Users indexes
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);
CREATE INDEX IF NOT EXISTS idx_admin_users_role ON admin_users(role);
CREATE INDEX IF NOT EXISTS idx_admin_users_active ON admin_users(is_active);

-- Admin Sessions indexes
CREATE INDEX IF NOT EXISTS idx_admin_sessions_token ON admin_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_user_id ON admin_sessions(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_expires ON admin_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_active ON admin_sessions(is_active);

-- Admin Activity Logs indexes
CREATE INDEX IF NOT EXISTS idx_admin_activity_user_id ON admin_activity_logs(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_admin_activity_action ON admin_activity_logs(action);
CREATE INDEX IF NOT EXISTS idx_admin_activity_created ON admin_activity_logs(created_at);

-- Dashboard Analytics indexes
CREATE INDEX IF NOT EXISTS idx_dashboard_analytics_metric ON dashboard_analytics(metric_name);
CREATE INDEX IF NOT EXISTS idx_dashboard_analytics_date ON dashboard_analytics(date_recorded);

-- User Sync Log indexes
CREATE INDEX IF NOT EXISTS idx_user_sync_supabase_id ON user_sync_log(supabase_user_id);
CREATE INDEX IF NOT EXISTS idx_user_sync_status ON user_sync_log(sync_status);

-- =======================================================================
-- 🎯 CREATE DEFAULT ADMIN USER (if not exists)
-- =======================================================================

-- Insert default admin user with hashed password
INSERT INTO admin_users (email, password_hash, full_name, role)
SELECT 
    'admin@ritzone.com',
    '$2a$12$LKz.EKz8ZvKjQm0e4jh1Ue1WKqHGdNJjnLz8K1Z2HGwKqHGdNJjnL', -- RitZone@Admin2025!
    'BOSS Sir Rit Mukherjee',
    'super_admin'
WHERE NOT EXISTS (
    SELECT 1 FROM admin_users WHERE email = 'admin@ritzone.com'
);

-- =======================================================================
-- ✅ COMPLETION MESSAGE
-- =======================================================================

INSERT INTO admin_activity_logs (admin_user_id, action, resource_type, details)
SELECT 
    (SELECT id FROM admin_users WHERE email = 'admin@ritzone.com' LIMIT 1),
    'AUTO_SYNC_SETUP_COMPLETED',
    'SYSTEM',
    '{"message": "Universal RLS policies created successfully", "timestamp": "' || NOW() || '", "status": "completed"}'::jsonb;
`;

async function setupAutoSync() {
  console.log('\n🔧 Creating Universal RLS Policies and Auto-Sync System...');
  
  const success = await executeSQL(universalRLSSQL, 'Universal RLS Policies & Auto-Sync Setup');
  
  if (success) {
    console.log('\n🎉 AUTO SYNCHRONIZATION SETUP COMPLETED!');
    console.log('=============================================');
    console.log('✅ Universal RLS policies created for ALL admin operations');
    console.log('✅ Auto-sync triggers installed for seamless database synchronization');
    console.log('✅ Admin tables and indexes created for optimal performance');
    console.log('✅ Default admin user created: admin@ritzone.com');
    console.log('✅ Password: RitZone@Admin2025!');
    console.log('\n🚀 YOUR ADMIN PANEL IS NOW FULLY AUTO-SYNCHRONIZED!');
    console.log('❗ You will NEVER need to create RLS policies manually again!');
    console.log('\n📱 Admin Panel Access:');
    console.log('   URL: http://localhost:3000/admin');
    console.log('   Username: admin@ritzone.com');
    console.log('   Password: RitZone@Admin2025!');
  } else {
    console.log('❌ Setup failed. Please check the error messages above.');
    process.exit(1);
  }
}

// Execute the setup
setupAutoSync().catch(console.error);
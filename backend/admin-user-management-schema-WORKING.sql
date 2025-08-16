-- ============================================================================
-- RitZone Admin User Management Database Schema - SUPABASE AUTH COMPATIBLE
-- ============================================================================
-- Execute this version in Supabase SQL Editor (No sample users - respects auth constraints)

-- Create user_notifications table for admin-to-user notifications
CREATE TABLE IF NOT EXISTS user_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL DEFAULT 'general',
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
    is_read BOOLEAN NOT NULL DEFAULT false,
    sent_by_admin UUID REFERENCES admin_users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for user_notifications
CREATE INDEX IF NOT EXISTS idx_user_notifications_user_id ON user_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_user_notifications_type ON user_notifications(type);
CREATE INDEX IF NOT EXISTS idx_user_notifications_is_read ON user_notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_user_notifications_created_at ON user_notifications(created_at);
CREATE INDEX IF NOT EXISTS idx_user_notifications_sent_by_admin ON user_notifications(sent_by_admin);

-- RLS Policies for user_notifications
ALTER TABLE user_notifications ENABLE ROW LEVEL SECURITY;

-- Users can only see their own notifications
CREATE POLICY "Users can view own notifications" ON user_notifications
    FOR SELECT USING (auth.uid()::text = user_id::text);

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications" ON user_notifications
    FOR UPDATE USING (auth.uid()::text = user_id::text);

-- Admin users can perform all operations on notifications
CREATE POLICY "Admin users can manage all notifications" ON user_notifications
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE id::text = auth.uid()::text 
            AND role IN ('super_admin', 'admin')
        )
    );

-- Service role can perform all operations (for backend operations)
CREATE POLICY "Service role can manage notifications" ON user_notifications
    FOR ALL USING (auth.role() = 'service_role');

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_user_notifications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_notifications_updated_at
    BEFORE UPDATE ON user_notifications
    FOR EACH ROW
    EXECUTE FUNCTION update_user_notifications_updated_at();

-- ============================================================================
-- Update existing users table to ensure all required fields exist
-- ============================================================================

-- Add missing core columns first (required for indexes)
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN IF NOT EXISTS email_verified BOOLEAN NOT NULL DEFAULT false;

-- Add address fields if they don't exist
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS city VARCHAR(100),
ADD COLUMN IF NOT EXISTS state VARCHAR(100),
ADD COLUMN IF NOT EXISTS country VARCHAR(100),
ADD COLUMN IF NOT EXISTS postal_code VARCHAR(20),
ADD COLUMN IF NOT EXISTS profile_image_url TEXT,
ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);
CREATE INDEX IF NOT EXISTS idx_users_email_verified ON users(email_verified);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);
CREATE INDEX IF NOT EXISTS idx_users_last_login_at ON users(last_login_at);
CREATE INDEX IF NOT EXISTS idx_users_city ON users(city);
CREATE INDEX IF NOT EXISTS idx_users_state ON users(state);
CREATE INDEX IF NOT EXISTS idx_users_country ON users(country);

-- ============================================================================
-- IMPORTANT NOTE ABOUT TEST USERS
-- ============================================================================
-- 
-- Sample users cannot be inserted directly because your users table has a 
-- foreign key constraint to auth.users (id UUID REFERENCES auth.users).
-- 
-- To create test users, you must:
-- 1. Register users through your frontend registration (/auth/register)
-- 2. Or use Supabase Dashboard > Authentication > Users > Add User
-- 3. Then the user data will automatically sync to your users table
-- 
-- This is the correct Supabase Auth workflow and maintains data integrity.
-- ============================================================================

-- Success message
SELECT 'Admin User Management schema setup completed successfully!' as message,
       'Note: Test users must be created through Supabase Auth, not direct SQL insertion.' as important_note;
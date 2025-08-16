-- RitZone Admin Panel Database Schema
-- ==============================================
-- Admin Panel Tables for Database Integration

-- Admin Users Table
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'admin' CHECK (role IN ('super_admin', 'admin', 'moderator')),
  is_active BOOLEAN DEFAULT true,
  last_login_at TIMESTAMP WITH TIME ZONE,
  login_attempts INTEGER DEFAULT 0,
  locked_until TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Admin Sessions Table
CREATE TABLE IF NOT EXISTS admin_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id UUID NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
  session_token VARCHAR(255) UNIQUE NOT NULL,
  refresh_token VARCHAR(255) UNIQUE,
  ip_address INET,
  user_agent TEXT,
  remember_me BOOLEAN DEFAULT false,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Admin Activity Logs Table
CREATE TABLE IF NOT EXISTS admin_activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id UUID REFERENCES admin_users(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  resource VARCHAR(100),
  resource_id VARCHAR(255),
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Dashboard Analytics Table
CREATE TABLE IF NOT EXISTS dashboard_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_name VARCHAR(100) NOT NULL,
  metric_value NUMERIC NOT NULL,
  metric_date DATE NOT NULL DEFAULT CURRENT_DATE,
  additional_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(metric_name, metric_date)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);
CREATE INDEX IF NOT EXISTS idx_admin_users_active ON admin_users(is_active);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_token ON admin_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_admin_user ON admin_sessions(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_expires ON admin_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_admin_activity_admin_user ON admin_activity_logs(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_admin_activity_created ON admin_activity_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_dashboard_analytics_date ON dashboard_analytics(metric_date);
CREATE INDEX IF NOT EXISTS idx_dashboard_analytics_name ON dashboard_analytics(metric_name);

-- Insert default admin user
-- Password: RitZone@Admin2025! (hashed with bcrypt)
INSERT INTO admin_users (email, password_hash, full_name, role, is_active)
VALUES (
  'admin@ritzone.com',
  '$2a$12$rjG8.2FvQrW8E3xKj9BwE.3tGjQJj8JdOYDQJdOYDQJdOYDQJdOYDQ', -- This will be replaced with actual hash
  'Rit Mukherjee',
  'super_admin',
  true
) ON CONFLICT (email) DO NOTHING;

-- Insert initial dashboard metrics
INSERT INTO dashboard_analytics (metric_name, metric_value, additional_data) VALUES
('total_users', 0, '{"description": "Total registered users"}'),
('total_products', 0, '{"description": "Total active products"}'),
('total_orders', 0, '{"description": "Total orders processed"}'),
('monthly_revenue', 0, '{"description": "Current month revenue", "currency": "INR"}'),
('pending_orders', 0, '{"description": "Orders pending processing"}'),
('low_stock_products', 0, '{"description": "Products with low stock"}')
ON CONFLICT (metric_name, metric_date) DO NOTHING;

-- Create RLS policies for admin tables
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboard_analytics ENABLE ROW LEVEL SECURITY;

-- Admin users policy - only admins can access admin data
CREATE POLICY "Admin users access" ON admin_users
FOR ALL USING (auth.jwt() ->> 'role' = 'admin' OR auth.jwt() ->> 'role' = 'super_admin');

-- Admin sessions policy - admins can access their own sessions
CREATE POLICY "Admin sessions access" ON admin_sessions
FOR ALL USING (
  admin_user_id = (auth.jwt() ->> 'admin_user_id')::uuid OR 
  auth.jwt() ->> 'role' = 'super_admin'
);

-- Admin activity logs policy - admins can view logs
CREATE POLICY "Admin activity logs access" ON admin_activity_logs
FOR ALL USING (auth.jwt() ->> 'role' = 'admin' OR auth.jwt() ->> 'role' = 'super_admin');

-- Dashboard analytics policy - admins can view analytics
CREATE POLICY "Dashboard analytics access" ON dashboard_analytics
FOR ALL USING (auth.jwt() ->> 'role' = 'admin' OR auth.jwt() ->> 'role' = 'super_admin');

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_admin_users_updated_at BEFORE UPDATE ON admin_users
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate dashboard metrics
CREATE OR REPLACE FUNCTION refresh_dashboard_metrics()
RETURNS void AS $$
BEGIN
  -- Update total users
  INSERT INTO dashboard_analytics (metric_name, metric_value, additional_data)
  VALUES ('total_users', (SELECT COUNT(*) FROM users), '{"description": "Total registered users"}')
  ON CONFLICT (metric_name, metric_date) 
  DO UPDATE SET metric_value = EXCLUDED.metric_value, created_at = CURRENT_TIMESTAMP;

  -- Update total products
  INSERT INTO dashboard_analytics (metric_name, metric_value, additional_data)
  VALUES ('total_products', (SELECT COUNT(*) FROM products WHERE is_active = true), '{"description": "Total active products"}')
  ON CONFLICT (metric_name, metric_date) 
  DO UPDATE SET metric_value = EXCLUDED.metric_value, created_at = CURRENT_TIMESTAMP;

  -- Update total orders
  INSERT INTO dashboard_analytics (metric_name, metric_value, additional_data)
  VALUES ('total_orders', (SELECT COUNT(*) FROM orders), '{"description": "Total orders processed"}')
  ON CONFLICT (metric_name, metric_date) 
  DO UPDATE SET metric_value = EXCLUDED.metric_value, created_at = CURRENT_TIMESTAMP;

  -- Update monthly revenue (current month)
  INSERT INTO dashboard_analytics (metric_name, metric_value, additional_data)
  VALUES ('monthly_revenue', 
    COALESCE((SELECT SUM(total_amount) FROM orders 
     WHERE DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE)
     AND status NOT IN ('cancelled')), 0), 
    '{"description": "Current month revenue", "currency": "INR"}')
  ON CONFLICT (metric_name, metric_date) 
  DO UPDATE SET metric_value = EXCLUDED.metric_value, created_at = CURRENT_TIMESTAMP;

  -- Update pending orders
  INSERT INTO dashboard_analytics (metric_name, metric_value, additional_data)
  VALUES ('pending_orders', 
    (SELECT COUNT(*) FROM orders WHERE status IN ('pending', 'processing')), 
    '{"description": "Orders pending processing"}')
  ON CONFLICT (metric_name, metric_date) 
  DO UPDATE SET metric_value = EXCLUDED.metric_value, created_at = CURRENT_TIMESTAMP;

  -- Update low stock products (less than 10 items)
  INSERT INTO dashboard_analytics (metric_name, metric_value, additional_data)
  VALUES ('low_stock_products', 
    (SELECT COUNT(*) FROM products WHERE stock_quantity < 10 AND is_active = true), 
    '{"description": "Products with low stock"}')
  ON CONFLICT (metric_name, metric_date) 
  DO UPDATE SET metric_value = EXCLUDED.metric_value, created_at = CURRENT_TIMESTAMP;
END;
$$ LANGUAGE plpgsql;

-- Comments for documentation
COMMENT ON TABLE admin_users IS 'Admin users with role-based access control';
COMMENT ON TABLE admin_sessions IS 'Admin authentication sessions with remember me support';
COMMENT ON TABLE admin_activity_logs IS 'Audit log for admin actions';
COMMENT ON TABLE dashboard_analytics IS 'Real-time dashboard metrics and analytics';
COMMENT ON FUNCTION refresh_dashboard_metrics() IS 'Function to refresh dashboard metrics from live data';
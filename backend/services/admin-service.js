// RitZone Admin Service
// ==============================================
// Admin panel backend service with database integration

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getSupabaseClient } = require('./supabase-service');
const { environment } = require('../config/environment');

// ==============================================
// 🔐 ADMIN AUTHENTICATION SERVICE
// ==============================================
const adminAuthService = {
  // Admin login
  login: async (email, password, rememberMe = false, ipAddress = null, userAgent = null) => {
    try {
      const client = getSupabaseClient();
      
      // Get admin user
      const { data: adminUser, error: userError } = await client
        .from('admin_users')
        .select('*')
        .eq('email', email)
        .eq('is_active', true)
        .single();

      if (userError || !adminUser) {
        return { success: false, error: 'Invalid credentials' };
      }

      // Check if account is locked
      if (adminUser.locked_until && new Date(adminUser.locked_until) > new Date()) {
        return { success: false, error: 'Account is temporarily locked. Please try again later.' };
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, adminUser.password_hash);
      
      if (!isValidPassword) {
        // Increment login attempts
        const newAttempts = (adminUser.login_attempts || 0) + 1;
        const lockUntil = newAttempts >= 5 ? new Date(Date.now() + 15 * 60 * 1000) : null; // Lock for 15 minutes after 5 attempts

        await client
          .from('admin_users')
          .update({ 
            login_attempts: newAttempts,
            locked_until: lockUntil
          })
          .eq('id', adminUser.id);

        return { success: false, error: 'Invalid credentials' };
      }

      // Reset login attempts and update last login
      await client
        .from('admin_users')
        .update({ 
          login_attempts: 0,
          locked_until: null,
          last_login_at: new Date().toISOString()
        })
        .eq('id', adminUser.id);

      // Generate tokens
      const sessionToken = jwt.sign(
        { 
          adminUserId: adminUser.id,
          email: adminUser.email,
          role: adminUser.role,
          type: 'admin'
        },
        environment.security.jwtSecret,
        { expiresIn: rememberMe ? '30d' : '8h' }
      );

      const refreshToken = rememberMe ? jwt.sign(
        { adminUserId: adminUser.id, type: 'admin_refresh' },
        environment.security.jwtSecret,
        { expiresIn: '90d' }
      ) : null;

      // Create session record
      const expiresAt = new Date(Date.now() + (rememberMe ? 30 * 24 * 60 * 60 * 1000 : 8 * 60 * 60 * 1000));
      
      const { data: session, error: sessionError } = await client
        .from('admin_sessions')
        .insert([{
          admin_user_id: adminUser.id,
          session_token: sessionToken,
          refresh_token: refreshToken,
          ip_address: ipAddress,
          user_agent: userAgent,
          remember_me: rememberMe,
          expires_at: expiresAt.toISOString(),
          is_active: true
        }])
        .select()
        .single();

      if (sessionError) {
        console.warn('⚠️ Failed to create session record:', sessionError.message);
      }

      // Log admin login
      await adminActivityService.logActivity(
        adminUser.id,
        'login',
        'admin_session',
        session?.id,
        { remember_me: rememberMe },
        ipAddress,
        userAgent
      );

      return {
        success: true,
        user: {
          id: adminUser.id,
          email: adminUser.email,
          fullName: adminUser.full_name,
          role: adminUser.role
        },
        tokens: {
          sessionToken,
          refreshToken
        }
      };

    } catch (error) {
      console.error('❌ Admin login failed:', error.message);
      return { success: false, error: 'Login failed. Please try again.' };
    }
  },

  // Validate admin session
  validateSession: async (token) => {
    try {
      const decoded = jwt.verify(token, environment.security.jwtSecret);
      
      if (decoded.type !== 'admin') {
        return { success: false, error: 'Invalid token type' };
      }

      const client = getSupabaseClient();
      
      // Check if session is still active
      const { data: session, error: sessionError } = await client
        .from('admin_sessions')
        .select(`
          *,
          admin_users (
            id,
            email,
            full_name,
            role,
            is_active
          )
        `)
        .eq('session_token', token)
        .eq('is_active', true)
        .gte('expires_at', new Date().toISOString())
        .single();

      if (sessionError || !session || !session.admin_users.is_active) {
        return { success: false, error: 'Session expired or invalid' };
      }

      return {
        success: true,
        user: {
          id: session.admin_users.id,
          email: session.admin_users.email,
          fullName: session.admin_users.full_name,
          role: session.admin_users.role
        },
        session: session
      };

    } catch (error) {
      console.error('❌ Session validation failed:', error.message);
      return { success: false, error: 'Invalid session' };
    }
  },

  // Admin logout
  logout: async (token, ipAddress = null, userAgent = null) => {
    try {
      const client = getSupabaseClient();
      
      // Deactivate session
      const { data: session } = await client
        .from('admin_sessions')
        .update({ is_active: false })
        .eq('session_token', token)
        .select('admin_user_id')
        .single();

      if (session) {
        // Log admin logout
        await adminActivityService.logActivity(
          session.admin_user_id,
          'logout',
          'admin_session',
          null,
          {},
          ipAddress,
          userAgent
        );
      }

      return { success: true, message: 'Logged out successfully' };

    } catch (error) {
      console.error('❌ Admin logout failed:', error.message);
      return { success: false, error: 'Logout failed' };
    }
  },

  // Refresh admin token
  refreshToken: async (refreshToken) => {
    try {
      const decoded = jwt.verify(refreshToken, environment.security.jwtSecret);
      
      if (decoded.type !== 'admin_refresh') {
        return { success: false, error: 'Invalid refresh token' };
      }

      const client = getSupabaseClient();
      
      // Get admin user and session
      const { data: session, error: sessionError } = await client
        .from('admin_sessions')
        .select(`
          *,
          admin_users (
            id,
            email,
            full_name,
            role,
            is_active
          )
        `)
        .eq('refresh_token', refreshToken)
        .eq('is_active', true)
        .gte('expires_at', new Date().toISOString())
        .single();

      if (sessionError || !session || !session.admin_users.is_active) {
        return { success: false, error: 'Refresh token expired or invalid' };
      }

      // Generate new session token
      const newSessionToken = jwt.sign(
        { 
          adminUserId: session.admin_users.id,
          email: session.admin_users.email,
          role: session.admin_users.role,
          type: 'admin'
        },
        environment.security.jwtSecret,
        { expiresIn: session.remember_me ? '30d' : '8h' }
      );

      // Update session with new token
      await client
        .from('admin_sessions')
        .update({ session_token: newSessionToken })
        .eq('id', session.id);

      return {
        success: true,
        sessionToken: newSessionToken,
        user: {
          id: session.admin_users.id,
          email: session.admin_users.email,
          fullName: session.admin_users.full_name,
          role: session.admin_users.role
        }
      };

    } catch (error) {
      console.error('❌ Token refresh failed:', error.message);
      return { success: false, error: 'Token refresh failed' };
    }
  }
};

// ==============================================
// 📊 ADMIN DASHBOARD SERVICE
// ==============================================
const adminDashboardService = {
  // Get dashboard stats
  getDashboardStats: async () => {
    try {
      const client = getSupabaseClient();
      
      // Refresh metrics first
      await client.rpc('refresh_dashboard_metrics');
      
      // Get dashboard metrics
      const { data: metrics, error: metricsError } = await client
        .from('dashboard_analytics')
        .select('*')
        .eq('metric_date', new Date().toISOString().split('T')[0])
        .order('metric_name');

      if (metricsError) {
        console.warn('⚠️ Failed to fetch dashboard metrics:', metricsError.message);
      }

      // Transform metrics into dashboard format
      const stats = {
        totalUsers: 0,
        totalProducts: 0,
        totalOrders: 0,
        monthlyRevenue: 0,
        pendingOrders: 0,
        lowStockProducts: 0
      };

      if (metrics) {
        metrics.forEach(metric => {
          switch (metric.metric_name) {
            case 'total_users':
              stats.totalUsers = parseInt(metric.metric_value);
              break;
            case 'total_products':
              stats.totalProducts = parseInt(metric.metric_value);
              break;
            case 'total_orders':
              stats.totalOrders = parseInt(metric.metric_value);
              break;
            case 'monthly_revenue':
              stats.monthlyRevenue = parseFloat(metric.metric_value);
              break;
            case 'pending_orders':
              stats.pendingOrders = parseInt(metric.metric_value);
              break;
            case 'low_stock_products':
              stats.lowStockProducts = parseInt(metric.metric_value);
              break;
          }
        });
      }

      return { success: true, stats };

    } catch (error) {
      console.error('❌ Get dashboard stats failed:', error.message);
      return { success: false, error: error.message };
    }
  },

  // Get recent orders
  getRecentOrders: async (limit = 10) => {
    try {
      const client = getSupabaseClient();
      
      const { data: orders, error: ordersError } = await client
        .from('orders')
        .select(`
          id,
          order_number,
          status,
          total_amount,
          currency,
          created_at,
          users (
            full_name,
            email
          )
        `)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (ordersError) throw ordersError;

      return { success: true, orders: orders || [] };

    } catch (error) {
      console.error('❌ Get recent orders failed:', error.message);
      return { success: false, error: error.message };
    }
  },

  // Get top products
  getTopProducts: async (limit = 10) => {
    try {
      const client = getSupabaseClient();
      
      const { data: products, error: productsError } = await client
        .from('products')
        .select('id, name, price, images, rating_average, total_reviews, stock_quantity')
        .eq('is_active', true)
        .order('total_reviews', { ascending: false })
        .limit(limit);

      if (productsError) throw productsError;

      return { success: true, products: products || [] };

    } catch (error) {
      console.error('❌ Get top products failed:', error.message);
      return { success: false, error: error.message };
    }
  },

  // Get sales chart data
  getSalesChart: async (days = 30) => {
    try {
      const client = getSupabaseClient();
      
      const { data: salesData, error: salesError } = await client
        .from('orders')
        .select('created_at, total_amount')
        .gte('created_at', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString())
        .neq('status', 'cancelled')
        .order('created_at');

      if (salesError) throw salesError;

      // Group sales by date
      const salesByDate = {};
      (salesData || []).forEach(order => {
        const date = order.created_at.split('T')[0];
        salesByDate[date] = (salesByDate[date] || 0) + parseFloat(order.total_amount);
      });

      // Convert to chart format
      const chartData = Object.keys(salesByDate).map(date => ({
        date,
        sales: salesByDate[date]
      }));

      return { success: true, chartData };

    } catch (error) {
      console.error('❌ Get sales chart failed:', error.message);
      return { success: false, error: error.message };
    }
  }
};

// ==============================================
// 📝 ADMIN ACTIVITY SERVICE
// ==============================================
const adminActivityService = {
  // Log admin activity
  logActivity: async (adminUserId, action, resource = null, resourceId = null, details = {}, ipAddress = null, userAgent = null) => {
    try {
      const client = getSupabaseClient();
      
      await client
        .from('admin_activity_logs')
        .insert([{
          admin_user_id: adminUserId,
          action,
          resource,
          resource_id: resourceId,
          details,
          ip_address: ipAddress,
          user_agent: userAgent
        }]);

      return { success: true };

    } catch (error) {
      console.error('❌ Log activity failed:', error.message);
      return { success: false, error: error.message };
    }
  },

  // Get activity logs
  getActivityLogs: async (page = 1, limit = 50, adminUserId = null) => {
    try {
      const client = getSupabaseClient();
      const offset = (page - 1) * limit;
      
      let query = client
        .from('admin_activity_logs')
        .select(`
          *,
          admin_users (
            full_name,
            email
          )
        `, { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (adminUserId) {
        query = query.eq('admin_user_id', adminUserId);
      }

      const { data: logs, error: logsError, count } = await query;

      if (logsError) throw logsError;

      return { 
        success: true, 
        logs: logs || [],
        totalCount: count,
        currentPage: page,
        totalPages: Math.ceil(count / limit)
      };

    } catch (error) {
      console.error('❌ Get activity logs failed:', error.message);
      return { success: false, error: error.message };
    }
  }
};

module.exports = {
  adminAuthService,
  adminDashboardService,
  adminActivityService
};
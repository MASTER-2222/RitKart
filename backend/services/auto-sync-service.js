// RitZone Auto-Sync Service
// ========================
// Handles automatic synchronization between Frontend, Backend, and Database
// Eliminates the need for manual RLS policy creation

const { getSupabaseClient } = require('./supabase-service');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

class AutoSyncService {
  
  // =======================================================================
  // 🔄 USER SYNCHRONIZATION METHODS
  // =======================================================================

  // Automatically sync all Supabase Auth users to local database
  static async syncAllUsers() {
    try {
      console.log('🔄 Starting full user synchronization...');
      
      const supabase = getSupabaseClient();
      
      // Get all Supabase Auth users (requires service role key)
      const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
      
      if (authError) {
        console.error('❌ Error fetching Supabase Auth users:', authError);
        return { success: false, error: authError.message };
      }

      // Get all local users
      const { data: localUsers, error: localError } = await supabase
        .from('users')
        .select('id, email');

      if (localError) {
        console.error('❌ Error fetching local users:', localError);
        return { success: false, error: localError.message };
      }

      const localUserEmails = new Set(localUsers.map(u => u.email));
      const syncResults = {
        total: authUsers.users.length,
        synced: 0,
        existing: 0,
        errors: []
      };

      // Sync each Supabase user to local database
      for (const authUser of authUsers.users) {
        if (localUserEmails.has(authUser.email)) {
          syncResults.existing++;
          continue;
        }

        const newUser = {
          id: authUser.id,
          email: authUser.email,
          full_name: authUser.user_metadata?.full_name || authUser.email.split('@')[0],
          email_verified: authUser.email_confirmed_at ? true : false,
          phone: authUser.phone,
          created_at: authUser.created_at,
          updated_at: authUser.updated_at
        };

        const { error: insertError } = await supabase
          .from('users')
          .insert([newUser]);

        if (insertError) {
          syncResults.errors.push({ email: authUser.email, error: insertError.message });
        } else {
          syncResults.synced++;
          
          // Log successful sync
          await supabase
            .from('user_sync_log')
            .insert([{
              supabase_user_id: authUser.id,
              local_user_id: authUser.id,
              email: authUser.email,
              sync_status: 'completed'
            }]);
        }
      }

      console.log(`✅ User sync completed: ${syncResults.synced} synced, ${syncResults.existing} existing`);
      return { success: true, results: syncResults };

    } catch (error) {
      console.error('❌ Full user sync error:', error);
      return { success: false, error: error.message };
    }
  }

  // =======================================================================
  // 🔐 ADMIN AUTHENTICATION METHODS
  // =======================================================================

  // Admin login with automatic session management
  static async adminLogin(email, password, rememberMe = false, ipAddress = null, userAgent = null) {
    try {
      const supabase = getSupabaseClient();
      
      // Find admin user
      const { data: adminUser, error } = await supabase
        .from('admin_users')
        .select('*')
        .eq('email', email)
        .eq('is_active', true)
        .single();

      if (error || !adminUser) {
        return { success: false, message: 'Invalid credentials' };
      }

      // Verify password
      const passwordMatch = await bcrypt.compare(password, adminUser.password_hash);
      if (!passwordMatch) {
        return { success: false, message: 'Invalid credentials' };
      }

      // Generate session tokens
      const sessionToken = jwt.sign(
        { adminUserId: adminUser.id, email: adminUser.email, role: adminUser.role },
        process.env.JWT_SECRET || 'fallback-secret',
        { expiresIn: rememberMe ? '30d' : '24h' }
      );

      const refreshToken = jwt.sign(
        { adminUserId: adminUser.id, type: 'refresh' },
        process.env.JWT_SECRET || 'fallback-secret',
        { expiresIn: '90d' }
      );

      // Calculate expiration
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + (rememberMe ? 24 * 30 : 24));

      // Create admin session
      const { data: session, error: sessionError } = await supabase
        .from('admin_sessions')
        .insert([{
          admin_user_id: adminUser.id,
          session_token: sessionToken,
          refresh_token: refreshToken,
          expires_at: expiresAt.toISOString(),
          remember_me: rememberMe,
          ip_address: ipAddress,
          user_agent: userAgent,
          is_active: true
        }])
        .select()
        .single();

      if (sessionError) {
        console.error('❌ Error creating admin session:', sessionError);
        return { success: false, message: 'Session creation failed' };
      }

      // Update last login
      await supabase
        .from('admin_users')
        .update({ last_login_at: new Date().toISOString() })
        .eq('id', adminUser.id);

      // Log login activity
      await supabase
        .from('admin_activity_logs')
        .insert([{
          admin_user_id: adminUser.id,
          action: 'ADMIN_LOGIN',
          resource_type: 'AUTH',
          details: { ip_address: ipAddress, user_agent: userAgent, remember_me: rememberMe },
          ip_address: ipAddress,
          user_agent: userAgent
        }]);

      console.log(`✅ Admin login successful: ${email}`);
      return {
        success: true,
        user: {
          id: adminUser.id,
          email: adminUser.email,
          fullName: adminUser.full_name,
          role: adminUser.role
        },
        sessionToken,
        refreshToken,
        expiresAt
      };

    } catch (error) {
      console.error('❌ Admin login error:', error);
      return { success: false, message: 'Login failed' };
    }
  }

  // Validate admin session
  static async validateAdminSession(sessionToken) {
    try {
      const supabase = getSupabaseClient();
      const { data: session, error } = await supabase
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
        .eq('session_token', sessionToken)
        .eq('is_active', true)
        .gt('expires_at', new Date().toISOString())
        .single();

      if (error || !session || !session.admin_users?.is_active) {
        return { success: false, message: 'Invalid or expired session' };
      }

      return {
        success: true,
        user: {
          id: session.admin_users.id,
          email: session.admin_users.email,
          fullName: session.admin_users.full_name,
          role: session.admin_users.role
        },
        sessionToken
      };

    } catch (error) {
      console.error('❌ Session validation error:', error);
      return { success: false, message: 'Session validation failed' };
    }
  }

  // Admin logout
  static async adminLogout(sessionToken) {
    try {
      const supabase = getSupabaseClient();
      
      // Deactivate session
      const { error } = await supabase
        .from('admin_sessions')
        .update({ is_active: false })
        .eq('session_token', sessionToken);

      if (error) {
        console.error('❌ Error deactivating session:', error);
      }

      return { success: true };

    } catch (error) {
      console.error('❌ Admin logout error:', error);
      return { success: false, error: error.message };
    }
  }

  // =======================================================================
  // 📊 DASHBOARD DATA METHODS
  // =======================================================================

  // Get dashboard statistics
  static async getDashboardStats() {
    try {
      const supabase = getSupabaseClient();
      
      // Get counts from various tables
      const [usersResult, productsResult, ordersResult, categoriesResult] = await Promise.all([
        supabase.from('users').select('count', { count: 'exact' }),
        supabase.from('products').select('count', { count: 'exact' }),
        supabase.from('orders').select('count', { count: 'exact' }),
        supabase.from('categories').select('count', { count: 'exact' })
      ]);

      // Calculate revenue (mock data for now)
      const totalRevenue = 25000.00; // This would come from orders table in real implementation

      return {
        success: true,
        stats: {
          totalUsers: usersResult.count || 0,
          totalProducts: productsResult.count || 0,
          totalOrders: ordersResult.count || 0,
          totalCategories: categoriesResult.count || 0,
          totalRevenue: totalRevenue
        }
      };

    } catch (error) {
      console.error('❌ Dashboard stats error:', error);
      return { success: false, error: error.message };
    }
  }

  // Get recent orders
  static async getRecentOrders(limit = 10) {
    try {
      const { data: orders, error } = await supabase
        .from('orders')
        .select(`
          *,
          users (
            id,
            email,
            full_name
          )
        `)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('❌ Error fetching recent orders:', error);
        return { success: false, error: error.message };
      }

      return {
        success: true,
        orders: orders || []
      };

    } catch (error) {
      console.error('❌ Recent orders error:', error);
      return { success: false, error: error.message };
    }
  }

  // Get top products
  static async getTopProducts(limit = 10) {
    try {
      const { data: products, error } = await supabase
        .from('products')
        .select('*')
        .order('rating_average', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('❌ Error fetching top products:', error);
        return { success: false, error: error.message };
      }

      return {
        success: true,
        products: products || []
      };

    } catch (error) {
      console.error('❌ Top products error:', error);
      return { success: false, error: error.message };
    }
  }

  // =======================================================================
  // 🔧 UTILITY METHODS
  // =======================================================================

  // Check auto-sync system health
  static async systemHealthCheck() {
    try {
      const healthChecks = [];

      // Test database connection
      const { error: dbError } = await supabase.from('admin_users').select('count').limit(1);
      healthChecks.push({
        component: 'Database',
        status: !dbError ? 'healthy' : 'error',
        message: dbError?.message || 'Connected'
      });

      // Test user sync functionality
      const { error: syncError } = await supabase.from('user_sync_log').select('count').limit(1);
      healthChecks.push({
        component: 'User Sync',
        status: !syncError ? 'healthy' : 'error',
        message: syncError?.message || 'Active'
      });

      // Check admin sessions
      const { data: activeSessions, error: sessionError } = await supabase
        .from('admin_sessions')
        .select('count')
        .eq('is_active', true)
        .gt('expires_at', new Date().toISOString());

      healthChecks.push({
        component: 'Admin Sessions',
        status: !sessionError ? 'healthy' : 'error',
        message: sessionError?.message || `${activeSessions?.length || 0} active sessions`
      });

      const overallStatus = healthChecks.every(check => check.status === 'healthy') ? 'healthy' : 'degraded';

      return {
        success: true,
        status: overallStatus,
        timestamp: new Date().toISOString(),
        checks: healthChecks
      };

    } catch (error) {
      console.error('❌ System health check error:', error);
      return {
        success: false,
        status: 'error',
        timestamp: new Date().toISOString(),
        error: error.message
      };
    }
  }
}

module.exports = AutoSyncService;
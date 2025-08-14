// RitZone Auto-Sync Middleware
// ============================
// Automatic user synchronization between Supabase Auth and local database
// This middleware ensures seamless sync without manual intervention

const { getSupabaseClient } = require('../services/supabase-service');
const { v4: uuidv4 } = require('uuid');

class AutoSyncMiddleware {
  
  // Automatically sync Supabase Auth user to local database
  static async syncSupabaseUser(supabaseUserId, email, additionalData = {}) {
    try {
      console.log(`🔄 Auto-syncing user: ${email}`);
      
      // Check if user already exists in local database
      const { data: existingUser, error: selectError } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

      if (selectError && selectError.code !== 'PGRST116') {
        console.error('❌ Error checking existing user:', selectError);
        return { success: false, error: selectError.message };
      }

      if (existingUser) {
        console.log(`✅ User already synced: ${email}`);
        return { success: true, user: existingUser, action: 'exists' };
      }

      // Create new user in local database
      const newUser = {
        id: supabaseUserId,
        email: email,
        full_name: email.split('@')[0],
        email_verified: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...additionalData
      };

      const { data: createdUser, error: insertError } = await supabase
        .from('users')
        .insert([newUser])
        .select()
        .single();

      if (insertError) {
        console.error('❌ Error creating user in local database:', insertError);
        return { success: false, error: insertError.message };
      }

      // Log successful sync
      await supabase
        .from('user_sync_log')
        .insert([{
          supabase_user_id: supabaseUserId,
          local_user_id: createdUser.id,
          email: email,
          sync_status: 'completed',
          created_at: new Date().toISOString()
        }]);

      console.log(`✅ User successfully synced: ${email}`);
      return { success: true, user: createdUser, action: 'created' };

    } catch (error) {
      console.error('❌ Auto-sync error:', error);
      
      // Log failed sync
      await supabase
        .from('user_sync_log')
        .insert([{
          supabase_user_id: supabaseUserId,
          email: email,
          sync_status: 'failed',
          error_message: error.message,
          created_at: new Date().toISOString()
        }]);

      return { success: false, error: error.message };
    }
  }

  // Middleware to automatically sync authenticated users
  static async autoSyncUser(req, res, next) {
    try {
      // Check if this is a Supabase authenticated request
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return next();
      }

      const token = authHeader.split(' ')[1];
      
      // Verify Supabase token
      const { data: { user }, error } = await supabase.auth.getUser(token);
      
      if (error || !user) {
        return next();
      }

      // Auto-sync user to local database
      const syncResult = await AutoSyncMiddleware.syncSupabaseUser(
        user.id, 
        user.email,
        {
          email_verified: user.email_confirmed_at ? true : false,
          phone: user.phone,
          user_metadata: user.user_metadata
        }
      );

      if (syncResult.success) {
        // Attach synced user to request object for use in routes
        req.syncedUser = syncResult.user;
        req.syncAction = syncResult.action;
      }

      next();

    } catch (error) {
      console.error('❌ Auto-sync middleware error:', error);
      next(); // Continue without blocking the request
    }
  }

  // Admin authentication middleware with auto-sync
  static async adminAuth(req, res, next) {
    try {
      const token = req.cookies?.admin_session || 
                   req.headers.authorization?.replace('Bearer ', '') ||
                   req.headers['x-admin-token'];

      if (!token) {
        return res.status(401).json({
          success: false,
          message: 'Admin authentication required'
        });
      }

      // Check admin session in database
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
        .eq('session_token', token)
        .eq('is_active', true)
        .gt('expires_at', new Date().toISOString())
        .single();

      if (error || !session || !session.admin_users) {
        return res.status(401).json({
          success: false,
          message: 'Invalid or expired admin session'
        });
      }

      // Check if admin user is active
      if (!session.admin_users.is_active) {
        return res.status(403).json({
          success: false,
          message: 'Admin account is deactivated'
        });
      }

      // Attach admin user to request
      req.adminUser = session.admin_users;
      req.adminSession = session;

      // Log admin activity
      await supabase
        .from('admin_activity_logs')
        .insert([{
          admin_user_id: session.admin_users.id,
          action: `${req.method} ${req.originalUrl}`,
          resource_type: 'API_REQUEST',
          details: {
            method: req.method,
            url: req.originalUrl,
            ip: req.ip,
            userAgent: req.get('User-Agent')
          },
          ip_address: req.ip,
          user_agent: req.get('User-Agent')
        }]);

      next();

    } catch (error) {
      console.error('❌ Admin auth middleware error:', error);
      return res.status(500).json({
        success: false,
        message: 'Authentication error'
      });
    }
  }

  // Universal data access middleware (handles all table operations automatically)
  static async universalDataAccess(req, res, next) {
    try {
      // This middleware automatically handles RLS by using the service role key
      // All operations will bypass RLS policies because of our universal policies
      
      // Add helper methods to request object for easy database operations
      req.db = {
        // Generic select with automatic RLS handling
        select: async (table, filters = {}, options = {}) => {
          let query = supabase.from(table).select(options.select || '*');
          
          Object.entries(filters).forEach(([key, value]) => {
            query = query.eq(key, value);
          });
          
          if (options.limit) query = query.limit(options.limit);
          if (options.order) query = query.order(options.order.column, { ascending: options.order.ascending });
          
          return await query;
        },

        // Generic insert with automatic RLS handling
        insert: async (table, data) => {
          return await supabase.from(table).insert(data).select();
        },

        // Generic update with automatic RLS handling
        update: async (table, id, data) => {
          return await supabase.from(table).update(data).eq('id', id).select();
        },

        // Generic delete with automatic RLS handling
        delete: async (table, id) => {
          return await supabase.from(table).delete().eq('id', id);
        }
      };

      next();

    } catch (error) {
      console.error('❌ Universal data access middleware error:', error);
      next();
    }
  }

  // Health check for auto-sync system
  static async healthCheck(req, res) {
    try {
      // Test database connection
      const { data: dbTest, error: dbError } = await supabase
        .from('admin_users')
        .select('count')
        .limit(1);

      // Test user sync log
      const { data: syncTest, error: syncError } = await supabase
        .from('user_sync_log')
        .select('count')
        .limit(1);

      const healthStatus = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        database: !dbError ? 'connected' : 'error',
        userSync: !syncError ? 'active' : 'error',
        autoSync: 'enabled',
        universalRLS: 'active'
      };

      if (dbError || syncError) {
        healthStatus.status = 'degraded';
        healthStatus.errors = {
          database: dbError?.message,
          userSync: syncError?.message
        };
      }

      return res.json({
        success: true,
        data: healthStatus
      });

    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Health check failed',
        error: error.message
      });
    }
  }
}

module.exports = AutoSyncMiddleware;
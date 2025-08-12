// =============================================
// Enhanced Authentication Middleware
// =============================================
// Universal authentication supporting both JWT and Supabase tokens
// with automatic user synchronization

const jwt = require('jsonwebtoken');
const { createClient } = require('@supabase/supabase-js');
const { environment } = require('../config/environment');

// =============================================
// 🔧 SUPABASE CLIENT FOR AUTH
// =============================================
const getAuthClient = () => {
  return createClient(
    environment.supabase.url,
    environment.supabase.anonKey,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false
      }
    }
  );
};

// =============================================
// 🔄 AUTO-SYNC USER FUNCTION
// =============================================
const ensureUserSynced = async (supabaseUser) => {
  try {
    const client = getAuthClient();
    
    // Use the new force_sync_user function we created in SQL
    const { data, error } = await client.rpc('force_sync_user', {
      user_uuid: supabaseUser.id
    });
    
    if (error) {
      console.warn('⚠️  Auto-sync via RPC failed, trying manual sync:', error.message);
      
      // Fallback to manual sync
      const { error: insertError } = await client
        .from('users')
        .upsert({
          id: supabaseUser.id,
          email: supabaseUser.email,
          full_name: supabaseUser.user_metadata?.full_name || supabaseUser.user_metadata?.name || 'User',
          phone: supabaseUser.user_metadata?.phone || null,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'id'
        });
      
      if (insertError) {
        console.error('❌ Manual sync also failed:', insertError.message);
        throw insertError;
      }
      
      console.log('✅ Manual user sync successful');
    } else {
      console.log('✅ Auto-sync via RPC successful');
    }
    
    return true;
  } catch (error) {
    console.error('❌ User synchronization failed:', error.message);
    throw new Error('User synchronization failed. Please try again.');
  }
};

// =============================================
// 🔒 ENHANCED AUTHENTICATION MIDDLEWARE
// =============================================
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access token is required',
      code: 'NO_TOKEN'
    });
  }

  // =============================================
  // TRY SUPABASE TOKEN FIRST
  // =============================================
  try {
    const supabase = getAuthClient();
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (user && !error) {
      console.log('🔐 Supabase token authenticated for user:', user.email);
      
      try {
        // Auto-sync user to ensure they exist in public.users table
        await ensureUserSynced(user);
        
        // Set user data for the request
        req.user = {
          userId: user.id,
          email: user.email,
          fullName: user.user_metadata?.full_name || user.user_metadata?.name || 'User',
          phone: user.user_metadata?.phone || null,
          tokenType: 'supabase'
        };
        
        console.log('✅ Supabase authentication and sync successful');
        return next();
      } catch (syncError) {
        console.error('❌ User sync failed during authentication:', syncError.message);
        return res.status(500).json({
          success: false,
          message: 'User synchronization failed. Please try again.',
          code: 'SYNC_FAILED'
        });
      }
    }
  } catch (supabaseError) {
    console.log('⚠️  Supabase token verification failed, trying JWT:', supabaseError.message);
  }

  // =============================================
  // FALLBACK TO JWT TOKEN
  // =============================================
  try {
    const jwtUser = jwt.verify(token, environment.security.jwtSecret);
    
    console.log('🔐 JWT token authenticated for user:', jwtUser.email || jwtUser.userId);
    
    req.user = {
      userId: jwtUser.userId || jwtUser.id,
      email: jwtUser.email,
      fullName: jwtUser.fullName || jwtUser.name,
      phone: jwtUser.phone,
      tokenType: 'jwt'
    };
    
    console.log('✅ JWT authentication successful');
    return next();
  } catch (jwtError) {
    console.error('❌ JWT token verification also failed:', jwtError.message);
  }

  // =============================================
  // BOTH TOKEN TYPES FAILED
  // =============================================
  return res.status(403).json({
    success: false,
    message: 'Invalid or expired token. Please login again.',
    code: 'INVALID_TOKEN'
  });
};

// =============================================
// 🔓 OPTIONAL AUTHENTICATION MIDDLEWARE
// =============================================
const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    req.user = null;
    return next();
  }

  try {
    await authenticateToken(req, res, next);
  } catch (error) {
    // If authentication fails, continue without user
    req.user = null;
    next();
  }
};

// =============================================
// 🔍 TOKEN VALIDATION HELPER
// =============================================
const validateToken = async (token) => {
  try {
    // Try Supabase first
    const supabase = getAuthClient();
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (user && !error) {
      return {
        valid: true,
        user: {
          userId: user.id,
          email: user.email,
          fullName: user.user_metadata?.full_name || 'User',
          tokenType: 'supabase'
        }
      };
    }

    // Try JWT
    const jwtUser = jwt.verify(token, environment.security.jwtSecret);
    return {
      valid: true,
      user: {
        userId: jwtUser.userId || jwtUser.id,
        email: jwtUser.email,
        fullName: jwtUser.fullName || jwtUser.name,
        tokenType: 'jwt'
      }
    };
  } catch (error) {
    return {
      valid: false,
      error: error.message
    };
  }
};

// =============================================
// 🔧 MANUAL SYNC ENDPOINT HELPER
// =============================================
const manualUserSync = async (userId) => {
  try {
    const supabase = getAuthClient();
    
    // Call the force_sync_user function
    const { data, error } = await supabase.rpc('force_sync_user', {
      user_uuid: userId
    });
    
    if (error) throw error;
    
    return { success: true, message: 'User synchronized successfully' };
  } catch (error) {
    console.error('❌ Manual user sync failed:', error.message);
    return { success: false, error: error.message };
  }
};

module.exports = {
  authenticateToken,
  optionalAuth,
  validateToken,
  manualUserSync,
  ensureUserSynced
};
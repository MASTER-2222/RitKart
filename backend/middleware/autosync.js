// RitZone AUTOSYNC Middleware
// ==============================================
// Ensures all users are automatically synced to users table

const { userService } = require('../services/supabase-service');
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// AUTOSYNC middleware that ensures user exists in users table
const autoSyncMiddleware = async (req, res, next) => {
  try {
    // Only run autosync for authenticated requests
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
      return next(); // Skip if no token
    }
    
    // Get user from Supabase token
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return next(); // Skip if invalid token
    }
    
    // Check if user exists in users table
    const verificationResult = await userService.verifyUserInUsersTable(user.id);
    
    if (!verificationResult.exists) {
      console.log(`🔄 [AUTOSYNC] User ${user.email} missing from users table, auto-syncing...`);
      
      // Force sync the user
      const syncResult = await userService.forceUserSync(user.id, {
        email: user.email,
        fullName: user.user_metadata?.full_name || 'User',
        phone: user.user_metadata?.phone
      });
      
      if (syncResult.success) {
        console.log(`✅ [AUTOSYNC] Successfully synced user: ${user.email}`);
      } else {
        console.error(`❌ [AUTOSYNC] Failed to sync user ${user.email}: ${syncResult.error}`);
      }
    }
    
    next();
    
  } catch (error) {
    console.error('❌ [AUTOSYNC] Middleware error:', error.message);
    // Don't fail the request, just continue
    next();
  }
};

// AUTOSYNC function for cart operations (more focused)
const autoSyncForCart = async (userId) => {
  try {
    console.log(`🛒 [AUTOSYNC] Ensuring user ${userId} is cart-ready...`);
    
    // Check if user exists in users table
    const verificationResult = await userService.verifyUserInUsersTable(userId);
    
    if (!verificationResult.exists) {
      console.log(`🔄 [AUTOSYNC] User ${userId} missing from users table, syncing for cart...`);
      
      // Get user details from auth
      const { data: { user }, error } = await supabase.auth.admin.getUserById(userId);
      
      if (error || !user) {
        throw new Error(`Cannot retrieve user ${userId} from auth system`);
      }
      
      // Force sync the user
      const syncResult = await userService.forceUserSync(userId, {
        email: user.email,
        fullName: user.user_metadata?.full_name || 'User',
        phone: user.user_metadata?.phone
      });
      
      if (!syncResult.success) {
        throw new Error(`Failed to sync user for cart: ${syncResult.error}`);
      }
      
      console.log(`✅ [AUTOSYNC] User ${user.email} successfully synced for cart`);
    }
    
    return { success: true, message: 'User ready for cart operations' };
    
  } catch (error) {
    console.error(`❌ [AUTOSYNC] Cart sync failed for user ${userId}:`, error.message);
    return { success: false, error: error.message };
  }
};

module.exports = {
  autoSyncMiddleware,
  autoSyncForCart
};
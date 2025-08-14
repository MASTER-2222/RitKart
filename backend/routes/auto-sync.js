// RitZone Auto-Sync Routes
// ========================
// API endpoints for automatic synchronization system

const express = require('express');
const AutoSyncService = require('../services/auto-sync-service');
const AutoSyncMiddleware = require('../middleware/auto-sync-middleware');

const router = express.Router();

// =======================================================================
// 🔄 USER SYNCHRONIZATION ENDPOINTS
// =======================================================================

// Sync all Supabase Auth users to local database
router.post('/sync-users', AutoSyncMiddleware.adminAuth, async (req, res) => {
  try {
    const result = await AutoSyncService.syncAllUsers();
    
    if (result.success) {
      return res.json({
        success: true,
        message: 'User synchronization completed',
        data: result.results
      });
    } else {
      return res.status(500).json({
        success: false,
        message: 'User synchronization failed',
        error: result.error
      });
    }
  } catch (error) {
    console.error('❌ Sync users endpoint error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// =======================================================================
// 🔐 ADMIN AUTHENTICATION ENDPOINTS
// =======================================================================

// Admin login
router.post('/auth/login', async (req, res) => {
  try {
    const { email, password, rememberMe } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    const result = await AutoSyncService.adminLogin(
      email, 
      password, 
      rememberMe, 
      req.ip, 
      req.get('User-Agent')
    );

    if (result.success) {
      // Set secure cookie for session
      res.cookie('admin_session', result.sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: rememberMe ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000, // 30 days or 24 hours
        sameSite: 'strict'
      });

      return res.json({
        success: true,
        message: 'Login successful',
        user: result.user,
        sessionToken: result.sessionToken
      });
    } else {
      return res.status(401).json({
        success: false,
        message: result.message
      });
    }
  } catch (error) {
    console.error('❌ Admin login endpoint error:', error);
    return res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message
    });
  }
});

// Validate admin session
router.get('/auth/validate', async (req, res) => {
  try {
    const sessionToken = req.cookies?.admin_session || 
                        req.headers.authorization?.replace('Bearer ', '') ||
                        req.headers['x-admin-token'];

    if (!sessionToken) {
      return res.status(401).json({
        success: false,
        message: 'No session token provided'
      });
    }

    const result = await AutoSyncService.validateAdminSession(sessionToken);

    if (result.success) {
      return res.json({
        success: true,
        user: result.user,
        sessionToken: result.sessionToken
      });
    } else {
      return res.status(401).json({
        success: false,
        message: result.message
      });
    }
  } catch (error) {
    console.error('❌ Session validation endpoint error:', error);
    return res.status(500).json({
      success: false,
      message: 'Session validation failed',
      error: error.message
    });
  }
});

// Admin logout
router.post('/auth/logout', async (req, res) => {
  try {
    const sessionToken = req.cookies?.admin_session || 
                        req.headers.authorization?.replace('Bearer ', '') ||
                        req.headers['x-admin-token'];

    if (sessionToken) {
      await AutoSyncService.adminLogout(sessionToken);
    }

    // Clear cookie
    res.clearCookie('admin_session');

    return res.json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    console.error('❌ Admin logout endpoint error:', error);
    return res.status(500).json({
      success: false,
      message: 'Logout failed',
      error: error.message
    });
  }
});

// =======================================================================
// 📊 DASHBOARD DATA ENDPOINTS
// =======================================================================

// Get dashboard statistics
router.get('/dashboard/stats', AutoSyncMiddleware.adminAuth, async (req, res) => {
  try {
    const result = await AutoSyncService.getDashboardStats();

    if (result.success) {
      return res.json({
        success: true,
        data: result.stats
      });
    } else {
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch dashboard stats',
        error: result.error
      });
    }
  } catch (error) {
    console.error('❌ Dashboard stats endpoint error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// Get recent orders
router.get('/dashboard/orders', AutoSyncMiddleware.adminAuth, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const result = await AutoSyncService.getRecentOrders(limit);

    if (result.success) {
      return res.json({
        success: true,
        data: result.orders
      });
    } else {
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch recent orders',
        error: result.error
      });
    }
  } catch (error) {
    console.error('❌ Recent orders endpoint error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// Get top products
router.get('/dashboard/products', AutoSyncMiddleware.adminAuth, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const result = await AutoSyncService.getTopProducts(limit);

    if (result.success) {
      return res.json({
        success: true,
        data: result.products
      });
    } else {
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch top products',
        error: result.error
      });
    }
  } catch (error) {
    console.error('❌ Top products endpoint error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// =======================================================================
// 🔧 SYSTEM HEALTH ENDPOINTS
// =======================================================================

// System health check
router.get('/health', AutoSyncMiddleware.healthCheck);

// Detailed system status (admin only)
router.get('/system-status', AutoSyncMiddleware.adminAuth, async (req, res) => {
  try {
    const result = await AutoSyncService.systemHealthCheck();
    return res.json(result);
  } catch (error) {
    console.error('❌ System status endpoint error:', error);
    return res.status(500).json({
      success: false,
      message: 'System status check failed',
      error: error.message
    });
  }
});

module.exports = router;
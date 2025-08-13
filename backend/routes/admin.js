// RitZone Admin Routes
// ==============================================
// Admin panel routes with database integration

const express = require('express');
const bcrypt = require('bcryptjs');
const { environment } = require('../config/environment');
const { 
  adminAuthService, 
  adminDashboardService, 
  adminActivityService 
} = require('../services/admin-service');

const router = express.Router();

// ==============================================
// 🔐 ADMIN AUTHENTICATION ROUTES
// ==============================================

// Admin Login
router.post('/auth/login', async (req, res) => {
  try {
    const { email, password, rememberMe } = req.body;
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent');

    // Basic validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Perform admin login
    const result = await adminAuthService.login(email, password, rememberMe, ipAddress, userAgent);

    if (!result.success) {
      return res.status(401).json({
        success: false,
        message: result.error
      });
    }

    // Set secure cookie for session token
    const cookieOptions = {
      httpOnly: true,
      secure: environment.server.nodeEnv === 'production',
      sameSite: 'lax',
      maxAge: rememberMe ? 30 * 24 * 60 * 60 * 1000 : 8 * 60 * 60 * 1000 // 30 days or 8 hours
    };

    res.cookie('admin_session', result.tokens.sessionToken, cookieOptions);

    if (result.tokens.refreshToken) {
      res.cookie('admin_refresh', result.tokens.refreshToken, {
        ...cookieOptions,
        maxAge: 90 * 24 * 60 * 60 * 1000 // 90 days
      });
    }

    res.status(200).json({
      success: true,
      message: 'Admin login successful',
      user: result.user,
      sessionToken: result.tokens.sessionToken
    });

  } catch (error) {
    console.error('❌ Admin login error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: environment.isDevelopment() ? error.message : undefined
    });
  }
});

// Admin Logout
router.post('/auth/logout', authenticateAdmin, async (req, res) => {
  try {
    const token = req.adminToken;
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent');

    await adminAuthService.logout(token, ipAddress, userAgent);

    // Clear cookies
    res.clearCookie('admin_session');
    res.clearCookie('admin_refresh');

    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });

  } catch (error) {
    console.error('❌ Admin logout error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Logout failed'
    });
  }
});

// Validate Admin Session
router.get('/auth/validate', async (req, res) => {
  try {
    const token = req.cookies.admin_session || req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No session token provided'
      });
    }

    const result = await adminAuthService.validateSession(token);

    if (!result.success) {
      return res.status(401).json({
        success: false,
        message: result.error
      });
    }

    res.status(200).json({
      success: true,
      user: result.user
    });

  } catch (error) {
    console.error('❌ Session validation error:', error.message);
    res.status(401).json({
      success: false,
      message: 'Session validation failed'
    });
  }
});

// Refresh Admin Token
router.post('/auth/refresh', async (req, res) => {
  try {
    const refreshToken = req.cookies.admin_refresh || req.body.refreshToken;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token is required'
      });
    }

    const result = await adminAuthService.refreshToken(refreshToken);

    if (!result.success) {
      return res.status(401).json({
        success: false,
        message: result.error
      });
    }

    // Set new session cookie
    const cookieOptions = {
      httpOnly: true,
      secure: environment.server.nodeEnv === 'production',
      sameSite: 'lax',
      maxAge: 8 * 60 * 60 * 1000 // 8 hours
    };

    res.cookie('admin_session', result.sessionToken, cookieOptions);

    res.status(200).json({
      success: true,
      message: 'Token refreshed successfully',
      user: result.user,
      sessionToken: result.sessionToken
    });

  } catch (error) {
    console.error('❌ Token refresh error:', error.message);
    res.status(401).json({
      success: false,
      message: 'Token refresh failed'
    });
  }
});

// ==============================================
// 📊 ADMIN DASHBOARD ROUTES
// ==============================================

// Get Dashboard Stats
router.get('/dashboard/stats', authenticateAdmin, async (req, res) => {
  try {
    const result = await adminDashboardService.getDashboardStats();

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: result.error
      });
    }

    res.status(200).json({
      success: true,
      stats: result.stats
    });

  } catch (error) {
    console.error('❌ Get dashboard stats error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard stats'
    });
  }
});

// Get Recent Orders
router.get('/dashboard/recent-orders', authenticateAdmin, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const result = await adminDashboardService.getRecentOrders(limit);

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: result.error
      });
    }

    res.status(200).json({
      success: true,
      orders: result.orders
    });

  } catch (error) {
    console.error('❌ Get recent orders error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch recent orders'
    });
  }
});

// Get Top Products
router.get('/dashboard/top-products', authenticateAdmin, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const result = await adminDashboardService.getTopProducts(limit);

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: result.error
      });
    }

    res.status(200).json({
      success: true,
      products: result.products
    });

  } catch (error) {
    console.error('❌ Get top products error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch top products'
    });
  }
});

// Get Sales Chart Data
router.get('/dashboard/sales-chart', authenticateAdmin, async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const result = await adminDashboardService.getSalesChart(days);

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: result.error
      });
    }

    res.status(200).json({
      success: true,
      chartData: result.chartData
    });

  } catch (error) {
    console.error('❌ Get sales chart error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch sales chart data'
    });
  }
});

// ==============================================
// 📝 ADMIN ACTIVITY ROUTES
// ==============================================

// Get Activity Logs
router.get('/activity-logs', authenticateAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const adminUserId = req.query.admin_user_id || null;

    const result = await adminActivityService.getActivityLogs(page, limit, adminUserId);

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: result.error
      });
    }

    res.status(200).json({
      success: true,
      logs: result.logs,
      pagination: {
        currentPage: result.currentPage,
        totalPages: result.totalPages,
        totalCount: result.totalCount
      }
    });

  } catch (error) {
    console.error('❌ Get activity logs error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch activity logs'
    });
  }
});

// ==============================================
// 🔒 ADMIN AUTHENTICATION MIDDLEWARE
// ==============================================
async function authenticateAdmin(req, res, next) {
  try {
    const token = req.cookies.admin_session || req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Admin authentication required'
      });
    }

    const result = await adminAuthService.validateSession(token);

    if (!result.success) {
      return res.status(401).json({
        success: false,
        message: result.error
      });
    }

    // Attach admin user info to request
    req.adminUser = result.user;
    req.adminSession = result.session;
    req.adminToken = token;

    next();

  } catch (error) {
    console.error('❌ Admin authentication error:', error.message);
    return res.status(401).json({
      success: false,
      message: 'Invalid admin session'
    });
  }
}

// ==============================================
// 🛡️ ROLE-BASED ACCESS CONTROL MIDDLEWARE
// ==============================================
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.adminUser || !roles.includes(req.adminUser.role)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
    }
    next();
  };
}

// Export middleware for use in other routes
router.authenticateAdmin = authenticateAdmin;
router.requireRole = requireRole;

module.exports = router;
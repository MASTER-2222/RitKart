// RitZone Admin Users Management Routes
// ==============================================
// Advanced user management with bulk operations and order tracking

const express = require('express');
const { adminUsersService } = require('../services/admin-users-service');

const router = express.Router();

// Import admin authentication middleware
const { authenticateAdmin, requireRole } = require('./admin');
const AutoSyncMiddleware = require('../middleware/auto-sync-middleware');

// ==============================================
// 👥 USER MANAGEMENT ROUTES
// ==============================================

// Get all users with pagination and search
router.get('/users', AutoSyncMiddleware.adminAuth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search = '',
      sortBy = 'created_at',
      sortOrder = 'desc',
      status = 'all'
    } = req.query;

    const result = await adminUsersService.getUsers({
      page: parseInt(page),
      limit: parseInt(limit),
      search,
      sortBy,
      sortOrder,
      status
    });

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: result.error
      });
    }

    res.status(200).json({
      success: true,
      data: result.users,
      pagination: {
        currentPage: result.currentPage,
        totalPages: result.totalPages,
        totalUsers: result.totalUsers,
        limit: result.limit
      }
    });

  } catch (error) {
    console.error('❌ Get users error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users'
    });
  }
});

// Get user details with order history
router.get('/users/:userId', authenticateAdmin, async (req, res) => {
  try {
    const { userId } = req.params;

    const result = await adminUsersService.getUserDetails(userId);

    if (!result.success) {
      return res.status(404).json({
        success: false,
        message: result.error
      });
    }

    res.status(200).json({
      success: true,
      data: result.user
    });

  } catch (error) {
    console.error('❌ Get user details error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user details'
    });
  }
});

// Create new user
router.post('/users', authenticateAdmin, requireRole('super_admin', 'admin'), async (req, res) => {
  try {
    const userData = req.body;
    const adminUserId = req.adminUser.id;

    const result = await adminUsersService.createUser(userData, adminUserId);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error
      });
    }

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: result.user
    });

  } catch (error) {
    console.error('❌ Create user error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to create user'
    });
  }
});

// Update user
router.put('/users/:userId', authenticateAdmin, requireRole('super_admin', 'admin'), async (req, res) => {
  try {
    const { userId } = req.params;
    const updateData = req.body;
    const adminUserId = req.adminUser.id;

    const result = await adminUsersService.updateUser(userId, updateData, adminUserId);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error
      });
    }

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: result.user
    });

  } catch (error) {
    console.error('❌ Update user error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to update user'
    });
  }
});

// Delete single user
router.delete('/users/:userId', authenticateAdmin, requireRole('super_admin', 'admin'), async (req, res) => {
  try {
    const { userId } = req.params;
    const adminUserId = req.adminUser.id;

    const result = await adminUsersService.deleteUser(userId, adminUserId);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error
      });
    }

    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });

  } catch (error) {
    console.error('❌ Delete user error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to delete user'
    });
  }
});

// ==============================================
// 📦 BULK OPERATIONS
// ==============================================

// Bulk delete users
router.post('/users/bulk-delete', authenticateAdmin, requireRole('super_admin', 'admin'), async (req, res) => {
  try {
    const { userIds } = req.body;
    const adminUserId = req.adminUser.id;

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'User IDs array is required'
      });
    }

    const result = await adminUsersService.bulkDeleteUsers(userIds, adminUserId);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error
      });
    }

    res.status(200).json({
      success: true,
      message: `Successfully deleted ${result.deletedCount} users`,
      data: {
        deletedCount: result.deletedCount,
        failedCount: result.failedCount,
        errors: result.errors
      }
    });

  } catch (error) {
    console.error('❌ Bulk delete error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to delete users'
    });
  }
});

// Bulk update users
router.post('/users/bulk-update', authenticateAdmin, requireRole('super_admin', 'admin'), async (req, res) => {
  try {
    const { userIds, updateData } = req.body;
    const adminUserId = req.adminUser.id;

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'User IDs array is required'
      });
    }

    if (!updateData || Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Update data is required'
      });
    }

    const result = await adminUsersService.bulkUpdateUsers(userIds, updateData, adminUserId);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error
      });
    }

    res.status(200).json({
      success: true,
      message: `Successfully updated ${result.updatedCount} users`,
      data: {
        updatedCount: result.updatedCount,
        failedCount: result.failedCount,
        errors: result.errors
      }
    });

  } catch (error) {
    console.error('❌ Bulk update error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to update users'
    });
  }
});

// ==============================================
// 📋 ORDER TRACKING ROUTES
// ==============================================

// Get user's order history
router.get('/users/:userId/orders', authenticateAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    const {
      page = 1,
      limit = 10,
      status = 'all',
      dateFrom,
      dateTo
    } = req.query;

    const result = await adminUsersService.getUserOrders(userId, {
      page: parseInt(page),
      limit: parseInt(limit),
      status,
      dateFrom,
      dateTo
    });

    if (!result.success) {
      return res.status(404).json({
        success: false,
        message: result.error
      });
    }

    res.status(200).json({
      success: true,
      data: result.orders,
      pagination: {
        currentPage: result.currentPage,
        totalPages: result.totalPages,
        totalOrders: result.totalOrders,
        limit: result.limit
      }
    });

  } catch (error) {
    console.error('❌ Get user orders error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user orders'
    });
  }
});

// Update order status
router.put('/orders/:orderId/status', authenticateAdmin, requireRole('super_admin', 'admin'), async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, notes } = req.body;
    const adminUserId = req.adminUser.id;

    const result = await adminUsersService.updateOrderStatus(orderId, status, notes, adminUserId);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error
      });
    }

    res.status(200).json({
      success: true,
      message: 'Order status updated successfully',
      data: result.order
    });

  } catch (error) {
    console.error('❌ Update order status error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to update order status'
    });
  }
});

// ==============================================
// 📧 NOTIFICATION ROUTES
// ==============================================

// Send notification to user
router.post('/users/:userId/notify', authenticateAdmin, requireRole('super_admin', 'admin'), async (req, res) => {
  try {
    const { userId } = req.params;
    const { type, title, message, orderId } = req.body;
    const adminUserId = req.adminUser.id;

    const result = await adminUsersService.sendUserNotification(userId, {
      type,
      title,
      message,
      orderId
    }, adminUserId);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error
      });
    }

    res.status(200).json({
      success: true,
      message: 'Notification sent successfully',
      data: result.notification
    });

  } catch (error) {
    console.error('❌ Send notification error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to send notification'
    });
  }
});

// Bulk send notifications
router.post('/users/bulk-notify', authenticateAdmin, requireRole('super_admin', 'admin'), async (req, res) => {
  try {
    const { userIds, type, title, message } = req.body;
    const adminUserId = req.adminUser.id;

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'User IDs array is required'
      });
    }

    const result = await adminUsersService.bulkSendNotifications(userIds, {
      type,
      title,
      message
    }, adminUserId);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error
      });
    }

    res.status(200).json({
      success: true,
      message: `Notifications sent to ${result.sentCount} users`,
      data: {
        sentCount: result.sentCount,
        failedCount: result.failedCount,
        errors: result.errors
      }
    });

  } catch (error) {
    console.error('❌ Bulk notify error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to send notifications'
    });
  }
});

// ==============================================
// 📊 STATISTICS ROUTES
// ==============================================

// Get user statistics
router.get('/users/stats', authenticateAdmin, async (req, res) => {
  try {
    const result = await adminUsersService.getUserStats();

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: result.error
      });
    }

    res.status(200).json({
      success: true,
      data: result.stats
    });

  } catch (error) {
    console.error('❌ Get user stats error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user statistics'
    });
  }
});

module.exports = router;
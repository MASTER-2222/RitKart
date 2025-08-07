// RitZone Order Routes
// ==============================================
// Order management using Supabase with environment variables

const express = require('express');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { environment } = require('../config/environment');
const { orderService } = require('../services/supabase-service');

const router = express.Router();

// ==============================================
// 🔒 AUTHENTICATION MIDDLEWARE
// ==============================================
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access token is required'
    });
  }

  jwt.verify(token, environment.security.jwtSecret, (error, user) => {
    if (error) {
      return res.status(403).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }
    req.user = user;
    next();
  });
}

// ==============================================
// 📋 GET USER'S ORDERS
// ==============================================
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const result = await orderService.getUserOrders(userId, page, limit);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error
      });
    }

    res.status(200).json({
      success: true,
      message: 'Orders retrieved successfully',
      data: result.orders,
      pagination: {
        currentPage: result.currentPage,
        totalPages: result.totalPages,
        totalCount: result.totalCount,
        limit: limit
      }
    });

  } catch (error) {
    console.error('❌ Get orders error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve orders',
      error: environment.isDevelopment() ? error.message : undefined
    });
  }
});

// ==============================================
// 🛍️ CREATE NEW ORDER
// ==============================================
router.post('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { 
      shippingAddress, 
      billingAddress, 
      paymentMethod, 
      notes,
      discountAmount 
    } = req.body;

    // Basic validation
    if (!shippingAddress || !billingAddress) {
      return res.status(400).json({
        success: false,
        message: 'Shipping and billing addresses are required'
      });
    }

    // Validate required address fields
    const requiredFields = ['full_name', 'address_line1', 'city', 'state', 'postal_code', 'country'];
    for (const field of requiredFields) {
      if (!shippingAddress[field] || !billingAddress[field]) {
        return res.status(400).json({
          success: false,
          message: `Missing required address field: ${field}`
        });
      }
    }

    const orderData = {
      shippingAddress,
      billingAddress,
      paymentMethod: paymentMethod || 'card',
      notes,
      discountAmount: discountAmount || 0
    };

    const result = await orderService.createOrder(userId, orderData);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error
      });
    }

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: result.order
    });

  } catch (error) {
    console.error('❌ Create order error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to create order',
      error: environment.isDevelopment() ? error.message : undefined
    });
  }
});

// ==============================================
// 🔍 GET ORDER BY ID
// ==============================================
router.get('/:orderId', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const orderId = req.params.orderId;

    const result = await orderService.getOrderById(orderId, userId);

    if (!result.success) {
      return res.status(404).json({
        success: false,
        message: result.error
      });
    }

    res.status(200).json({
      success: true,
      message: 'Order retrieved successfully',
      data: result.order
    });

  } catch (error) {
    console.error('❌ Get order error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve order',
      error: environment.isDevelopment() ? error.message : undefined
    });
  }
});

// ==============================================
// ❌ CANCEL ORDER
// ==============================================
router.put('/:orderId/cancel', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const orderId = req.params.orderId;
    const { reason } = req.body;

    const result = await orderService.cancelOrder(orderId, userId, reason);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error
      });
    }

    res.status(200).json({
      success: true,
      message: result.message
    });

  } catch (error) {
    console.error('❌ Cancel order error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel order',
      error: environment.isDevelopment() ? error.message : undefined
    });
  }
});

module.exports = router;
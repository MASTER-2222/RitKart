// RitZone Cart Routes
// ==============================================
// Shopping cart management using Supabase with environment variables

const express = require('express');
const jwt = require('jsonwebtoken');
const { environment } = require('../config/environment');
const { cartService } = require('../services/supabase-service');

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
// 🛒 GET USER'S CART
// ==============================================
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    const result = await cartService.getUserCart(userId);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error
      });
    }

    res.status(200).json({
      success: true,
      message: 'Cart retrieved successfully',
      data: result.cart || { items: [], total: 0 }
    });

  } catch (error) {
    console.error('❌ Get cart error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve cart',
      error: environment.isDevelopment() ? error.message : undefined
    });
  }
});

// ==============================================
// ➕ ADD ITEM TO CART
// ==============================================
router.post('/add', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { productId, quantity = 1 } = req.body;

    // Basic validation
    if (!productId) {
      return res.status(400).json({
        success: false,
        message: 'Product ID is required'
      });
    }

    if (quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be greater than 0'
      });
    }

    const result = await cartService.addToCart(userId, productId, quantity);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error
      });
    }

    res.status(200).json({
      success: true,
      message: 'Item added to cart successfully',
      data: result.cartItem
    });

  } catch (error) {
    console.error('❌ Add to cart error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to add item to cart',
      error: environment.isDevelopment() ? error.message : undefined
    });
  }
});

// ==============================================
// 🔄 UPDATE CART ITEM
// ==============================================
router.put('/items/:itemId', authenticateToken, async (req, res) => {
  try {
    const itemId = req.params.itemId;
    const { quantity } = req.body;

    // Basic validation
    if (!quantity || quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid quantity is required'
      });
    }

    // This would need to be implemented in the cartService
    res.status(200).json({
      success: true,
      message: 'Update cart item functionality coming soon',
      itemId: itemId,
      quantity: quantity
    });

  } catch (error) {
    console.error('❌ Update cart item error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to update cart item',
      error: environment.isDevelopment() ? error.message : undefined
    });
  }
});

// ==============================================
// ❌ REMOVE ITEM FROM CART
// ==============================================
router.delete('/items/:itemId', authenticateToken, async (req, res) => {
  try {
    const itemId = req.params.itemId;

    // This would need to be implemented in the cartService
    res.status(200).json({
      success: true,
      message: 'Remove cart item functionality coming soon',
      itemId: itemId
    });

  } catch (error) {
    console.error('❌ Remove cart item error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to remove cart item',
      error: environment.isDevelopment() ? error.message : undefined
    });
  }
});

// ==============================================
// 🗑️ CLEAR CART
// ==============================================
router.delete('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    // This would need to be implemented in the cartService
    res.status(200).json({
      success: true,
      message: 'Clear cart functionality coming soon',
      userId: userId
    });

  } catch (error) {
    console.error('❌ Clear cart error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to clear cart',
      error: environment.isDevelopment() ? error.message : undefined
    });
  }
});

module.exports = router;
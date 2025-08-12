// RitZone Cart Routes
// ==============================================
// Shopping cart management using Supabase with environment variables

const express = require('express');
const { environment } = require('../config/environment');
const { cartService } = require('../services/supabase-service');
const { authenticateToken } = require('../middleware/enhanced-auth');

const router = express.Router();

// ==============================================
// 🔒 ENHANCED AUTHENTICATION MIDDLEWARE
// Remove old middleware - using new enhanced version
// ==============================================

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

    // Transform cart data to expected format
    let cartData = { cart_items: [], total_amount: 0, currency: 'CAD' };
    
    if (result.cart) {
      cartData = {
        id: result.cart.id,
        user_id: result.cart.user_id,
        cart_items: result.cart.cart_items || [],
        total_amount: result.cart.total_amount || 0,
        currency: 'CAD', // Test with CAD instead of INR
        status: result.cart.status
      };
    }

    res.status(200).json({
      success: true,
      message: 'Cart retrieved successfully',
      data: cartData
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
    const userId = req.user.userId;

    // Basic validation
    if (!quantity || quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid quantity is required'
      });
    }

    const result = await cartService.updateCartItem(itemId, quantity, userId);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error
      });
    }

    res.status(200).json({
      success: true,
      message: 'Cart item updated successfully',
      data: result.cartItem
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
    const userId = req.user.userId;

    const result = await cartService.removeCartItem(itemId, userId);

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

    const result = await cartService.clearCart(userId);

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
    console.error('❌ Clear cart error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to clear cart',
      error: environment.isDevelopment() ? error.message : undefined
    });
  }
});

module.exports = router;
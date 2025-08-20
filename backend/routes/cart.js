// RitZone Cart Routes
// ==============================================
// Shopping cart management using Supabase with environment variables

const express = require('express');
const { environment } = require('../config/environment');
const { cartService, getSupabaseClient } = require('../services/supabase-service');
const AutoSyncMiddleware = require('../middleware/auto-sync-middleware');
// NEW: Import currency service for dynamic currency conversion
const { 
  convertPrice, 
  getCurrencySymbol, 
  formatPrice 
} = require('../services/currency-service');

const router = express.Router();

// ==============================================
// 🔒 SUPABASE AUTHENTICATION MIDDLEWARE
// ==============================================
async function authenticateSupabaseToken(req, res, next) {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token is required'
      });
    }

    const client = getSupabaseClient();
    
    // Verify Supabase token and get user
    const { data: { user }, error } = await client.auth.getUser(token);
    
    if (error || !user) {
      return res.status(403).json({
        success: false,
        message: 'Invalid or expired token'
      });
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
      // Attach synced user to request object
      req.user = { userId: user.id, email: user.email };
      req.syncedUser = syncResult.user;
      req.supabaseUser = user;
    } else {
      return res.status(500).json({
        success: false,
        message: 'User synchronization failed'
      });
    }

    next();
  } catch (error) {
    console.error('❌ Supabase auth middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authentication error'
    });
  }
}

const router = express.Router();

// ==============================================
// 💰 HELPER FUNCTION: CONVERT CART PRICES
// ==============================================
async function convertCartPrices(cartData, targetCurrency = 'INR') {
  if (!cartData || targetCurrency === 'INR') {
    // Return as-is if no conversion needed or target is base currency
    return {
      ...cartData,
      currency: targetCurrency,
      currency_symbol: getCurrencySymbol(targetCurrency)
    };
  }
  
  try {
    console.log(`💱 Converting cart prices to ${targetCurrency}`);
    
    // Convert cart items prices
    const convertedCartItems = await Promise.all(
      (cartData.cart_items || []).map(async (item) => {
        const convertedItem = { ...item };
        
        // Convert product price
        if (item.products && item.products.price) {
          convertedItem.products.price = await convertPrice(item.products.price, 'INR', targetCurrency);
          convertedItem.products.original_price = item.products.original_price 
            ? await convertPrice(item.products.original_price, 'INR', targetCurrency)
            : null;
          
          // Add currency metadata to product
          convertedItem.products.currency = targetCurrency;
          convertedItem.products.currency_symbol = getCurrencySymbol(targetCurrency);
          convertedItem.products.formatted_price = formatPrice(convertedItem.products.price, targetCurrency);
          convertedItem.products.base_currency = 'INR';
        }
        
        // Convert item total_price if exists
        if (item.total_price) {
          convertedItem.total_price = await convertPrice(item.total_price, 'INR', targetCurrency);
        }
        
        return convertedItem;
      })
    );
    
    // Convert total amount
    const convertedTotalAmount = cartData.total_amount 
      ? await convertPrice(cartData.total_amount, 'INR', targetCurrency)
      : 0;
    
    return {
      ...cartData,
      cart_items: convertedCartItems,
      total_amount: convertedTotalAmount,
      currency: targetCurrency,
      currency_symbol: getCurrencySymbol(targetCurrency),
      formatted_total: formatPrice(convertedTotalAmount, targetCurrency),
      base_currency: 'INR',
      base_total_amount: cartData.total_amount
    };
  } catch (error) {
    console.error('❌ Error converting cart prices:', error);
    // Return original cart data if conversion fails
    return {
      ...cartData,
      currency: 'INR',
      currency_symbol: getCurrencySymbol('INR')
    };
  }
}

// ==============================================
// 🔒 ENHANCED AUTHENTICATION MIDDLEWARE
// Remove old middleware - using new enhanced version
// ==============================================

// ==============================================
// 🛒 GET USER'S CART (WITH DYNAMIC CURRENCY)
// ==============================================
router.get('/', authenticateSupabaseToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const currency = req.query.currency || 'INR'; // NEW: Support currency parameter

    const result = await cartService.getUserCart(userId);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error
      });
    }

    // Transform cart data to expected format
    let cartData = { cart_items: [], total_amount: 0, currency: 'INR' };
    
    if (result.cart) {
      cartData = {
        id: result.cart.id,
        user_id: result.cart.user_id,
        cart_items: result.cart.cart_items || [],
        total_amount: result.cart.total_amount || 0,
        currency: result.cart.currency || 'INR',
        status: result.cart.status
      };
    }

    // NEW: Convert prices to requested currency
    const convertedCartData = await convertCartPrices(cartData, currency);

    res.status(200).json({
      success: true,
      message: `Cart retrieved successfully${currency !== 'INR' ? ` with prices in ${currency}` : ''}`,
      data: convertedCartData
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
router.post('/add', authenticateSupabaseToken, async (req, res) => {
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
router.put('/items/:itemId', authenticateSupabaseToken, async (req, res) => {
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
router.delete('/items/:itemId', authenticateSupabaseToken, async (req, res) => {
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
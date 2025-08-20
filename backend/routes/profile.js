// RitZone Profile Management Routes
// ==============================================
// Comprehensive user profile management with addresses, payment methods, wishlist, and dashboard

const express = require('express');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { environment } = require('../config/environment');
const { 
  userService, 
  orderService, 
  cartService,
  getSupabaseClient 
} = require('../services/supabase-service');
const AutoSyncMiddleware = require('../middleware/auto-sync-middleware');

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

// ==============================================
// 📊 DASHBOARD STATISTICS
// ==============================================
router.get('/dashboard', authenticateSupabaseToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const client = getSupabaseClient();

    // Get user info
    const { data: user, error: userError } = await client
      .from('users')
      .select('full_name, created_at')
      .eq('id', userId)
      .single();

    if (userError) throw userError;

    // Get order statistics
    const { data: orders, error: ordersError } = await client
      .from('orders')
      .select('status, total_amount')
      .eq('user_id', userId);

    if (ordersError) throw ordersError;

    // Get cart items count
    const { data: cartItems, error: cartError } = await client
      .from('cart_items')
      .select('id, carts!inner(user_id)')
      .eq('carts.user_id', userId);

    if (cartError) {
      console.warn('Cart items fetch failed:', cartError.message);
    }

    // Get wishlist count
    const { data: wishlistItems, error: wishlistError } = await client
      .from('user_wishlist')
      .select('id')
      .eq('user_id', userId);

    if (wishlistError) {
      console.warn('Wishlist fetch failed:', wishlistError.message);
    }

    // Calculate statistics
    const totalOrders = orders?.length || 0;
    const activeDeliveries = orders?.filter(o => ['processing', 'shipped'].includes(o.status)).length || 0;
    const completedOrders = orders?.filter(o => o.status === 'delivered').length || 0;
    const totalSpent = orders?.reduce((sum, order) => sum + parseFloat(order.total_amount || 0), 0) || 0;
    const cartItemsCount = cartItems?.length || 0;
    const wishlistCount = wishlistItems?.length || 0;

    // Get recent orders
    const { data: recentOrders, error: recentOrdersError } = await client
      .from('orders')
      .select(`
        id,
        order_number,
        status,
        total_amount,
        created_at,
        order_items (
          quantity,
          product_name,
          products (
            name,
            images
          )
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(3);

    if (recentOrdersError) {
      console.warn('Recent orders fetch failed:', recentOrdersError.message);
    }

    const dashboardData = {
      user: {
        name: user.full_name || 'User',
        memberSince: user.created_at
      },
      stats: {
        totalOrders,
        activeDeliveries,
        completedOrders,
        totalSpent,
        cartItems: cartItemsCount,
        wishlistItems: wishlistCount
      },
      recentOrders: recentOrders || []
    };

    res.status(200).json({
      success: true,
      message: 'Dashboard data retrieved successfully',
      data: dashboardData
    });

  } catch (error) {
    console.error('❌ Get dashboard error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve dashboard data',
      error: environment.isDevelopment() ? error.message : undefined
    });
  }
});

// ==============================================
// 📮 ADDRESS MANAGEMENT
// ==============================================

// Get user addresses
router.get('/addresses', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const client = getSupabaseClient();

    const { data: addresses, error } = await client
      .from('user_addresses')
      .select('*')
      .eq('user_id', userId)
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.status(200).json({
      success: true,
      message: 'Addresses retrieved successfully',
      data: addresses || []
    });

  } catch (error) {
    console.error('❌ Get addresses error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve addresses',
      error: environment.isDevelopment() ? error.message : undefined
    });
  }
});

// Add new address
router.post('/addresses', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { type, name, street, city, state, zip_code, country, phone, is_default } = req.body;
    const client = getSupabaseClient();

    // Validation
    if (!name || !street || !city || !state || !zip_code) {
      return res.status(400).json({
        success: false,
        message: 'Name, street, city, state, and zip code are required'
      });
    }

    const addressData = {
      user_id: userId,
      type: type || 'home',
      name,
      street,
      city,
      state,
      zip_code,
      country: country || 'United States',
      phone,
      is_default: is_default || false
    };

    const { data: address, error } = await client
      .from('user_addresses')
      .insert([addressData])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({
      success: true,
      message: 'Address added successfully',
      data: address
    });

  } catch (error) {
    console.error('❌ Add address error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to add address',
      error: environment.isDevelopment() ? error.message : undefined
    });
  }
});

// Update address
router.put('/addresses/:addressId', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const addressId = req.params.addressId;
    const updateData = req.body;
    const client = getSupabaseClient();

    // Verify ownership
    const { data: existingAddress, error: checkError } = await client
      .from('user_addresses')
      .select('user_id')
      .eq('id', addressId)
      .single();

    if (checkError || !existingAddress) {
      return res.status(404).json({
        success: false,
        message: 'Address not found'
      });
    }

    if (existingAddress.user_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to update this address'
      });
    }

    const { data: address, error } = await client
      .from('user_addresses')
      .update(updateData)
      .eq('id', addressId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;

    res.status(200).json({
      success: true,
      message: 'Address updated successfully',
      data: address
    });

  } catch (error) {
    console.error('❌ Update address error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to update address',
      error: environment.isDevelopment() ? error.message : undefined
    });
  }
});

// Delete address
router.delete('/addresses/:addressId', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const addressId = req.params.addressId;
    const client = getSupabaseClient();

    // Verify ownership
    const { data: existingAddress, error: checkError } = await client
      .from('user_addresses')
      .select('user_id')
      .eq('id', addressId)
      .single();

    if (checkError || !existingAddress) {
      return res.status(404).json({
        success: false,
        message: 'Address not found'
      });
    }

    if (existingAddress.user_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to delete this address'
      });
    }

    const { error } = await client
      .from('user_addresses')
      .delete()
      .eq('id', addressId)
      .eq('user_id', userId);

    if (error) throw error;

    res.status(200).json({
      success: true,
      message: 'Address deleted successfully'
    });

  } catch (error) {
    console.error('❌ Delete address error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to delete address',
      error: environment.isDevelopment() ? error.message : undefined
    });
  }
});

// ==============================================
// 💳 PAYMENT METHODS MANAGEMENT
// ==============================================

// Get user payment methods
router.get('/payment-methods', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const client = getSupabaseClient();

    const { data: paymentMethods, error } = await client
      .from('user_payment_methods')
      .select('*')
      .eq('user_id', userId)
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.status(200).json({
      success: true,
      message: 'Payment methods retrieved successfully',
      data: paymentMethods || []
    });

  } catch (error) {
    console.error('❌ Get payment methods error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve payment methods',
      error: environment.isDevelopment() ? error.message : undefined
    });
  }
});

// Add new payment method
router.post('/payment-methods', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { type, name, details, last_four, expiry_date, is_default } = req.body;
    const client = getSupabaseClient();

    // Validation
    if (!name || !details) {
      return res.status(400).json({
        success: false,
        message: 'Name and details are required'
      });
    }

    const paymentMethodData = {
      user_id: userId,
      type: type || 'card',
      name,
      details,
      last_four,
      expiry_date,
      is_default: is_default || false
    };

    const { data: paymentMethod, error } = await client
      .from('user_payment_methods')
      .insert([paymentMethodData])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({
      success: true,
      message: 'Payment method added successfully',
      data: paymentMethod
    });

  } catch (error) {
    console.error('❌ Add payment method error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to add payment method',
      error: environment.isDevelopment() ? error.message : undefined
    });
  }
});

// Update payment method
router.put('/payment-methods/:paymentMethodId', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const paymentMethodId = req.params.paymentMethodId;
    const updateData = req.body;
    const client = getSupabaseClient();

    // Verify ownership
    const { data: existingMethod, error: checkError } = await client
      .from('user_payment_methods')
      .select('user_id')
      .eq('id', paymentMethodId)
      .single();

    if (checkError || !existingMethod) {
      return res.status(404).json({
        success: false,
        message: 'Payment method not found'
      });
    }

    if (existingMethod.user_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to update this payment method'
      });
    }

    const { data: paymentMethod, error } = await client
      .from('user_payment_methods')
      .update(updateData)
      .eq('id', paymentMethodId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;

    res.status(200).json({
      success: true,
      message: 'Payment method updated successfully',
      data: paymentMethod
    });

  } catch (error) {
    console.error('❌ Update payment method error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to update payment method',
      error: environment.isDevelopment() ? error.message : undefined
    });
  }
});

// Delete payment method
router.delete('/payment-methods/:paymentMethodId', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const paymentMethodId = req.params.paymentMethodId;
    const client = getSupabaseClient();

    // Verify ownership
    const { data: existingMethod, error: checkError } = await client
      .from('user_payment_methods')
      .select('user_id')
      .eq('id', paymentMethodId)
      .single();

    if (checkError || !existingMethod) {
      return res.status(404).json({
        success: false,
        message: 'Payment method not found'
      });
    }

    if (existingMethod.user_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to delete this payment method'
      });
    }

    const { error } = await client
      .from('user_payment_methods')
      .delete()
      .eq('id', paymentMethodId)
      .eq('user_id', userId);

    if (error) throw error;

    res.status(200).json({
      success: true,
      message: 'Payment method deleted successfully'
    });

  } catch (error) {
    console.error('❌ Delete payment method error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to delete payment method',
      error: environment.isDevelopment() ? error.message : undefined
    });
  }
});

// ==============================================
// ❤️ WISHLIST MANAGEMENT
// ==============================================

// Get user wishlist
router.get('/wishlist', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const client = getSupabaseClient();

    const { data: wishlistItems, error } = await client
      .from('user_wishlist')
      .select(`
        id,
        date_added,
        products (
          id,
          name,
          price,
          original_price,
          images,
          brand,
          rating_average,
          total_reviews,
          stock_quantity,
          is_active
        )
      `)
      .eq('user_id', userId)
      .eq('products.is_active', true)
      .order('date_added', { ascending: false });

    if (error) throw error;

    // Transform data to match frontend expectations
    const transformedWishlist = wishlistItems?.map(item => ({
      id: item.products.id,
      title: item.products.name,
      price: item.products.price,
      originalPrice: item.products.original_price,
      rating: item.products.rating_average,
      reviewCount: item.products.total_reviews,
      image: item.products.images?.[0] || '',
      images: item.products.images,
      brand: item.products.brand,
      inStock: (item.products.stock_quantity || 0) > 0,
      dateAdded: item.date_added,
      wishlistItemId: item.id
    })) || [];

    res.status(200).json({
      success: true,
      message: 'Wishlist retrieved successfully',
      data: transformedWishlist
    });

  } catch (error) {
    console.error('❌ Get wishlist error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve wishlist',
      error: environment.isDevelopment() ? error.message : undefined
    });
  }
});

// Add item to wishlist
router.post('/wishlist', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { product_id } = req.body;
    const client = getSupabaseClient();

    if (!product_id) {
      return res.status(400).json({
        success: false,
        message: 'Product ID is required'
      });
    }

    // Check if already in wishlist
    const { data: existing, error: checkError } = await client
      .from('user_wishlist')
      .select('id')
      .eq('user_id', userId)
      .eq('product_id', product_id)
      .single();

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Product is already in wishlist'
      });
    }

    const { data: wishlistItem, error } = await client
      .from('user_wishlist')
      .insert([{
        user_id: userId,
        product_id: product_id
      }])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({
      success: true,
      message: 'Item added to wishlist successfully',
      data: wishlistItem
    });

  } catch (error) {
    console.error('❌ Add to wishlist error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to add item to wishlist',
      error: environment.isDevelopment() ? error.message : undefined
    });
  }
});

// Remove item from wishlist
router.delete('/wishlist/:productId', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const productId = req.params.productId;
    const client = getSupabaseClient();

    const { error } = await client
      .from('user_wishlist')
      .delete()
      .eq('user_id', userId)
      .eq('product_id', productId);

    if (error) throw error;

    res.status(200).json({
      success: true,
      message: 'Item removed from wishlist successfully'
    });

  } catch (error) {
    console.error('❌ Remove from wishlist error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to remove item from wishlist',
      error: environment.isDevelopment() ? error.message : undefined
    });
  }
});

module.exports = router;
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
        order_items!inner (
          product_name,
          quantity,
          unit_price
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(5);

    if (recentOrdersError) {
      console.warn('Recent orders fetch failed:', recentOrdersError.message);
    }

    res.status(200).json({
      success: true,
      message: 'Dashboard data retrieved successfully',
      data: {
        user: {
          name: user?.full_name || 'User',
          memberSince: user?.created_at || new Date().toISOString()
        },
        stats: {
          totalOrders,
          activeDeliveries,
          completedOrders,
          totalSpent: Math.round(totalSpent * 100) / 100,
          cartItems: cartItemsCount,
          wishlistItems: wishlistCount
        },
        recentOrders: recentOrders || []
      }
    });

  } catch (error) {
    console.error('❌ Dashboard fetch failed:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve dashboard data',
      error: error.message
    });
  }
});

// ==============================================
// 📮 ADDRESS MANAGEMENT
// ==============================================

// Get user addresses
router.get('/addresses', authenticateSupabaseToken, async (req, res) => {
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
    console.error('❌ Get addresses failed:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve addresses',
      error: error.message
    });
  }
});

// Add new address
router.post('/addresses', authenticateSupabaseToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const {
      type,
      first_name,
      last_name,
      company,
      address_line_1,
      address_line_2,
      city,
      state,
      postal_code,
      country,
      phone,
      is_default
    } = req.body;

    const client = getSupabaseClient();

    // If this address is set as default, remove default from other addresses
    if (is_default) {
      await client
        .from('user_addresses')
        .update({ is_default: false })
        .eq('user_id', userId);
    }

    const addressData = {
      id: uuidv4(),
      user_id: userId,
      type: type || 'home',
      first_name,
      last_name,
      company: company || null,
      address_line_1,
      address_line_2: address_line_2 || null,
      city,
      state,
      postal_code,
      country: country || 'US',
      phone: phone || null,
      is_default: is_default || false
    };

    const { data: newAddress, error } = await client
      .from('user_addresses')
      .insert([addressData])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({
      success: true,
      message: 'Address added successfully',
      data: newAddress
    });

  } catch (error) {
    console.error('❌ Add address failed:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to add address',
      error: error.message
    });
  }
});

// Update address
router.put('/addresses/:addressId', authenticateSupabaseToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { addressId } = req.params;
    const {
      type,
      first_name,
      last_name,
      company,
      address_line_1,
      address_line_2,
      city,
      state,
      postal_code,
      country,
      phone,
      is_default
    } = req.body;

    const client = getSupabaseClient();

    // Verify address belongs to user
    const { data: existingAddress, error: checkError } = await client
      .from('user_addresses')
      .select('id')
      .eq('id', addressId)
      .eq('user_id', userId)
      .single();

    if (checkError || !existingAddress) {
      return res.status(404).json({
        success: false,
        message: 'Address not found'
      });
    }

    // If this address is set as default, remove default from other addresses
    if (is_default) {
      await client
        .from('user_addresses')
        .update({ is_default: false })
        .eq('user_id', userId)
        .neq('id', addressId);
    }

    const updateData = {
      type,
      first_name,
      last_name,
      company,
      address_line_1,
      address_line_2,
      city,
      state,
      postal_code,
      country,
      phone,
      is_default,
      updated_at: new Date().toISOString()
    };

    // Remove undefined values
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    const { data: updatedAddress, error } = await client
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
      data: updatedAddress
    });

  } catch (error) {
    console.error('❌ Update address failed:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to update address',
      error: error.message
    });
  }
});

// Delete address
router.delete('/addresses/:addressId', authenticateSupabaseToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { addressId } = req.params;
    const client = getSupabaseClient();

    // Verify address belongs to user and get details
    const { data: existingAddress, error: checkError } = await client
      .from('user_addresses')
      .select('id, is_default')
      .eq('id', addressId)
      .eq('user_id', userId)
      .single();

    if (checkError || !existingAddress) {
      return res.status(404).json({
        success: false,
        message: 'Address not found'
      });
    }

    // Delete the address
    const { error: deleteError } = await client
      .from('user_addresses')
      .delete()
      .eq('id', addressId)
      .eq('user_id', userId);

    if (deleteError) throw deleteError;

    // If deleted address was default, set first remaining address as default
    if (existingAddress.is_default) {
      const { data: remainingAddresses } = await client
        .from('user_addresses')
        .select('id')
        .eq('user_id', userId)
        .limit(1);

      if (remainingAddresses && remainingAddresses.length > 0) {
        await client
          .from('user_addresses')
          .update({ is_default: true })
          .eq('id', remainingAddresses[0].id);
      }
    }

    res.status(200).json({
      success: true,
      message: 'Address deleted successfully'
    });

  } catch (error) {
    console.error('❌ Delete address failed:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to delete address',
      error: error.message
    });
  }
});

// ==============================================
// 💳 PAYMENT METHODS MANAGEMENT
// ==============================================

// Get user payment methods
router.get('/payment-methods', authenticateSupabaseToken, async (req, res) => {
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
    console.error('❌ Get payment methods failed:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve payment methods',
      error: error.message
    });
  }
});

// Add new payment method
router.post('/payment-methods', authenticateSupabaseToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const {
      type,
      card_last4,
      card_brand,
      expiry_month,
      expiry_year,
      cardholder_name,
      billing_address_id,
      is_default
    } = req.body;

    const client = getSupabaseClient();

    // If this payment method is set as default, remove default from others
    if (is_default) {
      await client
        .from('user_payment_methods')
        .update({ is_default: false })
        .eq('user_id', userId);
    }

    const paymentMethodData = {
      id: uuidv4(),
      user_id: userId,
      type: type || 'card',
      card_last4,
      card_brand,
      expiry_month,
      expiry_year,
      cardholder_name,
      billing_address_id: billing_address_id || null,
      is_default: is_default || false
    };

    const { data: newPaymentMethod, error } = await client
      .from('user_payment_methods')
      .insert([paymentMethodData])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({
      success: true,
      message: 'Payment method added successfully',
      data: newPaymentMethod
    });

  } catch (error) {
    console.error('❌ Add payment method failed:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to add payment method',
      error: error.message
    });
  }
});

// Update payment method
router.put('/payment-methods/:paymentMethodId', authenticateSupabaseToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { paymentMethodId } = req.params;
    const {
      cardholder_name,
      expiry_month,
      expiry_year,
      billing_address_id,
      is_default
    } = req.body;

    const client = getSupabaseClient();

    // Verify payment method belongs to user
    const { data: existingPaymentMethod, error: checkError } = await client
      .from('user_payment_methods')
      .select('id')
      .eq('id', paymentMethodId)
      .eq('user_id', userId)
      .single();

    if (checkError || !existingPaymentMethod) {
      return res.status(404).json({
        success: false,
        message: 'Payment method not found'
      });
    }

    // If this payment method is set as default, remove default from others
    if (is_default) {
      await client
        .from('user_payment_methods')
        .update({ is_default: false })
        .eq('user_id', userId)
        .neq('id', paymentMethodId);
    }

    const updateData = {
      cardholder_name,
      expiry_month,
      expiry_year,
      billing_address_id,
      is_default,
      updated_at: new Date().toISOString()
    };

    // Remove undefined values
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    const { data: updatedPaymentMethod, error } = await client
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
      data: updatedPaymentMethod
    });

  } catch (error) {
    console.error('❌ Update payment method failed:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to update payment method',
      error: error.message
    });
  }
});

// Delete payment method
router.delete('/payment-methods/:paymentMethodId', authenticateSupabaseToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { paymentMethodId } = req.params;
    const client = getSupabaseClient();

    // Verify payment method belongs to user and get details
    const { data: existingPaymentMethod, error: checkError } = await client
      .from('user_payment_methods')
      .select('id, is_default')
      .eq('id', paymentMethodId)
      .eq('user_id', userId)
      .single();

    if (checkError || !existingPaymentMethod) {
      return res.status(404).json({
        success: false,
        message: 'Payment method not found'
      });
    }

    // Delete the payment method
    const { error: deleteError } = await client
      .from('user_payment_methods')
      .delete()
      .eq('id', paymentMethodId)
      .eq('user_id', userId);

    if (deleteError) throw deleteError;

    // If deleted payment method was default, set first remaining as default
    if (existingPaymentMethod.is_default) {
      const { data: remainingMethods } = await client
        .from('user_payment_methods')
        .select('id')
        .eq('user_id', userId)
        .limit(1);

      if (remainingMethods && remainingMethods.length > 0) {
        await client
          .from('user_payment_methods')
          .update({ is_default: true })
          .eq('id', remainingMethods[0].id);
      }
    }

    res.status(200).json({
      success: true,
      message: 'Payment method deleted successfully'
    });

  } catch (error) {
    console.error('❌ Delete payment method failed:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to delete payment method',
      error: error.message
    });
  }
});

// ==============================================
// ❤️ WISHLIST MANAGEMENT
// ==============================================

// Get user wishlist
router.get('/wishlist', authenticateSupabaseToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const client = getSupabaseClient();

    const { data: wishlistItems, error } = await client
      .from('user_wishlist')
      .select(`
        id,
        created_at,
        products (
          id,
          name,
          slug,
          price,
          original_price,
          images,
          brand,
          rating_average,
          total_reviews,
          stock_quantity,
          is_active,
          categories (
            name
          )
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Transform the data to match expected format
    const transformedWishlist = wishlistItems?.map(item => ({
      id: item.id,
      added_at: item.created_at,
      product: {
        id: item.products.id,
        name: item.products.name,
        slug: item.products.slug,
        price: item.products.price,
        original_price: item.products.original_price,
        images: item.products.images,
        brand: item.products.brand,
        rating: item.products.rating_average,
        reviewCount: item.products.total_reviews,
        stock: item.products.stock_quantity,
        isActive: item.products.is_active,
        category: item.products.categories?.name
      }
    })) || [];

    res.status(200).json({
      success: true,
      message: 'Wishlist retrieved successfully',
      data: transformedWishlist
    });

  } catch (error) {
    console.error('❌ Get wishlist failed:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve wishlist',
      error: error.message
    });
  }
});

// Add item to wishlist
router.post('/wishlist', authenticateSupabaseToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { product_id } = req.body;

    if (!product_id) {
      return res.status(400).json({
        success: false,
        message: 'Product ID is required'
      });
    }

    const client = getSupabaseClient();

    // Check if product is already in wishlist
    const { data: existingItem, error: checkError } = await client
      .from('user_wishlist')
      .select('id')
      .eq('user_id', userId)
      .eq('product_id', product_id)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      throw checkError;
    }

    if (existingItem) {
      return res.status(409).json({
        success: false,
        message: 'Product is already in your wishlist'
      });
    }

    // Verify product exists
    const { data: product, error: productError } = await client
      .from('products')
      .select('id, name, is_active')
      .eq('id', product_id)
      .single();

    if (productError || !product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    if (!product.is_active) {
      return res.status(400).json({
        success: false,
        message: 'Product is not available'
      });
    }

    // Add to wishlist
    const wishlistData = {
      id: uuidv4(),
      user_id: userId,
      product_id: product_id
    };

    const { data: newWishlistItem, error } = await client
      .from('user_wishlist')
      .insert([wishlistData])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({
      success: true,
      message: 'Product added to wishlist successfully',
      data: newWishlistItem
    });

  } catch (error) {
    console.error('❌ Add to wishlist failed:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to add product to wishlist',
      error: error.message
    });
  }
});

// Remove item from wishlist
router.delete('/wishlist/:productId', authenticateSupabaseToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { productId } = req.params;
    const client = getSupabaseClient();

    // Delete the wishlist item
    const { error: deleteError } = await client
      .from('user_wishlist')
      .delete()
      .eq('user_id', userId)
      .eq('product_id', productId);

    if (deleteError) throw deleteError;

    res.status(200).json({
      success: true,
      message: 'Product removed from wishlist successfully'
    });

  } catch (error) {
    console.error('❌ Remove from wishlist failed:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to remove product from wishlist',
      error: error.message
    });
  }
});

module.exports = router;
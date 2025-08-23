// RitZone Payment Routes
// ==============================================
// PayPal payment processing routes using environment variables ONLY

const express = require('express');
const { v4: uuidv4 } = require('uuid');
const paypalService = require('../services/paypal-service');
const { orderService, getSupabaseClient } = require('../services/supabase-service');
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
// 💳 CREATE PAYPAL ORDER
// ==============================================
router.post('/paypal/create-order', authenticateSupabaseToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { 
      amount, 
      currency = 'USD', 
      items = [],
      shippingAddress,
      billingAddress 
    } = req.body;

    console.log('🎯 Creating PayPal order for user:', userId);
    console.log('💰 Amount:', amount, currency);

    // Validate required fields
    if (!amount || !shippingAddress || !billingAddress) {
      return res.status(400).json({
        success: false,
        message: 'Amount, shipping address, and billing address are required'
      });
    }

    // Generate internal order reference
    const internalOrderId = uuidv4();

    // Create PayPal order using ONLY environment variables
    const paypalResult = await paypalService.createOrder({
      amount: parseFloat(amount),
      currency,
      orderId: internalOrderId,
      items
    });

    if (!paypalResult.success) {
      return res.status(400).json({
        success: false,
        message: 'Failed to create PayPal order',
        error: paypalResult.error
      });
    }

    // Store preliminary order data for later completion
    const preliminaryOrder = {
      id: internalOrderId,
      user_id: userId,
      paypal_order_id: paypalResult.orderId,
      amount: parseFloat(amount),
      currency,
      payment_method: 'paypal',
      payment_status: 'pending',
      shipping_address: shippingAddress,
      billing_address: billingAddress,
      items,
      created_at: new Date().toISOString(),
      status: 'payment_pending'
    };

    // Store in session or temporary storage for completion later
    req.session = req.session || {};
    req.session.preliminaryOrder = preliminaryOrder;

    res.status(200).json({
      success: true,
      message: 'PayPal order created successfully',
      data: {
        paypalOrderId: paypalResult.orderId,
        internalOrderId: internalOrderId,
        amount: parseFloat(amount),
        currency
      }
    });

  } catch (error) {
    console.error('❌ Create PayPal order error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to create PayPal order',
      error: error.message
    });
  }
});

// ==============================================
// ✅ CAPTURE PAYPAL PAYMENT
// ==============================================
router.post('/paypal/capture-order', authenticateSupabaseToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { paypalOrderId, internalOrderId } = req.body;

    console.log('🎯 Capturing PayPal payment:', paypalOrderId);

    if (!paypalOrderId || !internalOrderId) {
      return res.status(400).json({
        success: false,
        message: 'PayPal order ID and internal order ID are required'
      });
    }

    // Capture payment from PayPal
    const captureResult = await paypalService.captureOrder(paypalOrderId);

    if (!captureResult.success) {
      return res.status(400).json({
        success: false,
        message: 'Failed to capture PayPal payment',
        error: captureResult.error
      });
    }

    // Get preliminary order data (in real app, this would come from database/session)
    const preliminaryOrder = req.session?.preliminaryOrder;
    
    if (!preliminaryOrder) {
      return res.status(400).json({
        success: false,
        message: 'Order data not found'
      });
    }

    // Create final order in database
    const orderData = {
      shippingAddress: preliminaryOrder.shipping_address,
      billingAddress: preliminaryOrder.billing_address,
      paymentMethod: 'paypal',
      paymentStatus: 'completed',
      paypalOrderId: paypalOrderId,
      paypalCaptureId: captureResult.captureId,
      notes: 'PayPal payment completed',
      discountAmount: 0
    };

    const result = await orderService.createOrder(userId, orderData);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: 'Failed to save order to database',
        error: result.error
      });
    }

    // Clear session data
    if (req.session?.preliminaryOrder) {
      delete req.session.preliminaryOrder;
    }

    console.log('✅ PayPal payment captured and order saved:', result.order.id);

    res.status(200).json({
      success: true,
      message: 'Payment captured successfully',
      data: {
        orderId: result.order.id,
        paypalOrderId: paypalOrderId,
        captureId: captureResult.captureId,
        status: captureResult.status,
        order: result.order
      }
    });

  } catch (error) {
    console.error('❌ Capture PayPal payment error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to capture payment',
      error: error.message
    });
  }
});

// ==============================================
// 💸 PROCESS CASH ON DELIVERY ORDER
// ==============================================
router.post('/cod/create-order', authenticateSupabaseToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { 
      shippingAddress, 
      billingAddress, 
      notes = '',
      discountAmount = 0 
    } = req.body;

    console.log('🎯 Creating COD order for user:', userId);

    // Basic validation
    if (!shippingAddress || !billingAddress) {
      return res.status(400).json({
        success: false,
        message: 'Shipping and billing addresses are required'
      });
    }

    // Create COD order using the new cart-independent method
    const orderData = {
      shippingAddress,
      billingAddress,
      paymentMethod: 'cod',
      paymentStatus: 'pending', // COD payment is pending until delivery
      notes: notes + ' (Cash on Delivery)',
      discountAmount: discountAmount || 0
    };

    const result = await orderService.createCODOrder(userId, orderData);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error
      });
    }

    console.log('✅ COD order created:', result.order.id);

    res.status(201).json({
      success: true,
      message: 'Cash on Delivery order created successfully',
      data: result.order
    });

  } catch (error) {
    console.error('❌ Create COD order error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to create COD order',
      error: error.message
    });
  }
});

// ==============================================
// 🔍 GET PAYPAL ORDER STATUS
// ==============================================
router.get('/paypal/order/:paypalOrderId', authenticateSupabaseToken, async (req, res) => {
  try {
    const { paypalOrderId } = req.params;

    if (!paypalOrderId) {
      return res.status(400).json({
        success: false,
        message: 'PayPal order ID is required'
      });
    }

    const orderDetails = await paypalService.getOrderDetails(paypalOrderId);

    if (!orderDetails.success) {
      return res.status(400).json({
        success: false,
        message: 'Failed to get PayPal order details',
        error: orderDetails.error
      });
    }

    res.status(200).json({
      success: true,
      data: orderDetails.order
    });

  } catch (error) {
    console.error('❌ Get PayPal order error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to get order details',
      error: error.message
    });
  }
});

// ==============================================
// 🎣 PAYPAL WEBHOOK HANDLER
// ==============================================
router.post('/paypal/webhook', async (req, res) => {
  try {
    console.log('🎣 PayPal webhook received');
    
    const webhookResult = await paypalService.validateWebhook(
      JSON.stringify(req.body), 
      req.headers
    );

    if (!webhookResult.success) {
      return res.status(400).json({
        success: false,
        message: 'Invalid webhook'
      });
    }

    // Handle different webhook events
    const eventType = req.body.event_type;
    
    switch (eventType) {
      case 'PAYMENT.CAPTURE.COMPLETED':
        console.log('✅ PayPal payment capture completed');
        // Handle successful payment capture
        break;
        
      case 'PAYMENT.CAPTURE.DENIED':
        console.log('❌ PayPal payment capture denied');
        // Handle failed payment capture
        break;
        
      default:
        console.log('📋 Unhandled PayPal webhook event:', eventType);
    }

    res.status(200).json({
      success: true,
      message: 'Webhook processed'
    });

  } catch (error) {
    console.error('❌ PayPal webhook error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Webhook processing failed'
    });
  }
});

module.exports = router;
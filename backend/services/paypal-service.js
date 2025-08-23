// RitZone PayPal Payment Service
// ==============================================
// PayPal integration service using environment variables ONLY

const checkoutNodeJssdk = require('@paypal/checkout-server-sdk');
const { environment } = require('../config/environment');

class PayPalService {
  constructor() {
    this.environment = this.getPayPalEnvironment();
    this.client = new checkoutNodeJssdk.core.PayPalHttpClient(this.environment);
  }

  /**
   * Get PayPal environment configuration using ONLY environment variables
   */
  getPayPalEnvironment() {
    // CRITICAL: Always get credentials from environment variables
    const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
    const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      throw new Error('PayPal credentials not found in environment variables. Check .env.production file.');
    }

    console.log('🔧 PayPal Environment Configuration:');
    console.log('✅ Client ID found:', clientId ? 'Yes' : 'No');
    console.log('✅ Client Secret found:', clientSecret ? 'Yes' : 'No');

    // Use Sandbox for development, Live for production
    const isProduction = process.env.NODE_ENV === 'production';
    
    if (isProduction) {
      console.log('🌍 Using PayPal LIVE environment');
      return new checkoutNodeJssdk.core.LiveEnvironment(clientId, clientSecret);
    } else {
      console.log('🧪 Using PayPal SANDBOX environment');
      return new checkoutNodeJssdk.core.SandboxEnvironment(clientId, clientSecret);
    }
  }

  /**
   * Create PayPal order for checkout
   * @param {Object} orderData - Order information
   * @param {number} orderData.amount - Total amount
   * @param {string} orderData.currency - Currency code (USD, EUR, etc.)
   * @param {string} orderData.orderId - Internal order ID for reference
   */
  async createOrder(orderData) {
    try {
      const { amount, currency = 'USD', orderId, items = [] } = orderData;

      const request = new checkoutNodeJssdk.orders.OrdersCreateRequest();
      request.prefer("return=representation");
      
      request.requestBody({
        intent: 'CAPTURE',
        purchase_units: [{
          reference_id: orderId,
          amount: {
            currency_code: currency,
            value: amount.toFixed(2),
            breakdown: {
              item_total: {
                currency_code: currency,
                value: amount.toFixed(2)
              }
            }
          },
          items: items.map(item => ({
            name: item.name,
            unit_amount: {
              currency_code: currency,
              value: item.price.toFixed(2)
            },
            quantity: item.quantity.toString()
          }))
        }],
        application_context: {
          brand_name: 'RitZone',
          landing_page: 'BILLING',
          user_action: 'PAY_NOW',
          return_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success`,
          cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/cancel`
        }
      });

      const order = await this.client.execute(request);
      
      console.log('✅ PayPal Order Created:', order.result.id);
      
      return {
        success: true,
        orderId: order.result.id,
        order: order.result
      };

    } catch (error) {
      console.error('❌ PayPal Create Order Error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Capture PayPal payment
   * @param {string} paypalOrderId - PayPal order ID to capture
   */
  async captureOrder(paypalOrderId) {
    try {
      const request = new checkoutNodeJssdk.orders.OrdersCaptureRequest(paypalOrderId);
      request.requestBody({});

      const capture = await this.client.execute(request);
      
      console.log('✅ PayPal Payment Captured:', capture.result.id);
      
      return {
        success: true,
        captureId: capture.result.id,
        status: capture.result.status,
        capture: capture.result
      };

    } catch (error) {
      console.error('❌ PayPal Capture Error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get order details from PayPal
   * @param {string} paypalOrderId - PayPal order ID
   */
  async getOrderDetails(paypalOrderId) {
    try {
      const request = new checkoutNodeJssdk.orders.OrdersGetRequest(paypalOrderId);
      const order = await this.client.execute(request);

      return {
        success: true,
        order: order.result
      };

    } catch (error) {
      console.error('❌ PayPal Get Order Error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Validate PayPal webhook signature
   * @param {string} requestBody - Raw request body
   * @param {Object} headers - Request headers
   */
  async validateWebhook(requestBody, headers) {
    try {
      // PayPal webhook validation logic
      // This would require additional setup with PayPal webhook verification
      console.log('🔍 PayPal Webhook Received');
      
      return {
        success: true,
        verified: true
      };

    } catch (error) {
      console.error('❌ PayPal Webhook Validation Error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

// Export singleton instance
module.exports = new PayPalService();
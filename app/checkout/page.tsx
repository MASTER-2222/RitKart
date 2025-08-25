'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { apiClient } from '../../utils/api';
import { createClient } from '../../utils/supabase/client';
import { useCurrency } from '../../contexts/CurrencyContext';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';

interface CartItem {
  id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  product: {
    id: string;
    name: string;
    images: string[];
    brand: string;
  };
}

interface Cart {
  id: string;
  user_id: string;
  total_amount: number;
  cart_items: CartItem[];
}

interface Address {
  full_name: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  phone?: string;
}

export default function CheckoutPage() {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const supabase = createClient();
  const { selectedCurrency } = useCurrency(); // Add currency context

  // Verify PayPal environment variables on component mount
  useEffect(() => {
    console.log('🔍 Checking PayPal Environment Variables...');
    const paypalClientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
    
    if (paypalClientId) {
      console.log('✅ NEXT_PUBLIC_PAYPAL_CLIENT_ID found:', paypalClientId.substring(0, 10) + '...');
    } else {
      console.error('❌ NEXT_PUBLIC_PAYPAL_CLIENT_ID not found in environment variables');
    }
  }, []);

  const [shippingAddress, setShippingAddress] = useState<Address>({
    full_name: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'US',
    phone: ''
  });

  const [billingAddress, setBillingAddress] = useState<Address>({
    full_name: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'US',
    phone: ''
  });

  const [sameAsShipping, setSameAsShipping] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [orderNotes, setOrderNotes] = useState('');
  const [paypalLoading, setPaypalLoading] = useState(false);
  const [paypalError, setPaypalError] = useState<string | null>(null);

  useEffect(() => {
    checkAuthAndLoadCart();
  }, []);

  // Reload cart when currency changes
  useEffect(() => {
    if (cart) { // Only reload if cart is already loaded
      console.log(`🔄 Currency changed to ${selectedCurrency.code}, reloading checkout cart...`);
      loadCart();
    }
  }, [selectedCurrency.code]);

  useEffect(() => {
    if (sameAsShipping) {
      setBillingAddress(shippingAddress);
    }
  }, [sameAsShipping, shippingAddress]);

  const checkAuthAndLoadCart = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/auth/login?redirect=checkout');
        return;
      }
      await loadCart();
    } catch (err) {
      console.error('Auth check failed:', err);
      setError('Failed to check authentication');
      setLoading(false);
    }
  };

  const loadCart = async () => {
    try {
      setLoading(true);
      console.log(`🔄 Loading checkout cart in ${selectedCurrency.code} currency...`);
      
      // Pass currency parameter to cart API
      const response = await apiClient.getCart(selectedCurrency.code);
      if (response.success && response.data?.cart_items?.length > 0) {
        setCart(response.data);
        console.log(`✅ Checkout cart loaded with ${response.data.cart_items.length} items in ${selectedCurrency.code}`);
      } else {
        router.push('/cart');
        return;
      }
      setError(null);
    } catch (err) {
      console.error('Failed to load cart:', err);
      setError('Failed to load cart. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    // Check shipping address
    const requiredFields = ['full_name', 'address_line1', 'city', 'state', 'postal_code'];
    for (const field of requiredFields) {
      if (!shippingAddress[field as keyof Address]) {
        setError(`Please fill in all required shipping address fields. Missing: ${field.replace('_', ' ')}`);
        return false;
      }
    }

    // Check billing address if different from shipping
    if (!sameAsShipping) {
      for (const field of requiredFields) {
        if (!billingAddress[field as keyof Address]) {
          setError(`Please fill in all required billing address fields. Missing: ${field.replace('_', ' ')}`);
          return false;
        }
      }
    }

    // Clear any previous errors if validation passes
    setError(null);
    return true;
  };

  const handleSubmitOrder = async () => {
    if (!validateForm()) return;

    // Handle Cash on Delivery orders directly
    if (paymentMethod === 'cod') {
      await handleCODOrder();
      return;
    }

    // For card and paypal, show error as they should be handled by PayPal buttons
    if (paymentMethod === 'card' || paymentMethod === 'paypal') {
      setError('Please use the PayPal payment button below to complete your purchase.');
      return;
    }
  };

  const handleCODOrder = async () => {
    setSubmitting(true);
    setError(null);

    try {
      const orderData = {
        shippingAddress,
        billingAddress: sameAsShipping ? shippingAddress : billingAddress,
        paymentMethod: 'cod',
        notes: orderNotes,
        discountAmount: 0,
        paymentStatus: 'pending', // COD orders are pending until delivery
        transactionId: `COD_${Date.now()}` // Generate COD reference
      };

      const response = await apiClient.createOrder(orderData);
      
      if (response.success) {
        setSuccess(true);
        // Redirect to order confirmation after 2 seconds
        setTimeout(() => {
          router.push(`/orders/${response.data.id}`);
        }, 2000);
      } else {
        throw new Error(response.message || 'Failed to create COD order');
      }
    } catch (err: any) {
      console.error('COD order creation failed:', err);
      setError(err.message || 'Failed to create order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // PayPal payment functions
  const createPayPalOrder = (data: any, actions: any) => {
    // Add null safety check for cart
    if (!cart || !cart.cart_items) {
      console.error('Cart is null or undefined in createPayPalOrder');
      throw new Error('Cart data not available');
    }
    
    return actions.order.create({
      purchase_units: [
        {
          amount: {
            value: total.toFixed(2),
            currency_code: selectedCurrency.code === 'INR' ? 'USD' : selectedCurrency.code // PayPal may not support all currencies
          },
          description: `RitZone Order - ${cart.cart_items.length} items`
        }
      ]
    });
  };

  const onPayPalApprove = async (data: any, actions: any) => {
    setPaypalLoading(true);
    setPaypalError(null);
    
    try {
      // Add null safety check for cart
      if (!cart || !cart.cart_items) {
        throw new Error('Cart data not available for PayPal payment');
      }
      
      // Get order details from PayPal
      const order = await actions.order.get();
      console.log('PayPal payment approved:', order);

      // Extract payer information
      const payerName = order.payer?.name?.given_name || '';
      const payerEmail = order.payer?.email_address || '';

      // Send to our PayPal API for capture
      const paymentData = {
        name: payerName,
        email: payerEmail,
        amount: total.toFixed(2),
        orderID: data.orderID,
        shippingAddress,
        billingAddress: sameAsShipping ? shippingAddress : billingAddress,
        cart_items: cart.cart_items
      };

      const response = await fetch('/api/paypal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'PayPal payment processing failed');
      }

      const result = await response.json();
      console.log('PayPal capture successful:', result);

      // Now create the order in our system
      const orderData = {
        shippingAddress,
        billingAddress: sameAsShipping ? shippingAddress : billingAddress,
        paymentMethod: 'paypal',
        notes: orderNotes,
        discountAmount: 0,
        paymentStatus: 'completed',
        transactionId: result.data.transactionId,
        paypalOrderId: data.orderID,
        paypalCaptureId: result.data.captureID
      };

      const orderResponse = await apiClient.createOrder(orderData);
      
      if (orderResponse.success) {
        setSuccess(true);
        // Redirect to order confirmation after 2 seconds
        setTimeout(() => {
          router.push(`/orders/${orderResponse.data.id}`);
        }, 2000);
      } else {
        throw new Error(orderResponse.message || 'Failed to create order record');
      }

    } catch (error: any) {
      console.error('PayPal payment failed:', error);
      setPaypalError(error.message || 'PayPal payment failed. Please try again.');
    } finally {
      setPaypalLoading(false);
    }
  };

  const onPayPalError = (err: any) => {
    console.error('PayPal error:', err);
    setPaypalError('An error occurred with PayPal. Please try again or choose a different payment method.');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center min-h-[calc(100vh-160px)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading checkout...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center min-h-[calc(100vh-160px)]">
          <div className="text-center">
            <i className="ri-checkbox-circle-fill text-green-500 text-6xl mb-4"></i>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Placed Successfully!</h2>
            <p className="text-gray-600 mb-4">Your order has been confirmed and is being processed.</p>
            <p className="text-gray-600">Redirecting to order details...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!cart || cart.cart_items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center min-h-[calc(100vh-160px)]">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No items in cart</h2>
            <p className="text-gray-600 mb-4">Please add items to your cart before checkout.</p>
            <button 
              onClick={() => router.push('/cart')}
              className="bg-[#febd69] hover:bg-[#f3a847] text-black font-semibold py-3 px-6 rounded-lg"
            >
              Go to Cart
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const subtotal = cart.cart_items.reduce((sum, item) => sum + item.total_price, 0);
  const shipping = subtotal > 35 ? 0 : 5.99;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-6 py-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            <strong className="font-bold">Error!</strong>
            <span className="block sm:inline"> {error}</span>
            <button 
              onClick={() => setError(null)}
              className="float-right text-red-700 hover:text-red-900"
            >
              ×
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Address */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Shipping Address</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    value={shippingAddress.full_name}
                    onChange={(e) => setShippingAddress(prev => ({ ...prev, full_name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 1 *</label>
                  <input
                    type="text"
                    value={shippingAddress.address_line1}
                    onChange={(e) => setShippingAddress(prev => ({ ...prev, address_line1: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 2</label>
                  <input
                    type="text"
                    value={shippingAddress.address_line2}
                    onChange={(e) => setShippingAddress(prev => ({ ...prev, address_line2: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                  <input
                    type="text"
                    value={shippingAddress.city}
                    onChange={(e) => setShippingAddress(prev => ({ ...prev, city: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
                  <input
                    type="text"
                    value={shippingAddress.state}
                    onChange={(e) => setShippingAddress(prev => ({ ...prev, state: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code *</label>
                  <input
                    type="text"
                    value={shippingAddress.postal_code}
                    onChange={(e) => setShippingAddress(prev => ({ ...prev, postal_code: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={shippingAddress.phone}
                    onChange={(e) => setShippingAddress(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>
            </div>

            {/* Billing Address */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Billing Address</h2>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={sameAsShipping}
                    onChange={(e) => setSameAsShipping(e.target.checked)}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-600">Same as shipping address</span>
                </label>
              </div>

              {!sameAsShipping && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                    <input
                      type="text"
                      value={billingAddress.full_name}
                      onChange={(e) => setBillingAddress(prev => ({ ...prev, full_name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
                      required
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 1 *</label>
                    <input
                      type="text"
                      value={billingAddress.address_line1}
                      onChange={(e) => setBillingAddress(prev => ({ ...prev, address_line1: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
                      required
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 2</label>
                    <input
                      type="text"
                      value={billingAddress.address_line2}
                      onChange={(e) => setBillingAddress(prev => ({ ...prev, address_line2: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                    <input
                      type="text"
                      value={billingAddress.city}
                      onChange={(e) => setBillingAddress(prev => ({ ...prev, city: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
                    <input
                      type="text"
                      value={billingAddress.state}
                      onChange={(e) => setBillingAddress(prev => ({ ...prev, state: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code *</label>
                    <input
                      type="text"
                      value={billingAddress.postal_code}
                      onChange={(e) => setBillingAddress(prev => ({ ...prev, postal_code: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
                      required
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Payment Method</h2>
              <div className="space-y-3">
                <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="payment"
                    value="card"
                    checked={paymentMethod === 'card'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mr-3"
                  />
                  <div className="flex items-center">
                    <i className="ri-bank-card-line text-xl text-blue-600 mr-2"></i>
                    <div>
                      <span className="font-medium">Credit/Debit Card</span>
                      <p className="text-sm text-gray-600">Pay securely with PayPal's card processing</p>
                    </div>
                  </div>
                </label>
                
                <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="payment"
                    value="paypal"
                    checked={paymentMethod === 'paypal'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mr-3"
                  />
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center mr-2">
                      <span className="text-white font-bold text-sm">PP</span>
                    </div>
                    <div>
                      <span className="font-medium">PayPal</span>
                      <p className="text-sm text-gray-600">Pay with your PayPal account</p>
                    </div>
                  </div>
                </label>

                <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="payment"
                    value="cod"
                    checked={paymentMethod === 'cod'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mr-3"
                  />
                  <div className="flex items-center">
                    <i className="ri-hand-coin-line text-xl text-green-600 mr-2"></i>
                    <div>
                      <span className="font-medium">Cash on Delivery (COD)</span>
                      <p className="text-sm text-gray-600">Pay when your order is delivered</p>
                    </div>
                  </div>
                </label>
              </div>

              {/* PayPal Button Section */}
              {(paymentMethod === 'card' || paymentMethod === 'paypal') && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium mb-3">
                    {paymentMethod === 'card' ? 'Pay with Card via PayPal' : 'Pay with PayPal'}
                  </h3>
                  
                  {paypalError && (
                    <div className="mb-3 p-3 bg-red-100 text-red-700 rounded text-sm">
                      {paypalError}
                      <button 
                        onClick={() => setPaypalError(null)}
                        className="float-right text-red-700 hover:text-red-900"
                      >
                        ×
                      </button>
                    </div>
                  )}

                  {paypalLoading && (
                    <div className="mb-3 text-center">
                      <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500 mr-2"></div>
                      <span>Processing payment...</span>
                    </div>
                  )}

                  <PayPalScriptProvider
                    options={{
                      clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || '',
                      currency: selectedCurrency.code === 'INR' ? 'USD' : selectedCurrency.code,
                      intent: 'capture',
                      'data-client-token': undefined, // Use live environment - no sandbox
                      'enable-funding': 'venmo,paylater'
                    }}
                    onError={(error) => {
                      console.error('PayPal Script Provider Error:', error);
                      setPaypalError('PayPal initialization failed. Please check PayPal configuration.');
                    }}
                  >
                    {process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID ? (
                      <PayPalButtons
                        createOrder={createPayPalOrder}
                        onApprove={onPayPalApprove}
                        onError={onPayPalError}
                        style={{ 
                          layout: "vertical",
                          color: paymentMethod === 'card' ? "blue" : "gold",
                          shape: "rect",
                          label: paymentMethod === 'card' ? "pay" : "paypal"
                        }}
                        disabled={paypalLoading || !validateForm()}
                      />
                    ) : (
                      <div className="p-4 bg-red-50 text-red-700 rounded">
                        <i className="ri-error-warning-line mr-2"></i>
                        PayPal Client ID not configured in environment variables. Please contact support.
                      </div>
                    )}
                  </PayPalScriptProvider>
                  
                  <p className="text-xs text-gray-500 mt-2">
                    {paymentMethod === 'card' 
                      ? 'Your card details are processed securely by PayPal'
                      : 'You will be redirected to PayPal to complete your payment'
                    }
                  </p>
                </div>
              )}
            </div>

            {/* Order Notes */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Order Notes (Optional)</h2>
              <textarea
                value={orderNotes}
                onChange={(e) => setOrderNotes(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Special instructions for delivery..."
              />
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border p-6 sticky top-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h2>

              {/* Cart Items */}
              <div className="space-y-3 mb-6">
                {cart.cart_items.map(item => (
                  <div key={item.id} className="flex space-x-3">
                    <img 
                      src={item.product.images[0] || 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=100&h=100&fit=crop&crop=center'}
                      alt={item.product.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div className="flex-1">
                      <h4 className="text-sm font-medium">{item.product.name}</h4>
                      <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                      <p className="text-sm font-semibold">{selectedCurrency.symbol}{item.total_price.toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>

              <hr className="mb-4" />

              {/* Pricing */}
              <div className="space-y-2 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span>{selectedCurrency.symbol}{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span>{shipping === 0 ? 'FREE' : `${selectedCurrency.symbol}${shipping.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax</span>
                  <span>{selectedCurrency.symbol}{tax.toFixed(2)}</span>
                </div>
                <hr />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-red-600">{selectedCurrency.symbol}{total.toFixed(2)}</span>
                </div>
              </div>

              {/* Place Order Button - Only show for COD */}
              {paymentMethod === 'cod' && (
                <button
                  onClick={handleSubmitOrder}
                  disabled={submitting}
                  className="w-full bg-[#febd69] hover:bg-[#f3a847] text-black font-semibold py-3 px-6 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Processing...' : `Place COD Order (${selectedCurrency.symbol}${total.toFixed(2)})`}
                </button>
              )}

              {/* Payment Instructions for Card/PayPal */}
              {(paymentMethod === 'card' || paymentMethod === 'paypal') && (
                <div className="w-full p-4 bg-blue-50 border border-blue-200 rounded-lg text-center">
                  <i className="ri-information-line text-blue-600 text-xl mb-2"></i>
                  <p className="text-sm text-blue-800 font-medium">
                    Please use the PayPal payment button in the Payment Method section above to complete your purchase.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
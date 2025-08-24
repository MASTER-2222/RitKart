'use client';
import React, { useState, useEffect } from 'react';
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
  products: {
    id: string;
    name: string;
    images: string[];
    brand: string;
    stock_quantity: number;
    is_active: boolean;
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

    return true;
  };

  const handleSubmitOrder = async () => {
    if (!validateForm()) return;

    setSubmitting(true);
    setError(null);

    try {
      if (paymentMethod === 'cod') {
        // Handle Cash on Delivery
        await handleCODOrder();
      } else if (paymentMethod === 'paypal' || paymentMethod === 'card') {
        // PayPal payment will be handled by PayPal buttons
        // This function is called when PayPal buttons are not shown yet
        setError('Please use the PayPal payment button below to complete your order.');
      } else {
        setError('Please select a payment method.');
      }
    } catch (err: any) {
      console.error('Order submission failed:', err);
      setError(err.message || 'Failed to submit order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCODOrder = async () => {
    try {
      const orderData = {
        shippingAddress,
        billingAddress: sameAsShipping ? shippingAddress : billingAddress,
        paymentMethod: 'cod',
        notes: orderNotes,
        discountAmount: 0
      };

      const response = await apiClient.createCODOrder(orderData);
      
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
      setError(err.message || 'Failed to create COD order. Please try again.');
    }
  };

  const handlePayPalSuccess = async (details: any, data: any) => {
    try {
      console.log('PayPal payment successful:', details, data);
      setSuccess(true);
      
      // Redirect to success page or order details
      setTimeout(() => {
        router.push('/orders?success=true');
      }, 2000);
    } catch (err: any) {
      console.error('PayPal success handler failed:', err);
      setError('Payment completed but order processing failed. Please contact support.');
    }
  };

  const handlePayPalError = (err: any) => {
    console.error('PayPal payment error:', err);
    setError('PayPal payment failed. Please try again or choose a different payment method.');
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

  const subtotal = cart.cart_items.reduce((sum, item) => sum + Number(item.total_price), 0);
  const shipping = subtotal > 35 ? 0 : 5.99;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  // PayPal configuration from environment
  const [paypalClientId, setPaypalClientId] = useState('');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // Set PayPal client ID on client side to prevent hydration mismatch
    setPaypalClientId(process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || '');
    setIsClient(true);
  }, []);

  return (
    <>
      {!isClient ? (
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
      ) : (
        <PayPalScriptProvider 
          options={{
            "client-id": paypalClientId,
            currency: selectedCurrency.code,
            intent: "capture",
            "data-client-token": "sandbox",
          }}
        >
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
                    name="full_name"
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
                    name="address_line1"
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
                    name="address_line2"
                    value={shippingAddress.address_line2}
                    onChange={(e) => setShippingAddress(prev => ({ ...prev, address_line2: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                  <input
                    type="text"
                    name="city"
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
                    name="state"
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
                    name="postal_code"
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
                    name="phone"
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
                      name="billing_full_name"
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
                      name="billing_address_line1"
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
                      name="billing_address_line2"
                      value={billingAddress.address_line2}
                      onChange={(e) => setBillingAddress(prev => ({ ...prev, address_line2: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                    <input
                      type="text"
                      name="billing_city"
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
                      name="billing_state"
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
                      name="billing_postal_code"
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
                <label className="flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="radio"
                    name="payment"
                    value="paypal"
                    checked={paymentMethod === 'paypal'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mr-3"
                  />
                  <div className="flex items-center">
                    <span className="font-medium">PayPal</span>
                    <img 
                      src="https://www.paypalobjects.com/webstatic/mktg/Logo/pp-logo-100px.png" 
                      alt="PayPal" 
                      className="h-6 ml-2"
                    />
                  </div>
                </label>
                
                <label className="flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="radio"
                    name="payment"
                    value="card"
                    checked={paymentMethod === 'card'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mr-3"
                  />
                  <div className="flex items-center">
                    <span className="font-medium">Credit/Debit Card via PayPal</span>
                    <div className="flex items-center ml-2 space-x-1">
                      <img src="https://www.paypalobjects.com/webstatic/mktg/Logo/cc-visa.jpg" alt="Visa" className="h-6"/>
                      <img src="https://www.paypalobjects.com/webstatic/mktg/Logo/cc-mastercard.jpg" alt="MasterCard" className="h-6"/>
                      <img src="https://www.paypalobjects.com/webstatic/mktg/Logo/cc-amex.jpg" alt="Amex" className="h-6"/>
                    </div>
                  </div>
                </label>
                
                <label className="flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="radio"
                    name="payment"
                    value="cod"
                    checked={paymentMethod === 'cod'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mr-3"
                  />
                  <div className="flex items-center">
                    <span className="font-medium">Cash on Delivery (COD)</span>
                    <i className="ri-truck-line text-green-600 ml-2 text-xl"></i>
                  </div>
                </label>
              </div>

              {/* PayPal Payment Section */}
              {(paymentMethod === 'paypal' || paymentMethod === 'card') && (
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    {paymentMethod === 'paypal' ? 'Pay with PayPal' : 'Pay with Credit/Debit Card'}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    {paymentMethod === 'paypal' 
                      ? 'You will be redirected to PayPal to complete your payment securely.'
                      : 'Use your credit or debit card via PayPal secure checkout.'
                    }
                  </p>
                  
                  {/* PayPal Buttons will appear here after form validation */}
                  <div id="paypal-button-container" className="min-h-[50px]">
                    {(typeof window !== 'undefined' && validateForm()) && (
                      <PayPalButtons
                        createOrder={async (data, actions) => {
                          try {
                            // Call backend to create PayPal order
                            const orderData = {
                              amount: total,
                              currency: selectedCurrency.code,
                              items: cart.cart_items.map(item => ({
                                name: item.products.name,
                                quantity: item.quantity,
                                unit_amount: {
                                  currency_code: selectedCurrency.code,
                                  value: Number(item.unit_price).toFixed(2)
                                }
                              })),
                              shippingAddress,
                              billingAddress: sameAsShipping ? shippingAddress : billingAddress
                            };

                            const response = await apiClient.createPayPalOrder(orderData);
                            
                            if (response.success) {
                              return response.data.paypalOrderId;
                            } else {
                              throw new Error(response.message || 'Failed to create PayPal order');
                            }
                          } catch (error: any) {
                            console.error('PayPal order creation failed:', error);
                            setError(error.message || 'Failed to create PayPal order');
                            throw error;
                          }
                        }}
                        onApprove={async (data, actions) => {
                          try {
                            // Capture the payment
                            const captureData = {
                              paypalOrderId: data.orderID,
                              internalOrderId: data.orderID // Use the same ID for simplicity
                            };

                            const response = await apiClient.capturePayPalOrder(captureData);
                            
                            if (response.success) {
                              await handlePayPalSuccess(response.data, data);
                            } else {
                              throw new Error(response.message || 'Failed to capture payment');
                            }
                          } catch (error: any) {
                            console.error('PayPal capture failed:', error);
                            setError(error.message || 'Payment capture failed');
                          }
                        }}
                        onError={(err) => {
                          handlePayPalError(err);
                        }}
                        onCancel={(data) => {
                          console.log('PayPal payment cancelled:', data);
                          setError('Payment was cancelled. Please try again.');
                        }}
                        style={{
                          layout: "vertical",
                          color: "gold",
                          shape: "rect",
                          label: paymentMethod === 'card' ? 'pay' : 'paypal'
                        }}
                        forceReRender={[total, paymentMethod, selectedCurrency.code]}
                      />
                    )}
                  </div>
                </div>
              )}

              {/* COD Information */}
              {paymentMethod === 'cod' && (
                <div className="mt-6 p-4 bg-green-50 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Cash on Delivery</h3>
                  <div className="text-sm text-gray-600 space-y-2">
                    <p>• Pay cash when your order is delivered to your doorstep</p>
                    <p>• No advance payment required</p>
                    <p>• Available for orders above {selectedCurrency.symbol}10</p>
                    <p>• Delivery charges may apply based on location</p>
                  </div>
                </div>
              )}
            </div>

            {/* Order Notes */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Order Notes (Optional)</h2>
              <textarea
                name="order_notes"
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
                      src={item.products.images[0] || 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=100&h=100&fit=crop&crop=center'}
                      alt={item.products.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div className="flex-1">
                      <h4 className="text-sm font-medium">{item.products.name}</h4>
                      <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                      <p className="text-sm font-semibold">{selectedCurrency.symbol}{Number(item.total_price).toFixed(2)}</p>
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

              {/* Place Order Button */}
              <button
                onClick={handleSubmitOrder}
                disabled={submitting}
                className="w-full bg-[#febd69] hover:bg-[#f3a847] text-black font-semibold py-3 px-6 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Processing...' : `Place Order (${selectedCurrency.symbol}${total.toFixed(2)})`}
              </button>
            </div>
          </div>
        </div>
        </main>

        <Footer />
      </div>
    </PayPalScriptProvider>
      )}
    </>
  );
}
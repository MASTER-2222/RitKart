'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import Link from 'next/link';
import { apiClient } from '../../utils/api';
import { createClient } from '../../utils/supabase/client';
import { useCurrency } from '../../contexts/CurrencyContext';

interface CartItem {
  id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  products: {
    id: string;
    name: string;
    price: number;
    original_price?: number;
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

interface RelatedProduct {
  id: string;
  name: string;
  price: number;
  images: string[];
  brand: string;
  category_name: string;
  rating_average?: number;
  stock_quantity: number;
  is_active: boolean;
}

export default function CartPage() {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingItems, setUpdatingItems] = useState<Set<string>>(new Set());
  const [relatedProducts, setRelatedProducts] = useState<RelatedProduct[]>([]);
  const [relatedProductsLoading, setRelatedProductsLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();
  const { selectedCurrency } = useCurrency();

  useEffect(() => {
    checkAuthAndLoadCart();
  }, []);

  // Reload cart when currency changes
  useEffect(() => {
    if (cart) { // Only reload if cart is already loaded
      console.log(`🔄 Currency changed to ${selectedCurrency.code}, reloading cart...`);
      loadCart();
    }
  }, [selectedCurrency.code]);

  const checkAuthAndLoadCart = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/auth/login?redirect=cart');
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
      console.log(`🔄 Loading cart with ${selectedCurrency.code} currency...`);
      
      // Pass currency parameter to cart API
      const response = await apiClient.getCart(selectedCurrency.code);
      if (response.success) {
        // Ensure cart data structure is correct
        const cartData = response.data;
        if (cartData && cartData.cart_items && Array.isArray(cartData.cart_items)) {
          // Validate each cart item has required product data
          const validatedCartItems = cartData.cart_items.filter(item => 
            item.products && 
            item.products.id && 
            item.products.name && 
            Array.isArray(item.products.images)
          );
          setCart({
            ...cartData,
            cart_items: validatedCartItems
          });

          console.log(`✅ Cart loaded successfully with ${validatedCartItems.length} items in ${selectedCurrency.code}`);
          
          // Load related products if cart has items
          if (validatedCartItems.length > 0) {
            await loadRelatedProducts(validatedCartItems);
          }
        } else {
          // If no valid cart data, create empty cart
          setCart({ id: '', user_id: '', total_amount: 0, cart_items: [] });
        }
      } else {
        // If no cart exists, create empty cart
        setCart({ id: '', user_id: '', total_amount: 0, cart_items: [] });
      }
      setError(null);
    } catch (err) {
      console.error('Failed to load cart:', err);
      setError('Failed to load cart. Please try again.');
      // Set empty cart on error to prevent crashes
      setCart({ id: '', user_id: '', total_amount: 0, cart_items: [] });
    } finally {
      setLoading(false);
    }
  };

  const loadRelatedProducts = async (cartItems: CartItem[]) => {
    try {
      setRelatedProductsLoading(true);
      console.log(`🔄 Loading related products based on ${cartItems.length} cart items...`);
      
      // Get related products based on the first cart item (or we could use multiple items)
      // For now, let's use the first item to get related products
      const firstItem = cartItems[0];
      
      if (firstItem && firstItem.products.id) {
        const response = await apiClient.getRelatedProducts(firstItem.products.id, {
          limit: 10,
          currency: selectedCurrency.code
        });
        
        if (response.success && response.data) {
          // Filter out products that are already in the cart
          const cartProductIds = new Set(cartItems.map(item => item.products.id));
          const filteredRelatedProducts = response.data.filter(
            (product: RelatedProduct) => !cartProductIds.has(product.id)
          );
          
          setRelatedProducts(filteredRelatedProducts.slice(0, 10)); // Ensure max 10 products
          console.log(`✅ Loaded ${filteredRelatedProducts.length} related products (excluded ${response.data.length - filteredRelatedProducts.length} already in cart)`);
        }
      }
    } catch (err) {
      console.error('Failed to load related products:', err);
      // Don't show error to user for related products failure
      setRelatedProducts([]);
    } finally {
      setRelatedProductsLoading(false);
    }
  };

  const updateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity === 0) {
      await removeItem(itemId);
      return;
    }

    setUpdatingItems(prev => new Set([...prev, itemId]));
    try {
      const response = await apiClient.updateCartItem(itemId, newQuantity);
      if (response.success) {
        await loadCart(); // Reload cart to get updated totals
      } else {
        throw new Error(response.message || 'Failed to update item');
      }
    } catch (err) {
      console.error('Failed to update quantity:', err);
      setError('Failed to update quantity. Please try again.');
    } finally {
      setUpdatingItems(prev => {
        const newSet = new Set([...prev]);
        newSet.delete(itemId);
        return newSet;
      });
    }
  };

  const removeItem = async (itemId: string) => {
    setUpdatingItems(prev => new Set([...prev, itemId]));
    try {
      const response = await apiClient.removeFromCart(itemId);
      if (response.success) {
        await loadCart(); // Reload cart to get updated totals
      } else {
        throw new Error(response.message || 'Failed to remove item');
      }
    } catch (err) {
      console.error('Failed to remove item:', err);
      setError('Failed to remove item. Please try again.');
    } finally {
      setUpdatingItems(prev => {
        const newSet = new Set([...prev]);
        newSet.delete(itemId);
        return newSet;
      });
    }
  };

  const proceedToCheckout = () => {
    if (cart && cart.cart_items && cart.cart_items.length > 0) {
      // Check if all items are in stock
      const outOfStockItems = cart.cart_items.filter(item => !item.products.is_active || item.products.stock_quantity < item.quantity);
      if (outOfStockItems.length > 0) {
        setError('Some items in your cart are out of stock. Please update your cart.');
        return;
      }
      router.push('/checkout');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center min-h-[calc(100vh-160px)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your cart...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const cartItems = cart?.cart_items || [];
  const subtotal = cartItems.reduce((sum, item) => {
    // Ensure item and total_price exist before adding
    if (item && typeof item.total_price === 'number' && !isNaN(item.total_price)) {
      return sum + item.total_price;
    }
    return sum;
  }, 0);
  const shipping = subtotal > 35 ? 0 : 5.99;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-6 py-6">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-6">Shopping Cart</h1>
              
              {cartItems.length === 0 ? (
                <div className="text-center py-12">
                  <i className="ri-shopping-cart-line w-16 h-16 flex items-center justify-center text-gray-400 mx-auto mb-4 text-6xl"></i>
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">Your cart is empty</h2>
                  <p className="text-gray-600 mb-6">Start shopping to add items to your cart</p>
                  <Link href="/" className="bg-[#febd69] hover:bg-[#f3a847] text-black font-semibold py-3 px-6 rounded-lg whitespace-nowrap">
                    Continue Shopping
                  </Link>
                </div>
              ) : (
                <div className="space-y-6">
                  {cartItems.map(item => {
                    // Safety check to ensure item and products exist
                    if (!item || !item.products) {
                      return null;
                    }
                    
                    return (
                    <div key={item.id} className="flex space-x-4 border-b border-gray-200 pb-6">
                      <Link href={`/product/${item.products.id}`}>
                        <img 
                          src={item.products.images?.[0] || 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=300&h=300&fit=crop&crop=center'}
                          alt={item.products.name || 'Product'}
                          className="w-32 h-32 object-cover rounded cursor-pointer"
                        />
                      </Link>
                      
                      <div className="flex-1 space-y-3">
                        <Link href={`/product/${item.products.id}`} className="hover:text-blue-600">
                          <h3 className="text-lg font-medium text-gray-900 cursor-pointer">
                            {item.products.name || 'Unnamed Product'}
                          </h3>
                        </Link>

                        {item.products.brand && (
                          <p className="text-sm text-gray-600">Brand: {item.products.brand}</p>
                        )}
                        
                        {item.products.is_active && item.products.stock_quantity >= item.quantity ? (
                          <div className="text-green-600 text-sm font-semibold">
                            <i className="ri-checkbox-circle-line w-4 h-4 inline-flex items-center justify-center mr-1"></i>
                            In Stock ({item.products.stock_quantity} available)
                          </div>
                        ) : (
                          <div className="text-red-600 text-sm font-semibold">
                            <i className="ri-close-circle-line w-4 h-4 inline-flex items-center justify-center mr-1"></i>
                            {!item.products.is_active ? 'Currently unavailable' : 'Insufficient stock'}
                          </div>
                        )}
                        
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2">
                            <label className="text-sm text-gray-600">Qty:</label>
                            <select 
                              value={item.quantity || 1}
                              onChange={(e) => updateQuantity(item.id, Number(e.target.value))}
                              disabled={updatingItems.has(item.id)}
                              className="border rounded px-2 py-1 text-sm pr-8 disabled:opacity-50"
                            >
                              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                                <option key={num} value={num}>
                                  {num === 0 ? 'Remove' : num}
                                </option>
                              ))}
                            </select>
                            {updatingItems.has(item.id) && (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-500"></div>
                            )}
                          </div>
                          
                          <button 
                            onClick={() => removeItem(item.id)}
                            disabled={updatingItems.has(item.id)}
                            className="text-blue-600 hover:underline text-sm disabled:opacity-50"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-xl font-bold text-gray-900">
                          {selectedCurrency.symbol}{(item.total_price || 0).toFixed(2)}
                        </div>
                        {item.products.original_price && item.products.original_price > item.products.price && (
                          <div className="text-sm text-gray-500 line-through">
                            {selectedCurrency.symbol}{((item.products.original_price || 0) * (item.quantity || 1)).toFixed(2)}
                          </div>
                        )}
                        <div className="text-sm text-gray-600 mt-1">
                          {selectedCurrency.symbol}{(item.unit_price || 0).toFixed(2)} each
                        </div>
                      </div>
                    </div>
                    );
                  }).filter(Boolean)}
                </div>
              )}
            </div>
            
            {cartItems.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">You might also like</h2>
                
                {relatedProductsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                    <span className="ml-2 text-gray-600">Loading recommendations...</span>
                  </div>
                ) : relatedProducts.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {relatedProducts.map(product => (
                      <div 
                        key={product.id} 
                        className="text-center border rounded-lg p-3 hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => router.push(`/product/${product.id}`)}
                      >
                        <img 
                          src={product.images?.[0] || 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=150&h=150&fit=crop&crop=center'}
                          alt={product.name}
                          className="w-20 h-20 object-cover rounded mx-auto mb-2"
                        />
                        <h4 className="text-sm font-medium mb-1 text-left line-clamp-2" title={product.name}>
                          {product.name}
                        </h4>
                        {product.brand && (
                          <p className="text-xs text-gray-500 mb-1 text-left">{product.brand}</p>
                        )}
                        {product.rating_average && (
                          <div className="flex items-center justify-start mb-1">
                            <div className="flex text-yellow-400 text-xs">
                              {[1, 2, 3, 4, 5].map(star => (
                                <span key={star}>
                                  {star <= Math.floor(product.rating_average || 0) ? '★' : '☆'}
                                </span>
                              ))}
                            </div>
                            <span className="text-xs text-gray-500 ml-1">
                              ({product.rating_average?.toFixed(1)})
                            </span>
                          </div>
                        )}
                        <div className="text-sm font-bold mb-2 text-left">
                          {selectedCurrency.symbol}{product.price.toFixed(2)}
                        </div>
                        <div className="text-xs text-gray-600 mb-2 text-left">
                          {product.stock_quantity > 0 && product.is_active ? (
                            <span className="text-green-600">In Stock</span>
                          ) : (
                            <span className="text-red-600">Out of Stock</span>
                          )}
                        </div>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent card click
                            router.push(`/product/${product.id}`);
                          }}
                          className="w-full bg-[#febd69] hover:bg-[#f3a847] text-black text-xs font-medium py-1 px-2 rounded whitespace-nowrap transition-colors"
                        >
                          View Product
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No recommendations available at the moment.</p>
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border p-6 sticky top-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h2>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal ({cartItems.reduce((sum, item) => {
                    if (item && typeof item.quantity === 'number' && !isNaN(item.quantity)) {
                      return sum + item.quantity;
                    }
                    return sum;
                  }, 0)} items)</span>
                  <span className="font-semibold">{selectedCurrency.symbol}{subtotal.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-semibold">
                    {shipping === 0 ? 'FREE' : `${selectedCurrency.symbol}${shipping.toFixed(2)}`}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Estimated tax</span>
                  <span className="font-semibold">{selectedCurrency.symbol}{tax.toFixed(2)}</span>
                </div>
                
                <hr className="my-4" />
                
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-red-600">{selectedCurrency.symbol}{total.toFixed(2)}</span>
                </div>
                
                {shipping > 0 && (
                  <div className="text-sm text-blue-600 mt-2">
                    Add {selectedCurrency.symbol}{(35 - subtotal).toFixed(2)} to qualify for FREE Shipping
                  </div>
                )}
              </div>
              
              <div className="space-y-3">
                <button 
                  onClick={proceedToCheckout}
                  disabled={cartItems.length === 0 || cartItems.some(item => !item.products.is_active || item.products.stock_quantity < item.quantity)}
                  className="w-full bg-[#febd69] hover:bg-[#f3a847] text-black font-semibold py-3 px-6 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                >
                  Proceed to Checkout
                </button>
                
                <div className="text-center text-sm text-gray-600">
                  <i className="ri-shield-check-line w-4 h-4 inline-flex items-center justify-center mr-1"></i>
                  Secure checkout with 256-bit SSL encryption
                </div>
                
                <div className="border-t pt-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center text-gray-600">
                      <i className="ri-truck-line w-4 h-4 flex items-center justify-center mr-2"></i>
                      Free delivery on orders over {selectedCurrency.symbol}35
                    </div>
                    <div className="flex items-center text-gray-600">
                      <i className="ri-arrow-go-back-line w-4 h-4 flex items-center justify-center mr-2"></i>
                      Free 30-day returns
                    </div>
                    <div className="flex items-center text-gray-600">
                      <i className="ri-customer-service-2-line w-4 h-4 flex items-center justify-center mr-2"></i>
                      24/7 customer support
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
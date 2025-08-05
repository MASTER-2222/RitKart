
'use client';
import { useState } from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import Link from 'next/link';

export default function CartPage() {
  const [cartItems, setCartItems] = useState([
    {
      id: '1',
      title: 'Apple MacBook Pro 14-inch M3 Chip with 8-Core CPU and 10-Core GPU',
      price: 1599,
      originalPrice: 1999,
      image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=150&h=150&fit=crop&crop=center',
      quantity: 1,
      isPrime: true,
      inStock: true
    },
    {
      id: '2',
      title: 'Sony WH-1000XM4 Wireless Premium Noise Canceling Overhead Headphones',
      price: 248,
      originalPrice: 349,
      image: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=150&h=150&fit=crop&crop=center',
      quantity: 2,
      isPrime: true,
      inStock: true
    },
    {
      id: '3',
      title: 'Anker Portable Charger, PowerCore Slim 10000mAh',
      price: 22.99,
      originalPrice: 29.99,
      image: 'https://images.unsplash.com/photo-1609592806965-50a4bb9e2c41?w=150&h=150&fit=crop&crop=center',
      quantity: 1,
      isPrime: true,
      inStock: false
    }
  ]);

  const updateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity === 0) {
      removeItem(id);
    } else {
      setCartItems(prev => 
        prev.map(item => 
          item.id === id ? { ...item, quantity: newQuantity } : item
        )
      );
    }
  };

  const removeItem = (id: string) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = subtotal > 35 ? 0 : 5.99;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-6 py-6">
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
                  {cartItems.map(item => (
                    <div key={item.id} className="flex space-x-4 border-b border-gray-200 pb-6">
                      <Link href={`/product/${item.id}`}>
                        <img 
                          src={item.image}
                          alt={item.title}
                          className="w-32 h-32 object-cover rounded cursor-pointer"
                        />
                      </Link>
                      
                      <div className="flex-1 space-y-3">
                        <Link href={`/product/${item.id}`} className="hover:text-blue-600">
                          <h3 className="text-lg font-medium text-gray-900 cursor-pointer">
                            {item.title}
                          </h3>
                        </Link>
                        
                        {item.inStock ? (
                          <div className="text-green-600 text-sm font-semibold">
                            <i className="ri-checkbox-circle-line w-4 h-4 inline-flex items-center justify-center mr-1"></i>
                            In Stock
                          </div>
                        ) : (
                          <div className="text-red-600 text-sm font-semibold">
                            <i className="ri-close-circle-line w-4 h-4 inline-flex items-center justify-center mr-1"></i>
                            Currently unavailable
                          </div>
                        )}
                        
                        {item.isPrime && (
                          <div className="text-sm">
                            <div className="bg-blue-500 text-white px-2 py-1 text-xs font-bold rounded inline-block mr-2">
                              Prime
                            </div>
                            <span className="text-green-600">FREE One-Day Delivery</span>
                          </div>
                        )}
                        
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2">
                            <label className="text-sm text-gray-600">Qty:</label>
                            <select 
                              value={item.quantity}
                              onChange={(e) => updateQuantity(item.id, Number(e.target.value))}
                              className="border rounded px-2 py-1 text-sm pr-8"
                            >
                              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                                <option key={num} value={num}>
                                  {num === 0 ? 'Remove' : num}
                                </option>
                              ))}
                            </select>
                          </div>
                          
                          <button 
                            onClick={() => removeItem(item.id)}
                            className="text-blue-600 hover:underline text-sm"
                          >
                            Delete
                          </button>
                          
                          <button className="text-blue-600 hover:underline text-sm">
                            Save for later
                          </button>
                          
                          <button className="text-blue-600 hover:underline text-sm">
                            Compare with similar items
                          </button>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-xl font-bold text-gray-900">
                          ${(item.price * item.quantity).toFixed(2)}
                        </div>
                        {item.originalPrice && item.originalPrice > item.price && (
                          <div className="text-sm text-gray-500 line-through">
                            ${(item.originalPrice * item.quantity).toFixed(2)}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {cartItems.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Frequently bought together</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    {
                      id: 'addon1',
                      title: 'Apple Magic Mouse',
                      price: 79,
                      image: 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=150&h=150&fit=crop&crop=center'
                    },
                    {
                      id: 'addon2',
                      title: 'USB-C to USB Adapter',
                      price: 19,
                      image: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=150&h=150&fit=crop&crop=center'
                    },
                    {
                      id: 'addon3',
                      title: 'Laptop Stand',
                      price: 49,
                      image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=150&h=150&fit=crop&crop=center'
                    }
                  ].map(addon => (
                    <div key={addon.id} className="text-center border rounded-lg p-4">
                      <img 
                        src={addon.image}
                        alt={addon.title}
                        className="w-20 h-20 object-cover rounded mx-auto mb-2"
                      />
                      <h4 className="text-sm font-medium mb-1">{addon.title}</h4>
                      <div className="text-sm font-bold mb-2">${addon.price}</div>
                      <button className="bg-[#febd69] hover:bg-[#f3a847] text-black text-xs font-medium py-1 px-3 rounded whitespace-nowrap">
                        Add to Cart
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border p-6 sticky top-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h2>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal ({cartItems.reduce((sum, item) => sum + item.quantity, 0)} items)</span>
                  <span className="font-semibold">${subtotal.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-semibold">
                    {shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Estimated tax</span>
                  <span className="font-semibold">${tax.toFixed(2)}</span>
                </div>
                
                <hr className="my-4" />
                
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-red-600">${total.toFixed(2)}</span>
                </div>
                
                {shipping > 0 && (
                  <div className="text-sm text-blue-600 mt-2">
                    Add ${(35 - subtotal).toFixed(2)} to qualify for FREE Shipping
                  </div>
                )}
              </div>
              
              <div className="space-y-3">
                <button 
                  disabled={cartItems.length === 0 || cartItems.some(item => !item.inStock)}
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
                      Free delivery on orders over $35
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

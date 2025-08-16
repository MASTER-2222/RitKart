'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function Wishlist() {
  const [wishlistItems, setWishlistItems] = useState([
    {
      id: '1',
      title: 'Apple MacBook Pro 14-inch M3 Chip with 8-Core CPU and 10-Core GPU',
      price: 1599,
      originalPrice: 1999,
      rating: 4.8,
      reviewCount: 2847,
      image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=300&h=300&fit=crop&crop=center',
      isPrime: true,
      isDeliveryTomorrow: true,
      discount: 20,
      inStock: true,
      dateAdded: 'December 15, 2023'
    },
    {
      id: 'f2',
      title: 'Nike Air Force 1 \'07 White Leather Sneakers - Unisex',
      price: 110,
      originalPrice: 130,
      rating: 4.8,
      reviewCount: 28934,
      image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=300&h=300&fit=crop&crop=center',
      isPrime: true,
      isDeliveryTomorrow: true,
      discount: 15,
      inStock: true,
      dateAdded: 'December 12, 2023'
    },
    {
      id: 'b1',
      title: 'The Seven Husbands of Evelyn Hugo: A Novel by Taylor Jenkins Reid',
      price: 16.99,
      originalPrice: 17.99,
      rating: 4.6,
      reviewCount: 147832,
      image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&h=300&fit=crop&crop=center',
      isPrime: true,
      isDeliveryTomorrow: true,
      discount: 6,
      inStock: true,
      dateAdded: 'December 10, 2023'
    },
    {
      id: 'so1',
      title: 'Renogy 100 Watt 12 Volt Monocrystalline Solar Panel - High Efficiency',
      price: 109,
      originalPrice: 149,
      rating: 4.7,
      reviewCount: 12456,
      image: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=300&h=300&fit=crop&crop=center',
      isPrime: true,
      discount: 27,
      inStock: false,
      dateAdded: 'December 8, 2023'
    },
    {
      id: 'be1',
      title: 'CeraVe Foaming Facial Cleanser - Normal to Oily Skin 12 fl oz',
      price: 14.99,
      originalPrice: 18.99,
      rating: 4.6,
      reviewCount: 89234,
      image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=300&h=300&fit=crop&crop=center',
      isPrime: true,
      isDeliveryTomorrow: true,
      discount: 21,
      inStock: true,
      dateAdded: 'December 5, 2023'
    },
    {
      id: 'h1',
      title: 'Instant Pot Duo 7-in-1 Electric Pressure Cooker, 8 Quart',
      price: 79,
      originalPrice: 119,
      rating: 4.7,
      reviewCount: 98234,
      image: 'https://images.unsplash.com/photo-1585515656617-d405f574bfa3?w=300&h=300&fit=crop&crop=center',
      isPrime: true,
      discount: 34,
      inStock: true,
      dateAdded: 'December 3, 2023'
    },
    {
      id: 's1',
      title: 'Fitbit Charge 5 Advanced Fitness & Health Tracker with GPS',
      price: 149,
      originalPrice: 179,
      rating: 4.2,
      reviewCount: 34567,
      image: 'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=300&h=300&fit=crop&crop=center',
      isPrime: true,
      discount: 17,
      inStock: true,
      dateAdded: 'December 1, 2023'
    },
    {
      id: 'ph1',
      title: 'Tylenol Extra Strength Pain Reliever - 500mg Caplets 100 Count',
      price: 12.99,
      originalPrice: 15.99,
      rating: 4.7,
      reviewCount: 23456,
      image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=300&h=300&fit=crop&crop=center',
      isPrime: true,
      isDeliveryTomorrow: true,
      discount: 19,
      inStock: true,
      dateAdded: 'November 28, 2023'
    }
  ]);

  const removeFromWishlist = (productId: string) => {
    setWishlistItems(prev => prev.filter(item => item.id !== productId));
  };

  const addToCart = (productId: string) => {
    console.log('Added to cart:', productId);
  };

  const moveToCart = (productId: string) => {
    addToCart(productId);
    removeFromWishlist(productId);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Wishlist</h1>
        <div className="text-sm text-gray-600">
          {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'}
        </div>
      </div>

      {wishlistItems.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500 mb-4">
            <i className="ri-heart-line text-6xl"></i>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Your wishlist is empty</h3>
          <p className="text-gray-600 mb-4">
            Explore our products and save your favorites here.
          </p>
          <Link
            href="/"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium whitespace-nowrap inline-block"
          >
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlistItems.map((item) => (
            <div key={item.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
              <Link href={`/product/${item.id}`}>
                <div className="relative mb-3">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-48 object-cover rounded"
                  />
                  {item.discount && (
                    <div className="absolute top-2 left-2 bg-red-600 text-white px-2 py-1 text-xs font-bold rounded">
                      -{item.discount}%
                    </div>
                  )}
                  {item.isPrime && (
                    <div className="absolute top-2 right-2 bg-blue-500 text-white px-2 py-1 text-xs font-bold rounded">
                      Prime
                    </div>
                  )}
                </div>
              </Link>

              <div className="space-y-2">
                <Link href={`/product/${item.id}`}>
                  <h3 className="text-sm font-medium text-gray-900 line-clamp-2 hover:text-blue-600">
                    {item.title}
                  </h3>
                </Link>

                <div className="flex items-center space-x-1">
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <i
                        key={star}
                        className={`w-4 h-4 flex items-center justify-center ${
                          star <= Math.floor(item.rating)
                            ? 'ri-star-fill text-yellow-400'
                            : star - 0.5 <= item.rating
                            ? 'ri-star-half-fill text-yellow-400'
                            : 'ri-star-line text-gray-300'
                        }`}
                      ></i>
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">({item.reviewCount})</span>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-lg font-bold text-gray-900">${item.price}</span>
                  {item.originalPrice && item.originalPrice > item.price && (
                    <span className="text-sm text-gray-500 line-through">${item.originalPrice}</span>
                  )}
                </div>

                <div className="text-xs text-gray-500">
                  Added on {item.dateAdded}
                </div>

                {!item.inStock ? (
                  <div className="text-red-600 text-sm font-medium">
                    Currently unavailable
                  </div>
                ) : (
                  <>
                    {item.isDeliveryTomorrow && (
                      <div className="text-sm text-green-600">
                        <i className="ri-truck-line w-4 h-4 inline-flex items-center justify-center mr-1"></i>
                        FREE delivery tomorrow
                      </div>
                    )}
                  </>
                )}

                <div className="space-y-2 pt-2">
                  <button
                    onClick={() => moveToCart(item.id)}
                    disabled={!item.inStock}
                    className="w-full bg-[#febd69] hover:bg-[#f3a847] text-black font-medium py-2 px-4 rounded disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed whitespace-nowrap"
                  >
                    {item.inStock ? 'Move to Cart' : 'Currently Unavailable'}
                  </button>
                  <button
                    onClick={() => removeFromWishlist(item.id)}
                    className="w-full text-red-600 hover:text-red-800 font-medium py-2 px-4 rounded border border-red-300 hover:border-red-400 whitespace-nowrap"
                  >
                    Remove from Wishlist
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
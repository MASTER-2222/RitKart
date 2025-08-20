'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { apiClient, WishlistItem } from '../../utils/api';

export default function Wishlist() {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [removingItems, setRemovingItems] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await apiClient.getWishlist();
        
        if (response.success) {
          setWishlistItems(response.data || []);
        } else {
          setError(response.message || 'Failed to load wishlist');
        }
      } catch (err) {
        console.error('Error fetching wishlist:', err);
        setError('Failed to load wishlist. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchWishlist();
  }, []);

  const removeFromWishlist = async (productId: string) => {
    try {
      setRemovingItems(prev => new Set(prev).add(productId));
      
      const response = await apiClient.removeFromWishlist(productId);
      
      if (response.success) {
        setWishlistItems(prev => prev.filter(item => item.productId !== productId));
      } else {
        setError(response.message || 'Failed to remove item from wishlist');
      }
    } catch (err) {
      console.error('Error removing from wishlist:', err);
      setError('Failed to remove item. Please try again.');
    } finally {
      setRemovingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
    }
  };

  const addToCart = async (productId: string) => {
    try {
      const response = await apiClient.addToCart(productId, 1);
      
      if (response.success) {
        // TODO: Show success message or notification
        console.log('Added to cart successfully');
      } else {
        setError(response.message || 'Failed to add to cart');
      }
    } catch (err) {
      console.error('Error adding to cart:', err);
      setError('Failed to add to cart. Please try again.');
    }
  };

  const moveToCart = async (productId: string) => {
    await addToCart(productId);
    await removeFromWishlist(productId);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="animate-pulse">
          <div className="flex items-center justify-between mb-6">
            <div className="h-8 bg-gray-200 rounded w-32"></div>
            <div className="h-4 bg-gray-200 rounded w-16"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="border rounded-lg p-4">
                <div className="w-full h-48 bg-gray-200 rounded mb-3"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
                <div className="h-6 bg-gray-200 rounded w-1/3"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error && wishlistItems.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="text-center py-12">
          <div className="text-red-500 mb-4">
            <i className="ri-error-warning-line text-6xl"></i>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Wishlist</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Wishlist</h1>
        <div className="text-sm text-gray-600">
          {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'}
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <i className="ri-error-warning-line text-red-500 mr-2"></i>
            <span className="text-red-700">{error}</span>
          </div>
        </div>
      )}

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
              <Link href={`/product/${item.productId}`}>
                <div className="relative mb-3">
                  <img
                    src={item.product.image || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=300&h=300&fit=crop&crop=center'}
                    alt={item.product.name}
                    className="w-full h-48 object-cover rounded"
                  />
                  {item.product.discount && (
                    <div className="absolute top-2 left-2 bg-red-600 text-white px-2 py-1 text-xs font-bold rounded">
                      -{item.product.discount}%
                    </div>
                  )}
                  {item.product.isPrime && (
                    <div className="absolute top-2 right-2 bg-blue-500 text-white px-2 py-1 text-xs font-bold rounded">
                      Prime
                    </div>
                  )}
                </div>
              </Link>

              <div className="space-y-2">
                <Link href={`/product/${item.productId}`}>
                  <h3 className="text-sm font-medium text-gray-900 line-clamp-2 hover:text-blue-600">
                    {item.product.name}
                  </h3>
                </Link>

                <div className="flex items-center space-x-1">
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <i
                        key={star}
                        className={`w-4 h-4 flex items-center justify-center ${
                          star <= Math.floor(item.product.rating)
                            ? 'ri-star-fill text-yellow-400'
                            : star - 0.5 <= item.product.rating
                            ? 'ri-star-half-fill text-yellow-400'
                            : 'ri-star-line text-gray-300'
                        }`}
                      ></i>
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">({item.product.reviewCount})</span>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-lg font-bold text-gray-900">₹{item.product.price}</span>
                  {item.product.originalPrice && item.product.originalPrice > item.product.price && (
                    <span className="text-sm text-gray-500 line-through">₹{item.product.originalPrice}</span>
                  )}
                </div>

                <div className="text-xs text-gray-500">
                  Added on {new Date(item.dateAdded).toLocaleDateString()}
                </div>

                {item.product.brand && (
                  <div className="text-xs text-gray-600">
                    Brand: {item.product.brand}
                  </div>
                )}

                {!item.product.inStock ? (
                  <div className="text-red-600 text-sm font-medium">
                    Currently unavailable
                  </div>
                ) : (
                  <>
                    {item.product.isDeliveryTomorrow && (
                      <div className="text-sm text-green-600">
                        <i className="ri-truck-line w-4 h-4 inline-flex items-center justify-center mr-1"></i>
                        FREE delivery tomorrow
                      </div>
                    )}
                  </>
                )}

                <div className="space-y-2 pt-2">
                  <button
                    onClick={() => moveToCart(item.productId)}
                    disabled={!item.product.inStock || removingItems.has(item.productId)}
                    className="w-full bg-[#febd69] hover:bg-[#f3a847] text-black font-medium py-2 px-4 rounded disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed whitespace-nowrap"
                  >
                    {!item.product.inStock 
                      ? 'Currently Unavailable' 
                      : removingItems.has(item.productId) 
                      ? 'Moving to Cart...' 
                      : 'Move to Cart'
                    }
                  </button>
                  <button
                    onClick={() => removeFromWishlist(item.productId)}
                    disabled={removingItems.has(item.productId)}
                    className="w-full text-red-600 hover:text-red-800 font-medium py-2 px-4 rounded border border-red-300 hover:border-red-400 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                  >
                    {removingItems.has(item.productId) ? 'Removing...' : 'Remove from Wishlist'}
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
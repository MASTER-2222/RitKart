'use client';
import React from 'react';
import { useState, useEffect } from 'react';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';
import ProductCarousel from '../../../components/ProductCarousel';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiClient, Product, UserReview, ReviewStats } from '../../../utils/api';
import { useCurrency } from '../../../contexts/CurrencyContext';
import { createClient } from '../../../utils/supabase/client';
import UserReviewForm from '../../../components/UserReviewForm';
import UserReviewsList from '../../../components/UserReviewsList';
import StarRating from '../../../components/StarRating';

interface ProductDetailProps {
  productId: string;
}

// Reviews Section Component
interface ReviewsSectionProps {
  productId: string;
  user: any;
  product: Product;
}

function ReviewsSection({ productId, user, product }: ReviewsSectionProps) {
  const [userReviews, setUserReviews] = useState<UserReview[]>([]);
  const [reviewStats, setReviewStats] = useState<ReviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [existingUserReview, setExistingUserReview] = useState<UserReview | null>(null);

  useEffect(() => {
    fetchReviews();
    fetchReviewStats();
  }, [productId]);

  const fetchReviews = async () => {
    try {
      const response = await apiClient.getProductReviews(productId, { limit: 20 });
      if (response.success) {
        setUserReviews(response.data);
        
        // Check if current user has already reviewed this product
        if (user) {
          const userReview = response.data.find((review: UserReview) => review.user.id === user.id);
          setExistingUserReview(userReview || null);
        }
      }
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
    }
  };

  const fetchReviewStats = async () => {
    try {
      const response = await apiClient.getReviewStats(productId);
      if (response.success) {
        setReviewStats(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch review stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReviewSubmitted = (newReview: UserReview) => {
    if (existingUserReview) {
      // Update existing review
      setUserReviews(prev => prev.map(review => 
        review.id === existingUserReview.id ? newReview : review
      ));
    } else {
      // Add new review
      setUserReviews(prev => [newReview, ...prev]);
    }
    setExistingUserReview(newReview);
    setShowReviewForm(false);
    fetchReviewStats(); // Refresh stats
  };

  const handleReviewDeleted = (reviewId: string) => {
    setUserReviews(prev => prev.filter(review => review.id !== reviewId));
    setExistingUserReview(null);
    fetchReviewStats(); // Refresh stats
  };

  const handleReviewUpdated = (updatedReview: UserReview) => {
    setUserReviews(prev => prev.map(review => 
      review.id === updatedReview.id ? updatedReview : review
    ));
    setExistingUserReview(updatedReview);
    fetchReviewStats(); // Refresh stats
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse bg-gray-200 h-8 w-1/3 rounded"></div>
        <div className="animate-pulse bg-gray-200 h-32 rounded"></div>
        <div className="animate-pulse bg-gray-200 h-20 rounded"></div>
      </div>
    );
  }

  const combinedRating = reviewStats && reviewStats.totalReviews > 0 
    ? reviewStats.averageRating 
    : product.rating_average;
  
  const totalReviews = (reviewStats?.totalReviews || 0) + (product.total_reviews || 0);

  return (
    <div className="space-y-6">
      {/* Review Summary */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <StarRating
              rating={combinedRating}
              onRatingChange={() => {}}
              readonly={true}
              size="lg"
            />
            <span className="text-xl font-semibold">{combinedRating.toFixed(1)} out of 5</span>
          </div>
          <span className="text-sm text-gray-600">{totalReviews} total reviews</span>
        </div>

        {/* Rating Distribution */}
        {reviewStats && reviewStats.totalReviews > 0 && (
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map(rating => {
              const count = reviewStats.ratingDistribution[rating as keyof typeof reviewStats.ratingDistribution];
              const percentage = reviewStats.totalReviews > 0 ? (count / reviewStats.totalReviews) * 100 : 0;
              
              return (
                <div key={rating} className="flex items-center space-x-2 text-sm">
                  <span className="w-8">{rating} ★</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <span className="w-8 text-gray-600">{count}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Admin Reviews (if any) */}
      {product.reviews && (
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
          <h4 className="font-medium text-blue-800 mb-2">Editorial Review</h4>
          <div className="text-blue-700 leading-relaxed whitespace-pre-wrap">
            {product.reviews}
          </div>
        </div>
      )}

      {/* Write Review Section */}
      {user ? (
        <div>
          {existingUserReview ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-800 font-medium mb-2">You've already reviewed this product</p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowReviewForm(true)}
                  className="text-sm text-green-600 hover:text-green-800 font-medium"
                >
                  Edit Review
                </button>
              </div>
            </div>
          ) : (
            <div>
              {!showReviewForm ? (
                <button
                  onClick={() => setShowReviewForm(true)}
                  className="bg-blue-600 text-white px-6 py-2 rounded-md font-medium hover:bg-blue-700 transition-colors"
                >
                  Write a Review
                </button>
              ) : null}
            </div>
          )}

          {showReviewForm && (
            <UserReviewForm
              productId={productId}
              onReviewSubmitted={handleReviewSubmitted}
              existingReview={existingUserReview}
              onCancel={() => setShowReviewForm(false)}
            />
          )}
        </div>
      ) : (
        <div className="bg-gray-50 border rounded-lg p-4 text-center">
          <p className="text-gray-600 mb-2">Want to share your experience?</p>
          <Link 
            href={`/auth/login?redirect=product/${productId}`}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Sign in to write a review
          </Link>
        </div>
      )}

      {/* User Reviews */}
      <div>
        <h4 className="text-lg font-medium mb-4">Customer Reviews ({userReviews.length})</h4>
        <UserReviewsList
          reviews={userReviews}
          onReviewUpdated={handleReviewUpdated}
          onReviewDeleted={handleReviewDeleted}
          currentUserId={user?.id}
        />
      </div>
    </div>
  );
}

export default function ProductDetail({ productId }: ProductDetailProps) {
  const { selectedCurrency } = useCurrency(); // Add currency context
  const router = useRouter();
  const supabase = createClient();
  
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [updatingQuantity, setUpdatingQuantity] = useState(false);
  const [selectedTab, setSelectedTab] = useState('description');
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addingToCart, setAddingToCart] = useState(false);
  const [buyingNow, setBuyingNow] = useState(false);
  const [cartMessage, setCartMessage] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [relatedLoading, setRelatedLoading] = useState(true);
  
  // Wishlist functionality states
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [checkingWishlist, setCheckingWishlist] = useState(true);

  // Fetch product data from API
  useEffect(() => {
    fetchProduct();
    checkUserAuth();
  }, [productId, selectedCurrency]); // Add currency dependency

  // Fetch related products when main product is loaded
  useEffect(() => {
    if (product) {
      fetchRelatedProducts();
    }
  }, [product, selectedCurrency]);

  // Check wishlist status when user and product are loaded
  useEffect(() => {
    if (user && product) {
      checkWishlistStatus();
    } else if (!user) {
      setIsInWishlist(false);
      setCheckingWishlist(false);
    }
  }, [user, product]);

  // Check if product is in user's wishlist
  const checkWishlistStatus = async () => {
    try {
      setCheckingWishlist(true);
      const response = await apiClient.getWishlist();
      
      if (response.success && response.data) {
        const isProductInWishlist = response.data.some((item: any) => item.product.id === productId);
        setIsInWishlist(isProductInWishlist);
      }
    } catch (error) {
      console.error('Failed to check wishlist status:', error);
    } finally {
      setCheckingWishlist(false);
    }
  };

  // Check if user is authenticated
  const checkUserAuth = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    } catch (error) {
      console.error('Failed to check user authentication:', error);
    }
  };

  // Fetch related products
  const fetchRelatedProducts = async () => {
    try {
      setRelatedLoading(true);
      console.log(`🔄 Loading related products for ${productId}...`);
      
      const response = await apiClient.getRelatedProducts(productId, { limit: 10 });
      
      if (response.success) {
        setRelatedProducts(response.data || []);
        console.log(`✅ Loaded ${response.data?.length || 0} related products`);
      } else {
        console.error('Failed to fetch related products:', response.message);
        setRelatedProducts([]);
      }
    } catch (err) {
      console.error('Failed to fetch related products:', err);
      setRelatedProducts([]);
    } finally {
      setRelatedLoading(false);
    }
  };

  // Listen for currency change events
  useEffect(() => {
    const handleCurrencyChange = () => {
      console.log(`🔄 Currency changed, refreshing product ${productId} data...`);
      fetchProduct();
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('currencyChanged', handleCurrencyChange);
      return () => window.removeEventListener('currencyChanged', handleCurrencyChange);
    }
  }, [productId]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log(`🔄 Loading product ${productId} in ${selectedCurrency.code} currency...`);
      
      const response = await apiClient.getProductById(productId, selectedCurrency.code); // Add currency
      
      if (response.success) {
        setProduct(response.data);
        console.log(`✅ Loaded product in ${selectedCurrency.code}`);
      } else {
        setError('Product not found');
      }
    } catch (err) {
      console.error('Failed to fetch product:', err);
      setError('Failed to load product');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading product details...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Product Not Found</h1>
            <p className="text-gray-600 mb-4">{error || 'The product you are looking for does not exist.'}</p>
            <Link href="/" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
              Go Back to Home
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Handle Add to Cart functionality
  const handleAddToCart = async () => {
    // Check if user is authenticated
    if (!user) {
      // Redirect to login page with return URL
      router.push(`/auth/login?redirect=product/${productId}`);
      return;
    }

    if (!product) {
      setCartMessage('Product information is not available');
      return;
    }

    setAddingToCart(true);
    setCartMessage(null);

    try {
      console.log(`🛒 Adding product ${productId} to cart with quantity ${quantity}`);
      
      const response = await apiClient.addToCart(productId, quantity);
      
      if (response.success) {
        setCartMessage('✅ Product added to cart successfully!');
        // Auto-hide success message after 3 seconds
        setTimeout(() => setCartMessage(null), 3000);
      } else {
        setCartMessage('❌ Failed to add product to cart: ' + (response.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Add to cart error:', error);
      setCartMessage('❌ Failed to add product to cart. Please try again.');
    } finally {
      setAddingToCart(false);
    }
  };

  // Handle Buy Now functionality
  const handleBuyNow = async () => {
    // Check if user is authenticated
    if (!user) {
      // Redirect to login page with return URL
      router.push(`/auth/login?redirect=product/${productId}`);
      return;
    }

    if (!product) {
      setCartMessage('Product information is not available');
      return;
    }

    setBuyingNow(true);
    setCartMessage(null);

    try {
      console.log(`🛒 Buy Now: Adding product ${productId} to cart with quantity ${quantity}`);
      
      const response = await apiClient.addToCart(productId, quantity);
      
      if (response.success) {
        console.log('✅ Product added to cart, redirecting to cart page...');
        // Redirect to cart page immediately after successful addition
        router.push('/cart');
      } else {
        setCartMessage('❌ Failed to add product to cart: ' + (response.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Buy now error:', error);
      setCartMessage('❌ Failed to add product to cart. Please try again.');
    } finally {
      setBuyingNow(false);
    }
  };

  // Handle wishlist toggle
  const handleWishlistToggle = async () => {
    // Check if user is authenticated
    if (!user) {
      // Redirect to login page with return URL
      router.push(`/auth/login?redirect=product/${productId}`);
      return;
    }

    if (!product) {
      return;
    }

    setWishlistLoading(true);

    try {
      let response;
      if (isInWishlist) {
        // Remove from wishlist
        console.log(`💔 Removing product ${productId} from wishlist`);
        response = await apiClient.removeFromWishlist(productId);
        
        if (response.success) {
          setIsInWishlist(false);
          setCartMessage('💔 Removed from wishlist');
        } else {
          setCartMessage('❌ Failed to remove from wishlist: ' + (response.message || 'Unknown error'));
        }
      } else {
        // Add to wishlist
        console.log(`❤️ Adding product ${productId} to wishlist`);
        response = await apiClient.addToWishlist(productId);
        
        if (response.success) {
          setIsInWishlist(true);
          setCartMessage('❤️ Added to wishlist');
        } else {
          setCartMessage('❌ Failed to add to wishlist: ' + (response.message || 'Unknown error'));
        }
      }

      // Auto-hide message after 3 seconds
      setTimeout(() => setCartMessage(null), 3000);
    } catch (error) {
      console.error('Wishlist toggle error:', error);
      setCartMessage('❌ Failed to update wishlist. Please try again.');
      setTimeout(() => setCartMessage(null), 3000);
    } finally {
      setWishlistLoading(false);
    }
  };

  // Calculate discount percentage
  const discount = product.original_price && product.original_price > product.price 
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
          <Link href="/" className="hover:text-blue-600">Home</Link>
          <span>/</span>
          <Link href="/electronics" className="hover:text-blue-600">Electronics</Link>
          <span>/</span>
          <span className="text-gray-900 truncate">{product.name}</span>
        </nav>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Product Images */}
            <div className="space-y-4">
              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                <img 
                  src={product.images[selectedImage] || product.images[0] || '/placeholder-product.jpg'}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
              
              {product.images.length > 1 && (
                <div className="flex space-x-2">
                  {product.images.slice(0, 4).map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`w-16 h-16 rounded border-2 overflow-hidden ${
                        selectedImage === index ? 'border-blue-600' : 'border-gray-200'
                      }`}
                    >
                      <img src={image} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              <div>
                <div className="flex items-start justify-between mb-2">
                  <h1 className="text-2xl font-bold text-gray-900 flex-1 mr-4">{product.name}</h1>
                  
                  {/* Quick Wishlist Toggle Icon */}
                  {user && (
                    <button
                      onClick={handleWishlistToggle}
                      disabled={wishlistLoading || checkingWishlist}
                      className={`flex-shrink-0 p-2 rounded-full transition-all duration-200 ${
                        wishlistLoading || checkingWishlist
                          ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                          : isInWishlist
                            ? 'bg-red-100 text-red-600 hover:bg-red-200'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                      title={isInWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
                    >
                      {wishlistLoading ? (
                        <svg className="animate-spin h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      ) : checkingWishlist ? (
                        <div className="animate-pulse bg-gray-300 w-6 h-6 rounded"></div>
                      ) : (
                        <i className={`text-2xl ${isInWishlist ? 'ri-heart-fill' : 'ri-heart-line'}`}></i>
                      )}
                    </button>
                  )}
                </div>
                
                <div className="flex items-center space-x-2 mb-4">
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <i 
                        key={star}
                        className={`w-5 h-5 ${
                          star <= Math.floor(product.rating_average) 
                            ? 'ri-star-fill text-yellow-400' 
                            : star - 0.5 <= product.rating_average 
                              ? 'ri-star-half-fill text-yellow-400'
                              : 'ri-star-line text-gray-300'
                        }`}
                      ></i>
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">({product.total_reviews} reviews)</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-3">
                  <span className="text-3xl font-bold text-gray-900">
                    {product.formatted_price || `${selectedCurrency.symbol}${product.price}`}
                  </span>
                  {product.original_price && product.original_price > product.price && (
                    <>
                      <span className="text-lg text-gray-500 line-through">
                        {product.formatted_original_price || `${selectedCurrency.symbol}${product.original_price}`}
                      </span>
                      <span className="bg-red-600 text-white px-2 py-1 text-sm font-bold rounded">
                        -{discount}% Off
                      </span>
                    </>
                  )}
                </div>
                
                <div className="flex items-center space-x-4 text-sm">
                  <div className="flex items-center text-blue-600">
                    <i className="ri-award-line w-4 h-4 mr-1"></i>
                    <span>Prime</span>
                  </div>
                  <div className="flex items-center text-green-600">
                    <i className="ri-truck-line w-4 h-4 mr-1"></i>
                    <span>FREE delivery tomorrow</span>
                  </div>
                </div>
                
                <div className="flex items-center text-sm">
                  <i className="ri-check-line w-4 h-4 mr-1 text-green-600"></i>
                  <span className="text-green-600">In Stock ({product.stock_quantity} available)</span>
                </div>
                
                <div className="text-sm text-gray-600">
                  <i className="ri-shield-check-line w-4 h-4 mr-1"></i>
                  Ships from RitZone
                </div>
                
                <div className="text-sm text-gray-600">
                  <i className="ri-arrow-go-back-line w-4 h-4 mr-1"></i>
                  Return policy: 30 days
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Quantity:</label>
                  <select
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value))}
                    className="border rounded px-3 py-2 w-20"
                  >
                    {[...Array(Math.min(10, product.stock_quantity))].map((_, i) => (
                      <option key={i + 1} value={i + 1}>{i + 1}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-3">
                  {/* Cart Message */}
                  {cartMessage && (
                    <div className={`p-3 rounded-lg text-sm font-medium ${
                      cartMessage.includes('✅') || cartMessage.includes('❤️') 
                        ? 'bg-green-100 text-green-800 border border-green-200' 
                        : cartMessage.includes('💔')
                          ? 'bg-blue-100 text-blue-800 border border-blue-200'
                          : 'bg-red-100 text-red-800 border border-red-200'
                    }`}>
                      {cartMessage}
                    </div>
                  )}

                  {/* Wishlist Button */}
                  {user && (
                    <button
                      onClick={handleWishlistToggle}
                      disabled={wishlistLoading || checkingWishlist}
                      className={`w-full font-bold py-3 px-6 rounded-lg text-lg transition-all duration-200 flex items-center justify-center space-x-2 ${
                        wishlistLoading || checkingWishlist
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : isInWishlist
                            ? 'bg-red-50 hover:bg-red-100 text-red-600 border-2 border-red-200 hover:border-red-300'
                            : 'bg-gray-50 hover:bg-gray-100 text-gray-700 border-2 border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {wishlistLoading ? (
                        <>
                          <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span>Updating Wishlist...</span>
                        </>
                      ) : checkingWishlist ? (
                        <>
                          <div className="animate-pulse bg-gray-300 w-5 h-5 rounded"></div>
                          <span>Checking Wishlist...</span>
                        </>
                      ) : isInWishlist ? (
                        <>
                          <i className="ri-heart-fill text-xl"></i>
                          <span>Remove from Wishlist</span>
                        </>
                      ) : (
                        <>
                          <i className="ri-heart-line text-xl"></i>
                          <span>Add to Wishlist</span>
                        </>
                      )}
                    </button>
                  )}
                  
                  <button 
                    onClick={handleAddToCart}
                    disabled={addingToCart || buyingNow || product.stock_quantity === 0}
                    className={`w-full font-bold py-3 px-6 rounded-lg text-lg transition-colors ${
                      addingToCart || buyingNow || product.stock_quantity === 0
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-[#febd69] hover:bg-[#f3a847] text-black'
                    }`}
                  >
                    {addingToCart ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Adding to Cart...
                      </span>
                    ) : product.stock_quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
                  </button>
                  <button 
                    onClick={handleBuyNow}
                    disabled={addingToCart || buyingNow || product.stock_quantity === 0}
                    className={`w-full font-bold py-3 px-6 rounded-lg text-lg transition-colors ${
                      addingToCart || buyingNow || product.stock_quantity === 0
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-[#ff9f00] hover:bg-[#e88a00] text-black'
                    }`}
                  >
                    {buyingNow ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </span>
                    ) : product.stock_quantity === 0 ? 'Out of Stock' : 'Buy Now'}
                  </button>
                </div>
              </div>

              <div className="pt-4 border-t">
                <div className="text-sm text-gray-600 space-y-1">
                  <div><i className="ri-shield-check-line w-4 h-4 mr-1"></i> Secure transaction</div>
                  <div><i className="ri-truck-line w-4 h-4 mr-1"></i> Ships from RitZone</div>
                  <div><i className="ri-refresh-line w-4 h-4 mr-1"></i> Return policy: 30 days</div>
                </div>
              </div>
            </div>
          </div>

          {/* Product Details Tabs */}
          <div className="mt-12">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                {['description', 'features', 'specifications', 'reviews'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setSelectedTab(tab)}
                    className={`py-2 px-1 border-b-2 font-medium text-sm capitalize ${
                      selectedTab === tab
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </nav>
            </div>

            <div className="mt-6">
              {selectedTab === 'description' && (
                <div className="prose max-w-none">
                  <h3 className="text-lg font-medium mb-4">Product Description</h3>
                  <p className="text-gray-700 leading-relaxed">
                    {product.description || product.short_description || 'No detailed description available.'}
                  </p>
                </div>
              )}

              {selectedTab === 'features' && (
                <div>
                  <h3 className="text-lg font-medium mb-4">Features</h3>
                  {product.features && product.features.length > 0 ? (
                    <ul className="space-y-2">
                      {product.features.map((feature, index) => (
                        <li key={index} className="flex items-start">
                          <i className="ri-check-line w-5 h-5 text-green-600 mr-2 mt-0.5"></i>
                          <span className="text-gray-700">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-500">No specific features listed for this product.</p>
                  )}
                </div>
              )}

              {selectedTab === 'specifications' && (
                <div>
                  <h3 className="text-lg font-medium mb-4">Technical Specifications</h3>
                  {product.specifications && Object.keys(product.specifications).length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Object.entries(product.specifications).map(([key, value]) => (
                        <div key={key} className="border-b border-gray-200 pb-2">
                          <dt className="font-medium text-gray-900">{key}</dt>
                          <dd className="text-gray-700">{String(value)}</dd>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">No specifications available for this product.</p>
                  )}
                </div>
              )}

              {selectedTab === 'reviews' && (
                <div>
                  <h3 className="text-lg font-medium mb-6">Customer Reviews</h3>
                  <ReviewsSection productId={product.id} user={user} product={product} />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Related Products */}
        <div className="mt-12">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Related Products</h2>
            
            {relatedLoading ? (
              // Loading state
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {[...Array(10)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="bg-gray-200 aspect-square rounded-lg mb-2"></div>
                    <div className="bg-gray-200 h-4 rounded mb-1"></div>
                    <div className="bg-gray-200 h-4 w-2/3 rounded"></div>
                  </div>
                ))}
              </div>
            ) : relatedProducts.length > 0 ? (
              // Related products display
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {relatedProducts.map((relatedProduct) => (
                  <div
                    key={relatedProduct.id}
                    className="group cursor-pointer border rounded-lg p-3 hover:shadow-md transition-shadow"
                    onClick={() => router.push(`/product/${relatedProduct.id}`)}
                  >
                    {/* Product Image */}
                    <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-3">
                      <img
                        src={relatedProduct.images?.[0] || '/placeholder-product.jpg'}
                        alt={relatedProduct.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                    </div>
                    
                    {/* Product Details */}
                    <div className="space-y-1">
                      <h3 className="font-medium text-sm text-gray-900 truncate group-hover:text-blue-600" title={relatedProduct.name}>
                        {relatedProduct.name}
                      </h3>
                      
                      {relatedProduct.brand && (
                        <p className="text-xs text-gray-500">{relatedProduct.brand}</p>
                      )}
                      
                      {/* Rating */}
                      {relatedProduct.rating_average && relatedProduct.rating_average > 0 && (
                        <div className="flex items-center text-xs">
                          <div className="flex items-center mr-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <i 
                                key={star}
                                className={`w-3 h-3 ${
                                  star <= Math.floor(relatedProduct.rating_average) 
                                    ? 'ri-star-fill text-yellow-400' 
                                    : 'ri-star-line text-gray-300'
                                }`}
                              ></i>
                            ))}
                          </div>
                          <span className="text-gray-500">({relatedProduct.total_reviews || 0})</span>
                        </div>
                      )}
                      
                      {/* Price */}
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-sm text-gray-900">
                          {relatedProduct.formatted_price || `${selectedCurrency.symbol}${relatedProduct.price}`}
                        </span>
                        {relatedProduct.original_price && relatedProduct.original_price > relatedProduct.price && (
                          <span className="text-xs text-gray-500 line-through">
                            {relatedProduct.formatted_original_price || `${selectedCurrency.symbol}${relatedProduct.original_price}`}
                          </span>
                        )}
                      </div>
                      
                      {/* Stock Status */}
                      <div className="text-xs">
                        {relatedProduct.stock_quantity > 0 ? (
                          <span className="text-green-600">In Stock</span>
                        ) : (
                          <span className="text-red-600">Out of Stock</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              // No related products found
              <div className="bg-gray-50 p-6 rounded-lg text-center">
                <div className="text-gray-400 text-4xl mb-2">🛍️</div>
                <p className="text-gray-600">No related products found</p>
                <p className="text-sm text-gray-500 mt-2">
                  Check back later for similar products.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
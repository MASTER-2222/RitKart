'use client';
import React from 'react';
import { useState, useEffect } from 'react';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';
import ProductCarousel from '../../../components/ProductCarousel';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiClient, Product } from '../../../utils/api';
import { useCurrency } from '../../../contexts/CurrencyContext';
import { createClient } from '../../../utils/supabase/client';

interface ProductDetailProps {
  productId: string;
}

export default function ProductDetail({ productId }: ProductDetailProps) {
  const { selectedCurrency } = useCurrency(); // Add currency context
  const router = useRouter();
  const supabase = createClient();
  
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedTab, setSelectedTab] = useState('description');
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addingToCart, setAddingToCart] = useState(false);
  const [cartMessage, setCartMessage] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);

  // Fetch product data from API
  useEffect(() => {
    fetchProduct();
    checkUserAuth();
  }, [productId, selectedCurrency]); // Add currency dependency

  // Check if user is authenticated
  const checkUserAuth = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    } catch (error) {
      console.error('Failed to check user authentication:', error);
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
                <h1 className="text-2xl font-bold text-gray-900 mb-2">{product.name}</h1>
                
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
                  <button className="w-full bg-[#febd69] hover:bg-[#f3a847] text-black font-bold py-3 px-6 rounded-lg text-lg">
                    Add to Cart
                  </button>
                  <button className="w-full bg-[#ff9f00] hover:bg-[#e88a00] text-black font-bold py-3 px-6 rounded-lg text-lg">
                    Buy Now
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
                  <h3 className="text-lg font-medium mb-4">Customer Reviews</h3>
                  <div className="bg-gray-50 p-6 rounded-lg text-center">
                    <div className="text-gray-400 text-4xl mb-2">💬</div>
                    <p className="text-gray-600">Reviews functionality coming soon!</p>
                    <p className="text-sm text-gray-500 mt-2">
                      This product has {product.total_reviews} reviews with an average rating of {product.rating_average} stars.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Related Products */}
        <div className="mt-12">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Related Products</h2>
            <div className="bg-gray-50 p-6 rounded-lg text-center">
              <div className="text-gray-400 text-4xl mb-2">🛍️</div>
              <p className="text-gray-600">Related products feature coming soon!</p>
              <p className="text-sm text-gray-500 mt-2">
                Discover more products similar to this one.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
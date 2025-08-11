'use client';
import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';
import ProductCard from '../../../components/ProductCard';
import { apiClient, Product, Category } from '../../../utils/api';
import { useCurrency } from '../../../contexts/CurrencyContext';

interface CategoryListingProps {
  categorySlug: string;
}

export default function CategoryListing({ categorySlug }: CategoryListingProps) {
  const router = useRouter();
  const { selectedCurrency } = useCurrency(); // Add currency context
  
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('featured');
  const [priceRange, setPriceRange] = useState([0, 2000]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [minRating, setMinRating] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Mobile sidebar toggle
  const itemsPerPage = 12;

  // Dynamic state from API
  const [products, setProducts] = useState<Product[]>([]);
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Fallback category data (still used for category info if API fails)
  const fallbackCategories = {
    electronics: {
      title: 'Electronics',
      description: 'Discover the latest in technology and gadgets',
      image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=1200&h=300&fit=crop&crop=center'
    },
    fashion: {
      title: 'Fashion',
      description: 'Trendy clothing and accessories for every style',
      image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=1200&h=300&fit=crop&crop=center'
    },
    books: {
      title: 'Books',
      description: 'Bestsellers, classics, and new releases',
      image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=1200&h=300&fit=crop&crop=center'
    },
    home: {
      title: 'Home & Garden',
      description: 'Everything for your home and garden',
      image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1200&h=300&fit=crop&crop=center'
    },
    sports: {
      title: 'Sports & Outdoors',
      description: 'Gear for fitness, sports, and outdoor adventures',
      image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1200&h=300&fit=crop&crop=center'
    },
    grocery: {
      title: 'Grocery',
      description: 'Fresh food and pantry essentials',
      image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=1200&h=300&fit=crop&crop=center'
    },
    appliances: {
      title: 'Appliances',
      description: 'Kitchen and home appliances',
      image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1200&h=300&fit=crop&crop=center'
    },
    beauty: {
      title: 'Beauty & Personal Care',
      description: 'Skincare, makeup, and personal care products',
      image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=1200&h=300&fit=crop&crop=center'
    },
    solar: {
      title: 'Solar',
      description: 'Solar panels, batteries, and renewable energy solutions',
      image: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=1200&h=300&fit=crop&crop=center'
    },
    pharmacy: {
      title: 'Pharmacy',
      description: 'Health, wellness, and pharmaceutical products',
      image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=1200&h=300&fit=crop&crop=center'
    }
  };

  // Fetch products and category data from API
  useEffect(() => {
    fetchCategoryData();
  }, [categorySlug, currentPage, selectedCurrency]); // Add selectedCurrency dependency

  const fetchCategoryData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log(`🔄 Fetching ${categorySlug} products in ${selectedCurrency.code} currency...`);
      
      // Fetch products for this category from API with pagination AND CURRENCY
      const productsResponse = await apiClient.getProductsByCategory(categorySlug, {
        limit: itemsPerPage,
        page: currentPage,
        currency: selectedCurrency.code // Add currency parameter
      });
      
      if (productsResponse.success) {
        setProducts(productsResponse.data);
        setTotalCount(productsResponse.pagination?.totalCount || productsResponse.data.length);
        setTotalPages(productsResponse.pagination?.totalPages || Math.ceil(productsResponse.data.length / itemsPerPage));
        
        console.log(`✅ Loaded ${productsResponse.data.length} products in ${selectedCurrency.code}`);
      } else {
        console.error('Failed to fetch products:', productsResponse.message);
        setError('Failed to load products for this category');
      }

      // Try to fetch category info from API
      try {
        const categoryResponse = await apiClient.getCategoryBySlug(categorySlug);
        if (categoryResponse.success) {
          setCategory(categoryResponse.data);
        }
      } catch (categoryError) {
        console.warn('Could not fetch category details, using fallback');
      }

    } catch (err) {
      console.error('Error fetching category data:', err);
      setError('Failed to load category data');
    } finally {
      setLoading(false);
    }
  };

  // Get current category info (either from API or fallback)
  const currentCategory = category || {
    name: fallbackCategories[categorySlug as keyof typeof fallbackCategories]?.title || 'Category',
    description: fallbackCategories[categorySlug as keyof typeof fallbackCategories]?.description || '',
    image_url: fallbackCategories[categorySlug as keyof typeof fallbackCategories]?.image || ''
  };

  // Convert API products to format expected by ProductCard component
  const convertedProducts = useMemo(() => {
    return products.map(product => ({
      id: product.id,
      title: product.name,
      price: product.price,
      originalPrice: product.original_price,
      rating: product.rating_average,
      reviewCount: product.total_reviews,
      image: product.images[0] || 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=300&h=300&fit=crop&crop=center',
      isPrime: product.is_featured, // Using is_featured as isPrime flag
      isDeliveryTomorrow: product.stock_quantity > 0,
      discount: product.original_price > product.price ? 
        Math.round(((product.original_price - product.price) / product.original_price) * 100) : 0,
      brand: product.brand,
      // NEW: Add currency information
      currency: selectedCurrency.symbol,
      currencyCode: selectedCurrency.code
    }));
  }, [products, selectedCurrency]);

  // Filter products based on user selections
  const filteredProducts = useMemo(() => {
    return convertedProducts.filter(product => {
      const withinPriceRange = product.price >= priceRange[0] && product.price <= priceRange[1];
      const matchesBrand = selectedBrands.length === 0 || selectedBrands.includes(product.brand || '');
      const meetsRatingThreshold = product.rating >= minRating;
      
      return withinPriceRange && matchesBrand && meetsRatingThreshold;
    });
  }, [convertedProducts, priceRange, selectedBrands, minRating]);

  // Sort products
  const sortedProducts = useMemo(() => {
    const sorted = [...filteredProducts];
    
    switch (sortBy) {
      case 'price-low':
        return sorted.sort((a, b) => a.price - b.price);
      case 'price-high':
        return sorted.sort((a, b) => b.price - a.price);
      case 'rating':
        return sorted.sort((a, b) => b.rating - a.rating);
      case 'newest':
        return sorted; // API should return newest first by default
      case 'featured':
      default:
        return sorted.sort((a, b) => (b.isPrime ? 1 : 0) - (a.isPrime ? 1 : 0));
    }
  }, [filteredProducts, sortBy]);

  // Get unique brands for filter
  const availableBrands = useMemo(() => {
    const brands = convertedProducts.map(p => p.brand).filter(Boolean);
    return [...new Set(brands)].sort();
  }, [convertedProducts]);

  // Since we're using server-side pagination, we don't need client-side pagination
  // All products from API are for the current page
  const paginatedProducts = useMemo(() => {
    return sortedProducts; // Return all sorted products since API already handles pagination
  }, [sortedProducts]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Close mobile sidebar when filter is applied
  const closeMobileSidebar = () => {
    if (window.innerWidth < 1024) { // lg breakpoint
      setIsSidebarOpen(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center min-h-[calc(100vh-160px)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading {categorySlug} products...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error && products.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center min-h-[calc(100vh-160px)]">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={fetchCategoryData}
              className="bg-[#febd69] hover:bg-[#f3a847] text-black font-bold py-2 px-4 rounded"
            >
              Try Again
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Category Hero Section */}
      <div className="relative mb-6">
        <div 
          className="h-48 bg-cover bg-center relative"
          style={{ backgroundImage: `url(${currentCategory.image_url})` }}
        >
          <div className="absolute inset-0 bg-black bg-opacity-50"></div>
          <div className="relative z-10 flex items-center justify-center h-full text-center text-white">
            <div>
              <h1 className="text-5xl font-bold mb-2">{currentCategory.name}</h1>
              <p className="text-2xl">{currentCategory.description}</p>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-6">
        {/* Mobile Filter Toggle */}
        <div className="lg:hidden mb-4">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="flex items-center justify-center w-full bg-white border rounded-lg p-3 text-gray-700 hover:bg-gray-50"
          >
            <i className="ri-filter-3-line mr-2"></i>
            Filters
            <i className={`ri-arrow-${isSidebarOpen ? 'up' : 'down'}-s-line ml-2`}></i>
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Sidebar - Filters */}
          <div className={`lg:w-64 ${isSidebarOpen ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white rounded-lg shadow-sm border p-6 sticky top-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <i className="ri-filter-3-line mr-2"></i>
                Filters
              </h3>
              
              {/* Price Range Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">Price Range</label>
                <div className="space-y-2">
                  <input
                    type="range"
                    min="0"
                    max="2000"
                    step="50"
                    value={priceRange[0]}
                    onChange={(e) => {
                      setPriceRange([parseInt(e.target.value), priceRange[1]]);
                      closeMobileSidebar();
                    }}
                    className="w-full accent-orange-500"
                  />
                  <input
                    type="range"
                    min="0"
                    max="2000"
                    step="50"
                    value={priceRange[1]}
                    onChange={(e) => {
                      setPriceRange([priceRange[0], parseInt(e.target.value)]);
                      closeMobileSidebar();
                    }}
                    className="w-full accent-orange-500"
                  />
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>{selectedCurrency.symbol}{priceRange[0]}</span>
                    <span>{selectedCurrency.symbol}{priceRange[1]}</span>
                  </div>
                </div>
              </div>

              {/* Brand Filter */}
              {availableBrands.length > 0 && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">Brands</label>
                  <div className="max-h-48 overflow-y-auto space-y-2">
                    {availableBrands.slice(0, 15).map(brand => (
                      <label key={brand} className="flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedBrands.includes(brand)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedBrands([...selectedBrands, brand]);
                            } else {
                              setSelectedBrands(selectedBrands.filter(b => b !== brand));
                            }
                            closeMobileSidebar();
                          }}
                          className="mr-3 rounded accent-orange-500"
                        />
                        <span className="text-sm text-gray-600 hover:text-gray-900">{brand}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Rating Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">Minimum Rating</label>
                <select
                  value={minRating}
                  onChange={(e) => {
                    setMinRating(parseInt(e.target.value));
                    closeMobileSidebar();
                  }}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value={0}>All Ratings</option>
                  <option value={4}>4+ Stars ⭐⭐⭐⭐</option>
                  <option value={3}>3+ Stars ⭐⭐⭐</option>
                  <option value={2}>2+ Stars ⭐⭐</option>
                </select>
              </div>

              {/* Clear Filters */}
              <button
                onClick={() => {
                  setPriceRange([0, 2000]);
                  setSelectedBrands([]);
                  setMinRating(0);
                  closeMobileSidebar();
                }}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-lg text-sm font-medium transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Header with Sort Options */}
            <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{currentCategory.name}</h2>
                  <p className="text-gray-600">
                    {error ? 'Showing available products' : `${totalCount} products available`}
                  </p>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <label className="text-sm text-gray-600">Sort by:</label>
                    <select 
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="border rounded-lg px-3 py-2 text-sm pr-8 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    >
                      <option value="featured">Featured</option>
                      <option value="newest">Newest</option>
                      <option value="price-low">Price: Low to High</option>
                      <option value="price-high">Price: High to Low</option>
                      <option value="rating">Customer Rating</option>
                    </select>
                  </div>
                  
                  <div className="flex border rounded-lg overflow-hidden">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 transition-colors ${viewMode === 'grid' ? 'bg-orange-500 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                      <i className="ri-grid-line w-4 h-4 flex items-center justify-center"></i>
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 transition-colors ${viewMode === 'list' ? 'bg-orange-500 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                      <i className="ri-list-unordered w-4 h-4 flex items-center justify-center"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>

        {/* Products Display */}
        <div className="mb-4">
          <p className="text-gray-600">
            Showing <strong>{paginatedProducts.length}</strong> of <strong>{sortedProducts.length}</strong> products
            {selectedBrands.length > 0 && ` (filtered by: ${selectedBrands.join(', ')})`}
          </p>
        </div>

        {sortedProducts.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
            <div className="text-gray-400 text-6xl mb-4">📦</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-600 mb-4">Try adjusting your filters or check back later for new products.</p>
            <button
              onClick={() => {
                setPriceRange([0, 2000]);
                setSelectedBrands([]);
                setMinRating(0);
              }}
              className="bg-[#febd69] hover:bg-[#f3a847] text-black font-bold py-2 px-4 rounded"
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {paginatedProducts.map(product => (
                <ProductCard key={product.id} {...product} />
              ))}
            </div>
          ) : (
            /* List View - Professional Layout */
            <div className="space-y-4">
              {paginatedProducts.map(product => (
                <div 
                  key={product.id}
                  className="bg-white rounded-lg shadow-sm border p-4 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => router.push(`/product/${product.id}`)}
                >
                  <div className="flex gap-4">
                    {/* Product Image */}
                    <div className="flex-shrink-0 w-32 h-32 relative">
                      <img
                        src={product.image}
                        alt={product.title}
                        className="w-full h-full object-cover rounded-md"
                      />
                      {product.discount > 0 && (
                        <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                          -{product.discount}%
                        </div>
                      )}
                      {product.isPrime && (
                        <div className="absolute top-2 right-2 bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded">
                          Prime
                        </div>
                      )}
                    </div>
                    
                    {/* Product Details */}
                    <div className="flex-grow min-w-0">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-medium text-gray-900 line-clamp-2 hover:text-blue-600 transition-colors">
                          {product.title}
                        </h3>
                      </div>
                      
                      {/* Rating */}
                      <div className="flex items-center mb-2">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <svg
                              key={i}
                              className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'text-yellow-400' : 'text-gray-300'}`}
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                        <span className="ml-2 text-sm text-gray-600">
                          {product.rating} ({product.reviewCount.toLocaleString()})
                        </span>
                      </div>
                      
                      {/* Price and Actions Row */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl font-bold text-gray-900">
                            ${product.price}
                          </span>
                          {product.originalPrice && product.originalPrice > product.price && (
                            <span className="text-sm text-gray-500 line-through">
                              ${product.originalPrice}
                            </span>
                          )}
                        </div>
                        
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/product/${product.id}`);
                          }}
                          className="bg-[#febd69] hover:bg-[#f3a847] text-black font-medium py-2 px-4 rounded transition-colors"
                        >
                          Add to Cart
                        </button>
                      </div>
                      
                      {/* Delivery Info */}
                      {product.isDeliveryTomorrow && (
                        <div className="mt-2 text-sm text-green-600 font-medium">
                          ✓ FREE delivery tomorrow
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex justify-center">
            <div className="flex items-center space-x-1">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-gray-300 rounded-l-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium text-gray-700"
              >
                Previous
              </button>
              
              {/* Generate page numbers */}
              {(() => {
                const pages = [];
                const maxVisiblePages = 5;
                let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
                let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
                
                // Adjust startPage if we're near the end
                if (endPage - startPage + 1 < maxVisiblePages) {
                  startPage = Math.max(1, endPage - maxVisiblePages + 1);
                }
                
                // Add first page and ellipsis if needed
                if (startPage > 1) {
                  pages.push(
                    <button
                      key={1}
                      onClick={() => handlePageChange(1)}
                      className="px-3 py-2 border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      1
                    </button>
                  );
                  if (startPage > 2) {
                    pages.push(
                      <span key="ellipsis-start" className="px-3 py-2 text-gray-500">
                        ...
                      </span>
                    );
                  }
                }
                
                // Add visible page numbers
                for (let i = startPage; i <= endPage; i++) {
                  pages.push(
                    <button
                      key={i}
                      onClick={() => handlePageChange(i)}
                      className={`px-3 py-2 border text-sm font-medium ${
                        currentPage === i 
                          ? 'bg-blue-600 border-blue-600 text-white' 
                          : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {i}
                    </button>
                  );
                }
                
                // Add ellipsis and last page if needed
                if (endPage < totalPages) {
                  if (endPage < totalPages - 1) {
                    pages.push(
                      <span key="ellipsis-end" className="px-3 py-2 text-gray-500">
                        ...
                      </span>
                    );
                  }
                  pages.push(
                    <button
                      key={totalPages}
                      onClick={() => handlePageChange(totalPages)}
                      className="px-3 py-2 border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      {totalPages}
                    </button>
                  );
                }
                
                return pages;
              })()}
              
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-4 py-2 border border-gray-300 rounded-r-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium text-gray-700"
              >
                Next
              </button>
            </div>
          </div>
        )}
        
        {/* Page Info */}
        {totalPages > 1 && (
          <div className="mt-4 text-center text-sm text-gray-600">
            Page {currentPage} of {totalPages} ({totalCount} total products)
          </div>
        )}

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
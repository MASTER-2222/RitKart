'use client';
import { useState, useEffect, useMemo } from 'react';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';
import ProductCard from '../../../components/ProductCard';
import { apiClient, Product, Category } from '../../../utils/api';

interface CategoryListingProps {
  categorySlug: string;
}

export default function CategoryListing({ categorySlug }: CategoryListingProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('featured');
  const [priceRange, setPriceRange] = useState([0, 2000]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [minRating, setMinRating] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
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
  }, [categorySlug, currentPage]);

  const fetchCategoryData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch products for this category from API
      const productsResponse = await apiClient.getProductsByCategory(categorySlug, itemsPerPage);
      
      if (productsResponse.success) {
        setProducts(productsResponse.data);
        setTotalCount(productsResponse.pagination?.totalCount || productsResponse.data.length);
        setTotalPages(productsResponse.pagination?.totalPages || 1);
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
      brand: product.brand
    }));
  }, [products]);

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

  // Pagination
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedProducts.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedProducts, currentPage, itemsPerPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
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
                  className="border rounded px-2 py-1 text-sm pr-8"
                >
                  <option value="featured">Featured</option>
                  <option value="newest">Newest</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Customer Rating</option>
                </select>
              </div>
              
              <div className="flex border rounded">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${viewMode === 'grid' ? 'bg-red-500 text-white' : 'text-gray-600'}`}
                >
                  <i className="ri-grid-line w-4 h-4 flex items-center justify-center"></i>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 ${viewMode === 'list' ? 'bg-red-500 text-white' : 'text-gray-600'}`}
                >
                  <i className="ri-list-unordered w-4 h-4 flex items-center justify-center"></i>
                </button>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="border-t pt-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Price Range Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="range"
                    min="0"
                    max="2000"
                    step="50"
                    value={priceRange[0]}
                    onChange={(e) => setPriceRange([parseInt(e.target.value), priceRange[1]])}
                    className="flex-1"
                  />
                  <span className="text-sm text-gray-600">${priceRange[0]} - ${priceRange[1]}</span>
                </div>
              </div>

              {/* Brand Filter */}
              {availableBrands.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Brands</label>
                  <div className="max-h-32 overflow-y-auto">
                    {availableBrands.slice(0, 10).map(brand => (
                      <label key={brand} className="flex items-center mb-1">
                        <input
                          type="checkbox"
                          checked={selectedBrands.includes(brand)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedBrands([...selectedBrands, brand]);
                            } else {
                              setSelectedBrands(selectedBrands.filter(b => b !== brand));
                            }
                          }}
                          className="mr-2"
                        />
                        <span className="text-sm text-gray-600">{brand}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Rating Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Rating</label>
                <select
                  value={minRating}
                  onChange={(e) => setMinRating(parseInt(e.target.value))}
                  className="w-full border rounded px-2 py-1 text-sm"
                >
                  <option value={0}>All Ratings</option>
                  <option value={4}>4+ Stars</option>
                  <option value={3}>3+ Stars</option>
                  <option value={2}>2+ Stars</option>
                </select>
              </div>

              {/* Clear Filters */}
              <div className="flex items-end">
                <button
                  onClick={() => {
                    setPriceRange([0, 2000]);
                    setSelectedBrands([]);
                    setMinRating(0);
                  }}
                  className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 px-4 rounded text-sm"
                >
                  Clear Filters
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
          <div className={viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
            : 'space-y-4'
          }>
            {paginatedProducts.map(product => (
              <ProductCard key={product.id} {...product} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {Math.ceil(sortedProducts.length / itemsPerPage) > 1 && (
          <div className="mt-8 flex justify-center">
            <div className="flex space-x-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-2 border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
              {[...Array(Math.ceil(sortedProducts.length / itemsPerPage))].map((_, i) => (
                <button
                  key={i + 1}
                  onClick={() => handlePageChange(i + 1)}
                  className={`px-3 py-2 rounded ${
                    currentPage === i + 1 
                      ? 'bg-red-500 text-white' 
                      : 'border hover:bg-gray-50'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === Math.ceil(sortedProducts.length / itemsPerPage)}
                className="px-3 py-2 border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
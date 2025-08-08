
'use client';
import { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import ProductCard from '../../components/ProductCard';
import Link from 'next/link';

function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const category = searchParams.get('category') || 'All';
  
  const [products] = useState([
    {
      id: '1',
      title: 'Apple iPhone 15 Pro Max 256GB',
      price: 1199,
      originalPrice: 1299,
      rating: 4.8,
      reviewCount: 2847,
      image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&h=400&fit=crop',
      isPrime: true,
      category: 'Electronics'
    },
    {
      id: '2',
      title: 'Samsung 55" QLED 4K Smart TV',
      price: 899,
      originalPrice: 1199,
      rating: 4.6,
      reviewCount: 1523,
      image: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400&h=400&fit=crop',
      isPrime: true,
      category: 'Electronics'
    },
    {
      id: '3',
      title: 'Modern Sectional Sofa with Chaise',
      price: 1299,
      originalPrice: 1599,
      rating: 4.4,
      reviewCount: 892,
      image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=400&fit=crop',
      isPrime: false,
      category: 'Home'
    },
    {
      id: '4',
      title: 'Nike Air Max 270 Running Shoes',
      price: 129,
      originalPrice: 150,
      rating: 4.7,
      reviewCount: 3421,
      image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop',
      isPrime: true,
      category: 'Sports'
    },
    {
      id: '5',
      title: 'KitchenAid Stand Mixer Professional',
      price: 399,
      originalPrice: 499,
      rating: 4.9,
      reviewCount: 1876,
      image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop',
      isPrime: true,
      category: 'Home'
    },
    {
      id: '6',
      title: 'The Complete Works of Shakespeare',
      price: 24,
      originalPrice: 35,
      rating: 4.5,
      reviewCount: 667,
      image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=400&fit=crop',
      isPrime: false,
      category: 'Books'
    }
  ]);

  const [filteredProducts, setFilteredProducts] = useState(products);
  const [sortBy, setSortBy] = useState('relevance');

  useEffect(() => {
    let filtered = products;

    // Filter by search query
    if (query) {
      filtered = filtered.filter(product => 
        product.title.toLowerCase().includes(query.toLowerCase()) ||
        product.category.toLowerCase().includes(query.toLowerCase())
      );
    }

    // Filter by category
    if (category && category !== 'All') {
      filtered = filtered.filter(product => 
        product.category.toLowerCase() === category.toLowerCase()
      );
    }

    // Sort products
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'newest':
        // Keep original order for newest
        break;
      default:
        // Relevance - keep original order
        break;
    }

    setFilteredProducts(filtered);
  }, [query, category, sortBy, products]);

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Search Results Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-lg text-gray-600">
                {query ? (
                  <>
                    Results for "<span className="text-[#232f3e] font-semibold">{query}</span>"
                    {category !== 'All' && (
                      <span className="text-gray-500"> in {category}</span>
                    )}
                  </>
                ) : (
                  <>All Products {category !== 'All' && `in ${category}`}</>
                )}
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                {filteredProducts.length} results
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Sort by:</span>
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-gray-300 rounded px-3 py-1 text-sm pr-8"
              >
                <option value="relevance">Relevance</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Customer Rating</option>
                <option value="newest">Newest Arrivals</option>
              </select>
            </div>
          </div>

          {/* Breadcrumbs */}
          <nav className="text-sm">
            <Link href="/" className="text-blue-600 hover:underline">Home</Link>
            {category !== 'All' && (
              <>
                <span className="mx-2 text-gray-400">›</span>
                <Link href={`/category/${category.toLowerCase()}`} className="text-blue-600 hover:underline">
                  {category}
                </Link>
              </>
            )}
            {query && (
              <>
                <span className="mx-2 text-gray-400">›</span>
                <span className="text-gray-600">Search results for "{query}"</span>
              </>
            )}
          </nav>
        </div>

        {/* Results */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <i className="ri-search-line w-16 h-16 flex items-center justify-center text-gray-400 text-6xl mx-auto mb-4"></i>
            <h2 className="text-xl font-semibold text-gray-600 mb-2">No results found</h2>
            <p className="text-gray-500 mb-6">
              {query ? (
                <>Sorry, we couldn't find any products matching "{query}"</>
              ) : (
                <>No products found in this category</>
              )}
            </p>
            <div className="space-y-2 text-sm text-gray-600">
              <p>Try:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Checking your spelling</li>
                <li>Using different keywords</li>
                <li>Searching in all categories</li>
              </ul>
            </div>
            <Link 
              href="/" 
              className="inline-block mt-6 bg-[#febd69] hover:bg-[#f3a847] text-black px-6 py-2 rounded whitespace-nowrap"
            >
              Browse All Products
            </Link>
          </div>
        )}

        {/* Related Categories */}
        {filteredProducts.length > 0 && (
          <div className="mt-12 border-t pt-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Related Categories</h3>
            <div className="flex flex-wrap gap-2">
              {['Electronics', 'Home', 'Fashion', 'Books', 'Sports', 'Grocery'].map(cat => (
                <Link
                  key={cat}
                  href={`/category/${cat.toLowerCase()}`}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-full text-sm text-gray-700 whitespace-nowrap"
                >
                  {cat}
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white">
        <Header />
        <main className="max-w-7xl mx-auto px-4 py-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="border rounded-lg p-4">
                  <div className="h-48 bg-gray-200 rounded mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    }>
      <SearchResults />
    </Suspense>
  );
}

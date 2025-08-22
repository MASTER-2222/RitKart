
'use client';
import { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import ProductCard from '../../components/ProductCard';
import Link from 'next/link';
import { apiClient } from '../../utils/api';

interface Product {
  id: string;
  name: string;
  price: number;
  original_price?: number;
  rating_average: number;
  total_reviews: number;
  images: string[];
  is_featured: boolean;
  category_name: string;
  brand: string;
  stock_quantity: number;
  currency?: string;
}

function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const category = searchParams.get('category') || 'All';
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [sortBy, setSortBy] = useState('relevance');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!query.trim()) {
        setProducts([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const response = await apiClient.searchProducts(query, {
          category: category !== 'All' ? category : undefined,
          sortBy,
          page: currentPage,
          limit: 20,
          currency: 'INR' // Default currency
        });

        if (response.success) {
          setProducts(response.data || []);
          setTotalCount(response.totalCount || 0);
        } else {
          setError('Failed to search products');
          setProducts([]);
        }
      } catch (err) {
        console.error('Search error:', err);
        setError('An error occurred while searching');
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSearchResults();
  }, [query, category, sortBy, currentPage]);

  // Reset page when search parameters change
  useEffect(() => {
    setCurrentPage(1);
  }, [query, category, sortBy]);

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
                {totalCount} results
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Sort by:</span>
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-gray-300 rounded px-3 py-1 text-sm pr-8"
                disabled={loading}
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

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="border rounded-lg p-4 animate-pulse">
                <div className="h-48 bg-gray-200 rounded mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="text-center py-12">
            <div className="text-red-600 mb-4">{error}</div>
            <button 
              onClick={() => window.location.reload()}
              className="bg-[#febd69] hover:bg-[#f3a847] text-black px-6 py-2 rounded"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Results */}
        {!loading && !error && (
          <>
            {products.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map(product => (
                  <ProductCard 
                    key={product.id} 
                    id={product.id}
                    title={product.name}
                    price={product.price}
                    originalPrice={product.original_price}
                    rating={product.rating_average || 0}
                    reviewCount={product.total_reviews || 0}
                    image={Array.isArray(product.images) ? product.images[0] : product.images}
                    isPrime={product.is_featured}
                    currency={product.currency}
                  />
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
          </>
        )}

        {/* Related Categories */}
        {products.length > 0 && !loading && (
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

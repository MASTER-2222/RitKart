
'use client';
import { useState, useEffect, useMemo } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import CategoryCard from '../components/CategoryCard';
import ProductCarousel from '../components/ProductCarousel';
import { apiClient, Category, Product } from '../utils/api';
import { useCurrency } from '../contexts/CurrencyContext';

export default function Home() {
  const { selectedCurrency } = useCurrency(); // Add currency context
  
  const [currentHeroBanner, setCurrentHeroBanner] = useState(0);
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [electronicsProducts, setElectronicsProducts] = useState<Product[]>([]);
  const [heroBanners, setHeroBanners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [selectedCurrency]); // Add currency dependency

  // Listen for currency change events
  useEffect(() => {
    const handleCurrencyChange = () => {
      console.log(`🔄 Currency changed, refreshing homepage data...`);
      fetchData();
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('currencyChanged', handleCurrencyChange);
      return () => window.removeEventListener('currencyChanged', handleCurrencyChange);
    }
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      console.log(`🔄 Loading homepage data in ${selectedCurrency.code} currency...`);
      
      // Fetch all data in parallel WITH CURRENCY SUPPORT
      const [categoriesResponse, featuredResponse, electronicsResponse, bannersResponse] = await Promise.all([
        apiClient.getCategories(),
        apiClient.getFeaturedProducts(selectedCurrency.code), // Add currency
        apiClient.getProductsByCategory('electronics', { 
          limit: 6,
          currency: selectedCurrency.code // Add currency
        }),
        apiClient.getBanners()
      ]);

      if (categoriesResponse.success) {
        setCategories(categoriesResponse.data);
      }

      if (featuredResponse.success) {
        setFeaturedProducts(featuredResponse.data);
        console.log(`✅ Loaded ${featuredResponse.data.length} featured products in ${selectedCurrency.code}`);
      }

      if (electronicsResponse.success) {
        setElectronicsProducts(electronicsResponse.data);
        console.log(`✅ Loaded ${electronicsResponse.data.length} electronics products in ${selectedCurrency.code}`);
      }

      // Handle banners API response
      if (bannersResponse.success) {
        const apiHeroBanners = bannersResponse.data.map((banner: any) => ({
          image: banner.image_url,
          title: banner.title,
          subtitle: banner.subtitle || '',
          buttonText: banner.button_text || 'Shop Now',
          buttonLink: banner.button_link || '/'
        }));
        setHeroBanners(apiHeroBanners);
      } else {
        // Fallback to hardcoded banners if API fails
        console.warn('Banners API failed, using fallback data');
        setHeroBanners(fallbackHeroBanners);
      }

    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load data. Please try again.');
      // Set fallback banners on error
      setHeroBanners(fallbackHeroBanners);
    } finally {
      setLoading(false);
    }
  };

  // Fallback hero banners (used if API fails)
  const fallbackHeroBanners = [
    {
      image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1200&h=400&fit=crop&crop=center',
      title: 'Fashion & Lifestyle',
      subtitle: 'Discover trendy styles and accessories for every occasion',
      buttonText: 'Shop Now',
      buttonLink: '/category/fashion'
    },
    {
      image: 'https://images.unsplash.com/photo-1534452203293-494d7ddbf7e0?w=1200&h=400&fit=crop&crop=center',
      title: 'Premium Shopping Experience',
      subtitle: 'Quality products delivered straight to your door',
      buttonText: 'Shop Now',
      buttonLink: '/'
    },
    {
      image: 'https://images.unsplash.com/photo-1481437156560-3205f6a55735?w=1200&h=400&fit=crop&crop=center',
      title: 'Shop with Confidence',
      subtitle: 'Explore our vast selection in our modern retail space',
      buttonText: 'Shop Now',
      buttonLink: '/'
    },
    {
      image: 'https://images.unsplash.com/photo-1573855619003-97b4799dcd8b?w=1200&h=400&fit=crop&crop=center',
      title: 'Weekend Shopping Spree',
      subtitle: 'Get amazing deals on all your favorite brands',
      buttonText: 'Shop Now',
      buttonLink: '/deals'
    },
    {
      image: 'https://images.unsplash.com/photo-1532795986-dbef1643a596?w=1200&h=400&fit=crop&crop=center',
      title: 'MEGA SALE EVENT',
      subtitle: 'Up to 70% off on electronics, fashion, and more!',
      buttonText: 'Shop Now',
      buttonLink: '/deals'
    },
    {
      image: 'https://images.unsplash.com/photo-1607083206968-13611e3d76db?w=1200&h=400&fit=crop&crop=center',
      title: 'Black Friday Deals',
      subtitle: 'Massive discounts across all categories - Limited time only',
      buttonText: 'Shop Now',
      buttonLink: '/deals'
    },
    {
      image: 'https://images.pexels.com/photos/5868722/pexels-photo-5868722.jpeg?w=1200&h=400&fit=crop&crop=center',
      title: 'Special Offers',
      subtitle: 'Exclusive deals and promotional prices just for you',
      buttonText: 'Shop Now',
      buttonLink: '/deals'
    },
    {
      image: 'https://images.unsplash.com/photo-1586880244406-556ebe35f282?w=1200&h=400&fit=crop&crop=center',
      title: 'Shop Online Anytime',
      subtitle: 'Convenient online shopping with fast delivery options',
      buttonText: 'Shop Now',
      buttonLink: '/'
    }
  ];

  // Auto-advance slider every 2 seconds
  useEffect(() => {
    if (heroBanners.length === 0) return; // Don't start interval if no banners
    
    const interval = setInterval(() => {
      setCurrentHeroBanner((prev) => (prev + 1) % heroBanners.length);
    }, 2000); // 2 seconds

    return () => clearInterval(interval);
  }, [heroBanners.length]);

  // Convert API products to format expected by ProductCarousel - WITH MEMOIZATION
  const convertApiProductsToCarouselFormat = useMemo(() => {
    return (products: Product[]) => {
      return products.map(product => ({
        id: product.id,
        title: product.name,
        price: product.price,
        originalPrice: product.original_price,
        rating: product.rating_average,
        reviewCount: product.total_reviews,
        image: product.images[0] || 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=300&h=300&fit=crop&crop=center',
        isPrime: product.is_featured,
        isDeliveryTomorrow: product.stock_quantity > 0,
        discount: product.original_price > product.price ? 
          Math.round(((product.original_price - product.price) / product.original_price) * 100) : 0,
        brand: product.brand,
        // NEW: Add currency information for ProductCard
        currency_symbol: selectedCurrency.symbol,
        currency: selectedCurrency.code,
        // Use backend formatted prices if available
        formatted_price: product.formatted_price,
        formatted_original_price: product.formatted_original_price
      }));
    };
  }, [selectedCurrency]); // Add selectedCurrency dependency

  // Convert API categories to format expected by CategoryCard
  const convertApiCategoriesToCardFormat = (categories: Category[]) => {
    return categories.map(category => ({
      title: category.name,
      image: category.image_url,
      href: `/category/${category.slug}`,
      subtitle: category.description
    }));
  };

  const nextHeroBanner = () => {
    if (heroBanners.length === 0) return;
    setCurrentHeroBanner((prev) => (prev + 1) % heroBanners.length);
  };

  const prevHeroBanner = () => {
    if (heroBanners.length === 0) return;
    setCurrentHeroBanner((prev) => (prev - 1 + heroBanners.length) % heroBanners.length);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center min-h-[calc(100vh-160px)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading amazing products...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center min-h-[calc(100vh-160px)]">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={fetchData}
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

      <main>
        <div className="relative mb-6">
          <div
            className="h-96 bg-cover bg-center relative"
            style={{ backgroundImage: `url(${heroBanners[currentHeroBanner]?.image || 'https://images.unsplash.com/photo-1534452203293-494d7ddbf7e0?w=1200&h=400&fit=crop&crop=center'})` }}
          >
            <div className="absolute inset-0 bg-black bg-opacity-40"></div>
            <div className="relative z-10 flex items-center justify-between h-full px-8">
              <button
                onClick={prevHeroBanner}
                className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-3 rounded-full"
              >
                <i className="ri-arrow-left-line w-6 h-6 flex items-center justify-center"></i>
              </button>

              <div className="text-center text-white">
                <h1 className="text-4xl font-bold mb-4">{heroBanners[currentHeroBanner]?.title || 'RitZone'}</h1>
                <p className="text-xl mb-6">{heroBanners[currentHeroBanner]?.subtitle || 'Your premium shopping destination'}</p>
                <a 
                  href={heroBanners[currentHeroBanner]?.buttonLink || '/'}
                  className="bg-[#febd69] hover:bg-[#f3a847] text-black font-bold py-3 px-8 rounded-lg whitespace-nowrap inline-block"
                >
                  {heroBanners[currentHeroBanner]?.buttonText || 'Shop Now'}
                </a>
              </div>

              <button
                onClick={nextHeroBanner}
                className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-3 rounded-full"
              >
                <i className="ri-arrow-right-line w-6 h-6 flex items-center justify-center"></i>
              </button>
            </div>

            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
              {heroBanners.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentHeroBanner(index)}
                  className={`w-3 h-3 rounded-full ${index === currentHeroBanner ? 'bg-white' : 'bg-white bg-opacity-50'}`}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6">
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Shop by Category</h2>
            {categories.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {convertApiCategoriesToCardFormat(categories).map((category, index) => (
                  <CategoryCard key={index} {...category} />
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                <p>Categories are loading...</p>
              </div>
            )}
          </section>

          {featuredProducts.length > 0 && (
            <ProductCarousel
              title="Featured Products"
              products={convertApiProductsToCarouselFormat(featuredProducts)}
            />
          )}

          {electronicsProducts.length > 0 && (
            <ProductCarousel
              title="Bestsellers in Electronics"
              products={convertApiProductsToCarouselFormat(electronicsProducts)}
            />
          )}

          <section className="mb-8">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Prime Benefits</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <i className="ri-truck-line w-12 h-12 flex items-center justify-center text-blue-600 mx-auto mb-3 text-4xl"></i>
                  <h3 className="font-semibold mb-2">Fast, Free Delivery</h3>
                  <p className="text-gray-600 text-sm">Free One-Day, Two-Day, and Same-Day delivery on millions of items</p>
                </div>
                <div className="text-center">
                  <i className="ri-play-circle-line w-12 h-12 flex items-center justify-center text-blue-600 mx-auto mb-3 text-4xl"></i>
                  <h3 className="font-semibold mb-2">Prime Video</h3>
                  <p className="text-gray-600 text-sm">Watch thousands of popular movies and TV shows with Prime Video</p>
                </div>
                <div className="text-center">
                  <i className="ri-music-line w-12 h-12 flex items-center justify-center text-blue-600 mx-auto mb-3 text-4xl"></i>
                  <h3 className="font-semibold mb-2">Prime Music</h3>
                  <p className="text-gray-600 text-sm">Listen to 2 million songs and thousands of playlists ad-free</p>
                </div>
              </div>
              <div className="text-center mt-6">
                <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg whitespace-nowrap">
                  Try Prime Free for 30 Days
                </button>
              </div>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}

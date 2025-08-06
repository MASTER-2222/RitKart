
'use client';
import { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import CategoryCard from '../components/CategoryCard';
import ProductCarousel from '../components/ProductCarousel';

export default function Home() {
  const [currentHeroBanner, setCurrentHeroBanner] = useState(0);

  const heroBanners = [
    {
      image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&h=400&fit=crop&crop=center',
      title: 'Holiday Deals are Here',
      subtitle: 'Save up to 50% on thousands of items'
    },
    {
      image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=1200&h=400&fit=crop&crop=center',
      title: 'Electronics Sale',
      subtitle: 'Latest gadgets at unbeatable prices'
    },
    {
      image: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1200&h=400&fit=crop&crop=center',
      title: 'Fashion Forward',
      subtitle: 'Trendy styles for every season'
    }
  ];

  const categories = [
    {
      title: 'Electronics',
      image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=300&h=200&fit=crop&crop=center',
      href: '/category/electronics',
      subtitle: 'Latest tech gadgets'
    },
    {
      title: 'Fashion',
      image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=300&h=200&fit=crop&crop=center',
      href: '/category/fashion',
      subtitle: 'Trending styles'
    },
    {
      title: 'Books',
      image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300&h=200&fit=crop&crop=center',
      href: '/category/books',
      subtitle: 'Bestsellers & more'
    },
    {
      title: 'Home & Garden',
      image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300&h=200&fit=crop&crop=center',
      href: '/category/home',
      subtitle: 'Decor & essentials'
    },
    {
      title: 'Sports & Outdoors',
      image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=200&fit=crop&crop=center',
      href: '/category/sports',
      subtitle: 'Gear for adventures'
    },
    {
      title: 'Grocery',
      image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=300&h=200&fit=crop&crop=center',
      href: '/category/grocery',
      subtitle: 'Fresh & pantry staples'
    },
    {
      title: 'Appliances',
      image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=300&h=200&fit=crop&crop=center',
      href: '/category/appliances',
      subtitle: 'Kitchen & home'
    },
    {
      title: 'Solar',
      image: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=300&h=200&fit=crop&crop=center',
      href: '/category/solar',
      subtitle: 'Renewable energy'
    },
    {
      title: 'Pharmacy',
      image: 'https://images.unsplash.com/photo-1580281657527-47f249e8f4df?w=300&h=200&fit=crop&crop=center',
      href: '/category/pharmacy',
      subtitle: 'Health & wellness'
    },
    {
      title: 'Beauty & Personal Care',
      image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=300&h=200&fit=crop&crop=center',
      href: '/category/beauty',
      subtitle: 'Self-care essentials'
    }
  ];

  const dealProducts = [
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
      discount: 20
    },
    {
      id: '2',
      title: 'Sony WH-1000XM4 Wireless Premium Noise Canceling Overhead Headphones',
      price: 248,
      originalPrice: 349,
      rating: 4.6,
      reviewCount: 15432,
      image: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=300&h=300&fit=crop&crop=center',
      isPrime: true,
      isDeliveryTomorrow: true,
      discount: 29
    },
    {
      id: '3',
      title: 'Samsung 65" Class 4K UHD Smart LED TV with HDR',
      price: 547,
      originalPrice: 799,
      rating: 4.5,
      reviewCount: 8934,
      image: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=300&h=300&fit=crop&crop=center',
      isPrime: true,
      discount: 32
    },
    {
      id: '4',
      title: 'iPhone 15 Pro Max 256GB - Natural Titanium',
      price: 1099,
      originalPrice: 1199,
      rating: 4.7,
      reviewCount: 5621,
      image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=300&h=300&fit=crop&crop=center',
      isPrime: true,
      isDeliveryTomorrow: true,
      discount: 8
    },
    {
      id: '5',
      title: 'Nintendo Switch OLED Model with Neon Red and Neon Blue Joy-Con',
      price: 329,
      originalPrice: 349,
      rating: 4.8,
      reviewCount: 12743,
      image: 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=300&h=300&fit=crop&crop=center',
      isPrime: true,
      discount: 6
    },
    {
      id: '6',
      title: 'Amazon Echo Dot (5th Gen) with Alexa - Smart Speaker',
      price: 29,
      originalPrice: 49,
      rating: 4.4,
      reviewCount: 89234,
      image: 'https://images.unsplash.com/photo-1518444065439-e933c06ce9cd?w=300&h=300&fit=crop&crop=center',
      isPrime: true,
      isDeliveryTomorrow: true,
      discount: 41
    }
  ];

  const bestsellerProducts = [
    {
      id: '7',
      title: 'Canon EOS R6 Mark II Mirrorless Camera Body',
      price: 2499,
      originalPrice: 2699,
      rating: 4.8,
      reviewCount: 1234,
      image: 'https://images.unsplash.com/photo-1606983340126-acd977736f90?w=300&h=300&fit=crop&crop=center',
      isPrime: true,
      isDeliveryTomorrow: false,
      discount: 7
    },
    {
      id: '8',
      title: 'Nintendo Switch OLED Model with Neon Red and Neon Blue Joy-Con',
      price: 329,
      originalPrice: 349,
      rating: 4.8,
      reviewCount: 12743,
      image: 'https://images.unsplash.com/photo-1606143407151-7111542de6e8?w=300&h=300&fit=crop&crop=center',
      isPrime: true,
      isDeliveryTomorrow: true,
      discount: 6
    },
    {
      id: '9',
      title: 'LG 27" UltraGear Gaming Monitor 4K UHD Nano IPS',
      price: 449,
      originalPrice: 599,
      rating: 4.7,
      reviewCount: 3456,
      image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=300&h=300&fit=crop&crop=center',
      isPrime: true,
      isDeliveryTomorrow: false,
      discount: 25
    },
    {
      id: '10',
      title: 'Microsoft Surface Pro 9 - 13" Touch Screen, Intel i7',
      price: 1399,
      originalPrice: 1599,
      rating: 4.5,
      reviewCount: 2345,
      image: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=300&h=300&fit=crop&crop=center',
      isPrime: true,
      isDeliveryTomorrow: false,
      discount: 13
    },
    {
      id: '11',
      title: 'AMD Ryzen 9 5900X 12-core 24-thread Desktop Processor',
      price: 429,
      originalPrice: 549,
      rating: 4.8,
      reviewCount: 5678,
      image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=300&h=300&fit=crop&crop=center',
      isPrime: true,
      isDeliveryTomorrow: false,
      discount: 22
    },
    {
      id: '12',
      title: 'NVIDIA GeForce RTX 4080 Gaming Graphics Card',
      price: 999,
      originalPrice: 1199,
      rating: 4.9,
      reviewCount: 1876,
      image: 'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=300&h=300&fit=crop&crop=center',
      isPrime: true,
      isDeliveryTomorrow: false,
      discount: 17
    }
  ];

  const nextHeroBanner = () => {
    setCurrentHeroBanner((prev) => (prev + 1) % heroBanners.length);
  };

  const prevHeroBanner = () => {
    setCurrentHeroBanner((prev) => (prev - 1 + heroBanners.length) % heroBanners.length);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main>
        <div className="relative mb-6">
          <div
            className="h-96 bg-cover bg-center relative"
            style={{ backgroundImage: `url(${heroBanners[currentHeroBanner].image})` }}
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
                <h1 className="text-4xl font-bold mb-4">{heroBanners[currentHeroBanner].title}</h1>
                <p className="text-xl mb-6">{heroBanners[currentHeroBanner].subtitle}</p>
                <button className="bg-[#febd69] hover:bg-[#f3a847] text-black font-bold py-3 px-8 rounded-lg whitespace-nowrap">
                  Shop Now
                </button>
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
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {categories.map((category, index) => (
                <CategoryCard key={index} {...category} />
              ))}
            </div>
          </section>

          <ProductCarousel
            title="Deal of the Day"
            products={dealProducts}
          />

          <ProductCarousel
            title="Bestsellers in Electronics"
            products={bestsellerProducts}
          />

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

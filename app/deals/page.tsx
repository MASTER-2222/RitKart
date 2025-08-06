
'use client';
import { useState } from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import ProductCard from '../../components/ProductCard';

export default function DealsPage() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('featured');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const dealProducts = [
    {
      id: 'd1',
      title: 'Apple MacBook Pro 14-inch M3 Chip with 8-Core CPU and 10-Core GPU',
      price: 1599,
      originalPrice: 1999,
      rating: 4.8,
      reviewCount: 2847,
      image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=300&h=300&fit=crop&crop=center',
      isPrime: true,
      isDeliveryTomorrow: true,
      discount: 20,
      category: 'Electronics',
      dealEndTime: '2024-01-20T23:59:59'
    },
    {
      id: 'd2',
      title: 'Nike Air Force 1 \'07 White Leather Sneakers - Unisex',
      price: 85,
      originalPrice: 130,
      rating: 4.8,
      reviewCount: 28934,
      image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=300&h=300&fit=crop&crop=center',
      isPrime: true,
      isDeliveryTomorrow: true,
      discount: 35,
      category: 'Fashion',
      dealEndTime: '2024-01-19T18:00:00'
    },
    {
      id: 'd3',
      title: 'KitchenAid Artisan Series 5-Quart Stand Mixer - Empire Red',
      price: 319,
      originalPrice: 499,
      rating: 4.8,
      reviewCount: 45678,
      image: 'https://images.unsplash.com/photo-1590736969955-71cc94901144?w=300&h=300&fit=crop&crop=center',
      isPrime: true,
      discount: 36,
      category: 'Home',
      dealEndTime: '2024-01-21T12:00:00'
    },
    {
      id: 'd4',
      title: 'The Seven Husbands of Evelyn Hugo: A Novel by Taylor Jenkins Reid',
      price: 12.99,
      originalPrice: 17.99,
      rating: 4.6,
      reviewCount: 147832,
      image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&h=300&fit=crop&crop=center',
      isPrime: true,
      isDeliveryTomorrow: true,
      discount: 28,
      category: 'Books',
      dealEndTime: '2024-01-22T09:30:00'
    },
    {
      id: 'd5',
      title: 'Fitbit Charge 5 Advanced Fitness & Health Tracker with GPS',
      price: 119,
      originalPrice: 179,
      rating: 4.2,
      reviewCount: 34567,
      image: 'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=300&h=300&fit=crop&crop=center',
      isPrime: true,
      discount: 34,
      category: 'Sports',
      dealEndTime: '2024-01-20T15:45:00'
    },
    {
      id: 'd6',
      title: 'CeraVe Foaming Facial Cleanser - Normal to Oily Skin 12 fl oz',
      price: 9.99,
      originalPrice: 18.99,
      rating: 4.6,
      reviewCount: 89234,
      image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=300&h=300&fit=crop&crop=center',
      isPrime: true,
      isDeliveryTomorrow: true,
      discount: 47,
      category: 'Beauty',
      dealEndTime: '2024-01-19T20:15:00'
    },
    {
      id: 'd7',
      title: 'Sony WH-1000XM4 Wireless Premium Noise Canceling Overhead Headphones',
      price: 199,
      originalPrice: 349,
      rating: 4.6,
      reviewCount: 15432,
      image: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=300&h=300&fit=crop&crop=center',
      isPrime: true,
      isDeliveryTomorrow: true,
      discount: 43,
      category: 'Electronics',
      dealEndTime: '2024-01-21T14:00:00'
    },
    {
      id: 'd8',
      title: 'Levi\'s Women\'s 501 High Rise Straight Jeans - Medium Wash',
      price: 59.50,
      originalPrice: 98.00,
      rating: 4.6,
      reviewCount: 12847,
      image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=300&h=300&fit=crop&crop=center',
      isPrime: true,
      isDeliveryTomorrow: true,
      discount: 39,
      category: 'Fashion',
      dealEndTime: '2024-01-20T11:30:00'
    },
    {
      id: 'd9',
      title: 'Instant Pot Duo 7-in-1 Electric Pressure Cooker, 8 Quart',
      price: 59,
      originalPrice: 119,
      rating: 4.7,
      reviewCount: 98234,
      image: 'https://images.unsplash.com/photo-1585515656617-d405f574bfa3?w=300&h=300&fit=crop&crop=center',
      isPrime: true,
      discount: 50,
      category: 'Home',
      dealEndTime: '2024-01-19T16:45:00'
    },
    {
      id: 'd10',
      title: 'Nintendo Switch OLED Model with Neon Red and Neon Blue Joy-Con',
      price: 279,
      originalPrice: 349,
      rating: 4.8,
      reviewCount: 12743,
      image: 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=300&h=300&fit=crop&crop=center',
      isPrime: true,
      discount: 20,
      category: 'Electronics',
      dealEndTime: '2024-01-22T10:00:00'
    },
    {
      id: 'd11',
      title: 'Atomic Habits by James Clear - An Easy & Proven Way to Build Good Habits',
      price: 13.50,
      originalPrice: 21.99,
      rating: 4.8,
      reviewCount: 89234,
      image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300&h=300&fit=crop&crop=center',
      isPrime: true,
      isDeliveryTomorrow: true,
      discount: 39,
      category: 'Books',
      dealEndTime: '2024-01-21T13:20:00'
    },
    {
      id: 'd12',
      title: 'Nike Men\'s Air Zoom Pegasus 39 Running Shoes - Black/White',
      price: 89.99,
      originalPrice: 149.99,
      rating: 4.6,
      reviewCount: 23456,
      image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&h=300&fit=crop&crop=center',
      isPrime: true,
      discount: 40,
      category: 'Sports',
      dealEndTime: '2024-01-20T17:30:00'
    }
  ];

  const categories = ['All', 'Electronics', 'Fashion', 'Home', 'Books', 'Sports', 'Beauty'];

  const filteredProducts = selectedCategory === 'all' 
    ? dealProducts 
    : dealProducts.filter(product => product.category.toLowerCase() === selectedCategory);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="relative mb-6">
        <div 
          className="h-48 bg-cover bg-center relative"
          style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?w=1200&h=300&fit=crop&crop=center)' }}
        >
          <div className="absolute inset-0 bg-red-600 bg-opacity-70"></div>
          <div className="relative z-10 flex items-center justify-center h-full text-center text-white">
            <div>
              <h1 className="text-5xl font-bold mb-2">Today's Deals</h1>
              <p className="text-2xl">Limited time offers - Save up to 50% off!</p>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-6">
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center space-x-4">
              <h2 className="text-lg font-bold text-gray-900">Filter by Category:</h2>
              <div className="flex flex-wrap gap-2">
                {categories.map(category => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category.toLowerCase())}
                    className={`px-4 py-2 rounded-lg whitespace-nowrap ${
                      selectedCategory === category.toLowerCase()
                        ? 'bg-red-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
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
                  <option value="discount">Highest Discount</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Customer Rating</option>
                  <option value="ending-soon">Ending Soon</option>
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

          <div className="mt-4 text-sm text-gray-600 bg-yellow-50 p-3 rounded border-l-4 border-yellow-400">
            <i className="ri-alarm-warning-line w-4 h-4 flex items-center justify-center text-yellow-600 inline mr-2"></i>
            <strong>Hurry up!</strong> These deals are limited time offers and quantities are limited.
          </div>
        </div>

        <div className="mb-4">
          <p className="text-gray-600">
            Showing <strong>{filteredProducts.length}</strong> deals 
            {selectedCategory !== 'all' && ` in ${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)}`}
          </p>
        </div>

        <div className={viewMode === 'grid' 
          ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
          : 'space-y-4'
        }>
          {filteredProducts.map(product => (
            <div key={product.id} className={viewMode === 'list' ? 'bg-white rounded-lg shadow-sm border p-4' : 'relative'}>
              {viewMode === 'grid' && (
                <div className="absolute top-2 left-2 z-10 bg-red-500 text-white px-2 py-1 text-xs font-bold rounded">
                  {product.discount}% OFF
                </div>
              )}
              
              {viewMode === 'list' ? (
                <div className="flex space-x-4">
                  <div className="w-32 h-32 flex-shrink-0 relative">
                    <div className="absolute top-1 left-1 z-10 bg-red-500 text-white px-2 py-1 text-xs font-bold rounded">
                      {product.discount}% OFF
                    </div>
                    <img 
                      src={product.image}
                      alt={product.title}
                      className="w-full h-full object-cover rounded"
                    />
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                        {product.category}
                      </span>
                      <span className="text-sm text-red-600 font-medium">
                        Deal ends in 2h 15m
                      </span>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 hover:text-blue-600">
                      {product.title}
                    </h3>
                    <div className="flex items-center space-x-1">
                      <div className="flex items-center">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <i 
                            key={star}
                            className={`w-4 h-4 flex items-center justify-center ${
                              star <= Math.floor(product.rating) 
                                ? 'ri-star-fill text-yellow-400' 
                                : 'ri-star-line text-gray-300'
                            }`}
                          ></i>
                        ))}
                      </div>
                      <span className="text-sm text-gray-600">({product.reviewCount})</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl font-bold text-red-600">${product.price}</span>
                      <span className="text-lg text-gray-500 line-through">${product.originalPrice}</span>
                      <span className="bg-red-100 text-red-800 text-sm font-bold px-2 py-1 rounded">
                        Save ${(product.originalPrice! - product.price).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button className="bg-[#febd69] hover:bg-[#f3a847] text-black font-medium py-2 px-4 rounded whitespace-nowrap">
                        Add to Cart
                      </button>
                      {product.isPrime && (
                        <div className="bg-blue-500 text-white px-2 py-1 text-xs font-bold rounded">
                          Prime
                        </div>
                      )}
                      {product.isDeliveryTomorrow && (
                        <span className="text-sm text-green-600 font-medium">
                          Get it tomorrow
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <ProductCard {...product} />
              )}
            </div>
          ))}
        </div>

        <div className="mt-8 bg-gradient-to-r from-red-500 to-pink-500 rounded-lg p-6 text-white text-center">
          <h2 className="text-2xl font-bold mb-2">Don't Miss Out!</h2>
          <p className="mb-4">Join RitZone Prime to get exclusive early access to deals and free shipping.</p>
          <button className="bg-white text-red-500 font-bold py-3 px-8 rounded-lg hover:bg-gray-100 whitespace-nowrap">
            Try Prime Free for 30 Days
          </button>
        </div>

        <div className="mt-8 flex justify-center">
          <div className="flex space-x-2">
            <button className="px-3 py-2 border rounded hover:bg-gray-50">Previous</button>
            <button className="px-3 py-2 bg-red-500 text-white rounded">1</button>
            <button className="px-3 py-2 border rounded hover:bg-gray-50">2</button>
            <button className="px-3 py-2 border rounded hover:bg-gray-50">3</button>
            <button className="px-3 py-2 border rounded hover:bg-gray-50">Next</button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

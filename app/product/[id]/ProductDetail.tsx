'use client';
import { useState } from 'react';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';
import ProductCarousel from '../../../components/ProductCarousel';
import Link from 'next/link';

interface ProductDetailProps {
  productId: string;
}

export default function ProductDetail({ productId }: ProductDetailProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedTab, setSelectedTab] = useState('description');

  const products = {
    '1': {
      id: '1',
      title: 'Apple MacBook Pro 14-inch M3 Chip with 8-Core CPU and 10-Core GPU',
      price: 1599,
      originalPrice: 1999,
      rating: 4.8,
      reviewCount: 2847,
      images: [
        'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=600&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&h=600&fit=crop&crop=center'
      ],
      isPrime: true,
      isDeliveryTomorrow: true,
      discount: 20,
      inStock: true,
      stockCount: 15,
      description: 'The MacBook Pro 14-inch with M3 chip delivers exceptional performance and efficiency. Features a stunning Liquid Retina XDR display, advanced camera and audio, and all-day battery life.',
      features: [
        'M3 chip with 8-core CPU and 10-core GPU',
        '14-inch Liquid Retina XDR display',
        '16GB unified memory',
        '512GB SSD storage',
        'Up to 18 hours battery life',
        'Advanced camera and audio',
        'Multiple ports including Thunderbolt 4'
      ],
      specifications: {
        'Display': '14-inch Liquid Retina XDR',
        'Processor': 'Apple M3 chip',
        'Memory': '16GB unified memory',
        'Storage': '512GB SSD',
        'Graphics': '10-core GPU',
        'Battery': 'Up to 18 hours',
        'Weight': '3.5 pounds',
        'Dimensions': '12.31 x 8.71 x 0.61 inches'
      }
    },
    '2': {
      id: '2',
      title: 'Sony WH-1000XM4 Wireless Premium Noise Canceling Overhead Headphones',
      price: 248,
      originalPrice: 349,
      rating: 4.6,
      reviewCount: 15432,
      images: [
        'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=600&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=600&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=600&fit=crop&crop=center'
      ],
      isPrime: true,
      isDeliveryTomorrow: true,
      discount: 29,
      inStock: true,
      stockCount: 8,
      description: 'Industry-leading noise canceling with Dual Noise Sensor technology. Next-level music with Edge-AI, co-developed with Sony Music Studios Tokyo.',
      features: [
        'Industry-leading noise canceling technology',
        '30-hour battery life with quick charge',
        'Touch sensor controls',
        'Speak-to-chat technology',
        'Seamless Bluetooth connectivity',
        'High-quality audio with LDAC',
        'Comfortable design for all-day wear'
      ],
      specifications: {
        'Type': 'Over-ear wireless headphones',
        'Driver': '40mm',
        'Battery Life': '30 hours',
        'Charging': 'USB-C quick charge',
        'Weight': '8.95 oz',
        'Connectivity': 'Bluetooth 5.0',
        'Active Noise Canceling': 'Yes',
        'Voice Assistant': 'Alexa, Google Assistant'
      }
    },
    '3': {
      id: '3',
      title: 'Samsung 65" Class 4K UHD Smart LED TV with HDR',
      price: 547,
      originalPrice: 799,
      rating: 4.5,
      reviewCount: 8934,
      images: [
        'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=600&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1571901493467-117f180235ec?w=600&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1593359677769-a4b1e7beeaee?w=600&h=600&fit=crop&crop=center'
      ],
      isPrime: true,
      isDeliveryTomorrow: false,
      discount: 32,
      inStock: true,
      stockCount: 12,
      description: 'Experience stunning 4K UHD picture quality with vibrant colors and sharp details. Smart TV features with built-in streaming apps and voice control.',
      features: [
        '65-inch 4K UHD resolution',
        'HDR10+ support for enhanced contrast',
        'Smart TV with Tizen OS',
        'Built-in streaming apps',
        'Voice control with Alexa and Google Assistant',
        'Multiple HDMI and USB ports',
        'Sleek ultra-slim design'
      ],
      specifications: {
        'Screen Size': '65 inches',
        'Resolution': '4K UHD (3840 x 2160)',
        'Display Technology': 'LED',
        'Smart Platform': 'Tizen OS',
        'HDR': 'HDR10+',
        'Refresh Rate': '60Hz',
        'Connectivity': '4 HDMI, 2 USB',
        'Dimensions': '57.1 x 32.7 x 2.4 inches'
      }
    },
    '4': {
      id: '4',
      title: 'iPhone 15 Pro Max 256GB - Natural Titanium',
      price: 1099,
      originalPrice: 1199,
      rating: 4.7,
      reviewCount: 5621,
      images: [
        'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=600&h=600&fit=crop&crop=center'
      ],
      isPrime: true,
      isDeliveryTomorrow: true,
      discount: 8,
      inStock: true,
      stockCount: 22,
      description: 'The most advanced iPhone ever with titanium design, A17 Pro chip, and revolutionary camera system. Features Action Button and USB-C connectivity.',
      features: [
        'A17 Pro chip with 6-core GPU',
        '6.7-inch Super Retina XDR display',
        'Pro camera system with 5x telephoto',
        'Action Button for quick shortcuts',
        'USB-C connector',
        'Titanium design',
        'All-day battery life'
      ],
      specifications: {
        'Display': '6.7-inch Super Retina XDR',
        'Chip': 'A17 Pro',
        'Storage': '256GB',
        'Camera': 'Pro camera system',
        'Video': '4K Dolby Vision',
        'Battery': 'Up to 29 hours video',
        'Material': 'Titanium',
        'Weight': '7.81 ounces'
      }
    },
    '5': {
      id: '5',
      title: 'Dell XPS 13 Laptop - Intel Core i7, 16GB RAM, 512GB SSD',
      price: 1299,
      originalPrice: 1499,
      rating: 4.4,
      reviewCount: 3456,
      images: [
        'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=600&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&h=600&fit=crop&crop=center'
      ],
      isPrime: true,
      isDeliveryTomorrow: false,
      discount: 13,
      inStock: true,
      stockCount: 9,
      description: 'Premium ultrabook with stunning InfinityEdge display and powerful performance. Perfect for professionals who demand portability without compromise.',
      features: [
        '13.4-inch InfinityEdge display',
        '12th Gen Intel Core i7 processor',
        '16GB LPDDR5 RAM',
        '512GB PCIe NVMe SSD',
        'Intel Iris Xe graphics',
        'All-day battery life',
        'Premium carbon fiber build'
      ],
      specifications: {
        'Processor': '12th Gen Intel Core i7',
        'Display': '13.4-inch FHD+',
        'Memory': '16GB LPDDR5',
        'Storage': '512GB SSD',
        'Graphics': 'Intel Iris Xe',
        'Operating System': 'Windows 11',
        'Weight': '2.64 pounds',
        'Battery': 'Up to 12 hours'
      }
    }
  };

  const currentProduct = products[productId as keyof typeof products];

  if (!currentProduct) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-7xl mx-auto px-6 py-6">
          <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
            <div className="text-gray-500 mb-4">
              <i className="ri-error-warning-line text-6xl"></i>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Product Not Found</h1>
            <p className="text-gray-600 mb-6">
              Sorry, we couldn't find the product you're looking for.
            </p>
            <Link href="/" className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg whitespace-nowrap">
              Return to Homepage
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const relatedProducts = [
    {
      id: '13',
      title: 'iPad Pro 12.9-inch with M2 chip',
      price: 1099,
      originalPrice: 1199,
      rating: 4.7,
      reviewCount: 3421,
      image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=300&h=300&fit=crop&crop=center',
      isPrime: true,
      discount: 8
    },
    {
      id: '14',
      title: 'Apple Magic Keyboard for iPad Pro',
      price: 299,
      originalPrice: 349,
      rating: 4.5,
      reviewCount: 1876,
      image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=300&h=300&fit=crop&crop=center',
      isPrime: true,
      discount: 14
    },
    {
      id: '15',
      title: 'Apple AirPods Pro (2nd generation)',
      price: 199,
      originalPrice: 249,
      rating: 4.8,
      reviewCount: 8934,
      image: 'https://images.unsplash.com/photo-1588423771073-b8903fbb85b5?w=300&h=300&fit=crop&crop=center',
      isPrime: true,
      discount: 20
    },
    {
      id: '16',
      title: 'Samsung Galaxy Tab S9 Ultra',
      price: 1199,
      originalPrice: 1399,
      rating: 4.4,
      reviewCount: 2134,
      image: 'https://images.unsplash.com/photo-1561154464-82e9adf32764?w=300&h=300&fit=crop&crop=center',
      isPrime: true,
      discount: 14
    }
  ];

  const addToCart = () => {
    console.log('Added to cart:', currentProduct.id, 'quantity:', quantity);
  };

  const buyNow = () => {
    console.log('Buy now:', currentProduct.id, 'quantity:', quantity);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto px-6 py-6">
        <div className="bg-white rounded-lg shadow-sm border p-8 mb-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="relative">
                <img
                  src={currentProduct.images[selectedImage]}
                  alt={currentProduct.title}
                  className="w-full h-96 object-cover rounded-lg"
                />
                {currentProduct.discount && (
                  <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 text-sm font-bold rounded">
                    -{currentProduct.discount}% OFF
                  </div>
                )}
              </div>

              <div className="flex space-x-2 overflow-x-auto">
                {currentProduct.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded border-2 ${
                      selectedImage === index ? 'border-blue-500' : 'border-gray-200'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${currentProduct.title} view ${index + 1}`}
                      className="w-full h-full object-cover rounded"
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">{currentProduct.title}</h1>

                <div className="flex items-center space-x-2 mb-4">
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <i
                        key={star}
                        className={`w-5 h-5 flex items-center justify-center ${
                          star <= Math.floor(currentProduct.rating)
                            ? 'ri-star-fill text-yellow-400'
                            : star - 0.5 <= currentProduct.rating
                            ? 'ri-star-half-fill text-yellow-400'
                            : 'ri-star-line text-gray-300'
                        }`}
                      ></i>
                    ))}
                  </div>
                  <span className="text-blue-600 hover:underline cursor-pointer">
                    {currentProduct.reviewCount} reviews
                  </span>
                </div>

                <div className="flex items-center space-x-3 mb-4">
                  <span className="text-3xl font-bold text-gray-900">${currentProduct.price}</span>
                  {currentProduct.originalPrice && currentProduct.originalPrice > currentProduct.price && (
                    <span className="text-lg text-gray-500 line-through">${currentProduct.originalPrice}</span>
                  )}
                  {currentProduct.isPrime && (
                    <div className="bg-blue-500 text-white px-2 py-1 text-sm font-bold rounded">
                      Prime
                    </div>
                  )}
                </div>

                {currentProduct.isDeliveryTomorrow && (
                  <div className="text-green-600 mb-4">
                    <i className="ri-truck-line w-5 h-5 inline-flex items-center justify-center mr-2"></i>
                    FREE delivery tomorrow
                  </div>
                )}

                <div className="mb-6">
                  {currentProduct.inStock ? (
                    <div className="text-green-600 font-semibold">
                      <i className="ri-checkbox-circle-line w-5 h-5 inline-flex items-center justify-center mr-2"></i>
                      In Stock ({currentProduct.stockCount} available)
                    </div>
                  ) : (
                    <div className="text-red-600 font-semibold">
                      <i className="ri-close-circle-line w-5 h-5 inline-flex items-center justify-center mr-2"></i>
                      Currently unavailable
                    </div>
                  )}
                </div>
              </div>

              <div className="border-t pt-6">
                <div className="flex items-center space-x-4 mb-6">
                  <label className="font-semibold">Quantity:</label>
                  <select
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="border rounded px-3 py-1 pr-8"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                      <option key={num} value={num}>
                        {num}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={addToCart}
                    className="w-full bg-[#febd69] hover:bg-[#f3a847] text-black font-semibold py-3 px-6 rounded-lg whitespace-nowrap"
                  >
                    Add to Cart
                  </button>
                  <button
                    onClick={buyNow}
                    className="w-full bg-[#ff9f00] hover:bg-[#e88900] text-black font-semibold py-3 px-6 rounded-lg whitespace-nowrap"
                  >
                    Buy Now
                  </button>
                </div>

                <div className="mt-6 text-sm text-gray-600 space-y-2">
                  <div className="flex items-center">
                    <i className="ri-shield-check-line w-5 h-5 flex items-center justify-center mr-2 text-green-600"></i>
                    Secure transaction
                  </div>
                  <div className="flex items-center">
                    <i className="ri-truck-line w-5 h-5 flex items-center justify-center mr-2 text-blue-600"></i>
                    Ships from RitZone
                  </div>
                  <div className="flex items-center">
                    <i className="ri-arrow-go-back-line w-5 h-5 flex items-center justify-center mr-2 text-blue-600"></i>
                    Return policy: 30 days
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-8 mb-6">
          <div className="border-b border-gray-200 mb-6">
            <div className="flex space-x-8">
              {['description', 'features', 'specifications', 'reviews'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setSelectedTab(tab)}
                  className={`pb-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                    selectedTab === tab
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="tab-content">
            {selectedTab === 'description' && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Product Description</h3>
                <p className="text-gray-700 leading-relaxed">{currentProduct.description}</p>
              </div>
            )}

            {selectedTab === 'features' && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Key Features</h3>
                <ul className="space-y-2">
                  {currentProduct.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <i className="ri-check-line w-5 h-5 flex items-center justify-center text-green-600 mr-3 mt-0.5"></i>
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {selectedTab === 'specifications' && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Technical Specifications</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(currentProduct.specifications).map(([key, value]) => (
                    <div key={key} className="border-b border-gray-200 pb-2">
                      <div className="font-semibold text-gray-900">{key}</div>
                      <div className="text-gray-700">{value}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedTab === 'reviews' && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Customer Reviews</h3>
                <div className="space-y-6">
                  <div className="flex items-start space-x-4 border-b border-gray-200 pb-6">
                    <div className="flex-shrink-0 w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                      <i className="ri-user-line w-6 h-6 flex items-center justify-center text-gray-600"></i>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="font-semibold">John D.</span>
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <i
                              key={star}
                              className="ri-star-fill w-4 h-4 flex items-center justify-center text-yellow-400"
                            ></i>
                          ))}
                        </div>
                        <span className="text-gray-500 text-sm">Verified Purchase</span>
                      </div>
                      <h4 className="font-medium mb-2">Excellent performance and design</h4>
                      <p className="text-gray-700">
                        This product exceeded my expectations. The build quality is outstanding and performance is top-notch. Highly
                        recommended for anyone looking for premium quality.
                      </p>
                      <div className="text-gray-500 text-sm mt-2">Helpful? Yes (23) No (2)</div>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4 border-b border-gray-200 pb-6">
                    <div className="flex-shrink-0 w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                      <i className="ri-user-line w-6 h-6 flex items-center justify-center text-gray-600"></i>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="font-semibold">Sarah M.</span>
                        <div className="flex">
                          {[1, 2, 3, 4].map((star) => (
                            <i
                              key={star}
                              className="ri-star-fill w-4 h-4 flex items-center justify-center text-yellow-400"
                            ></i>
                          ))}
                          <i className="ri-star-line w-4 h-4 flex items-center justify-center text-gray-300"></i>
                        </div>
                        <span className="text-gray-500 text-sm">Verified Purchase</span>
                      </div>
                      <h4 className="font-medium mb-2">Great value for money</h4>
                      <p className="text-gray-700">
                        Good product overall, though it took some time to get used to. The features are comprehensive and it works as
                        advertised. Would buy again.
                      </p>
                      <div className="text-gray-500 text-sm mt-2">Helpful? Yes (15) No (1)</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <ProductCarousel title="Related Products" products={relatedProducts} />
      </main>

      <Footer />
    </div>
  );
}
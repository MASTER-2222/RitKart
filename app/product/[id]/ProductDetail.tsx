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
    },
    '6': {
      id: '6',
      title: 'Bose QuietComfort 45 Wireless Bluetooth Noise Cancelling Headphones',
      price: 279,
      originalPrice: 329,
      rating: 4.5,
      reviewCount: 7892,
      images: [
        'https://images.unsplash.com/photo-1484704849700-da0ec9d70304?w=600&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=600&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=600&fit=crop&crop=center'
      ],
      isPrime: true,
      isDeliveryTomorrow: false,
      discount: 15,
      inStock: true,
      stockCount: 18,
      description: 'World-class noise cancelling headphones with TriPort acoustic architecture for deep, clear sound. Comfortable design for all-day listening.',
      features: [
        'Advanced noise cancelling technology',
        '24-hour battery life',
        'TriPort acoustic architecture',
        'Comfortable around-ear fit',
        'Voice assistant access',
        'Dual connectivity with SimpleSync',
        'Quick charge: 15 minutes = 3 hours'
      ],
      specifications: {
        'Type': 'Over-ear wireless headphones',
        'Battery Life': '24 hours',
        'Charging': 'USB-C',
        'Weight': '8.5 oz',
        'Connectivity': 'Bluetooth 5.1',
        'Noise Cancelling': 'Yes',
        'Voice Assistant': 'Alexa, Google Assistant',
        'Warranty': '1 year limited'
      }
    },
    '7': {
      id: '7',
      title: 'Canon EOS R6 Mark II Mirrorless Camera Body',
      price: 2499,
      originalPrice: 2699,
      rating: 4.8,
      reviewCount: 1234,
      images: [
        'https://images.unsplash.com/photo-1606983340126-acd977736f90?w=600&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=600&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1581591524425-c7e0978865fc?w=600&h=600&fit=crop&crop=center'
      ],
      isPrime: true,
      isDeliveryTomorrow: false,
      discount: 7,
      inStock: true,
      stockCount: 6,
      description: 'Professional mirrorless camera with 24.2MP full-frame sensor, advanced autofocus, and 4K video recording capabilities.',
      features: [
        '24.2MP full-frame CMOS sensor',
        'DIGIC X image processor',
        '40fps electronic shutter',
        '4K 60p video recording',
        'Dual Pixel CMOS AF II',
        'In-body image stabilization',
        'Weather-sealed construction'
      ],
      specifications: {
        'Sensor': '24.2MP Full-Frame CMOS',
        'Processor': 'DIGIC X',
        'ISO Range': '100-102400',
        'Video': '4K 60p',
        'Autofocus': '1053 AF points',
        'Display': '3.0" vari-angle touchscreen',
        'Battery': 'LP-E6NH',
        'Weight': '1.4 lbs'
      }
    },
    '8': {
      id: '8',
      title: 'Nintendo Switch OLED Model with Neon Red and Neon Blue Joy-Con',
      price: 329,
      originalPrice: 349,
      rating: 4.8,
      reviewCount: 12743,
      images: [
        'https://images.unsplash.com/photo-1606143407151-7111542de6e8?w=600&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1585504198199-20277593b94f?w=600&h=600&fit=crop&crop=center'
      ],
      isPrime: true,
      isDeliveryTomorrow: true,
      discount: 6,
      inStock: true,
      stockCount: 28,
      description: 'Gaming console with vibrant 7-inch OLED screen, enhanced audio, and versatile play modes. Play at home or on the go.',
      features: [
        '7-inch OLED screen with vivid colors',
        'Enhanced audio for handheld mode',
        'Wide adjustable stand',
        '64GB internal storage',
        'Dock with wired LAN port',
        'Joy-Con controllers included',
        'Compatible with all Nintendo Switch games'
      ],
      specifications: {
        'Display': '7.0" OLED touchscreen',
        'Resolution': '1280 x 720 (handheld)',
        'Storage': '64GB internal',
        'Battery': '4.5-9 hours',
        'Connectivity': 'Wi-Fi, Bluetooth',
        'Dimensions': '4.02 x 9.53 x 0.55 inches',
        'Weight': '0.93 lbs',
        'Controllers': 'Joy-Con (L/R)'
      }
    },
    '9': {
      id: '9',
      title: 'LG 27" UltraGear Gaming Monitor 4K UHD with G-SYNC',
      price: 399,
      originalPrice: 499,
      rating: 4.6,
      reviewCount: 5678,
      images: [
        'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=600&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1571901493467-117f180235ec?w=600&h=600&fit=crop&crop=center'
      ],
      isPrime: true,
      isDeliveryTomorrow: false,
      discount: 20,
      inStock: true,
      stockCount: 14,
      description: 'High-performance gaming monitor with 4K UHD resolution, NVIDIA G-SYNC compatibility, and ultra-fast response time.',
      features: [
        '27-inch 4K UHD (3840x2160) display',
        'NVIDIA G-SYNC compatible',
        '1ms response time',
        '144Hz refresh rate',
        'HDR10 support',
        'Gaming-focused design',
        'Height adjustable stand'
      ],
      specifications: {
        'Screen Size': '27 inches',
        'Resolution': '4K UHD (3840 x 2160)',
        'Refresh Rate': '144Hz',
        'Response Time': '1ms',
        'Panel Type': 'IPS',
        'Connectivity': 'HDMI, DisplayPort, USB',
        'HDR': 'HDR10',
        'Stand': 'Height/Tilt adjustable'
      }
    },
    '10': {
      id: '10', 
      title: 'Microsoft Surface Pro 9 Tablet - Intel Core i5, 8GB RAM',
      price: 899,
      originalPrice: 999,
      rating: 4.3,
      reviewCount: 4321,
      images: [
        'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1561154464-82e9adf32764?w=600&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&h=600&fit=crop&crop=center'
      ],
      isPrime: true,
      isDeliveryTomorrow: false,
      discount: 10,
      inStock: true,
      stockCount: 11,
      description: 'Versatile 2-in-1 tablet that transforms into a laptop. Perfect for work, creativity, and entertainment with all-day battery life.',
      features: [
        '13-inch PixelSense touchscreen',
        '12th Gen Intel Core i5 processor',
        '8GB LPDDR5 RAM',
        '256GB SSD storage',
        'All-day battery life',
        'Windows 11 Home',
        'Surface Pen compatible'
      ],
      specifications: {
        'Display': '13" PixelSense touchscreen',
        'Processor': '12th Gen Intel Core i5',
        'Memory': '8GB LPDDR5',
        'Storage': '256GB SSD',
        'Operating System': 'Windows 11 Home',
        'Battery': 'Up to 15.5 hours',
        'Weight': '1.96 pounds',
        'Ports': '2 USB-C, Surface Connect'
      }
    },
    '11': {
      id: '11',
      title: 'AMD Ryzen 9 5900X 12-Core Desktop Processor',
      price: 399,
      originalPrice: 549,
      rating: 4.7,
      reviewCount: 8765,
      images: [
        'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=600&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=600&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1580746644971-d2c1e9cb7739?w=600&h=600&fit=crop&crop=center'
      ],
      isPrime: true,
      isDeliveryTomorrow: false,
      discount: 27,
      inStock: true,
      stockCount: 19,
      description: 'High-performance desktop processor with 12 cores and 24 threads. Perfect for gaming, content creation, and demanding applications.',
      features: [
        '12 cores and 24 threads',
        'Base clock: 3.7GHz, Max boost: 4.8GHz',
        '64MB L3 cache',
        'AM4 socket compatibility',
        'PCIe 4.0 support',
        'Zen 3 architecture',
        'Unlocked for overclocking'
      ],
      specifications: {
        'Cores': '12',
        'Threads': '24',
        'Base Clock': '3.7GHz',
        'Max Boost Clock': '4.8GHz',
        'Cache': '64MB L3',
        'Socket': 'AM4',
        'TDP': '105W',
        'Architecture': 'Zen 3'
      }
    },
    '12': {
      id: '12',
      title: 'NVIDIA GeForce RTX 4080 Graphics Card',
      price: 1199,
      originalPrice: 1299,
      rating: 4.5,
      reviewCount: 2345,
      images: [
        'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=600&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1580746644971-d2c1e9cb7739?w=600&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=600&h=600&fit=crop&crop=center'
      ],
      isPrime: true,
      isDeliveryTomorrow: false,
      discount: 8,
      inStock: true,
      stockCount: 7,
      description: 'Next-generation graphics card powered by Ada Lovelace architecture. Delivers exceptional performance for 4K gaming and ray tracing.',
      features: [
        'Ada Lovelace architecture',
        '16GB GDDR6X memory',
        'Ray tracing and DLSS 3',
        'AV1 encoding support',
        '4K gaming performance',
        'PCIe 4.0 interface',
        '3rd Gen RT cores'
      ],
      specifications: {
        'GPU': 'Ada Lovelace',
        'CUDA Cores': '9728',
        'Memory': '16GB GDDR6X',
        'Memory Bus': '256-bit',
        'Base Clock': '2205 MHz',
        'Boost Clock': '2505 MHz',
        'TGP': '320W',
        'Outputs': '3x DisplayPort 1.4a, 1x HDMI 2.1'
      }
    },
    'e13': {
      id: 'e13',
      title: 'Apple iPad Air 5th Generation with M1 Chip - 64GB WiFi',
      price: 549,
      originalPrice: 599,
      rating: 4.7,
      reviewCount: 6789,
      images: [
        'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1561154464-82e9adf32764?w=600&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&h=600&fit=crop&crop=center'
      ],
      isPrime: true,
      isDeliveryTomorrow: true,
      discount: 8,
      inStock: true,
      stockCount: 25,
      description: 'Powerful tablet with M1 chip performance and all-day battery life. Perfect for creativity, productivity, and entertainment.',
      features: [
        'M1 chip with 8-core CPU',
        '10.9-inch Liquid Retina display',
        'All-day battery life',
        '12MP Ultra Wide front camera',
        'USB-C connector',
        'Apple Pencil (2nd gen) compatible',
        'Smart Keyboard compatible'
      ],
      specifications: {
        'Display': '10.9" Liquid Retina',
        'Chip': 'Apple M1',
        'Storage': '64GB',
        'Camera': '12MP Wide, 12MP Ultra Wide',
        'Battery': 'Up to 10 hours',
        'Connectivity': 'Wi-Fi 6',
        'Weight': '1.02 pounds',
        'Colors': 'Space Gray, Starlight, Pink, Purple, Blue'
      }
    },
    'e14': {
      id: 'e14',
      title: 'Google Pixel 8 Pro 128GB - Obsidian Black',
      price: 899,
      originalPrice: 999,
      rating: 4.5,
      reviewCount: 4567,
      images: [
        'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=600&h=600&fit=crop&crop=center'
      ],
      isPrime: true,
      isDeliveryTomorrow: true,
      discount: 10,
      inStock: true,
      stockCount: 16,
      description: 'Advanced smartphone with Google Tensor G3 chip, professional-grade camera system, and pure Android experience.',
      features: [
        'Google Tensor G3 chip',
        '6.7" Super Actua display',
        'Pro camera with 5x telephoto',
        'Magic Eraser and Best Take',
        '24-hour battery with fast charging',
        '7 years of security updates',
        'Pure Android experience'
      ],
      specifications: {
        'Display': '6.7" Super Actua OLED',
        'Processor': 'Google Tensor G3',
        'Storage': '128GB',
        'RAM': '12GB',
        'Camera': '50MP main, 48MP ultra-wide, 48MP telephoto',
        'Battery': '5050 mAh',
        'OS': 'Android 14',
        'Weight': '7.5 oz'
      }
    },
    'e15': {
      id: 'e15',
      title: 'HP Envy x360 2-in-1 Laptop - AMD Ryzen 7, 16GB RAM',
      price: 799,
      originalPrice: 949,
      rating: 4.3,
      reviewCount: 3456,
      images: [
        'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=600&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&h=600&fit=crop&crop=center'
      ],
      isPrime: true,
      isDeliveryTomorrow: false,
      discount: 16,
      inStock: true,
      stockCount: 13,
      description: 'Versatile 2-in-1 laptop with 360-degree hinge, touchscreen display, and powerful AMD Ryzen processor for productivity and creativity.',
      features: [
        '15.6" FHD touchscreen display',
        'AMD Ryzen 7 5825U processor',
        '16GB DDR4 RAM',
        '512GB PCIe NVMe SSD',
        '360-degree hinge design',
        'HP Pen included',
        'Windows 11 Home'
      ],
      specifications: {
        'Display': '15.6" FHD touchscreen',
        'Processor': 'AMD Ryzen 7 5825U',
        'Memory': '16GB DDR4',
        'Storage': '512GB NVMe SSD',
        'Graphics': 'AMD Radeon',
        'Battery': 'Up to 8 hours',
        'Weight': '4.53 pounds',
        'OS': 'Windows 11 Home'
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
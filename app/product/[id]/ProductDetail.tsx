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
    },
    'e16': {
      id: 'e16',
      title: 'JBL Charge 5 Portable Bluetooth Speaker - Waterproof',
      price: 149,
      originalPrice: 179,
      rating: 4.6,
      reviewCount: 8901,
      images: [
        'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=600&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=600&h=600&fit=crop&crop=center'
      ],
      isPrime: true,
      isDeliveryTomorrow: true,
      discount: 17,
      inStock: true,
      stockCount: 32,
      description: 'Powerful portable speaker with JBL Pro Sound, 20 hours of playtime, and IP67 waterproof rating. Perfect for outdoor adventures.',
      features: [
        'JBL Pro Sound with powerful bass',
        '20 hours of playtime',
        'IP67 waterproof and dustproof',
        'Power bank functionality',
        'JBL PartyBoost compatible',
        'Durable fabric and rubber housing',
        'Multiple color options'
      ],
      specifications: {
        'Output Power': '40W RMS',
        'Frequency Response': '65Hz - 20kHz',
        'Battery Life': '20 hours',
        'Charging Time': '4 hours',
        'Bluetooth': '5.1',
        'Waterproof': 'IP67',
        'Weight': '2.11 lbs',
        'Dimensions': '8.7 x 3.76 x 3.67 inches'
      }
    },
    'e17': {
      id: 'e17',
      title: 'Logitech MX Master 3S Wireless Mouse - Graphite',
      price: 99,
      originalPrice: 119,
      rating: 4.8,
      reviewCount: 12345,
      images: [
        'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=600&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1588508065123-287b28e013da?w=600&h=600&fit=crop&crop=center'
      ],
      isPrime: true,
      isDeliveryTomorrow: true,
      discount: 17,
      inStock: true,
      stockCount: 45,
      description: 'Advanced wireless mouse with ultra-fast scrolling, cross-computer control, and 70-day battery life. Perfect for professionals.',
      features: [
        'Darkfield 4000 DPI sensor',
        'Ultra-fast MagSpeed scrolling',
        'Cross-computer control and file sharing',
        '70-day battery life',
        'USB-C fast charging',
        'Comfortable ergonomic design',
        'Customizable buttons and gestures'
      ],
      specifications: {
        'Sensor': 'Darkfield high precision',
        'DPI': '200-4000 (adjustable)',
        'Connectivity': 'Logi Bolt, Bluetooth',
        'Battery': '70 days on full charge',
        'Charging': 'USB-C',
        'Compatibility': 'Windows, macOS, Linux',
        'Weight': '4.9 oz',
        'Dimensions': '4.92 x 3.31 x 2.01 inches'
      }
    },
    'e18': {
      id: 'e18',
      title: 'Roku Ultra 4K HDR Streaming Device with Voice Remote',
      price: 79,
      originalPrice: 99,
      rating: 4.4,
      reviewCount: 5678,
      images: [
        'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=600&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1571901493467-117f180235ec?w=600&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?w=600&h=600&fit=crop&crop=center'
      ],
      isPrime: true,
      isDeliveryTomorrow: true,
      discount: 20,
      inStock: true,
      stockCount: 38,
      description: 'Premium streaming device with 4K, HDR, and Dolby Vision support. Includes voice remote with headphone jack for private listening.',
      features: [
        '4K/HDR/Dolby Vision streaming',
        'Voice Remote Pro with headphone jack',
        'Lost remote finder',
        'Dolby Atmos audio support',
        'Ethernet port for stable connection',
        'MicroSD card slot for storage',
        'Access to 500,000+ movies and TV episodes'
      ],
      specifications: {
        'Video': '4K UHD, HDR10, HDR10+, Dolby Vision',
        'Audio': 'Dolby Atmos, DTS Digital Surround',
        'Connectivity': 'Dual-band Wi-Fi, Ethernet',
        'Storage': 'MicroSD slot',
        'Remote': 'Voice Remote Pro',
        'Channels': '500,000+ movies & TV episodes',
        'Dimensions': '4.9 x 4.9 x 0.8 inches',
        'Weight': '1.5 lbs'
      }
    },
    'e19': {
      id: 'e19',
      title: 'Anker PowerCore 10000 Portable Charger - Ultra Compact',
      price: 24,
      originalPrice: 29,
      rating: 4.7,
      reviewCount: 23456,
      images: [
        'https://images.unsplash.com/photo-1609592806965-50a4bb9e2c41?w=600&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600&h=600&fit=crop&crop=center'
      ],
      isPrime: true,
      isDeliveryTomorrow: true,
      discount: 17,
      inStock: true,
      stockCount: 86,
      description: 'Ultra-compact 10000mAh portable charger with PowerIQ technology. Charge your devices multiple times with advanced safety features.',
      features: [
        '10000mAh high capacity',
        'Ultra-compact palm-sized design',
        'PowerIQ and VoltageBoost technology',
        'MultiProtect safety system',
        'LED power indicator',
        'Universal compatibility',
        'Worry-free 18-month warranty'
      ],
      specifications: {
        'Capacity': '10000mAh / 37Wh',
        'Input': '5V/2A (Micro USB)',
        'Output': '5V/2.4A (USB-A)',
        'Technology': 'PowerIQ, VoltageBoost',
        'Charging Time': '4-5 hours',
        'Weight': '6.35 oz',
        'Dimensions': '3.62 x 2.36 x 0.87 inches',
        'Safety': 'MultiProtect system'
      }
    },
    'e20': {
      id: 'e20',
      title: 'Corsair K95 RGB Platinum XT Mechanical Gaming Keyboard',
      price: 199,
      originalPrice: 249,
      rating: 4.5,
      reviewCount: 7890,
      images: [
        'https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=600&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1588508065123-287b28e013da?w=600&h=600&fit=crop&crop=center'
      ],
      isPrime: true,
      isDeliveryTomorrow: false,
      discount: 20,
      inStock: true,
      stockCount: 12,
      description: 'Premium mechanical gaming keyboard with Cherry MX switches, RGB lighting, and dedicated macro keys for competitive gaming.',
      features: [
        'Cherry MX Speed RGB switches',
        'Per-key RGB backlighting',
        '6 dedicated macro keys',
        'USB pass-through port',
        'Aircraft-grade aluminum frame',
        'Detachable wrist rest',
        'Corsair iCUE software integration'
      ],
      specifications: {
        'Switch Type': 'Cherry MX Speed RGB',
        'Backlighting': 'Per-key RGB',
        'Key Layout': 'Full-size (104 keys)',
        'Connectivity': 'USB 2.0',
        'Polling Rate': '1000Hz',
        'Key Rollover': 'Full N-key',
        'Dimensions': '18.5 x 6.7 x 1.5 inches',
        'Weight': '2.7 lbs'
      }
    },
    'e21': {
      id: 'e21',
      title: 'Razer DeathAdder V3 Pro Wireless Gaming Mouse',
      price: 149,
      originalPrice: 179,
      rating: 4.6,
      reviewCount: 4321,
      images: [
        'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1588508065123-287b28e013da?w=600&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=600&h=600&fit=crop&crop=center'
      ],
      isPrime: true,
      isDeliveryTomorrow: true,
      discount: 17,
      inStock: true,
      stockCount: 27,
      description: 'Professional wireless gaming mouse with Focus Pro 30K sensor, 90-hour battery life, and Razer HyperSpeed technology.',
      features: [
        'Focus Pro 30K sensor',
        '90-hour battery life',
        'Razer HyperSpeed wireless',
        'Gen-3 optical switches',
        'Ergonomic right-handed design',
        'DPI On-The-Fly button',
        'Razer Synapse 3 compatible'
      ],
      specifications: {
        'Sensor': 'Focus Pro 30K optical',
        'DPI': 'Up to 30,000',
        'IPS': '750',
        'Acceleration': '50G',
        'Battery Life': '90 hours',
        'Connectivity': '2.4GHz, Bluetooth',
        'Weight': '2.96 oz',
        'Dimensions': '5.0 x 2.73 x 1.68 inches'
      }
    },
    'e22': {
      id: 'e22',
      title: 'Asus ROG Strix 32" 4K Gaming Monitor with HDR',
      price: 699,
      originalPrice: 799,
      rating: 4.7,
      reviewCount: 3456,
      images: [
        'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=600&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1571901493467-117f180235ec?w=600&h=600&fit=crop&crop=center'
      ],
      isPrime: true,
      isDeliveryTomorrow: false,
      discount: 13,
      inStock: true,
      stockCount: 8,
      description: 'Large 32-inch 4K gaming monitor with 144Hz refresh rate, HDR support, and ASUS Extreme Low Motion Blur technology.',
      features: [
        '32-inch 4K UHD display',
        '144Hz refresh rate',
        'HDR-10 support',
        'ASUS Extreme Low Motion Blur',
        'AMD FreeSync Premium Pro',
        'Remote control included',
        'Multiple connectivity options'
      ],
      specifications: {
        'Screen Size': '32 inches',
        'Resolution': '4K UHD (3840 x 2160)',
        'Refresh Rate': '144Hz',
        'Response Time': '1ms MPRT',
        'Panel Type': 'IPS',
        'HDR': 'HDR-10',
        'Connectivity': 'HDMI 2.1, DisplayPort 1.4',
        'Stand': 'Tilt, swivel, pivot, height'
      }
    },
    'e23': {
      id: 'e23',
      title: 'SteelSeries Arctis 7P Wireless Gaming Headset',
      price: 149,
      originalPrice: 179,
      rating: 4.4,
      reviewCount: 6789,
      images: [
        'https://images.unsplash.com/photo-1484704849700-da0ec9d70304?w=600&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=600&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=600&fit=crop&crop=center'
      ],
      isPrime: true,
      isDeliveryTomorrow: true,
      discount: 17,
      inStock: true,
      stockCount: 21,
      description: 'Premium wireless gaming headset designed for PlayStation with 2.4GHz wireless, DTS Headphone:X 2.0, and 24-hour battery.',
      features: [
        '2.4GHz lossless wireless',
        'DTS Headphone:X 2.0 surround',
        '24-hour battery life',
        'ClearCast noise-cancelling microphone',
        'Steel-reinforced headband',
        'PlayStation 5 3D Audio compatible',
        'SteelSeries Engine support'
      ],
      specifications: {
        'Driver': '40mm neodymium',
        'Frequency Response': '20Hz - 20kHz',
        'Battery Life': '24+ hours',
        'Wireless Range': '40 feet / 12 meters',
        'Microphone': 'Retractable ClearCast',
        'Compatibility': 'PlayStation, PC, Mobile',
        'Weight': '0.73 lbs',
        'Warranty': '1 year'
      }
    },
    'e24': {
      id: 'e24',
      title: 'Western Digital 2TB External Hard Drive - USB 3.0',
      price: 79,
      originalPrice: 99,
      rating: 4.5,
      reviewCount: 8901,
      images: [
        'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=600&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1609592806965-50a4bb9e2c41?w=600&h=600&fit=crop&crop=center'
      ],
      isPrime: true,
      isDeliveryTomorrow: true,
      discount: 20,
      inStock: true,
      stockCount: 54,
      description: 'Reliable 2TB external hard drive with USB 3.0 connectivity. Perfect for backup, file storage, and expanding your computer\'s capacity.',
      features: [
        '2TB storage capacity',
        'USB 3.0 interface',
        'Plug-and-play setup',
        'Compatible with Windows and Mac',
        'Compact and portable design',
        'Password protection available',
        'WD Discovery software included'
      ],
      specifications: {
        'Capacity': '2TB',
        'Interface': 'USB 3.0',
        'Compatibility': 'Windows 10+, macOS 10.11+',
        'Power': 'USB bus powered',
        'Data Transfer Rate': 'Up to 5 Gb/s',
        'Dimensions': '4.33 x 3.21 x 0.85 inches',
        'Weight': '0.51 lbs',
        'Warranty': '2 years limited'
      }
    },
    'e25': {
      id: 'e25',
      title: 'Oculus Quest 3 VR Headset 128GB - All-in-One Virtual Reality',
      price: 499,
      originalPrice: 549,
      rating: 4.6,
      reviewCount: 5432,
      images: [
        'https://images.unsplash.com/photo-1593508512255-86ab42a8e620?w=600&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1623508343615-e5dfa11f4ec6?w=600&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600&h=600&fit=crop&crop=center'
      ],
      isPrime: true,
      isDeliveryTomorrow: false,
      discount: 9,
      inStock: true,
      stockCount: 11,
      description: 'Next-generation VR headset with mixed reality capabilities, improved optics, and powerful Snapdragon XR2 Gen 2 processor.',
      features: [
        'Mixed reality capabilities',
        '4K+ Infinite Display',
        'Snapdragon XR2 Gen 2 processor',
        'Improved Touch Plus controllers',
        'Hand tracking without controllers',
        '2+ hour battery life',
        'Access to Meta Quest Store'
      ],
      specifications: {
        'Display': '4K+ Infinite Display (2064x2208 per eye)',
        'Processor': 'Snapdragon XR2 Gen 2',
        'Storage': '128GB',
        'RAM': '8GB',
        'Refresh Rate': '90Hz, 120Hz (experimental)',
        'Battery': '2-3 hours gaming',
        'Weight': '1.24 lbs',
        'IPD Range': '58-71mm'
      }
    },
    'e26': {
      id: 'e26',
      title: 'DJI Mini 3 Pro Drone with 4K HDR Video Camera',
      price: 759,
      originalPrice: 899,
      rating: 4.8,
      reviewCount: 2345,
      images: [
        'https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=600&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1551808525-51a94da548ce?w=600&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=600&h=600&fit=crop&crop=center'
      ],
      isPrime: true,
      isDeliveryTomorrow: false,
      discount: 16,
      inStock: true,
      stockCount: 9,
      description: 'Ultra-lightweight drone with 4K HDR video, intelligent flight modes, and obstacle sensing. Perfect for aerial photography.',
      features: [
        '4K/60fps HDR video recording',
        '48MP photos with multiple modes',
        'Tri-directional obstacle sensing',
        '34-minute max flight time',
        'Intelligent flight modes',
        'Under 249g lightweight design',
        'DJI RC remote controller'
      ],
      specifications: {
        'Camera': '1/1.3" CMOS, 48MP',
        'Video': '4K/60fps HDR',
        'Flight Time': 'Up to 34 minutes',
        'Max Speed': '16 m/s (Sport mode)',
        'Transmission Range': 'Up to 12km',
        'Weight': '< 249g',
        'Dimensions': '145×90×62 mm (folded)',
        'Storage': 'microSD (up to 256GB)'
      }
    },
    'e27': {
      id: 'e27',
      title: 'Garmin Fenix 7 Solar GPS Smartwatch - Slate Gray',
      price: 699,
      originalPrice: 799,
      rating: 4.7,
      reviewCount: 3456,
      images: [
        'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=600&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=600&fit=crop&crop=center'
      ],
      isPrime: true,
      isDeliveryTomorrow: false,
      discount: 13,
      inStock: true,
      stockCount: 14,
      description: 'Advanced GPS smartwatch with solar charging, multi-sport tracking, and rugged design for outdoor adventures.',
      features: [
        'Solar charging capability',
        'Multi-GNSS satellite support',
        '30+ built-in sports apps',
        'Health and wellness monitoring',
        'Smart notifications',
        'Up to 22 days battery life',
        'Military-grade durability'
      ],
      specifications: {
        'Display': '1.3" sunlight-visible',
        'Battery': 'Up to 22 days smartwatch mode',
        'Water Rating': '10 ATM',
        'Memory': '16GB',
        'Connectivity': 'Bluetooth, ANT+, Wi-Fi',
        'GPS': 'Multi-GNSS support',
        'Weight': '2.2 oz',
        'Dimensions': '1.85 x 1.85 x 0.57 inches'
      }
    },
    'e28': {
      id: 'e28',
      title: 'Sonos One SL Wireless Smart Speaker - Black',
      price: 179,
      originalPrice: 199,
      rating: 4.5,
      reviewCount: 7890,
      images: [
        'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=600&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=600&h=600&fit=crop&crop=center'
      ],
      isPrime: true,
      isDeliveryTomorrow: true,
      discount: 10,
      inStock: true,
      stockCount: 29,
      description: 'Compact wireless speaker with rich, room-filling sound. Stream from any device and create a multi-room audio system.',
      features: [
        'Rich, room-filling sound',
        'Humidity resistant design',
        'Easy setup and control',
        'Multi-room audio capability',
        'Stream from any device',
        'Compact design fits anywhere',
        'Trueplay tuning technology'
      ],
      specifications: {
        'Drivers': 'Two Class-D amplifiers',
        'Woofer': 'One mid-woofer',
        'Tweeter': 'One tweeter',
        'Connectivity': 'Wi-Fi, AirPlay 2',
        'Dimensions': '6.36 x 4.69 x 4.69 inches',
        'Weight': '4.08 lbs',
        'Power': 'Auto-switching 100-240V',
        'Supported Services': '100+ streaming services'
      }
    },
    'e29': {
      id: 'e29',
      title: 'Tesla Model S Plaid Wireless Charging Pad',
      price: 125,
      originalPrice: 150,
      rating: 4.3,
      reviewCount: 1234,
      images: [
        'https://images.unsplash.com/photo-1609592806965-50a4bb9e2c41?w=600&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600&h=600&fit=crop&crop=center'
      ],
      isPrime: true,
      isDeliveryTomorrow: true,
      discount: 17,
      inStock: true,
      stockCount: 18,
      description: 'Premium wireless charging pad inspired by Tesla\'s sleek design. Fast wireless charging for Qi-enabled devices.',
      features: [
        '15W fast wireless charging',
        'Qi-certified compatibility',
        'LED charging indicator',
        'Non-slip charging surface',
        'Overcharge protection',
        'Tesla-inspired design',
        'Case-friendly charging'
      ],
      specifications: {
        'Output': '15W, 10W, 7.5W, 5W',
        'Input': '9V/2A, 5V/3A',
        'Compatibility': 'Qi-enabled devices',
        'Efficiency': '≥75%',
        'Operating Temperature': '0°C to 40°C',
        'Dimensions': '4.3 x 4.3 x 0.4 inches',
        'Weight': '0.66 lbs',
        'Cable': '4ft USB-C cable included'
      }
    },
    'e30': {
      id: 'e30',
      title: 'Elgato Stream Deck MK.2 - 15 Customizable LCD Keys',
      price: 149,
      originalPrice: 179,
      rating: 4.6,
      reviewCount: 4567,
      images: [
        'https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=600&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1588508065123-287b28e013da?w=600&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600&h=600&fit=crop&crop=center'
      ],
      isPrime: true,
      isDeliveryTomorrow: true,
      discount: 17,
      inStock: true,
      stockCount: 23,
      description: 'Studio controller with 15 customizable LCD keys for streamers, content creators, and productivity enthusiasts.',
      features: [
        '15 customizable LCD keys',
        'Tap to switch scenes, launch media',
        'Fully customizable with icons',
        'Unlimited control with folders',
        'Direct integration with popular tools',
        'Plugin ecosystem',
        'Drag and drop setup'
      ],
      specifications: {
        'Keys': '15 LCD keys (72x72 pixels each)',
        'Connectivity': 'USB 2.0',
        'Key Life': '> 1 million actuations',
        'Software': 'Stream Deck Software',
        'Compatibility': 'Windows 10+, macOS 10.14+',
        'Dimensions': '4.6 x 3.3 x 0.8 inches',
        'Weight': '0.46 lbs',
        'Cable': '5ft USB cable'
      }
    },
    'e31': {
      id: 'e31',
      title: 'Philips Hue White and Color Ambiance Smart Bulb Starter Kit',
      price: 199,
      originalPrice: 229,
      rating: 4.4,
      reviewCount: 8901,
      images: [
        'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1593941707874-ef25b8b4a92b?w=600&h=600&fit=crop&crop=center'
      ],
      isPrime: true,
      isDeliveryTomorrow: true,
      discount: 13,
      inStock: true,
      stockCount: 34,
      description: 'Smart lighting starter kit with 4 color-changing bulbs and Hue Bridge. Control with voice, app, or smart home systems.',
      features: [
        '4 A19 color bulbs included',
        'Hue Bridge included',
        '16 million colors available',
        'Voice control compatibility',
        'Sync with music and movies',
        'Geofencing automation',
        'Works with 1000+ apps'
      ],
      specifications: {
        'Bulb Type': 'A19 LED',
        'Wattage': '9W (60W equivalent)',
        'Brightness': '800 lumens',
        'Color Temperature': '2000K-6500K',
        'Lifespan': '25,000 hours',
        'Connectivity': 'Zigbee 3.0',
        'Compatibility': 'Alexa, Google, Apple HomeKit',
        'App': 'Philips Hue app'
      }
    },
    'e32': {
      id: 'e32',
      title: 'Ring Video Doorbell Pro 2 - 1536p HD Video with 3D Motion Detection',
      price: 249,
      originalPrice: 279,
      rating: 4.2,
      reviewCount: 6789,
      images: [
        'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1593941707874-ef25b8b4a92b?w=600&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600&h=600&fit=crop&crop=center'
      ],
      isPrime: true,
      isDeliveryTomorrow: false,
      discount: 11,
      inStock: true,
      stockCount: 16,
      description: 'Advanced video doorbell with 1536p HD video, 3D Motion Detection, and Alexa integration for enhanced home security.',
      features: [
        '1536p HD head-to-toe video',
        '3D Motion Detection',
        'Advanced Pre-Roll technology',
        'Bird\'s Eye View aerial perspective',
        'Works with Alexa',
        'Dual-band Wi-Fi connectivity',
        'Professional installation required'
      ],
      specifications: {
        'Video Quality': '1536p HD',
        'Field of View': '150° horizontal, 90° vertical',
        '3D Motion Detection': 'Yes',
        'Pre-Roll': '4 seconds color, 8 seconds B&W',
        'Power': 'Hardwired (16-24 VAC)',
        'Connectivity': 'Dual-band Wi-Fi',
        'Operating Temperature': '-20°F to 120°F',
        'Dimensions': '5.1 x 2.4 x 1.1 inches'
      }
    },
    'e33': {
      id: 'e33',
      title: 'Nest Learning Thermostat 3rd Generation - Stainless Steel',
      price: 249,
      originalPrice: 279,
      rating: 4.5,
      reviewCount: 5432,
      images: [
        'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1593941707874-ef25b8b4a92b?w=600&h=600&fit=crop&crop=center'
      ],
      isPrime: true,
      isDeliveryTomorrow: false,
      discount: 11,
      inStock: true,
      stockCount: 12,
      description: 'Smart thermostat that learns your schedule and programs itself. Helps save energy with proven energy-saving features.',
      features: [
        'Auto-learns your schedule',
        'Remote control via smartphone',
        'Energy-saving features',
        'Works with 95% of systems',
        'Farsight technology',
        'Professional installation available',
        'Proven energy savings'
      ],
      specifications: {
        'Display': '2.08" 480x480 LCD',
        'Connectivity': 'Wi-Fi 802.11 b/g/n',
        'Sensors': 'Temperature, humidity, light, motion',
        'Compatibility': '95% of heating/cooling systems',
        'Power': 'Rechargeable lithium-ion battery',
        'Dimensions': '3.3 x 3.3 x 1.21 inches',
        'Weight': '7.3 oz',
        'Operating Temperature': '32°F to 95°F'
      }
    },
    'e34': {
      id: 'e34',
      title: 'Arlo Pro 4 Wireless Security Camera System - 2K HDR',
      price: 199,
      originalPrice: 249,
      rating: 4.3,
      reviewCount: 3456,
      images: [
        'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1593941707874-ef25b8b4a92b?w=600&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600&h=600&fit=crop&crop=center'
      ],
      isPrime: true,
      isDeliveryTomorrow: false,
      discount: 20,
      inStock: true,
      stockCount: 8,
      description: 'Wire-free security camera with 2K HDR video, color night vision, and advanced AI detection for comprehensive home security.',
      features: [
        '2K HDR video quality',
        'Color night vision',
        'Integrated spotlight',
        'Advanced AI detection',
        'Wire-free design',
        '6-month battery life',
        'Weather-resistant'
      ],
      specifications: {
        'Video Quality': '2K (2560x1440) HDR',
        'Field of View': '160° diagonal',
        'Night Vision': 'Color and infrared',
        'Audio': 'Two-way with noise cancellation',
        'Storage': 'Cloud and local (hub required)',
        'Battery': 'Rechargeable, 3-6 months',
        'Weather Rating': 'IP65',
        'Dimensions': '3.1 x 1.9 x 2.8 inches'
      }
    },
    'e35': {
      id: 'e35',
      title: 'Tile Mate Bluetooth Tracker 4-Pack - Find Your Keys & More',
      price: 59,
      originalPrice: 79,
      rating: 4.1,
      reviewCount: 12345,
      images: [
        'https://images.unsplash.com/photo-1609592806965-50a4bb9e2c41?w=600&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600&h=600&fit=crop&crop=center'
      ],
      isPrime: true,
      isDeliveryTomorrow: true,
      discount: 25,
      inStock: true,
      stockCount: 67,
      description: 'Bluetooth tracking devices to find your keys, wallet, and other important items. 4-pack for comprehensive tracking.',
      features: [
        '200 ft Bluetooth range',
        'Loud 58dB ring',
        '1-year replaceable battery',
        'Water-resistant design',
        'Anonymous finding network',
        'Works with Alexa and Google',
        '4 trackers included'
      ],
      specifications: {
        'Range': '200 ft',
        'Volume': '58dB',
        'Battery': 'CR1632 (1 year)',
        'Water Resistance': 'IP55',
        'Connectivity': 'Bluetooth 5.0',
        'Dimensions': '1.5 x 1.5 x 0.24 inches',
        'Weight': '0.35 oz',
        'App': 'Tile app (iOS/Android)'
      }
    },
    'e36': {
      id: 'e36',
      title: 'Belkin 3-in-1 Wireless Charger for iPhone, Apple Watch & AirPods',
      price: 149,
      originalPrice: 179,
      rating: 4.4,
      reviewCount: 7890,
      images: [
        'https://images.unsplash.com/photo-1609592806965-50a4bb9e2c41?w=600&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600&h=600&fit=crop&crop=center'
      ],
      isPrime: true,
      isDeliveryTomorrow: true,
      discount: 17,
      inStock: true,
      stockCount: 31,
      description: 'All-in-one wireless charging station for iPhone, Apple Watch, and AirPods. MagSafe compatible with sleek design.',
      features: [
        'MagSafe compatible iPhone charging',
        'Apple Watch charging puck',
        'AirPods wireless charging pad',
        'Simultaneous 3-device charging',
        'LED charging indicators',
        'Premium materials and design',
        'Power adapter included'
      ],
      specifications: {
        'iPhone Output': '15W MagSafe',
        'Apple Watch Output': '5W',
        'AirPods Output': '5W',
        'Input': '36W power adapter',
        'Compatibility': 'iPhone 12+, Apple Watch, AirPods Pro/3/2',
        'Dimensions': '7.56 x 6.73 x 4.73 inches',
        'Weight': '1.95 lbs',
        'Certification': 'Qi-certified, MFi'
      }
    },
    'f1': {
      id: 'f1',
      title: "Levi's Women's 501 High Rise Straight Jeans - Medium Wash",
      price: 89.50,
      originalPrice: 98.00,
      rating: 4.6,
      reviewCount: 12847,
      images: [
        'https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1541099649105-fcd25c85cd64?w=600&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1584370848010-d7fe6bc767ec?w=600&h=600&fit=crop&crop=center'
      ],
      isPrime: true,
      isDeliveryTomorrow: true,
      discount: 9,
      inStock: true,
      stockCount: 43,
      description: 'Classic high-rise straight jeans with vintage-inspired fit. Made from premium denim with authentic details and timeless style.',
      features: [
        'High-rise waist for flattering fit',
        'Straight leg silhouette',
        'Medium wash with authentic aging',
        '100% cotton denim construction',
        'Classic 5-pocket styling',
        'Button fly closure',
        'Iconic Levi\'s red tab'
      ],
      specifications: {
        'Material': '100% Cotton',
        'Fit': 'High Rise Straight',
        'Rise': '11.75 inches',
        'Inseam': '30 inches',
        'Leg Opening': '16.5 inches',
        'Care': 'Machine wash cold',
        'Origin': 'Made in Turkey',
        'Style': '501 Original'
      }
    },
    'f2': {
      id: 'f2',
      title: 'Nike Air Force 1 \'07 White Leather Sneakers - Unisex',
      price: 110,
      originalPrice: 130,
      rating: 4.8,
      reviewCount: 28934,
      images: [
        'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1605348532760-da0ec9d70304?w=600&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=600&fit=crop&crop=center'
      ],
      isPrime: true,
      isDeliveryTomorrow: true,
      discount: 15,
      inStock: true,
      stockCount: 62,
      description: 'Iconic basketball-inspired sneakers with premium leather upper and classic design. The perfect blend of style and comfort.',
      features: [
        'Premium leather upper',
        'Air-Sole unit for cushioning',
        'Rubber outsole with pivot points',
        'Classic basketball silhouette',
        'Perforated toe box for breathability',
        'Padded collar and tongue',
        'Unisex sizing available'
      ],
      specifications: {
        'Upper': 'Premium leather',
        'Midsole': 'Foam with Air-Sole unit',
        'Outsole': 'Solid rubber',
        'Closure': 'Lace-up',
        'Heel Height': '1.25 inches',
        'Weight': '1.2 lbs (size 9)',
        'Origin': 'Vietnam',
        'Style Code': '315122-111'
      }
    },
    'f3': {
      id: 'f3',
      title: 'Zara Women\'s Oversized Blazer - Black Premium Wool Blend',
      price: 149,
      originalPrice: 199,
      rating: 4.4,
      reviewCount: 5672,
      images: [
        'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=600&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=600&h=600&fit=crop&crop=center'
      ],
      isPrime: true,
      isDeliveryTomorrow: false,
      discount: 25,
      inStock: true,
      stockCount: 18,
      description: 'Contemporary oversized blazer crafted from premium wool blend. Perfect for professional settings or elevated casual looks.',
      features: [
        'Oversized contemporary fit',
        'Premium wool blend fabric',
        'Structured shoulders',
        'Double-breasted design',
        'Side pockets',
        'Full lining',
        'Professional finish'
      ],
      specifications: {
        'Material': '70% Wool, 25% Polyester, 5% Elastane',
        'Lining': '100% Polyester',
        'Fit': 'Oversized',
        'Length': '29 inches',
        'Closure': 'Double-breasted buttons',
        'Care': 'Dry clean only',
        'Origin': 'Made in Turkey',
        'Color': 'Black'
      }
    },
    'f4': {
      id: 'f4',
      title: 'Adidas Originals Three Stripes Track Jacket - Vintage Style',
      price: 85,
      originalPrice: 100,
      rating: 4.7,
      reviewCount: 15234,
      images: [
        'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=600&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=600&h=600&fit=crop&crop=center'
      ],
      isPrime: true,
      isDeliveryTomorrow: true,
      discount: 15,
      inStock: true,
      stockCount: 37,
      description: 'Classic track jacket with iconic three stripes design. Vintage-inspired style with modern comfort and fit.',
      features: [
        'Iconic three stripes design',
        'Full zip front closure',
        'Ribbed cuffs and hem',
        'Side pockets',
        'Vintage-inspired styling',
        'Regular fit',
        'Trefoil logo badge'
      ],
      specifications: {
        'Material': '70% Cotton, 30% Polyester',
        'Fit': 'Regular',
        'Closure': 'Full zip',
        'Pockets': '2 side zip pockets',
        'Care': 'Machine wash cold',
        'Size Range': 'XS-XXL',
        'Origin': 'Made in Cambodia',
        'Collection': 'Originals'
      }
    },
    'f5': {
      id: 'f5',
      title: 'H&M Women\'s Floral Summer Dress - Midi Length Cotton Blend',
      price: 39.99,
      originalPrice: 49.99,
      rating: 4.3,
      reviewCount: 8765,
      images: [
        'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=600&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=600&h=600&fit=crop&crop=center'
      ],
      isPrime: true,
      isDeliveryTomorrow: true,
      discount: 20,
      inStock: true,
      stockCount: 28,
      description: 'Feminine floral dress in midi length with comfortable cotton blend fabric. Perfect for casual outings and summer events.',
      features: [
        'Romantic floral print',
        'Midi length design',
        'Short sleeves',
        'Fit-and-flare silhouette',
        'Side zipper closure',
        'Breathable cotton blend',
        'Machine washable'
      ],
      specifications: {
        'Material': '60% Cotton, 40% Polyester',
        'Length': 'Midi (46 inches)',
        'Sleeves': 'Short sleeves',
        'Closure': 'Side zipper',
        'Fit': 'Fit-and-flare',
        'Care': 'Machine wash warm',
        'Size Range': 'XS-XL',
        'Print': 'Floral'
      }
    },
    'f6': {
      id: 'f6',
      title: 'Ray-Ban Classic Aviator Sunglasses - Gold Frame Green Lens',
      price: 154,
      originalPrice: 179,
      rating: 4.6,
      reviewCount: 23456,
      images: [
        'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=600&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1556306553-6f6e4b9c2cd9?w=600&h=600&fit=crop&crop=center'
      ],
      isPrime: true,
      isDeliveryTomorrow: true,
      discount: 14,
      inStock: true,
      stockCount: 52,
      description: 'Iconic aviator sunglasses with gold-tone frame and classic green lenses. Timeless style with superior UV protection.',
      features: [
        'Classic aviator design',
        'Gold-tone metal frame',
        'G-15 green crystal lenses',
        '100% UV protection',
        'Adjustable nose pads',
        'Spring hinges',
        'Includes carrying case'
      ],
      specifications: {
        'Frame Material': 'Metal (Gold-tone)',
        'Lens Material': 'Glass',
        'Lens Color': 'G-15 Green',
        'UV Protection': '100% UV400',
        'Frame Width': '5.6 inches',
        'Lens Width': '58mm',
        'Bridge Width': '14mm',
        'Temple Length': '135mm'
      }
    },
    'f7': {
      id: 'f7',
      title: 'Guess Men\'s Classic Leather Wallet - Brown Genuine Leather',
      price: 65,
      originalPrice: 85,
      rating: 4.5,
      reviewCount: 6789,
      images: [
        'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1627123424574-724758594e93?w=600&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=600&h=600&fit=crop&crop=center'
      ],
      isPrime: true,
      isDeliveryTomorrow: true,
      discount: 24,
      inStock: true,
      stockCount: 41,
      description: 'Premium leather bifold wallet with classic design and ample storage. Crafted from genuine leather with embossed logo.',
      features: [
        'Genuine leather construction',
        'Bifold design',
        '6 card slots',
        'ID window',
        '2 bill compartments',
        'Coin pocket',
        'Embossed Guess logo'
      ],
      specifications: {
        'Material': '100% Genuine Leather',
        'Style': 'Bifold',
        'Card Slots': '6',
        'Bill Compartments': '2',
        'ID Window': 'Yes',
        'Dimensions': '4.5 x 3.5 x 0.75 inches',
        'Color': 'Brown',
        'Hardware': 'Gunmetal'
      }
    },
    'f8': {
      id: 'f8',
      title: 'Calvin Klein Women\'s High Waist Skinny Jeans - Dark Blue Denim',
      price: 79,
      originalPrice: 98,
      rating: 4.4,
      reviewCount: 11234,
      images: [
        'https://images.unsplash.com/photo-1541099649105-fcd25c85cd64?w=600&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1584370848010-d7fe6bc767ec?w=600&h=600&fit=crop&crop=center'
      ],
      isPrime: true,
      isDeliveryTomorrow: true,
      discount: 19,
      inStock: true,
      stockCount: 29,
      description: 'Contemporary high-waist skinny jeans in premium stretch denim. Flattering fit with modern styling and comfortable wear.',
      features: [
        'High-waist design',
        'Skinny fit through leg',
        'Premium stretch denim',
        'Dark blue wash',
        '5-pocket styling',
        'Zip fly with button closure',
        'Calvin Klein logo hardware'
      ],
      specifications: {
        'Material': '79% Cotton, 20% Polyester, 1% Elastane',
        'Fit': 'High Waist Skinny',
        'Rise': '10 inches',
        'Inseam': '29 inches',
        'Leg Opening': '10.5 inches',
        'Stretch': 'Moderate stretch',
        'Care': 'Machine wash cold',
        'Origin': 'Made in Mexico'
      }
    },
    'f9': {
      id: 'f9',
      title: 'Converse Chuck Taylor All Star High Top Sneakers - Classic Black',
      price: 65,
      originalPrice: 70,
      rating: 4.7,
      reviewCount: 45678,
      images: [
        'https://images.unsplash.com/photo-1605348532760-da0ec9d70304?w=600&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=600&fit=crop&crop=center'
      ],
      isPrime: true,
      isDeliveryTomorrow: true,
      discount: 7,
      inStock: true,
      stockCount: 78,
      description: 'Timeless high-top sneakers with iconic design. Classic canvas construction with signature rubber toe cap and sole.',
      features: [
        'Classic canvas upper',
        'High-top silhouette',
        'Signature rubber toe cap',
        'Vulcanized rubber sole',
        'Metal eyelets',
        'All Star ankle patch',
        'Unisex sizing'
      ],
      specifications: {
        'Upper': 'Canvas',
        'Sole': 'Vulcanized rubber',
        'Closure': 'Lace-up',
        'Toe Cap': 'Rubber',
        'Height': 'High-top',
        'Care': 'Spot clean',
        'Origin': 'Vietnam',
        'Style': 'Chuck Taylor All Star'
      }
    },
    'f10': {
      id: 'f10',
      title: 'Coach Women\'s Signature Canvas Handbag - Brown Leather Trim',
      price: 295,
      originalPrice: 350,
      rating: 4.8,
      reviewCount: 3456,
      images: [
        'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1624681689597-ec3e6c58a27a?w=600&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1590736969955-71cc94901144?w=600&h=600&fit=crop&crop=center'
      ],
      isPrime: true,
      isDeliveryTomorrow: false,
      discount: 16,
      inStock: true,
      stockCount: 14,
      description: 'Luxury handbag featuring Coach\'s signature canvas with refined leather trim. Timeless design with practical functionality.',
      features: [
        'Signature canvas construction',
        'Refined leather trim',
        'Double handles',
        'Interior zip pocket',
        'Cell phone pocket',
        'Fabric lining',
        'Coach hang tag'
      ],
      specifications: {
        'Material': 'Signature Canvas with Leather',
        'Lining': 'Fabric',
        'Closure': 'Zip top',
        'Handle Drop': '8 inches',
        'Dimensions': '13 x 9 x 5 inches',
        'Interior': 'Zip pocket, cell phone pocket',
        'Hardware': 'Silver-tone',
        'Origin': 'Made in Philippines'
      }
    },
    'f11': {
      id: 'f11',
      title: 'Tommy Hilfiger Men\'s Classic Polo Shirt - Navy Cotton Pique',
      price: 49.50,
      originalPrice: 69.50,
      rating: 4.5,
      reviewCount: 9876,
      images: [
        'https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=600&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=600&h=600&fit=crop&crop=center'
      ],
      isPrime: true,
      isDeliveryTomorrow: true,
      discount: 29,
      inStock: true,
      stockCount: 64,
      description: 'Classic polo shirt in premium cotton pique with iconic Tommy Hilfiger styling. Perfect for casual and smart-casual occasions.',
      features: [
        'Premium cotton pique fabric',
        'Classic fit',
        'Two-button placket',
        'Ribbed collar and cuffs',
        'Side vents',
        'Embroidered flag logo',
        'Machine washable'
      ],
      specifications: {
        'Material': '100% Cotton Pique',
        'Fit': 'Classic',
        'Collar': 'Ribbed polo collar',
        'Placket': 'Two-button',
        'Logo': 'Embroidered flag logo',
        'Care': 'Machine wash cold',
        'Size Range': 'S-XXL',
        'Origin': 'Made in Peru'
      }
    },
    'f12': {
      id: 'f12',
      title: 'Michael Kors Women\'s Smartwatch - Rose Gold Stainless Steel',
      price: 249,
      originalPrice: 295,
      rating: 4.3,
      reviewCount: 7890,
      images: [
        'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=600&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=600&fit=crop&crop=center'
      ],
      isPrime: true,
      isDeliveryTomorrow: false,
      discount: 16,
      inStock: true,
      stockCount: 19,
      description: 'Luxury smartwatch with rose gold stainless steel case and comprehensive health tracking. Combines fashion with technology.',
      features: [
        'Rose gold stainless steel case',
        'Heart rate and activity tracking',
        'GPS and swim-proof design',
        'Customizable watch faces',
        'Smart notifications',
        'Google Pay and Google Assistant',
        'All-day battery life'
      ],
      specifications: {
        'Case Material': 'Stainless Steel',
        'Case Color': 'Rose Gold',
        'Display': '1.28" AMOLED',
        'Battery Life': '24+ hours',
        'Water Resistance': '3ATM + swim proof',
        'Connectivity': 'Bluetooth, Wi-Fi, GPS',
        'Compatibility': 'Android 6.0+',
        'Sensors': 'Heart rate, accelerometer, gyroscope'
      }
    },
    'f13': {
      id: 'f13',
      title: 'Patagonia Better Sweater Fleece Jacket - Women\'s Classic Navy',
      price: 99,
      originalPrice: 119,
      rating: 4.7,
      reviewCount: 8765,
      images: [
        'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=600&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=600&h=600&fit=crop&crop=center'
      ],
      isPrime: true,
      isDeliveryTomorrow: true,
      discount: 17,
      inStock: true,
      stockCount: 42,
      description: 'Cozy fleece jacket made from recycled polyester. Perfect for layering with classic styling and sustainable materials.',
      features: [
        '100% recycled polyester fleece',
        'Full-zip front with stand-up collar',
        'Raglan sleeves for mobility',
        'Two zippered handwarmer pockets',
        'Feminine fit',
        'Fair Trade Certified sewn',
        'durable water repellent finish'
      ],
      specifications: {
        'Material': '100% Recycled Polyester',
        'Weight': '9.5 oz (270 g)',
        'Fit': 'Regular',
        'Pockets': '2 zippered handwarmer pockets',
        'Collar': 'Stand-up collar',
        'Certification': 'Fair Trade Certified',
        'Care': 'Machine wash cold',
        'Origin': 'Made in Vietnam'
      }
    },
    'f14': {
      id: 'f14',
      title: 'Vans Old Skool Classic Skate Shoes - Black/White',
      price: 65,
      originalPrice: 75,
      rating: 4.6,
      reviewCount: 23456,
      images: [
        'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1605348532760-da0ec9d70304?w=600&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=600&fit=crop&crop=center'
      ],
      isPrime: true,
      isDeliveryTomorrow: true,
      discount: 13,
      inStock: true,
      stockCount: 91,
      description: 'Iconic skate shoes with signature side stripe and durable construction. The original classic that started it all.',
      features: [
        'Iconic side stripe design',
        'Durable suede and canvas uppers',
        'Reinforced toe caps',
        'Signature rubber waffle outsole',
        'Padded collar for comfort',
        'Metal eyelets',
        'Classic low-top silhouette'
      ],
      specifications: {
        'Upper': 'Suede and Canvas',
        'Sole': 'Vulcanized rubber waffle',
        'Closure': 'Lace-up',
        'Style': 'Low-top',
        'Toe Cap': 'Reinforced',
        'Origin': 'Made in China',
        'Care': 'Spot clean',
        'Colorway': 'Black/True White'
      }
    },
    'f15': {
      id: 'f15',
      title: 'Uniqlo Heattech Ultra Warm Crew Neck Long Sleeve T-Shirt',
      price: 19.90,
      originalPrice: 24.90,
      rating: 4.4,
      reviewCount: 15678,
      images: [
        'https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=600&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=600&h=600&fit=crop&crop=center'
      ],
      isPrime: true,
      isDeliveryTomorrow: true,
      discount: 20,
      inStock: true,
      stockCount: 87,
      description: 'Advanced thermal underwear with innovative Heattech technology. Ultra-warm base layer for cold weather comfort.',
      features: [
        'Heattech Ultra Warm technology',
        'Generates heat from body moisture',
        'Ultra-soft microfiber feel',
        'Crew neck design',
        'Long sleeves',
        'Moisture-wicking properties',
        'Odor-resistant treatment'
      ],
      specifications: {
        'Material': '52% Acrylic, 25% Polyester, 18% Rayon, 5% Spandex',
        'Technology': 'Heattech Ultra Warm',
        'Fit': 'Regular',
        'Neckline': 'Crew neck',
        'Sleeves': 'Long sleeves',
        'Care': 'Machine wash cold',
        'Origin': 'Made in China',
        'Features': 'Moisture-wicking, Odor-resistant'
      }
    },
    'f16': {
      id: 'f16',
      title: 'Lululemon Align High-Rise Pant 28" - Black Yoga Leggings',
      price: 128,
      originalPrice: 148,
      rating: 4.8,
      reviewCount: 34567,
      images: [
        'https://images.unsplash.com/photo-1506629905607-d9b1b2e3d75b?w=600&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=600&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&h=600&fit=crop&crop=center'
      ],
      isPrime: true,
      isDeliveryTomorrow: true,
      discount: 14,
      inStock: true,
      stockCount: 56,
      description: 'Ultra-soft yoga leggings with naked sensation fabric. High-rise design with 28-inch inseam for tall women.',
      features: [
        'Nulu fabric feels like naked sensation',
        'High-rise waistband',
        '28-inch inseam for tall figures',
        'Four-way stretch',
        'No side seams',
        'Hidden waistband pocket',
        'Sweat-wicking and breathable'
      ],
      specifications: {
        'Material': 'Nulu (81% Nylon, 19% Lycra Elastane)',
        'Rise': 'High-rise (10 inches)',
        'Inseam': '28 inches',
        'Fit': 'Tight',
        'Waistband': 'High-rise with drawcord',
        'Pockets': 'Hidden waistband pocket',
        'Care': 'Machine wash cold',
        'Origin': 'Made in Vietnam'
      }
    },
    'f17': {
      id: 'f17',
      title: 'North Face Venture 2 Jacket - Men\'s Waterproof Rain Jacket',
      price: 99,
      originalPrice: 119,
      rating: 4.5,
      reviewCount: 12345,
      images: [
        'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=600&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=600&h=600&fit=crop&crop=center'
      ],
      isPrime: true,
      isDeliveryTomorrow: true,
      discount: 17,
      inStock: true,
      stockCount: 33,
      description: 'Reliable waterproof rain jacket with DryVent technology. Lightweight and packable for outdoor adventures.',
      features: [
        'DryVent 2.5L waterproof technology',
        'Fully seam sealed',
        'Adjustable hood',
        'Two hand pockets',
        'Velcro cuff tabs',
        'Packable into hand pocket',
        'Standard fit'
      ],
      specifications: {
        'Material': 'DryVent 2.5L (100% Nylon)',
        'Waterproof Rating': '10,000mm',
        'Breathability': '1,000g/m²/24hr',
        'Fit': 'Standard',
        'Hood': 'Fully adjustable',
        'Pockets': '2 hand pockets',
        'Weight': '10.2 oz',
        'Packable': 'Into hand pocket'
      }
    },
    'f18': {
      id: 'f18',
      title: 'Kate Spade New York Cameron Street Small Satchel - Pink',
      price: 198,
      originalPrice: 248,
      rating: 4.6,
      reviewCount: 5432,
      images: [
        'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1624681689597-ec3e6c58a27a?w=600&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1590736969955-71cc94901144?w=600&h=600&fit=crop&crop=center'
      ],
      isPrime: true,
      isDeliveryTomorrow: false,
      discount: 20,
      inStock: true,
      stockCount: 22,
      description: 'Chic satchel in signature saffiano leather with sophisticated design. Perfect size for daily essentials.',
      features: [
        'Crosshatched saffiano leather',
        'Top zip closure',
        'Dual top handles',
        'Optional crossbody strap',
        'Interior zip pocket',
        'Signature Kate Spade lining',
        'Gold-tone hardware'
      ],
      specifications: {
        'Material': 'Saffiano Leather',
        'Lining': 'Signature Kate Spade fabric',
        'Closure': 'Top zip',
        'Handles': 'Dual handles, 4.5" drop',
        'Strap': 'Removable crossbody, 22" drop',
        'Dimensions': '9.5" x 7.5" x 4.5"',
        'Interior': 'Zip pocket, slip pockets',
        'Hardware': 'Gold-tone'
      }
    },
    'f19': {
      id: 'f19',
      title: 'Champion Powerblend Fleece Hoodie - Men\'s Gray Heather',
      price: 35,
      originalPrice: 45,
      rating: 4.3,
      reviewCount: 18765,
      images: [
        'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=600&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=600&h=600&fit=crop&crop=center'
      ],
      isPrime: true,
      isDeliveryTomorrow: true,
      discount: 22,
      inStock: true,
      stockCount: 74,
      description: 'Comfortable fleece hoodie with Powerblend technology. Reduced pilling and shrinkage for long-lasting wear.',
      features: [
        'Powerblend fleece reduces pilling',
        'Pullover hoodie with drawstrings',
        'Kangaroo pocket',
        'Ribbed cuffs and hem',
        'Athletic fit',
        'Champion C logo',
        'Machine washable'
      ],
      specifications: {
        'Material': '50% Cotton, 50% Polyester',
        'Technology': 'Powerblend (reduced pilling)',
        'Fit': 'Athletic',
        'Hood': 'Drawstring hood',
        'Pocket': 'Front kangaroo pocket',
        'Cuffs': 'Ribbed cuffs and hem',
        'Care': 'Machine wash cold',
        'Origin': 'Made in Honduras'
      }
    },
    'f20': {
      id: 'f20',
      title: 'Fossil Gen 6 Smartwatch - Stainless Steel with Heart Rate',
      price: 255,
      originalPrice: 295,
      rating: 4.2,
      reviewCount: 6789,
      images: [
        'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=600&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=600&fit=crop&crop=center'
      ],
      isPrime: true,
      isDeliveryTomorrow: false,
      discount: 14,
      inStock: true,
      stockCount: 26,
      description: 'Advanced smartwatch with Wear OS by Google. Comprehensive health tracking with classic watch aesthetics.',
      features: [
        'Wear OS by Google',
        'Snapdragon Wear 4100+ platform',
        'Heart rate & SpO2 tracking',
        'GPS and NFC payments',
        'Customizable watch faces',
        'Rapid charging',
        'Water resistant (3ATM)'
      ],
      specifications: {
        'OS': 'Wear OS by Google',
        'Processor': 'Snapdragon Wear 4100+',
        'Display': '1.28" AMOLED',
        'Battery': '24+ hours',
        'Sensors': 'Heart rate, SpO2, accelerometer',
        'Connectivity': 'Bluetooth, Wi-Fi, GPS',
        'Water Resistance': '3ATM',
        'Compatibility': 'Android 6.0+, iOS 12.0+'
      }
    },
    'f21': {
      id: 'f21',
      title: 'Allbirds Tree Runners - Sustainable Sneakers Natural White',
      price: 98,
      originalPrice: 118,
      rating: 4.4,
      reviewCount: 9876,
      images: [
        'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1605348532760-da0ec9d70304?w=600&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=600&fit=crop&crop=center'
      ],
      isPrime: true,
      isDeliveryTomorrow: true,
      discount: 17,
      inStock: true,
      stockCount: 48,
      description: 'Sustainable sneakers made from eucalyptus tree fiber. Lightweight, breathable, and naturally odor-resistant.',
      features: [
        'Eucalyptus tree fiber upper',
        'Naturally moisture-wicking',
        'Odor-resistant properties',
        'Machine washable',
        'Carbon negative footprint',
        'Minimalist design',
        'All-day comfort'
      ],
      specifications: {
        'Upper': 'Eucalyptus Tree Fiber',
        'Sole': 'SweetFoam (sugarcane-based)',
        'Laces': 'Recycled plastic bottles',
        'Insole': 'Castor bean oil foam',
        'Weight': '7.6 oz per shoe',
        'Care': 'Machine wash cold',
        'Certification': 'Carbon negative',
        'Origin': 'Made in South Korea'
      }
    },
    'f22': {
      id: 'f22',
      title: 'Madewell The Perfect Vintage Jean - High-Rise Skinny',
      price: 128,
      originalPrice: 148,
      rating: 4.5,
      reviewCount: 7654,
      images: [
        'https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1541099649105-fcd25c85cd64?w=600&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1584370848010-d7fe6bc767ec?w=600&h=600&fit=crop&crop=center'
      ],
      isPrime: true,
      isDeliveryTomorrow: true,
      discount: 14,
      inStock: true,
      stockCount: 35,
      description: 'Premium vintage-inspired jeans with perfect fit and authentic details. High-rise skinny silhouette in premium denim.',
      features: [
        'High-rise waist (10" rise)',
        'Skinny fit through leg',
        'Premium vintage-wash denim',
        'Button fly closure',
        'Classic 5-pocket styling',
        'Signature leather patch',
        'Comfortable stretch'
      ],
      specifications: {
        'Material': '99% Cotton, 1% Elastane',
        'Fit': 'High-Rise Skinny',
        'Rise': '10 inches',
        'Inseam': '28 inches',
        'Leg Opening': '10 inches',
        'Closure': 'Button fly',
        'Care': 'Machine wash cold',
        'Origin': 'Made in Turkey'
      }
    },
    'f23': {
      id: 'f23',
      title: 'Everlane The Cashmere Crew Sweater - Women\'s Camel',
      price: 100,
      originalPrice: 130,
      rating: 4.6,
      reviewCount: 4321,
      images: [
        'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=600&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=600&h=600&fit=crop&crop=center'
      ],
      isPrime: true,
      isDeliveryTomorrow: false,
      discount: 23,
      inStock: true,
      stockCount: 27,
      description: 'Luxurious 2-ply cashmere sweater with classic crew neck design. Grade-A cashmere for ultimate softness and warmth.',
      features: [
        'Grade-A 2-ply cashmere',
        'Classic crew neck',
        'Relaxed fit',
        'Ribbed cuffs and hem',
        'Long sleeves',
        'Ethically sourced',
        'Hand wash recommended'
      ],
      specifications: {
        'Material': '100% Grade-A Cashmere',
        'Ply': '2-ply construction',
        'Fit': 'Relaxed',
        'Neckline': 'Crew neck',
        'Sleeves': 'Long sleeves',
        'Care': 'Hand wash or dry clean',
        'Origin': 'Made in China',
        'Certification': 'Ethically sourced'
      }
    },
    'f24': {
      id: 'f24',
      title: 'Warby Parker Percey Glasses - Tortoise Acetate Frames',
      price: 95,
      originalPrice: 115,
      rating: 4.7,
      reviewCount: 8901,
      images: [
        'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=600&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1556306553-6f6e4b9c2cd9?w=600&h=600&fit=crop&crop=center'
      ],
      isPrime: true,
      isDeliveryTomorrow: true,
      discount: 17,
      inStock: true,
      stockCount: 43,
      description: 'Classic round glasses in premium acetate with anti-reflective lenses. Timeless design meets modern functionality.',
      features: [
        'Italian acetate frames',
        'Round lens shape',
        'Anti-reflective lenses',
        'UV protection included',
        'Spring hinges',
        'Includes case and cloth',
        'Free prescription lenses'
      ],
      specifications: {
        'Frame Material': 'Italian Acetate',
        'Frame Color': 'Tortoise',
        'Lens Shape': 'Round',
        'Lens Width': '47mm',
        'Bridge Width': '20mm',
        'Temple Length': '145mm',
        'UV Protection': 'UV400',
        'Features': 'Anti-reflective coating'
      }
    },
    'f25': {
      id: 'f25',
      title: 'Reformation Midi Wrap Dress - Floral Print Sustainable Fabric',
      price: 178,
      originalPrice: 218,
      rating: 4.5,
      reviewCount: 3456,
      images: [
        'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=600&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=600&h=600&fit=crop&crop=center'
      ],
      isPrime: true,
      isDeliveryTomorrow: false,
      discount: 18,
      inStock: true,
      stockCount: 19,
      description: 'Sustainable midi wrap dress in vintage-inspired floral print. Made from deadstock fabric with feminine silhouette.',
      features: [
        'Sustainable deadstock fabric',
        'Midi length wrap design',
        'Vintage floral print',
        'Three-quarter sleeves',
        'Self-tie waist belt',
        'V-neckline',
        'Carbon neutral shipping'
      ],
      specifications: {
        'Material': 'Deadstock Rayon (sustainable)',
        'Length': 'Midi (48 inches)',
        'Sleeves': 'Three-quarter sleeves',
        'Closure': 'Wrap tie',
        'Neckline': 'V-neck',
        'Fit': 'True to size',
        'Care': 'Dry clean only',
        'Sustainability': 'Made from deadstock fabric'
      }
    },
    'f26': {
      id: 'f26',
      title: 'Outdoor Voices CloudKnit Sweatshirt - Unisex Sage Green',
      price: 75,
      originalPrice: 95,
      rating: 4.3,
      reviewCount: 6789,
      images: [
        'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=600&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=600&h=600&fit=crop&crop=center'
      ],
      isPrime: true,
      isDeliveryTomorrow: true,
      discount: 21,
      inStock: true,
      stockCount: 52,
      description: 'Ultra-soft CloudKnit sweatshirt with cozy feel and relaxed fit. Perfect for recreation and everyday comfort.',
      features: [
        'CloudKnit fabric technology',
        'Ultra-soft and cozy feel',
        'Relaxed unisex fit',
        'Crew neck design',
        'Long sleeves',
        'Machine washable',
        'Perfect for doing things'
      ],
      specifications: {
        'Material': '50% Cotton, 50% Polyester (CloudKnit)',
        'Fit': 'Relaxed unisex',
        'Neckline': 'Crew neck',
        'Sleeves': 'Long sleeves',
        'Features': 'Ultra-soft CloudKnit fabric',
        'Care': 'Machine wash cold',
        'Origin': 'Made in Peru',
        'Philosophy': 'Doing things'
      }
    },
    'f27': {
      id: 'f27',
      title: 'Ganni Printed Mesh Midi Dress - Leopard Pattern',
      price: 295,
      originalPrice: 345,
      rating: 4.4,
      reviewCount: 2345,
      images: [
        'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=600&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=600&h=600&fit=crop&crop=center'
      ],
      isPrime: true,
      isDeliveryTomorrow: false,
      discount: 14,
      inStock: true,
      stockCount: 13,
      description: 'Statement midi dress in printed mesh with bold leopard pattern. Contemporary Scandinavian design with playful aesthetics.',
      features: [
        'Printed mesh fabric',
        'Bold leopard pattern',
        'Midi length',
        'Long sleeves',
        'Crew neckline',
        'Scandinavian design',
        'Statement piece'
      ],
      specifications: {
        'Material': '100% Polyester Mesh',
        'Print': 'Leopard pattern',
        'Length': 'Midi',
        'Sleeves': 'Long sleeves',
        'Neckline': 'Crew neck',
        'Fit': 'Regular',
        'Care': 'Hand wash',
        'Origin': 'Made in Portugal'
      }
    },
    'f28': {
      id: 'f28',
      title: 'Stussy 8 Ball Fleece Hoodie - Black Streetwear Classic',
      price: 110,
      originalPrice: 130,
      rating: 4.6,
      reviewCount: 8765,
      images: [
        'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=600&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=600&h=600&fit=crop&crop=center'
      ],
      isPrime: true,
      isDeliveryTomorrow: true,
      discount: 15,
      inStock: true,
      stockCount: 38,
      description: 'Iconic streetwear hoodie with classic 8 Ball graphic. Premium fleece construction with authentic Stussy styling.',
      features: [
        'Classic 8 Ball graphic',
        'Premium fleece construction',
        'Pullover hoodie design',
        'Kangaroo pocket',
        'Drawstring hood',
        'Ribbed cuffs and hem',
        'Authentic streetwear style'
      ],
      specifications: {
        'Material': '80% Cotton, 20% Polyester',
        'Weight': 'Heavyweight fleece',
        'Fit': 'Regular streetwear fit',
        'Hood': 'Drawstring adjustable',
        'Pocket': 'Front kangaroo pocket',
        'Graphics': 'Screen printed 8 Ball logo',
        'Care': 'Machine wash cold',
        'Origin': 'Made in Canada'
      }
    },
    'f29': {
      id: 'f29',
      title: 'Golden Goose Superstar Sneakers - White Leather Distressed',
      price: 495,
      originalPrice: 565,
      rating: 4.2,
      reviewCount: 1234,
      images: [
        'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1605348532760-da0ec9d70304?w=600&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=600&fit=crop&crop=center'
      ],
      isPrime: true,
      isDeliveryTomorrow: false,
      discount: 12,
      inStock: true,
      stockCount: 8,
      description: 'Luxury Italian sneakers with signature distressed finish. Handcrafted with vintage-inspired aesthetic and premium materials.',
      features: [
        'Italian craftsmanship',
        'Signature distressed finish',
        'Premium leather upper',
        'Star logo patch',
        'Vintage-inspired design',
        'Handcrafted details',
        'Luxury streetwear'
      ],
      specifications: {
        'Upper': 'Premium leather',
        'Sole': 'Rubber',
        'Origin': 'Made in Italy',
        'Craftsmanship': 'Handcrafted',
        'Logo': 'Signature star patch',
        'Finish': 'Distressed/vintage',
        'Care': 'Professional cleaning recommended',
        'Fit': 'True to size'
      }
    },
    'f30': {
      id: 'f30',
      title: 'Acne Studios Face Beanie - Wool Knit Pink',
      price: 120,
      originalPrice: 140,
      rating: 4.3,
      reviewCount: 5432,
      images: [
        'https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=600&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=600&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&h=600&fit=crop&crop=center'
      ],
      isPrime: true,
      isDeliveryTomorrow: true,
      discount: 14,
      inStock: true,
      stockCount: 31,
      description: 'Minimalist wool beanie with signature Acne Studios face patch. Scandinavian design meets contemporary luxury.',
      features: [
        'Premium wool knit construction',
        'Signature face patch logo',
        'Minimalist Scandinavian design',
        'Ribbed texture',
        'Unisex styling',
        'Contemporary luxury',
        'One size fits most'
      ],
      specifications: {
        'Material': '100% Wool',
        'Construction': 'Ribbed knit',
        'Logo': 'Embroidered face patch',
        'Fit': 'One size',
        'Style': 'Unisex',
        'Care': 'Hand wash cold',
        'Origin': 'Made in Italy',
        'Design': 'Scandinavian minimalism'
      }
    },
    'f31': {
      id: 'f31',
      title: 'Mansur Gavriel Bucket Bag - Italian Leather Tan',
      price: 395,
      originalPrice: 445,
      rating: 4.5,
      reviewCount: 2345,
      images: [
        'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1624681689597-ec3e6c58a27a?w=600&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1590736969955-71cc94901144?w=600&h=600&fit=crop&crop=center'
      ],
      isPrime: true,
      isDeliveryTomorrow: false,
      discount: 11,
      inStock: true,
      stockCount: 12,
      description: 'Iconic bucket bag in supple Italian leather with drawstring closure. Minimalist design with luxurious craftsmanship.',
      features: [
        'Italian vegetable-tanned leather',
        'Drawstring closure',
        'Interior pouch included',
        'Minimalist design',
        'Handcrafted construction',
        'Signature color contrast',
        'Luxury leather goods'
      ],
      specifications: {
        'Material': 'Italian Vegetable-Tanned Leather',
        'Closure': 'Drawstring',
        'Interior': 'Contrasting leather pouch',
        'Dimensions': '10" x 11" x 10"',
        'Handle Drop': '7 inches',
        'Origin': 'Made in Italy',
        'Care': 'Professional leather care',
        'Hardware': 'Minimal metal hardware'
      }
    },
    'f32': {
      id: 'f32',
      title: 'Stone Island Compass Logo Sweatshirt - Navy Cotton',
      price: 285,
      originalPrice: 325,
      rating: 4.4,
      reviewCount: 3456,
      images: [
        'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=600&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=600&h=600&fit=crop&crop=center'
      ],
      isPrime: true,
      isDeliveryTomorrow: false,
      discount: 12,
      inStock: true,
      stockCount: 16,
      description: 'Premium sweatshirt with iconic compass logo badge. Italian technical wear meets contemporary streetwear styling.',
      features: [
        'Premium cotton construction',
        'Iconic compass logo badge',
        'Crew neck design',
        'Ribbed cuffs and hem',
        'Italian technical wear',
        'Contemporary fit',
        'Luxury streetwear'
      ],
      specifications: {
        'Material': '100% Cotton',
        'Weight': 'Heavyweight (340gsm)',
        'Fit': 'Regular contemporary',
        'Logo': 'Compass badge on sleeve',
        'Neckline': 'Crew neck',
        'Care': 'Machine wash cold',
        'Origin': 'Made in Portugal',
        'Category': 'Technical wear'
      }
    },
    'f33': {
      id: 'f33',
      title: 'Bottega Veneta Intrecciato Card Holder - Woven Leather Black',
      price: 350,
      originalPrice: 390,
      rating: 4.6,
      reviewCount: 1234,
      images: [
        'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1627123424574-724758594e93?w=600&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=600&h=600&fit=crop&crop=center'
      ],
      isPrime: true,
      isDeliveryTomorrow: false,
      discount: 10,
      inStock: true,
      stockCount: 7,
      description: 'Signature Intrecciato woven leather card holder. Luxurious Italian craftsmanship with iconic basket-weave technique.',
      features: [
        'Signature Intrecciato weave',
        'Premium Italian leather',
        '4 card slots',
        'Slim profile design',
        'Handwoven construction',
        'No logo branding',
        'Luxury leather goods'
      ],
      specifications: {
        'Material': 'Intrecciato Woven Leather',
        'Card Slots': '4',
        'Dimensions': '4.3" x 2.8" x 0.2"',
        'Construction': 'Handwoven',
        'Origin': 'Made in Italy',
        'Technique': 'Traditional Intrecciato weave',
        'Care': 'Professional leather care',
        'Design': 'No visible logo'
      }
    },
    'f34': {
      id: 'f34',
      title: 'Fear of God Essentials Hoodie - Cream Oversized Fit',
      price: 90,
      originalPrice: 110,
      rating: 4.5,
      reviewCount: 6789,
      images: [
        'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=600&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=600&h=600&fit=crop&crop=center'
      ],
      isPrime: true,
      isDeliveryTomorrow: true,
      discount: 18,
      inStock: true,
      stockCount: 44,
      description: 'Oversized pullover hoodie from Fear of God Essentials line. Contemporary streetwear with luxury comfort and fit.',
      features: [
        'Oversized contemporary fit',
        'Premium cotton blend',
        'Pullover hoodie design',
        'Kangaroo pocket',
        'Drawstring hood',
        'Ribbed cuffs and hem',
        'Minimalist branding'
      ],
      specifications: {
        'Material': '80% Cotton, 20% Polyester',
        'Fit': 'Oversized',
        'Hood': 'Drawstring adjustable',
        'Pocket': 'Front kangaroo pocket',
        'Branding': 'Reflective logo',
        'Care': 'Machine wash cold',
        'Origin': 'Made in China',
        'Line': 'Fear of God Essentials'
      }
    },
    'f35': {
      id: 'f35',
      title: 'Maison Margiela Tabi Boots - Black Leather Split-Toe',
      price: 1190,
      originalPrice: 1350,
      rating: 4.3,
      reviewCount: 567,
      images: [
        'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1605348532760-da0ec9d70304?w=600&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=600&fit=crop&crop=center'
      ],
      isPrime: true,
      isDeliveryTomorrow: false,
      discount: 12,
      inStock: true,
      stockCount: 4,
      description: 'Iconic Tabi boots with signature split-toe design. Avant-garde Japanese-inspired footwear with Italian craftsmanship.',
      features: [
        'Signature split-toe design',
        'Premium leather construction',
        'Mid-calf height',
        'Side zip closure',
        'Leather sole',
        'Japanese-inspired design',
        'Avant-garde fashion'
      ],
      specifications: {
        'Upper': 'Premium leather',
        'Sole': 'Leather',
        'Height': 'Mid-calf',
        'Closure': 'Side zip',
        'Toe': 'Split-toe (Tabi)',
        'Heel': '1.5 inches',
        'Origin': 'Made in Italy',
        'Design': 'Japanese-inspired'
      }
    },
    'f36': {
      id: 'f36',
      title: 'Jacquemus Le Chiquito Mini Bag - Leather Yellow',
      price: 495,
      originalPrice: 545,
      rating: 4.2,
      reviewCount: 2345,
      images: [
        'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1624681689597-ec3e6c58a27a?w=600&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1590736969955-71cc94901144?w=600&h=600&fit=crop&crop=center'
      ],
      isPrime: true,
      isDeliveryTomorrow: false,
      discount: 9,
      inStock: true,
      stockCount: 6,
      description: 'Iconic micro bag in vibrant yellow leather. Statement piece from French designer with playful proportions.',
      features: [
        'Micro bag proportions',
        'Premium leather construction',
        'Vibrant yellow color',
        'Top handle',
        'Magnetic closure',
        'French luxury design',
        'Statement accessory'
      ],
      specifications: {
        'Material': 'Premium Leather',
        'Color': 'Vibrant Yellow',
        'Closure': 'Magnetic snap',
        'Handle': 'Top handle, 2.5" drop',
        'Dimensions': '5.5" x 4.3" x 2"',
        'Interior': 'Leather lined',
        'Origin': 'Made in Italy',
        'Designer': 'Jacquemus'
      }
    },
    'b1': {
      id: 'b1',
      title: 'The Seven Husbands of Evelyn Hugo: A Novel by Taylor Jenkins Reid',
      price: 16.99,
      originalPrice: 17.99,
      rating: 4.6,
      reviewCount: 147832,
      images: [
        'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=600&h=600&fit=crop&crop=center'
      ],
      isPrime: true,
      isDeliveryTomorrow: true,
      discount: 6,
      inStock: true,
      stockCount: 42,
      description: 'A captivating novel about a reclusive Hollywood icon who finally decides to tell her story to a young journalist, revealing unexpected secrets about love, ambition, and the price of fame.',
      features: [
        'New York Times Bestseller',
        'Over 1 million copies sold',
        'Reese\'s Book Club Pick',
        'Compelling character development',
        'Explores themes of love and identity',
        'Perfect for book clubs',
        'Paperback edition with discussion guide'
      ],
      specifications: {
        'Author': 'Taylor Jenkins Reid',
        'Publisher': 'Atria Books',
        'Publication Date': 'June 13, 2017',
        'Pages': '400 pages',
        'Language': 'English',
        'Dimensions': '5.31 x 1 x 8 inches',
        'Weight': '11.2 ounces',
        'ISBN-13': '978-1501139239'
      }
    },
    'b2': {
      id: 'b2',
      title: 'Atomic Habits by James Clear - An Easy & Proven Way to Build Good Habits',
      price: 18.00,
      originalPrice: 21.99,
      rating: 4.8,
      reviewCount: 89234,
      images: [
        'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=600&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600&h=600&fit=crop&crop=center'
      ],
      isPrime: true,
      isDeliveryTomorrow: true,
      discount: 18,
      inStock: true,
      stockCount: 35,
      description: 'A revolutionary guide to building good habits and breaking bad ones. Clear presents practical strategies backed by scientific research to help you master the tiny behaviors that lead to remarkable results.',
      features: [
        '#1 New York Times Bestseller',
        'Over 5 million copies sold worldwide',
        'Practical habit-building strategies',
        'Scientific research backed',
        'Easy-to-implement techniques',
        'Real-world case studies',
        'Comprehensive habit framework'
      ],
      specifications: {
        'Author': 'James Clear',
        'Publisher': 'Avery',
        'Publication Date': 'October 16, 2018',
        'Pages': '320 pages',
        'Language': 'English',
        'Dimensions': '6 x 1.1 x 9 inches',
        'Weight': '1.1 pounds',
        'ISBN-13': '978-0735211292'
      }
    },
    'b3': {
      id: 'b3',
      title: 'Where the Crawdads Sing by Delia Owens - Bestselling Novel',
      price: 15.99,
      originalPrice: 19.99,
      rating: 4.7,
      reviewCount: 256789,
      images: [
        'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1551029506-0807df4e2031?w=600&h=600&fit=crop&crop=center'
      ],
      isPrime: true,
      isDeliveryTomorrow: true,
      discount: 20,
      inStock: true,
      stockCount: 67,
      description: 'A haunting and beautiful novel about a young girl growing up alone in the marshes of North Carolina. A story of resilience, nature, and the power of human connection.',
      features: [
        'Over 12 million copies sold',
        'Reese\'s Book Club Pick',
        'Major motion picture adaptation',
        'Beautiful nature writing',
        'Coming-of-age story',
        'Mystery and romance elements',
        'Award-winning debut novel'
      ],
      specifications: {
        'Author': 'Delia Owens',
        'Publisher': 'G.P. Putnam\'s Sons',
        'Publication Date': 'August 14, 2018',
        'Pages': '384 pages',
        'Language': 'English',
        'Dimensions': '5.4 x 1.2 x 8.2 inches',
        'Weight': '12.8 ounces',
        'ISBN-13': '978-0735219090'
      }
    },
    'b4': {
      id: 'b4',
      title: 'The Psychology of Money by Morgan Housel - Financial Wisdom',
      price: 17.99,
      originalPrice: 22.00,
      rating: 4.6,
      reviewCount: 45678,
      images: [
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=600&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600&h=600&fit=crop&crop=center'
      ],
      isPrime: true,
      isDeliveryTomorrow: true,
      discount: 18,
      inStock: true,
      stockCount: 53,
      description: 'Timeless lessons on wealth, greed, and happiness. Housel explores how psychology affects our financial decisions and reveals the strange ways people think about money.',
      features: [
        'Wall Street Journal bestseller',
        'Practical financial psychology',
        'Real-world case studies',
        'Accessible writing style',
        'Behavioral finance insights',
        'Personal finance wisdom',
        'Investment psychology guide'
      ],
      specifications: {
        'Author': 'Morgan Housel',
        'Publisher': 'Harriman House',
        'Publication Date': 'September 8, 2020',
        'Pages': '256 pages',
        'Language': 'English',
        'Dimensions': '5.5 x 0.9 x 8.2 inches',
        'Weight': '10.4 ounces',
        'ISBN-13': '978-0857197689'
      }
    },
    'b5': {
      id: 'b5',
      title: 'Educated: A Memoir by Tara Westover - New York Times Bestseller',
      price: 16.99,
      originalPrice: 19.99,
      rating: 4.5,
      reviewCount: 134567,
      images: [
        'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=600&fit=crop&crop=center'
      ],
      isPrime: true,
      isDeliveryTomorrow: true,
      discount: 15,
      inStock: true,
      stockCount: 38,
      description: 'A powerful memoir about a young woman who, kept out of school, leaves her survivalist family and goes on to earn a PhD from Cambridge University. A story of education and transformation.',
      features: [
        'New York Times #1 Bestseller',
        'Barack Obama\'s favorite book',
        'Bill Gates recommended read',
        'Finalist for National Book Critics Circle Award',
        'Powerful memoir',
        'Education and family themes',
        'Inspiring transformation story'
      ],
      specifications: {
        'Author': 'Tara Westover',
        'Publisher': 'Random House',
        'Publication Date': 'February 20, 2018',
        'Pages': '334 pages',
        'Language': 'English',
        'Dimensions': '5.2 x 0.8 x 8 inches',
        'Weight': '9.6 ounces',
        'ISBN-13': '978-0399590504'
      }
    },
    'b6': {
      id: 'b6',
      title: 'The Silent Patient by Alex Michaelides - Psychological Thriller',
      price: 14.99,
      originalPrice: 17.99,
      rating: 4.4,
      reviewCount: 98765,
      images: [
        'https://images.unsplash.com/photo-1551029506-0807df4e2031?w=600&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=600&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=600&fit=crop&crop=center'
      ],
      isPrime: true,
      isDeliveryTomorrow: true,
      discount: 17,
      inStock: true,
      stockCount: 44,
      description: 'A woman\'s act of violence against her husband and her refusal to speak sends shockwaves through London. A psychotherapist becomes obsessed with treating her.',
      features: [
        '#1 New York Times bestseller',
        'International bestseller',
        'Psychological thriller',
        'Twist ending',
        'Page-turner',
        'Debut novel',
        'Perfect for thriller fans'
      ],
      specifications: {
        'Author': 'Alex Michaelides',
        'Publisher': 'Celadon Books',
        'Publication Date': 'February 5, 2019',
        'Pages': '336 pages',
        'Language': 'English',
        'Dimensions': '5.4 x 1 x 8.2 inches',
        'Weight': '10.4 ounces',
        'ISBN-13': '978-1250205681'
      }
    },
    'b7': {
      id: 'b7',
      title: 'Becoming by Michelle Obama - Intimate, Powerful, and Inspiring Memoir',
      price: 19.99,
      originalPrice: 24.99,
      rating: 4.8,
      reviewCount: 189234,
      images: [
        'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=600&fit=crop&crop=center'
      ],
      isPrime: true,
      isDeliveryTomorrow: true,
      discount: 20,
      inStock: true,
      stockCount: 29,
      description: 'The deeply personal memoir of former First Lady Michelle Obama. A work of deep reflection and mesmerizing storytelling about her experiences from childhood to the White House.',
      features: [
        'Instant #1 bestseller',
        'Over 10 million copies sold',
        'Grammy Award winner',
        'Oprah\'s Book Club selection',
        'Inspiring memoir',
        'Behind-the-scenes White House stories',
        'Personal and political insights'
      ],
      specifications: {
        'Author': 'Michelle Obama',
        'Publisher': 'Crown',
        'Publication Date': 'November 13, 2018',
        'Pages': '448 pages',
        'Language': 'English',
        'Dimensions': '6.1 x 1.4 x 9.2 inches',
        'Weight': '1.4 pounds',
        'ISBN-13': '978-1524763138'
      }
    },
    'b8': {
      id: 'b8',
      title: 'The Midnight Library by Matt Haig - Philosophy and Fiction Combined',
      price: 15.99,
      originalPrice: 18.99,
      rating: 4.3,
      reviewCount: 67890,
      images: [
        'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=600&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=600&fit=crop&crop=center'
      ],
      isPrime: true,
      isDeliveryTomorrow: true,
      discount: 16,
      inStock: true,
      stockCount: 56,
      description: 'Between life and death there is a library, and within that library, the shelves go on forever. A magical and philosophical novel about all the choices that go into a life lived.',
      features: [
        'International bestseller',
        'Philosophical fiction',
        'Life-affirming story',
        'Magical realism',
        'Thought-provoking themes',
        'Perfect for book clubs',
        'Award-winning author'
      ],
      specifications: {
        'Author': 'Matt Haig',
        'Publisher': 'Viking',
        'Publication Date': 'August 13, 2020',
        'Pages': '288 pages',
        'Language': 'English',
        'Dimensions': '5.7 x 1 x 8.5 inches',
        'Weight': '11.2 ounces',
        'ISBN-13': '978-0525559474'
      }
    },
    'b9': {
      id: 'b9',
      title: '1984 by George Orwell - Classic Dystopian Social Science Fiction',
      price: 13.99,
      originalPrice: 15.99,
      rating: 4.7,
      reviewCount: 345678,
      images: [
        'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=600&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=600&fit=crop&crop=center'
      ],
      isPrime: true,
      isDeliveryTomorrow: true,
      discount: 13,
      inStock: true,
      stockCount: 78,
      description: 'George Orwell\'s masterpiece of dystopian fiction. A chilling prophecy about the future that has become one of the most influential novels of the 20th century.',
      features: [
        'Classic dystopian literature',
        'Required reading in schools',
        'Political allegory',
        'Timeless themes',
        'Cultural phenomenon',
        'Literary masterpiece',
        'Influential work'
      ],
      specifications: {
        'Author': 'George Orwell',
        'Publisher': 'Signet Classics',
        'Publication Date': 'May 1, 1961',
        'Pages': '368 pages',
        'Language': 'English',
        'Dimensions': '4.2 x 0.8 x 6.8 inches',
        'Weight': '6.4 ounces',
        'ISBN-13': '978-0451524935'
      }
    },
    'b10': {
      id: 'b10',
      title: 'The Alchemist by Paulo Coelho - International Bestselling Novel',
      price: 14.95,
      originalPrice: 17.00,
      rating: 4.6,
      reviewCount: 234567,
      images: [
        'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=600&h=600&fit=crop&crop=center'
      ],
      isPrime: true,
      isDeliveryTomorrow: true,
      discount: 12,
      inStock: true,
      stockCount: 91,
      description: 'A magical story about Santiago, an Andalusian shepherd boy who yearns to travel in search of treasure. A fable about following your dream and listening to your heart.',
      features: [
        'International bestseller',
        'Over 65 million copies sold',
        'Translated into 80+ languages',
        'Philosophical adventure',
        'Inspiring journey',
        'Universal themes',
        'Life-changing read'
      ],
      specifications: {
        'Author': 'Paulo Coelho',
        'Publisher': 'HarperOne',
        'Publication Date': 'April 15, 2014',
        'Pages': '208 pages',
        'Language': 'English',
        'Dimensions': '5.3 x 0.5 x 8 inches',
        'Weight': '6.4 ounces',
        'ISBN-13': '978-0062315007'
      }
    },
    'b11': {
      id: 'b11',
      title: 'The Four Agreements by Don Miguel Ruiz - Practical Guide to Personal Freedom',
      price: 12.99,
      originalPrice: 15.95,
      rating: 4.7,
      reviewCount: 87654,
      images: [
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=600&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600&h=600&fit=crop&crop=center'
      ],
      isPrime: true,
      isDeliveryTomorrow: true,
      discount: 19,
      inStock: true,
      stockCount: 73,
      description: 'A practical guide to personal freedom based on ancient Toltec wisdom. Four simple agreements that can transform your life and lead to personal happiness.',
      features: [
        'New York Times bestseller',
        'Over 8 million copies sold',
        'Ancient Toltec wisdom',
        'Personal development guide',
        'Simple life principles',
        'Spiritual growth',
        'Transformative teachings'
      ],
      specifications: {
        'Author': 'Don Miguel Ruiz',
        'Publisher': 'Amber-Allen Publishing',
        'Publication Date': 'November 7, 1997',
        'Pages': '160 pages',
        'Language': 'English',
        'Dimensions': '5.3 x 0.4 x 8.4 inches',
        'Weight': '5.6 ounces',
        'ISBN-13': '978-1878424310'
      }
    },
    'b12': {
      id: 'b12',
      title: 'Think and Grow Rich by Napoleon Hill - Success Philosophy Classic',
      price: 11.99,
      originalPrice: 14.99,
      rating: 4.6,
      reviewCount: 123456,
      images: [
        'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=600&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600&h=600&fit=crop&crop=center'
      ],
      isPrime: true,
      isDeliveryTomorrow: true,
      discount: 20,
      inStock: true,
      stockCount: 85,
      description: 'The classic success philosophy that has inspired millions. Hill\'s timeless principles for achieving wealth and success through the power of thought and persistence.',
      features: [
        'All-time success classic',
        'Over 100 million copies sold',
        'Timeless success principles',
        'Wealth-building strategies',
        'Personal development',
        'Motivational classic',
        'Business philosophy'
      ],
      specifications: {
        'Author': 'Napoleon Hill',
        'Publisher': 'TarcherPerigee',
        'Publication Date': 'August 18, 2005',
        'Pages': '320 pages',
        'Language': 'English',
        'Dimensions': '5.1 x 0.7 x 7.8 inches',
        'Weight': '8 ounces',
        'ISBN-13': '978-1585424337'
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

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
        'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=600&h=600&fit=crop&crop=center'
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
    'f1': {
      id: 'f1',
      title: "Levi's Women's 501 High Rise Straight Jeans - Medium Wash",
      price: 89.50,
      originalPrice: 98.00,
      rating: 4.6,
      reviewCount: 12847,
      images: [
        'https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=600&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1541099649105-fcd25c85cd64?w=600&h=600&fit=crop&crop=center'
      ],
      isPrime: true,
      isDeliveryTomorrow: true,
      discount: 9,
      inStock: true,
      stockCount: 24,
      description: "Classic 501 jeans with a high-rise fit that's comfortable and flattering. Made from premium denim with authentic details and vintage-inspired styling.",
      features: [
        'High-rise waist for flattering fit',
        'Straight leg silhouette',
        'Premium denim construction',
        'Classic five-pocket styling',
        'Button fly closure',
        'Medium wash with subtle fading',
        'Machine washable'
      ],
      specifications: {
        'Material': '100% Cotton Denim',
        'Rise': 'High Rise (11 inches)',
        'Leg Opening': '16 inches',
        'Inseam': '28, 30, 32 inches available',
        'Closure': 'Button Fly',
        'Care': 'Machine Wash Cold',
        'Origin': 'Made in USA',
        'Fit': 'Straight Leg'
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
      stockCount: 18,
      description: 'The iconic Air Force 1 gets a fresh update while maintaining its timeless appeal. Premium leather upper with classic basketball-inspired design.',
      features: [
        'Premium leather upper',
        'Air-Sole unit for lightweight cushioning',
        'Rubber outsole with pivot points',
        'Perforations for breathability',
        'Classic basketball silhouette',
        'Iconic Nike Swoosh branding',
        'Versatile unisex design'
      ],
      specifications: {
        'Material': 'Leather Upper, Rubber Sole',
        'Closure': 'Lace-Up',
        'Heel Height': '1.5 inches',
        'Platform Height': '0.75 inches',
        'Color': 'White/White',
        'Style Code': 'CW2288-111',
        'Care': 'Wipe Clean with Damp Cloth',
        'Origin': 'Vietnam'
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
    'h1': {
      id: 'h1',
      title: 'Instant Pot Duo 7-in-1 Electric Pressure Cooker, 8 Quart',
      price: 79,
      originalPrice: 119,
      rating: 4.7,
      reviewCount: 98234,
      images: [
        'https://images.unsplash.com/photo-1585515656617-d405f574bfa3?w=600&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1590736969955-71cc94901144?w=600&h=600&fit=crop&crop=center'
      ],
      isPrime: true,
      isDeliveryTomorrow: true,
      discount: 34,
      inStock: true,
      stockCount: 12,
      description: 'The ultimate multicooker that combines 7 kitchen appliances in one. Perfect for busy families who want to prepare healthy, delicious meals quickly and efficiently.',
      features: [
        '7-in-1 functionality: Pressure Cook, Slow Cook, Rice Cooker, Steamer, Sauté, Yogurt Maker, and Warmer',
        '8-quart capacity serves up to 8 people',
        '13 built-in smart programs',
        '10+ proven safety features',
        'Stainless steel cooking pot',
        'Energy efficient and quiet operation',
        'Includes recipe book and accessories'
      ],
      specifications: {
        'Capacity': '8 Quarts',
        'Material': 'Stainless Steel Inner Pot',
        'Power': '1200 Watts',
        'Pressure': '11.6-11.9 PSI',
        'Dimensions': '13.43 x 12.2 x 12.99 inches',
        'Weight': '26 pounds',
        'Warranty': '1 Year Limited',
        'Certification': 'UL Listed'
      }
    },
    'h2': {
      id: 'h2',
      title: 'KitchenAid Artisan Series 5-Quart Stand Mixer - Empire Red',
      price: 429,
      originalPrice: 499,
      rating: 4.8,
      reviewCount: 45678,
      images: [
        'https://images.unsplash.com/photo-1590736969955-71cc94901144?w=600&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1585515656617-d405f574bfa3?w=600&h=600&fit=crop&crop=center'
      ],
      isPrime: true,
      isDeliveryTomorrow: false,
      discount: 14,
      inStock: true,
      stockCount: 8,
      description: 'Professional-grade stand mixer that\'s been the gold standard for home bakers for decades. Features powerful motor and versatile attachments for all your baking needs.',
      features: [
        '325-watt motor handles heavy mixtures',
        'Tilt-head design for easy bowl access',
        '10 speeds for thorough mixing',
        'Includes wire whip, dough hook, and flat beater',
        'Hub accepts over 15 optional attachments',
        'All-metal construction for durability',
        'Iconic Empire Red finish'
      ],
      specifications: {
        'Bowl Capacity': '5 Quarts',
        'Motor': '325 Watts',
        'Speeds': '10 Speeds',
        'Dimensions': '14.13 x 8.75 x 14 inches',
        'Weight': '26 pounds',
        'Material': 'All-Metal Construction',
        'Color': 'Empire Red',
        'Warranty': '1 Year Hassle-Free Replacement'
      }
    },
    's1': {
      id: 's1',
      title: 'Fitbit Charge 5 Advanced Fitness & Health Tracker with GPS',
      price: 149,
      originalPrice: 179,
      rating: 4.2,
      reviewCount: 34567,
      images: [
        'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=600&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=600&fit=crop&crop=center'
      ],
      isPrime: true,
      isDeliveryTomorrow: true,
      discount: 17,
      inStock: true,
      stockCount: 15,
      description: 'Advanced fitness and health tracker with built-in GPS, stress management tools, and up to 7-day battery life. Track your workouts, monitor your health, and stay connected.',
      features: [
        'Built-in GPS for pace and distance',
        '6+ day battery life',
        '24/7 heart rate monitoring',
        'Stress management score',
        'Sleep score and smart wake',
        '20+ exercise modes',
        'Smartphone notifications and apps'
      ],
      specifications: {
        'Display': 'Color AMOLED',
        'Battery Life': 'Up to 7 days',
        'Water Resistance': '50 meters',
        'Compatibility': 'Android & iOS',
        'Sensors': 'GPS, Heart Rate, SpO2',
        'Dimensions': '1.46 x 0.87 x 0.44 inches',
        'Weight': '1.1 oz',
        'Connectivity': 'Bluetooth 5.0'
      }
    },
    's2': {
      id: 's2',
      title: 'Nike Men\'s Air Zoom Pegasus 39 Running Shoes - Black/White',
      price: 129.99,
      originalPrice: 149.99,
      rating: 4.6,
      reviewCount: 23456,
      images: [
        'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1605348532760-da0ec9d70304?w=600&h=600&fit=crop&crop=center'
      ],
      isPrime: true,
      isDeliveryTomorrow: true,
      discount: 13,
      inStock: true,
      stockCount: 22,
      description: 'Trusted companion for daily runs with responsive cushioning and reliable traction. Features Nike Air Zoom technology for a smooth, comfortable ride mile after mile.',
      features: [
        'Nike Air Zoom unit for responsive cushioning',
        'Engineered mesh upper for breathability',
        'Waffle-pattern outsole for traction',
        'Flywire cables for secure midfoot lockdown',
        'Heel collar padding for comfort',
        'Reflective elements for low-light visibility',
        'Classic Pegasus DNA with modern updates'
      ],
      specifications: {
        'Upper Material': 'Engineered Mesh',
        'Midsole': 'Full-Length Nike Air Zoom',
        'Outsole': 'Rubber with Waffle Pattern',
        'Drop': '10mm',
        'Weight': '10.6 oz (size 10)',
        'Intended Use': 'Road Running',
        'Style Code': 'DH4071-001',
        'Origin': 'Vietnam'
      }
    },
    'g1': {
      id: 'g1',
      title: 'Organic Bananas - Fresh Yellow Bananas 3 lbs',
      price: 2.99,
      originalPrice: 3.49,
      rating: 4.5,
      reviewCount: 12847,
      images: [
        'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=600&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1528825871115-3581a5387919?w=600&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1603833665858-e61d17a86224?w=600&h=600&fit=crop&crop=center'
      ],
      isPrime: true,
      isDeliveryTomorrow: true,
      discount: 14,
      inStock: true,
      stockCount: 95,
      description: 'Premium organic bananas sourced from sustainable farms. Rich in potassium, vitamin C, and dietary fiber. Perfect for snacking, smoothies, or baking.',
      features: [
        'USDA Certified Organic',
        'Non-GMO and pesticide-free',
        'Rich in potassium and vitamin C',
        'High in dietary fiber',
        'Naturally sweet and creamy texture',
        'Sustainably grown and harvested',
        'Perfect ripeness for immediate enjoyment'
      ],
      specifications: {
        'Origin': 'Ecuador',
        'Certification': 'USDA Organic',
        'Weight': '3 pounds (approximately 8-10 bananas)',
        'Ripeness': 'Yellow with slight green tips',
        'Storage': 'Room temperature, refrigerate when ripe',
        'Shelf Life': '5-7 days at room temperature',
        'Nutrition': 'High in Potassium, Vitamin C, Fiber',
        'Allergens': 'None'
      }
    },
    'g2': {
      id: 'g2',
      title: 'Avocados - Large Hass Avocados Pack of 6',
      price: 5.99,
      originalPrice: 7.49,
      rating: 4.4,
      reviewCount: 8934,
      images: [
        'https://images.unsplash.com/photo-1523049673857-040b8e1fd5b6?w=600&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1590301157890-4810ed352733?w=600&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1601039641847-7857b994d704?w=600&h=600&fit=crop&crop=center'
      ],
      isPrime: true,
      isDeliveryTomorrow: true,
      discount: 20,
      inStock: true,
      stockCount: 48,
      description: 'Premium large Hass avocados with creamy texture and rich, nutty flavor. Packed with healthy monounsaturated fats, fiber, and essential nutrients.',
      features: [
        'Large Hass variety with superior taste',
        'Rich in healthy monounsaturated fats',
        'High in fiber and potassium',
        'Contains folate and vitamin K',
        'Perfect for guacamole, toast, or salads',
        'Carefully selected for optimal ripeness',
        'Hand-picked from premium groves'
      ],
      specifications: {
        'Variety': 'Hass Avocados',
        'Size': 'Large (6-8 oz each)',
        'Quantity': '6 avocados per pack',
        'Origin': 'California/Mexico',
        'Ripeness': 'Ready to eat in 2-3 days',
        'Storage': 'Ripen at room temperature',
        'Nutrition': 'High in healthy fats, fiber, folate',
        'Shelf Life': '3-5 days when ripe'
      }
    },
    'a1': {
      id: 'a1',
      title: 'Instant Pot Duo 7-in-1 Electric Pressure Cooker, 8 Quart',
      price: 79,
      originalPrice: 119,
      rating: 4.7,
      reviewCount: 98234,
      images: [
        'https://images.unsplash.com/photo-1585515656617-d405f574bfa3?w=600&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1590736969955-71cc94901144?w=600&h=600&fit=crop&crop=center'
      ],
      isPrime: true,
      isDeliveryTomorrow: true,
      discount: 34,
      inStock: true,
      stockCount: 12,
      description: 'The ultimate multicooker that replaces 7 kitchen appliances in one compact unit. Cook meals up to 70% faster while retaining nutrients and flavor.',
      features: [
        'Pressure Cooker, Slow Cooker, Rice Cooker',
        'Steamer, Sauté Pan, Yogurt Maker, Warmer',
        '13 One-Touch Smart Programs',
        '10+ Safety Features with UL Certification',
        'Stainless Steel Inner Pot',
        'Energy Efficient Design',
        'Includes Recipe Book & Accessories'
      ],
      specifications: {
        'Capacity': '8 Quarts (serves 8+)',
        'Power': '1200 Watts, 120V',
        'Pressure': '11.6-11.9 PSI',
        'Material': 'Stainless Steel Inner Pot',
        'Dimensions': '13.43 x 12.2 x 12.99 inches',
        'Weight': '26 pounds',
        'Certification': 'UL Listed',
        'Warranty': '1 Year Limited'
      }
    },
    'a2': {
      id: 'a2',
      title: 'Ninja Foodi Personal Blender with Cups - 18 oz Single Serve',
      price: 79.99,
      originalPrice: 99.99,
      rating: 4.5,
      reviewCount: 23456,
      images: [
        'https://images.unsplash.com/photo-1570197788417-0e82375c9371?w=600&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1574781330855-d0db0017de74?w=600&h=600&fit=crop&crop=center'
      ],
      isPrime: true,
      isDeliveryTomorrow: true,
      discount: 20,
      inStock: true,
      stockCount: 28,
      description: 'Powerful personal blender that crushes ice and frozen ingredients for perfect smoothies, protein shakes, and frozen drinks. Includes two 18-oz cups with lids.',
      features: [
        '1200-peak-watt power base',
        'Ninja blade technology crushes ice',
        'Two 18-oz single-serve cups',
        'Spout lids for on-the-go convenience',
        'BPA-free and dishwasher safe',
        'Compact design saves counter space',
        'Easy twist and blend operation'
      ],
      specifications: {
        'Power': '1200 Peak Watts',
        'Cup Capacity': '18 oz (2 cups included)',
        'Blade': 'Ninja Pro Extractor Blades',
        'Material': 'BPA-Free Plastic',
        'Dimensions': '5.5 x 5.5 x 15 inches',
        'Weight': '4.6 pounds',
        'Dishwasher Safe': 'Cups and lids only',
        'Warranty': '1 Year Limited'
      }
    },
    'be1': {
      id: 'be1',
      title: 'CeraVe Foaming Facial Cleanser - Normal to Oily Skin 12 fl oz',
      price: 14.99,
      originalPrice: 18.99,
      rating: 4.6,
      reviewCount: 89234,
      images: [
        'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600&h=600&fit=crop&crop=center'
      ],
      isPrime: true,
      isDeliveryTomorrow: true,
      discount: 21,
      inStock: true,
      stockCount: 67,
      description: 'Gentle foaming cleanser that effectively removes oil, dirt, and makeup without disrupting the skin barrier. Formulated with ceramides and niacinamide for healthy-looking skin.',
      features: [
        'Developed with dermatologists',
        'Contains 3 essential ceramides',
        'MVE Technology for 24-hour hydration',
        'Niacinamide helps calm skin',
        'Removes excess oil without over-drying',
        'Non-comedogenic and fragrance-free',
        'Suitable for sensitive skin'
      ],
      specifications: {
        'Size': '12 fl oz (355 mL)',
        'Skin Type': 'Normal to Oily Skin',
        'Key Ingredients': 'Ceramides 1, 3, 6-II, Niacinamide',
        'Formulation': 'Foam Cleanser',
        'pH Balance': 'Balanced for skin',
        'Texture': 'Lightweight foam',
        'Fragrance': 'Fragrance-free',
        'Testing': 'Dermatologist tested'
      }
    },
    'be2': {
      id: 'be2',
      title: 'The Ordinary Niacinamide 10% + Zinc 1% - Oil Control Serum 30ml',
      price: 7.20,
      originalPrice: 8.50,
      rating: 4.4,
      reviewCount: 45678,
      images: [
        'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600&h=600&fit=crop&crop=center'
      ],
      isPrime: true,
      isDeliveryTomorrow: true,
      discount: 15,
      inStock: true,
      stockCount: 94,
      description: 'High-strength vitamin and mineral blemish formula that targets blemishes and congestion. Reduces the appearance of skin blemishes and helps balance visible aspects of sebum activity.',
      features: [
        '10% Niacinamide (Vitamin B3)',
        '1% Zinc PCA for oil control',
        'Reduces appearance of skin blemishes',
        'Balances visible sebum activity',
        'Improves skin texture over time',
        'Suitable for all skin types',
        'Vegan and cruelty-free formula'
      ],
      specifications: {
        'Size': '30mL / 1 fl oz',
        'Active Ingredients': '10% Niacinamide, 1% Zinc PCA',
        'Skin Concerns': 'Blemishes, Large Pores, Oily Skin',
        'Application': 'AM/PM after cleansing',
        'Texture': 'Water-based serum',
        'pH': '6.0-7.0',
        'Shelf Life': '12 months after opening',
        'Origin': 'Canada'
      }
    },
    'so1': {
      id: 'so1',
      title: 'Renogy 100 Watt 12 Volt Monocrystalline Solar Panel - High Efficiency',
      price: 109,
      originalPrice: 149,
      rating: 4.7,
      reviewCount: 12456,
      images: [
        'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=600&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=600&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?w=600&h=600&fit=crop&crop=center'
      ],
      isPrime: true,
      isDeliveryTomorrow: true,
      discount: 27,
      inStock: true,
      stockCount: 25,
      description: 'High-efficiency monocrystalline solar panel perfect for RVs, boats, cabins, and off-grid applications. Features corrosion-resistant aluminum frame and bypass diodes for optimal performance.',
      features: [
        '100W monocrystalline solar cells',
        'High efficiency up to 21%',
        'Corrosion-resistant aluminum frame',
        'IP65 rated junction box',
        'Bypass diodes minimize power drop',
        '25-year transferable power output warranty',
        'Compatible with 12V and 24V systems'
      ],
      specifications: {
        'Power Output': '100 Watts',
        'Cell Type': 'Monocrystalline',
        'Efficiency': '21%',
        'Voltage at Pmax': '18.9V',
        'Current at Pmax': '5.29A',
        'Dimensions': '47.0 x 21.3 x 1.4 inches',
        'Weight': '16.5 lbs',
        'Warranty': '25 years power output'
      }
    },
    'so2': {
      id: 'so2',
      title: 'Goal Zero Yeti 1500X Portable Power Station - Solar Generator',
      price: 1999,
      originalPrice: 2299,
      rating: 4.6,
      reviewCount: 8934,
      images: [
        'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1593941707874-ef25b8b4a92b?w=600&h=600&fit=crop&crop=center'
      ],
      isPrime: true,
      isDeliveryTomorrow: false,
      discount: 13,
      inStock: true,
      stockCount: 8,
      description: 'Ultimate portable power station with massive 1516Wh capacity and 2000W AC inverter. Perfect for home backup, camping, and emergency situations with multiple charging options.',
      features: [
        '1516Wh lithium battery capacity',
        '2000W AC pure sine wave inverter',
        'Multiple charging ports (AC, USB-C, 12V)',
        'Solar charging compatible',
        'WiFi connectivity and app control',
        'MPPT charge controller built-in',
        'Quiet operation with no emissions'
      ],
      specifications: {
        'Battery Capacity': '1516Wh (1516 Watt hours)',
        'Battery Type': 'Lithium Ion NMC',
        'AC Inverter': '2000W (3500W surge)',
        'AC Output': '120V, 60Hz',
        'USB-C Output': '60W (5-20V, up to 3A)',
        'Weight': '45.64 lbs',
        'Dimensions': '15.25 x 10.23 x 10.37 inches',
        'Charge Time': '4 hours (wall), 14-28 hours (solar)'
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

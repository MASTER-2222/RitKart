
'use client';
import { useState, useMemo } from 'react';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';
import ProductCard from '../../../components/ProductCard';

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

  const categories = {
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

  const currentCategory = categories[categorySlug as keyof typeof categories] || categories.electronics;

  const categoryProducts = {
    electronics: [
      // Page 1 (Products 1-12)
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
        discount: 20,
        brand: 'Apple'
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
        discount: 29,
        brand: 'Sony'
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
        discount: 32,
        brand: 'Samsung'
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
        discount: 8,
        brand: 'Apple'
      },
      {
        id: '5',
        title: 'Dell XPS 13 Laptop - Intel Core i7, 16GB RAM, 512GB SSD',
        price: 1299,
        originalPrice: 1499,
        rating: 4.4,
        reviewCount: 3456,
        image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 13,
        brand: 'Dell'
      },
      {
        id: '6',
        title: 'Bose QuietComfort 45 Wireless Bluetooth Noise Cancelling Headphones',
        price: 279,
        originalPrice: 329,
        rating: 4.5,
        reviewCount: 7892,
        image: 'https://images.unsplash.com/photo-1484704849700-da0ec9d70304?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 15,
        brand: 'Bose'
      },
      {
        id: '7',
        title: 'Canon EOS R6 Mark II Mirrorless Camera Body',
        price: 2499,
        originalPrice: 2699,
        rating: 4.8,
        reviewCount: 1234,
        image: 'https://images.unsplash.com/photo-1606983340126-acd977736f90?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 7,
        brand: 'Canon'
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
        discount: 6,
        brand: 'Nintendo'
      },
      {
        id: '9',
        title: 'LG 27" UltraGear Gaming Monitor 4K UHD with G-SYNC',
        price: 399,
        originalPrice: 499,
        rating: 4.6,
        reviewCount: 5678,
        image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 20,
        brand: 'LG'
      },
      {
        id: '10',
        title: 'Microsoft Surface Pro 9 Tablet - Intel Core i5, 8GB RAM',
        price: 899,
        originalPrice: 999,
        rating: 4.3,
        reviewCount: 4321,
        image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 10,
        brand: 'Microsoft'
      },
      {
        id: '11',
        title: 'AMD Ryzen 9 5900X 12-Core Desktop Processor',
        price: 399,
        originalPrice: 549,
        rating: 4.7,
        reviewCount: 8765,
        image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 27,
        brand: 'AMD'
      },
      {
        id: '12',
        title: 'NVIDIA GeForce RTX 4080 Graphics Card',
        price: 1199,
        originalPrice: 1299,
        rating: 4.5,
        reviewCount: 2345,
        image: 'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 8,
        brand: 'NVIDIA'
      },
      // Page 2 (Products 13-24)
      {
        id: 'e13',
        title: 'Apple iPad Air 5th Generation with M1 Chip - 64GB WiFi',
        price: 549,
        originalPrice: 599,
        rating: 4.7,
        reviewCount: 6789,
        image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 8,
        brand: 'Apple'
      },
      {
        id: 'e14',
        title: 'Google Pixel 8 Pro 128GB - Obsidian Black',
        price: 899,
        originalPrice: 999,
        rating: 4.5,
        reviewCount: 4567,
        image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 10,
        brand: 'Google'
      },
      {
        id: 'e15',
        title: 'HP Envy x360 2-in-1 Laptop - AMD Ryzen 7, 16GB RAM',
        price: 799,
        originalPrice: 949,
        rating: 4.3,
        reviewCount: 3456,
        image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 16,
        brand: 'HP'
      },
      {
        id: 'e16',
        title: 'JBL Charge 5 Portable Bluetooth Speaker - Waterproof',
        price: 149,
        originalPrice: 179,
        rating: 4.6,
        reviewCount: 8901,
        image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 17,
        brand: 'JBL'
      },
      {
        id: 'e17',
        title: 'Logitech MX Master 3S Wireless Mouse - Graphite',
        price: 99,
        originalPrice: 119,
        rating: 4.8,
        reviewCount: 12345,
        image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 17,
        brand: 'Logitech'
      },
      {
        id: 'e18',
        title: 'Roku Ultra 4K HDR Streaming Device with Voice Remote',
        price: 79,
        originalPrice: 99,
        rating: 4.4,
        reviewCount: 5678,
        image: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 20,
        brand: 'Roku'
      },
      {
        id: 'e19',
        title: 'Anker PowerCore 10000 Portable Charger - Ultra Compact',
        price: 24,
        originalPrice: 29,
        rating: 4.7,
        reviewCount: 23456,
        image: 'https://images.unsplash.com/photo-1609592806965-50a4bb9e2c41?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 17,
        brand: 'Anker'
      },
      {
        id: 'e20',
        title: 'Corsair K95 RGB Platinum XT Mechanical Gaming Keyboard',
        price: 199,
        originalPrice: 249,
        rating: 4.5,
        reviewCount: 7890,
        image: 'https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 20,
        brand: 'Corsair'
      },
      {
        id: 'e21',
        title: 'Razer DeathAdder V3 Pro Wireless Gaming Mouse',
        price: 149,
        originalPrice: 179,
        rating: 4.6,
        reviewCount: 4321,
        image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 17,
        brand: 'Razer'
      },
      {
        id: 'e22',
        title: 'Asus ROG Strix 32" 4K Gaming Monitor with HDR',
        price: 699,
        originalPrice: 799,
        rating: 4.7,
        reviewCount: 3456,
        image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 13,
        brand: 'Asus'
      },
      {
        id: 'e23',
        title: 'SteelSeries Arctis 7P Wireless Gaming Headset',
        price: 149,
        originalPrice: 179,
        rating: 4.4,
        reviewCount: 6789,
        image: 'https://images.unsplash.com/photo-1484704849700-da0ec9d70304?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 17,
        brand: 'SteelSeries'
      },
      {
        id: 'e24',
        title: 'Western Digital 2TB External Hard Drive - USB 3.0',
        price: 79,
        originalPrice: 99,
        rating: 4.5,
        reviewCount: 8901,
        image: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 20,
        brand: 'Western Digital'
      },
      // Page 3 (Products 25-36)
      {
        id: 'e25',
        title: 'Oculus Quest 3 VR Headset 128GB - All-in-One Virtual Reality',
        price: 499,
        originalPrice: 549,
        rating: 4.6,
        reviewCount: 5432,
        image: 'https://images.unsplash.com/photo-1593508512255-86ab42a8e620?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 9,
        brand: 'Meta'
      },
      {
        id: 'e26',
        title: 'DJI Mini 3 Pro Drone with 4K HDR Video Camera',
        price: 759,
        originalPrice: 899,
        rating: 4.8,
        reviewCount: 2345,
        image: 'https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 16,
        brand: 'DJI'
      },
      {
        id: 'e27',
        title: 'Garmin Fenix 7 Solar GPS Smartwatch - Slate Gray',
        price: 699,
        originalPrice: 799,
        rating: 4.7,
        reviewCount: 3456,
        image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 13,
        brand: 'Garmin'
      },
      {
        id: 'e28',
        title: 'Sonos One SL Wireless Smart Speaker - Black',
        price: 179,
        originalPrice: 199,
        rating: 4.5,
        reviewCount: 7890,
        image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 10,
        brand: 'Sonos'
      },
      {
        id: 'e29',
        title: 'Tesla Model S Plaid Wireless Charging Pad',
        price: 125,
        originalPrice: 150,
        rating: 4.3,
        reviewCount: 1234,
        image: 'https://images.unsplash.com/photo-1609592806965-50a4bb9e2c41?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 17,
        brand: 'Tesla'
      },
      {
        id: 'e30',
        title: 'Elgato Stream Deck MK.2 - 15 Customizable LCD Keys',
        price: 149,
        originalPrice: 179,
        rating: 4.6,
        reviewCount: 4567,
        image: 'https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 17,
        brand: 'Elgato'
      },
      {
        id: 'e31',
        title: 'Philips Hue White and Color Ambiance Smart Bulb Starter Kit',
        price: 199,
        originalPrice: 229,
        rating: 4.4,
        reviewCount: 8901,
        image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 13,
        brand: 'Philips'
      },
      {
        id: 'e32',
        title: 'Ring Video Doorbell Pro 2 - 1536p HD Video with 3D Motion Detection',
        price: 249,
        originalPrice: 279,
        rating: 4.2,
        reviewCount: 6789,
        image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 11,
        brand: 'Ring'
      },
      {
        id: 'e33',
        title: 'Nest Learning Thermostat 3rd Generation - Stainless Steel',
        price: 249,
        originalPrice: 279,
        rating: 4.5,
        reviewCount: 5432,
        image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 11,
        brand: 'Google Nest'
      },
      {
        id: 'e34',
        title: 'Arlo Pro 4 Wireless Security Camera System - 2K HDR',
        price: 199,
        originalPrice: 249,
        rating: 4.3,
        reviewCount: 3456,
        image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 20,
        brand: 'Arlo'
      },
      {
        id: 'e35',
        title: 'Tile Mate Bluetooth Tracker 4-Pack - Find Your Keys & More',
        price: 59,
        originalPrice: 79,
        rating: 4.1,
        reviewCount: 12345,
        image: 'https://images.unsplash.com/photo-1609592806965-50a4bb9e2c41?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 25,
        brand: 'Tile'
      },
      {
        id: 'e36',
        title: 'Belkin 3-in-1 Wireless Charger for iPhone, Apple Watch & AirPods',
        price: 149,
        originalPrice: 179,
        rating: 4.4,
        reviewCount: 7890,
        image: 'https://images.unsplash.com/photo-1609592806965-50a4bb9e2c41?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 17,
        brand: 'Belkin'
      }
    ],
    fashion: [
      {
        id: 'f1',
        title: "Levi's Women's 501 High Rise Straight Jeans - Medium Wash",
        price: 89.50,
        originalPrice: 98.00,
        rating: 4.6,
        reviewCount: 12847,
        image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        isDeliveryTomorrow: true,
        discount: 9,
        brand: "Levi's"
      },
      {
        id: 'f2',
        title: 'Nike Air Force 1 \'07 White Leather Sneakers - Unisex',
        price: 110,
        originalPrice: 130,
        rating: 4.8,
        reviewCount: 28934,
        image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        isDeliveryTomorrow: true,
        discount: 15,
        brand: 'Nike'
      },
      {
        id: 'f3',
        title: 'Zara Women\'s Oversized Blazer - Black Premium Wool Blend',
        price: 149,
        originalPrice: 199,
        rating: 4.4,
        reviewCount: 5672,
        image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 25,
        brand: 'Zara'
      },
      {
        id: 'f4',
        title: 'Adidas Originals Three Stripes Track Jacket - Vintage Style',
        price: 85,
        originalPrice: 100,
        rating: 4.7,
        reviewCount: 15234,
        image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        isDeliveryTomorrow: true,
        discount: 15,
        brand: 'Adidas'
      },
      {
        id: 'f5',
        title: 'H&M Women\'s Floral Summer Dress - Midi Length Cotton Blend',
        price: 39.99,
        originalPrice: 49.99,
        rating: 4.3,
        reviewCount: 8765,
        image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 20,
        brand: 'H&M'
      },
      {
        id: 'f6',
        title: 'Ray-Ban Classic Aviator Sunglasses - Gold Frame Green Lens',
        price: 154,
        originalPrice: 179,
        rating: 4.6,
        reviewCount: 23456,
        image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 14,
        brand: 'Ray-Ban'
      },
      {
        id: 'f7',
        title: 'Guess Men\'s Classic Leather Wallet - Brown Genuine Leather',
        price: 65,
        originalPrice: 85,
        rating: 4.5,
        reviewCount: 6789,
        image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 24,
        brand: 'Guess'
      },
      {
        id: 'f8',
        title: 'Calvin Klein Women\'s High Waist Skinny Jeans - Dark Blue Denim',
        price: 79,
        originalPrice: 98,
        rating: 4.4,
        reviewCount: 11234,
        image: 'https://images.unsplash.com/photo-1541099649105-fcd25c85cd64?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        isDeliveryTomorrow: true,
        discount: 19,
        brand: 'Calvin Klein'
      },
      {
        id: 'f9',
        title: 'Converse Chuck Taylor All Star High Top Sneakers - Classic Black',
        price: 65,
        originalPrice: 70,
        rating: 4.7,
        reviewCount: 45678,
        image: 'https://images.unsplash.com/photo-1605348532760-da0ec9d70304?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 7,
        brand: 'Converse'
      },
      {
        id: 'f10',
        title: 'Coach Women\'s Signature Canvas Handbag - Brown Leather Trim',
        price: 295,
        originalPrice: 350,
        rating: 4.8,
        reviewCount: 3456,
        image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 16,
        brand: 'Coach'
      },
      {
        id: 'f11',
        title: 'Tommy Hilfiger Men\'s Classic Polo Shirt - Navy Cotton Pique',
        price: 49.50,
        originalPrice: 69.50,
        rating: 4.5,
        reviewCount: 9876,
        image: 'https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 29,
        brand: 'Tommy Hilfiger'
      },
      {
        id: 'f12',
        title: 'Michael Kors Women\'s Smartwatch - Rose Gold Stainless Steel',
        price: 249,
        originalPrice: 295,
        rating: 4.3,
        reviewCount: 7890,
        image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 16,
        brand: 'Michael Kors'
      },
      // Page 2 Fashion Products
      {
        id: 'f13',
        title: 'Patagonia Better Sweater Fleece Jacket - Women\'s Classic Navy',
        price: 99,
        originalPrice: 119,
        rating: 4.7,
        reviewCount: 8765,
        image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 17,
        brand: 'Patagonia'
      },
      {
        id: 'f14',
        title: 'Vans Old Skool Classic Skate Shoes - Black/White',
        price: 65,
        originalPrice: 75,
        rating: 4.6,
        reviewCount: 23456,
        image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 13,
        brand: 'Vans'
      },
      {
        id: 'f15',
        title: 'Uniqlo Heattech Ultra Warm Crew Neck Long Sleeve T-Shirt',
        price: 19.90,
        originalPrice: 24.90,
        rating: 4.4,
        reviewCount: 15678,
        image: 'https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 20,
        brand: 'Uniqlo'
      },
      {
        id: 'f16',
        title: 'Lululemon Align High-Rise Pant 28" - Black Yoga Leggings',
        price: 128,
        originalPrice: 148,
        rating: 4.8,
        reviewCount: 34567,
        image: 'https://images.unsplash.com/photo-1506629905607-d9b1b2e3d75b?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 14,
        brand: 'Lululemon'
      },
      {
        id: 'f17',
        title: 'North Face Venture 2 Jacket - Men\'s Waterproof Rain Jacket',
        price: 99,
        originalPrice: 119,
        rating: 4.5,
        reviewCount: 12345,
        image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 17,
        brand: 'The North Face'
      },
      {
        id: 'f18',
        title: 'Kate Spade New York Cameron Street Small Satchel - Pink',
        price: 198,
        originalPrice: 248,
        rating: 4.6,
        reviewCount: 5432,
        image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 20,
        brand: 'Kate Spade'
      },
      {
        id: 'f19',
        title: 'Champion Powerblend Fleece Hoodie - Men\'s Gray Heather',
        price: 35,
        originalPrice: 45,
        rating: 4.3,
        reviewCount: 18765,
        image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 22,
        brand: 'Champion'
      },
      {
        id: 'f20',
        title: 'Fossil Gen 6 Smartwatch - Stainless Steel with Heart Rate',
        price: 255,
        originalPrice: 295,
        rating: 4.2,
        reviewCount: 6789,
        image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 14,
        brand: 'Fossil'
      },
      {
        id: 'f21',
        title: 'Allbirds Tree Runners - Sustainable Sneakers Natural White',
        price: 98,
        originalPrice: 118,
        rating: 4.4,
        reviewCount: 9876,
        image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 17,
        brand: 'Allbirds'
      },
      {
        id: 'f22',
        title: 'Madewell The Perfect Vintage Jean - High-Rise Skinny',
        price: 128,
        originalPrice: 148,
        rating: 4.5,
        reviewCount: 7654,
        image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 14,
        brand: 'Madewell'
      },
      {
        id: 'f23',
        title: 'Everlane The Cashmere Crew Sweater - Women\'s Camel',
        price: 100,
        originalPrice: 130,
        rating: 4.6,
        reviewCount: 4321,
        image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 23,
        brand: 'Everlane'
      },
      {
        id: 'f24',
        title: 'Warby Parker Percey Glasses - Tortoise Acetate Frames',
        price: 95,
        originalPrice: 115,
        rating: 4.7,
        reviewCount: 8901,
        image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 17,
        brand: 'Warby Parker'
      },
      // Page 3 Fashion Products
      {
        id: 'f25',
        title: 'Reformation Midi Wrap Dress - Floral Print Sustainable Fabric',
        price: 178,
        originalPrice: 218,
        rating: 4.5,
        reviewCount: 3456,
        image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 18,
        brand: 'Reformation'
      },
      {
        id: 'f26',
        title: 'Outdoor Voices CloudKnit Sweatshirt - Unisex Sage Green',
        price: 75,
        originalPrice: 95,
        rating: 4.3,
        reviewCount: 6789,
        image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 21,
        brand: 'Outdoor Voices'
      },
      {
        id: 'f27',
        title: 'Ganni Printed Mesh Midi Dress - Leopard Pattern',
        price: 295,
        originalPrice: 345,
        rating: 4.4,
        reviewCount: 2345,
        image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 14,
        brand: 'Ganni'
      },
      {
        id: 'f28',
        title: 'Stussy 8 Ball Fleece Hoodie - Black Streetwear Classic',
        price: 110,
        originalPrice: 130,
        rating: 4.6,
        reviewCount: 8765,
        image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 15,
        brand: 'Stussy'
      },
      {
        id: 'f29',
        title: 'Golden Goose Superstar Sneakers - White Leather Distressed',
        price: 495,
        originalPrice: 565,
        rating: 4.2,
        reviewCount: 1234,
        image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 12,
        brand: 'Golden Goose'
      },
      {
        id: 'f30',
        title: 'Acne Studios Face Beanie - Wool Knit Pink',
        price: 120,
        originalPrice: 140,
        rating: 4.3,
        reviewCount: 5432,
        image: 'https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 14,
        brand: 'Acne Studios'
      },
      {
        id: 'f31',
        title: 'Mansur Gavriel Bucket Bag - Italian Leather Tan',
        price: 395,
        originalPrice: 445,
        rating: 4.5,
        reviewCount: 2345,
        image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 11,
        brand: 'Mansur Gavriel'
      },
      {
        id: 'f32',
        title: 'Stone Island Compass Logo Sweatshirt - Navy Cotton',
        price: 285,
        originalPrice: 325,
        rating: 4.4,
        reviewCount: 3456,
        image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 12,
        brand: 'Stone Island'
      },
      {
        id: 'f33',
        title: 'Bottega Veneta Intrecciato Card Holder - Woven Leather Black',
        price: 350,
        originalPrice: 390,
        rating: 4.6,
        reviewCount: 1234,
        image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 10,
        brand: 'Bottega Veneta'
      },
      {
        id: 'f34',
        title: 'Fear of God Essentials Hoodie - Cream Oversized Fit',
        price: 90,
        originalPrice: 110,
        rating: 4.5,
        reviewCount: 6789,
        image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 18,
        brand: 'Fear of God Essentials'
      },
      {
        id: 'f35',
        title: 'Maison Margiela Tabi Boots - Black Leather Split-Toe',
        price: 1190,
        originalPrice: 1350,
        rating: 4.3,
        reviewCount: 567,
        image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 12,
        brand: 'Maison Margiela'
      },
      {
        id: 'f36',
        title: 'Jacquemus Le Chiquito Mini Bag - Leather Yellow',
        price: 495,
        originalPrice: 545,
        rating: 4.2,
        reviewCount: 2345,
        image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 9,
        brand: 'Jacquemus'
      }
    ],
    books: [
      // Page 1 (Products 1-12)
      {
        id: 'b1',
        title: 'The Seven Husbands of Evelyn Hugo: A Novel by Taylor Jenkins Reid',
        price: 16.99,
        originalPrice: 17.99,
        rating: 4.6,
        reviewCount: 147832,
        image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        isDeliveryTomorrow: true,
        discount: 6,
        brand: 'Atria Books'
      },
      {
        id: 'b2',
        title: 'Atomic Habits by James Clear - An Easy & Proven Way to Build Good Habits',
        price: 18.00,
        originalPrice: 21.99,
        rating: 4.8,
        reviewCount: 89234,
        image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        isDeliveryTomorrow: true,
        discount: 18,
        brand: 'Avery'
      },
      {
        id: 'b3',
        title: 'Where the Crawdads Sing by Delia Owens - Bestselling Novel',
        price: 15.99,
        originalPrice: 19.99,
        rating: 4.7,
        reviewCount: 256789,
        image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 20,
        brand: 'G.P. Putnam\'s Sons'
      },
      {
        id: 'b4',
        title: 'The Psychology of Money by Morgan Housel - Financial Wisdom',
        price: 17.99,
        originalPrice: 22.00,
        rating: 4.6,
        reviewCount: 45678,
        image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 18,
        brand: 'Harriman House'
      },
      {
        id: 'b5',
        title: 'Educated: A Memoir by Tara Westover - New York Times Bestseller',
        price: 16.99,
        originalPrice: 19.99,
        rating: 4.5,
        reviewCount: 134567,
        image: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 15,
        brand: 'Random House'
      },
      {
        id: 'b6',
        title: 'The Silent Patient by Alex Michaelides - Psychological Thriller',
        price: 14.99,
        originalPrice: 17.99,
        rating: 4.4,
        reviewCount: 98765,
        image: 'https://images.unsplash.com/photo-1551029506-0807df4e2031?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 17,
        brand: 'Celadon Books'
      },
      {
        id: 'b7',
        title: 'Becoming by Michelle Obama - Intimate, Powerful, and Inspiring Memoir',
        price: 19.99,
        originalPrice: 24.99,
        rating: 4.8,
        reviewCount: 189234,
        image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 20,
        brand: 'Crown'
      },
      {
        id: 'b8',
        title: 'The Midnight Library by Matt Haig - Philosophy and Fiction Combined',
        price: 15.99,
        originalPrice: 18.99,
        rating: 4.3,
        reviewCount: 67890,
        image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 16,
        brand: 'Viking'
      },
      {
        id: 'b9',
        title: '1984 by George Orwell - Classic Dystopian Social Science Fiction',
        price: 13.99,
        originalPrice: 15.99,
        rating: 4.7,
        reviewCount: 345678,
        image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 13,
        brand: 'Signet Classics'
      },
      {
        id: 'b10',
        title: 'The Subtle Art of Not Giving a F*ck by Mark Manson - Life Philosophy',
        price: 16.99,
        originalPrice: 19.99,
        rating: 4.2,
        reviewCount: 123456,
        image: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 15,
        brand: 'HarperOne'
      },
      {
        id: 'b11',
        title: 'Harry Potter and the Sorcerer\'s Stone by J.K. Rowling - Hardcover Edition',
        price: 24.99,
        originalPrice: 29.99,
        rating: 4.9,
        reviewCount: 567890,
        image: 'https://images.unsplash.com/photo-1621351183012-e51df1bdc82f?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 17,
        brand: 'Arthur A. Levine Books'
      },
      {
        id: 'b12',
        title: 'Sapiens: A Brief History of Humankind by Yuval Noah Harari',
        price: 21.99,
        originalPrice: 25.99,
        rating: 4.6,
        reviewCount: 234567,
        image: 'https://images.unsplash.com/photo-1526243741027-444d633d7365?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 15,
        brand: 'Harper'
      },
      // Page 2 (Products 13-24)
      {
        id: 'b13',
        title: 'The Thursday Murder Club by Richard Osman - Cozy Mystery Series',
        price: 16.99,
        originalPrice: 18.99,
        rating: 4.5,
        reviewCount: 87654,
        image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 11,
        brand: 'Viking'
      },
      {
        id: 'b14',
        title: 'Dune by Frank Herbert - Science Fiction Epic Classic',
        price: 17.99,
        originalPrice: 20.99,
        rating: 4.8,
        reviewCount: 234567,
        image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 14,
        brand: 'Ace'
      },
      {
        id: 'b15',
        title: 'The Power of Now by Eckhart Tolle - Spiritual Enlightenment Guide',
        price: 16.00,
        originalPrice: 18.00,
        rating: 4.6,
        reviewCount: 156789,
        image: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 11,
        brand: 'New World Library'
      },
      {
        id: 'b16',
        title: 'The Hobbit by J.R.R. Tolkien - Fantasy Adventure Classic',
        price: 14.99,
        originalPrice: 17.99,
        rating: 4.9,
        reviewCount: 345678,
        image: 'https://images.unsplash.com/photo-1621351183012-e51df1bdc82f?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 17,
        brand: 'Houghton Mifflin'
      },
      {
        id: 'b17',
        title: 'Think and Grow Rich by Napoleon Hill - Success Philosophy',
        price: 12.99,
        originalPrice: 15.99,
        rating: 4.4,
        reviewCount: 98765,
        image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 19,
        brand: 'TarcherPerigee'
      },
      {
        id: 'b18',
        title: 'The Alchemist by Paulo Coelho - Inspirational Fiction',
        price: 15.99,
        originalPrice: 17.99,
        rating: 4.7,
        reviewCount: 287654,
        image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 11,
        brand: 'HarperOne'
      },
      {
        id: 'b19',
        title: 'The Great Gatsby by F. Scott Fitzgerald - American Literature Classic',
        price: 13.99,
        originalPrice: 16.99,
        rating: 4.3,
        reviewCount: 456789,
        image: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 18,
        brand: 'Scribner'
      },
      {
        id: 'b20',
        title: 'Rich Dad Poor Dad by Robert Kiyosaki - Financial Education',
        price: 17.99,
        originalPrice: 19.99,
        rating: 4.5,
        reviewCount: 198765,
        image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 10,
        brand: 'Plata Publishing'
      },
      {
        id: 'b21',
        title: 'The Catcher in the Rye by J.D. Salinger - Coming of Age Classic',
        price: 14.99,
        originalPrice: 17.99,
        rating: 4.2,
        reviewCount: 234567,
        image: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 17,
        brand: 'Little, Brown'
      },
      {
        id: 'b22',
        title: 'The 7 Habits of Highly Effective People by Stephen Covey',
        price: 18.99,
        originalPrice: 22.99,
        rating: 4.6,
        reviewCount: 167890,
        image: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 17,
        brand: 'Free Press'
      },
      {
        id: 'b23',
        title: 'To Kill a Mockingbird by Harper Lee - Pulitzer Prize Winner',
        price: 15.99,
        originalPrice: 18.99,
        rating: 4.8,
        reviewCount: 389076,
        image: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 16,
        brand: 'Harper Perennial'
      },
      {
        id: 'b24',
        title: 'The Four Agreements by Don Miguel Ruiz - Personal Freedom Guide',
        price: 13.99,
        originalPrice: 16.99,
        rating: 4.7,
        reviewCount: 145632,
        image: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 18,
        brand: 'Amber-Allen Publishing'
      },
      // Page 3 (Products 25-36)
      {
        id: 'b25',
        title: 'Pride and Prejudice by Jane Austen - Romantic Literature Classic',
        price: 12.99,
        originalPrice: 15.99,
        rating: 4.6,
        reviewCount: 267890,
        image: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 19,
        brand: 'Penguin Classics'
      },
      {
        id: 'b26',
        title: 'The Lean Startup by Eric Ries - Innovation and Entrepreneurship',
        price: 19.99,
        originalPrice: 23.99,
        rating: 4.4,
        reviewCount: 87654,
        image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 17,
        brand: 'Crown Business'
      },
      {
        id: 'b27',
        title: 'The Girl with the Dragon Tattoo by Stieg Larsson - Thriller',
        price: 16.99,
        originalPrice: 19.99,
        rating: 4.5,
        reviewCount: 198765,
        image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 15,
        brand: 'Vintage Crime'
      },
      {
        id: 'b28',
        title: 'The Kite Runner by Khaled Hosseini - Historical Fiction',
        price: 17.99,
        originalPrice: 20.99,
        rating: 4.7,
        reviewCount: 234567,
        image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 14,
        brand: 'Riverhead Books'
      },
      {
        id: 'b29',
        title: 'Born to Run by Bruce Springsteen - Music Memoir',
        price: 18.99,
        originalPrice: 22.99,
        rating: 4.6,
        reviewCount: 123456,
        image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 17,
        brand: 'Simon & Schuster'
      },
      {
        id: 'b30',
        title: 'The Outsiders by S.E. Hinton - Young Adult Classic',
        price: 13.99,
        originalPrice: 16.99,
        rating: 4.3,
        reviewCount: 178965,
        image: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 18,
        brand: 'Speak'
      },
      {
        id: 'b31',
        title: 'Mindset by Carol S. Dweck - Psychology of Success',
        price: 17.99,
        originalPrice: 21.99,
        rating: 4.5,
        reviewCount: 145632,
        image: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 18,
        brand: 'Ballantine Books'
      },
      {
        id: 'b32',
        title: 'The Book Thief by Markus Zusak - Historical Fiction',
        price: 16.99,
        originalPrice: 19.99,
        rating: 4.8,
        reviewCount: 267890,
        image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 15,
        brand: 'Knopf Books'
      },
      {
        id: 'b33',
        title: 'Good to Great by Jim Collins - Business Strategy',
        price: 19.99,
        originalPrice: 24.99,
        rating: 4.4,
        reviewCount: 98765,
        image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 20,
        brand: 'HarperBusiness'
      },
      {
        id: 'b34',
        title: 'Lord of the Flies by William Golding - Dystopian Classic',
        price: 14.99,
        originalPrice: 17.99,
        rating: 4.2,
        reviewCount: 345678,
        image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 17,
        brand: 'Faber & Faber'
      },
      {
        id: 'b35',
        title: 'The Fault in Our Stars by John Green - Young Adult Romance',
        price: 15.99,
        originalPrice: 18.99,
        rating: 4.6,
        reviewCount: 234567,
        image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 16,
        brand: 'Dutton'
      },
      {
        id: 'b36',
        title: 'The Intelligent Investor by Benjamin Graham - Investment Guide',
        price: 22.99,
        originalPrice: 26.99,
        rating: 4.5,
        reviewCount: 156789,
        image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 15,
        brand: 'Harper Business'
      }
    ],
    home: [
      // Page 1 (Products 1-12)
      {
        id: 'h1',
        title: 'Instant Pot Duo 7-in-1 Electric Pressure Cooker, 8 Quart',
        price: 79,
        originalPrice: 119,
        rating: 4.7,
        reviewCount: 98234,
        image: 'https://images.unsplash.com/photo-1544233726-9f1d2b27be8b?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 34,
        brand: 'Instant Pot'
      },
      {
        id: 'h2',
        title: 'KitchenAid Artisan Series 5-Quart Stand Mixer - Empire Red',
        price: 429,
        originalPrice: 499,
        rating: 4.8,
        reviewCount: 45678,
        image: 'https://images.unsplash.com/photo-1590736969955-71cc94901144?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 14,
        brand: 'KitchenAid'
      },
      {
        id: 'h3',
        title: 'Ninja Foodi Personal Blender with Cups - 18 oz Single Serve',
        price: 79.99,
        originalPrice: 99.99,
        rating: 4.5,
        reviewCount: 23456,
        image: 'https://images.unsplash.com/photo-1570197788417-0e82375c9371?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 20,
        brand: 'Ninja'
      },
      {
        id: 'h4',
        title: 'Shark Navigator Lift-Away Professional NV356E Vacuum Cleaner',
        price: 179,
        originalPrice: 199,
        rating: 4.6,
        reviewCount: 67890,
        image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 10,
        brand: 'Shark'
      },
      {
        id: 'h5',
        title: 'Brookstone Weighted Blanket 15lbs - Ultra Soft Minky Fabric',
        price: 89.99,
        originalPrice: 129.99,
        rating: 4.4,
        reviewCount: 34567,
        image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 31,
        brand: 'Brookstone'
      },
      {
        id: 'h6',
        title: 'Philips Sonicare DiamondClean Smart Electric Toothbrush',
        price: 249,
        originalPrice: 299,
        rating: 4.5,
        reviewCount: 12345,
        image: 'https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 17,
        brand: 'Philips'
      },
      {
        id: 'h7',
        title: 'Dyson V11 Torque Drive Cordless Vacuum Cleaner - Blue/Red',
        price: 599,
        originalPrice: 699,
        rating: 4.7,
        reviewCount: 8765,
        image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 14,
        brand: 'Dyson'
      },
      {
        id: 'h8',
        title: 'Cuisinart Air Fryer Toaster Oven - Stainless Steel 0.6 Cubic Feet',
        price: 199,
        originalPrice: 249,
        rating: 4.3,
        reviewCount: 56789,
        image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 20,
        brand: 'Cuisinart'
      },
      {
        id: 'h9',
        title: 'Bamboo Cutting Board Set with Juice Groove - 3 Piece Kitchen Set',
        price: 39.99,
        originalPrice: 59.99,
        rating: 4.6,
        reviewCount: 78901,
        image: 'https://images.unsplash.com/photo-1594824405334-5c6e70e83b30?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 33,
        brand: 'Greener Chef'
      },
      {
        id: 'h10',
        title: 'Lodge Cast Iron Skillet 10.25 Inch - Pre-Seasoned Cookware',
        price: 34.90,
        originalPrice: 44.90,
        rating: 4.8,
        reviewCount: 123456,
        image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 22,
        brand: 'Lodge'
      },
      {
        id: 'h11',
        title: 'Rubbermaid Brilliance Pantry Organization & Food Storage Containers',
        price: 79.99,
        originalPrice: 99.99,
        rating: 4.5,
        reviewCount: 45678,
        image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 20,
        brand: 'Rubbermaid'
      },
      {
        id: 'h12',
        title: 'Honeywell HPA300 True HEPA Air Purifier - Covers 465 Sq Ft',
        price: 249,
        originalPrice: 299,
        rating: 4.4,
        reviewCount: 23456,
        image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 17,
        brand: 'Honeywell'
      },
      // Page 2 (Products 13-24)
      {
        id: 'h13',
        title: 'Succulent Plants Collection - Set of 6 Small Live Plants',
        price: 24.99,
        originalPrice: 34.99,
        rating: 4.6,
        reviewCount: 12345,
        image: 'https://images.unsplash.com/photo-1509423350716-97f2360af828?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 29,
        brand: 'The Succulent Source'
      },
      {
        id: 'h14',
        title: 'Macrame Wall Hanging Plant Holder - Boho Home Decor',
        price: 18.99,
        originalPrice: 24.99,
        rating: 4.4,
        reviewCount: 8765,
        image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 24,
        brand: 'Hanging Gardens'
      },
      {
        id: 'h15',
        title: 'Ceramic Flower Pots with Drainage Holes - Set of 4',
        price: 32.99,
        originalPrice: 42.99,
        rating: 4.5,
        reviewCount: 23456,
        image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 23,
        brand: 'Garden Essentials'
      },
      {
        id: 'h16',
        title: 'LED Grow Light for Indoor Plants - Full Spectrum 45W',
        price: 49.99,
        originalPrice: 69.99,
        rating: 4.3,
        reviewCount: 15678,
        image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 29,
        brand: 'GrowLED'
      },
      {
        id: 'h17',
        title: 'Woven Storage Baskets - Set of 3 Natural Water Hyacinth',
        price: 45.99,
        originalPrice: 59.99,
        rating: 4.7,
        reviewCount: 34567,
        image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 23,
        brand: 'Natural Living'
      },
      {
        id: 'h18',
        title: 'Garden Tool Set - 10 Piece Stainless Steel with Carrying Case',
        price: 89.99,
        originalPrice: 119.99,
        rating: 4.6,
        reviewCount: 45678,
        image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 25,
        brand: 'Garden Pro'
      },
      {
        id: 'h19',
        title: 'Throw Pillows Set of 4 - Decorative Cotton Linen Cushion Covers',
        price: 28.99,
        originalPrice: 39.99,
        rating: 4.4,
        reviewCount: 23456,
        image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 28,
        brand: 'Home Comfort'
      },
      {
        id: 'h20',
        title: 'Essential Oil Diffuser - Ultrasonic Aromatherapy Humidifier',
        price: 35.99,
        originalPrice: 49.99,
        rating: 4.5,
        reviewCount: 67890,
        image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 28,
        brand: 'Zen Home'
      },
      {
        id: 'h21',
        title: 'Wall Mounted Spice Rack - Bamboo 3-Tier Kitchen Organizer',
        price: 24.99,
        originalPrice: 34.99,
        rating: 4.3,
        reviewCount: 12345,
        image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 29,
        brand: 'Kitchen Organizer'
      },
      {
        id: 'h22',
        title: 'Solar Powered Garden Lights - Set of 8 LED Path Lights',
        price: 42.99,
        originalPrice: 59.99,
        rating: 4.2,
        reviewCount: 34567,
        image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 28,
        brand: 'Solar Bright'
      },
      {
        id: 'h23',
        title: 'Memory Foam Bath Mat - Non-Slip Absorbent Bathroom Rug',
        price: 19.99,
        originalPrice: 29.99,
        rating: 4.6,
        reviewCount: 45678,
        image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 33,
        brand: 'Bath Comfort'
      },
      {
        id: 'h24',
        title: 'Wooden Floating Shelves - Set of 3 Rustic Wall Mount Storage',
        price: 36.99,
        originalPrice: 49.99,
        rating: 4.5,
        reviewCount: 23456,
        image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 26,
        brand: 'Rustic Home'
      },
      // Page 3 (Products 25-36)
      {
        id: 'h25',
        title: 'Outdoor Patio String Lights - 48ft Waterproof LED Edison Bulbs',
        price: 59.99,
        originalPrice: 79.99,
        rating: 4.7,
        reviewCount: 56789,
        image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 25,
        brand: 'Outdoor Glow'
      },
      {
        id: 'h26',
        title: 'Herb Garden Starter Kit - 9 Varieties with Pots and Seeds',
        price: 29.99,
        originalPrice: 39.99,
        rating: 4.4,
        reviewCount: 34567,
        image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 25,
        brand: 'Garden Starter'
      },
      {
        id: 'h27',
        title: 'Bamboo Shower Caddy - 4-Tier Bathroom Storage Organizer',
        price: 44.99,
        originalPrice: 59.99,
        rating: 4.3,
        reviewCount: 23456,
        image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 25,
        brand: 'Bamboo Organics'
      },
      {
        id: 'h28',
        title: 'Turkish Cotton Bath Towel Set - 6 Piece Luxury Hotel Quality',
        price: 49.99,
        originalPrice: 69.99,
        rating: 4.6,
        reviewCount: 45678,
        image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 29,
        brand: 'Luxury Bath'
      },
      {
        id: 'h29',
        title: 'Ceramic Dinnerware Set - 16 Piece Modern Stoneware Service for 4',
        price: 89.99,
        originalPrice: 119.99,
        rating: 4.5,
        reviewCount: 34567,
        image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 25,
        brand: 'Modern Home'
      },
      {
        id: 'h30',
        title: 'Blackout Curtains - Thermal Insulated Room Darkening Drapes',
        price: 32.99,
        originalPrice: 44.99,
        rating: 4.4,
        reviewCount: 23456,
        image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 27,
        brand: 'Window Treatments'
      },
      {
        id: 'h31',
        title: 'Stainless Steel Kitchen Knife Set - 15 Piece Professional Chef Set',
        price: 79.99,
        originalPrice: 99.99,
        rating: 4.7,
        reviewCount: 56789,
        image: 'https://images.unsplash.com/photo-1594824405334-5c6e70e83b30?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 20,
        brand: 'Chef Pro'
      },
      {
        id: 'h32',
        title: 'Area Rug - Modern Geometric Pattern 5x7 ft Living Room Carpet',
        price: 129.99,
        originalPrice: 179.99,
        rating: 4.3,
        reviewCount: 12345,
        image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 28,
        brand: 'Modern Rugs'
      },
      {
        id: 'h33',
        title: 'Wall Art Canvas Prints - Set of 3 Abstract Modern Paintings',
        price: 54.99,
        originalPrice: 74.99,
        rating: 4.2,
        reviewCount: 23456,
        image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 27,
        brand: 'Art Gallery'
      },
      {
        id: 'h34',
        title: 'Smart WiFi Thermostat - Programmable Digital Temperature Control',
        price: 149.99,
        originalPrice: 199.99,
        rating: 4.6,
        reviewCount: 34567,
        image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 25,
        brand: 'Smart Home'
      },
      {
        id: 'h35',
        title: 'Outdoor Fire Pit Table - Propane Gas Patio Heater with Cover',
        price: 299.99,
        originalPrice: 399.99,
        rating: 4.5,
        reviewCount: 15678,
        image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 25,
        brand: 'Outdoor Living'
      },
      {
        id: 'h36',
        title: 'Glass Food Storage Containers - 10 Piece Set with Airtight Lids',
        price: 39.99,
        originalPrice: 54.99,
        rating: 4.8,
        reviewCount: 67890,
        image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 27,
        brand: 'Kitchen Storage'
      }
    ],
    sports: [
      // Page 1 (Products 1-12)
      {
        id: 's1',
        title: 'Fitbit Charge 5 Advanced Fitness & Health Tracker with GPS',
        price: 149,
        originalPrice: 179,
        rating: 4.2,
        reviewCount: 34567,
        image: 'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 17,
        brand: 'Fitbit'
      },
      {
        id: 's2',
        title: 'Nike Men\'s Air Zoom Pegasus 39 Running Shoes - Black/White',
        price: 129.99,
        originalPrice: 149.99,
        rating: 4.6,
        reviewCount: 23456,
        image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 13,
        brand: 'Nike'
      },
      {
        id: 's3',
        title: 'Bowflex SelectTech 552 Adjustable Dumbbells - Pair',
        price: 549,
        originalPrice: 649,
        rating: 4.7,
        reviewCount: 12345,
        image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 15,
        brand: 'Bowflex'
      },
      {
        id: 's4',
        title: 'Adidas Ultraboost 22 Running Shoes - Women\'s Cloud White',
        price: 189.99,
        originalPrice: 219.99,
        rating: 4.5,
        reviewCount: 18765,
        image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 14,
        brand: 'Adidas'
      },
      {
        id: 's5',
        title: 'Yeti Rambler 30 oz Tumbler with MagSlider Lid - Stainless Steel',
        price: 39.99,
        originalPrice: 44.99,
        rating: 4.8,
        reviewCount: 67890,
        image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 11,
        brand: 'Yeti'
      },
      {
        id: 's6',
        title: 'Wilson Evolution Indoor Game Basketball - Official Size',
        price: 64.99,
        originalPrice: 79.99,
        rating: 4.7,
        reviewCount: 45678,
        image: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 19,
        brand: 'Wilson'
      },
      {
        id: 's7',
        title: 'Coleman Sundome Dome Tent for Camping - 4 Person Weather Resistant',
        price: 89.99,
        originalPrice: 109.99,
        rating: 4.4,
        reviewCount: 23456,
        image: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 18,
        brand: 'Coleman'
      },
      {
        id: 's8',
        title: 'Under Armour Men\'s Tech 2.0 Short Sleeve T-Shirt - Moisture Wicking',
        price: 24.99,
        originalPrice: 29.99,
        rating: 4.5,
        reviewCount: 56789,
        image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 17,
        brand: 'Under Armour'
      },
      {
        id: 's9',
        title: 'Spalding NBA Official Game Basketball - Indoor/Outdoor Composite',
        price: 49.99,
        originalPrice: 59.99,
        rating: 4.6,
        reviewCount: 34567,
        image: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 17,
        brand: 'Spalding'
      },
      {
        id: 's10',
        title: 'RTIC Cooler 20 Qt - Ice Chest with Heavy Duty Rubber Latches',
        price: 149.99,
        originalPrice: 179.99,
        rating: 4.3,
        reviewCount: 12345,
        image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 17,
        brand: 'RTIC'
      },
      {
        id: 's11',
        title: 'TRX ALL-IN-ONE Suspension Trainer - Bodyweight Resistance Training Kit',
        price: 195,
        originalPrice: 245,
        rating: 4.7,
        reviewCount: 8765,
        image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 20,
        brand: 'TRX'
      },
      {
        id: 's12',
        title: 'Garmin Forerunner 245 Music GPS Running Smartwatch with Music Storage',
        price: 299,
        originalPrice: 349,
        rating: 4.4,
        reviewCount: 15678,
        image: 'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 14,
        brand: 'Garmin'
      },
      // Page 2 (Products 13-24)
      {
        id: 's13',
        title: 'Resistance Bands Set - 5 Exercise Bands with Door Anchor',
        price: 29.99,
        originalPrice: 39.99,
        rating: 4.5,
        reviewCount: 23456,
        image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 25,
        brand: 'Fitness Gear'
      },
      {
        id: 's14',
        title: 'Yoga Mat - Non-Slip 6mm Thick Exercise Mat with Carrying Strap',
        price: 34.99,
        originalPrice: 49.99,
        rating: 4.6,
        reviewCount: 34567,
        image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 30,
        brand: 'Yoga Pro'
      },
      {
        id: 's15',
        title: 'Hiking Backpack 50L - Waterproof Outdoor Camping Pack',
        price: 89.99,
        originalPrice: 119.99,
        rating: 4.4,
        reviewCount: 15678,
        image: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 25,
        brand: 'Trail Master'
      },
      {
        id: 's16',
        title: 'Tennis Racquet - Lightweight Carbon Fiber Adult Racket',
        price: 79.99,
        originalPrice: 99.99,
        rating: 4.3,
        reviewCount: 12345,
        image: 'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 20,
        brand: 'Pro Tennis'
      },
      {
        id: 's17',
        title: 'Protein Shaker Bottle - 28oz BPA-Free with Mixing Ball',
        price: 12.99,
        originalPrice: 16.99,
        rating: 4.7,
        reviewCount: 45678,
        image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 24,
        brand: 'Blender Bottle'
      },
      {
        id: 's18',
        title: 'Golf Balls - Premium Distance 2-Piece Construction 12 Pack',
        price: 24.99,
        originalPrice: 32.99,
        rating: 4.5,
        reviewCount: 23456,
        image: 'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 24,
        brand: 'TaylorMade'
      },
      {
        id: 's19',
        title: 'Swimming Goggles - Anti-Fog UV Protection Competition Style',
        price: 19.99,
        originalPrice: 24.99,
        rating: 4.4,
        reviewCount: 34567,
        image: 'https://images.unsplash.com/photo-1595039838779-f3780873afdd?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 20,
        brand: 'Speedo'
      },
      {
        id: 's20',
        title: 'Foam Roller - High Density Muscle Recovery Therapy Tool',
        price: 29.99,
        originalPrice: 39.99,
        rating: 4.6,
        reviewCount: 23456,
        image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 25,
        brand: 'Recovery Pro'
      },
      {
        id: 's21',
        title: 'Cycling Helmet - Lightweight Adult Safety Helmet with LED Light',
        price: 49.99,
        originalPrice: 69.99,
        rating: 4.3,
        reviewCount: 15678,
        image: 'https://images.unsplash.com/photo-1544191696-15693072647b?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 29,
        brand: 'Safety First'
      },
      {
        id: 's22',
        title: 'Jump Rope - Speed Rope with Adjustable Cable and Ball Bearings',
        price: 19.99,
        originalPrice: 24.99,
        rating: 4.5,
        reviewCount: 34567,
        image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 20,
        brand: 'Speed Fit'
      },
      {
        id: 's23',
        title: 'Camping Sleeping Bag - 3 Season Mummy Bag Rated to 20°F',
        price: 69.99,
        originalPrice: 89.99,
        rating: 4.4,
        reviewCount: 12345,
        image: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 22,
        brand: 'Outdoor Gear'
      },
      {
        id: 's24',
        title: 'Kettlebell Set - Cast Iron 3 Weight Set 15lb 25lb 35lb',
        price: 149.99,
        originalPrice: 199.99,
        rating: 4.7,
        reviewCount: 23456,
        image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 25,
        brand: 'Iron Fitness'
      },
      // Page 3 (Products 25-36)
      {
        id: 's25',
        title: 'Fishing Rod and Reel Combo - Spinning Rod Kit for Beginners',
        price: 59.99,
        originalPrice: 79.99,
        rating: 4.3,
        reviewCount: 15678,
        image: 'https://images.unsplash.com/photo-1520637836862-4d197d17c90a?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 25,
        brand: 'Fishing Pro'
      },
      {
        id: 's26',
        title: 'Skateboard Complete - 31" Street Skateboard for Teens and Adults',
        price: 79.99,
        originalPrice: 99.99,
        rating: 4.5,
        reviewCount: 23456,
        image: 'https://images.unsplash.com/photo-1547447134-cd3f5c716030?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 20,
        brand: 'Street Style'
      },
      {
        id: 's27',
        title: 'Rock Climbing Shoes - Aggressive Downturned Climbing Footwear',
        price: 119.99,
        originalPrice: 149.99,
        rating: 4.4,
        reviewCount: 12345,
        image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 20,
        brand: 'Climb Tech'
      },
      {
        id: 's28',
        title: 'Surfboard - 9ft Longboard Soft Top Beginner Surfboard',
        price: 199.99,
        originalPrice: 249.99,
        rating: 4.6,
        reviewCount: 8765,
        image: 'https://images.unsplash.com/photo-1526400473556-aac12354f3db?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 20,
        brand: 'Wave Rider'
      },
      {
        id: 's29',
        title: 'Archery Set - Recurve Bow Kit for Adults with Arrows and Target',
        price: 129.99,
        originalPrice: 169.99,
        rating: 4.2,
        reviewCount: 15678,
        image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 24,
        brand: 'Archery Pro'
      },
      {
        id: 's30',
        title: 'Boxing Gloves - 14oz Professional Training Gloves with Hand Wraps',
        price: 49.99,
        originalPrice: 69.99,
        rating: 4.5,
        reviewCount: 23456,
        image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 29,
        brand: 'Fight Club'
      },
      {
        id: 's31',
        title: 'Inflatable Paddleboard - 10ft SUP with Pump and Accessories',
        price: 299.99,
        originalPrice: 399.99,
        rating: 4.4,
        reviewCount: 12345,
        image: 'https://images.unsplash.com/photo-1526400473556-aac12354f3db?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 25,
        brand: 'Water Sports'
      },
      {
        id: 's32',
        title: 'Mountain Bike - 26" Full Suspension Trail Bike 21 Speed',
        price: 449.99,
        originalPrice: 599.99,
        rating: 4.3,
        reviewCount: 8765,
        image: 'https://images.unsplash.com/photo-1544191696-15693072647b?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 25,
        brand: 'Trail Blazer'
      },
      {
        id: 's33',
        title: 'Badminton Set - Complete Outdoor Game Set with Net and Rackets',
        price: 39.99,
        originalPrice: 54.99,
        rating: 4.2,
        reviewCount: 23456,
        image: 'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 27,
        brand: 'Court Games'
      },
      {
        id: 's34',
        title: 'Ice Skates - Figure Skates with Warm Liner for Indoor Rinks',
        price: 89.99,
        originalPrice: 119.99,
        rating: 4.4,
        reviewCount: 15678,
        image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 25,
        brand: 'Ice Pro'
      },
      {
        id: 's35',
        title: 'Snowboard Bindings - All-Mountain Bindings with Quick Release',
        price: 179.99,
        originalPrice: 229.99,
        rating: 4.5,
        reviewCount: 12345,
        image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 22,
        brand: 'Snow Gear'
      },
      {
        id: 's36',
        title: 'Volleyball - Official Size Indoor/Outdoor Composite Leather Ball',
        price: 29.99,
        originalPrice: 39.99,
        rating: 4.6,
        reviewCount: 34567,
        image: 'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 25,
        brand: 'Sports Central'
      }
    ],
    grocery: [
      // Page 1 (Products 1-12)
      {
        id: 'g1',
        title: 'Organic Bananas - Fresh Yellow Bananas 3 lbs',
        price: 2.99,
        originalPrice: 3.49,
        rating: 4.5,
        reviewCount: 12847,
        image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        isDeliveryTomorrow: true,
        discount: 14,
        brand: 'Organic'
      },
      {
        id: 'g2',
        title: 'Avocados - Large Hass Avocados Pack of 6',
        price: 5.99,
        originalPrice: 7.49,
        rating: 4.4,
        reviewCount: 8934,
        image: 'https://images.unsplash.com/photo-1523049673857-95e059d581b8?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 20,
        brand: 'Fresh'
      },
      {
        id: 'g3',
        title: 'Whole Foods Market Organic Extra Virgin Olive Oil 500ml',
        price: 12.99,
        originalPrice: 15.99,
        rating: 4.7,
        reviewCount: 5672,
        image: 'https://images.unsplash.com/photo-1474979266404-71cc94901144?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 19,
        brand: 'Whole Foods'
      },
      {
        id: 'g4',
        title: 'Honey Nut Cheerios Cereal - Heart Healthy Whole Grain Oats 18.8 oz',
        price: 4.49,
        originalPrice: 5.29,
        rating: 4.6,
        reviewCount: 45678,
        image: 'https://images.unsplash.com/photo-1574168945971-78d2abe8e0e2?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 15,
        brand: 'General Mills'
      },
      {
        id: 'g5',
        title: 'Ground Turkey 93/7 Lean - 1 lb Fresh Ground Turkey',
        price: 6.99,
        originalPrice: 8.49,
        rating: 4.3,
        reviewCount: 3456,
        image: 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        isDeliveryTomorrow: true,
        discount: 18,
        brand: 'Butterball'
      },
      {
        id: 'g6',
        title: 'Organic Baby Spinach - Fresh Leafy Greens 5 oz Container',
        price: 3.99,
        originalPrice: 4.99,
        rating: 4.5,
        reviewCount: 7892,
        image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 20,
        brand: 'Organic'
      },
      {
        id: 'g7',
        title: 'Greek Yogurt Plain Nonfat - Protein Rich Yogurt 32 oz',
        price: 5.99,
        originalPrice: 7.29,
        rating: 4.4,
        reviewCount: 12345,
        image: 'https://images.unsplash.com/photo-1571212515416-8a1801d20db4?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 18,
        brand: 'Fage'
      },
      {
        id: 'g8',
        title: 'Wild Caught Salmon Fillets - Atlantic Salmon 1 lb Fresh Fish',
        price: 14.99,
        originalPrice: 18.99,
        rating: 4.6,
        reviewCount: 2345,
        image: 'https://images.unsplash.com/photo-1580476262798-bddd9f4b7369?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        isDeliveryTomorrow: true,
        discount: 21,
        brand: 'Wild Planet'
      },
      {
        id: 'g9',
        title: 'Brown Rice Organic Long Grain - Whole Grain Rice 2 lbs',
        price: 3.49,
        originalPrice: 4.29,
        rating: 4.7,
        reviewCount: 8765,
        image: 'https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 19,
        brand: 'Lundberg'
      },
      {
        id: 'g10',
        title: 'Almond Butter Organic - No Added Sugar Raw Almond Butter 16 oz',
        price: 11.99,
        originalPrice: 14.99,
        rating: 4.5,
        reviewCount: 4567,
        image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 20,
        brand: 'Justin\'s'
      },
      {
        id: 'g11',
        title: 'Cage Free Large Eggs - Grade A Brown Eggs Dozen Pack',
        price: 3.99,
        originalPrice: 4.79,
        rating: 4.6,
        reviewCount: 23456,
        image: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 17,
        brand: 'Vital Farms'
      },
      {
        id: 'g12',
        title: 'Organic Blueberries - Fresh Antioxidant Rich Berries 18 oz',
        price: 7.99,
        originalPrice: 9.99,
        rating: 4.4,
        reviewCount: 6789,
        image: 'https://images.unsplash.com/photo-1498557850523-fd3d118b962e?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 20,
        brand: 'Driscoll\'s'
      },
      // Page 2 (Products 13-24)
      {
        id: 'g13',
        title: 'Organic Whole Milk - Grassfed Dairy 1 Gallon',
        price: 6.49,
        originalPrice: 7.99,
        rating: 4.5,
        reviewCount: 15678,
        image: 'https://images.unsplash.com/photo-1571212515416-8a1801d20db4?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 19,
        brand: 'Organic Valley'
      },
      {
        id: 'g14',
        title: 'Sweet Potatoes - Orange Fresh Sweet Potatoes 3 lbs',
        price: 4.99,
        originalPrice: 5.99,
        rating: 4.6,
        reviewCount: 12345,
        image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 17,
        brand: 'Farm Fresh'
      },
      {
        id: 'g15',
        title: 'Quinoa Organic Tri-Color - Complete Protein Grain 2 lbs',
        price: 8.99,
        originalPrice: 11.99,
        rating: 4.7,
        reviewCount: 8765,
        image: 'https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 25,
        brand: 'Ancient Harvest'
      },
      {
        id: 'g16',
        title: 'Sourdough Bread - Artisan Baked Fresh Daily Whole Loaf',
        price: 4.99,
        originalPrice: 5.99,
        rating: 4.4,
        reviewCount: 23456,
        image: 'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 17,
        brand: 'Artisan Bakery'
      },
      {
        id: 'g17',
        title: 'Fresh Strawberries - Sweet Red Berries 2 lb Container',
        price: 5.99,
        originalPrice: 7.49,
        rating: 4.3,
        reviewCount: 34567,
        image: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 20,
        brand: 'Berry Fresh'
      },
      {
        id: 'g18',
        title: 'Organic Chicken Breast - Boneless Skinless 2 lbs',
        price: 12.99,
        originalPrice: 15.99,
        rating: 4.5,
        reviewCount: 15678,
        image: 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 19,
        brand: 'Free Range'
      },
      {
        id: 'g19',
        title: 'Coconut Water - Natural Electrolyte Drink 6 Pack 16.9 oz',
        price: 8.99,
        originalPrice: 11.99,
        rating: 4.4,
        reviewCount: 23456,
        image: 'https://images.unsplash.com/photo-1571212515416-8a1801d20db4?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 25,
        brand: 'Vita Coco'
      },
      {
        id: 'g20',
        title: 'Dark Chocolate 85% Cacao - Organic Fair Trade 3.5 oz Bar',
        price: 4.49,
        originalPrice: 5.99,
        rating: 4.6,
        reviewCount: 12345,
        image: 'https://images.unsplash.com/photo-1549297161-14b3dc411b4c?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 25,
        brand: 'Lindt'
      },
      {
        id: 'g21',
        title: 'Pasta Whole Wheat - Organic Penne Rigate 1 lb Box',
        price: 2.99,
        originalPrice: 3.79,
        rating: 4.3,
        reviewCount: 8765,
        image: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 21,
        brand: 'Barilla'
      },
      {
        id: 'g22',
        title: 'Kombucha Gingerade - Probiotic Fermented Tea 16 fl oz',
        price: 3.99,
        originalPrice: 4.99,
        rating: 4.2,
        reviewCount: 15678,
        image: 'https://images.unsplash.com/photo-1571212515416-8a1801d20db4?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 20,
        brand: 'GT\'s'
      },
      {
        id: 'g23',
        title: 'Cashew Nuts Raw - Unsalted Whole Cashews 1 lb',
        price: 9.99,
        originalPrice: 12.99,
        rating: 4.7,
        reviewCount: 23456,
        image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 23,
        brand: 'Nature\'s Best'
      },
      {
        id: 'g24',
        title: 'Organic Kale - Fresh Leafy Greens Bundle',
        price: 3.49,
        originalPrice: 4.29,
        rating: 4.4,
        reviewCount: 12345,
        image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 19,
        brand: 'Organic Greens'
      },
      // Page 3 (Products 25-36)
      {
        id: 'g25',
        title: 'Green Tea Organic - Premium Loose Leaf Tea 4 oz',
        price: 12.99,
        originalPrice: 15.99,
        rating: 4.5,
        reviewCount: 8765,
        image: 'https://images.unsplash.com/photo-1571212515416-8a1801d20db4?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 19,
        brand: 'Traditional Medicinals'
      },
      {
        id: 'g26',
        title: 'Frozen Wild Blueberries - Antioxidant Rich Berries 10 oz',
        price: 4.99,
        originalPrice: 6.49,
        rating: 4.6,
        reviewCount: 15678,
        image: 'https://images.unsplash.com/photo-1498557850523-fd3d118b962e?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 23,
        brand: 'Frozen Fresh'
      },
      {
        id: 'g27',
        title: 'Sea Salt Himalayan Pink - Fine Ground 1 lb Pouch',
        price: 8.99,
        originalPrice: 11.99,
        rating: 4.4,
        reviewCount: 23456,
        image: 'https://images.unsplash.com/photo-1474979266404-71cc94901144?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 25,
        brand: 'Himalayan Chef'
      },
      {
        id: 'g28',
        title: 'Maple Syrup Pure - Grade A Dark Robust 12 fl oz',
        price: 14.99,
        originalPrice: 18.99,
        rating: 4.7,
        reviewCount: 12345,
        image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 21,
        brand: 'Vermont Pure'
      },
      {
        id: 'g29',
        title: 'Tofu Organic Extra Firm - Plant-Based Protein 14 oz',
        price: 3.99,
        originalPrice: 4.99,
        rating: 4.3,
        reviewCount: 8765,
        image: 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 20,
        brand: 'House Foods'
      },
      {
        id: 'g30',
        title: 'Chia Seeds Organic - Superfood Seeds 1 lb',
        price: 11.99,
        originalPrice: 14.99,
        rating: 4.6,
        reviewCount: 23456,
        image: 'https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 20,
        brand: 'Spectrum Essentials'
      },
      {
        id: 'g31',
        title: 'Lemon Fresh - Organic Citrus Fruits 2 lbs',
        price: 3.99,
        originalPrice: 4.99,
        rating: 4.4,
        reviewCount: 15678,
        image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 20,
        brand: 'Citrus Fresh'
      },
      {
        id: 'g32',
        title: 'Turkey Bacon - Uncured Nitrate-Free 12 oz Package',
        price: 5.99,
        originalPrice: 7.49,
        rating: 4.2,
        reviewCount: 12345,
        image: 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 20,
        brand: 'Applegate'
      },
      {
        id: 'g33',
        title: 'Hemp Seeds Organic - Complete Protein Seeds 8 oz',
        price: 9.99,
        originalPrice: 12.99,
        rating: 4.5,
        reviewCount: 8765,
        image: 'https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 23,
        brand: 'Manitoba Harvest'
      },
      {
        id: 'g34',
        title: 'Coconut Flour Organic - Gluten-Free Baking Flour 1 lb',
        price: 7.99,
        originalPrice: 9.99,
        rating: 4.3,
        reviewCount: 23456,
        image: 'https://images.unsplash.com/photo-1574168945971-78d2abe8e0e2?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 20,
        brand: 'Bob\'s Red Mill'
      },
      {
        id: 'g35',
        title: 'Sparkling Water Lime - Natural Fruit Flavored 12 Pack Cans',
        price: 5.99,
        originalPrice: 7.99,
        rating: 4.4,
        reviewCount: 15678,
        image: 'https://images.unsplash.com/photo-1571212515416-8a1801d20db4?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 25,
        brand: 'LaCroix'
      },
      {
        id: 'g36',
        title: 'Hummus Traditional - Tahini Chickpea Dip 10 oz Container',
        price: 3.99,
        originalPrice: 4.99,
        rating: 4.6,
        reviewCount: 12345,
        image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 20,
        brand: 'Sabra'
      }
    ],
    appliances: [
      {
        id: 'a1',
        title: 'Instant Pot Duo 7-in-1 Electric Pressure Cooker, 8 Quart',
        price: 79,
        originalPrice: 119,
        rating: 4.7,
        reviewCount: 98234,
        image: 'https://images.unsplash.com/photo-1585515656617-d405f574bfa3?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 34,
        brand: 'Instant Pot'
      },
      {
        id: 'a2',
        title: 'Ninja Foodi Personal Blender with Cups - 18 oz Single Serve',
        price: 79.99,
        originalPrice: 99.99,
        rating: 4.5,
        reviewCount: 23456,
        image: 'https://images.unsplash.com/photo-1570197788417-0e82375c9371?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 20,
        brand: 'Ninja'
      },
      {
        id: 'a3',
        title: 'Keurig K-Classic Coffee Maker, Single Serve K-Cup Pod',
        price: 89,
        originalPrice: 109,
        rating: 4.5,
        reviewCount: 67890,
        image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 18,
        brand: 'Keurig'
      },
      {
        id: 'a4',
        title: 'Cuisinart Air Fryer Toaster Oven - Stainless Steel 0.6 Cubic Feet',
        price: 199,
        originalPrice: 249,
        rating: 4.3,
        reviewCount: 56789,
        image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 20,
        brand: 'Cuisinart'
      },
      {
        id: 'a5',
        title: 'Hamilton Beach FlexBrew Single Serve Coffee Maker - Black',
        price: 49.99,
        originalPrice: 69.99,
        rating: 4.2,
        reviewCount: 34567,
        image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 29,
        brand: 'Hamilton Beach'
      },
      {
        id: 'a6',
        title: 'Black+Decker Toaster Oven - 4 Slice Capacity with Baking Pan',
        price: 39.99,
        originalPrice: 59.99,
        rating: 4.1,
        reviewCount: 12345,
        image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 33,
        brand: 'Black+Decker'
      },
      {
        id: 'a7',
        title: 'Vitamix A3500 Ascent Series Smart Blender - Brushed Stainless',
        price: 549,
        originalPrice: 649,
        rating: 4.8,
        reviewCount: 8765,
        image: 'https://images.unsplash.com/photo-1570197788417-0e82375c9371?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 15,
        brand: 'Vitamix'
      },
      {
        id: 'a8',
        title: 'Breville Smart Oven Pro Convection Toaster Oven - Stainless Steel',
        price: 349,
        originalPrice: 399,
        rating: 4.6,
        reviewCount: 23456,
        image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 13,
        brand: 'Breville'
      },
      {
        id: 'a9',
        title: 'KitchenAid Artisan Series 5-Quart Stand Mixer - Empire Red',
        price: 429,
        originalPrice: 499,
        rating: 4.8,
        reviewCount: 45678,
        image: 'https://images.unsplash.com/photo-1590736969955-71cc94901144?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 14,
        brand: 'KitchenAid'
      },
      {
        id: 'a10',
        title: 'Ninja Professional Blender 1000 - 72 oz Total Crushing Pitcher',
        price: 99.99,
        originalPrice: 129.99,
        rating: 4.4,
        reviewCount: 67890,
        image: 'https://images.unsplash.com/photo-1570197788417-0e82375c9371?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 23,
        brand: 'Ninja'
      },
      {
        id: 'a11',
        title: 'Oster Countertop Microwave Oven - 1.1 Cu Ft 1000W Stainless Steel',
        price: 129,
        originalPrice: 159,
        rating: 4.3,
        reviewCount: 23456,
        image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 19,
        brand: 'Oster'
      },
      {
        id: 'a12',
        title: 'Crock-Pot 6 Quart Programmable Slow Cooker - Stainless Steel',
        price: 59.99,
        originalPrice: 79.99,
        rating: 4.5,
        reviewCount: 45678,
        image: 'https://images.unsplash.com/photo-1585515656617-d405f574bfa3?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 25,
        brand: 'Crock-Pot'
      }
    ],
    beauty: [
      {
        id: 'be1',
        title: 'CeraVe Foaming Facial Cleanser - Normal to Oily Skin 12 fl oz',
        price: 14.99,
        originalPrice: 18.99,
        rating: 4.6,
        reviewCount: 89234,
        image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        isDeliveryTomorrow: true,
        discount: 21,
        brand: 'CeraVe'
      },
      {
        id: 'be2',
        title: 'The Ordinary Niacinamide 10% + Zinc 1% - Oil Control Serum 30ml',
        price: 7.20,
        originalPrice: 8.50,
        rating: 4.4,
        reviewCount: 45678,
        image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 15,
        brand: 'The Ordinary'
      },
      {
        id: 'be3',
        title: 'Maybelline Instant Age Rewind Eraser Concealer - Medium Coverage',
        price: 8.99,
        originalPrice: 11.99,
        rating: 4.3,
        reviewCount: 67890,
        image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 25,
        brand: 'Maybelline'
      },
      {
        id: 'be4',
        title: 'Neutrogena Hydrating Hyaluronic Acid Serum - Plumps & Smooths',
        price: 19.99,
        originalPrice: 24.99,
        rating: 4.5,
        reviewCount: 23456,
        image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 20,
        brand: 'Neutrogena'
      },
      {
        id: 'be5',
        title: 'L\'Oreal Paris Voluminous Lash Paradise Mascara - Blackest Black',
        price: 11.99,
        originalPrice: 14.99,
        rating: 4.4,
        reviewCount: 34567,
        image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 20,
        brand: 'L\'Oreal Paris'
      },
      {
        id: 'be6',
        title: 'Fenty Beauty Gloss Bomb Universal Lip Luminizer - Fenty Glow',
        price: 21,
        originalPrice: 24,
        rating: 4.7,
        reviewCount: 12345,
        image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 13,
        brand: 'Fenty Beauty'
      },
      {
        id: 'be7',
        title: 'Olaplex No.3 Hair Perfector - Strengthening Treatment 3.3 fl oz',
        price: 28,
        originalPrice: 32,
        rating: 4.6,
        reviewCount: 56789,
        image: 'https://images.unsplash.com/photo-1526045612212-70caf35c14df?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 13,
        brand: 'Olaplex'
      },
      {
        id: 'be8',
        title: 'Rare Beauty Soft Pinch Liquid Blush - Joy (Soft Coral Pink)',
        price: 23,
        originalPrice: 26,
        rating: 4.5,
        reviewCount: 8765,
        image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 12,
        brand: 'Rare Beauty'
      },
      {
        id: 'be9',
        title: 'Drunk Elephant C-Firma Day Serum - Vitamin C Antioxidant Serum',
        price: 78,
        originalPrice: 89,
        rating: 4.3,
        reviewCount: 15678,
        image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 12,
        brand: 'Drunk Elephant'
      },
      {
        id: 'be10',
        title: 'Urban Decay All Nighter Long-Lasting Makeup Setting Spray',
        price: 33,
        originalPrice: 38,
        rating: 4.6,
        reviewCount: 23456,
        image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 13,
        brand: 'Urban Decay'
      },
      {
        id: 'be11',
        title: 'Glossier Boy Brow Eyebrow Fluffing Hair Gel - Brown Universal Shade',
        price: 18,
        originalPrice: 20,
        rating: 4.4,
        reviewCount: 34567,
        image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 10,
        brand: 'Glossier'
      },
      {
        id: 'be12',
        title: 'Sunday Riley Good Genes All-In-One Lactic Acid Treatment 30ml',
        price: 122,
        originalPrice: 144,
        rating: 4.5,
        reviewCount: 8901,
        image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 15,
        brand: 'Sunday Riley'
      }
    ],
    solar: [
      {
        id: 'so1',
        title: 'Renogy 100 Watt 12 Volt Monocrystalline Solar Panel - High Efficiency',
        price: 109,
        originalPrice: 149,
        rating: 4.7,
        reviewCount: 12456,
        image: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 27,
        brand: 'Renogy'
      },
      {
        id: 'so2',
        title: 'Goal Zero Yeti 1500X Portable Power Station - Solar Generator',
        price: 1999,
        originalPrice: 2299,
        rating: 4.6,
        reviewCount: 8934,
        image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 13,
        brand: 'Goal Zero'
      },
      {
        id: 'so3',
        title: 'AIMS Power 1500W Pure Sine Wave Inverter - 12V DC to AC Converter',
        price: 299,
        originalPrice: 399,
        rating: 4.4,
        reviewCount: 5672,
        image: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 25,
        brand: 'AIMS Power'
      },
      {
        id: 'so4',
        title: 'Battle Born 100Ah 12V LiFePO4 Deep Cycle Battery - Solar Ready',
        price: 949,
        originalPrice: 1099,
        rating: 4.8,
        reviewCount: 3456,
        image: 'https://images.unsplash.com/photo-1593941707874-ef25b8b4a92b?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 14,
        brand: 'Battle Born'
      },
      {
        id: 'so5',
        title: 'Victron Energy SmartSolar MPPT 100/20 Solar Charge Controller',
        price: 159,
        originalPrice: 199,
        rating: 4.7,
        reviewCount: 7890,
        image: 'https://images.unsplash.com/photo-1624970622108-b4d7ab11b8d0?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 20,
        brand: 'Victron Energy'
      },
      {
        id: 'so6',
        title: 'ECO-WORTHY 400W Solar Panel Kit Complete Off Grid System',
        price: 449,
        originalPrice: 599,
        rating: 4.5,
        reviewCount: 9876,
        image: 'https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 25,
        brand: 'ECO-WORTHY'
      },
      {
        id: 'so7',
        title: 'Jackery SolarSaga 100W Portable Solar Panel for Power Station',
        price: 199,
        originalPrice: 249,
        rating: 4.6,
        reviewCount: 15678,
        image: 'https://images.unsplash.com/photo-1497440001374-f26997328c1b?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 20,
        brand: 'Jackery'
      },
      {
        id: 'so8',
        title: 'WindyNation 200W Solar Panel Kit with PWM Charge Controller',
        price: 249,
        originalPrice: 329,
        rating: 4.3,
        reviewCount: 6789,
        image: 'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 24,
        brand: 'WindyNation'
      },
      {
        id: 'so9',
        title: 'Grape Solar 300W Monocrystalline Solar Panel - Residential Grade',
        price: 319,
        originalPrice: 399,
        rating: 4.5,
        reviewCount: 4321,
        image: 'https://images.unsplash.com/photo-1562583489-bf23ec64651c?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 20,
        brand: 'Grape Solar'
      },
      {
        id: 'so10',
        title: 'SUNER POWER 12V Solar Car Battery Charger & Maintainer',
        price: 39.99,
        originalPrice: 59.99,
        rating: 4.4,
        reviewCount: 12345,
        image: 'https://images.unsplash.com/photo-1541123603104-512919d6a96c?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 33,
        brand: 'SUNER POWER'
      },
      {
        id: 'so11',
        title: 'ALLPOWERS 100W Flexible Solar Panel for RV Boat Marine',
        price: 129,
        originalPrice: 179,
        rating: 4.2,
        reviewCount: 8765,
        image: 'https://images.unsplash.com/photo-1475224937481-993c881e3c05?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 28,
        brand: 'ALLPOWERS'
      },
      {
        id: 'so12',
        title: 'Nature Power 180W Monocrystalline Solar Panel with Aluminum Frame',
        price: 189,
        originalPrice: 239,
        rating: 4.6,
        reviewCount: 5432,
        image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 21,
        brand: 'Nature Power'
      },
      {
        id: 'so13',
        title: 'BLUETTI AC200P 2000Wh Portable Power Station Solar Generator',
        price: 1699,
        originalPrice: 1999,
        rating: 4.7,
        reviewCount: 6789,
        image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 15,
        brand: 'BLUETTI'
      },
      {
        id: 'so14',
        title: 'Renogy Wanderer 30A 12V/24V PWM Solar Charge Controller',
        price: 49.99,
        originalPrice: 69.99,
        rating: 4.5,
        reviewCount: 9876,
        image: 'https://images.unsplash.com/photo-1624970622108-b4d7ab11b8d0?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 29,
        brand: 'Renogy'
      },
      {
        id: 'so15',
        title: 'EF ECOFLOW River 2 Pro Portable Power Station 768Wh Solar Compatible',
        price: 649,
        originalPrice: 799,
        rating: 4.6,
        reviewCount: 11234,
        image: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 19,
        brand: 'EF ECOFLOW'
      },
      {
        id: 'so16',
        title: 'AIMS 600W Peak 300W RMS Pure Sine Wave Power Inverter',
        price: 159,
        originalPrice: 199,
        rating: 4.3,
        reviewCount: 7654,
        image: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 20,
        brand: 'AIMS'
      },
      {
        id: 'so17',
        title: 'BougeRV 170W 12V Monocrystalline Solar Panel for Off Grid',
        price: 149,
        originalPrice: 199,
        rating: 4.4,
        reviewCount: 4567,
        image: 'https://images.unsplash.com/photo-1559733337-edf0ac062749?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 25,
        brand: 'BougeRV'
      },
      {
        id: 'so18',
        title: 'Mighty Max Battery 12V 100Ah LiFePO4 Deep Cycle Solar Battery',
        price: 469,
        originalPrice: 599,
        rating: 4.5,
        reviewCount: 8901,
        image: 'https://images.unsplash.com/photo-1593941707874-ef25b8b4a92b?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 22,
        brand: 'Mighty Max Battery'
      },
      {
        id: 'so19',
        title: 'DOKIO 100W Foldable Solar Panel Kit with Solar Controller',
        price: 179,
        originalPrice: 229,
        rating: 4.2,
        reviewCount: 6543,
        image: 'https://images.unsplash.com/photo-1475224937481-993c881e3c05?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 22,
        brand: 'DOKIO'
      },
      {
        id: 'so20',
        title: 'WEIZE 12V 100AH Deep Cycle AGM SLA VRLA Battery for Solar',
        price: 199,
        originalPrice: 249,
        rating: 4.6,
        reviewCount: 12678,
        image: 'https://images.unsplash.com/photo-1604077198496-8da17768c0d9?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 20,
        brand: 'WEIZE'
      },
      {
        id: 'so21',
        title: 'Newpowa 200W Monocrystalline Solar Panel 200 Watt 12V',
        price: 199,
        originalPrice: 259,
        rating: 4.4,
        reviewCount: 7890,
        image: 'https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 23,
        brand: 'Newpowa'
      },
      {
        id: 'so22',
        title: 'EPEVER 60A MPPT Solar Charge Controller 12V/24V Auto',
        price: 129,
        originalPrice: 169,
        rating: 4.7,
        reviewCount: 9432,
        image: 'https://images.unsplash.com/photo-1624970622108-b4d7ab11b8d0?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 24,
        brand: 'EPEVER'
      },
      {
        id: 'so23',
        title: 'Portable Solar Panel 120W Foldable Solar Charger for Camping',
        price: 229,
        originalPrice: 299,
        rating: 4.3,
        reviewCount: 5678,
        image: 'https://images.unsplash.com/photo-1497440001374-f26997328c1b?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 23,
        brand: 'Portable Solar'
      },
      {
        id: 'so24',
        title: 'Topsolar 100W Solar Panel Kit Complete 12V Solar System',
        price: 159,
        originalPrice: 219,
        rating: 4.5,
        reviewCount: 8765,
        image: 'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 27,
        brand: 'Topsolar'
      }
    ],
    pharmacy: [
      {
        id: 'ph1',
        title: 'Tylenol Extra Strength Pain Reliever - 500mg Caplets 100 Count',
        price: 12.99,
        originalPrice: 15.99,
        rating: 4.7,
        reviewCount: 23456,
        image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        isDeliveryTomorrow: true,
        discount: 19,
        brand: 'Tylenol'
      },
      {
        id: 'ph2',
        title: 'Advil Liqui-Gels Pain Reliever and Fever Reducer - 200mg 80 Count',
        price: 14.49,
        originalPrice: 17.99,
        rating: 4.6,
        reviewCount: 18765,
        image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        isDeliveryTomorrow: true,
        discount: 19,
        brand: 'Advil'
      },
      {
        id: 'ph3',
        title: 'Claritin 24 Hour Allergy Relief - Non-Drowsy 30 Tablets',
        price: 19.99,
        originalPrice: 24.99,
        rating: 4.5,
        reviewCount: 15432,
        image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 20,
        brand: 'Claritin'
      },
      {
        id: 'ph4',
        title: 'Pepto-Bismol Original Liquid for Upset Stomach - 16 fl oz',
        price: 8.99,
        originalPrice: 11.49,
        rating: 4.4,
        reviewCount: 12345,
        image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 22,
        brand: 'Pepto-Bismol'
      },
      {
        id: 'ph5',
        title: 'Centrum Adult Multivitamin - 365 Count Complete Daily Vitamins',
        price: 24.99,
        originalPrice: 29.99,
        rating: 4.3,
        reviewCount: 34567,
        image: 'https://images.unsplash.com/photo-1550572017-edd951aa8f72?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 17,
        brand: 'Centrum'
      },
      {
        id: 'ph6',
        title: 'Benadryl Allergy Ultratabs - Antihistamine 100 Count',
        price: 11.99,
        originalPrice: 14.99,
        rating: 4.6,
        reviewCount: 8901,
        image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 20,
        brand: 'Benadryl'
      },
      {
        id: 'ph7',
        title: 'Tums Extra Strength Antacid Chewable Tablets - Assorted Fruit 96 Count',
        price: 7.99,
        originalPrice: 9.99,
        rating: 4.5,
        reviewCount: 16789,
        image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 20,
        brand: 'Tums'
      },
      {
        id: 'ph8',
        title: 'Robitussin DM Cough + Chest Congestion Relief - 8 fl oz',
        price: 9.49,
        originalPrice: 12.49,
        rating: 4.2,
        reviewCount: 7654,
        image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 24,
        brand: 'Robitussin'
      },
      {
        id: 'ph9',
        title: 'Metamucil Daily Fiber Supplement - Orange Smooth 72 Doses',
        price: 18.99,
        originalPrice: 22.99,
        rating: 4.4,
        reviewCount: 11234,
        image: 'https://images.unsplash.com/photo-1550572017-edd951aa8f72?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 17,
        brand: 'Metamucil'
      },
      {
        id: 'ph10',
        title: 'Sudafed PE Sinus Pressure + Pain Relief - 36 Caplets',
        price: 8.49,
        originalPrice: 10.99,
        rating: 4.1,
        reviewCount: 5432,
        image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 23,
        brand: 'Sudafed'
      },
      {
        id: 'ph11',
        title: 'Imodium A-D Anti-Diarrheal Caplets - 24 Count',
        price: 11.99,
        originalPrice: 14.49,
        rating: 4.3,
        reviewCount: 6789,
        image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 17,
        brand: 'Imodium'
      },
      {
        id: 'ph12',
        title: 'Aspirin 81mg Low Dose Enteric Coated Tablets - 365 Count',
        price: 9.99,
        originalPrice: 12.99,
        rating: 4.6,
        reviewCount: 19876,
        image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 23,
        brand: 'Bayer'
      },
      // Page 2 Pharmacy Products
      {
        id: 'ph13',
        title: 'Mucinex DM 12-Hour Expectorant and Cough Suppressant - 40 Tablets',
        price: 16.99,
        originalPrice: 21.99,
        rating: 4.4,
        reviewCount: 9876,
        image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 23,
        brand: 'Mucinex'
      },
      {
        id: 'ph14',
        title: 'Zyrtec 24 Hour Allergy Relief Tablets - 70 Count',
        price: 22.99,
        originalPrice: 27.99,
        rating: 4.5,
        reviewCount: 14567,
        image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 18,
        brand: 'Zyrtec'
      },
      {
        id: 'ph15',
        title: 'Prilosec OTC Acid Reducer - 42 Count Delayed Release Tablets',
        price: 19.99,
        originalPrice: 24.99,
        rating: 4.3,
        reviewCount: 12345,
        image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 20,
        brand: 'Prilosec'
      },
      {
        id: 'ph16',
        title: 'Flonase Allergy Relief Nasal Spray - 144 Metered Sprays',
        price: 17.49,
        originalPrice: 21.99,
        rating: 4.6,
        reviewCount: 8765,
        image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 20,
        brand: 'Flonase'
      },
      {
        id: 'ph17',
        title: 'Nature Made Vitamin D3 2000 IU Softgels - 250 Count',
        price: 14.99,
        originalPrice: 18.99,
        rating: 4.7,
        reviewCount: 23456,
        image: 'https://images.unsplash.com/photo-1550572017-edd951aa8f72?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 21,
        brand: 'Nature Made'
      },
      {
        id: 'ph18',
        title: 'Aleve Pain Reliever/Fever Reducer Caplets - 100 Count',
        price: 13.99,
        originalPrice: 16.99,
        rating: 4.5,
        reviewCount: 11234,
        image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 18,
        brand: 'Aleve'
      },
      {
        id: 'ph19',
        title: 'Pepcid AC Maximum Strength Acid Reducer - 50 Tablets',
        price: 15.49,
        originalPrice: 18.99,
        rating: 4.4,
        reviewCount: 7890,
        image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 18,
        brand: 'Pepcid'
      },
      {
        id: 'ph20',
        title: 'Dramamine Motion Sickness Relief - 36 Count Tablets',
        price: 8.99,
        originalPrice: 11.49,
        rating: 4.2,
        reviewCount: 5432,
        image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 22,
        brand: 'Dramamine'
      },
      {
        id: 'ph21',
        title: 'Glucosamine Chondroitin MSM Joint Support - 180 Capsules',
        price: 24.99,
        originalPrice: 29.99,
        rating: 4.3,
        reviewCount: 9876,
        image: 'https://images.unsplash.com/photo-1550572017-edd951aa8f72?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 17,
        brand: 'Nature\'s Bounty'
      },
      {
        id: 'ph22',
        title: 'Excedrin Extra Strength Headache Relief - 100 Caplets',
        price: 12.99,
        originalPrice: 15.99,
        rating: 4.6,
        reviewCount: 16789,
        image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 19,
        brand: 'Excedrin'
      },
      {
        id: 'ph23',
        title: 'Miralax Powder Laxative - 45 Dose Unflavored',
        price: 21.99,
        originalPrice: 26.99,
        rating: 4.4,
        reviewCount: 8765,
        image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 19,
        brand: 'Miralax'
      },
      {
        id: 'ph24',
        title: 'Allegra 24 Hour Allergy Relief - 90 Count Tablets',
        price: 26.99,
        originalPrice: 32.99,
        rating: 4.5,
        reviewCount: 12345,
        image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 18,
        brand: 'Allegra'
      },
      // Page 3 Pharmacy Products
      {
        id: 'ph25',
        title: 'Omega-3 Fish Oil 1000mg - 300 Softgels Heart Health Support',
        price: 19.99,
        originalPrice: 24.99,
        rating: 4.6,
        reviewCount: 18765,
        image: 'https://images.unsplash.com/photo-1550572017-edd951aa8f72?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 20,
        brand: 'Nordic Naturals'
      },
      {
        id: 'ph26',
        title: 'Probiotics 50 Billion CFU - 60 Capsules Digestive Health',
        price: 29.99,
        originalPrice: 39.99,
        rating: 4.4,
        reviewCount: 11234,
        image: 'https://images.unsplash.com/photo-1550572017-edd951aa8f72?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 25,
        brand: 'Garden of Life'
      },
      {
        id: 'ph27',
        title: 'Melatonin 10mg Sleep Aid - 60 Fast Dissolve Tablets',
        price: 9.99,
        originalPrice: 12.99,
        rating: 4.3,
        reviewCount: 15432,
        image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 23,
        brand: 'Natrol'
      },
      {
        id: 'ph28',
        title: 'Magnesium Glycinate 400mg - 120 Capsules Muscle & Sleep Support',
        price: 16.99,
        originalPrice: 21.99,
        rating: 4.5,
        reviewCount: 9876,
        image: 'https://images.unsplash.com/photo-1550572017-edd951aa8f72?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 23,
        brand: 'Doctor\'s Best'
      },
      {
        id: 'ph29',
        title: 'Turmeric Curcumin with BioPerine - 90 Capsules Anti-Inflammatory',
        price: 22.99,
        originalPrice: 27.99,
        rating: 4.4,
        reviewCount: 7654,
        image: 'https://images.unsplash.com/photo-1550572017-edd951aa8f72?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 18,
        brand: 'NatureWise'
      },
      {
        id: 'ph30',
        title: 'Zinc 50mg Immune Support - 250 Tablets',
        price: 12.99,
        originalPrice: 15.99,
        rating: 4.6,
        reviewCount: 13456,
        image: 'https://images.unsplash.com/photo-1550572017-edd951aa8f72?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 19,
        brand: 'Nature Made'
      },
      {
        id: 'ph31',
        title: 'Biotin 10000mcg Hair Skin Nails - 120 Softgels',
        price: 14.99,
        originalPrice: 18.99,
        rating: 4.3,
        reviewCount: 11234,
        image: 'https://images.unsplash.com/photo-1550572017-edd951aa8f72?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 21,
        brand: 'Nature\'s Bounty'
      },
      {
        id: 'ph32',
        title: 'CoQ10 100mg Coenzyme Q10 - 120 Softgels Heart Health',
        price: 24.99,
        originalPrice: 29.99,
        rating: 4.5,
        reviewCount: 8765,
        image: 'https://images.unsplash.com/photo-1550572017-edd951aa8f72?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 17,
        brand: 'Qunol'
      },
      {
        id: 'ph33',
        title: 'Elderberry Gummies Immune Support - 60 Count',
        price: 16.99,
        originalPrice: 21.99,
        rating: 4.4,
        reviewCount: 9876,
        image: 'https://images.unsplash.com/photo-1550572017-edd951aa8f72?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 23,
        brand: 'Sambucol'
      },
      {
        id: 'ph34',
        title: 'Apple Cider Vinegar Gummies - 60 Count Weight Management',
        price: 18.99,
        originalPrice: 23.99,
        rating: 4.2,
        reviewCount: 6789,
        image: 'https://images.unsplash.com/photo-1550572017-edd951aa8f72?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 21,
        brand: 'Goli'
      },
      {
        id: 'ph35',
        title: 'Collagen Peptides Powder Unflavored - 16 oz Skin & Joint Health',
        price: 29.99,
        originalPrice: 39.99,
        rating: 4.5,
        reviewCount: 14567,
        image: 'https://images.unsplash.com/photo-1550572017-edd951aa8f72?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 25,
        brand: 'Vital Proteins'
      },
      {
        id: 'ph36',
        title: 'Ashwagandha 1300mg Stress Relief - 120 Capsules',
        price: 19.99,
        originalPrice: 24.99,
        rating: 4.3,
        reviewCount: 10234,
        image: 'https://images.unsplash.com/photo-1550572017-edd951aa8f72?w=300&h=300&fit=crop&crop=center',
        isPrime: true,
        discount: 20,
        brand: 'KSM-66'
      }
    ]
  };

  const products = categoryProducts[categorySlug as keyof typeof categoryProducts] || categoryProducts.electronics;

  const categoryBrands = {
    electronics: ['Apple', 'Sony', 'Samsung', 'Dell', 'Bose', 'Canon', 'Nintendo', 'LG', 'Microsoft', 'AMD', 'NVIDIA'],
    fashion: ["Levi's", 'Nike', 'Zara', 'Adidas', 'H&M', 'Ray-Ban', 'Guess', 'Calvin Klein', 'Converse', 'Coach', 'Tommy Hilfiger', 'Michael Kors'],
    books: ['Atria Books', 'Avery', 'G.P. Putnam\'s Sons', 'Harriman House', 'Random House', 'Celadon Books', 'Crown', 'Viking', 'Signet Classics', 'HarperOne', 'Arthur A. Levine Books', 'Harper'],
    home: ['Instant Pot', 'KitchenAid', 'Ninja', 'Shark', 'Brookstone', 'Philips', 'Dyson', 'Cuisinart', 'Greener Chef', 'Lodge', 'Rubbermaid', 'Honeywell'],
    sports: ['Fitbit', 'Nike', 'Bowflex', 'Adidas', 'Yeti', 'Wilson', 'Coleman', 'Under Armour', 'Spalding', 'RTIC', 'TRX', 'Garmin'],
    grocery: ['Organic', 'Fresh', 'Whole Foods', 'General Mills', 'Butterball', 'Fage', 'Wild Planet', 'Lundberg', 'Justin\'s', 'Vital Farms', 'Driscoll\'s'],
    appliances: ['Instant Pot', 'Ninja', 'Keurig', 'Cuisinart', 'Hamilton Beach', 'Black+Decker', 'Vitamix', 'Breville', 'KitchenAid', 'Oster', 'Crock-Pot'],
    beauty: ['CeraVe', 'The Ordinary', 'Maybelline', 'Neutrogena', 'L\'Oreal Paris', 'Fenty Beauty', 'Olaplex', 'Rare Beauty', 'Drunk Elephant', 'Urban Decay', 'Glossier', 'Sunday Riley'],
    solar: ['Renogy', 'Goal Zero', 'AIMS Power', 'Battle Born', 'Victron Energy', 'ECO-WORTHY', 'Jackery', 'WindyNation', 'Grape Solar', 'SUNER POWER', 'ALLPOWERS', 'Nature Power', 'BLUETTI', 'EF ECOFLOW', 'AIMS', 'BougeRV', 'Mighty Max Battery', 'DOKIO', 'WEIZE', 'Newpowa', 'EPEVER', 'Portable Solar', 'Topsolar'],
    pharmacy: ['Tylenol', 'Advil', 'Claritin', 'Pepto-Bismol', 'Centrum', 'Benadryl', 'Tums', 'Robitussin', 'Metamucil', 'Sudafed', 'Imodium', 'Aspirin', 'Bayer', 'Mucinex', 'Zyrtec', 'Prilosec', 'Flonase', 'Nature Made', 'Aleve', 'Pepcid', 'Dramamine', 'Nature\'s Bounty', 'Excedrin', 'Miralax', 'Allegra', 'Nordic Naturals', 'Garden of Life', 'Natrol', 'Doctor\'s Best', 'NatureWise', 'Nordic Naturals', 'Goli', 'Vital Proteins', 'KSM-66']
  };

  const brands = categoryBrands[categorySlug as keyof typeof categoryBrands] || categoryBrands.electronics;

  const toggleBrand = (brand: string) => {
    setSelectedBrands(prev =>
      prev.includes(brand)
        ? prev.filter(b => b !== brand)
        : [...prev, brand]
    );
  };

  const clearFilters = () => {
    setSelectedBrands([]);
    setMinRating(0);
    setPriceRange([0, 2000]);
    setSortBy('featured');
    setCurrentPage(1);
  };

  const filteredAndSortedProducts = useMemo(() => {
    let filtered = products.filter(product => {
      const priceInRange = product.price >= priceRange[0] && product.price <= priceRange[1];
      const brandMatches = selectedBrands.length === 0 || selectedBrands.includes(product.brand);
      const ratingMatches = minRating === 0 || product.rating >= minRating;
      return priceInRange && brandMatches && ratingMatches;
    });

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
        filtered.sort((a, b) => b.reviewCount - a.reviewCount);
        break;
      case 'featured':
      default:
        break;
    }

    return filtered;
  }, [products, priceRange, selectedBrands, minRating, sortBy]);

  const totalPages = Math.ceil(filteredAndSortedProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProducts = filteredAndSortedProducts.slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderPagination = () => {
    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    if (startPage > 1) {
      pages.push(
        <button
          key={1}
          onClick={() => goToPage(1)}
          className="px-3 py-2 border rounded hover:bg-gray-50"
        >
          1
        </button>
      );
      if (startPage > 2) {
        pages.push(
          <span key="ellipsis1" className="px-3 py-2 text-gray-500">
            ...
          </span>
        );
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => goToPage(i)}
          className={`px-3 py-2 border rounded ${i === currentPage ? 'bg-blue-500 text-white border-blue-500' : 'hover:bg-gray-50'}`}
        >
          {i}
        </button>
      );
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(
          <span key="ellipsis2" className="px-3 py-2 text-gray-500">
            ...
          </span>
        );
      }
      pages.push(
        <button
          key={totalPages}
          onClick={() => goToPage(totalPages)}
          className="px-3 py-2 border rounded hover:bg-gray-50"
        >
          {totalPages}
        </button>
      );
    }

    return pages;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="relative mb-6">
        <div
          className="h-48 bg-cover bg-center relative"
          style={{ backgroundImage: `url(${currentCategory.image})` }}
        >
          <div className="absolute inset-0 bg-black bg-opacity-50"></div>
          <div className="relative z-10 flex items-center justify-center h-full text-center text-white">
            <div>
              <h1 className="text-4xl font-bold mb-2">{currentCategory.title}</h1>
              <p className="text-xl">{currentCategory.description}</p>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          <aside className="lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm border p-6 sticky top-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-gray-900">Filters</h2>
                <button
                  onClick={clearFilters}
                  className="text-blue-600 hover:underline text-sm"
                >
                  Clear all
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Price Range</h3>
                  <div className="space-y-2">
                    <input
                      type="range"
                      min="0"
                      max="2000"
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>${priceRange[0]}</span>
                      <span>${priceRange[1]}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Brands</h3>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {brands.map(brand => (
                      <label key={brand} className="flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedBrands.includes(brand)}
                          onChange={() => toggleBrand(brand)}
                          className="mr-2"
                        />
                        <span className="text-sm">{brand}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Customer Rating</h3>
                  <div className="space-y-2">
                    {[4, 3, 2, 1].map(rating => (
                      <label key={rating} className="flex items-center cursor-pointer">
                        <input
                          type="radio"
                          name="rating"
                          value={rating}
                          checked={minRating === rating}
                          onChange={() => setMinRating(rating)}
                          className="mr-2"
                        />
                        <div className="flex items-center">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <i
                              key={star}
                              className={`w-4 h-4 flex items-center justify-center ${star <= rating ? 'ri-star-fill text-yellow-400' : 'ri-star-line text-gray-300'}`}
                            ></i>
                          ))}
                          <span className="ml-1 text-sm text-gray-600">& up</span>
                        </div>
                      </label>
                    ))}
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="rating"
                        value={0}
                        checked={minRating === 0}
                        onChange={() => setMinRating(0)}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-600">All Ratings</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          <div className="flex-1">
            <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Showing {startIndex + 1}-{Math.min(endIndex, filteredAndSortedProducts.length)} of {filteredAndSortedProducts.length} results for "{currentCategory.title}" (Page {currentPage} of {totalPages})
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
                      <option value="price-low">Price: Low to High</option>
                      <option value="price-high">Price: High to Low</option>
                      <option value="rating">Customer Rating</option>
                      <option value="newest">Newest Arrivals</option>
                    </select>
                  </div>

                  <div className="flex border rounded">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 ${viewMode === 'grid' ? 'bg-blue-500 text-white' : 'text-gray-600'}`}
                    >
                      <i className="ri-grid-line w-4 h-4 flex items-center justify-center"></i>
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 ${viewMode === 'list' ? 'bg-blue-500 text-white' : 'text-gray-600'}`}
                    >
                      <i className="ri-list-unordered w-4 h-4 flex items-center justify-center"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {currentProducts.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
                <div className="text-gray-500 mb-4">
                  <i className="ri-search-line text-4xl"></i>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-600 mb-4">
                  Try adjusting your filters or search criteria to find what you're looking for.
                </p>
                <button
                  onClick={clearFilters}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md whitespace-nowrap"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
                {currentProducts.map(product => (
                  <div key={product.id} className={viewMode === 'list' ? 'bg-white rounded-lg shadow-sm border p-4' : ''}>
                    {viewMode === 'list' ? (
                      <div className="flex space-x-4">
                        <div className="w-32 h-32 flex-shrink-0">
                          <img
                            src={product.image}
                            alt={product.title}
                            className="w-full h-full object-cover rounded"
                          />
                        </div>
                        <div className="flex-1 space-y-2">
                          <h3 className="text-lg font-medium text-gray-900 hover:text-blue-600 cursor-pointer">
                            {product.title}
                          </h3>
                          <div className="flex items-center space-x-1">
                            <div className="flex items-center">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <i
                                  key={star}
                                  className={`w-4 h-4 flex items-center justify-center ${star <= Math.floor(product.rating) ? 'ri-star-fill text-yellow-400' : 'ri-star-line text-gray-300'}`}
                                ></i>
                              ))}
                            </div>
                            <span className="text-sm text-gray-600">({product.reviewCount})</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-xl font-bold text-gray-900">${product.price}</span>
                            {product.originalPrice && product.originalPrice > product.price && (
                              <span className="text-sm text-gray-500 line-through">${product.originalPrice}</span>
                            )}
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
                          </div>
                        </div>
                      </div>
                    ) : (
                      <ProductCard {...product} />
                    )}
                  </div>
                ))}
              </div>
            )}

            {totalPages > 1 && (
              <div className="mt-8 flex justify-center">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => goToPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-2 border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>

                  {renderPagination()}

                  <button
                    onClick={() => goToPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

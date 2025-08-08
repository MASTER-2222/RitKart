// RitZone Electronics Category Migration Script
// ==============================================
// Migrates hardcoded Electronics products from CategoryListing.tsx to database

const { productService, categoryService } = require('../backend/services/supabase-service');

// Hardcoded Electronics products from CategoryListing.tsx (36 products)
const electronicsProducts = [
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
];

// Helper function to convert product format for database
const convertProductForDatabase = (product, categoryId) => {
  return {
    name: product.title,
    slug: product.title.toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim(),
    description: `${product.title} - ${product.brand ? `${product.brand} brand. ` : ''}Premium quality product with ${product.rating} star rating from ${product.reviewCount} customer reviews.`,
    short_description: `${product.brand ? `${product.brand} ` : ''}${product.title.substring(0, 100)}`,
    sku: `${product.brand?.toUpperCase() || 'ELEC'}-${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
    price: product.price,
    original_price: product.originalPrice,
    category_id: categoryId,
    brand: product.brand || 'Generic',
    stock_quantity: Math.floor(Math.random() * 100) + 10, // Random stock between 10-109
    is_active: true,
    is_featured: product.isPrime || false,
    images: [product.image],
    features: product.brand ? [product.brand, 'Premium Quality', 'Fast Shipping'] : ['Premium Quality', 'Fast Shipping'],
    specifications: {
      brand: product.brand || 'Generic',
      rating: product.rating,
      reviews: product.reviewCount,
      prime: product.isPrime,
      delivery: product.isDeliveryTomorrow
    },
    rating_average: product.rating,
    rating_count: Math.floor(product.reviewCount / 10),
    total_reviews: product.reviewCount
  };
};

// Main migration function
const migrateElectronicsProducts = async () => {
  try {
    console.log('🚀 Starting Electronics Products Migration...');
    
    // Get electronics category ID
    const categoriesResult = await categoryService.getAllCategories();
    if (!categoriesResult.success) {
      throw new Error('Failed to get categories');
    }
    
    const electronicsCategory = categoriesResult.categories.find(cat => cat.slug === 'electronics');
    if (!electronicsCategory) {
      throw new Error('Electronics category not found');
    }
    
    console.log(`📂 Found Electronics category: ${electronicsCategory.id}`);
    
    // Migrate each product
    let successCount = 0;
    let failureCount = 0;
    
    for (let i = 0; i < electronicsProducts.length; i++) {
      const product = electronicsProducts[i];
      console.log(`⏳ Migrating product ${i + 1}/${electronicsProducts.length}: ${product.title.substring(0, 50)}...`);
      
      try {
        const databaseProduct = convertProductForDatabase(product, electronicsCategory.id);
        const result = await productService.createProduct(databaseProduct);
        
        if (result.success) {
          console.log(`✅ Product ${i + 1} migrated successfully: ${result.product.id}`);
          successCount++;
        } else {
          console.error(`❌ Failed to migrate product ${i + 1}: ${result.error}`);
          failureCount++;
        }
      } catch (error) {
        console.error(`❌ Error migrating product ${i + 1}:`, error.message);
        failureCount++;
      }
      
      // Small delay to avoid overwhelming the API
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('🎉 Electronics Products Migration Completed!');
    console.log('='.repeat(60));
    console.log(`✅ Successfully migrated: ${successCount} products`);
    console.log(`❌ Failed migrations: ${failureCount} products`);
    console.log(`📊 Success rate: ${((successCount / electronicsProducts.length) * 100).toFixed(1)}%`);
    console.log('='.repeat(60));
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
  }
};

// Run migration
if (require.main === module) {
  migrateElectronicsProducts().then(() => {
    console.log('Migration script completed');
    process.exit(0);
  }).catch(error => {
    console.error('Migration script failed:', error);
    process.exit(1);
  });
}

module.exports = { migrateElectronicsProducts };
// RitZone Product Migration Script
// ==============================================
// Migrates static product data to Supabase database

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '/app/backend/.env' });

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Sample product data extracted from frontend
const sampleProducts = [
  {
    name: 'Apple MacBook Pro 14-inch M3 Chip',
    slug: 'apple-macbook-pro-14-m3',
    description: 'Apple MacBook Pro 14-inch M3 Chip with 8-Core CPU and 10-Core GPU, 512GB SSD Storage. The most advanced laptop for professionals.',
    short_description: 'MacBook Pro with M3 chip for professional workflows',
    sku: 'APPLE-MBP14-M3-512',
    price: 1599.00,
    original_price: 1999.00,
    category_slug: 'electronics',
    brand: 'Apple',
    stock_quantity: 25,
    is_featured: true,
    images: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&h=600&fit=crop&crop=center'],
    features: ['M3 Chip', '14-inch Display', '512GB SSD', '16GB RAM', 'Touch Bar'],
    specifications: {
      processor: 'M3 Chip with 8-Core CPU',
      memory: '16GB Unified Memory',
      storage: '512GB SSD',
      display: '14.2-inch Liquid Retina XDR',
      graphics: '10-Core GPU'
    }
  },
  {
    name: 'Sony WH-1000XM4 Wireless Headphones',
    slug: 'sony-wh-1000xm4-headphones',
    description: 'Sony WH-1000XM4 Wireless Premium Noise Canceling Overhead Headphones with Microphone, 30 hours battery life',
    short_description: 'Premium noise canceling wireless headphones',
    sku: 'SONY-WH1000XM4-BLK',
    price: 248.00,
    original_price: 349.99,
    category_slug: 'electronics',
    brand: 'Sony',
    stock_quantity: 45,
    is_featured: true,
    images: ['https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&h=600&fit=crop&crop=center'],
    features: ['Noise Canceling', '30hr Battery', 'Touch Controls', 'Voice Assistant'],
    specifications: {
      driver_unit: '40mm dome',
      frequency_response: '4Hz-40kHz',
      battery_life: '30 hours',
      charging_time: '3 hours',
      weight: '254g'
    }
  },
  {
    name: 'Samsung 65" Class 4K UHD Smart TV',
    slug: 'samsung-65-4k-uhd-smart-tv',
    description: 'Samsung 65" Class 4K UHD Smart LED TV with HDR, Crystal Display, and Samsung Tizen Smart TV Platform',
    short_description: '65-inch 4K Smart TV with HDR',
    sku: 'SAMSUNG-65-4K-LED',
    price: 547.99,
    original_price: 799.99,
    category_slug: 'electronics',
    brand: 'Samsung',
    stock_quantity: 15,
    is_featured: true,
    images: ['https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=800&h=600&fit=crop&crop=center'],
    features: ['4K Resolution', 'HDR10+', 'Smart TV', 'Voice Remote'],
    specifications: {
      screen_size: '65 inches',
      resolution: '3840 x 2160',
      display_type: 'LED',
      smart_platform: 'Tizen',
      hdmi_ports: '3'
    }
  },
  {
    name: 'iPhone 15 Pro Max 256GB',
    slug: 'iphone-15-pro-max-256gb',
    description: 'iPhone 15 Pro Max 256GB in Natural Titanium. Features A17 Pro chip, 48MP camera system, and USB-C.',
    short_description: 'Latest iPhone with titanium design',
    sku: 'IPHONE-15PM-256-TI',
    price: 1099.00,
    original_price: 1199.00,
    category_slug: 'electronics',
    brand: 'Apple',
    stock_quantity: 30,
    is_featured: true,
    images: ['https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&h=600&fit=crop&crop=center'],
    features: ['A17 Pro Chip', '48MP Camera', 'Titanium Design', 'USB-C'],
    specifications: {
      storage: '256GB',
      display: '6.7-inch Super Retina XDR',
      chip: 'A17 Pro',
      camera: '48MP Main + 12MP Ultra Wide + 12MP Telephoto',
      battery: 'Up to 29 hours video playback'
    }
  },
  {
    name: 'Nintendo Switch OLED Model',
    slug: 'nintendo-switch-oled-model',
    description: 'Nintendo Switch OLED Model with Neon Red and Neon Blue Joy-Con. Features enhanced 7-inch OLED screen.',
    short_description: 'Nintendo Switch with OLED display',
    sku: 'NINTENDO-SW-OLED-RB',
    price: 329.00,
    original_price: 349.99,
    category_slug: 'electronics',
    brand: 'Nintendo',
    stock_quantity: 40,
    is_featured: false,
    images: ['https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=800&h=600&fit=crop&crop=center'],
    features: ['7-inch OLED Screen', 'Enhanced Audio', 'Wide Stand', 'Dock with LAN Port'],
    specifications: {
      display: '7.0-inch OLED screen',
      resolution: '1280 x 720',
      storage: '64GB internal',
      battery: '4.5 - 9.0 hours',
      weight: '0.93 lbs'
    }
  },
  {
    name: 'Amazon Echo Dot (5th Gen)',
    slug: 'amazon-echo-dot-5th-gen',
    description: 'Amazon Echo Dot (5th Gen) with Alexa - Smart Speaker with improved bass and clearer vocals',
    short_description: 'Smart speaker with Alexa voice assistant',
    sku: 'AMAZON-ECHO-DOT-5',
    price: 29.99,
    original_price: 49.99,
    category_slug: 'electronics',
    brand: 'Amazon',
    stock_quantity: 100,
    is_featured: false,
    images: ['https://images.unsplash.com/photo-1518444065439-e933c06ce9cd?w=800&h=600&fit=crop&crop=center'],
    features: ['Alexa Voice Control', 'Improved Audio', 'Smart Home Hub', 'Compact Design'],
    specifications: {
      speaker: '1.73" driver',
      connectivity: 'Wi-Fi, Bluetooth',
      dimensions: '3.9" x 3.9" x 3.5"',
      weight: '10.7 oz'
    }
  },
  {
    name: 'Canon EOS R6 Mark II Camera',
    slug: 'canon-eos-r6-mark-ii',
    description: 'Canon EOS R6 Mark II Mirrorless Camera Body with 24.2MP full-frame CMOS sensor and advanced autofocus',
    short_description: 'Professional mirrorless camera body',
    sku: 'CANON-R6M2-BODY',
    price: 2499.00,
    original_price: 2699.00,
    category_slug: 'electronics',
    brand: 'Canon',
    stock_quantity: 8,
    is_featured: false,
    images: ['https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800&h=600&fit=crop&crop=center'],
    features: ['24.2MP Full-Frame', 'DIGIC X Processor', '4K Video', 'In-Body IS'],
    specifications: {
      sensor: '24.2MP Full-Frame CMOS',
      processor: 'DIGIC X',
      autofocus: '1053 AF points',
      video: '4K UHD at 60p',
      battery: 'LP-E6NH'
    }
  },
  {
    name: 'LG 27" UltraGear Gaming Monitor',
    slug: 'lg-27-ultragear-gaming-monitor',
    description: 'LG 27" UltraGear Gaming Monitor 4K UHD Nano IPS 1ms 144Hz with G-SYNC compatibility',
    short_description: '27-inch 4K gaming monitor with high refresh rate',
    sku: 'LG-27GP950-B',
    price: 449.99,
    original_price: 599.99,
    category_slug: 'electronics',
    brand: 'LG',
    stock_quantity: 20,
    is_featured: false,
    images: ['https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&h=600&fit=crop&crop=center'],
    features: ['4K Resolution', '144Hz Refresh', 'G-SYNC Compatible', '1ms Response'],
    specifications: {
      screen_size: '27 inches',
      resolution: '3840 x 2160',
      refresh_rate: '144Hz',
      response_time: '1ms',
      panel_type: 'Nano IPS'
    }
  },
  {
    name: 'Microsoft Surface Pro 9',
    slug: 'microsoft-surface-pro-9',
    description: 'Microsoft Surface Pro 9 - 13" Touch Screen, Intel i7, 16GB RAM, 512GB SSD, Windows 11',
    short_description: '2-in-1 laptop with touchscreen display',
    sku: 'MS-SP9-I7-16-512',
    price: 1399.00,
    original_price: 1599.99,
    category_slug: 'electronics',
    brand: 'Microsoft',
    stock_quantity: 12,
    is_featured: false,
    images: ['https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&h=600&fit=crop&crop=center'],
    features: ['13" PixelSense Display', 'Intel i7 Processor', 'All-Day Battery', 'Windows 11'],
    specifications: {
      processor: 'Intel Core i7',
      memory: '16GB LPDDR5',
      storage: '512GB SSD',
      display: '13" PixelSense (2880x1920)',
      battery: 'Up to 15.5 hours'
    }
  },
  {
    name: 'AMD Ryzen 9 5900X Processor',
    slug: 'amd-ryzen-9-5900x',
    description: 'AMD Ryzen 9 5900X 12-core 24-thread Desktop Processor with Zen 3 architecture',
    short_description: '12-core desktop processor for gaming and content creation',
    sku: 'AMD-5900X-BOX',
    price: 429.99,
    original_price: 549.99,
    category_slug: 'electronics',
    brand: 'AMD',
    stock_quantity: 18,
    is_featured: false,
    images: ['https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=800&h=600&fit=crop&crop=center'],
    features: ['12 Cores / 24 Threads', 'Zen 3 Architecture', '105W TDP', 'PCIe 4.0'],
    specifications: {
      cores: '12',
      threads: '24',
      base_clock: '3.7 GHz',
      boost_clock: 'Up to 4.8 GHz',
      cache: '70MB'
    }
  }
];

// Fashion products
const fashionProducts = [
  {
    name: 'Levi\'s 501 Original Jeans',
    slug: 'levis-501-original-jeans',
    description: 'The original blue jean since 1873. Levi\'s 501 Original Fit Jeans in classic stonewash blue.',
    short_description: 'Classic straight-fit blue jeans',
    sku: 'LEVIS-501-STONE-32-32',
    price: 59.99,
    original_price: 89.99,
    category_slug: 'fashion',
    brand: 'Levi\'s',
    stock_quantity: 50,
    is_featured: true,
    images: ['https://images.unsplash.com/photo-1542272454315-7ad9f9b1d63e?w=800&h=600&fit=crop&crop=center'],
    features: ['100% Cotton', 'Straight Fit', 'Button Fly', 'Classic 5-Pocket'],
    specifications: {
      material: '100% Cotton',
      fit: 'Original Fit',
      rise: 'Mid Rise',
      leg_opening: '16.5"'
    }
  },
  {
    name: 'Nike Air Max 270 Sneakers',
    slug: 'nike-air-max-270-sneakers',
    description: 'Nike Air Max 270 Men\'s Shoes with large Air unit for all-day comfort and modern style.',
    short_description: 'Comfortable lifestyle sneakers with Air Max technology',
    sku: 'NIKE-AM270-BLK-10',
    price: 129.99,
    original_price: 150.00,
    category_slug: 'fashion',
    brand: 'Nike',
    stock_quantity: 35,
    is_featured: true,
    images: ['https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&h=600&fit=crop&crop=center'],
    features: ['Air Max Cushioning', 'Mesh Upper', 'Rubber Outsole', 'Lightweight Design'],
    specifications: {
      upper: 'Mesh and synthetic materials',
      midsole: 'Foam with Air Max unit',
      outsole: 'Rubber with waffle pattern'
    }
  }
];

// Books
const bookProducts = [
  {
    name: 'The Psychology of Money',
    slug: 'psychology-of-money-book',
    description: 'The Psychology of Money by Morgan Housel - Timeless lessons on wealth, greed, and happiness.',
    short_description: 'Bestselling book about money and human behavior',
    sku: 'BOOK-POM-HOUSEL',
    price: 14.99,
    original_price: 18.99,
    category_slug: 'books',
    brand: 'Harriman House',
    stock_quantity: 75,
    is_featured: true,
    images: ['https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800&h=600&fit=crop&crop=center'],
    features: ['Paperback', '256 Pages', 'Bestseller', 'Financial Education'],
    specifications: {
      format: 'Paperback',
      pages: '256',
      publisher: 'Harriman House',
      language: 'English'
    }
  }
];

// Get category ID by slug
async function getCategoryId(slug) {
  const { data, error } = await supabase
    .from('categories')
    .select('id')
    .eq('slug', slug)
    .single();
  
  if (error) {
    console.error(`Error finding category ${slug}:`, error);
    return null;
  }
  
  return data.id;
}

// Insert products into database
async function migrateProducts() {
  console.log('🚀 Starting product migration...\n');
  
  const allProducts = [...sampleProducts, ...fashionProducts, ...bookProducts];
  let successCount = 0;
  let errorCount = 0;
  
  for (const product of allProducts) {
    try {
      console.log(`📦 Migrating: ${product.name}...`);
      
      // Get category ID
      const categoryId = await getCategoryId(product.category_slug);
      if (!categoryId) {
        console.error(`❌ Category not found: ${product.category_slug}`);
        errorCount++;
        continue;
      }
      
      // Prepare product data
      const productData = {
        name: product.name,
        slug: product.slug,
        description: product.description,
        short_description: product.short_description,
        sku: product.sku,
        price: product.price,
        original_price: product.original_price,
        category_id: categoryId,
        brand: product.brand,
        stock_quantity: product.stock_quantity,
        is_featured: product.is_featured || false,
        images: product.images || [],
        features: product.features || [],
        specifications: product.specifications || {}
      };
      
      // Insert product
      const { data, error } = await supabase
        .from('products')
        .insert(productData)
        .select();
      
      if (error) {
        console.error(`❌ Error inserting ${product.name}:`, error.message);
        errorCount++;
      } else {
        console.log(`✅ Successfully migrated: ${product.name}`);
        successCount++;
      }
      
    } catch (err) {
      console.error(`❌ Unexpected error with ${product.name}:`, err.message);
      errorCount++;
    }
    
    // Small delay to avoid overwhelming the database
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  console.log('\n' + '='.repeat(50));
  console.log('🎉 Product Migration Complete!');
  console.log(`✅ Successfully migrated: ${successCount} products`);
  console.log(`❌ Failed migrations: ${errorCount} products`);
  console.log('='.repeat(50));
}

// Run the migration
if (require.main === module) {
  migrateProducts()
    .then(() => {
      console.log('Migration script completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration script failed:', error);
      process.exit(1);
    });
}

module.exports = { migrateProducts, sampleProducts };
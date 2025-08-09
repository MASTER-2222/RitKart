const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || 'https://igzpodmmymbptmwebonh.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlnenBvZG1teW1icHRtd2Vib25oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1NDczNDIsImV4cCI6MjA3MDEyMzM0Mn0.eOy5F_0pE7ki3TXl49bW5c0K1TWGKf2_Vpn1IRKWQRc';

const supabase = createClient(supabaseUrl, supabaseKey);

// Fashion products from CategoryListing.tsx (f1-f36)
const fashionProducts = [
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
];

async function migrateFashionProducts() {
  console.log('🚀 Starting Fashion Products Migration...');
  console.log(`📦 Found ${fashionProducts.length} Fashion products to migrate`);

  // First, get the Fashion category ID
  const { data: categories, error: categoryError } = await supabase
    .from('categories')
    .select('id, name')
    .eq('slug', 'fashion')
    .single();

  if (categoryError) {
    console.error('❌ Error fetching Fashion category:', categoryError);
    return;
  }

  const fashionCategoryId = categories.id;
  console.log(`✅ Found Fashion category ID: ${fashionCategoryId}`);

  let successCount = 0;
  let failCount = 0;

  // Process each product
  for (let i = 0; i < fashionProducts.length; i++) {
    const product = fashionProducts[i];
    
    console.log(`\n📦 Migrating Product ${i + 1}/${fashionProducts.length}: ${product.title}`);

    // Create slug from title
    const slug = product.title.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .trim();

    // Prepare product data for database
    const productData = {
      name: product.title,
      slug: slug,
      description: `${product.title} - Premium quality fashion item from ${product.brand}`,
      short_description: `High-quality ${product.brand} fashion item with ${product.rating}-star rating`,
      sku: `${product.brand.replace(/\s+/g, '').toUpperCase()}-${product.id.toUpperCase()}-001`,
      price: product.price,
      original_price: product.originalPrice,
      category_id: fashionCategoryId,
      brand: product.brand,
      stock_quantity: Math.floor(Math.random() * 50) + 10, // Random stock 10-60
      low_stock_threshold: 5,
      is_active: true,
      is_featured: Math.random() > 0.7, // 30% chance of being featured
      rating: product.rating,
      review_count: product.reviewCount,
      images: [product.image],
      tags: ['fashion', product.brand.toLowerCase()],
      discount_percentage: product.discount,
      is_prime: product.isPrime,
      is_delivery_tomorrow: product.isDeliveryTomorrow || false
    };

    try {
      const { data, error } = await supabase
        .from('products')
        .insert([productData])
        .select();

      if (error) {
        console.error(`❌ Error inserting ${product.title}:`, error.message);
        failCount++;
      } else {
        console.log(`✅ Successfully migrated: ${product.title}`);
        successCount++;
      }
    } catch (err) {
      console.error(`❌ Exception while inserting ${product.title}:`, err);
      failCount++;
    }

    // Add small delay to prevent overwhelming the database
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log('\n🎉 Fashion Products Migration Complete!');
  console.log(`✅ Successfully migrated: ${successCount} products`);
  console.log(`❌ Failed to migrate: ${failCount} products`);
  console.log(`📊 Total processed: ${successCount + failCount} products`);

  // Verify migration by checking total Fashion products
  const { data: fashionCount, error: countError } = await supabase
    .from('products')
    .select('id', { count: 'exact' })
    .eq('category_id', fashionCategoryId);

  if (!countError) {
    console.log(`\n📈 Total Fashion products in database: ${fashionCount.length || 0}`);
  }
}

// Run the migration
if (require.main === module) {
  migrateFashionProducts()
    .then(() => {
      console.log('\n✅ Migration script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Migration script failed:', error);
      process.exit(1);
    });
}

module.exports = { migrateFashionProducts };
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || 'https://igzpodmmymbptmwebonh.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlnenBvZG1teW1icHRtd2Vib25oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1NDczNDIsImV4cCI6MjA3MDEyMzM0Mn0.eOy5F_0pE7ki3TXl49bW5c0K1TWGKf2_Vpn1IRKWQRc';

const supabase = createClient(supabaseUrl, supabaseKey);

// Home & Garden products from CategoryListing.tsx (h1-h36)
const homeProducts = [
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
    image: 'https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=300&h=300&fit=crop&crop=center',
    isPrime: true,
    discount: 33,
    brand: 'Greener Chef'
  },
  {
    id: 'h10',
    title: 'Lodge Cast Iron Dutch Oven with Dual Handles - 5 Quart Enameled',
    price: 59.95,
    originalPrice: 89.95,
    rating: 4.7,
    reviewCount: 23456,
    image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=300&h=300&fit=crop&crop=center',
    isPrime: true,
    discount: 33,
    brand: 'Lodge'
  },
  {
    id: 'h11',
    title: 'Rubbermaid Brilliance Food Storage Containers with Lids - 10 Piece Set',
    price: 49.99,
    originalPrice: 69.99,
    rating: 4.5,
    reviewCount: 45678,
    image: 'https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=300&h=300&fit=crop&crop=center',
    isPrime: true,
    discount: 29,
    brand: 'Rubbermaid'
  },
  {
    id: 'h12',
    title: 'Honeywell HPA300 True HEPA Air Purifier for Large Rooms',
    price: 249,
    originalPrice: 299,
    rating: 4.4,
    reviewCount: 34567,
    image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=300&h=300&fit=crop&crop=center',
    isPrime: true,
    discount: 17,
    brand: 'Honeywell'
  },
  {
    id: 'h13',
    title: 'Black+Decker 4-Slice Toaster Oven with Natural Convection - Black',
    price: 44.99,
    originalPrice: 59.99,
    rating: 4.2,
    reviewCount: 56789,
    image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=300&h=300&fit=crop&crop=center',
    isPrime: true,
    discount: 25,
    brand: 'Black+Decker'
  },
  {
    id: 'h14',
    title: 'Hamilton Beach FlexBrew Single Serve Coffee Maker - Black',
    price: 79.99,
    originalPrice: 99.99,
    rating: 4.3,
    reviewCount: 23456,
    image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&h=300&fit=crop&crop=center',
    isPrime: true,
    discount: 20,
    brand: 'Hamilton Beach'
  },
  {
    id: 'h15',
    title: 'Oxo Good Grips 3-Piece Mixing Bowl Set - Stainless Steel',
    price: 34.99,
    originalPrice: 49.99,
    rating: 4.6,
    reviewCount: 78901,
    image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=300&h=300&fit=crop&crop=center',
    isPrime: true,
    discount: 30,
    brand: 'OXO'
  },
  {
    id: 'h16',
    title: 'Crock-Pot 6-Quart Cook & Carry Programmable Slow Cooker - Red',
    price: 49.99,
    originalPrice: 69.99,
    rating: 4.4,
    reviewCount: 45678,
    image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=300&h=300&fit=crop&crop=center',
    isPrime: true,
    discount: 29,
    brand: 'Crock-Pot'
  },
  {
    id: 'h17',
    title: 'Breville Smart Oven Compact Convection - Stainless Steel',
    price: 199.95,
    originalPrice: 249.95,
    rating: 4.5,
    reviewCount: 23456,
    image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=300&h=300&fit=crop&crop=center',
    isPrime: true,
    discount: 20,
    brand: 'Breville'
  },
  {
    id: 'h18',
    title: 'Oster Beehive Blender 2-Speed with Glass Jar - Chrome',
    price: 34.99,
    originalPrice: 49.99,
    rating: 4.2,
    reviewCount: 56789,
    image: 'https://images.unsplash.com/photo-1570197788417-0e82375c9371?w=300&h=300&fit=crop&crop=center',
    isPrime: true,
    discount: 30,
    brand: 'Oster'
  },
  {
    id: 'h19',
    title: 'Pyrex Simply Store Glass Food Storage Set - 18 Piece',
    price: 39.99,
    originalPrice: 59.99,
    rating: 4.6,
    reviewCount: 78901,
    image: 'https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=300&h=300&fit=crop&crop=center',
    isPrime: true,
    discount: 33,
    brand: 'Pyrex'
  },
  {
    id: 'h20',
    title: 'All-Clad Stainless Steel Tri-Ply Cookware Set - 10 Piece',
    price: 399.95,
    originalPrice: 499.95,
    rating: 4.8,
    reviewCount: 12345,
    image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=300&h=300&fit=crop&crop=center',
    isPrime: true,
    discount: 20,
    brand: 'All-Clad'
  },
  {
    id: 'h21',
    title: 'Zojirushi Neuro Fuzzy Rice Cooker & Warmer - 5.5 Cup White',
    price: 179.95,
    originalPrice: 229.95,
    rating: 4.7,
    reviewCount: 34567,
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=300&h=300&fit=crop&crop=center',
    isPrime: true,
    discount: 22,
    brand: 'Zojirushi'
  },
  {
    id: 'h22',
    title: 'Vitamix A3500 Ascent Series Smart Blender - Black Stainless',
    price: 499.95,
    originalPrice: 599.95,
    rating: 4.6,
    reviewCount: 23456,
    image: 'https://images.unsplash.com/photo-1570197788417-0e82375c9371?w=300&h=300&fit=crop&crop=center',
    isPrime: true,
    discount: 17,
    brand: 'Vitamix'
  },
  {
    id: 'h23',
    title: 'Ninja Woodfire Outdoor Grill - 7-in-1 Master Grill BBQ Smoker',
    price: 369.99,
    originalPrice: 449.99,
    rating: 4.5,
    reviewCount: 45678,
    image: 'https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=300&h=300&fit=crop&crop=center',
    isPrime: true,
    discount: 18,
    brand: 'Ninja'
  },
  {
    id: 'h24',
    title: 'Bissell CrossWave Pet Pro All-in-One Wet Dry Vacuum',
    price: 229.99,
    originalPrice: 279.99,
    rating: 4.3,
    reviewCount: 56789,
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=300&fit=crop&crop=center',
    isPrime: true,
    discount: 18,
    brand: 'Bissell'
  },
  {
    id: 'h25',
    title: 'Weber Spirit II E-210 2-Burner Gas Grill - Black',
    price: 449,
    originalPrice: 549,
    rating: 4.4,
    reviewCount: 78901,
    image: 'https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=300&h=300&fit=crop&crop=center',
    isPrime: true,
    discount: 18,
    brand: 'Weber'
  },
  {
    id: 'h26',
    title: 'Keurig K-Elite Single Serve Coffee Maker - Brushed Silver',
    price: 169.99,
    originalPrice: 199.99,
    rating: 4.2,
    reviewCount: 23456,
    image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&h=300&fit=crop&crop=center',
    isPrime: true,
    discount: 15,
    brand: 'Keurig'
  },
  {
    id: 'h27',
    title: 'Nespresso VertuoPlus Coffee and Espresso Machine - Gray',
    price: 179.99,
    originalPrice: 229.99,
    rating: 4.5,
    reviewCount: 45678,
    image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&h=300&fit=crop&crop=center',
    isPrime: true,
    discount: 22,
    brand: 'Nespresso'
  },
  {
    id: 'h28',
    title: 'Traeger Pro 575 Wood Pellet Grill and Smoker - Bronze',
    price: 799,
    originalPrice: 999,
    rating: 4.6,
    reviewCount: 34567,
    image: 'https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=300&h=300&fit=crop&crop=center',
    isPrime: true,
    discount: 20,
    brand: 'Traeger'
  },
  {
    id: 'h29',
    title: 'Roomba i7+ Robot Vacuum with Clean Base Automatic Dirt Disposal',
    price: 599,
    originalPrice: 799,
    rating: 4.4,
    reviewCount: 56789,
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=300&fit=crop&crop=center',
    isPrime: true,
    discount: 25,
    brand: 'iRobot'
  },
  {
    id: 'h30',
    title: 'Philips Air Fryer XXL with Twin TurboStar Technology - Black',
    price: 279.99,
    originalPrice: 349.99,
    rating: 4.5,
    reviewCount: 78901,
    image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=300&h=300&fit=crop&crop=center',
    isPrime: true,
    discount: 20,
    brand: 'Philips'
  },
  {
    id: 'h31',
    title: 'Levoit Core 300 Air Purifier with True HEPA Filter - White',
    price: 99.99,
    originalPrice: 129.99,
    rating: 4.4,
    reviewCount: 23456,
    image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=300&h=300&fit=crop&crop=center',
    isPrime: true,
    discount: 23,
    brand: 'Levoit'
  },
  {
    id: 'h32',
    title: 'Dyson Pure Cool Link Air Purifier and Fan - White/Silver',
    price: 399.99,
    originalPrice: 499.99,
    rating: 4.3,
    reviewCount: 45678,
    image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=300&h=300&fit=crop&crop=center',
    isPrime: true,
    discount: 20,
    brand: 'Dyson'
  },
  {
    id: 'h33',
    title: 'Blackstone 28" Outdoor Flat Top Gas Grill Griddle Station',
    price: 297,
    originalPrice: 397,
    rating: 4.6,
    reviewCount: 56789,
    image: 'https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=300&h=300&fit=crop&crop=center',
    isPrime: true,
    discount: 25,
    brand: 'Blackstone'
  },
  {
    id: 'h34',
    title: 'Shark IQ Robot Self-Empty XL RV1001AE Robotic Vacuum',
    price: 449.99,
    originalPrice: 599.99,
    rating: 4.2,
    reviewCount: 78901,
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=300&fit=crop&crop=center',
    isPrime: true,
    discount: 25,
    brand: 'Shark'
  },
  {
    id: 'h35',
    title: 'Tineco Pure One S12 Cordless Vacuum Cleaner - Blue/Gray',
    price: 149,
    originalPrice: 199,
    rating: 4.3,
    reviewCount: 23456,
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=300&fit=crop&crop=center',
    isPrime: true,
    discount: 25,
    brand: 'Tineco'
  },
  {
    id: 'h36',
    title: 'Rubbermaid 50-Gallon Roughneck Storage Container with Lid',
    price: 39.98,
    originalPrice: 54.98,
    rating: 4.4,
    reviewCount: 45678,
    image: 'https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=300&h=300&fit=crop&crop=center',
    isPrime: true,
    discount: 27,
    brand: 'Rubbermaid'
  }
];

async function migrateHomeProducts() {
  console.log('🏠 Starting Home & Garden Products Migration...');
  console.log(`📦 Found ${homeProducts.length} Home & Garden products to migrate`);

  // First, get the Home & Garden category ID
  const { data: categories, error: categoryError } = await supabase
    .from('categories')
    .select('id, name')
    .eq('slug', 'home')
    .single();

  if (categoryError) {
    console.error('❌ Error fetching Home & Garden category:', categoryError);
    return;
  }

  const homeCategoryId = categories.id;
  console.log(`✅ Found Home & Garden category ID: ${homeCategoryId}`);

  let successCount = 0;
  let failCount = 0;

  // Process each product
  for (let i = 0; i < homeProducts.length; i++) {
    const product = homeProducts[i];
    
    console.log(`\n🏠 Migrating Product ${i + 1}/${homeProducts.length}: ${product.title}`);

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
      description: `${product.title} - Premium quality home and garden item from ${product.brand}. Rating: ${product.rating}/5 stars with ${product.reviewCount} reviews. ${product.isPrime ? 'Prime eligible.' : ''} ${product.discount ? `Save ${product.discount}%!` : ''}`,
      short_description: `High-quality ${product.brand} home and garden item with ${product.rating}-star rating`,
      sku: `${product.brand.replace(/\s+/g, '').toUpperCase()}-${product.id.toUpperCase()}-001`,
      price: product.price,
      original_price: product.originalPrice,
      category_id: homeCategoryId,
      brand: product.brand,
      stock_quantity: Math.floor(Math.random() * 50) + 10, // Random stock 10-60
      low_stock_threshold: 5,
      is_active: true,
      is_featured: Math.random() > 0.7, // 30% chance of being featured
      rating_average: product.rating,
      rating_count: Math.floor(product.reviewCount / 10), // Approximation
      total_reviews: product.reviewCount,
      images: [product.image]
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

  console.log('\n🎉 Home & Garden Products Migration Complete!');
  console.log(`✅ Successfully migrated: ${successCount} products`);
  console.log(`❌ Failed to migrate: ${failCount} products`);
  console.log(`📊 Total processed: ${successCount + failCount} products`);

  // Verify migration by checking total Home & Garden products
  const { data: homeCount, error: countError } = await supabase
    .from('products')
    .select('id', { count: 'exact' })
    .eq('category_id', homeCategoryId);

  if (!countError) {
    console.log(`\n📈 Total Home & Garden products in database: ${homeCount.length || 0}`);
  }
}

// Run the migration
if (require.main === module) {
  migrateHomeProducts()
    .then(() => {
      console.log('\n✅ Migration script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Migration script failed:', error);
      process.exit(1);
    });
}

module.exports = { migrateHomeProducts };
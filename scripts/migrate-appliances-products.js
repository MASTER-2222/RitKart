const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || 'https://igzpodmmymbptmwebonh.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlnenBvZG1teW1icHRtd2Vib25oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1NDczNDIsImV4cCI6MjA3MDEyMzM0Mn0.eOy5F_0pE7ki3TXl49bW5c0K1TWGKf2_Vpn1IRKWQRc';

const supabase = createClient(supabaseUrl, supabaseKey);

// Appliances products from CategoryListing.tsx (a1-a36) - ALL 36 PRODUCTS
const appliancesProducts = [
  {
    id: 'a1',
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
    image: 'https://images.unsplash.com/photo-1544233726-9f1d2b27be8b?w=300&h=300&fit=crop&crop=center',
    isPrime: true,
    discount: 25,
    brand: 'Crock-Pot'
  },
  {
    id: 'a13',
    title: 'Nespresso VertuoPlus Coffee and Espresso Maker - Matte Black',
    price: 179,
    originalPrice: 219,
    rating: 4.4,
    reviewCount: 34567,
    image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&h=300&fit=crop&crop=center',
    isPrime: true,
    discount: 18,
    brand: 'Nespresso'
  },
  {
    id: 'a14',
    title: 'Braun MultiQuick Hand Blender - 9-Speed Immersion Blender',
    price: 69.99,
    originalPrice: 89.99,
    rating: 4.6,
    reviewCount: 23456,
    image: 'https://images.unsplash.com/photo-1570197788417-0e82375c9371?w=300&h=300&fit=crop&crop=center',
    isPrime: true,
    discount: 22,
    brand: 'Braun'
  },
  {
    id: 'a15',
    title: 'Panasonic Countertop Microwave - 1.3 Cu Ft Inverter Technology',
    price: 149,
    originalPrice: 189,
    rating: 4.5,
    reviewCount: 15678,
    image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=300&h=300&fit=crop&crop=center',
    isPrime: true,
    discount: 21,
    brand: 'Panasonic'
  },
  {
    id: 'a16',
    title: 'Ninja Hot and Cold Brewed System - Auto-iQ Tea & Coffee Maker',
    price: 199,
    originalPrice: 249,
    rating: 4.3,
    reviewCount: 12345,
    image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&h=300&fit=crop&crop=center',
    isPrime: true,
    discount: 20,
    brand: 'Ninja'
  },
  {
    id: 'a17',
    title: 'Waring Commercial Waffle Maker - Double Belgian Waffle Iron',
    price: 89.99,
    originalPrice: 119.99,
    rating: 4.4,
    reviewCount: 8765,
    image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=300&h=300&fit=crop&crop=center',
    isPrime: true,
    discount: 25,
    brand: 'Waring'
  },
  {
    id: 'a18',
    title: 'Philips Kitchen Scale - Digital Food Scale 11 lb Capacity',
    price: 34.99,
    originalPrice: 44.99,
    rating: 4.5,
    reviewCount: 23456,
    image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=300&h=300&fit=crop&crop=center',
    isPrime: true,
    discount: 22,
    brand: 'Philips'
  },
  {
    id: 'a19',
    title: 'Cuisinart Food Processor - 14-Cup Large Capacity Prep Plus',
    price: 199,
    originalPrice: 249,
    rating: 4.7,
    reviewCount: 34567,
    image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=300&h=300&fit=crop&crop=center',
    isPrime: true,
    discount: 20,
    brand: 'Cuisinart'
  },
  {
    id: 'a20',
    title: 'Whirlpool Compact Refrigerator - 3.1 Cu Ft Mini Fridge',
    price: 299,
    originalPrice: 379,
    rating: 4.2,
    reviewCount: 15678,
    image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=300&h=300&fit=crop&crop=center',
    isPrime: true,
    discount: 21,
    brand: 'Whirlpool'
  },
  {
    id: 'a21',
    title: 'Dash Mini Waffle Maker - Individual Waffles Hash Browns',
    price: 19.99,
    originalPrice: 24.99,
    rating: 4.3,
    reviewCount: 45678,
    image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=300&h=300&fit=crop&crop=center',
    isPrime: true,
    discount: 20,
    brand: 'Dash'
  },
  {
    id: 'a22',
    title: 'Zojirushi Rice Cooker - 5.5-Cup Neuro Fuzzy Logic',
    price: 179,
    originalPrice: 219,
    rating: 4.8,
    reviewCount: 23456,
    image: 'https://images.unsplash.com/photo-1544233726-9f1d2b27be8b?w=300&h=300&fit=crop&crop=center',
    isPrime: true,
    discount: 18,
    brand: 'Zojirushi'
  },
  {
    id: 'a23',
    title: 'Breville Barista Express Espresso Machine - Stainless Steel',
    price: 599,
    originalPrice: 699,
    rating: 4.6,
    reviewCount: 12345,
    image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&h=300&fit=crop&crop=center',
    isPrime: true,
    discount: 14,
    brand: 'Breville'
  },
  {
    id: 'a24',
    title: 'Magic Bullet Blender - Personal Size Blender for Shakes and Smoothies',
    price: 39.99,
    originalPrice: 49.99,
    rating: 4.1,
    reviewCount: 67890,
    image: 'https://images.unsplash.com/photo-1570197788417-0e82375c9371?w=300&h=300&fit=crop&crop=center',
    isPrime: true,
    discount: 20,
    brand: 'Magic Bullet'
  },
  {
    id: 'a25',
    title: 'Sous Vide Precision Cooker - Immersion Circulator WiFi Enabled',
    price: 149,
    originalPrice: 199,
    rating: 4.5,
    reviewCount: 8765,
    image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=300&h=300&fit=crop&crop=center',
    isPrime: true,
    discount: 25,
    brand: 'Anova'
  },
  {
    id: 'a26',
    title: 'Electric Griddle - Non-Stick Large Cooking Surface 20 inch',
    price: 79.99,
    originalPrice: 99.99,
    rating: 4.3,
    reviewCount: 23456,
    image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=300&h=300&fit=crop&crop=center',
    isPrime: true,
    discount: 20,
    brand: 'Presto'
  },
  {
    id: 'a27',
    title: 'Wine Refrigerator - 18 Bottle Dual Zone Wine Cooler',
    price: 349,
    originalPrice: 429,
    rating: 4.4,
    reviewCount: 12345,
    image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=300&h=300&fit=crop&crop=center',
    isPrime: true,
    discount: 19,
    brand: 'NewAir'
  },
  {
    id: 'a28',
    title: 'Pasta Machine - Stainless Steel Manual Crank Operation',
    price: 49.99,
    originalPrice: 69.99,
    rating: 4.2,
    reviewCount: 15678,
    image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=300&h=300&fit=crop&crop=center',
    isPrime: true,
    discount: 29,
    brand: 'Marcato'
  },
  {
    id: 'a29',
    title: 'Electric Kettle - Variable Temperature Control with Keep Warm',
    price: 79.99,
    originalPrice: 99.99,
    rating: 4.6,
    reviewCount: 34567,
    image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=300&h=300&fit=crop&crop=center',
    isPrime: true,
    discount: 20,
    brand: 'Cosori'
  },
  {
    id: 'a30',
    title: 'Ice Cream Maker - 2 Quart Electric Frozen Yogurt Machine',
    price: 59.99,
    originalPrice: 79.99,
    rating: 4.3,
    reviewCount: 23456,
    image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=300&h=300&fit=crop&crop=center',
    isPrime: true,
    discount: 25,
    brand: 'Cuisinart'
  },
  {
    id: 'a31',
    title: 'Mandoline Slicer - Adjustable Vegetable Slicer with Safety Guard',
    price: 29.99,
    originalPrice: 39.99,
    rating: 4.4,
    reviewCount: 12345,
    image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=300&h=300&fit=crop&crop=center',
    isPrime: true,
    discount: 25,
    brand: 'OXO'
  },
  {
    id: 'a32',
    title: 'Dehydrator - 9 Tray Electric Food Dehydrator Machine',
    price: 89.99,
    originalPrice: 119.99,
    rating: 4.5,
    reviewCount: 8765,
    image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=300&h=300&fit=crop&crop=center',
    isPrime: true,
    discount: 25,
    brand: 'Excalibur'
  },
  {
    id: 'a33',
    title: 'Pressure Washer - Electric High Pressure Cleaner 2030 PSI',
    price: 149,
    originalPrice: 199,
    rating: 4.2,
    reviewCount: 15678,
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=300&fit=crop&crop=center',
    isPrime: true,
    discount: 25,
    brand: 'Sun Joe'
  },
  {
    id: 'a34',
    title: 'Bread Machine - Programmable 2lb Loaf Maker with Gluten-Free Setting',
    price: 129,
    originalPrice: 169,
    rating: 4.4,
    reviewCount: 23456,
    image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=300&h=300&fit=crop&crop=center',
    isPrime: true,
    discount: 24,
    brand: 'Zojirushi'
  },
  {
    id: 'a35',
    title: 'Vacuum Sealer - Food Saver Machine with Starter Kit',
    price: 99.99,
    originalPrice: 129.99,
    rating: 4.3,
    reviewCount: 12345,
    image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=300&h=300&fit=crop&crop=center',
    isPrime: true,
    discount: 23,
    brand: 'FoodSaver'
  },
  {
    id: 'a36',
    title: 'Smokeless Indoor Grill - Electric BBQ Grill with Advanced Airflow',
    price: 199,
    originalPrice: 249,
    rating: 4.1,
    reviewCount: 8765,
    image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=300&h=300&fit=crop&crop=center',
    isPrime: true,
    discount: 20,
    brand: 'PowerXL'
  }
];

async function migrateAppliancesProducts() {
  console.log('🔌 Starting Appliances Products Migration...');
  console.log(`📦 Found ${appliancesProducts.length} Appliances products to migrate`);

  // First, get the Appliances category ID
  const { data: categories, error: categoryError } = await supabase
    .from('categories')
    .select('id, name')
    .eq('slug', 'appliances')
    .single();

  if (categoryError) {
    console.error('❌ Error fetching Appliances category:', categoryError);
    return;
  }

  const appliancesCategoryId = categories.id;
  console.log(`✅ Found Appliances category ID: ${appliancesCategoryId}`);

  let successCount = 0;
  let failCount = 0;

  // Process each product
  for (let i = 0; i < appliancesProducts.length; i++) {
    const product = appliancesProducts[i];
    
    console.log(`\n🔌 Migrating Product ${i + 1}/${appliancesProducts.length}: ${product.title}`);

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
      description: `${product.title} - Premium quality appliance from ${product.brand}. Rating: ${product.rating}/5 stars with ${product.reviewCount} reviews. ${product.isPrime ? 'Prime eligible.' : ''} ${product.discount ? `Save ${product.discount}%!` : ''}`,
      short_description: `High-quality ${product.brand} appliance with ${product.rating}-star rating`,
      sku: `${product.brand.replace(/\s+/g, '').toUpperCase()}-${product.id.toUpperCase()}-001`,
      price: product.price,
      original_price: product.originalPrice,
      category_id: appliancesCategoryId,
      brand: product.brand,
      stock_quantity: Math.floor(Math.random() * 30) + 10, // Random stock 10-40 (appliances have moderate stock)
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
    await new Promise(resolve => setTimeout(resolve, 50));
  }

  console.log('\n🎉 Appliances Products Migration Complete!');
  console.log(`✅ Successfully migrated: ${successCount} products`);
  console.log(`❌ Failed to migrate: ${failCount} products`);
  console.log(`📊 Total processed: ${successCount + failCount} products`);

  // Verify migration by checking total Appliances products
  const { data: appliancesCount, error: countError } = await supabase
    .from('products')
    .select('id', { count: 'exact' })
    .eq('category_id', appliancesCategoryId);

  if (!countError) {
    console.log(`\n📈 Total Appliances products in database: ${appliancesCount.length || 0}`);
  }
}

// Run the migration
if (require.main === module) {
  migrateAppliancesProducts()
    .then(() => {
      console.log('\n✅ Migration script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Migration script failed:', error);
      process.exit(1);
    });
}

module.exports = { migrateAppliancesProducts };
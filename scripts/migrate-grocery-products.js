const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || 'https://igzpodmmymbptmwebonh.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlnenBvZG1teW1icHRtd2Vib25oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1NDczNDIsImV4cCI6MjA3MDEyMzM0Mn0.eOy5F_0pE7ki3TXl49bW5c0K1TWGKf2_Vpn1IRKWQRc';

const supabase = createClient(supabaseUrl, supabaseKey);

// Grocery products from CategoryListing.tsx (g1-g36) - ALL 36 PRODUCTS
const groceryProducts = [
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
    reviewCount: 15678,
    image: 'https://images.unsplash.com/photo-1518569656558-1f25e69d93d7?w=300&h=300&fit=crop&crop=center',
    isPrime: true,
    discount: 17,
    brand: 'Vital Farms'
  },
  {
    id: 'g12',
    title: 'Fresh Strawberries - Sweet Red Strawberries 1 lb Container',
    price: 4.99,
    originalPrice: 5.99,
    rating: 4.3,
    reviewCount: 9876,
    image: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=300&h=300&fit=crop&crop=center',
    isPrime: true,
    discount: 17,
    brand: 'Driscoll\'s'
  },
  {
    id: 'g13',
    title: 'Organic Whole Milk - Fresh Dairy Milk Half Gallon',
    price: 3.49,
    originalPrice: 4.19,
    rating: 4.5,
    reviewCount: 23456,
    image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=300&h=300&fit=crop&crop=center',
    isPrime: true,
    discount: 17,
    brand: 'Organic Valley'
  },
  {
    id: 'g14',
    title: 'Sourdough Bread Loaf - Artisan Crafted Fresh Baked Bread',
    price: 4.99,
    originalPrice: 6.49,
    rating: 4.4,
    reviewCount: 6789,
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=300&h=300&fit=crop&crop=center',
    isPrime: true,
    discount: 23,
    brand: 'Artisan Bakery'
  },
  {
    id: 'g15',
    title: 'Quinoa Organic Tri-Color - Ancient Grain Superfood 2 lbs',
    price: 8.99,
    originalPrice: 11.99,
    rating: 4.6,
    reviewCount: 4321,
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=300&h=300&fit=crop&crop=center',
    isPrime: true,
    discount: 25,
    brand: 'Ancient Harvest'
  },
  {
    id: 'g16',
    title: 'Organic Chicken Breast - Boneless Skinless 2 lbs Fresh',
    price: 12.99,
    originalPrice: 15.49,
    rating: 4.5,
    reviewCount: 7890,
    image: 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=300&h=300&fit=crop&crop=center',
    isPrime: true,
    discount: 16,
    brand: 'Bell & Evans'
  },
  {
    id: 'g17',
    title: 'Dark Chocolate 70% Cacao - Premium Belgian Chocolate Bar 3.5 oz',
    price: 3.99,
    originalPrice: 4.99,
    rating: 4.7,
    reviewCount: 12345,
    image: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=300&h=300&fit=crop&crop=center',
    isPrime: true,
    discount: 20,
    brand: 'Ghirardelli'
  },
  {
    id: 'g18',
    title: 'Organic Carrots - Fresh Baby Carrots 2 lbs Bag',
    price: 2.49,
    originalPrice: 2.99,
    rating: 4.4,
    reviewCount: 18765,
    image: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=300&h=300&fit=crop&crop=center',
    isPrime: true,
    discount: 17,
    brand: 'Grimmway Farms'
  },
  {
    id: 'g19',
    title: 'Pasta Linguine Whole Wheat - Italian Durum Wheat Pasta 1 lb',
    price: 2.99,
    originalPrice: 3.49,
    rating: 4.3,
    reviewCount: 9876,
    image: 'https://images.unsplash.com/photo-1551892589-865f69869476?w=300&h=300&fit=crop&crop=center',
    isPrime: true,
    discount: 14,
    brand: 'Barilla'
  },
  {
    id: 'g20',
    title: 'Coconut Oil Extra Virgin - Organic Unrefined Coconut Oil 16 oz',
    price: 9.99,
    originalPrice: 12.99,
    rating: 4.6,
    reviewCount: 5432,
    image: 'https://images.unsplash.com/photo-1474979266404-71cc94901144?w=300&h=300&fit=crop&crop=center',
    isPrime: true,
    discount: 23,
    brand: 'Nutiva'
  },
  {
    id: 'g21',
    title: 'Green Tea Organic - Premium Sencha Green Tea Bags 100 Count',
    price: 8.49,
    originalPrice: 10.99,
    rating: 4.5,
    reviewCount: 7654,
    image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=300&h=300&fit=crop&crop=center',
    isPrime: true,
    discount: 23,
    brand: 'Traditional Medicinals'
  },
  {
    id: 'g22',
    title: 'Canned Chickpeas - Organic Garbanzo Beans 15 oz Can Pack of 6',
    price: 7.99,
    originalPrice: 9.99,
    rating: 4.4,
    reviewCount: 3456,
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=300&h=300&fit=crop&crop=center',
    isPrime: true,
    discount: 20,
    brand: 'Eden Organic'
  },
  {
    id: 'g23',
    title: 'Himalayan Pink Salt - Fine Ground Sea Salt 2 lbs',
    price: 6.99,
    originalPrice: 8.99,
    rating: 4.6,
    reviewCount: 12345,
    image: 'https://images.unsplash.com/photo-1474979266404-71cc94901144?w=300&h=300&fit=crop&crop=center',
    isPrime: true,
    discount: 22,
    brand: 'Redmond Real Salt'
  },
  {
    id: 'g24',
    title: 'Organic Blueberries - Fresh Antioxidant Rich Berries 1 lb',
    price: 6.99,
    originalPrice: 8.49,
    rating: 4.5,
    reviewCount: 8765,
    image: 'https://images.unsplash.com/photo-1498557850523-fd3d118b962e?w=300&h=300&fit=crop&crop=center',
    isPrime: true,
    discount: 18,
    brand: 'Naturipe'
  },
  {
    id: 'g25',
    title: 'Organic Tomatoes - Vine Ripened Roma Tomatoes 2 lbs',
    price: 4.99,
    originalPrice: 5.99,
    rating: 4.3,
    reviewCount: 6789,
    image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=300&h=300&fit=crop&crop=center',
    isPrime: true,
    discount: 17,
    brand: 'Sunset'
  },
  {
    id: 'g26',
    title: 'Vanilla Extract Pure - Madagascar Vanilla Extract 4 fl oz',
    price: 12.99,
    originalPrice: 15.99,
    rating: 4.7,
    reviewCount: 4321,
    image: 'https://images.unsplash.com/photo-1474979266404-71cc94901144?w=300&h=300&fit=crop&crop=center',
    isPrime: true,
    discount: 19,
    brand: 'Simply Organic'
  },
  {
    id: 'g27',
    title: 'Oatmeal Steel Cut - Organic Whole Grain Oats 2 lbs',
    price: 5.99,
    originalPrice: 7.49,
    rating: 4.4,
    reviewCount: 9876,
    image: 'https://images.unsplash.com/photo-1574168945971-78d2abe8e0e2?w=300&h=300&fit=crop&crop=center',
    isPrime: true,
    discount: 20,
    brand: 'Bob\'s Red Mill'
  },
  {
    id: 'g28',
    title: 'Maple Syrup Grade A - Pure Canadian Maple Syrup 12 fl oz',
    price: 14.99,
    originalPrice: 18.99,
    rating: 4.6,
    reviewCount: 2345,
    image: 'https://images.unsplash.com/photo-1474979266404-71cc94901144?w=300&h=300&fit=crop&crop=center',
    isPrime: true,
    discount: 21,
    brand: 'Coombs Family Farms'
  },
  {
    id: 'g29',
    title: 'Organic Sweet Potatoes - Fresh Orange Sweet Potatoes 3 lbs',
    price: 3.99,
    originalPrice: 4.99,
    rating: 4.5,
    reviewCount: 7654,
    image: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=300&h=300&fit=crop&crop=center',
    isPrime: true,
    discount: 20,
    brand: 'Covington Farms'
  },
  {
    id: 'g30',
    title: 'Fresh Cilantro - Aromatic Herb Bunch for Cooking',
    price: 1.49,
    originalPrice: 1.99,
    rating: 4.2,
    reviewCount: 5432,
    image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=300&h=300&fit=crop&crop=center',
    isPrime: true,
    discount: 25,
    brand: 'Fresh Herbs Co'
  },
  {
    id: 'g31',
    title: 'Black Beans Organic - Protein Rich Legumes 15 oz Can Pack of 4',
    price: 6.99,
    originalPrice: 8.99,
    rating: 4.4,
    reviewCount: 3456,
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=300&h=300&fit=crop&crop=center',
    isPrime: true,
    discount: 22,
    brand: 'Amy\'s'
  },
  {
    id: 'g32',
    title: 'Cashews Raw Organic - Premium Whole Cashews 1 lb',
    price: 13.99,
    originalPrice: 16.99,
    rating: 4.6,
    reviewCount: 6789,
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=300&h=300&fit=crop&crop=center',
    isPrime: true,
    discount: 18,
    brand: 'Terrasoul Superfoods'
  },
  {
    id: 'g33',
    title: 'Apple Cider Vinegar - Raw Unfiltered with Mother 32 fl oz',
    price: 8.99,
    originalPrice: 11.99,
    rating: 4.5,
    reviewCount: 12345,
    image: 'https://images.unsplash.com/photo-1474979266404-71cc94901144?w=300&h=300&fit=crop&crop=center',
    isPrime: true,
    discount: 25,
    brand: 'Bragg'
  },
  {
    id: 'g34',
    title: 'Organic Lemon - Fresh Citrus Lemons 2 lbs Bag',
    price: 3.99,
    originalPrice: 4.99,
    rating: 4.4,
    reviewCount: 8765,
    image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=300&h=300&fit=crop&crop=center',
    isPrime: true,
    discount: 20,
    brand: 'Sunkist'
  },
  {
    id: 'g35',
    title: 'Hummus Classic - Traditional Chickpea Hummus 10 oz',
    price: 3.99,
    originalPrice: 4.99,
    rating: 4.3,
    reviewCount: 9876,
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=300&h=300&fit=crop&crop=center',
    isPrime: true,
    discount: 20,
    brand: 'Sabra'
  },
  {
    id: 'g36',
    title: 'Pine Nuts Raw - Mediterranean Pine Nuts for Cooking 8 oz',
    price: 19.99,
    originalPrice: 24.99,
    rating: 4.6,
    reviewCount: 2345,
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=300&h=300&fit=crop&crop=center',
    isPrime: true,
    discount: 20,
    brand: 'Food to Live'
  }
];

async function migrateGroceryProducts() {
  console.log('🛒 Starting Grocery Products Migration...');
  console.log(`📦 Found ${groceryProducts.length} Grocery products to migrate`);

  // First, get the Grocery category ID
  const { data: categories, error: categoryError } = await supabase
    .from('categories')
    .select('id, name')
    .eq('slug', 'grocery')
    .single();

  if (categoryError) {
    console.error('❌ Error fetching Grocery category:', categoryError);
    return;
  }

  const groceryCategoryId = categories.id;
  console.log(`✅ Found Grocery category ID: ${groceryCategoryId}`);

  let successCount = 0;
  let failCount = 0;

  // Process each product
  for (let i = 0; i < groceryProducts.length; i++) {
    const product = groceryProducts[i];
    
    console.log(`\n🛒 Migrating Product ${i + 1}/${groceryProducts.length}: ${product.title}`);

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
      description: `${product.title} - Premium quality grocery item from ${product.brand}. Rating: ${product.rating}/5 stars with ${product.reviewCount} reviews. ${product.isPrime ? 'Prime eligible.' : ''} ${product.discount ? `Save ${product.discount}%!` : ''}`,
      short_description: `High-quality ${product.brand} grocery item with ${product.rating}-star rating`,
      sku: `${product.brand.replace(/\s+/g, '').toUpperCase()}-${product.id.toUpperCase()}-001`,
      price: product.price,
      original_price: product.originalPrice,
      category_id: groceryCategoryId,
      brand: product.brand,
      stock_quantity: Math.floor(Math.random() * 100) + 20, // Random stock 20-120 (groceries have higher stock)
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

  console.log('\n🎉 Grocery Products Migration Complete!');
  console.log(`✅ Successfully migrated: ${successCount} products`);
  console.log(`❌ Failed to migrate: ${failCount} products`);
  console.log(`📊 Total processed: ${successCount + failCount} products`);

  // Verify migration by checking total Grocery products
  const { data: groceryCount, error: countError } = await supabase
    .from('products')
    .select('id', { count: 'exact' })
    .eq('category_id', groceryCategoryId);

  if (!countError) {
    console.log(`\n📈 Total Grocery products in database: ${groceryCount.length || 0}`);
  }
}

// Run the migration
if (require.main === module) {
  migrateGroceryProducts()
    .then(() => {
      console.log('\n✅ Migration script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Migration script failed:', error);
      process.exit(1);
    });
}

module.exports = { migrateGroceryProducts };
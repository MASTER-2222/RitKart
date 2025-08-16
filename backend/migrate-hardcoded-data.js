// Comprehensive Migration Script: All Hardcoded Data to Database
// =============================================================

const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client using environment variables
const supabaseUrl = 'https://igzpodmmymbptmwebonh.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlnenBvZG1teW1icHRtd2Vib25oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1NDczNDIsImV4cCI6MjA3MDEyMzM0Mn0.eOy5F_0pE7ki3TXl49bW5c0K1TWGKf2_Vpn1IRKWQRc';

const supabase = createClient(supabaseUrl, supabaseKey);

// DEALS PAGE - Hardcoded data from deals page
const dealProducts = [
  {
    title: 'Apple MacBook Pro 14-inch M3 Chip with 8-Core CPU and 10-Core GPU',
    price: 1599,
    originalPrice: 1999,
    rating: 4.8,
    reviewCount: 2847,
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=300&h=300&fit=crop&crop=center',
    category: 'Electronics',
    dealEndTime: '2025-08-15T23:59:59Z',
    brand: 'Apple'
  },
  {
    title: 'Nike Air Force 1 \'07 White Leather Sneakers - Unisex',
    price: 85,
    originalPrice: 130,
    rating: 4.8,
    reviewCount: 28934,
    image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=300&h=300&fit=crop&crop=center',
    category: 'Fashion',
    dealEndTime: '2025-08-12T18:00:00Z',
    brand: 'Nike'
  },
  {
    title: 'KitchenAid Artisan Series 5-Quart Stand Mixer - Empire Red',
    price: 319,
    originalPrice: 499,
    rating: 4.8,
    reviewCount: 45678,
    image: 'https://images.unsplash.com/photo-1590736969955-71cc94901144?w=300&h=300&fit=crop&crop=center',
    category: 'Home',
    dealEndTime: '2025-08-14T12:00:00Z',
    brand: 'KitchenAid'
  },
  {
    title: 'The Seven Husbands of Evelyn Hugo: A Novel by Taylor Jenkins Reid',
    price: 12.99,
    originalPrice: 17.99,
    rating: 4.6,
    reviewCount: 147832,
    image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&h=300&fit=crop&crop=center',
    category: 'Books',
    dealEndTime: '2025-08-16T09:30:00Z',
    brand: 'Harper'
  },
  {
    title: 'Fitbit Charge 5 Advanced Fitness & Health Tracker with GPS',
    price: 119,
    originalPrice: 179,
    rating: 4.2,
    reviewCount: 34567,
    image: 'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=300&h=300&fit=crop&crop=center',
    category: 'Sports',
    dealEndTime: '2025-08-13T15:45:00Z',
    brand: 'Fitbit'
  },
  {
    title: 'CeraVe Foaming Facial Cleanser - Normal to Oily Skin 12 fl oz',
    price: 9.99,
    originalPrice: 18.99,
    rating: 4.6,
    reviewCount: 89234,
    image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=300&h=300&fit=crop&crop=center',
    category: 'Beauty',
    dealEndTime: '2025-08-12T20:15:00Z',
    brand: 'CeraVe'
  }
];

// Helper functions
function generateSKU(title, brand) {
  const cleanTitle = title.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '-');
  const cleanBrand = brand?.replace(/[^a-zA-Z0-9]/g, '') || 'GENERIC';
  return `${cleanBrand.toUpperCase()}-${cleanTitle.slice(0, 15).toUpperCase()}-${Math.random().toString(36).substr(2, 4)}`;
}

function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .replace(/\s+/g, '-')
    .slice(0, 50);
}

async function getCategoryId(categoryName) {
  const categoryMap = {
    'Electronics': 'electronics',
    'Fashion': 'fashion', 
    'Books': 'books',
    'Home': 'home',
    'Sports': 'sports',
    'Beauty': 'beauty'
  };

  const slug = categoryMap[categoryName] || 'electronics';

  const { data: category } = await supabase
    .from('categories')
    .select('id')
    .eq('slug', slug)
    .single();

  return category?.id;
}

async function migrateDealsData() {
  console.log('🚀 Starting deals data migration...');
  
  try {
    let createdProducts = 0;
    let createdDeals = 0;

    for (const dealProduct of dealProducts) {
      console.log(`Creating: ${dealProduct.title.slice(0, 40)}...`);
      
      // Get category ID
      const categoryId = await getCategoryId(dealProduct.category);
      
      // Create product
      const product = {
        name: dealProduct.title,
        slug: generateSlug(dealProduct.title),
        description: `${dealProduct.title} - Premium quality product with excellent features and performance.`,
        short_description: dealProduct.title.length > 100 ? dealProduct.title.slice(0, 100) + '...' : dealProduct.title,
        sku: generateSKU(dealProduct.title, dealProduct.brand),
        price: dealProduct.price,
        original_price: dealProduct.originalPrice,
        category_id: categoryId,
        brand: dealProduct.brand,
        stock_quantity: 50,
        is_active: true,
        is_featured: true,
        images: [dealProduct.image],
        rating_average: dealProduct.rating,
        total_reviews: dealProduct.reviewCount
      };

      const { data: createdProduct, error: productError } = await supabase
        .from('products')
        .insert([product])
        .select()
        .single();

      if (productError) {
        console.error(`❌ Error creating product: ${productError.message}`);
        continue;
      }

      createdProducts++;

      // Create deal
      const deal = {
        product_id: createdProduct.id,
        deal_title: dealProduct.title,
        deal_description: `Limited time offer on ${dealProduct.title}`,
        original_price: dealProduct.originalPrice,
        deal_price: dealProduct.price,
        start_date: new Date().toISOString(),
        end_date: dealProduct.dealEndTime,
        is_active: true,
        max_quantity: 100,
        used_quantity: Math.floor(Math.random() * 25),
        deal_type: 'flash_sale',
        category: dealProduct.category
      };

      const { data: createdDeal, error: dealError } = await supabase
        .from('deals')
        .insert([deal])
        .select()
        .single();

      if (dealError) {
        console.error(`❌ Error creating deal: ${dealError.message}`);
      } else {
        createdDeals++;
        console.log(`✅ Created: ${dealProduct.title.slice(0, 30)}... (${Math.round(((dealProduct.originalPrice - dealProduct.price) / dealProduct.originalPrice) * 100)}% off)`);
      }
    }

    console.log('\n🎉 Migration Summary:');
    console.log(`   📦 Products Created: ${createdProducts}`);
    console.log(`   🏷️ Deals Created: ${createdDeals}`);
    console.log('\n✅ Migration completed successfully!');

  } catch (error) {
    console.error('❌ Migration failed:', error);
  }
}

// Run migration
migrateDealsData();
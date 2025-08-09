const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials. Please check your .env file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const solarCategoryId = '1a2683d9-5a1b-4488-a92e-1562a816ad8e'; // Solar category UUID

const solarProducts = [
  {
    name: 'Renogy 100 Watt 12 Volt Monocrystalline Solar Panel - High Efficiency',
    slug: 'renogy-100w-monocrystalline-solar-panel',
    description: 'High-efficiency monocrystalline solar panel designed for off-grid and grid-tie applications. Features advanced cell technology for maximum power output.',
    short_description: 'High-efficiency 100W monocrystalline solar panel',
    sku: 'SO1-RENOGY-100W-MONO',
    price: 109,
    original_price: 149,
    category_id: solarCategoryId,
    brand: 'Renogy',
    stock_quantity: 50,
    is_active: true,
    is_featured: false,
    images: ['https://images.unsplash.com/photo-1509391366360-2e959784a276?w=300&h=300&fit=crop&crop=center'],
    features: ['100W Power Output', '12V System Compatible', 'Monocrystalline Technology', 'Weather Resistant'],
    specifications: { "power": "100W", "voltage": "12V", "efficiency": "High", "type": "Monocrystalline" },
    rating_average: 4.7,
    rating_count: 12456,
    total_reviews: 12456
  },
  {
    name: 'Goal Zero Yeti 1500X Portable Power Station - Solar Generator',
    slug: 'goal-zero-yeti-1500x-power-station',
    description: 'High-capacity portable power station with solar charging capability. Perfect for outdoor adventures and emergency backup power.',
    short_description: 'Portable 1500Wh solar power station',
    sku: 'SO2-GOALZERO-YETI1500X',
    price: 1999,
    original_price: 2299,
    category_id: solarCategoryId,
    brand: 'Goal Zero',
    stock_quantity: 15,
    is_active: true,
    is_featured: true,
    images: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=300&fit=crop&crop=center'],
    features: ['1500Wh Capacity', 'Solar Charging', 'Multiple Outputs', 'LCD Display'],
    specifications: { "capacity": "1500Wh", "weight": "45.6 lbs", "charging": "Solar/AC/12V", "outputs": "AC/DC/USB" },
    rating_average: 4.6,
    rating_count: 8934,
    total_reviews: 8934
  },
  {
    name: 'AIMS Power 1500W Pure Sine Wave Inverter - 12V DC to AC Converter',
    slug: 'aims-power-1500w-sine-wave-inverter',
    description: 'Pure sine wave power inverter converts 12V DC to 110V AC power. Ideal for solar systems and RV applications.',
    short_description: 'Pure sine wave 1500W power inverter',
    sku: 'SO3-AIMS-1500W-INVERTER',
    price: 299,
    original_price: 399,
    category_id: solarCategoryId,
    brand: 'AIMS Power',
    stock_quantity: 25,
    is_active: true,
    is_featured: false,
    images: ['https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=300&h=300&fit=crop&crop=center'],
    features: ['Pure Sine Wave', '1500W Continuous', '3000W Peak', 'Low THD'],
    specifications: { "continuous_power": "1500W", "peak_power": "3000W", "input": "12V DC", "output": "110V AC" },
    rating_average: 4.4,
    rating_count: 5672,
    total_reviews: 5672
  }
];

async function migrateSolarProducts() {
  console.log('🚀 Starting Solar products migration (Test - 3 products)...');
  console.log(`📦 Total products to migrate: ${solarProducts.length}`);

  let successCount = 0;
  let failedCount = 0;
  const errors = [];

  for (const product of solarProducts) {
    try {
      const { data, error } = await supabase
        .from('products')
        .insert([product]);

      if (error) {
        console.error(`❌ Failed to migrate product ${product.sku}:`, error.message);
        failedCount++;
        errors.push({ sku: product.sku, error: error.message });
      } else {
        console.log(`✅ Successfully migrated: ${product.name}`);
        successCount++;
      }
    } catch (error) {
      console.error(`❌ Exception while migrating product ${product.sku}:`, error.message);
      failedCount++;
      errors.push({ sku: product.sku, error: error.message });
    }
  }

  console.log('\n📊 MIGRATION SUMMARY:');
  console.log(`✅ Successful: ${successCount}`);
  console.log(`❌ Failed: ${failedCount}`);
  console.log(`📈 Success Rate: ${((successCount / solarProducts.length) * 100).toFixed(1)}%`);
  
  if (errors.length > 0) {
    console.log('\n🔍 FAILED PRODUCTS:');
    errors.forEach(({ sku, error }) => {
      console.log(`  • ${sku}: ${error}`);
    });
  }

  // Verify the migration
  console.log('\n🔍 Verifying Solar category in database...');
  const { data: solarCount, error: countError } = await supabase
    .from('products')
    .select('id', { count: 'exact' })
    .eq('category_id', solarCategoryId);

  if (!countError) {
    console.log(`✅ Solar category now has ${solarCount?.length || 0} products total`);
  }

  console.log('\n🎉 Solar products migration completed!');
}

// Run the migration
migrateSolarProducts().catch(console.error);
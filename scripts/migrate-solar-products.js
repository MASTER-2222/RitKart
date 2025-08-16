const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './backend/.env' });

// Get environment variables
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials. Please check your .env file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const solarProducts = [
  {
    id: 'so1',
    name: 'Renogy 100 Watt 12 Volt Monocrystalline Solar Panel - High Efficiency',
    price: 109,
    original_price: 149,
    discount_percentage: 27,
    rating: 4.7,
    review_count: 12456,
    image_url: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=300&h=300&fit=crop&crop=center',
    is_prime: true,
    brand: 'Renogy',
    category: 'Solar'
  },
  {
    id: 'so2',
    name: 'Goal Zero Yeti 1500X Portable Power Station - Solar Generator',
    price: 1999,
    original_price: 2299,
    discount_percentage: 13,
    rating: 4.6,
    review_count: 8934,
    image_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=300&fit=crop&crop=center',
    is_prime: true,
    brand: 'Goal Zero',
    category: 'Solar'
  },
  {
    id: 'so3',
    name: 'AIMS Power 1500W Pure Sine Wave Inverter - 12V DC to AC Converter',
    price: 299,
    original_price: 399,
    discount_percentage: 25,
    rating: 4.4,
    review_count: 5672,
    image_url: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=300&h=300&fit=crop&crop=center',
    is_prime: true,
    brand: 'AIMS Power',
    category: 'Solar'
  },
  {
    id: 'so4',
    name: 'Battle Born 100Ah 12V LiFePO4 Deep Cycle Battery - Solar Ready',
    price: 949,
    original_price: 1099,
    discount_percentage: 14,
    rating: 4.8,
    review_count: 3456,
    image_url: 'https://images.unsplash.com/photo-1593941707874-ef25b8b4a92b?w=300&h=300&fit=crop&crop=center',
    is_prime: true,
    brand: 'Battle Born',
    category: 'Solar'
  },
  {
    id: 'so5',
    name: 'Victron Energy SmartSolar MPPT 100/20 Solar Charge Controller',
    price: 159,
    original_price: 199,
    discount_percentage: 20,
    rating: 4.7,
    review_count: 7890,
    image_url: 'https://images.unsplash.com/photo-1624970622108-b4d7ab11b8d0?w=300&h=300&fit=crop&crop=center',
    is_prime: true,
    brand: 'Victron Energy',
    category: 'Solar'
  },
  {
    id: 'so6',
    name: 'ECO-WORTHY 400W Solar Panel Kit Complete Off Grid System',
    price: 449,
    original_price: 599,
    discount_percentage: 25,
    rating: 4.5,
    review_count: 9876,
    image_url: 'https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=300&h=300&fit=crop&crop=center',
    is_prime: true,
    brand: 'ECO-WORTHY',
    category: 'Solar'
  },
  {
    id: 'so7',
    name: 'Jackery SolarSaga 100W Portable Solar Panel for Power Station',
    price: 199,
    original_price: 249,
    discount_percentage: 20,
    rating: 4.6,
    review_count: 15678,
    image_url: 'https://images.unsplash.com/photo-1497440001374-f26997328c1b?w=300&h=300&fit=crop&crop=center',
    is_prime: true,
    brand: 'Jackery',
    category: 'Solar'
  },
  {
    id: 'so8',
    name: 'WindyNation 200W Solar Panel Kit with PWM Charge Controller',
    price: 249,
    original_price: 329,
    discount_percentage: 24,
    rating: 4.3,
    review_count: 6789,
    image_url: 'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?w=300&h=300&fit=crop&crop=center',
    is_prime: true,
    brand: 'WindyNation',
    category: 'Solar'
  },
  {
    id: 'so9',
    name: 'Grape Solar 300W Monocrystalline Solar Panel - Residential Grade',
    price: 319,
    original_price: 399,
    discount_percentage: 20,
    rating: 4.5,
    review_count: 4321,
    image_url: 'https://images.unsplash.com/photo-1562583489-bf23ec64651c?w=300&h=300&fit=crop&crop=center',
    is_prime: true,
    brand: 'Grape Solar',
    category: 'Solar'
  },
  {
    id: 'so10',
    name: 'SUNER POWER 12V Solar Car Battery Charger & Maintainer',
    price: 39.99,
    original_price: 59.99,
    discount_percentage: 33,
    rating: 4.4,
    review_count: 12345,
    image_url: 'https://images.unsplash.com/photo-1541123603104-512919d6a96c?w=300&h=300&fit=crop&crop=center',
    is_prime: true,
    brand: 'SUNER POWER',
    category: 'Solar'
  },
  {
    id: 'so11',
    name: 'ALLPOWERS 100W Flexible Solar Panel for RV Boat Marine',
    price: 129,
    original_price: 179,
    discount_percentage: 28,
    rating: 4.2,
    review_count: 8765,
    image_url: 'https://images.unsplash.com/photo-1475224937481-993c881e3c05?w=300&h=300&fit=crop&crop=center',
    is_prime: true,
    brand: 'ALLPOWERS',
    category: 'Solar'
  },
  {
    id: 'so12',
    name: 'Nature Power 180W Monocrystalline Solar Panel with Aluminum Frame',
    price: 189,
    original_price: 239,
    discount_percentage: 21,
    rating: 4.6,
    review_count: 5432,
    image_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=300&fit=crop&crop=center',
    is_prime: true,
    brand: 'Nature Power',
    category: 'Solar'
  },
  {
    id: 'so13',
    name: 'BLUETTI AC200P 2000Wh Portable Power Station Solar Generator',
    price: 1699,
    original_price: 1999,
    discount_percentage: 15,
    rating: 4.7,
    review_count: 6789,
    image_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=300&fit=crop&crop=center',
    is_prime: true,
    brand: 'BLUETTI',
    category: 'Solar'
  },
  {
    id: 'so14',
    name: 'Renogy Wanderer 30A 12V/24V PWM Solar Charge Controller',
    price: 49.99,
    original_price: 69.99,
    discount_percentage: 29,
    rating: 4.5,
    review_count: 9876,
    image_url: 'https://images.unsplash.com/photo-1624970622108-b4d7ab11b8d0?w=300&h=300&fit=crop&crop=center',
    is_prime: true,
    brand: 'Renogy',
    category: 'Solar'
  },
  {
    id: 'so15',
    name: 'EF ECOFLOW River 2 Pro Portable Power Station 768Wh Solar Compatible',
    price: 649,
    original_price: 799,
    discount_percentage: 19,
    rating: 4.6,
    review_count: 11234,
    image_url: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=300&h=300&fit=crop&crop=center',
    is_prime: true,
    brand: 'EF ECOFLOW',
    category: 'Solar'
  },
  {
    id: 'so16',
    name: 'AIMS 600W Peak 300W RMS Pure Sine Wave Power Inverter',
    price: 159,
    original_price: 199,
    discount_percentage: 20,
    rating: 4.3,
    review_count: 7654,
    image_url: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=300&h=300&fit=crop&crop=center',
    is_prime: true,
    brand: 'AIMS',
    category: 'Solar'
  },
  {
    id: 'so17',
    name: 'BougeRV 170W 12V Monocrystalline Solar Panel for Off Grid',
    price: 149,
    original_price: 199,
    discount_percentage: 25,
    rating: 4.4,
    review_count: 4567,
    image_url: 'https://images.unsplash.com/photo-1559733337-edf0ac062749?w=300&h=300&fit=crop&crop=center',
    is_prime: true,
    brand: 'BougeRV',
    category: 'Solar'
  },
  {
    id: 'so18',
    name: 'Mighty Max Battery 12V 100Ah LiFePO4 Deep Cycle Solar Battery',
    price: 469,
    original_price: 599,
    discount_percentage: 22,
    rating: 4.5,
    review_count: 8901,
    image_url: 'https://images.unsplash.com/photo-1593941707874-ef25b8b4a92b?w=300&h=300&fit=crop&crop=center',
    is_prime: true,
    brand: 'Mighty Max Battery',
    category: 'Solar'
  },
  {
    id: 'so19',
    name: 'DOKIO 100W Foldable Solar Panel Kit with Solar Controller',
    price: 179,
    original_price: 229,
    discount_percentage: 22,
    rating: 4.2,
    review_count: 6543,
    image_url: 'https://images.unsplash.com/photo-1475224937481-993c881e3c05?w=300&h=300&fit=crop&crop=center',
    is_prime: true,
    brand: 'DOKIO',
    category: 'Solar'
  },
  {
    id: 'so20',
    name: 'WEIZE 12V 100AH Deep Cycle AGM SLA VRLA Battery for Solar',
    price: 199,
    original_price: 249,
    discount_percentage: 20,
    rating: 4.6,
    review_count: 12678,
    image_url: 'https://images.unsplash.com/photo-1604077198496-8da17768c0d9?w=300&h=300&fit=crop&crop=center',
    is_prime: true,
    brand: 'WEIZE',
    category: 'Solar'
  },
  {
    id: 'so21',
    name: 'Newpowa 200W Monocrystalline Solar Panel 200 Watt 12V',
    price: 199,
    original_price: 259,
    discount_percentage: 23,
    rating: 4.4,
    review_count: 7890,
    image_url: 'https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=300&h=300&fit=crop&crop=center',
    is_prime: true,
    brand: 'Newpowa',
    category: 'Solar'
  },
  {
    id: 'so22',
    name: 'EPEVER 60A MPPT Solar Charge Controller 12V/24V Auto',
    price: 129,
    original_price: 169,
    discount_percentage: 24,
    rating: 4.7,
    review_count: 9432,
    image_url: 'https://images.unsplash.com/photo-1624970622108-b4d7ab11b8d0?w=300&h=300&fit=crop&crop=center',
    is_prime: true,
    brand: 'EPEVER',
    category: 'Solar'
  },
  {
    id: 'so23',
    name: 'Portable Solar Panel 120W Foldable Solar Charger for Camping',
    price: 229,
    original_price: 299,
    discount_percentage: 23,
    rating: 4.3,
    review_count: 5678,
    image_url: 'https://images.unsplash.com/photo-1497440001374-f26997328c1b?w=300&h=300&fit=crop&crop=center',
    is_prime: true,
    brand: 'Portable Solar',
    category: 'Solar'
  },
  {
    id: 'so24',
    name: 'Topsolar 100W Solar Panel Kit Complete 12V Solar System',
    price: 159,
    original_price: 219,
    discount_percentage: 27,
    rating: 4.5,
    review_count: 8765,
    image_url: 'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?w=300&h=300&fit=crop&crop=center',
    is_prime: true,
    brand: 'Topsolar',
    category: 'Solar'
  }
];

async function migrateSolarProducts() {
  console.log('🚀 Starting Solar products migration...');
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
        console.error(`❌ Failed to migrate product ${product.id}:`, error.message);
        failedCount++;
        errors.push({ id: product.id, error: error.message });
      } else {
        console.log(`✅ Successfully migrated: ${product.name}`);
        successCount++;
      }
    } catch (error) {
      console.error(`❌ Exception while migrating product ${product.id}:`, error.message);
      failedCount++;
      errors.push({ id: product.id, error: error.message });
    }
  }

  console.log('\n📊 MIGRATION SUMMARY:');
  console.log(`✅ Successful: ${successCount}`);
  console.log(`❌ Failed: ${failedCount}`);
  console.log(`📈 Success Rate: ${((successCount / solarProducts.length) * 100).toFixed(1)}%`);
  
  if (errors.length > 0) {
    console.log('\n🔍 FAILED PRODUCTS:');
    errors.forEach(({ id, error }) => {
      console.log(`  • ${id}: ${error}`);
    });
  }

  // Verify the migration
  console.log('\n🔍 Verifying Solar category in database...');
  const { data: solarCount, error: countError } = await supabase
    .from('products')
    .select('id', { count: 'exact' })
    .eq('category', 'Solar');

  if (!countError) {
    console.log(`✅ Solar category now has ${solarCount?.length || 0} products total`);
  }

  console.log('\n🎉 Solar products migration completed!');
}

// Run the migration
migrateSolarProducts().catch(console.error);
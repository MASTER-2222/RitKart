// Script to populate sample deals data
// ==============================================

const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = 'https://igzpodmmymbptmwebonh.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlnenBvZG1teW1icHRtd2Vib25oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1NDczNDIsImV4cCI6MjA3MDEyMzM0Mn0.eOy5F_0pE7ki3TXl49bW5c0K1TWGKf2_Vpn1IRKWQRc';

const supabase = createClient(supabaseUrl, supabaseKey);

// Sample deals data based on the hardcoded data from deals page
const sampleDeals = [
  {
    deal_title: 'Apple MacBook Pro Flash Sale',
    deal_description: 'Limited time offer on MacBook Pro with M3 chip',
    original_price: 1999.00,
    deal_price: 1599.00,
    start_date: new Date().toISOString(),
    end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
    deal_type: 'flash_sale',
    category: 'Electronics',
    max_quantity: 50,
    used_quantity: 0
  },
  {
    deal_title: 'Nike Sneakers Super Deal',
    deal_description: 'Get your favorite Nike sneakers at amazing prices',
    original_price: 150.00,
    deal_price: 129.99,
    start_date: new Date().toISOString(),
    end_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days from now
    deal_type: 'daily_deal',
    category: 'Fashion',
    max_quantity: 100,
    used_quantity: 12
  },
  {
    deal_title: 'Kitchen Appliance Clearance',
    deal_description: 'KitchenAid mixer at lowest price ever',
    original_price: 499.00,
    deal_price: 319.00,
    start_date: new Date().toISOString(),
    end_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days from now
    deal_type: 'clearance',
    category: 'Home',
    max_quantity: 25,
    used_quantity: 5
  },
  {
    deal_title: 'Best Books Deal',
    deal_description: 'Popular fiction books at discounted prices',
    original_price: 17.99,
    deal_price: 12.99,
    start_date: new Date().toISOString(),
    end_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days from now
    deal_type: 'weekly_deal',
    category: 'Books',
    max_quantity: 200,
    used_quantity: 45
  },
  {
    deal_title: 'Fitness Tracker Sale',
    deal_description: 'Fitbit devices with huge discounts',
    original_price: 179.00,
    deal_price: 119.00,
    start_date: new Date().toISOString(),
    end_date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(), // 4 days from now
    deal_type: 'flash_sale',
    category: 'Sports',
    max_quantity: 75,
    used_quantity: 20
  }
];

async function populateDeals() {
  try {
    console.log('🚀 Starting to populate deals data...');

    // First, get some products from the database to link with deals
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, name, category_id')
      .eq('is_active', true)
      .limit(10);

    if (productsError) {
      console.error('❌ Error fetching products:', productsError);
      return;
    }

    if (!products || products.length === 0) {
      console.error('❌ No products found in database');
      return;
    }

    console.log(`✅ Found ${products.length} products to create deals for`);

    // Create deals using the first few products
    const dealsToInsert = sampleDeals.slice(0, Math.min(sampleDeals.length, products.length)).map((deal, index) => ({
      ...deal,
      product_id: products[index].id
    }));

    const { data: insertedDeals, error: insertError } = await supabase
      .from('deals')
      .insert(dealsToInsert)
      .select();

    if (insertError) {
      console.error('❌ Error inserting deals:', insertError);
      return;
    }

    console.log(`✅ Successfully created ${insertedDeals.length} deals`);
    console.log('📊 Deals summary:');
    insertedDeals.forEach((deal, index) => {
      console.log(`   ${index + 1}. ${deal.deal_title} - $${deal.deal_price} (was $${deal.original_price})`);
    });

    console.log('🎉 Deals population completed successfully!');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the script
populateDeals();
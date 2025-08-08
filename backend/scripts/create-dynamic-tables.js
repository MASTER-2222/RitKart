// Create Dynamic Content Tables Script
// ===================================
// Direct table creation using Supabase service

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://igzpodmmymbptmwebonh.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlnenBvZG1teW1icHRtd2Vib25oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1NDczNDIsImV4cCI6MjA3MDEyMzM0Mn0.eOy5F_0pE7ki3TXl49bW5c0K1TWGKf2_Vpn1IRKWQRc';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function createTables() {
  console.log('🚀 Creating dynamic content tables...');

  try {
    // Test connection first
    const { data: categories, error: testError } = await supabase
      .from('categories')
      .select('count(*)')
      .limit(1);

    if (testError) {
      console.error('❌ Supabase connection test failed:', testError.message);
      return;
    }

    console.log('✅ Supabase connection successful');

    // Create hero_banners table by inserting sample data (this will create the table structure)
    console.log('📄 Creating hero_banners table with sample data...');

    const heroBanners = [
      {
        title: 'Fashion & Lifestyle',
        subtitle: 'Discover trendy styles and accessories for every occasion',
        image_url: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1200&h=400&fit=crop&crop=center',
        sort_order: 1
      },
      {
        title: 'Premium Shopping Experience',
        subtitle: 'Quality products delivered straight to your door',
        image_url: 'https://images.unsplash.com/photo-1534452203293-494d7ddbf7e0?w=1200&h=400&fit=crop&crop=center',
        sort_order: 2
      },
      {
        title: 'Shop with Confidence',
        subtitle: 'Explore our vast selection in our modern retail space',
        image_url: 'https://images.unsplash.com/photo-1481437156560-3205f6a55735?w=1200&h=400&fit=crop&crop=center',
        sort_order: 3
      },
      {
        title: 'Weekend Shopping Spree',
        subtitle: 'Get amazing deals on all your favorite brands',
        image_url: 'https://images.unsplash.com/photo-1573855619003-97b4799dcd8b?w=1200&h=400&fit=crop&crop=center',
        sort_order: 4
      },
      {
        title: 'MEGA SALE EVENT',
        subtitle: 'Up to 70% off on electronics, fashion, and more!',
        image_url: 'https://images.unsplash.com/photo-1532795986-dbef1643a596?w=1200&h=400&fit=crop&crop=center',
        sort_order: 5
      },
      {
        title: 'Black Friday Deals',
        subtitle: 'Massive discounts across all categories - Limited time only',
        image_url: 'https://images.unsplash.com/photo-1607083206968-13611e3d76db?w=1200&h=400&fit=crop&crop=center',
        sort_order: 6
      },
      {
        title: 'Special Offers',
        subtitle: 'Exclusive deals and promotional prices just for you',
        image_url: 'https://images.pexels.com/photos/5868722/pexels-photo-5868722.jpeg?w=1200&h=400&fit=crop&crop=center',
        sort_order: 7
      },
      {
        title: 'Shop Online Anytime',
        subtitle: 'Convenient online shopping with fast delivery options',
        image_url: 'https://images.unsplash.com/photo-1586880244406-556ebe35f282?w=1200&h=400&fit=crop&crop=center',
        sort_order: 8
      }
    ];

    // Check if hero_banners table exists by trying to query it
    console.log('🔍 Checking if hero_banners table exists...');
    const { data: existingBanners, error: checkError } = await supabase
      .from('hero_banners')
      .select('*')
      .limit(1);

    if (checkError && checkError.code === 'PGRST116') {
      console.log('❌ hero_banners table does not exist. Please run the SQL migration manually in Supabase Dashboard.');
      console.log('📄 Please execute the SQL from: /app/backend/database-migration-dynamic.sql');
      return;
    } else if (checkError) {
      console.error('❌ Error checking hero_banners table:', checkError.message);
      return;
    }

    console.log('✅ hero_banners table exists');

    // Insert hero banners data
    const { data: bannersData, error: bannersError } = await supabase
      .from('hero_banners')
      .insert(heroBanners)
      .select();

    if (bannersError) {
      console.error('❌ Error inserting hero banners:', bannersError.message);
    } else {
      console.log(`✅ Inserted ${bannersData.length} hero banners successfully`);
    }

    // Test deals table exists
    console.log('🔍 Checking if deals table exists...');
    const { data: existingDeals, error: dealsCheckError } = await supabase
      .from('deals')
      .select('*')
      .limit(1);

    if (dealsCheckError && dealsCheckError.code === 'PGRST116') {
      console.log('❌ deals table does not exist. Please run the SQL migration manually in Supabase Dashboard.');
    } else if (dealsCheckError) {
      console.error('❌ Error checking deals table:', dealsCheckError.message);
    } else {
      console.log('✅ deals table exists');
    }

    console.log('🎉 Dynamic content tables setup completed!');
    console.log('📋 Next steps:');
    console.log('   1. Run product migration to populate products table');
    console.log('   2. Create sample deals data'); 
    console.log('   3. Update backend APIs');
    console.log('   4. Update frontend integration');

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
  }
}

// Run the setup
createTables();
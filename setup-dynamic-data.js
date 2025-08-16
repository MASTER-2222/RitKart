// Setup Dynamic Data - Create Tables and Populate
// ===============================================
// Manually run SQL to create tables and populate data

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://igzpodmmymbptmwebonh.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlnenBvZG1teW1icHRtd2Vib25oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1NDczNDIsImV4cCI6MjA3MDEyMzM0Mn0.eOy5F_0pE7ki3TXl49bW5c0K1TWGKf2_Vpn1IRKWQRc';

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupDynamicTables() {
  console.log('🚀 Setting up dynamic content tables...');

  try {
    // Test existing tables first
    console.log('🔍 Testing database connection...');
    
    const { data: categories, error: catError } = await supabase
      .from('categories')
      .select('count(*)')
      .limit(1);

    if (catError) {
      console.error('❌ Database connection failed:', catError.message);
      return;
    }

    console.log('✅ Database connection successful');

    // Check if hero_banners table exists by trying to query it
    console.log('🔍 Checking hero_banners table...');
    
    const { data: existingBanners, error: bannerError } = await supabase
      .from('hero_banners')
      .select('*')
      .limit(1);

    if (bannerError && bannerError.code === 'PGRST116') {
      console.log('❌ hero_banners table does not exist');
      console.log('');
      console.log('📋 MANUAL STEP REQUIRED:');
      console.log('Please go to your Supabase Dashboard SQL Editor and run this SQL:');
      console.log('');
      console.log('-- Create hero_banners table');
      console.log(`CREATE TABLE IF NOT EXISTS public.hero_banners (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    title TEXT NOT NULL,
    subtitle TEXT,
    image_url TEXT NOT NULL,
    button_text TEXT DEFAULT 'Shop Now',
    button_link TEXT DEFAULT '#',
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true
);`);
      console.log('');
      console.log('-- Create deals table');
      console.log(`CREATE TABLE IF NOT EXISTS public.deals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    product_id UUID REFERENCES public.products(id) NOT NULL,
    deal_title TEXT,
    deal_description TEXT,
    original_price DECIMAL(10,2) NOT NULL,
    deal_price DECIMAL(10,2) NOT NULL,
    discount_percentage INTEGER,
    start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    max_quantity INTEGER,
    used_quantity INTEGER DEFAULT 0,
    deal_type TEXT DEFAULT 'flash_sale',
    category TEXT
);`);
      console.log('');
      console.log('Then run this script again to populate the data.');
      console.log('');
      return;
    } else if (bannerError) {
      console.error('❌ Error checking hero_banners table:', bannerError.message);
      return;
    }

    console.log('✅ hero_banners table exists');

    // Clear existing banners and insert new ones
    console.log('🗑️ Clearing existing hero banners...');
    const { error: deleteError } = await supabase
      .from('hero_banners')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

    if (deleteError) {
      console.error('Warning: Could not clear existing banners:', deleteError.message);
    }

    // Insert hero banners
    console.log('📄 Inserting hero banners...');
    
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

    const { data: insertedBanners, error: insertError } = await supabase
      .from('hero_banners')
      .insert(heroBanners)
      .select();

    if (insertError) {
      console.error('❌ Error inserting hero banners:', insertError.message);
    } else {
      console.log(`✅ Successfully inserted ${insertedBanners.length} hero banners`);
    }

    // Test API endpoint
    console.log('🧪 Testing banner API endpoint...');
    try {
      const response = await fetch('http://localhost:10000/api/banners');
      const result = await response.json();
      
      if (result.success) {
        console.log(`✅ API test successful: Found ${result.data.length} banners`);
      } else {
        console.log('❌ API test failed:', result.message);
      }
    } catch (apiError) {
      console.log('❌ API test failed:', apiError.message);
    }

    console.log('');
    console.log('🎉 Hero banners setup completed!');
    console.log('📋 Next steps:');
    console.log('1. ✅ Hero banners table created and populated');
    console.log('2. 🔄 Next: Create product migration script');
    console.log('3. 🔄 Next: Create deals system');
    console.log('4. 🔄 Next: Update frontend integration');

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
  }
}

// Run the setup
setupDynamicTables();
// RitZone Hero Banners Cleanup Script
// ==============================================
// Remove duplicates and create exactly 8 unique hero banners

const { getAdminSupabaseClient } = require('../services/supabase-service');

const cleanupHeroBanners = async () => {
  try {
    const supabase = getAdminSupabaseClient();

    // Step 1: Get all current banners
    console.log('📋 Fetching current banners...');
    const { data: currentBanners, error: fetchError } = await supabase
      .from('hero_banners')
      .select('*')
      .order('sort_order');

    if (fetchError) {
      throw new Error(`Failed to fetch banners: ${fetchError.message}`);
    }

    console.log(`Found ${currentBanners.length} banners`);

    // Step 2: Delete all current banners
    console.log('🗑️ Clearing all existing banners...');
    const { error: deleteError } = await supabase
      .from('hero_banners')
      .delete()
      .neq('id', 'null'); // Delete all

    if (deleteError) {
      throw new Error(`Failed to delete banners: ${deleteError.message}`);
    }

    // Step 3: Create exactly 8 unique hero banners
    console.log('✨ Creating 8 unique hero banners...');
    const heroBanners = [
      {
        title: 'Fashion & Lifestyle',
        subtitle: 'Discover trendy styles and accessories for every occasion',
        image_url: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1200&h=400&fit=crop&crop=center',
        button_text: 'Shop Fashion',
        button_link: '/category/fashion',
        sort_order: 1,
        is_active: true
      },
      {
        title: 'Premium Shopping Experience',
        subtitle: 'Quality products delivered straight to your door',
        image_url: 'https://images.unsplash.com/photo-1534452203293-494d7ddbf7e0?w=1200&h=400&fit=crop&crop=center',
        button_text: 'Shop Now',
        button_link: '/',
        sort_order: 2,
        is_active: true
      },
      {
        title: 'Shop with Confidence',
        subtitle: 'Explore our vast selection in our modern retail space',
        image_url: 'https://images.unsplash.com/photo-1481437156560-3205f6a55735?w=1200&h=400&fit=crop&crop=center',
        button_text: 'Browse All',
        button_link: '/',
        sort_order: 3,
        is_active: true
      },
      {
        title: 'Weekend Shopping Spree',
        subtitle: 'Get amazing deals on all your favorite brands',
        image_url: 'https://images.unsplash.com/photo-1573855619003-97b4799dcd8b?w=1200&h=400&fit=crop&crop=center',
        button_text: 'View Deals',
        button_link: '/deals',
        sort_order: 4,
        is_active: true
      },
      {
        title: 'MEGA SALE EVENT',
        subtitle: 'Up to 70% off on electronics, fashion, and more!',
        image_url: 'https://images.unsplash.com/photo-1532795986-dbef1643a596?w=1200&h=400&fit=crop&crop=center',
        button_text: 'Shop Sale',
        button_link: '/deals',
        sort_order: 5,
        is_active: true
      },
      {
        title: 'Black Friday Deals',
        subtitle: 'Massive discounts across all categories - Limited time only',
        image_url: 'https://images.unsplash.com/photo-1607083206968-13611e3d76db?w=1200&h=400&fit=crop&crop=center',
        button_text: 'Shop Deals',
        button_link: '/deals',
        sort_order: 6,
        is_active: true
      },
      {
        title: 'Special Offers',
        subtitle: 'Exclusive deals and promotional prices just for you',
        image_url: 'https://images.pexels.com/photos/5868722/pexels-photo-5868722.jpeg?w=1200&h=400&fit=crop&crop=center',
        button_text: 'View Offers',
        button_link: '/deals',
        sort_order: 7,
        is_active: true
      },
      {
        title: 'Shop Online Anytime',
        subtitle: 'Convenient online shopping with fast delivery options',
        image_url: 'https://images.unsplash.com/photo-1586880244406-556ebe35f282?w=1200&h=400&fit=crop&crop=center',
        button_text: 'Start Shopping',
        button_link: '/',
        sort_order: 8,
        is_active: true
      }
    ];

    // Insert all banners
    const { data: newBanners, error: insertError } = await supabase
      .from('hero_banners')
      .insert(heroBanners)
      .select();

    if (insertError) {
      throw new Error(`Failed to create banners: ${insertError.message}`);
    }

    console.log(`✅ Successfully created ${newBanners.length} hero banners`);
    console.log('🎉 Hero banners cleanup completed!');

    // Verify the result
    const { data: finalBanners, error: verifyError } = await supabase
      .from('hero_banners')
      .select('*')
      .eq('is_active', true)
      .order('sort_order');

    if (verifyError) {
      throw new Error(`Failed to verify banners: ${verifyError.message}`);
    }

    console.log('\n📊 Final Banner Summary:');
    finalBanners.forEach((banner, index) => {
      console.log(`${index + 1}. "${banner.title}" - ${banner.button_text}`);
    });

    return { success: true, banners: finalBanners };

  } catch (error) {
    console.error('❌ Cleanup failed:', error.message);
    return { success: false, error: error.message };
  }
};

// Run the cleanup
cleanupHeroBanners()
  .then(result => {
    if (result.success) {
      console.log('\n🎊 Cleanup completed successfully!');
      process.exit(0);
    } else {
      console.error('\n💥 Cleanup failed:', result.error);
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('\n💥 Script error:', error.message);
    process.exit(1);
  });
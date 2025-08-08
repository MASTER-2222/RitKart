// Simple script to populate hero banners
const fs = require('fs');
const path = require('path');

// Load the backend services
const backendPath = path.join(__dirname, 'backend');
process.chdir(backendPath);

const { bannerService } = require('./services/supabase-service');

async function populateHeroBanners() {
  console.log('🚀 Populating hero banners...');

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

  try {
    console.log('📄 Inserting hero banners...');
    
    for (let i = 0; i < heroBanners.length; i++) {
      const banner = heroBanners[i];
      console.log(`⏳ Creating banner ${i + 1}: ${banner.title}`);
      
      const result = await bannerService.createBanner(banner);
      
      if (result.success) {
        console.log(`✅ Created banner: ${banner.title}`);
      } else {
        console.log(`❌ Failed to create banner: ${banner.title} - ${result.error}`);
      }
    }

    console.log('🧪 Testing banner API...');
    const banners = await bannerService.getAllBanners();
    
    if (banners.success) {
      console.log(`✅ API test successful: Found ${banners.banners.length} banners`);
      banners.banners.forEach(banner => {
        console.log(`  - ${banner.title} (Order: ${banner.sort_order})`);
      });
    } else {
      console.log('❌ API test failed:', banners.error);
    }

    console.log('');
    console.log('🎉 Hero banners populated successfully!');
    
  } catch (error) {
    console.error('❌ Error populating banners:', error.message);
  }
}

populateHeroBanners();
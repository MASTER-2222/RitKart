#!/usr/bin/env node

// RitZone Empty Categories Population Script
// ==========================================
// Populate empty categories with sample products to demonstrate dynamic functionality

const axios = require('axios');

const API_BASE_URL = 'https://ritkart-backend.onrender.com/api';

// Get category IDs by slug
const categoryMappings = {
    'home': 'Home & Garden',
    'sports': 'Sports & Outdoors', 
    'grocery': 'Grocery',
    'appliances': 'Appliances',
    'solar': 'Solar',
    'pharmacy': 'Pharmacy',
    'beauty': 'Beauty & Personal Care'
};

// Sample products for each empty category
const sampleProducts = {
    home: [
        {
            name: 'Instant Pot Duo 7-in-1 Electric Pressure Cooker, 8 Quart',
            price: 89.00,
            original_price: 129.00,
            description: 'The only multi-cooker with the proprietary Quick Cool technology.',
            short_description: 'Electric pressure cooker with 7 functions',
            sku: 'HOME-001',
            brand: 'Instant Pot',
            stock_quantity: 50,
            is_active: true,
            is_featured: true,
            images: ['https://images.unsplash.com/photo-1585515656617-d405f574bfa3?w=300&h=300&fit=crop&crop=center'],
            features: ['7-in-1 functionality', 'Quick Cool technology', '8 quart capacity'],
            rating_average: 4.7,
            rating_count: 1200,
            total_reviews: 1200
        },
        {
            name: 'KitchenAid Artisan Series 5-Quart Stand Mixer - Empire Red',
            price: 319.00,
            original_price: 449.00,
            description: 'Easily mix, knead and whip your favorite ingredients with less effort.',
            short_description: '5-quart stand mixer in Empire Red',
            sku: 'HOME-002',
            brand: 'KitchenAid',
            stock_quantity: 25,
            is_active: true,
            is_featured: false,
            images: ['https://images.unsplash.com/photo-1590736969955-71cc94901144?w=300&h=300&fit=crop&crop=center'],
            features: ['5-quart capacity', 'Tilt-head design', 'Multiple attachments'],
            rating_average: 4.8,
            rating_count: 850,
            total_reviews: 850
        },
        {
            name: 'Dyson V11 Torque Drive Cordless Vacuum Cleaner',
            price: 599.00,
            original_price: 699.00,
            description: 'Intelligently optimizes suction and run time across all floor types.',
            short_description: 'Cordless vacuum with intelligent suction',
            sku: 'HOME-003',
            brand: 'Dyson',
            stock_quantity: 15,
            is_active: true,
            is_featured: true,
            images: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=300&fit=crop&crop=center'],
            features: ['Intelligent optimization', 'LCD screen', '60 minutes run time'],
            rating_average: 4.6,
            rating_count: 600,
            total_reviews: 600
        }
    ],
    sports: [
        {
            name: 'Fitbit Charge 5 Advanced Fitness & Health Tracker with GPS',
            price: 149.00,
            original_price: 199.00,
            description: 'Advanced fitness tracker with built-in GPS and health metrics.',
            short_description: 'GPS fitness tracker with health monitoring',
            sku: 'SPORTS-001',
            brand: 'Fitbit',
            stock_quantity: 100,
            is_active: true,
            is_featured: true,
            images: ['https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=300&h=300&fit=crop&crop=center'],
            features: ['Built-in GPS', 'Sleep tracking', 'Heart rate monitoring'],
            rating_average: 4.2,
            rating_count: 2500,
            total_reviews: 2500
        },
        {
            name: 'Nike Men\'s Air Zoom Pegasus 39 Running Shoes - Black/White',
            price: 119.99,
            original_price: 139.99,
            description: 'Responsive cushioning in the Pegasus provides an energized ride.',
            short_description: 'Men\'s running shoes with responsive cushioning',
            sku: 'SPORTS-002',
            brand: 'Nike',
            stock_quantity: 80,
            is_active: true,
            is_featured: false,
            images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&h=300&fit=crop&crop=center'],
            features: ['Zoom Air cushioning', 'Breathable mesh', 'Durable rubber outsole'],
            rating_average: 4.5,
            rating_count: 1800,
            total_reviews: 1800
        }
    ],
    grocery: [
        {
            name: 'Organic Free-Range Eggs - 12 Count',
            price: 4.99,
            original_price: 5.99,
            description: 'Fresh organic eggs from free-range chickens.',
            short_description: 'Dozen organic free-range eggs',
            sku: 'GROCERY-001',
            brand: 'Vital Farms',
            stock_quantity: 200,
            is_active: true,
            is_featured: false,
            images: ['https://images.unsplash.com/photo-1569288052389-dac9b01ac2b5?w=300&h=300&fit=crop&crop=center'],
            features: ['Organic certified', 'Free-range', 'Grade AA'],
            rating_average: 4.7,
            rating_count: 400,
            total_reviews: 400
        },
        {
            name: 'Organic Whole Milk - Half Gallon',
            price: 3.49,
            original_price: 3.99,
            description: 'Fresh organic whole milk from grass-fed cows.',
            short_description: 'Half gallon organic whole milk',
            sku: 'GROCERY-002',
            brand: 'Organic Valley',
            stock_quantity: 150,
            is_active: true,
            is_featured: true,
            images: ['https://images.unsplash.com/photo-1559847703-d5f20562eb6a?w=300&h=300&fit=crop&crop=center'],
            features: ['Organic certified', 'Grass-fed cows', 'Vitamin D added'],
            rating_average: 4.6,
            rating_count: 300,
            total_reviews: 300
        }
    ],
    appliances: [
        {
            name: 'Ninja Professional Countertop Blender with 1100-Watt Base',
            price: 89.99,
            original_price: 119.99,
            description: 'Professional performance power that can crush ice.',
            short_description: '1100-watt professional blender',
            sku: 'APPLIANCE-001',
            brand: 'Ninja',
            stock_quantity: 35,
            is_active: true,
            is_featured: true,
            images: ['https://images.unsplash.com/photo-1570197788417-0e82375c9371?w=300&h=300&fit=crop&crop=center'],
            features: ['1100-watt motor', 'Total crushing blades', '72 oz pitcher'],
            rating_average: 4.4,
            rating_count: 1500,
            total_reviews: 1500
        }
    ],
    solar: [
        {
            name: 'Renogy 100W 12V Monocrystalline Solar Panel',
            price: 119.99,
            original_price: 149.99,
            description: 'High efficiency monocrystalline solar cell technology.',
            short_description: '100W monocrystalline solar panel',
            sku: 'SOLAR-001',
            brand: 'Renogy',
            stock_quantity: 20,
            is_active: true,
            is_featured: true,
            images: ['https://images.unsplash.com/photo-1509391366360-2e959784a276?w=300&h=300&fit=crop&crop=center'],
            features: ['Monocrystalline cells', '21% efficiency', '25-year warranty'],
            rating_average: 4.5,
            rating_count: 800,
            total_reviews: 800
        }
    ],
    pharmacy: [
        {
            name: 'Tylenol Extra Strength Caplets, 500 mg - 100 Count',
            price: 9.99,
            original_price: 12.99,
            description: 'Fast-acting pain relief and fever reducer.',
            short_description: 'Extra strength acetaminophen caplets',
            sku: 'PHARMACY-001',
            brand: 'Tylenol',
            stock_quantity: 500,
            is_active: true,
            is_featured: false,
            images: ['https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&h=300&fit=crop&crop=center'],
            features: ['500mg strength', 'Fast relief', 'Easy to swallow'],
            rating_average: 4.3,
            rating_count: 2000,
            total_reviews: 2000
        }
    ],
    beauty: [
        {
            name: 'CeraVe Foaming Facial Cleanser - Normal to Oily Skin 12 fl oz',
            price: 12.99,
            original_price: 16.99,
            description: 'Foaming face wash with essential ceramides and hyaluronic acid.',
            short_description: 'Foaming facial cleanser for normal to oily skin',
            sku: 'BEAUTY-001',
            brand: 'CeraVe',
            stock_quantity: 300,
            is_active: true,
            is_featured: true,
            images: ['https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=300&h=300&fit=crop&crop=center'],
            features: ['3 essential ceramides', 'Hyaluronic acid', 'Non-comedogenic'],
            rating_average: 4.6,
            rating_count: 8000,
            total_reviews: 8000
        },
        {
            name: 'The Ordinary Niacinamide 10% + Zinc 1% - 30ml',
            price: 7.90,
            original_price: 9.90,
            description: 'High-strength vitamin and mineral serum.',
            short_description: 'Niacinamide 10% + Zinc 1% serum',
            sku: 'BEAUTY-002',
            brand: 'The Ordinary',
            stock_quantity: 250,
            is_active: true,
            is_featured: false,
            images: ['https://images.unsplash.com/photo-1620916297892-5f4d5a82edf5?w=300&h=300&fit=crop&crop=center'],
            features: ['10% Niacinamide', '1% Zinc', 'Oil control'],
            rating_average: 4.4,
            rating_count: 5000,
            total_reviews: 5000
        }
    ]
};

async function getCategories() {
    try {
        console.log('📂 Fetching categories...');
        const response = await axios.get(`${API_BASE_URL}/categories`);
        return response.data.success ? response.data.data : [];
    } catch (error) {
        console.error('❌ Error fetching categories:', error.message);
        return [];
    }
}

async function createProduct(product, categoryId) {
    try {
        const productData = {
            ...product,
            category_id: categoryId,
            slug: product.name.toLowerCase()
                .replace(/[^a-z0-9\s-]/g, '')
                .replace(/\s+/g, '-')
                .replace(/-+/g, '-')
                .trim()
        };

        console.log(`   📋 Product data for ${product.name.slice(0, 20)}:`, {
            name: productData.name,
            description: productData.description ? 'Present' : 'Missing',
            price: productData.price,
            category_id: productData.category_id,
            sku: productData.sku
        });

        const response = await axios.post(`${API_BASE_URL}/products`, productData);
        return response.data.success;
    } catch (error) {
        if (error.response) {
            console.error(`❌ API Error for ${product.name.slice(0, 30)}:`);
            console.error(`   Status: ${error.response.status}`);
            console.error(`   Message: ${error.response.data?.message || 'Unknown error'}`);
            console.error(`   Missing fields: ${error.response.data?.missing || 'None specified'}`);
        } else {
            console.error(`❌ Network Error for ${product.name}:`, error.message);
        }
        return false;
    }
}

async function populateEmptyCategories() {
    try {
        console.log('🚀 RitZone Empty Categories Population');
        console.log('=====================================\n');

        const categories = await getCategories();
        if (categories.length === 0) {
            console.error('❌ No categories found');
            return;
        }

        // Create slug to ID mapping
        const categorySlugToId = {};
        categories.forEach(cat => {
            categorySlugToId[cat.slug] = cat.id;
        });

        let totalProductsCreated = 0;

        for (const [categorySlug, products] of Object.entries(sampleProducts)) {
            const categoryId = categorySlugToId[categorySlug];
            if (!categoryId) {
                console.log(`⚠️  Category '${categorySlug}' not found in database, skipping...`);
                continue;
            }

            console.log(`\n📦 Populating ${categorySlug} category (${products.length} products)...`);
            
            for (const product of products) {
                console.log(`   Creating: ${product.name.slice(0, 50)}...`);
                const success = await createProduct(product, categoryId);
                if (success) {
                    console.log(`   ✅ Created: ${product.name.slice(0, 30)}...`);
                    totalProductsCreated++;
                } else {
                    console.log(`   ❌ Failed: ${product.name.slice(0, 30)}...`);
                }
            }
        }

        console.log('\n🎉 Population Summary:');
        console.log(`   📦 Products Created: ${totalProductsCreated}`);
        console.log(`   📂 Categories Populated: ${Object.keys(sampleProducts).length}`);
        
        console.log('\n✅ Empty categories population completed!');
        console.log('\n📋 Next Steps:');
        console.log('   1. Test category pages to verify dynamic loading');
        console.log('   2. Verify all empty categories now show products');
        console.log('   3. Test frontend functionality with dynamic data');
        
    } catch (error) {
        console.error('❌ Population failed:', error.message);
    }
}

// Only run if called directly
if (require.main === module) {
    // Check if axios is available
    try {
        require.resolve('axios');
        populateEmptyCategories();
    } catch (e) {
        console.error('❌ axios module not found. Please run: npm install axios');
        console.log('\nAlternatively, you can run this script from the backend directory:');
        console.log('   cd backend && node ../populate-empty-categories.js');
    }
}

module.exports = { populateEmptyCategories, sampleProducts };
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials. Please check your .env file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const beautyCategoryId = 'd713a6b8-015b-4c3c-94da-90df2073afc5'; // Beauty category UUID

const beautyProducts = [
  {
    name: 'CeraVe Foaming Facial Cleanser - Normal to Oily Skin 12 fl oz',
    slug: 'cerave-foaming-facial-cleanser-12oz',
    description: 'Gentle foaming face cleanser developed with dermatologists. Removes makeup and excess oil while maintaining the skin\'s natural barrier.',
    short_description: 'Gentle foaming facial cleanser for oily skin',
    sku: 'BE1-CERAVE-FOAMING-CLEANSER-12OZ',
    price: 14.99,
    original_price: 18.99,
    category_id: beautyCategoryId,
    brand: 'CeraVe',
    stock_quantity: 150,
    is_active: true,
    is_featured: true,
    images: ['https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=300&h=300&fit=crop&crop=center'],
    features: ['Foaming Formula', 'For Normal to Oily Skin', 'Dermatologist Developed', 'Non-Comedogenic'],
    specifications: { "size": "12 fl oz", "skin_type": "Normal to oily", "formulation": "Foaming cleanser", "key_ingredients": "Ceramides, Niacinamide" },
    rating_average: 4.6,
    rating_count: 89234,
    total_reviews: 89234
  },
  {
    name: 'The Ordinary Niacinamide 10% + Zinc 1% - Oil Control Serum 30ml',
    slug: 'the-ordinary-niacinamide-zinc-serum-30ml',
    description: 'High-strength niacinamide serum with zinc to reduce the appearance of blemishes and congestion. Helps balance oil production.',
    short_description: 'Niacinamide 10% + Zinc oil control serum',
    sku: 'BE2-ORDINARY-NIACINAMIDE-ZINC-30ML',
    price: 7.20,
    original_price: 8.50,
    category_id: beautyCategoryId,
    brand: 'The Ordinary',
    stock_quantity: 200,
    is_active: true,
    is_featured: true,
    images: ['https://images.unsplash.com/photo-1556228720-195a672e8a03?w=300&h=300&fit=crop&crop=center'],
    features: ['10% Niacinamide', '1% Zinc', 'Oil Control', 'Blemish Reducing'],
    specifications: { "size": "30ml", "key_ingredients": "10% Niacinamide, 1% Zinc PCA", "benefits": "Oil control, blemish reduction", "skin_type": "All skin types" },
    rating_average: 4.4,
    rating_count: 45678,
    total_reviews: 45678
  },
  {
    name: 'Maybelline Instant Age Rewind Eraser Concealer - Medium Coverage',
    slug: 'maybelline-age-rewind-concealer-medium',
    description: 'Multi-use concealer with medium coverage. Features an applicator that helps smooth and blend for a flawless finish.',
    short_description: 'Medium coverage concealer with applicator',
    sku: 'BE3-MAYBELLINE-AGE-REWIND-CONCEALER',
    price: 8.99,
    original_price: 11.99,
    category_id: beautyCategoryId,
    brand: 'Maybelline',
    stock_quantity: 120,
    is_active: true,
    is_featured: false,
    images: ['https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=300&h=300&fit=crop&crop=center'],
    features: ['Medium Coverage', 'Age Rewind Formula', 'Built-in Applicator', 'Multi-Use'],
    specifications: { "coverage": "Medium", "finish": "Natural", "application": "Built-in micro-corrector applicator", "benefits": "Covers dark circles and imperfections" },
    rating_average: 4.3,
    rating_count: 67890,
    total_reviews: 67890
  },
  {
    name: 'Neutrogena Hydrating Hyaluronic Acid Serum - Plumps & Smooths',
    slug: 'neutrogena-hydrating-hyaluronic-serum',
    description: 'Lightweight hydrating serum with hyaluronic acid that plumps and smooths skin. Provides intense moisture for up to 24 hours.',
    short_description: 'Hydrating hyaluronic acid plumping serum',
    sku: 'BE4-NEUTROGENA-HYALURONIC-SERUM',
    price: 19.99,
    original_price: 24.99,
    category_id: beautyCategoryId,
    brand: 'Neutrogena',
    stock_quantity: 90,
    is_active: true,
    is_featured: true,
    images: ['https://images.unsplash.com/photo-1556228720-195a672e8a03?w=300&h=300&fit=crop&crop=center'],
    features: ['Hyaluronic Acid', '24-Hour Hydration', 'Plumps & Smooths', 'Lightweight Formula'],
    specifications: { "key_ingredient": "Hyaluronic Acid", "hydration": "24 hours", "texture": "Lightweight serum", "benefits": "Plumps and smooths skin" },
    rating_average: 4.5,
    rating_count: 23456,
    total_reviews: 23456
  },
  {
    name: 'L\'Oreal Paris Voluminous Lash Paradise Mascara - Blackest Black',
    slug: 'loreal-voluminous-lash-paradise-mascara',
    description: 'Volumizing mascara with soft wavy bristle brush for full, voluminous lashes. Feathery-soft formula provides intense volume.',
    short_description: 'Voluminous mascara for full lashes',
    sku: 'BE5-LOREAL-LASH-PARADISE-MASCARA',
    price: 11.99,
    original_price: 14.99,
    category_id: beautyCategoryId,
    brand: 'L\'Oreal Paris',
    stock_quantity: 180,
    is_active: true,
    is_featured: false,
    images: ['https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=300&h=300&fit=crop&crop=center'],
    features: ['Voluminous Formula', 'Soft Wavy Bristles', 'Blackest Black', 'Feathery-Soft'],
    specifications: { "color": "Blackest Black", "brush": "Soft wavy bristle", "formula": "Feathery-soft", "effect": "Volume and length" },
    rating_average: 4.4,
    rating_count: 34567,
    total_reviews: 34567
  },
  {
    name: 'Fenty Beauty Gloss Bomb Universal Lip Luminizer - Fenty Glow',
    slug: 'fenty-beauty-gloss-bomb-fenty-glow',
    description: 'Universal lip luminizer that delivers explosive shine. Non-sticky formula with peach-vanilla scent that flatters all skin tones.',
    short_description: 'Universal lip luminizer with explosive shine',
    sku: 'BE6-FENTY-GLOSS-BOMB-GLOW',
    price: 21,
    original_price: 24,
    category_id: beautyCategoryId,
    brand: 'Fenty Beauty',
    stock_quantity: 85,
    is_active: true,
    is_featured: true,
    images: ['https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=300&h=300&fit=crop&crop=center'],
    features: ['Universal Shade', 'Explosive Shine', 'Non-Sticky', 'Peach-Vanilla Scent'],
    specifications: { "shade": "Fenty Glow - Universal", "finish": "High shine", "texture": "Non-sticky", "scent": "Peach-vanilla" },
    rating_average: 4.7,
    rating_count: 12345,
    total_reviews: 12345
  },
  {
    name: 'Olaplex No.3 Hair Perfector - Strengthening Treatment 3.3 fl oz',
    slug: 'olaplex-no3-hair-perfector-treatment',
    description: 'At-home bond building hair treatment that reduces breakage and strengthens hair. Works to repair damaged hair bonds.',
    short_description: 'Bond building hair strengthening treatment',
    sku: 'BE7-OLAPLEX-NO3-TREATMENT-3.3OZ',
    price: 28,
    original_price: 32,
    category_id: beautyCategoryId,
    brand: 'Olaplex',
    stock_quantity: 75,
    is_active: true,
    is_featured: true,
    images: ['https://images.unsplash.com/photo-1526045612212-70caf35c14df?w=300&h=300&fit=crop&crop=center'],
    features: ['Bond Building', 'Strengthens Hair', 'Reduces Breakage', 'At-Home Treatment'],
    specifications: { "size": "3.3 fl oz", "treatment_type": "Bond building", "usage": "Weekly at-home treatment", "benefits": "Strengthens and repairs damaged hair" },
    rating_average: 4.6,
    rating_count: 56789,
    total_reviews: 56789
  },
  {
    name: 'Rare Beauty Soft Pinch Liquid Blush - Joy (Soft Coral Pink)',
    slug: 'rare-beauty-soft-pinch-blush-joy',
    description: 'Weightless liquid blush that blends seamlessly for a natural flush. Buildable formula in a soft coral pink shade.',
    short_description: 'Weightless liquid blush in coral pink',
    sku: 'BE8-RARE-SOFT-PINCH-BLUSH-JOY',
    price: 23,
    original_price: 26,
    category_id: beautyCategoryId,
    brand: 'Rare Beauty',
    stock_quantity: 95,
    is_active: true,
    is_featured: false,
    images: ['https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=300&h=300&fit=crop&crop=center'],
    features: ['Liquid Formula', 'Buildable Coverage', 'Natural Flush', 'Weightless Feel'],
    specifications: { "shade": "Joy - Soft Coral Pink", "formula": "Liquid blush", "finish": "Natural flush", "coverage": "Buildable" },
    rating_average: 4.5,
    rating_count: 8765,
    total_reviews: 8765
  },
  {
    name: 'Drunk Elephant C-Firma Day Serum - Vitamin C Antioxidant Serum',
    slug: 'drunk-elephant-c-firma-vitamin-c-serum',
    description: 'Potent vitamin C day serum with 15% L-Ascorbic Acid. Provides antioxidant protection and helps improve skin firmness and brightness.',
    short_description: 'Potent vitamin C antioxidant day serum',
    sku: 'BE9-DRUNK-ELEPHANT-C-FIRMA-SERUM',
    price: 78,
    original_price: 89,
    category_id: beautyCategoryId,
    brand: 'Drunk Elephant',
    stock_quantity: 50,
    is_active: true,
    is_featured: true,
    images: ['https://images.unsplash.com/photo-1556228720-195a672e8a03?w=300&h=300&fit=crop&crop=center'],
    features: ['15% L-Ascorbic Acid', 'Antioxidant Protection', 'Brightening', 'Firming'],
    specifications: { "vitamin_c_concentration": "15% L-Ascorbic Acid", "usage": "Morning use", "benefits": "Antioxidant protection, brightening, firming", "skin_type": "All skin types" },
    rating_average: 4.3,
    rating_count: 15678,
    total_reviews: 15678
  },
  {
    name: 'Urban Decay All Nighter Long-Lasting Makeup Setting Spray',
    slug: 'urban-decay-all-nighter-setting-spray',
    description: 'Long-lasting makeup setting spray that keeps makeup in place for up to 16 hours. Lightweight, comfortable formula.',
    short_description: 'Long-lasting makeup setting spray 16 hours',
    sku: 'BE10-URBAN-DECAY-ALL-NIGHTER-SPRAY',
    price: 33,
    original_price: 38,
    category_id: beautyCategoryId,
    brand: 'Urban Decay',
    stock_quantity: 110,
    is_active: true,
    is_featured: false,
    images: ['https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=300&h=300&fit=crop&crop=center'],
    features: ['16-Hour Wear', 'Makeup Setting', 'Lightweight Formula', 'Temperature Control'],
    specifications: { "wear_time": "Up to 16 hours", "formula": "Lightweight setting spray", "benefits": "Locks makeup in place", "usage": "Final makeup step" },
    rating_average: 4.6,
    rating_count: 23456,
    total_reviews: 23456
  },
  {
    name: 'Glossier Boy Brow Eyebrow Fluffing Hair Gel - Brown Universal Shade',
    slug: 'glossier-boy-brow-eyebrow-gel-brown',
    description: 'Tinted eyebrow gel that fluffs, shapes, and defines brows. Creates natural-looking fuller brows with flexible hold.',
    short_description: 'Tinted eyebrow fluffing gel brown shade',
    sku: 'BE11-GLOSSIER-BOY-BROW-BROWN',
    price: 18,
    original_price: 20,
    category_id: beautyCategoryId,
    brand: 'Glossier',
    stock_quantity: 140,
    is_active: true,
    is_featured: false,
    images: ['https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=300&h=300&fit=crop&crop=center'],
    features: ['Tinted Formula', 'Fluffing Effect', 'Flexible Hold', 'Natural Look'],
    specifications: { "shade": "Brown - Universal", "formula": "Tinted eyebrow gel", "hold": "Flexible", "effect": "Fluffs and shapes brows" },
    rating_average: 4.4,
    rating_count: 34567,
    total_reviews: 34567
  },
  {
    name: 'Sunday Riley Good Genes All-In-One Lactic Acid Treatment 30ml',
    slug: 'sunday-riley-good-genes-lactic-acid-30ml',
    description: 'All-in-one lactic acid treatment that exfoliates, brightens, and smooths skin texture. Delivers radiant, youthful-looking skin.',
    short_description: 'Lactic acid exfoliating brightening treatment',
    sku: 'BE12-SUNDAY-RILEY-GOOD-GENES-30ML',
    price: 122,
    original_price: 144,
    category_id: beautyCategoryId,
    brand: 'Sunday Riley',
    stock_quantity: 35,
    is_active: true,
    is_featured: true,
    images: ['https://images.unsplash.com/photo-1556228720-195a672e8a03?w=300&h=300&fit=crop&crop=center'],
    features: ['Lactic Acid', 'Exfoliating', 'Brightening', 'All-in-One Treatment'],
    specifications: { "size": "30ml", "key_ingredient": "Lactic Acid", "benefits": "Exfoliation, brightening, texture smoothing", "usage": "Evening treatment" },
    rating_average: 4.5,
    rating_count: 8901,
    total_reviews: 8901
  }
];

async function migrateBeautyProducts() {
  console.log('🚀 Starting Beauty products migration (Complete - All 12 products)...');
  console.log(`📦 Total products to migrate: ${beautyProducts.length}`);

  let successCount = 0;
  let failedCount = 0;
  let skippedCount = 0;
  const errors = [];

  for (const product of beautyProducts) {
    try {
      // Check if product already exists by SKU
      const { data: existingProduct } = await supabase
        .from('products')
        .select('id, sku')
        .eq('sku', product.sku)
        .single();

      if (existingProduct) {
        console.log(`⚠️ Product already exists, skipping: ${product.name} (${product.sku})`);
        skippedCount++;
        continue;
      }

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
  console.log(`⚠️ Skipped (already exists): ${skippedCount}`);
  console.log(`❌ Failed: ${failedCount}`);
  console.log(`📈 Success Rate: ${((successCount / (beautyProducts.length - skippedCount)) * 100).toFixed(1)}%`);
  
  if (errors.length > 0) {
    console.log('\n🔍 FAILED PRODUCTS:');
    errors.forEach(({ sku, error }) => {
      console.log(`  • ${sku}: ${error}`);
    });
  }

  // Verify the migration
  console.log('\n🔍 Verifying Beauty category in database...');
  const { data: beautyCount, error: countError } = await supabase
    .from('products')
    .select('id', { count: 'exact' })
    .eq('category_id', beautyCategoryId);

  if (!countError) {
    console.log(`✅ Beauty category now has ${beautyCount?.length || 0} products total`);
  }

  console.log('\n🎉 Beauty products migration completed!');
}

// Run the migration
migrateBeautyProducts().catch(console.error);
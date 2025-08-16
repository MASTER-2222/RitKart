const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials. Please check your .env file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const pharmacyCategoryId = 'c9eb705e-efbf-4233-ab81-24feb9bd51d2'; // Pharmacy category UUID

const pharmacyProducts = [
  {
    name: 'Tylenol Extra Strength Pain Reliever - 500mg Caplets 100 Count',
    slug: 'tylenol-extra-strength-500mg-100ct',
    description: 'Extra strength acetaminophen pain reliever and fever reducer. Effective relief from headaches, muscle aches, and arthritis pain.',
    short_description: 'Extra strength pain reliever 500mg',
    sku: 'PH1-TYLENOL-500MG-100CT',
    price: 12.99,
    original_price: 15.99,
    category_id: pharmacyCategoryId,
    brand: 'Tylenol',
    stock_quantity: 100,
    is_active: true,
    is_featured: true,
    images: ['https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=300&h=300&fit=crop&crop=center'],
    features: ['Extra Strength', '500mg Acetaminophen', 'Pain Relief', 'Fever Reducer'],
    specifications: { "active_ingredient": "Acetaminophen 500mg", "count": "100 caplets", "dosage": "Take 2 every 6 hours" },
    rating_average: 4.7,
    rating_count: 23456,
    total_reviews: 23456
  },
  {
    name: 'Advil Liqui-Gels Pain Reliever and Fever Reducer - 200mg 80 Count',
    slug: 'advil-liqui-gels-200mg-80ct',
    description: 'Fast-acting ibuprofen liquid-filled capsules for pain relief and fever reduction. Easy to swallow gel capsules.',
    short_description: 'Fast-acting liquid gel pain reliever',
    sku: 'PH2-ADVIL-LIQUI-200MG-80CT',
    price: 14.49,
    original_price: 17.99,
    category_id: pharmacyCategoryId,
    brand: 'Advil',
    stock_quantity: 85,
    is_active: true,
    is_featured: true,
    images: ['https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=300&h=300&fit=crop&crop=center'],
    features: ['Liqui-Gels', 'Fast Acting', '200mg Ibuprofen', 'Easy Swallow'],
    specifications: { "active_ingredient": "Ibuprofen 200mg", "count": "80 capsules", "form": "Liquid gel capsules" },
    rating_average: 4.6,
    rating_count: 18765,
    total_reviews: 18765
  },
  {
    name: 'Claritin 24 Hour Allergy Relief - Non-Drowsy 30 Tablets',
    slug: 'claritin-24hr-allergy-relief-30ct',
    description: '24-hour non-drowsy allergy relief from pollen, dust, and pet dander. Long-lasting antihistamine protection.',
    short_description: '24-hour non-drowsy allergy relief',
    sku: 'PH3-CLARITIN-24HR-30CT',
    price: 19.99,
    original_price: 24.99,
    category_id: pharmacyCategoryId,
    brand: 'Claritin',
    stock_quantity: 60,
    is_active: true,
    is_featured: false,
    images: ['https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&h=300&fit=crop&crop=center'],
    features: ['24 Hour Relief', 'Non-Drowsy', 'Antihistamine', 'Indoor/Outdoor Allergies'],
    specifications: { "active_ingredient": "Loratadine 10mg", "duration": "24 hours", "count": "30 tablets" },
    rating_average: 4.5,
    rating_count: 15432,
    total_reviews: 15432
  },
  {
    name: 'Pepto-Bismol Original Liquid for Upset Stomach - 16 fl oz',
    slug: 'pepto-bismol-original-liquid-16oz',
    description: 'Original formula liquid antacid for upset stomach, nausea, heartburn, and diarrhea relief.',
    short_description: 'Upset stomach and diarrhea relief',
    sku: 'PH4-PEPTO-ORIGINAL-16OZ',
    price: 8.99,
    original_price: 11.49,
    category_id: pharmacyCategoryId,
    brand: 'Pepto-Bismol',
    stock_quantity: 75,
    is_active: true,
    is_featured: false,
    images: ['https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=300&h=300&fit=crop&crop=center'],
    features: ['Original Formula', 'Upset Stomach Relief', 'Anti-Diarrhea', 'Liquid Form'],
    specifications: { "size": "16 fl oz", "symptoms": "Upset stomach, nausea, diarrhea", "form": "Liquid" },
    rating_average: 4.4,
    rating_count: 12345,
    total_reviews: 12345
  },
  {
    name: 'Centrum Adult Multivitamin - 365 Count Complete Daily Vitamins',
    slug: 'centrum-adult-multivitamin-365ct',
    description: 'Complete daily multivitamin with essential vitamins and minerals for overall health support.',
    short_description: 'Complete daily multivitamin 365 count',
    sku: 'PH5-CENTRUM-ADULT-365CT',
    price: 24.99,
    original_price: 29.99,
    category_id: pharmacyCategoryId,
    brand: 'Centrum',
    stock_quantity: 40,
    is_active: true,
    is_featured: true,
    images: ['https://images.unsplash.com/photo-1550572017-edd951aa8f72?w=300&h=300&fit=crop&crop=center'],
    features: ['Complete Nutrition', '365 Day Supply', 'Essential Vitamins', 'Mineral Support'],
    specifications: { "count": "365 tablets", "serving": "1 tablet daily", "nutrients": "23 vitamins and minerals" },
    rating_average: 4.3,
    rating_count: 34567,
    total_reviews: 34567
  },
  {
    name: 'Benadryl Allergy Ultratabs - Antihistamine 100 Count',
    slug: 'benadryl-allergy-ultratabs-100ct',
    description: 'Fast-acting antihistamine for temporary relief of allergy symptoms including sneezing and runny nose.',
    short_description: 'Fast-acting allergy relief tablets',
    sku: 'PH6-BENADRYL-ULTRATABS-100CT',
    price: 11.99,
    original_price: 14.99,
    category_id: pharmacyCategoryId,
    brand: 'Benadryl',
    stock_quantity: 70,
    is_active: true,
    is_featured: false,
    images: ['https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&h=300&fit=crop&crop=center'],
    features: ['Fast Acting', 'Antihistamine', 'Allergy Relief', '100 Count'],
    specifications: { "active_ingredient": "Diphenhydramine HCl 25mg", "count": "100 tablets", "relief": "Allergy symptoms" },
    rating_average: 4.6,
    rating_count: 8901,
    total_reviews: 8901
  },
  {
    name: 'Tums Extra Strength Antacid Chewable Tablets - Assorted Fruit 96 Count',
    slug: 'tums-extra-strength-antacid-96ct',
    description: 'Extra strength calcium carbonate antacid for fast heartburn and acid indigestion relief. Assorted fruit flavors.',
    short_description: 'Extra strength antacid chewable tablets',
    sku: 'PH7-TUMS-EXTRA-96CT',
    price: 7.99,
    original_price: 9.99,
    category_id: pharmacyCategoryId,
    brand: 'Tums',
    stock_quantity: 90,
    is_active: true,
    is_featured: false,
    images: ['https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=300&h=300&fit=crop&crop=center'],
    features: ['Extra Strength', 'Chewable', 'Assorted Fruit Flavors', 'Fast Relief'],
    specifications: { "active_ingredient": "Calcium Carbonate 750mg", "flavors": "Assorted fruit", "count": "96 tablets" },
    rating_average: 4.5,
    rating_count: 16789,
    total_reviews: 16789
  },
  {
    name: 'Robitussin DM Cough + Chest Congestion Relief - 8 fl oz',
    slug: 'robitussin-dm-cough-chest-8oz',
    description: 'Cough suppressant and expectorant to relieve cough and chest congestion. Non-drowsy formula.',
    short_description: 'Cough and chest congestion relief',
    sku: 'PH8-ROBITUSSIN-DM-8OZ',
    price: 9.49,
    original_price: 12.49,
    category_id: pharmacyCategoryId,
    brand: 'Robitussin',
    stock_quantity: 65,
    is_active: true,
    is_featured: false,
    images: ['https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=300&h=300&fit=crop&crop=center'],
    features: ['Cough Suppressant', 'Expectorant', 'Non-Drowsy', '8 fl oz'],
    specifications: { "size": "8 fl oz", "symptoms": "Cough and chest congestion", "formula": "Non-drowsy" },
    rating_average: 4.2,
    rating_count: 7654,
    total_reviews: 7654
  },
  {
    name: 'Metamucil Daily Fiber Supplement - Orange Smooth 72 Doses',
    slug: 'metamucil-fiber-orange-72doses',
    description: 'Daily fiber supplement to promote digestive health and regularity. Orange smooth texture.',
    short_description: 'Daily fiber supplement orange flavor',
    sku: 'PH9-METAMUCIL-ORANGE-72',
    price: 18.99,
    original_price: 22.99,
    category_id: pharmacyCategoryId,
    brand: 'Metamucil',
    stock_quantity: 50,
    is_active: true,
    is_featured: false,
    images: ['https://images.unsplash.com/photo-1550572017-edd951aa8f72?w=300&h=300&fit=crop&crop=center'],
    features: ['Daily Fiber', 'Digestive Health', 'Orange Flavor', '72 Doses'],
    specifications: { "fiber_source": "Psyllium husk", "flavor": "Orange smooth", "doses": "72 servings" },
    rating_average: 4.4,
    rating_count: 11234,
    total_reviews: 11234
  },
  {
    name: 'Sudafed PE Sinus Pressure + Pain Relief - 36 Caplets',
    slug: 'sudafed-pe-sinus-pressure-36ct',
    description: 'Decongestant and pain reliever for sinus pressure and pain relief. Non-drowsy formula.',
    short_description: 'Sinus pressure and pain relief',
    sku: 'PH10-SUDAFED-PE-36CT',
    price: 8.49,
    original_price: 10.99,
    category_id: pharmacyCategoryId,
    brand: 'Sudafed',
    stock_quantity: 80,
    is_active: true,
    is_featured: false,
    images: ['https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&h=300&fit=crop&crop=center'],
    features: ['Decongestant', 'Pain Reliever', 'Non-Drowsy', 'Sinus Relief'],
    specifications: { "ingredients": "Phenylephrine + Acetaminophen", "count": "36 caplets", "formula": "Non-drowsy" },
    rating_average: 4.1,
    rating_count: 5432,
    total_reviews: 5432
  },
  {
    name: 'Imodium A-D Anti-Diarrheal Caplets - 24 Count',
    slug: 'imodium-ad-anti-diarrheal-24ct',
    description: 'Anti-diarrheal medication for the control and symptomatic relief of acute non-specific diarrhea.',
    short_description: 'Anti-diarrheal relief caplets',
    sku: 'PH11-IMODIUM-AD-24CT',
    price: 11.99,
    original_price: 14.49,
    category_id: pharmacyCategoryId,
    brand: 'Imodium',
    stock_quantity: 55,
    is_active: true,
    is_featured: false,
    images: ['https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=300&h=300&fit=crop&crop=center'],
    features: ['Anti-Diarrheal', 'Fast Acting', 'Symptomatic Relief', '24 Caplets'],
    specifications: { "active_ingredient": "Loperamide HCl 2mg", "indication": "Diarrhea control", "count": "24 caplets" },
    rating_average: 4.3,
    rating_count: 6789,
    total_reviews: 6789
  },
  {
    name: 'Aspirin 81mg Low Dose Enteric Coated Tablets - 365 Count',
    slug: 'aspirin-81mg-low-dose-365ct',
    description: 'Low dose aspirin for cardiovascular health support. Enteric coated to reduce stomach irritation.',
    short_description: 'Low dose aspirin 81mg enteric coated',
    sku: 'PH12-ASPIRIN-81MG-365CT',
    price: 9.99,
    original_price: 12.99,
    category_id: pharmacyCategoryId,
    brand: 'Bayer',
    stock_quantity: 95,
    is_active: true,
    is_featured: false,
    images: ['https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=300&h=300&fit=crop&crop=center'],
    features: ['Low Dose', 'Enteric Coated', 'Heart Health', '365 Count'],
    specifications: { "dosage": "81mg", "coating": "Enteric coated", "indication": "Cardiovascular health", "count": "365 tablets" },
    rating_average: 4.6,
    rating_count: 19876,
    total_reviews: 19876
  },
  {
    name: 'Mucinex DM 12-Hour Expectorant and Cough Suppressant - 40 Tablets',
    slug: 'mucinex-dm-12hr-expectorant-40ct',
    description: '12-hour extended-release expectorant and cough suppressant for chest congestion and cough relief.',
    short_description: '12-hour expectorant and cough suppressant',
    sku: 'PH13-MUCINEX-DM-12HR-40CT',
    price: 16.99,
    original_price: 21.99,
    category_id: pharmacyCategoryId,
    brand: 'Mucinex',
    stock_quantity: 45,
    is_active: true,
    is_featured: false,
    images: ['https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=300&h=300&fit=crop&crop=center'],
    features: ['12-Hour Relief', 'Extended Release', 'Expectorant', 'Cough Suppressant'],
    specifications: { "duration": "12 hours", "ingredients": "Guaifenesin + Dextromethorphan", "count": "40 tablets" },
    rating_average: 4.4,
    rating_count: 9876,
    total_reviews: 9876
  },
  {
    name: 'Zyrtec 24 Hour Allergy Relief Tablets - 70 Count',
    slug: 'zyrtec-24hr-allergy-relief-70ct',
    description: '24-hour allergy relief from indoor and outdoor allergens. Powerful antihistamine protection.',
    short_description: '24-hour allergy relief tablets',
    sku: 'PH14-ZYRTEC-24HR-70CT',
    price: 22.99,
    original_price: 27.99,
    category_id: pharmacyCategoryId,
    brand: 'Zyrtec',
    stock_quantity: 35,
    is_active: true,
    is_featured: true,
    images: ['https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&h=300&fit=crop&crop=center'],
    features: ['24-Hour Relief', 'Indoor/Outdoor Allergies', 'Antihistamine', '70 Count'],
    specifications: { "active_ingredient": "Cetirizine HCl 10mg", "duration": "24 hours", "count": "70 tablets" },
    rating_average: 4.5,
    rating_count: 14567,
    total_reviews: 14567
  },
  {
    name: 'Prilosec OTC Acid Reducer - 42 Count Delayed Release Tablets',
    slug: 'prilosec-otc-acid-reducer-42ct',
    description: 'Over-the-counter proton pump inhibitor for frequent heartburn treatment. 24-hour acid control.',
    short_description: '24-hour acid reducer tablets',
    sku: 'PH15-PRILOSEC-OTC-42CT',
    price: 19.99,
    original_price: 24.99,
    category_id: pharmacyCategoryId,
    brand: 'Prilosec',
    stock_quantity: 40,
    is_active: true,
    is_featured: false,
    images: ['https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=300&h=300&fit=crop&crop=center'],
    features: ['24-Hour Control', 'Delayed Release', 'Heartburn Treatment', 'Acid Reducer'],
    specifications: { "active_ingredient": "Omeprazole 20mg", "duration": "24 hours", "form": "Delayed release" },
    rating_average: 4.3,
    rating_count: 12345,
    total_reviews: 12345
  }
];

async function migratePharmacyProducts() {
  console.log('🚀 Starting Pharmacy products migration (First 15 products)...');
  console.log(`📦 Total products to migrate: ${pharmacyProducts.length}`);

  let successCount = 0;
  let failedCount = 0;
  let skippedCount = 0;
  const errors = [];

  for (const product of pharmacyProducts) {
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
  console.log(`📈 Success Rate: ${((successCount / (pharmacyProducts.length - skippedCount)) * 100).toFixed(1)}%`);
  
  if (errors.length > 0) {
    console.log('\n🔍 FAILED PRODUCTS:');
    errors.forEach(({ sku, error }) => {
      console.log(`  • ${sku}: ${error}`);
    });
  }

  // Verify the migration
  console.log('\n🔍 Verifying Pharmacy category in database...');
  const { data: pharmacyCount, error: countError } = await supabase
    .from('products')
    .select('id', { count: 'exact' })
    .eq('category_id', pharmacyCategoryId);

  if (!countError) {
    console.log(`✅ Pharmacy category now has ${pharmacyCount?.length || 0} products total`);
  }

  console.log('\n🎉 Pharmacy products migration (Part 1) completed!');
}

// Run the migration
migratePharmacyProducts().catch(console.error);
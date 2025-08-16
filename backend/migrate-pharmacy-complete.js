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

// Complete list of all 36 Pharmacy products
const allPharmacyProducts = [
  // Products 16-36 (adding remaining products)
  {
    name: 'Flonase Allergy Relief Nasal Spray - 144 Metered Sprays',
    slug: 'flonase-allergy-nasal-spray-144',
    description: '24-hour non-drowsy allergy relief nasal spray. Prescription strength for seasonal and year-round allergies.',
    short_description: '24-hour allergy relief nasal spray',
    sku: 'PH16-FLONASE-NASAL-144',
    price: 17.49,
    original_price: 21.99,
    category_id: pharmacyCategoryId,
    brand: 'Flonase',
    stock_quantity: 50,
    is_active: true,
    is_featured: false,
    images: ['https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&h=300&fit=crop&crop=center'],
    features: ['Nasal Spray', '24-Hour Relief', 'Prescription Strength', '144 Sprays'],
    specifications: { "active_ingredient": "Fluticasone Propionate", "sprays": "144 metered sprays", "duration": "24 hours" },
    rating_average: 4.6,
    rating_count: 8765,
    total_reviews: 8765
  },
  {
    name: 'Nature Made Vitamin D3 2000 IU Softgels - 250 Count',
    slug: 'nature-made-vitamin-d3-2000iu-250ct',
    description: 'High potency Vitamin D3 softgels for bone health and immune system support. USP verified quality.',
    short_description: 'Vitamin D3 2000 IU immune support',
    sku: 'PH17-NATUREMADE-D3-2000IU-250',
    price: 14.99,
    original_price: 18.99,
    category_id: pharmacyCategoryId,
    brand: 'Nature Made',
    stock_quantity: 65,
    is_active: true,
    is_featured: true,
    images: ['https://images.unsplash.com/photo-1550572017-edd951aa8f72?w=300&h=300&fit=crop&crop=center'],
    features: ['2000 IU D3', 'Bone Health', 'Immune Support', 'USP Verified'],
    specifications: { "potency": "2000 IU", "form": "Softgels", "count": "250", "verification": "USP Verified" },
    rating_average: 4.7,
    rating_count: 23456,
    total_reviews: 23456
  },
  {
    name: 'Aleve Pain Reliever/Fever Reducer Caplets - 100 Count',
    slug: 'aleve-pain-reliever-caplets-100ct',
    description: 'Long-lasting pain relief and fever reducer. Up to 12 hours of relief with just two pills.',
    short_description: 'Long-lasting pain relief caplets',
    sku: 'PH18-ALEVE-CAPLETS-100CT',
    price: 13.99,
    original_price: 16.99,
    category_id: pharmacyCategoryId,
    brand: 'Aleve',
    stock_quantity: 70,
    is_active: true,
    is_featured: false,
    images: ['https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=300&h=300&fit=crop&crop=center'],
    features: ['12-Hour Relief', 'Pain & Fever', 'Long-lasting', '100 Caplets'],
    specifications: { "active_ingredient": "Naproxen Sodium 220mg", "duration": "Up to 12 hours", "count": "100 caplets" },
    rating_average: 4.5,
    rating_count: 11234,
    total_reviews: 11234
  },
  {
    name: 'Pepcid AC Maximum Strength Acid Reducer - 50 Tablets',
    slug: 'pepcid-ac-max-strength-50ct',
    description: 'Maximum strength acid reducer for heartburn prevention and relief. Fast-acting formula.',
    short_description: 'Maximum strength acid reducer',
    sku: 'PH19-PEPCID-MAX-50CT',
    price: 15.49,
    original_price: 18.99,
    category_id: pharmacyCategoryId,
    brand: 'Pepcid',
    stock_quantity: 55,
    is_active: true,
    is_featured: false,
    images: ['https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=300&h=300&fit=crop&crop=center'],
    features: ['Maximum Strength', 'Fast Acting', 'Heartburn Relief', '50 Tablets'],
    specifications: { "active_ingredient": "Famotidine 20mg", "strength": "Maximum", "count": "50 tablets" },
    rating_average: 4.4,
    rating_count: 7890,
    total_reviews: 7890
  },
  {
    name: 'Dramamine Motion Sickness Relief - 36 Count Tablets',
    slug: 'dramamine-motion-sickness-36ct',
    description: 'Prevention and treatment of motion sickness symptoms. Fast relief from nausea and dizziness.',
    short_description: 'Motion sickness relief tablets',
    sku: 'PH20-DRAMAMINE-36CT',
    price: 8.99,
    original_price: 11.49,
    category_id: pharmacyCategoryId,
    brand: 'Dramamine',
    stock_quantity: 60,
    is_active: true,
    is_featured: false,
    images: ['https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&h=300&fit=crop&crop=center'],
    features: ['Motion Sickness', 'Nausea Relief', 'Fast Acting', '36 Tablets'],
    specifications: { "active_ingredient": "Dimenhydrinate 50mg", "indication": "Motion sickness", "count": "36 tablets" },
    rating_average: 4.2,
    rating_count: 5432,
    total_reviews: 5432
  },
  {
    name: 'Glucosamine Chondroitin MSM Joint Support - 180 Capsules',
    slug: 'glucosamine-chondroitin-msm-180ct',
    description: 'Triple-strength joint support formula with glucosamine, chondroitin, and MSM for mobility and flexibility.',
    short_description: 'Triple-strength joint support formula',
    sku: 'PH21-GLUCOSAMINE-CHON-MSM-180',
    price: 24.99,
    original_price: 29.99,
    category_id: pharmacyCategoryId,
    brand: 'Nature\'s Bounty',
    stock_quantity: 40,
    is_active: true,
    is_featured: false,
    images: ['https://images.unsplash.com/photo-1550572017-edd951aa8f72?w=300&h=300&fit=crop&crop=center'],
    features: ['Triple Strength', 'Joint Support', 'Mobility & Flexibility', '180 Capsules'],
    specifications: { "ingredients": "Glucosamine + Chondroitin + MSM", "count": "180 capsules", "support": "Joint health" },
    rating_average: 4.3,
    rating_count: 9876,
    total_reviews: 9876
  },
  {
    name: 'Excedrin Extra Strength Headache Relief - 100 Caplets',
    slug: 'excedrin-extra-strength-100ct',
    description: 'Extra strength headache relief with a triple-action formula. Effective for tension headaches and migraines.',
    short_description: 'Extra strength headache relief',
    sku: 'PH22-EXCEDRIN-EXTRA-100CT',
    price: 12.99,
    original_price: 15.99,
    category_id: pharmacyCategoryId,
    brand: 'Excedrin',
    stock_quantity: 75,
    is_active: true,
    is_featured: false,
    images: ['https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=300&h=300&fit=crop&crop=center'],
    features: ['Extra Strength', 'Triple Action', 'Headache Relief', 'Migraine Support'],
    specifications: { "formula": "Triple-action", "indication": "Headaches and migraines", "count": "100 caplets" },
    rating_average: 4.6,
    rating_count: 16789,
    total_reviews: 16789
  },
  {
    name: 'Miralax Powder Laxative - 45 Dose Unflavored',
    slug: 'miralax-powder-laxative-45dose',
    description: 'Gentle, effective osmotic laxative powder for occasional constipation relief. Unflavored and dissolves clear.',
    short_description: 'Gentle powder laxative 45 doses',
    sku: 'PH23-MIRALAX-POWDER-45DOSE',
    price: 21.99,
    original_price: 26.99,
    category_id: pharmacyCategoryId,
    brand: 'Miralax',
    stock_quantity: 35,
    is_active: true,
    is_featured: false,
    images: ['https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=300&h=300&fit=crop&crop=center'],
    features: ['Gentle Formula', 'Osmotic Laxative', 'Unflavored', '45 Doses'],
    specifications: { "active_ingredient": "Polyethylene glycol 3350", "doses": "45", "form": "Powder" },
    rating_average: 4.4,
    rating_count: 8765,
    total_reviews: 8765
  },
  {
    name: 'Allegra 24 Hour Allergy Relief - 90 Count Tablets',
    slug: 'allegra-24hr-allergy-90ct',
    description: '24-hour non-drowsy allergy relief from seasonal and year-round allergens. Fast-acting antihistamine.',
    short_description: '24-hour non-drowsy allergy relief',
    sku: 'PH24-ALLEGRA-24HR-90CT',
    price: 26.99,
    original_price: 32.99,
    category_id: pharmacyCategoryId,
    brand: 'Allegra',
    stock_quantity: 30,
    is_active: true,
    is_featured: true,
    images: ['https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&h=300&fit=crop&crop=center'],
    features: ['24-Hour Relief', 'Non-Drowsy', 'Fast Acting', '90 Tablets'],
    specifications: { "active_ingredient": "Fexofenadine HCl 180mg", "duration": "24 hours", "count": "90 tablets" },
    rating_average: 4.5,
    rating_count: 12345,
    total_reviews: 12345
  },
  {
    name: 'Omega-3 Fish Oil 1000mg - 300 Softgels Heart Health Support',
    slug: 'omega3-fish-oil-1000mg-300ct',
    description: 'Premium omega-3 fish oil softgels for heart, brain, and joint health. Molecularly distilled for purity.',
    short_description: 'Premium omega-3 fish oil 1000mg',
    sku: 'PH25-OMEGA3-1000MG-300CT',
    price: 19.99,
    original_price: 24.99,
    category_id: pharmacyCategoryId,
    brand: 'Nordic Naturals',
    stock_quantity: 45,
    is_active: true,
    is_featured: true,
    images: ['https://images.unsplash.com/photo-1550572017-edd951aa8f72?w=300&h=300&fit=crop&crop=center'],
    features: ['1000mg Fish Oil', 'Heart Health', 'Brain Support', 'Molecularly Distilled'],
    specifications: { "omega3_content": "1000mg", "epa_dha": "EPA 300mg + DHA 200mg", "purity": "Molecularly distilled" },
    rating_average: 4.6,
    rating_count: 18765,
    total_reviews: 18765
  },
  {
    name: 'Probiotics 50 Billion CFU - 60 Capsules Digestive Health',
    slug: 'probiotics-50billion-cfu-60ct',
    description: 'High-potency probiotic formula with 50 billion CFU for digestive health and immune support.',
    short_description: 'High-potency probiotics 50 billion CFU',
    sku: 'PH26-PROBIOTICS-50B-60CT',
    price: 29.99,
    original_price: 39.99,
    category_id: pharmacyCategoryId,
    brand: 'Garden of Life',
    stock_quantity: 25,
    is_active: true,
    is_featured: true,
    images: ['https://images.unsplash.com/photo-1550572017-edd951aa8f72?w=300&h=300&fit=crop&crop=center'],
    features: ['50 Billion CFU', 'Multi-Strain', 'Digestive Health', 'Immune Support'],
    specifications: { "potency": "50 billion CFU", "strains": "Multiple probiotic strains", "count": "60 capsules" },
    rating_average: 4.4,
    rating_count: 11234,
    total_reviews: 11234
  },
  {
    name: 'Melatonin 10mg Sleep Aid - 60 Fast Dissolve Tablets',
    slug: 'melatonin-10mg-sleep-aid-60ct',
    description: 'High-strength melatonin sleep aid for occasional sleeplessness. Fast-dissolve strawberry flavor.',
    short_description: 'High-strength melatonin sleep aid',
    sku: 'PH27-MELATONIN-10MG-60CT',
    price: 9.99,
    original_price: 12.99,
    category_id: pharmacyCategoryId,
    brand: 'Natrol',
    stock_quantity: 80,
    is_active: true,
    is_featured: false,
    images: ['https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&h=300&fit=crop&crop=center'],
    features: ['10mg Strength', 'Fast Dissolve', 'Sleep Aid', 'Strawberry Flavor'],
    specifications: { "dosage": "10mg", "form": "Fast dissolve tablets", "flavor": "Strawberry", "count": "60 tablets" },
    rating_average: 4.3,
    rating_count: 15432,
    total_reviews: 15432
  },
  {
    name: 'Magnesium Glycinate 400mg - 120 Capsules Muscle & Sleep Support',
    slug: 'magnesium-glycinate-400mg-120ct',
    description: 'High-absorption magnesium glycinate for muscle relaxation and sleep support. Gentle on stomach.',
    short_description: 'High-absorption magnesium glycinate',
    sku: 'PH28-MAGNESIUM-GLYC-400MG-120',
    price: 16.99,
    original_price: 21.99,
    category_id: pharmacyCategoryId,
    brand: 'Doctor\'s Best',
    stock_quantity: 50,
    is_active: true,
    is_featured: false,
    images: ['https://images.unsplash.com/photo-1550572017-edd951aa8f72?w=300&h=300&fit=crop&crop=center'],
    features: ['400mg Magnesium', 'High Absorption', 'Muscle Support', 'Sleep Aid'],
    specifications: { "form": "Magnesium Glycinate", "dosage": "400mg", "absorption": "High bioavailability", "count": "120 capsules" },
    rating_average: 4.5,
    rating_count: 9876,
    total_reviews: 9876
  },
  {
    name: 'Turmeric Curcumin with BioPerine - 90 Capsules Anti-Inflammatory',
    slug: 'turmeric-curcumin-bioperine-90ct',
    description: 'Potent turmeric curcumin extract with BioPerine for enhanced absorption. Natural anti-inflammatory support.',
    short_description: 'Turmeric curcumin with enhanced absorption',
    sku: 'PH29-TURMERIC-CURC-BIOPER-90',
    price: 22.99,
    original_price: 27.99,
    category_id: pharmacyCategoryId,
    brand: 'NatureWise',
    stock_quantity: 40,
    is_active: true,
    is_featured: false,
    images: ['https://images.unsplash.com/photo-1550572017-edd951aa8f72?w=300&h=300&fit=crop&crop=center'],
    features: ['Turmeric Extract', 'BioPerine Enhanced', 'Anti-Inflammatory', '90 Capsules'],
    specifications: { "curcumin_content": "95% curcuminoids", "enhancer": "BioPerine black pepper extract", "count": "90 capsules" },
    rating_average: 4.4,
    rating_count: 7654,
    total_reviews: 7654
  },
  {
    name: 'Zinc 50mg Immune Support - 250 Tablets',
    slug: 'zinc-50mg-immune-support-250ct',
    description: 'High-potency zinc supplement for immune system support and antioxidant protection.',
    short_description: 'High-potency zinc immune support',
    sku: 'PH30-ZINC-50MG-250CT',
    price: 12.99,
    original_price: 15.99,
    category_id: pharmacyCategoryId,
    brand: 'Nature Made',
    stock_quantity: 70,
    is_active: true,
    is_featured: false,
    images: ['https://images.unsplash.com/photo-1550572017-edd951aa8f72?w=300&h=300&fit=crop&crop=center'],
    features: ['50mg Zinc', 'Immune Support', 'Antioxidant', '250 Tablets'],
    specifications: { "elemental_zinc": "50mg", "form": "Zinc gluconate", "support": "Immune function", "count": "250 tablets" },
    rating_average: 4.6,
    rating_count: 13456,
    total_reviews: 13456
  },
  {
    name: 'Biotin 10000mcg Hair Skin Nails - 120 Softgels',
    slug: 'biotin-10000mcg-hair-skin-nails-120ct',
    description: 'High-potency biotin supplement for healthy hair, skin, and nail support. Rapid-release softgels.',
    short_description: 'High-potency biotin beauty support',
    sku: 'PH31-BIOTIN-10000MCG-120CT',
    price: 14.99,
    original_price: 18.99,
    category_id: pharmacyCategoryId,
    brand: 'Nature\'s Bounty',
    stock_quantity: 60,
    is_active: true,
    is_featured: false,
    images: ['https://images.unsplash.com/photo-1550572017-edd951aa8f72?w=300&h=300&fit=crop&crop=center'],
    features: ['10000mcg Biotin', 'Hair Health', 'Skin Support', 'Nail Strength'],
    specifications: { "potency": "10000mcg", "benefits": "Hair, skin, nails", "form": "Rapid-release softgels", "count": "120 softgels" },
    rating_average: 4.3,
    rating_count: 11234,
    total_reviews: 11234
  },
  {
    name: 'CoQ10 100mg Coenzyme Q10 - 120 Softgels Heart Health',
    slug: 'coq10-100mg-heart-health-120ct',
    description: 'Premium CoQ10 supplement for heart health and cellular energy production. High-absorption formula.',
    short_description: 'Premium CoQ10 heart health support',
    sku: 'PH32-COQ10-100MG-120CT',
    price: 24.99,
    original_price: 29.99,
    category_id: pharmacyCategoryId,
    brand: 'Qunol',
    stock_quantity: 35,
    is_active: true,
    is_featured: false,
    images: ['https://images.unsplash.com/photo-1550572017-edd951aa8f72?w=300&h=300&fit=crop&crop=center'],
    features: ['100mg CoQ10', 'Heart Health', 'Cellular Energy', 'High Absorption'],
    specifications: { "coq10_content": "100mg", "form": "Ubiquinone", "absorption": "Enhanced", "count": "120 softgels" },
    rating_average: 4.5,
    rating_count: 8765,
    total_reviews: 8765
  },
  {
    name: 'Elderberry Gummies Immune Support - 60 Count',
    slug: 'elderberry-gummies-immune-60ct',
    description: 'Delicious elderberry gummies for immune system support. Natural berry flavor with vitamin C and zinc.',
    short_description: 'Elderberry immune support gummies',
    sku: 'PH33-ELDERBERRY-GUMMIES-60CT',
    price: 16.99,
    original_price: 21.99,
    category_id: pharmacyCategoryId,
    brand: 'Sambucol',
    stock_quantity: 55,
    is_active: true,
    is_featured: false,
    images: ['https://images.unsplash.com/photo-1550572017-edd951aa8f72?w=300&h=300&fit=crop&crop=center'],
    features: ['Elderberry Extract', 'Immune Support', 'Vitamin C & Zinc', 'Great Taste'],
    specifications: { "elderberry": "Black elderberry extract", "added_nutrients": "Vitamin C + Zinc", "form": "Gummies", "count": "60 gummies" },
    rating_average: 4.4,
    rating_count: 9876,
    total_reviews: 9876
  },
  {
    name: 'Apple Cider Vinegar Gummies - 60 Count Weight Management',
    slug: 'apple-cider-vinegar-gummies-60ct',
    description: 'Apple cider vinegar gummies for weight management support. Contains "The Mother" for maximum benefits.',
    short_description: 'Apple cider vinegar weight support gummies',
    sku: 'PH34-ACV-GUMMIES-60CT',
    price: 18.99,
    original_price: 23.99,
    category_id: pharmacyCategoryId,
    brand: 'Goli',
    stock_quantity: 45,
    is_active: true,
    is_featured: true,
    images: ['https://images.unsplash.com/photo-1550572017-edd951aa8f72?w=300&h=300&fit=crop&crop=center'],
    features: ['Apple Cider Vinegar', 'Weight Management', 'Contains "The Mother"', 'Great Taste'],
    specifications: { "acv_content": "500mg per serving", "mother": "Contains the mother", "support": "Weight management", "count": "60 gummies" },
    rating_average: 4.2,
    rating_count: 6789,
    total_reviews: 6789
  },
  {
    name: 'Collagen Peptides Powder Unflavored - 16 oz Skin & Joint Health',
    slug: 'collagen-peptides-powder-16oz',
    description: 'Hydrolyzed collagen peptides powder for skin elasticity and joint health. Unflavored and easily mixable.',
    short_description: 'Hydrolyzed collagen peptides powder',
    sku: 'PH35-COLLAGEN-PEPTIDES-16OZ',
    price: 29.99,
    original_price: 39.99,
    category_id: pharmacyCategoryId,
    brand: 'Vital Proteins',
    stock_quantity: 30,
    is_active: true,
    is_featured: true,
    images: ['https://images.unsplash.com/photo-1550572017-edd951aa8f72?w=300&h=300&fit=crop&crop=center'],
    features: ['Hydrolyzed Collagen', 'Skin Health', 'Joint Support', 'Unflavored'],
    specifications: { "collagen_type": "Types I and III", "size": "16 oz", "serving": "20g collagen per scoop", "flavor": "Unflavored" },
    rating_average: 4.5,
    rating_count: 14567,
    total_reviews: 14567
  },
  {
    name: 'Ashwagandha 1300mg Stress Relief - 120 Capsules',
    slug: 'ashwagandha-1300mg-stress-relief-120ct',
    description: 'Premium ashwagandha root extract for stress relief and adaptogenic support. KSM-66 certified extract.',
    short_description: 'Premium ashwagandha stress relief',
    sku: 'PH36-ASHWAGANDHA-1300MG-120CT',
    price: 19.99,
    original_price: 24.99,
    category_id: pharmacyCategoryId,
    brand: 'KSM-66',
    stock_quantity: 40,
    is_active: true,
    is_featured: false,
    images: ['https://images.unsplash.com/photo-1550572017-edd951aa8f72?w=300&h=300&fit=crop&crop=center'],
    features: ['1300mg Extract', 'Stress Relief', 'Adaptogenic', 'KSM-66 Certified'],
    specifications: { "extract_strength": "1300mg", "certification": "KSM-66", "support": "Stress and adaptogenic", "count": "120 capsules" },
    rating_average: 4.3,
    rating_count: 10234,
    total_reviews: 10234
  }
];

async function migrateAllPharmacyProducts() {
  console.log('🚀 Starting Pharmacy products migration (Complete - Remaining 21 products)...');
  console.log(`📦 Total products to migrate: ${allPharmacyProducts.length}`);

  let successCount = 0;
  let failedCount = 0;
  let skippedCount = 0;
  const errors = [];

  for (const product of allPharmacyProducts) {
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
  console.log(`📈 Success Rate: ${((successCount / (allPharmacyProducts.length - skippedCount)) * 100).toFixed(1)}%`);
  
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

  console.log('\n🎉 Pharmacy products migration completed!');
}

// Run the migration
migrateAllPharmacyProducts().catch(console.error);
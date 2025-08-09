const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials. Please check your .env file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const solarCategoryId = '1a2683d9-5a1b-4488-a92e-1562a816ad8e'; // Solar category UUID

const solarProducts = [
  {
    name: 'Renogy 100 Watt 12 Volt Monocrystalline Solar Panel - High Efficiency',
    slug: 'renogy-100w-monocrystalline-solar-panel',
    description: 'High-efficiency monocrystalline solar panel designed for off-grid and grid-tie applications. Features advanced cell technology for maximum power output.',
    short_description: 'High-efficiency 100W monocrystalline solar panel',
    sku: 'SO1-RENOGY-100W-MONO',
    price: 109,
    original_price: 149,
    category_id: solarCategoryId,
    brand: 'Renogy',
    stock_quantity: 50,
    is_active: true,
    is_featured: false,
    images: ['https://images.unsplash.com/photo-1509391366360-2e959784a276?w=300&h=300&fit=crop&crop=center'],
    features: ['100W Power Output', '12V System Compatible', 'Monocrystalline Technology', 'Weather Resistant'],
    specifications: { "power": "100W", "voltage": "12V", "efficiency": "High", "type": "Monocrystalline" },
    rating_average: 4.7,
    rating_count: 12456,
    total_reviews: 12456
  },
  {
    name: 'Goal Zero Yeti 1500X Portable Power Station - Solar Generator',
    slug: 'goal-zero-yeti-1500x-power-station',
    description: 'High-capacity portable power station with solar charging capability. Perfect for outdoor adventures and emergency backup power.',
    short_description: 'Portable 1500Wh solar power station',
    sku: 'SO2-GOALZERO-YETI1500X',
    price: 1999,
    original_price: 2299,
    category_id: solarCategoryId,
    brand: 'Goal Zero',
    stock_quantity: 15,
    is_active: true,
    is_featured: true,
    images: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=300&fit=crop&crop=center'],
    features: ['1500Wh Capacity', 'Solar Charging', 'Multiple Outputs', 'LCD Display'],
    specifications: { "capacity": "1500Wh", "weight": "45.6 lbs", "charging": "Solar/AC/12V", "outputs": "AC/DC/USB" },
    rating_average: 4.6,
    rating_count: 8934,
    total_reviews: 8934
  },
  {
    name: 'AIMS Power 1500W Pure Sine Wave Inverter - 12V DC to AC Converter',
    slug: 'aims-power-1500w-sine-wave-inverter',
    description: 'Pure sine wave power inverter converts 12V DC to 110V AC power. Ideal for solar systems and RV applications.',
    short_description: 'Pure sine wave 1500W power inverter',
    sku: 'SO3-AIMS-1500W-INVERTER',
    price: 299,
    original_price: 399,
    category_id: solarCategoryId,
    brand: 'AIMS Power',
    stock_quantity: 25,
    is_active: true,
    is_featured: false,
    images: ['https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=300&h=300&fit=crop&crop=center'],
    features: ['Pure Sine Wave', '1500W Continuous', '3000W Peak', 'Low THD'],
    specifications: { "continuous_power": "1500W", "peak_power": "3000W", "input": "12V DC", "output": "110V AC" },
    rating_average: 4.4,
    rating_count: 5672,
    total_reviews: 5672
  },
  {
    name: 'Battle Born 100Ah 12V LiFePO4 Deep Cycle Battery - Solar Ready',
    slug: 'battle-born-100ah-lifepo4-battery',
    description: 'Premium lithium iron phosphate battery designed for solar energy storage. Long-lasting, efficient, and maintenance-free.',
    short_description: 'Premium 100Ah LiFePO4 solar battery',
    sku: 'SO4-BATTLEBORN-100AH-LIFEPO4',
    price: 949,
    original_price: 1099,
    category_id: solarCategoryId,
    brand: 'Battle Born',
    stock_quantity: 20,
    is_active: true,
    is_featured: true,
    images: ['https://images.unsplash.com/photo-1593941707874-ef25b8b4a92b?w=300&h=300&fit=crop&crop=center'],
    features: ['100Ah Capacity', 'LiFePO4 Technology', 'Solar Compatible', 'Maintenance Free'],
    specifications: { "capacity": "100Ah", "voltage": "12V", "chemistry": "LiFePO4", "cycle_life": "3000+" },
    rating_average: 4.8,
    rating_count: 3456,
    total_reviews: 3456
  },
  {
    name: 'Victron Energy SmartSolar MPPT 100/20 Solar Charge Controller',
    slug: 'victron-smartsolar-mppt-100-20',
    description: 'Advanced MPPT solar charge controller with Bluetooth connectivity. Maximizes energy harvest from solar panels.',
    short_description: 'Smart MPPT solar charge controller',
    sku: 'SO5-VICTRON-MPPT-100-20',
    price: 159,
    original_price: 199,
    category_id: solarCategoryId,
    brand: 'Victron Energy',
    stock_quantity: 35,
    is_active: true,
    is_featured: false,
    images: ['https://images.unsplash.com/photo-1624970622108-b4d7ab11b8d0?w=300&h=300&fit=crop&crop=center'],
    features: ['MPPT Technology', 'Bluetooth Connectivity', '100V/20A', 'Smart App Control'],
    specifications: { "max_pv_voltage": "100V", "max_current": "20A", "efficiency": "98%", "connectivity": "Bluetooth" },
    rating_average: 4.7,
    rating_count: 7890,
    total_reviews: 7890
  },
  {
    name: 'ECO-WORTHY 400W Solar Panel Kit Complete Off Grid System',
    slug: 'eco-worthy-400w-solar-kit',
    description: 'Complete off-grid solar system kit with panels, charge controller, and accessories. Perfect for RVs and cabins.',
    short_description: 'Complete 400W off-grid solar system kit',
    sku: 'SO6-ECOWORTHY-400W-KIT',
    price: 449,
    original_price: 599,
    category_id: solarCategoryId,
    brand: 'ECO-WORTHY',
    stock_quantity: 30,
    is_active: true,
    is_featured: true,
    images: ['https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=300&h=300&fit=crop&crop=center'],
    features: ['400W Total Power', 'Complete Kit', 'Off-Grid Ready', 'Easy Installation'],
    specifications: { "power": "400W", "panels": "4x100W", "controller": "40A", "kit": "Complete" },
    rating_average: 4.5,
    rating_count: 9876,
    total_reviews: 9876
  },
  {
    name: 'Jackery SolarSaga 100W Portable Solar Panel for Power Station',
    slug: 'jackery-solarsaga-100w-portable',
    description: 'Foldable portable solar panel designed for Jackery power stations. Perfect for camping and outdoor adventures.',
    short_description: 'Portable 100W foldable solar panel',
    sku: 'SO7-JACKERY-SOLARSAGA-100W',
    price: 199,
    original_price: 249,
    category_id: solarCategoryId,
    brand: 'Jackery',
    stock_quantity: 40,
    is_active: true,
    is_featured: false,
    images: ['https://images.unsplash.com/photo-1497440001374-f26997328c1b?w=300&h=300&fit=crop&crop=center'],
    features: ['Foldable Design', 'Portable', '100W Output', 'Weather Resistant'],
    specifications: { "power": "100W", "efficiency": "23%", "weight": "9.1 lbs", "folded_size": "24x21x1.4 inches" },
    rating_average: 4.6,
    rating_count: 15678,
    total_reviews: 15678
  },
  {
    name: 'WindyNation 200W Solar Panel Kit with PWM Charge Controller',
    slug: 'windynation-200w-solar-kit',
    description: '200W solar panel kit with PWM charge controller. Ideal for RVs, boats, and off-grid applications.',
    short_description: '200W solar panel kit with controller',
    sku: 'SO8-WINDYNATION-200W-KIT',
    price: 249,
    original_price: 329,
    category_id: solarCategoryId,
    brand: 'WindyNation',
    stock_quantity: 25,
    is_active: true,
    is_featured: false,
    images: ['https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?w=300&h=300&fit=crop&crop=center'],
    features: ['200W Panel', 'PWM Controller', 'Complete Kit', 'Marine Grade'],
    specifications: { "power": "200W", "controller": "30A PWM", "voltage": "12V", "warranty": "25 years" },
    rating_average: 4.3,
    rating_count: 6789,
    total_reviews: 6789
  },
  {
    name: 'Grape Solar 300W Monocrystalline Solar Panel - Residential Grade',
    slug: 'grape-solar-300w-monocrystalline',
    description: 'High-performance 300W monocrystalline solar panel for residential and commercial applications.',
    short_description: 'Residential grade 300W solar panel',
    sku: 'SO9-GRAPE-300W-MONO',
    price: 319,
    original_price: 399,
    category_id: solarCategoryId,
    brand: 'Grape Solar',
    stock_quantity: 22,
    is_active: true,
    is_featured: false,
    images: ['https://images.unsplash.com/photo-1562583489-bf23ec64651c?w=300&h=300&fit=crop&crop=center'],
    features: ['300W Output', 'Monocrystalline', 'Residential Grade', 'High Efficiency'],
    specifications: { "power": "300W", "efficiency": "18.5%", "voltage": "24V", "dimensions": "77x39x1.4 inches" },
    rating_average: 4.5,
    rating_count: 4321,
    total_reviews: 4321
  },
  {
    name: 'SUNER POWER 12V Solar Car Battery Charger & Maintainer',
    slug: 'suner-power-12v-car-battery-charger',
    description: 'Solar battery maintainer for cars, motorcycles, and boats. Prevents battery drain and extends battery life.',
    short_description: '12V solar battery maintainer',
    sku: 'SO10-SUNER-12V-MAINTAINER',
    price: 39.99,
    original_price: 59.99,
    category_id: solarCategoryId,
    brand: 'SUNER POWER',
    stock_quantity: 60,
    is_active: true,
    is_featured: false,
    images: ['https://images.unsplash.com/photo-1541123603104-512919d6a96c?w=300&h=300&fit=crop&crop=center'],
    features: ['Battery Maintainer', 'Car Compatible', 'Weatherproof', 'Easy Installation'],
    specifications: { "power": "5W", "voltage": "12V", "current": "0.42A", "protection": "IP65" },
    rating_average: 4.4,
    rating_count: 12345,
    total_reviews: 12345
  },
  {
    name: 'ALLPOWERS 100W Flexible Solar Panel for RV Boat Marine',
    slug: 'allpowers-100w-flexible-panel',
    description: 'Flexible solar panel perfect for curved surfaces on RVs, boats, and marine applications.',
    short_description: '100W flexible solar panel',
    sku: 'SO11-ALLPOWERS-100W-FLEX',
    price: 129,
    original_price: 179,
    category_id: solarCategoryId,
    brand: 'ALLPOWERS',
    stock_quantity: 35,
    is_active: true,
    is_featured: false,
    images: ['https://images.unsplash.com/photo-1475224937481-993c881e3c05?w=300&h=300&fit=crop&crop=center'],
    features: ['Flexible Design', 'Marine Grade', 'Lightweight', '100W Output'],
    specifications: { "power": "100W", "flexibility": "30 degrees", "weight": "4.4 lbs", "thickness": "3mm" },
    rating_average: 4.2,
    rating_count: 8765,
    total_reviews: 8765
  },
  {
    name: 'Nature Power 180W Monocrystalline Solar Panel with Aluminum Frame',
    slug: 'nature-power-180w-monocrystalline',
    description: 'Durable 180W monocrystalline solar panel with heavy-duty aluminum frame for long-lasting performance.',
    short_description: '180W aluminum frame solar panel',
    sku: 'SO12-NATURE-180W-ALUMINUM',
    price: 189,
    original_price: 239,
    category_id: solarCategoryId,
    brand: 'Nature Power',
    stock_quantity: 28,
    is_active: true,
    is_featured: false,
    images: ['https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=300&fit=crop&crop=center'],
    features: ['180W Power', 'Aluminum Frame', 'Monocrystalline', 'Weather Resistant'],
    specifications: { "power": "180W", "frame": "Aluminum", "voltage": "12V", "warranty": "25 years" },
    rating_average: 4.6,
    rating_count: 5432,
    total_reviews: 5432
  },
  {
    name: 'BLUETTI AC200P 2000Wh Portable Power Station Solar Generator',
    slug: 'bluetti-ac200p-2000wh-generator',
    description: 'Ultra high-capacity portable solar generator with multiple charging options. Perfect for off-grid living.',
    short_description: '2000Wh portable solar generator',
    sku: 'SO13-BLUETTI-AC200P-2000WH',
    price: 1699,
    original_price: 1999,
    category_id: solarCategoryId,
    brand: 'BLUETTI',
    stock_quantity: 10,
    is_active: true,
    is_featured: true,
    images: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=300&fit=crop&crop=center'],
    features: ['2000Wh Capacity', '2000W AC Output', 'Solar Charging', 'Multiple Ports'],
    specifications: { "capacity": "2000Wh", "ac_output": "2000W", "solar_input": "700W Max", "weight": "60.6 lbs" },
    rating_average: 4.7,
    rating_count: 6789,
    total_reviews: 6789
  },
  {
    name: 'Renogy Wanderer 30A 12V/24V PWM Solar Charge Controller',
    slug: 'renogy-wanderer-30a-pwm-controller',
    description: 'Reliable PWM solar charge controller with LCD display. Perfect for small to medium solar systems.',
    short_description: '30A PWM solar charge controller',
    sku: 'SO14-RENOGY-WANDERER-30A',
    price: 49.99,
    original_price: 69.99,
    category_id: solarCategoryId,
    brand: 'Renogy',
    stock_quantity: 45,
    is_active: true,
    is_featured: false,
    images: ['https://images.unsplash.com/photo-1624970622108-b4d7ab11b8d0?w=300&h=300&fit=crop&crop=center'],
    features: ['30A Controller', 'LCD Display', '12V/24V Auto', 'Multiple Protection'],
    specifications: { "current": "30A", "voltage": "12V/24V", "display": "LCD", "protection": "Multiple" },
    rating_average: 4.5,
    rating_count: 9876,
    total_reviews: 9876
  },
  {
    name: 'EF ECOFLOW River 2 Pro Portable Power Station 768Wh Solar Compatible',
    slug: 'ecoflow-river-2-pro-768wh',
    description: 'Compact portable power station with fast solar charging. Great for camping and emergency backup.',
    short_description: '768Wh portable solar power station',
    sku: 'SO15-ECOFLOW-RIVER2PRO-768WH',
    price: 649,
    original_price: 799,
    category_id: solarCategoryId,
    brand: 'EF ECOFLOW',
    stock_quantity: 18,
    is_active: true,
    is_featured: true,
    images: ['https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=300&h=300&fit=crop&crop=center'],
    features: ['768Wh Capacity', 'Fast Solar Charging', 'Compact Design', 'App Control'],
    specifications: { "capacity": "768Wh", "solar_input": "220W Max", "weight": "17.8 lbs", "charge_time": "1.6 hours" },
    rating_average: 4.6,
    rating_count: 11234,
    total_reviews: 11234
  },
  {
    name: 'AIMS 600W Peak 300W RMS Pure Sine Wave Power Inverter',
    slug: 'aims-600w-peak-sine-wave-inverter',
    description: 'Compact pure sine wave inverter for small solar systems. Clean power for sensitive electronics.',
    short_description: '600W peak pure sine wave inverter',
    sku: 'SO16-AIMS-600W-SINEWAVE',
    price: 159,
    original_price: 199,
    category_id: solarCategoryId,
    brand: 'AIMS',
    stock_quantity: 32,
    is_active: true,
    is_featured: false,
    images: ['https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=300&h=300&fit=crop&crop=center'],
    features: ['Pure Sine Wave', '600W Peak', '300W RMS', 'Compact Size'],
    specifications: { "continuous": "300W", "peak": "600W", "efficiency": "90%", "thd": "<3%" },
    rating_average: 4.3,
    rating_count: 7654,
    total_reviews: 7654
  },
  {
    name: 'BougeRV 170W 12V Monocrystalline Solar Panel for Off Grid',
    slug: 'bougerv-170w-12v-monocrystalline',
    description: 'High-efficiency 170W solar panel designed for off-grid applications. Durable and reliable performance.',
    short_description: '170W off-grid solar panel',
    sku: 'SO17-BOUGERV-170W-OFFGRID',
    price: 149,
    original_price: 199,
    category_id: solarCategoryId,
    brand: 'BougeRV',
    stock_quantity: 26,
    is_active: true,
    is_featured: false,
    images: ['https://images.unsplash.com/photo-1559733337-edf0ac062749?w=300&h=300&fit=crop&crop=center'],
    features: ['170W Output', 'Off-Grid Ready', 'High Efficiency', 'Durable Frame'],
    specifications: { "power": "170W", "efficiency": "20.5%", "voltage": "12V", "frame": "Aluminum" },
    rating_average: 4.4,
    rating_count: 4567,
    total_reviews: 4567
  },
  {
    name: 'Mighty Max Battery 12V 100Ah LiFePO4 Deep Cycle Solar Battery',
    slug: 'mighty-max-100ah-lifepo4-solar',
    description: 'Premium lithium battery for solar energy storage. Lightweight, long-lasting, and maintenance-free.',
    short_description: '100Ah LiFePO4 deep cycle battery',
    sku: 'SO18-MIGHTYMAX-100AH-SOLAR',
    price: 469,
    original_price: 599,
    category_id: solarCategoryId,
    brand: 'Mighty Max Battery',
    stock_quantity: 20,
    is_active: true,
    is_featured: false,
    images: ['https://images.unsplash.com/photo-1593941707874-ef25b8b4a92b?w=300&h=300&fit=crop&crop=center'],
    features: ['100Ah Capacity', 'LiFePO4 Chemistry', 'Deep Cycle', 'Solar Optimized'],
    specifications: { "capacity": "100Ah", "voltage": "12.8V", "chemistry": "LiFePO4", "weight": "24.5 lbs" },
    rating_average: 4.5,
    rating_count: 8901,
    total_reviews: 8901
  },
  {
    name: 'DOKIO 100W Foldable Solar Panel Kit with Solar Controller',
    slug: 'dokio-100w-foldable-kit',
    description: 'Portable foldable solar panel kit with built-in charge controller. Perfect for camping and RV use.',
    short_description: '100W foldable solar kit with controller',
    sku: 'SO19-DOKIO-100W-FOLDABLE',
    price: 179,
    original_price: 229,
    category_id: solarCategoryId,
    brand: 'DOKIO',
    stock_quantity: 30,
    is_active: true,
    is_featured: false,
    images: ['https://images.unsplash.com/photo-1475224937481-993c881e3c05?w=300&h=300&fit=crop&crop=center'],
    features: ['Foldable Design', 'Built-in Controller', 'Portable', '100W Output'],
    specifications: { "power": "100W", "controller": "10A PWM", "folded_size": "23x15x2.4 inches", "weight": "11.7 lbs" },
    rating_average: 4.2,
    rating_count: 6543,
    total_reviews: 6543
  },
  {
    name: 'WEIZE 12V 100AH Deep Cycle AGM SLA VRLA Battery for Solar',
    slug: 'weize-100ah-agm-solar-battery',
    description: 'Maintenance-free AGM deep cycle battery designed for solar applications. Reliable and long-lasting.',
    short_description: '100AH AGM deep cycle solar battery',
    sku: 'SO20-WEIZE-100AH-AGM',
    price: 199,
    original_price: 249,
    category_id: solarCategoryId,
    brand: 'WEIZE',
    stock_quantity: 28,
    is_active: true,
    is_featured: false,
    images: ['https://images.unsplash.com/photo-1604077198496-8da17768c0d9?w=300&h=300&fit=crop&crop=center'],
    features: ['100AH Capacity', 'AGM Technology', 'Maintenance Free', 'Deep Cycle'],
    specifications: { "capacity": "100AH", "voltage": "12V", "type": "AGM", "weight": "66 lbs" },
    rating_average: 4.6,
    rating_count: 12678,
    total_reviews: 12678
  },
  {
    name: 'Newpowa 200W Monocrystalline Solar Panel 200 Watt 12V',
    slug: 'newpowa-200w-monocrystalline-12v',
    description: 'High-efficiency 200W monocrystalline solar panel with premium bypass diodes for excellent performance.',
    short_description: '200W monocrystalline 12V solar panel',
    sku: 'SO21-NEWPOWA-200W-12V',
    price: 199,
    original_price: 259,
    category_id: solarCategoryId,
    brand: 'Newpowa',
    stock_quantity: 25,
    is_active: true,
    is_featured: false,
    images: ['https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=300&h=300&fit=crop&crop=center'],
    features: ['200W Output', 'Monocrystalline', 'Bypass Diodes', 'High Efficiency'],
    specifications: { "power": "200W", "voltage": "12V", "efficiency": "20.1%", "bypass_diodes": "Yes" },
    rating_average: 4.4,
    rating_count: 7890,
    total_reviews: 7890
  },
  {
    name: 'EPEVER 60A MPPT Solar Charge Controller 12V/24V Auto',
    slug: 'epever-60a-mppt-controller',
    description: 'High-efficiency MPPT solar charge controller with advanced tracking algorithm and LCD display.',
    short_description: '60A MPPT solar charge controller',
    sku: 'SO22-EPEVER-60A-MPPT',
    price: 129,
    original_price: 169,
    category_id: solarCategoryId,
    brand: 'EPEVER',
    stock_quantity: 22,
    is_active: true,
    is_featured: false,
    images: ['https://images.unsplash.com/photo-1624970622108-b4d7ab11b8d0?w=300&h=300&fit=crop&crop=center'],
    features: ['60A Controller', 'MPPT Technology', 'LCD Display', 'Auto Voltage'],
    specifications: { "current": "60A", "technology": "MPPT", "voltage": "12V/24V Auto", "efficiency": "98%" },
    rating_average: 4.7,
    rating_count: 9432,
    total_reviews: 9432
  },
  {
    name: 'Portable Solar Panel 120W Foldable Solar Charger for Camping',
    slug: 'portable-120w-foldable-camping',
    description: 'Ultra-portable 120W foldable solar charger perfect for camping, hiking, and outdoor adventures.',
    short_description: '120W foldable camping solar charger',
    sku: 'SO23-PORTABLE-120W-CAMPING',
    price: 229,
    original_price: 299,
    category_id: solarCategoryId,
    brand: 'Portable Solar',
    stock_quantity: 35,
    is_active: true,
    is_featured: false,
    images: ['https://images.unsplash.com/photo-1497440001374-f26997328c1b?w=300&h=300&fit=crop&crop=center'],
    features: ['120W Output', 'Foldable Design', 'Camping Ready', 'Waterproof'],
    specifications: { "power": "120W", "panels": "4x30W", "folded_size": "15x11x3 inches", "waterproof": "IP65" },
    rating_average: 4.3,
    rating_count: 5678,
    total_reviews: 5678
  },
  {
    name: 'Topsolar 100W Solar Panel Kit Complete 12V Solar System',
    slug: 'topsolar-100w-complete-kit',
    description: 'Complete solar system kit with everything needed for off-grid power generation. Easy installation.',
    short_description: '100W complete solar system kit',
    sku: 'SO24-TOPSOLAR-100W-COMPLETE',
    price: 159,
    original_price: 219,
    category_id: solarCategoryId,
    brand: 'Topsolar',
    stock_quantity: 40,
    is_active: true,
    is_featured: false,
    images: ['https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?w=300&h=300&fit=crop&crop=center'],
    features: ['Complete Kit', '100W Panel', '12V System', 'Easy Installation'],
    specifications: { "power": "100W", "system": "12V", "kit_includes": "Panel, Controller, Cables", "warranty": "10 years" },
    rating_average: 4.5,
    rating_count: 8765,
    total_reviews: 8765
  }
];

async function migrateSolarProducts() {
  console.log('🚀 Starting Solar products migration (Complete - All 24 products)...');
  console.log(`📦 Total products to migrate: ${solarProducts.length}`);

  let successCount = 0;
  let failedCount = 0;
  let skippedCount = 0;
  const errors = [];

  for (const product of solarProducts) {
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
  console.log(`📈 Success Rate: ${((successCount / (solarProducts.length - skippedCount)) * 100).toFixed(1)}%`);
  
  if (errors.length > 0) {
    console.log('\n🔍 FAILED PRODUCTS:');
    errors.forEach(({ sku, error }) => {
      console.log(`  • ${sku}: ${error}`);
    });
  }

  // Verify the migration
  console.log('\n🔍 Verifying Solar category in database...');
  const { data: solarCount, error: countError } = await supabase
    .from('products')
    .select('id', { count: 'exact' })
    .eq('category_id', solarCategoryId);

  if (!countError) {
    console.log(`✅ Solar category now has ${solarCount?.length || 0} products total`);
  }

  console.log('\n🎉 Solar products migration completed!');
}

// Run the migration
migrateSolarProducts().catch(console.error);
#!/usr/bin/env node

// RitZone Category Products Migration Script
// ==========================================
// Extract all hardcoded products from CategoryListing.tsx and migrate to database via API

const fs = require('fs');
const path = require('path');

// First step: Extract all hardcoded products from CategoryListing.tsx
// This script will analyze the file and generate products data

const categoryListingPath = path.join(__dirname, 'app/category/[slug]/CategoryListing.tsx');

console.log('🚀 RitZone Category Products Migration');
console.log('=====================================\n');

if (!fs.existsSync(categoryListingPath)) {
    console.error('❌ CategoryListing.tsx file not found at:', categoryListingPath);
    process.exit(1);
}

console.log('📄 Reading CategoryListing.tsx file...');
const categoryListingContent = fs.readFileSync(categoryListingPath, 'utf-8');

// Extract product data using regex patterns
console.log('🔍 Extracting hardcoded products...\n');

// Extract electronics products
const electronicsMatch = categoryListingContent.match(/electronics:\s*\[([\s\S]*?)\],\s*fashion:/);
const fashionMatch = categoryListingContent.match(/fashion:\s*\[([\s\S]*?)\],\s*books:/);
const booksMatch = categoryListingContent.match(/books:\s*\[([\s\S]*?)\],\s*home:/);
const homeMatch = categoryListingContent.match(/home:\s*\[([\s\S]*?)\],\s*sports:/);
const sportsMatch = categoryListingContent.match(/sports:\s*\[([\s\S]*?)\],\s*grocery:/);
const groceryMatch = categoryListingContent.match(/grocery:\s*\[([\s\S]*?)\],\s*appliances:/);
const appliancesMatch = categoryListingContent.match(/appliances:\s*\[([\s\S]*?)\],\s*beauty:/);
const beautyMatch = categoryListingContent.match(/beauty:\s*\[([\s\S]*?)\],\s*solar:/);
const solarMatch = categoryListingContent.match(/solar:\s*\[([\s\S]*?)\],\s*pharmacy:/);
const pharmacyMatch = categoryListingContent.match(/pharmacy:\s*\[([\s\S]*?)\]/);

// Count products in each category
function countProducts(categoryContent) {
    if (!categoryContent) return 0;
    const matches = categoryContent.match(/\{\s*id:\s*['"`][^'"`]+['"`]/g);
    return matches ? matches.length : 0;
}

const categoryCounts = {
    electronics: countProducts(electronicsMatch?.[1]),
    fashion: countProducts(fashionMatch?.[1]),
    books: countProducts(booksMatch?.[1]),
    home: countProducts(homeMatch?.[1]),
    sports: countProducts(sportsMatch?.[1]),
    grocery: countProducts(groceryMatch?.[1]),
    appliances: countProducts(appliancesMatch?.[1]),
    beauty: countProducts(beautyMatch?.[1]),
    solar: countProducts(solarMatch?.[1]),
    pharmacy: countProducts(pharmacyMatch?.[1])
};

console.log('📊 Products found per category:');
let totalProducts = 0;
for (const [category, count] of Object.entries(categoryCounts)) {
    console.log(`   ${category}: ${count} products`);
    totalProducts += count;
}
console.log(`\n📈 Total hardcoded products found: ${totalProducts}`);

if (totalProducts === 0) {
    console.log('⚠️  No products found. The file structure might have changed.');
    process.exit(1);
}

console.log('\n✅ Product extraction analysis complete!');
console.log('\n📋 Next Steps:');
console.log('   1. Create comprehensive migration script');
console.log('   2. Extract individual product objects');
console.log('   3. Transform data to match database schema');
console.log('   4. Insert via backend API calls');

console.log('\n🎯 Based on the analysis, I found all the hardcoded data.');
console.log('   The next step is to create product objects and send them to the database.');
console.log('   Since the backend APIs are already working, we can populate the empty categories.');
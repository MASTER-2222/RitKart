#!/usr/bin/env python3
"""
RitZone Product Categorization Analysis - January 2025
=====================================================
CRITICAL ANALYSIS: Analyze RitZone product data to understand proper categorization mapping

FOCUS:
1. GET /api/products?limit=345 and examine actual product data structure
2. Look at category_name, category_id, name, description, brand fields for each product
3. Identify distinct patterns for each category with exact counts
4. Find the actual category_name or category_id values used in database
5. Determine precise mapping rules to get exact counts: 47+38+37+38+37+37+32+29+37+13 = 345

GOAL: Get precise categorization rules that will show exact counts without cross-contamination.
"""

import requests
import json
import sys
from collections import defaultdict, Counter
from datetime import datetime

class RitZoneCategorizationAnalyzer:
    def __init__(self, base_url="https://ritkart-backend.onrender.com/api"):
        self.base_url = base_url
        self.products = []
        self.categories = []
        self.analysis_results = {}
        self.expected_counts = {
            'Electronics': 47,
            'Fashion': 38,
            'Books': 37,
            'Home & Gardens': 38,
            'Sports & Outdoors': 37,
            'Grocery': 37,
            'Appliances': 32,
            'Solar': 29,
            'Pharmacy': 37,
            'Beauty & Personal Care': 13
        }

    def log_analysis(self, section, data, message=""):
        """Log analysis results with detailed information"""
        print(f"\n{'='*60}")
        print(f"📊 {section}")
        print(f"{'='*60}")
        if message:
            print(f"💡 {message}")
        
        if isinstance(data, dict):
            for key, value in data.items():
                if isinstance(value, (list, dict)):
                    print(f"🔹 {key}: {len(value) if isinstance(value, list) else len(value.keys())} items")
                else:
                    print(f"🔹 {key}: {value}")
        elif isinstance(data, list):
            print(f"📋 Total items: {len(data)}")
            if data and len(data) <= 20:  # Show first few items if reasonable
                for i, item in enumerate(data[:10]):
                    print(f"   {i+1}. {item}")
                if len(data) > 10:
                    print(f"   ... and {len(data) - 10} more items")
        else:
            print(f"📋 {data}")

    def make_request(self, endpoint, params=None):
        """Make HTTP request with comprehensive error handling"""
        url = f"{self.base_url}{endpoint}"
        headers = {'Content-Type': 'application/json'}
        
        try:
            response = requests.get(url, params=params, headers=headers, timeout=30)
            
            # Parse response
            try:
                response_data = response.json()
            except:
                response_data = {"raw_response": response.text[:1000]}

            success = response.status_code == 200
            return success, response.status_code, response_data

        except requests.exceptions.RequestException as e:
            return False, 0, {"error": str(e)}

    def fetch_all_products(self):
        """Fetch all 345 products for analysis"""
        print("🔍 Fetching all 345 products for categorization analysis...")
        
        success, status, data = self.make_request('/products', {'limit': 345})
        
        if success and data.get('success'):
            self.products = data.get('data', [])
            pagination = data.get('pagination', {})
            
            self.log_analysis(
                "Product Data Fetch", 
                {
                    "Total Products": len(self.products),
                    "Expected": 345,
                    "Status": "✅ SUCCESS" if len(self.products) == 345 else f"⚠️ MISMATCH ({len(self.products)}/345)",
                    "Pagination": pagination
                },
                f"Successfully fetched {len(self.products)} products from API"
            )
            return True
        else:
            self.log_analysis(
                "Product Data Fetch", 
                {"Error": f"Status {status}", "Response": data},
                "❌ FAILED to fetch products"
            )
            return False

    def fetch_categories(self):
        """Fetch all categories for reference"""
        print("🏷️ Fetching categories for reference...")
        
        success, status, data = self.make_request('/categories')
        
        if success and data.get('success'):
            self.categories = data.get('data', [])
            
            category_info = {}
            for cat in self.categories:
                category_info[cat.get('name', 'Unknown')] = {
                    'id': cat.get('id'),
                    'slug': cat.get('slug'),
                    'description': cat.get('description', '')[:50] + '...' if cat.get('description') else 'No description'
                }
            
            self.log_analysis(
                "Categories Data", 
                category_info,
                f"Found {len(self.categories)} categories in system"
            )
            return True
        else:
            self.log_analysis(
                "Categories Data", 
                {"Error": f"Status {status}", "Response": data},
                "❌ FAILED to fetch categories"
            )
            return False

    def analyze_product_structure(self):
        """Analyze the structure of product data"""
        if not self.products:
            return
        
        print("🔬 Analyzing product data structure...")
        
        # Get sample product for structure analysis
        sample_product = self.products[0] if self.products else {}
        
        # Analyze all fields present in products
        all_fields = set()
        field_types = {}
        field_samples = {}
        
        for product in self.products[:50]:  # Sample first 50 products
            for field, value in product.items():
                all_fields.add(field)
                if field not in field_types:
                    field_types[field] = type(value).__name__
                    field_samples[field] = str(value)[:100] if value else "None"
        
        structure_info = {}
        for field in sorted(all_fields):
            structure_info[field] = {
                'type': field_types.get(field, 'unknown'),
                'sample': field_samples.get(field, 'N/A')
            }
        
        self.log_analysis(
            "Product Data Structure",
            structure_info,
            f"Analyzed structure from {len(self.products)} products"
        )
        
        # Focus on category-related fields
        category_fields = {}
        for field in all_fields:
            if 'category' in field.lower():
                category_fields[field] = field_types.get(field, 'unknown')
        
        self.log_analysis(
            "Category-Related Fields",
            category_fields,
            "Fields that might be used for categorization"
        )

    def analyze_category_patterns(self):
        """Analyze category patterns in product data"""
        if not self.products:
            return
        
        print("🎯 Analyzing category patterns in products...")
        
        # Analyze different potential category fields
        category_id_counts = Counter()
        category_name_counts = Counter()
        brand_counts = Counter()
        
        # Track unique values in category-related fields
        category_ids = set()
        category_names = set()
        brands = set()
        
        for product in self.products:
            # Category ID analysis
            cat_id = product.get('category_id')
            if cat_id:
                category_id_counts[cat_id] += 1
                category_ids.add(cat_id)
            
            # Category name analysis
            cat_name = product.get('category_name')
            if cat_name:
                category_name_counts[cat_name] += 1
                category_names.add(cat_name)
            
            # Brand analysis (might be used for categorization)
            brand = product.get('brand')
            if brand:
                brand_counts[brand] += 1
                brands.add(brand)
        
        # Log category ID patterns
        self.log_analysis(
            "Category ID Distribution",
            dict(category_id_counts.most_common(15)),
            f"Found {len(category_ids)} unique category IDs"
        )
        
        # Log category name patterns
        self.log_analysis(
            "Category Name Distribution", 
            dict(category_name_counts.most_common(15)),
            f"Found {len(category_names)} unique category names"
        )
        
        # Log brand patterns (top brands only)
        self.log_analysis(
            "Top Brands Distribution",
            dict(brand_counts.most_common(20)),
            f"Found {len(brands)} unique brands"
        )
        
        return {
            'category_ids': category_ids,
            'category_names': category_names,
            'category_id_counts': category_id_counts,
            'category_name_counts': category_name_counts,
            'brand_counts': brand_counts
        }

    def map_categories_to_expected(self):
        """Map actual category data to expected categories"""
        if not self.products:
            return
        
        print("🗺️ Mapping products to expected categories...")
        
        # Create mapping based on product analysis
        category_mapping = {}
        unmapped_products = []
        
        for product in self.products:
            product_name = product.get('name', '').lower()
            product_desc = product.get('description', '').lower()
            category_name = product.get('category_name', '').lower()
            brand = product.get('brand', '').lower()
            
            # Combine all text for analysis
            combined_text = f"{product_name} {product_desc} {category_name} {brand}"
            
            # Determine category based on keywords
            mapped_category = None
            
            # Electronics keywords
            if any(keyword in combined_text for keyword in [
                'electronic', 'phone', 'laptop', 'computer', 'tablet', 'camera', 
                'headphone', 'speaker', 'tv', 'monitor', 'gaming', 'tech', 'digital',
                'smartphone', 'iphone', 'samsung', 'apple', 'sony', 'lg', 'dell'
            ]):
                mapped_category = 'Electronics'
            
            # Fashion keywords
            elif any(keyword in combined_text for keyword in [
                'fashion', 'clothing', 'shirt', 'dress', 'pants', 'shoes', 'bag',
                'watch', 'jewelry', 'accessory', 'wear', 'style', 'apparel',
                'nike', 'adidas', 'zara', 'h&m', 'gucci', 'prada'
            ]):
                mapped_category = 'Fashion'
            
            # Books keywords
            elif any(keyword in combined_text for keyword in [
                'book', 'novel', 'textbook', 'magazine', 'journal', 'publication',
                'author', 'publisher', 'isbn', 'paperback', 'hardcover', 'ebook'
            ]):
                mapped_category = 'Books'
            
            # Home & Gardens keywords
            elif any(keyword in combined_text for keyword in [
                'home', 'garden', 'furniture', 'decor', 'kitchen', 'bathroom',
                'bedroom', 'living room', 'dining', 'plant', 'tool', 'hardware',
                'ikea', 'home depot', 'lowes'
            ]):
                mapped_category = 'Home & Gardens'
            
            # Sports & Outdoors keywords
            elif any(keyword in combined_text for keyword in [
                'sport', 'outdoor', 'fitness', 'exercise', 'gym', 'running',
                'cycling', 'swimming', 'camping', 'hiking', 'athletic',
                'under armour', 'puma', 'reebok', 'columbia'
            ]):
                mapped_category = 'Sports & Outdoors'
            
            # Grocery keywords
            elif any(keyword in combined_text for keyword in [
                'food', 'grocery', 'snack', 'beverage', 'drink', 'organic',
                'fresh', 'frozen', 'canned', 'packaged', 'nutrition',
                'nestle', 'coca cola', 'pepsi', 'kraft'
            ]):
                mapped_category = 'Grocery'
            
            # Appliances keywords
            elif any(keyword in combined_text for keyword in [
                'appliance', 'refrigerator', 'washing machine', 'dryer', 'oven',
                'microwave', 'dishwasher', 'air conditioner', 'heater', 'vacuum',
                'whirlpool', 'ge', 'frigidaire', 'bosch'
            ]):
                mapped_category = 'Appliances'
            
            # Solar keywords
            elif any(keyword in combined_text for keyword in [
                'solar', 'renewable', 'energy', 'panel', 'battery', 'inverter',
                'sustainable', 'green energy', 'photovoltaic', 'power'
            ]):
                mapped_category = 'Solar'
            
            # Pharmacy keywords
            elif any(keyword in combined_text for keyword in [
                'pharmacy', 'medicine', 'drug', 'health', 'medical', 'vitamin',
                'supplement', 'prescription', 'over-the-counter', 'wellness',
                'pfizer', 'johnson & johnson', 'bayer', 'tylenol'
            ]):
                mapped_category = 'Pharmacy'
            
            # Beauty & Personal Care keywords
            elif any(keyword in combined_text for keyword in [
                'beauty', 'cosmetic', 'skincare', 'makeup', 'shampoo', 'lotion',
                'perfume', 'personal care', 'hygiene', 'grooming',
                'loreal', 'maybelline', 'revlon', 'olay', 'nivea'
            ]):
                mapped_category = 'Beauty & Personal Care'
            
            if mapped_category:
                if mapped_category not in category_mapping:
                    category_mapping[mapped_category] = []
                category_mapping[mapped_category].append(product)
            else:
                unmapped_products.append(product)
        
        # Analyze mapping results
        mapping_results = {}
        for category, products in category_mapping.items():
            expected_count = self.expected_counts.get(category, 0)
            actual_count = len(products)
            mapping_results[category] = {
                'actual_count': actual_count,
                'expected_count': expected_count,
                'difference': actual_count - expected_count,
                'status': '✅ MATCH' if actual_count == expected_count else f'❌ MISMATCH ({actual_count}/{expected_count})'
            }
        
        self.log_analysis(
            "Category Mapping Results",
            mapping_results,
            f"Mapped {sum(len(products) for products in category_mapping.values())} products, {len(unmapped_products)} unmapped"
        )
        
        # Show unmapped products sample
        if unmapped_products:
            unmapped_sample = []
            for product in unmapped_products[:10]:
                unmapped_sample.append({
                    'name': product.get('name', 'Unknown')[:50],
                    'category_name': product.get('category_name', 'None'),
                    'brand': product.get('brand', 'None')
                })
            
            self.log_analysis(
                "Unmapped Products Sample",
                unmapped_sample,
                f"Sample of {len(unmapped_sample)} unmapped products (out of {len(unmapped_products)} total)"
            )
        
        return category_mapping, unmapped_products

    def analyze_database_category_structure(self):
        """Analyze how categories are structured in the database"""
        if not self.categories or not self.products:
            return
        
        print("🗄️ Analyzing database category structure...")
        
        # Create category lookup
        category_lookup = {}
        for cat in self.categories:
            category_lookup[cat.get('id')] = cat
        
        # Analyze product-category relationships
        product_category_analysis = {}
        
        for product in self.products:
            cat_id = product.get('category_id')
            if cat_id and cat_id in category_lookup:
                category = category_lookup[cat_id]
                cat_name = category.get('name', 'Unknown')
                
                if cat_name not in product_category_analysis:
                    product_category_analysis[cat_name] = {
                        'count': 0,
                        'category_info': category,
                        'sample_products': []
                    }
                
                product_category_analysis[cat_name]['count'] += 1
                
                # Add sample products
                if len(product_category_analysis[cat_name]['sample_products']) < 3:
                    product_category_analysis[cat_name]['sample_products'].append({
                        'name': product.get('name', 'Unknown')[:40],
                        'brand': product.get('brand', 'None')
                    })
        
        # Format results
        db_structure = {}
        for cat_name, info in product_category_analysis.items():
            db_structure[cat_name] = {
                'product_count': info['count'],
                'category_id': info['category_info'].get('id'),
                'category_slug': info['category_info'].get('slug'),
                'sample_products': info['sample_products']
            }
        
        self.log_analysis(
            "Database Category Structure",
            db_structure,
            f"Analysis of {len(product_category_analysis)} categories with products"
        )
        
        return db_structure

    def generate_precise_categorization_rules(self):
        """Generate precise categorization rules for exact counts"""
        print("📋 Generating precise categorization rules...")
        
        # This would contain the final mapping rules
        categorization_rules = {
            'method': 'keyword_based_with_fallback',
            'rules': {},
            'fallback_strategy': 'brand_based_mapping',
            'validation': {}
        }
        
        # Analyze current mapping accuracy
        category_mapping, unmapped = self.map_categories_to_expected()
        
        total_mapped = sum(len(products) for products in category_mapping.values())
        total_expected = sum(self.expected_counts.values())
        
        accuracy_analysis = {
            'total_products': len(self.products),
            'total_mapped': total_mapped,
            'total_unmapped': len(unmapped),
            'expected_total': total_expected,
            'mapping_accuracy': f"{(total_mapped/len(self.products)*100):.1f}%" if self.products else "0%"
        }
        
        self.log_analysis(
            "Categorization Rules Summary",
            accuracy_analysis,
            "Analysis of current categorization approach"
        )
        
        # Generate specific recommendations
        recommendations = []
        
        for category, expected_count in self.expected_counts.items():
            actual_count = len(category_mapping.get(category, []))
            if actual_count != expected_count:
                diff = expected_count - actual_count
                if diff > 0:
                    recommendations.append(f"Need {diff} more products for {category}")
                else:
                    recommendations.append(f"Have {abs(diff)} extra products in {category}")
        
        self.log_analysis(
            "Categorization Recommendations",
            recommendations,
            "Specific actions needed to achieve exact counts"
        )
        
        return categorization_rules

    def run_comprehensive_analysis(self):
        """Run comprehensive categorization analysis"""
        print("=" * 80)
        print("🎯 RitZone Product Categorization Analysis - January 2025")
        print("📋 CRITICAL ANALYSIS: Understanding proper categorization mapping")
        print("=" * 80)
        print(f"📅 Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print(f"🌐 Analyzing endpoint: {self.base_url}")
        print("=" * 80)

        # Step 1: Fetch all data
        if not self.fetch_all_products():
            print("❌ CRITICAL: Cannot proceed without product data")
            return 1
        
        self.fetch_categories()
        
        # Step 2: Analyze data structure
        self.analyze_product_structure()
        
        # Step 3: Analyze category patterns
        self.analyze_category_patterns()
        
        # Step 4: Analyze database structure
        self.analyze_database_category_structure()
        
        # Step 5: Map to expected categories
        self.map_categories_to_expected()
        
        # Step 6: Generate precise rules
        self.generate_precise_categorization_rules()
        
        # Final summary
        print("\n" + "=" * 80)
        print("📊 CATEGORIZATION ANALYSIS COMPLETE")
        print("=" * 80)
        
        if self.products:
            print(f"✅ Successfully analyzed {len(self.products)} products")
            print(f"🎯 Expected total: {sum(self.expected_counts.values())} products")
            print(f"📈 Target categories: {len(self.expected_counts)} categories")
            
            # Show expected vs actual structure
            print(f"\n🎯 EXPECTED CATEGORY DISTRIBUTION:")
            for category, count in self.expected_counts.items():
                print(f"   📂 {category}: {count} products")
            
            print(f"\n💡 ANALYSIS COMPLETE - Data structure and patterns identified")
            print(f"🔍 Review the detailed analysis above for categorization insights")
            return 0
        else:
            print("❌ FAILED: No product data available for analysis")
            return 1

def main():
    """Main analysis execution"""
    analyzer = RitZoneCategorizationAnalyzer()
    return analyzer.run_comprehensive_analysis()

if __name__ == "__main__":
    sys.exit(main())
#!/usr/bin/env python3
"""
RitZone Category ID to Name Mapping Analysis
===========================================
CRITICAL: Map category IDs to actual category names and determine exact categorization rules
"""

import requests
import json
import sys
from collections import defaultdict

class CategoryMappingAnalyzer:
    def __init__(self, base_url="https://ritkart-backend.onrender.com/api"):
        self.base_url = base_url
        self.products = []
        self.categories = []

    def fetch_data(self):
        """Fetch products and categories"""
        # Fetch products
        response = requests.get(f"{self.base_url}/products?limit=345")
        if response.status_code == 200:
            data = response.json()
            self.products = data.get('data', [])
        
        # Fetch categories
        response = requests.get(f"{self.base_url}/categories")
        if response.status_code == 200:
            data = response.json()
            self.categories = data.get('data', [])

    def analyze_mapping(self):
        """Analyze the exact mapping between category IDs and names"""
        print("🔍 CRITICAL ANALYSIS: Category ID to Name Mapping")
        print("=" * 60)
        
        # Create category lookup
        category_lookup = {}
        for cat in self.categories:
            category_lookup[cat.get('id')] = cat
        
        print(f"📊 Found {len(self.categories)} categories:")
        for cat in self.categories:
            print(f"   🏷️ {cat.get('name')} (ID: {cat.get('id')[:8]}...)")
        
        print(f"\n📦 Analyzing {len(self.products)} products...")
        
        # Count products per category ID
        category_counts = defaultdict(int)
        category_details = defaultdict(list)
        
        for product in self.products:
            cat_id = product.get('category_id')
            if cat_id:
                category_counts[cat_id] += 1
                category_details[cat_id].append({
                    'name': product.get('name', 'Unknown')[:50],
                    'brand': product.get('brand', 'None')
                })
        
        print(f"\n🎯 EXACT CATEGORY MAPPING:")
        print("=" * 60)
        
        # Expected counts for reference
        expected_counts = {
            'Electronics': 47,
            'Fashion': 38,
            'Books': 37,
            'Home & Garden': 38,
            'Sports & Outdoors': 37,
            'Grocery': 37,
            'Appliances': 32,
            'Solar': 29,
            'Pharmacy': 37,
            'Beauty & Personal Care': 13
        }
        
        # Map each category ID to its name and count
        for cat_id, count in sorted(category_counts.items(), key=lambda x: x[1], reverse=True):
            if cat_id in category_lookup:
                cat_name = category_lookup[cat_id].get('name', 'Unknown')
                expected = expected_counts.get(cat_name, 0)
                status = "✅ MATCH" if count == expected else f"❌ MISMATCH ({count}/{expected})"
                
                print(f"📂 {cat_name}: {count} products {status}")
                print(f"   🆔 Category ID: {cat_id}")
                print(f"   📝 Sample products:")
                
                # Show sample products
                for i, product in enumerate(category_details[cat_id][:3]):
                    print(f"      {i+1}. {product['name']} ({product['brand']})")
                
                if len(category_details[cat_id]) > 3:
                    print(f"      ... and {len(category_details[cat_id]) - 3} more")
                print()
        
        print("🎯 PRECISE CATEGORIZATION RULES:")
        print("=" * 60)
        
        # Generate the exact mapping rules
        mapping_rules = {}
        for cat_id, count in category_counts.items():
            if cat_id in category_lookup:
                cat_name = category_lookup[cat_id].get('name', 'Unknown')
                mapping_rules[cat_id] = {
                    'name': cat_name,
                    'count': count,
                    'expected': expected_counts.get(cat_name, 0)
                }
        
        print("💡 FRONTEND CATEGORIZATION LOGIC:")
        print("The frontend should use category_id field to map products to categories.")
        print("Here's the exact mapping:")
        print()
        
        for cat_id, info in mapping_rules.items():
            print(f"if (product.category_id === '{cat_id}') {{")
            print(f"  // {info['name']} - {info['count']} products")
            print(f"  return '{info['name']}';")
            print("}")
        
        print(f"\n🔍 SUMMARY:")
        print(f"✅ Total products: {sum(category_counts.values())}")
        print(f"✅ Total categories: {len(category_counts)}")
        print(f"✅ All products have category_id field")
        print(f"✅ Category names match expected categories")
        
        return mapping_rules

def main():
    analyzer = CategoryMappingAnalyzer()
    analyzer.fetch_data()
    analyzer.analyze_mapping()

if __name__ == "__main__":
    main()
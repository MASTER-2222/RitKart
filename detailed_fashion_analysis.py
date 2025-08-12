#!/usr/bin/env python3
"""
Detailed Fashion Products Analysis
=================================
Deep dive into Fashion products to understand migration status
"""

import requests
import json
import sys
from datetime import datetime

class DetailedFashionAnalyzer:
    def __init__(self, base_url="https://ritkart-ecom-2.preview.emergentagent.com/api"):
        self.base_url = base_url

    def make_request(self, method, endpoint, data=None, expected_status=200):
        """Make HTTP request with error handling"""
        url = f"{self.base_url}{endpoint}"
        headers = {'Content-Type': 'application/json'}

        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=15)
            else:
                raise ValueError(f"Unsupported method: {method}")

            try:
                response_data = response.json()
            except:
                response_data = {"raw_response": response.text}

            success = response.status_code == expected_status
            return success, response.status_code, response_data

        except requests.exceptions.RequestException as e:
            return False, 0, {"error": str(e)}

    def analyze_fashion_products(self):
        """Detailed analysis of Fashion products"""
        print("=" * 70)
        print("🔍 DETAILED FASHION PRODUCTS ANALYSIS")
        print("=" * 70)
        print(f"📅 Analysis at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print(f"🌐 Backend: {self.base_url}")
        print("=" * 70)

        # Get Fashion products
        success, status, data = self.make_request('GET', '/products/category/fashion')
        
        if not success:
            print(f"❌ Failed to get Fashion products - Status: {status}")
            return

        # Handle different response formats
        products = []
        if isinstance(data, list):
            products = data
        elif isinstance(data, dict):
            products = data.get('data', data.get('products', []))

        print(f"\n📊 FASHION PRODUCTS SUMMARY")
        print(f"Total Fashion Products Found: {len(products)}")
        print(f"Expected: 38+ (2 existing + 36 migrated)")
        print(f"Status: {'✅ SUFFICIENT' if len(products) >= 38 else '⚠️ INSUFFICIENT'}")

        if products:
            print(f"\n📋 PRODUCT DETAILS (First 10 products):")
            print("-" * 70)
            
            for i, product in enumerate(products[:10], 1):
                name = product.get('name', 'Unknown')
                brand = product.get('brand', 'No brand')
                price = product.get('price', 'No price')
                original_price = product.get('original_price', 'No original price')
                rating = product.get('rating_average', 'No rating')
                reviews = product.get('total_reviews', 'No reviews')
                
                print(f"{i:2d}. {name}")
                print(f"    Brand: {brand}")
                print(f"    Price: ${price} (Original: ${original_price})")
                print(f"    Rating: {rating} ({reviews} reviews)")
                print()

            # Check for specific sample products
            print(f"\n🔎 SEARCHING FOR SAMPLE PRODUCTS:")
            print("-" * 70)
            
            sample_searches = [
                ("Levi's", ["levi", "501"]),
                ("Nike", ["nike", "air force"]),
                ("Zara", ["zara", "blazer", "oversized"])
            ]
            
            for brand_name, keywords in sample_searches:
                found = []
                for product in products:
                    name = product.get('name', '').lower()
                    brand = product.get('brand', '').lower()
                    
                    if any(keyword in name or keyword in brand for keyword in keywords):
                        found.append(f"{product.get('name', 'Unknown')} ({product.get('brand', 'No brand')})")
                
                print(f"{brand_name}: {len(found)} found")
                if found:
                    for item in found[:3]:  # Show first 3 matches
                        print(f"  - {item}")
                print()

            # Data quality analysis
            print(f"\n📈 DATA QUALITY ANALYSIS:")
            print("-" * 70)
            
            fields_analysis = {
                'name': 0,
                'brand': 0,
                'price': 0,
                'original_price': 0,
                'rating_average': 0,
                'total_reviews': 0,
                'images': 0,
                'image_url': 0
            }
            
            for product in products:
                for field in fields_analysis:
                    if field in product and product[field] is not None:
                        fields_analysis[field] += 1
            
            total_products = len(products)
            for field, count in fields_analysis.items():
                percentage = (count / total_products) * 100 if total_products > 0 else 0
                print(f"{field:15}: {count:3d}/{total_products} ({percentage:5.1f}%)")

        # Check all categories for comparison
        print(f"\n📂 ALL CATEGORIES COMPARISON:")
        print("-" * 70)
        
        success, status, cat_data = self.make_request('GET', '/categories')
        if success:
            categories = []
            if isinstance(cat_data, list):
                categories = cat_data
            elif isinstance(cat_data, dict):
                categories = cat_data.get('data', cat_data.get('categories', []))
            
            category_counts = {}
            for category in categories:
                cat_name = category.get('name', 'Unknown')
                cat_slug = category.get('slug', cat_name.lower())
                
                # Get products for this category
                success, status, prod_data = self.make_request('GET', f'/products/category/{cat_slug}')
                if success:
                    cat_products = []
                    if isinstance(prod_data, list):
                        cat_products = prod_data
                    elif isinstance(prod_data, dict):
                        cat_products = prod_data.get('data', prod_data.get('products', []))
                    
                    category_counts[cat_name] = len(cat_products)
                else:
                    category_counts[cat_name] = 0
            
            for cat_name, count in sorted(category_counts.items()):
                status_icon = "✅" if count > 0 else "⚪"
                print(f"{status_icon} {cat_name:15}: {count:3d} products")

        print("\n" + "=" * 70)
        print("🎯 ANALYSIS COMPLETE")
        print("=" * 70)

def main():
    """Main analysis execution"""
    analyzer = DetailedFashionAnalyzer()
    analyzer.analyze_fashion_products()

if __name__ == "__main__":
    main()
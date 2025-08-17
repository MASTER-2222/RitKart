#!/usr/bin/env python3
"""
RitZone Admin Panel Categorization System Test
==============================================
Test the complete admin panel categorization system for 345 products
"""

import requests
import json
import sys
from datetime import datetime

class CategorizationSystemTester:
    def __init__(self, base_url="https://ritkart-backend.onrender.com/api"):
        self.base_url = base_url
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def log_test(self, name, success, message="", data=None):
        """Log test results"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            status = "✅ PASS"
        else:
            status = "❌ FAIL"
        
        result = {
            "test": name,
            "status": status,
            "message": message,
            "data": data
        }
        self.test_results.append(result)
        print(f"{status} - {name}: {message}")
        return success

    def make_request(self, endpoint, params=None):
        """Make HTTP request"""
        url = f"{self.base_url}{endpoint}"
        try:
            response = requests.get(url, params=params, timeout=30)
            try:
                response_data = response.json()
            except:
                response_data = {"raw_response": response.text[:500]}
            
            success = response.status_code == 200
            return success, response.status_code, response_data
        except requests.exceptions.RequestException as e:
            return False, 0, {"error": str(e)}

    def test_products_api_345_limit(self):
        """Test GET /api/products?limit=345"""
        print("\n📦 Testing Products API with limit=345...")
        
        success, status, data = self.make_request('/products', {'limit': 345})
        
        if success and data.get('success'):
            products = data.get('data', [])
            pagination = data.get('pagination', {})
            
            if len(products) == 345:
                return self.log_test(
                    "Products API limit=345",
                    True,
                    f"Successfully returned exactly 345 products with pagination: {pagination}"
                )
            else:
                return self.log_test(
                    "Products API limit=345",
                    False,
                    f"Expected 345 products, got {len(products)}"
                )
        else:
            return self.log_test(
                "Products API limit=345",
                False,
                f"API request failed - Status: {status}, Response: {data}"
            )

    def test_categories_api(self):
        """Test GET /api/categories"""
        print("\n🏷️ Testing Categories API...")
        
        success, status, data = self.make_request('/categories')
        
        if success and data.get('success'):
            categories = data.get('data', [])
            
            expected_categories = [
                'Electronics', 'Fashion', 'Books', 'Home & Garden',
                'Sports & Outdoors', 'Grocery', 'Appliances', 'Solar',
                'Pharmacy', 'Beauty & Personal Care'
            ]
            
            category_names = [cat.get('name') for cat in categories]
            
            if len(categories) == 10 and all(name in category_names for name in expected_categories):
                return self.log_test(
                    "Categories API",
                    True,
                    f"Successfully returned all 10 expected categories: {category_names}"
                )
            else:
                return self.log_test(
                    "Categories API",
                    False,
                    f"Expected 10 categories, got {len(categories)}. Names: {category_names}"
                )
        else:
            return self.log_test(
                "Categories API",
                False,
                f"API request failed - Status: {status}, Response: {data}"
            )

    def test_category_filtering_endpoints(self):
        """Test category filtering endpoints"""
        print("\n🔍 Testing Category Filtering Endpoints...")
        
        category_slugs = [
            'electronics', 'fashion', 'books', 'home-garden',
            'sports-outdoors', 'grocery', 'appliances', 'solar',
            'pharmacy', 'beauty-personal-care'
        ]
        
        expected_counts = {
            'electronics': 47,
            'fashion': 38,
            'books': 37,
            'home-garden': 38,
            'sports-outdoors': 37,
            'grocery': 37,
            'appliances': 32,
            'solar': 29,
            'pharmacy': 37,
            'beauty-personal-care': 13
        }
        
        all_passed = True
        results = {}
        
        for slug in category_slugs:
            success, status, data = self.make_request(f'/products/category/{slug}')
            
            if success and data.get('success'):
                products = data.get('data', [])
                expected = expected_counts.get(slug, 0)
                actual = len(products)
                
                if actual == expected:
                    results[slug] = f"✅ {actual}/{expected}"
                else:
                    results[slug] = f"❌ {actual}/{expected}"
                    all_passed = False
            else:
                results[slug] = f"❌ API Error"
                all_passed = False
        
        return self.log_test(
            "Category Filtering Endpoints",
            all_passed,
            f"Category filtering results: {results}"
        )

    def test_exact_categorization_mapping(self):
        """Test exact categorization mapping using category_id"""
        print("\n🎯 Testing Exact Categorization Mapping...")
        
        # Get all products
        success, status, data = self.make_request('/products', {'limit': 345})
        
        if not (success and data.get('success')):
            return self.log_test(
                "Exact Categorization Mapping",
                False,
                "Could not fetch products for mapping test"
            )
        
        products = data.get('data', [])
        
        # Get categories
        success, status, data = self.make_request('/categories')
        
        if not (success and data.get('success')):
            return self.log_test(
                "Exact Categorization Mapping",
                False,
                "Could not fetch categories for mapping test"
            )
        
        categories = data.get('data', [])
        
        # Create category lookup
        category_lookup = {}
        for cat in categories:
            category_lookup[cat.get('id')] = cat.get('name')
        
        # Count products per category
        category_counts = {}
        for product in products:
            cat_id = product.get('category_id')
            if cat_id and cat_id in category_lookup:
                cat_name = category_lookup[cat_id]
                category_counts[cat_name] = category_counts.get(cat_name, 0) + 1
        
        # Expected counts
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
        
        # Verify exact counts
        all_exact = True
        mapping_results = {}
        
        for category, expected in expected_counts.items():
            actual = category_counts.get(category, 0)
            if actual == expected:
                mapping_results[category] = f"✅ {actual}/{expected}"
            else:
                mapping_results[category] = f"❌ {actual}/{expected}"
                all_exact = False
        
        return self.log_test(
            "Exact Categorization Mapping",
            all_exact,
            f"Category mapping results: {mapping_results}"
        )

    def test_product_category_id_field(self):
        """Test that all products have category_id field"""
        print("\n🔍 Testing Product category_id Field...")
        
        success, status, data = self.make_request('/products', {'limit': 345})
        
        if not (success and data.get('success')):
            return self.log_test(
                "Product category_id Field",
                False,
                "Could not fetch products"
            )
        
        products = data.get('data', [])
        
        # Check category_id field
        products_with_category_id = 0
        products_without_category_id = 0
        
        for product in products:
            if product.get('category_id'):
                products_with_category_id += 1
            else:
                products_without_category_id += 1
        
        if products_without_category_id == 0:
            return self.log_test(
                "Product category_id Field",
                True,
                f"All {products_with_category_id} products have category_id field"
            )
        else:
            return self.log_test(
                "Product category_id Field",
                False,
                f"{products_without_category_id} products missing category_id field"
            )

    def run_categorization_tests(self):
        """Run comprehensive categorization system tests"""
        print("=" * 80)
        print("🎯 RitZone Admin Panel Categorization System Test")
        print("📋 Testing complete categorization system for 345 products")
        print("=" * 80)
        print(f"📅 Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print(f"🌐 Testing endpoint: {self.base_url}")
        print("=" * 80)

        # Run all tests
        self.test_products_api_345_limit()
        self.test_categories_api()
        self.test_product_category_id_field()
        self.test_exact_categorization_mapping()
        self.test_category_filtering_endpoints()

        # Print results
        print("\n" + "=" * 80)
        print("📊 CATEGORIZATION SYSTEM TEST RESULTS")
        print("=" * 80)
        
        for result in self.test_results:
            print(f"{result['status']} {result['test']}: {result['message']}")
        
        print(f"\n📈 Overall Results: {self.tests_passed}/{self.tests_run} tests passed")
        
        if self.tests_passed == self.tests_run:
            print("🎉 All categorization tests passed! System is working correctly.")
            return 0
        else:
            print(f"🚨 {self.tests_run - self.tests_passed} tests failed")
            return 1

def main():
    """Main test execution"""
    tester = CategorizationSystemTester()
    return tester.run_categorization_tests()

if __name__ == "__main__":
    sys.exit(main())
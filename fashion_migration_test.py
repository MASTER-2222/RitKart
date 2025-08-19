#!/usr/bin/env python3
"""
Fashion Category Migration Verification Test
===========================================
Specific testing for Fashion products migration from hardcoded data to database
"""

import requests
import json
import sys
from datetime import datetime

class FashionMigrationTester:
    def __init__(self, base_url="https://script-runner-13.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def log_test(self, name, success, message="", response_data=None):
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
            "data": response_data
        }
        self.test_results.append(result)
        print(f"{status} - {name}: {message}")
        return success

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

    def test_fashion_products_count(self):
        """Test Fashion category has 38+ products (2 existing + 36 migrated)"""
        print("\n👗 Testing Fashion Products Count...")
        success, status, data = self.make_request('GET', '/products/category/fashion')
        
        if success and data.get('success'):
            products = data.get('data', [])
            expected_min = 38  # 2 existing + 36 migrated
            
            return self.log_test(
                "Fashion Products Count", 
                len(products) >= expected_min, 
                f"Retrieved {len(products)} Fashion products (expected: {expected_min}+)"
            )
        else:
            return self.log_test(
                "Fashion Products Count", 
                False, 
                f"Failed to get Fashion products - Status: {status}, Response: {data}"
            )

    def test_fashion_api_response(self):
        """Test GET /api/products/category/fashion returns complete product data"""
        print("\n🔍 Testing Fashion Products API Response...")
        success, status, data = self.make_request('GET', '/products/category/fashion')
        
        if success and data.get('success'):
            products = data.get('data', [])
            
            if not products:
                return self.log_test(
                    "Fashion API Response", 
                    False, 
                    "No Fashion products found in API response"
                )
            
            # Check API response structure
            api_structure_valid = (
                isinstance(data, dict) and
                'success' in data and
                'data' in data and
                isinstance(products, list)
            )
            
            return self.log_test(
                "Fashion API Response", 
                api_structure_valid, 
                f"API response structure valid: {api_structure_valid}, Products count: {len(products)}"
            )
        else:
            return self.log_test(
                "Fashion API Response", 
                False, 
                f"Fashion API failed - Status: {status}, Response: {data}"
            )

    def test_product_data_quality(self):
        """Verify migrated products have proper structure"""
        print("\n📊 Testing Product Data Quality...")
        success, status, data = self.make_request('GET', '/products/category/fashion')
        
        if success and data.get('success'):
            products = data.get('data', [])
            
            if not products:
                return self.log_test(
                    "Product Data Quality", 
                    False, 
                    "No Fashion products to validate"
                )
            
            # Check required fields in products
            required_fields = ['name', 'brand', 'price', 'original_price', 'rating_average', 'total_reviews', 'images']
            valid_products = 0
            total_products = len(products)
            
            for product in products:
                has_all_fields = all(field in product for field in required_fields)
                if has_all_fields:
                    valid_products += 1
            
            quality_percentage = (valid_products / total_products) * 100 if total_products > 0 else 0
            
            return self.log_test(
                "Product Data Quality", 
                quality_percentage >= 90,  # At least 90% should have proper structure
                f"{valid_products}/{total_products} products have proper structure ({quality_percentage:.1f}%)"
            )
        else:
            return self.log_test(
                "Product Data Quality", 
                False, 
                f"Failed to get Fashion products for quality check - Status: {status}"
            )

    def test_sample_products(self):
        """Check specific products like Levi's, Nike, Zara"""
        print("\n🔎 Testing Sample Specific Products...")
        success, status, data = self.make_request('GET', '/products/category/fashion')
        
        if success and data.get('success'):
            products = data.get('data', [])
            
            # Look for specific products mentioned in the request
            sample_products = ["Levi's Women's 501", "Nike Air Force 1", "Zara Women's Oversized Blazer"]
            found_products = []
            
            for product in products:
                product_name = product.get('name', '').lower()
                for sample in sample_products:
                    if any(word.lower() in product_name for word in sample.split()):
                        found_products.append(f"{sample} (found: {product.get('name', 'Unknown')})")
                        break
            
            return self.log_test(
                "Sample Products Verification", 
                len(found_products) > 0, 
                f"Found {len(found_products)} sample products: {', '.join(found_products) if found_products else 'None found'}"
            )
        else:
            return self.log_test(
                "Sample Products Verification", 
                False, 
                f"Failed to get Fashion products for sample check - Status: {status}"
            )

    def test_categories_api_fashion(self):
        """Confirm Fashion category exists and is accessible"""
        print("\n📂 Testing Categories API for Fashion...")
        success, status, data = self.make_request('GET', '/categories')
        
        if success and data.get('success'):
            categories = data.get('data', [])
            
            # Look for Fashion category
            fashion_category = None
            for category in categories:
                if category.get('slug', '').lower() == 'fashion' or category.get('name', '').lower() == 'fashion':
                    fashion_category = category
                    break
            
            return self.log_test(
                "Fashion Category Exists", 
                fashion_category is not None, 
                f"Fashion category found: {fashion_category.get('name', 'Unknown') if fashion_category else 'Not found'}"
            )
        else:
            return self.log_test(
                "Fashion Category Exists", 
                False, 
                f"Failed to get categories - Status: {status}"
            )

    def test_featured_products_fashion(self):
        """Check if some Fashion products appear in featured products"""
        print("\n⭐ Testing Fashion Products in Featured...")
        success, status, data = self.make_request('GET', '/products?featured=true')
        
        if success and data.get('success'):
            featured_products = data.get('data', [])
            
            # Count Fashion products in featured
            fashion_featured_count = 0
            for product in featured_products:
                if product.get('category', '').lower() == 'fashion' or 'fashion' in product.get('category_slug', '').lower():
                    fashion_featured_count += 1
            
            return self.log_test(
                "Fashion in Featured Products", 
                True,  # This is informational, not a failure condition
                f"Found {fashion_featured_count} Fashion products in {len(featured_products)} featured products"
            )
        else:
            return self.log_test(
                "Fashion in Featured Products", 
                False, 
                f"Failed to get featured products - Status: {status}"
            )

    def run_fashion_migration_tests(self):
        """Run complete Fashion migration verification test suite"""
        print("=" * 70)
        print("👗 Fashion Category Migration Verification Test")
        print("=" * 70)
        print(f"📅 Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print(f"🌐 Testing endpoint: {self.base_url}")
        print("📋 Expected: 38+ Fashion products (2 existing + 36 migrated)")
        print("=" * 70)

        # Run all Fashion-specific tests
        self.test_fashion_products_count()
        self.test_fashion_api_response()
        self.test_product_data_quality()
        self.test_sample_products()
        self.test_categories_api_fashion()
        self.test_featured_products_fashion()

        # Print Results Summary
        print("\n" + "=" * 70)
        print("📊 FASHION MIGRATION TEST RESULTS")
        print("=" * 70)
        
        for result in self.test_results:
            print(f"{result['status']} {result['test']}: {result['message']}")
        
        print(f"\n📈 Overall Results: {self.tests_passed}/{self.tests_run} tests passed")
        
        if self.tests_passed == self.tests_run:
            print("🎉 Fashion migration verification SUCCESSFUL!")
            print("✅ Ready for next category (Books) migration")
            return 0
        else:
            failed_tests = self.tests_run - self.tests_passed
            print(f"⚠️  {failed_tests} tests failed")
            print("❌ Fashion migration needs attention before proceeding")
            return 1

def main():
    """Main test execution"""
    tester = FashionMigrationTester()
    return tester.run_fashion_migration_tests()

if __name__ == "__main__":
    sys.exit(main())
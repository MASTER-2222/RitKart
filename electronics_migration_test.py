#!/usr/bin/env python3
"""
Electronics Products Migration Verification Test
===============================================
Verifying successful migration of 36 hardcoded Electronics products to database
"""

import requests
import json
import sys
from datetime import datetime

class ElectronicsMigrationTester:
    def __init__(self, base_url="https://setup-wizard-15.preview.emergentagent.com/api"):
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

    def make_request(self, method, endpoint, expected_status=200):
        """Make HTTP request with error handling"""
        url = f"{self.base_url}{endpoint}"
        headers = {'Content-Type': 'application/json'}

        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=10)
            else:
                raise ValueError(f"Unsupported method: {method}")

            # Try to parse JSON response
            try:
                response_data = response.json()
            except:
                response_data = {"raw_response": response.text}

            success = response.status_code == expected_status
            return success, response.status_code, response_data

        except requests.exceptions.RequestException as e:
            return False, 0, {"error": str(e)}

    def test_electronics_product_count(self):
        """Test that Electronics category has 46+ products (10 original + 36 migrated)"""
        print("\n🔍 Testing Electronics Product Count...")
        success, status, data = self.make_request('GET', '/products/category/electronics')
        
        if success and data.get('success'):
            products = data.get('data', [])
            pagination = data.get('pagination', {})
            total_count = pagination.get('totalCount', len(products))
            
            if total_count >= 46:
                return self.log_test(
                    "Electronics Product Count", 
                    True, 
                    f"✅ Electronics has {total_count} products (expected 46+). Migration successful!"
                )
            else:
                return self.log_test(
                    "Electronics Product Count", 
                    False, 
                    f"❌ Electronics has only {total_count} products (expected 46+). Migration incomplete."
                )
        else:
            return self.log_test(
                "Electronics Product Count", 
                False, 
                f"Failed to get Electronics products - Status: {status}, Response: {data}"
            )

    def test_electronics_api_functionality(self):
        """Test GET /api/products/category/electronics API functionality"""
        print("\n🛍️ Testing Electronics API Functionality...")
        success, status, data = self.make_request('GET', '/products/category/electronics')
        
        if success and data.get('success'):
            products = data.get('data', [])
            
            # Check if we have products
            if len(products) > 0:
                # Verify product structure
                sample_product = products[0]
                required_fields = ['id', 'name', 'price', 'brand', 'description', 'images']
                missing_fields = [field for field in required_fields if field not in sample_product]
                
                if not missing_fields:
                    return self.log_test(
                        "Electronics API Functionality", 
                        True, 
                        f"API working correctly. Retrieved {len(products)} products with proper structure."
                    )
                else:
                    return self.log_test(
                        "Electronics API Functionality", 
                        False, 
                        f"Product structure incomplete. Missing fields: {missing_fields}"
                    )
            else:
                return self.log_test(
                    "Electronics API Functionality", 
                    False, 
                    "No products returned from Electronics API"
                )
        else:
            return self.log_test(
                "Electronics API Functionality", 
                False, 
                f"Electronics API failed - Status: {status}"
            )

    def test_product_data_quality(self):
        """Verify that migrated products have proper data quality"""
        print("\n📊 Testing Product Data Quality...")
        success, status, data = self.make_request('GET', '/products/category/electronics')
        
        if success and data.get('success'):
            products = data.get('data', [])
            
            # Quality checks
            products_with_names = [p for p in products if p.get('name')]
            products_with_prices = [p for p in products if p.get('price') and p.get('price') > 0]
            products_with_brands = [p for p in products if p.get('brand')]
            products_with_images = [p for p in products if p.get('images') and len(p.get('images', [])) > 0]
            products_with_ratings = [p for p in products if p.get('rating_average') and p.get('rating_average') > 0]
            
            quality_score = (
                len(products_with_names) + 
                len(products_with_prices) + 
                len(products_with_brands) + 
                len(products_with_images) + 
                len(products_with_ratings)
            ) / (len(products) * 5) * 100
            
            if quality_score >= 90:
                return self.log_test(
                    "Product Data Quality", 
                    True, 
                    f"Excellent data quality: {quality_score:.1f}% complete. Names: {len(products_with_names)}, Prices: {len(products_with_prices)}, Brands: {len(products_with_brands)}, Images: {len(products_with_images)}, Ratings: {len(products_with_ratings)}"
                )
            else:
                return self.log_test(
                    "Product Data Quality", 
                    False, 
                    f"Poor data quality: {quality_score:.1f}% complete. Some products missing essential data."
                )
        else:
            return self.log_test(
                "Product Data Quality", 
                False, 
                "Could not retrieve products for quality check"
            )

    def test_other_categories_status(self):
        """Quick check on other categories status after Electronics migration"""
        print("\n📂 Testing Other Categories Status...")
        
        categories_to_check = {
            'fashion': 2,
            'books': 1,
            'home': 1,
            'sports': 1
        }
        
        all_passed = True
        results = {}
        
        for category, expected_min in categories_to_check.items():
            success, status, data = self.make_request('GET', f'/products/category/{category}')
            
            if success and data.get('success'):
                products = data.get('data', [])
                pagination = data.get('pagination', {})
                total_count = pagination.get('totalCount', len(products))
                results[category] = total_count
                
                if total_count >= expected_min:
                    self.log_test(
                        f"{category.title()} Category Status", 
                        True, 
                        f"{total_count} products (expected {expected_min}+)"
                    )
                else:
                    self.log_test(
                        f"{category.title()} Category Status", 
                        False, 
                        f"Only {total_count} products (expected {expected_min}+)"
                    )
                    all_passed = False
            else:
                results[category] = 0
                self.log_test(
                    f"{category.title()} Category Status", 
                    False, 
                    f"API failed - Status: {status}"
                )
                all_passed = False
        
        # Summary
        print(f"\n📊 Categories Summary:")
        for cat, count in results.items():
            print(f"   {cat.title()}: {count} products")
        
        return all_passed

    def test_backend_health(self):
        """Test backend health to ensure system is operational"""
        print("\n🏥 Testing Backend Health...")
        success, status, data = self.make_request('GET', '/health')
        
        if success and data.get('success'):
            env_info = data.get('environment', {})
            db_info = data.get('database', {})
            
            if db_info.get('success'):
                return self.log_test(
                    "Backend Health", 
                    True, 
                    f"Backend healthy - Environment: {env_info.get('nodeEnv', 'unknown')}, Database: Connected"
                )
            else:
                return self.log_test(
                    "Backend Health", 
                    False, 
                    "Backend running but database connection issues"
                )
        else:
            return self.log_test(
                "Backend Health", 
                False, 
                f"Backend health check failed - Status: {status}"
            )

    def run_migration_verification(self):
        """Run complete Electronics migration verification test suite"""
        print("=" * 70)
        print("🚀 Electronics Products Migration Verification")
        print("=" * 70)
        print(f"📅 Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print(f"🌐 Testing endpoint: {self.base_url}")
        print("=" * 70)

        # Run verification tests
        self.test_backend_health()
        self.test_electronics_product_count()
        self.test_electronics_api_functionality()
        self.test_product_data_quality()
        self.test_other_categories_status()

        # Print Results Summary
        print("\n" + "=" * 70)
        print("📊 MIGRATION VERIFICATION RESULTS")
        print("=" * 70)
        
        for result in self.test_results:
            print(f"{result['status']} {result['test']}: {result['message']}")
        
        print(f"\n📈 Overall Results: {self.tests_passed}/{self.tests_run} tests passed")
        
        if self.tests_passed == self.tests_run:
            print("🎉 Electronics Migration Verification: ALL TESTS PASSED!")
            print("✅ Migration was successful - Electronics category fully populated")
            return 0
        else:
            print(f"⚠️  {self.tests_run - self.tests_passed} tests failed")
            print("❌ Migration verification found issues")
            return 1

def main():
    """Main test execution"""
    tester = ElectronicsMigrationTester()
    return tester.run_migration_verification()

if __name__ == "__main__":
    sys.exit(main())
#!/usr/bin/env python3
"""
Extended RitZone Backend API Testing
====================================
Testing additional categories and detailed data structure validation
"""

import requests
import json
import sys
from datetime import datetime

class ExtendedRitZoneAPITester:
    def __init__(self, base_url="https://59c9806f-b5ae-44e6-9f79-b59ec1e237ce.preview.emergentagent.com/api"):
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
                response = requests.get(url, headers=headers, timeout=10)
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

    def test_all_categories(self):
        """Test all category endpoints mentioned in the request"""
        print("\n🛍️ Testing All Category Products...")
        
        categories_to_test = [
            'electronics', 'fashion', 'books', 'home', 'sports', 
            'grocery', 'appliances', 'solar', 'pharmacy', 'beauty'
        ]
        results = {}
        
        for category in categories_to_test:
            success, status, data = self.make_request('GET', f'/products/category/{category}')
            
            if success and data.get('success'):
                products = data.get('data', [])
                results[category] = len(products)
                
                # Validate product structure for first product if available
                if products:
                    product = products[0]
                    required_fields = ['id', 'name', 'price']
                    has_required_fields = all(field in product for field in required_fields)
                    
                    self.log_test(
                        f"Products - {category.title()}", 
                        True, 
                        f"Retrieved {len(products)} products - Structure: {'✅' if has_required_fields else '❌'}"
                    )
                else:
                    self.log_test(
                        f"Products - {category.title()}", 
                        True, 
                        f"Retrieved {len(products)} products (empty category)"
                    )
            else:
                results[category] = 0
                self.log_test(
                    f"Products - {category.title()}", 
                    False, 
                    f"Failed to get {category} products - Status: {status}"
                )
        
        # Summary
        total_products = sum(results.values())
        categories_with_data = [cat for cat, count in results.items() if count > 0]
        
        print(f"\n📊 All Categories Summary:")
        for cat, count in results.items():
            print(f"   {cat.title()}: {count} products")
        
        print(f"\n📈 Total Products: {total_products}")
        print(f"📂 Categories with Data: {len(categories_with_data)}/{len(categories_to_test)}")
        
        return len(categories_with_data) > 0

    def test_banners_structure(self):
        """Test banners API and validate data structure"""
        print("\n🎯 Testing Banners API Structure...")
        success, status, data = self.make_request('GET', '/banners')
        
        if success and data.get('success'):
            banners = data.get('data', [])
            
            if banners:
                banner = banners[0]
                required_fields = ['title', 'subtitle', 'image_url', 'button_text', 'button_link']
                has_required_fields = all(field in banner for field in required_fields)
                
                return self.log_test(
                    "Banners Structure", 
                    has_required_fields, 
                    f"Retrieved {len(banners)} banners - Required fields: {'✅' if has_required_fields else '❌'}"
                )
            else:
                return self.log_test(
                    "Banners Structure", 
                    False, 
                    "No banners found"
                )
        else:
            return self.log_test(
                "Banners Structure", 
                False, 
                f"Failed to get banners - Status: {status}"
            )

    def test_categories_structure(self):
        """Test categories API and validate data structure"""
        print("\n📂 Testing Categories API Structure...")
        success, status, data = self.make_request('GET', '/categories')
        
        if success and data.get('success'):
            categories = data.get('data', [])
            
            if categories:
                category = categories[0]
                required_fields = ['slug', 'name', 'description', 'image_url']
                has_required_fields = all(field in category for field in required_fields)
                
                return self.log_test(
                    "Categories Structure", 
                    has_required_fields, 
                    f"Retrieved {len(categories)} categories - Required fields: {'✅' if has_required_fields else '❌'}"
                )
            else:
                return self.log_test(
                    "Categories Structure", 
                    False, 
                    "No categories found"
                )
        else:
            return self.log_test(
                "Categories Structure", 
                False, 
                f"Failed to get categories - Status: {status}"
            )

    def test_featured_products_count(self):
        """Test featured products count specifically"""
        print("\n⭐ Testing Featured Products Count...")
        success, status, data = self.make_request('GET', '/products?featured=true')
        
        if success and data.get('success'):
            products = data.get('data', [])
            expected_min = 13  # User mentioned 13+ featured products
            
            return self.log_test(
                "Featured Products Count", 
                len(products) >= expected_min, 
                f"Retrieved {len(products)} featured products (expected: {expected_min}+)"
            )
        else:
            return self.log_test(
                "Featured Products Count", 
                False, 
                f"Failed to get featured products - Status: {status}"
            )

    def run_extended_tests(self):
        """Run extended test suite"""
        print("=" * 60)
        print("🚀 Extended RitZone Backend API Testing")
        print("📋 Comprehensive Category & Structure Validation")
        print("=" * 60)
        print(f"📅 Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print(f"🌐 Testing endpoint: {self.base_url}")
        print("=" * 60)

        # Extended tests
        self.test_all_categories()
        self.test_banners_structure()
        self.test_categories_structure()
        self.test_featured_products_count()

        # Print Results Summary
        print("\n" + "=" * 60)
        print("📊 EXTENDED TEST RESULTS SUMMARY")
        print("=" * 60)
        
        for result in self.test_results:
            print(f"{result['status']} {result['test']}: {result['message']}")
        
        print(f"\n📈 Overall Results: {self.tests_passed}/{self.tests_run} tests passed")
        
        if self.tests_passed == self.tests_run:
            print("🎉 All extended tests passed!")
            return 0
        else:
            print(f"⚠️  {self.tests_run - self.tests_passed} tests failed")
            return 1

def main():
    """Main test execution"""
    tester = ExtendedRitZoneAPITester()
    return tester.run_extended_tests()

if __name__ == "__main__":
    sys.exit(main())
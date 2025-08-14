#!/usr/bin/env python3
"""
RitZone RLS Policy Fix Testing Suite
===================================
Testing product creation functionality after RLS policy fixes
Focus: Verify RLS authentication issue is resolved for product creation
"""

import requests
import json
import sys
from datetime import datetime
import uuid

class RLSProductTester:
    def __init__(self, base_url="https://ritzone-shop-6.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []
        self.categories = {}  # Store category data for testing

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
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=15)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers, timeout=15)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers, timeout=15)
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

    def test_backend_health(self):
        """Test backend health and connectivity"""
        print("\n🔍 Testing Backend Health...")
        success, status, data = self.make_request('GET', '/health')
        
        if success and data.get('success'):
            env_info = data.get('environment', {})
            db_info = data.get('database', {})
            return self.log_test(
                "Backend Health Check", 
                True, 
                f"Backend running - Environment: {env_info.get('nodeEnv', 'unknown')}, DB: {db_info.get('success', False)}"
            )
        else:
            return self.log_test(
                "Backend Health Check", 
                False, 
                f"Health check failed - Status: {status}, Response: {data}"
            )

    def test_get_categories(self):
        """Get categories for product creation testing"""
        print("\n📂 Getting Categories for Product Testing...")
        success, status, data = self.make_request('GET', '/categories')
        
        if success and data.get('success'):
            categories = data.get('data', [])
            # Store categories for later use
            for cat in categories:
                self.categories[cat.get('slug', '')] = cat
            
            return self.log_test(
                "Get Categories", 
                True, 
                f"Retrieved {len(categories)} categories for testing"
            )
        else:
            return self.log_test(
                "Get Categories", 
                False, 
                f"Failed to get categories - Status: {status}, Response: {data}"
            )

    def test_product_creation_basic(self):
        """Test basic product creation - Core RLS fix verification"""
        print("\n✨ Testing Product Creation (RLS Fix Verification)...")
        
        if not self.categories:
            return self.log_test(
                "Product Creation - Basic", 
                False, 
                "No categories available for testing"
            )

        # Use Home category (one of the empty categories mentioned in test_result.md)
        home_category = self.categories.get('home')
        if not home_category:
            return self.log_test(
                "Product Creation - Basic", 
                False, 
                "Home category not found for testing"
            )

        # Create realistic product data for Home category
        timestamp = datetime.now().strftime('%H%M%S')
        product_data = {
            "name": f"Smart Home Security Camera {timestamp}",
            "slug": f"smart-home-security-camera-{timestamp}",
            "description": "High-definition wireless security camera with night vision and motion detection. Perfect for home monitoring and security.",
            "price": 149.99,
            "original_price": 199.99,
            "category_id": home_category['id'],
            "sku": f"HOME-CAM-{timestamp}",
            "brand": "SecureHome",
            "stock_quantity": 25,
            "is_active": True,
            "is_featured": False,
            "images": [
                "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500",
                "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500"
            ],
            "specifications": {
                "resolution": "1080p HD",
                "connectivity": "WiFi",
                "power": "Battery/AC Adapter",
                "storage": "Cloud/SD Card"
            },
            "features": ["security", "smart home", "wireless", "hd camera"]
        }

        success, status, data = self.make_request('POST', '/products', product_data, 201)
        
        if success and data.get('success'):
            product = data.get('data', {})
            return self.log_test(
                "Product Creation - Basic", 
                True, 
                f"✅ RLS FIX VERIFIED! Product created successfully - ID: {product.get('id', 'unknown')}, Name: {product.get('name', 'unknown')}"
            )
        else:
            error_msg = data.get('message', 'Unknown error')
            # Check if it's still an RLS error
            if 'row-level security' in error_msg.lower() or 'rls' in error_msg.lower():
                return self.log_test(
                    "Product Creation - Basic", 
                    False, 
                    f"🚨 RLS ISSUE STILL EXISTS: {error_msg} - Status: {status}"
                )
            else:
                return self.log_test(
                    "Product Creation - Basic", 
                    False, 
                    f"Product creation failed - Status: {status}, Error: {error_msg}"
                )

    def test_product_creation_multiple_categories(self):
        """Test product creation for multiple empty categories"""
        print("\n🏪 Testing Product Creation for Empty Categories...")
        
        # Categories that were empty according to test_result.md
        empty_categories = ['home', 'sports', 'grocery', 'appliances', 'solar', 'pharmacy', 'beauty']
        successful_creations = 0
        
        for category_slug in empty_categories:
            category = self.categories.get(category_slug)
            if not category:
                self.log_test(
                    f"Product Creation - {category_slug.title()}", 
                    False, 
                    f"Category {category_slug} not found"
                )
                continue

            # Create category-appropriate product
            timestamp = datetime.now().strftime('%H%M%S')
            product_data = self.get_category_product_data(category_slug, category['id'], timestamp)
            
            success, status, data = self.make_request('POST', '/products', product_data, 201)
            
            if success and data.get('success'):
                product = data.get('data', {})
                self.log_test(
                    f"Product Creation - {category_slug.title()}", 
                    True, 
                    f"Product created - {product.get('name', 'unknown')}"
                )
                successful_creations += 1
            else:
                error_msg = data.get('message', 'Unknown error')
                self.log_test(
                    f"Product Creation - {category_slug.title()}", 
                    False, 
                    f"Failed - {error_msg}"
                )

        # Overall assessment
        if successful_creations >= len(empty_categories) * 0.7:  # 70% success rate
            self.log_test(
                "Multiple Category Product Creation", 
                True, 
                f"Successfully created products in {successful_creations}/{len(empty_categories)} empty categories"
            )
            return True
        else:
            self.log_test(
                "Multiple Category Product Creation", 
                False, 
                f"Only {successful_creations}/{len(empty_categories)} categories populated successfully"
            )
            return False

    def get_category_product_data(self, category_slug, category_id, timestamp):
        """Generate realistic product data for different categories"""
        products_by_category = {
            'home': {
                "name": f"Smart LED Light Bulb {timestamp}",
                "slug": f"smart-led-light-bulb-{timestamp}",
                "description": "Energy-efficient smart LED bulb with app control and color changing features.",
                "price": 24.99,
                "brand": "SmartLight",
                "sku": f"HOME-LED-{timestamp}"
            },
            'sports': {
                "name": f"Professional Basketball {timestamp}",
                "slug": f"professional-basketball-{timestamp}",
                "description": "Official size and weight basketball for indoor and outdoor play.",
                "price": 39.99,
                "brand": "SportsPro",
                "sku": f"SPORT-BALL-{timestamp}"
            },
            'grocery': {
                "name": f"Organic Protein Powder {timestamp}",
                "slug": f"organic-protein-powder-{timestamp}",
                "description": "Plant-based organic protein powder with vanilla flavor.",
                "price": 49.99,
                "brand": "NutriOrg",
                "sku": f"GROC-PROT-{timestamp}"
            },
            'appliances': {
                "name": f"Compact Air Fryer {timestamp}",
                "slug": f"compact-air-fryer-{timestamp}",
                "description": "3.5L capacity air fryer with digital controls and preset cooking modes.",
                "price": 89.99,
                "brand": "KitchenPro",
                "sku": f"APPL-FRYER-{timestamp}"
            },
            'solar': {
                "name": f"Solar Panel Kit {timestamp}",
                "slug": f"solar-panel-kit-{timestamp}",
                "description": "100W monocrystalline solar panel kit with charge controller.",
                "price": 199.99,
                "brand": "SolarTech",
                "sku": f"SOLAR-KIT-{timestamp}"
            },
            'pharmacy': {
                "name": f"Digital Thermometer {timestamp}",
                "slug": f"digital-thermometer-{timestamp}",
                "description": "Fast and accurate digital thermometer with fever alarm.",
                "price": 19.99,
                "brand": "HealthCare",
                "sku": f"PHARM-THERM-{timestamp}"
            },
            'beauty': {
                "name": f"Vitamin C Serum {timestamp}",
                "slug": f"vitamin-c-serum-{timestamp}",
                "description": "Anti-aging vitamin C serum with hyaluronic acid for glowing skin.",
                "price": 34.99,
                "brand": "GlowBeauty",
                "sku": f"BEAUTY-SER-{timestamp}"
            }
        }

        base_data = products_by_category.get(category_slug, {
            "name": f"Test Product {timestamp}",
            "slug": f"test-product-{timestamp}",
            "description": "Test product description",
            "price": 29.99,
            "brand": "TestBrand",
            "sku": f"TEST-{timestamp}"
        })

        return {
            **base_data,
            "category_id": category_id,
            "original_price": base_data["price"] * 1.2,
            "stock_quantity": 50,
            "is_active": True,
            "is_featured": False,
            "images": ["https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=500"],
            "features": [category_slug, "new", "quality"]
        }

    def test_existing_product_apis(self):
        """Test that existing product APIs still work after RLS changes"""
        print("\n🔍 Testing Existing Product APIs...")
        
        # Test categories with existing products
        existing_categories = ['electronics', 'fashion', 'books']
        
        for category in existing_categories:
            success, status, data = self.make_request('GET', f'/products/category/{category}')
            
            if success and data.get('success'):
                products = data.get('data', [])
                self.log_test(
                    f"Get Products - {category.title()}", 
                    True, 
                    f"Retrieved {len(products)} products"
                )
            else:
                self.log_test(
                    f"Get Products - {category.title()}", 
                    False, 
                    f"Failed to get {category} products - Status: {status}"
                )

        # Test featured products
        success, status, data = self.make_request('GET', '/products?featured=true')
        if success and data.get('success'):
            products = data.get('data', [])
            self.log_test(
                "Featured Products API", 
                True, 
                f"Retrieved {len(products)} featured products"
            )
        else:
            self.log_test(
                "Featured Products API", 
                False, 
                f"Featured products failed - Status: {status}"
            )

    def test_product_creation_validation(self):
        """Test product creation with validation errors"""
        print("\n🔍 Testing Product Creation Validation...")
        
        if not self.categories:
            return self.log_test(
                "Product Validation Test", 
                False, 
                "No categories available for validation testing"
            )

        home_category = self.categories.get('home')
        if not home_category:
            return self.log_test(
                "Product Validation Test", 
                False, 
                "Home category not found for validation testing"
            )

        # Test with missing required fields
        incomplete_data = {
            "name": "Test Product",
            # Missing description, price, category_id, sku
        }

        success, status, data = self.make_request('POST', '/products', incomplete_data, 400)
        
        if success and not data.get('success'):
            missing_fields = data.get('missing', [])
            return self.log_test(
                "Product Validation Test", 
                True, 
                f"Validation working correctly - Missing fields: {missing_fields}"
            )
        else:
            return self.log_test(
                "Product Validation Test", 
                False, 
                f"Validation not working - Status: {status}, Response: {data}"
            )

    def run_rls_fix_tests(self):
        """Run complete RLS fix verification test suite"""
        print("=" * 70)
        print("🚀 RitZone RLS Policy Fix Testing Suite")
        print("🎯 Focus: Product Creation & RLS Authentication Fix")
        print("=" * 70)
        print(f"📅 Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print(f"🌐 Testing endpoint: {self.base_url}")
        print("=" * 70)

        # Core RLS fix tests
        self.test_backend_health()
        self.test_get_categories()
        self.test_product_creation_basic()
        self.test_product_creation_multiple_categories()
        self.test_existing_product_apis()
        self.test_product_creation_validation()

        # Print Results Summary
        print("\n" + "=" * 70)
        print("📊 RLS FIX TEST RESULTS SUMMARY")
        print("=" * 70)
        
        for result in self.test_results:
            print(f"{result['status']} {result['test']}: {result['message']}")
        
        print(f"\n📈 Overall Results: {self.tests_passed}/{self.tests_run} tests passed")
        
        # Specific RLS assessment
        rls_critical_tests = [
            "Product Creation - Basic",
            "Multiple Category Product Creation"
        ]
        
        rls_tests_passed = sum(1 for result in self.test_results 
                              if result['test'] in rls_critical_tests and "✅ PASS" in result['status'])
        
        print(f"\n🎯 RLS Fix Assessment: {rls_tests_passed}/{len(rls_critical_tests)} critical tests passed")
        
        if rls_tests_passed == len(rls_critical_tests):
            print("🎉 RLS AUTHENTICATION ISSUE RESOLVED!")
            print("✅ Product creation is now working properly")
            return 0
        else:
            print("⚠️ RLS AUTHENTICATION ISSUE MAY STILL EXIST")
            print("❌ Product creation functionality needs further investigation")
            return 1

def main():
    """Main test execution"""
    tester = RLSProductTester()
    return tester.run_rls_fix_tests()

if __name__ == "__main__":
    sys.exit(main())
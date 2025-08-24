#!/usr/bin/env python3
"""
RitZone Featured Products Backend Testing
========================================
Testing the newly implemented Featured Products backend functionality for the admin panel.

Test Coverage:
1. GET /api/admin/homepage/sections - Verify featured products fetching
2. PUT /api/admin/homepage/featured/{product_id} - Test toggling featured status
3. Database integration tests
4. Error handling scenarios
"""

import requests
import json
import sys
import time
from typing import Dict, Any, List, Optional

# Configuration
BACKEND_URL = "https://react-error-fix-2.preview.emergentagent.com"
API_BASE = f"{BACKEND_URL}/api"

class FeaturedProductsBackendTester:
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'Content-Type': 'application/json',
            'User-Agent': 'RitZone-Backend-Tester/1.0'
        })
        self.test_results = []
        self.test_product_ids = []
        
    def log_test(self, test_name: str, success: bool, message: str, details: Optional[Dict] = None):
        """Log test results"""
        result = {
            'test': test_name,
            'success': success,
            'message': message,
            'details': details or {}
        }
        self.test_results.append(result)
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}: {message}")
        if details and not success:
            print(f"   Details: {json.dumps(details, indent=2)}")
    
    def make_request(self, method: str, endpoint: str, data: Optional[Dict] = None) -> Dict[str, Any]:
        """Make HTTP request with error handling"""
        url = f"{API_BASE}{endpoint}"
        try:
            if method.upper() == 'GET':
                response = self.session.get(url, timeout=30)
            elif method.upper() == 'PUT':
                response = self.session.put(url, json=data, timeout=30)
            elif method.upper() == 'POST':
                response = self.session.post(url, json=data, timeout=30)
            else:
                return {'error': f'Unsupported method: {method}'}
            
            return {
                'status_code': response.status_code,
                'data': response.json() if response.content else {},
                'headers': dict(response.headers)
            }
        except requests.exceptions.RequestException as e:
            return {'error': str(e)}
        except json.JSONDecodeError as e:
            return {'error': f'JSON decode error: {str(e)}', 'raw_content': response.text[:500]}
    
    def test_health_check(self):
        """Test basic API connectivity"""
        print("\n🔍 Testing API Health Check...")
        
        result = self.make_request('GET', '/health')
        
        if 'error' in result:
            self.log_test("API Health Check", False, f"Connection failed: {result['error']}")
            return False
        
        if result['status_code'] == 200:
            data = result.get('data', {})
            if data.get('success'):
                self.log_test("API Health Check", True, "Backend is running and accessible")
                return True
            else:
                self.log_test("API Health Check", False, f"Health check returned success=false: {data}")
                return False
        else:
            self.log_test("API Health Check", False, f"HTTP {result['status_code']}: {result.get('data', {})}")
            return False
    
    def test_get_homepage_sections(self):
        """Test GET /api/admin/homepage/sections endpoint"""
        print("\n🏠 Testing GET /api/admin/homepage/sections...")
        
        result = self.make_request('GET', '/admin/homepage/sections')
        
        if 'error' in result:
            self.log_test("GET Homepage Sections", False, f"Request failed: {result['error']}")
            return False
        
        if result['status_code'] != 200:
            self.log_test("GET Homepage Sections", False, 
                         f"HTTP {result['status_code']}: {result.get('data', {})}")
            return False
        
        data = result.get('data', {})
        
        # Check response structure
        if not data.get('success'):
            self.log_test("GET Homepage Sections", False, 
                         f"API returned success=false: {data.get('message', 'No message')}")
            return False
        
        sections_data = data.get('data', {})
        
        # Verify featured_section exists
        if 'featured_section' not in sections_data:
            self.log_test("GET Homepage Sections", False, 
                         "Response missing 'featured_section'", {'sections': list(sections_data.keys())})
            return False
        
        featured_section = sections_data['featured_section']
        
        # Verify featured_section has products array
        if 'products' not in featured_section:
            self.log_test("GET Homepage Sections", False, 
                         "featured_section missing 'products' array", {'featured_section': featured_section})
            return False
        
        products = featured_section['products']
        
        # Store some product IDs for later testing
        if isinstance(products, list) and len(products) > 0:
            for product in products[:3]:  # Store up to 3 product IDs
                if isinstance(product, dict) and 'id' in product:
                    self.test_product_ids.append(product['id'])
        
        # Verify product data structure
        if len(products) > 0:
            sample_product = products[0]
            required_fields = ['id', 'name', 'price', 'is_featured']
            missing_fields = [field for field in required_fields if field not in sample_product]
            
            if missing_fields:
                self.log_test("GET Homepage Sections", False, 
                             f"Product missing required fields: {missing_fields}", 
                             {'sample_product': sample_product})
                return False
            
            # Verify is_featured is true for featured products
            if not sample_product.get('is_featured'):
                self.log_test("GET Homepage Sections", False, 
                             "Featured product has is_featured=false", 
                             {'product': sample_product})
                return False
        
        self.log_test("GET Homepage Sections", True, 
                     f"Successfully fetched {len(products)} featured products", 
                     {'product_count': len(products), 'sample_fields': list(products[0].keys()) if products else []})
        return True
    
    def test_toggle_featured_status_true(self):
        """Test PUT /api/admin/homepage/featured/{id} - Set to featured"""
        print("\n⭐ Testing PUT /api/admin/homepage/featured/{id} - Set to Featured...")
        
        if not self.test_product_ids:
            self.log_test("Toggle Featured Status (True)", False, 
                         "No product IDs available for testing")
            return False
        
        product_id = self.test_product_ids[0]
        
        # First set to false, then to true to test the toggle
        result = self.make_request('PUT', f'/admin/homepage/featured/{product_id}', 
                                 {'is_featured': False})
        
        if 'error' in result or result['status_code'] != 200:
            self.log_test("Toggle Featured Status (True)", False, 
                         f"Failed to set product to non-featured first: {result}")
            return False
        
        # Now set to true
        result = self.make_request('PUT', f'/admin/homepage/featured/{product_id}', 
                                 {'is_featured': True})
        
        if 'error' in result:
            self.log_test("Toggle Featured Status (True)", False, 
                         f"Request failed: {result['error']}")
            return False
        
        if result['status_code'] != 200:
            self.log_test("Toggle Featured Status (True)", False, 
                         f"HTTP {result['status_code']}: {result.get('data', {})}")
            return False
        
        data = result.get('data', {})
        
        if not data.get('success'):
            self.log_test("Toggle Featured Status (True)", False, 
                         f"API returned success=false: {data.get('message', 'No message')}")
            return False
        
        # Verify response format
        if 'data' not in data:
            self.log_test("Toggle Featured Status (True)", False, 
                         "Response missing 'data' field", {'response': data})
            return False
        
        product_data = data['data']
        
        # Verify is_featured is now true
        if not product_data.get('is_featured'):
            self.log_test("Toggle Featured Status (True)", False, 
                         "Product is_featured not set to true", {'product': product_data})
            return False
        
        self.log_test("Toggle Featured Status (True)", True, 
                     f"Successfully set product {product_id} as featured", 
                     {'product_id': product_id, 'is_featured': product_data.get('is_featured')})
        return True
    
    def test_toggle_featured_status_false(self):
        """Test PUT /api/admin/homepage/featured/{id} - Remove from featured"""
        print("\n⭐ Testing PUT /api/admin/homepage/featured/{id} - Remove from Featured...")
        
        if not self.test_product_ids:
            self.log_test("Toggle Featured Status (False)", False, 
                         "No product IDs available for testing")
            return False
        
        product_id = self.test_product_ids[0]
        
        result = self.make_request('PUT', f'/admin/homepage/featured/{product_id}', 
                                 {'is_featured': False})
        
        if 'error' in result:
            self.log_test("Toggle Featured Status (False)", False, 
                         f"Request failed: {result['error']}")
            return False
        
        if result['status_code'] != 200:
            self.log_test("Toggle Featured Status (False)", False, 
                         f"HTTP {result['status_code']}: {result.get('data', {})}")
            return False
        
        data = result.get('data', {})
        
        if not data.get('success'):
            self.log_test("Toggle Featured Status (False)", False, 
                         f"API returned success=false: {data.get('message', 'No message')}")
            return False
        
        product_data = data['data']
        
        # Verify is_featured is now false
        if product_data.get('is_featured'):
            self.log_test("Toggle Featured Status (False)", False, 
                         "Product is_featured not set to false", {'product': product_data})
            return False
        
        self.log_test("Toggle Featured Status (False)", True, 
                     f"Successfully removed product {product_id} from featured", 
                     {'product_id': product_id, 'is_featured': product_data.get('is_featured')})
        return True
    
    def test_database_persistence(self):
        """Test that featured status changes persist in database"""
        print("\n💾 Testing Database Persistence...")
        
        if not self.test_product_ids:
            self.log_test("Database Persistence", False, 
                         "No product IDs available for testing")
            return False
        
        product_id = self.test_product_ids[0]
        
        # Set product as featured
        result = self.make_request('PUT', f'/admin/homepage/featured/{product_id}', 
                                 {'is_featured': True})
        
        if 'error' in result or result['status_code'] != 200:
            self.log_test("Database Persistence", False, 
                         f"Failed to set product as featured: {result}")
            return False
        
        # Wait a moment for database to update
        time.sleep(1)
        
        # Fetch homepage sections to verify the change persisted
        sections_result = self.make_request('GET', '/admin/homepage/sections')
        
        if 'error' in sections_result or sections_result['status_code'] != 200:
            self.log_test("Database Persistence", False, 
                         f"Failed to fetch sections after update: {sections_result}")
            return False
        
        sections_data = sections_result.get('data', {}).get('data', {})
        featured_products = sections_data.get('featured_section', {}).get('products', [])
        
        # Check if our product is in the featured list
        product_found = False
        for product in featured_products:
            if product.get('id') == product_id and product.get('is_featured'):
                product_found = True
                break
        
        if not product_found:
            self.log_test("Database Persistence", False, 
                         f"Product {product_id} not found in featured products after update", 
                         {'featured_count': len(featured_products)})
            return False
        
        self.log_test("Database Persistence", True, 
                     f"Featured status change persisted in database for product {product_id}")
        return True
    
    def test_error_handling_invalid_product_id(self):
        """Test error handling for invalid product ID"""
        print("\n🚫 Testing Error Handling - Invalid Product ID...")
        
        invalid_id = "invalid-product-id-12345"
        
        result = self.make_request('PUT', f'/admin/homepage/featured/{invalid_id}', 
                                 {'is_featured': True})
        
        if 'error' in result:
            self.log_test("Error Handling - Invalid Product ID", False, 
                         f"Request failed: {result['error']}")
            return False
        
        # Should return 400 or similar error status
        if result['status_code'] == 200:
            data = result.get('data', {})
            if data.get('success'):
                self.log_test("Error Handling - Invalid Product ID", False, 
                             "API incorrectly returned success for invalid product ID", 
                             {'response': data})
                return False
        
        # Check if proper error response
        if result['status_code'] in [400, 404]:
            data = result.get('data', {})
            if not data.get('success', True):  # success should be false for errors
                self.log_test("Error Handling - Invalid Product ID", True, 
                             f"Correctly handled invalid product ID with HTTP {result['status_code']}")
                return True
        
        self.log_test("Error Handling - Invalid Product ID", False, 
                     f"Unexpected response for invalid product ID: HTTP {result['status_code']}", 
                     {'response': result.get('data', {})})
        return False
    
    def test_error_handling_missing_field(self):
        """Test error handling for missing is_featured field"""
        print("\n🚫 Testing Error Handling - Missing is_featured Field...")
        
        if not self.test_product_ids:
            self.log_test("Error Handling - Missing Field", False, 
                         "No product IDs available for testing")
            return False
        
        product_id = self.test_product_ids[0]
        
        # Send request without is_featured field
        result = self.make_request('PUT', f'/admin/homepage/featured/{product_id}', {})
        
        if 'error' in result:
            self.log_test("Error Handling - Missing Field", False, 
                         f"Request failed: {result['error']}")
            return False
        
        # Should return 400 error
        if result['status_code'] != 400:
            self.log_test("Error Handling - Missing Field", False, 
                         f"Expected HTTP 400, got {result['status_code']}", 
                         {'response': result.get('data', {})})
            return False
        
        data = result.get('data', {})
        if data.get('success', True):  # success should be false
            self.log_test("Error Handling - Missing Field", False, 
                         "API incorrectly returned success for missing field", 
                         {'response': data})
            return False
        
        self.log_test("Error Handling - Missing Field", True, 
                     "Correctly handled missing is_featured field with HTTP 400")
        return True
    
    def test_error_handling_invalid_field_type(self):
        """Test error handling for invalid is_featured field type"""
        print("\n🚫 Testing Error Handling - Invalid Field Type...")
        
        if not self.test_product_ids:
            self.log_test("Error Handling - Invalid Field Type", False, 
                         "No product IDs available for testing")
            return False
        
        product_id = self.test_product_ids[0]
        
        # Send request with invalid field type (string instead of boolean)
        result = self.make_request('PUT', f'/admin/homepage/featured/{product_id}', 
                                 {'is_featured': 'true'})
        
        if 'error' in result:
            self.log_test("Error Handling - Invalid Field Type", False, 
                         f"Request failed: {result['error']}")
            return False
        
        # Should return 400 error
        if result['status_code'] != 400:
            self.log_test("Error Handling - Invalid Field Type", False, 
                         f"Expected HTTP 400, got {result['status_code']}", 
                         {'response': result.get('data', {})})
            return False
        
        data = result.get('data', {})
        if data.get('success', True):  # success should be false
            self.log_test("Error Handling - Invalid Field Type", False, 
                         "API incorrectly returned success for invalid field type", 
                         {'response': data})
            return False
        
        self.log_test("Error Handling - Invalid Field Type", True, 
                     "Correctly handled invalid field type with HTTP 400")
        return True
    
    def test_featured_products_only_active(self):
        """Test that getFeaturedProducts only returns active products"""
        print("\n🔍 Testing Featured Products Filter - Active Only...")
        
        result = self.make_request('GET', '/admin/homepage/sections')
        
        if 'error' in result or result['status_code'] != 200:
            self.log_test("Featured Products Filter", False, 
                         f"Failed to fetch sections: {result}")
            return False
        
        data = result.get('data', {})
        sections_data = data.get('data', {})
        featured_products = sections_data.get('featured_section', {}).get('products', [])
        
        # Check that all returned products have is_featured=true
        non_featured_products = []
        for product in featured_products:
            if not product.get('is_featured'):
                non_featured_products.append(product.get('id', 'unknown'))
        
        if non_featured_products:
            self.log_test("Featured Products Filter", False, 
                         f"Found non-featured products in featured section: {non_featured_products}")
            return False
        
        self.log_test("Featured Products Filter", True, 
                     f"All {len(featured_products)} products in featured section have is_featured=true")
        return True
    
    def run_all_tests(self):
        """Run all tests in sequence"""
        print("🚀 Starting RitZone Featured Products Backend Tests")
        print("=" * 60)
        
        # Test sequence
        tests = [
            self.test_health_check,
            self.test_get_homepage_sections,
            self.test_toggle_featured_status_true,
            self.test_toggle_featured_status_false,
            self.test_database_persistence,
            self.test_featured_products_only_active,
            self.test_error_handling_invalid_product_id,
            self.test_error_handling_missing_field,
            self.test_error_handling_invalid_field_type,
        ]
        
        passed = 0
        failed = 0
        
        for test in tests:
            try:
                if test():
                    passed += 1
                else:
                    failed += 1
            except Exception as e:
                self.log_test(test.__name__, False, f"Test threw exception: {str(e)}")
                failed += 1
        
        # Print summary
        print("\n" + "=" * 60)
        print("🏁 TEST SUMMARY")
        print("=" * 60)
        print(f"✅ Passed: {passed}")
        print(f"❌ Failed: {failed}")
        print(f"📊 Total:  {passed + failed}")
        
        if failed == 0:
            print("\n🎉 ALL TESTS PASSED! Featured Products backend is working correctly.")
        else:
            print(f"\n⚠️  {failed} test(s) failed. Please review the issues above.")
        
        return failed == 0

def main():
    """Main test execution"""
    tester = FeaturedProductsBackendTester()
    success = tester.run_all_tests()
    
    # Exit with appropriate code
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()
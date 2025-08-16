#!/usr/bin/env python3
"""
RitZone Featured Products CRUD Backend Testing Suite - January 2025
==================================================================
Comprehensive testing for the newly implemented Featured Products CRUD functionality:

Test Coverage:
1. Product Update API Testing (PUT /api/products/:id)
2. Product Delete API Testing (DELETE /api/products/:id) 
3. Existing Featured Products API Retesting
4. Integration Testing
5. Data Structure Verification

Focus Areas:
- Backend cart API endpoints validation
- Product CRUD operations with featured status management
- Soft delete behavior (is_active=false, is_featured=false)
- Error handling for invalid product IDs and data formats
- Database persistence and data integrity
"""

import requests
import json
import sys
import uuid
import time
from datetime import datetime
from typing import Dict, Any, List, Optional

class FeaturedProductsCRUDTester:
    def __init__(self):
        # Use local backend URL (running on port 10000)
        self.base_url = "http://localhost:10000/api"
        self.session = requests.Session()
        self.session.headers.update({
            'Content-Type': 'application/json',
            'User-Agent': 'RitZone-CRUD-Tester/1.0'
        })
        self.test_results = []
        self.test_product_ids = []
        self.created_product_id = None
        self.tests_run = 0
        self.tests_passed = 0

    def log_test(self, test_name: str, success: bool, message: str, details: Optional[Dict] = None):
        """Log test results with detailed information"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            status = "✅ PASS"
        else:
            status = "❌ FAIL"
        
        result = {
            'test': test_name,
            'success': success,
            'message': message,
            'details': details or {}
        }
        self.test_results.append(result)
        print(f"{status} {test_name}: {message}")
        if details and not success:
            print(f"   Details: {json.dumps(details, indent=2)}")
        return success

    def make_request(self, method: str, endpoint: str, data: Optional[Dict] = None, expected_status: int = 200) -> Dict[str, Any]:
        """Make HTTP request with comprehensive error handling"""
        url = f"{self.base_url}{endpoint}"
        try:
            if method.upper() == 'GET':
                response = self.session.get(url, timeout=30)
            elif method.upper() == 'PUT':
                response = self.session.put(url, json=data, timeout=30)
            elif method.upper() == 'POST':
                response = self.session.post(url, json=data, timeout=30)
            elif method.upper() == 'DELETE':
                response = self.session.delete(url, timeout=30)
            else:
                return {'error': f'Unsupported method: {method}'}
            
            return {
                'status_code': response.status_code,
                'data': response.json() if response.content else {},
                'headers': dict(response.headers),
                'success': response.status_code == expected_status
            }
        except requests.exceptions.RequestException as e:
            return {'error': str(e), 'success': False}
        except json.JSONDecodeError as e:
            return {'error': f'JSON decode error: {str(e)}', 'raw_content': response.text[:500], 'success': False}

    def test_backend_health(self):
        """Test backend connectivity and health"""
        print("\n🔍 Testing Backend Health Check...")
        
        result = self.make_request('GET', '/health')
        
        if 'error' in result:
            return self.log_test("Backend Health Check", False, f"Connection failed: {result['error']}")
        
        if result['status_code'] == 200:
            data = result.get('data', {})
            if data.get('success'):
                return self.log_test("Backend Health Check", True, "Backend is running and accessible")
            else:
                return self.log_test("Backend Health Check", False, f"Health check returned success=false: {data}")
        else:
            return self.log_test("Backend Health Check", False, f"HTTP {result['status_code']}: {result.get('data', {})}")

    def test_get_existing_products(self):
        """Get existing products for testing CRUD operations"""
        print("\n📦 Testing Get Existing Products for CRUD Testing...")
        
        result = self.make_request('GET', '/products?limit=10')
        
        if 'error' in result:
            return self.log_test("Get Existing Products", False, f"Request failed: {result['error']}")
        
        if result['status_code'] != 200:
            return self.log_test("Get Existing Products", False, f"HTTP {result['status_code']}: {result.get('data', {})}")
        
        data = result.get('data', {})
        if not data.get('success'):
            return self.log_test("Get Existing Products", False, f"API returned success=false: {data.get('message', 'No message')}")
        
        products = data.get('data', [])
        if not products:
            return self.log_test("Get Existing Products", False, "No products found for testing")
        
        # Store product IDs for testing
        for product in products[:5]:  # Store up to 5 product IDs
            if isinstance(product, dict) and 'id' in product:
                self.test_product_ids.append(product['id'])
        
        return self.log_test("Get Existing Products", True, f"Retrieved {len(products)} products for testing", 
                           {'product_count': len(products), 'test_product_ids': self.test_product_ids[:3]})

    def test_create_product_for_testing(self):
        """Create a new product specifically for CRUD testing"""
        print("\n✨ Testing Create Product for CRUD Testing...")
        
        # Create a unique product for testing
        timestamp = datetime.now().strftime('%H%M%S%f')[:-3]
        product_data = {
            "name": f"CRUD Test Product {timestamp}",
            "description": f"Test product created for CRUD testing at {datetime.now().isoformat()}",
            "price": 99.99,
            "category_id": "62e76cdb-d138-4380-a4dc-820964a02670",  # Electronics category ID
            "sku": f"CRUD-TEST-{timestamp}",
            "brand": "TestBrand",
            "stock_quantity": 100,
            "is_active": True,
            "is_featured": False,
            "images": ["https://via.placeholder.com/300x300?text=Test+Product"]
        }
        
        result = self.make_request('POST', '/products', product_data, 201)
        
        if 'error' in result:
            return self.log_test("Create Product for Testing", False, f"Request failed: {result['error']}")
        
        if result['status_code'] != 201:
            return self.log_test("Create Product for Testing", False, f"HTTP {result['status_code']}: {result.get('data', {})}")
        
        data = result.get('data', {})
        if not data.get('success'):
            return self.log_test("Create Product for Testing", False, f"API returned success=false: {data.get('message', 'No message')}")
        
        created_product = data.get('data', {})
        if 'id' in created_product:
            self.created_product_id = created_product['id']
            self.test_product_ids.append(self.created_product_id)
        
        return self.log_test("Create Product for Testing", True, f"Created test product with ID: {self.created_product_id}")

    def test_product_update_api(self):
        """Test PUT /api/products/:id endpoint for updating product details"""
        print("\n🔄 Testing Product Update API (PUT /api/products/:id)...")
        
        if not self.test_product_ids:
            return self.log_test("Product Update API", False, "No product IDs available for testing")
        
        product_id = self.test_product_ids[0]
        
        # Test updating various product fields
        update_data = {
            "name": f"Updated Product Name {datetime.now().strftime('%H%M%S')}",
            "description": "Updated description for CRUD testing",
            "price": 149.99,
            "brand": "UpdatedBrand",
            "stock_quantity": 75,
            "is_active": True,
            "images": ["https://via.placeholder.com/400x400?text=Updated+Product"]
        }
        
        result = self.make_request('PUT', f'/products/{product_id}', update_data)
        
        if 'error' in result:
            return self.log_test("Product Update API", False, f"Request failed: {result['error']}")
        
        if result['status_code'] != 200:
            return self.log_test("Product Update API", False, f"HTTP {result['status_code']}: {result.get('data', {})}")
        
        data = result.get('data', {})
        if not data.get('success'):
            return self.log_test("Product Update API", False, f"API returned success=false: {data.get('message', 'No message')}")
        
        updated_product = data.get('data', {})
        
        # Verify updated fields
        verification_passed = True
        verification_details = {}
        
        if updated_product.get('name') != update_data['name']:
            verification_passed = False
            verification_details['name_mismatch'] = f"Expected: {update_data['name']}, Got: {updated_product.get('name')}"
        
        if updated_product.get('price') != update_data['price']:
            verification_passed = False
            verification_details['price_mismatch'] = f"Expected: {update_data['price']}, Got: {updated_product.get('price')}"
        
        if not verification_passed:
            return self.log_test("Product Update API", False, "Updated data verification failed", verification_details)
        
        return self.log_test("Product Update API", True, f"Successfully updated product {product_id}", 
                           {'updated_fields': list(update_data.keys()), 'product_id': product_id})

    def test_product_update_validation(self):
        """Test product update API validation and error handling"""
        print("\n🚫 Testing Product Update API Validation...")
        
        if not self.test_product_ids:
            return self.log_test("Product Update Validation", False, "No product IDs available for testing")
        
        # Test with invalid product ID
        invalid_id = str(uuid.uuid4())
        update_data = {"name": "Test Update"}
        
        result = self.make_request('PUT', f'/products/{invalid_id}', update_data, 400)
        
        if 'error' in result:
            return self.log_test("Product Update Validation", False, f"Request failed: {result['error']}")
        
        # Should return 400 or 404 for invalid product ID
        if result['status_code'] not in [400, 404]:
            return self.log_test("Product Update Validation", False, 
                               f"Expected HTTP 400/404 for invalid product ID, got {result['status_code']}")
        
        data = result.get('data', {})
        if data.get('success', True):  # success should be false for errors
            return self.log_test("Product Update Validation", False, "API incorrectly returned success for invalid product ID")
        
        return self.log_test("Product Update Validation", True, "Correctly handled invalid product ID validation")

    def test_product_delete_api(self):
        """Test DELETE /api/products/:id endpoint for soft delete"""
        print("\n🗑️ Testing Product Delete API (DELETE /api/products/:id)...")
        
        if not self.created_product_id:
            return self.log_test("Product Delete API", False, "No created product available for delete testing")
        
        result = self.make_request('DELETE', f'/products/{self.created_product_id}')
        
        if 'error' in result:
            return self.log_test("Product Delete API", False, f"Request failed: {result['error']}")
        
        if result['status_code'] != 200:
            return self.log_test("Product Delete API", False, f"HTTP {result['status_code']}: {result.get('data', {})}")
        
        data = result.get('data', {})
        if not data.get('success'):
            return self.log_test("Product Delete API", False, f"API returned success=false: {data.get('message', 'No message')}")
        
        deleted_product = data.get('data', {})
        
        # Verify soft delete behavior (is_active=false, is_featured=false)
        if deleted_product.get('is_active') != False:
            return self.log_test("Product Delete API", False, "Product is_active not set to false after delete")
        
        if deleted_product.get('is_featured') != False:
            return self.log_test("Product Delete API", False, "Product is_featured not set to false after delete")
        
        return self.log_test("Product Delete API", True, f"Successfully soft deleted product {self.created_product_id}", 
                           {'is_active': deleted_product.get('is_active'), 'is_featured': deleted_product.get('is_featured')})

    def test_delete_validation(self):
        """Test delete API validation for non-existent products"""
        print("\n🚫 Testing Product Delete API Validation...")
        
        # Test with invalid product ID
        invalid_id = str(uuid.uuid4())
        
        result = self.make_request('DELETE', f'/products/{invalid_id}', expected_status=400)
        
        if 'error' in result:
            return self.log_test("Product Delete Validation", False, f"Request failed: {result['error']}")
        
        # Should return 400 or 404 for invalid product ID
        if result['status_code'] not in [400, 404]:
            return self.log_test("Product Delete Validation", False, 
                               f"Expected HTTP 400/404 for invalid product ID, got {result['status_code']}")
        
        data = result.get('data', {})
        if data.get('success', True):  # success should be false for errors
            return self.log_test("Product Delete Validation", False, "API incorrectly returned success for invalid product ID")
        
        return self.log_test("Product Delete Validation", True, "Correctly handled invalid product ID for delete")

    def test_existing_featured_products_api(self):
        """Retest existing Featured Products API endpoints"""
        print("\n⭐ Testing Existing Featured Products API...")
        
        # Test GET /api/admin/homepage/sections
        result = self.make_request('GET', '/admin/homepage/sections')
        
        if 'error' in result:
            return self.log_test("Existing Featured Products API", False, f"Request failed: {result['error']}")
        
        if result['status_code'] != 200:
            return self.log_test("Existing Featured Products API", False, f"HTTP {result['status_code']}: {result.get('data', {})}")
        
        data = result.get('data', {})
        if not data.get('success'):
            return self.log_test("Existing Featured Products API", False, f"API returned success=false: {data.get('message', 'No message')}")
        
        sections_data = data.get('data', {})
        
        # Verify featured_section exists and has proper structure
        if 'featured_section' not in sections_data:
            return self.log_test("Existing Featured Products API", False, "Response missing 'featured_section'")
        
        featured_section = sections_data['featured_section']
        if 'products' not in featured_section:
            return self.log_test("Existing Featured Products API", False, "featured_section missing 'products' array")
        
        products = featured_section['products']
        
        # Verify data structure compatibility
        if len(products) > 0:
            sample_product = products[0]
            required_fields = ['id', 'name', 'description', 'price', 'images', 'brand', 'is_featured', 'is_active', 'stock_quantity']
            missing_fields = [field for field in required_fields if field not in sample_product]
            
            if missing_fields:
                return self.log_test("Existing Featured Products API", False, 
                                   f"Product missing required fields: {missing_fields}")
        
        return self.log_test("Existing Featured Products API", True, 
                           f"Successfully fetched {len(products)} featured products with proper data structure")

    def test_featured_toggle_api(self):
        """Test PUT /api/admin/homepage/featured/:id for featured toggle"""
        print("\n🔄 Testing Featured Toggle API...")
        
        if not self.test_product_ids:
            return self.log_test("Featured Toggle API", False, "No product IDs available for testing")
        
        product_id = self.test_product_ids[0]
        
        # Test setting product as featured
        result = self.make_request('PUT', f'/admin/homepage/featured/{product_id}', {'is_featured': True})
        
        if 'error' in result:
            return self.log_test("Featured Toggle API", False, f"Request failed: {result['error']}")
        
        if result['status_code'] != 200:
            return self.log_test("Featured Toggle API", False, f"HTTP {result['status_code']}: {result.get('data', {})}")
        
        data = result.get('data', {})
        if not data.get('success'):
            return self.log_test("Featured Toggle API", False, f"API returned success=false: {data.get('message', 'No message')}")
        
        product_data = data.get('data', {})
        if not product_data.get('is_featured'):
            return self.log_test("Featured Toggle API", False, "Product is_featured not set to true")
        
        return self.log_test("Featured Toggle API", True, f"Successfully toggled featured status for product {product_id}")

    def test_integration_workflow(self):
        """Test complete integration workflow: Create -> Feature -> Update -> Delete"""
        print("\n🔄 Testing Complete Integration Workflow...")
        
        # Step 1: Create a product
        timestamp = datetime.now().strftime('%H%M%S%f')[:-3]
        product_data = {
            "name": f"Integration Test Product {timestamp}",
            "description": "Product for integration testing workflow",
            "price": 199.99,
            "category_id": "62e76cdb-d138-4380-a4dc-820964a02670",  # Electronics category ID
            "sku": f"INT-TEST-{timestamp}",
            "brand": "IntegrationBrand",
            "stock_quantity": 50,
            "is_active": True,
            "is_featured": False
        }
        
        create_result = self.make_request('POST', '/products', product_data, 201)
        if not create_result.get('success'):
            return self.log_test("Integration Workflow", False, "Failed to create product for integration test")
        
        integration_product_id = create_result['data']['data']['id']
        
        # Step 2: Make it featured
        feature_result = self.make_request('PUT', f'/admin/homepage/featured/{integration_product_id}', {'is_featured': True})
        if not feature_result.get('success'):
            return self.log_test("Integration Workflow", False, "Failed to set product as featured")
        
        # Step 3: Update the product
        update_data = {"name": f"Updated Integration Product {timestamp}", "price": 249.99}
        update_result = self.make_request('PUT', f'/products/{integration_product_id}', update_data)
        if not update_result.get('success'):
            return self.log_test("Integration Workflow", False, "Failed to update featured product")
        
        # Step 4: Delete the product (soft delete)
        delete_result = self.make_request('DELETE', f'/products/{integration_product_id}')
        if not delete_result.get('success'):
            return self.log_test("Integration Workflow", False, "Failed to delete product")
        
        # Verify final state
        deleted_product = delete_result['data']['data']
        if deleted_product.get('is_active') != False or deleted_product.get('is_featured') != False:
            return self.log_test("Integration Workflow", False, "Product not properly soft deleted")
        
        return self.log_test("Integration Workflow", True, 
                           f"Successfully completed full integration workflow for product {integration_product_id}")

    def test_data_structure_verification(self):
        """Verify all API responses match expected format for frontend component"""
        print("\n📋 Testing Data Structure Verification...")
        
        # Test product data structure from different endpoints
        endpoints_to_test = [
            ('/products?limit=1', 'products'),
            ('/admin/homepage/sections', 'featured_products')
        ]
        
        all_structures_valid = True
        structure_details = {}
        
        for endpoint, test_type in endpoints_to_test:
            result = self.make_request('GET', endpoint)
            
            if not result.get('success'):
                all_structures_valid = False
                structure_details[test_type] = f"Failed to fetch data from {endpoint}"
                continue
            
            data = result['data']['data']
            
            if test_type == 'products':
                products = data if isinstance(data, list) else []
            else:  # featured_products
                products = data.get('featured_section', {}).get('products', [])
            
            if products:
                sample_product = products[0]
                required_fields = ['id', 'name', 'description', 'price', 'images', 'brand', 'is_featured', 'is_active', 'stock_quantity']
                missing_fields = [field for field in required_fields if field not in sample_product]
                
                if missing_fields:
                    all_structures_valid = False
                    structure_details[test_type] = f"Missing fields: {missing_fields}"
                else:
                    structure_details[test_type] = "✅ All required fields present"
        
        if all_structures_valid:
            return self.log_test("Data Structure Verification", True, "All API responses have proper data structure", structure_details)
        else:
            return self.log_test("Data Structure Verification", False, "Data structure issues found", structure_details)

    def run_comprehensive_tests(self):
        """Run all Featured Products CRUD tests"""
        print("=" * 80)
        print("🛒 RitZone Featured Products CRUD Testing Suite - January 2025")
        print("📋 Focus: Product Update/Delete APIs, Featured Products Integration")
        print("=" * 80)
        print(f"📅 Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print(f"🌐 Testing endpoint: {self.base_url}")
        print("=" * 80)

        # Test sequence
        tests = [
            self.test_backend_health,
            self.test_get_existing_products,
            self.test_create_product_for_testing,
            self.test_product_update_api,
            self.test_product_update_validation,
            self.test_product_delete_api,
            self.test_delete_validation,
            self.test_existing_featured_products_api,
            self.test_featured_toggle_api,
            self.test_integration_workflow,
            self.test_data_structure_verification
        ]

        for test in tests:
            try:
                test()
            except Exception as e:
                self.log_test(test.__name__, False, f"Test threw exception: {str(e)}")

        # Print comprehensive results
        print("\n" + "=" * 80)
        print("📊 FEATURED PRODUCTS CRUD TEST RESULTS SUMMARY")
        print("=" * 80)
        
        critical_tests = []
        supporting_tests = []
        
        for result in self.test_results:
            if any(keyword in result['test'].lower() for keyword in ['update api', 'delete api', 'integration workflow']):
                critical_tests.append(result)
            else:
                supporting_tests.append(result)
        
        print("\n🚨 CRITICAL CRUD TESTS:")
        for result in critical_tests:
            status = "✅ PASS" if result['success'] else "❌ FAIL"
            print(f"{status} {result['test']}: {result['message']}")
        
        print("\n📋 SUPPORTING TESTS:")
        for result in supporting_tests:
            status = "✅ PASS" if result['success'] else "❌ FAIL"
            print(f"{status} {result['test']}: {result['message']}")
        
        print(f"\n📈 Overall Results: {self.tests_passed}/{self.tests_run} tests passed")
        
        # Final assessment
        crud_success = all(r['success'] for r in critical_tests)
        print(f"\n🛒 Featured Products CRUD Status: {'✅ WORKING' if crud_success else '❌ FAILING'}")
        
        if not crud_success:
            failed_crud_tests = [r for r in critical_tests if not r['success']]
            print("🔍 Failed CRUD Tests:")
            for test in failed_crud_tests:
                print(f"   - {test['test']}: {test['message']}")
        
        return 0 if self.tests_passed == self.tests_run else 1

def main():
    """Main test execution"""
    tester = FeaturedProductsCRUDTester()
    return tester.run_comprehensive_tests()

if __name__ == "__main__":
    sys.exit(main())
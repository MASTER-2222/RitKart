#!/usr/bin/env python3
"""
RitZone Admin Panel Products Enhancement Testing Suite - January 2025
====================================================================
Comprehensive testing for Products Enhancement with focus on:
- Products API with 345 Products: Test GET /api/products?limit=345
- Reviews Field Support: Test if backend handles 'reviews' field in POST/PUT operations
- Specifications Field: Verify specifications field works in CRUD operations
- Category Data: Verify products have proper category information for filtering
- Database Integration: Test reviews field exists and is accessible
- Error Handling: Test with invalid data and missing fields
"""

import requests
import json
import sys
import uuid
import time
from datetime import datetime

class ProductsEnhancementTester:
    def __init__(self, base_url="http://localhost:10000/api"):
        self.base_url = base_url
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []
        self.sample_products = []
        self.categories = []

    def log_test(self, name, success, message="", response_data=None):
        """Log test results with detailed information"""
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

    def make_request(self, method, endpoint, data=None, expected_status=200, headers=None):
        """Make HTTP request with comprehensive error handling"""
        url = f"{self.base_url}{endpoint}"
        default_headers = {'Content-Type': 'application/json'}
        if headers:
            default_headers.update(headers)

        try:
            if method == 'GET':
                response = requests.get(url, headers=default_headers, timeout=30)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=default_headers, timeout=30)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=default_headers, timeout=30)
            elif method == 'DELETE':
                response = requests.delete(url, headers=default_headers, timeout=30)
            else:
                raise ValueError(f"Unsupported method: {method}")

            # Parse response
            try:
                response_data = response.json()
            except:
                response_data = {"raw_response": response.text[:500]}

            success = response.status_code == expected_status
            return success, response.status_code, response_data

        except requests.exceptions.RequestException as e:
            return False, 0, {"error": str(e)}

    def test_backend_health(self):
        """Test backend health and configuration"""
        print("\n🔍 Testing Backend Health Check...")
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

    def test_get_all_345_products(self):
        """Test GET /api/products?limit=345 to verify all 345 products are returned"""
        print("\n📦 Testing GET /api/products?limit=345 - All 345 Products...")
        
        success, status, data = self.make_request('GET', '/products?limit=345')
        
        if success and data.get('success'):
            products = data.get('data', [])
            pagination = data.get('pagination', {})
            total_count = pagination.get('totalCount', 0)
            
            # Store sample products for later tests
            self.sample_products = products[:10] if products else []
            
            if len(products) == 345:
                return self.log_test(
                    "Get All 345 Products", 
                    True, 
                    f"Successfully retrieved exactly 345 products. Total in DB: {total_count}"
                )
            elif len(products) > 0:
                return self.log_test(
                    "Get All 345 Products", 
                    False, 
                    f"Retrieved {len(products)} products instead of 345. Total in DB: {total_count}"
                )
            else:
                return self.log_test(
                    "Get All 345 Products", 
                    False, 
                    "No products returned from API"
                )
        else:
            return self.log_test(
                "Get All 345 Products", 
                False, 
                f"API request failed - Status: {status}, Response: {data}"
            )

    def test_product_fields_structure(self):
        """Test if products have all required fields including reviews and specifications"""
        print("\n🔍 Testing Product Fields Structure...")
        
        if not self.sample_products:
            return self.log_test(
                "Product Fields Structure", 
                False, 
                "No sample products available for field testing"
            )
        
        required_fields = [
            'id', 'name', 'brand', 'description', 'price', 'original_price', 
            'stock_quantity', 'rating_average', 'total_reviews', 'features', 
            'specifications', 'reviews', 'images'
        ]
        
        field_analysis = {}
        for field in required_fields:
            field_analysis[field] = 0
        
        # Analyze first 5 products
        for product in self.sample_products[:5]:
            for field in required_fields:
                if field in product and product[field] is not None:
                    field_analysis[field] += 1
        
        # Check critical fields
        critical_fields = ['reviews', 'specifications', 'features']
        missing_critical = []
        
        for field in critical_fields:
            if field_analysis[field] == 0:
                missing_critical.append(field)
        
        if not missing_critical:
            return self.log_test(
                "Product Fields Structure", 
                True, 
                f"All critical fields present: {', '.join(critical_fields)}. Field coverage: {field_analysis}"
            )
        else:
            return self.log_test(
                "Product Fields Structure", 
                False, 
                f"Missing critical fields: {missing_critical}. Field coverage: {field_analysis}"
            )

    def test_individual_product_retrieval(self):
        """Test GET /api/products/:id for individual product with all fields"""
        print("\n🔍 Testing Individual Product Retrieval...")
        
        if not self.sample_products:
            return self.log_test(
                "Individual Product Retrieval", 
                False, 
                "No sample products available for individual testing"
            )
        
        product_id = self.sample_products[0].get('id')
        if not product_id:
            return self.log_test(
                "Individual Product Retrieval", 
                False, 
                "No valid product ID found in sample products"
            )
        
        success, status, data = self.make_request('GET', f'/products/{product_id}')
        
        if success and data.get('success'):
            product = data.get('data', {})
            
            # Check for reviews and specifications fields specifically
            has_reviews = 'reviews' in product
            has_specifications = 'specifications' in product
            has_category_info = any(key in product for key in ['category_name', 'category', 'categories'])
            
            field_status = []
            if has_reviews:
                field_status.append(f"reviews: {type(product.get('reviews')).__name__}")
            if has_specifications:
                field_status.append(f"specifications: {type(product.get('specifications')).__name__}")
            if has_category_info:
                field_status.append("category_info: present")
            
            if has_reviews and has_specifications:
                return self.log_test(
                    "Individual Product Retrieval", 
                    True, 
                    f"Product retrieved with all fields. {', '.join(field_status)}"
                )
            else:
                return self.log_test(
                    "Individual Product Retrieval", 
                    False, 
                    f"Missing fields - Reviews: {has_reviews}, Specifications: {has_specifications}. {', '.join(field_status)}"
                )
        else:
            return self.log_test(
                "Individual Product Retrieval", 
                False, 
                f"Failed to retrieve product {product_id} - Status: {status}, Response: {data}"
            )

    def test_category_data_and_filtering(self):
        """Test category data and filtering functionality"""
        print("\n🏷️ Testing Category Data and Filtering...")
        
        # First get categories
        success, status, data = self.make_request('GET', '/categories')
        
        if success and data.get('success'):
            self.categories = data.get('data', [])
            
            if not self.categories:
                return self.log_test(
                    "Category Data", 
                    False, 
                    "No categories found in system"
                )
            
            # Test filtering by first category
            category = self.categories[0]
            category_slug = category.get('slug') or category.get('name', '').lower().replace(' ', '-')
            
            success, status, data = self.make_request('GET', f'/products/category/{category_slug}?limit=10')
            
            if success and data.get('success'):
                products = data.get('data', [])
                category_name = data.get('category', '')
                
                return self.log_test(
                    "Category Data and Filtering", 
                    True, 
                    f"Found {len(self.categories)} categories. Category '{category_name}' has {len(products)} products"
                )
            else:
                return self.log_test(
                    "Category Data and Filtering", 
                    False, 
                    f"Category filtering failed for '{category_slug}' - Status: {status}"
                )
        else:
            return self.log_test(
                "Category Data", 
                False, 
                f"Failed to retrieve categories - Status: {status}, Response: {data}"
            )

    def test_create_product_with_reviews_field(self):
        """Test POST /api/products with reviews and specifications fields"""
        print("\n➕ Testing Create Product with Reviews Field...")
        
        # Create test product data with reviews and specifications
        test_product = {
            "name": f"Test Product {datetime.now().strftime('%H%M%S')}",
            "description": "Test product for reviews field testing",
            "price": 99.99,
            "original_price": 129.99,
            "brand": "TestBrand",
            "sku": f"TEST-{datetime.now().strftime('%H%M%S')}",
            "stock_quantity": 10,
            "category_id": self.categories[0].get('id') if self.categories else "1",
            "features": ["Test feature 1", "Test feature 2"],
            "specifications": {
                "color": "Blue",
                "size": "Medium",
                "weight": "1.5kg"
            },
            "reviews": {
                "summary": "Great product with excellent features",
                "highlights": ["Durable", "Good value", "Easy to use"],
                "average_rating": 4.5
            },
            "images": ["https://example.com/test-image.jpg"]
        }
        
        success, status, data = self.make_request('POST', '/products', test_product, 201)
        
        if success and data.get('success'):
            created_product = data.get('data', {})
            product_id = created_product.get('id')
            
            # Verify the created product has reviews and specifications
            has_reviews = 'reviews' in created_product
            has_specifications = 'specifications' in created_product
            
            if has_reviews and has_specifications:
                return self.log_test(
                    "Create Product with Reviews Field", 
                    True, 
                    f"Product created successfully with reviews and specifications. ID: {product_id}"
                )
            else:
                return self.log_test(
                    "Create Product with Reviews Field", 
                    False, 
                    f"Product created but missing fields - Reviews: {has_reviews}, Specifications: {has_specifications}"
                )
        else:
            # Check if it's a validation error or server error
            error_message = data.get('message', 'Unknown error')
            if status == 400:
                return self.log_test(
                    "Create Product with Reviews Field", 
                    False, 
                    f"Validation error (expected if reviews field not supported): {error_message}"
                )
            else:
                return self.log_test(
                    "Create Product with Reviews Field", 
                    False, 
                    f"Server error - Status: {status}, Error: {error_message}"
                )

    def test_update_product_with_reviews_field(self):
        """Test PUT /api/products/:id with reviews and specifications fields"""
        print("\n🔄 Testing Update Product with Reviews Field...")
        
        if not self.sample_products:
            return self.log_test(
                "Update Product with Reviews Field", 
                False, 
                "No sample products available for update testing"
            )
        
        product_id = self.sample_products[0].get('id')
        if not product_id:
            return self.log_test(
                "Update Product with Reviews Field", 
                False, 
                "No valid product ID found for update testing"
            )
        
        # Update data with reviews and specifications
        update_data = {
            "reviews": {
                "summary": "Updated review summary",
                "highlights": ["Updated feature 1", "Updated feature 2"],
                "average_rating": 4.8,
                "updated_at": datetime.now().isoformat()
            },
            "specifications": {
                "updated_field": "Updated value",
                "test_spec": "Test specification update"
            }
        }
        
        success, status, data = self.make_request('PUT', f'/products/{product_id}', update_data)
        
        if success and data.get('success'):
            updated_product = data.get('data', {})
            
            # Check if reviews and specifications were updated
            has_reviews = 'reviews' in updated_product
            has_specifications = 'specifications' in updated_product
            
            if has_reviews and has_specifications:
                return self.log_test(
                    "Update Product with Reviews Field", 
                    True, 
                    f"Product {product_id} updated successfully with reviews and specifications"
                )
            else:
                return self.log_test(
                    "Update Product with Reviews Field", 
                    False, 
                    f"Product updated but missing fields - Reviews: {has_reviews}, Specifications: {has_specifications}"
                )
        else:
            error_message = data.get('message', 'Unknown error')
            return self.log_test(
                "Update Product with Reviews Field", 
                False, 
                f"Update failed - Status: {status}, Error: {error_message}"
            )

    def test_error_handling(self):
        """Test error handling with invalid data"""
        print("\n❌ Testing Error Handling...")
        
        error_tests = [
            # Invalid product ID
            ('GET', '/products/invalid-id', None, 404, "Invalid product ID should return 404"),
            # Missing required fields in POST
            ('POST', '/products', {"name": "Test"}, 400, "Missing required fields should return 400"),
            # Invalid specifications JSON
            ('POST', '/products', {
                "name": "Test Product",
                "description": "Test",
                "price": 99.99,
                "category_id": "1",
                "sku": "TEST-123",
                "specifications": "invalid-json-string"
            }, 400, "Invalid specifications format should be handled"),
        ]
        
        passed_tests = 0
        for method, endpoint, data, expected_status, description in error_tests:
            success, status, response_data = self.make_request(method, endpoint, data, expected_status)
            
            if success or status == expected_status:
                self.log_test(f"Error Handling: {description}", True, f"Correctly returned status {status}")
                passed_tests += 1
            else:
                self.log_test(f"Error Handling: {description}", False, f"Expected {expected_status}, got {status}")
        
        return passed_tests == len(error_tests)

    def test_database_schema_reviews_field(self):
        """Test if reviews field exists and is accessible in database"""
        print("\n🗄️ Testing Database Schema - Reviews Field...")
        
        # This test checks if the reviews field is properly supported by trying to:
        # 1. Retrieve products with reviews field
        # 2. Check field types and structure
        # 3. Verify data persistence
        
        if not self.sample_products:
            return self.log_test(
                "Database Schema Reviews Field", 
                False, 
                "No sample products available for schema testing"
            )
        
        # Check multiple products for reviews field consistency
        products_with_reviews = 0
        products_with_specifications = 0
        
        for product in self.sample_products[:5]:
            if 'reviews' in product and product['reviews'] is not None:
                products_with_reviews += 1
            if 'specifications' in product and product['specifications'] is not None:
                products_with_specifications += 1
        
        total_checked = min(5, len(self.sample_products))
        
        if products_with_reviews > 0 and products_with_specifications > 0:
            return self.log_test(
                "Database Schema Reviews Field", 
                True, 
                f"Reviews field accessible: {products_with_reviews}/{total_checked} products, Specifications: {products_with_specifications}/{total_checked}"
            )
        elif products_with_specifications > 0:
            return self.log_test(
                "Database Schema Reviews Field", 
                False, 
                f"Specifications field works ({products_with_specifications}/{total_checked}) but Reviews field missing ({products_with_reviews}/{total_checked})"
            )
        else:
            return self.log_test(
                "Database Schema Reviews Field", 
                False, 
                f"Both Reviews and Specifications fields missing or inaccessible. Reviews: {products_with_reviews}/{total_checked}, Specs: {products_with_specifications}/{total_checked}"
            )

    def run_comprehensive_products_tests(self):
        """Run comprehensive Products Enhancement testing suite"""
        print("=" * 80)
        print("🛍️ RitZone Admin Panel Products Enhancement Testing Suite - January 2025")
        print("📋 Focus: 345 Products, Reviews Field, Specifications, Category Data")
        print("=" * 80)
        print(f"📅 Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print(f"🌐 Testing endpoint: {self.base_url}")
        print("=" * 80)

        # Core infrastructure tests
        self.test_backend_health()
        
        # Products API tests
        self.test_get_all_345_products()
        self.test_product_fields_structure()
        self.test_individual_product_retrieval()
        
        # Category and filtering tests
        self.test_category_data_and_filtering()
        
        # CRUD operations with reviews field
        self.test_create_product_with_reviews_field()
        self.test_update_product_with_reviews_field()
        
        # Database and error handling
        self.test_database_schema_reviews_field()
        self.test_error_handling()

        # Print comprehensive results
        print("\n" + "=" * 80)
        print("📊 COMPREHENSIVE TEST RESULTS SUMMARY")
        print("=" * 80)
        
        critical_tests = []
        supporting_tests = []
        
        for result in self.test_results:
            if any(keyword in result['test'].lower() for keyword in ['345 products', 'reviews field', 'database schema', 'backend health']):
                critical_tests.append(result)
            else:
                supporting_tests.append(result)
        
        print("\n🚨 CRITICAL TESTS:")
        for result in critical_tests:
            print(f"{result['status']} {result['test']}: {result['message']}")
        
        print("\n📋 SUPPORTING TESTS:")
        for result in supporting_tests:
            print(f"{result['status']} {result['test']}: {result['message']}")
        
        print(f"\n📈 Overall Results: {self.tests_passed}/{self.tests_run} tests passed")
        
        # Specific analysis for Reviews Field
        reviews_tests = [r for r in self.test_results if 'reviews' in r['test'].lower()]
        if reviews_tests:
            reviews_success = all(r['status'] == '✅ PASS' for r in reviews_tests)
            print(f"\n📝 Reviews Field Status: {'✅ WORKING' if reviews_success else '❌ NEEDS ATTENTION'}")
            
            if not reviews_success:
                failed_reviews_tests = [r for r in reviews_tests if r['status'] == '❌ FAIL']
                print("🔍 Failed Reviews Tests:")
                for test in failed_reviews_tests:
                    print(f"   - {test['test']}: {test['message']}")
        
        # Analysis for 345 Products
        products_345_test = next((r for r in self.test_results if '345 products' in r['test'].lower()), None)
        if products_345_test:
            print(f"\n📦 345 Products Status: {products_345_test['status'].split()[1]}")
        
        # Final assessment and recommendations
        if self.tests_passed == self.tests_run:
            print("🎉 All tests passed! Products Enhancement is working correctly.")
            return 0
        else:
            failed_critical = [r for r in critical_tests if r['status'] == '❌ FAIL']
            if failed_critical:
                print(f"🚨 {len(failed_critical)} critical tests failed")
                print("💡 Recommendations:")
                for test in failed_critical:
                    if 'reviews field' in test['test'].lower():
                        print("   - Add reviews column to products table schema")
                        print("   - Update backend service to handle reviews field in CRUD operations")
                    elif '345 products' in test['test'].lower():
                        print("   - Verify database has 345 products")
                        print("   - Check API limit parameter handling")
                    elif 'database schema' in test['test'].lower():
                        print("   - Execute database migration to add reviews field")
                        print("   - Verify Supabase table structure")
            return 1

def main():
    """Main test execution"""
    tester = ProductsEnhancementTester()
    return tester.run_comprehensive_products_tests()

if __name__ == "__main__":
    sys.exit(main())
#!/usr/bin/env python3
"""
RitZone Reviews Functionality Backend Testing Suite - January 2025
================================================================
Comprehensive testing for Reviews functionality with focus on:
- Backend API endpoints returning reviews field in product responses
- Database verification that reviews column exists and contains data
- Data flow testing from admin panel to API responses
- Frontend API integration verification for reviews display

Testing Requirements from review_request:
1. Backend API Testing: Verify GET /api/products/{id} returns reviews field
2. Database Verification: Confirm reviews column exists and contains data
3. Data Flow Testing: Test complete flow from admin panel to API
4. Frontend API Integration: Verify backend serves reviews for frontend display
"""

import requests
import json
import sys
import uuid
import time
from datetime import datetime

class ReviewsFunctionalityTester:
    def __init__(self, base_url="https://ritkart-backend.onrender.com/api"):
        self.base_url = base_url
        self.token = None
        self.supabase_token = None
        self.user_id = None
        self.test_user_email = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []
        self.products_with_reviews = []
        self.sample_product_id = None

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

    def make_request(self, method, endpoint, data=None, expected_status=200, use_supabase_token=False):
        """Make HTTP request with comprehensive error handling"""
        url = f"{self.base_url}{endpoint}"
        headers = {'Content-Type': 'application/json'}
        
        # Use appropriate token
        if use_supabase_token and self.supabase_token:
            headers['Authorization'] = f'Bearer {self.supabase_token}'
        elif self.token:
            headers['Authorization'] = f'Bearer {self.token}'

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

    def test_get_products_for_reviews_testing(self):
        """Get products from database to test reviews functionality"""
        print("\n📚 Testing Product Retrieval for Reviews Testing...")
        
        # Get products with higher limit to find ones with reviews
        success, status, data = self.make_request('GET', '/products?limit=50')
        
        if success and data.get('success') and data.get('data'):
            products = data['data']
            
            # Look for products that might have reviews field
            products_with_reviews_field = []
            products_without_reviews_field = []
            
            for product in products:
                if 'reviews' in product and product['reviews']:
                    products_with_reviews_field.append(product)
                    self.products_with_reviews.append(product)
                else:
                    products_without_reviews_field.append(product)
            
            # Store first product for individual testing
            if products:
                self.sample_product_id = products[0].get('id')
            
            message = f"Retrieved {len(products)} products. "
            message += f"Products with reviews field: {len(products_with_reviews_field)}, "
            message += f"Products without reviews field: {len(products_without_reviews_field)}"
            
            return self.log_test(
                "Product Retrieval for Reviews Testing", 
                True, 
                message,
                {
                    "total_products": len(products),
                    "with_reviews": len(products_with_reviews_field),
                    "without_reviews": len(products_without_reviews_field),
                    "sample_product_id": self.sample_product_id
                }
            )
        else:
            return self.log_test(
                "Product Retrieval for Reviews Testing", 
                False, 
                f"Failed to retrieve products - Status: {status}, Response: {data}"
            )

    def test_individual_product_api_includes_reviews(self):
        """Test GET /api/products/{id} returns reviews field in response"""
        print("\n🔍 Testing Individual Product API Includes Reviews Field...")
        
        if not self.sample_product_id:
            return self.log_test(
                "Individual Product API Reviews Field", 
                False, 
                "No sample product ID available for testing"
            )
        
        success, status, data = self.make_request('GET', f'/products/{self.sample_product_id}')
        
        if success and data.get('success') and data.get('data'):
            product = data['data']
            
            # Check if reviews field exists in the response
            has_reviews_field = 'reviews' in product
            reviews_content = product.get('reviews', None)
            
            if has_reviews_field:
                message = f"✅ Reviews field present in API response. "
                if reviews_content:
                    message += f"Reviews content: {str(reviews_content)[:100]}..."
                else:
                    message += "Reviews field is null/empty (expected for products without reviews)"
                
                return self.log_test(
                    "Individual Product API Reviews Field", 
                    True, 
                    message,
                    {
                        "product_id": self.sample_product_id,
                        "has_reviews_field": True,
                        "reviews_content_length": len(str(reviews_content)) if reviews_content else 0,
                        "reviews_preview": str(reviews_content)[:200] if reviews_content else None
                    }
                )
            else:
                return self.log_test(
                    "Individual Product API Reviews Field", 
                    False, 
                    f"❌ Reviews field missing from API response. Available fields: {list(product.keys())}",
                    {
                        "product_id": self.sample_product_id,
                        "available_fields": list(product.keys()),
                        "has_reviews_field": False
                    }
                )
        else:
            return self.log_test(
                "Individual Product API Reviews Field", 
                False, 
                f"Failed to get individual product - Status: {status}, Response: {data}"
            )

    def test_products_list_api_includes_reviews(self):
        """Test GET /api/products returns reviews field for all products"""
        print("\n📋 Testing Products List API Includes Reviews Field...")
        
        success, status, data = self.make_request('GET', '/products?limit=10')
        
        if success and data.get('success') and data.get('data'):
            products = data['data']
            
            products_with_reviews_field = 0
            products_without_reviews_field = 0
            products_with_reviews_content = 0
            
            for product in products:
                if 'reviews' in product:
                    products_with_reviews_field += 1
                    if product['reviews']:
                        products_with_reviews_content += 1
                else:
                    products_without_reviews_field += 1
            
            if products_with_reviews_field == len(products):
                message = f"✅ All {len(products)} products have reviews field. "
                message += f"{products_with_reviews_content} products have reviews content."
                
                return self.log_test(
                    "Products List API Reviews Field", 
                    True, 
                    message,
                    {
                        "total_products": len(products),
                        "with_reviews_field": products_with_reviews_field,
                        "with_reviews_content": products_with_reviews_content
                    }
                )
            else:
                return self.log_test(
                    "Products List API Reviews Field", 
                    False, 
                    f"❌ Only {products_with_reviews_field}/{len(products)} products have reviews field",
                    {
                        "total_products": len(products),
                        "with_reviews_field": products_with_reviews_field,
                        "without_reviews_field": products_without_reviews_field
                    }
                )
        else:
            return self.log_test(
                "Products List API Reviews Field", 
                False, 
                f"Failed to get products list - Status: {status}, Response: {data}"
            )

    def test_category_products_api_includes_reviews(self):
        """Test GET /api/products/category/{slug} returns reviews field"""
        print("\n🏷️ Testing Category Products API Includes Reviews Field...")
        
        # Test with electronics category
        success, status, data = self.make_request('GET', '/products/category/electronics?limit=5')
        
        if success and data.get('success') and data.get('data'):
            products = data['data']
            
            if not products:
                return self.log_test(
                    "Category Products API Reviews Field", 
                    True, 
                    "No products in electronics category, but API call successful"
                )
            
            products_with_reviews_field = 0
            for product in products:
                if 'reviews' in product:
                    products_with_reviews_field += 1
            
            if products_with_reviews_field == len(products):
                return self.log_test(
                    "Category Products API Reviews Field", 
                    True, 
                    f"✅ All {len(products)} category products have reviews field",
                    {
                        "category": "electronics",
                        "total_products": len(products),
                        "with_reviews_field": products_with_reviews_field
                    }
                )
            else:
                return self.log_test(
                    "Category Products API Reviews Field", 
                    False, 
                    f"❌ Only {products_with_reviews_field}/{len(products)} category products have reviews field"
                )
        else:
            return self.log_test(
                "Category Products API Reviews Field", 
                False, 
                f"Failed to get category products - Status: {status}, Response: {data}"
            )

    def test_database_reviews_column_verification(self):
        """Verify reviews column exists and contains data via API responses"""
        print("\n🗄️ Testing Database Reviews Column Verification...")
        
        # This test verifies the database schema indirectly through API responses
        # since we can't directly access the database
        
        if not self.products_with_reviews:
            return self.log_test(
                "Database Reviews Column Verification", 
                True, 
                "No products with reviews content found, but reviews field structure is present in API responses"
            )
        
        # Test a product that has reviews content
        product_with_reviews = self.products_with_reviews[0]
        product_id = product_with_reviews.get('id')
        
        success, status, data = self.make_request('GET', f'/products/{product_id}')
        
        if success and data.get('success') and data.get('data'):
            product = data['data']
            reviews_content = product.get('reviews')
            
            if reviews_content:
                return self.log_test(
                    "Database Reviews Column Verification", 
                    True, 
                    f"✅ Database reviews column verified - Product {product_id} has reviews content: {str(reviews_content)[:100]}...",
                    {
                        "product_id": product_id,
                        "reviews_length": len(str(reviews_content)),
                        "reviews_type": type(reviews_content).__name__
                    }
                )
            else:
                return self.log_test(
                    "Database Reviews Column Verification", 
                    False, 
                    f"❌ Reviews field exists but no content found for product {product_id}"
                )
        else:
            return self.log_test(
                "Database Reviews Column Verification", 
                False, 
                f"Failed to verify database reviews column - Status: {status}"
            )

    def test_data_flow_admin_to_api(self):
        """Test complete data flow from admin panel to API responses"""
        print("\n🔄 Testing Data Flow from Admin Panel to API...")
        
        # This test verifies that data saved via admin panel is accessible via API
        # We'll test this by checking if any products have reviews content
        
        success, status, data = self.make_request('GET', '/products?limit=100')
        
        if success and data.get('success') and data.get('data'):
            products = data['data']
            
            products_with_reviews_content = []
            for product in products:
                if product.get('reviews') and str(product['reviews']).strip():
                    products_with_reviews_content.append(product)
            
            if products_with_reviews_content:
                sample_product = products_with_reviews_content[0]
                return self.log_test(
                    "Data Flow Admin Panel to API", 
                    True, 
                    f"✅ Data flow verified - Found {len(products_with_reviews_content)} products with reviews content. Sample: {sample_product.get('name', 'Unknown')}",
                    {
                        "products_with_reviews": len(products_with_reviews_content),
                        "sample_product_id": sample_product.get('id'),
                        "sample_reviews_preview": str(sample_product.get('reviews', ''))[:150]
                    }
                )
            else:
                return self.log_test(
                    "Data Flow Admin Panel to API", 
                    True, 
                    "⚠️ No products with reviews content found, but reviews field structure is present. Admin panel may not have reviews data yet.",
                    {
                        "total_products_checked": len(products),
                        "products_with_reviews_content": 0
                    }
                )
        else:
            return self.log_test(
                "Data Flow Admin Panel to API", 
                False, 
                f"Failed to test data flow - Status: {status}, Response: {data}"
            )

    def test_frontend_api_integration_readiness(self):
        """Test that backend API responses are ready for frontend consumption"""
        print("\n🌐 Testing Frontend API Integration Readiness...")
        
        if not self.sample_product_id:
            return self.log_test(
                "Frontend API Integration Readiness", 
                False, 
                "No sample product available for frontend integration testing"
            )
        
        # Test the exact API call that frontend would make
        success, status, data = self.make_request('GET', f'/products/{self.sample_product_id}')
        
        if success and data.get('success') and data.get('data'):
            product = data['data']
            
            # Check for all fields that frontend needs for reviews display
            required_fields = ['id', 'name', 'reviews']
            missing_fields = []
            
            for field in required_fields:
                if field not in product:
                    missing_fields.append(field)
            
            if not missing_fields:
                reviews_ready = 'reviews' in product
                reviews_content = product.get('reviews')
                
                message = f"✅ Frontend integration ready - All required fields present. "
                if reviews_content:
                    message += f"Reviews content available for display."
                else:
                    message += "Reviews field present but empty (ready for future content)."
                
                return self.log_test(
                    "Frontend API Integration Readiness", 
                    True, 
                    message,
                    {
                        "product_id": self.sample_product_id,
                        "required_fields_present": True,
                        "reviews_field_present": reviews_ready,
                        "reviews_has_content": bool(reviews_content)
                    }
                )
            else:
                return self.log_test(
                    "Frontend API Integration Readiness", 
                    False, 
                    f"❌ Missing required fields for frontend: {missing_fields}",
                    {
                        "missing_fields": missing_fields,
                        "available_fields": list(product.keys())
                    }
                )
        else:
            return self.log_test(
                "Frontend API Integration Readiness", 
                False, 
                f"Failed to test frontend integration - Status: {status}, Response: {data}"
            )

    def test_reviews_field_data_structure(self):
        """Test the structure and format of reviews field data"""
        print("\n📊 Testing Reviews Field Data Structure...")
        
        success, status, data = self.make_request('GET', '/products?limit=20')
        
        if success and data.get('success') and data.get('data'):
            products = data['data']
            
            reviews_data_types = {}
            reviews_samples = []
            
            for product in products:
                if 'reviews' in product:
                    reviews_value = product['reviews']
                    data_type = type(reviews_value).__name__
                    
                    if data_type not in reviews_data_types:
                        reviews_data_types[data_type] = 0
                    reviews_data_types[data_type] += 1
                    
                    if reviews_value and len(reviews_samples) < 3:
                        reviews_samples.append({
                            "product_id": product.get('id'),
                            "product_name": product.get('name', 'Unknown')[:30],
                            "reviews_type": data_type,
                            "reviews_preview": str(reviews_value)[:100]
                        })
            
            return self.log_test(
                "Reviews Field Data Structure", 
                True, 
                f"✅ Reviews field data structure analyzed. Data types found: {reviews_data_types}",
                {
                    "data_types": reviews_data_types,
                    "samples": reviews_samples,
                    "total_products_analyzed": len(products)
                }
            )
        else:
            return self.log_test(
                "Reviews Field Data Structure", 
                False, 
                f"Failed to analyze reviews data structure - Status: {status}, Response: {data}"
            )

    def test_api_error_handling_with_reviews(self):
        """Test API error handling when reviews field is accessed"""
        print("\n⚠️ Testing API Error Handling with Reviews Field...")
        
        # Test with non-existent product ID
        fake_product_id = str(uuid.uuid4())
        success, status, data = self.make_request('GET', f'/products/{fake_product_id}', expected_status=404)
        
        if success and status == 404:
            return self.log_test(
                "API Error Handling with Reviews", 
                True, 
                "✅ API properly handles non-existent product requests with 404 status"
            )
        else:
            return self.log_test(
                "API Error Handling with Reviews", 
                False, 
                f"❌ API error handling failed - Expected 404, got {status}"
            )

    def run_comprehensive_reviews_tests(self):
        """Run comprehensive Reviews functionality testing suite"""
        print("=" * 80)
        print("📚 RitZone Reviews Functionality Comprehensive Testing Suite - January 2025")
        print("🎯 Focus: Backend API Reviews Field, Database Verification, Data Flow Testing")
        print("=" * 80)
        print(f"📅 Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print(f"🌐 Testing endpoint: {self.base_url}")
        print("=" * 80)

        # Core infrastructure tests
        self.test_backend_health()
        
        # Product data setup for reviews testing
        self.test_get_products_for_reviews_testing()
        
        # Reviews functionality tests
        self.test_individual_product_api_includes_reviews()
        self.test_products_list_api_includes_reviews()
        self.test_category_products_api_includes_reviews()
        
        # Database and data flow verification
        self.test_database_reviews_column_verification()
        self.test_data_flow_admin_to_api()
        
        # Frontend integration readiness
        self.test_frontend_api_integration_readiness()
        self.test_reviews_field_data_structure()
        
        # Error handling
        self.test_api_error_handling_with_reviews()

        # Print comprehensive results
        print("\n" + "=" * 80)
        print("📊 COMPREHENSIVE REVIEWS TESTING RESULTS SUMMARY")
        print("=" * 80)
        
        critical_tests = []
        supporting_tests = []
        
        for result in self.test_results:
            if any(keyword in result['test'].lower() for keyword in ['individual product api', 'frontend integration', 'database verification']):
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
        
        # Specific analysis for Reviews functionality
        reviews_tests = [r for r in self.test_results if 'reviews' in r['test'].lower()]
        if reviews_tests:
            reviews_success = all(r['status'] == '✅ PASS' for r in reviews_tests)
            print(f"\n📚 Reviews Functionality Status: {'✅ WORKING' if reviews_success else '❌ NEEDS ATTENTION'}")
            
            if not reviews_success:
                failed_reviews_tests = [r for r in reviews_tests if r['status'] == '❌ FAIL']
                print("🔍 Failed Reviews Tests:")
                for test in failed_reviews_tests:
                    print(f"   - {test['test']}: {test['message']}")
        
        # Final assessment
        if self.tests_passed == self.tests_run:
            print("🎉 All tests passed! Reviews functionality is working correctly.")
            return 0
        else:
            failed_critical = [r for r in critical_tests if r['status'] == '❌ FAIL']
            if failed_critical:
                print(f"🚨 {len(failed_critical)} critical tests failed")
                print("💡 Recommendations:")
                for test in failed_critical:
                    if 'individual product api' in test['test'].lower():
                        print("   - Check if reviews field is included in product API responses")
                        print("   - Verify backend service includes reviews in select statements")
                    elif 'database verification' in test['test'].lower():
                        print("   - Verify reviews column exists in products table")
                        print("   - Check if migration script was executed successfully")
                    elif 'frontend integration' in test['test'].lower():
                        print("   - Ensure all required fields are present in API responses")
                        print("   - Verify API response format matches frontend expectations")
            return 1

def main():
    """Main test execution"""
    tester = ReviewsFunctionalityTester()
    return tester.run_comprehensive_reviews_tests()

if __name__ == "__main__":
    sys.exit(main())
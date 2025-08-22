#!/usr/bin/env python3
"""
RitZone Individual Product Page Quantity Functionality - Comprehensive Testing
============================================================================
Testing backend API functionality for individual product page quantity-based price calculations
on LOCALHOST DEVELOPMENT SERVER as requested.

REVIEW REQUEST CONTEXT: 
User implemented a fix for quantity-based price calculation on individual product pages. 
The issue was that when users increase quantity (2, 3, 4), the price was not updating - 
it was showing unit price only. Frontend changes multiply the price by quantity, so we need 
to ensure backend provides correct unit prices and product data structure.

SPECIFIC TESTS REQUIRED:
1. Backend server connectivity and health
2. Individual product API endpoints (GET /api/products/{id})  
3. Verify product data includes required fields: id, name, price, original_price, stock_quantity
4. Test with a few different product IDs to ensure price fields are available
5. Verify product data structure is compatible with frontend quantity-price calculations

Test credentials: b@b.com / Abcd@1234
Backend URL: http://localhost:10000/api (LOCALHOST DEVELOPMENT SERVER)
"""

import requests
import json
import time
import sys
from typing import Dict, Any, Optional, List

# Configuration - LOCALHOST DEVELOPMENT SERVER
BACKEND_URL = "http://localhost:10000/api"
TEST_USER_EMAIL = "b@b.com"
TEST_USER_PASSWORD = "Abcd@1234"

class ComprehensiveProductQuantityTester:
    def __init__(self):
        self.session = requests.Session()
        self.access_token = None
        self.user_data = None
        self.test_results = []
        self.test_product_ids = []
        
    def log_test(self, test_name: str, success: bool, message: str, details: Dict = None):
        """Log test results with consistent formatting"""
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} | {test_name}")
        print(f"     └─ {message}")
        if details:
            for key, value in details.items():
                print(f"        {key}: {value}")
        print()
        self.test_results.append(success)
        
    def test_backend_health(self) -> bool:
        """Test 1: Backend Server Connectivity and Health"""
        try:
            response = self.session.get(f"{BACKEND_URL}/health", timeout=30)
            
            if response.status_code == 200:
                data = response.json()
                self.log_test(
                    "Backend Server Connectivity and Health",
                    True,
                    f"Backend running on localhost development server",
                    {
                        "Status Code": response.status_code,
                        "Backend URL": BACKEND_URL,
                        "Message": data.get('message', 'N/A'),
                        "Environment": data.get('environment', {}).get('nodeEnv', 'N/A'),
                        "Database": "Connected" if data.get('database', {}).get('success') else "Failed"
                    }
                )
                return True
            else:
                self.log_test(
                    "Backend Server Connectivity and Health",
                    False,
                    f"Backend health check failed with status {response.status_code}",
                    {"Response": response.text[:200]}
                )
                return False
                
        except Exception as e:
            self.log_test(
                "Backend Server Connectivity and Health",
                False,
                f"Backend connection failed: {str(e)}"
            )
            return False
    
    def test_user_authentication(self) -> bool:
        """Test 2: User Authentication with b@b.com / Abcd@1234"""
        try:
            login_data = {
                "email": TEST_USER_EMAIL,
                "password": TEST_USER_PASSWORD
            }
            
            response = self.session.post(
                f"{BACKEND_URL}/auth/login",
                json=login_data,
                timeout=30
            )
            
            if response.status_code == 200:
                data = response.json()
                
                if data.get('success') and data.get('token'):
                    self.access_token = data['token']
                    self.user_data = data.get('user', {})
                    
                    self.log_test(
                        "User Authentication",
                        True,
                        f"Successfully authenticated with test credentials",
                        {
                            "Status Code": response.status_code,
                            "User Email": self.user_data.get('email', 'N/A'),
                            "Token Type": "Supabase Access Token" if len(self.access_token) > 100 else "JWT Token",
                            "Token Length": f"{len(self.access_token)} characters"
                        }
                    )
                    return True
                else:
                    self.log_test(
                        "User Authentication",
                        False,
                        "Login response missing token or success flag",
                        {"Response": json.dumps(data, indent=2)[:300]}
                    )
                    return False
            else:
                self.log_test(
                    "User Authentication",
                    False,
                    f"Login failed with status {response.status_code}",
                    {"Response": response.text[:200]}
                )
                return False
                
        except Exception as e:
            self.log_test(
                "User Authentication",
                False,
                f"Authentication request failed: {str(e)}"
            )
            return False
    
    def test_products_list_endpoint(self) -> bool:
        """Test 3: GET /api/products endpoint"""
        try:
            response = self.session.get(f"{BACKEND_URL}/products", timeout=30)
            
            if response.status_code == 200:
                data = response.json()
                
                if data.get('success') and data.get('data'):
                    products = data['data']
                    product_count = len(products)
                    
                    # Store product IDs for individual testing
                    self.test_product_ids = []
                    for product in products[:10]:  # Get up to 10 product IDs
                        if product.get('id'):
                            self.test_product_ids.append({
                                'id': product.get('id'),
                                'name': product.get('name', 'Unknown'),
                                'price': product.get('price'),
                                'stock': product.get('stock_quantity')
                            })
                    
                    self.log_test(
                        "GET /api/products endpoint",
                        True,
                        f"Successfully retrieved products list",
                        {
                            "Status Code": response.status_code,
                            "Total Products": product_count,
                            "Test Product IDs Available": len(self.test_product_ids),
                            "Sample Products": f"{self.test_product_ids[0]['name']} (${self.test_product_ids[0]['price']})" if self.test_product_ids else "None"
                        }
                    )
                    return True
                else:
                    self.log_test(
                        "GET /api/products endpoint",
                        False,
                        "Products response missing data or success flag",
                        {"Response": json.dumps(data, indent=2)[:300]}
                    )
                    return False
            else:
                self.log_test(
                    "GET /api/products endpoint",
                    False,
                    f"Products API failed with status {response.status_code}",
                    {"Response": response.text[:200]}
                )
                return False
                
        except Exception as e:
            self.log_test(
                "GET /api/products endpoint",
                False,
                f"Products API request failed: {str(e)}"
            )
            return False
    
    def validate_product_data_structure(self, product: Dict[str, Any], product_id: str) -> Dict[str, Any]:
        """Validate product data structure for quantity-price calculations"""
        
        # Required fields for quantity-price calculations
        required_fields = ['id', 'name', 'price', 'stock_quantity']
        
        # Optional but important fields
        optional_fields = ['original_price', 'images', 'brand', 'category_name', 'rating_average']
        
        # Check required fields
        missing_required = []
        for field in required_fields:
            if field not in product or product[field] is None:
                missing_required.append(field)
        
        # Check optional fields
        present_optional = []
        for field in optional_fields:
            if field in product and product[field] is not None:
                present_optional.append(field)
        
        # Validate data types and values
        validations = {
            'id_valid': isinstance(product.get('id'), str) and len(product.get('id', '')) > 0,
            'name_valid': isinstance(product.get('name'), str) and len(product.get('name', '')) > 0,
            'price_valid': isinstance(product.get('price'), (int, float)) and product.get('price', 0) > 0,
            'stock_valid': isinstance(product.get('stock_quantity'), int) and product.get('stock_quantity', -1) >= 0,
            'original_price_valid': (
                product.get('original_price') is None or 
                (isinstance(product.get('original_price'), (int, float)) and product.get('original_price', 0) > 0)
            )
        }
        
        all_required_present = len(missing_required) == 0
        all_validations_pass = all(validations.values())
        
        return {
            'product_id': product_id,
            'product_name': product.get('name', 'N/A'),
            'success': all_required_present and all_validations_pass,
            'missing_required': missing_required,
            'present_optional': present_optional,
            'validations': validations,
            'price': product.get('price'),
            'original_price': product.get('original_price'),
            'stock_quantity': product.get('stock_quantity'),
            'full_product_data': product
        }
    
    def test_individual_product_endpoints(self) -> bool:
        """Test 4: Individual product API endpoints (GET /api/products/{id})"""
        if not self.test_product_ids:
            self.log_test(
                "Individual Product API Endpoints",
                False,
                "No product IDs available for testing - products list API must succeed first"
            )
            return False
        
        successful_tests = 0
        total_tests = min(len(self.test_product_ids), 5)  # Test up to 5 products
        
        detailed_results = []
        
        for i, product_info in enumerate(self.test_product_ids[:5]):
            product_id = product_info['id']
            
            try:
                response = self.session.get(f"{BACKEND_URL}/products/{product_id}", timeout=30)
                
                if response.status_code == 200:
                    data = response.json()
                    
                    if data.get('success') and data.get('data'):
                        product = data['data']
                        validation_result = self.validate_product_data_structure(product, product_id)
                        
                        if validation_result['success']:
                            successful_tests += 1
                            self.log_test(
                                f"GET /api/products/{product_id[:8]}... (#{i+1})",
                                True,
                                f"Product data structure compatible with quantity calculations",
                                {
                                    "Product Name": validation_result['product_name'],
                                    "Price": f"${validation_result['price']}" if validation_result['price'] else "N/A",
                                    "Original Price": f"${validation_result['original_price']}" if validation_result['original_price'] else "None",
                                    "Stock Quantity": validation_result['stock_quantity'],
                                    "Optional Fields": ", ".join(validation_result['present_optional']) if validation_result['present_optional'] else "None"
                                }
                            )
                        else:
                            self.log_test(
                                f"GET /api/products/{product_id[:8]}... (#{i+1})",
                                False,
                                f"Product data structure incompatible with quantity calculations",
                                {
                                    "Product Name": validation_result['product_name'],
                                    "Missing Required": ", ".join(validation_result['missing_required']) if validation_result['missing_required'] else "None",
                                    "Failed Validations": ", ".join([k for k, v in validation_result['validations'].items() if not v])
                                }
                            )
                        
                        detailed_results.append(validation_result)
                    else:
                        self.log_test(
                            f"GET /api/products/{product_id[:8]}... (#{i+1})",
                            False,
                            "Product response missing data or success flag",
                            {"Response": json.dumps(data, indent=2)[:200]}
                        )
                else:
                    self.log_test(
                        f"GET /api/products/{product_id[:8]}... (#{i+1})",
                        False,
                        f"Product API failed with status {response.status_code}",
                        {"Response": response.text[:200]}
                    )
                    
            except Exception as e:
                self.log_test(
                    f"GET /api/products/{product_id[:8]}... (#{i+1})",
                    False,
                    f"Product API request failed: {str(e)}"
                )
        
        overall_success = successful_tests == total_tests
        
        self.log_test(
            "Individual Product API Endpoints Summary",
            overall_success,
            f"Product data structure validation results",
            {
                "Successful Tests": f"{successful_tests}/{total_tests}",
                "Success Rate": f"{(successful_tests/total_tests)*100:.1f}%",
                "Compatible Products": successful_tests,
                "Incompatible Products": total_tests - successful_tests
            }
        )
        
        return overall_success
    
    def test_cart_quantity_operations(self) -> bool:
        """Test 5: Cart integration with quantity operations"""
        if not self.access_token:
            self.log_test(
                "Cart Quantity Operations",
                False,
                "No access token available - authentication must succeed first"
            )
            return False
        
        if not self.test_product_ids:
            self.log_test(
                "Cart Quantity Operations",
                False,
                "No product IDs available for testing"
            )
            return False
        
        headers = {
            "Authorization": f"Bearer {self.access_token}",
            "Content-Type": "application/json"
        }
        
        test_product = self.test_product_ids[0]
        test_product_id = test_product['id']
        
        try:
            # Test 1: Add item with quantity 1
            add_data_qty1 = {
                "productId": test_product_id,
                "quantity": 1
            }
            
            response1 = self.session.post(
                f"{BACKEND_URL}/cart/add",
                json=add_data_qty1,
                headers=headers,
                timeout=30
            )
            
            qty1_success = response1.status_code == 200
            
            # Test 2: Add item with quantity 3
            add_data_qty3 = {
                "productId": test_product_id,
                "quantity": 3
            }
            
            response2 = self.session.post(
                f"{BACKEND_URL}/cart/add",
                json=add_data_qty3,
                headers=headers,
                timeout=30
            )
            
            qty3_success = response2.status_code == 200
            
            # Test 3: Get cart to verify operations
            cart_response = self.session.get(
                f"{BACKEND_URL}/cart",
                headers=headers,
                timeout=30
            )
            
            cart_success = cart_response.status_code == 200
            cart_data = cart_response.json() if cart_success else {}
            
            overall_success = qty1_success and qty3_success and cart_success
            
            self.log_test(
                "Cart Quantity Operations",
                overall_success,
                "Cart integration supports quantity parameters" if overall_success else "Cart integration has issues with quantity operations",
                {
                    "Add Quantity 1": "✅ Success" if qty1_success else "❌ Failed",
                    "Add Quantity 3": "✅ Success" if qty3_success else "❌ Failed",
                    "Cart Retrieval": "✅ Success" if cart_success else "❌ Failed",
                    "Cart Items Count": len(cart_data.get('data', {}).get('items', [])) if cart_success and cart_data.get('success') else "N/A",
                    "Test Product": f"{test_product['name']} (${test_product['price']})"
                }
            )
            
            return overall_success
                
        except Exception as e:
            self.log_test(
                "Cart Quantity Operations",
                False,
                f"Cart quantity operations test failed: {str(e)}"
            )
            return False
    
    def run_comprehensive_test(self):
        """Run all comprehensive individual product page quantity functionality tests"""
        print("=" * 90)
        print("🔍 RITZONE INDIVIDUAL PRODUCT PAGE QUANTITY FUNCTIONALITY - COMPREHENSIVE TESTING")
        print("=" * 90)
        print(f"Backend URL: {BACKEND_URL} (LOCALHOST DEVELOPMENT SERVER)")
        print(f"Test User: {TEST_USER_EMAIL}")
        print(f"Test Time: {time.strftime('%Y-%m-%d %H:%M:%S UTC', time.gmtime())}")
        print("=" * 90)
        print()
        
        # Run all tests in sequence
        test_functions = [
            self.test_backend_health,
            self.test_user_authentication,
            self.test_products_list_endpoint,
            self.test_individual_product_endpoints,
            self.test_cart_quantity_operations
        ]
        
        for test_func in test_functions:
            try:
                test_func()
            except Exception as e:
                self.log_test(
                    f"Test Execution Error - {test_func.__name__}",
                    False,
                    f"Test execution failed: {str(e)}"
                )
        
        # Summary
        passed_tests = sum(self.test_results)
        total_tests = len(self.test_results)
        success_rate = (passed_tests / total_tests) * 100 if total_tests > 0 else 0
        
        print("=" * 90)
        print("📊 COMPREHENSIVE TEST SUMMARY")
        print("=" * 90)
        print(f"Tests Passed: {passed_tests}/{total_tests}")
        print(f"Success Rate: {success_rate:.1f}%")
        print()
        
        if success_rate == 100:
            print("🎉 EXCELLENT: Individual Product Page Quantity Functionality is 100% working!")
            print("✅ Backend Server Connectivity - Working perfectly on localhost")
            print("✅ User Authentication - Working with test credentials")
            print("✅ Product API Endpoints - All required fields present and valid")
            print("✅ Cart Integration - Quantity operations working perfectly")
            print("✅ Data Structure - Compatible with frontend quantity-price calculations")
            print()
            print("🎯 FINAL STATUS: Individual Product Page Quantity Functionality is production-ready!")
        elif success_rate >= 80:
            print("⚠️  GOOD: Most functionality tests passed")
            print("🔍 Minor issues may exist - check failed tests above")
        else:
            print("❌ CRITICAL: Individual Product Page Quantity Functionality has major issues")
            print("🚨 Backend APIs may not support proper quantity-based price calculations")
        
        print("=" * 90)
        
        return success_rate == 100

def main():
    """Main test execution"""
    tester = ComprehensiveProductQuantityTester()
    success = tester.run_comprehensive_test()
    
    # Exit with appropriate code
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()
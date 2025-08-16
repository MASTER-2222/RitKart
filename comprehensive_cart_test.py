#!/usr/bin/env python3
"""
RitZone Cart Functionality Backend Testing Suite - December 2025
================================================================
Comprehensive testing for cart functionality focusing on the specific issue:
- Registered users getting "❌ Failed to add product to cart. Please try again"
- Testing both production and local backend URLs
- Focus on authentication flow with Supabase tokens
- Cart API data structure validation
- Product information retrieval in cart data

Based on review request: Test cart functionality for registered users
"""

import requests
import json
import sys
import uuid
import time
from datetime import datetime

class CartFunctionalityTester:
    def __init__(self):
        # Test both local and production backends
        self.local_url = "http://localhost:8001/api"
        self.production_url = "https://ritkart-backend.onrender.com/api"
        self.base_url = self.local_url  # Start with local
        
        # Authentication tokens
        self.jwt_token = None
        self.supabase_token = None
        self.user_id = None
        self.test_user_email = None
        
        # Test tracking
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []
        
        # Test data
        self.products_for_testing = []
        self.cart_items = []
        
        # Supabase configuration
        self.supabase_url = "https://igzpodmmymbptmwebonh.supabase.co"
        self.supabase_anon_key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlnenBvZG1teW1icHRtd2Vib25oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1NDczNDIsImV4cCI6MjA3MDEyMzM0Mn0.eOy5F_0pE7ki3TXl49bW5c0K1TWGKf2_Vpn1IRKWQRc"

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
        elif self.jwt_token:
            headers['Authorization'] = f'Bearer {self.jwt_token}'

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

    def test_backend_connectivity(self):
        """Test connectivity to both local and production backends"""
        print("\n🌐 Testing Backend Connectivity...")
        
        # Test local backend
        local_success, local_status, local_data = self.make_request('GET', '/health')
        
        if local_success and local_data.get('success'):
            self.base_url = self.local_url
            return self.log_test(
                "Backend Connectivity", 
                True, 
                f"Local backend accessible at {self.local_url}"
            )
        
        # Fallback to production backend
        print("Local backend not accessible, trying production...")
        self.base_url = self.production_url
        prod_success, prod_status, prod_data = self.make_request('GET', '/health')
        
        if prod_success and prod_data.get('success'):
            return self.log_test(
                "Backend Connectivity", 
                True, 
                f"Production backend accessible at {self.production_url}"
            )
        else:
            return self.log_test(
                "Backend Connectivity", 
                False, 
                f"Neither local ({local_status}) nor production ({prod_status}) backends accessible"
            )

    def test_user_registration_and_authentication(self):
        """Test user registration and get both JWT and Supabase tokens"""
        print("\n👤 Testing User Registration and Authentication...")
        
        # Generate unique test user
        timestamp = datetime.now().strftime('%H%M%S%f')[:-3]
        self.test_user_email = f"carttest.{timestamp}@example.com"
        
        user_data = {
            "email": self.test_user_email,
            "password": "CartTest123!",
            "fullName": f"Cart Test User {timestamp}",
            "phone": "+1234567890"
        }
        
        # Register user
        success, status, data = self.make_request('POST', '/auth/register', user_data, 201)
        
        if success and data.get('success'):
            if 'user' in data:
                self.user_id = data['user'].get('id')
            self.log_test("User Registration", True, f"User registered - Email: {self.test_user_email}")
        else:
            self.log_test("User Registration", False, f"Registration failed - Status: {status}, Response: {data}")
            return False
        
        # Login to get JWT token
        login_data = {
            "email": self.test_user_email,
            "password": "CartTest123!"
        }
        
        success, status, data = self.make_request('POST', '/auth/login', login_data)
        
        if success and data.get('success'):
            if 'token' in data:
                self.jwt_token = data['token']
            if 'user' in data:
                self.user_id = data['user'].get('id')
            self.log_test("JWT Authentication", True, f"JWT token acquired - User ID: {self.user_id}")
        else:
            self.log_test("JWT Authentication", False, f"Login failed - Status: {status}, Response: {data}")
            return False
        
        # Get Supabase token
        return self.get_supabase_token()

    def get_supabase_token(self):
        """Get Supabase authentication token"""
        print("\n🔑 Getting Supabase Authentication Token...")
        
        try:
            auth_url = f"{self.supabase_url}/auth/v1/token?grant_type=password"
            auth_data = {
                "email": self.test_user_email,
                "password": "CartTest123!"
            }
            
            headers = {
                'apikey': self.supabase_anon_key,
                'Content-Type': 'application/json'
            }
            
            response = requests.post(auth_url, json=auth_data, headers=headers, timeout=10)
            
            if response.status_code == 200:
                auth_response = response.json()
                if 'access_token' in auth_response:
                    self.supabase_token = auth_response['access_token']
                    return self.log_test("Supabase Authentication", True, "Supabase token acquired successfully")
            
            return self.log_test("Supabase Authentication", False, f"Supabase auth failed - Status: {response.status_code}")
            
        except Exception as e:
            return self.log_test("Supabase Authentication", False, f"Supabase auth error: {str(e)}")

    def test_get_products_for_cart_testing(self):
        """Get real products from database for cart testing"""
        print("\n🛍️ Getting Products for Cart Testing...")
        
        # Test multiple categories to get diverse products
        categories = ['electronics', 'fashion', 'books', 'home', 'sports']
        
        for category in categories:
            success, status, data = self.make_request('GET', f'/products/category/{category}?limit=2')
            
            if success and data.get('success') and data.get('data'):
                products = data['data']
                self.products_for_testing.extend(products[:1])  # Take 1 product from each category
                
        if self.products_for_testing:
            product_names = [p.get('name', 'Unknown')[:30] for p in self.products_for_testing[:3]]
            return self.log_test(
                "Product Retrieval", 
                True, 
                f"Retrieved {len(self.products_for_testing)} products: {', '.join(product_names)}"
            )
        else:
            return self.log_test("Product Retrieval", False, "No products available for cart testing")

    def test_get_empty_cart(self):
        """Test GET /api/cart endpoint - should return empty cart initially"""
        print("\n🛒 Testing GET /api/cart (Empty Cart)...")
        
        if not self.jwt_token:
            return self.log_test("Get Empty Cart", False, "No JWT token available")
        
        success, status, data = self.make_request('GET', '/cart')
        
        if success and data.get('success'):
            cart_data = data.get('data', {})
            cart_items = cart_data.get('cart_items', [])
            total_amount = cart_data.get('total_amount', 0)
            
            return self.log_test(
                "Get Empty Cart", 
                True, 
                f"Cart retrieved - Items: {len(cart_items)}, Total: ${total_amount}, Structure: {list(cart_data.keys())}"
            )
        else:
            return self.log_test(
                "Get Empty Cart", 
                False, 
                f"Failed to get cart - Status: {status}, Response: {data}"
            )

    def test_add_to_cart_with_jwt_token(self):
        """Test POST /api/cart/add with JWT token"""
        print("\n➕ Testing Add to Cart with JWT Token...")
        
        if not self.jwt_token or not self.products_for_testing:
            return self.log_test("Add to Cart (JWT)", False, "Missing JWT token or products")
        
        product = self.products_for_testing[0]
        product_id = product.get('id')
        product_name = product.get('name', 'Unknown Product')
        product_price = product.get('price', 0)
        
        cart_item_data = {
            "productId": product_id,
            "quantity": 2
        }
        
        success, status, data = self.make_request('POST', '/cart/add', cart_item_data, 200)
        
        if success and data.get('success'):
            cart_item = data.get('data', {})
            return self.log_test(
                "Add to Cart (JWT)", 
                True, 
                f"Successfully added '{product_name}' (${product_price}) - Quantity: 2"
            )
        else:
            return self.log_test(
                "Add to Cart (JWT)", 
                False, 
                f"Failed to add to cart - Status: {status}, Error: {data.get('message', 'Unknown error')}"
            )

    def test_add_to_cart_with_supabase_token(self):
        """Test POST /api/cart/add with Supabase token"""
        print("\n🔑 Testing Add to Cart with Supabase Token...")
        
        if not self.supabase_token or not self.products_for_testing:
            return self.log_test("Add to Cart (Supabase)", False, "Missing Supabase token or products")
        
        product = self.products_for_testing[0] if len(self.products_for_testing) > 0 else None
        if not product:
            return self.log_test("Add to Cart (Supabase)", False, "No products available")
            
        product_id = product.get('id')
        product_name = product.get('name', 'Unknown Product')
        
        cart_item_data = {
            "productId": product_id,
            "quantity": 1
        }
        
        success, status, data = self.make_request('POST', '/cart/add', cart_item_data, 200, use_supabase_token=True)
        
        if success and data.get('success'):
            return self.log_test(
                "Add to Cart (Supabase)", 
                True, 
                f"Successfully added '{product_name}' with Supabase token"
            )
        else:
            return self.log_test(
                "Add to Cart (Supabase)", 
                False, 
                f"Failed with Supabase token - Status: {status}, Error: {data.get('message', 'Unknown error')}"
            )

    def test_get_cart_with_items(self):
        """Test GET /api/cart after adding items - verify data structure"""
        print("\n📦 Testing GET /api/cart with Items...")
        
        if not self.jwt_token:
            return self.log_test("Get Cart with Items", False, "No JWT token available")
        
        success, status, data = self.make_request('GET', '/cart')
        
        if success and data.get('success'):
            cart_data = data.get('data', {})
            cart_items = cart_data.get('cart_items', [])
            total_amount = cart_data.get('total_amount', 0)
            
            # Validate cart data structure
            expected_fields = ['cart_items', 'total_amount', 'currency']
            missing_fields = [field for field in expected_fields if field not in cart_data]
            
            if missing_fields:
                return self.log_test(
                    "Get Cart with Items", 
                    False, 
                    f"Missing fields in cart data: {missing_fields}"
                )
            
            # Validate cart_items structure
            if cart_items:
                item = cart_items[0]
                item_fields = ['id', 'quantity', 'unit_price', 'total_price']
                product_info = item.get('products', {})
                
                if product_info:
                    product_fields = ['id', 'name', 'price', 'images']
                    missing_product_fields = [field for field in product_fields if field not in product_info]
                    
                    if missing_product_fields:
                        self.log_test(
                            "Cart Item Product Info", 
                            False, 
                            f"Missing product fields: {missing_product_fields}"
                        )
                    else:
                        self.log_test(
                            "Cart Item Product Info", 
                            True, 
                            f"Product info complete: {product_info.get('name', 'Unknown')}"
                        )
                
                return self.log_test(
                    "Get Cart with Items", 
                    True, 
                    f"Cart has {len(cart_items)} items, Total: ${total_amount}"
                )
            else:
                return self.log_test(
                    "Get Cart with Items", 
                    False, 
                    "Cart is empty after adding items"
                )
        else:
            return self.log_test(
                "Get Cart with Items", 
                False, 
                f"Failed to get cart - Status: {status}, Response: {data}"
            )

    def test_cart_input_validation(self):
        """Test cart input validation"""
        print("\n✅ Testing Cart Input Validation...")
        
        if not self.jwt_token:
            return self.log_test("Cart Input Validation", False, "No JWT token available")
        
        validation_tests = [
            # Missing productId
            ({}, "Missing productId should be rejected"),
            # Invalid quantity
            ({"productId": "test-id", "quantity": 0}, "Zero quantity should be rejected"),
            ({"productId": "test-id", "quantity": -1}, "Negative quantity should be rejected"),
            # Non-existent product
            ({"productId": str(uuid.uuid4()), "quantity": 1}, "Non-existent product should be handled")
        ]
        
        validation_passed = 0
        for test_data, description in validation_tests:
            success, status, data = self.make_request('POST', '/cart/add', test_data, expected_status=400)
            
            if success and status == 400:
                self.log_test(f"Validation: {description}", True, "Properly rejected invalid input")
                validation_passed += 1
            else:
                self.log_test(f"Validation: {description}", False, f"Validation failed - Status: {status}")
        
        return validation_passed == len(validation_tests)

    def test_cart_authentication_requirements(self):
        """Test that cart endpoints require authentication"""
        print("\n🔒 Testing Cart Authentication Requirements...")
        
        # Test without any token
        endpoints = [
            ('/cart', 'GET'),
            ('/cart/add', 'POST'),
        ]
        
        auth_tests_passed = 0
        for endpoint, method in endpoints:
            # Temporarily remove tokens
            temp_jwt = self.jwt_token
            temp_supabase = self.supabase_token
            self.jwt_token = None
            self.supabase_token = None
            
            success, status, data = self.make_request(method, endpoint, expected_status=401)
            
            # Restore tokens
            self.jwt_token = temp_jwt
            self.supabase_token = temp_supabase
            
            if success and status == 401:
                self.log_test(f"Auth Required {method} {endpoint}", True, "Properly requires authentication")
                auth_tests_passed += 1
            else:
                self.log_test(f"Auth Required {method} {endpoint}", False, f"Auth not enforced - Status: {status}")
        
        return auth_tests_passed == len(endpoints)

    def run_comprehensive_cart_tests(self):
        """Run comprehensive cart functionality tests"""
        print("=" * 80)
        print("🛒 RitZone Cart Functionality Testing Suite - December 2025")
        print("📋 Focus: Cart API, Authentication, Data Structure Validation")
        print("=" * 80)
        print(f"📅 Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print("=" * 80)

        # Infrastructure tests
        self.test_backend_connectivity()
        
        # Authentication setup
        self.test_user_registration_and_authentication()
        
        # Product data setup
        self.test_get_products_for_cart_testing()
        
        # Cart functionality tests
        self.test_cart_authentication_requirements()
        self.test_get_empty_cart()
        self.test_add_to_cart_with_jwt_token()
        self.test_add_to_cart_with_supabase_token()
        self.test_get_cart_with_items()
        self.test_cart_input_validation()

        # Print comprehensive results
        print("\n" + "=" * 80)
        print("📊 CART FUNCTIONALITY TEST RESULTS")
        print("=" * 80)
        
        # Categorize tests
        critical_tests = []
        supporting_tests = []
        
        for result in self.test_results:
            if any(keyword in result['test'].lower() for keyword in ['add to cart', 'get cart', 'authentication']):
                critical_tests.append(result)
            else:
                supporting_tests.append(result)
        
        print("\n🚨 CRITICAL CART TESTS:")
        for result in critical_tests:
            print(f"{result['status']} {result['test']}: {result['message']}")
        
        print("\n📋 SUPPORTING TESTS:")
        for result in supporting_tests:
            print(f"{result['status']} {result['test']}: {result['message']}")
        
        print(f"\n📈 Overall Results: {self.tests_passed}/{self.tests_run} tests passed")
        
        # Cart-specific analysis
        cart_tests = [r for r in self.test_results if 'cart' in r['test'].lower()]
        cart_success = all(r['status'] == '✅ PASS' for r in cart_tests)
        
        print(f"\n🛒 Cart Functionality Status: {'✅ WORKING' if cart_success else '❌ FAILING'}")
        
        if not cart_success:
            failed_tests = [r for r in cart_tests if r['status'] == '❌ FAIL']
            print("\n🔍 Failed Cart Tests:")
            for test in failed_tests:
                print(f"   - {test['test']}: {test['message']}")
        
        # Recommendations
        print("\n💡 RECOMMENDATIONS:")
        if not cart_success:
            print("   - Check Supabase authentication token handling in backend")
            print("   - Verify user synchronization between auth.users and public.users tables")
            print("   - Check RLS policies for carts and cart_items tables")
            print("   - Verify cart service ensureUserExists() function")
        else:
            print("   - Cart functionality is working correctly!")
            print("   - Frontend issue may be in API client or authentication flow")
        
        return 0 if cart_success else 1

def main():
    """Main test execution"""
    tester = CartFunctionalityTester()
    return tester.run_comprehensive_cart_tests()

if __name__ == "__main__":
    sys.exit(main())
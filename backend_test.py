#!/usr/bin/env python3
"""
RitZone Add to Cart Backend Testing Suite - January 2025
=========================================================
Comprehensive testing for Add to Cart functionality with focus on:
- Backend cart API endpoints (POST /api/cart/add, GET /api/cart, PUT /api/cart/items/:itemId, DELETE /api/cart/items/:itemId)
- Supabase authentication integration
- Real product data testing
- Error scenarios and edge cases
- JavaScript error investigation ("this.updateCartTotal is not a function")
"""

import requests
import json
import sys
import uuid
import time
from datetime import datetime

class AddToCartTester:
    def __init__(self, base_url="http://localhost:8001/api"):
        self.base_url = base_url
        self.token = None
        self.supabase_token = None
        self.user_id = None
        self.test_user_email = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []
        self.products_for_testing = []
        self.cart_id = None

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

    def test_user_registration_and_login(self):
        """Test complete user registration and login flow"""
        print("\n👤 Testing User Registration and Login Flow...")
        
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
        
        # Login user
        login_data = {
            "email": self.test_user_email,
            "password": "CartTest123!"
        }
        
        success, status, data = self.make_request('POST', '/auth/login', login_data)
        
        if success and data.get('success'):
            if 'token' in data:
                self.token = data['token']
            if 'user' in data:
                self.user_id = data['user'].get('id')
            return self.log_test("User Login", True, f"Login successful - Token acquired, User ID: {self.user_id}")
        else:
            return self.log_test("User Login", False, f"Login failed - Status: {status}, Response: {data}")

    def test_supabase_authentication(self):
        """Test Supabase direct authentication for cart operations"""
        print("\n🔑 Testing Supabase Authentication...")
        
        try:
            supabase_url = "https://igzpodmmymbptmwebonh.supabase.co"
            supabase_anon_key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlnenBvZG1teW1icHRtd2Vib25oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1NDczNDIsImV4cCI6MjA3MDEyMzM0Mn0.eOy5F_0pE7ki3TXl49bW5c0K1TWGKf2_Vpn1IRKWQRc"
            
            auth_url = f"{supabase_url}/auth/v1/token?grant_type=password"
            auth_data = {
                "email": self.test_user_email,
                "password": "CartTest123!"
            }
            
            headers = {
                'apikey': supabase_anon_key,
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

    def test_get_products_for_cart(self):
        """Get real products from database for cart testing"""
        print("\n🛍️ Testing Product Retrieval for Cart Testing...")
        
        # Test multiple categories to get diverse products
        categories = ['electronics', 'fashion', 'books', 'home', 'sports']
        
        for category in categories:
            success, status, data = self.make_request('GET', f'/products/category/{category}?limit=3')
            
            if success and data.get('success') and data.get('data'):
                products = data['data']
                self.products_for_testing.extend(products[:2])  # Take first 2 products from each category
                
        if self.products_for_testing:
            product_names = [p.get('name', 'Unknown')[:30] for p in self.products_for_testing[:5]]
            return self.log_test(
                "Product Retrieval", 
                True, 
                f"Retrieved {len(self.products_for_testing)} products for testing: {', '.join(product_names)}"
            )
        else:
            return self.log_test("Product Retrieval", False, "No products available for cart testing")

    def test_cart_endpoints_authentication(self):
        """Test cart endpoints require proper authentication"""
        print("\n🔒 Testing Cart Authentication Requirements...")
        
        endpoints = [
            ('/cart', 'GET'),
            ('/cart/add', 'POST'),
        ]
        
        all_protected = True
        for endpoint, method in endpoints:
            # Test without authentication
            success, status, data = self.make_request(method, endpoint, expected_status=401)
            if success and status == 401:
                self.log_test(f"Cart Auth {method} {endpoint}", True, "Properly requires authentication")
            else:
                self.log_test(f"Cart Auth {method} {endpoint}", False, f"Authentication not enforced - Status: {status}")
                all_protected = False
        
        return all_protected

    def test_get_empty_cart(self):
        """Test getting user's cart (should be empty initially)"""
        if not self.token:
            return self.log_test("Get Empty Cart", False, "No authentication token available")
        
        print("\n🛒 Testing Get Empty Cart...")
        success, status, data = self.make_request('GET', '/cart')
        
        if success and data.get('success'):
            cart_data = data.get('data', {})
            items = cart_data.get('items', [])
            total = cart_data.get('total', 0)
            if 'id' in cart_data:
                self.cart_id = cart_data['id']
            return self.log_test(
                "Get Empty Cart", 
                True, 
                f"Cart retrieved successfully - Items: {len(items)}, Total: ${total}"
            )
        else:
            return self.log_test(
                "Get Empty Cart", 
                False, 
                f"Failed to get cart - Status: {status}, Response: {data}"
            )

    def test_add_to_cart_functionality(self):
        """Test the core Add to Cart functionality with real products"""
        if not self.token:
            return self.log_test("Add to Cart", False, "No authentication token available")
        
        if not self.products_for_testing:
            return self.log_test("Add to Cart", False, "No products available for testing")
        
        print("\n➕ Testing Add to Cart Functionality...")
        
        # Test with first available product
        product = self.products_for_testing[0]
        product_id = product.get('id')
        product_name = product.get('name', 'Unknown Product')
        product_price = product.get('price', 0)
        
        if not product_id:
            return self.log_test("Add to Cart", False, "Product ID not found")
        
        # Test add to cart
        cart_item_data = {
            "productId": product_id,
            "quantity": 2
        }
        
        success, status, data = self.make_request('POST', '/cart/add', cart_item_data, 200)
        
        if success and data.get('success'):
            cart_item = data.get('data', {})
            return self.log_test(
                "Add to Cart", 
                True, 
                f"Successfully added '{product_name}' (${product_price}) to cart - Quantity: 2, Item ID: {cart_item.get('id')}"
            )
        else:
            # Test with Supabase token if JWT failed
            if self.supabase_token:
                success, status, data = self.make_request('POST', '/cart/add', cart_item_data, 200, use_supabase_token=True)
                
                if success and data.get('success'):
                    cart_item = data.get('data', {})
                    return self.log_test(
                        "Add to Cart (Supabase Token)", 
                        True, 
                        f"Successfully added '{product_name}' to cart with Supabase token"
                    )
            
            return self.log_test(
                "Add to Cart", 
                False, 
                f"Failed to add to cart - Status: {status}, Response: {data}"
            )

    def test_add_multiple_products_to_cart(self):
        """Test adding multiple different products to cart"""
        if not self.token or len(self.products_for_testing) < 2:
            return self.log_test("Add Multiple Products", False, "Insufficient setup for multiple product test")
        
        print("\n🛒 Testing Add Multiple Products to Cart...")
        
        # Add second product
        product = self.products_for_testing[1]
        product_id = product.get('id')
        product_name = product.get('name', 'Unknown Product')
        
        cart_item_data = {
            "productId": product_id,
            "quantity": 1
        }
        
        success, status, data = self.make_request('POST', '/cart/add', cart_item_data, 200)
        
        if success and data.get('success'):
            return self.log_test(
                "Add Multiple Products", 
                True, 
                f"Successfully added second product '{product_name}' to cart"
            )
        else:
            return self.log_test(
                "Add Multiple Products", 
                False, 
                f"Failed to add second product - Status: {status}, Response: {data}"
            )

    def test_get_cart_with_items(self):
        """Test getting cart after adding items"""
        if not self.token:
            return self.log_test("Get Cart with Items", False, "No authentication token available")
        
        print("\n📦 Testing Get Cart with Items...")
        success, status, data = self.make_request('GET', '/cart')
        
        if success and data.get('success'):
            cart_data = data.get('data', {})
            items = cart_data.get('items', [])
            total = cart_data.get('total', 0)
            
            if len(items) > 0:
                item_details = []
                for item in items[:3]:  # Show first 3 items
                    product_info = item.get('products', {})
                    item_details.append(f"{product_info.get('name', 'Unknown')} (Qty: {item.get('quantity', 0)})")
                
                return self.log_test(
                    "Get Cart with Items", 
                    True, 
                    f"Cart has {len(items)} items, Total: ${total} - Items: {', '.join(item_details)}"
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
        """Test cart input validation and error handling"""
        if not self.token:
            return self.log_test("Cart Input Validation", False, "No authentication token available")
        
        print("\n✅ Testing Cart Input Validation...")
        
        validation_tests = [
            # Missing productId
            ({}, "Missing productId should be rejected"),
            # Invalid quantity
            ({"productId": "test-id", "quantity": 0}, "Zero quantity should be rejected"),
            ({"productId": "test-id", "quantity": -1}, "Negative quantity should be rejected"),
            # Non-existent product
            ({"productId": str(uuid.uuid4()), "quantity": 1}, "Non-existent product should be handled gracefully")
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

    def test_cart_item_update(self):
        """Test updating cart item quantity"""
        if not self.token:
            return self.log_test("Update Cart Item", False, "No authentication token available")
        
        print("\n🔄 Testing Update Cart Item...")
        
        # First get cart to find an item to update
        success, status, data = self.make_request('GET', '/cart')
        
        if not (success and data.get('success')):
            return self.log_test("Update Cart Item", False, "Could not retrieve cart for update test")
        
        cart_data = data.get('data', {})
        items = cart_data.get('items', [])
        
        if not items:
            return self.log_test("Update Cart Item", False, "No items in cart to update")
        
        # Update first item quantity
        item_id = items[0].get('id')
        update_data = {"quantity": 3}
        
        success, status, data = self.make_request('PUT', f'/cart/items/{item_id}', update_data, 200)
        
        if success and data.get('success'):
            return self.log_test(
                "Update Cart Item", 
                True, 
                f"Successfully updated item quantity to 3"
            )
        else:
            return self.log_test(
                "Update Cart Item", 
                False, 
                f"Failed to update cart item - Status: {status}, Response: {data}"
            )

    def test_cart_item_removal(self):
        """Test removing item from cart"""
        if not self.token:
            return self.log_test("Remove Cart Item", False, "No authentication token available")
        
        print("\n❌ Testing Remove Cart Item...")
        
        # First get cart to find an item to remove
        success, status, data = self.make_request('GET', '/cart')
        
        if not (success and data.get('success')):
            return self.log_test("Remove Cart Item", False, "Could not retrieve cart for removal test")
        
        cart_data = data.get('data', {})
        items = cart_data.get('items', [])
        
        if not items:
            return self.log_test("Remove Cart Item", False, "No items in cart to remove")
        
        # Remove last item
        item_id = items[-1].get('id')
        
        success, status, data = self.make_request('DELETE', f'/cart/items/{item_id}', expected_status=200)
        
        if success and data.get('success'):
            return self.log_test(
                "Remove Cart Item", 
                True, 
                f"Successfully removed item from cart"
            )
        else:
            return self.log_test(
                "Remove Cart Item", 
                False, 
                f"Failed to remove cart item - Status: {status}, Response: {data}"
            )

    def test_javascript_error_investigation(self):
        """Investigate potential JavaScript errors in cart service"""
        print("\n🔍 Testing JavaScript Error Investigation...")
        
        # This test checks if the backend cart service has any JavaScript-related issues
        # by testing edge cases that might trigger the "this.updateCartTotal is not a function" error
        
        if not self.token or not self.products_for_testing:
            return self.log_test("JavaScript Error Investigation", False, "Insufficient setup for JS error test")
        
        # Test rapid successive cart operations that might trigger JS context issues
        product = self.products_for_testing[0]
        product_id = product.get('id')
        
        # Add item
        cart_item_data = {"productId": product_id, "quantity": 1}
        success1, status1, data1 = self.make_request('POST', '/cart/add', cart_item_data, 200)
        
        # Immediately get cart (this might trigger updateCartTotal)
        success2, status2, data2 = self.make_request('GET', '/cart')
        
        # Add same item again (should update existing)
        success3, status3, data3 = self.make_request('POST', '/cart/add', cart_item_data, 200)
        
        if success1 and success2 and success3:
            return self.log_test(
                "JavaScript Error Investigation", 
                True, 
                "No JavaScript context errors detected in rapid cart operations"
            )
        else:
            error_details = []
            if not success1: error_details.append(f"Add failed: {data1}")
            if not success2: error_details.append(f"Get failed: {data2}")
            if not success3: error_details.append(f"Update failed: {data3}")
            
            return self.log_test(
                "JavaScript Error Investigation", 
                False, 
                f"Potential JavaScript errors detected: {'; '.join(error_details)}"
            )

    def run_comprehensive_cart_tests(self):
        """Run comprehensive Add to Cart testing suite"""
        print("=" * 80)
        print("🛒 RitZone Add to Cart Comprehensive Testing Suite - January 2025")
        print("📋 Focus: Cart API Endpoints, Authentication, Real Product Testing")
        print("=" * 80)
        print(f"📅 Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print(f"🌐 Testing endpoint: {self.base_url}")
        print("=" * 80)

        # Core infrastructure tests
        self.test_backend_health()
        
        # Authentication and user setup
        self.test_user_registration_and_login()
        self.test_supabase_authentication()
        
        # Product data setup
        self.test_get_products_for_cart()
        
        # Cart functionality tests
        self.test_cart_endpoints_authentication()
        self.test_get_empty_cart()
        self.test_add_to_cart_functionality()
        self.test_add_multiple_products_to_cart()
        self.test_get_cart_with_items()
        
        # Advanced cart operations
        self.test_cart_input_validation()
        self.test_cart_item_update()
        self.test_cart_item_removal()
        
        # Error investigation
        self.test_javascript_error_investigation()

        # Print comprehensive results
        print("\n" + "=" * 80)
        print("📊 COMPREHENSIVE TEST RESULTS SUMMARY")
        print("=" * 80)
        
        critical_tests = []
        supporting_tests = []
        
        for result in self.test_results:
            if any(keyword in result['test'].lower() for keyword in ['add to cart', 'backend health', 'authentication']):
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
        
        # Specific analysis for Add to Cart
        add_to_cart_tests = [r for r in self.test_results if 'add to cart' in r['test'].lower()]
        if add_to_cart_tests:
            cart_success = all(r['status'] == '✅ PASS' for r in add_to_cart_tests)
            print(f"\n🛒 Add to Cart Status: {'✅ WORKING' if cart_success else '❌ FAILING'}")
            
            if not cart_success:
                failed_cart_tests = [r for r in add_to_cart_tests if r['status'] == '❌ FAIL']
                print("🔍 Failed Cart Tests:")
                for test in failed_cart_tests:
                    print(f"   - {test['test']}: {test['message']}")
        
        # Final assessment
        if self.tests_passed == self.tests_run:
            print("🎉 All tests passed! Add to Cart functionality is working correctly.")
            return 0
        else:
            failed_critical = [r for r in critical_tests if r['status'] == '❌ FAIL']
            if failed_critical:
                print(f"🚨 {len(failed_critical)} critical tests failed")
                print("💡 Recommendations:")
                for test in failed_critical:
                    if 'authentication' in test['test'].lower():
                        print("   - Check Supabase authentication configuration")
                    elif 'add to cart' in test['test'].lower():
                        print("   - Investigate cart service implementation")
                        print("   - Check RLS policies in Supabase")
                        print("   - Verify user creation in both auth.users and public.users tables")
            return 1

def main():
    """Main test execution"""
    tester = AddToCartTester()
    return tester.run_comprehensive_cart_tests()

if __name__ == "__main__":
    sys.exit(main())
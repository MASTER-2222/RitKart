#!/usr/bin/env python3
"""
RitZone Cart API Comprehensive Testing Suite - December 2025
===========================================================
URGENT: Testing for registered user cart issue - "Your cart is empty" instead of actual cart items

Focus Areas:
1. Backend Health Check (Node.js Express + Supabase on port 8001)
2. User Authentication Testing (JWT/Supabase token generation and validation)
3. Cart API Endpoints Testing (GET /api/cart, POST /api/cart/add, PUT /api/cart/items/:itemId, DELETE /api/cart/items/:itemId)
4. Database Integration (cart tables existence and data persistence)
5. Authentication Flow (token passing from frontend to backend)

Production URLs:
- Frontend: https://ritzone-frontend.onrender.com
- Backend: https://ritkart-backend.onrender.com/api
"""

import requests
import json
import sys
import uuid
import time
from datetime import datetime

class CartAPITester:
    def __init__(self, base_url="https://ritkart-backend.onrender.com/api"):
        self.base_url = base_url
        self.local_base_url = "http://localhost:8001/api"
        self.token = None
        self.supabase_token = None
        self.user_id = None
        self.test_user_email = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []
        self.products_for_testing = []
        self.cart_id = None
        self.use_production = True

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

    def get_current_base_url(self):
        """Get the current base URL being used for testing"""
        return self.base_url if self.use_production else self.local_base_url

    def make_request(self, method, endpoint, data=None, expected_status=200, use_supabase_token=False, timeout=30):
        """Make HTTP request with comprehensive error handling"""
        url = f"{self.get_current_base_url()}{endpoint}"
        headers = {'Content-Type': 'application/json'}
        
        # Use appropriate token
        if use_supabase_token and self.supabase_token:
            headers['Authorization'] = f'Bearer {self.supabase_token}'
        elif self.token:
            headers['Authorization'] = f'Bearer {self.token}'

        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=timeout)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=timeout)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers, timeout=timeout)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers, timeout=timeout)
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

    def test_backend_health_production_and_local(self):
        """Test backend health on both production and local environments"""
        print("\n🔍 Testing Backend Health Check (Production & Local)...")
        
        # Test production first
        self.use_production = True
        success_prod, status_prod, data_prod = self.make_request('GET', '/health')
        
        if success_prod and data_prod.get('success'):
            env_info = data_prod.get('environment', {})
            db_info = data_prod.get('database', {})
            self.log_test(
                "Backend Health Check (Production)", 
                True, 
                f"Production backend running - Environment: {env_info.get('nodeEnv', 'unknown')}, DB: {db_info.get('success', False)}"
            )
            production_working = True
        else:
            self.log_test(
                "Backend Health Check (Production)", 
                False, 
                f"Production health check failed - Status: {status_prod}, Response: {data_prod}"
            )
            production_working = False
        
        # Test local fallback
        self.use_production = False
        success_local, status_local, data_local = self.make_request('GET', '/health')
        
        if success_local and data_local.get('success'):
            env_info = data_local.get('environment', {})
            db_info = data_local.get('database', {})
            self.log_test(
                "Backend Health Check (Local)", 
                True, 
                f"Local backend running - Environment: {env_info.get('nodeEnv', 'unknown')}, DB: {db_info.get('success', False)}"
            )
            local_working = True
        else:
            self.log_test(
                "Backend Health Check (Local)", 
                False, 
                f"Local health check failed - Status: {status_local}, Response: {data_local}"
            )
            local_working = False
        
        # Decide which environment to use for remaining tests
        if production_working:
            self.use_production = True
            print(f"🌐 Using PRODUCTION environment: {self.base_url}")
        elif local_working:
            self.use_production = False
            print(f"🏠 Using LOCAL environment: {self.local_base_url}")
        else:
            print("❌ Neither production nor local backend is accessible!")
            return False
        
        return production_working or local_working

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
            
            response = requests.post(auth_url, json=auth_data, headers=headers, timeout=15)
            
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
            old_token = self.token
            self.token = None
            success, status, data = self.make_request(method, endpoint, expected_status=401)
            self.token = old_token
            
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
            items = cart_data.get('cart_items', [])
            total = cart_data.get('total_amount', 0)
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
        """Test getting cart after adding items - THIS IS THE CRITICAL TEST FOR THE REPORTED ISSUE"""
        if not self.token:
            return self.log_test("Get Cart with Items", False, "No authentication token available")
        
        print("\n📦 Testing Get Cart with Items (CRITICAL TEST FOR REPORTED ISSUE)...")
        success, status, data = self.make_request('GET', '/cart')
        
        if success and data.get('success'):
            cart_data = data.get('data', {})
            items = cart_data.get('cart_items', [])
            total = cart_data.get('total_amount', 0)
            
            if len(items) > 0:
                item_details = []
                for item in items[:3]:  # Show first 3 items
                    product_info = item.get('products', {})
                    item_details.append(f"{product_info.get('name', 'Unknown')} (Qty: {item.get('quantity', 0)})")
                
                return self.log_test(
                    "Get Cart with Items", 
                    True, 
                    f"✅ CART NOT EMPTY - Cart has {len(items)} items, Total: ${total} - Items: {', '.join(item_details)}"
                )
            else:
                return self.log_test(
                    "Get Cart with Items", 
                    False, 
                    "❌ CRITICAL ISSUE CONFIRMED - Cart shows empty after adding items (matches user report)"
                )
        else:
            return self.log_test(
                "Get Cart with Items", 
                False, 
                f"Failed to get cart - Status: {status}, Response: {data}"
            )

    def test_cart_data_persistence(self):
        """Test if cart data persists across sessions"""
        if not self.token:
            return self.log_test("Cart Data Persistence", False, "No authentication token available")
        
        print("\n💾 Testing Cart Data Persistence...")
        
        # Get cart multiple times to check consistency
        results = []
        for i in range(3):
            success, status, data = self.make_request('GET', '/cart')
            if success and data.get('success'):
                cart_data = data.get('data', {})
                items_count = len(cart_data.get('cart_items', []))
                total = cart_data.get('total_amount', 0)
                results.append((items_count, total))
            time.sleep(1)  # Small delay between requests
        
        if len(results) == 3:
            # Check if all results are consistent
            if all(r == results[0] for r in results):
                return self.log_test(
                    "Cart Data Persistence", 
                    True, 
                    f"Cart data consistent across requests - Items: {results[0][0]}, Total: ${results[0][1]}"
                )
            else:
                return self.log_test(
                    "Cart Data Persistence", 
                    False, 
                    f"Cart data inconsistent - Results: {results}"
                )
        else:
            return self.log_test(
                "Cart Data Persistence", 
                False, 
                "Failed to get consistent cart data for persistence test"
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
        items = cart_data.get('cart_items', [])
        
        if not items:
            return self.log_test("Update Cart Item", False, "No items in cart to update")
        
        # Update first item quantity
        item_id = items[0].get('id')
        update_data = {"quantity": 5}
        
        success, status, data = self.make_request('PUT', f'/cart/items/{item_id}', update_data, 200)
        
        if success and data.get('success'):
            return self.log_test(
                "Update Cart Item", 
                True, 
                f"Successfully updated item quantity to 5"
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
        items = cart_data.get('cart_items', [])
        
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

    def test_database_tables_existence(self):
        """Test if required database tables exist by checking API responses"""
        print("\n🗄️ Testing Database Tables Existence...")
        
        # Test if we can access cart (indicates users, carts, cart_items tables exist)
        if not self.token:
            return self.log_test("Database Tables", False, "No authentication token for database test")
        
        success, status, data = self.make_request('GET', '/cart')
        
        if success:
            return self.log_test(
                "Database Tables", 
                True, 
                "Cart API accessible - Required tables (users, carts, cart_items, products) appear to exist"
            )
        else:
            return self.log_test(
                "Database Tables", 
                False, 
                f"Cart API not accessible - Database tables may be missing - Status: {status}"
            )

    def test_cross_origin_requests(self):
        """Test cross-origin requests from frontend domain"""
        print("\n🌐 Testing Cross-Origin Requests...")
        
        # Test with frontend origin header
        url = f"{self.get_current_base_url()}/health"
        headers = {
            'Origin': 'https://ritzone-frontend.onrender.com',
            'Content-Type': 'application/json'
        }
        
        try:
            response = requests.get(url, headers=headers, timeout=15)
            
            if response.status_code == 200:
                # Check CORS headers
                cors_headers = {
                    'access-control-allow-origin': response.headers.get('access-control-allow-origin'),
                    'access-control-allow-methods': response.headers.get('access-control-allow-methods'),
                    'access-control-allow-headers': response.headers.get('access-control-allow-headers')
                }
                
                return self.log_test(
                    "Cross-Origin Requests", 
                    True, 
                    f"CORS working - Origin allowed, Headers: {cors_headers}"
                )
            else:
                return self.log_test(
                    "Cross-Origin Requests", 
                    False, 
                    f"CORS request failed - Status: {response.status_code}"
                )
        except Exception as e:
            return self.log_test(
                "Cross-Origin Requests", 
                False, 
                f"CORS test error: {str(e)}"
            )

    def run_comprehensive_cart_tests(self):
        """Run comprehensive cart API testing suite"""
        print("=" * 100)
        print("🛒 RitZone Cart API Comprehensive Testing Suite - December 2025")
        print("🚨 URGENT: Testing for registered user cart issue - 'Your cart is empty' instead of actual cart items")
        print("=" * 100)
        print(f"📅 Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print(f"🌐 Production URL: {self.base_url}")
        print(f"🏠 Local URL: {self.local_base_url}")
        print("=" * 100)

        # Core infrastructure tests
        self.test_backend_health_production_and_local()
        
        # Authentication and user setup
        self.test_user_registration_and_login()
        self.test_supabase_authentication()
        
        # Product data setup
        self.test_get_products_for_cart()
        
        # Database and infrastructure tests
        self.test_database_tables_existence()
        self.test_cross_origin_requests()
        
        # Cart functionality tests
        self.test_cart_endpoints_authentication()
        self.test_get_empty_cart()
        self.test_add_to_cart_functionality()
        self.test_add_multiple_products_to_cart()
        
        # CRITICAL TEST FOR REPORTED ISSUE
        self.test_get_cart_with_items()
        
        # Additional cart operations
        self.test_cart_data_persistence()
        self.test_cart_input_validation()
        self.test_cart_item_update()
        self.test_cart_item_removal()

        # Print comprehensive results
        print("\n" + "=" * 100)
        print("📊 COMPREHENSIVE TEST RESULTS SUMMARY")
        print("=" * 100)
        
        critical_tests = []
        supporting_tests = []
        
        for result in self.test_results:
            if any(keyword in result['test'].lower() for keyword in ['add to cart', 'get cart with items', 'backend health', 'authentication']):
                critical_tests.append(result)
            else:
                supporting_tests.append(result)
        
        print("\n🚨 CRITICAL TESTS (Related to reported issue):")
        for result in critical_tests:
            print(f"{result['status']} {result['test']}: {result['message']}")
        
        print("\n📋 SUPPORTING TESTS:")
        for result in supporting_tests:
            print(f"{result['status']} {result['test']}: {result['message']}")
        
        print(f"\n📈 Overall Results: {self.tests_passed}/{self.tests_run} tests passed")
        
        # Specific analysis for the reported issue
        cart_with_items_test = [r for r in self.test_results if 'get cart with items' in r['test'].lower()]
        if cart_with_items_test:
            cart_test = cart_with_items_test[0]
            if cart_test['status'] == '✅ PASS':
                print("\n✅ ISSUE RESOLUTION: Cart is working correctly - items are being retrieved properly")
            else:
                print("\n❌ ISSUE CONFIRMED: Cart shows empty after adding items (matches user report)")
                print("🔍 ROOT CAUSE ANALYSIS NEEDED:")
                print("   - Check cart data structure transformation in backend")
                print("   - Verify cart_items relationship in database queries")
                print("   - Check if frontend is parsing cart response correctly")
                print("   - Verify authentication token is being passed correctly from frontend")
        
        # Environment analysis
        environment_used = "PRODUCTION" if self.use_production else "LOCAL"
        print(f"\n🌐 Environment Used: {environment_used} ({self.get_current_base_url()})")
        
        # Final assessment
        if self.tests_passed == self.tests_run:
            print("🎉 All tests passed! Cart functionality appears to be working correctly.")
            return 0
        else:
            failed_critical = [r for r in critical_tests if r['status'] == '❌ FAIL']
            if failed_critical:
                print(f"🚨 {len(failed_critical)} critical tests failed")
                print("💡 Recommendations:")
                for test in failed_critical:
                    if 'authentication' in test['test'].lower():
                        print("   - Check Supabase authentication configuration")
                        print("   - Verify JWT token generation and validation")
                    elif 'add to cart' in test['test'].lower():
                        print("   - Check cart service implementation in backend")
                        print("   - Verify RLS policies in Supabase")
                        print("   - Check user creation in both auth.users and public.users tables")
                    elif 'get cart with items' in test['test'].lower():
                        print("   - CRITICAL: Check cart data retrieval and transformation")
                        print("   - Verify cart_items relationship in database queries")
                        print("   - Check frontend cart response parsing")
            return 1

def main():
    """Main test execution"""
    tester = CartAPITester()
    return tester.run_comprehensive_cart_tests()

if __name__ == "__main__":
    sys.exit(main())
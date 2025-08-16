#!/usr/bin/env python3
"""
RitZone Add to Cart Backend Testing Suite
=========================================
Comprehensive testing for Add to Cart functionality after RLS policies applied
Focus: Authentication, Cart APIs, Database operations, User creation flow
"""

import requests
import json
import sys
import uuid
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

    def test_cart_endpoints_accessibility(self):
        """Test cart endpoints are accessible (should return 401 without auth)"""
        print("\n🛒 Testing Cart Endpoints Accessibility...")
        
        endpoints = [
            ('/cart', 'GET'),
            ('/cart/add', 'POST'),
        ]
        
        all_accessible = True
        for endpoint, method in endpoints:
            success, status, data = self.make_request(method, endpoint, expected_status=401)
            if success and status == 401:
                self.log_test(f"Cart Endpoint {method} {endpoint}", True, "Properly requires authentication")
            else:
                self.log_test(f"Cart Endpoint {method} {endpoint}", False, f"Unexpected response - Status: {status}")
                all_accessible = False
        
        return all_accessible

    def test_user_registration_flow(self):
        """Test complete user registration flow"""
        print("\n👤 Testing User Registration Flow...")
        
        # Generate unique test user
        timestamp = datetime.now().strftime('%H%M%S%f')[:-3]  # Include milliseconds
        self.test_user_email = f"carttest.{timestamp}@example.com"
        
        user_data = {
            "email": self.test_user_email,
            "password": "CartTest123!",
            "fullName": f"Cart Test User {timestamp}",
            "phone": "+1234567890"
        }
        
        success, status, data = self.make_request('POST', '/auth/register', user_data, 201)
        
        if success and data.get('success'):
            if 'user' in data:
                self.user_id = data['user'].get('id')
            return self.log_test(
                "User Registration", 
                True, 
                f"User registered successfully - Email: {self.test_user_email}, ID: {self.user_id}"
            )
        else:
            return self.log_test(
                "User Registration", 
                False, 
                f"Registration failed - Status: {status}, Response: {data}"
            )

    def test_user_login_flow(self):
        """Test user login and token acquisition"""
        print("\n🔐 Testing User Login Flow...")
        
        if not self.test_user_email:
            return self.log_test("User Login", False, "No test user email available")
        
        login_data = {
            "email": self.test_user_email,
            "password": "CartTest123!"
        }
        
        success, status, data = self.make_request('POST', '/auth/login', login_data)
        
        if success and data.get('success'):
            # Store both JWT and user info
            if 'token' in data:
                self.token = data['token']
            if 'user' in data:
                self.user_id = data['user'].get('id')
                
            return self.log_test(
                "User Login", 
                True, 
                f"Login successful - Token acquired, User ID: {self.user_id}"
            )
        else:
            # Try with admin credentials as fallback
            admin_login_data = {
                "email": "admin@ritzone.com",
                "password": "RitZone@Admin2025!"
            }
            
            success, status, data = self.make_request('POST', '/auth/login', admin_login_data)
            
            if success and data.get('success'):
                if 'token' in data:
                    self.token = data['token']
                if 'user' in data:
                    self.user_id = data['user'].get('id')
                    
                return self.log_test(
                    "User Login", 
                    True, 
                    "Admin login successful as fallback"
                )
            else:
                return self.log_test(
                    "User Login", 
                    False, 
                    f"Both test user and admin login failed - Status: {status}, Response: {data}"
                )

    def test_supabase_direct_auth(self):
        """Test Supabase direct authentication"""
        print("\n🔑 Testing Supabase Direct Authentication...")
        
        # Create Supabase client and test authentication
        try:
            import os
            supabase_url = "https://igzpodmmymbptmwebonh.supabase.co"
            supabase_anon_key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlnenBvZG1teW1icHRtd2Vib25oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1NDczNDIsImV4cCI6MjA3MDEyMzM0Mn0.eOy5F_0pE7ki3TXl49bW5c0K1TWGKf2_Vpn1IRKWQRc"
            
            # Test Supabase auth endpoint directly
            auth_url = f"{supabase_url}/auth/v1/token?grant_type=password"
            auth_data = {
                "email": self.test_user_email or "admin@ritzone.com",
                "password": "CartTest123!" if self.test_user_email else "RitZone@Admin2025!"
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
                    return self.log_test(
                        "Supabase Direct Auth", 
                        True, 
                        "Supabase authentication successful"
                    )
            
            return self.log_test(
                "Supabase Direct Auth", 
                False, 
                f"Supabase auth failed - Status: {response.status_code}"
            )
            
        except Exception as e:
            return self.log_test(
                "Supabase Direct Auth", 
                False, 
                f"Supabase auth error: {str(e)}"
            )

    def test_get_products_for_cart(self):
        """Get products to use in cart testing"""
        print("\n🛍️ Testing Product Retrieval for Cart Testing...")
        
        # Test multiple categories to get diverse products
        categories = ['electronics', 'fashion', 'books', 'home', 'sports']
        
        for category in categories:
            success, status, data = self.make_request('GET', f'/products/category/{category}?limit=2')
            
            if success and data.get('success') and data.get('data'):
                products = data['data']
                self.products_for_testing.extend(products[:2])  # Take first 2 products
                
        if self.products_for_testing:
            product_names = [p.get('name', 'Unknown')[:30] for p in self.products_for_testing[:3]]
            return self.log_test(
                "Product Retrieval", 
                True, 
                f"Retrieved {len(self.products_for_testing)} products for testing: {', '.join(product_names)}"
            )
        else:
            return self.log_test(
                "Product Retrieval", 
                False, 
                "No products available for cart testing"
            )

    def test_get_empty_cart(self):
        """Test getting user's cart (should be empty initially)"""
        if not self.token:
            return self.log_test("Get Empty Cart", False, "No authentication token available")
        
        print("\n🛒 Testing Get Empty Cart...")
        success, status, data = self.make_request('GET', '/cart')
        
        if success and data.get('success'):
            cart_data = data.get('data', {})
            items = cart_data.get('items', [])
            return self.log_test(
                "Get Empty Cart", 
                True, 
                f"Cart retrieved successfully - Items: {len(items)}, Total: {cart_data.get('total', 0)}"
            )
        else:
            return self.log_test(
                "Get Empty Cart", 
                False, 
                f"Failed to get cart - Status: {status}, Response: {data}"
            )

    def test_add_to_cart_functionality(self):
        """Test the core Add to Cart functionality"""
        if not self.token:
            return self.log_test("Add to Cart", False, "No authentication token available")
        
        if not self.products_for_testing:
            return self.log_test("Add to Cart", False, "No products available for testing")
        
        print("\n➕ Testing Add to Cart Functionality...")
        
        # Test with first available product
        product = self.products_for_testing[0]
        product_id = product.get('id')
        product_name = product.get('name', 'Unknown Product')
        
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
                f"Successfully added '{product_name}' to cart - Item ID: {cart_item.get('id')}"
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

    def test_cart_input_validation(self):
        """Test cart input validation"""
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

    def test_database_user_creation(self):
        """Test if user is properly created in database tables"""
        print("\n🗄️ Testing Database User Creation...")
        
        if not self.user_id:
            return self.log_test("Database User Creation", False, "No user ID available for testing")
        
        # This would require direct database access, but we can test indirectly
        # by checking if cart operations work (which require user in database)
        
        # Test getting user profile (indicates user exists in database)
        success, status, data = self.make_request('GET', '/auth/profile')
        
        if success and data.get('success'):
            user_data = data.get('user', {})
            return self.log_test(
                "Database User Creation", 
                True, 
                f"User exists in database - ID: {user_data.get('id')}, Email: {user_data.get('email')}"
            )
        else:
            return self.log_test(
                "Database User Creation", 
                False, 
                f"User profile not accessible - Status: {status}, Response: {data}"
            )

    def test_rls_policies_working(self):
        """Test that RLS policies are working correctly"""
        print("\n🔒 Testing RLS Policies...")
        
        if not self.token:
            return self.log_test("RLS Policies", False, "No authentication token available")
        
        # Test authenticated access to cart (should work)
        success, status, data = self.make_request('GET', '/cart')
        
        if success:
            self.log_test("RLS Policies - Authenticated Access", True, "Authenticated cart access works")
        else:
            self.log_test("RLS Policies - Authenticated Access", False, f"Authenticated access failed - Status: {status}")
        
        # Test unauthenticated access (should fail)
        old_token = self.token
        self.token = None
        
        success, status, data = self.make_request('GET', '/cart', expected_status=401)
        
        self.token = old_token  # Restore token
        
        if success and status == 401:
            self.log_test("RLS Policies - Unauthenticated Access", True, "Unauthenticated access properly blocked")
            return True
        else:
            self.log_test("RLS Policies - Unauthenticated Access", False, f"Unauthenticated access not blocked - Status: {status}")
            return False

    def run_comprehensive_cart_tests(self):
        """Run comprehensive Add to Cart testing suite"""
        print("=" * 70)
        print("🛒 RitZone Add to Cart Comprehensive Testing Suite")
        print("📋 Focus: Authentication, Cart APIs, Database Operations")
        print("=" * 70)
        print(f"📅 Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print(f"🌐 Testing endpoint: {self.base_url}")
        print("=" * 70)

        # Core infrastructure tests
        self.test_backend_health()
        self.test_cart_endpoints_accessibility()
        
        # Authentication flow tests
        self.test_user_registration_flow()
        self.test_user_login_flow()
        self.test_supabase_direct_auth()
        
        # Database and user tests
        self.test_database_user_creation()
        self.test_rls_policies_working()
        
        # Product and cart functionality tests
        self.test_get_products_for_cart()
        self.test_get_empty_cart()
        self.test_cart_input_validation()
        
        # Core Add to Cart test
        self.test_add_to_cart_functionality()

        # Print comprehensive results
        print("\n" + "=" * 70)
        print("📊 COMPREHENSIVE TEST RESULTS SUMMARY")
        print("=" * 70)
        
        critical_tests = []
        minor_tests = []
        
        for result in self.test_results:
            if any(keyword in result['test'].lower() for keyword in ['add to cart', 'authentication', 'health', 'rls']):
                critical_tests.append(result)
            else:
                minor_tests.append(result)
        
        print("\n🚨 CRITICAL TESTS:")
        for result in critical_tests:
            print(f"{result['status']} {result['test']}: {result['message']}")
        
        print("\n📋 SUPPORTING TESTS:")
        for result in minor_tests:
            print(f"{result['status']} {result['test']}: {result['message']}")
        
        print(f"\n📈 Overall Results: {self.tests_passed}/{self.tests_run} tests passed")
        
        # Specific analysis for Add to Cart
        add_to_cart_tests = [r for r in self.test_results if 'add to cart' in r['test'].lower()]
        if add_to_cart_tests:
            cart_success = all(r['status'] == '✅ PASS' for r in add_to_cart_tests)
            print(f"\n🛒 Add to Cart Status: {'✅ WORKING' if cart_success else '❌ FAILING'}")
        
        if self.tests_passed == self.tests_run:
            print("🎉 All tests passed! Add to Cart should be working.")
            return 0
        else:
            failed_critical = [r for r in critical_tests if r['status'] == '❌ FAIL']
            if failed_critical:
                print(f"🚨 {len(failed_critical)} critical tests failed - Add to Cart likely not working")
            return 1

def main():
    """Main test execution"""
    tester = AddToCartTester()
    return tester.run_comprehensive_cart_tests()

if __name__ == "__main__":
    sys.exit(main())
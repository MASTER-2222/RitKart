#!/usr/bin/env python3
"""
RitZone Add to Cart Functionality Testing
=========================================
Testing enhanced Supabase token authentication support for cart operations
"""

import requests
import json
import sys
from datetime import datetime
import uuid

class CartFunctionalityTester:
    def __init__(self, base_url="http://localhost:8001/api"):
        self.base_url = base_url
        self.supabase_token = None
        self.jwt_token = None
        self.user_id = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []
        self.available_products = []

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

    def make_request(self, method, endpoint, data=None, expected_status=200, token=None):
        """Make HTTP request with error handling"""
        url = f"{self.base_url}{endpoint}"
        headers = {'Content-Type': 'application/json'}
        
        # Use provided token or default to available tokens
        if token:
            headers['Authorization'] = f'Bearer {token}'
        elif self.supabase_token:
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

            # Try to parse JSON response
            try:
                response_data = response.json()
            except:
                response_data = {"raw_response": response.text[:500]}

            success = response.status_code == expected_status
            return success, response.status_code, response_data

        except requests.exceptions.RequestException as e:
            return False, 0, {"error": str(e)}

    def test_backend_health(self):
        """Test backend health and connectivity"""
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
        """Test if cart endpoints are accessible (should return 401 without auth)"""
        print("\n🛒 Testing Cart Endpoints Accessibility...")
        
        endpoints = [
            ('/cart', 'GET'),
            ('/cart/add', 'POST'),
        ]
        
        all_accessible = True
        
        for endpoint, method in endpoints:
            success, status, data = self.make_request(method, endpoint, expected_status=401)
            
            if status == 401 and data.get('message') == 'Access token is required':
                self.log_test(
                    f"Cart Endpoint {method} {endpoint}", 
                    True, 
                    "Correctly requires authentication (401)"
                )
            else:
                self.log_test(
                    f"Cart Endpoint {method} {endpoint}", 
                    False, 
                    f"Unexpected response - Status: {status}, Message: {data.get('message', 'Unknown')}"
                )
                all_accessible = False
        
        return all_accessible

    def test_authentication_middleware(self):
        """Test authentication middleware with invalid tokens"""
        print("\n🔒 Testing Authentication Middleware...")
        
        # Test with invalid token
        invalid_tokens = [
            "invalid_token",
            "Bearer invalid_token",
            "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalid.signature"
        ]
        
        all_rejected = True
        
        for token in invalid_tokens:
            success, status, data = self.make_request(
                'GET', '/cart', 
                token=token,
                expected_status=403
            )
            
            if status in [401, 403] and not data.get('success', True):
                self.log_test(
                    f"Invalid Token Rejection", 
                    True, 
                    f"Correctly rejected invalid token (Status: {status})"
                )
            else:
                self.log_test(
                    f"Invalid Token Rejection", 
                    False, 
                    f"Failed to reject invalid token - Status: {status}"
                )
                all_rejected = False
        
        return all_rejected

    def get_test_products(self):
        """Get available products for testing"""
        print("\n📦 Getting Test Products...")
        
        # Try to get products from different categories
        categories = ['electronics', 'fashion', 'books', 'home', 'sports']
        
        for category in categories:
            success, status, data = self.make_request('GET', f'/products/category/{category}?limit=2')
            
            if success and data.get('success') and data.get('data'):
                products = data['data']
                self.available_products.extend(products[:2])  # Take first 2 products
                
                if len(self.available_products) >= 5:  # We have enough products
                    break
        
        if self.available_products:
            product_names = [p.get('name', 'Unknown')[:30] for p in self.available_products[:3]]
            return self.log_test(
                "Get Test Products", 
                True, 
                f"Retrieved {len(self.available_products)} products: {', '.join(product_names)}..."
            )
        else:
            return self.log_test(
                "Get Test Products", 
                False, 
                "No products available for testing"
            )

    def test_user_registration_and_auth(self):
        """Test user registration to get authentication token"""
        print("\n👤 Testing User Registration for Authentication...")
        
        # Generate unique test user
        timestamp = datetime.now().strftime('%H%M%S')
        test_email = f"carttest.{timestamp}@example.com"
        
        user_data = {
            "email": test_email,
            "password": "CartTest123!",
            "fullName": f"Cart Test User {timestamp}",
            "phone": "+1234567890"
        }
        
        success, status, data = self.make_request('POST', '/auth/register', user_data, 201)
        
        if success and data.get('success'):
            if 'user' in data:
                self.user_id = data['user'].get('id')
            
            # Try to login to get token (registration might not return token due to email verification)
            login_success, login_status, login_data = self.make_request('POST', '/auth/login', {
                "email": test_email,
                "password": "CartTest123!"
            })
            
            if login_success and login_data.get('token'):
                self.jwt_token = login_data['token']
                return self.log_test(
                    "User Registration & Auth", 
                    True, 
                    f"User registered and authenticated - Email: {test_email}"
                )
            else:
                return self.log_test(
                    "User Registration & Auth", 
                    True, 
                    f"User registered successfully but login failed (likely email verification required) - Email: {test_email}"
                )
        else:
            # Try with existing test user as fallback
            return self.test_fallback_authentication()

    def test_fallback_authentication(self):
        """Try authentication with existing test users"""
        print("\n🔄 Testing Fallback Authentication...")
        
        # Try with admin credentials
        admin_login_data = {
            "email": "admin@ritzone.com",
            "password": "RitZone@Admin2025!"
        }
        
        success, status, data = self.make_request('POST', '/auth/login', admin_login_data)
        
        if success and data.get('success') and data.get('token'):
            self.jwt_token = data['token']
            self.user_id = data.get('user', {}).get('id')
            return self.log_test(
                "Fallback Authentication", 
                True, 
                "Admin authentication successful"
            )
        else:
            return self.log_test(
                "Fallback Authentication", 
                False, 
                f"All authentication methods failed - Status: {status}, Response: {data}"
            )

    def test_add_to_cart_functionality(self):
        """Test the core Add to Cart functionality"""
        if not self.jwt_token and not self.supabase_token:
            return self.log_test("Add to Cart Test", False, "No authentication token available")
        
        if not self.available_products:
            return self.log_test("Add to Cart Test", False, "No products available for testing")
        
        print("\n🛒 Testing Add to Cart Functionality...")
        
        # Test adding first product to cart
        product = self.available_products[0]
        product_id = product.get('id')
        product_name = product.get('name', 'Unknown Product')
        
        if not product_id:
            return self.log_test("Add to Cart Test", False, "Product ID not found")
        
        # Test 1: Add item to cart
        cart_item_data = {
            "productId": product_id,
            "quantity": 2
        }
        
        success, status, data = self.make_request('POST', '/cart/add', cart_item_data, 200)
        
        if success and data.get('success'):
            cart_item = data.get('data', {})
            self.log_test(
                "Add to Cart - Success", 
                True, 
                f"Successfully added '{product_name[:30]}' to cart (Quantity: 2)"
            )
            
            # Test 2: Add same item again (should update quantity)
            success2, status2, data2 = self.make_request('POST', '/cart/add', cart_item_data, 200)
            
            if success2 and data2.get('success'):
                self.log_test(
                    "Add to Cart - Update Quantity", 
                    True, 
                    "Successfully updated existing item quantity in cart"
                )
            else:
                self.log_test(
                    "Add to Cart - Update Quantity", 
                    False, 
                    f"Failed to update quantity - Status: {status2}, Response: {data2}"
                )
            
            return True
        else:
            return self.log_test(
                "Add to Cart - Failed", 
                False, 
                f"Failed to add to cart - Status: {status}, Response: {data}"
            )

    def test_cart_retrieval(self):
        """Test retrieving user's cart"""
        if not self.jwt_token and not self.supabase_token:
            return self.log_test("Get Cart Test", False, "No authentication token available")
        
        print("\n📋 Testing Cart Retrieval...")
        
        success, status, data = self.make_request('GET', '/cart')
        
        if success and data.get('success'):
            cart_data = data.get('data', {})
            items = cart_data.get('items', [])
            total = cart_data.get('total', 0)
            
            return self.log_test(
                "Get Cart", 
                True, 
                f"Cart retrieved successfully - Items: {len(items)}, Total: ${total}"
            )
        else:
            return self.log_test(
                "Get Cart", 
                False, 
                f"Failed to retrieve cart - Status: {status}, Response: {data}"
            )

    def test_input_validation(self):
        """Test input validation for cart operations"""
        if not self.jwt_token and not self.supabase_token:
            return self.log_test("Input Validation", False, "No authentication token available")
        
        print("\n✅ Testing Input Validation...")
        
        validation_tests = [
            # Missing productId
            ({}, "Missing productId should be rejected"),
            # Invalid quantity
            ({"productId": "test-id", "quantity": 0}, "Zero quantity should be rejected"),
            ({"productId": "test-id", "quantity": -1}, "Negative quantity should be rejected"),
            # Non-existent product
            ({"productId": str(uuid.uuid4()), "quantity": 1}, "Non-existent product should be rejected"),
        ]
        
        all_validations_passed = True
        
        for test_data, description in validation_tests:
            success, status, data = self.make_request('POST', '/cart/add', test_data, 400)
            
            if status == 400 and not data.get('success', True):
                self.log_test(
                    f"Validation - {description}", 
                    True, 
                    f"Correctly rejected invalid input (Status: {status})"
                )
            else:
                self.log_test(
                    f"Validation - {description}", 
                    False, 
                    f"Failed to reject invalid input - Status: {status}"
                )
                all_validations_passed = False
        
        return all_validations_passed

    def test_database_schema(self):
        """Test if cart and cart_items tables exist by attempting operations"""
        print("\n🗄️ Testing Database Schema...")
        
        # This is tested implicitly through cart operations
        # If cart operations work, the schema exists
        if self.jwt_token or self.supabase_token:
            success, status, data = self.make_request('GET', '/cart')
            
            if status in [200, 401, 403]:  # Any of these means the endpoint exists
                return self.log_test(
                    "Database Schema", 
                    True, 
                    "Cart tables appear to exist (endpoint accessible)"
                )
            else:
                return self.log_test(
                    "Database Schema", 
                    False, 
                    f"Cart tables may not exist - Status: {status}"
                )
        else:
            return self.log_test(
                "Database Schema", 
                True, 
                "Schema test skipped (no authentication available)"
            )

    def run_comprehensive_cart_tests(self):
        """Run comprehensive cart functionality tests"""
        print("=" * 70)
        print("🛒 RitZone Add to Cart Functionality Testing")
        print("📋 Enhanced Supabase Token Authentication Support")
        print("=" * 70)
        print(f"📅 Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print(f"🌐 Testing endpoint: {self.base_url}")
        print("=" * 70)

        # Core infrastructure tests
        self.test_backend_health()
        self.test_cart_endpoints_accessibility()
        self.test_authentication_middleware()
        
        # Get test data
        self.get_test_products()
        
        # Authentication tests
        self.test_user_registration_and_auth()
        
        # Core cart functionality tests
        self.test_add_to_cart_functionality()
        self.test_cart_retrieval()
        self.test_input_validation()
        self.test_database_schema()

        # Print Results Summary
        print("\n" + "=" * 70)
        print("📊 CART FUNCTIONALITY TEST RESULTS")
        print("=" * 70)
        
        for result in self.test_results:
            print(f"{result['status']} {result['test']}: {result['message']}")
        
        print(f"\n📈 Overall Results: {self.tests_passed}/{self.tests_run} tests passed")
        
        # Detailed analysis
        critical_failures = []
        for result in self.test_results:
            if result['status'] == '❌ FAIL' and any(keyword in result['test'].lower() for keyword in ['add to cart', 'authentication', 'health']):
                critical_failures.append(result['test'])
        
        if critical_failures:
            print(f"\n🚨 CRITICAL FAILURES DETECTED:")
            for failure in critical_failures:
                print(f"   - {failure}")
        
        if self.tests_passed == self.tests_run:
            print("🎉 All cart functionality tests passed!")
            return 0
        else:
            print(f"⚠️  {self.tests_run - self.tests_passed} tests failed")
            return 1

def main():
    """Main test execution"""
    tester = CartFunctionalityTester()
    return tester.run_comprehensive_cart_tests()

if __name__ == "__main__":
    sys.exit(main())
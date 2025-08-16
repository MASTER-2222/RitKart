#!/usr/bin/env python3
"""
RitZone Add to Cart HTTP 400 Error Investigation - January 2025
================================================================
Focused testing to identify root cause of user's "❌ Failed to add product to cart. Please try again" error
Focus: Authentication token format, request structure, and HTTP 400 error analysis
"""

import requests
import json
import sys
import uuid
from datetime import datetime

class AddToCartHTTP400Tester:
    def __init__(self, base_url="http://localhost:8001/api"):
        self.base_url = base_url
        self.jwt_token = None
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
        if response_data and not success:
            print(f"    Response: {json.dumps(response_data, indent=2)}")
        return success

    def make_request(self, method, endpoint, data=None, expected_status=200, token_type="jwt", headers_override=None):
        """Make HTTP request with detailed error analysis"""
        url = f"{self.base_url}{endpoint}"
        headers = headers_override or {'Content-Type': 'application/json'}
        
        # Add authentication token based on type
        if token_type == "jwt" and self.jwt_token:
            headers['Authorization'] = f'Bearer {self.jwt_token}'
        elif token_type == "supabase" and self.supabase_token:
            headers['Authorization'] = f'Bearer {self.supabase_token}'
        elif token_type == "none":
            # No authentication header
            pass

        try:
            print(f"    🔍 Making {method} request to {url}")
            print(f"    📋 Headers: {json.dumps({k: v[:50] + '...' if len(str(v)) > 50 else v for k, v in headers.items()}, indent=2)}")
            if data:
                print(f"    📦 Data: {json.dumps(data, indent=2)}")

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
                response_data = {"raw_response": response.text[:1000]}

            print(f"    📊 Response Status: {response.status_code}")
            print(f"    📄 Response Data: {json.dumps(response_data, indent=2)}")

            success = response.status_code == expected_status
            return success, response.status_code, response_data

        except requests.exceptions.RequestException as e:
            print(f"    ❌ Request Error: {str(e)}")
            return False, 0, {"error": str(e)}

    def test_backend_health(self):
        """Test backend health and configuration"""
        print("\n🔍 Testing Backend Health Check...")
        success, status, data = self.make_request('GET', '/health', token_type="none")
        
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
                f"Health check failed - Status: {status}",
                data
            )

    def test_user_registration_and_authentication(self):
        """Test complete user registration and authentication flow"""
        print("\n👤 Testing User Registration and Authentication Flow...")
        
        # Generate unique test user
        timestamp = datetime.now().strftime('%H%M%S%f')[:-3]
        self.test_user_email = f"http400test.{timestamp}@example.com"
        
        user_data = {
            "email": self.test_user_email,
            "password": "HTTP400Test123!",
            "fullName": f"HTTP 400 Test User {timestamp}",
            "phone": "+1234567890"
        }
        
        # Register user
        print("  📝 Registering new user...")
        success, status, data = self.make_request('POST', '/auth/register', user_data, 201, token_type="none")
        
        if success and data.get('success'):
            if 'user' in data:
                self.user_id = data['user'].get('id')
            self.log_test("User Registration", True, f"User registered - Email: {self.test_user_email}")
        else:
            self.log_test("User Registration", False, f"Registration failed - Status: {status}", data)
            return False
        
        # Login user to get JWT token
        print("  🔐 Logging in to get JWT token...")
        login_data = {
            "email": self.test_user_email,
            "password": "HTTP400Test123!"
        }
        
        success, status, data = self.make_request('POST', '/auth/login', login_data, 200, token_type="none")
        
        if success and data.get('success'):
            if 'token' in data:
                self.jwt_token = data['token']
            if 'user' in data:
                self.user_id = data['user'].get('id')
            self.log_test("JWT Login", True, f"JWT login successful - Token acquired, User ID: {self.user_id}")
        else:
            self.log_test("JWT Login", False, f"JWT login failed - Status: {status}", data)
            return False

        # Get Supabase token
        print("  🔑 Getting Supabase token...")
        try:
            supabase_url = "https://igzpodmmymbptmwebonh.supabase.co"
            supabase_anon_key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlnenBvZG1teW1icHRtd2Vib25oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1NDczNDIsImV4cCI6MjA3MDEyMzM0Mn0.eOy5F_0pE7ki3TXl49bW5c0K1TWGKf2_Vpn1IRKWQRc"
            
            auth_url = f"{supabase_url}/auth/v1/token?grant_type=password"
            auth_data = {
                "email": self.test_user_email,
                "password": "HTTP400Test123!"
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
                    self.log_test("Supabase Authentication", True, "Supabase token acquired successfully")
                else:
                    self.log_test("Supabase Authentication", False, "No access_token in response", auth_response)
            else:
                self.log_test("Supabase Authentication", False, f"Supabase auth failed - Status: {response.status_code}", response.json())
            
        except Exception as e:
            self.log_test("Supabase Authentication", False, f"Supabase auth error: {str(e)}")

        return True

    def test_get_real_products(self):
        """Get real products from database for testing"""
        print("\n🛍️ Testing Product Retrieval for HTTP 400 Testing...")
        
        # Test multiple categories to get diverse products
        categories = ['electronics', 'fashion', 'books']
        
        for category in categories:
            success, status, data = self.make_request('GET', f'/products/category/{category}?limit=2', token_type="none")
            
            if success and data.get('success') and data.get('data'):
                products = data['data']
                self.products_for_testing.extend(products[:2])
                
        if self.products_for_testing:
            product_names = [p.get('name', 'Unknown')[:30] for p in self.products_for_testing[:3]]
            return self.log_test(
                "Product Retrieval", 
                True, 
                f"Retrieved {len(self.products_for_testing)} products for testing: {', '.join(product_names)}"
            )
        else:
            return self.log_test("Product Retrieval", False, "No products available for testing")

    def test_add_to_cart_with_different_token_formats(self):
        """Test Add to Cart with different authentication token formats"""
        print("\n🔍 Testing Add to Cart with Different Token Formats...")
        
        if not self.products_for_testing:
            return self.log_test("Token Format Testing", False, "No products available for testing")

        product = self.products_for_testing[0]
        product_id = product.get('id')
        product_name = product.get('name', 'Unknown Product')
        
        cart_item_data = {
            "productId": product_id,
            "quantity": 1
        }

        # Test 1: JWT Token
        print("  🎫 Testing with JWT Token...")
        if self.jwt_token:
            success, status, data = self.make_request('POST', '/cart/add', cart_item_data, 200, token_type="jwt")
            
            if success and data.get('success'):
                self.log_test("Add to Cart - JWT Token", True, f"Successfully added '{product_name}' with JWT token")
            else:
                self.log_test("Add to Cart - JWT Token", False, f"Failed with JWT token - Status: {status}", data)
        else:
            self.log_test("Add to Cart - JWT Token", False, "No JWT token available")

        # Test 2: Supabase Token
        print("  🔑 Testing with Supabase Token...")
        if self.supabase_token:
            success, status, data = self.make_request('POST', '/cart/add', cart_item_data, 200, token_type="supabase")
            
            if success and data.get('success'):
                self.log_test("Add to Cart - Supabase Token", True, f"Successfully added '{product_name}' with Supabase token")
            else:
                self.log_test("Add to Cart - Supabase Token", False, f"Failed with Supabase token - Status: {status}", data)
        else:
            self.log_test("Add to Cart - Supabase Token", False, "No Supabase token available")

        # Test 3: No Token (should fail with 401)
        print("  🚫 Testing without Token...")
        success, status, data = self.make_request('POST', '/cart/add', cart_item_data, 401, token_type="none")
        
        if success and status == 401:
            self.log_test("Add to Cart - No Token", True, "Properly rejected request without token")
        else:
            self.log_test("Add to Cart - No Token", False, f"Unexpected response without token - Status: {status}", data)

    def test_add_to_cart_request_variations(self):
        """Test different request variations that might cause HTTP 400"""
        print("\n🧪 Testing Add to Cart Request Variations...")
        
        if not self.products_for_testing or not self.jwt_token:
            return self.log_test("Request Variations", False, "Insufficient setup for request variation testing")

        product = self.products_for_testing[0]
        product_id = product.get('id')

        # Test different request variations
        test_cases = [
            # Valid request
            ({"productId": product_id, "quantity": 1}, 200, "Valid request"),
            
            # Missing productId
            ({"quantity": 1}, 400, "Missing productId"),
            
            # Invalid productId format
            ({"productId": "invalid-id", "quantity": 1}, 400, "Invalid productId format"),
            
            # Zero quantity
            ({"productId": product_id, "quantity": 0}, 400, "Zero quantity"),
            
            # Negative quantity
            ({"productId": product_id, "quantity": -1}, 400, "Negative quantity"),
            
            # Missing quantity (should default to 1)
            ({"productId": product_id}, 200, "Missing quantity (should default)"),
            
            # Non-existent product
            ({"productId": str(uuid.uuid4()), "quantity": 1}, 400, "Non-existent product"),
            
            # Extra fields
            ({"productId": product_id, "quantity": 1, "extraField": "test"}, 200, "Extra fields"),
        ]

        for test_data, expected_status, description in test_cases:
            print(f"  🧪 Testing: {description}")
            success, status, data = self.make_request('POST', '/cart/add', test_data, expected_status, token_type="jwt")
            
            if success:
                self.log_test(f"Request Variation - {description}", True, f"Correctly handled - Status: {status}")
            else:
                self.log_test(f"Request Variation - {description}", False, f"Unexpected response - Expected: {expected_status}, Got: {status}", data)

    def test_frontend_like_request(self):
        """Test request that mimics frontend implementation"""
        print("\n🌐 Testing Frontend-like Request...")
        
        if not self.products_for_testing or not self.supabase_token:
            return self.log_test("Frontend-like Request", False, "Insufficient setup for frontend-like testing")

        product = self.products_for_testing[0]
        product_id = product.get('id')
        product_name = product.get('name', 'Unknown Product')

        # Mimic frontend request structure
        frontend_headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': f'Bearer {self.supabase_token}',
            'User-Agent': 'Mozilla/5.0 (compatible; RitZone Frontend)',
        }

        frontend_data = {
            "productId": product_id,
            "quantity": 1
        }

        print("  🌐 Making frontend-like request...")
        success, status, data = self.make_request('POST', '/cart/add', frontend_data, 200, token_type="none", headers_override=frontend_headers)
        
        if success and data.get('success'):
            self.log_test("Frontend-like Request", True, f"Successfully added '{product_name}' with frontend-like request")
        else:
            self.log_test("Frontend-like Request", False, f"Frontend-like request failed - Status: {status}", data)

    def run_http_400_investigation(self):
        """Run comprehensive HTTP 400 error investigation"""
        print("=" * 80)
        print("🔍 RitZone Add to Cart HTTP 400 Error Investigation - January 2025")
        print("📋 Focus: Authentication Token Format, Request Structure, Error Analysis")
        print("=" * 80)
        print(f"📅 Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print(f"🌐 Testing endpoint: {self.base_url}")
        print("=" * 80)

        # Core tests
        self.test_backend_health()
        self.test_user_registration_and_authentication()
        self.test_get_real_products()
        self.test_add_to_cart_with_different_token_formats()
        self.test_add_to_cart_request_variations()
        self.test_frontend_like_request()

        # Print comprehensive results
        print("\n" + "=" * 80)
        print("📊 HTTP 400 ERROR INVESTIGATION RESULTS")
        print("=" * 80)
        
        # Categorize results
        authentication_tests = [r for r in self.test_results if 'token' in r['test'].lower() or 'auth' in r['test'].lower()]
        request_tests = [r for r in self.test_results if 'request' in r['test'].lower() or 'variation' in r['test'].lower()]
        other_tests = [r for r in self.test_results if r not in authentication_tests and r not in request_tests]

        print("\n🔐 AUTHENTICATION TESTS:")
        for result in authentication_tests:
            print(f"{result['status']} {result['test']}: {result['message']}")
        
        print("\n📋 REQUEST VARIATION TESTS:")
        for result in request_tests:
            print(f"{result['status']} {result['test']}: {result['message']}")
        
        print("\n🔧 INFRASTRUCTURE TESTS:")
        for result in other_tests:
            print(f"{result['status']} {result['test']}: {result['message']}")
        
        print(f"\n📈 Overall Results: {self.tests_passed}/{self.tests_run} tests passed")
        
        # Analysis
        add_to_cart_tests = [r for r in self.test_results if 'add to cart' in r['test'].lower()]
        working_tokens = [r for r in add_to_cart_tests if r['status'] == '✅ PASS']
        
        print("\n🔍 HTTP 400 ERROR ANALYSIS:")
        if working_tokens:
            print("✅ Add to Cart functionality is working with proper authentication")
            print("📋 Working authentication methods:")
            for test in working_tokens:
                print(f"   - {test['test']}")
            print("\n💡 CONCLUSION: HTTP 400 errors are likely due to:")
            print("   1. Missing or invalid authentication token in frontend")
            print("   2. Incorrect request format (missing productId, invalid quantity)")
            print("   3. Frontend not using the correct token format")
            print("   4. CORS issues preventing proper token transmission")
        else:
            print("❌ Add to Cart functionality is not working")
            print("🚨 CRITICAL ISSUE: Backend cart API is not functioning properly")
        
        return 0 if self.tests_passed == self.tests_run else 1

def main():
    """Main test execution"""
    tester = AddToCartHTTP400Tester()
    return tester.run_http_400_investigation()

if __name__ == "__main__":
    sys.exit(main())
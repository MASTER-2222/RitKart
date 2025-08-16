#!/usr/bin/env python3
"""
RitZone Frontend-Backend Authentication Flow Testing
===================================================
Specific test to simulate the exact authentication flow that the frontend uses
to identify potential token format or communication issues.
"""

import requests
import json
import sys
from datetime import datetime

class FrontendAuthFlowTester:
    def __init__(self):
        self.production_backend = "https://ritkart-backend.onrender.com/api"
        self.local_backend = "http://localhost:8001/api"
        self.supabase_url = "https://igzpodmmymbptmwebonh.supabase.co"
        self.supabase_anon_key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlnenBvZG1teW1icHRtd2Vib25oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1NDczNDIsImV4cCI6MjA3MDEyMzM0Mn0.eOy5F_0pE7ki3TXl49bW5c0K1TWGKf2_Vpn1IRKWQRc"
        self.test_results = []

    def log_result(self, test_name, success, message):
        status = "✅ PASS" if success else "❌ FAIL"
        result = {"test": test_name, "status": status, "message": message}
        self.test_results.append(result)
        print(f"{status} - {test_name}: {message}")
        return success

    def test_supabase_direct_auth_flow(self):
        """Test the exact Supabase authentication flow that frontend would use"""
        print("\n🔑 Testing Supabase Direct Authentication Flow...")
        
        # Step 1: Create a test user via Supabase Auth API
        timestamp = datetime.now().strftime('%H%M%S%f')[:-3]
        test_email = f"frontendtest.{timestamp}@example.com"
        test_password = "FrontendTest123!"
        
        # Register user via Supabase Auth API (simulating frontend signup)
        signup_url = f"{self.supabase_url}/auth/v1/signup"
        signup_data = {
            "email": test_email,
            "password": test_password,
            "data": {
                "full_name": f"Frontend Test User {timestamp}"
            }
        }
        
        headers = {
            'apikey': self.supabase_anon_key,
            'Content-Type': 'application/json'
        }
        
        try:
            signup_response = requests.post(signup_url, json=signup_data, headers=headers, timeout=15)
            
            if signup_response.status_code in [200, 201]:
                signup_result = signup_response.json()
                user_id = signup_result.get('user', {}).get('id')
                access_token = signup_result.get('access_token')
                
                if access_token:
                    self.log_result("Supabase User Registration", True, f"User created with access token")
                    return self.test_cart_with_supabase_token(access_token, user_id, test_email)
                else:
                    self.log_result("Supabase User Registration", False, "No access token in signup response")
                    return False
            else:
                self.log_result("Supabase User Registration", False, f"Signup failed - Status: {signup_response.status_code}")
                return False
                
        except Exception as e:
            self.log_result("Supabase User Registration", False, f"Signup error: {str(e)}")
            return False

    def test_cart_with_supabase_token(self, access_token, user_id, email):
        """Test cart operations using Supabase access token (simulating frontend flow)"""
        print(f"\n🛒 Testing Cart Operations with Supabase Token for user: {email}")
        
        headers = {
            'Authorization': f'Bearer {access_token}',
            'Content-Type': 'application/json',
            'Origin': 'https://ritzone-frontend.onrender.com'
        }
        
        # Test both production and local backends
        backends = [
            ("Production", self.production_backend),
            ("Local", self.local_backend)
        ]
        
        for backend_name, backend_url in backends:
            print(f"\n📡 Testing {backend_name} Backend: {backend_url}")
            
            # Test 1: Get empty cart
            try:
                cart_response = requests.get(f"{backend_url}/cart", headers=headers, timeout=15)
                
                if cart_response.status_code == 200:
                    cart_data = cart_response.json()
                    if cart_data.get('success'):
                        items_count = len(cart_data.get('data', {}).get('cart_items', []))
                        self.log_result(f"Get Cart ({backend_name})", True, f"Cart retrieved - Items: {items_count}")
                    else:
                        self.log_result(f"Get Cart ({backend_name})", False, f"Cart API returned success=false: {cart_data.get('message')}")
                        continue
                else:
                    self.log_result(f"Get Cart ({backend_name})", False, f"Cart request failed - Status: {cart_response.status_code}")
                    continue
                    
            except Exception as e:
                self.log_result(f"Get Cart ({backend_name})", False, f"Cart request error: {str(e)}")
                continue
            
            # Test 2: Get a product to add to cart
            try:
                products_response = requests.get(f"{backend_url}/products/category/electronics?limit=1", timeout=15)
                
                if products_response.status_code == 200:
                    products_data = products_response.json()
                    if products_data.get('success') and products_data.get('data'):
                        product = products_data['data'][0]
                        product_id = product.get('id')
                        product_name = product.get('name', 'Unknown')
                        
                        self.log_result(f"Get Product ({backend_name})", True, f"Product retrieved: {product_name}")
                        
                        # Test 3: Add product to cart
                        add_to_cart_data = {
                            "productId": product_id,
                            "quantity": 1
                        }
                        
                        add_response = requests.post(f"{backend_url}/cart/add", json=add_to_cart_data, headers=headers, timeout=15)
                        
                        if add_response.status_code == 200:
                            add_result = add_response.json()
                            if add_result.get('success'):
                                self.log_result(f"Add to Cart ({backend_name})", True, f"Product added to cart successfully")
                                
                                # Test 4: Get cart with items (CRITICAL TEST)
                                cart_with_items_response = requests.get(f"{backend_url}/cart", headers=headers, timeout=15)
                                
                                if cart_with_items_response.status_code == 200:
                                    cart_with_items_data = cart_with_items_response.json()
                                    if cart_with_items_data.get('success'):
                                        items = cart_with_items_data.get('data', {}).get('cart_items', [])
                                        total = cart_with_items_data.get('data', {}).get('total_amount', 0)
                                        
                                        if len(items) > 0:
                                            self.log_result(f"Get Cart with Items ({backend_name})", True, f"✅ CART HAS ITEMS - Items: {len(items)}, Total: ${total}")
                                        else:
                                            self.log_result(f"Get Cart with Items ({backend_name})", False, f"❌ CART EMPTY AFTER ADDING ITEMS - This matches the user's reported issue!")
                                    else:
                                        self.log_result(f"Get Cart with Items ({backend_name})", False, f"Cart with items API returned success=false")
                                else:
                                    self.log_result(f"Get Cart with Items ({backend_name})", False, f"Cart with items request failed - Status: {cart_with_items_response.status_code}")
                            else:
                                self.log_result(f"Add to Cart ({backend_name})", False, f"Add to cart returned success=false: {add_result.get('message')}")
                        else:
                            self.log_result(f"Add to Cart ({backend_name})", False, f"Add to cart failed - Status: {add_response.status_code}")
                    else:
                        self.log_result(f"Get Product ({backend_name})", False, "No products available for testing")
                else:
                    self.log_result(f"Get Product ({backend_name})", False, f"Products request failed - Status: {products_response.status_code}")
                    
            except Exception as e:
                self.log_result(f"Product/Cart Flow ({backend_name})", False, f"Error: {str(e)}")

    def test_jwt_vs_supabase_token_comparison(self):
        """Compare JWT token vs Supabase token authentication"""
        print("\n🔄 Testing JWT vs Supabase Token Authentication Comparison...")
        
        # This would require creating a user via backend registration endpoint
        # and comparing the behavior with Supabase direct authentication
        
        timestamp = datetime.now().strftime('%H%M%S%f')[:-3]
        test_email = f"jwttest.{timestamp}@example.com"
        
        # Test backend registration (JWT flow)
        backend_reg_data = {
            "email": test_email,
            "password": "JWTTest123!",
            "fullName": f"JWT Test User {timestamp}",
            "phone": "+1234567890"
        }
        
        try:
            # Try production first, then local
            for backend_name, backend_url in [("Production", self.production_backend), ("Local", self.local_backend)]:
                reg_response = requests.post(f"{backend_url}/auth/register", json=backend_reg_data, timeout=15)
                
                if reg_response.status_code == 201:
                    # Login to get JWT token
                    login_data = {"email": test_email, "password": "JWTTest123!"}
                    login_response = requests.post(f"{backend_url}/auth/login", json=login_data, timeout=15)
                    
                    if login_response.status_code == 200:
                        login_result = login_response.json()
                        jwt_token = login_result.get('token')
                        
                        if jwt_token:
                            self.log_result(f"JWT Authentication ({backend_name})", True, "JWT token acquired via backend auth")
                            
                            # Test cart with JWT token
                            jwt_headers = {
                                'Authorization': f'Bearer {jwt_token}',
                                'Content-Type': 'application/json'
                            }
                            
                            cart_response = requests.get(f"{backend_url}/cart", headers=jwt_headers, timeout=15)
                            
                            if cart_response.status_code == 200:
                                self.log_result(f"JWT Cart Access ({backend_name})", True, "Cart accessible with JWT token")
                            else:
                                self.log_result(f"JWT Cart Access ({backend_name})", False, f"Cart not accessible with JWT - Status: {cart_response.status_code}")
                        else:
                            self.log_result(f"JWT Authentication ({backend_name})", False, "No JWT token in login response")
                    else:
                        self.log_result(f"JWT Authentication ({backend_name})", False, f"Login failed - Status: {login_response.status_code}")
                    break  # Success, no need to try local
                else:
                    if backend_name == "Local":  # Last attempt
                        self.log_result("JWT Authentication", False, f"Registration failed on both backends")
                        
        except Exception as e:
            self.log_result("JWT Authentication", False, f"JWT test error: {str(e)}")

    def run_frontend_auth_flow_tests(self):
        """Run comprehensive frontend authentication flow tests"""
        print("=" * 80)
        print("🔐 RitZone Frontend-Backend Authentication Flow Testing")
        print("🎯 Focus: Simulating exact frontend authentication patterns")
        print("=" * 80)
        print(f"📅 Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print("=" * 80)

        # Test Supabase direct authentication flow (what frontend likely uses)
        self.test_supabase_direct_auth_flow()
        
        # Test JWT authentication flow (backend registration)
        self.test_jwt_vs_supabase_token_comparison()

        # Print results
        print("\n" + "=" * 80)
        print("📊 FRONTEND AUTHENTICATION FLOW TEST RESULTS")
        print("=" * 80)
        
        for result in self.test_results:
            print(f"{result['status']} {result['test']}: {result['message']}")
        
        # Analysis
        cart_tests = [r for r in self.test_results if 'cart' in r['test'].lower()]
        failed_cart_tests = [r for r in cart_tests if r['status'] == '❌ FAIL']
        
        if failed_cart_tests:
            print("\n❌ POTENTIAL ISSUES IDENTIFIED:")
            for test in failed_cart_tests:
                print(f"   - {test['test']}: {test['message']}")
            
            print("\n💡 RECOMMENDATIONS:")
            print("   - Check if frontend is using the correct authentication token format")
            print("   - Verify frontend is sending requests to the correct backend URL")
            print("   - Check if there are any CORS issues in production")
            print("   - Verify frontend cart response parsing logic")
        else:
            print("\n✅ All authentication flows working correctly")
            print("💭 If users still report empty cart, the issue may be:")
            print("   - Frontend cart state management")
            print("   - Frontend API client configuration")
            print("   - Browser-specific issues (cookies, localStorage)")
            print("   - Caching issues in production")

def main():
    tester = FrontendAuthFlowTester()
    tester.run_frontend_auth_flow_tests()
    return 0

if __name__ == "__main__":
    sys.exit(main())
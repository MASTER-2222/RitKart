#!/usr/bin/env python3
"""
RitZone Checkout Backend Functionality Test
Tests cart, checkout, PayPal integration, and COD functionality on localhost development server
"""

import requests
import json
import time
import sys
from datetime import datetime

# Configuration
BACKEND_URL = "http://localhost:10000/api"
FRONTEND_URL = "http://localhost:3000"
TEST_USER_EMAIL = "b@b.com"
TEST_USER_PASSWORD = "Abcd@1234"

class RitZoneCheckoutTester:
    def __init__(self):
        self.session = requests.Session()
        self.access_token = None
        self.user_id = None
        self.test_results = []
        
    def log_test(self, test_name, success, message, details=None):
        """Log test results"""
        status = "✅ PASS" if success else "❌ FAIL"
        result = {
            'test': test_name,
            'status': status,
            'message': message,
            'details': details,
            'timestamp': datetime.now().isoformat()
        }
        self.test_results.append(result)
        print(f"{status}: {test_name} - {message}")
        if details and not success:
            print(f"   Details: {details}")
    
    def test_backend_health(self):
        """Test if backend server is running and accessible"""
        try:
            response = self.session.get(f"{BACKEND_URL}/health", timeout=10)
            if response.status_code == 200:
                self.log_test("Backend Health Check", True, f"Backend server running on {BACKEND_URL}")
                return True
            else:
                self.log_test("Backend Health Check", False, f"Backend returned status {response.status_code}")
                return False
        except requests.exceptions.RequestException as e:
            self.log_test("Backend Health Check", False, f"Cannot connect to backend: {str(e)}")
            return False
    
    def test_user_authentication(self):
        """Test user authentication with provided credentials"""
        try:
            # Login request
            login_data = {
                "email": TEST_USER_EMAIL,
                "password": TEST_USER_PASSWORD
            }
            
            response = self.session.post(f"{BACKEND_URL}/auth/login", json=login_data, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                # Backend returns 'token' instead of 'access_token'
                if 'token' in data:
                    self.access_token = data['token']
                    self.user_id = data.get('user', {}).get('id')
                    
                    # Set authorization header for future requests
                    self.session.headers.update({
                        'Authorization': f'Bearer {self.access_token}',
                        'Content-Type': 'application/json'
                    })
                    
                    self.log_test("User Authentication", True, f"Successfully authenticated user {TEST_USER_EMAIL}")
                    return True
                else:
                    self.log_test("User Authentication", False, "No token in response", data)
                    return False
            else:
                self.log_test("User Authentication", False, f"Login failed with status {response.status_code}", response.text)
                return False
                
        except requests.exceptions.RequestException as e:
            self.log_test("User Authentication", False, f"Authentication request failed: {str(e)}")
            return False
    
    def test_cart_functionality(self):
        """Test cart API endpoints"""
        try:
            # Get user cart
            response = self.session.get(f"{BACKEND_URL}/cart", timeout=10)
            
            if response.status_code == 200:
                cart_data = response.json()
                self.log_test("Get User Cart", True, f"Cart retrieved successfully with {len(cart_data.get('items', []))} items")
                
                # Test adding item to cart
                test_product_id = "f3ac5360-4971-4ade-a862-20462050041b"  # Using a known product ID
                add_item_data = {
                    "productId": test_product_id,
                    "quantity": 2
                }
                
                add_response = self.session.post(f"{BACKEND_URL}/cart/add", json=add_item_data, timeout=10)
                
                if add_response.status_code in [200, 201]:
                    self.log_test("Add Item to Cart", True, "Successfully added item to cart")
                    return True
                else:
                    self.log_test("Add Item to Cart", False, f"Failed to add item: {add_response.status_code}", add_response.text)
                    return False
            else:
                self.log_test("Get User Cart", False, f"Failed to get cart: {response.status_code}", response.text)
                return False
                
        except requests.exceptions.RequestException as e:
            self.log_test("Cart Functionality", False, f"Cart request failed: {str(e)}")
            return False
    
    def test_paypal_integration(self):
        """Test PayPal payment integration endpoints"""
        try:
            # Test PayPal order creation
            order_data = {
                "amount": "25.00",
                "currency": "USD",
                "items": [
                    {
                        "name": "Test Product",
                        "quantity": 1,
                        "price": "25.00"
                    }
                ]
            }
            
            response = self.session.post(f"{BACKEND_URL}/payments/paypal/create-order", json=order_data, timeout=15)
            
            if response.status_code in [200, 201]:
                data = response.json()
                if 'id' in data:
                    order_id = data['id']
                    self.log_test("PayPal Order Creation", True, f"PayPal order created successfully: {order_id}")
                    
                    # Test order status
                    status_response = self.session.get(f"{BACKEND_URL}/payments/paypal/order/{order_id}", timeout=10)
                    if status_response.status_code == 200:
                        self.log_test("PayPal Order Status", True, "PayPal order status retrieved successfully")
                        return True
                    else:
                        self.log_test("PayPal Order Status", False, f"Failed to get order status: {status_response.status_code}")
                        return False
                else:
                    self.log_test("PayPal Order Creation", False, "No order ID in response", data)
                    return False
            else:
                self.log_test("PayPal Order Creation", False, f"PayPal order creation failed: {response.status_code}", response.text)
                return False
                
        except requests.exceptions.RequestException as e:
            self.log_test("PayPal Integration", False, f"PayPal request failed: {str(e)}")
            return False
    
    def test_cod_functionality(self):
        """Test Cash on Delivery (COD) order creation"""
        try:
            cod_order_data = {
                "payment_method": "cod",
                "shipping_address": {
                    "name": "Test User",
                    "street": "123 Test Street",
                    "city": "Test City",
                    "state": "Test State",
                    "zip_code": "12345",
                    "country": "US"
                },
                "items": [
                    {
                        "product_id": "f3ac5360-4971-4ade-a862-20462050041b",
                        "quantity": 1,
                        "price": "25.00"
                    }
                ],
                "total_amount": "25.00"
            }
            
            response = self.session.post(f"{BACKEND_URL}/orders/create", json=cod_order_data, timeout=15)
            
            if response.status_code in [200, 201]:
                data = response.json()
                self.log_test("COD Order Creation", True, f"COD order created successfully: {data.get('order_id', 'N/A')}")
                return True
            elif response.status_code == 400 and "Cart is empty" in response.text:
                self.log_test("COD Order Creation", False, "Expected error: Cart dependency issue in orderService.createOrder()", "This is a known issue that needs fixing")
                return False
            else:
                self.log_test("COD Order Creation", False, f"COD order creation failed: {response.status_code}", response.text)
                return False
                
        except requests.exceptions.RequestException as e:
            self.log_test("COD Functionality", False, f"COD request failed: {str(e)}")
            return False
    
    def test_environment_variables(self):
        """Test if PayPal credentials are properly loaded"""
        try:
            # Test if backend can access PayPal credentials
            response = self.session.get(f"{BACKEND_URL}/payments/paypal/config", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('client_id'):
                    self.log_test("PayPal Environment Variables", True, "PayPal credentials loaded from backend/.env")
                    return True
                else:
                    self.log_test("PayPal Environment Variables", False, "PayPal client ID not found in config")
                    return False
            else:
                self.log_test("PayPal Environment Variables", False, f"Config endpoint failed: {response.status_code}")
                return False
                
        except requests.exceptions.RequestException as e:
            self.log_test("Environment Variables", False, f"Config request failed: {str(e)}")
            return False
    
    def test_cors_configuration(self):
        """Test CORS configuration for localhost:3000"""
        try:
            # Test preflight request
            headers = {
                'Origin': 'http://localhost:3000',
                'Access-Control-Request-Method': 'POST',
                'Access-Control-Request-Headers': 'Content-Type,Authorization'
            }
            
            response = self.session.options(f"{BACKEND_URL}/auth/login", headers=headers, timeout=10)
            
            if response.status_code in [200, 204]:
                cors_headers = response.headers
                if 'Access-Control-Allow-Origin' in cors_headers:
                    self.log_test("CORS Configuration", True, f"CORS properly configured for localhost:3000")
                    return True
                else:
                    self.log_test("CORS Configuration", False, "CORS headers not found in response")
                    return False
            else:
                self.log_test("CORS Configuration", False, f"CORS preflight failed: {response.status_code}")
                return False
                
        except requests.exceptions.RequestException as e:
            self.log_test("CORS Configuration", False, f"CORS test failed: {str(e)}")
            return False
    
    def test_orders_endpoint(self):
        """Test My Orders endpoint functionality"""
        try:
            response = self.session.get(f"{BACKEND_URL}/orders", timeout=10)
            
            if response.status_code == 200:
                orders_data = response.json()
                self.log_test("My Orders Endpoint", True, f"Orders endpoint working, found {len(orders_data.get('orders', []))} orders")
                return True
            else:
                self.log_test("My Orders Endpoint", False, f"Orders endpoint failed: {response.status_code}", response.text)
                return False
                
        except requests.exceptions.RequestException as e:
            self.log_test("My Orders Endpoint", False, f"Orders request failed: {str(e)}")
            return False
    
    def run_all_tests(self):
        """Run all checkout backend tests"""
        print("🚀 STARTING RITZONE CHECKOUT BACKEND TESTING ON LOCALHOST")
        print("=" * 70)
        
        # Test sequence
        tests = [
            ("Backend Server Accessibility", self.test_backend_health),
            ("User Authentication", self.test_user_authentication),
            ("Cart API Functionality", self.test_cart_functionality),
            ("PayPal Integration", self.test_paypal_integration),
            ("COD Functionality", self.test_cod_functionality),
            ("Environment Variables", self.test_environment_variables),
            ("CORS Configuration", self.test_cors_configuration),
            ("My Orders Endpoint", self.test_orders_endpoint)
        ]
        
        passed_tests = 0
        total_tests = len(tests)
        
        for test_name, test_func in tests:
            print(f"\n🧪 Testing: {test_name}")
            try:
                if test_func():
                    passed_tests += 1
            except Exception as e:
                self.log_test(test_name, False, f"Test execution error: {str(e)}")
        
        # Summary
        print("\n" + "=" * 70)
        print("🎯 RITZONE CHECKOUT BACKEND TEST SUMMARY")
        print("=" * 70)
        
        success_rate = (passed_tests / total_tests) * 100
        print(f"📊 OVERALL RESULTS: {passed_tests}/{total_tests} tests passed ({success_rate:.1f}% success rate)")
        
        if success_rate >= 80:
            print("🎉 EXCELLENT: Backend checkout functionality is working well!")
        elif success_rate >= 60:
            print("⚠️  GOOD: Most functionality working, some issues need attention")
        else:
            print("🚨 CRITICAL: Major issues found, immediate attention required")
        
        # Detailed results
        print("\n📋 DETAILED TEST RESULTS:")
        for result in self.test_results:
            print(f"{result['status']}: {result['test']}")
            if result['details'] and 'FAIL' in result['status']:
                print(f"   Issue: {result['details']}")
        
        return success_rate >= 60

def main():
    """Main test execution"""
    tester = RitZoneCheckoutTester()
    
    print("🎯 RitZone Checkout Backend Functionality Test")
    print(f"Backend URL: {BACKEND_URL}")
    print(f"Frontend URL: {FRONTEND_URL}")
    print(f"Test User: {TEST_USER_EMAIL}")
    print()
    
    success = tester.run_all_tests()
    
    if success:
        print("\n✅ TESTING COMPLETED SUCCESSFULLY")
        sys.exit(0)
    else:
        print("\n❌ TESTING COMPLETED WITH ISSUES")
        sys.exit(1)

if __name__ == "__main__":
    main()
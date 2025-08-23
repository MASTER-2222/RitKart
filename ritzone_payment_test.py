#!/usr/bin/env python3
"""
🎯 RITZONE PAYMENT INTEGRATION COMPREHENSIVE TESTING
Backend API Testing for PayPal and COD Payment Systems
Testing on localhost:10000/api (Node.js Express Backend)
"""

import requests
import json
import time
from datetime import datetime

# Test Configuration
BASE_URL = "http://localhost:10000/api"
TEST_USER_EMAIL = "b@b.com"
TEST_USER_PASSWORD = "Abcd@1234"

class RitZonePaymentTester:
    def __init__(self):
        self.session = requests.Session()
        self.access_token = None
        self.test_results = []
        
    def log_test(self, test_name, success, message, details=None):
        """Log test results"""
        result = {
            'test': test_name,
            'success': success,
            'message': message,
            'details': details,
            'timestamp': datetime.now().isoformat()
        }
        self.test_results.append(result)
        status = "✅" if success else "❌"
        print(f"{status} {test_name}: {message}")
        if details:
            print(f"   Details: {details}")
    
    def authenticate_user(self):
        """Authenticate user and get access token"""
        try:
            # Login to get Supabase token
            login_url = f"{BASE_URL}/auth/login"
            login_data = {
                "email": TEST_USER_EMAIL,
                "password": TEST_USER_PASSWORD
            }
            
            response = self.session.post(login_url, json=login_data)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success') and data.get('data', {}).get('session', {}).get('access_token'):
                    self.access_token = data['data']['session']['access_token']
                    self.session.headers.update({
                        'Authorization': f'Bearer {self.access_token}'
                    })
                    self.log_test("User Authentication", True, f"Successfully authenticated {TEST_USER_EMAIL}")
                    return True
                else:
                    self.log_test("User Authentication", False, "No access token in response", data)
                    return False
            else:
                self.log_test("User Authentication", False, f"Login failed with status {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_test("User Authentication", False, f"Authentication error: {str(e)}")
            return False
    
    def test_backend_connectivity(self):
        """Test backend server connectivity"""
        try:
            response = self.session.get(f"{BASE_URL}/health", timeout=10)
            if response.status_code == 200:
                self.log_test("Backend Connectivity", True, "Backend server is running and accessible")
                return True
            else:
                self.log_test("Backend Connectivity", False, f"Backend returned status {response.status_code}")
                return False
        except Exception as e:
            self.log_test("Backend Connectivity", False, f"Cannot connect to backend: {str(e)}")
            return False
    
    def test_paypal_credentials_loading(self):
        """Test PayPal credentials are loaded from environment variables"""
        try:
            # Test by attempting to create a PayPal order (will fail if credentials missing)
            test_order_data = {
                "amount": 10.00,
                "currency": "USD",
                "shippingAddress": {
                    "name": "Test User",
                    "street": "123 Test St",
                    "city": "Test City",
                    "state": "TS",
                    "zipCode": "12345",
                    "country": "US"
                },
                "billingAddress": {
                    "name": "Test User",
                    "street": "123 Test St",
                    "city": "Test City",
                    "state": "TS",
                    "zipCode": "12345",
                    "country": "US"
                }
            }
            
            response = self.session.post(f"{BASE_URL}/payments/paypal/create-order", json=test_order_data)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success') and data.get('data', {}).get('paypalOrderId'):
                    self.log_test("PayPal Credentials Loading", True, "PayPal credentials loaded successfully from environment")
                    return data['data']['paypalOrderId']
                else:
                    self.log_test("PayPal Credentials Loading", False, "PayPal order creation failed", data)
                    return None
            elif response.status_code == 401:
                self.log_test("PayPal Credentials Loading", False, "Authentication required for PayPal endpoints")
                return None
            else:
                error_text = response.text
                if "PayPal credentials not found" in error_text:
                    self.log_test("PayPal Credentials Loading", False, "PayPal credentials missing from environment variables")
                else:
                    self.log_test("PayPal Credentials Loading", False, f"PayPal API error: {error_text}")
                return None
                
        except Exception as e:
            self.log_test("PayPal Credentials Loading", False, f"Error testing PayPal credentials: {str(e)}")
            return None
    
    def test_paypal_create_order_api(self):
        """Test PayPal Create Order API functionality"""
        try:
            test_cases = [
                {
                    "name": "Valid PayPal Order Creation",
                    "data": {
                        "amount": 25.99,
                        "currency": "USD",
                        "items": [
                            {
                                "name": "Test Product",
                                "price": 25.99,
                                "quantity": 1
                            }
                        ],
                        "shippingAddress": {
                            "name": "John Doe",
                            "street": "123 Main St",
                            "city": "New York",
                            "state": "NY",
                            "zipCode": "10001",
                            "country": "US"
                        },
                        "billingAddress": {
                            "name": "John Doe",
                            "street": "123 Main St",
                            "city": "New York",
                            "state": "NY",
                            "zipCode": "10001",
                            "country": "US"
                        }
                    },
                    "expected_status": 200
                },
                {
                    "name": "Different Currency (EUR)",
                    "data": {
                        "amount": 20.50,
                        "currency": "EUR",
                        "shippingAddress": {
                            "name": "Jane Smith",
                            "street": "456 Oak Ave",
                            "city": "London",
                            "state": "LN",
                            "zipCode": "SW1A 1AA",
                            "country": "GB"
                        },
                        "billingAddress": {
                            "name": "Jane Smith",
                            "street": "456 Oak Ave",
                            "city": "London",
                            "state": "LN",
                            "zipCode": "SW1A 1AA",
                            "country": "GB"
                        }
                    },
                    "expected_status": 200
                },
                {
                    "name": "Missing Required Fields",
                    "data": {
                        "amount": 15.00
                        # Missing addresses
                    },
                    "expected_status": 400
                }
            ]
            
            paypal_order_ids = []
            
            for test_case in test_cases:
                response = self.session.post(f"{BASE_URL}/payments/paypal/create-order", json=test_case["data"])
                
                if response.status_code == test_case["expected_status"]:
                    if response.status_code == 200:
                        data = response.json()
                        if data.get('success') and data.get('data', {}).get('paypalOrderId'):
                            paypal_order_ids.append(data['data']['paypalOrderId'])
                            self.log_test(f"PayPal Create Order - {test_case['name']}", True, 
                                        f"Order created successfully: {data['data']['paypalOrderId']}")
                        else:
                            self.log_test(f"PayPal Create Order - {test_case['name']}", False, 
                                        "Invalid response structure", data)
                    else:
                        self.log_test(f"PayPal Create Order - {test_case['name']}", True, 
                                    f"Expected error response received: {response.status_code}")
                else:
                    self.log_test(f"PayPal Create Order - {test_case['name']}", False, 
                                f"Expected status {test_case['expected_status']}, got {response.status_code}", 
                                response.text)
            
            return paypal_order_ids
            
        except Exception as e:
            self.log_test("PayPal Create Order API", False, f"Error testing PayPal create order: {str(e)}")
            return []
    
    def test_paypal_order_status_api(self, paypal_order_ids):
        """Test PayPal Order Status API functionality"""
        try:
            if not paypal_order_ids:
                self.log_test("PayPal Order Status API", False, "No PayPal order IDs available for testing")
                return
            
            for order_id in paypal_order_ids:
                response = self.session.get(f"{BASE_URL}/payments/paypal/order/{order_id}")
                
                if response.status_code == 200:
                    data = response.json()
                    if data.get('success') and data.get('data'):
                        order_details = data['data']
                        self.log_test("PayPal Order Status API", True, 
                                    f"Order details retrieved successfully for {order_id}", 
                                    f"Status: {order_details.get('status', 'Unknown')}")
                    else:
                        self.log_test("PayPal Order Status API", False, 
                                    f"Invalid response for order {order_id}", data)
                else:
                    self.log_test("PayPal Order Status API", False, 
                                f"Failed to get order status for {order_id}: {response.status_code}", 
                                response.text)
                    
        except Exception as e:
            self.log_test("PayPal Order Status API", False, f"Error testing PayPal order status: {str(e)}")
    
    def test_cod_create_order_api(self):
        """Test COD Create Order API and identify cart integration issue"""
        try:
            test_cases = [
                {
                    "name": "Valid COD Order Creation",
                    "data": {
                        "shippingAddress": {
                            "name": "Test Customer",
                            "street": "789 Pine St",
                            "city": "Chicago",
                            "state": "IL",
                            "zipCode": "60601",
                            "country": "US"
                        },
                        "billingAddress": {
                            "name": "Test Customer",
                            "street": "789 Pine St",
                            "city": "Chicago",
                            "state": "IL",
                            "zipCode": "60601",
                            "country": "US"
                        },
                        "notes": "Test COD order",
                        "discountAmount": 0
                    },
                    "expected_issue": "Cart is empty or not found"
                },
                {
                    "name": "Missing Required Fields",
                    "data": {
                        "shippingAddress": {
                            "name": "Test Customer"
                            # Missing other fields
                        }
                    },
                    "expected_status": 400
                }
            ]
            
            for test_case in test_cases:
                response = self.session.post(f"{BASE_URL}/payments/cod/create-order", json=test_case["data"])
                
                if "expected_issue" in test_case:
                    # We expect this to fail with cart issue
                    if response.status_code == 400:
                        error_data = response.json()
                        error_message = error_data.get('message', '')
                        if test_case["expected_issue"] in error_message:
                            self.log_test(f"COD Create Order - {test_case['name']}", True, 
                                        f"Expected cart integration issue confirmed: {error_message}")
                        else:
                            self.log_test(f"COD Create Order - {test_case['name']}", False, 
                                        f"Different error than expected: {error_message}")
                    else:
                        self.log_test(f"COD Create Order - {test_case['name']}", False, 
                                    f"Expected 400 error, got {response.status_code}", response.text)
                else:
                    if response.status_code == test_case.get("expected_status", 201):
                        self.log_test(f"COD Create Order - {test_case['name']}", True, 
                                    f"Expected response received: {response.status_code}")
                    else:
                        self.log_test(f"COD Create Order - {test_case['name']}", False, 
                                    f"Unexpected status: {response.status_code}", response.text)
                        
        except Exception as e:
            self.log_test("COD Create Order API", False, f"Error testing COD create order: {str(e)}")
    
    def test_orders_endpoint(self):
        """Test Orders endpoint for My Orders integration"""
        try:
            response = self.session.get(f"{BASE_URL}/orders")
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success'):
                    orders = data.get('data', {}).get('orders', [])
                    self.log_test("Orders Endpoint", True, 
                                f"Orders endpoint working - found {len(orders)} orders")
                else:
                    self.log_test("Orders Endpoint", False, "Invalid response structure", data)
            else:
                self.log_test("Orders Endpoint", False, 
                            f"Orders endpoint failed: {response.status_code}", response.text)
                
        except Exception as e:
            self.log_test("Orders Endpoint", False, f"Error testing orders endpoint: {str(e)}")
    
    def test_authentication_protection(self):
        """Test authentication protection on payment endpoints"""
        try:
            # Remove auth header temporarily
            original_headers = self.session.headers.copy()
            if 'Authorization' in self.session.headers:
                del self.session.headers['Authorization']
            
            endpoints_to_test = [
                ("/payments/paypal/create-order", "POST"),
                ("/payments/paypal/capture-order", "POST"),
                ("/payments/cod/create-order", "POST"),
                ("/orders", "GET")
            ]
            
            for endpoint, method in endpoints_to_test:
                if method == "POST":
                    response = self.session.post(f"{BASE_URL}{endpoint}", json={})
                else:
                    response = self.session.get(f"{BASE_URL}{endpoint}")
                
                if response.status_code == 401:
                    self.log_test(f"Auth Protection - {endpoint}", True, 
                                "Endpoint properly protected - returns 401 without auth")
                else:
                    self.log_test(f"Auth Protection - {endpoint}", False, 
                                f"Expected 401, got {response.status_code}")
            
            # Restore auth headers
            self.session.headers.update(original_headers)
            
            # Test with invalid token
            self.session.headers['Authorization'] = 'Bearer invalid_token_12345'
            
            response = self.session.post(f"{BASE_URL}/payments/paypal/create-order", json={})
            if response.status_code in [401, 403]:
                self.log_test("Auth Protection - Invalid Token", True, 
                            f"Invalid token properly rejected: {response.status_code}")
            else:
                self.log_test("Auth Protection - Invalid Token", False, 
                            f"Invalid token not rejected: {response.status_code}")
            
            # Restore valid auth
            self.session.headers.update(original_headers)
            
        except Exception as e:
            self.log_test("Authentication Protection", False, f"Error testing auth protection: {str(e)}")
    
    def test_error_handling(self):
        """Test error handling for invalid requests"""
        try:
            test_cases = [
                {
                    "endpoint": "/payments/paypal/create-order",
                    "method": "POST",
                    "data": {"invalid": "data"},
                    "name": "Invalid PayPal Order Data"
                },
                {
                    "endpoint": "/payments/paypal/order/invalid_order_id",
                    "method": "GET",
                    "data": None,
                    "name": "Invalid PayPal Order ID"
                },
                {
                    "endpoint": "/payments/cod/create-order",
                    "method": "POST",
                    "data": {},
                    "name": "Empty COD Order Data"
                }
            ]
            
            for test_case in test_cases:
                if test_case["method"] == "POST":
                    response = self.session.post(f"{BASE_URL}{test_case['endpoint']}", 
                                               json=test_case["data"])
                else:
                    response = self.session.get(f"{BASE_URL}{test_case['endpoint']}")
                
                if response.status_code >= 400:
                    try:
                        error_data = response.json()
                        if error_data.get('success') == False and error_data.get('message'):
                            self.log_test(f"Error Handling - {test_case['name']}", True, 
                                        f"Proper error response: {error_data['message']}")
                        else:
                            self.log_test(f"Error Handling - {test_case['name']}", False, 
                                        "Error response missing proper structure")
                    except:
                        self.log_test(f"Error Handling - {test_case['name']}", False, 
                                    "Error response not valid JSON")
                else:
                    self.log_test(f"Error Handling - {test_case['name']}", False, 
                                f"Expected error status, got {response.status_code}")
                    
        except Exception as e:
            self.log_test("Error Handling", False, f"Error testing error handling: {str(e)}")
    
    def run_comprehensive_test(self):
        """Run all payment integration tests"""
        print("🎯 RITZONE PAYMENT INTEGRATION COMPREHENSIVE TESTING")
        print("=" * 60)
        print(f"Testing Backend: {BASE_URL}")
        print(f"Test User: {TEST_USER_EMAIL}")
        print("=" * 60)
        
        # Test 1: Backend Connectivity
        if not self.test_backend_connectivity():
            print("❌ Backend not accessible. Stopping tests.")
            return
        
        # Test 2: User Authentication
        if not self.authenticate_user():
            print("❌ Authentication failed. Stopping tests.")
            return
        
        # Test 3: PayPal Credentials Loading
        self.test_paypal_credentials_loading()
        
        # Test 4: PayPal Create Order API
        paypal_order_ids = self.test_paypal_create_order_api()
        
        # Test 5: PayPal Order Status API
        self.test_paypal_order_status_api(paypal_order_ids)
        
        # Test 6: COD Create Order API (Expected to fail with cart issue)
        self.test_cod_create_order_api()
        
        # Test 7: Orders Endpoint
        self.test_orders_endpoint()
        
        # Test 8: Authentication Protection
        self.test_authentication_protection()
        
        # Test 9: Error Handling
        self.test_error_handling()
        
        # Summary
        self.print_summary()
    
    def print_summary(self):
        """Print test summary"""
        print("\n" + "=" * 60)
        print("🎯 PAYMENT INTEGRATION TEST SUMMARY")
        print("=" * 60)
        
        total_tests = len(self.test_results)
        passed_tests = len([r for r in self.test_results if r['success']])
        failed_tests = total_tests - passed_tests
        
        print(f"Total Tests: {total_tests}")
        print(f"Passed: {passed_tests} ✅")
        print(f"Failed: {failed_tests} ❌")
        print(f"Success Rate: {(passed_tests/total_tests)*100:.1f}%")
        
        if failed_tests > 0:
            print("\n❌ FAILED TESTS:")
            for result in self.test_results:
                if not result['success']:
                    print(f"  • {result['test']}: {result['message']}")
        
        print("\n🎯 KEY FINDINGS:")
        
        # Check PayPal functionality
        paypal_tests = [r for r in self.test_results if 'PayPal' in r['test']]
        paypal_passed = len([r for r in paypal_tests if r['success']])
        if paypal_tests:
            print(f"  • PayPal Integration: {paypal_passed}/{len(paypal_tests)} tests passed")
        
        # Check COD functionality
        cod_tests = [r for r in self.test_results if 'COD' in r['test']]
        cod_passed = len([r for r in cod_tests if r['success']])
        if cod_tests:
            print(f"  • COD Integration: {cod_passed}/{len(cod_tests)} tests passed")
        
        # Check authentication
        auth_tests = [r for r in self.test_results if 'Auth' in r['test']]
        auth_passed = len([r for r in auth_tests if r['success']])
        if auth_tests:
            print(f"  • Authentication: {auth_passed}/{len(auth_tests)} tests passed")

if __name__ == "__main__":
    tester = RitZonePaymentTester()
    tester.run_comprehensive_test()
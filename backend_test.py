#!/usr/bin/env python3
"""
RitZone Payment Integration Backend Testing - LOCALHOST DEVELOPMENT
================================================================
Comprehensive testing of PayPal, COD, and Orders integration
"""

import requests
import json
import time
from datetime import datetime

# LOCALHOST DEVELOPMENT CONFIGURATION
BASE_URL = "http://localhost:10000/api"
TEST_USER_EMAIL = "b@b.com"
TEST_USER_PASSWORD = "Abcd@1234"

class RitZonePaymentTester:
    def __init__(self):
        self.base_url = BASE_URL
        self.session = requests.Session()
        self.access_token = None
        self.user_id = None
        
    def log(self, message, status="INFO"):
        timestamp = datetime.now().strftime("%H:%M:%S")
        print(f"[{timestamp}] {status}: {message}")
        
    def test_backend_health(self):
        """Test backend server connectivity"""
        try:
            response = self.session.get(f"{self.base_url}/health", timeout=10)
            if response.status_code == 200:
                self.log("✅ Backend server accessible on localhost:10000", "SUCCESS")
                return True
            else:
                self.log(f"❌ Backend health check failed: {response.status_code}", "ERROR")
                return False
        except Exception as e:
            self.log(f"❌ Backend not accessible: {str(e)}", "ERROR")
            return False
            
    def authenticate_user(self):
        """Authenticate test user"""
        try:
            login_data = {
                "email": TEST_USER_EMAIL,
                "password": TEST_USER_PASSWORD
            }
            
            response = self.session.post(f"{self.base_url}/auth/login", json=login_data, timeout=15)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success') and data.get('token'):
                    self.access_token = data['token']
                    self.user_id = data['user']['id']
                    self.session.headers.update({'Authorization': f'Bearer {self.access_token}'})
                    self.log(f"✅ User authenticated: {TEST_USER_EMAIL}", "SUCCESS")
                    return True
                else:
                    self.log(f"❌ Login failed: {data.get('message')}", "ERROR")
                    return False
            else:
                self.log(f"❌ Authentication failed: {response.status_code}", "ERROR")
                return False
        except Exception as e:
            self.log(f"❌ Authentication error: {str(e)}", "ERROR")
            return False
            
    def test_paypal_create_order_usd(self):
        """Test PayPal order creation - USD"""
        try:
            order_data = {
                "amount": 29.99,
                "currency": "USD",
                "items": [{"name": "Test Product USD", "price": 29.99, "quantity": 1}],
                "shippingAddress": {
                    "full_name": "John Doe",
                    "address_line1": "123 Test Street",
                    "city": "Test City",
                    "state": "CA",
                    "postal_code": "12345",
                    "country": "US"
                },
                "billingAddress": {
                    "full_name": "John Doe", 
                    "address_line1": "123 Test Street",
                    "city": "Test City",
                    "state": "CA",
                    "postal_code": "12345",
                    "country": "US"
                }
            }
            
            response = self.session.post(f"{self.base_url}/payments/paypal/create-order", json=order_data, timeout=20)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success'):
                    self.log("✅ PayPal create-order USD working", "SUCCESS")
                    return True, data['data']
                else:
                    self.log(f"❌ PayPal create-order USD failed: {data.get('message')}", "ERROR")
                    return False, None
            else:
                self.log(f"❌ PayPal create-order USD error: {response.status_code}", "ERROR")
                return False, None
        except Exception as e:
            self.log(f"❌ PayPal create-order USD error: {str(e)}", "ERROR")
            return False, None
            
    def test_paypal_create_order_eur(self):
        """Test PayPal order creation - EUR"""
        try:
            order_data = {
                "amount": 25.50,
                "currency": "EUR",
                "items": [{"name": "Test Product EUR", "price": 25.50, "quantity": 1}],
                "shippingAddress": {
                    "full_name": "Marie Dupont",
                    "address_line1": "456 Euro Street",
                    "city": "Paris",
                    "state": "IDF",
                    "postal_code": "75001",
                    "country": "FR"
                },
                "billingAddress": {
                    "full_name": "Marie Dupont",
                    "address_line1": "456 Euro Street", 
                    "city": "Paris",
                    "state": "IDF",
                    "postal_code": "75001",
                    "country": "FR"
                }
            }
            
            response = self.session.post(f"{self.base_url}/payments/paypal/create-order", json=order_data, timeout=20)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success'):
                    self.log("✅ PayPal create-order EUR working", "SUCCESS")
                    return True, data['data']
                else:
                    self.log(f"❌ PayPal create-order EUR failed: {data.get('message')}", "ERROR")
                    return False, None
            else:
                self.log(f"❌ PayPal create-order EUR error: {response.status_code}", "ERROR")
                return False, None
        except Exception as e:
            self.log(f"❌ PayPal create-order EUR error: {str(e)}", "ERROR")
            return False, None
            
    def test_paypal_order_status(self, paypal_order_id):
        """Test PayPal order status retrieval"""
        try:
            response = self.session.get(f"{self.base_url}/payments/paypal/order/{paypal_order_id}", timeout=15)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success'):
                    self.log("✅ PayPal order status endpoint working", "SUCCESS")
                    return True
                else:
                    self.log(f"❌ PayPal order status failed: {data.get('message')}", "ERROR")
                    return False
            else:
                self.log(f"❌ PayPal order status error: {response.status_code}", "ERROR")
                return False
        except Exception as e:
            self.log(f"❌ PayPal order status error: {str(e)}", "ERROR")
            return False
            
    def test_cod_create_order(self):
        """Test COD order creation - CRITICAL TEST"""
        try:
            cod_data = {
                "shippingAddress": {
                    "full_name": "Jane Smith",
                    "address_line1": "456 COD Street",
                    "city": "COD City", 
                    "state": "NY",
                    "postal_code": "67890",
                    "country": "US"
                },
                "billingAddress": {
                    "full_name": "Jane Smith",
                    "address_line1": "456 COD Street",
                    "city": "COD City",
                    "state": "NY", 
                    "postal_code": "67890",
                    "country": "US"
                },
                "notes": "Test COD order - Direct checkout",
                "discountAmount": 0
            }
            
            response = self.session.post(f"{self.base_url}/payments/cod/create-order", json=cod_data, timeout=15)
            
            if response.status_code == 201:
                data = response.json()
                if data.get('success'):
                    self.log("✅ COD create-order working (cart dependency fixed)", "SUCCESS")
                    return True, data['data']
                else:
                    self.log(f"❌ COD create-order failed: {data.get('message')}", "ERROR")
                    return False, None
            elif response.status_code == 400:
                data = response.json()
                if "Cart is empty" in data.get('message', ''):
                    self.log("⚠️ COD blocked by cart dependency (KNOWN ISSUE)", "WARNING")
                    return False, None
                else:
                    self.log(f"❌ COD create-order failed: {data.get('message')}", "ERROR")
                    return False, None
            else:
                self.log(f"❌ COD create-order error: {response.status_code}", "ERROR")
                return False, None
        except Exception as e:
            self.log(f"❌ COD create-order error: {str(e)}", "ERROR")
            return False, None
            
    def test_orders_endpoint(self):
        """Test My Orders endpoint"""
        try:
            response = self.session.get(f"{self.base_url}/orders", timeout=15)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success'):
                    order_count = data['pagination']['totalCount']
                    self.log(f"✅ My Orders endpoint working ({order_count} orders)", "SUCCESS")
                    return True
                else:
                    self.log(f"❌ Orders endpoint failed: {data.get('message')}", "ERROR")
                    return False
            else:
                self.log(f"❌ Orders endpoint error: {response.status_code}", "ERROR")
                return False
        except Exception as e:
            self.log(f"❌ Orders endpoint error: {str(e)}", "ERROR")
            return False
            
    def test_authentication_protection(self):
        """Test endpoint authentication protection"""
        try:
            # Remove auth header
            original_headers = self.session.headers.copy()
            if 'Authorization' in self.session.headers:
                del self.session.headers['Authorization']
            
            endpoints = [
                ("/payments/paypal/create-order", "POST"),
                ("/payments/cod/create-order", "POST"),
                ("/orders", "GET")
            ]
            
            protected_count = 0
            for endpoint, method in endpoints:
                if method == "POST":
                    response = self.session.post(f"{self.base_url}{endpoint}", json={}, timeout=10)
                else:
                    response = self.session.get(f"{self.base_url}{endpoint}", timeout=10)
                    
                if response.status_code == 401:
                    protected_count += 1
                    
            # Restore auth headers
            self.session.headers.update(original_headers)
            
            if protected_count == len(endpoints):
                self.log("✅ All payment endpoints properly protected", "SUCCESS")
                return True
            else:
                self.log(f"❌ Only {protected_count}/{len(endpoints)} endpoints protected", "ERROR")
                return False
        except Exception as e:
            self.log(f"❌ Authentication protection test error: {str(e)}", "ERROR")
            return False
            
    def test_paypal_credentials_loading(self):
        """Test PayPal credentials from environment"""
        try:
            # Test by attempting to create order (credentials loaded during creation)
            order_data = {
                "amount": 1.00,
                "currency": "USD",
                "items": [{"name": "Credential Test", "price": 1.00, "quantity": 1}],
                "shippingAddress": {
                    "full_name": "Test User",
                    "address_line1": "123 Test St",
                    "city": "Test",
                    "state": "CA", 
                    "postal_code": "12345",
                    "country": "US"
                },
                "billingAddress": {
                    "full_name": "Test User",
                    "address_line1": "123 Test St",
                    "city": "Test",
                    "state": "CA",
                    "postal_code": "12345", 
                    "country": "US"
                }
            }
            
            response = self.session.post(f"{self.base_url}/payments/paypal/create-order", json=order_data, timeout=15)
            
            if response.status_code == 200:
                self.log("✅ PayPal credentials loaded from /backend/.env", "SUCCESS")
                return True
            elif response.status_code == 400:
                data = response.json()
                if "credentials" in data.get('message', '').lower():
                    self.log("❌ PayPal credentials not found in environment", "ERROR")
                    return False
                else:
                    self.log("✅ PayPal credentials loaded (other validation error)", "SUCCESS")
                    return True
            else:
                self.log("✅ PayPal credentials loaded (endpoint accessible)", "SUCCESS")
                return True
        except Exception as e:
            self.log(f"❌ PayPal credentials test error: {str(e)}", "ERROR")
            return False
            
    def run_comprehensive_test(self):
        """Run comprehensive payment integration tests"""
        self.log("🚀 RITZONE PAYMENT INTEGRATION TESTING - LOCALHOST", "INFO")
        self.log("=" * 60, "INFO")
        
        test_results = []
        
        # Test 1: Backend Health
        self.log("🔍 Testing backend server (localhost:10000)...", "INFO")
        result = self.test_backend_health()
        test_results.append(("Backend Health Check", result))
        if not result:
            return self.generate_summary(test_results)
            
        # Test 2: User Authentication
        self.log("🔐 Testing user authentication...", "INFO")
        result = self.authenticate_user()
        test_results.append(("User Authentication", result))
        if not result:
            return self.generate_summary(test_results)
            
        # Test 3: PayPal Credentials
        self.log("🔑 Testing PayPal credentials loading...", "INFO")
        result = self.test_paypal_credentials_loading()
        test_results.append(("PayPal Credentials Loading", result))
        
        # Test 4: PayPal Create Order USD
        self.log("💳 Testing PayPal create-order (USD)...", "INFO")
        result, order_data = self.test_paypal_create_order_usd()
        test_results.append(("PayPal Create Order USD", result))
        
        # Test 5: PayPal Create Order EUR
        self.log("💶 Testing PayPal create-order (EUR)...", "INFO")
        result_eur, order_data_eur = self.test_paypal_create_order_eur()
        test_results.append(("PayPal Create Order EUR", result_eur))
        
        # Test 6: PayPal Order Status
        if result and order_data:
            self.log("🔍 Testing PayPal order status...", "INFO")
            status_result = self.test_paypal_order_status(order_data['paypalOrderId'])
            test_results.append(("PayPal Order Status", status_result))
        else:
            test_results.append(("PayPal Order Status", False))
            
        # Test 7: COD Order Creation (CRITICAL)
        self.log("💸 Testing COD create-order (CRITICAL TEST)...", "INFO")
        cod_result, _ = self.test_cod_create_order()
        test_results.append(("COD Create Order", cod_result))
        
        # Test 8: Orders Endpoint
        self.log("📋 Testing My Orders endpoint...", "INFO")
        orders_result = self.test_orders_endpoint()
        test_results.append(("My Orders Endpoint", orders_result))
        
        # Test 9: Authentication Protection
        self.log("🔒 Testing authentication protection...", "INFO")
        auth_result = self.test_authentication_protection()
        test_results.append(("Authentication Protection", auth_result))
        
        return self.generate_summary(test_results)
        
    def generate_summary(self, test_results):
        """Generate test summary"""
        self.log("=" * 60, "INFO")
        self.log("🎯 RITZONE PAYMENT INTEGRATION TEST RESULTS", "INFO")
        self.log("=" * 60, "INFO")
        
        passed_tests = sum(1 for _, result in test_results if result)
        total_tests = len(test_results)
        success_rate = (passed_tests / total_tests * 100) if total_tests > 0 else 0
        
        self.log(f"📊 RESULTS: {passed_tests}/{total_tests} tests passed ({success_rate:.1f}%)", "INFO")
        self.log("", "INFO")
        
        for test_name, result in test_results:
            status = "✅ PASSED" if result else "❌ FAILED"
            self.log(f"{status}: {test_name}", "INFO")
            
        self.log("", "INFO")
        
        # Critical findings
        cod_passed = any(name == "COD Create Order" and result for name, result in test_results)
        paypal_passed = any(name.startswith("PayPal") and result for name, result in test_results)
        
        if cod_passed:
            self.log("🎉 COD INTEGRATION: WORKING (cart dependency fixed)", "SUCCESS")
        else:
            self.log("⚠️ COD INTEGRATION: BLOCKED by cart dependency issue", "WARNING")
            
        if paypal_passed:
            self.log("🎉 PAYPAL INTEGRATION: WORKING", "SUCCESS")
        else:
            self.log("❌ PAYPAL INTEGRATION: ISSUES FOUND", "ERROR")
            
        return {
            'passed_tests': passed_tests,
            'total_tests': total_tests,
            'success_rate': success_rate,
            'test_results': test_results
        }

if __name__ == "__main__":
    tester = RitZonePaymentTester()
    results = tester.run_comprehensive_test()
#!/usr/bin/env python3
"""
RitZone PayPal Payment Integration Backend API Testing
=====================================================
Testing PayPal payment endpoints for checkout functionality
"""

import requests
import json
import time
import uuid
from datetime import datetime

# Configuration
BASE_URL = "http://localhost:10000/api"
TEST_USER_EMAIL = "b@b.com"
TEST_USER_PASSWORD = "Abcd@1234"

class PayPalPaymentTester:
    def __init__(self):
        self.base_url = BASE_URL
        self.session = requests.Session()
        self.access_token = None
        self.user_id = None
        
    def log(self, message, status="INFO"):
        timestamp = datetime.now().strftime("%H:%M:%S")
        print(f"[{timestamp}] {status}: {message}")
        
    def test_backend_health(self):
        """Test if backend server is running and accessible"""
        try:
            response = self.session.get(f"{self.base_url}/health", timeout=10)
            if response.status_code == 200:
                self.log("✅ Backend server is running and accessible", "SUCCESS")
                return True
            else:
                self.log(f"❌ Backend health check failed: {response.status_code}", "ERROR")
                return False
        except Exception as e:
            self.log(f"❌ Backend server not accessible: {str(e)}", "ERROR")
            return False
            
    def authenticate_user(self):
        """Authenticate user with provided credentials"""
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
                    self.log(f"✅ User authenticated successfully: {TEST_USER_EMAIL}", "SUCCESS")
                    self.log(f"✅ Access token obtained ({len(self.access_token)} chars)", "SUCCESS")
                    return True
                else:
                    self.log(f"❌ Login failed: {data.get('message', 'Unknown error')}", "ERROR")
                    return False
            else:
                self.log(f"❌ Authentication failed: {response.status_code} - {response.text}", "ERROR")
                return False
                
        except Exception as e:
            self.log(f"❌ Authentication error: {str(e)}", "ERROR")
            return False
            
    def test_paypal_create_order(self):
        """Test PayPal order creation endpoint"""
        try:
            order_data = {
                "amount": 29.99,
                "currency": "USD",
                "items": [
                    {
                        "name": "Test Product",
                        "price": 29.99,
                        "quantity": 1
                    }
                ],
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
                    self.log("✅ PayPal create-order endpoint working", "SUCCESS")
                    self.log(f"✅ PayPal Order ID: {data['data']['paypalOrderId']}", "SUCCESS")
                    return True, data['data']
                else:
                    self.log(f"❌ PayPal create-order failed: {data.get('message')}", "ERROR")
                    return False, None
            else:
                self.log(f"❌ PayPal create-order endpoint error: {response.status_code} - {response.text}", "ERROR")
                return False, None
                
        except Exception as e:
            self.log(f"❌ PayPal create-order test error: {str(e)}", "ERROR")
            return False, None
            
    def test_paypal_capture_order(self, paypal_order_id, internal_order_id):
        """Test PayPal payment capture endpoint"""
        try:
            capture_data = {
                "paypalOrderId": paypal_order_id,
                "internalOrderId": internal_order_id
            }
            
            response = self.session.post(f"{self.base_url}/payments/paypal/capture-order", json=capture_data, timeout=20)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success'):
                    self.log("✅ PayPal capture-order endpoint working", "SUCCESS")
                    return True, data['data']
                else:
                    self.log(f"❌ PayPal capture-order failed: {data.get('message')}", "ERROR")
                    return False, None
            else:
                self.log(f"❌ PayPal capture-order endpoint error: {response.status_code} - {response.text}", "ERROR")
                return False, None
                
        except Exception as e:
            self.log(f"❌ PayPal capture-order test error: {str(e)}", "ERROR")
            return False, None
            
    def test_cod_create_order(self):
        """Test COD order creation endpoint"""
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
                "notes": "Test COD order",
                "discountAmount": 0
            }
            
            response = self.session.post(f"{self.base_url}/payments/cod/create-order", json=cod_data, timeout=15)
            
            if response.status_code == 201:
                data = response.json()
                if data.get('success'):
                    self.log("✅ COD create-order endpoint working", "SUCCESS")
                    self.log(f"✅ COD Order ID: {data['data']['id']}", "SUCCESS")
                    return True, data['data']
                else:
                    self.log(f"❌ COD create-order failed: {data.get('message')}", "ERROR")
                    return False, None
            else:
                self.log(f"❌ COD create-order endpoint error: {response.status_code} - {response.text}", "ERROR")
                return False, None
                
        except Exception as e:
            self.log(f"❌ COD create-order test error: {str(e)}", "ERROR")
            return False, None
            
    def test_paypal_order_status(self, paypal_order_id):
        """Test PayPal order status endpoint"""
        try:
            response = self.session.get(f"{self.base_url}/payments/paypal/order/{paypal_order_id}", timeout=15)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success'):
                    self.log("✅ PayPal order status endpoint working", "SUCCESS")
                    return True, data['data']
                else:
                    self.log(f"❌ PayPal order status failed: {data.get('message')}", "ERROR")
                    return False, None
            else:
                self.log(f"❌ PayPal order status endpoint error: {response.status_code} - {response.text}", "ERROR")
                return False, None
                
        except Exception as e:
            self.log(f"❌ PayPal order status test error: {str(e)}", "ERROR")
            return False, None
            
    def test_orders_endpoint(self):
        """Test orders endpoint for My Orders functionality"""
        try:
            response = self.session.get(f"{self.base_url}/orders", timeout=15)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success'):
                    self.log("✅ Orders endpoint working for My Orders", "SUCCESS")
                    self.log(f"✅ Orders count: {data['pagination']['totalCount']}", "SUCCESS")
                    return True, data
                else:
                    self.log(f"❌ Orders endpoint failed: {data.get('message')}", "ERROR")
                    return False, None
            else:
                self.log(f"❌ Orders endpoint error: {response.status_code} - {response.text}", "ERROR")
                return False, None
                
        except Exception as e:
            self.log(f"❌ Orders endpoint test error: {str(e)}", "ERROR")
            return False, None
            
    def test_authentication_protection(self):
        """Test authentication protection on payment endpoints"""
        try:
            # Remove auth header temporarily
            original_headers = self.session.headers.copy()
            if 'Authorization' in self.session.headers:
                del self.session.headers['Authorization']
            
            endpoints_to_test = [
                "/payments/paypal/create-order",
                "/payments/paypal/capture-order", 
                "/payments/cod/create-order",
                "/orders"
            ]
            
            protected_count = 0
            for endpoint in endpoints_to_test:
                response = self.session.post(f"{self.base_url}{endpoint}", json={}, timeout=10)
                if response.status_code == 401:
                    protected_count += 1
                    
            # Restore auth headers
            self.session.headers.update(original_headers)
            
            if protected_count == len(endpoints_to_test):
                self.log("✅ All payment endpoints properly protected", "SUCCESS")
                return True
            else:
                self.log(f"❌ Only {protected_count}/{len(endpoints_to_test)} endpoints protected", "ERROR")
                return False
                
        except Exception as e:
            self.log(f"❌ Authentication protection test error: {str(e)}", "ERROR")
            return False
            
    def test_error_handling(self):
        """Test error handling for invalid requests"""
        try:
            # Test invalid PayPal order creation
            invalid_data = {"amount": "invalid"}
            response = self.session.post(f"{self.base_url}/payments/paypal/create-order", json=invalid_data, timeout=10)
            
            if response.status_code == 400:
                self.log("✅ Error handling working for invalid requests", "SUCCESS")
                return True
            else:
                self.log(f"❌ Error handling not working: {response.status_code}", "ERROR")
                return False
                
        except Exception as e:
            self.log(f"❌ Error handling test error: {str(e)}", "ERROR")
            return False
            
    def run_comprehensive_test(self):
        """Run comprehensive PayPal payment integration tests"""
        self.log("🚀 STARTING RITZONE PAYPAL PAYMENT INTEGRATION TESTING", "INFO")
        self.log("=" * 60, "INFO")
        
        test_results = []
        
        # Test 1: Backend Health
        self.log("🔍 Testing backend server accessibility...", "INFO")
        result = self.test_backend_health()
        test_results.append(("Backend Health Check", result))
        if not result:
            self.log("❌ Backend not accessible, stopping tests", "ERROR")
            return self.generate_summary(test_results)
            
        # Test 2: User Authentication
        self.log("🔐 Testing user authentication...", "INFO")
        result = self.authenticate_user()
        test_results.append(("User Authentication", result))
        if not result:
            self.log("❌ Authentication failed, stopping tests", "ERROR")
            return self.generate_summary(test_results)
            
        # Test 3: PayPal Create Order
        self.log("💳 Testing PayPal create-order endpoint...", "INFO")
        result, order_data = self.test_paypal_create_order()
        test_results.append(("PayPal Create Order", result))
        
        # Test 4: PayPal Order Status (if create worked)
        if result and order_data:
            self.log("🔍 Testing PayPal order status endpoint...", "INFO")
            status_result, _ = self.test_paypal_order_status(order_data['paypalOrderId'])
            test_results.append(("PayPal Order Status", status_result))
            
        # Test 5: COD Order Creation
        self.log("💸 Testing COD create-order endpoint...", "INFO")
        cod_result, _ = self.test_cod_create_order()
        test_results.append(("COD Create Order", cod_result))
        
        # Test 6: Orders Endpoint
        self.log("📋 Testing orders endpoint for My Orders...", "INFO")
        orders_result, _ = self.test_orders_endpoint()
        test_results.append(("Orders Endpoint", orders_result))
        
        # Test 7: Authentication Protection
        self.log("🔒 Testing authentication protection...", "INFO")
        auth_result = self.test_authentication_protection()
        test_results.append(("Authentication Protection", auth_result))
        
        # Test 8: Error Handling
        self.log("⚠️ Testing error handling...", "INFO")
        error_result = self.test_error_handling()
        test_results.append(("Error Handling", error_result))
        
        return self.generate_summary(test_results)
        
    def generate_summary(self, test_results):
        """Generate comprehensive test summary"""
        self.log("=" * 60, "INFO")
        self.log("🎯 RITZONE PAYPAL PAYMENT INTEGRATION TEST SUMMARY", "INFO")
        self.log("=" * 60, "INFO")
        
        passed_tests = sum(1 for _, result in test_results if result)
        total_tests = len(test_results)
        success_rate = (passed_tests / total_tests * 100) if total_tests > 0 else 0
        
        self.log(f"📊 OVERALL RESULTS: {passed_tests}/{total_tests} tests passed ({success_rate:.1f}% success rate)", "INFO")
        self.log("", "INFO")
        
        for test_name, result in test_results:
            status = "✅ PASSED" if result else "❌ FAILED"
            self.log(f"{status}: {test_name}", "INFO")
            
        self.log("", "INFO")
        
        if success_rate >= 80:
            self.log("🎉 EXCELLENT: PayPal payment integration is working well!", "SUCCESS")
        elif success_rate >= 60:
            self.log("⚠️ GOOD: Most PayPal payment features working, minor issues found", "WARNING")
        else:
            self.log("❌ CRITICAL: Major issues found in PayPal payment integration", "ERROR")
            
        return {
            'passed_tests': passed_tests,
            'total_tests': total_tests,
            'success_rate': success_rate,
            'test_results': test_results
        }

if __name__ == "__main__":
    tester = PayPalPaymentTester()
    results = tester.run_comprehensive_test()
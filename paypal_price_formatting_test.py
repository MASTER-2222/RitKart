#!/usr/bin/env python3
"""
RitZone PayPal Price Formatting Fix Testing
==========================================
Testing PayPal price formatting with various price formats
"""

import requests
import json
import time
from datetime import datetime

# Configuration
BASE_URL = "http://localhost:10000/api"
TEST_USER_EMAIL = "b@b.com"
TEST_USER_PASSWORD = "Abcd@1234"

class PayPalPriceFormattingTester:
    def __init__(self):
        self.base_url = BASE_URL
        self.session = requests.Session()
        self.access_token = None
        
    def log(self, message, status="INFO"):
        timestamp = datetime.now().strftime("%H:%M:%S")
        print(f"[{timestamp}] {status}: {message}")
        
    def authenticate_user(self):
        """Authenticate user"""
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
            
    def test_paypal_price_formats(self):
        """Test PayPal order creation with various price formats"""
        test_cases = [
            {
                "name": "String Prices",
                "items": [
                    {"name": "Product 1", "price": "29.99", "quantity": 1},
                    {"name": "Product 2", "price": "15.50", "quantity": 2}
                ],
                "amount": "60.99"
            },
            {
                "name": "Number Prices", 
                "items": [
                    {"name": "Product 1", "price": 29.99, "quantity": 1},
                    {"name": "Product 2", "price": 15.50, "quantity": 2}
                ],
                "amount": 60.99
            },
            {
                "name": "Integer Prices",
                "items": [
                    {"name": "Product 1", "price": 30, "quantity": 1},
                    {"name": "Product 2", "price": 15, "quantity": 2}
                ],
                "amount": 60
            },
            {
                "name": "Mixed Price Formats",
                "items": [
                    {"name": "Product 1", "price": "29.99", "quantity": 1},
                    {"name": "Product 2", "price": 15.50, "quantity": 2},
                    {"name": "Product 3", "price": 10, "quantity": 1}
                ],
                "amount": "70.99"
            }
        ]
        
        results = []
        
        for test_case in test_cases:
            self.log(f"🧪 Testing {test_case['name']}...", "INFO")
            
            order_data = {
                "amount": test_case["amount"],
                "currency": "USD",
                "items": test_case["items"],
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
            
            try:
                response = self.session.post(f"{self.base_url}/payments/paypal/create-order", json=order_data, timeout=20)
                
                if response.status_code == 200:
                    data = response.json()
                    if data.get('success'):
                        self.log(f"✅ {test_case['name']} - SUCCESS", "SUCCESS")
                        results.append((test_case['name'], True, "Order created successfully"))
                    else:
                        self.log(f"❌ {test_case['name']} - FAILED: {data.get('message')}", "ERROR")
                        results.append((test_case['name'], False, data.get('message')))
                else:
                    error_msg = response.text
                    self.log(f"❌ {test_case['name']} - ERROR: {response.status_code} - {error_msg}", "ERROR")
                    results.append((test_case['name'], False, f"HTTP {response.status_code}: {error_msg}"))
                    
            except Exception as e:
                self.log(f"❌ {test_case['name']} - EXCEPTION: {str(e)}", "ERROR")
                results.append((test_case['name'], False, str(e)))
                
        return results
        
    def test_currency_support(self):
        """Test different currency support"""
        currencies = ["USD", "EUR"]
        results = []
        
        for currency in currencies:
            self.log(f"💱 Testing {currency} currency...", "INFO")
            
            order_data = {
                "amount": 25.99,
                "currency": currency,
                "items": [
                    {"name": "Test Product", "price": "25.99", "quantity": 1}
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
            
            try:
                response = self.session.post(f"{self.base_url}/payments/paypal/create-order", json=order_data, timeout=20)
                
                if response.status_code == 200:
                    data = response.json()
                    if data.get('success'):
                        self.log(f"✅ {currency} currency - SUCCESS", "SUCCESS")
                        results.append((f"{currency} Currency", True, "Order created successfully"))
                    else:
                        self.log(f"❌ {currency} currency - FAILED: {data.get('message')}", "ERROR")
                        results.append((f"{currency} Currency", False, data.get('message')))
                else:
                    self.log(f"❌ {currency} currency - ERROR: {response.status_code}", "ERROR")
                    results.append((f"{currency} Currency", False, f"HTTP {response.status_code}"))
                    
            except Exception as e:
                self.log(f"❌ {currency} currency - EXCEPTION: {str(e)}", "ERROR")
                results.append((f"{currency} Currency", False, str(e)))
                
        return results
        
    def test_paypal_endpoints(self):
        """Test all PayPal endpoints"""
        results = []
        
        # Test order creation first
        self.log("🔍 Testing PayPal order creation...", "INFO")
        order_data = {
            "amount": 29.99,
            "currency": "USD",
            "items": [{"name": "Test Product", "price": "29.99", "quantity": 1}],
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
        
        try:
            response = self.session.post(f"{self.base_url}/payments/paypal/create-order", json=order_data, timeout=20)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success'):
                    self.log("✅ PayPal create-order endpoint working", "SUCCESS")
                    results.append(("PayPal Create Order", True, "Success"))
                    
                    # Test order status
                    paypal_order_id = data['data']['paypalOrderId']
                    self.log("🔍 Testing PayPal order status...", "INFO")
                    
                    status_response = self.session.get(f"{self.base_url}/payments/paypal/order/{paypal_order_id}", timeout=15)
                    if status_response.status_code == 200:
                        self.log("✅ PayPal order status endpoint working", "SUCCESS")
                        results.append(("PayPal Order Status", True, "Success"))
                    else:
                        self.log("❌ PayPal order status failed", "ERROR")
                        results.append(("PayPal Order Status", False, f"HTTP {status_response.status_code}"))
                        
                else:
                    self.log(f"❌ PayPal create-order failed: {data.get('message')}", "ERROR")
                    results.append(("PayPal Create Order", False, data.get('message')))
            else:
                self.log(f"❌ PayPal create-order error: {response.status_code}", "ERROR")
                results.append(("PayPal Create Order", False, f"HTTP {response.status_code}"))
                
        except Exception as e:
            self.log(f"❌ PayPal endpoint test error: {str(e)}", "ERROR")
            results.append(("PayPal Create Order", False, str(e)))
            
        return results
        
    def run_comprehensive_test(self):
        """Run comprehensive PayPal price formatting tests"""
        self.log("🚀 STARTING PAYPAL PRICE FORMATTING FIX TESTING", "INFO")
        self.log("=" * 60, "INFO")
        
        all_results = []
        
        # Test 1: Backend Health
        self.log("🔍 Testing backend server...", "INFO")
        try:
            response = self.session.get(f"{self.base_url}/health", timeout=10)
            if response.status_code == 200:
                self.log("✅ Backend server accessible", "SUCCESS")
                all_results.append(("Backend Health", True, "Success"))
            else:
                self.log("❌ Backend server not accessible", "ERROR")
                all_results.append(("Backend Health", False, f"HTTP {response.status_code}"))
                return self.generate_summary(all_results)
        except Exception as e:
            self.log(f"❌ Backend not accessible: {str(e)}", "ERROR")
            all_results.append(("Backend Health", False, str(e)))
            return self.generate_summary(all_results)
            
        # Test 2: Authentication
        self.log("🔐 Testing authentication...", "INFO")
        auth_result = self.authenticate_user()
        all_results.append(("User Authentication", auth_result, "Success" if auth_result else "Failed"))
        if not auth_result:
            return self.generate_summary(all_results)
            
        # Test 3: Price Format Testing
        self.log("💰 Testing various price formats...", "INFO")
        price_results = self.test_paypal_price_formats()
        all_results.extend([(name, success, msg) for name, success, msg in price_results])
        
        # Test 4: Currency Support
        self.log("💱 Testing currency support...", "INFO")
        currency_results = self.test_currency_support()
        all_results.extend([(name, success, msg) for name, success, msg in currency_results])
        
        # Test 5: PayPal Endpoints
        self.log("🔗 Testing PayPal endpoints...", "INFO")
        endpoint_results = self.test_paypal_endpoints()
        all_results.extend([(name, success, msg) for name, success, msg in endpoint_results])
        
        return self.generate_summary(all_results)
        
    def generate_summary(self, test_results):
        """Generate test summary"""
        self.log("=" * 60, "INFO")
        self.log("🎯 PAYPAL PRICE FORMATTING FIX TEST SUMMARY", "INFO")
        self.log("=" * 60, "INFO")
        
        passed_tests = sum(1 for _, result, _ in test_results if result)
        total_tests = len(test_results)
        success_rate = (passed_tests / total_tests * 100) if total_tests > 0 else 0
        
        self.log(f"📊 RESULTS: {passed_tests}/{total_tests} tests passed ({success_rate:.1f}% success rate)", "INFO")
        self.log("", "INFO")
        
        for test_name, result, message in test_results:
            status = "✅ PASSED" if result else "❌ FAILED"
            self.log(f"{status}: {test_name} - {message}", "INFO")
            
        self.log("", "INFO")
        
        if success_rate >= 90:
            self.log("🎉 EXCELLENT: PayPal price formatting fix working perfectly!", "SUCCESS")
        elif success_rate >= 70:
            self.log("⚠️ GOOD: Most price formatting tests passed", "WARNING")
        else:
            self.log("❌ CRITICAL: Price formatting issues found", "ERROR")
            
        return {
            'passed_tests': passed_tests,
            'total_tests': total_tests,
            'success_rate': success_rate,
            'test_results': test_results
        }

if __name__ == "__main__":
    tester = PayPalPriceFormattingTester()
    results = tester.run_comprehensive_test()
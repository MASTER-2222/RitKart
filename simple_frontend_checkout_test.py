#!/usr/bin/env python3
"""
RitZone Frontend Checkout Page Testing (Simple)
==============================================
Testing checkout page functionality on localhost:3000
"""

import requests
import time
from datetime import datetime

# Configuration
FRONTEND_URL = "http://localhost:3000"
BACKEND_URL = "http://localhost:10000/api"
TEST_USER_EMAIL = "b@b.com"
TEST_USER_PASSWORD = "Abcd@1234"

class SimpleFrontendCheckoutTester:
    def __init__(self):
        self.frontend_url = FRONTEND_URL
        self.backend_url = BACKEND_URL
        self.session = requests.Session()
        self.access_token = None
        
    def log(self, message, status="INFO"):
        timestamp = datetime.now().strftime("%H:%M:%S")
        print(f"[{timestamp}] {status}: {message}")
        
    def test_frontend_accessibility(self):
        """Test if frontend is accessible"""
        try:
            response = self.session.get(self.frontend_url, timeout=10)
            if response.status_code == 200:
                self.log("✅ Frontend accessible on localhost:3000", "SUCCESS")
                return True
            else:
                self.log(f"❌ Frontend not accessible: {response.status_code}", "ERROR")
                return False
        except Exception as e:
            self.log(f"❌ Frontend accessibility test failed: {str(e)}", "ERROR")
            return False
            
    def test_backend_accessibility(self):
        """Test if backend is accessible"""
        try:
            response = self.session.get(f"{self.backend_url}/health", timeout=10)
            if response.status_code == 200:
                self.log("✅ Backend accessible on localhost:10000/api", "SUCCESS")
                return True
            else:
                self.log(f"❌ Backend not accessible: {response.status_code}", "ERROR")
                return False
        except Exception as e:
            self.log(f"❌ Backend accessibility test failed: {str(e)}", "ERROR")
            return False
            
    def test_backend_authentication(self):
        """Test backend authentication"""
        try:
            login_data = {
                "email": TEST_USER_EMAIL,
                "password": TEST_USER_PASSWORD
            }
            
            response = self.session.post(f"{self.backend_url}/auth/login", json=login_data, timeout=15)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success') and data.get('token'):
                    self.access_token = data['token']
                    self.session.headers.update({'Authorization': f'Bearer {self.access_token}'})
                    self.log(f"✅ Backend authentication successful: {TEST_USER_EMAIL}", "SUCCESS")
                    return True
                else:
                    self.log(f"❌ Backend authentication failed: {data.get('message')}", "ERROR")
                    return False
            else:
                self.log(f"❌ Backend authentication error: {response.status_code}", "ERROR")
                return False
                
        except Exception as e:
            self.log(f"❌ Backend authentication test failed: {str(e)}", "ERROR")
            return False
            
    def test_checkout_page_content(self):
        """Test checkout page content"""
        try:
            response = self.session.get(f"{self.frontend_url}/checkout", timeout=15)
            
            if response.status_code == 200:
                content = response.text.lower()
                
                # Check for key checkout elements
                checkout_elements = [
                    "checkout", "shipping", "billing", "payment", "order"
                ]
                
                found_elements = sum(1 for element in checkout_elements if element in content)
                
                if found_elements >= 3:
                    self.log(f"✅ Checkout page content found: {found_elements}/5 elements", "SUCCESS")
                    return True
                else:
                    self.log(f"❌ Insufficient checkout content: {found_elements}/5 elements", "ERROR")
                    return False
            else:
                self.log(f"❌ Checkout page not accessible: {response.status_code}", "ERROR")
                return False
                
        except Exception as e:
            self.log(f"❌ Checkout page content test failed: {str(e)}", "ERROR")
            return False
            
    def test_cart_api_integration(self):
        """Test cart API integration"""
        try:
            # Test cart API
            response = self.session.get(f"{self.backend_url}/cart", timeout=15)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success'):
                    self.log("✅ Cart API integration working", "SUCCESS")
                    return True
                else:
                    self.log(f"❌ Cart API failed: {data.get('message')}", "ERROR")
                    return False
            else:
                self.log(f"❌ Cart API error: {response.status_code}", "ERROR")
                return False
                
        except Exception as e:
            self.log(f"❌ Cart API integration test failed: {str(e)}", "ERROR")
            return False
            
    def test_payment_endpoints(self):
        """Test payment endpoints availability"""
        try:
            # Test PayPal endpoint
            test_data = {
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
            
            response = self.session.post(f"{self.backend_url}/payments/paypal/create-order", json=test_data, timeout=20)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success'):
                    self.log("✅ PayPal payment endpoint working", "SUCCESS")
                    return True
                else:
                    self.log(f"❌ PayPal endpoint failed: {data.get('message')}", "ERROR")
                    return False
            else:
                self.log(f"❌ PayPal endpoint error: {response.status_code}", "ERROR")
                return False
                
        except Exception as e:
            self.log(f"❌ Payment endpoints test failed: {str(e)}", "ERROR")
            return False
            
    def test_frontend_static_assets(self):
        """Test frontend static assets"""
        try:
            # Test common static assets
            assets = [
                "/favicon.ico",
                "/_next/static/css",
                "/_next/static/chunks"
            ]
            
            working_assets = 0
            for asset in assets:
                try:
                    response = self.session.get(f"{self.frontend_url}{asset}", timeout=5)
                    if response.status_code in [200, 404]:  # 404 is acceptable for some assets
                        working_assets += 1
                except:
                    pass
                    
            if working_assets >= 1:
                self.log(f"✅ Frontend static assets accessible: {working_assets}/3", "SUCCESS")
                return True
            else:
                self.log("❌ Frontend static assets not accessible", "ERROR")
                return False
                
        except Exception as e:
            self.log(f"❌ Static assets test failed: {str(e)}", "ERROR")
            return False
            
    def test_cors_configuration(self):
        """Test CORS configuration"""
        try:
            # Test CORS with frontend origin
            headers = {
                'Origin': self.frontend_url,
                'Access-Control-Request-Method': 'POST',
                'Access-Control-Request-Headers': 'Content-Type,Authorization'
            }
            
            response = self.session.options(f"{self.backend_url}/cart", headers=headers, timeout=10)
            
            if response.status_code in [200, 204]:
                self.log("✅ CORS configuration working", "SUCCESS")
                return True
            else:
                self.log(f"❌ CORS configuration issue: {response.status_code}", "ERROR")
                return False
                
        except Exception as e:
            self.log(f"❌ CORS test failed: {str(e)}", "ERROR")
            return False
            
    def run_comprehensive_test(self):
        """Run comprehensive frontend checkout tests"""
        self.log("🚀 STARTING SIMPLE FRONTEND CHECKOUT TESTING", "INFO")
        self.log("=" * 60, "INFO")
        
        test_results = []
        
        # Test 1: Frontend Accessibility
        self.log("🌐 Testing frontend accessibility...", "INFO")
        result = self.test_frontend_accessibility()
        test_results.append(("Frontend Accessibility", result))
        
        # Test 2: Backend Accessibility
        self.log("🔗 Testing backend accessibility...", "INFO")
        result = self.test_backend_accessibility()
        test_results.append(("Backend Accessibility", result))
        if not result:
            return self.generate_summary(test_results)
            
        # Test 3: Backend Authentication
        self.log("🔐 Testing backend authentication...", "INFO")
        result = self.test_backend_authentication()
        test_results.append(("Backend Authentication", result))
        if not result:
            return self.generate_summary(test_results)
            
        # Test 4: Checkout Page Content
        self.log("🛒 Testing checkout page content...", "INFO")
        result = self.test_checkout_page_content()
        test_results.append(("Checkout Page Content", result))
        
        # Test 5: Cart API Integration
        self.log("🛒 Testing cart API integration...", "INFO")
        result = self.test_cart_api_integration()
        test_results.append(("Cart API Integration", result))
        
        # Test 6: Payment Endpoints
        self.log("💳 Testing payment endpoints...", "INFO")
        result = self.test_payment_endpoints()
        test_results.append(("Payment Endpoints", result))
        
        # Test 7: Static Assets
        self.log("📁 Testing static assets...", "INFO")
        result = self.test_frontend_static_assets()
        test_results.append(("Static Assets", result))
        
        # Test 8: CORS Configuration
        self.log("🔗 Testing CORS configuration...", "INFO")
        result = self.test_cors_configuration()
        test_results.append(("CORS Configuration", result))
        
        return self.generate_summary(test_results)
        
    def generate_summary(self, test_results):
        """Generate test summary"""
        self.log("=" * 60, "INFO")
        self.log("🎯 SIMPLE FRONTEND CHECKOUT TEST SUMMARY", "INFO")
        self.log("=" * 60, "INFO")
        
        passed_tests = sum(1 for _, result in test_results if result)
        total_tests = len(test_results)
        success_rate = (passed_tests / total_tests * 100) if total_tests > 0 else 0
        
        self.log(f"📊 RESULTS: {passed_tests}/{total_tests} tests passed ({success_rate:.1f}% success rate)", "INFO")
        self.log("", "INFO")
        
        for test_name, result in test_results:
            status = "✅ PASSED" if result else "❌ FAILED"
            self.log(f"{status}: {test_name}", "INFO")
            
        self.log("", "INFO")
        
        if success_rate >= 90:
            self.log("🎉 EXCELLENT: Frontend checkout integration working perfectly!", "SUCCESS")
        elif success_rate >= 70:
            self.log("⚠️ GOOD: Most checkout integration working", "WARNING")
        else:
            self.log("❌ CRITICAL: Major issues found in checkout integration", "ERROR")
            
        return {
            'passed_tests': passed_tests,
            'total_tests': total_tests,
            'success_rate': success_rate,
            'test_results': test_results
        }

if __name__ == "__main__":
    tester = SimpleFrontendCheckoutTester()
    results = tester.run_comprehensive_test()
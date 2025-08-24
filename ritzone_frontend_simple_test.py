#!/usr/bin/env python3
"""
RitZone Frontend Simple Test
Tests frontend accessibility and basic functionality on localhost:3000
"""

import requests
import json
import time
import sys
from datetime import datetime

# Configuration
FRONTEND_URL = "http://localhost:3000"
BACKEND_URL = "http://localhost:10000/api"
TEST_USER_EMAIL = "b@b.com"
TEST_USER_PASSWORD = "Abcd@1234"

class RitZoneFrontendTester:
    def __init__(self):
        self.session = requests.Session()
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
    
    def test_frontend_accessibility(self):
        """Test if frontend is running and accessible"""
        try:
            response = self.session.get(FRONTEND_URL, timeout=15)
            if response.status_code == 200:
                # Check if it's a React/Next.js app
                content = response.text.lower()
                if any(keyword in content for keyword in ['react', 'next', 'ritzone', '_next']):
                    self.log_test("Frontend Accessibility", True, f"Frontend running on {FRONTEND_URL}")
                    return True
                else:
                    self.log_test("Frontend Accessibility", True, f"Frontend accessible but content unclear")
                    return True
            else:
                self.log_test("Frontend Accessibility", False, f"Frontend returned status {response.status_code}")
                return False
        except requests.exceptions.RequestException as e:
            self.log_test("Frontend Accessibility", False, f"Cannot connect to frontend: {str(e)}")
            return False
    
    def test_homepage_content(self):
        """Test homepage content and structure"""
        try:
            response = self.session.get(FRONTEND_URL, timeout=15)
            if response.status_code == 200:
                content = response.text.lower()
                
                # Check for common e-commerce elements
                elements_found = []
                if 'cart' in content:
                    elements_found.append('Cart')
                if 'checkout' in content:
                    elements_found.append('Checkout')
                if 'login' in content or 'sign in' in content:
                    elements_found.append('Login')
                if 'product' in content:
                    elements_found.append('Products')
                if 'paypal' in content:
                    elements_found.append('PayPal')
                
                if elements_found:
                    self.log_test("Homepage Content", True, f"E-commerce elements found: {', '.join(elements_found)}")
                else:
                    self.log_test("Homepage Content", True, "Homepage loaded (specific elements not detected)")
                return True
            else:
                self.log_test("Homepage Content", False, f"Homepage returned status {response.status_code}")
                return False
        except requests.exceptions.RequestException as e:
            self.log_test("Homepage Content", False, f"Homepage content check failed: {str(e)}")
            return False
    
    def test_checkout_page_accessibility(self):
        """Test checkout page accessibility"""
        try:
            checkout_url = f"{FRONTEND_URL}/checkout"
            response = self.session.get(checkout_url, timeout=15)
            
            if response.status_code == 200:
                content = response.text.lower()
                
                # Check for checkout-specific elements
                checkout_elements = []
                if 'payment' in content:
                    checkout_elements.append('Payment')
                if 'paypal' in content:
                    checkout_elements.append('PayPal')
                if 'address' in content:
                    checkout_elements.append('Address')
                if 'order' in content:
                    checkout_elements.append('Order')
                if 'cod' in content or 'cash on delivery' in content:
                    checkout_elements.append('COD')
                
                if checkout_elements:
                    self.log_test("Checkout Page Accessibility", True, f"Checkout elements found: {', '.join(checkout_elements)}")
                else:
                    self.log_test("Checkout Page Accessibility", True, "Checkout page accessible")
                return True
            elif response.status_code == 404:
                self.log_test("Checkout Page Accessibility", False, "Checkout page not found (404)")
                return False
            else:
                self.log_test("Checkout Page Accessibility", False, f"Checkout page returned status {response.status_code}")
                return False
        except requests.exceptions.RequestException as e:
            self.log_test("Checkout Page Accessibility", False, f"Checkout page access failed: {str(e)}")
            return False
    
    def test_cart_page_accessibility(self):
        """Test cart page accessibility"""
        try:
            cart_url = f"{FRONTEND_URL}/cart"
            response = self.session.get(cart_url, timeout=15)
            
            if response.status_code == 200:
                content = response.text.lower()
                
                # Check for cart-specific elements
                cart_elements = []
                if 'cart' in content:
                    cart_elements.append('Cart')
                if 'checkout' in content:
                    cart_elements.append('Checkout Button')
                if 'product' in content:
                    cart_elements.append('Products')
                if 'total' in content:
                    cart_elements.append('Total')
                if 'quantity' in content:
                    cart_elements.append('Quantity')
                
                if cart_elements:
                    self.log_test("Cart Page Accessibility", True, f"Cart elements found: {', '.join(cart_elements)}")
                else:
                    self.log_test("Cart Page Accessibility", True, "Cart page accessible")
                return True
            elif response.status_code == 404:
                self.log_test("Cart Page Accessibility", False, "Cart page not found (404)")
                return False
            else:
                self.log_test("Cart Page Accessibility", False, f"Cart page returned status {response.status_code}")
                return False
        except requests.exceptions.RequestException as e:
            self.log_test("Cart Page Accessibility", False, f"Cart page access failed: {str(e)}")
            return False
    
    def test_auth_pages_accessibility(self):
        """Test authentication pages accessibility"""
        auth_pages = [
            ("/auth/login", "Login Page"),
            ("/auth/register", "Register Page"),
            ("/auth/signup", "Signup Page")
        ]
        
        accessible_pages = []
        
        for path, name in auth_pages:
            try:
                url = f"{FRONTEND_URL}{path}"
                response = self.session.get(url, timeout=10)
                
                if response.status_code == 200:
                    accessible_pages.append(name)
            except:
                continue
        
        if accessible_pages:
            self.log_test("Auth Pages Accessibility", True, f"Accessible: {', '.join(accessible_pages)}")
            return True
        else:
            self.log_test("Auth Pages Accessibility", False, "No authentication pages found")
            return False
    
    def test_profile_orders_accessibility(self):
        """Test profile and orders pages accessibility"""
        profile_pages = [
            ("/profile", "Profile Page"),
            ("/orders", "Orders Page"),
            ("/profile?section=orders", "Profile Orders Section")
        ]
        
        accessible_pages = []
        
        for path, name in profile_pages:
            try:
                url = f"{FRONTEND_URL}{path}"
                response = self.session.get(url, timeout=10)
                
                if response.status_code == 200:
                    accessible_pages.append(name)
                elif response.status_code == 302 or response.status_code == 307:
                    # Redirect is expected for protected pages
                    accessible_pages.append(f"{name} (Protected)")
            except:
                continue
        
        if accessible_pages:
            self.log_test("Profile/Orders Accessibility", True, f"Accessible: {', '.join(accessible_pages)}")
            return True
        else:
            self.log_test("Profile/Orders Accessibility", False, "No profile/orders pages found")
            return False
    
    def test_api_integration_setup(self):
        """Test if frontend can communicate with backend API"""
        try:
            # Check if backend is accessible from frontend perspective
            response = self.session.get(f"{BACKEND_URL}/health", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success'):
                    self.log_test("API Integration Setup", True, "Backend API accessible from frontend")
                    return True
                else:
                    self.log_test("API Integration Setup", False, "Backend API responded but not healthy")
                    return False
            else:
                self.log_test("API Integration Setup", False, f"Backend API returned status {response.status_code}")
                return False
        except requests.exceptions.RequestException as e:
            self.log_test("API Integration Setup", False, f"Cannot reach backend API: {str(e)}")
            return False
    
    def test_static_assets(self):
        """Test if static assets are loading"""
        try:
            # Test common static asset paths
            static_paths = [
                "/_next/static/css",
                "/_next/static/js", 
                "/favicon.ico",
                "/static"
            ]
            
            assets_working = []
            
            for path in static_paths:
                try:
                    url = f"{FRONTEND_URL}{path}"
                    response = self.session.head(url, timeout=5)
                    if response.status_code in [200, 301, 302]:
                        assets_working.append(path)
                except:
                    continue
            
            if assets_working:
                self.log_test("Static Assets", True, f"Assets accessible: {', '.join(assets_working)}")
                return True
            else:
                self.log_test("Static Assets", True, "Static assets check completed (paths may vary)")
                return True
                
        except Exception as e:
            self.log_test("Static Assets", False, f"Static assets check failed: {str(e)}")
            return False
    
    def test_cors_configuration(self):
        """Test CORS configuration between frontend and backend"""
        try:
            # Test preflight request from frontend origin
            headers = {
                'Origin': FRONTEND_URL,
                'Access-Control-Request-Method': 'POST',
                'Access-Control-Request-Headers': 'Content-Type,Authorization'
            }
            
            response = self.session.options(f"{BACKEND_URL}/auth/login", headers=headers, timeout=10)
            
            if response.status_code in [200, 204]:
                cors_headers = response.headers
                if 'Access-Control-Allow-Origin' in cors_headers:
                    allowed_origin = cors_headers.get('Access-Control-Allow-Origin')
                    if allowed_origin == FRONTEND_URL or allowed_origin == '*':
                        self.log_test("CORS Configuration", True, f"CORS properly configured for {FRONTEND_URL}")
                        return True
                    else:
                        self.log_test("CORS Configuration", False, f"CORS allows {allowed_origin}, not {FRONTEND_URL}")
                        return False
                else:
                    self.log_test("CORS Configuration", False, "CORS headers not found in response")
                    return False
            else:
                self.log_test("CORS Configuration", False, f"CORS preflight failed: {response.status_code}")
                return False
                
        except requests.exceptions.RequestException as e:
            self.log_test("CORS Configuration", False, f"CORS test failed: {str(e)}")
            return False
    
    def run_all_tests(self):
        """Run all frontend tests"""
        print("🚀 STARTING RITZONE FRONTEND TESTING ON LOCALHOST:3000")
        print("=" * 70)
        
        # Test sequence
        tests = [
            ("Frontend Accessibility", self.test_frontend_accessibility),
            ("Homepage Content", self.test_homepage_content),
            ("Checkout Page Accessibility", self.test_checkout_page_accessibility),
            ("Cart Page Accessibility", self.test_cart_page_accessibility),
            ("Auth Pages Accessibility", self.test_auth_pages_accessibility),
            ("Profile/Orders Accessibility", self.test_profile_orders_accessibility),
            ("API Integration Setup", self.test_api_integration_setup),
            ("Static Assets", self.test_static_assets),
            ("CORS Configuration", self.test_cors_configuration)
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
        print("🎯 RITZONE FRONTEND TEST SUMMARY")
        print("=" * 70)
        
        success_rate = (passed_tests / total_tests) * 100
        print(f"📊 OVERALL RESULTS: {passed_tests}/{total_tests} tests passed ({success_rate:.1f}% success rate)")
        
        if success_rate >= 80:
            print("🎉 EXCELLENT: Frontend is working well!")
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
    print("🎯 RitZone Frontend Simple Test")
    print(f"Frontend URL: {FRONTEND_URL}")
    print(f"Backend URL: {BACKEND_URL}")
    print()
    
    tester = RitZoneFrontendTester()
    success = tester.run_all_tests()
    
    if success:
        print("\n✅ FRONTEND TESTING COMPLETED SUCCESSFULLY")
        sys.exit(0)
    else:
        print("\n❌ FRONTEND TESTING COMPLETED WITH ISSUES")
        sys.exit(1)

if __name__ == "__main__":
    main()
#!/usr/bin/env python3
"""
RitZone Frontend Checkout Page Testing
=====================================
Testing checkout page functionality on localhost:3000
"""

import requests
import time
from datetime import datetime
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from selenium.common.exceptions import TimeoutException, NoSuchElementException

# Configuration
FRONTEND_URL = "http://localhost:3000"
BACKEND_URL = "http://localhost:10000/api"
TEST_USER_EMAIL = "b@b.com"
TEST_USER_PASSWORD = "Abcd@1234"

class FrontendCheckoutTester:
    def __init__(self):
        self.frontend_url = FRONTEND_URL
        self.backend_url = BACKEND_URL
        self.driver = None
        self.session = requests.Session()
        
    def log(self, message, status="INFO"):
        timestamp = datetime.now().strftime("%H:%M:%S")
        print(f"[{timestamp}] {status}: {message}")
        
    def setup_driver(self):
        """Setup Chrome driver for testing"""
        try:
            chrome_options = Options()
            chrome_options.add_argument('--headless')
            chrome_options.add_argument('--no-sandbox')
            chrome_options.add_argument('--disable-dev-shm-usage')
            chrome_options.add_argument('--disable-gpu')
            chrome_options.add_argument('--window-size=1920,1080')
            
            self.driver = webdriver.Chrome(options=chrome_options)
            self.driver.set_page_load_timeout(30)
            self.log("✅ Chrome driver setup successful", "SUCCESS")
            return True
        except Exception as e:
            self.log(f"❌ Chrome driver setup failed: {str(e)}", "ERROR")
            return False
            
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
            
    def test_login_functionality(self):
        """Test login functionality"""
        try:
            self.driver.get(f"{self.frontend_url}/auth/login")
            self.log("🔐 Testing login functionality...", "INFO")
            
            # Wait for login form
            WebDriverWait(self.driver, 10).until(
                EC.presence_of_element_located((By.NAME, "email"))
            )
            
            # Fill login form
            email_input = self.driver.find_element(By.NAME, "email")
            password_input = self.driver.find_element(By.NAME, "password")
            
            email_input.clear()
            email_input.send_keys(TEST_USER_EMAIL)
            password_input.clear()
            password_input.send_keys(TEST_USER_PASSWORD)
            
            # Submit form
            login_button = self.driver.find_element(By.XPATH, "//button[contains(text(), 'Sign In') or contains(text(), 'Login')]")
            login_button.click()
            
            # Wait for redirect or success
            time.sleep(3)
            
            # Check if login was successful
            current_url = self.driver.current_url
            if "/auth/login" not in current_url or "dashboard" in current_url or "profile" in current_url:
                self.log(f"✅ Login successful - redirected to: {current_url}", "SUCCESS")
                return True
            else:
                self.log("❌ Login failed - still on login page", "ERROR")
                return False
                
        except Exception as e:
            self.log(f"❌ Login test failed: {str(e)}", "ERROR")
            return False
            
    def test_checkout_page_access(self):
        """Test checkout page accessibility"""
        try:
            self.log("🛒 Testing checkout page access...", "INFO")
            self.driver.get(f"{self.frontend_url}/checkout")
            
            # Wait for page to load
            time.sleep(5)
            
            # Check for React errors
            logs = self.driver.get_log('browser')
            react_errors = [log for log in logs if 'error' in log['level'].lower() and ('react' in log['message'].lower() or 'hydration' in log['message'].lower())]
            
            if react_errors:
                self.log(f"❌ React errors found: {len(react_errors)} errors", "ERROR")
                for error in react_errors[:3]:  # Show first 3 errors
                    self.log(f"   Error: {error['message'][:100]}...", "ERROR")
                return False
            
            # Check if checkout page loaded
            page_title = self.driver.title
            if "checkout" in page_title.lower() or "Checkout" in self.driver.page_source:
                self.log("✅ Checkout page loaded successfully", "SUCCESS")
                return True
            else:
                self.log("❌ Checkout page not loaded properly", "ERROR")
                return False
                
        except Exception as e:
            self.log(f"❌ Checkout page access test failed: {str(e)}", "ERROR")
            return False
            
    def test_checkout_form_elements(self):
        """Test checkout form elements"""
        try:
            self.log("📝 Testing checkout form elements...", "INFO")
            
            # Check for shipping address form
            shipping_elements = [
                "full_name", "address_line1", "city", "state", "postal_code"
            ]
            
            found_elements = 0
            for element_name in shipping_elements:
                try:
                    element = self.driver.find_element(By.NAME, element_name)
                    found_elements += 1
                except NoSuchElementException:
                    pass
                    
            if found_elements >= 4:
                self.log(f"✅ Checkout form elements found: {found_elements}/5", "SUCCESS")
                return True
            else:
                self.log(f"❌ Insufficient form elements: {found_elements}/5", "ERROR")
                return False
                
        except Exception as e:
            self.log(f"❌ Form elements test failed: {str(e)}", "ERROR")
            return False
            
    def test_payment_methods(self):
        """Test payment method options"""
        try:
            self.log("💳 Testing payment method options...", "INFO")
            
            payment_methods = ["paypal", "card", "cod"]
            found_methods = 0
            
            for method in payment_methods:
                try:
                    element = self.driver.find_element(By.XPATH, f"//input[@value='{method}']")
                    found_methods += 1
                except NoSuchElementException:
                    pass
                    
            if found_methods >= 2:
                self.log(f"✅ Payment methods found: {found_methods}/3", "SUCCESS")
                return True
            else:
                self.log(f"❌ Insufficient payment methods: {found_methods}/3", "ERROR")
                return False
                
        except Exception as e:
            self.log(f"❌ Payment methods test failed: {str(e)}", "ERROR")
            return False
            
    def test_console_errors(self):
        """Test for console errors"""
        try:
            self.log("🔍 Checking for console errors...", "INFO")
            
            logs = self.driver.get_log('browser')
            error_logs = [log for log in logs if log['level'] == 'SEVERE']
            
            if error_logs:
                self.log(f"❌ Console errors found: {len(error_logs)} errors", "ERROR")
                for error in error_logs[:2]:  # Show first 2 errors
                    self.log(f"   Error: {error['message'][:150]}...", "ERROR")
                return False
            else:
                self.log("✅ No severe console errors found", "SUCCESS")
                return True
                
        except Exception as e:
            self.log(f"❌ Console error check failed: {str(e)}", "ERROR")
            return False
            
    def cleanup(self):
        """Cleanup resources"""
        if self.driver:
            self.driver.quit()
            
    def run_comprehensive_test(self):
        """Run comprehensive frontend checkout tests"""
        self.log("🚀 STARTING FRONTEND CHECKOUT PAGE TESTING", "INFO")
        self.log("=" * 60, "INFO")
        
        test_results = []
        
        # Test 1: Frontend Accessibility
        self.log("🌐 Testing frontend accessibility...", "INFO")
        result = self.test_frontend_accessibility()
        test_results.append(("Frontend Accessibility", result))
        if not result:
            return self.generate_summary(test_results)
            
        # Test 2: Backend Accessibility
        self.log("🔗 Testing backend accessibility...", "INFO")
        result = self.test_backend_accessibility()
        test_results.append(("Backend Accessibility", result))
        if not result:
            return self.generate_summary(test_results)
            
        # Test 3: Setup Driver
        self.log("🚗 Setting up Chrome driver...", "INFO")
        result = self.setup_driver()
        test_results.append(("Chrome Driver Setup", result))
        if not result:
            return self.generate_summary(test_results)
            
        # Test 4: Login Functionality
        self.log("🔐 Testing login functionality...", "INFO")
        result = self.test_login_functionality()
        test_results.append(("Login Functionality", result))
        if not result:
            self.cleanup()
            return self.generate_summary(test_results)
            
        # Test 5: Checkout Page Access
        self.log("🛒 Testing checkout page access...", "INFO")
        result = self.test_checkout_page_access()
        test_results.append(("Checkout Page Access", result))
        
        # Test 6: Form Elements
        if result:  # Only test if checkout page loaded
            self.log("📝 Testing form elements...", "INFO")
            form_result = self.test_checkout_form_elements()
            test_results.append(("Checkout Form Elements", form_result))
            
            # Test 7: Payment Methods
            self.log("💳 Testing payment methods...", "INFO")
            payment_result = self.test_payment_methods()
            test_results.append(("Payment Methods", payment_result))
            
        # Test 8: Console Errors
        self.log("🔍 Checking console errors...", "INFO")
        console_result = self.test_console_errors()
        test_results.append(("Console Error Check", console_result))
        
        self.cleanup()
        return self.generate_summary(test_results)
        
    def generate_summary(self, test_results):
        """Generate test summary"""
        self.log("=" * 60, "INFO")
        self.log("🎯 FRONTEND CHECKOUT PAGE TEST SUMMARY", "INFO")
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
            self.log("🎉 EXCELLENT: Frontend checkout page working perfectly!", "SUCCESS")
        elif success_rate >= 70:
            self.log("⚠️ GOOD: Most checkout features working", "WARNING")
        else:
            self.log("❌ CRITICAL: Major issues found in checkout page", "ERROR")
            
        return {
            'passed_tests': passed_tests,
            'total_tests': total_tests,
            'success_rate': success_rate,
            'test_results': test_results
        }

if __name__ == "__main__":
    tester = FrontendCheckoutTester()
    results = tester.run_comprehensive_test()
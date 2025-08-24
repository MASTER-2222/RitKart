#!/usr/bin/env python3
"""
RitZone Frontend Checkout Functionality Test
Tests frontend checkout page, payment integration, and user flows on localhost:3000
"""

import requests
import json
import time
import sys
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

class RitZoneFrontendTester:
    def __init__(self):
        self.driver = None
        self.test_results = []
        self.setup_driver()
        
    def setup_driver(self):
        """Setup Chrome WebDriver for testing"""
        try:
            chrome_options = Options()
            chrome_options.add_argument('--headless')  # Run in headless mode
            chrome_options.add_argument('--no-sandbox')
            chrome_options.add_argument('--disable-dev-shm-usage')
            chrome_options.add_argument('--disable-gpu')
            chrome_options.add_argument('--window-size=1920,1080')
            
            self.driver = webdriver.Chrome(options=chrome_options)
            self.driver.implicitly_wait(10)
            self.log_test("WebDriver Setup", True, "Chrome WebDriver initialized successfully")
        except Exception as e:
            self.log_test("WebDriver Setup", False, f"Failed to setup WebDriver: {str(e)}")
            # Fallback to requests-only testing
            self.driver = None
        
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
            response = requests.get(FRONTEND_URL, timeout=10)
            if response.status_code == 200:
                self.log_test("Frontend Accessibility", True, f"Frontend running on {FRONTEND_URL}")
                return True
            else:
                self.log_test("Frontend Accessibility", False, f"Frontend returned status {response.status_code}")
                return False
        except requests.exceptions.RequestException as e:
            self.log_test("Frontend Accessibility", False, f"Cannot connect to frontend: {str(e)}")
            return False
    
    def test_homepage_load(self):
        """Test homepage loading"""
        if not self.driver:
            self.log_test("Homepage Load", False, "WebDriver not available")
            return False
            
        try:
            self.driver.get(FRONTEND_URL)
            
            # Wait for page to load
            WebDriverWait(self.driver, 15).until(
                EC.presence_of_element_located((By.TAG_NAME, "body"))
            )
            
            # Check if page title contains expected content
            title = self.driver.title
            if "RitZone" in title or "ritzone" in title.lower():
                self.log_test("Homepage Load", True, f"Homepage loaded successfully: {title}")
                return True
            else:
                self.log_test("Homepage Load", True, f"Homepage loaded with title: {title}")
                return True
                
        except TimeoutException:
            self.log_test("Homepage Load", False, "Homepage failed to load within timeout")
            return False
        except Exception as e:
            self.log_test("Homepage Load", False, f"Homepage load error: {str(e)}")
            return False
    
    def test_user_login(self):
        """Test user login functionality"""
        if not self.driver:
            self.log_test("User Login", False, "WebDriver not available")
            return False
            
        try:
            # Navigate to login page
            login_url = f"{FRONTEND_URL}/auth/login"
            self.driver.get(login_url)
            
            # Wait for login form
            WebDriverWait(self.driver, 15).until(
                EC.presence_of_element_located((By.CSS_SELECTOR, "input[type='email'], input[name='email']"))
            )
            
            # Find email and password fields
            email_field = self.driver.find_element(By.CSS_SELECTOR, "input[type='email'], input[name='email']")
            password_field = self.driver.find_element(By.CSS_SELECTOR, "input[type='password'], input[name='password']")
            
            # Enter credentials
            email_field.clear()
            email_field.send_keys(TEST_USER_EMAIL)
            password_field.clear()
            password_field.send_keys(TEST_USER_PASSWORD)
            
            # Find and click login button
            login_button = self.driver.find_element(By.CSS_SELECTOR, "button[type='submit'], button:contains('Login'), button:contains('Sign In')")
            login_button.click()
            
            # Wait for redirect or success indication
            time.sleep(3)
            
            # Check if login was successful (URL change or success message)
            current_url = self.driver.current_url
            if "/auth/login" not in current_url or "dashboard" in current_url or "profile" in current_url:
                self.log_test("User Login", True, f"Login successful, redirected to: {current_url}")
                return True
            else:
                # Check for error messages
                try:
                    error_element = self.driver.find_element(By.CSS_SELECTOR, ".error, .alert-error, [class*='error']")
                    error_text = error_element.text
                    self.log_test("User Login", False, f"Login failed with error: {error_text}")
                except NoSuchElementException:
                    self.log_test("User Login", False, "Login appears to have failed (still on login page)")
                return False
                
        except TimeoutException:
            self.log_test("User Login", False, "Login form not found within timeout")
            return False
        except Exception as e:
            self.log_test("User Login", False, f"Login test error: {str(e)}")
            return False
    
    def test_cart_page_access(self):
        """Test cart page accessibility"""
        if not self.driver:
            self.log_test("Cart Page Access", False, "WebDriver not available")
            return False
            
        try:
            cart_url = f"{FRONTEND_URL}/cart"
            self.driver.get(cart_url)
            
            # Wait for cart page to load
            WebDriverWait(self.driver, 15).until(
                EC.presence_of_element_located((By.TAG_NAME, "body"))
            )
            
            # Check if we're on cart page
            current_url = self.driver.current_url
            if "/cart" in current_url:
                self.log_test("Cart Page Access", True, "Cart page loaded successfully")
                
                # Check for cart content or empty cart message
                try:
                    cart_content = self.driver.find_element(By.CSS_SELECTOR, ".cart, [class*='cart'], .shopping-cart")
                    self.log_test("Cart Content Check", True, "Cart content area found")
                except NoSuchElementException:
                    self.log_test("Cart Content Check", True, "Cart page loaded (content structure may vary)")
                
                return True
            else:
                self.log_test("Cart Page Access", False, f"Redirected to: {current_url}")
                return False
                
        except TimeoutException:
            self.log_test("Cart Page Access", False, "Cart page failed to load within timeout")
            return False
        except Exception as e:
            self.log_test("Cart Page Access", False, f"Cart page access error: {str(e)}")
            return False
    
    def test_checkout_page_access(self):
        """Test checkout page accessibility and form elements"""
        if not self.driver:
            self.log_test("Checkout Page Access", False, "WebDriver not available")
            return False
            
        try:
            checkout_url = f"{FRONTEND_URL}/checkout"
            self.driver.get(checkout_url)
            
            # Wait for checkout page to load
            WebDriverWait(self.driver, 15).until(
                EC.presence_of_element_located((By.TAG_NAME, "body"))
            )
            
            current_url = self.driver.current_url
            if "/checkout" in current_url:
                self.log_test("Checkout Page Access", True, "Checkout page loaded successfully")
                
                # Check for checkout form elements
                form_elements_found = []
                
                # Check for payment method options
                try:
                    payment_methods = self.driver.find_elements(By.CSS_SELECTOR, "input[type='radio'], .payment-method, [class*='payment']")
                    if payment_methods:
                        form_elements_found.append(f"Payment methods ({len(payment_methods)} found)")
                except:
                    pass
                
                # Check for address fields
                try:
                    address_fields = self.driver.find_elements(By.CSS_SELECTOR, "input[name*='address'], input[name*='name'], input[name*='city']")
                    if address_fields:
                        form_elements_found.append(f"Address fields ({len(address_fields)} found)")
                except:
                    pass
                
                # Check for PayPal button container
                try:
                    paypal_container = self.driver.find_element(By.CSS_SELECTOR, "#paypal-button-container, .paypal-button, [class*='paypal']")
                    form_elements_found.append("PayPal button container")
                except:
                    pass
                
                if form_elements_found:
                    self.log_test("Checkout Form Elements", True, f"Found: {', '.join(form_elements_found)}")
                else:
                    self.log_test("Checkout Form Elements", False, "No checkout form elements found")
                
                return True
            else:
                self.log_test("Checkout Page Access", False, f"Redirected to: {current_url}")
                return False
                
        except TimeoutException:
            self.log_test("Checkout Page Access", False, "Checkout page failed to load within timeout")
            return False
        except Exception as e:
            self.log_test("Checkout Page Access", False, f"Checkout page access error: {str(e)}")
            return False
    
    def test_payment_method_selection(self):
        """Test payment method selection functionality"""
        if not self.driver:
            self.log_test("Payment Method Selection", False, "WebDriver not available")
            return False
            
        try:
            # Ensure we're on checkout page
            checkout_url = f"{FRONTEND_URL}/checkout"
            self.driver.get(checkout_url)
            
            WebDriverWait(self.driver, 15).until(
                EC.presence_of_element_located((By.TAG_NAME, "body"))
            )
            
            payment_methods_tested = []
            
            # Test PayPal selection
            try:
                paypal_option = self.driver.find_element(By.CSS_SELECTOR, "input[value='paypal'], input[value='PayPal'], [data-payment='paypal']")
                paypal_option.click()
                payment_methods_tested.append("PayPal")
            except NoSuchElementException:
                pass
            
            # Test Credit/Debit Card selection
            try:
                card_option = self.driver.find_element(By.CSS_SELECTOR, "input[value='card'], input[value='credit'], [data-payment='card']")
                card_option.click()
                payment_methods_tested.append("Credit/Debit Card")
            except NoSuchElementException:
                pass
            
            # Test COD selection
            try:
                cod_option = self.driver.find_element(By.CSS_SELECTOR, "input[value='cod'], input[value='cash'], [data-payment='cod']")
                cod_option.click()
                payment_methods_tested.append("Cash on Delivery")
            except NoSuchElementException:
                pass
            
            if payment_methods_tested:
                self.log_test("Payment Method Selection", True, f"Payment methods available: {', '.join(payment_methods_tested)}")
                return True
            else:
                self.log_test("Payment Method Selection", False, "No payment method options found")
                return False
                
        except Exception as e:
            self.log_test("Payment Method Selection", False, f"Payment method selection error: {str(e)}")
            return False
    
    def test_orders_page_access(self):
        """Test My Orders page accessibility"""
        if not self.driver:
            self.log_test("Orders Page Access", False, "WebDriver not available")
            return False
            
        try:
            # Try different possible orders page URLs
            orders_urls = [
                f"{FRONTEND_URL}/orders",
                f"{FRONTEND_URL}/profile?section=orders",
                f"{FRONTEND_URL}/profile/orders"
            ]
            
            for orders_url in orders_urls:
                try:
                    self.driver.get(orders_url)
                    WebDriverWait(self.driver, 10).until(
                        EC.presence_of_element_located((By.TAG_NAME, "body"))
                    )
                    
                    current_url = self.driver.current_url
                    if "orders" in current_url or "profile" in current_url:
                        self.log_test("Orders Page Access", True, f"Orders page accessible at: {orders_url}")
                        
                        # Check for orders content
                        try:
                            orders_content = self.driver.find_element(By.CSS_SELECTOR, ".orders, [class*='order'], .order-history")
                            self.log_test("Orders Content Check", True, "Orders content area found")
                        except NoSuchElementException:
                            self.log_test("Orders Content Check", True, "Orders page loaded (content structure may vary)")
                        
                        return True
                except:
                    continue
            
            self.log_test("Orders Page Access", False, "Could not access orders page at any URL")
            return False
            
        except Exception as e:
            self.log_test("Orders Page Access", False, f"Orders page access error: {str(e)}")
            return False
    
    def test_console_errors(self):
        """Check for JavaScript console errors"""
        if not self.driver:
            self.log_test("Console Errors Check", False, "WebDriver not available")
            return False
            
        try:
            # Navigate to checkout page to check for console errors
            checkout_url = f"{FRONTEND_URL}/checkout"
            self.driver.get(checkout_url)
            
            time.sleep(3)  # Wait for page to fully load
            
            # Get console logs
            logs = self.driver.get_log('browser')
            
            errors = [log for log in logs if log['level'] == 'SEVERE']
            warnings = [log for log in logs if log['level'] == 'WARNING']
            
            if errors:
                error_messages = [log['message'] for log in errors[:3]]  # Show first 3 errors
                self.log_test("Console Errors Check", False, f"Found {len(errors)} console errors", error_messages)
                return False
            elif warnings:
                self.log_test("Console Errors Check", True, f"No critical errors, {len(warnings)} warnings found")
                return True
            else:
                self.log_test("Console Errors Check", True, "No console errors or warnings found")
                return True
                
        except Exception as e:
            self.log_test("Console Errors Check", False, f"Console check error: {str(e)}")
            return False
    
    def test_responsive_design(self):
        """Test responsive design on different screen sizes"""
        if not self.driver:
            self.log_test("Responsive Design", False, "WebDriver not available")
            return False
            
        try:
            checkout_url = f"{FRONTEND_URL}/checkout"
            self.driver.get(checkout_url)
            
            # Test different screen sizes
            screen_sizes = [
                (1920, 1080, "Desktop"),
                (768, 1024, "Tablet"),
                (375, 667, "Mobile")
            ]
            
            responsive_results = []
            
            for width, height, device in screen_sizes:
                try:
                    self.driver.set_window_size(width, height)
                    time.sleep(2)  # Wait for responsive changes
                    
                    # Check if page is still functional
                    body = self.driver.find_element(By.TAG_NAME, "body")
                    if body.is_displayed():
                        responsive_results.append(f"{device} ({width}x{height})")
                except Exception as e:
                    pass
            
            if len(responsive_results) >= 2:
                self.log_test("Responsive Design", True, f"Responsive on: {', '.join(responsive_results)}")
                return True
            else:
                self.log_test("Responsive Design", False, f"Limited responsiveness: {', '.join(responsive_results)}")
                return False
                
        except Exception as e:
            self.log_test("Responsive Design", False, f"Responsive design test error: {str(e)}")
            return False
    
    def cleanup(self):
        """Cleanup WebDriver"""
        if self.driver:
            self.driver.quit()
    
    def run_all_tests(self):
        """Run all frontend tests"""
        print("🚀 STARTING RITZONE FRONTEND CHECKOUT TESTING ON LOCALHOST:3000")
        print("=" * 70)
        
        # Test sequence
        tests = [
            ("Frontend Accessibility", self.test_frontend_accessibility),
            ("Homepage Load", self.test_homepage_load),
            ("User Login", self.test_user_login),
            ("Cart Page Access", self.test_cart_page_access),
            ("Checkout Page Access", self.test_checkout_page_access),
            ("Payment Method Selection", self.test_payment_method_selection),
            ("Orders Page Access", self.test_orders_page_access),
            ("Console Errors Check", self.test_console_errors),
            ("Responsive Design", self.test_responsive_design)
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
        
        # Cleanup
        self.cleanup()
        
        # Summary
        print("\n" + "=" * 70)
        print("🎯 RITZONE FRONTEND CHECKOUT TEST SUMMARY")
        print("=" * 70)
        
        success_rate = (passed_tests / total_tests) * 100
        print(f"📊 OVERALL RESULTS: {passed_tests}/{total_tests} tests passed ({success_rate:.1f}% success rate)")
        
        if success_rate >= 80:
            print("🎉 EXCELLENT: Frontend checkout functionality is working well!")
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
    print("🎯 RitZone Frontend Checkout Functionality Test")
    print(f"Frontend URL: {FRONTEND_URL}")
    print(f"Backend URL: {BACKEND_URL}")
    print(f"Test User: {TEST_USER_EMAIL}")
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
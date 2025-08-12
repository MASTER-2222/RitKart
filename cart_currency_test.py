#!/usr/bin/env python3
"""
RitZone Cart Currency Testing Suite - Focus on INR vs USD
========================================================
Testing cart functionality with specific focus on currency handling:
- Cart API endpoints (GET /api/cart, POST /api/cart/add) 
- Verify cart responses use INR currency by default (not USD)
- Test cart creation and item addition with proper currency symbols
- Verify backend cart service returns currency: 'INR' in responses
- Test cart data structure and currency field consistency
"""

import requests
import json
import sys
from datetime import datetime
import time

class CartCurrencyTester:
    def __init__(self, base_url="http://localhost:8001/api"):
        self.base_url = base_url
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []
        self.auth_token = None
        self.test_user_email = f"cartcurrencytest.{int(time.time())}@example.com"
        self.test_user_password = "TestPassword123!"
        self.test_product_id = None

    def log_test(self, name, success, message="", response_data=None):
        """Log test results"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            status = "✅ PASS"
        else:
            status = "❌ FAIL"
        
        result = {
            "test": name,
            "status": status,
            "message": message,
            "data": response_data
        }
        self.test_results.append(result)
        print(f"{status} - {name}: {message}")
        return success

    def make_request(self, method, endpoint, data=None, headers=None, expected_status=200, timeout=15):
        """Make HTTP request with error handling"""
        url = f"{self.base_url}{endpoint}"
        default_headers = {'Content-Type': 'application/json'}
        
        if headers:
            default_headers.update(headers)

        try:
            if method == 'GET':
                response = requests.get(url, headers=default_headers, timeout=timeout)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=default_headers, timeout=timeout)
            else:
                raise ValueError(f"Unsupported method: {method}")

            try:
                response_data = response.json()
            except:
                response_data = {"raw_response": response.text}

            success = response.status_code == expected_status
            return success, response.status_code, response_data

        except requests.exceptions.RequestException as e:
            return False, 0, {"error": str(e)}

    def test_backend_health(self):
        """Test backend health check"""
        print("\n🔍 Testing Backend Health Check...")
        success, status, data = self.make_request('GET', '/health')
        
        if success and data.get('success'):
            return self.log_test(
                "Backend Health Check", 
                True, 
                f"Backend running - Node.js Express + Supabase"
            )
        else:
            return self.log_test(
                "Backend Health Check", 
                False, 
                f"Health check failed - Status: {status}"
            )

    def test_user_registration_and_login(self):
        """Test user registration and login for cart testing"""
        print("\n👤 Testing User Registration & Login...")
        
        # Register user
        registration_data = {
            "email": self.test_user_email,
            "password": self.test_user_password,
            "firstName": "Cart",
            "lastName": "Tester"
        }
        
        success, status, data = self.make_request('POST', '/auth/register', registration_data, expected_status=201)
        
        if not success:
            return self.log_test("User Registration & Login", False, f"Registration failed - Status: {status}")
        
        # Login user
        login_data = {
            "email": self.test_user_email,
            "password": self.test_user_password
        }
        
        success, status, data = self.make_request('POST', '/auth/login', login_data)
        
        if success and data.get('success'):
            self.auth_token = data.get('data', {}).get('token')
            if self.auth_token:
                return self.log_test("User Registration & Login", True, "Authentication successful")
            else:
                return self.log_test("User Registration & Login", False, "No token received")
        else:
            return self.log_test("User Registration & Login", False, f"Login failed - Status: {status}")

    def test_get_product_for_cart(self):
        """Get a product ID for cart testing"""
        print("\n📦 Getting Product for Cart Testing...")
        
        success, status, data = self.make_request('GET', '/products?limit=1')
        
        if success and data.get('success'):
            products = data.get('data', [])
            if products:
                self.test_product_id = products[0].get('id')
                product_name = products[0].get('name', 'Unknown')
                return self.log_test("Get Product for Testing", True, f"Product: {product_name}")
            else:
                return self.log_test("Get Product for Testing", False, "No products available")
        else:
            return self.log_test("Get Product for Testing", False, f"Failed to get products - Status: {status}")

    def test_empty_cart_currency(self):
        """Test GET /api/cart for empty cart - should return INR currency"""
        print("\n🛒 Testing Empty Cart Currency (Should be INR)...")
        
        if not self.auth_token:
            return self.log_test("Empty Cart Currency", False, "No authentication token")
        
        headers = {'Authorization': f'Bearer {self.auth_token}'}
        success, status, data = self.make_request('GET', '/cart', headers=headers)
        
        if success and data.get('success'):
            cart_data = data.get('data', {})
            currency = cart_data.get('currency', 'NOT_SET')
            
            # CRITICAL TEST: Currency should be INR, not USD
            is_inr = currency == 'INR'
            
            return self.log_test(
                "Empty Cart Currency", 
                is_inr, 
                f"Currency: {currency} - {'✅ CORRECT (INR)' if is_inr else '❌ WRONG (Should be INR, not USD)'}"
            )
        else:
            return self.log_test("Empty Cart Currency", False, f"Failed to get cart - Status: {status}")

    def test_add_to_cart_currency(self):
        """Test POST /api/cart/add - verify currency handling"""
        print("\n➕ Testing Add to Cart Currency...")
        
        if not self.auth_token or not self.test_product_id:
            return self.log_test("Add to Cart Currency", False, "Missing auth token or product ID")
        
        headers = {'Authorization': f'Bearer {self.auth_token}'}
        cart_data = {
            "productId": self.test_product_id,
            "quantity": 2
        }
        
        success, status, data = self.make_request('POST', '/cart/add', cart_data, headers=headers)
        
        if success and data.get('success'):
            return self.log_test("Add to Cart Currency", True, "Item added to cart successfully")
        else:
            return self.log_test("Add to Cart Currency", False, f"Failed to add to cart - Status: {status}, Response: {data}")

    def test_populated_cart_currency(self):
        """Test GET /api/cart for populated cart - verify INR currency"""
        print("\n🛒 Testing Populated Cart Currency (Should be INR)...")
        
        if not self.auth_token:
            return self.log_test("Populated Cart Currency", False, "No authentication token")
        
        headers = {'Authorization': f'Bearer {self.auth_token}'}
        success, status, data = self.make_request('GET', '/cart', headers=headers)
        
        if success and data.get('success'):
            cart_data = data.get('data', {})
            currency = cart_data.get('currency', 'NOT_SET')
            cart_items = cart_data.get('cart_items', [])
            total_amount = cart_data.get('total_amount', 0)
            
            # CRITICAL TEST: Currency should be INR, not USD
            is_inr = currency == 'INR'
            has_items = len(cart_items) > 0
            
            # Check product pricing in cart items
            price_details = []
            for item in cart_items:
                product = item.get('products', {})  # Backend returns 'products' (plural)
                price = product.get('price', 0)
                name = product.get('name', 'Unknown')
                price_details.append(f"{name}: ₹{price}")
            
            return self.log_test(
                "Populated Cart Currency", 
                is_inr and has_items, 
                f"Currency: {currency} {'✅ CORRECT (INR)' if is_inr else '❌ WRONG (Should be INR)'}, Items: {len(cart_items)}, Total: ₹{total_amount}, Products: {', '.join(price_details)}"
            )
        else:
            return self.log_test("Populated Cart Currency", False, f"Failed to get cart - Status: {status}")

    def test_cart_currency_field_consistency(self):
        """Test that cart always returns currency: 'INR' field"""
        print("\n📊 Testing Cart Currency Field Consistency...")
        
        if not self.auth_token:
            return self.log_test("Cart Currency Field Consistency", False, "No authentication token")
        
        headers = {'Authorization': f'Bearer {self.auth_token}'}
        success, status, data = self.make_request('GET', '/cart', headers=headers)
        
        if success and data.get('success'):
            cart_data = data.get('data', {})
            
            # Check required fields
            has_currency_field = 'currency' in cart_data
            currency_value = cart_data.get('currency', 'MISSING')
            is_inr = currency_value == 'INR'
            
            # Check cart structure
            has_cart_items = 'cart_items' in cart_data
            has_total_amount = 'total_amount' in cart_data
            
            structure_valid = has_currency_field and has_cart_items and has_total_amount and is_inr
            
            return self.log_test(
                "Cart Currency Field Consistency", 
                structure_valid, 
                f"Currency field: {'✅' if has_currency_field else '❌'}, Value: {currency_value} {'✅' if is_inr else '❌'}, Structure: {'✅' if has_cart_items and has_total_amount else '❌'}"
            )
        else:
            return self.log_test("Cart Currency Field Consistency", False, f"Failed to get cart - Status: {status}")

    def test_cart_currency_symbols(self):
        """Test that cart should display ₹ (INR) symbols, not $ (USD)"""
        print("\n💰 Testing Cart Currency Symbols (₹ vs $)...")
        
        if not self.auth_token:
            return self.log_test("Cart Currency Symbols", False, "No authentication token")
        
        headers = {'Authorization': f'Bearer {self.auth_token}'}
        success, status, data = self.make_request('GET', '/cart', headers=headers)
        
        if success and data.get('success'):
            cart_data = data.get('data', {})
            currency = cart_data.get('currency', '')
            cart_items = cart_data.get('cart_items', [])
            total_amount = cart_data.get('total_amount', 0)
            
            # CRITICAL: Should be INR (₹) not USD ($)
            correct_currency = currency == 'INR'
            expected_symbol = '₹' if currency == 'INR' else '$'
            
            # Format prices with correct symbol
            formatted_total = f"{expected_symbol}{total_amount}"
            item_prices = []
            
            for item in cart_items:
                product = item.get('products', {})
                price = product.get('price', 0)
                name = product.get('name', 'Unknown')
                item_prices.append(f"{name}: {expected_symbol}{price}")
            
            return self.log_test(
                "Cart Currency Symbols", 
                correct_currency, 
                f"Currency: {currency}, Symbol: {expected_symbol} {'✅ CORRECT (₹)' if correct_currency else '❌ WRONG (Should be ₹, not $)'}, Total: {formatted_total}, Items: {', '.join(item_prices) if item_prices else 'None'}"
            )
        else:
            return self.log_test("Cart Currency Symbols", False, f"Failed to get cart - Status: {status}")

    def run_cart_currency_tests(self):
        """Run focused cart currency test suite"""
        print("=" * 80)
        print("🚀 RitZone Cart Currency Testing Suite - INR vs USD Focus")
        print("📋 Issue: Cart page shows $ (dollar) instead of ₹ (INR rupee) symbols")
        print("🎯 Testing: Backend cart.js should return 'INR' instead of 'USD'")
        print("=" * 80)
        print(f"📅 Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print(f"🌐 Testing endpoint: {self.base_url}")
        print("=" * 80)

        # Core Tests - Focus on Currency
        self.test_backend_health()
        self.test_user_registration_and_login()
        self.test_get_product_for_cart()
        
        # CRITICAL CURRENCY TESTS
        self.test_empty_cart_currency()
        self.test_add_to_cart_currency()
        self.test_populated_cart_currency()
        self.test_cart_currency_field_consistency()
        self.test_cart_currency_symbols()

        # Print Results Summary
        print("\n" + "=" * 80)
        print("📊 CART CURRENCY TEST RESULTS SUMMARY")
        print("=" * 80)
        
        currency_tests_passed = 0
        currency_tests_total = 0
        
        for result in self.test_results:
            print(f"{result['status']} {result['test']}: {result['message']}")
            if 'Currency' in result['test']:
                currency_tests_total += 1
                if result['status'] == "✅ PASS":
                    currency_tests_passed += 1
        
        print(f"\n📈 Overall Results: {self.tests_passed}/{self.tests_run} tests passed")
        print(f"💰 Currency Tests: {currency_tests_passed}/{currency_tests_total} passed")
        
        if currency_tests_passed == currency_tests_total and currency_tests_total > 0:
            print("\n🎉 ALL CART CURRENCY TESTS PASSED!")
            print("✅ Backend cart service is correctly returning currency: 'INR'")
            print("✅ Cart responses use INR currency by default (not USD)")
            print("✅ Cart page should now show ₹ (rupee) instead of $ (dollar) symbols")
            return 0
        else:
            print(f"\n⚠️  {currency_tests_total - currency_tests_passed} currency tests failed")
            print("❌ Cart currency handling has issues:")
            print("   - Backend may still be returning 'USD' instead of 'INR'")
            print("   - Cart page will continue showing $ instead of ₹ symbols")
            print("   - Need to fix backend cart.js currency configuration")
            return 1

def main():
    """Main test execution"""
    tester = CartCurrencyTester()
    return tester.run_cart_currency_tests()

if __name__ == "__main__":
    sys.exit(main())
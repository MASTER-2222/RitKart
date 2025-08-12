#!/usr/bin/env python3
"""
RitZone Currency Conversion System - COMPREHENSIVE BACKEND VERIFICATION
======================================================================
Testing ALL backend API endpoints that support currency conversion as requested:

1. Currency API Endpoints:
   - GET /api/currency/currencies (7 currencies: INR, USD, EUR, GBP, CAD, JPY, AUD)
   - GET /api/currency/rates (exchange rate system)
   - POST /api/currency/convert (actual currency conversion)

2. Products API with Currency Support:
   - GET /api/products?featured=true&currency=USD/EUR/GBP
   - GET /api/products/category/electronics?currency=USD
   - GET /api/products/{product_id}?currency=CAD
   - Verify: currency_symbol, formatted_price fields

3. Cart API with Currency Support:
   - GET /api/cart?currency=USD/EUR
   - Verify cart returns prices in requested currency

4. Data Validation:
   - Price conversion working (INR to other currencies)
   - Currency symbols match requested currency
   - Formatted prices include proper symbols

5. Backend Health Check:
   - Node.js Express + Supabase running correctly
   - API endpoints accessible
   - Currency configuration working
"""

import requests
import json
import sys
import uuid
import time
from datetime import datetime

class RitZoneCurrencyComprehensiveTester:
    def __init__(self, base_url="http://localhost:8001/api"):
        self.base_url = base_url
        self.token = None
        self.user_id = None
        self.test_user_email = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []
        self.supported_currencies = ['INR', 'USD', 'EUR', 'GBP', 'CAD', 'JPY', 'AUD']
        self.currency_symbols = {
            'INR': '₹', 'USD': '$', 'EUR': '€', 'GBP': '£', 
            'CAD': 'C$', 'JPY': '¥', 'AUD': 'A$'
        }
        self.test_products = []
        self.test_product_id = None

    def log_test(self, name, success, message="", response_data=None):
        """Log test results with detailed information"""
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

    def make_request(self, method, endpoint, data=None, expected_status=200, timeout=30):
        """Make HTTP request with comprehensive error handling"""
        url = f"{self.base_url}{endpoint}"
        headers = {'Content-Type': 'application/json'}
        
        if self.token:
            headers['Authorization'] = f'Bearer {self.token}'

        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=timeout)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=timeout)
            else:
                raise ValueError(f"Unsupported method: {method}")

            try:
                response_data = response.json()
            except:
                response_data = {"raw_response": response.text[:500]}

            success = response.status_code == expected_status
            return success, response.status_code, response_data

        except requests.exceptions.RequestException as e:
            return False, 0, {"error": str(e)}

    def test_backend_health_check(self):
        """Test Node.js Express + Supabase backend health"""
        print("\n🔍 Testing Backend Health Check...")
        success, status, data = self.make_request('GET', '/health')
        
        if success and data.get('success'):
            env_info = data.get('environment', {})
            db_info = data.get('database', {})
            node_env = env_info.get('nodeEnv', 'unknown')
            db_success = db_info.get('success', False)
            
            return self.log_test(
                "Backend Health Check", 
                True, 
                f"Node.js Express + Supabase running - Environment: {node_env}, DB Connected: {db_success}"
            )
        else:
            return self.log_test(
                "Backend Health Check", 
                False, 
                f"Health check failed - Status: {status}, Response: {data}"
            )

    def test_currency_api_currencies(self):
        """Test GET /api/currency/currencies - Should return 7 currencies with correct symbols"""
        print("\n💰 Testing GET /api/currency/currencies...")
        success, status, data = self.make_request('GET', '/currency/currencies')
        
        if success and data.get('success'):
            currencies = data.get('data', [])
            currency_codes = [curr.get('code') for curr in currencies]
            
            # Check if all 7 expected currencies are present
            missing_currencies = [curr for curr in self.supported_currencies if curr not in currency_codes]
            has_all_currencies = len(missing_currencies) == 0
            
            # Check if symbols are correct
            symbol_check = True
            symbol_details = []
            for curr in currencies:
                code = curr.get('code')
                symbol = curr.get('symbol')
                expected_symbol = self.currency_symbols.get(code)
                if symbol == expected_symbol:
                    symbol_details.append(f"{code}:{symbol}")
                else:
                    symbol_details.append(f"{code}:{symbol}≠{expected_symbol}")
                    symbol_check = False
            
            overall_success = has_all_currencies and symbol_check and len(currencies) == 7
            message = f"Retrieved {len(currencies)} currencies. Expected 7: {has_all_currencies}. Symbols correct: {symbol_check}. Details: {', '.join(symbol_details)}"
            
            return self.log_test("Currency API - 7 Currencies Available", overall_success, message)
        else:
            return self.log_test(
                "Currency API - 7 Currencies Available", 
                False, 
                f"Failed to get currencies - Status: {status}, Response: {data}"
            )

    def test_currency_api_rates(self):
        """Test GET /api/currency/rates - Verify exchange rate system working"""
        print("\n💱 Testing GET /api/currency/rates...")
        success, status, data = self.make_request('GET', '/currency/rates', timeout=35)
        
        if success and data.get('success'):
            rates_data = data.get('data', {})
            rates = rates_data.get('rates', {})
            base_currency = rates_data.get('base', 'Unknown')
            source = rates_data.get('source', 'Unknown')
            
            # Check if we have rates for all supported currencies
            available_currencies = list(rates.keys())
            missing_rates = [curr for curr in self.supported_currencies if curr not in available_currencies]
            
            # Validate some realistic rates (USD should be around 0.012 when INR is base)
            usd_rate = rates.get('USD', 0)
            eur_rate = rates.get('EUR', 0)
            
            rate_validation = ""
            if usd_rate and 0.010 <= usd_rate <= 0.015:  # Reasonable range for INR to USD
                rate_validation = f"USD rate: {usd_rate:.4f} ✅"
            else:
                rate_validation = f"USD rate: {usd_rate:.4f} ⚠️"
            
            overall_success = len(missing_rates) == 0 and base_currency == 'INR' and len(available_currencies) >= 7
            message = f"Base: {base_currency}, {len(available_currencies)} rates available. Missing: {missing_rates if missing_rates else 'None'}. {rate_validation}. Source: {source}"
            
            return self.log_test("Currency API - Exchange Rate System", overall_success, message)
        else:
            return self.log_test(
                "Currency API - Exchange Rate System", 
                False, 
                f"Failed to get exchange rates - Status: {status}, Response: {data}"
            )

    def test_currency_api_convert(self):
        """Test POST /api/currency/convert - Test actual currency conversion"""
        print("\n🔄 Testing POST /api/currency/convert...")
        
        test_conversions = [
            {"amount": 1000, "from": "INR", "to": "USD", "expected_range": (10, 15)},
            {"amount": 100, "from": "USD", "to": "INR", "expected_range": (8000, 9500)},
            {"amount": 1000, "from": "INR", "to": "EUR", "expected_range": (9, 13)}
        ]
        
        conversion_results = []
        all_conversions_successful = True
        
        for conversion in test_conversions:
            conversion_data = {
                "amount": conversion["amount"],
                "from": conversion["from"],
                "to": conversion["to"]
            }
            
            success, status, data = self.make_request('POST', '/currency/convert', conversion_data, timeout=35)
            
            if success and data.get('success'):
                conversion_result = data.get('data', {})
                converted_amount = conversion_result.get('converted', {}).get('amount', 0)
                exchange_rate = conversion_result.get('exchangeRate', 0)
                
                # Check if conversion is within expected range
                min_expected, max_expected = conversion["expected_range"]
                is_realistic = min_expected <= converted_amount <= max_expected
                
                status_icon = "✅" if is_realistic else "⚠️"
                conversion_results.append(f"{conversion['amount']} {conversion['from']} = {converted_amount:.2f} {conversion['to']} {status_icon}")
                
                if not is_realistic:
                    all_conversions_successful = False
            else:
                conversion_results.append(f"{conversion['from']} to {conversion['to']}: FAILED")
                all_conversions_successful = False
        
        message = f"Conversions: {'; '.join(conversion_results)}"
        return self.log_test("Currency API - Actual Conversion", all_conversions_successful, message)

    def get_test_product_id(self):
        """Get a product ID for testing individual product endpoints"""
        if self.test_product_id:
            return self.test_product_id
            
        success, status, data = self.make_request('GET', '/products?limit=1')
        if success and data.get('success') and data.get('data'):
            self.test_product_id = data['data'][0].get('id')
            return self.test_product_id
        return None

    def test_products_featured_with_currency(self):
        """Test GET /api/products?featured=true&currency=USD/EUR/GBP"""
        print("\n⭐ Testing Featured Products API with Currency Support...")
        
        test_currencies = ['USD', 'EUR', 'GBP']
        currency_results = []
        all_currencies_working = True
        
        for currency in test_currencies:
            success, status, data = self.make_request('GET', f'/products?featured=true&currency={currency}&limit=3', timeout=30)
            
            if success and data.get('success'):
                products = data.get('data', [])
                
                if products:
                    product = products[0]
                    has_currency_fields = (
                        'currency' in product and
                        'currency_symbol' in product and
                        'formatted_price' in product
                    )
                    
                    correct_currency = product.get('currency') == currency
                    expected_symbol = self.currency_symbols.get(currency)
                    correct_symbol = product.get('currency_symbol') == expected_symbol
                    
                    if has_currency_fields and correct_currency and correct_symbol:
                        currency_results.append(f"{currency}: ✅ ({len(products)} products)")
                    else:
                        currency_results.append(f"{currency}: ❌ (currency:{correct_currency}, symbol:{correct_symbol}, fields:{has_currency_fields})")
                        all_currencies_working = False
                else:
                    currency_results.append(f"{currency}: ❌ (no products)")
                    all_currencies_working = False
            else:
                currency_results.append(f"{currency}: ❌ (API failed)")
                all_currencies_working = False
        
        message = f"Featured products currency support: {', '.join(currency_results)}"
        return self.log_test("Products API - Featured Products Currency", all_currencies_working, message)

    def test_products_category_with_currency(self):
        """Test GET /api/products/category/electronics?currency=USD"""
        print("\n📱 Testing Category Products API with Currency...")
        success, status, data = self.make_request('GET', '/products/category/electronics?currency=USD&limit=3', timeout=30)
        
        if success and data.get('success'):
            products = data.get('data', [])
            
            if products:
                product = products[0]
                has_currency_fields = (
                    'currency' in product and
                    'currency_symbol' in product and
                    'formatted_price' in product
                )
                
                correct_currency = product.get('currency') == 'USD'
                correct_symbol = product.get('currency_symbol') == '$'
                
                overall_success = has_currency_fields and correct_currency and correct_symbol
                return self.log_test(
                    "Products API - Category Electronics USD", 
                    overall_success, 
                    f"Retrieved {len(products)} electronics. Currency: {'✅' if correct_currency else '❌'}, Symbol: {'✅' if correct_symbol else '❌'}, Fields: {'✅' if has_currency_fields else '❌'}"
                )
            else:
                return self.log_test("Products API - Category Electronics USD", False, "No electronics products returned")
        else:
            return self.log_test(
                "Products API - Category Electronics USD", 
                False, 
                f"Failed to get electronics with USD - Status: {status}"
            )

    def test_individual_product_with_currency(self):
        """Test GET /api/products/{product_id}?currency=CAD"""
        print("\n📦 Testing Individual Product API with Currency...")
        
        product_id = self.get_test_product_id()
        if not product_id:
            return self.log_test("Products API - Individual Product CAD", False, "Could not get product ID for testing")
        
        success, status, data = self.make_request('GET', f'/products/{product_id}?currency=CAD', timeout=30)
        
        if success and data.get('success'):
            product = data.get('data', {})
            has_currency_fields = (
                'currency' in product and
                'currency_symbol' in product and
                'formatted_price' in product
            )
            
            correct_currency = product.get('currency') == 'CAD'
            correct_symbol = product.get('currency_symbol') == 'C$'
            
            overall_success = has_currency_fields and correct_currency and correct_symbol
            return self.log_test(
                "Products API - Individual Product CAD", 
                overall_success, 
                f"Product '{product.get('name', 'Unknown')[:30]}'. Currency: {'✅' if correct_currency else '❌'}, Symbol: {'✅' if correct_symbol else '❌'}, Fields: {'✅' if has_currency_fields else '❌'}"
            )
        else:
            return self.log_test(
                "Products API - Individual Product CAD", 
                False, 
                f"Failed to get individual product with CAD - Status: {status}"
            )

    def setup_test_user_for_cart(self):
        """Setup authenticated user for cart testing"""
        print("\n👤 Setting up test user for cart testing...")
        
        # Generate unique test user
        timestamp = datetime.now().strftime('%H%M%S%f')[:-3]
        self.test_user_email = f"currencytest.{timestamp}@example.com"
        
        user_data = {
            "email": self.test_user_email,
            "password": "CurrencyTest123!",
            "fullName": f"Currency Test User {timestamp}",
            "phone": "+1234567890"
        }
        
        # Register user
        success, status, data = self.make_request('POST', '/auth/register', user_data, 201)
        
        if success and data.get('success'):
            if 'user' in data:
                self.user_id = data['user'].get('id')
            self.log_test("Test User Registration", True, f"User registered - Email: {self.test_user_email}")
        else:
            self.log_test("Test User Registration", False, f"Registration failed - Status: {status}")
            return False
        
        # Login user
        login_data = {
            "email": self.test_user_email,
            "password": "CurrencyTest123!"
        }
        
        success, status, data = self.make_request('POST', '/auth/login', login_data)
        
        if success and data.get('success'):
            if 'token' in data:
                self.token = data['token']
            if 'user' in data:
                self.user_id = data['user'].get('id')
            return self.log_test("Test User Login", True, f"Login successful - Token acquired")
        else:
            return self.log_test("Test User Login", False, f"Login failed - Status: {status}")

    def test_cart_api_with_currency(self):
        """Test GET /api/cart?currency=USD/EUR - Cart with currency support"""
        print("\n🛒 Testing Cart API with Currency Support...")
        
        if not self.token:
            return self.log_test("Cart API - Currency Support", False, "No authentication token available")
        
        # First add a product to cart
        product_id = self.get_test_product_id()
        if not product_id:
            return self.log_test("Cart API - Currency Support", False, "No product ID available for cart testing")
        
        cart_item_data = {
            "productId": product_id,
            "quantity": 2
        }
        
        # Add to cart
        success, status, data = self.make_request('POST', '/cart/add', cart_item_data, 200)
        if not (success and data.get('success')):
            return self.log_test("Cart API - Currency Support", False, "Failed to add product to cart for testing")
        
        # Test cart with different currencies
        test_currencies = ['USD', 'EUR']
        currency_results = []
        all_currencies_working = True
        
        for currency in test_currencies:
            success, status, data = self.make_request('GET', f'/cart?currency={currency}', timeout=30)
            
            if success and data.get('success'):
                cart_data = data.get('data', {})
                cart_items = cart_data.get('cart_items', [])
                cart_currency = cart_data.get('currency', 'Unknown')
                
                if cart_items:
                    item = cart_items[0]
                    product_data = item.get('products', {})
                    
                    has_currency_fields = (
                        'currency' in product_data and
                        'currency_symbol' in product_data and
                        'formatted_price' in product_data
                    )
                    
                    correct_currency = product_data.get('currency') == currency
                    expected_symbol = self.currency_symbols.get(currency)
                    correct_symbol = product_data.get('currency_symbol') == expected_symbol
                    correct_cart_currency = cart_currency == currency
                    
                    if has_currency_fields and correct_currency and correct_symbol and correct_cart_currency:
                        currency_results.append(f"{currency}: ✅")
                    else:
                        currency_results.append(f"{currency}: ❌ (fields:{has_currency_fields}, currency:{correct_currency}, symbol:{correct_symbol}, cart_currency:{correct_cart_currency})")
                        all_currencies_working = False
                else:
                    currency_results.append(f"{currency}: ❌ (empty cart)")
                    all_currencies_working = False
            else:
                currency_results.append(f"{currency}: ❌ (API failed)")
                all_currencies_working = False
        
        message = f"Cart currency support: {', '.join(currency_results)}"
        return self.log_test("Cart API - Currency Support", all_currencies_working, message)

    def test_price_conversion_validation(self):
        """Test that price conversion is working correctly (INR to other currencies)"""
        print("\n💰 Testing Price Conversion Validation...")
        
        # Get a product in INR (base currency)
        success, status, data = self.make_request('GET', '/products?currency=INR&limit=1')
        if not (success and data.get('success') and data.get('data')):
            return self.log_test("Price Conversion Validation", False, "Could not get INR product for validation")
        
        inr_product = data['data'][0]
        inr_price = inr_product.get('price', 0)
        product_id = inr_product.get('id')
        
        if not inr_price or not product_id:
            return self.log_test("Price Conversion Validation", False, "INR product missing price or ID")
        
        # Get same product in USD
        success, status, data = self.make_request('GET', f'/products/{product_id}?currency=USD')
        if not (success and data.get('success')):
            return self.log_test("Price Conversion Validation", False, "Could not get USD product for validation")
        
        usd_product = data['data']
        usd_price = usd_product.get('price', 0)
        
        # Validate conversion (USD price should be much lower than INR price)
        if usd_price and inr_price:
            conversion_ratio = inr_price / usd_price
            # Should be around 80-90 (typical INR to USD ratio)
            is_realistic = 70 <= conversion_ratio <= 100
            
            return self.log_test(
                "Price Conversion Validation", 
                is_realistic, 
                f"INR ₹{inr_price} → USD ${usd_price} (ratio: {conversion_ratio:.1f}). Realistic: {'✅' if is_realistic else '❌'}"
            )
        else:
            return self.log_test("Price Conversion Validation", False, "Missing price data for conversion validation")

    def test_currency_symbols_validation(self):
        """Test that currency symbols match requested currency across all APIs"""
        print("\n🔣 Testing Currency Symbols Validation...")
        
        symbol_tests = []
        all_symbols_correct = True
        
        for currency, expected_symbol in [('USD', '$'), ('EUR', '€'), ('GBP', '£')]:
            # Test products API
            success, status, data = self.make_request('GET', f'/products?currency={currency}&limit=1')
            
            if success and data.get('success') and data.get('data'):
                product = data['data'][0]
                actual_symbol = product.get('currency_symbol')
                formatted_price = product.get('formatted_price', '')
                
                symbol_correct = actual_symbol == expected_symbol
                price_has_symbol = expected_symbol in formatted_price
                
                if symbol_correct and price_has_symbol:
                    symbol_tests.append(f"{currency}({expected_symbol}): ✅")
                else:
                    symbol_tests.append(f"{currency}({actual_symbol}≠{expected_symbol}): ❌")
                    all_symbols_correct = False
            else:
                symbol_tests.append(f"{currency}: ❌ (API failed)")
                all_symbols_correct = False
        
        message = f"Symbol validation: {', '.join(symbol_tests)}"
        return self.log_test("Currency Symbols Validation", all_symbols_correct, message)

    def run_comprehensive_currency_tests(self):
        """Run complete RitZone currency system verification"""
        print("=" * 80)
        print("🚀 RitZone Currency Conversion System - COMPREHENSIVE BACKEND VERIFICATION")
        print("📋 Testing ALL backend API endpoints that support currency conversion")
        print("=" * 80)
        print(f"📅 Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print(f"🌐 Testing endpoint: {self.base_url}")
        print(f"💰 Expected currencies: {', '.join(self.supported_currencies)}")
        print("=" * 80)

        # Backend Health Check
        self.test_backend_health_check()
        
        # 1. Currency API Endpoints Testing
        print("\n" + "="*60)
        print("1️⃣ CURRENCY API ENDPOINTS TESTING")
        print("="*60)
        self.test_currency_api_currencies()
        self.test_currency_api_rates()
        self.test_currency_api_convert()
        
        # 2. Products API with Currency Support Testing
        print("\n" + "="*60)
        print("2️⃣ PRODUCTS API WITH CURRENCY SUPPORT TESTING")
        print("="*60)
        self.test_products_featured_with_currency()
        self.test_products_category_with_currency()
        self.test_individual_product_with_currency()
        
        # 3. Cart API with Currency Support Testing
        print("\n" + "="*60)
        print("3️⃣ CART API WITH CURRENCY SUPPORT TESTING")
        print("="*60)
        if self.setup_test_user_for_cart():
            self.test_cart_api_with_currency()
        else:
            self.log_test("Cart API Testing", False, "Could not setup test user for cart testing")
        
        # 4. Data Validation Testing
        print("\n" + "="*60)
        print("4️⃣ DATA VALIDATION TESTING")
        print("="*60)
        self.test_price_conversion_validation()
        self.test_currency_symbols_validation()

        # Print Comprehensive Results Summary
        print("\n" + "=" * 80)
        print("📊 COMPREHENSIVE TEST RESULTS SUMMARY")
        print("=" * 80)
        
        # Categorize tests
        currency_api_tests = [r for r in self.test_results if 'Currency API' in r['test']]
        products_api_tests = [r for r in self.test_results if 'Products API' in r['test']]
        cart_api_tests = [r for r in self.test_results if 'Cart API' in r['test']]
        validation_tests = [r for r in self.test_results if 'Validation' in r['test']]
        other_tests = [r for r in self.test_results if r not in currency_api_tests + products_api_tests + cart_api_tests + validation_tests]
        
        print("\n🔹 CURRENCY API ENDPOINTS:")
        for result in currency_api_tests:
            print(f"{result['status']} {result['test']}: {result['message']}")
        
        print("\n🔹 PRODUCTS API WITH CURRENCY:")
        for result in products_api_tests:
            print(f"{result['status']} {result['test']}: {result['message']}")
        
        print("\n🔹 CART API WITH CURRENCY:")
        for result in cart_api_tests:
            print(f"{result['status']} {result['test']}: {result['message']}")
        
        print("\n🔹 DATA VALIDATION:")
        for result in validation_tests:
            print(f"{result['status']} {result['test']}: {result['message']}")
        
        if other_tests:
            print("\n🔹 OTHER TESTS:")
            for result in other_tests:
                print(f"{result['status']} {result['test']}: {result['message']}")
        
        print(f"\n📈 Overall Results: {self.tests_passed}/{self.tests_run} tests passed ({(self.tests_passed/self.tests_run*100):.1f}%)")
        
        # Final Assessment
        critical_failures = []
        if any('❌ FAIL' in r['status'] for r in currency_api_tests):
            critical_failures.append("Currency API endpoints")
        if any('❌ FAIL' in r['status'] for r in products_api_tests):
            critical_failures.append("Products API currency support")
        if any('❌ FAIL' in r['status'] for r in cart_api_tests):
            critical_failures.append("Cart API currency support")
        if any('❌ FAIL' in r['status'] for r in validation_tests):
            critical_failures.append("Data validation")
        
        print("\n" + "=" * 80)
        print("🎯 FINAL ASSESSMENT")
        print("=" * 80)
        
        if self.tests_passed == self.tests_run:
            print("🎉 ALL TESTS PASSED! RitZone Currency Conversion System is FULLY FUNCTIONAL!")
            print("✅ Currency API: 7 currencies available (INR, USD, EUR, GBP, CAD, JPY, AUD)")
            print("✅ Exchange Rates: Live rates working correctly")
            print("✅ Currency Conversion: Actual conversion working")
            print("✅ Products API: Currency support working with proper symbols")
            print("✅ Cart API: Currency conversion in cart working")
            print("✅ Data Validation: Price conversion and symbols correct")
            print("✅ Backend Health: Node.js Express + Supabase running correctly")
            print("🚀 Currency conversion system ready for production!")
            return 0
        else:
            print(f"⚠️ {self.tests_run - self.tests_passed} tests failed")
            if critical_failures:
                print(f"🚨 Critical issues found in: {', '.join(critical_failures)}")
            print("❌ Currency system has issues that need to be addressed")
            
            # Provide specific recommendations
            print("\n📋 RECOMMENDATIONS:")
            if any('❌ FAIL' in r['status'] for r in currency_api_tests):
                print("• Fix Currency API endpoints (/api/currency/currencies, /api/currency/rates, /api/currency/convert)")
            if any('❌ FAIL' in r['status'] for r in products_api_tests):
                print("• Fix Products API currency parameter support")
            if any('❌ FAIL' in r['status'] for r in cart_api_tests):
                print("• Fix Cart API currency parameter support")
            if any('❌ FAIL' in r['status'] for r in validation_tests):
                print("• Fix currency symbols and price conversion logic")
            
            return 1

def main():
    """Main test execution"""
    tester = RitZoneCurrencyComprehensiveTester()
    return tester.run_comprehensive_currency_tests()

if __name__ == "__main__":
    sys.exit(main())
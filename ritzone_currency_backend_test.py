#!/usr/bin/env python3
"""
RitZone Dynamic Currency Conversion System - Comprehensive Backend Testing
=========================================================================
Testing the complete currency conversion system as requested in review:

1. Currency API Endpoints (GET /api/currency/currencies, GET /api/currency/rates, POST /api/currency/convert)
2. Products API with Dynamic Currency (GET /api/products?currency=USD, etc.)
3. Cart API with Dynamic Currency (GET /api/cart?currency=USD, etc.)
4. Featured Products with Currency (GET /api/products/featured/list?currency=CAD)
5. Live Exchange Rate Testing (GET /api/currency/test-live-rates)

Focus: Verify all 7 supported currencies (INR, USD, EUR, GBP, CAD, JPY, AUD) work properly
"""

import requests
import json
import sys
import uuid
import time
from datetime import datetime

class RitZoneCurrencyTester:
    def __init__(self, base_url="https://ritkart-backend.onrender.com/api"):
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

    def make_request(self, method, endpoint, data=None, expected_status=200, timeout=20):
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

    def test_backend_health(self):
        """Test backend health and configuration"""
        print("\n🔍 Testing Backend Health Check...")
        success, status, data = self.make_request('GET', '/health')
        
        if success and data.get('success'):
            env_info = data.get('environment', {})
            db_info = data.get('database', {})
            return self.log_test(
                "Backend Health Check", 
                True, 
                f"Backend running - Environment: {env_info.get('nodeEnv', 'unknown')}, DB: {db_info.get('success', False)}"
            )
        else:
            return self.log_test(
                "Backend Health Check", 
                False, 
                f"Health check failed - Status: {status}, Response: {data}"
            )

    def test_supported_currencies_api(self):
        """Test GET /api/currency/currencies - Should return 7 supported currencies with symbols"""
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
                    symbol_details.append(f"{code}: {symbol} ✅")
                else:
                    symbol_details.append(f"{code}: {symbol} ❌ (expected {expected_symbol})")
                    symbol_check = False
            
            overall_success = has_all_currencies and symbol_check
            message = f"Retrieved {len(currencies)} currencies. Missing: {missing_currencies if missing_currencies else 'None'}. Symbols: {', '.join(symbol_details[:3])}..."
            
            return self.log_test("Currency API - Supported Currencies", overall_success, message)
        else:
            return self.log_test(
                "Currency API - Supported Currencies", 
                False, 
                f"Failed to get currencies - Status: {status}, Response: {data}"
            )

    def test_live_exchange_rates_api(self):
        """Test GET /api/currency/rates - Should return live exchange rates with INR as base"""
        print("\n💱 Testing GET /api/currency/rates...")
        success, status, data = self.make_request('GET', '/currency/rates', timeout=25)
        
        if success and data.get('success'):
            rates_data = data.get('data', {})
            rates = rates_data.get('rates', {})
            base_currency = rates_data.get('base', 'Unknown')
            
            # Check if we have rates for all supported currencies
            available_currencies = list(rates.keys())
            missing_rates = [curr for curr in self.supported_currencies if curr not in available_currencies]
            
            # Validate USD to INR rate (should be realistic)
            usd_to_inr_rate = None
            if 'USD' in rates and base_currency == 'INR':
                usd_to_inr_rate = 1 / rates['USD']  # Convert INR base to USD rate
            
            rate_validation = ""
            if usd_to_inr_rate:
                if 80 <= usd_to_inr_rate <= 95:  # Reasonable range for USD to INR
                    rate_validation = f"✅ USD to INR rate: {usd_to_inr_rate:.2f} (realistic)"
                else:
                    rate_validation = f"⚠️ USD to INR rate: {usd_to_inr_rate:.2f} (may be outdated)"
            
            overall_success = len(missing_rates) == 0 and base_currency == 'INR'
            message = f"Base: {base_currency}, Rates for {len(available_currencies)} currencies. Missing: {missing_rates if missing_rates else 'None'}. {rate_validation}"
            
            return self.log_test("Currency API - Live Exchange Rates", overall_success, message)
        else:
            return self.log_test(
                "Currency API - Live Exchange Rates", 
                False, 
                f"Failed to get exchange rates - Status: {status}, Response: {data}"
            )

    def test_currency_conversion_api(self):
        """Test POST /api/currency/convert - Test currency conversion (1000 INR to USD, EUR, GBP)"""
        print("\n🔄 Testing POST /api/currency/convert...")
        
        test_conversions = [
            {"amount": 1000, "from": "INR", "to": "USD", "expected_range": (10, 15)},
            {"amount": 1000, "from": "INR", "to": "EUR", "expected_range": (9, 13)},
            {"amount": 1000, "from": "INR", "to": "GBP", "expected_range": (8, 12)}
        ]
        
        conversion_results = []
        all_conversions_successful = True
        
        for conversion in test_conversions:
            conversion_data = {
                "amount": conversion["amount"],
                "from": conversion["from"],
                "to": conversion["to"]
            }
            
            success, status, data = self.make_request('POST', '/currency/convert', conversion_data, timeout=25)
            
            if success and data.get('success'):
                conversion_result = data.get('data', {})
                converted_amount = conversion_result.get('converted', {}).get('amount', 0)
                exchange_rate = conversion_result.get('exchangeRate', 0)
                
                # Check if conversion is within expected range
                min_expected, max_expected = conversion["expected_range"]
                is_realistic = min_expected <= converted_amount <= max_expected
                
                status_icon = "✅" if is_realistic else "⚠️"
                conversion_results.append(f"{conversion['amount']} {conversion['from']} = {converted_amount} {conversion['to']} {status_icon}")
                
                if not is_realistic:
                    all_conversions_successful = False
            else:
                conversion_results.append(f"{conversion['from']} to {conversion['to']}: FAILED")
                all_conversions_successful = False
        
        message = f"Conversion results: {'; '.join(conversion_results)}"
        return self.log_test("Currency API - Conversion", all_conversions_successful, message)

    def test_products_api_with_currencies(self):
        """Test GET /api/products?currency=USD/EUR/GBP - Products with different currency prices"""
        print("\n🛍️ Testing Products API with Dynamic Currency...")
        
        test_currencies = ['USD', 'EUR', 'GBP']
        currency_results = []
        all_currencies_working = True
        
        for currency in test_currencies:
            success, status, data = self.make_request('GET', f'/products?currency={currency}&limit=3', timeout=25)
            
            if success and data.get('success'):
                products = data.get('data', [])
                
                if products:
                    product = products[0]
                    has_currency_data = (
                        'currency' in product and
                        'currency_symbol' in product and
                        'formatted_price' in product and
                        product.get('currency') == currency
                    )
                    
                    expected_symbol = self.currency_symbols.get(currency)
                    correct_symbol = product.get('currency_symbol') == expected_symbol
                    
                    if has_currency_data and correct_symbol:
                        currency_results.append(f"{currency}: ✅ ({len(products)} products)")
                        # Store products for later cart testing
                        if currency == 'USD':
                            self.test_products.extend(products[:2])
                    else:
                        currency_results.append(f"{currency}: ❌ (missing currency data)")
                        all_currencies_working = False
                else:
                    currency_results.append(f"{currency}: ❌ (no products)")
                    all_currencies_working = False
            else:
                currency_results.append(f"{currency}: ❌ (API failed)")
                all_currencies_working = False
        
        message = f"Currency support: {', '.join(currency_results)}"
        return self.log_test("Products API - Dynamic Currency", all_currencies_working, message)

    def test_category_products_with_currency(self):
        """Test GET /api/products/category/electronics?currency=EUR - Electronics in EUR"""
        print("\n📱 Testing Category Products API with EUR Currency...")
        success, status, data = self.make_request('GET', '/products/category/electronics?currency=EUR&limit=3', timeout=25)
        
        if success and data.get('success'):
            products = data.get('data', [])
            
            if products:
                product = products[0]
                has_currency_data = (
                    'currency' in product and
                    'currency_symbol' in product and
                    'formatted_price' in product and
                    product.get('currency') == 'EUR' and
                    product.get('currency_symbol') == '€'
                )
                
                return self.log_test(
                    "Category Products API - EUR Currency", 
                    has_currency_data, 
                    f"Retrieved {len(products)} electronics with EUR prices. Currency data: {'✅' if has_currency_data else '❌'}"
                )
            else:
                return self.log_test("Category Products API - EUR Currency", False, "No electronics products returned")
        else:
            return self.log_test(
                "Category Products API - EUR Currency", 
                False, 
                f"Failed to get electronics with EUR - Status: {status}, Response: {data}"
            )

    def test_individual_product_with_currency(self):
        """Test GET /api/products/:id?currency=GBP - Individual product in GBP"""
        print("\n📦 Testing Individual Product API with GBP Currency...")
        
        # First get a product ID
        success, status, data = self.make_request('GET', '/products?limit=1')
        if not success or not data.get('data'):
            return self.log_test("Individual Product API - GBP Currency", False, "Could not get product ID for testing")
        
        product_id = data['data'][0].get('id')
        if not product_id:
            return self.log_test("Individual Product API - GBP Currency", False, "Product ID not found")
        
        # Test individual product with GBP currency
        success, status, data = self.make_request('GET', f'/products/{product_id}?currency=GBP', timeout=25)
        
        if success and data.get('success'):
            product = data.get('data', {})
            has_currency_data = (
                'currency' in product and
                'currency_symbol' in product and
                'formatted_price' in product and
                product.get('currency') == 'GBP' and
                product.get('currency_symbol') == '£'
            )
            
            return self.log_test(
                "Individual Product API - GBP Currency", 
                has_currency_data, 
                f"Retrieved product '{product.get('name', 'Unknown')[:30]}' with GBP prices. Currency data: {'✅' if has_currency_data else '❌'}"
            )
        else:
            return self.log_test(
                "Individual Product API - GBP Currency", 
                False, 
                f"Failed to get individual product with GBP - Status: {status}, Response: {data}"
            )

    def test_featured_products_with_currency(self):
        """Test GET /api/products/featured/list?currency=CAD - Featured products in CAD"""
        print("\n⭐ Testing Featured Products API with CAD Currency...")
        success, status, data = self.make_request('GET', '/products/featured/list?currency=CAD&limit=5', timeout=25)
        
        if success and data.get('success'):
            products = data.get('data', [])
            
            if products:
                product = products[0]
                has_currency_data = (
                    'currency' in product and
                    'currency_symbol' in product and
                    'formatted_price' in product and
                    product.get('currency') == 'CAD' and
                    product.get('currency_symbol') == 'C$'
                )
                
                return self.log_test(
                    "Featured Products API - CAD Currency", 
                    has_currency_data, 
                    f"Retrieved {len(products)} featured products with CAD prices. Currency data: {'✅' if has_currency_data else '❌'}"
                )
            else:
                return self.log_test("Featured Products API - CAD Currency", False, "No featured products returned")
        else:
            return self.log_test(
                "Featured Products API - CAD Currency", 
                False, 
                f"Failed to get featured products with CAD - Status: {status}, Response: {data}"
            )

    def test_live_exchange_rate_testing(self):
        """Test GET /api/currency/test-live-rates - Test real-time conversion rates"""
        print("\n📊 Testing Live Exchange Rate Testing API...")
        success, status, data = self.make_request('GET', '/currency/test-live-rates', timeout=30)
        
        if success and data.get('success'):
            test_data = data.get('data', {})
            test_conversions = test_data.get('testConversions', {})
            all_rates = test_data.get('allRates', {})
            
            # Check USD to INR conversion (should be around 80-95)
            usd_to_inr = test_conversions.get('1_USD_to_INR', 0)
            inr_to_usd = test_conversions.get('100_INR_to_USD', 0)
            
            # Validate rates are realistic
            usd_inr_realistic = 80 <= usd_to_inr <= 95 if usd_to_inr else False
            inr_usd_realistic = 1.0 <= inr_to_usd <= 1.5 if inr_to_usd else False
            
            # Check if we have rates for all currencies
            available_currencies = list(all_rates.keys())
            missing_rates = [curr for curr in self.supported_currencies if curr not in available_currencies]
            
            overall_success = usd_inr_realistic and inr_usd_realistic and len(missing_rates) == 0
            validation_msg = f"1 USD = {usd_to_inr:.2f} INR ({'✅' if usd_inr_realistic else '❌'}), 100 INR = {inr_to_usd:.2f} USD ({'✅' if inr_usd_realistic else '❌'}). Rates for {len(available_currencies)} currencies"
            
            return self.log_test("Live Exchange Rate Testing API", overall_success, validation_msg)
        else:
            return self.log_test(
                "Live Exchange Rate Testing API", 
                False, 
                f"Failed to test live rates - Status: {status}, Response: {data}"
            )

    def test_all_seven_currencies_support(self):
        """Test that all 7 currencies work properly with products API"""
        print("\n🌍 Testing All 7 Supported Currencies...")
        
        successful_currencies = []
        failed_currencies = []
        
        for currency in self.supported_currencies:
            print(f"   Testing {currency}...")
            success, status, data = self.make_request('GET', f'/products?currency={currency}&limit=1', timeout=20)
            
            if success and data.get('success'):
                products = data.get('data', [])
                if products and products[0].get('currency') == currency:
                    expected_symbol = self.currency_symbols.get(currency)
                    actual_symbol = products[0].get('currency_symbol')
                    if actual_symbol == expected_symbol:
                        successful_currencies.append(f"{currency}({actual_symbol})")
                    else:
                        failed_currencies.append(f"{currency}(symbol:{actual_symbol}≠{expected_symbol})")
                else:
                    failed_currencies.append(f"{currency}(no-data)")
            else:
                failed_currencies.append(f"{currency}(api-fail)")
            
            # Small delay to avoid overwhelming the API
            time.sleep(0.5)
        
        overall_success = len(failed_currencies) == 0
        message = f"Working: {', '.join(successful_currencies)}. Failed: {', '.join(failed_currencies) if failed_currencies else 'None'}"
        
        return self.log_test("All 7 Currencies Support", overall_success, message)

    def test_error_handling_invalid_currencies(self):
        """Test error handling for invalid currencies"""
        print("\n❌ Testing Error Handling for Invalid Currencies...")
        
        invalid_currencies = ['XYZ', 'INVALID', 'TEST']
        error_handling_results = []
        all_errors_handled = True
        
        for currency in invalid_currencies:
            success, status, data = self.make_request('GET', f'/products?currency={currency}&limit=1', timeout=15)
            
            # Should either return error or fallback to INR
            if success and data.get('success'):
                products = data.get('data', [])
                if products:
                    returned_currency = products[0].get('currency', 'Unknown')
                    if returned_currency == 'INR':  # Fallback to INR
                        error_handling_results.append(f"{currency}: ✅ (fallback to INR)")
                    else:
                        error_handling_results.append(f"{currency}: ❌ (returned {returned_currency})")
                        all_errors_handled = False
                else:
                    error_handling_results.append(f"{currency}: ✅ (no products)")
            else:
                # API returned error - this is also acceptable
                error_handling_results.append(f"{currency}: ✅ (API error)")
        
        message = f"Invalid currency handling: {', '.join(error_handling_results)}"
        return self.log_test("Error Handling - Invalid Currencies", all_errors_handled, message)

    def setup_test_user_for_cart(self):
        """Setup a test user for cart testing"""
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

    def test_cart_api_with_currencies(self):
        """Test GET /api/cart?currency=USD/EUR - Cart with different currency converted prices"""
        print("\n🛒 Testing Cart API with Dynamic Currency...")
        
        if not self.token:
            return self.log_test("Cart API - Dynamic Currency", False, "No authentication token available")
        
        # First add a product to cart
        if not self.test_products:
            return self.log_test("Cart API - Dynamic Currency", False, "No test products available")
        
        product = self.test_products[0]
        cart_item_data = {
            "productId": product.get('id'),
            "quantity": 2
        }
        
        # Add to cart
        success, status, data = self.make_request('POST', '/cart/add', cart_item_data, 200)
        if not (success and data.get('success')):
            return self.log_test("Cart API - Dynamic Currency", False, "Failed to add product to cart for testing")
        
        # Test cart with different currencies
        test_currencies = ['USD', 'EUR']
        currency_results = []
        all_currencies_working = True
        
        for currency in test_currencies:
            success, status, data = self.make_request('GET', f'/cart?currency={currency}', timeout=25)
            
            if success and data.get('success'):
                cart_data = data.get('data', {})
                cart_items = cart_data.get('cart_items', [])
                
                if cart_items:
                    item = cart_items[0]
                    product_data = item.get('products', {})
                    
                    has_currency_data = (
                        'currency' in product_data and
                        'currency_symbol' in product_data and
                        'formatted_price' in product_data and
                        product_data.get('currency') == currency
                    )
                    
                    expected_symbol = self.currency_symbols.get(currency)
                    correct_symbol = product_data.get('currency_symbol') == expected_symbol
                    
                    if has_currency_data and correct_symbol:
                        currency_results.append(f"{currency}: ✅")
                    else:
                        currency_results.append(f"{currency}: ❌ (missing currency data)")
                        all_currencies_working = False
                else:
                    currency_results.append(f"{currency}: ❌ (empty cart)")
                    all_currencies_working = False
            else:
                currency_results.append(f"{currency}: ❌ (API failed)")
                all_currencies_working = False
        
        message = f"Cart currency support: {', '.join(currency_results)}"
        return self.log_test("Cart API - Dynamic Currency", all_currencies_working, message)

    def run_comprehensive_currency_tests(self):
        """Run complete RitZone currency system test suite"""
        print("=" * 80)
        print("🚀 RitZone Dynamic Currency Conversion System - Comprehensive Backend Testing")
        print("📋 Testing ALL currency functionality as requested in review")
        print("=" * 80)
        print(f"📅 Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print(f"🌐 Testing endpoint: {self.base_url}")
        print(f"💰 Testing currencies: {', '.join(self.supported_currencies)}")
        print("=" * 80)

        # Core Backend Health
        self.test_backend_health()
        
        # 1. Currency API Endpoints Testing
        print("\n" + "="*50)
        print("1️⃣ CURRENCY API ENDPOINTS TESTING")
        print("="*50)
        self.test_supported_currencies_api()
        self.test_live_exchange_rates_api()
        self.test_currency_conversion_api()
        self.test_live_exchange_rate_testing()
        
        # 2. Products API with Dynamic Currency Testing
        print("\n" + "="*50)
        print("2️⃣ PRODUCTS API WITH DYNAMIC CURRENCY TESTING")
        print("="*50)
        self.test_products_api_with_currencies()
        self.test_category_products_with_currency()
        self.test_individual_product_with_currency()
        self.test_featured_products_with_currency()
        
        # 3. Comprehensive Currency Support Testing
        print("\n" + "="*50)
        print("3️⃣ COMPREHENSIVE CURRENCY SUPPORT TESTING")
        print("="*50)
        self.test_all_seven_currencies_support()
        self.test_error_handling_invalid_currencies()
        
        # 4. Cart API with Dynamic Currency Testing
        print("\n" + "="*50)
        print("4️⃣ CART API WITH DYNAMIC CURRENCY TESTING")
        print("="*50)
        if self.setup_test_user_for_cart():
            self.test_cart_api_with_currencies()
        else:
            self.log_test("Cart API Testing", False, "Could not setup test user for cart testing")

        # Print Comprehensive Results Summary
        print("\n" + "=" * 80)
        print("📊 COMPREHENSIVE TEST RESULTS SUMMARY")
        print("=" * 80)
        
        # Categorize tests
        currency_api_tests = [r for r in self.test_results if 'Currency API' in r['test']]
        products_api_tests = [r for r in self.test_results if 'Products API' in r['test'] or 'Individual Product' in r['test'] or 'Featured Products' in r['test'] or 'Category Products' in r['test']]
        currency_support_tests = [r for r in self.test_results if 'Currencies Support' in r['test'] or 'Error Handling' in r['test']]
        cart_api_tests = [r for r in self.test_results if 'Cart API' in r['test']]
        other_tests = [r for r in self.test_results if r not in currency_api_tests + products_api_tests + currency_support_tests + cart_api_tests]
        
        print("\n🔹 CURRENCY API ENDPOINTS:")
        for result in currency_api_tests:
            print(f"{result['status']} {result['test']}: {result['message']}")
        
        print("\n🔹 PRODUCTS API WITH CURRENCY:")
        for result in products_api_tests:
            print(f"{result['status']} {result['test']}: {result['message']}")
        
        print("\n🔹 CURRENCY SUPPORT & ERROR HANDLING:")
        for result in currency_support_tests:
            print(f"{result['status']} {result['test']}: {result['message']}")
        
        print("\n🔹 CART API WITH CURRENCY:")
        for result in cart_api_tests:
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
        if any('❌ FAIL' in r['status'] for r in currency_support_tests):
            critical_failures.append("Multi-currency support")
        
        if self.tests_passed == self.tests_run:
            print("🎉 ALL TESTS PASSED! RitZone Dynamic Currency Conversion System is fully functional!")
            print("✅ All 7 currencies (INR, USD, EUR, GBP, CAD, JPY, AUD) working correctly")
            print("✅ Currency symbols are correct (₹, $, €, £, C$, ¥, A$)")
            print("✅ Price conversions use real-time exchange rates")
            print("✅ All API endpoints include proper currency metadata")
            print("✅ Error handling for invalid currencies working")
            print("✅ Currency conversion system ready for frontend integration!")
            return 0
        else:
            print(f"⚠️ {self.tests_run - self.tests_passed} tests failed")
            if critical_failures:
                print(f"🚨 Critical issues found in: {', '.join(critical_failures)}")
            print("❌ Currency system has issues that need to be addressed")
            return 1

def main():
    """Main test execution"""
    tester = RitZoneCurrencyTester()
    return tester.run_comprehensive_currency_tests()

if __name__ == "__main__":
    sys.exit(main())
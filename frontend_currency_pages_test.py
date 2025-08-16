#!/usr/bin/env python3
"""
RitZone Frontend Currency Conversion Pages Test
==============================================
Test if currency conversion is working on ALL frontend pages:
1. INDEX Page - Featured products, Electronics carousel
2. Category Pages - All 10 categories with currency conversion
3. Individual Product Pages - Currency display and conversion
4. Verify they work like CART page (dynamic, backend-fetched, proper symbols)
"""

import requests
import json
import sys
import time
from datetime import datetime

class RitZoneFrontendCurrencyTester:
    def __init__(self, base_url="http://localhost:8001/api"):
        self.base_url = base_url
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []
        self.supported_currencies = ['INR', 'USD', 'EUR', 'GBP', 'CAD', 'JPY', 'AUD']
        self.currency_symbols = {
            'INR': '₹', 'USD': '$', 'EUR': '€', 'GBP': '£', 
            'CAD': 'C$', 'JPY': '¥', 'AUD': 'A$'
        }
        self.categories = [
            'electronics', 'fashion', 'books', 'home', 'sports', 
            'grocery', 'appliances', 'beauty', 'solar', 'pharmacy'
        ]

    def log_test(self, name, success, message=""):
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
            "message": message
        }
        self.test_results.append(result)
        print(f"{status} - {name}: {message}")
        return success

    def make_request(self, method, endpoint, data=None, expected_status=200, timeout=30):
        """Make HTTP request"""
        url = f"{self.base_url}{endpoint}"
        headers = {'Content-Type': 'application/json'}

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

    def test_index_page_featured_products_currency(self):
        """Test INDEX page - Featured products with currency conversion"""
        print("\n🏠 Testing INDEX Page - Featured Products Currency Conversion...")
        
        test_currencies = ['USD', 'EUR', 'GBP']
        currency_results = []
        all_currencies_working = True
        
        for currency in test_currencies:
            success, status, data = self.make_request('GET', f'/products?featured=true&currency={currency}&limit=5')
            
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
        
        message = f"INDEX page featured products: {', '.join(currency_results)}"
        return self.log_test("INDEX Page - Featured Products Currency", all_currencies_working, message)

    def test_index_page_electronics_carousel_currency(self):
        """Test INDEX page - Electronics carousel with currency conversion"""
        print("\n📱 Testing INDEX Page - Electronics Carousel Currency Conversion...")
        
        test_currencies = ['USD', 'EUR']
        currency_results = []
        all_currencies_working = True
        
        for currency in test_currencies:
            success, status, data = self.make_request('GET', f'/products/category/electronics?currency={currency}&limit=6')
            
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
        
        message = f"INDEX page electronics carousel: {', '.join(currency_results)}"
        return self.log_test("INDEX Page - Electronics Carousel Currency", all_currencies_working, message)

    def test_all_category_pages_currency(self):
        """Test ALL 10 Category Pages with currency conversion"""
        print("\n📂 Testing ALL Category Pages Currency Conversion...")
        
        category_results = []
        all_categories_working = True
        test_currency = 'USD'  # Test with USD
        
        for category in self.categories:
            success, status, data = self.make_request('GET', f'/products/category/{category}?currency={test_currency}&limit=3')
            
            if success and data.get('success'):
                products = data.get('data', [])
                
                if products:
                    product = products[0]
                    has_currency_fields = (
                        'currency' in product and
                        'currency_symbol' in product and
                        'formatted_price' in product
                    )
                    
                    correct_currency = product.get('currency') == test_currency
                    correct_symbol = product.get('currency_symbol') == '$'
                    
                    if has_currency_fields and correct_currency and correct_symbol:
                        category_results.append(f"{category}: ✅ ({len(products)})")
                    else:
                        category_results.append(f"{category}: ❌")
                        all_categories_working = False
                else:
                    category_results.append(f"{category}: ❌ (no products)")
                    all_categories_working = False
            else:
                category_results.append(f"{category}: ❌ (API failed)")
                all_categories_working = False
        
        message = f"Category pages in USD: {', '.join(category_results)}"
        return self.log_test("ALL Category Pages - Currency Conversion", all_categories_working, message)

    def test_individual_product_pages_currency(self):
        """Test Individual Product Pages with currency conversion"""
        print("\n📦 Testing Individual Product Pages Currency Conversion...")
        
        # First get some product IDs
        success, status, data = self.make_request('GET', '/products?limit=5')
        if not (success and data.get('success') and data.get('data')):
            return self.log_test("Individual Product Pages - Currency", False, "Could not get product IDs for testing")
        
        products = data['data']
        test_currencies = ['USD', 'EUR', 'GBP']
        currency_results = []
        all_currencies_working = True
        
        for currency in test_currencies:
            # Test with first product
            product_id = products[0].get('id')
            if not product_id:
                currency_results.append(f"{currency}: ❌ (no product ID)")
                all_currencies_working = False
                continue
                
            success, status, data = self.make_request('GET', f'/products/{product_id}?currency={currency}')
            
            if success and data.get('success'):
                product = data.get('data', {})
                has_currency_fields = (
                    'currency' in product and
                    'currency_symbol' in product and
                    'formatted_price' in product
                )
                
                correct_currency = product.get('currency') == currency
                expected_symbol = self.currency_symbols.get(currency)
                correct_symbol = product.get('currency_symbol') == expected_symbol
                
                if has_currency_fields and correct_currency and correct_symbol:
                    currency_results.append(f"{currency}: ✅")
                else:
                    currency_results.append(f"{currency}: ❌ (currency:{correct_currency}, symbol:{correct_symbol}, fields:{has_currency_fields})")
                    all_currencies_working = False
            else:
                currency_results.append(f"{currency}: ❌ (API failed)")
                all_currencies_working = False
        
        message = f"Individual product pages: {', '.join(currency_results)}"
        return self.log_test("Individual Product Pages - Currency", all_currencies_working, message)

    def test_currency_consistency_across_pages(self):
        """Test that same product shows consistent prices across different pages"""
        print("\n🔄 Testing Currency Consistency Across Pages...")
        
        # Get a product from electronics category
        success, status, data = self.make_request('GET', '/products/category/electronics?currency=USD&limit=1')
        if not (success and data.get('success') and data.get('data')):
            return self.log_test("Currency Consistency", False, "Could not get electronics product for testing")
        
        product_from_category = data['data'][0]
        product_id = product_from_category.get('id')
        category_price = product_from_category.get('price')
        category_formatted_price = product_from_category.get('formatted_price')
        
        # Get same product from individual product API
        success, status, data = self.make_request('GET', f'/products/{product_id}?currency=USD')
        if not (success and data.get('success')):
            return self.log_test("Currency Consistency", False, "Could not get individual product for comparison")
        
        individual_product = data['data']
        individual_price = individual_product.get('price')
        individual_formatted_price = individual_product.get('formatted_price')
        
        # Check if prices match
        prices_match = abs(category_price - individual_price) < 0.01  # Allow small floating point differences
        formatted_prices_match = category_formatted_price == individual_formatted_price
        
        consistency_check = prices_match and formatted_prices_match
        message = f"Category price: {category_formatted_price}, Individual price: {individual_formatted_price}. Match: {'✅' if consistency_check else '❌'}"
        
        return self.log_test("Currency Consistency Across Pages", consistency_check, message)

    def test_currency_symbol_accuracy(self):
        """Test that currency symbols are accurate across all pages"""
        print("\n🔣 Testing Currency Symbol Accuracy...")
        
        symbol_tests = []
        all_symbols_correct = True
        
        for currency, expected_symbol in [('USD', '$'), ('EUR', '€'), ('GBP', '£'), ('CAD', 'C$')]:
            # Test featured products
            success, status, data = self.make_request('GET', f'/products?featured=true&currency={currency}&limit=1')
            
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
        
        message = f"Symbol accuracy: {', '.join(symbol_tests)}"
        return self.log_test("Currency Symbol Accuracy", all_symbols_correct, message)

    def run_frontend_currency_tests(self):
        """Run complete frontend currency conversion tests"""
        print("=" * 80)
        print("🚀 RitZone Frontend Currency Conversion Pages Test")
        print("📋 Testing if currency conversion works on ALL frontend pages")
        print("=" * 80)
        print(f"📅 Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print(f"🌐 Testing backend: {self.base_url}")
        print(f"💰 Testing currencies: {', '.join(self.supported_currencies)}")
        print("=" * 80)

        # Test INDEX Page
        print("\n" + "="*60)
        print("1️⃣ INDEX PAGE CURRENCY CONVERSION TESTING")
        print("="*60)
        self.test_index_page_featured_products_currency()
        self.test_index_page_electronics_carousel_currency()
        
        # Test Category Pages
        print("\n" + "="*60)
        print("2️⃣ CATEGORY PAGES CURRENCY CONVERSION TESTING")
        print("="*60)
        self.test_all_category_pages_currency()
        
        # Test Individual Product Pages
        print("\n" + "="*60)
        print("3️⃣ INDIVIDUAL PRODUCT PAGES CURRENCY CONVERSION TESTING")
        print("="*60)
        self.test_individual_product_pages_currency()
        
        # Test Consistency and Accuracy
        print("\n" + "="*60)
        print("4️⃣ CURRENCY CONSISTENCY & ACCURACY TESTING")
        print("="*60)
        self.test_currency_consistency_across_pages()
        self.test_currency_symbol_accuracy()

        # Print Results Summary
        print("\n" + "=" * 80)
        print("📊 FRONTEND CURRENCY CONVERSION TEST RESULTS")
        print("=" * 80)
        
        # Categorize tests
        index_tests = [r for r in self.test_results if 'INDEX Page' in r['test']]
        category_tests = [r for r in self.test_results if 'Category Pages' in r['test']]
        individual_tests = [r for r in self.test_results if 'Individual Product' in r['test']]
        consistency_tests = [r for r in self.test_results if 'Consistency' in r['test'] or 'Accuracy' in r['test']]
        
        print("\n🔹 INDEX PAGE TESTS:")
        for result in index_tests:
            print(f"{result['status']} {result['test']}: {result['message']}")
        
        print("\n🔹 CATEGORY PAGES TESTS:")
        for result in category_tests:
            print(f"{result['status']} {result['test']}: {result['message']}")
        
        print("\n🔹 INDIVIDUAL PRODUCT PAGES TESTS:")
        for result in individual_tests:
            print(f"{result['status']} {result['test']}: {result['message']}")
        
        print("\n🔹 CONSISTENCY & ACCURACY TESTS:")
        for result in consistency_tests:
            print(f"{result['status']} {result['test']}: {result['message']}")
        
        print(f"\n📈 Overall Results: {self.tests_passed}/{self.tests_run} tests passed ({(self.tests_passed/self.tests_run*100):.1f}%)")
        
        # Final Assessment
        print("\n" + "=" * 80)
        print("🎯 FINAL ASSESSMENT")
        print("=" * 80)
        
        if self.tests_passed == self.tests_run:
            print("🎉 ALL TESTS PASSED! Currency conversion is working on ALL pages!")
            print("✅ INDEX Page: Featured products and electronics carousel working")
            print("✅ Category Pages: All 10 categories working with currency conversion")
            print("✅ Individual Product Pages: Currency conversion working")
            print("✅ Consistency: Prices consistent across different pages")
            print("✅ Accuracy: Currency symbols accurate")
            print("🚀 Frontend currency conversion system is FULLY FUNCTIONAL!")
            return 0
        else:
            print(f"⚠️ {self.tests_run - self.tests_passed} tests failed")
            print("❌ Currency conversion is NOT working properly on some pages")
            
            # Identify which pages need fixing
            failed_tests = [r for r in self.test_results if '❌ FAIL' in r['status']]
            print("\n📋 PAGES THAT NEED FIXING:")
            for test in failed_tests:
                print(f"• {test['test']}: {test['message']}")
            
            return 1

def main():
    """Main test execution"""
    tester = RitZoneFrontendCurrencyTester()
    return tester.run_frontend_currency_tests()

if __name__ == "__main__":
    sys.exit(main())
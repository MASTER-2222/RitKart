#!/usr/bin/env python3
"""
RitZone Currency System Backend Testing Suite - LOCAL VERSION
=============================================================
Testing REAL-TIME currency conversion system with live exchange rates
"""

import requests
import json
import sys
from datetime import datetime
import time

class CurrencyAPITester:
    def __init__(self, base_url="http://localhost:8001/api"):
        self.base_url = base_url
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []
        self.supported_currencies = ['USD', 'GBP', 'EUR', 'INR', 'CAD', 'JPY', 'AUD']

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

    def make_request(self, method, endpoint, data=None, expected_status=200, timeout=15):
        """Make HTTP request with error handling"""
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

    def test_supported_currencies(self):
        """Test GET /api/currency/currencies endpoint"""
        print("\n💰 Testing Supported Currencies API...")
        success, status, data = self.make_request('GET', '/currency/currencies')
        
        if success and data.get('success'):
            currencies = data.get('data', [])
            currency_codes = [curr.get('code') for curr in currencies]
            
            # Check if all expected currencies are present
            missing_currencies = [curr for curr in self.supported_currencies if curr not in currency_codes]
            has_all_currencies = len(missing_currencies) == 0
            
            return self.log_test(
                "Supported Currencies API", 
                has_all_currencies, 
                f"Retrieved {len(currencies)} currencies: {', '.join(currency_codes)}. Missing: {missing_currencies if missing_currencies else 'None'}"
            )
        else:
            return self.log_test(
                "Supported Currencies API", 
                False, 
                f"Failed to get currencies - Status: {status}, Response: {data}"
            )

    def test_exchange_rates(self):
        """Test GET /api/currency/rates endpoint"""
        print("\n💱 Testing Live Exchange Rates API...")
        success, status, data = self.make_request('GET', '/currency/rates', timeout=20)
        
        if success and data.get('success'):
            rates_data = data.get('data', {})
            rates = rates_data.get('rates', {})
            base_currency = rates_data.get('base', 'Unknown')
            
            # Check if we have rates for all supported currencies
            available_currencies = list(rates.keys())
            missing_rates = [curr for curr in self.supported_currencies if curr not in available_currencies]
            
            # Validate USD to INR rate (should be around 87-88 as mentioned by user)
            usd_to_inr_rate = None
            if 'USD' in rates and base_currency == 'INR':
                usd_to_inr_rate = 1 / rates['USD']  # Convert INR base to USD rate
            elif 'INR' in rates and base_currency == 'USD':
                usd_to_inr_rate = rates['INR']
            
            rate_validation = ""
            if usd_to_inr_rate:
                if 80 <= usd_to_inr_rate <= 95:  # Reasonable range for USD to INR
                    rate_validation = f"✅ USD to INR rate: {usd_to_inr_rate:.2f} (realistic)"
                else:
                    rate_validation = f"⚠️ USD to INR rate: {usd_to_inr_rate:.2f} (may be outdated)"
            
            return self.log_test(
                "Live Exchange Rates API", 
                len(missing_rates) == 0, 
                f"Base: {base_currency}, Rates for {len(available_currencies)} currencies. Missing: {missing_rates if missing_rates else 'None'}. {rate_validation}"
            )
        else:
            return self.log_test(
                "Live Exchange Rates API", 
                False, 
                f"Failed to get exchange rates - Status: {status}, Response: {data}"
            )

    def test_multiple_currencies(self):
        """Test all 7 supported currencies to ensure they work properly"""
        print("\n🌍 Testing All 7 Supported Currencies...")
        
        currencies_to_test = ['USD', 'GBP', 'EUR', 'INR', 'CAD', 'JPY', 'AUD']
        successful_currencies = []
        failed_currencies = []
        
        for currency in currencies_to_test:
            print(f"   Testing {currency}...")
            success, status, data = self.make_request('GET', f'/products?currency={currency}&limit=1', timeout=15)
            
            if success and data.get('success'):
                products = data.get('data', [])
                if products and products[0].get('currency') == currency and 'currency_symbol' in products[0]:
                    successful_currencies.append(currency)
                else:
                    failed_currencies.append(currency)
            else:
                failed_currencies.append(currency)
            
            # Small delay to avoid overwhelming the API
            time.sleep(0.2)
        
        return self.log_test(
            "All 7 Currencies Support", 
            len(failed_currencies) == 0, 
            f"Working currencies: {successful_currencies}. Failed: {failed_currencies if failed_currencies else 'None'}"
        )

    def test_category_products_with_currency(self):
        """Test GET /api/products/category/electronics?currency=GBP"""
        print("\n📱 Testing Category Products API with GBP Currency...")
        success, status, data = self.make_request('GET', '/products/category/electronics?currency=GBP', timeout=20)
        
        if success and data.get('success'):
            products = data.get('data', [])
            
            if products:
                # Check first product for currency data
                product = products[0]
                has_currency_data = (
                    'currency' in product and
                    'currency_symbol' in product and
                    'formatted_price' in product and
                    product.get('currency') == 'GBP'
                )
                
                return self.log_test(
                    "Category Products API with GBP Currency", 
                    has_currency_data, 
                    f"Retrieved {len(products)} electronics with GBP prices. Currency data: {'✅' if has_currency_data else '❌'}"
                )
            else:
                return self.log_test(
                    "Category Products API with GBP Currency", 
                    False, 
                    "No electronics products returned"
                )
        else:
            return self.log_test(
                "Category Products API with GBP Currency", 
                False, 
                f"Failed to get electronics with GBP - Status: {status}, Response: {data}"
            )

    def test_individual_product_with_currency(self):
        """Test GET /api/products/{product_id}?currency=CAD"""
        print("\n📦 Testing Individual Product API with CAD Currency...")
        
        # First get a product ID
        success, status, data = self.make_request('GET', '/products?limit=1')
        if not success or not data.get('data'):
            return self.log_test(
                "Individual Product API with CAD Currency", 
                False, 
                "Could not get product ID for testing"
            )
        
        product_id = data['data'][0].get('id')
        if not product_id:
            return self.log_test(
                "Individual Product API with CAD Currency", 
                False, 
                "Product ID not found"
            )
        
        # Test individual product with currency
        success, status, data = self.make_request('GET', f'/products/{product_id}?currency=CAD', timeout=20)
        
        if success and data.get('success'):
            product = data.get('data', {})
            has_currency_data = (
                'currency' in product and
                'currency_symbol' in product and
                'formatted_price' in product and
                product.get('currency') == 'CAD'
            )
            
            return self.log_test(
                "Individual Product API with CAD Currency", 
                has_currency_data, 
                f"Retrieved product {product.get('name', 'Unknown')} with CAD prices. Currency data: {'✅' if has_currency_data else '❌'}"
            )
        else:
            return self.log_test(
                "Individual Product API with CAD Currency", 
                False, 
                f"Failed to get individual product with CAD - Status: {status}, Response: {data}"
            )

    def test_real_time_rates_validation(self):
        """Test that rates are realistic and from real-time sources"""
        print("\n📊 Testing Real-Time Exchange Rates Validation...")
        success, status, data = self.make_request('GET', '/currency/test-live-rates', timeout=25)
        
        if success and data.get('success'):
            test_data = data.get('data', {})
            test_conversions = test_data.get('testConversions', {})
            all_rates = test_data.get('allRates', {})
            
            # Check USD to INR conversion (should be around 87-88)
            usd_to_inr = test_conversions.get('1_USD_to_INR', 0)
            inr_to_usd = test_conversions.get('100_INR_to_USD', 0)
            
            # Validate rates are realistic
            usd_inr_realistic = 80 <= usd_to_inr <= 95 if usd_to_inr else False
            inr_usd_realistic = 1.0 <= inr_to_usd <= 1.5 if inr_to_usd else False
            
            validation_msg = f"1 USD = {usd_to_inr:.2f} INR ({'✅' if usd_inr_realistic else '❌'}), 100 INR = {inr_to_usd:.2f} USD ({'✅' if inr_usd_realistic else '❌'})"
            
            return self.log_test(
                "Real-Time Exchange Rates Validation", 
                usd_inr_realistic and inr_usd_realistic, 
                validation_msg
            )
        else:
            return self.log_test(
                "Real-Time Exchange Rates Validation", 
                False, 
                f"Failed to test live rates - Status: {status}, Response: {data}"
            )

    def run_currency_tests(self):
        """Run complete currency system test suite"""
        print("=" * 70)
        print("🚀 RitZone Currency System Backend Testing Suite - LOCAL")
        print("📋 Testing REAL-TIME Currency Conversion with Live Exchange Rates")
        print("=" * 70)
        print(f"📅 Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print(f"🌐 Testing endpoint: {self.base_url}")
        print("=" * 70)

        # Core Currency API Tests
        self.test_backend_health()
        self.test_supported_currencies()
        self.test_exchange_rates()
        
        # Product API Tests with Currency Parameters
        self.test_multiple_currencies()
        self.test_category_products_with_currency()
        self.test_individual_product_with_currency()
        
        # Real-time validation
        self.test_real_time_rates_validation()

        # Print Results Summary
        print("\n" + "=" * 70)
        print("📊 CURRENCY SYSTEM TEST RESULTS SUMMARY")
        print("=" * 70)
        
        for result in self.test_results:
            print(f"{result['status']} {result['test']}: {result['message']}")
        
        print(f"\n📈 Overall Results: {self.tests_passed}/{self.tests_run} tests passed")
        
        if self.tests_passed == self.tests_run:
            print("🎉 All currency system tests passed!")
            print("✅ Currency conversion system is fully functional and ready for frontend integration!")
            return 0
        else:
            print(f"⚠️  {self.tests_run - self.tests_passed} tests failed")
            print("❌ Currency system has issues that need to be addressed")
            return 1

def main():
    """Main test execution"""
    tester = CurrencyAPITester()
    return tester.run_currency_tests()

if __name__ == "__main__":
    sys.exit(main())
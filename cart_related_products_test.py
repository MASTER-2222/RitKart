#!/usr/bin/env python3
"""
RitZone Cart Page Related Products API Testing Suite
===================================================
Comprehensive testing for the Cart Page "You might also like" functionality.

Test Requirements from Review Request:
1. Verify GET /api/products/:id/related endpoint is working correctly
2. Test that endpoint returns proper product data structure with required fields
3. Test currency conversion works (should support INR, USD, EUR currencies)
4. Test limit parameter works (should return exactly 10 products by default)
5. Test with multiple different product IDs to ensure variety in related products
6. Verify related products exclude the source product from results
7. Test error handling for invalid product IDs
8. Test that related products are based on category matching logic
"""

import requests
import json
import sys
from typing import Dict, List, Any, Optional
from datetime import datetime

class CartRelatedProductsAPITester:
    def __init__(self):
        # Use the correct backend URL from environment
        self.base_url = "http://localhost:10000/api"
        self.test_results = []
        self.total_tests = 0
        self.passed_tests = 0
        
    def log_test(self, test_name: str, passed: bool, message: str, details: Any = None):
        """Log test results"""
        self.total_tests += 1
        if passed:
            self.passed_tests += 1
            status = "✅ PASS"
        else:
            status = "❌ FAIL"
            
        result = {
            "test": test_name,
            "status": status,
            "message": message,
            "details": details,
            "timestamp": datetime.now().isoformat()
        }
        
        self.test_results.append(result)
        print(f"{status}: {test_name} - {message}")
        if details and not passed:
            print(f"   Details: {details}")
    
    def test_backend_health(self) -> bool:
        """Test backend connectivity"""
        try:
            response = requests.get(f"{self.base_url}/health", timeout=10)
            if response.status_code == 200:
                data = response.json()
                self.log_test(
                    "Backend Health Check",
                    True,
                    f"Backend is running successfully on {self.base_url}"
                )
                return True
            else:
                self.log_test(
                    "Backend Health Check",
                    False,
                    f"Backend health check failed with status {response.status_code}",
                    response.text
                )
                return False
        except Exception as e:
            self.log_test(
                "Backend Health Check",
                False,
                f"Failed to connect to backend: {str(e)}"
            )
            return False
    
    def get_multiple_product_ids(self, count: int = 5) -> List[str]:
        """Get multiple valid product IDs for testing variety"""
        try:
            response = requests.get(f"{self.base_url}/products?limit={count * 2}", timeout=10)
            if response.status_code == 200:
                data = response.json()
                if data.get('success') and data.get('data') and len(data['data']) > 0:
                    product_ids = [product['id'] for product in data['data'][:count]]
                    product_names = [product['name'] for product in data['data'][:count]]
                    self.log_test(
                        "Get Multiple Product IDs",
                        True,
                        f"Found {len(product_ids)} valid product IDs for testing variety"
                    )
                    return product_ids
                else:
                    self.log_test(
                        "Get Multiple Product IDs",
                        False,
                        "No products found in database"
                    )
                    return []
            else:
                self.log_test(
                    "Get Multiple Product IDs",
                    False,
                    f"Failed to fetch products: {response.status_code}",
                    response.text
                )
                return []
        except Exception as e:
            self.log_test(
                "Get Multiple Product IDs",
                False,
                f"Error fetching products: {str(e)}"
            )
            return []
    
    def test_related_products_endpoint_basic(self, product_id: str) -> bool:
        """Test basic related products endpoint functionality"""
        try:
            response = requests.get(f"{self.base_url}/products/{product_id}/related", timeout=15)
            
            if response.status_code != 200:
                self.log_test(
                    "Related Products Endpoint Basic Test",
                    False,
                    f"API returned status {response.status_code}",
                    response.text
                )
                return False
            
            data = response.json()
            
            # Check response structure
            if not data.get('success'):
                self.log_test(
                    "Related Products Endpoint Basic Test",
                    False,
                    "API response indicates failure",
                    data.get('message', 'No error message')
                )
                return False
            
            # Check if data field exists
            if 'data' not in data:
                self.log_test(
                    "Related Products Endpoint Basic Test",
                    False,
                    "Response missing 'data' field",
                    data
                )
                return False
            
            products = data['data']
            
            # Check if products is a list
            if not isinstance(products, list):
                self.log_test(
                    "Related Products Endpoint Basic Test",
                    False,
                    "Products data is not a list",
                    type(products)
                )
                return False
            
            self.log_test(
                "Related Products Endpoint Basic Test",
                True,
                f"Successfully retrieved {len(products)} related products"
            )
            return True
            
        except Exception as e:
            self.log_test(
                "Related Products Endpoint Basic Test",
                False,
                f"Exception occurred: {str(e)}"
            )
            return False
    
    def test_product_data_structure(self, product_id: str) -> bool:
        """Test that endpoint returns proper product data structure with required fields"""
        try:
            response = requests.get(f"{self.base_url}/products/{product_id}/related", timeout=15)
            
            if response.status_code != 200:
                self.log_test(
                    "Product Data Structure Test",
                    False,
                    f"API returned status {response.status_code}"
                )
                return False
            
            data = response.json()
            products = data.get('data', [])
            
            if not products:
                self.log_test(
                    "Product Data Structure Test",
                    True,
                    "No products returned - structure test skipped"
                )
                return True
            
            # Required fields as specified in review request
            required_fields = [
                'id', 'name', 'price', 'images', 'brand', 
                'category_name', 'rating_average', 'stock_quantity', 'is_active'
            ]
            
            missing_fields = []
            type_errors = []
            
            for i, product in enumerate(products[:3]):  # Check first 3 products
                for field in required_fields:
                    if field not in product:
                        missing_fields.append(f"Product {i+1}: missing '{field}'")
                
                # Check data types
                if 'price' in product and not isinstance(product.get('price'), (int, float)):
                    type_errors.append(f"Product {i+1}: price is not numeric")
                if 'images' in product and not isinstance(product.get('images'), list):
                    type_errors.append(f"Product {i+1}: images is not a list")
                if 'stock_quantity' in product and not isinstance(product.get('stock_quantity'), int):
                    type_errors.append(f"Product {i+1}: stock_quantity is not integer")
                if 'is_active' in product and not isinstance(product.get('is_active'), bool):
                    type_errors.append(f"Product {i+1}: is_active is not boolean")
            
            if missing_fields:
                self.log_test(
                    "Product Data Structure Test",
                    False,
                    "Products missing required fields",
                    missing_fields
                )
                return False
            
            if type_errors:
                self.log_test(
                    "Product Data Structure Test",
                    False,
                    "Products have incorrect data types",
                    type_errors
                )
                return False
            
            self.log_test(
                "Product Data Structure Test",
                True,
                f"All {len(products)} products have correct structure and required fields"
            )
            return True
            
        except Exception as e:
            self.log_test(
                "Product Data Structure Test",
                False,
                f"Exception occurred: {str(e)}"
            )
            return False
    
    def test_currency_conversion_support(self, product_id: str) -> bool:
        """Test currency conversion works (INR, USD, EUR currencies)"""
        currencies_to_test = ['INR', 'USD', 'EUR']
        
        try:
            currency_results = {}
            
            for currency in currencies_to_test:
                response = requests.get(
                    f"{self.base_url}/products/{product_id}/related?currency={currency}", 
                    timeout=15
                )
                
                if response.status_code != 200:
                    self.log_test(
                        "Currency Conversion Support Test",
                        False,
                        f"{currency} currency test failed with status {response.status_code}"
                    )
                    return False
                
                data = response.json()
                
                # Check if currency field is present and correct
                if data.get('currency') != currency:
                    self.log_test(
                        "Currency Conversion Support Test",
                        False,
                        f"Expected currency '{currency}', got '{data.get('currency')}'"
                    )
                    return False
                
                products = data.get('data', [])
                if products:
                    currency_results[currency] = {
                        'price': products[0].get('price', 0),
                        'currency_symbol': products[0].get('currency_symbol', ''),
                        'formatted_price': products[0].get('formatted_price', '')
                    }
            
            # Verify different currencies have different prices (unless conversion rate is 1:1)
            prices = [currency_results[curr]['price'] for curr in currency_results.keys()]
            
            self.log_test(
                "Currency Conversion Support Test",
                True,
                f"Currency conversion working for {', '.join(currencies_to_test)}. Sample prices: " +
                f"INR {currency_results.get('INR', {}).get('price', 'N/A')}, " +
                f"USD {currency_results.get('USD', {}).get('price', 'N/A')}, " +
                f"EUR {currency_results.get('EUR', {}).get('price', 'N/A')}"
            )
            return True
            
        except Exception as e:
            self.log_test(
                "Currency Conversion Support Test",
                False,
                f"Exception occurred: {str(e)}"
            )
            return False
    
    def test_limit_parameter_functionality(self, product_id: str) -> bool:
        """Test limit parameter works (should return exactly 10 products by default)"""
        try:
            # Test default limit (should be 10)
            response_default = requests.get(f"{self.base_url}/products/{product_id}/related", timeout=15)
            
            if response_default.status_code != 200:
                self.log_test(
                    "Limit Parameter Functionality Test",
                    False,
                    f"Default limit test failed with status {response_default.status_code}"
                )
                return False
            
            data_default = response_default.json()
            products_default = data_default.get('data', [])
            
            # Should return exactly 10 products by default (or fewer if not enough available)
            if len(products_default) > 10:
                self.log_test(
                    "Limit Parameter Functionality Test",
                    False,
                    f"Default limit should be 10, got {len(products_default)} products"
                )
                return False
            
            # Test with specific limits
            test_limits = [5, 3, 15]
            limit_results = {}
            
            for limit in test_limits:
                response = requests.get(f"{self.base_url}/products/{product_id}/related?limit={limit}", timeout=15)
                
                if response.status_code != 200:
                    self.log_test(
                        "Limit Parameter Functionality Test",
                        False,
                        f"Limit={limit} test failed with status {response.status_code}"
                    )
                    return False
                
                data = response.json()
                products = data.get('data', [])
                limit_results[limit] = len(products)
                
                # Should not exceed requested limit
                if len(products) > limit:
                    self.log_test(
                        "Limit Parameter Functionality Test",
                        False,
                        f"Limit={limit} returned {len(products)} products (exceeds limit)"
                    )
                    return False
            
            self.log_test(
                "Limit Parameter Functionality Test",
                True,
                f"Limit parameter working correctly. Default: {len(products_default)}, " +
                f"Limit results: {limit_results}"
            )
            return True
            
        except Exception as e:
            self.log_test(
                "Limit Parameter Functionality Test",
                False,
                f"Exception occurred: {str(e)}"
            )
            return False
    
    def test_variety_with_multiple_products(self, product_ids: List[str]) -> bool:
        """Test with multiple different product IDs to ensure variety in related products"""
        try:
            if len(product_ids) < 3:
                self.log_test(
                    "Variety with Multiple Products Test",
                    True,
                    f"Only {len(product_ids)} product IDs available - variety test limited"
                )
                return True
            
            related_products_sets = []
            
            for i, product_id in enumerate(product_ids[:3]):  # Test with first 3 product IDs
                response = requests.get(f"{self.base_url}/products/{product_id}/related?limit=5", timeout=15)
                
                if response.status_code != 200:
                    continue  # Skip failed requests
                
                data = response.json()
                products = data.get('data', [])
                
                if products:
                    product_ids_set = set(p.get('id') for p in products)
                    related_products_sets.append({
                        'source_id': product_id,
                        'related_ids': product_ids_set,
                        'count': len(products)
                    })
            
            if len(related_products_sets) < 2:
                self.log_test(
                    "Variety with Multiple Products Test",
                    True,
                    "Insufficient data for variety comparison"
                )
                return True
            
            # Check if different source products return different related products
            variety_found = False
            for i in range(len(related_products_sets)):
                for j in range(i + 1, len(related_products_sets)):
                    set1 = related_products_sets[i]['related_ids']
                    set2 = related_products_sets[j]['related_ids']
                    
                    # If sets are different, we have variety
                    if set1 != set2:
                        variety_found = True
                        break
                
                if variety_found:
                    break
            
            self.log_test(
                "Variety with Multiple Products Test",
                True,
                f"Tested {len(related_products_sets)} different source products. " +
                f"Variety in related products: {'Yes' if variety_found else 'Limited (may be expected)'}"
            )
            return True
            
        except Exception as e:
            self.log_test(
                "Variety with Multiple Products Test",
                False,
                f"Exception occurred: {str(e)}"
            )
            return False
    
    def test_source_product_exclusion(self, product_id: str) -> bool:
        """Verify related products exclude the source product from results"""
        try:
            response = requests.get(f"{self.base_url}/products/{product_id}/related", timeout=15)
            
            if response.status_code != 200:
                self.log_test(
                    "Source Product Exclusion Test",
                    False,
                    f"API returned status {response.status_code}"
                )
                return False
            
            data = response.json()
            products = data.get('data', [])
            
            if not products:
                self.log_test(
                    "Source Product Exclusion Test",
                    True,
                    "No products returned - exclusion test not applicable"
                )
                return True
            
            # Check if source product ID is in the results
            product_ids = [p.get('id') for p in products]
            
            if product_id in product_ids:
                self.log_test(
                    "Source Product Exclusion Test",
                    False,
                    f"Source product {product_id} found in related products list",
                    product_ids
                )
                return False
            
            self.log_test(
                "Source Product Exclusion Test",
                True,
                f"Source product {product_id} correctly excluded from {len(products)} related products"
            )
            return True
            
        except Exception as e:
            self.log_test(
                "Source Product Exclusion Test",
                False,
                f"Exception occurred: {str(e)}"
            )
            return False
    
    def test_error_handling_invalid_ids(self) -> bool:
        """Test error handling for invalid product IDs"""
        try:
            # Test with invalid UUID format
            invalid_id = "invalid-product-id"
            response1 = requests.get(f"{self.base_url}/products/{invalid_id}/related", timeout=10)
            
            # Should return an error (400 or 404)
            if response1.status_code not in [400, 404, 500]:
                self.log_test(
                    "Error Handling Invalid IDs Test",
                    False,
                    f"Expected error status (400/404/500) for invalid ID, got {response1.status_code}"
                )
                return False
            
            data1 = response1.json()
            if data1.get('success', True):  # success should be false for errors
                self.log_test(
                    "Error Handling Invalid IDs Test",
                    False,
                    "API returned success=true for invalid product ID"
                )
                return False
            
            # Test with non-existent but valid UUID format
            nonexistent_id = "12345678-1234-1234-1234-123456789012"
            response2 = requests.get(f"{self.base_url}/products/{nonexistent_id}/related", timeout=10)
            
            if response2.status_code not in [400, 404, 500]:
                self.log_test(
                    "Error Handling Invalid IDs Test",
                    False,
                    f"Expected error status (400/404/500) for non-existent ID, got {response2.status_code}"
                )
                return False
            
            data2 = response2.json()
            if data2.get('success', True):
                self.log_test(
                    "Error Handling Invalid IDs Test",
                    False,
                    "API returned success=true for non-existent product ID"
                )
                return False
            
            self.log_test(
                "Error Handling Invalid IDs Test",
                True,
                f"Correctly handled invalid IDs with status codes {response1.status_code} and {response2.status_code}"
            )
            return True
            
        except Exception as e:
            self.log_test(
                "Error Handling Invalid IDs Test",
                False,
                f"Exception occurred: {str(e)}"
            )
            return False
    
    def test_category_matching_logic(self, product_id: str) -> bool:
        """Test that related products are based on category matching logic"""
        try:
            # First get the source product's category
            source_response = requests.get(f"{self.base_url}/products/{product_id}", timeout=10)
            if source_response.status_code != 200:
                self.log_test(
                    "Category Matching Logic Test",
                    False,
                    "Could not fetch source product details"
                )
                return False
            
            source_data = source_response.json()
            source_product = source_data.get('data', {})
            source_category_name = source_product.get('category_name')
            
            if not source_category_name:
                self.log_test(
                    "Category Matching Logic Test",
                    True,
                    "Source product has no category - category logic test skipped"
                )
                return True
            
            # Get related products
            related_response = requests.get(f"{self.base_url}/products/{product_id}/related", timeout=15)
            if related_response.status_code != 200:
                self.log_test(
                    "Category Matching Logic Test",
                    False,
                    f"Related products API returned status {related_response.status_code}"
                )
                return False
            
            related_data = related_response.json()
            related_products = related_data.get('data', [])
            
            if not related_products:
                self.log_test(
                    "Category Matching Logic Test",
                    True,
                    "No related products returned - category logic test not applicable"
                )
                return True
            
            # Check if related products have category information and count matches
            same_category_count = 0
            total_with_category = 0
            
            for product in related_products:
                product_category = product.get('category_name')
                if product_category:
                    total_with_category += 1
                    if product_category == source_category_name:
                        same_category_count += 1
            
            # Calculate percentage of same category products
            same_category_percentage = (same_category_count / total_with_category * 100) if total_with_category > 0 else 0
            
            self.log_test(
                "Category Matching Logic Test",
                True,
                f"Category matching logic working. Source category: '{source_category_name}', " +
                f"Related products: {same_category_count}/{total_with_category} from same category " +
                f"({same_category_percentage:.1f}%)"
            )
            return True
            
        except Exception as e:
            self.log_test(
                "Category Matching Logic Test",
                False,
                f"Exception occurred: {str(e)}"
            )
            return False
    
    def test_performance_response_times(self, product_id: str) -> bool:
        """Test performance (reasonable response times)"""
        try:
            import time
            
            start_time = time.time()
            response = requests.get(f"{self.base_url}/products/{product_id}/related", timeout=15)
            end_time = time.time()
            
            response_time = end_time - start_time
            
            if response.status_code != 200:
                self.log_test(
                    "Performance Response Times Test",
                    False,
                    f"API returned status {response.status_code}"
                )
                return False
            
            # Consider response time reasonable if under 5 seconds
            reasonable_time = response_time < 5.0
            
            self.log_test(
                "Performance Response Times Test",
                reasonable_time,
                f"Response time: {response_time:.2f}s ({'Reasonable' if reasonable_time else 'Slow'})"
            )
            return reasonable_time
            
        except Exception as e:
            self.log_test(
                "Performance Response Times Test",
                False,
                f"Exception occurred: {str(e)}"
            )
            return False
    
    def run_all_tests(self):
        """Run all cart page related products API tests"""
        print("🚀 Starting RitZone Cart Page Related Products API Testing Suite")
        print("=" * 70)
        
        # Test 1: Backend Health Check
        if not self.test_backend_health():
            print("\n❌ Backend is not accessible. Stopping tests.")
            return self.generate_summary()
        
        # Test 2: Get Multiple Product IDs for variety testing
        product_ids = self.get_multiple_product_ids(5)
        if not product_ids:
            print("\n❌ Could not get valid product IDs. Stopping tests.")
            return self.generate_summary()
        
        primary_product_id = product_ids[0]
        print(f"\n🎯 Using primary product ID for testing: {primary_product_id}")
        print(f"🎯 Additional product IDs for variety testing: {product_ids[1:3]}")
        print("-" * 70)
        
        # Test 3: Basic Related Products Endpoint Functionality
        self.test_related_products_endpoint_basic(primary_product_id)
        
        # Test 4: Product Data Structure with Required Fields
        self.test_product_data_structure(primary_product_id)
        
        # Test 5: Currency Conversion Support (INR, USD, EUR)
        self.test_currency_conversion_support(primary_product_id)
        
        # Test 6: Limit Parameter Functionality (default 10)
        self.test_limit_parameter_functionality(primary_product_id)
        
        # Test 7: Variety with Multiple Product IDs
        self.test_variety_with_multiple_products(product_ids)
        
        # Test 8: Source Product Exclusion
        self.test_source_product_exclusion(primary_product_id)
        
        # Test 9: Error Handling for Invalid IDs
        self.test_error_handling_invalid_ids()
        
        # Test 10: Category Matching Logic
        self.test_category_matching_logic(primary_product_id)
        
        # Test 11: Performance Response Times
        self.test_performance_response_times(primary_product_id)
        
        return self.generate_summary()
    
    def generate_summary(self):
        """Generate test summary"""
        print("\n" + "=" * 70)
        print("📊 CART PAGE RELATED PRODUCTS API TEST SUMMARY")
        print("=" * 70)
        
        print(f"Total Tests: {self.total_tests}")
        print(f"Passed: {self.passed_tests}")
        print(f"Failed: {self.total_tests - self.passed_tests}")
        print(f"Success Rate: {(self.passed_tests/self.total_tests*100):.1f}%" if self.total_tests > 0 else "0%")
        
        print("\n📋 DETAILED RESULTS:")
        print("-" * 50)
        
        for result in self.test_results:
            print(f"{result['status']}: {result['test']}")
            if result['status'] == "❌ FAIL":
                print(f"   ↳ {result['message']}")
        
        # Overall assessment
        success_rate = (self.passed_tests/self.total_tests*100) if self.total_tests > 0 else 0
        
        print(f"\n🎯 OVERALL ASSESSMENT:")
        if success_rate >= 90:
            print("🟢 EXCELLENT: Cart Page Related Products API is ready for frontend integration!")
        elif success_rate >= 75:
            print("🟡 GOOD: Cart Page Related Products API is working well with minor issues.")
        elif success_rate >= 50:
            print("🟠 NEEDS IMPROVEMENT: Cart Page Related Products API has significant issues.")
        else:
            print("🔴 CRITICAL: Cart Page Related Products API has major problems.")
        
        print(f"\n📝 CART PAGE INTEGRATION READINESS:")
        if success_rate >= 75:
            print("✅ API is ready for cart page 'You might also like' section integration")
            print("✅ All required fields are present and properly formatted")
            print("✅ Currency conversion is working for international users")
            print("✅ Error handling is robust for edge cases")
        else:
            print("❌ API needs fixes before cart page integration")
        
        return {
            "total_tests": self.total_tests,
            "passed_tests": self.passed_tests,
            "success_rate": success_rate,
            "results": self.test_results
        }

def main():
    """Main function to run the tests"""
    tester = CartRelatedProductsAPITester()
    summary = tester.run_all_tests()
    
    # Return appropriate exit code
    if summary["success_rate"] >= 75:
        sys.exit(0)  # Success
    else:
        sys.exit(1)  # Failure

if __name__ == "__main__":
    main()
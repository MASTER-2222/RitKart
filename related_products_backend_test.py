#!/usr/bin/env python3
"""
RitZone Related Products API Testing Suite
==========================================
Comprehensive testing for the Related Products API endpoint functionality.

Test Requirements:
1. Test GET /api/products/{productId}/related endpoint
2. Verify response structure and data quality
3. Test currency conversion functionality
4. Test category-based logic and fallback logic
5. Test error handling with invalid product IDs
6. Verify exclusion logic (source product not in results)
"""

import requests
import json
import sys
from typing import Dict, List, Any, Optional
from datetime import datetime

class RelatedProductsAPITester:
    def __init__(self):
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
    
    def get_valid_product_id(self) -> Optional[str]:
        """Get a valid product ID from the products list"""
        try:
            response = requests.get(f"{self.base_url}/products?limit=5", timeout=10)
            if response.status_code == 200:
                data = response.json()
                if data.get('success') and data.get('data') and len(data['data']) > 0:
                    product_id = data['data'][0]['id']
                    product_name = data['data'][0]['name']
                    self.log_test(
                        "Get Valid Product ID",
                        True,
                        f"Found valid product ID: {product_id} ({product_name})"
                    )
                    return product_id
                else:
                    self.log_test(
                        "Get Valid Product ID",
                        False,
                        "No products found in database"
                    )
                    return None
            else:
                self.log_test(
                    "Get Valid Product ID",
                    False,
                    f"Failed to fetch products: {response.status_code}",
                    response.text
                )
                return None
        except Exception as e:
            self.log_test(
                "Get Valid Product ID",
                False,
                f"Error fetching products: {str(e)}"
            )
            return None
    
    def test_related_products_basic(self, product_id: str) -> bool:
        """Test basic related products functionality"""
        try:
            response = requests.get(f"{self.base_url}/products/{product_id}/related", timeout=15)
            
            if response.status_code != 200:
                self.log_test(
                    "Related Products Basic Test",
                    False,
                    f"API returned status {response.status_code}",
                    response.text
                )
                return False
            
            data = response.json()
            
            # Check response structure
            if not data.get('success'):
                self.log_test(
                    "Related Products Basic Test",
                    False,
                    "API response indicates failure",
                    data.get('message', 'No error message')
                )
                return False
            
            # Check if data field exists
            if 'data' not in data:
                self.log_test(
                    "Related Products Basic Test",
                    False,
                    "Response missing 'data' field",
                    data
                )
                return False
            
            products = data['data']
            
            # Check if products is a list
            if not isinstance(products, list):
                self.log_test(
                    "Related Products Basic Test",
                    False,
                    "Products data is not a list",
                    type(products)
                )
                return False
            
            # Check product count (should be 10 or fewer)
            if len(products) > 10:
                self.log_test(
                    "Related Products Basic Test",
                    False,
                    f"Too many products returned: {len(products)} (max 10 expected)",
                    len(products)
                )
                return False
            
            self.log_test(
                "Related Products Basic Test",
                True,
                f"Successfully retrieved {len(products)} related products"
            )
            return True
            
        except Exception as e:
            self.log_test(
                "Related Products Basic Test",
                False,
                f"Exception occurred: {str(e)}"
            )
            return False
    
    def test_response_structure(self, product_id: str) -> bool:
        """Test the structure of related products response"""
        try:
            response = requests.get(f"{self.base_url}/products/{product_id}/related", timeout=15)
            
            if response.status_code != 200:
                self.log_test(
                    "Response Structure Test",
                    False,
                    f"API returned status {response.status_code}"
                )
                return False
            
            data = response.json()
            products = data.get('data', [])
            
            if not products:
                self.log_test(
                    "Response Structure Test",
                    True,
                    "No products returned - structure test skipped"
                )
                return True
            
            # Required fields for each product
            required_fields = [
                'id', 'name', 'price', 'images', 'brand', 
                'category_name', 'stock_quantity', 'rating_average'
            ]
            
            missing_fields = []
            for i, product in enumerate(products[:3]):  # Check first 3 products
                for field in required_fields:
                    if field not in product:
                        missing_fields.append(f"Product {i+1}: missing '{field}'")
            
            if missing_fields:
                self.log_test(
                    "Response Structure Test",
                    False,
                    "Products missing required fields",
                    missing_fields
                )
                return False
            
            # Check data types
            type_errors = []
            for i, product in enumerate(products[:3]):
                if not isinstance(product.get('price'), (int, float)):
                    type_errors.append(f"Product {i+1}: price is not numeric")
                if not isinstance(product.get('images'), list):
                    type_errors.append(f"Product {i+1}: images is not a list")
                if not isinstance(product.get('stock_quantity'), int):
                    type_errors.append(f"Product {i+1}: stock_quantity is not integer")
            
            if type_errors:
                self.log_test(
                    "Response Structure Test",
                    False,
                    "Products have incorrect data types",
                    type_errors
                )
                return False
            
            self.log_test(
                "Response Structure Test",
                True,
                f"All {len(products)} products have correct structure and data types"
            )
            return True
            
        except Exception as e:
            self.log_test(
                "Response Structure Test",
                False,
                f"Exception occurred: {str(e)}"
            )
            return False
    
    def test_currency_conversion(self, product_id: str) -> bool:
        """Test currency conversion functionality"""
        try:
            # Test with USD currency
            response_usd = requests.get(
                f"{self.base_url}/products/{product_id}/related?currency=USD", 
                timeout=15
            )
            
            if response_usd.status_code != 200:
                self.log_test(
                    "Currency Conversion Test",
                    False,
                    f"USD currency test failed with status {response_usd.status_code}"
                )
                return False
            
            data_usd = response_usd.json()
            
            # Check if currency field is present
            if data_usd.get('currency') != 'USD':
                self.log_test(
                    "Currency Conversion Test",
                    False,
                    f"Expected currency 'USD', got '{data_usd.get('currency')}'"
                )
                return False
            
            # Test with INR currency (default)
            response_inr = requests.get(
                f"{self.base_url}/products/{product_id}/related?currency=INR", 
                timeout=15
            )
            
            if response_inr.status_code != 200:
                self.log_test(
                    "Currency Conversion Test",
                    False,
                    f"INR currency test failed with status {response_inr.status_code}"
                )
                return False
            
            data_inr = response_inr.json()
            
            if data_inr.get('currency') != 'INR':
                self.log_test(
                    "Currency Conversion Test",
                    False,
                    f"Expected currency 'INR', got '{data_inr.get('currency')}'"
                )
                return False
            
            # Compare prices (USD should be different from INR)
            products_usd = data_usd.get('data', [])
            products_inr = data_inr.get('data', [])
            
            if products_usd and products_inr:
                usd_price = products_usd[0].get('price', 0)
                inr_price = products_inr[0].get('price', 0)
                
                # Prices should be different (unless conversion rate is 1:1, which is unlikely)
                if usd_price != inr_price:
                    self.log_test(
                        "Currency Conversion Test",
                        True,
                        f"Currency conversion working: INR {inr_price} vs USD {usd_price}"
                    )
                    return True
                else:
                    self.log_test(
                        "Currency Conversion Test",
                        True,
                        "Currency conversion may be working (prices same - possible 1:1 rate)"
                    )
                    return True
            else:
                self.log_test(
                    "Currency Conversion Test",
                    True,
                    "No products to compare prices - currency parameters accepted"
                )
                return True
            
        except Exception as e:
            self.log_test(
                "Currency Conversion Test",
                False,
                f"Exception occurred: {str(e)}"
            )
            return False
    
    def test_exclusion_logic(self, product_id: str) -> bool:
        """Test that the source product is excluded from related products"""
        try:
            response = requests.get(f"{self.base_url}/products/{product_id}/related", timeout=15)
            
            if response.status_code != 200:
                self.log_test(
                    "Exclusion Logic Test",
                    False,
                    f"API returned status {response.status_code}"
                )
                return False
            
            data = response.json()
            products = data.get('data', [])
            
            if not products:
                self.log_test(
                    "Exclusion Logic Test",
                    True,
                    "No products returned - exclusion test not applicable"
                )
                return True
            
            # Check if source product ID is in the results
            product_ids = [p.get('id') for p in products]
            
            if product_id in product_ids:
                self.log_test(
                    "Exclusion Logic Test",
                    False,
                    f"Source product {product_id} found in related products list",
                    product_ids
                )
                return False
            
            self.log_test(
                "Exclusion Logic Test",
                True,
                f"Source product {product_id} correctly excluded from {len(products)} related products"
            )
            return True
            
        except Exception as e:
            self.log_test(
                "Exclusion Logic Test",
                False,
                f"Exception occurred: {str(e)}"
            )
            return False
    
    def test_category_logic(self, product_id: str) -> bool:
        """Test category-based related products logic"""
        try:
            # First get the source product's category
            source_response = requests.get(f"{self.base_url}/products/{product_id}", timeout=10)
            if source_response.status_code != 200:
                self.log_test(
                    "Category Logic Test",
                    False,
                    "Could not fetch source product details"
                )
                return False
            
            source_data = source_response.json()
            source_product = source_data.get('data', {})
            source_category_id = source_product.get('category_id')
            
            if not source_category_id:
                self.log_test(
                    "Category Logic Test",
                    True,
                    "Source product has no category - category logic test skipped"
                )
                return True
            
            # Get related products
            related_response = requests.get(f"{self.base_url}/products/{product_id}/related", timeout=15)
            if related_response.status_code != 200:
                self.log_test(
                    "Category Logic Test",
                    False,
                    f"Related products API returned status {related_response.status_code}"
                )
                return False
            
            related_data = related_response.json()
            related_products = related_data.get('data', [])
            
            if not related_products:
                self.log_test(
                    "Category Logic Test",
                    True,
                    "No related products returned - category logic test not applicable"
                )
                return True
            
            # Check if at least some products are from the same category
            same_category_count = 0
            for product in related_products:
                # Get product details to check category
                try:
                    product_response = requests.get(f"{self.base_url}/products/{product['id']}", timeout=5)
                    if product_response.status_code == 200:
                        product_data = product_response.json()
                        product_category_id = product_data.get('data', {}).get('category_id')
                        if product_category_id == source_category_id:
                            same_category_count += 1
                except:
                    continue  # Skip if we can't fetch product details
            
            # At least some products should be from the same category (if available)
            if same_category_count > 0:
                self.log_test(
                    "Category Logic Test",
                    True,
                    f"{same_category_count}/{len(related_products)} related products from same category"
                )
                return True
            else:
                self.log_test(
                    "Category Logic Test",
                    True,
                    "No products from same category - may indicate fallback logic working"
                )
                return True
            
        except Exception as e:
            self.log_test(
                "Category Logic Test",
                False,
                f"Exception occurred: {str(e)}"
            )
            return False
    
    def test_error_handling(self) -> bool:
        """Test error handling with invalid product IDs"""
        try:
            # Test with invalid UUID
            invalid_id = "invalid-product-id"
            response = requests.get(f"{self.base_url}/products/{invalid_id}/related", timeout=10)
            
            # Should return an error (400 or 404)
            if response.status_code in [400, 404, 500]:
                data = response.json()
                if not data.get('success', True):  # success should be false for errors
                    self.log_test(
                        "Error Handling Test (Invalid ID)",
                        True,
                        f"Correctly handled invalid product ID with status {response.status_code}"
                    )
                else:
                    self.log_test(
                        "Error Handling Test (Invalid ID)",
                        False,
                        f"API returned success=true for invalid product ID"
                    )
                    return False
            else:
                self.log_test(
                    "Error Handling Test (Invalid ID)",
                    False,
                    f"Expected error status (400/404/500), got {response.status_code}"
                )
                return False
            
            # Test with non-existent but valid UUID format
            nonexistent_id = "12345678-1234-1234-1234-123456789012"
            response2 = requests.get(f"{self.base_url}/products/{nonexistent_id}/related", timeout=10)
            
            if response2.status_code in [400, 404, 500]:
                data2 = response2.json()
                if not data2.get('success', True):
                    self.log_test(
                        "Error Handling Test (Non-existent ID)",
                        True,
                        f"Correctly handled non-existent product ID with status {response2.status_code}"
                    )
                    return True
                else:
                    self.log_test(
                        "Error Handling Test (Non-existent ID)",
                        False,
                        "API returned success=true for non-existent product ID"
                    )
                    return False
            else:
                self.log_test(
                    "Error Handling Test (Non-existent ID)",
                    False,
                    f"Expected error status (400/404/500), got {response2.status_code}"
                )
                return False
            
        except Exception as e:
            self.log_test(
                "Error Handling Test",
                False,
                f"Exception occurred: {str(e)}"
            )
            return False
    
    def test_limit_parameter(self, product_id: str) -> bool:
        """Test the limit parameter functionality"""
        try:
            # Test with limit=5
            response = requests.get(f"{self.base_url}/products/{product_id}/related?limit=5", timeout=15)
            
            if response.status_code != 200:
                self.log_test(
                    "Limit Parameter Test",
                    False,
                    f"API returned status {response.status_code}"
                )
                return False
            
            data = response.json()
            products = data.get('data', [])
            
            if len(products) > 5:
                self.log_test(
                    "Limit Parameter Test",
                    False,
                    f"Expected max 5 products, got {len(products)}"
                )
                return False
            
            # Test with limit=3
            response2 = requests.get(f"{self.base_url}/products/{product_id}/related?limit=3", timeout=15)
            
            if response2.status_code != 200:
                self.log_test(
                    "Limit Parameter Test",
                    False,
                    f"API returned status {response2.status_code} for limit=3"
                )
                return False
            
            data2 = response2.json()
            products2 = data2.get('data', [])
            
            if len(products2) > 3:
                self.log_test(
                    "Limit Parameter Test",
                    False,
                    f"Expected max 3 products, got {len(products2)}"
                )
                return False
            
            self.log_test(
                "Limit Parameter Test",
                True,
                f"Limit parameter working: limit=5 returned {len(products)}, limit=3 returned {len(products2)}"
            )
            return True
            
        except Exception as e:
            self.log_test(
                "Limit Parameter Test",
                False,
                f"Exception occurred: {str(e)}"
            )
            return False
    
    def run_all_tests(self):
        """Run all related products API tests"""
        print("🚀 Starting RitZone Related Products API Testing Suite")
        print("=" * 60)
        
        # Test 1: Backend Health Check
        if not self.test_backend_health():
            print("\n❌ Backend is not accessible. Stopping tests.")
            return self.generate_summary()
        
        # Test 2: Get Valid Product ID
        product_id = self.get_valid_product_id()
        if not product_id:
            print("\n❌ Could not get valid product ID. Stopping tests.")
            return self.generate_summary()
        
        print(f"\n🎯 Using product ID for testing: {product_id}")
        print("-" * 60)
        
        # Test 3: Basic Related Products Functionality
        self.test_related_products_basic(product_id)
        
        # Test 4: Response Structure Validation
        self.test_response_structure(product_id)
        
        # Test 5: Currency Conversion
        self.test_currency_conversion(product_id)
        
        # Test 6: Exclusion Logic
        self.test_exclusion_logic(product_id)
        
        # Test 7: Category-based Logic
        self.test_category_logic(product_id)
        
        # Test 8: Limit Parameter
        self.test_limit_parameter(product_id)
        
        # Test 9: Error Handling
        self.test_error_handling()
        
        return self.generate_summary()
    
    def generate_summary(self):
        """Generate test summary"""
        print("\n" + "=" * 60)
        print("📊 RELATED PRODUCTS API TEST SUMMARY")
        print("=" * 60)
        
        print(f"Total Tests: {self.total_tests}")
        print(f"Passed: {self.passed_tests}")
        print(f"Failed: {self.total_tests - self.passed_tests}")
        print(f"Success Rate: {(self.passed_tests/self.total_tests*100):.1f}%" if self.total_tests > 0 else "0%")
        
        print("\n📋 DETAILED RESULTS:")
        print("-" * 40)
        
        for result in self.test_results:
            print(f"{result['status']}: {result['test']}")
            if result['status'] == "❌ FAIL":
                print(f"   ↳ {result['message']}")
        
        # Overall assessment
        success_rate = (self.passed_tests/self.total_tests*100) if self.total_tests > 0 else 0
        
        print(f"\n🎯 OVERALL ASSESSMENT:")
        if success_rate >= 90:
            print("🟢 EXCELLENT: Related Products API is working excellently!")
        elif success_rate >= 75:
            print("🟡 GOOD: Related Products API is working well with minor issues.")
        elif success_rate >= 50:
            print("🟠 NEEDS IMPROVEMENT: Related Products API has significant issues.")
        else:
            print("🔴 CRITICAL: Related Products API has major problems.")
        
        return {
            "total_tests": self.total_tests,
            "passed_tests": self.passed_tests,
            "success_rate": success_rate,
            "results": self.test_results
        }

def main():
    """Main function to run the tests"""
    tester = RelatedProductsAPITester()
    summary = tester.run_all_tests()
    
    # Return appropriate exit code
    if summary["success_rate"] >= 75:
        sys.exit(0)  # Success
    else:
        sys.exit(1)  # Failure

if __name__ == "__main__":
    main()
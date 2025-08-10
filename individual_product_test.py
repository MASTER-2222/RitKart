#!/usr/bin/env python3
"""
RitZone Individual Product API Testing Suite
============================================
Testing GET /api/products/:id endpoint for individual product pages
"""

import requests
import json
import sys
from datetime import datetime

class IndividualProductAPITester:
    def __init__(self, base_url="https://c4520b2e-f2df-4283-a700-05c94e807d6a.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []
        self.product_ids = []

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

    def make_request(self, method, endpoint, data=None, expected_status=200):
        """Make HTTP request with error handling"""
        url = f"{self.base_url}{endpoint}"
        headers = {'Content-Type': 'application/json'}

        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=10)
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

    def get_real_product_ids(self):
        """Get real product IDs from different categories"""
        print("\n🔍 Fetching real product IDs from database...")
        
        categories = ['electronics', 'fashion', 'books', 'home', 'sports']
        
        for category in categories:
            success, status, data = self.make_request('GET', f'/products/category/{category}?limit=3')
            
            if success and data.get('success'):
                products = data.get('data', [])
                for product in products[:2]:  # Get 2 products per category
                    if product.get('id'):
                        self.product_ids.append({
                            'id': product['id'],
                            'name': product.get('name', 'Unknown'),
                            'category': category,
                            'price': product.get('price', 0)
                        })
        
        print(f"📦 Found {len(self.product_ids)} real product IDs from database")
        return len(self.product_ids) > 0

    def test_individual_product_basic_fields(self, product_info):
        """Test individual product API for basic required fields"""
        product_id = product_info['id']
        product_name = product_info['name']
        category = product_info['category']
        
        print(f"\n🛍️ Testing Individual Product: {product_name} ({category})")
        
        success, status, data = self.make_request('GET', f'/products/{product_id}')
        
        if not success:
            return self.log_test(
                f"Individual Product API - {product_name[:30]}...", 
                False, 
                f"API call failed - Status: {status}, Response: {data}"
            )
        
        if not data.get('success'):
            return self.log_test(
                f"Individual Product API - {product_name[:30]}...", 
                False, 
                f"API returned success=false: {data.get('message', 'Unknown error')}"
            )
        
        product = data.get('data', {})
        
        # Check basic required fields for individual product pages
        basic_fields = ['id', 'name', 'description', 'price', 'images', 'stock_quantity']
        missing_basic = [field for field in basic_fields if field not in product or product[field] is None]
        
        # Check enhanced fields for detailed product pages
        enhanced_fields = ['rating_average', 'total_reviews', 'features', 'specifications']
        missing_enhanced = [field for field in enhanced_fields if field not in product or product[field] is None]
        
        # Validate data types and structure
        validation_issues = []
        
        if 'price' in product:
            try:
                float(product['price'])
            except (ValueError, TypeError):
                validation_issues.append("price is not a valid number")
        
        if 'images' in product and product['images']:
            if not isinstance(product['images'], list):
                validation_issues.append("images should be an array")
            elif len(product['images']) == 0:
                validation_issues.append("images array is empty")
        
        if 'stock_quantity' in product:
            try:
                int(product['stock_quantity'])
            except (ValueError, TypeError):
                validation_issues.append("stock_quantity is not a valid integer")
        
        if 'rating_average' in product and product['rating_average'] is not None:
            try:
                rating = float(product['rating_average'])
                if rating < 0 or rating > 5:
                    validation_issues.append("rating_average should be between 0 and 5")
            except (ValueError, TypeError):
                validation_issues.append("rating_average is not a valid number")
        
        # Determine test result
        has_basic_fields = len(missing_basic) == 0
        has_enhanced_fields = len(missing_enhanced) == 0
        has_valid_data = len(validation_issues) == 0
        
        # Create detailed message
        message_parts = []
        if has_basic_fields:
            message_parts.append("✅ Basic fields complete")
        else:
            message_parts.append(f"❌ Missing basic: {', '.join(missing_basic)}")
        
        if has_enhanced_fields:
            message_parts.append("✅ Enhanced fields complete")
        else:
            message_parts.append(f"⚠️ Missing enhanced: {', '.join(missing_enhanced)}")
        
        if has_valid_data:
            message_parts.append("✅ Data validation passed")
        else:
            message_parts.append(f"❌ Validation issues: {', '.join(validation_issues)}")
        
        # Test passes if basic fields are present and data is valid
        test_passed = has_basic_fields and has_valid_data
        
        return self.log_test(
            f"Individual Product - {product_name[:30]}...", 
            test_passed, 
            " | ".join(message_parts),
            {
                'product_id': product_id,
                'basic_fields_complete': has_basic_fields,
                'enhanced_fields_complete': has_enhanced_fields,
                'data_valid': has_valid_data,
                'missing_basic': missing_basic,
                'missing_enhanced': missing_enhanced,
                'validation_issues': validation_issues
            }
        )

    def test_product_detail_structure(self, product_info):
        """Test if product structure matches ProductDetail component expectations"""
        product_id = product_info['id']
        product_name = product_info['name']
        
        success, status, data = self.make_request('GET', f'/products/{product_id}')
        
        if not success or not data.get('success'):
            return self.log_test(
                f"Product Structure - {product_name[:30]}...", 
                False, 
                "Could not retrieve product for structure test"
            )
        
        product = data.get('data', {})
        
        # Fields expected by ProductDetail component
        expected_structure = {
            'id': 'string',
            'name': 'string', 
            'description': 'string',
            'price': 'number',
            'images': 'array',
            'stock_quantity': 'number',
            'rating_average': 'number_or_null',
            'total_reviews': 'number_or_null',
            'features': 'array_or_null',
            'specifications': 'object_or_null'
        }
        
        structure_issues = []
        
        for field, expected_type in expected_structure.items():
            if field not in product:
                structure_issues.append(f"{field} missing")
                continue
            
            value = product[field]
            
            if expected_type == 'string' and not isinstance(value, str):
                structure_issues.append(f"{field} should be string, got {type(value).__name__}")
            elif expected_type == 'number' and not isinstance(value, (int, float)):
                structure_issues.append(f"{field} should be number, got {type(value).__name__}")
            elif expected_type == 'array' and not isinstance(value, list):
                structure_issues.append(f"{field} should be array, got {type(value).__name__}")
            elif expected_type == 'number_or_null' and value is not None and not isinstance(value, (int, float)):
                structure_issues.append(f"{field} should be number or null, got {type(value).__name__}")
            elif expected_type == 'array_or_null' and value is not None and not isinstance(value, list):
                structure_issues.append(f"{field} should be array or null, got {type(value).__name__}")
            elif expected_type == 'object_or_null' and value is not None and not isinstance(value, dict):
                structure_issues.append(f"{field} should be object or null, got {type(value).__name__}")
        
        test_passed = len(structure_issues) == 0
        
        return self.log_test(
            f"Product Structure - {product_name[:30]}...", 
            test_passed, 
            "✅ Structure matches expectations" if test_passed else f"❌ Issues: {', '.join(structure_issues)}"
        )

    def test_nonexistent_product(self):
        """Test error handling for non-existent product IDs"""
        print("\n🚫 Testing Non-existent Product ID...")
        
        fake_id = "00000000-0000-0000-0000-000000000000"
        success, status, data = self.make_request('GET', f'/products/{fake_id}', expected_status=404)
        
        if success and not data.get('success'):
            return self.log_test(
                "Non-existent Product Error Handling", 
                True, 
                f"✅ Correctly returned 404 with error message: {data.get('message', 'No message')}"
            )
        else:
            return self.log_test(
                "Non-existent Product Error Handling", 
                False, 
                f"❌ Expected 404 error, got status {status} with response: {data}"
            )

    def test_invalid_product_id_format(self):
        """Test error handling for invalid product ID formats"""
        print("\n🚫 Testing Invalid Product ID Format...")
        
        invalid_id = "invalid-id-format"
        success, status, data = self.make_request('GET', f'/products/{invalid_id}', expected_status=404)
        
        # Accept either 404 or 400 as valid responses for invalid format
        if (status == 404 or status == 400) and not data.get('success'):
            return self.log_test(
                "Invalid Product ID Format Handling", 
                True, 
                f"✅ Correctly handled invalid ID format with status {status}: {data.get('message', 'No message')}"
            )
        else:
            return self.log_test(
                "Invalid Product ID Format Handling", 
                False, 
                f"❌ Expected 404/400 error, got status {status} with response: {data}"
            )

    def run_individual_product_tests(self):
        """Run comprehensive individual product API tests"""
        print("=" * 70)
        print("🚀 RitZone Individual Product API Testing Suite")
        print("📋 Testing GET /api/products/:id endpoint")
        print("=" * 70)
        print(f"📅 Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print(f"🌐 Testing endpoint: {self.base_url}")
        print("=" * 70)

        # Step 1: Get real product IDs from database
        if not self.get_real_product_ids():
            print("❌ Could not retrieve product IDs from database. Cannot proceed with tests.")
            return 1

        # Step 2: Test individual products with real IDs
        print(f"\n🧪 Testing {len(self.product_ids)} individual products...")
        
        for i, product_info in enumerate(self.product_ids[:10]):  # Test up to 10 products
            print(f"\n--- Product {i+1}/{min(len(self.product_ids), 10)} ---")
            self.test_individual_product_basic_fields(product_info)
            self.test_product_detail_structure(product_info)

        # Step 3: Test error handling
        self.test_nonexistent_product()
        self.test_invalid_product_id_format()

        # Print Results Summary
        print("\n" + "=" * 70)
        print("📊 INDIVIDUAL PRODUCT API TEST RESULTS")
        print("=" * 70)
        
        for result in self.test_results:
            print(f"{result['status']} {result['test']}: {result['message']}")
        
        print(f"\n📈 Overall Results: {self.tests_passed}/{self.tests_run} tests passed")
        
        # Summary by category
        basic_tests = [r for r in self.test_results if 'Individual Product -' in r['test']]
        structure_tests = [r for r in self.test_results if 'Product Structure -' in r['test']]
        error_tests = [r for r in self.test_results if 'Error Handling' in r['test'] or 'Invalid' in r['test'] or 'Non-existent' in r['test']]
        
        basic_passed = len([r for r in basic_tests if '✅' in r['status']])
        structure_passed = len([r for r in structure_tests if '✅' in r['status']])
        error_passed = len([r for r in error_tests if '✅' in r['status']])
        
        print(f"\n📊 Test Categories:")
        print(f"   🛍️ Individual Product Tests: {basic_passed}/{len(basic_tests)} passed")
        print(f"   🏗️ Structure Tests: {structure_passed}/{len(structure_tests)} passed")
        print(f"   🚫 Error Handling Tests: {error_passed}/{len(error_tests)} passed")
        
        if self.tests_passed == self.tests_run:
            print("\n🎉 All individual product API tests passed!")
            return 0
        else:
            failed_tests = self.tests_run - self.tests_passed
            print(f"\n⚠️ {failed_tests} tests failed")
            
            # Show critical issues
            critical_failures = [r for r in self.test_results if '❌' in r['status'] and 'Individual Product -' in r['test']]
            if critical_failures:
                print(f"\n🚨 Critical Issues Found:")
                for failure in critical_failures[:3]:  # Show first 3 critical failures
                    print(f"   • {failure['test']}: {failure['message']}")
            
            return 1

def main():
    """Main test execution"""
    tester = IndividualProductAPITester()
    return tester.run_individual_product_tests()

if __name__ == "__main__":
    sys.exit(main())
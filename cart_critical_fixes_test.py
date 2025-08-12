#!/usr/bin/env python3
"""
RitZone Cart Critical Fixes Validation - August 2025
====================================================
Specific validation for the critical fixes mentioned in the review request:
1. API endpoint URLs are correct (/cart/items/ not /cart/item/)
2. Backend returns cart_items and total_amount (not items/total)
3. Header shows dynamic cart count (not hardcoded "3")
4. Cart page shows real user cart data from database

Focus: Validating the specific fixes that were implemented.
"""

import requests
import json
import sys
import time

class CriticalFixesValidator:
    def __init__(self, base_url="http://localhost:8001/api"):
        self.base_url = base_url
        self.token = None
        self.user_id = None
        self.test_user_email = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

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

    def setup_test_user(self):
        """Create and login test user"""
        try:
            # Create test user
            timestamp = int(time.time())
            self.test_user_email = f"criticaltest.{timestamp}@example.com"
            
            register_data = {
                "email": self.test_user_email,
                "password": "CriticalTest123!",
                "fullName": f"Critical Test User {timestamp}"
            }
            
            reg_response = requests.post(f"{self.base_url}/auth/register", json=register_data, timeout=10)
            if reg_response.status_code not in [200, 201]:
                return False
            
            # Login user
            login_data = {
                "email": self.test_user_email,
                "password": "CriticalTest123!"
            }
            
            login_response = requests.post(f"{self.base_url}/auth/login", json=login_data, timeout=10)
            if login_response.status_code == 200:
                data = login_response.json()
                if data.get('success'):
                    self.token = data.get('token')
                    self.user_id = data.get('user', {}).get('id')
                    return bool(self.token and self.user_id)
            
            return False
            
        except Exception as e:
            print(f"Setup error: {e}")
            return False

    def test_api_endpoint_urls(self):
        """Test that API endpoints use correct URLs (/cart/items/ not /cart/item/)"""
        try:
            headers = {"Authorization": f"Bearer {self.token}"}
            
            # Get a product for testing
            products_response = requests.get(f"{self.base_url}/products/category/electronics?limit=1", timeout=10)
            if products_response.status_code != 200:
                return self.log_test(
                    "API Endpoint URLs - Product Retrieval",
                    False,
                    "Could not retrieve product for testing"
                )
            
            products_data = products_response.json()
            if not products_data.get('success') or not products_data.get('data'):
                return self.log_test(
                    "API Endpoint URLs - Product Retrieval",
                    False,
                    "No products available for testing"
                )
            
            product_id = products_data['data'][0]['id']
            
            # Add item to cart
            add_response = requests.post(
                f"{self.base_url}/cart/add",
                json={"productId": product_id, "quantity": 1},
                headers=headers,
                timeout=10
            )
            
            if add_response.status_code != 200:
                return self.log_test(
                    "API Endpoint URLs - Add to Cart",
                    False,
                    f"Add to cart failed with status {add_response.status_code}"
                )
            
            # Get cart to get item ID
            cart_response = requests.get(f"{self.base_url}/cart", headers=headers, timeout=10)
            if cart_response.status_code != 200:
                return self.log_test(
                    "API Endpoint URLs - Get Cart",
                    False,
                    "Could not retrieve cart"
                )
            
            cart_data = cart_response.json()
            if not cart_data.get('success') or not cart_data.get('data', {}).get('cart_items'):
                return self.log_test(
                    "API Endpoint URLs - Get Cart Items",
                    False,
                    "No cart items found"
                )
            
            item_id = cart_data['data']['cart_items'][0]['id']
            
            # Test correct endpoint: /cart/items/:itemId (not /cart/item/:itemId)
            correct_url = f"{self.base_url}/cart/items/{item_id}"
            incorrect_url = f"{self.base_url}/cart/item/{item_id}"
            
            # Test UPDATE with correct URL
            update_response = requests.put(
                correct_url,
                json={"quantity": 2},
                headers=headers,
                timeout=10
            )
            
            # Test UPDATE with incorrect URL (should fail)
            wrong_update_response = requests.put(
                incorrect_url,
                json={"quantity": 2},
                headers=headers,
                timeout=10
            )
            
            # Test DELETE with correct URL
            delete_response = requests.delete(correct_url, headers=headers, timeout=10)
            
            correct_update = update_response.status_code == 200
            wrong_fails = wrong_update_response.status_code == 404
            correct_delete = delete_response.status_code == 200
            
            if correct_update and wrong_fails and correct_delete:
                return self.log_test(
                    "API Endpoint URLs",
                    True,
                    "✅ Correct URLs: /cart/items/:itemId works, /cart/item/:itemId fails as expected"
                )
            else:
                return self.log_test(
                    "API Endpoint URLs",
                    False,
                    f"URL validation failed - correct_update: {correct_update}, wrong_fails: {wrong_fails}, correct_delete: {correct_delete}"
                )
                
        except Exception as e:
            return self.log_test(
                "API Endpoint URLs",
                False,
                f"API endpoint test error: {str(e)}"
            )

    def test_response_data_structure(self):
        """Test that backend returns cart_items and total_amount (not items/total)"""
        try:
            headers = {"Authorization": f"Bearer {self.token}"}
            
            # Get a product for testing
            products_response = requests.get(f"{self.base_url}/products/category/electronics?limit=1", timeout=10)
            if products_response.status_code != 200:
                return self.log_test(
                    "Response Data Structure",
                    False,
                    "Could not retrieve product for testing"
                )
            
            products_data = products_response.json()
            product_id = products_data['data'][0]['id']
            
            # Add item to cart
            add_response = requests.post(
                f"{self.base_url}/cart/add",
                json={"productId": product_id, "quantity": 1},
                headers=headers,
                timeout=10
            )
            
            if add_response.status_code != 200:
                return self.log_test(
                    "Response Data Structure",
                    False,
                    "Could not add item to cart for testing"
                )
            
            # Get cart and check data structure
            cart_response = requests.get(f"{self.base_url}/cart", headers=headers, timeout=10)
            if cart_response.status_code != 200:
                return self.log_test(
                    "Response Data Structure",
                    False,
                    "Could not retrieve cart"
                )
            
            cart_data = cart_response.json()
            if not cart_data.get('success'):
                return self.log_test(
                    "Response Data Structure",
                    False,
                    "Cart response not successful"
                )
            
            data = cart_data.get('data', {})
            
            # Check for correct field names
            has_cart_items = 'cart_items' in data
            has_total_amount = 'total_amount' in data
            
            # Check that incorrect field names are NOT present
            has_items = 'items' in data
            has_total = 'total' in data
            
            if has_cart_items and has_total_amount and not has_items and not has_total:
                return self.log_test(
                    "Response Data Structure",
                    True,
                    "✅ Correct data structure: cart_items and total_amount fields present, items/total fields absent"
                )
            else:
                return self.log_test(
                    "Response Data Structure",
                    False,
                    f"Incorrect data structure - cart_items: {has_cart_items}, total_amount: {has_total_amount}, items: {has_items}, total: {has_total}"
                )
                
        except Exception as e:
            return self.log_test(
                "Response Data Structure",
                False,
                f"Data structure test error: {str(e)}"
            )

    def test_cart_count_dynamic(self):
        """Test that cart operations return dynamic count (not hardcoded)"""
        try:
            headers = {"Authorization": f"Bearer {self.token}"}
            
            # Get initial cart count
            initial_response = requests.get(f"{self.base_url}/cart", headers=headers, timeout=10)
            if initial_response.status_code != 200:
                return self.log_test(
                    "Dynamic Cart Count",
                    False,
                    "Could not get initial cart state"
                )
            
            initial_data = initial_response.json()
            initial_count = len(initial_data.get('data', {}).get('cart_items', []))
            
            # Get products for testing
            products_response = requests.get(f"{self.base_url}/products/category/electronics?limit=3", timeout=10)
            if products_response.status_code != 200:
                return self.log_test(
                    "Dynamic Cart Count",
                    False,
                    "Could not retrieve products for testing"
                )
            
            products_data = products_response.json()
            products = products_data['data'][:3]
            
            # Add multiple items and track count changes
            counts = [initial_count]
            
            for i, product in enumerate(products):
                add_response = requests.post(
                    f"{self.base_url}/cart/add",
                    json={"productId": product['id'], "quantity": 1},
                    headers=headers,
                    timeout=10
                )
                
                if add_response.status_code == 200:
                    # Get updated cart count
                    cart_response = requests.get(f"{self.base_url}/cart", headers=headers, timeout=10)
                    if cart_response.status_code == 200:
                        cart_data = cart_response.json()
                        current_count = len(cart_data.get('data', {}).get('cart_items', []))
                        counts.append(current_count)
            
            # Check if counts are increasing dynamically (not staying at hardcoded value like 3)
            is_dynamic = len(set(counts)) > 1  # Different counts indicate dynamic behavior
            is_increasing = all(counts[i] <= counts[i+1] for i in range(len(counts)-1))  # Should be increasing
            not_hardcoded_three = not all(count == 3 for count in counts[1:])  # Not all counts are 3
            
            if is_dynamic and is_increasing and not_hardcoded_three:
                return self.log_test(
                    "Dynamic Cart Count",
                    True,
                    f"✅ Cart count is dynamic: {counts[0]} → {counts[-1]} (not hardcoded)"
                )
            else:
                return self.log_test(
                    "Dynamic Cart Count",
                    False,
                    f"Cart count appears static or hardcoded: {counts}"
                )
                
        except Exception as e:
            return self.log_test(
                "Dynamic Cart Count",
                False,
                f"Dynamic count test error: {str(e)}"
            )

    def test_real_database_data(self):
        """Test that cart shows real user data from database (not hardcoded products)"""
        try:
            headers = {"Authorization": f"Bearer {self.token}"}
            
            # Get a specific product we know exists
            products_response = requests.get(f"{self.base_url}/products/category/electronics?limit=1", timeout=10)
            if products_response.status_code != 200:
                return self.log_test(
                    "Real Database Data",
                    False,
                    "Could not retrieve products from database"
                )
            
            products_data = products_response.json()
            if not products_data.get('success') or not products_data.get('data'):
                return self.log_test(
                    "Real Database Data",
                    False,
                    "No products found in database"
                )
            
            test_product = products_data['data'][0]
            product_id = test_product['id']
            product_name = test_product['name']
            
            # Add this specific product to cart
            add_response = requests.post(
                f"{self.base_url}/cart/add",
                json={"productId": product_id, "quantity": 2},
                headers=headers,
                timeout=10
            )
            
            if add_response.status_code != 200:
                return self.log_test(
                    "Real Database Data",
                    False,
                    "Could not add product to cart"
                )
            
            # Get cart and verify it contains our specific product
            cart_response = requests.get(f"{self.base_url}/cart", headers=headers, timeout=10)
            if cart_response.status_code != 200:
                return self.log_test(
                    "Real Database Data",
                    False,
                    "Could not retrieve cart"
                )
            
            cart_data = cart_response.json()
            if not cart_data.get('success'):
                return self.log_test(
                    "Real Database Data",
                    False,
                    "Cart response not successful"
                )
            
            cart_items = cart_data.get('data', {}).get('cart_items', [])
            
            # Check if our specific product is in the cart
            found_product = False
            for item in cart_items:
                if item.get('product_id') == product_id:
                    found_product = True
                    # Verify it has real product data
                    has_real_data = (
                        item.get('product_name') == product_name and
                        item.get('quantity') == 2 and
                        item.get('price') is not None
                    )
                    
                    if has_real_data:
                        return self.log_test(
                            "Real Database Data",
                            True,
                            f"✅ Cart contains real database product: '{product_name}' with correct quantity and price"
                        )
                    else:
                        return self.log_test(
                            "Real Database Data",
                            False,
                            f"Cart item missing real product data: {item}"
                        )
            
            if not found_product:
                return self.log_test(
                    "Real Database Data",
                    False,
                    f"Added product '{product_name}' not found in cart. Cart items: {[item.get('product_name') for item in cart_items]}"
                )
                
        except Exception as e:
            return self.log_test(
                "Real Database Data",
                False,
                f"Real database data test error: {str(e)}"
            )

    def run_critical_fixes_validation(self):
        """Run all critical fixes validation tests"""
        print("=" * 80)
        print("🔧 RitZone Cart Critical Fixes Validation - August 2025")
        print("=" * 80)
        print(f"Backend URL: {self.base_url}")
        print("=" * 80)
        
        # Setup test user
        if not self.setup_test_user():
            print("❌ Could not setup test user. Cannot proceed with validation.")
            return False
        
        print(f"✅ Test user setup complete: {self.test_user_email}")
        print("-" * 80)
        
        # Run critical fixes tests
        self.test_api_endpoint_urls()
        self.test_response_data_structure()
        self.test_cart_count_dynamic()
        self.test_real_database_data()
        
        # Print results
        self.print_results()
        
        return self.tests_passed == self.tests_run

    def print_results(self):
        """Print validation results"""
        print("\n" + "=" * 80)
        print("🎯 CRITICAL FIXES VALIDATION RESULTS")
        print("=" * 80)
        
        success_rate = (self.tests_passed / self.tests_run * 100) if self.tests_run > 0 else 0
        print(f"📊 SUMMARY: {self.tests_passed}/{self.tests_run} critical fixes validated ({success_rate:.1f}%)")
        
        print("\n📋 DETAILED RESULTS:")
        for result in self.test_results:
            print(f"  {result['status']} - {result['test']}")
            if result['message']:
                print(f"      {result['message']}")
        
        print("\n🔍 CRITICAL FIXES STATUS:")
        if self.tests_passed == self.tests_run:
            print("  ✅ All critical fixes are working correctly!")
            print("  ✅ API endpoints use correct URLs (/cart/items/ not /cart/item/)")
            print("  ✅ Backend returns correct data structure (cart_items, total_amount)")
            print("  ✅ Cart count is dynamic (not hardcoded)")
            print("  ✅ Cart displays real user data from database")
        else:
            failed_tests = [r for r in self.test_results if "❌" in r['status']]
            for test in failed_tests:
                print(f"  ❌ {test['test']}: {test['message']}")
        
        print("=" * 80)

def main():
    """Main function to run critical fixes validation"""
    validator = CriticalFixesValidator()
    
    try:
        success = validator.run_critical_fixes_validation()
        sys.exit(0 if success else 1)
    except KeyboardInterrupt:
        print("\n\n⚠️ Validation interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n\n❌ Validation failed with error: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main()
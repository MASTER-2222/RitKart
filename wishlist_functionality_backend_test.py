#!/usr/bin/env python3
"""
RitZone Wishlist Functionality Backend Testing
==============================================
Comprehensive testing of wishlist functionality on individual product pages
Testing Scope:
1. Backend API Testing (GET, POST, DELETE wishlist endpoints)
2. Authentication verification for wishlist APIs
3. Product validation and error handling
4. Data persistence and synchronization
"""

import requests
import json
import time
import sys
from datetime import datetime

class WishlistFunctionalityTester:
    def __init__(self):
        # Use production backend URL from environment
        self.base_url = "https://ritzone-frontend-s3ik.onrender.com/api"
        self.test_credentials = {
            "email": "b@b.com",
            "password": "Abcd@1234"
        }
        self.auth_token = None
        self.test_results = []
        self.test_product_ids = []
        
    def log_test(self, test_name, success, message, details=None):
        """Log test results"""
        result = {
            "test": test_name,
            "success": success,
            "message": message,
            "timestamp": datetime.now().isoformat(),
            "details": details
        }
        self.test_results.append(result)
        
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status}: {test_name}")
        print(f"   {message}")
        if details:
            print(f"   Details: {details}")
        print()

    def authenticate_user(self):
        """Authenticate user and get access token"""
        try:
            print("🔐 Authenticating user...")
            
            # Login to get Supabase access token
            login_response = requests.post(
                f"{self.base_url}/auth/login",
                json=self.test_credentials,
                headers={"Content-Type": "application/json"},
                timeout=30
            )
            
            if login_response.status_code == 200:
                login_data = login_response.json()
                if login_data.get('success') and 'access_token' in login_data.get('data', {}):
                    self.auth_token = login_data['data']['access_token']
                    self.log_test(
                        "User Authentication",
                        True,
                        f"Successfully authenticated user {self.test_credentials['email']}",
                        f"Token length: {len(self.auth_token)} chars"
                    )
                    return True
                else:
                    self.log_test(
                        "User Authentication",
                        False,
                        "Login successful but no access token received",
                        login_data
                    )
                    return False
            else:
                self.log_test(
                    "User Authentication",
                    False,
                    f"Login failed with status {login_response.status_code}",
                    login_response.text
                )
                return False
                
        except Exception as e:
            self.log_test(
                "User Authentication",
                False,
                f"Authentication error: {str(e)}"
            )
            return False

    def get_test_products(self):
        """Get some product IDs for testing"""
        try:
            print("📦 Fetching test products...")
            
            # Get products from the products API
            response = requests.get(
                f"{self.base_url}/products",
                params={"limit": 5},
                timeout=30
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success') and 'data' in data:
                    products = data['data'].get('products', [])
                    if products:
                        self.test_product_ids = [product['id'] for product in products[:3]]
                        self.log_test(
                            "Get Test Products",
                            True,
                            f"Retrieved {len(self.test_product_ids)} test product IDs",
                            f"Product IDs: {self.test_product_ids}"
                        )
                        return True
                    else:
                        self.log_test(
                            "Get Test Products",
                            False,
                            "No products found in response"
                        )
                        return False
                else:
                    self.log_test(
                        "Get Test Products",
                        False,
                        "Invalid response structure",
                        data
                    )
                    return False
            else:
                self.log_test(
                    "Get Test Products",
                    False,
                    f"Failed to fetch products: {response.status_code}",
                    response.text
                )
                return False
                
        except Exception as e:
            self.log_test(
                "Get Test Products",
                False,
                f"Error fetching products: {str(e)}"
            )
            return False

    def test_get_wishlist_empty(self):
        """Test GET /api/profile/wishlist endpoint (empty wishlist)"""
        try:
            print("📋 Testing GET wishlist (empty)...")
            
            headers = {"Authorization": f"Bearer {self.auth_token}"}
            response = requests.get(
                f"{self.base_url}/profile/wishlist",
                headers=headers,
                timeout=30
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success'):
                    wishlist_items = data.get('data', [])
                    self.log_test(
                        "GET Wishlist (Empty)",
                        True,
                        f"Successfully retrieved empty wishlist with {len(wishlist_items)} items",
                        f"Response structure: {list(data.keys())}"
                    )
                    return True
                else:
                    self.log_test(
                        "GET Wishlist (Empty)",
                        False,
                        "Response indicates failure",
                        data
                    )
                    return False
            else:
                self.log_test(
                    "GET Wishlist (Empty)",
                    False,
                    f"Failed with status {response.status_code}",
                    response.text
                )
                return False
                
        except Exception as e:
            self.log_test(
                "GET Wishlist (Empty)",
                False,
                f"Error: {str(e)}"
            )
            return False

    def test_add_to_wishlist(self):
        """Test POST /api/profile/wishlist endpoint"""
        try:
            print("➕ Testing POST wishlist (add product)...")
            
            if not self.test_product_ids:
                self.log_test(
                    "POST Wishlist (Add Product)",
                    False,
                    "No test product IDs available"
                )
                return False
            
            product_id = self.test_product_ids[0]
            headers = {
                "Authorization": f"Bearer {self.auth_token}",
                "Content-Type": "application/json"
            }
            
            response = requests.post(
                f"{self.base_url}/profile/wishlist",
                json={"product_id": product_id},
                headers=headers,
                timeout=30
            )
            
            if response.status_code == 201:
                data = response.json()
                if data.get('success'):
                    self.log_test(
                        "POST Wishlist (Add Product)",
                        True,
                        f"Successfully added product {product_id} to wishlist",
                        f"Response: {data.get('message')}"
                    )
                    return True
                else:
                    self.log_test(
                        "POST Wishlist (Add Product)",
                        False,
                        "Response indicates failure",
                        data
                    )
                    return False
            else:
                self.log_test(
                    "POST Wishlist (Add Product)",
                    False,
                    f"Failed with status {response.status_code}",
                    response.text
                )
                return False
                
        except Exception as e:
            self.log_test(
                "POST Wishlist (Add Product)",
                False,
                f"Error: {str(e)}"
            )
            return False

    def test_get_wishlist_with_items(self):
        """Test GET /api/profile/wishlist endpoint (with items)"""
        try:
            print("📋 Testing GET wishlist (with items)...")
            
            headers = {"Authorization": f"Bearer {self.auth_token}"}
            response = requests.get(
                f"{self.base_url}/profile/wishlist",
                headers=headers,
                timeout=30
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success'):
                    wishlist_items = data.get('data', [])
                    if len(wishlist_items) > 0:
                        # Verify product details are included
                        first_item = wishlist_items[0]
                        required_fields = ['id', 'added_at', 'product']
                        product_fields = ['id', 'name', 'price', 'images']
                        
                        missing_fields = [field for field in required_fields if field not in first_item]
                        missing_product_fields = [field for field in product_fields if field not in first_item.get('product', {})]
                        
                        if not missing_fields and not missing_product_fields:
                            self.log_test(
                                "GET Wishlist (With Items)",
                                True,
                                f"Successfully retrieved wishlist with {len(wishlist_items)} items and complete product details",
                                f"First item product: {first_item['product']['name']}"
                            )
                            return True
                        else:
                            self.log_test(
                                "GET Wishlist (With Items)",
                                False,
                                f"Missing required fields: {missing_fields + missing_product_fields}",
                                first_item
                            )
                            return False
                    else:
                        self.log_test(
                            "GET Wishlist (With Items)",
                            False,
                            "Expected wishlist items but got empty list"
                        )
                        return False
                else:
                    self.log_test(
                        "GET Wishlist (With Items)",
                        False,
                        "Response indicates failure",
                        data
                    )
                    return False
            else:
                self.log_test(
                    "GET Wishlist (With Items)",
                    False,
                    f"Failed with status {response.status_code}",
                    response.text
                )
                return False
                
        except Exception as e:
            self.log_test(
                "GET Wishlist (With Items)",
                False,
                f"Error: {str(e)}"
            )
            return False

    def test_add_duplicate_to_wishlist(self):
        """Test adding duplicate product to wishlist"""
        try:
            print("🔄 Testing POST wishlist (duplicate product)...")
            
            if not self.test_product_ids:
                self.log_test(
                    "POST Wishlist (Duplicate Product)",
                    False,
                    "No test product IDs available"
                )
                return False
            
            product_id = self.test_product_ids[0]  # Same product as before
            headers = {
                "Authorization": f"Bearer {self.auth_token}",
                "Content-Type": "application/json"
            }
            
            response = requests.post(
                f"{self.base_url}/profile/wishlist",
                json={"product_id": product_id},
                headers=headers,
                timeout=30
            )
            
            if response.status_code == 409:  # Conflict - duplicate
                data = response.json()
                if not data.get('success'):
                    self.log_test(
                        "POST Wishlist (Duplicate Product)",
                        True,
                        f"Correctly rejected duplicate product {product_id}",
                        f"Response: {data.get('message')}"
                    )
                    return True
                else:
                    self.log_test(
                        "POST Wishlist (Duplicate Product)",
                        False,
                        "Expected failure but got success",
                        data
                    )
                    return False
            else:
                self.log_test(
                    "POST Wishlist (Duplicate Product)",
                    False,
                    f"Expected 409 status but got {response.status_code}",
                    response.text
                )
                return False
                
        except Exception as e:
            self.log_test(
                "POST Wishlist (Duplicate Product)",
                False,
                f"Error: {str(e)}"
            )
            return False

    def test_add_multiple_products_to_wishlist(self):
        """Test adding multiple products to wishlist"""
        try:
            print("📦 Testing POST wishlist (multiple products)...")
            
            if len(self.test_product_ids) < 2:
                self.log_test(
                    "POST Wishlist (Multiple Products)",
                    False,
                    "Need at least 2 test product IDs"
                )
                return False
            
            headers = {
                "Authorization": f"Bearer {self.auth_token}",
                "Content-Type": "application/json"
            }
            
            # Add second product
            product_id = self.test_product_ids[1]
            response = requests.post(
                f"{self.base_url}/profile/wishlist",
                json={"product_id": product_id},
                headers=headers,
                timeout=30
            )
            
            if response.status_code == 201:
                data = response.json()
                if data.get('success'):
                    self.log_test(
                        "POST Wishlist (Multiple Products)",
                        True,
                        f"Successfully added second product {product_id} to wishlist",
                        f"Response: {data.get('message')}"
                    )
                    return True
                else:
                    self.log_test(
                        "POST Wishlist (Multiple Products)",
                        False,
                        "Response indicates failure",
                        data
                    )
                    return False
            else:
                self.log_test(
                    "POST Wishlist (Multiple Products)",
                    False,
                    f"Failed with status {response.status_code}",
                    response.text
                )
                return False
                
        except Exception as e:
            self.log_test(
                "POST Wishlist (Multiple Products)",
                False,
                f"Error: {str(e)}"
            )
            return False

    def test_remove_from_wishlist(self):
        """Test DELETE /api/profile/wishlist/:productId endpoint"""
        try:
            print("➖ Testing DELETE wishlist (remove product)...")
            
            if not self.test_product_ids:
                self.log_test(
                    "DELETE Wishlist (Remove Product)",
                    False,
                    "No test product IDs available"
                )
                return False
            
            product_id = self.test_product_ids[0]
            headers = {"Authorization": f"Bearer {self.auth_token}"}
            
            response = requests.delete(
                f"{self.base_url}/profile/wishlist/{product_id}",
                headers=headers,
                timeout=30
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success'):
                    self.log_test(
                        "DELETE Wishlist (Remove Product)",
                        True,
                        f"Successfully removed product {product_id} from wishlist",
                        f"Response: {data.get('message')}"
                    )
                    return True
                else:
                    self.log_test(
                        "DELETE Wishlist (Remove Product)",
                        False,
                        "Response indicates failure",
                        data
                    )
                    return False
            else:
                self.log_test(
                    "DELETE Wishlist (Remove Product)",
                    False,
                    f"Failed with status {response.status_code}",
                    response.text
                )
                return False
                
        except Exception as e:
            self.log_test(
                "DELETE Wishlist (Remove Product)",
                False,
                f"Error: {str(e)}"
            )
            return False

    def test_wishlist_authentication_protection(self):
        """Test that wishlist endpoints require authentication"""
        try:
            print("🔒 Testing wishlist authentication protection...")
            
            # Test GET without token
            response = requests.get(
                f"{self.base_url}/profile/wishlist",
                timeout=30
            )
            
            if response.status_code == 401:
                self.log_test(
                    "Wishlist Authentication Protection",
                    True,
                    "GET wishlist correctly requires authentication (401 Unauthorized)",
                    "Unauthenticated request properly rejected"
                )
                return True
            else:
                self.log_test(
                    "Wishlist Authentication Protection",
                    False,
                    f"Expected 401 but got {response.status_code}",
                    response.text
                )
                return False
                
        except Exception as e:
            self.log_test(
                "Wishlist Authentication Protection",
                False,
                f"Error: {str(e)}"
            )
            return False

    def test_invalid_product_id(self):
        """Test adding invalid product ID to wishlist"""
        try:
            print("❌ Testing POST wishlist (invalid product ID)...")
            
            headers = {
                "Authorization": f"Bearer {self.auth_token}",
                "Content-Type": "application/json"
            }
            
            # Use a non-existent product ID
            invalid_product_id = "00000000-0000-0000-0000-000000000000"
            response = requests.post(
                f"{self.base_url}/profile/wishlist",
                json={"product_id": invalid_product_id},
                headers=headers,
                timeout=30
            )
            
            if response.status_code == 404:
                data = response.json()
                if not data.get('success'):
                    self.log_test(
                        "POST Wishlist (Invalid Product ID)",
                        True,
                        f"Correctly rejected invalid product ID {invalid_product_id}",
                        f"Response: {data.get('message')}"
                    )
                    return True
                else:
                    self.log_test(
                        "POST Wishlist (Invalid Product ID)",
                        False,
                        "Expected failure but got success",
                        data
                    )
                    return False
            else:
                self.log_test(
                    "POST Wishlist (Invalid Product ID)",
                    False,
                    f"Expected 404 status but got {response.status_code}",
                    response.text
                )
                return False
                
        except Exception as e:
            self.log_test(
                "POST Wishlist (Invalid Product ID)",
                False,
                f"Error: {str(e)}"
            )
            return False

    def test_wishlist_synchronization(self):
        """Test wishlist synchronization by verifying final state"""
        try:
            print("🔄 Testing wishlist synchronization...")
            
            headers = {"Authorization": f"Bearer {self.auth_token}"}
            response = requests.get(
                f"{self.base_url}/profile/wishlist",
                headers=headers,
                timeout=30
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success'):
                    wishlist_items = data.get('data', [])
                    # Should have 1 item remaining (second product added, first removed)
                    if len(wishlist_items) == 1:
                        remaining_product = wishlist_items[0]['product']
                        expected_product_id = self.test_product_ids[1] if len(self.test_product_ids) > 1 else None
                        
                        if expected_product_id and remaining_product['id'] == expected_product_id:
                            self.log_test(
                                "Wishlist Synchronization",
                                True,
                                f"Wishlist correctly synchronized with 1 remaining item",
                                f"Remaining product: {remaining_product['name']} (ID: {remaining_product['id']})"
                            )
                            return True
                        else:
                            self.log_test(
                                "Wishlist Synchronization",
                                False,
                                f"Unexpected product in wishlist",
                                f"Expected: {expected_product_id}, Got: {remaining_product['id']}"
                            )
                            return False
                    else:
                        self.log_test(
                            "Wishlist Synchronization",
                            False,
                            f"Expected 1 item in wishlist but got {len(wishlist_items)}",
                            f"Items: {[item['product']['name'] for item in wishlist_items]}"
                        )
                        return False
                else:
                    self.log_test(
                        "Wishlist Synchronization",
                        False,
                        "Response indicates failure",
                        data
                    )
                    return False
            else:
                self.log_test(
                    "Wishlist Synchronization",
                    False,
                    f"Failed with status {response.status_code}",
                    response.text
                )
                return False
                
        except Exception as e:
            self.log_test(
                "Wishlist Synchronization",
                False,
                f"Error: {str(e)}"
            )
            return False

    def run_comprehensive_test(self):
        """Run all wishlist functionality tests"""
        print("🎯 STARTING COMPREHENSIVE WISHLIST FUNCTIONALITY TESTING")
        print("=" * 80)
        print(f"Backend URL: {self.base_url}")
        print(f"Test User: {self.test_credentials['email']}")
        print("=" * 80)
        print()
        
        # Test sequence
        test_sequence = [
            ("Authentication", self.authenticate_user),
            ("Get Test Products", self.get_test_products),
            ("GET Wishlist (Empty)", self.test_get_wishlist_empty),
            ("POST Wishlist (Add Product)", self.test_add_to_wishlist),
            ("GET Wishlist (With Items)", self.test_get_wishlist_with_items),
            ("POST Wishlist (Duplicate Product)", self.test_add_duplicate_to_wishlist),
            ("POST Wishlist (Multiple Products)", self.test_add_multiple_products_to_wishlist),
            ("DELETE Wishlist (Remove Product)", self.test_remove_from_wishlist),
            ("Wishlist Authentication Protection", self.test_wishlist_authentication_protection),
            ("POST Wishlist (Invalid Product ID)", self.test_invalid_product_id),
            ("Wishlist Synchronization", self.test_wishlist_synchronization)
        ]
        
        for test_name, test_func in test_sequence:
            try:
                success = test_func()
                if not success and test_name in ["Authentication", "Get Test Products"]:
                    print(f"❌ Critical test '{test_name}' failed. Stopping test sequence.")
                    break
                time.sleep(1)  # Brief pause between tests
            except Exception as e:
                self.log_test(test_name, False, f"Test execution error: {str(e)}")
        
        # Print summary
        print("\n" + "=" * 80)
        print("🎯 WISHLIST FUNCTIONALITY TESTING SUMMARY")
        print("=" * 80)
        
        passed_tests = [t for t in self.test_results if t['success']]
        failed_tests = [t for t in self.test_results if not t['success']]
        
        print(f"✅ PASSED: {len(passed_tests)}/{len(self.test_results)} tests")
        print(f"❌ FAILED: {len(failed_tests)}/{len(self.test_results)} tests")
        print(f"📊 SUCCESS RATE: {len(passed_tests)/len(self.test_results)*100:.1f}%")
        
        if failed_tests:
            print("\n❌ FAILED TESTS:")
            for test in failed_tests:
                print(f"   • {test['test']}: {test['message']}")
        
        if passed_tests:
            print("\n✅ PASSED TESTS:")
            for test in passed_tests:
                print(f"   • {test['test']}: {test['message']}")
        
        print("\n" + "=" * 80)
        
        return len(passed_tests), len(failed_tests)

if __name__ == "__main__":
    tester = WishlistFunctionalityTester()
    passed, failed = tester.run_comprehensive_test()
    
    # Exit with appropriate code
    sys.exit(0 if failed == 0 else 1)
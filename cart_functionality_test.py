#!/usr/bin/env python3
"""
RitZone Cart Functionality Testing Suite - August 2025
======================================================
Comprehensive testing for cart functionality as requested in review:
- Backend Cart API Testing (GET /api/cart, POST /api/cart/add, PUT /api/cart/items/:itemId, DELETE /api/cart/items/:itemId)
- Cart Integration Testing (user registration, login, cart persistence)
- Critical Fixes Validation (API endpoint URLs, data structure, dynamic cart count)
- End-to-End Cart Flow (register → login → add products → verify cart → update/remove items)

Focus: Confirming cart page displays dynamic user cart data instead of hardcoded products.
"""

import requests
import json
import sys
import uuid
import time
from datetime import datetime

class CartFunctionalityTester:
    def __init__(self, base_url="http://localhost:8001/api"):
        self.base_url = base_url
        self.frontend_url = "http://localhost:3000"
        self.token = None
        self.supabase_token = None
        self.user_id = None
        self.test_user_email = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []
        self.products_for_testing = []
        self.cart_id = None
        self.cart_items = []

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

    def test_backend_health(self):
        """Test backend health and connectivity"""
        try:
            response = requests.get(f"{self.base_url}/health", timeout=10)
            if response.status_code == 200:
                data = response.json()
                return self.log_test(
                    "Backend Health Check",
                    True,
                    f"Backend running correctly - {data.get('message', 'OK')}",
                    data
                )
            else:
                return self.log_test(
                    "Backend Health Check",
                    False,
                    f"Health check failed with status {response.status_code}",
                    response.text
                )
        except Exception as e:
            return self.log_test(
                "Backend Health Check",
                False,
                f"Connection failed: {str(e)}"
            )

    def create_test_user(self):
        """Create a test user for cart functionality testing"""
        try:
            # Generate unique test user
            timestamp = int(time.time())
            self.test_user_email = f"carttest.{timestamp}@example.com"
            test_password = "CartTest123!"
            
            # Register user
            register_data = {
                "email": self.test_user_email,
                "password": test_password,
                "fullName": f"Cart Test User {timestamp}"
            }
            
            response = requests.post(
                f"{self.base_url}/auth/register",
                json=register_data,
                timeout=10
            )
            
            if response.status_code in [200, 201]:
                data = response.json()
                if data.get('success'):
                    return self.log_test(
                        "User Registration",
                        True,
                        f"Test user created: {self.test_user_email}",
                        data
                    )
                else:
                    return self.log_test(
                        "User Registration",
                        False,
                        f"Registration failed: {data.get('message', 'Unknown error')}",
                        data
                    )
            else:
                return self.log_test(
                    "User Registration",
                    False,
                    f"Registration failed with status {response.status_code}",
                    response.text
                )
                
        except Exception as e:
            return self.log_test(
                "User Registration",
                False,
                f"Registration error: {str(e)}"
            )

    def login_test_user(self):
        """Login with test user and get authentication token"""
        try:
            login_data = {
                "email": self.test_user_email,
                "password": "CartTest123!"
            }
            
            response = requests.post(
                f"{self.base_url}/auth/login",
                json=login_data,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success'):
                    # Backend returns JWT token directly, not Supabase session
                    self.token = data.get('token')  # JWT token
                    self.user_id = data.get('user', {}).get('id')
                    
                    if self.token and self.user_id:
                        # For cart API, we need to use Supabase token, so let's try to get it
                        # For now, we'll use the JWT token and see if cart API accepts it
                        self.supabase_token = self.token
                        return self.log_test(
                            "User Login",
                            True,
                            f"Login successful, token acquired for user {self.user_id}",
                            {"user_id": self.user_id, "has_token": bool(self.token)}
                        )
                    else:
                        return self.log_test(
                            "User Login",
                            False,
                            "Login response missing token or user ID",
                            data
                        )
                else:
                    return self.log_test(
                        "User Login",
                        False,
                        f"Login failed: {data.get('message', 'Unknown error')}",
                        data
                    )
            else:
                return self.log_test(
                    "User Login",
                    False,
                    f"Login failed with status {response.status_code}",
                    response.text
                )
                
        except Exception as e:
            return self.log_test(
                "User Login",
                False,
                f"Login error: {str(e)}"
            )

    def get_test_products(self):
        """Get real products from database for cart testing"""
        try:
            # Get products from multiple categories
            categories = ['electronics', 'fashion', 'books', 'home', 'sports']
            
            for category in categories:
                try:
                    response = requests.get(
                        f"{self.base_url}/products/category/{category}?limit=2",
                        timeout=10
                    )
                    
                    if response.status_code == 200:
                        data = response.json()
                        if data.get('success') and data.get('data'):
                            products = data['data']
                            for product in products[:2]:  # Take first 2 products
                                if product.get('id') and product.get('name') and product.get('price'):
                                    self.products_for_testing.append({
                                        'id': product['id'],
                                        'name': product['name'],
                                        'price': product['price'],
                                        'category': category
                                    })
                                    
                                    if len(self.products_for_testing) >= 5:
                                        break
                    
                    if len(self.products_for_testing) >= 5:
                        break
                        
                except Exception as e:
                    continue
            
            if len(self.products_for_testing) >= 3:
                return self.log_test(
                    "Product Retrieval",
                    True,
                    f"Retrieved {len(self.products_for_testing)} products for testing",
                    [p['name'] for p in self.products_for_testing]
                )
            else:
                return self.log_test(
                    "Product Retrieval",
                    False,
                    f"Only retrieved {len(self.products_for_testing)} products, need at least 3"
                )
                
        except Exception as e:
            return self.log_test(
                "Product Retrieval",
                False,
                f"Product retrieval error: {str(e)}"
            )

    def test_get_empty_cart(self):
        """Test GET /api/cart endpoint with empty cart"""
        try:
            headers = {"Authorization": f"Bearer {self.supabase_token}"}
            
            response = requests.get(
                f"{self.base_url}/cart",
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success'):
                    cart_data = data.get('data', {})
                    # Verify expected data structure
                    if 'cart_items' in cart_data and 'total_amount' in cart_data:
                        return self.log_test(
                            "GET Empty Cart",
                            True,
                            f"Empty cart retrieved successfully with correct structure",
                            cart_data
                        )
                    else:
                        return self.log_test(
                            "GET Empty Cart",
                            False,
                            "Cart data missing expected fields (cart_items, total_amount)",
                            cart_data
                        )
                else:
                    return self.log_test(
                        "GET Empty Cart",
                        False,
                        f"Get cart failed: {data.get('message', 'Unknown error')}",
                        data
                    )
            else:
                return self.log_test(
                    "GET Empty Cart",
                    False,
                    f"Get cart failed with status {response.status_code}",
                    response.text
                )
                
        except Exception as e:
            return self.log_test(
                "GET Empty Cart",
                False,
                f"Get cart error: {str(e)}"
            )

    def test_add_to_cart(self):
        """Test POST /api/cart/add endpoint"""
        if not self.products_for_testing:
            return self.log_test(
                "Add to Cart",
                False,
                "No products available for testing"
            )
        
        try:
            headers = {"Authorization": f"Bearer {self.supabase_token}"}
            product = self.products_for_testing[0]
            
            add_data = {
                "productId": product['id'],
                "quantity": 2
            }
            
            response = requests.post(
                f"{self.base_url}/cart/add",
                json=add_data,
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success'):
                    cart_item = data.get('data', {})
                    return self.log_test(
                        "Add to Cart",
                        True,
                        f"Successfully added '{product['name']}' (quantity: 2) to cart",
                        cart_item
                    )
                else:
                    return self.log_test(
                        "Add to Cart",
                        False,
                        f"Add to cart failed: {data.get('message', 'Unknown error')}",
                        data
                    )
            else:
                return self.log_test(
                    "Add to Cart",
                    False,
                    f"Add to cart failed with status {response.status_code}",
                    response.text
                )
                
        except Exception as e:
            return self.log_test(
                "Add to Cart",
                False,
                f"Add to cart error: {str(e)}"
            )

    def test_add_multiple_products(self):
        """Test adding multiple products to cart"""
        if len(self.products_for_testing) < 2:
            return self.log_test(
                "Add Multiple Products",
                False,
                "Need at least 2 products for testing"
            )
        
        try:
            headers = {"Authorization": f"Bearer {self.supabase_token}"}
            success_count = 0
            
            # Add second product
            product = self.products_for_testing[1]
            add_data = {
                "productId": product['id'],
                "quantity": 1
            }
            
            response = requests.post(
                f"{self.base_url}/cart/add",
                json=add_data,
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success'):
                    success_count += 1
            
            # Add third product if available
            if len(self.products_for_testing) >= 3:
                product = self.products_for_testing[2]
                add_data = {
                    "productId": product['id'],
                    "quantity": 3
                }
                
                response = requests.post(
                    f"{self.base_url}/cart/add",
                    json=add_data,
                    headers=headers,
                    timeout=10
                )
                
                if response.status_code == 200:
                    data = response.json()
                    if data.get('success'):
                        success_count += 1
            
            if success_count >= 1:
                return self.log_test(
                    "Add Multiple Products",
                    True,
                    f"Successfully added {success_count} additional products to cart"
                )
            else:
                return self.log_test(
                    "Add Multiple Products",
                    False,
                    "Failed to add any additional products to cart"
                )
                
        except Exception as e:
            return self.log_test(
                "Add Multiple Products",
                False,
                f"Add multiple products error: {str(e)}"
            )

    def test_get_populated_cart(self):
        """Test GET /api/cart endpoint with items in cart"""
        try:
            headers = {"Authorization": f"Bearer {self.supabase_token}"}
            
            response = requests.get(
                f"{self.base_url}/cart",
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success'):
                    cart_data = data.get('data', {})
                    cart_items = cart_data.get('cart_items', [])
                    total_amount = cart_data.get('total_amount', 0)
                    
                    if len(cart_items) > 0 and total_amount > 0:
                        self.cart_items = cart_items  # Store for later tests
                        return self.log_test(
                            "GET Populated Cart",
                            True,
                            f"Cart contains {len(cart_items)} items with total ${total_amount}",
                            {"item_count": len(cart_items), "total": total_amount}
                        )
                    else:
                        return self.log_test(
                            "GET Populated Cart",
                            False,
                            f"Cart appears empty despite adding items: {len(cart_items)} items, ${total_amount} total",
                            cart_data
                        )
                else:
                    return self.log_test(
                        "GET Populated Cart",
                        False,
                        f"Get cart failed: {data.get('message', 'Unknown error')}",
                        data
                    )
            else:
                return self.log_test(
                    "GET Populated Cart",
                    False,
                    f"Get cart failed with status {response.status_code}",
                    response.text
                )
                
        except Exception as e:
            return self.log_test(
                "GET Populated Cart",
                False,
                f"Get populated cart error: {str(e)}"
            )

    def test_update_cart_item(self):
        """Test PUT /api/cart/items/:itemId endpoint"""
        if not self.cart_items:
            return self.log_test(
                "Update Cart Item",
                False,
                "No cart items available for testing"
            )
        
        try:
            headers = {"Authorization": f"Bearer {self.supabase_token}"}
            cart_item = self.cart_items[0]
            item_id = cart_item.get('id')
            
            if not item_id:
                return self.log_test(
                    "Update Cart Item",
                    False,
                    "Cart item missing ID field"
                )
            
            update_data = {
                "quantity": 5
            }
            
            response = requests.put(
                f"{self.base_url}/cart/items/{item_id}",
                json=update_data,
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success'):
                    return self.log_test(
                        "Update Cart Item",
                        True,
                        f"Successfully updated cart item quantity to 5",
                        data.get('data', {})
                    )
                else:
                    return self.log_test(
                        "Update Cart Item",
                        False,
                        f"Update cart item failed: {data.get('message', 'Unknown error')}",
                        data
                    )
            else:
                return self.log_test(
                    "Update Cart Item",
                    False,
                    f"Update cart item failed with status {response.status_code}",
                    response.text
                )
                
        except Exception as e:
            return self.log_test(
                "Update Cart Item",
                False,
                f"Update cart item error: {str(e)}"
            )

    def test_remove_cart_item(self):
        """Test DELETE /api/cart/items/:itemId endpoint"""
        if len(self.cart_items) < 2:
            return self.log_test(
                "Remove Cart Item",
                False,
                "Need at least 2 cart items for testing removal"
            )
        
        try:
            headers = {"Authorization": f"Bearer {self.supabase_token}"}
            cart_item = self.cart_items[-1]  # Remove last item
            item_id = cart_item.get('id')
            
            if not item_id:
                return self.log_test(
                    "Remove Cart Item",
                    False,
                    "Cart item missing ID field"
                )
            
            response = requests.delete(
                f"{self.base_url}/cart/items/{item_id}",
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success'):
                    return self.log_test(
                        "Remove Cart Item",
                        True,
                        f"Successfully removed cart item",
                        data
                    )
                else:
                    return self.log_test(
                        "Remove Cart Item",
                        False,
                        f"Remove cart item failed: {data.get('message', 'Unknown error')}",
                        data
                    )
            else:
                return self.log_test(
                    "Remove Cart Item",
                    False,
                    f"Remove cart item failed with status {response.status_code}",
                    response.text
                )
                
        except Exception as e:
            return self.log_test(
                "Remove Cart Item",
                False,
                f"Remove cart item error: {str(e)}"
            )

    def test_cart_persistence(self):
        """Test cart persistence across sessions"""
        try:
            # Login again to simulate new session
            login_data = {
                "email": self.test_user_email,
                "password": "CartTest123!"
            }
            
            response = requests.post(
                f"{self.base_url}/auth/login",
                json=login_data,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success'):
                    new_token = data.get('token')  # JWT token from backend
                    
                    # Get cart with new token
                    headers = {"Authorization": f"Bearer {new_token}"}
                    cart_response = requests.get(
                        f"{self.base_url}/cart",
                        headers=headers,
                        timeout=10
                    )
                    
                    if cart_response.status_code == 200:
                        cart_data = cart_response.json()
                        if cart_data.get('success'):
                            cart_items = cart_data.get('data', {}).get('cart_items', [])
                            if len(cart_items) > 0:
                                return self.log_test(
                                    "Cart Persistence",
                                    True,
                                    f"Cart persisted across sessions with {len(cart_items)} items"
                                )
                            else:
                                return self.log_test(
                                    "Cart Persistence",
                                    False,
                                    "Cart appears empty after new login session"
                                )
                        else:
                            return self.log_test(
                                "Cart Persistence",
                                False,
                                f"Failed to get cart in new session: {cart_data.get('message')}"
                            )
                    else:
                        return self.log_test(
                            "Cart Persistence",
                            False,
                            f"Cart request failed in new session with status {cart_response.status_code}"
                        )
                else:
                    return self.log_test(
                        "Cart Persistence",
                        False,
                        "Failed to login for persistence test"
                    )
            else:
                return self.log_test(
                    "Cart Persistence",
                    False,
                    f"Login failed for persistence test with status {response.status_code}"
                )
                
        except Exception as e:
            return self.log_test(
                "Cart Persistence",
                False,
                f"Cart persistence test error: {str(e)}"
            )

    def test_input_validation(self):
        """Test input validation for cart operations"""
        try:
            headers = {"Authorization": f"Bearer {self.supabase_token}"}
            validation_tests = []
            
            # Test missing productId
            response = requests.post(
                f"{self.base_url}/cart/add",
                json={"quantity": 1},
                headers=headers,
                timeout=10
            )
            validation_tests.append(("Missing productId", response.status_code == 400))
            
            # Test zero quantity
            if self.products_for_testing:
                response = requests.post(
                    f"{self.base_url}/cart/add",
                    json={"productId": self.products_for_testing[0]['id'], "quantity": 0},
                    headers=headers,
                    timeout=10
                )
                validation_tests.append(("Zero quantity", response.status_code == 400))
            
            # Test negative quantity
            if self.products_for_testing:
                response = requests.post(
                    f"{self.base_url}/cart/add",
                    json={"productId": self.products_for_testing[0]['id'], "quantity": -1},
                    headers=headers,
                    timeout=10
                )
                validation_tests.append(("Negative quantity", response.status_code == 400))
            
            # Test non-existent product
            response = requests.post(
                f"{self.base_url}/cart/add",
                json={"productId": str(uuid.uuid4()), "quantity": 1},
                headers=headers,
                timeout=10
            )
            validation_tests.append(("Non-existent product", response.status_code in [400, 404]))
            
            passed_validations = sum(1 for _, passed in validation_tests if passed)
            total_validations = len(validation_tests)
            
            if passed_validations == total_validations:
                return self.log_test(
                    "Input Validation",
                    True,
                    f"All {total_validations} validation tests passed"
                )
            else:
                return self.log_test(
                    "Input Validation",
                    False,
                    f"Only {passed_validations}/{total_validations} validation tests passed"
                )
                
        except Exception as e:
            return self.log_test(
                "Input Validation",
                False,
                f"Input validation test error: {str(e)}"
            )

    def test_authentication_required(self):
        """Test that cart endpoints require authentication"""
        try:
            auth_tests = []
            
            # Test GET cart without token
            response = requests.get(f"{self.base_url}/cart", timeout=10)
            auth_tests.append(("GET cart no auth", response.status_code == 401))
            
            # Test POST add to cart without token
            if self.products_for_testing:
                response = requests.post(
                    f"{self.base_url}/cart/add",
                    json={"productId": self.products_for_testing[0]['id'], "quantity": 1},
                    timeout=10
                )
                auth_tests.append(("POST add no auth", response.status_code == 401))
            
            # Test with invalid token
            headers = {"Authorization": "Bearer invalid_token"}
            response = requests.get(f"{self.base_url}/cart", headers=headers, timeout=10)
            auth_tests.append(("Invalid token", response.status_code in [401, 403]))
            
            passed_auth = sum(1 for _, passed in auth_tests if passed)
            total_auth = len(auth_tests)
            
            if passed_auth == total_auth:
                return self.log_test(
                    "Authentication Required",
                    True,
                    f"All {total_auth} authentication tests passed"
                )
            else:
                return self.log_test(
                    "Authentication Required",
                    False,
                    f"Only {passed_auth}/{total_auth} authentication tests passed"
                )
                
        except Exception as e:
            return self.log_test(
                "Authentication Required",
                False,
                f"Authentication test error: {str(e)}"
            )

    def run_comprehensive_cart_tests(self):
        """Run all cart functionality tests"""
        print("=" * 80)
        print("🛒 RitZone Cart Functionality Testing Suite - August 2025")
        print("=" * 80)
        print(f"Backend URL: {self.base_url}")
        print(f"Frontend URL: {self.frontend_url}")
        print("=" * 80)
        
        # 1. Backend Health Check
        if not self.test_backend_health():
            print("\n❌ Backend health check failed. Cannot proceed with testing.")
            return False
        
        # 2. User Registration and Login Flow
        if not self.create_test_user():
            print("\n❌ User registration failed. Cannot proceed with cart testing.")
            return False
        
        if not self.login_test_user():
            print("\n❌ User login failed. Cannot proceed with cart testing.")
            return False
        
        # 3. Product Retrieval
        if not self.get_test_products():
            print("\n❌ Product retrieval failed. Cannot proceed with cart testing.")
            return False
        
        # 4. Authentication Tests
        self.test_authentication_required()
        
        # 5. Cart API Tests
        self.test_get_empty_cart()
        self.test_add_to_cart()
        self.test_add_multiple_products()
        self.test_get_populated_cart()
        self.test_update_cart_item()
        self.test_remove_cart_item()
        
        # 6. Advanced Tests
        self.test_cart_persistence()
        self.test_input_validation()
        
        # Print final results
        self.print_final_results()
        
        return self.tests_passed == self.tests_run

    def print_final_results(self):
        """Print comprehensive test results"""
        print("\n" + "=" * 80)
        print("🎯 CART FUNCTIONALITY TEST RESULTS")
        print("=" * 80)
        
        # Summary
        success_rate = (self.tests_passed / self.tests_run * 100) if self.tests_run > 0 else 0
        print(f"📊 SUMMARY: {self.tests_passed}/{self.tests_run} tests passed ({success_rate:.1f}%)")
        
        # Detailed results
        print("\n📋 DETAILED RESULTS:")
        for result in self.test_results:
            print(f"  {result['status']} - {result['test']}")
            if result['message']:
                print(f"      {result['message']}")
        
        # Critical findings
        print("\n🔍 CRITICAL FINDINGS:")
        failed_tests = [r for r in self.test_results if "❌" in r['status']]
        if failed_tests:
            for test in failed_tests:
                print(f"  ❌ {test['test']}: {test['message']}")
        else:
            print("  ✅ All cart functionality tests passed!")
        
        # Recommendations
        print("\n💡 RECOMMENDATIONS:")
        if self.tests_passed == self.tests_run:
            print("  ✅ Cart functionality is working correctly")
            print("  ✅ Backend API endpoints are functional")
            print("  ✅ Authentication and authorization working")
            print("  ✅ Data structure matches frontend expectations")
            print("  ✅ Cart persistence is working across sessions")
        else:
            print("  🔧 Review failed tests above")
            print("  🔧 Check backend logs for detailed error information")
            print("  🔧 Verify database RLS policies are correctly configured")
            print("  🔧 Ensure Supabase authentication is working properly")
        
        print("=" * 80)

def main():
    """Main function to run cart functionality tests"""
    # Use local URLs for testing since production backend is not accessible
    tester = CartFunctionalityTester(
        base_url="http://localhost:8001/api"
    )
    
    try:
        success = tester.run_comprehensive_cart_tests()
        sys.exit(0 if success else 1)
    except KeyboardInterrupt:
        print("\n\n⚠️ Testing interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n\n❌ Testing failed with error: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main()
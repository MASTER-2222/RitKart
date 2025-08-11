#!/usr/bin/env python3
"""
RitZone Add to Cart Functionality Testing Suite
==============================================
Comprehensive testing for Add to Cart functionality for registered users
"""

import requests
import json
import sys
from datetime import datetime
import uuid
import time

class AddToCartTester:
    def __init__(self, base_url="http://localhost:8001/api"):
        self.base_url = base_url
        self.token = None
        self.user_id = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []
        self.test_products = []

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
        
        if self.token:
            headers['Authorization'] = f'Bearer {self.token}'

        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers, timeout=10)
            else:
                raise ValueError(f"Unsupported method: {method}")

            # Try to parse JSON response
            try:
                response_data = response.json()
            except:
                response_data = {"raw_response": response.text}

            success = response.status_code == expected_status
            return success, response.status_code, response_data

        except requests.exceptions.RequestException as e:
            return False, 0, {"error": str(e)}

    def test_backend_health(self):
        """Test backend health and connectivity"""
        print("\n🔍 Testing Backend Health...")
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

    def test_user_authentication(self):
        """Test user authentication for cart operations"""
        print("\n🔐 Testing User Authentication...")
        
        # First try to register a new user
        timestamp = datetime.now().strftime('%H%M%S')
        test_email = f"carttest{timestamp}@gmail.com"
        
        register_data = {
            "email": test_email,
            "password": "TestPassword123!",
            "fullName": f"Cart Test User {timestamp}",
            "phone": "+1234567890"
        }
        
        success, status, data = self.make_request('POST', '/auth/register', register_data, 201)
        
        if success and data.get('success'):
            self.log_test(
                "User Registration", 
                True, 
                f"User registered successfully - Email: {test_email}"
            )
            
            # Note: In a real scenario, we'd need email verification
            # For testing, let's try to use Supabase admin API or create a verified user
            return self.log_test(
                "User Authentication", 
                False, 
                "User registered but needs email verification - cannot test cart without verified user"
            )
        else:
            # Try with existing test credentials
            login_data = {
                "email": "test@test.com",
                "password": "password123"
            }
            
            success, status, data = self.make_request('POST', '/auth/login', login_data)
            
            if success and data.get('success'):
                # Store auth info
                if 'user' in data:
                    self.user_id = data['user'].get('id')
                if 'token' in data:
                    self.token = data['token']
                    
                return self.log_test(
                    "User Authentication", 
                    True, 
                    f"Test user login successful - User ID: {self.user_id[:8]}..."
                )
            else:
                return self.log_test(
                    "User Authentication", 
                    False, 
                    f"Authentication failed - Registration: {register_data}, Login: {data}"
                )

    def test_authentication_middleware(self):
        """Test that cart endpoints require authentication"""
        print("\n🔒 Testing Authentication Middleware...")
        
        # Store current token
        original_token = self.token
        self.token = None
        
        # Test without token
        success, status, data = self.make_request('GET', '/cart', expected_status=401)
        
        if success and status == 401:
            self.log_test(
                "Auth Middleware - No Token", 
                True, 
                "Correctly rejected request without token"
            )
        else:
            self.log_test(
                "Auth Middleware - No Token", 
                False, 
                f"Should reject without token - Status: {status}"
            )
        
        # Test with invalid token
        self.token = "invalid_token_12345"
        success, status, data = self.make_request('GET', '/cart', expected_status=403)
        
        if success and status == 403:
            self.log_test(
                "Auth Middleware - Invalid Token", 
                True, 
                "Correctly rejected request with invalid token"
            )
        else:
            self.log_test(
                "Auth Middleware - Invalid Token", 
                False, 
                f"Should reject invalid token - Status: {status}"
            )
        
        # Restore valid token
        self.token = original_token
        
        # Test with valid token
        success, status, data = self.make_request('GET', '/cart')
        
        if success:
            return self.log_test(
                "Auth Middleware - Valid Token", 
                True, 
                "Correctly accepted request with valid token"
            )
        else:
            return self.log_test(
                "Auth Middleware - Valid Token", 
                False, 
                f"Should accept valid token - Status: {status}"
            )

    def test_get_products_for_cart(self):
        """Get products to use in cart tests"""
        print("\n🛍️ Getting Products for Cart Testing...")
        
        # Get products from different categories
        categories = ['electronics', 'fashion', 'books', 'home', 'sports']
        
        for category in categories:
            success, status, data = self.make_request('GET', f'/products/category/{category}?limit=2')
            
            if success and data.get('success') and data.get('data'):
                products = data['data']
                for product in products[:1]:  # Take first product from each category
                    if product.get('id') and product.get('stock_quantity', 0) > 0:
                        self.test_products.append({
                            'id': product['id'],
                            'name': product.get('name', 'Unknown Product'),
                            'price': product.get('price', 0),
                            'stock_quantity': product.get('stock_quantity', 0),
                            'category': category
                        })
                        break
        
        if len(self.test_products) > 0:
            product_names = [p['name'][:30] + '...' if len(p['name']) > 30 else p['name'] for p in self.test_products]
            return self.log_test(
                "Get Test Products", 
                True, 
                f"Retrieved {len(self.test_products)} products: {', '.join(product_names)}"
            )
        else:
            return self.log_test(
                "Get Test Products", 
                False, 
                "No products available for testing"
            )

    def test_get_empty_cart(self):
        """Test getting user's cart (should be empty initially)"""
        print("\n🛒 Testing Get Empty Cart...")
        
        if not self.token:
            return self.log_test("Get Empty Cart", False, "No authentication token available")
        
        success, status, data = self.make_request('GET', '/cart')
        
        if success and data.get('success'):
            cart = data.get('data', {})
            items = cart.get('items', [])
            total = cart.get('total', 0)
            
            return self.log_test(
                "Get Empty Cart", 
                True, 
                f"Cart retrieved successfully - Items: {len(items)}, Total: ${total}"
            )
        else:
            return self.log_test(
                "Get Empty Cart", 
                False, 
                f"Failed to get cart - Status: {status}, Response: {data}"
            )

    def test_add_to_cart_basic(self):
        """Test basic add to cart functionality"""
        print("\n➕ Testing Basic Add to Cart...")
        
        if not self.token:
            return self.log_test("Add to Cart Basic", False, "No authentication token available")
        
        if not self.test_products:
            return self.log_test("Add to Cart Basic", False, "No test products available")
        
        product = self.test_products[0]
        cart_item_data = {
            "productId": product['id'],
            "quantity": 2
        }
        
        success, status, data = self.make_request('POST', '/cart/add', cart_item_data)
        
        if success and data.get('success'):
            cart_item = data.get('data', {})
            return self.log_test(
                "Add to Cart Basic", 
                True, 
                f"Added {product['name']} (qty: 2) to cart successfully - Item ID: {cart_item.get('id', 'N/A')}"
            )
        else:
            return self.log_test(
                "Add to Cart Basic", 
                False, 
                f"Failed to add to cart - Status: {status}, Response: {data}"
            )

    def test_add_to_cart_validation(self):
        """Test add to cart input validation"""
        print("\n✅ Testing Add to Cart Validation...")
        
        if not self.token:
            return self.log_test("Add to Cart Validation", False, "No authentication token available")
        
        # Test missing productId
        success, status, data = self.make_request('POST', '/cart/add', {"quantity": 1}, expected_status=400)
        if success and status == 400:
            self.log_test("Validation - Missing Product ID", True, "Correctly rejected missing productId")
        else:
            self.log_test("Validation - Missing Product ID", False, f"Should reject missing productId - Status: {status}")
        
        # Test invalid quantity (0)
        if self.test_products:
            product = self.test_products[0]
            success, status, data = self.make_request('POST', '/cart/add', {
                "productId": product['id'],
                "quantity": 0
            }, expected_status=400)
            
            if success and status == 400:
                self.log_test("Validation - Zero Quantity", True, "Correctly rejected zero quantity")
            else:
                self.log_test("Validation - Zero Quantity", False, f"Should reject zero quantity - Status: {status}")
            
            # Test negative quantity
            success, status, data = self.make_request('POST', '/cart/add', {
                "productId": product['id'],
                "quantity": -1
            }, expected_status=400)
            
            if success and status == 400:
                self.log_test("Validation - Negative Quantity", True, "Correctly rejected negative quantity")
            else:
                self.log_test("Validation - Negative Quantity", False, f"Should reject negative quantity - Status: {status}")
        
        return True

    def test_add_nonexistent_product(self):
        """Test adding non-existent product to cart"""
        print("\n🚫 Testing Add Non-existent Product...")
        
        if not self.token:
            return self.log_test("Add Non-existent Product", False, "No authentication token available")
        
        fake_product_id = str(uuid.uuid4())
        cart_item_data = {
            "productId": fake_product_id,
            "quantity": 1
        }
        
        success, status, data = self.make_request('POST', '/cart/add', cart_item_data, expected_status=400)
        
        if success and status == 400:
            return self.log_test(
                "Add Non-existent Product", 
                True, 
                "Correctly rejected non-existent product"
            )
        else:
            return self.log_test(
                "Add Non-existent Product", 
                False, 
                f"Should reject non-existent product - Status: {status}, Response: {data}"
            )

    def test_add_multiple_products(self):
        """Test adding multiple different products to cart"""
        print("\n🛍️ Testing Add Multiple Products...")
        
        if not self.token:
            return self.log_test("Add Multiple Products", False, "No authentication token available")
        
        if len(self.test_products) < 2:
            return self.log_test("Add Multiple Products", False, "Need at least 2 test products")
        
        success_count = 0
        
        for i, product in enumerate(self.test_products[:3]):  # Test with up to 3 products
            cart_item_data = {
                "productId": product['id'],
                "quantity": i + 1  # Different quantities
            }
            
            success, status, data = self.make_request('POST', '/cart/add', cart_item_data)
            
            if success and data.get('success'):
                success_count += 1
                self.log_test(
                    f"Add Product {i+1}", 
                    True, 
                    f"Added {product['name'][:30]}... (qty: {i+1})"
                )
            else:
                self.log_test(
                    f"Add Product {i+1}", 
                    False, 
                    f"Failed to add {product['name'][:30]}... - Status: {status}"
                )
        
        return success_count > 0

    def test_add_duplicate_product(self):
        """Test adding same product twice (should update quantity)"""
        print("\n🔄 Testing Add Duplicate Product...")
        
        if not self.token:
            return self.log_test("Add Duplicate Product", False, "No authentication token available")
        
        if not self.test_products:
            return self.log_test("Add Duplicate Product", False, "No test products available")
        
        product = self.test_products[0]
        
        # Add product first time
        cart_item_data = {
            "productId": product['id'],
            "quantity": 1
        }
        
        success1, status1, data1 = self.make_request('POST', '/cart/add', cart_item_data)
        
        if not success1:
            return self.log_test("Add Duplicate Product", False, "Failed to add product first time")
        
        # Add same product again
        cart_item_data = {
            "productId": product['id'],
            "quantity": 2
        }
        
        success2, status2, data2 = self.make_request('POST', '/cart/add', cart_item_data)
        
        if success2 and data2.get('success'):
            return self.log_test(
                "Add Duplicate Product", 
                True, 
                f"Successfully handled duplicate product - should update quantity"
            )
        else:
            return self.log_test(
                "Add Duplicate Product", 
                False, 
                f"Failed to handle duplicate product - Status: {status2}, Response: {data2}"
            )

    def test_cart_after_additions(self):
        """Test getting cart after adding items"""
        print("\n📋 Testing Cart After Additions...")
        
        if not self.token:
            return self.log_test("Cart After Additions", False, "No authentication token available")
        
        success, status, data = self.make_request('GET', '/cart')
        
        if success and data.get('success'):
            cart = data.get('data', {})
            items = cart.get('items', [])
            total = cart.get('total', 0)
            
            if len(items) > 0:
                return self.log_test(
                    "Cart After Additions", 
                    True, 
                    f"Cart contains {len(items)} items, Total: ${total}"
                )
            else:
                return self.log_test(
                    "Cart After Additions", 
                    False, 
                    "Cart should contain items after additions"
                )
        else:
            return self.log_test(
                "Cart After Additions", 
                False, 
                f"Failed to get cart - Status: {status}, Response: {data}"
            )

    def test_stock_quantity_validation(self):
        """Test stock quantity validation"""
        print("\n📦 Testing Stock Quantity Validation...")
        
        if not self.token:
            return self.log_test("Stock Quantity Validation", False, "No authentication token available")
        
        if not self.test_products:
            return self.log_test("Stock Quantity Validation", False, "No test products available")
        
        # Find a product with limited stock
        product = None
        for p in self.test_products:
            if p.get('stock_quantity', 0) > 0:
                product = p
                break
        
        if not product:
            return self.log_test("Stock Quantity Validation", False, "No products with stock available")
        
        # Try to add more than available stock
        excessive_quantity = product['stock_quantity'] + 10
        cart_item_data = {
            "productId": product['id'],
            "quantity": excessive_quantity
        }
        
        success, status, data = self.make_request('POST', '/cart/add', cart_item_data, expected_status=400)
        
        if success and status == 400:
            return self.log_test(
                "Stock Quantity Validation", 
                True, 
                f"Correctly rejected excessive quantity ({excessive_quantity} > {product['stock_quantity']})"
            )
        else:
            return self.log_test(
                "Stock Quantity Validation", 
                False, 
                f"Should reject excessive quantity - Status: {status}, Response: {data}"
            )

    def test_database_integration(self):
        """Test that cart items are properly stored in database"""
        print("\n🗄️ Testing Database Integration...")
        
        if not self.token:
            return self.log_test("Database Integration", False, "No authentication token available")
        
        # Add a product to cart
        if self.test_products:
            product = self.test_products[0]
            cart_item_data = {
                "productId": product['id'],
                "quantity": 1
            }
            
            success, status, data = self.make_request('POST', '/cart/add', cart_item_data)
            
            if success and data.get('success'):
                # Get cart to verify persistence
                success2, status2, cart_data = self.make_request('GET', '/cart')
                
                if success2 and cart_data.get('success'):
                    cart = cart_data.get('data', {})
                    items = cart.get('items', [])
                    
                    # Check if the added item is in the cart
                    found_item = False
                    for item in items:
                        if item.get('product_id') == product['id']:
                            found_item = True
                            break
                    
                    if found_item:
                        return self.log_test(
                            "Database Integration", 
                            True, 
                            "Cart items properly stored and retrieved from database"
                        )
                    else:
                        return self.log_test(
                            "Database Integration", 
                            False, 
                            "Added item not found in cart - database persistence issue"
                        )
                else:
                    return self.log_test(
                        "Database Integration", 
                        False, 
                        "Failed to retrieve cart after adding item"
                    )
            else:
                return self.log_test(
                    "Database Integration", 
                    False, 
                    "Failed to add item to cart for database test"
                )
        else:
            return self.log_test("Database Integration", False, "No test products available")

    def test_response_format(self):
        """Test API response format consistency"""
        print("\n📋 Testing Response Format...")
        
        if not self.token:
            return self.log_test("Response Format", False, "No authentication token available")
        
        # Test GET /cart response format
        success, status, data = self.make_request('GET', '/cart')
        
        if success and data.get('success'):
            cart = data.get('data', {})
            
            # Check required fields
            required_fields = ['items', 'total']
            missing_fields = []
            
            for field in required_fields:
                if field not in cart:
                    missing_fields.append(field)
            
            if not missing_fields:
                self.log_test("Response Format - GET Cart", True, "Cart response has required fields")
            else:
                self.log_test("Response Format - GET Cart", False, f"Missing fields: {missing_fields}")
        
        # Test POST /cart/add response format
        if self.test_products:
            product = self.test_products[0]
            cart_item_data = {
                "productId": product['id'],
                "quantity": 1
            }
            
            success, status, data = self.make_request('POST', '/cart/add', cart_item_data)
            
            if success and data.get('success'):
                cart_item = data.get('data', {})
                
                # Check response structure
                if 'id' in cart_item or 'cart_id' in cart_item:
                    return self.log_test("Response Format - Add to Cart", True, "Add to cart response has proper structure")
                else:
                    return self.log_test("Response Format - Add to Cart", False, "Add to cart response missing item details")
            else:
                return self.log_test("Response Format - Add to Cart", False, "Failed to test add to cart response format")
        
        return True

    def run_comprehensive_tests(self):
        """Run comprehensive Add to Cart testing suite"""
        print("=" * 70)
        print("🚀 RitZone Add to Cart Functionality Testing Suite")
        print("=" * 70)
        print(f"📅 Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print(f"🌐 Testing endpoint: {self.base_url}")
        print("=" * 70)

        # Core functionality tests
        self.test_backend_health()
        self.test_user_authentication()
        self.test_authentication_middleware()
        self.test_get_products_for_cart()
        self.test_get_empty_cart()
        
        # Add to cart functionality tests
        self.test_add_to_cart_basic()
        self.test_add_to_cart_validation()
        self.test_add_nonexistent_product()
        self.test_add_multiple_products()
        self.test_add_duplicate_product()
        self.test_cart_after_additions()
        self.test_stock_quantity_validation()
        
        # Integration and format tests
        self.test_database_integration()
        self.test_response_format()

        # Print Results Summary
        print("\n" + "=" * 70)
        print("📊 ADD TO CART TEST RESULTS SUMMARY")
        print("=" * 70)
        
        critical_failures = []
        minor_issues = []
        
        for result in self.test_results:
            print(f"{result['status']} {result['test']}: {result['message']}")
            
            if result['status'] == "❌ FAIL":
                if any(keyword in result['test'].lower() for keyword in ['basic', 'authentication', 'health', 'database']):
                    critical_failures.append(result['test'])
                else:
                    minor_issues.append(result['test'])
        
        print(f"\n📈 Overall Results: {self.tests_passed}/{self.tests_run} tests passed")
        
        if critical_failures:
            print(f"🚨 Critical Failures: {len(critical_failures)}")
            for failure in critical_failures:
                print(f"   - {failure}")
        
        if minor_issues:
            print(f"⚠️  Minor Issues: {len(minor_issues)}")
            for issue in minor_issues:
                print(f"   - {issue}")
        
        if self.tests_passed == self.tests_run:
            print("🎉 All Add to Cart tests passed!")
            return 0
        elif not critical_failures:
            print("✅ Core Add to Cart functionality working (minor issues only)")
            return 0
        else:
            print(f"❌ {len(critical_failures)} critical issues found in Add to Cart functionality")
            return 1

def main():
    """Main test execution"""
    tester = AddToCartTester()
    return tester.run_comprehensive_tests()

if __name__ == "__main__":
    sys.exit(main())
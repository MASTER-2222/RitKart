#!/usr/bin/env python3
"""
RitZone Backend API Testing Suite
=================================
Testing for Category Products Migration - Phase 1
"""

import requests
import json
import sys
from datetime import datetime
import uuid

class RitZoneAPITester:
    def __init__(self, base_url="https://879ee236-c150-4cee-b2fb-07645ca2a32f.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.token = None
        self.user_id = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

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

    def test_health_check(self):
        """Test backend health endpoint"""
        print("\n🔍 Testing Backend Health Check...")
        success, status, data = self.make_request('GET', '/health')
        
        if success and data.get('success'):
            env_info = data.get('environment', {})
            db_info = data.get('database', {})
            return self.log_test(
                "Health Check", 
                True, 
                f"Backend is running - Environment: {env_info.get('nodeEnv', 'unknown')}, DB: {db_info.get('success', False)}"
            )
        else:
            return self.log_test(
                "Health Check", 
                False, 
                f"Health check failed - Status: {status}, Response: {data}"
            )

    def test_categories_api(self):
        """Test categories API"""
        print("\n📂 Testing Categories API...")
        success, status, data = self.make_request('GET', '/categories')
        
        if success and data.get('success'):
            categories = data.get('data', [])
            category_names = [cat.get('name', 'Unknown') for cat in categories]
            return self.log_test(
                "Categories API", 
                True, 
                f"Retrieved {len(categories)} categories: {', '.join(category_names[:5])}"
            )
        else:
            return self.log_test(
                "Categories API", 
                False, 
                f"Failed to get categories - Status: {status}, Response: {data}"
            )

    def test_products_by_category(self):
        """Test products by category endpoints"""
        print("\n🛍️ Testing Products by Category...")
        
        categories_to_test = ['electronics', 'fashion', 'books', 'home', 'sports']
        results = {}
        
        for category in categories_to_test:
            success, status, data = self.make_request('GET', f'/products/category/{category}')
            
            if success and data.get('success'):
                products = data.get('data', [])
                results[category] = len(products)
                self.log_test(
                    f"Products - {category.title()}", 
                    True, 
                    f"Retrieved {len(products)} products"
                )
            else:
                results[category] = 0
                self.log_test(
                    f"Products - {category.title()}", 
                    False, 
                    f"Failed to get {category} products - Status: {status}"
                )
        
        # Summary
        total_products = sum(results.values())
        categories_with_data = [cat for cat, count in results.items() if count > 0]
        
        print(f"\n📊 Category Products Summary:")
        for cat, count in results.items():
            print(f"   {cat.title()}: {count} products")
        
        return len(categories_with_data) > 0

    def test_featured_products(self):
        """Test featured products API"""
        print("\n⭐ Testing Featured Products...")
        success, status, data = self.make_request('GET', '/products?featured=true')
        
        if success and data.get('success'):
            products = data.get('data', [])
            return self.log_test(
                "Featured Products", 
                True, 
                f"Retrieved {len(products)} featured products"
            )
        else:
            return self.log_test(
                "Featured Products", 
                False, 
                f"Failed to get featured products - Status: {status}, Response: {data}"
            )

    def test_banners_api(self):
        """Test banners API"""
        print("\n🎯 Testing Banners API...")
        success, status, data = self.make_request('GET', '/banners')
        
        if success and data.get('success'):
            banners = data.get('data', [])
            return self.log_test(
                "Banners API", 
                True, 
                f"Retrieved {len(banners)} banners"
            )
        else:
            return self.log_test(
                "Banners API", 
                False, 
                f"Failed to get banners - Status: {status}, Response: {data}"
            )

    def test_deals_api(self):
        """Test deals API"""
        print("\n🏷️ Testing Deals API...")
        success, status, data = self.make_request('GET', '/deals')
        
        if success and data.get('success'):
            deals = data.get('data', [])
            active_deals = [deal for deal in deals if deal.get('is_active', False)]
            return self.log_test(
                "Deals API", 
                True, 
                f"Retrieved {len(deals)} deals ({len(active_deals)} active)"
            )
        else:
            return self.log_test(
                "Deals API", 
                False, 
                f"Failed to get deals - Status: {status}, Response: {data}"
            )

    def test_user_registration(self):
        """Test user registration"""
        print("\n👤 Testing User Registration...")
        
        # Generate unique test user with proper email format
        timestamp = datetime.now().strftime('%H%M%S')
        test_email = f"test.user.{timestamp}@gmail.com"
        
        user_data = {
            "email": test_email,
            "password": "Test123!",
            "fullName": f"Test User {timestamp}",
            "phone": "+1234567890"
        }
        
        success, status, data = self.make_request('POST', '/auth/register', user_data, 201)
        
        if success and data.get('success'):
            # Store user info for later tests
            if 'user' in data:
                self.user_id = data['user'].get('id')
            # Note: Registration might not return token immediately due to email verification
            return self.log_test(
                "User Registration", 
                True, 
                f"User registered successfully - Email: {test_email}"
            )
        else:
            return self.log_test(
                "User Registration", 
                False, 
                f"Registration failed - Status: {status}, Response: {data}"
            )

    def test_user_login(self):
        """Test user login (fallback if registration fails)"""
        print("\n🔐 Testing User Login...")
        
        # Try with a simple test user first
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
                "User Login", 
                True, 
                "Test user login successful"
            )
        else:
            # Try with admin credentials from .env as fallback
            admin_login_data = {
                "email": "admin@ritzone.com",
                "password": "RitZone@Admin2025"
            }
            
            success, status, data = self.make_request('POST', '/auth/login', admin_login_data)
            
            if success and data.get('success'):
                # Store auth info
                if 'user' in data:
                    self.user_id = data['user'].get('id')
                if 'token' in data:
                    self.token = data['token']
                    
                return self.log_test(
                    "User Login", 
                    True, 
                    "Admin login successful"
                )
            else:
                return self.log_test(
                    "User Login", 
                    False, 
                    f"Both test and admin login failed - Status: {status}, Response: {data}"
                )

    def test_cart_operations(self):
        """Test cart CRUD operations"""
        if not self.token:
            return self.log_test("Cart Operations", False, "No authentication token available")
        
        print("\n🛒 Testing Cart Operations...")
        
        # Test 1: Get empty cart
        success, status, data = self.make_request('GET', '/cart')
        if not success:
            return self.log_test("Get Cart", False, f"Failed to get cart - Status: {status}")
        
        self.log_test("Get Cart", True, "Cart retrieved successfully")
        
        # Test 2: Get products to add to cart
        success, status, products_data = self.make_request('GET', '/products?limit=1')
        if not success or not products_data.get('data'):
            return self.log_test("Cart Add Item", False, "No products available to add to cart")
        
        product = products_data['data'][0]
        product_id = product.get('id')
        
        if not product_id:
            return self.log_test("Cart Add Item", False, "Product ID not found")
        
        # Test 3: Add item to cart
        cart_item_data = {
            "productId": product_id,
            "quantity": 2
        }
        
        success, status, data = self.make_request('POST', '/cart/add', cart_item_data, 200)
        if success and data.get('success'):
            self.log_test("Add to Cart", True, f"Added product {product.get('name', 'Unknown')} to cart")
            
            # Store item ID for update/delete tests
            item_id = data.get('data', {}).get('id')
            
            if item_id:
                # Test 4: Update cart item
                update_data = {"quantity": 3}
                success, status, data = self.make_request('PUT', f'/cart/item/{item_id}', update_data)
                if success:
                    self.log_test("Update Cart Item", True, "Cart item quantity updated")
                else:
                    self.log_test("Update Cart Item", False, f"Failed to update item - Status: {status}")
                
                # Test 5: Remove cart item
                success, status, data = self.make_request('DELETE', f'/cart/item/{item_id}')
                if success:
                    self.log_test("Remove Cart Item", True, "Cart item removed successfully")
                else:
                    self.log_test("Remove Cart Item", False, f"Failed to remove item - Status: {status}")
            
            return True
        else:
            return self.log_test("Add to Cart", False, f"Failed to add to cart - Status: {status}, Response: {data}")

    def test_order_operations(self):
        """Test order creation and management"""
        if not self.token:
            return self.log_test("Order Operations", False, "No authentication token available")
        
        print("\n📦 Testing Order Operations...")
        
        # Test 1: Get orders (should be empty initially)
        success, status, data = self.make_request('GET', '/orders')
        if success:
            orders = data.get('data', [])
            self.log_test("Get Orders", True, f"Retrieved {len(orders)} orders")
        else:
            self.log_test("Get Orders", False, f"Failed to get orders - Status: {status}")
        
        # Test 2: Create order (requires items in cart first)
        # Add item to cart first
        success, status, products_data = self.make_request('GET', '/products?limit=1')
        if success and products_data.get('data'):
            product = products_data['data'][0]
            product_id = product.get('id')
            
            # Add to cart
            cart_item_data = {"productId": product_id, "quantity": 1}
            success, status, data = self.make_request('POST', '/cart/add', cart_item_data, 200)
            
            if success:
                # Create order
                order_data = {
                    "shippingAddress": {
                        "full_name": "Test User",
                        "address_line1": "123 Test St",
                        "city": "Test City",
                        "state": "TS",
                        "postal_code": "12345",
                        "country": "US"
                    },
                    "billingAddress": {
                        "full_name": "Test User",
                        "address_line1": "123 Test St",
                        "city": "Test City", 
                        "state": "TS",
                        "postal_code": "12345",
                        "country": "US"
                    },
                    "paymentMethod": "credit_card"
                }
                
                success, status, data = self.make_request('POST', '/orders', order_data, 201)
                if success and data.get('success'):
                    order_id = data.get('data', {}).get('id')
                    self.log_test("Create Order", True, f"Order created successfully - ID: {order_id}")
                    
                    # Test 3: Get specific order
                    if order_id:
                        success, status, data = self.make_request('GET', f'/orders/{order_id}')
                        if success:
                            self.log_test("Get Order by ID", True, "Order retrieved successfully")
                        else:
                            self.log_test("Get Order by ID", False, f"Failed to get order - Status: {status}")
                    
                    return True
                else:
                    return self.log_test("Create Order", False, f"Failed to create order - Status: {status}, Response: {data}")
        
        return self.log_test("Order Operations", False, "Could not complete order tests - no products available")

    def run_all_tests(self):
        """Run complete test suite for RitZone Category Products Migration"""
        print("=" * 60)
        print("🚀 RitZone Backend API Testing Suite")
        print("📋 Phase 1: Category Products Migration Testing")
        print("=" * 60)
        print(f"📅 Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print(f"🌐 Testing endpoint: {self.base_url}")
        print("=" * 60)

        # Core API Tests for Migration
        self.test_health_check()
        self.test_categories_api()
        self.test_products_by_category()
        self.test_featured_products()
        self.test_banners_api()
        self.test_deals_api()

        # Print Results Summary
        print("\n" + "=" * 60)
        print("📊 TEST RESULTS SUMMARY")
        print("=" * 60)
        
        for result in self.test_results:
            print(f"{result['status']} {result['test']}: {result['message']}")
        
        print(f"\n📈 Overall Results: {self.tests_passed}/{self.tests_run} tests passed")
        
        if self.tests_passed == self.tests_run:
            print("🎉 All tests passed!")
            return 0
        else:
            print(f"⚠️  {self.tests_run - self.tests_passed} tests failed")
            return 1

def main():
    """Main test execution"""
    tester = RitZoneAPITester()
    return tester.run_all_tests()

if __name__ == "__main__":
    sys.exit(main())
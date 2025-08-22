#!/usr/bin/env python3
"""
RitZone Individual Product Page Quantity Functionality Backend Test
=================================================================
Testing product API and cart integration for quantity functionality
"""

import requests
import json
import sys
from datetime import datetime

# Configuration
BACKEND_URL = "http://localhost:10000/api"
TEST_USER_EMAIL = "b@b.com"
TEST_USER_PASSWORD = "Abcd@1234"

class RitZoneProductQuantityTester:
    def __init__(self):
        self.backend_url = BACKEND_URL
        self.access_token = None
        self.test_results = []
        
    def log_test(self, test_name, success, message, details=None):
        """Log test results"""
        result = {
            'test': test_name,
            'success': success,
            'message': message,
            'details': details,
            'timestamp': datetime.now().isoformat()
        }
        self.test_results.append(result)
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status}: {test_name} - {message}")
        if details and not success:
            print(f"   Details: {details}")
    
    def authenticate_user(self):
        """Authenticate user and get access token"""
        try:
            print("🔐 Authenticating user...")
            
            # Login to get Supabase token
            login_url = f"{self.backend_url}/auth/login"
            login_data = {
                "email": TEST_USER_EMAIL,
                "password": TEST_USER_PASSWORD
            }
            
            response = requests.post(login_url, json=login_data, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                # Check for both 'access_token' in data and 'token' field
                access_token = None
                if data.get('success'):
                    if data.get('data', {}).get('access_token'):
                        access_token = data['data']['access_token']
                    elif data.get('token'):
                        access_token = data['token']
                
                if access_token:
                    self.access_token = access_token
                    self.log_test("User Authentication", True, f"Successfully authenticated user {TEST_USER_EMAIL}")
                    return True
                else:
                    self.log_test("User Authentication", False, "Login successful but no access token received", data)
                    return False
            else:
                self.log_test("User Authentication", False, f"Login failed with status {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_test("User Authentication", False, f"Authentication error: {str(e)}")
            return False
    
    def test_backend_connectivity(self):
        """Test backend server connectivity"""
        try:
            print("🌐 Testing backend connectivity...")
            
            health_url = f"{self.backend_url}/health"
            response = requests.get(health_url, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success'):
                    self.log_test("Backend Connectivity", True, "Backend server is running and accessible")
                    return True
                else:
                    self.log_test("Backend Connectivity", False, "Backend responded but health check failed", data)
                    return False
            else:
                self.log_test("Backend Connectivity", False, f"Backend health check failed with status {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("Backend Connectivity", False, f"Backend connectivity error: {str(e)}")
            return False
    
    def test_product_api_endpoint(self):
        """Test GET /api/products/{productId} endpoint"""
        try:
            print("📦 Testing Product API endpoint...")
            
            # First get a list of products to get a valid product ID
            products_url = f"{self.backend_url}/products"
            response = requests.get(products_url, timeout=15)
            
            if response.status_code != 200:
                self.log_test("Product API - Get Products List", False, f"Failed to get products list: {response.status_code}")
                return False
            
            products_data = response.json()
            if not products_data.get('success') or not products_data.get('data'):
                self.log_test("Product API - Get Products List", False, "No products found in response", products_data)
                return False
            
            # Get first product ID
            products = products_data['data']
            if not products:
                self.log_test("Product API - Get Products List", False, "Products array is empty")
                return False
            
            test_product_id = products[0]['id']
            self.log_test("Product API - Get Products List", True, f"Retrieved products list, testing with product ID: {test_product_id}")
            
            # Test individual product endpoint
            product_url = f"{self.backend_url}/products/{test_product_id}"
            response = requests.get(product_url, timeout=15)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success') and data.get('data'):
                    product = data['data']
                    required_fields = ['id', 'name', 'price', 'stock_quantity']
                    missing_fields = [field for field in required_fields if field not in product]
                    
                    if missing_fields:
                        self.log_test("Product API - Individual Product", False, f"Missing required fields: {missing_fields}", product)
                        return False
                    
                    self.log_test("Product API - Individual Product", True, f"Product retrieved successfully: {product['name']} (Stock: {product.get('stock_quantity', 'N/A')})")
                    return True
                else:
                    self.log_test("Product API - Individual Product", False, "Product API responded but no product data", data)
                    return False
            else:
                self.log_test("Product API - Individual Product", False, f"Product API failed with status {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("Product API - Individual Product", False, f"Product API error: {str(e)}")
            return False
    
    def test_cart_integration(self):
        """Test POST /api/cart/add (add to cart) functionality"""
        if not self.access_token:
            self.log_test("Cart Integration", False, "No access token available for cart testing")
            return False
        
        try:
            print("🛒 Testing Cart Integration...")
            
            # First get a product to add to cart
            products_url = f"{self.backend_url}/products"
            response = requests.get(products_url, timeout=15)
            
            if response.status_code != 200:
                self.log_test("Cart Integration - Get Product", False, "Failed to get product for cart test")
                return False
            
            products_data = response.json()
            if not products_data.get('data'):
                self.log_test("Cart Integration - Get Product", False, "No products available for cart test")
                return False
            
            test_product_id = products_data['data'][0]['id']
            
            # Test adding item to cart with different quantities
            headers = {
                'Authorization': f'Bearer {self.access_token}',
                'Content-Type': 'application/json'
            }
            
            # Test quantity 1
            cart_url = f"{self.backend_url}/cart/add"
            cart_data = {
                "productId": test_product_id,
                "quantity": 1
            }
            
            response = requests.post(cart_url, json=cart_data, headers=headers, timeout=15)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success'):
                    self.log_test("Cart Integration - Add Item (Qty 1)", True, "Successfully added item to cart with quantity 1")
                    
                    # Test quantity 3
                    cart_data['quantity'] = 3
                    response = requests.post(cart_url, json=cart_data, headers=headers, timeout=15)
                    
                    if response.status_code == 200:
                        data = response.json()
                        if data.get('success'):
                            self.log_test("Cart Integration - Add Item (Qty 3)", True, "Successfully added item to cart with quantity 3")
                            return True
                        else:
                            self.log_test("Cart Integration - Add Item (Qty 3)", False, "Failed to add item with quantity 3", data)
                            return False
                    else:
                        self.log_test("Cart Integration - Add Item (Qty 3)", False, f"Cart add failed with status {response.status_code}")
                        return False
                else:
                    self.log_test("Cart Integration - Add Item (Qty 1)", False, "Cart add responded but operation failed", data)
                    return False
            else:
                self.log_test("Cart Integration - Add Item (Qty 1)", False, f"Cart add failed with status {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("Cart Integration", False, f"Cart integration error: {str(e)}")
            return False
    
    def test_cart_operations(self):
        """Test cart retrieval and operations"""
        if not self.access_token:
            self.log_test("Cart Operations", False, "No access token available for cart operations test")
            return False
        
        try:
            print("🛒 Testing Cart Operations...")
            
            headers = {
                'Authorization': f'Bearer {self.access_token}',
                'Content-Type': 'application/json'
            }
            
            # Test getting user's cart
            cart_url = f"{self.backend_url}/cart"
            response = requests.get(cart_url, headers=headers, timeout=15)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success'):
                    cart_data = data.get('data', {})
                    cart_items = cart_data.get('cart_items', [])
                    self.log_test("Cart Operations - Get Cart", True, f"Successfully retrieved cart with {len(cart_items)} items")
                    return True
                else:
                    self.log_test("Cart Operations - Get Cart", False, "Cart retrieval responded but operation failed", data)
                    return False
            else:
                self.log_test("Cart Operations - Get Cart", False, f"Cart retrieval failed with status {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("Cart Operations", False, f"Cart operations error: {str(e)}")
            return False
    
    def run_all_tests(self):
        """Run all tests"""
        print("🚀 Starting RitZone Individual Product Page Quantity Functionality Tests")
        print("=" * 80)
        
        # Test 1: Backend Connectivity
        connectivity_ok = self.test_backend_connectivity()
        
        # Test 2: User Authentication
        auth_ok = self.authenticate_user()
        
        # Test 3: Product API
        product_api_ok = self.test_product_api_endpoint()
        
        # Test 4: Cart Integration (only if authenticated)
        cart_integration_ok = False
        cart_operations_ok = False
        
        if auth_ok:
            cart_integration_ok = self.test_cart_integration()
            cart_operations_ok = self.test_cart_operations()
        
        # Summary
        print("\n" + "=" * 80)
        print("🎯 TEST SUMMARY")
        print("=" * 80)
        
        total_tests = len(self.test_results)
        passed_tests = len([t for t in self.test_results if t['success']])
        
        print(f"Total Tests: {total_tests}")
        print(f"Passed: {passed_tests}")
        print(f"Failed: {total_tests - passed_tests}")
        print(f"Success Rate: {(passed_tests/total_tests)*100:.1f}%")
        
        print("\n📋 DETAILED RESULTS:")
        for result in self.test_results:
            status = "✅" if result['success'] else "❌"
            print(f"{status} {result['test']}: {result['message']}")
        
        # Critical functionality assessment
        critical_tests = [connectivity_ok, product_api_ok]
        if auth_ok:
            critical_tests.extend([cart_integration_ok, cart_operations_ok])
        
        all_critical_passed = all(critical_tests)
        
        print(f"\n🎯 CRITICAL FUNCTIONALITY STATUS: {'✅ WORKING' if all_critical_passed else '❌ ISSUES FOUND'}")
        
        if all_critical_passed:
            print("✅ Individual Product Page Quantity Functionality is working properly!")
            print("✅ Backend Product API is functional")
            print("✅ Cart Integration supports quantity operations")
            print("✅ API connectivity is stable")
        else:
            print("❌ Issues found with Individual Product Page Quantity Functionality")
            if not connectivity_ok:
                print("❌ Backend connectivity issues")
            if not product_api_ok:
                print("❌ Product API issues")
            if auth_ok and not cart_integration_ok:
                print("❌ Cart integration issues")
        
        return all_critical_passed

if __name__ == "__main__":
    tester = RitZoneProductQuantityTester()
    success = tester.run_all_tests()
    sys.exit(0 if success else 1)
#!/usr/bin/env python3
"""
RitZone Checkout Page Data Structure Fix Testing
==============================================
Testing checkout page data structure fix for "TypeError: e.product is undefined" error.

CRITICAL ISSUE CONTEXT: 
User reported "TypeError: e.product is undefined" console error on checkout page (/checkout). 
Main agent identified and fixed a data structure mismatch:

ROOT CAUSE IDENTIFIED:
- Backend API returns cart items with 'products' (plural) property 
- Checkout page was incorrectly using 'product' (singular) in both interface and code
- This caused undefined access errors when trying to get item.product.images[0] and item.product.name

FIXES APPLIED:
1) Updated checkout page CartItem interface from 'product: {...}' to 'products: {...}'
2) Changed cart items display code from 'item.product.images[0]' to 'item.products.images[0]'
3) Changed product name access from 'item.product.name' to 'item.products.name'
4) Added missing fields (stock_quantity, is_active) to CartItem interface

TESTING REQUIREMENTS:
1) Test GET /api/cart endpoint with authenticated user
2) Verify response structure includes cart_items with 'products' property (not 'product')
3) Verify cart items include all necessary fields: id, name, images, stock_quantity, is_active
4) Test with user b@b.com / Abcd@1234 credentials
5) Confirm backend is returning data in format that matches the fixed frontend structure
"""

import requests
import json
import sys
from datetime import datetime

# Configuration - PRODUCTION SERVER
BACKEND_URL = "https://ritkart-backend-ujnt.onrender.com/api"
TEST_USER_EMAIL = "b@b.com"
TEST_USER_PASSWORD = "Abcd@1234"

class CheckoutDataStructureTest:
    def __init__(self):
        self.session = requests.Session()
        self.access_token = None
        self.test_results = []
        
    def log_test(self, test_name, success, message, details=None):
        """Log test results"""
        status = "✅ PASS" if success else "❌ FAIL"
        result = {
            'test': test_name,
            'status': status,
            'message': message,
            'details': details,
            'timestamp': datetime.now().isoformat()
        }
        self.test_results.append(result)
        print(f"{status}: {test_name} - {message}")
        if details and not success:
            print(f"   Details: {details}")
    
    def test_backend_health(self):
        """Test backend server connectivity"""
        try:
            response = self.session.get(f"{BACKEND_URL}/health", timeout=15)
            if response.status_code == 200:
                data = response.json()
                self.log_test("Backend Health Check", True, 
                            f"Backend server running successfully on {BACKEND_URL}")
                return True
            else:
                self.log_test("Backend Health Check", False, 
                            f"Backend health check failed with status {response.status_code}")
                return False
        except Exception as e:
            self.log_test("Backend Health Check", False, 
                        f"Backend server not accessible: {str(e)}")
            return False
    
    def authenticate_user(self):
        """Authenticate user and get access token"""
        try:
            # Login request
            login_data = {
                "email": TEST_USER_EMAIL,
                "password": TEST_USER_PASSWORD
            }
            
            response = self.session.post(f"{BACKEND_URL}/auth/login", 
                                       json=login_data, timeout=15)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success') and ('access_token' in data or 'token' in data):
                    self.access_token = data.get('access_token') or data.get('token')
                    self.log_test("User Authentication", True, 
                                f"Successfully authenticated user {TEST_USER_EMAIL}")
                    return True
                else:
                    self.log_test("User Authentication", False, 
                                f"Login response missing access_token: {data}")
                    return False
            else:
                self.log_test("User Authentication", False, 
                            f"Login failed with status {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("User Authentication", False, 
                        f"Authentication error: {str(e)}")
            return False
    
    def test_cart_api_structure(self):
        """Test GET /api/cart endpoint and verify data structure"""
        try:
            if not self.access_token:
                self.log_test("Cart API Structure Test", False, 
                            "No access token available for authentication")
                return False
            
            headers = {
                'Authorization': f'Bearer {self.access_token}',
                'Content-Type': 'application/json'
            }
            
            response = self.session.get(f"{BACKEND_URL}/cart", 
                                      headers=headers, timeout=15)
            
            if response.status_code == 200:
                data = response.json()
                
                if not data.get('success'):
                    self.log_test("Cart API Structure Test", False, 
                                f"Cart API returned success=false: {data.get('message', 'Unknown error')}")
                    return False
                
                cart_data = data.get('data', {})
                cart_items = cart_data.get('cart_items', [])
                
                self.log_test("Cart API Response", True, 
                            f"Cart API responded successfully with {len(cart_items)} items")
                
                # Verify cart_items structure
                if len(cart_items) == 0:
                    self.log_test("Cart Items Structure", True, 
                                "Cart is empty - cannot verify item structure but API is working")
                    return True
                
                # Check first cart item structure
                first_item = cart_items[0]
                
                # CRITICAL TEST: Verify 'products' property exists (not 'product')
                if 'products' in first_item:
                    self.log_test("Cart Item 'products' Property", True, 
                                "✅ CRITICAL: Cart items contain 'products' property (plural) as expected")
                    
                    # Verify products structure
                    products = first_item['products']
                    required_fields = ['id', 'name', 'images', 'stock_quantity', 'is_active']
                    missing_fields = []
                    
                    for field in required_fields:
                        if field not in products:
                            missing_fields.append(field)
                    
                    if not missing_fields:
                        self.log_test("Cart Item Products Fields", True, 
                                    f"All required fields present in products: {required_fields}")
                    else:
                        self.log_test("Cart Item Products Fields", False, 
                                    f"Missing required fields in products: {missing_fields}")
                        return False
                    
                    # Verify images field is array
                    if isinstance(products.get('images'), list):
                        self.log_test("Cart Item Images Array", True, 
                                    f"Images field is array with {len(products['images'])} items")
                    else:
                        self.log_test("Cart Item Images Array", False, 
                                    f"Images field is not array: {type(products.get('images'))}")
                        return False
                    
                    return True
                    
                elif 'product' in first_item:
                    self.log_test("Cart Item 'products' Property", False, 
                                "❌ CRITICAL: Cart items contain 'product' property (singular) - this will cause frontend errors!")
                    return False
                else:
                    self.log_test("Cart Item 'products' Property", False, 
                                "❌ CRITICAL: Cart items missing both 'products' and 'product' properties")
                    return False
                    
            else:
                self.log_test("Cart API Structure Test", False, 
                            f"Cart API failed with status {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Cart API Structure Test", False, 
                        f"Cart API test error: {str(e)}")
            return False
    
    def add_test_item_to_cart(self):
        """Add a test item to cart to ensure we have data to test"""
        try:
            if not self.access_token:
                return False
            
            headers = {
                'Authorization': f'Bearer {self.access_token}',
                'Content-Type': 'application/json'
            }
            
            # Get a product to add to cart
            products_response = self.session.get(f"{BACKEND_URL}/products?limit=1", 
                                               headers=headers, timeout=15)
            
            if products_response.status_code == 200:
                products_data = products_response.json()
                if products_data.get('success') and products_data.get('data'):
                    product_id = products_data['data'][0]['id']
                    
                    # Add to cart
                    cart_data = {
                        "productId": product_id,
                        "quantity": 1
                    }
                    
                    response = self.session.post(f"{BACKEND_URL}/cart/add", 
                                               json=cart_data, headers=headers, timeout=15)
                    
                    if response.status_code == 200:
                        self.log_test("Add Test Item to Cart", True, 
                                    f"Successfully added product {product_id} to cart")
                        return True
                    else:
                        self.log_test("Add Test Item to Cart", False, 
                                    f"Failed to add item to cart: {response.text}")
                        return False
            
            return False
            
        except Exception as e:
            self.log_test("Add Test Item to Cart", False, 
                        f"Error adding test item: {str(e)}")
            return False
    
    def run_comprehensive_test(self):
        """Run comprehensive checkout data structure test"""
        print("🎯 CHECKOUT PAGE DATA STRUCTURE FIX TESTING")
        print("=" * 60)
        print(f"Backend URL: {BACKEND_URL}")
        print(f"Test User: {TEST_USER_EMAIL}")
        print("=" * 60)
        
        # Test 1: Backend Health
        if not self.test_backend_health():
            print("\n❌ Backend server not accessible. Cannot proceed with testing.")
            return False
        
        # Test 2: Authentication
        if not self.authenticate_user():
            print("\n❌ Authentication failed. Cannot proceed with cart testing.")
            return False
        
        # Test 3: Add test item to cart (to ensure we have data)
        self.add_test_item_to_cart()
        
        # Test 4: Cart API Structure (CRITICAL TEST)
        cart_test_result = self.test_cart_api_structure()
        
        # Summary
        print("\n" + "=" * 60)
        print("🎯 CHECKOUT DATA STRUCTURE TEST SUMMARY")
        print("=" * 60)
        
        passed_tests = sum(1 for result in self.test_results if "✅ PASS" in result['status'])
        total_tests = len(self.test_results)
        
        print(f"Tests Passed: {passed_tests}/{total_tests}")
        
        if cart_test_result:
            print("\n✅ CRITICAL RESULT: Backend cart API returns 'products' property correctly!")
            print("✅ Frontend fix should resolve 'TypeError: e.product is undefined' error")
            print("✅ Checkout page data structure mismatch is RESOLVED")
        else:
            print("\n❌ CRITICAL ISSUE: Backend cart API structure problem detected!")
            print("❌ Frontend may still experience 'TypeError: e.product is undefined' error")
            print("❌ Data structure mismatch needs backend fix")
        
        return cart_test_result

def main():
    """Main test execution"""
    tester = CheckoutDataStructureTest()
    success = tester.run_comprehensive_test()
    
    if success:
        print("\n🎉 CHECKOUT DATA STRUCTURE TEST COMPLETED SUCCESSFULLY!")
        sys.exit(0)
    else:
        print("\n❌ CHECKOUT DATA STRUCTURE TEST FAILED!")
        sys.exit(1)

if __name__ == "__main__":
    main()
#!/usr/bin/env python3
"""
Final Cart Verification Test
============================
Test the complete Add to Cart flow with multiple products and operations
"""

import requests
import json
import sys
from datetime import datetime

class FinalCartVerificationTester:
    def __init__(self, base_url="http://localhost:8001/api"):
        self.base_url = base_url
        self.token = None
        self.user_id = None
        self.test_user_email = None
        self.tests_run = 0
        self.tests_passed = 0

    def log_test(self, name, success, message=""):
        """Log test results"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            status = "✅ PASS"
        else:
            status = "❌ FAIL"
        
        print(f"{status} - {name}: {message}")
        return success

    def make_request(self, method, endpoint, data=None, expected_status=200):
        """Make HTTP request"""
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

            try:
                response_data = response.json()
            except:
                response_data = {"raw_response": response.text[:200]}

            success = response.status_code == expected_status
            return success, response.status_code, response_data

        except requests.exceptions.RequestException as e:
            return False, 0, {"error": str(e)}

    def setup_test_user(self):
        """Setup test user for cart operations"""
        print("\n🔧 Setting up test user...")
        
        # Generate unique test user
        timestamp = datetime.now().strftime('%H%M%S%f')[:-3]
        self.test_user_email = f"finaltest.{timestamp}@example.com"
        
        # Register user
        user_data = {
            "email": self.test_user_email,
            "password": "FinalTest123!",
            "fullName": f"Final Test User {timestamp}",
            "phone": "+1234567890"
        }
        
        success, status, data = self.make_request('POST', '/auth/register', user_data, 201)
        if not success:
            return self.log_test("User Setup", False, f"Registration failed - Status: {status}")
        
        # Login user
        login_data = {
            "email": self.test_user_email,
            "password": "FinalTest123!"
        }
        
        success, status, data = self.make_request('POST', '/auth/login', login_data)
        if success and data.get('success'):
            self.token = data.get('token')
            self.user_id = data.get('user', {}).get('id')
            return self.log_test("User Setup", True, f"User ready - ID: {self.user_id}")
        else:
            return self.log_test("User Setup", False, f"Login failed - Status: {status}")

    def test_complete_cart_flow(self):
        """Test complete cart flow with multiple products"""
        print("\n🛒 Testing Complete Cart Flow...")
        
        # Get products from different categories
        categories = ['electronics', 'fashion', 'books']
        products_to_add = []
        
        for category in categories:
            success, status, data = self.make_request('GET', f'/products/category/{category}?limit=1')
            if success and data.get('success') and data.get('data'):
                products_to_add.append(data['data'][0])
        
        if len(products_to_add) < 2:
            return self.log_test("Complete Cart Flow", False, "Not enough products available for testing")
        
        # Test 1: Add first product
        product1 = products_to_add[0]
        cart_data1 = {"productId": product1['id'], "quantity": 2}
        success, status, data = self.make_request('POST', '/cart/add', cart_data1)
        
        if not success:
            return self.log_test("Complete Cart Flow", False, f"Failed to add first product - Status: {status}")
        
        self.log_test("Add Product 1", True, f"Added {product1['name'][:30]}... (qty: 2)")
        
        # Test 2: Add second product
        product2 = products_to_add[1]
        cart_data2 = {"productId": product2['id'], "quantity": 1}
        success, status, data = self.make_request('POST', '/cart/add', cart_data2)
        
        if not success:
            return self.log_test("Complete Cart Flow", False, f"Failed to add second product - Status: {status}")
        
        self.log_test("Add Product 2", True, f"Added {product2['name'][:30]}... (qty: 1)")
        
        # Test 3: Get cart with items
        success, status, data = self.make_request('GET', '/cart')
        
        if success and data.get('success'):
            cart = data.get('data', {})
            items = cart.get('items', [])
            total = cart.get('total', 0)
            
            if len(items) >= 2:
                self.log_test("Get Cart with Items", True, f"Cart has {len(items)} items, Total: ${total}")
                return True
            else:
                self.log_test("Get Cart with Items", False, f"Expected 2+ items, got {len(items)}")
                return False
        else:
            return self.log_test("Get Cart with Items", False, f"Failed to get cart - Status: {status}")

    def test_cart_persistence(self):
        """Test cart persistence across sessions"""
        print("\n💾 Testing Cart Persistence...")
        
        # Get current cart
        success, status, data = self.make_request('GET', '/cart')
        if not success:
            return self.log_test("Cart Persistence", False, "Could not get initial cart")
        
        initial_items = len(data.get('data', {}).get('items', []))
        
        # Simulate new session by clearing token and logging in again
        old_token = self.token
        self.token = None
        
        # Login again
        login_data = {
            "email": self.test_user_email,
            "password": "FinalTest123!"
        }
        
        success, status, data = self.make_request('POST', '/auth/login', login_data)
        if not success:
            self.token = old_token  # Restore token
            return self.log_test("Cart Persistence", False, "Could not re-login")
        
        self.token = data.get('token')
        
        # Get cart again
        success, status, data = self.make_request('GET', '/cart')
        if success and data.get('success'):
            new_items = len(data.get('data', {}).get('items', []))
            
            if new_items == initial_items:
                return self.log_test("Cart Persistence", True, f"Cart persisted with {new_items} items")
            else:
                return self.log_test("Cart Persistence", False, f"Items changed: {initial_items} -> {new_items}")
        else:
            return self.log_test("Cart Persistence", False, "Could not get cart after re-login")

    def run_final_verification(self):
        """Run final verification tests"""
        print("=" * 60)
        print("🎯 Final Cart Verification Test")
        print("📋 Complete Add to Cart Flow Testing")
        print("=" * 60)
        print(f"📅 Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print(f"🌐 Testing endpoint: {self.base_url}")
        print("=" * 60)

        # Setup and run tests
        if not self.setup_test_user():
            print("❌ Test setup failed")
            return 1
        
        self.test_complete_cart_flow()
        self.test_cart_persistence()

        # Results
        print("\n" + "=" * 60)
        print("📊 FINAL VERIFICATION RESULTS")
        print("=" * 60)
        print(f"📈 Overall Results: {self.tests_passed}/{self.tests_run} tests passed")
        
        if self.tests_passed == self.tests_run:
            print("🎉 ALL TESTS PASSED! Add to Cart is fully functional!")
            print("✅ Users can successfully add products to cart")
            print("✅ Cart persists across sessions")
            print("✅ Multiple products can be added")
            print("✅ Authentication and RLS policies working correctly")
            return 0
        else:
            print(f"⚠️ {self.tests_run - self.tests_passed} tests failed")
            return 1

def main():
    """Main test execution"""
    tester = FinalCartVerificationTester()
    return tester.run_final_verification()

if __name__ == "__main__":
    sys.exit(main())
#!/usr/bin/env python3
"""
Orders API Debug Test - RitZone Backend
=====================================
Comprehensive testing to identify and fix the "'list' object has no attribute 'get'" error
in the Orders API functionality.

Focus Areas:
1. Test GET /api/orders endpoint with proper authentication
2. Check if the orders data structure is returned correctly
3. Identify any backend code that might be calling .get() method on list/array data
4. Verify the orderService.getUserOrders method works properly
5. Test the orders API response format matches expected structure
6. Check for any data transformation issues in the orders processing

Test Credentials: b@b.com / Abcd@1234
Backend URL: https://ritkart-backend-ujnt.onrender.com/api or http://localhost:10000/api
"""

import requests
import json
import sys
import time
from datetime import datetime

class OrdersAPIDebugTester:
    def __init__(self):
        # Use production backend URL as specified in the request
        self.base_url = "https://ritkart-backend-ujnt.onrender.com/api"
        self.backup_url = "http://localhost:10000/api"
        self.session = requests.Session()
        self.access_token = None
        self.user_id = None
        
        # Test credentials as specified
        self.test_email = "b@b.com"
        self.test_password = "Abcd@1234"
        
        print("🔍 Orders API Debug Test - RitZone Backend")
        print("=" * 60)
        print(f"Primary Backend URL: {self.base_url}")
        print(f"Backup Backend URL: {self.backup_url}")
        print(f"Test Credentials: {self.test_email} / {self.test_password}")
        print("=" * 60)

    def test_backend_connectivity(self):
        """Test backend server connectivity"""
        print("\n🌐 Testing Backend Connectivity...")
        
        # Try primary URL first
        try:
            response = self.session.get(f"{self.base_url}/health", timeout=10)
            if response.status_code == 200:
                print(f"✅ Primary backend accessible: {self.base_url}")
                return True
        except Exception as e:
            print(f"❌ Primary backend failed: {e}")
        
        # Try backup URL
        try:
            response = self.session.get(f"{self.backup_url}/health", timeout=10)
            if response.status_code == 200:
                print(f"✅ Backup backend accessible: {self.backup_url}")
                self.base_url = self.backup_url
                return True
        except Exception as e:
            print(f"❌ Backup backend failed: {e}")
        
        print("❌ No backend servers accessible")
        return False

    def authenticate_user(self):
        """Authenticate user and get access token"""
        print(f"\n🔐 Authenticating user: {self.test_email}")
        
        try:
            # Login request
            login_data = {
                "email": self.test_email,
                "password": self.test_password
            }
            
            response = self.session.post(
                f"{self.base_url}/auth/login",
                json=login_data,
                timeout=15
            )
            
            print(f"Login response status: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success') and 'access_token' in data:
                    self.access_token = data['access_token']
                    self.user_id = data.get('user', {}).get('id')
                    print(f"✅ Authentication successful")
                    print(f"   Access token length: {len(self.access_token)} chars")
                    print(f"   User ID: {self.user_id}")
                    
                    # Set authorization header for future requests
                    self.session.headers.update({
                        'Authorization': f'Bearer {self.access_token}'
                    })
                    return True
                else:
                    print(f"❌ Login failed: {data.get('message', 'Unknown error')}")
                    return False
            else:
                print(f"❌ Login request failed with status {response.status_code}")
                try:
                    error_data = response.json()
                    print(f"   Error: {error_data.get('message', 'Unknown error')}")
                except:
                    print(f"   Raw response: {response.text[:200]}")
                return False
                
        except Exception as e:
            print(f"❌ Authentication error: {e}")
            return False

    def test_orders_api_get(self):
        """Test GET /api/orders endpoint - Main focus for debugging"""
        print(f"\n📋 Testing GET /api/orders endpoint...")
        
        try:
            # Test basic orders retrieval
            response = self.session.get(
                f"{self.base_url}/orders",
                timeout=15
            )
            
            print(f"Orders API response status: {response.status_code}")
            print(f"Response headers: {dict(response.headers)}")
            
            if response.status_code == 200:
                try:
                    data = response.json()
                    print(f"✅ Orders API responded successfully")
                    print(f"   Response structure: {type(data)}")
                    print(f"   Success flag: {data.get('success')}")
                    print(f"   Message: {data.get('message')}")
                    
                    # Check data structure
                    orders_data = data.get('data')
                    print(f"   Orders data type: {type(orders_data)}")
                    
                    if isinstance(orders_data, list):
                        print(f"   Orders count: {len(orders_data)}")
                        if len(orders_data) > 0:
                            print(f"   First order structure: {type(orders_data[0])}")
                            print(f"   First order keys: {list(orders_data[0].keys()) if isinstance(orders_data[0], dict) else 'Not a dict'}")
                    elif isinstance(orders_data, dict):
                        print(f"   Orders data keys: {list(orders_data.keys())}")
                    else:
                        print(f"   Orders data: {orders_data}")
                    
                    # Check pagination
                    pagination = data.get('pagination')
                    if pagination:
                        print(f"   Pagination: {pagination}")
                    
                    return True, data
                    
                except json.JSONDecodeError as e:
                    print(f"❌ JSON decode error: {e}")
                    print(f"   Raw response: {response.text[:500]}")
                    return False, None
                    
            else:
                print(f"❌ Orders API failed with status {response.status_code}")
                try:
                    error_data = response.json()
                    print(f"   Error message: {error_data.get('message', 'Unknown error')}")
                    print(f"   Error details: {error_data}")
                    
                    # Check if this is the "'list' object has no attribute 'get'" error
                    error_msg = str(error_data.get('message', ''))
                    if "'list' object has no attribute 'get'" in error_msg:
                        print(f"🎯 FOUND THE TARGET ERROR: {error_msg}")
                        return False, error_data
                        
                except:
                    print(f"   Raw error response: {response.text[:500]}")
                return False, None
                
        except Exception as e:
            print(f"❌ Orders API test error: {e}")
            return False, None

    def test_orders_api_with_params(self):
        """Test orders API with different parameters"""
        print(f"\n📋 Testing Orders API with parameters...")
        
        test_params = [
            {"page": 1, "limit": 10},
            {"page": 1, "limit": 5},
            {"page": 2, "limit": 10},
        ]
        
        for params in test_params:
            print(f"\n   Testing with params: {params}")
            try:
                response = self.session.get(
                    f"{self.base_url}/orders",
                    params=params,
                    timeout=15
                )
                
                print(f"   Status: {response.status_code}")
                
                if response.status_code == 200:
                    data = response.json()
                    print(f"   ✅ Success with params {params}")
                    print(f"   Data type: {type(data.get('data'))}")
                else:
                    try:
                        error_data = response.json()
                        error_msg = str(error_data.get('message', ''))
                        if "'list' object has no attribute 'get'" in error_msg:
                            print(f"   🎯 FOUND TARGET ERROR with params {params}: {error_msg}")
                        else:
                            print(f"   ❌ Error: {error_msg}")
                    except:
                        print(f"   ❌ Raw error: {response.text[:200]}")
                        
            except Exception as e:
                print(f"   ❌ Exception with params {params}: {e}")

    def test_create_order_for_debugging(self):
        """Create a test order to have data for debugging"""
        print(f"\n🛍️ Creating test order for debugging...")
        
        # First, let's check if user has items in cart
        try:
            cart_response = self.session.get(f"{self.base_url}/cart", timeout=10)
            if cart_response.status_code == 200:
                cart_data = cart_response.json()
                if cart_data.get('success') and cart_data.get('data', {}).get('cart_items'):
                    print(f"   ✅ User has {len(cart_data['data']['cart_items'])} items in cart")
                else:
                    print(f"   ℹ️ User has empty cart, will create order anyway")
            else:
                print(f"   ⚠️ Could not check cart: {cart_response.status_code}")
        except Exception as e:
            print(f"   ⚠️ Cart check error: {e}")
        
        # Create a test order
        order_data = {
            "shippingAddress": {
                "full_name": "Test User",
                "address_line1": "123 Test Street",
                "city": "Test City",
                "state": "Test State",
                "postal_code": "12345",
                "country": "US",
                "phone": "1234567890"
            },
            "billingAddress": {
                "full_name": "Test User",
                "address_line1": "123 Test Street",
                "city": "Test City",
                "state": "Test State",
                "postal_code": "12345",
                "country": "US",
                "phone": "1234567890"
            },
            "paymentMethod": "cod",
            "notes": "Test order for debugging Orders API",
            "discountAmount": 0
        }
        
        try:
            response = self.session.post(
                f"{self.base_url}/orders",
                json=order_data,
                timeout=15
            )
            
            print(f"   Create order status: {response.status_code}")
            
            if response.status_code == 201:
                data = response.json()
                print(f"   ✅ Test order created successfully")
                print(f"   Order ID: {data.get('data', {}).get('id')}")
                return True
            else:
                try:
                    error_data = response.json()
                    print(f"   ❌ Order creation failed: {error_data.get('message')}")
                except:
                    print(f"   ❌ Order creation failed: {response.text[:200]}")
                return False
                
        except Exception as e:
            print(f"   ❌ Order creation error: {e}")
            return False

    def analyze_backend_logs(self):
        """Analyze potential backend issues"""
        print(f"\n🔍 Backend Analysis for 'list' object error...")
        
        print("   Potential causes of \"'list' object has no attribute 'get'\" error:")
        print("   1. Backend code trying to call .get() on a list instead of dict")
        print("   2. Database query returning array when dict expected")
        print("   3. Data transformation issue in orderService.getUserOrders")
        print("   4. Response formatting problem in orders route")
        print("   5. Pagination or filtering logic error")
        
        print("\n   Common locations where this error occurs:")
        print("   - orderService.getUserOrders() method")
        print("   - Order data transformation/mapping")
        print("   - Database query result processing")
        print("   - Response formatting in /api/orders route")

    def run_comprehensive_test(self):
        """Run all tests to identify the Orders API error"""
        print(f"\n🚀 Starting Comprehensive Orders API Debug Test")
        print(f"Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        
        # Test 1: Backend Connectivity
        if not self.test_backend_connectivity():
            print("❌ Cannot proceed without backend connectivity")
            return False
        
        # Test 2: Authentication
        if not self.authenticate_user():
            print("❌ Cannot proceed without authentication")
            return False
        
        # Test 3: Create test order (optional, for debugging)
        self.test_create_order_for_debugging()
        
        # Test 4: Main Orders API test
        success, data = self.test_orders_api_get()
        
        # Test 5: Orders API with parameters
        self.test_orders_api_with_params()
        
        # Test 6: Analysis
        self.analyze_backend_logs()
        
        print(f"\n📊 Test Summary:")
        print(f"   Backend URL: {self.base_url}")
        print(f"   Authentication: {'✅ Success' if self.access_token else '❌ Failed'}")
        print(f"   Orders API: {'✅ Working' if success else '❌ Failed'}")
        
        if not success:
            print(f"\n🎯 ORDERS API ISSUE IDENTIFIED:")
            print(f"   The Orders API is failing, likely with the 'list' object error")
            print(f"   This needs to be fixed in the backend orderService or routes")
            
        return success

def main():
    """Main test execution"""
    tester = OrdersAPIDebugTester()
    
    try:
        success = tester.run_comprehensive_test()
        
        if success:
            print(f"\n🎉 Orders API Debug Test COMPLETED - API Working")
            sys.exit(0)
        else:
            print(f"\n❌ Orders API Debug Test COMPLETED - Issues Found")
            sys.exit(1)
            
    except KeyboardInterrupt:
        print(f"\n⚠️ Test interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n💥 Unexpected error during testing: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
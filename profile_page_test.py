#!/usr/bin/env python3
"""
RitZone Profile Page API Testing
================================
Focused testing of profile page API endpoints for user authentication issue fix.

REVIEW REQUEST CONTEXT: 
User reported that profile page shows "TypeError: e.data is undefined" errors in console 
for Personal Info, My Orders, Wishlist, Address Book, and Payment Methods sections. 
The Dashboard section works perfectly. Frontend response handling has been fixed to match 
the working Dashboard pattern.

SPECIFIC TESTS REQUIRED:
1. Test user authentication with b@b.com / Abcd@1234 credentials
2. Test GET /api/profile/dashboard endpoint (should work - this one was working)
3. Test GET /api/auth/profile endpoint (Personal Info section)
4. Test GET /api/orders endpoint (My Orders section)  
5. Test GET /api/profile/wishlist endpoint (Wishlist section)
6. Test GET /api/profile/addresses endpoint (Address Book section)
7. Test GET /api/profile/payment-methods endpoint (Payment Methods section)

Focus: Verify all API endpoints return proper response structure and work with Supabase authentication tokens.
"""

import requests
import json
import time
import sys
from typing import Dict, Any, Optional

# Configuration - Using production backend URL from .env
BACKEND_URL = "https://ritkart-backend-ujnt.onrender.com/api"
TEST_USER_EMAIL = "b@b.com"
TEST_USER_PASSWORD = "Abcd@1234"

class ProfilePageAPITester:
    def __init__(self):
        self.session = requests.Session()
        self.access_token = None
        self.user_data = None
        
    def log_test(self, test_name: str, success: bool, message: str, details: Dict = None):
        """Log test results with consistent formatting"""
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} | {test_name}")
        print(f"     └─ {message}")
        if details:
            for key, value in details.items():
                print(f"        {key}: {value}")
        print()
        
    def test_backend_health(self) -> bool:
        """Test 1: Backend Health Check"""
        try:
            response = self.session.get(f"{BACKEND_URL}/health", timeout=30)
            
            if response.status_code == 200:
                data = response.json()
                self.log_test(
                    "Backend Health Check",
                    True,
                    f"Backend is running properly",
                    {
                        "Status Code": response.status_code,
                        "Message": data.get('message', 'N/A'),
                        "Environment": data.get('environment', {}).get('nodeEnv', 'N/A'),
                        "Database": "Connected" if data.get('database', {}).get('success') else "Failed"
                    }
                )
                return True
            else:
                self.log_test(
                    "Backend Health Check",
                    False,
                    f"Backend health check failed with status {response.status_code}",
                    {"Response": response.text[:200]}
                )
                return False
                
        except Exception as e:
            self.log_test(
                "Backend Health Check",
                False,
                f"Backend connection failed: {str(e)}"
            )
            return False
    
    def test_user_authentication(self) -> bool:
        """Test 2: User Authentication with b@b.com / Abcd@1234"""
        try:
            login_data = {
                "email": TEST_USER_EMAIL,
                "password": TEST_USER_PASSWORD
            }
            
            response = self.session.post(
                f"{BACKEND_URL}/auth/login",
                json=login_data,
                timeout=30
            )
            
            if response.status_code == 200:
                data = response.json()
                
                if data.get('success') and data.get('token'):
                    self.access_token = data['token']
                    self.user_data = data.get('user', {})
                    
                    self.log_test(
                        "User Authentication",
                        True,
                        f"Successfully authenticated user {TEST_USER_EMAIL}",
                        {
                            "Status Code": response.status_code,
                            "Token Type": "Supabase Access Token" if len(self.access_token) > 100 else "JWT Token",
                            "Token Length": len(self.access_token),
                            "User ID": self.user_data.get('id', 'N/A'),
                            "User Email": self.user_data.get('email', 'N/A'),
                            "Full Name": self.user_data.get('fullName', 'N/A')
                        }
                    )
                    return True
                else:
                    self.log_test(
                        "User Authentication",
                        False,
                        "Login response missing token or success flag",
                        {"Response": json.dumps(data, indent=2)[:300]}
                    )
                    return False
            else:
                self.log_test(
                    "User Authentication",
                    False,
                    f"Login failed with status {response.status_code}",
                    {"Response": response.text[:200]}
                )
                return False
                
        except Exception as e:
            self.log_test(
                "User Authentication",
                False,
                f"Authentication request failed: {str(e)}"
            )
            return False
    
    def test_profile_dashboard_api(self) -> bool:
        """Test 3: GET /api/profile/dashboard endpoint (should work - this one was working)"""
        if not self.access_token:
            self.log_test(
                "Profile Dashboard API",
                False,
                "No access token available - authentication must succeed first"
            )
            return False
            
        try:
            headers = {
                "Authorization": f"Bearer {self.access_token}",
                "Content-Type": "application/json"
            }
            
            response = self.session.get(
                f"{BACKEND_URL}/profile/dashboard",
                headers=headers,
                timeout=30
            )
            
            if response.status_code == 200:
                data = response.json()
                
                if data.get('success') and data.get('data'):
                    dashboard_data = data['data']
                    
                    self.log_test(
                        "Profile Dashboard API",
                        True,
                        "Dashboard API working perfectly",
                        {
                            "Status Code": response.status_code,
                            "User Name": dashboard_data.get('user', {}).get('name', 'N/A'),
                            "Total Orders": dashboard_data.get('stats', {}).get('totalOrders', 0),
                            "Cart Items": dashboard_data.get('stats', {}).get('cartItems', 0),
                            "Wishlist Items": dashboard_data.get('stats', {}).get('wishlistItems', 0),
                            "Recent Orders": len(dashboard_data.get('recentOrders', []))
                        }
                    )
                    return True
                else:
                    self.log_test(
                        "Profile Dashboard API",
                        False,
                        "Dashboard response missing data or success flag",
                        {"Response": json.dumps(data, indent=2)[:300]}
                    )
                    return False
            else:
                self.log_test(
                    "Profile Dashboard API",
                    False,
                    f"Dashboard API failed with status {response.status_code}",
                    {"Response": response.text[:200]}
                )
                return False
                
        except Exception as e:
            self.log_test(
                "Profile Dashboard API",
                False,
                f"Dashboard API request failed: {str(e)}"
            )
            return False
    
    def test_auth_profile_api(self) -> bool:
        """Test 4: GET /api/auth/profile endpoint (Personal Info section)"""
        if not self.access_token:
            self.log_test(
                "Auth Profile API",
                False,
                "No access token available - authentication must succeed first"
            )
            return False
            
        try:
            headers = {
                "Authorization": f"Bearer {self.access_token}",
                "Content-Type": "application/json"
            }
            
            response = self.session.get(
                f"{BACKEND_URL}/auth/profile",
                headers=headers,
                timeout=30
            )
            
            if response.status_code == 200:
                data = response.json()
                
                if data.get('success') and data.get('user'):
                    user = data['user']
                    
                    # Check if we're getting real user data (not dummy data)
                    is_real_data = (
                        user.get('email') != 'user@example.com' and
                        user.get('email') == TEST_USER_EMAIL and
                        user.get('full_name') and user.get('full_name') != 'User'
                    )
                    
                    self.log_test(
                        "Auth Profile API",
                        is_real_data,
                        "Retrieved real user profile data" if is_real_data else "Retrieved dummy/fallback data",
                        {
                            "Status Code": response.status_code,
                            "User Email": user.get('email', 'N/A'),
                            "Full Name": user.get('full_name', 'N/A'),
                            "Phone": user.get('phone', 'N/A'),
                            "Created At": user.get('created_at', 'N/A'),
                            "Data Type": "Real User Data" if is_real_data else "Dummy/Fallback Data"
                        }
                    )
                    return is_real_data
                else:
                    self.log_test(
                        "Auth Profile API",
                        False,
                        "Profile response missing user data or success flag",
                        {"Response": json.dumps(data, indent=2)[:300]}
                    )
                    return False
            else:
                self.log_test(
                    "Auth Profile API",
                    False,
                    f"Profile API failed with status {response.status_code}",
                    {"Response": response.text[:200]}
                )
                return False
                
        except Exception as e:
            self.log_test(
                "Auth Profile API",
                False,
                f"Profile API request failed: {str(e)}"
            )
            return False
    
    def test_orders_api(self) -> bool:
        """Test 5: GET /api/orders endpoint (My Orders section)"""
        if not self.access_token:
            self.log_test(
                "Orders API",
                False,
                "No access token available - authentication must succeed first"
            )
            return False
            
        try:
            headers = {
                "Authorization": f"Bearer {self.access_token}",
                "Content-Type": "application/json"
            }
            
            response = self.session.get(
                f"{BACKEND_URL}/orders",
                headers=headers,
                timeout=30
            )
            
            if response.status_code == 200:
                data = response.json()
                
                if data.get('success'):
                    orders = data.get('data', [])
                    pagination = data.get('pagination', {})
                    
                    self.log_test(
                        "Orders API",
                        True,
                        "Orders API working perfectly",
                        {
                            "Status Code": response.status_code,
                            "Orders Count": len(orders),
                            "Current Page": pagination.get('currentPage', 1),
                            "Total Pages": pagination.get('totalPages', 0),
                            "Total Count": pagination.get('totalCount', 0),
                            "Limit": pagination.get('limit', 10)
                        }
                    )
                    return True
                else:
                    self.log_test(
                        "Orders API",
                        False,
                        "Orders response missing success flag",
                        {"Response": json.dumps(data, indent=2)[:300]}
                    )
                    return False
            else:
                self.log_test(
                    "Orders API",
                    False,
                    f"Orders API failed with status {response.status_code}",
                    {"Response": response.text[:200]}
                )
                return False
                
        except Exception as e:
            self.log_test(
                "Orders API",
                False,
                f"Orders API request failed: {str(e)}"
            )
            return False
    
    def test_wishlist_api(self) -> bool:
        """Test 6: GET /api/profile/wishlist endpoint (Wishlist section)"""
        if not self.access_token:
            self.log_test(
                "Wishlist API",
                False,
                "No access token available - authentication must succeed first"
            )
            return False
            
        try:
            headers = {
                "Authorization": f"Bearer {self.access_token}",
                "Content-Type": "application/json"
            }
            
            response = self.session.get(
                f"{BACKEND_URL}/profile/wishlist",
                headers=headers,
                timeout=30
            )
            
            if response.status_code == 200:
                data = response.json()
                
                if data.get('success'):
                    wishlist_items = data.get('data', [])
                    
                    self.log_test(
                        "Wishlist API",
                        True,
                        "Wishlist API working perfectly",
                        {
                            "Status Code": response.status_code,
                            "Wishlist Items": len(wishlist_items),
                            "Has Products": len(wishlist_items) > 0,
                            "Sample Item": wishlist_items[0].get('product', {}).get('name', 'N/A') if wishlist_items else 'No items'
                        }
                    )
                    return True
                else:
                    self.log_test(
                        "Wishlist API",
                        False,
                        "Wishlist response missing success flag",
                        {"Response": json.dumps(data, indent=2)[:300]}
                    )
                    return False
            else:
                self.log_test(
                    "Wishlist API",
                    False,
                    f"Wishlist API failed with status {response.status_code}",
                    {"Response": response.text[:200]}
                )
                return False
                
        except Exception as e:
            self.log_test(
                "Wishlist API",
                False,
                f"Wishlist API request failed: {str(e)}"
            )
            return False
    
    def test_addresses_api(self) -> bool:
        """Test 7: GET /api/profile/addresses endpoint (Address Book section)"""
        if not self.access_token:
            self.log_test(
                "Addresses API",
                False,
                "No access token available - authentication must succeed first"
            )
            return False
            
        try:
            headers = {
                "Authorization": f"Bearer {self.access_token}",
                "Content-Type": "application/json"
            }
            
            response = self.session.get(
                f"{BACKEND_URL}/profile/addresses",
                headers=headers,
                timeout=30
            )
            
            if response.status_code == 200:
                data = response.json()
                
                if data.get('success'):
                    addresses = data.get('data', [])
                    
                    self.log_test(
                        "Addresses API",
                        True,
                        "Addresses API working perfectly",
                        {
                            "Status Code": response.status_code,
                            "Addresses Count": len(addresses),
                            "Has Addresses": len(addresses) > 0,
                            "Default Address": any(addr.get('is_default') for addr in addresses) if addresses else False
                        }
                    )
                    return True
                else:
                    self.log_test(
                        "Addresses API",
                        False,
                        "Addresses response missing success flag",
                        {"Response": json.dumps(data, indent=2)[:300]}
                    )
                    return False
            else:
                self.log_test(
                    "Addresses API",
                    False,
                    f"Addresses API failed with status {response.status_code}",
                    {"Response": response.text[:200]}
                )
                return False
                
        except Exception as e:
            self.log_test(
                "Addresses API",
                False,
                f"Addresses API request failed: {str(e)}"
            )
            return False
    
    def test_payment_methods_api(self) -> bool:
        """Test 8: GET /api/profile/payment-methods endpoint (Payment Methods section)"""
        if not self.access_token:
            self.log_test(
                "Payment Methods API",
                False,
                "No access token available - authentication must succeed first"
            )
            return False
            
        try:
            headers = {
                "Authorization": f"Bearer {self.access_token}",
                "Content-Type": "application/json"
            }
            
            response = self.session.get(
                f"{BACKEND_URL}/profile/payment-methods",
                headers=headers,
                timeout=30
            )
            
            if response.status_code == 200:
                data = response.json()
                
                if data.get('success'):
                    payment_methods = data.get('data', [])
                    
                    self.log_test(
                        "Payment Methods API",
                        True,
                        "Payment Methods API working perfectly",
                        {
                            "Status Code": response.status_code,
                            "Payment Methods Count": len(payment_methods),
                            "Has Payment Methods": len(payment_methods) > 0,
                            "Default Method": any(pm.get('is_default') for pm in payment_methods) if payment_methods else False
                        }
                    )
                    return True
                else:
                    self.log_test(
                        "Payment Methods API",
                        False,
                        "Payment Methods response missing success flag",
                        {"Response": json.dumps(data, indent=2)[:300]}
                    )
                    return False
            else:
                self.log_test(
                    "Payment Methods API",
                    False,
                    f"Payment Methods API failed with status {response.status_code}",
                    {"Response": response.text[:200]}
                )
                return False
                
        except Exception as e:
            self.log_test(
                "Payment Methods API",
                False,
                f"Payment Methods API request failed: {str(e)}"
            )
            return False
    
    def run_comprehensive_test(self):
        """Run all profile page API tests"""
        print("=" * 80)
        print("🔍 RITZONE PROFILE PAGE API TESTING")
        print("=" * 80)
        print(f"Backend URL: {BACKEND_URL}")
        print(f"Test User: {TEST_USER_EMAIL}")
        print(f"Test Time: {time.strftime('%Y-%m-%d %H:%M:%S UTC', time.gmtime())}")
        print("=" * 80)
        print()
        
        # Run all tests
        test_results = []
        
        # Test 1: Backend Health Check
        test_results.append(self.test_backend_health())
        
        # Test 2: User Authentication
        test_results.append(self.test_user_authentication())
        
        # Test 3: Profile Dashboard API (should work)
        test_results.append(self.test_profile_dashboard_api())
        
        # Test 4: Auth Profile API (Personal Info section)
        test_results.append(self.test_auth_profile_api())
        
        # Test 5: Orders API (My Orders section)
        test_results.append(self.test_orders_api())
        
        # Test 6: Wishlist API (Wishlist section)
        test_results.append(self.test_wishlist_api())
        
        # Test 7: Addresses API (Address Book section)
        test_results.append(self.test_addresses_api())
        
        # Test 8: Payment Methods API (Payment Methods section)
        test_results.append(self.test_payment_methods_api())
        
        # Summary
        passed_tests = sum(test_results)
        total_tests = len(test_results)
        success_rate = (passed_tests / total_tests) * 100
        
        print("=" * 80)
        print("📊 PROFILE PAGE API TEST SUMMARY")
        print("=" * 80)
        print(f"Tests Passed: {passed_tests}/{total_tests}")
        print(f"Success Rate: {success_rate:.1f}%")
        print()
        
        if success_rate == 100:
            print("🎉 EXCELLENT: All profile page API tests passed!")
            print("✅ Profile page should display real user data without errors")
            print("✅ All profile sections should load properly")
            print("✅ Authentication system working perfectly with Supabase tokens")
        elif success_rate >= 80:
            print("⚠️  GOOD: Most profile page API tests passed")
            print("🔍 Minor issues may exist - check failed tests above")
            print("✅ Core functionality should work properly")
        else:
            print("❌ CRITICAL: Profile page API system has major issues")
            print("🚨 Profile page will likely show errors and dummy data")
            print("🔧 Authentication or API response structure issues detected")
        
        print("=" * 80)
        
        return success_rate == 100

def main():
    """Main test execution"""
    tester = ProfilePageAPITester()
    success = tester.run_comprehensive_test()
    
    # Exit with appropriate code
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()
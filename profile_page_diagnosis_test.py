#!/usr/bin/env python3
"""
RitZone Profile Page API Diagnosis
==================================
Critical profile page API testing for production RitZone application.

ISSUE CONTEXT: User experiencing multiple profile page errors:
- "Failed to add address. Please try again."
- "Error Loading Wishlist"  
- "Error Loading Orders"
- "Error Loading Profile" 
- "Error Loading Dashboard"

Focus: Test all profile-related API endpoints with Supabase authentication.
"""

import requests
import json
import time
import sys
from typing import Dict, Any, Optional

# Configuration - Using production backend URL
BACKEND_URL = "https://ritkart-backend-ujnt.onrender.com/api"
TEST_USER_EMAIL = "b@b.com"
TEST_USER_PASSWORD = "Abcd@1234"

class ProfilePageTester:
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
        """Test 3: Profile Dashboard API (GET /api/profile/dashboard)"""
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
                    user_info = dashboard_data.get('user', {})
                    stats = dashboard_data.get('stats', {})
                    
                    self.log_test(
                        "Profile Dashboard API",
                        True,
                        "Dashboard data retrieved successfully",
                        {
                            "Status Code": response.status_code,
                            "User Email": user_info.get('email', 'N/A'),
                            "Full Name": user_info.get('fullName', 'N/A'),
                            "Total Orders": stats.get('totalOrders', 0),
                            "Cart Items": stats.get('cartItems', 0),
                            "Wishlist Items": stats.get('wishlistItems', 0),
                            "Total Spent": stats.get('totalSpent', 0)
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
    
    def test_profile_info_api(self) -> bool:
        """Test 4: Profile Info API (GET /api/auth/profile)"""
        if not self.access_token:
            self.log_test(
                "Profile Info API",
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
                        "Profile Info API",
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
                        "Profile Info API",
                        False,
                        "Profile response missing user data or success flag",
                        {"Response": json.dumps(data, indent=2)[:300]}
                    )
                    return False
            else:
                self.log_test(
                    "Profile Info API",
                    False,
                    f"Profile API failed with status {response.status_code}",
                    {"Response": response.text[:200]}
                )
                return False
                
        except Exception as e:
            self.log_test(
                "Profile Info API",
                False,
                f"Profile API request failed: {str(e)}"
            )
            return False
    
    def test_orders_api(self) -> bool:
        """Test 5: Orders API (GET /api/orders)"""
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
                        "Orders data retrieved successfully",
                        {
                            "Status Code": response.status_code,
                            "Orders Count": len(orders),
                            "Current Page": pagination.get('currentPage', 1),
                            "Total Count": pagination.get('totalCount', 0),
                            "Total Pages": pagination.get('totalPages', 0)
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
        """Test 6: Wishlist API (GET /api/profile/wishlist)"""
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
                        "Wishlist data retrieved successfully",
                        {
                            "Status Code": response.status_code,
                            "Wishlist Items": len(wishlist_items),
                            "Has Products": len(wishlist_items) > 0
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
        """Test 7: Addresses API (GET /api/profile/addresses)"""
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
                        "Addresses data retrieved successfully",
                        {
                            "Status Code": response.status_code,
                            "Addresses Count": len(addresses),
                            "Has Addresses": len(addresses) > 0
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
    
    def test_add_address_api(self) -> bool:
        """Test 8: Add Address API (POST /api/profile/addresses)"""
        if not self.access_token:
            self.log_test(
                "Add Address API",
                False,
                "No access token available - authentication must succeed first"
            )
            return False
            
        try:
            headers = {
                "Authorization": f"Bearer {self.access_token}",
                "Content-Type": "application/json"
            }
            
            # Test address data
            address_data = {
                "type": "home",
                "name": "Test Address",
                "street": "123 Test Street",
                "city": "Test City",
                "state": "Test State",
                "zipCode": "12345",
                "country": "India",
                "phone": "9876543210",
                "isDefault": False
            }
            
            response = self.session.post(
                f"{BACKEND_URL}/profile/addresses",
                json=address_data,
                headers=headers,
                timeout=30
            )
            
            if response.status_code == 201:
                data = response.json()
                
                if data.get('success') and data.get('data'):
                    address = data['data']
                    
                    self.log_test(
                        "Add Address API",
                        True,
                        "Address created successfully",
                        {
                            "Status Code": response.status_code,
                            "Address ID": address.get('id', 'N/A'),
                            "Address Type": address.get('type', 'N/A'),
                            "Address Name": address.get('name', 'N/A'),
                            "City": address.get('city', 'N/A')
                        }
                    )
                    
                    # Clean up - delete the test address
                    self.cleanup_test_address(address.get('id'))
                    return True
                else:
                    self.log_test(
                        "Add Address API",
                        False,
                        "Address creation response missing data or success flag",
                        {"Response": json.dumps(data, indent=2)[:300]}
                    )
                    return False
            else:
                self.log_test(
                    "Add Address API",
                    False,
                    f"Add address API failed with status {response.status_code}",
                    {"Response": response.text[:200]}
                )
                return False
                
        except Exception as e:
            self.log_test(
                "Add Address API",
                False,
                f"Add address API request failed: {str(e)}"
            )
            return False
    
    def cleanup_test_address(self, address_id: str):
        """Helper method to clean up test address"""
        if not address_id or not self.access_token:
            return
            
        try:
            headers = {
                "Authorization": f"Bearer {self.access_token}",
                "Content-Type": "application/json"
            }
            
            self.session.delete(
                f"{BACKEND_URL}/profile/addresses/{address_id}",
                headers=headers,
                timeout=30
            )
        except:
            pass  # Ignore cleanup errors
    
    def test_payment_methods_api(self) -> bool:
        """Test 9: Payment Methods API (GET /api/profile/payment-methods)"""
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
                        "Payment methods data retrieved successfully",
                        {
                            "Status Code": response.status_code,
                            "Payment Methods Count": len(payment_methods),
                            "Has Payment Methods": len(payment_methods) > 0
                        }
                    )
                    return True
                else:
                    self.log_test(
                        "Payment Methods API",
                        False,
                        "Payment methods response missing success flag",
                        {"Response": json.dumps(data, indent=2)[:300]}
                    )
                    return False
            else:
                self.log_test(
                    "Payment Methods API",
                    False,
                    f"Payment methods API failed with status {response.status_code}",
                    {"Response": response.text[:200]}
                )
                return False
                
        except Exception as e:
            self.log_test(
                "Payment Methods API",
                False,
                f"Payment methods API request failed: {str(e)}"
            )
            return False
    
    def test_supabase_token_validation(self) -> bool:
        """Test 10: Supabase Token Validation"""
        if not self.access_token:
            self.log_test(
                "Supabase Token Validation",
                False,
                "No access token available - authentication must succeed first"
            )
            return False
            
        # Test with valid token
        valid_token_test = self.test_api_with_token(self.access_token, "Valid Supabase Token")
        
        # Test with invalid token
        invalid_token_test = self.test_api_with_token("invalid_token_12345", "Invalid Token", expect_failure=True)
        
        # Test without token
        no_token_test = self.test_api_without_token()
        
        overall_success = valid_token_test and invalid_token_test and no_token_test
        
        self.log_test(
            "Supabase Token Validation Summary",
            overall_success,
            "Token validation working properly" if overall_success else "Token validation has issues",
            {
                "Valid Token Test": "✅ PASS" if valid_token_test else "❌ FAIL",
                "Invalid Token Test": "✅ PASS" if invalid_token_test else "❌ FAIL", 
                "No Token Test": "✅ PASS" if no_token_test else "❌ FAIL"
            }
        )
        
        return overall_success
    
    def test_api_with_token(self, token: str, test_name: str, expect_failure: bool = False) -> bool:
        """Helper method to test API with specific token"""
        try:
            headers = {
                "Authorization": f"Bearer {token}",
                "Content-Type": "application/json"
            }
            
            response = self.session.get(
                f"{BACKEND_URL}/auth/profile",
                headers=headers,
                timeout=30
            )
            
            if expect_failure:
                # For invalid tokens, we expect 401 or 403
                success = response.status_code in [401, 403]
                message = f"Correctly rejected {test_name.lower()}" if success else f"Failed to reject {test_name.lower()}"
            else:
                # For valid tokens, we expect 200
                success = response.status_code == 200
                message = f"Successfully accepted {test_name.lower()}" if success else f"Failed to accept {test_name.lower()}"
            
            self.log_test(
                f"Token Validation - {test_name}",
                success,
                message,
                {"Status Code": response.status_code}
            )
            
            return success
            
        except Exception as e:
            self.log_test(
                f"Token Validation - {test_name}",
                False,
                f"Request failed: {str(e)}"
            )
            return False
    
    def test_api_without_token(self) -> bool:
        """Helper method to test API without token"""
        try:
            response = self.session.get(
                f"{BACKEND_URL}/auth/profile",
                timeout=30
            )
            
            # We expect 401 when no token is provided
            success = response.status_code == 401
            message = "Correctly rejected request without token" if success else "Failed to reject request without token"
            
            self.log_test(
                "Token Validation - No Token",
                success,
                message,
                {"Status Code": response.status_code}
            )
            
            return success
            
        except Exception as e:
            self.log_test(
                "Token Validation - No Token",
                False,
                f"Request failed: {str(e)}"
            )
            return False
    
    def run_comprehensive_test(self):
        """Run all profile page API tests"""
        print("=" * 80)
        print("🔍 RITZONE PROFILE PAGE API DIAGNOSIS")
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
        
        # Test 3: Profile Dashboard API
        test_results.append(self.test_profile_dashboard_api())
        
        # Test 4: Profile Info API
        test_results.append(self.test_profile_info_api())
        
        # Test 5: Orders API
        test_results.append(self.test_orders_api())
        
        # Test 6: Wishlist API
        test_results.append(self.test_wishlist_api())
        
        # Test 7: Addresses API
        test_results.append(self.test_addresses_api())
        
        # Test 8: Add Address API
        test_results.append(self.test_add_address_api())
        
        # Test 9: Payment Methods API
        test_results.append(self.test_payment_methods_api())
        
        # Test 10: Supabase Token Validation
        test_results.append(self.test_supabase_token_validation())
        
        # Summary
        passed_tests = sum(test_results)
        total_tests = len(test_results)
        success_rate = (passed_tests / total_tests) * 100
        
        print("=" * 80)
        print("📊 PROFILE PAGE API DIAGNOSIS SUMMARY")
        print("=" * 80)
        print(f"Tests Passed: {passed_tests}/{total_tests}")
        print(f"Success Rate: {success_rate:.1f}%")
        print()
        
        if success_rate == 100:
            print("🎉 EXCELLENT: All profile page APIs working perfectly!")
            print("✅ Profile page should load without errors")
            print("✅ All profile sections should display real data")
        elif success_rate >= 80:
            print("⚠️  GOOD: Most profile page APIs working")
            print("🔍 Minor issues may exist - check failed tests above")
        else:
            print("❌ CRITICAL: Profile page has major API issues")
            print("🚨 Profile page will show errors and dummy data")
        
        print("=" * 80)
        
        return success_rate == 100

def main():
    """Main test execution"""
    tester = ProfilePageTester()
    success = tester.run_comprehensive_test()
    
    # Exit with appropriate code
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()
#!/usr/bin/env python3
"""
RitZone Admin Users DELETE Operation Test
========================================
Test the admin users DELETE operation to identify the exact foreign key constraint error.

This test will:
1. Test admin authentication endpoints
2. Get list of users from /api/admin/users endpoint  
3. Try to delete a user using DELETE /api/admin/users/:userId endpoint
4. Test bulk delete endpoint POST /api/admin/users/bulk-delete
5. Capture and analyze the exact PostgreSQL error message
"""

import requests
import json
import sys
import time
from datetime import datetime

# Configuration
BASE_URL = "http://localhost:8001/api"
ADMIN_EMAIL = "admin@ritzone.com"
ADMIN_PASSWORD = "RitZone@Admin2025!"

class AdminUsersDeleteTester:
    def __init__(self):
        self.session = requests.Session()
        self.admin_token = None
        self.admin_cookies = None
        self.test_results = []
        
    def log_test(self, test_name, success, details, error=None):
        """Log test results"""
        result = {
            'test': test_name,
            'success': success,
            'details': details,
            'error': error,
            'timestamp': datetime.now().isoformat()
        }
        self.test_results.append(result)
        
        status = "✅" if success else "❌"
        print(f"{status} {test_name}")
        if details:
            print(f"   Details: {details}")
        if error:
            print(f"   Error: {error}")
        print()

    def test_backend_health(self):
        """Test if backend is running"""
        try:
            response = self.session.get(f"{BASE_URL}/health", timeout=10)
            if response.status_code == 200:
                data = response.json()
                self.log_test(
                    "Backend Health Check",
                    True,
                    f"Backend running - Environment: {data.get('environment', {}).get('nodeEnv', 'unknown')}"
                )
                return True
            else:
                self.log_test(
                    "Backend Health Check",
                    False,
                    f"HTTP {response.status_code}",
                    response.text
                )
                return False
        except Exception as e:
            self.log_test(
                "Backend Health Check",
                False,
                "Connection failed",
                str(e)
            )
            return False

    def test_admin_login(self):
        """Test admin authentication"""
        try:
            login_data = {
                "email": ADMIN_EMAIL,
                "password": ADMIN_PASSWORD,
                "rememberMe": True
            }
            
            response = self.session.post(
                f"{BASE_URL}/auto-sync/auth/login",
                json=login_data,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success'):
                    self.admin_token = data.get('sessionToken')
                    self.admin_cookies = response.cookies
                    
                    # Set authorization header for future requests
                    self.session.headers.update({
                        'Authorization': f'Bearer {self.admin_token}',
                        'X-Admin-Token': self.admin_token
                    })
                    
                    self.log_test(
                        "Admin Login",
                        True,
                        f"Logged in as {data.get('user', {}).get('email', 'unknown')}"
                    )
                    return True
                else:
                    self.log_test(
                        "Admin Login",
                        False,
                        "Login failed",
                        data.get('message', 'Unknown error')
                    )
                    return False
            else:
                self.log_test(
                    "Admin Login",
                    False,
                    f"HTTP {response.status_code}",
                    response.text
                )
                return False
                
        except Exception as e:
            self.log_test(
                "Admin Login",
                False,
                "Request failed",
                str(e)
            )
            return False

    def test_admin_session_validation(self):
        """Test admin session validation"""
        try:
            response = self.session.get(
                f"{BASE_URL}/auto-sync/auth/validate",
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success'):
                    self.log_test(
                        "Admin Session Validation",
                        True,
                        f"Session valid for {data.get('user', {}).get('email', 'unknown')}"
                    )
                    return True
                else:
                    self.log_test(
                        "Admin Session Validation",
                        False,
                        "Session invalid",
                        data.get('message', 'Unknown error')
                    )
                    return False
            else:
                self.log_test(
                    "Admin Session Validation",
                    False,
                    f"HTTP {response.status_code}",
                    response.text
                )
                return False
                
        except Exception as e:
            self.log_test(
                "Admin Session Validation",
                False,
                "Request failed",
                str(e)
            )
            return False

    def test_get_users_list(self):
        """Test getting users list"""
        try:
            response = self.session.get(
                f"{BASE_URL}/admin/users?limit=10",
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success'):
                    users = data.get('data', [])
                    pagination = data.get('pagination', {})
                    
                    self.log_test(
                        "Get Users List",
                        True,
                        f"Retrieved {len(users)} users (Total: {pagination.get('totalUsers', 0)})"
                    )
                    
                    # Store users for deletion testing
                    self.users_list = users
                    return True
                else:
                    self.log_test(
                        "Get Users List",
                        False,
                        "Failed to get users",
                        data.get('message', 'Unknown error')
                    )
                    return False
            else:
                self.log_test(
                    "Get Users List",
                    False,
                    f"HTTP {response.status_code}",
                    response.text
                )
                return False
                
        except Exception as e:
            self.log_test(
                "Get Users List",
                False,
                "Request failed",
                str(e)
            )
            return False

    def test_single_user_delete(self):
        """Test deleting a single user to capture foreign key constraint error"""
        if not hasattr(self, 'users_list') or not self.users_list:
            self.log_test(
                "Single User Delete",
                False,
                "No users available for testing",
                "Users list is empty"
            )
            return False
            
        try:
            # Find a user to delete (avoid admin users)
            test_user = None
            for user in self.users_list:
                if user.get('email') != ADMIN_EMAIL and not user.get('email', '').startswith('admin'):
                    test_user = user
                    break
            
            if not test_user:
                self.log_test(
                    "Single User Delete",
                    False,
                    "No suitable test user found",
                    "All users appear to be admin users"
                )
                return False
            
            user_id = test_user.get('id')
            user_email = test_user.get('email')
            
            print(f"🎯 Attempting to delete user: {user_email} (ID: {user_id})")
            
            response = self.session.delete(
                f"{BASE_URL}/admin/users/{user_id}",
                timeout=10
            )
            
            # Capture the exact response regardless of status code
            response_text = response.text
            try:
                response_data = response.json()
            except:
                response_data = {"raw_response": response_text}
            
            if response.status_code == 200:
                self.log_test(
                    "Single User Delete",
                    True,
                    f"Successfully deleted user {user_email}",
                    None
                )
                return True
            else:
                # This is where we expect to capture the foreign key constraint error
                error_message = response_data.get('message', response_text)
                
                self.log_test(
                    "Single User Delete - FOREIGN KEY ERROR CAPTURED",
                    False,
                    f"HTTP {response.status_code} - User: {user_email}",
                    error_message
                )
                
                # Log detailed error analysis
                print("🔍 DETAILED ERROR ANALYSIS:")
                print(f"   Status Code: {response.status_code}")
                print(f"   Response Headers: {dict(response.headers)}")
                print(f"   Response Body: {response_text}")
                print(f"   User ID: {user_id}")
                print(f"   User Email: {user_email}")
                print(f"   User Details: {json.dumps(test_user, indent=2)}")
                print()
                
                return False
                
        except Exception as e:
            self.log_test(
                "Single User Delete",
                False,
                "Request failed",
                str(e)
            )
            return False

    def test_bulk_delete_users(self):
        """Test bulk delete to capture foreign key constraint errors"""
        if not hasattr(self, 'users_list') or not self.users_list:
            self.log_test(
                "Bulk Delete Users",
                False,
                "No users available for testing",
                "Users list is empty"
            )
            return False
            
        try:
            # Find 2-3 non-admin users for bulk delete testing
            test_users = []
            for user in self.users_list:
                if (user.get('email') != ADMIN_EMAIL and 
                    not user.get('email', '').startswith('admin') and 
                    len(test_users) < 3):
                    test_users.append(user)
            
            if not test_users:
                self.log_test(
                    "Bulk Delete Users",
                    False,
                    "No suitable test users found",
                    "All users appear to be admin users"
                )
                return False
            
            user_ids = [user.get('id') for user in test_users]
            user_emails = [user.get('email') for user in test_users]
            
            print(f"🎯 Attempting bulk delete of users: {', '.join(user_emails)}")
            
            bulk_delete_data = {
                "userIds": user_ids
            }
            
            response = self.session.post(
                f"{BASE_URL}/admin/users/bulk-delete",
                json=bulk_delete_data,
                timeout=10
            )
            
            # Capture the exact response regardless of status code
            response_text = response.text
            try:
                response_data = response.json()
            except:
                response_data = {"raw_response": response_text}
            
            if response.status_code == 200:
                data = response_data
                if data.get('success'):
                    deleted_count = data.get('data', {}).get('deletedCount', 0)
                    failed_count = data.get('data', {}).get('failedCount', 0)
                    errors = data.get('data', {}).get('errors', [])
                    
                    self.log_test(
                        "Bulk Delete Users",
                        True,
                        f"Deleted: {deleted_count}, Failed: {failed_count}",
                        f"Errors: {errors}" if errors else None
                    )
                    return True
                else:
                    self.log_test(
                        "Bulk Delete Users - FOREIGN KEY ERROR CAPTURED",
                        False,
                        f"Bulk delete failed for users: {', '.join(user_emails)}",
                        data.get('message', 'Unknown error')
                    )
                    return False
            else:
                # This is where we expect to capture the foreign key constraint error
                error_message = response_data.get('message', response_text)
                
                self.log_test(
                    "Bulk Delete Users - FOREIGN KEY ERROR CAPTURED",
                    False,
                    f"HTTP {response.status_code} - Users: {', '.join(user_emails)}",
                    error_message
                )
                
                # Log detailed error analysis
                print("🔍 DETAILED BULK DELETE ERROR ANALYSIS:")
                print(f"   Status Code: {response.status_code}")
                print(f"   Response Headers: {dict(response.headers)}")
                print(f"   Response Body: {response_text}")
                print(f"   User IDs: {user_ids}")
                print(f"   User Emails: {user_emails}")
                print(f"   Request Payload: {json.dumps(bulk_delete_data, indent=2)}")
                print()
                
                return False
                
        except Exception as e:
            self.log_test(
                "Bulk Delete Users",
                False,
                "Request failed",
                str(e)
            )
            return False

    def test_get_user_details(self):
        """Test getting detailed user information to understand relationships"""
        if not hasattr(self, 'users_list') or not self.users_list:
            return False
            
        try:
            # Get details for the first user
            test_user = self.users_list[0]
            user_id = test_user.get('id')
            user_email = test_user.get('email')
            
            response = self.session.get(
                f"{BASE_URL}/admin/users/{user_id}",
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success'):
                    user_details = data.get('data', {})
                    statistics = user_details.get('statistics', {})
                    recent_orders = user_details.get('recentOrders', [])
                    
                    self.log_test(
                        "Get User Details",
                        True,
                        f"User: {user_email} - Orders: {statistics.get('totalOrders', 0)}, Cart Items: {statistics.get('cartItemsCount', 0)}"
                    )
                    
                    # Log relationships that might cause foreign key constraints
                    print("🔗 USER RELATIONSHIPS ANALYSIS:")
                    print(f"   Total Orders: {statistics.get('totalOrders', 0)}")
                    print(f"   Completed Orders: {statistics.get('completedOrders', 0)}")
                    print(f"   Pending Orders: {statistics.get('pendingOrders', 0)}")
                    print(f"   Cart Items: {statistics.get('cartItemsCount', 0)}")
                    print(f"   Total Spent: ${statistics.get('totalSpent', 0)}")
                    print(f"   Recent Orders Count: {len(recent_orders)}")
                    
                    if recent_orders:
                        print("   Recent Order IDs:")
                        for order in recent_orders[:3]:  # Show first 3 orders
                            print(f"     - {order.get('id')} ({order.get('status')}) - ${order.get('total_amount')}")
                    print()
                    
                    return True
                else:
                    self.log_test(
                        "Get User Details",
                        False,
                        "Failed to get user details",
                        data.get('message', 'Unknown error')
                    )
                    return False
            else:
                self.log_test(
                    "Get User Details",
                    False,
                    f"HTTP {response.status_code}",
                    response.text
                )
                return False
                
        except Exception as e:
            self.log_test(
                "Get User Details",
                False,
                "Request failed",
                str(e)
            )
            return False

    def run_comprehensive_test(self):
        """Run all tests in sequence"""
        print("🚀 Starting Admin Users DELETE Operation Test")
        print("=" * 60)
        print()
        
        # Test sequence
        tests = [
            ("Backend Health", self.test_backend_health),
            ("Admin Login", self.test_admin_login),
            ("Admin Session Validation", self.test_admin_session_validation),
            ("Get Users List", self.test_get_users_list),
            ("Get User Details", self.test_get_user_details),
            ("Single User Delete", self.test_single_user_delete),
            ("Bulk Delete Users", self.test_bulk_delete_users),
        ]
        
        passed = 0
        total = len(tests)
        
        for test_name, test_func in tests:
            try:
                if test_func():
                    passed += 1
                time.sleep(0.5)  # Small delay between tests
            except Exception as e:
                self.log_test(test_name, False, "Test execution failed", str(e))
        
        # Summary
        print("=" * 60)
        print("🏁 TEST SUMMARY")
        print("=" * 60)
        print(f"Total Tests: {total}")
        print(f"Passed: {passed}")
        print(f"Failed: {total - passed}")
        print(f"Success Rate: {(passed/total)*100:.1f}%")
        print()
        
        # Detailed results
        print("📋 DETAILED RESULTS:")
        for result in self.test_results:
            status = "✅" if result['success'] else "❌"
            print(f"{status} {result['test']}")
            if result['details']:
                print(f"   {result['details']}")
            if result['error']:
                print(f"   ERROR: {result['error']}")
        
        print()
        print("🎯 FOREIGN KEY CONSTRAINT ERROR ANALYSIS:")
        print("=" * 60)
        
        # Look for foreign key errors in results
        fk_errors = []
        for result in self.test_results:
            if not result['success'] and result['error']:
                error_text = result['error'].lower()
                if any(keyword in error_text for keyword in ['foreign key', 'constraint', 'violates', 'reference']):
                    fk_errors.append(result)
        
        if fk_errors:
            print("🚨 FOREIGN KEY CONSTRAINT ERRORS DETECTED:")
            for error in fk_errors:
                print(f"   Test: {error['test']}")
                print(f"   Error: {error['error']}")
                print()
        else:
            print("ℹ️  No explicit foreign key constraint errors detected in responses.")
            print("   This could mean:")
            print("   1. The foreign key constraints are handled gracefully by the application")
            print("   2. The constraints are enforced at the database level but not exposed in API responses")
            print("   3. The test users don't have the relationships that would trigger constraints")
            print()
        
        return passed == total

def main():
    """Main test execution"""
    tester = AdminUsersDeleteTester()
    success = tester.run_comprehensive_test()
    
    if success:
        print("🎉 All tests completed successfully!")
        sys.exit(0)
    else:
        print("⚠️  Some tests failed - check the detailed results above.")
        sys.exit(1)

if __name__ == "__main__":
    main()
#!/usr/bin/env python3
"""
RitZone Admin Users Service Role Key Backend Testing Suite - January 2025
=========================================================================
Comprehensive testing for Admin Users creation functionality with focus on:
- Supabase Service Role Key configuration fix
- Admin authentication and authorization
- User creation with proper service role permissions
- Testing the specific fix for "Failed to create user: User not allowed" error
- Admin panel user management functionality
"""

import requests
import json
import sys
import uuid
import time
from datetime import datetime

class AdminUsersServiceRoleTester:
    def __init__(self, base_url="http://localhost:8001/api"):
        self.base_url = base_url
        self.admin_token = None
        self.admin_user_id = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []
        self.created_user_ids = []  # Track created users for cleanup

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

    def make_request(self, method, endpoint, data=None, expected_status=200):
        """Make HTTP request with comprehensive error handling"""
        url = f"{self.base_url}{endpoint}"
        headers = {'Content-Type': 'application/json'}
        
        # Add admin authentication if available
        if self.admin_token:
            headers['Authorization'] = f'Bearer {self.admin_token}'

        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=15)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=15)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers, timeout=15)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers, timeout=15)
            else:
                raise ValueError(f"Unsupported method: {method}")

            # Parse response
            try:
                response_data = response.json()
            except:
                response_data = {"raw_response": response.text[:500]}

            success = response.status_code == expected_status
            return success, response.status_code, response_data

        except requests.exceptions.RequestException as e:
            return False, 0, {"error": str(e)}

    def test_backend_health(self):
        """Test backend health and configuration"""
        print("\n🔍 Testing Backend Health Check...")
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

    def test_admin_authentication(self):
        """Test admin login with provided credentials"""
        print("\n👤 Testing Admin Authentication...")
        
        # Use the admin credentials from the review request
        admin_credentials = {
            "email": "admin@ritzone.com",
            "password": "RitZone@Admin2025!"
        }
        
        # Try auto-sync auth endpoint first
        success, status, data = self.make_request('POST', '/auto-sync/auth/login', admin_credentials)
        
        if success and data.get('success'):
            if 'token' in data:
                self.admin_token = data['token']
            if 'user' in data:
                self.admin_user_id = data['user'].get('id')
            return self.log_test(
                "Admin Authentication", 
                True, 
                f"Admin login successful - Token acquired, Admin ID: {self.admin_user_id}"
            )
        else:
            # Try regular auth endpoint as fallback
            success, status, data = self.make_request('POST', '/auth/login', admin_credentials)
            
            if success and data.get('success'):
                if 'token' in data:
                    self.admin_token = data['token']
                if 'user' in data:
                    self.admin_user_id = data['user'].get('id')
                return self.log_test(
                    "Admin Authentication (Fallback)", 
                    True, 
                    f"Admin login successful via fallback - Token acquired"
                )
            else:
                return self.log_test(
                    "Admin Authentication", 
                    False, 
                    f"Admin login failed - Status: {status}, Response: {data}"
                )

    def test_admin_users_list_access(self):
        """Test admin access to users list"""
        if not self.admin_token:
            return self.log_test("Admin Users List Access", False, "No admin token available")
        
        print(f"🔍 Using admin token: {self.admin_token[:20]}...")
        
        print("\n📋 Testing Admin Users List Access...")
        success, status, data = self.make_request('GET', '/admin/users')
        
        if success and data.get('success'):
            users = data.get('data', [])
            pagination = data.get('pagination', {})
            return self.log_test(
                "Admin Users List Access", 
                True, 
                f"Successfully retrieved {len(users)} users, Total: {pagination.get('totalUsers', 0)}"
            )
        else:
            return self.log_test(
                "Admin Users List Access", 
                False, 
                f"Failed to access users list - Status: {status}, Response: {data}"
            )

    def test_supabase_service_role_configuration(self):
        """Test that Supabase Service Role Key is properly configured"""
        print("\n🔧 Testing Supabase Service Role Configuration...")
        
        # This test verifies the environment configuration includes service role key
        # We can't directly test the key, but we can test if admin operations work
        
        if not self.admin_token:
            return self.log_test("Service Role Configuration", False, "No admin token for testing")
        
        # Test admin-only endpoint that would require service role permissions
        success, status, data = self.make_request('GET', '/admin/users/stats')
        
        if success and data.get('success'):
            stats = data.get('data', {})
            return self.log_test(
                "Service Role Configuration", 
                True, 
                f"Service role working - Stats: {stats.get('totalUsers', 0)} total users"
            )
        else:
            return self.log_test(
                "Service Role Configuration", 
                False, 
                f"Service role may not be configured - Status: {status}, Response: {data}"
            )

    def test_admin_user_creation_with_service_role(self):
        """Test the core functionality - creating users with service role key"""
        if not self.admin_token:
            return self.log_test("Admin User Creation", False, "No admin token available")
        
        print("\n➕ Testing Admin User Creation with Service Role Key...")
        
        # Generate unique test user data as specified in review request
        timestamp = datetime.now().strftime('%H%M%S%f')[:-3]
        test_user_data = {
            "email": f"testuser{timestamp}@example.com",
            "password": "TestPassword123!",
            "full_name": f"Test User {timestamp}",
            "phone": "+1234567890",
            "address": "123 Test Street",
            "city": "Test City",
            "state": "Test State", 
            "country": "Test Country",
            "postal_code": "12345"
        }
        
        # This is the critical test - POST /api/admin/users
        success, status, data = self.make_request('POST', '/admin/users', test_user_data, 201)
        
        if success and data.get('success'):
            created_user = data.get('data', {})
            user_id = created_user.get('id')
            if user_id:
                self.created_user_ids.append(user_id)
            
            return self.log_test(
                "Admin User Creation", 
                True, 
                f"✅ SUCCESS: User created successfully - Email: {test_user_data['email']}, ID: {user_id}"
            )
        else:
            error_message = data.get('message', 'Unknown error')
            
            # Check for the specific error we're testing for
            if "User not allowed" in error_message:
                return self.log_test(
                    "Admin User Creation", 
                    False, 
                    f"❌ ORIGINAL ERROR STILL PRESENT: 'User not allowed' - Service role key fix not working"
                )
            else:
                return self.log_test(
                    "Admin User Creation", 
                    False, 
                    f"❌ User creation failed - Status: {status}, Error: {error_message}"
                )

    def test_multiple_user_creation(self):
        """Test creating multiple users to ensure consistency"""
        if not self.admin_token:
            return self.log_test("Multiple User Creation", False, "No admin token available")
        
        print("\n👥 Testing Multiple User Creation...")
        
        users_to_create = 3
        successful_creations = 0
        
        for i in range(users_to_create):
            timestamp = datetime.now().strftime('%H%M%S%f')[:-3]
            test_user_data = {
                "email": f"bulktest{timestamp}_{i}@example.com",
                "password": "TestPassword123!",
                "full_name": f"Bulk Test User {i+1}",
                "phone": f"+123456789{i}",
                "address": f"123 Test Street {i+1}",
                "city": "Test City",
                "state": "Test State",
                "country": "Test Country", 
                "postal_code": f"1234{i}"
            }
            
            success, status, data = self.make_request('POST', '/admin/users', test_user_data, 201)
            
            if success and data.get('success'):
                created_user = data.get('data', {})
                user_id = created_user.get('id')
                if user_id:
                    self.created_user_ids.append(user_id)
                successful_creations += 1
            
            # Small delay between requests
            time.sleep(0.5)
        
        if successful_creations == users_to_create:
            return self.log_test(
                "Multiple User Creation", 
                True, 
                f"Successfully created all {users_to_create} users - Service role key working consistently"
            )
        else:
            return self.log_test(
                "Multiple User Creation", 
                False, 
                f"Only {successful_creations}/{users_to_create} users created successfully"
            )

    def test_user_creation_validation(self):
        """Test user creation input validation"""
        if not self.admin_token:
            return self.log_test("User Creation Validation", False, "No admin token available")
        
        print("\n✅ Testing User Creation Input Validation...")
        
        validation_tests = [
            # Missing required fields
            ({}, "Missing all required fields should be rejected"),
            ({"email": "test@example.com"}, "Missing password should be rejected"),
            ({"email": "test@example.com", "password": "test123"}, "Missing full_name should be rejected"),
            # Invalid email format
            ({"email": "invalid-email", "password": "Test123!", "full_name": "Test User"}, "Invalid email format should be rejected"),
            # Weak password
            ({"email": "test@example.com", "password": "123", "full_name": "Test User"}, "Weak password should be rejected"),
        ]
        
        validation_passed = 0
        for test_data, description in validation_tests:
            success, status, data = self.make_request('POST', '/admin/users', test_data, expected_status=400)
            
            if success and status == 400:
                self.log_test(f"Validation: {description}", True, "Properly rejected invalid input")
                validation_passed += 1
            else:
                self.log_test(f"Validation: {description}", False, f"Validation failed - Status: {status}")
        
        return validation_passed >= len(validation_tests) * 0.8  # Allow 80% pass rate

    def test_duplicate_user_creation(self):
        """Test handling of duplicate user creation attempts"""
        if not self.admin_token:
            return self.log_test("Duplicate User Creation", False, "No admin token available")
        
        print("\n🔄 Testing Duplicate User Creation Handling...")
        
        # Create a user first
        timestamp = datetime.now().strftime('%H%M%S%f')[:-3]
        test_user_data = {
            "email": f"duplicate{timestamp}@example.com",
            "password": "TestPassword123!",
            "full_name": "Duplicate Test User",
            "phone": "+1234567890"
        }
        
        # First creation should succeed
        success1, status1, data1 = self.make_request('POST', '/admin/users', test_user_data, 201)
        
        if success1 and data1.get('success'):
            created_user = data1.get('data', {})
            user_id = created_user.get('id')
            if user_id:
                self.created_user_ids.append(user_id)
        
        # Second creation with same email should fail
        success2, status2, data2 = self.make_request('POST', '/admin/users', test_user_data, expected_status=400)
        
        if success1 and success2 and status2 == 400:
            return self.log_test(
                "Duplicate User Creation", 
                True, 
                "Properly handled duplicate user creation - First succeeded, second rejected"
            )
        else:
            return self.log_test(
                "Duplicate User Creation", 
                False, 
                f"Duplicate handling failed - First: {status1}, Second: {status2}"
            )

    def test_created_user_appears_in_list(self):
        """Test that created users appear in the admin users list"""
        if not self.admin_token or not self.created_user_ids:
            return self.log_test("User List Verification", False, "No admin token or created users to verify")
        
        print("\n📋 Testing Created Users Appear in List...")
        
        success, status, data = self.make_request('GET', '/admin/users')
        
        if success and data.get('success'):
            users = data.get('data', [])
            user_emails = [user.get('email', '') for user in users]
            
            # Check if our created users appear in the list
            found_users = 0
            for user in users:
                if user.get('id') in self.created_user_ids:
                    found_users += 1
            
            if found_users > 0:
                return self.log_test(
                    "User List Verification", 
                    True, 
                    f"Found {found_users} created users in admin list - Users properly persisted"
                )
            else:
                return self.log_test(
                    "User List Verification", 
                    False, 
                    "Created users not found in admin list - Persistence issue"
                )
        else:
            return self.log_test(
                "User List Verification", 
                False, 
                f"Failed to retrieve users list - Status: {status}"
            )

    def test_user_creation_error_handling(self):
        """Test proper error handling for various failure scenarios"""
        if not self.admin_token:
            return self.log_test("Error Handling", False, "No admin token available")
        
        print("\n🚨 Testing User Creation Error Handling...")
        
        # Test with malformed data that might cause server errors
        error_test_cases = [
            # Extremely long values
            ({
                "email": "test@example.com",
                "password": "TestPassword123!",
                "full_name": "A" * 1000,  # Very long name
            }, "Should handle extremely long names gracefully"),
            
            # Special characters in names
            ({
                "email": "test@example.com", 
                "password": "TestPassword123!",
                "full_name": "Test User <script>alert('xss')</script>",
            }, "Should handle special characters safely"),
        ]
        
        error_handling_passed = 0
        for test_data, description in error_test_cases:
            success, status, data = self.make_request('POST', '/admin/users', test_data)
            
            # We expect either success (if handled properly) or a proper error response (not 500)
            if status != 500:  # No internal server errors
                self.log_test(f"Error Handling: {description}", True, f"Handled gracefully - Status: {status}")
                error_handling_passed += 1
            else:
                self.log_test(f"Error Handling: {description}", False, f"Internal server error - Status: {status}")
        
        return error_handling_passed == len(error_test_cases)

    def cleanup_created_users(self):
        """Clean up users created during testing"""
        if not self.admin_token or not self.created_user_ids:
            return
        
        print(f"\n🧹 Cleaning up {len(self.created_user_ids)} test users...")
        
        cleaned_up = 0
        for user_id in self.created_user_ids:
            success, status, data = self.make_request('DELETE', f'/admin/users/{user_id}')
            if success:
                cleaned_up += 1
        
        print(f"✅ Cleaned up {cleaned_up}/{len(self.created_user_ids)} test users")

    def run_comprehensive_admin_users_tests(self):
        """Run comprehensive Admin Users Service Role Key testing suite"""
        print("=" * 80)
        print("👑 RitZone Admin Users Service Role Key Testing Suite - January 2025")
        print("🎯 Focus: Supabase Service Role Key Fix for User Creation")
        print("=" * 80)
        print(f"📅 Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print(f"🌐 Testing endpoint: {self.base_url}")
        print("🔑 Testing admin credentials: admin@ritzone.com")
        print("=" * 80)

        try:
            # Core infrastructure tests
            self.test_backend_health()
            
            # Admin authentication
            self.test_admin_authentication()
            
            # Admin access verification
            self.test_admin_users_list_access()
            
            # Service role configuration test
            self.test_supabase_service_role_configuration()
            
            # Core functionality tests - THE MAIN FIX
            self.test_admin_user_creation_with_service_role()
            self.test_multiple_user_creation()
            
            # Validation and error handling
            self.test_user_creation_validation()
            self.test_duplicate_user_creation()
            
            # Verification tests
            self.test_created_user_appears_in_list()
            self.test_user_creation_error_handling()

        finally:
            # Always try to clean up
            self.cleanup_created_users()

        # Print comprehensive results
        print("\n" + "=" * 80)
        print("📊 ADMIN USERS SERVICE ROLE KEY TEST RESULTS")
        print("=" * 80)
        
        critical_tests = []
        supporting_tests = []
        
        for result in self.test_results:
            if any(keyword in result['test'].lower() for keyword in ['admin user creation', 'service role', 'admin authentication']):
                critical_tests.append(result)
            else:
                supporting_tests.append(result)
        
        print("\n🚨 CRITICAL TESTS (Service Role Key Fix):")
        for result in critical_tests:
            print(f"{result['status']} {result['test']}: {result['message']}")
        
        print("\n📋 SUPPORTING TESTS:")
        for result in supporting_tests:
            print(f"{result['status']} {result['test']}: {result['message']}")
        
        print(f"\n📈 Overall Results: {self.tests_passed}/{self.tests_run} tests passed")
        
        # Specific analysis for the Service Role Key fix
        service_role_tests = [r for r in self.test_results if 'admin user creation' in r['test'].lower()]
        if service_role_tests:
            fix_working = all(r['status'] == '✅ PASS' for r in service_role_tests)
            print(f"\n🔑 Service Role Key Fix Status: {'✅ WORKING' if fix_working else '❌ FAILING'}")
            
            if fix_working:
                print("🎉 SUCCESS: The 'Failed to create user: User not allowed' error has been resolved!")
                print("✅ Admin users can now be created successfully using Supabase Service Role Key")
            else:
                failed_tests = [r for r in service_role_tests if r['status'] == '❌ FAIL']
                print("🚨 FAILURE: Service Role Key fix is not working properly")
                print("🔍 Failed Tests:")
                for test in failed_tests:
                    print(f"   - {test['test']}: {test['message']}")
                    if "User not allowed" in test['message']:
                        print("   ⚠️  The original error is still occurring - Service Role Key not being used")
        
        # Final assessment
        if self.tests_passed == self.tests_run:
            print("\n🎉 ALL TESTS PASSED! Admin Users Service Role Key fix is working perfectly.")
            return 0
        else:
            failed_critical = [r for r in critical_tests if r['status'] == '❌ FAIL']
            if failed_critical:
                print(f"\n🚨 {len(failed_critical)} critical tests failed")
                print("💡 Recommendations:")
                for test in failed_critical:
                    if 'service role' in test['test'].lower():
                        print("   - Verify SUPABASE_SERVICE_ROLE environment variable is set correctly")
                        print("   - Check getAdminSupabaseClient() function implementation")
                        print("   - Ensure admin-users-service.js uses adminClient for auth operations")
                    elif 'admin authentication' in test['test'].lower():
                        print("   - Check admin credentials and authentication system")
                        print("   - Verify admin user exists in database")
            return 1

def main():
    """Main test execution"""
    tester = AdminUsersServiceRoleTester()
    return tester.run_comprehensive_admin_users_tests()

if __name__ == "__main__":
    sys.exit(main())
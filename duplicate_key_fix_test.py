#!/usr/bin/env python3
"""
RitZone Admin Users Duplicate Key Constraint Fix Testing Suite - January 2025
=============================================================================
Comprehensive testing for the duplicate key constraint violation fix in Admin Users creation.

Focus Areas:
- Test POST /api/admin/users endpoint for creating new users
- Verify the duplicate key constraint error is resolved
- Test user creation with unique test data to avoid conflicts
- Confirm successful user creation without database constraint violations
- Test the cleanup mechanism for orphaned records
- Verify that created users appear correctly in the users list

Admin Credentials: admin@ritzone.com / RitZone@Admin2025!
"""

import requests
import json
import sys
import uuid
import time
from datetime import datetime

class DuplicateKeyFixTester:
    def __init__(self, base_url="http://localhost:8001/api"):
        self.base_url = base_url
        self.admin_token = None
        self.admin_user_id = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []
        self.created_user_ids = []  # Track created users for cleanup
        self.created_emails = []    # Track created emails for verification

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
        
        print(f"🔍 Auto-sync auth response: Status={status}, Data={data}")
        
        if success and data.get('success'):
            if 'sessionToken' in data:
                self.admin_token = data['sessionToken']
                print(f"🔑 Admin token acquired: {self.admin_token[:20]}...")
            elif 'token' in data:
                self.admin_token = data['token']
                print(f"🔑 Admin token acquired: {self.admin_token[:20]}...")
            if 'user' in data:
                self.admin_user_id = data['user'].get('id')
                print(f"👤 Admin user ID: {self.admin_user_id}")
            return self.log_test(
                "Admin Authentication", 
                True, 
                f"Admin login successful - Token acquired, Admin ID: {self.admin_user_id}"
            )
        else:
            # Try regular auth endpoint as fallback
            success, status, data = self.make_request('POST', '/auth/login', admin_credentials)
            
            print(f"🔍 Regular auth response: Status={status}, Data={data}")
            
            if success and data.get('success'):
                if 'sessionToken' in data:
                    self.admin_token = data['sessionToken']
                elif 'token' in data:
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

    def test_duplicate_key_constraint_fix(self):
        """Test the core fix - creating users without duplicate key constraint violations"""
        if not self.admin_token:
            return self.log_test("Duplicate Key Constraint Fix", False, "No admin token available")
        
        print("\n🔧 Testing Duplicate Key Constraint Fix...")
        
        # Generate unique test user data as specified in review request
        timestamp = datetime.now().strftime('%H%M%S%f')[:-3]
        unique_id = str(uuid.uuid4())[:8]  # Add UUID for extra uniqueness
        test_user_data = {
            "email": f"newuser_{timestamp}@example.com",
            "password": "TestPassword123!",
            "full_name": f"New Test User {timestamp}",
            "phone": "+1234567890",
            "address": "123 Test Street",
            "city": "Test City",
            "state": "Test State",
            "country": "Test Country",
            "postal_code": "12345"
        }
        
        print(f"🧪 Creating user with email: {test_user_data['email']}")
        
        # This is the critical test - POST /api/admin/users
        success, status, data = self.make_request('POST', '/admin/users', test_user_data, 201)
        
        if success and data.get('success'):
            created_user = data.get('data', {})
            user_id = created_user.get('id')
            if user_id:
                self.created_user_ids.append(user_id)
                self.created_emails.append(test_user_data['email'])
            
            return self.log_test(
                "Duplicate Key Constraint Fix", 
                True, 
                f"✅ SUCCESS: User created without constraint violations - Email: {test_user_data['email']}, ID: {user_id}"
            )
        else:
            error_message = data.get('message', 'Unknown error')
            
            # Check for the specific errors we're testing for
            if "duplicate key" in error_message.lower():
                return self.log_test(
                    "Duplicate Key Constraint Fix", 
                    False, 
                    f"❌ DUPLICATE KEY ERROR STILL PRESENT: {error_message} - Fix not working"
                )
            elif "violates unique constraint" in error_message.lower():
                return self.log_test(
                    "Duplicate Key Constraint Fix", 
                    False, 
                    f"❌ UNIQUE CONSTRAINT VIOLATION: {error_message} - Fix not working"
                )
            elif "user not allowed" in error_message.lower():
                return self.log_test(
                    "Duplicate Key Constraint Fix", 
                    False, 
                    f"⚠️  SERVICE ROLE KEY ISSUE (different problem): {error_message}"
                )
            else:
                return self.log_test(
                    "Duplicate Key Constraint Fix", 
                    False, 
                    f"❌ User creation failed - Status: {status}, Error: {error_message}"
                )

    def test_multiple_user_creation_no_conflicts(self):
        """Test creating multiple users to ensure no ID conflicts"""
        if not self.admin_token:
            return self.log_test("Multiple User Creation No Conflicts", False, "No admin token available")
        
        print("\n👥 Testing Multiple User Creation (No ID Conflicts)...")
        
        users_to_create = 5
        successful_creations = 0
        constraint_violations = 0
        
        for i in range(users_to_create):
            timestamp = datetime.now().strftime('%H%M%S%f')[:-3]
            unique_id = str(uuid.uuid4())[:8]
            test_user_data = {
                "email": f"bulktest_{timestamp}_{unique_id}_{i}@example.com",
                "password": "TestPassword123!",
                "full_name": f"Bulk Test User {i+1} {timestamp}",
                "phone": f"+123456789{i}",
                "address": f"123 Test Street {i+1}",
                "city": "Test City",
                "state": "Test State",
                "country": "Test Country", 
                "postal_code": f"1234{i}"
            }
            
            print(f"🧪 Creating user {i+1}/{users_to_create}: {test_user_data['email']}")
            
            success, status, data = self.make_request('POST', '/admin/users', test_user_data, 201)
            
            if success and data.get('success'):
                created_user = data.get('data', {})
                user_id = created_user.get('id')
                if user_id:
                    self.created_user_ids.append(user_id)
                    self.created_emails.append(test_user_data['email'])
                successful_creations += 1
                print(f"✅ User {i+1} created successfully: {user_id}")
            else:
                error_message = data.get('message', 'Unknown error')
                if "duplicate key" in error_message.lower() or "violates unique constraint" in error_message.lower():
                    constraint_violations += 1
                    print(f"❌ User {i+1} failed with constraint violation: {error_message}")
                else:
                    print(f"❌ User {i+1} failed with other error: {error_message}")
            
            # Small delay between requests to avoid race conditions
            time.sleep(0.5)
        
        if successful_creations == users_to_create and constraint_violations == 0:
            return self.log_test(
                "Multiple User Creation No Conflicts", 
                True, 
                f"Successfully created all {users_to_create} users with no constraint violations - Fix working perfectly"
            )
        elif constraint_violations > 0:
            return self.log_test(
                "Multiple User Creation No Conflicts", 
                False, 
                f"❌ {constraint_violations} constraint violations out of {users_to_create} attempts - Fix not working"
            )
        else:
            return self.log_test(
                "Multiple User Creation No Conflicts", 
                False, 
                f"Only {successful_creations}/{users_to_create} users created successfully (no constraint violations detected)"
            )

    def test_orphaned_record_cleanup(self):
        """Test the cleanup mechanism for orphaned records"""
        if not self.admin_token:
            return self.log_test("Orphaned Record Cleanup", False, "No admin token available")
        
        print("\n🧹 Testing Orphaned Record Cleanup Mechanism...")
        
        # Create a user that might trigger cleanup logic
        timestamp = datetime.now().strftime('%H%M%S%f')[:-3]
        unique_id = str(uuid.uuid4())[:8]
        test_user_data = {
            "email": f"cleanup_test_{timestamp}_{unique_id}@example.com",
            "password": "TestPassword123!",
            "full_name": f"Cleanup Test User {timestamp}",
            "phone": "+1234567890",
            "address": "123 Cleanup Street",
            "city": "Cleanup City",
            "state": "Cleanup State",
            "country": "Cleanup Country",
            "postal_code": "12345"
        }
        
        print(f"🧪 Creating user to test cleanup: {test_user_data['email']}")
        
        success, status, data = self.make_request('POST', '/admin/users', test_user_data, 201)
        
        if success and data.get('success'):
            created_user = data.get('data', {})
            user_id = created_user.get('id')
            if user_id:
                self.created_user_ids.append(user_id)
                self.created_emails.append(test_user_data['email'])
            
            return self.log_test(
                "Orphaned Record Cleanup", 
                True, 
                f"✅ User created successfully - Cleanup mechanism working (no orphaned record conflicts): {user_id}"
            )
        else:
            error_message = data.get('message', 'Unknown error')
            
            # If we get a duplicate key error, it means cleanup isn't working
            if "duplicate key" in error_message.lower() or "violates unique constraint" in error_message.lower():
                return self.log_test(
                    "Orphaned Record Cleanup", 
                    False, 
                    f"❌ CLEANUP MECHANISM FAILED: {error_message} - Orphaned records not being cleaned up"
                )
            else:
                return self.log_test(
                    "Orphaned Record Cleanup", 
                    False, 
                    f"❌ User creation failed (not cleanup related): {error_message}"
                )

    def test_email_verified_field_consistency(self):
        """Test that email_verified field is consistently true for admin-created users"""
        if not self.admin_token:
            return self.log_test("Email Verified Field Consistency", False, "No admin token available")
        
        print("\n📧 Testing Email Verified Field Consistency...")
        
        # Create a user and check email_verified field
        timestamp = datetime.now().strftime('%H%M%S%f')[:-3]
        unique_id = str(uuid.uuid4())[:8]
        test_user_data = {
            "email": f"emailverified_{timestamp}_{unique_id}@example.com",
            "password": "TestPassword123!",
            "full_name": f"Email Verified Test User {timestamp}",
            "phone": "+1234567890",
            "address": "123 Email Street",
            "city": "Email City",
            "state": "Email State",
            "country": "Email Country",
            "postal_code": "12345"
        }
        
        print(f"🧪 Creating user to test email_verified: {test_user_data['email']}")
        
        success, status, data = self.make_request('POST', '/admin/users', test_user_data, 201)
        
        if success and data.get('success'):
            created_user = data.get('data', {})
            user_id = created_user.get('id')
            email_verified = created_user.get('email_verified')
            
            if user_id:
                self.created_user_ids.append(user_id)
                self.created_emails.append(test_user_data['email'])
            
            if email_verified is True:
                return self.log_test(
                    "Email Verified Field Consistency", 
                    True, 
                    f"✅ email_verified field correctly set to true for admin-created user: {user_id}"
                )
            else:
                return self.log_test(
                    "Email Verified Field Consistency", 
                    False, 
                    f"❌ email_verified field is {email_verified}, should be true for admin-created users"
                )
        else:
            error_message = data.get('message', 'Unknown error')
            return self.log_test(
                "Email Verified Field Consistency", 
                False, 
                f"❌ User creation failed - Status: {status}, Error: {error_message}"
            )

    def test_created_users_appear_in_list(self):
        """Test that created users appear correctly in the users list"""
        if not self.admin_token or not self.created_user_ids:
            return self.log_test("Created Users Appear in List", False, "No admin token or created users to verify")
        
        print("\n📋 Testing Created Users Appear in List...")
        
        success, status, data = self.make_request('GET', '/admin/users')
        
        if success and data.get('success'):
            users = data.get('data', [])
            user_emails = [user.get('email', '') for user in users]
            user_ids = [user.get('id', '') for user in users]
            
            # Check if our created users appear in the list
            found_users = 0
            found_emails = 0
            
            for user_id in self.created_user_ids:
                if user_id in user_ids:
                    found_users += 1
            
            for email in self.created_emails:
                if email in user_emails:
                    found_emails += 1
            
            if found_users > 0 and found_emails > 0:
                return self.log_test(
                    "Created Users Appear in List", 
                    True, 
                    f"Found {found_users} created users and {found_emails} emails in admin list - Users properly persisted"
                )
            else:
                return self.log_test(
                    "Created Users Appear in List", 
                    False, 
                    f"Created users not found in admin list - Found {found_users} IDs and {found_emails} emails - Persistence issue"
                )
        else:
            return self.log_test(
                "Created Users Appear in List", 
                False, 
                f"Failed to retrieve users list - Status: {status}"
            )

    def test_user_creation_with_edge_cases(self):
        """Test user creation with edge cases that might trigger constraint violations"""
        if not self.admin_token:
            return self.log_test("User Creation Edge Cases", False, "No admin token available")
        
        print("\n🎯 Testing User Creation Edge Cases...")
        
        edge_cases = [
            # Case 1: Very long unique identifiers
            {
                "email": f"very_long_unique_identifier_{datetime.now().strftime('%H%M%S%f')[:-3]}_{str(uuid.uuid4())}@example.com",
                "password": "TestPassword123!",
                "full_name": f"Very Long Name Test User {datetime.now().strftime('%H%M%S%f')[:-3]}",
                "description": "Very long unique identifiers"
            },
            # Case 2: Special characters in names (but safe)
            {
                "email": f"special_chars_{datetime.now().strftime('%H%M%S%f')[:-3]}@example.com",
                "password": "TestPassword123!",
                "full_name": f"Test User-O'Connor {datetime.now().strftime('%H%M%S%f')[:-3]}",
                "description": "Special characters in names"
            },
            # Case 3: Rapid succession creation
            {
                "email": f"rapid_creation_{datetime.now().strftime('%H%M%S%f')[:-3]}@example.com",
                "password": "TestPassword123!",
                "full_name": f"Rapid Creation Test {datetime.now().strftime('%H%M%S%f')[:-3]}",
                "description": "Rapid succession creation"
            }
        ]
        
        successful_edge_cases = 0
        constraint_violations = 0
        
        for i, test_case in enumerate(edge_cases):
            print(f"🧪 Testing edge case {i+1}: {test_case['description']}")
            
            success, status, data = self.make_request('POST', '/admin/users', test_case, 201)
            
            if success and data.get('success'):
                created_user = data.get('data', {})
                user_id = created_user.get('id')
                if user_id:
                    self.created_user_ids.append(user_id)
                    self.created_emails.append(test_case['email'])
                successful_edge_cases += 1
                print(f"✅ Edge case {i+1} passed: {user_id}")
            else:
                error_message = data.get('message', 'Unknown error')
                if "duplicate key" in error_message.lower() or "violates unique constraint" in error_message.lower():
                    constraint_violations += 1
                    print(f"❌ Edge case {i+1} failed with constraint violation: {error_message}")
                else:
                    print(f"❌ Edge case {i+1} failed with other error: {error_message}")
            
            # Small delay for rapid succession test
            time.sleep(0.2)
        
        if successful_edge_cases == len(edge_cases) and constraint_violations == 0:
            return self.log_test(
                "User Creation Edge Cases", 
                True, 
                f"All {len(edge_cases)} edge cases passed with no constraint violations - Fix robust"
            )
        elif constraint_violations > 0:
            return self.log_test(
                "User Creation Edge Cases", 
                False, 
                f"❌ {constraint_violations} constraint violations in edge cases - Fix not robust"
            )
        else:
            return self.log_test(
                "User Creation Edge Cases", 
                False, 
                f"Only {successful_edge_cases}/{len(edge_cases)} edge cases passed"
            )

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
                print(f"✅ Cleaned up user: {user_id}")
            else:
                print(f"❌ Failed to clean up user: {user_id}")
        
        print(f"✅ Cleaned up {cleaned_up}/{len(self.created_user_ids)} test users")

    def run_comprehensive_duplicate_key_fix_tests(self):
        """Run comprehensive duplicate key constraint fix testing suite"""
        print("=" * 80)
        print("🔧 RitZone Admin Users Duplicate Key Constraint Fix Testing Suite")
        print("🎯 Focus: Testing the fix for 'duplicate key value violates unique constraint'")
        print("=" * 80)
        print(f"📅 Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print(f"🌐 Testing endpoint: {self.base_url}")
        print("🔑 Testing admin credentials: admin@ritzone.com")
        print("🎯 Testing duplicate key constraint violation fix")
        print("=" * 80)

        try:
            # Core infrastructure tests
            self.test_backend_health()
            
            # Admin authentication
            self.test_admin_authentication()
            
            # Admin access verification
            self.test_admin_users_list_access()
            
            # Core fix tests - THE MAIN FOCUS
            self.test_duplicate_key_constraint_fix()
            self.test_multiple_user_creation_no_conflicts()
            self.test_orphaned_record_cleanup()
            
            # Enhanced fix verification
            self.test_email_verified_field_consistency()
            self.test_user_creation_with_edge_cases()
            
            # Verification tests
            self.test_created_users_appear_in_list()

        finally:
            # Always try to clean up
            self.cleanup_created_users()

        # Print comprehensive results
        print("\n" + "=" * 80)
        print("📊 DUPLICATE KEY CONSTRAINT FIX TEST RESULTS")
        print("=" * 80)
        
        critical_tests = []
        supporting_tests = []
        
        for result in self.test_results:
            if any(keyword in result['test'].lower() for keyword in ['duplicate key', 'constraint', 'cleanup', 'multiple user']):
                critical_tests.append(result)
            else:
                supporting_tests.append(result)
        
        print("\n🚨 CRITICAL TESTS (Duplicate Key Constraint Fix):")
        for result in critical_tests:
            print(f"{result['status']} {result['test']}: {result['message']}")
        
        print("\n📋 SUPPORTING TESTS:")
        for result in supporting_tests:
            print(f"{result['status']} {result['test']}: {result['message']}")
        
        print(f"\n📈 Overall Results: {self.tests_passed}/{self.tests_run} tests passed")
        
        # Specific analysis for the duplicate key constraint fix
        constraint_tests = [r for r in self.test_results if any(keyword in r['test'].lower() for keyword in ['duplicate key', 'constraint', 'cleanup'])]
        if constraint_tests:
            fix_working = all(r['status'] == '✅ PASS' for r in constraint_tests)
            print(f"\n🔧 Duplicate Key Constraint Fix Status: {'✅ WORKING' if fix_working else '❌ FAILING'}")
            
            if fix_working:
                print("🎉 SUCCESS: The duplicate key constraint violation has been resolved!")
                print("✅ Admin users can now be created successfully without database constraint violations")
                print("✅ Cleanup mechanism for orphaned records is working properly")
                print("✅ Multiple user creation works without ID conflicts")
            else:
                failed_tests = [r for r in constraint_tests if r['status'] == '❌ FAIL']
                print("🚨 FAILURE: Duplicate key constraint fix is not working properly")
                print("🔍 Failed Tests:")
                for test in failed_tests:
                    print(f"   - {test['test']}: {test['message']}")
                    if "duplicate key" in test['message'].lower():
                        print("   ⚠️  The original constraint violation error is still occurring")
        
        # Final assessment
        if self.tests_passed == self.tests_run:
            print("\n🎉 ALL TESTS PASSED! Duplicate key constraint fix is working perfectly.")
            return 0
        else:
            failed_critical = [r for r in critical_tests if r['status'] == '❌ FAIL']
            if failed_critical:
                print(f"\n🚨 {len(failed_critical)} critical tests failed")
                print("💡 Recommendations:")
                for test in failed_critical:
                    if 'duplicate key' in test['test'].lower() or 'constraint' in test['test'].lower():
                        print("   - Check the cleanup logic in admin-users-service.js createUser method")
                        print("   - Verify that existing user records are properly cleaned before insertion")
                        print("   - Ensure the adminClient.auth.admin.createUser() is working correctly")
                        print("   - Check for race conditions in user creation process")
                    elif 'cleanup' in test['test'].lower():
                        print("   - Verify the orphaned record cleanup mechanism")
                        print("   - Check if the cleanup query is properly deleting existing records")
            return 1

def main():
    """Main test execution"""
    tester = DuplicateKeyFixTester()
    return tester.run_comprehensive_duplicate_key_fix_tests()

if __name__ == "__main__":
    sys.exit(main())
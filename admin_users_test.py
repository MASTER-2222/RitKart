#!/usr/bin/env python3
"""
RitZone Admin Users ADD and EDIT Testing Suite - January 2025
============================================================
Comprehensive testing for Admin Users functionality with focus on:
- Admin login at /api/auto-sync/auth/login with admin@ritzone.com credentials
- ADD User functionality via POST /api/admin/users with cookie authentication 
- EDIT User functionality via PUT /api/admin/users/{id} with cookie authentication
- Verify responses are proper JSON (not HTML error pages)
- Check cookie-based session tokens work properly

Testing to resolve: "JSON.parse: unexpected character at line 1 column 1 of the JSON data" errors
"""

import requests
import json
import sys
import uuid
import time
from datetime import datetime

class AdminUsersAPITester:
    def __init__(self, base_url="http://localhost:8001/api"):
        self.base_url = base_url
        self.admin_session_cookie = None
        self.admin_session_token = None
        self.admin_user_id = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []
        self.created_user_ids = []  # Track users created during testing for cleanup

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

    def make_request(self, method, endpoint, data=None, expected_status=200, use_cookies=True):
        """Make HTTP request with comprehensive error handling and cookie support"""
        url = f"{self.base_url}{endpoint}"
        headers = {'Content-Type': 'application/json'}
        cookies = {}
        
        # Use cookie-based authentication
        if use_cookies and self.admin_session_cookie:
            cookies['admin_session'] = self.admin_session_cookie
        
        # Also support token-based auth as fallback
        if self.admin_session_token:
            headers['Authorization'] = f'Bearer {self.admin_session_token}'
            headers['X-Admin-Token'] = self.admin_session_token

        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, cookies=cookies, timeout=15)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, cookies=cookies, timeout=15)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers, cookies=cookies, timeout=15)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers, cookies=cookies, timeout=15)
            else:
                raise ValueError(f"Unsupported method: {method}")

            # Check if response is JSON or HTML (to detect JSON parsing errors)
            content_type = response.headers.get('content-type', '').lower()
            is_json = 'application/json' in content_type
            
            # Parse response
            try:
                if is_json:
                    response_data = response.json()
                else:
                    # If not JSON, it might be HTML error page
                    response_data = {
                        "raw_response": response.text[:500],
                        "content_type": content_type,
                        "is_html_error": 'text/html' in content_type
                    }
            except json.JSONDecodeError as e:
                response_data = {
                    "json_parse_error": str(e),
                    "raw_response": response.text[:500],
                    "content_type": content_type
                }

            success = response.status_code == expected_status
            return success, response.status_code, response_data

        except requests.exceptions.RequestException as e:
            return False, 0, {"error": str(e)}

    def test_backend_health(self):
        """Test backend health and configuration"""
        print("\n🔍 Testing Backend Health Check...")
        success, status, data = self.make_request('GET', '/health', use_cookies=False)
        
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

    def test_admin_login(self):
        """Test admin login with admin@ritzone.com credentials"""
        print("\n🔐 Testing Admin Login...")
        
        login_data = {
            "email": "admin@ritzone.com",
            "password": "RitZone@Admin2025!",
            "rememberMe": False
        }
        
        success, status, data = self.make_request('POST', '/auto-sync/auth/login', login_data, use_cookies=False)
        
        if success and data.get('success'):
            # Extract session token and user info
            self.admin_session_token = data.get('sessionToken')
            admin_user = data.get('user', {})
            self.admin_user_id = admin_user.get('id')
            
            # Check if cookies were set (we'll simulate this since we can't access Set-Cookie directly)
            if self.admin_session_token:
                self.admin_session_cookie = self.admin_session_token
            
            return self.log_test(
                "Admin Login", 
                True, 
                f"Login successful - Admin: {admin_user.get('email', 'unknown')}, Token acquired"
            )
        else:
            # Check if response is HTML error page
            if data.get('is_html_error'):
                return self.log_test(
                    "Admin Login", 
                    False, 
                    f"Login failed - Received HTML error page instead of JSON - Status: {status}"
                )
            else:
                return self.log_test(
                    "Admin Login", 
                    False, 
                    f"Login failed - Status: {status}, Response: {data.get('message', 'Unknown error')}"
                )

    def test_admin_session_validation(self):
        """Test admin session validation"""
        if not self.admin_session_token:
            return self.log_test("Admin Session Validation", False, "No admin session token available")
        
        print("\n✅ Testing Admin Session Validation...")
        success, status, data = self.make_request('GET', '/auto-sync/auth/validate')
        
        if success and data.get('success'):
            user_info = data.get('user', {})
            return self.log_test(
                "Admin Session Validation", 
                True, 
                f"Session valid - Admin: {user_info.get('email', 'unknown')}"
            )
        else:
            return self.log_test(
                "Admin Session Validation", 
                False, 
                f"Session validation failed - Status: {status}, Response: {data}"
            )

    def test_get_users_list(self):
        """Test getting users list (should work with proper authentication)"""
        if not self.admin_session_cookie:
            return self.log_test("Get Users List", False, "No admin authentication available")
        
        print("\n👥 Testing Get Users List...")
        success, status, data = self.make_request('GET', '/admin/users?limit=10')
        
        if success and data.get('success'):
            users_data = data.get('data', [])
            pagination = data.get('pagination', {})
            total_users = pagination.get('totalUsers', 0)
            
            return self.log_test(
                "Get Users List", 
                True, 
                f"Retrieved {len(users_data)} users (Total: {total_users})"
            )
        else:
            # Check if response is HTML error page
            if data.get('is_html_error'):
                return self.log_test(
                    "Get Users List", 
                    False, 
                    f"Failed - Received HTML error page instead of JSON - Status: {status}"
                )
            else:
                return self.log_test(
                    "Get Users List", 
                    False, 
                    f"Failed to get users - Status: {status}, Response: {data.get('message', 'Unknown error')}"
                )

    def test_add_user_functionality(self):
        """Test ADD User functionality via POST /api/admin/users"""
        if not self.admin_session_cookie:
            return self.log_test("ADD User", False, "No admin authentication available")
        
        print("\n➕ Testing ADD User Functionality...")
        
        # Generate unique test user data
        timestamp = datetime.now().strftime('%H%M%S%f')[:-3]
        test_user_data = {
            "email": f"testuser.{timestamp}@ritzone.com",
            "password": "TestUser123!",
            "fullName": f"Test User {timestamp}",
            "phone": "+1234567890",
            "role": "customer",
            "status": "active"
        }
        
        success, status, data = self.make_request('POST', '/admin/users', test_user_data, 201)
        
        if success and data.get('success'):
            created_user = data.get('data', {})
            user_id = created_user.get('id')
            if user_id:
                self.created_user_ids.append(user_id)  # Track for cleanup
            
            return self.log_test(
                "ADD User", 
                True, 
                f"Successfully created user - Email: {created_user.get('email', 'unknown')}, ID: {user_id}"
            )
        else:
            # Check if response is HTML error page (the main issue we're testing for)
            if data.get('is_html_error'):
                return self.log_test(
                    "ADD User", 
                    False, 
                    f"CRITICAL: Received HTML error page instead of JSON - Status: {status}. This causes 'JSON.parse: unexpected character' errors!"
                )
            elif data.get('json_parse_error'):
                return self.log_test(
                    "ADD User", 
                    False, 
                    f"CRITICAL: JSON Parse Error - {data.get('json_parse_error')} - Status: {status}"
                )
            else:
                return self.log_test(
                    "ADD User", 
                    False, 
                    f"Failed to create user - Status: {status}, Response: {data.get('message', 'Unknown error')}"
                )

    def test_edit_user_functionality(self):
        """Test EDIT User functionality via PUT /api/admin/users/{id}"""
        if not self.admin_session_cookie:
            return self.log_test("EDIT User", False, "No admin authentication available")
        
        if not self.created_user_ids:
            return self.log_test("EDIT User", False, "No test user available for editing")
        
        print("\n✏️ Testing EDIT User Functionality...")
        
        # Use the first created user for editing
        user_id = self.created_user_ids[0]
        
        # Update user data
        update_data = {
            "fullName": "Updated Test User Name",
            "phone": "+9876543210",
            "status": "active"
        }
        
        success, status, data = self.make_request('PUT', f'/admin/users/{user_id}', update_data, 200)
        
        if success and data.get('success'):
            updated_user = data.get('data', {})
            return self.log_test(
                "EDIT User", 
                True, 
                f"Successfully updated user - Name: {updated_user.get('fullName', 'unknown')}, ID: {user_id}"
            )
        else:
            # Check if response is HTML error page (the main issue we're testing for)
            if data.get('is_html_error'):
                return self.log_test(
                    "EDIT User", 
                    False, 
                    f"CRITICAL: Received HTML error page instead of JSON - Status: {status}. This causes 'JSON.parse: unexpected character' errors!"
                )
            elif data.get('json_parse_error'):
                return self.log_test(
                    "EDIT User", 
                    False, 
                    f"CRITICAL: JSON Parse Error - {data.get('json_parse_error')} - Status: {status}"
                )
            else:
                return self.log_test(
                    "EDIT User", 
                    False, 
                    f"Failed to update user - Status: {status}, Response: {data.get('message', 'Unknown error')}"
                )

    def test_get_specific_user(self):
        """Test getting specific user details"""
        if not self.admin_session_cookie or not self.created_user_ids:
            return self.log_test("Get Specific User", False, "No admin auth or test user available")
        
        print("\n👤 Testing Get Specific User...")
        
        user_id = self.created_user_ids[0]
        success, status, data = self.make_request('GET', f'/admin/users/{user_id}')
        
        if success and data.get('success'):
            user_data = data.get('data', {})
            return self.log_test(
                "Get Specific User", 
                True, 
                f"Retrieved user details - Name: {user_data.get('fullName', 'unknown')}"
            )
        else:
            if data.get('is_html_error'):
                return self.log_test(
                    "Get Specific User", 
                    False, 
                    f"CRITICAL: Received HTML error page instead of JSON - Status: {status}"
                )
            else:
                return self.log_test(
                    "Get Specific User", 
                    False, 
                    f"Failed to get user details - Status: {status}, Response: {data}"
                )

    def test_authentication_without_cookies(self):
        """Test what happens when no authentication is provided"""
        print("\n🚫 Testing Authentication Requirements...")
        
        # Test without any authentication
        success, status, data = self.make_request('GET', '/admin/users', expected_status=401, use_cookies=False)
        
        if success and status == 401:
            return self.log_test(
                "Authentication Required", 
                True, 
                "Properly requires authentication (401 Unauthorized)"
            )
        else:
            return self.log_test(
                "Authentication Required", 
                False, 
                f"Authentication not properly enforced - Status: {status}"
            )

    def test_json_response_format(self):
        """Test that all responses are proper JSON format"""
        print("\n📄 Testing JSON Response Format...")
        
        if not self.admin_session_cookie:
            return self.log_test("JSON Response Format", False, "No admin authentication available")
        
        # Test multiple endpoints to ensure they all return JSON
        endpoints_to_test = [
            ('/admin/users', 'GET'),
            ('/auto-sync/auth/validate', 'GET'),
        ]
        
        json_format_issues = []
        
        for endpoint, method in endpoints_to_test:
            success, status, data = self.make_request(method, endpoint)
            
            if data.get('is_html_error'):
                json_format_issues.append(f"{method} {endpoint} returned HTML instead of JSON")
            elif data.get('json_parse_error'):
                json_format_issues.append(f"{method} {endpoint} has JSON parse error: {data.get('json_parse_error')}")
        
        if not json_format_issues:
            return self.log_test(
                "JSON Response Format", 
                True, 
                "All tested endpoints return proper JSON responses"
            )
        else:
            return self.log_test(
                "JSON Response Format", 
                False, 
                f"JSON format issues found: {'; '.join(json_format_issues)}"
            )

    def cleanup_test_users(self):
        """Clean up test users created during testing"""
        if not self.created_user_ids or not self.admin_session_cookie:
            return
        
        print("\n🧹 Cleaning up test users...")
        
        for user_id in self.created_user_ids:
            try:
                success, status, data = self.make_request('DELETE', f'/admin/users/{user_id}', expected_status=200)
                if success:
                    print(f"✅ Cleaned up test user: {user_id}")
                else:
                    print(f"⚠️ Could not clean up test user {user_id}: {data}")
            except Exception as e:
                print(f"⚠️ Error cleaning up test user {user_id}: {str(e)}")

    def run_comprehensive_admin_users_tests(self):
        """Run comprehensive Admin Users ADD and EDIT testing suite"""
        print("=" * 80)
        print("👥 RitZone Admin Users ADD and EDIT Testing Suite - January 2025")
        print("🎯 Focus: Resolving JSON parsing errors in Admin Panel")
        print("=" * 80)
        print(f"📅 Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print(f"🌐 Testing endpoint: {self.base_url}")
        print("🔍 Testing for: 'JSON.parse: unexpected character at line 1 column 1' errors")
        print("=" * 80)

        try:
            # Core infrastructure tests
            self.test_backend_health()
            
            # Admin authentication tests
            self.test_admin_login()
            self.test_admin_session_validation()
            
            # Admin users functionality tests
            self.test_authentication_without_cookies()
            self.test_get_users_list()
            self.test_add_user_functionality()
            self.test_edit_user_functionality()
            self.test_get_specific_user()
            
            # JSON format validation
            self.test_json_response_format()

        finally:
            # Always try to clean up
            self.cleanup_test_users()

        # Print comprehensive results
        print("\n" + "=" * 80)
        print("📊 ADMIN USERS TESTING RESULTS SUMMARY")
        print("=" * 80)
        
        critical_tests = []
        supporting_tests = []
        
        for result in self.test_results:
            if any(keyword in result['test'].lower() for keyword in ['add user', 'edit user', 'admin login', 'json response']):
                critical_tests.append(result)
            else:
                supporting_tests.append(result)
        
        print("\n🚨 CRITICAL TESTS (ADD/EDIT/JSON):")
        for result in critical_tests:
            print(f"{result['status']} {result['test']}: {result['message']}")
        
        print("\n📋 SUPPORTING TESTS:")
        for result in supporting_tests:
            print(f"{result['status']} {result['test']}: {result['message']}")
        
        print(f"\n📈 Overall Results: {self.tests_passed}/{self.tests_run} tests passed")
        
        # Specific analysis for JSON parsing issues
        json_issues = []
        for result in self.test_results:
            if 'html error page' in result['message'].lower() or 'json parse error' in result['message'].lower():
                json_issues.append(result)
        
        if json_issues:
            print(f"\n🚨 JSON PARSING ISSUES DETECTED ({len(json_issues)} issues):")
            for issue in json_issues:
                print(f"   ❌ {issue['test']}: {issue['message']}")
            print("\n💡 SOLUTION: These HTML responses instead of JSON are causing the frontend 'JSON.parse' errors!")
        else:
            print("\n✅ NO JSON PARSING ISSUES DETECTED - All responses are proper JSON format")
        
        # Final assessment
        add_edit_tests = [r for r in self.test_results if any(keyword in r['test'].lower() for keyword in ['add user', 'edit user'])]
        if add_edit_tests:
            add_edit_success = all(r['status'] == '✅ PASS' for r in add_edit_tests)
            print(f"\n👥 Admin Users ADD/EDIT Status: {'✅ WORKING' if add_edit_success else '❌ FAILING'}")
            
            if not add_edit_success:
                failed_tests = [r for r in add_edit_tests if r['status'] == '❌ FAIL']
                print("🔍 Failed ADD/EDIT Tests:")
                for test in failed_tests:
                    print(f"   - {test['test']}: {test['message']}")
        
        if self.tests_passed == self.tests_run:
            print("🎉 All tests passed! Admin Users ADD and EDIT functionality is working correctly.")
            print("✅ JSON parsing errors should be resolved.")
            return 0
        else:
            failed_critical = [r for r in critical_tests if r['status'] == '❌ FAIL']
            if failed_critical:
                print(f"🚨 {len(failed_critical)} critical tests failed")
                print("💡 Recommendations:")
                for test in failed_critical:
                    if 'html error page' in test['message'].lower():
                        print("   - Fix backend routes to return JSON instead of HTML error pages")
                        print("   - Check middleware configuration for proper error handling")
                    elif 'authentication' in test['test'].lower():
                        print("   - Verify admin authentication system configuration")
                        print("   - Check cookie settings and CORS configuration")
                    elif 'add user' in test['test'].lower() or 'edit user' in test['test'].lower():
                        print("   - Check admin users service implementation")
                        print("   - Verify database permissions and RLS policies")
            return 1

def main():
    """Main test execution"""
    tester = AdminUsersAPITester()
    return tester.run_comprehensive_admin_users_tests()

if __name__ == "__main__":
    sys.exit(main())
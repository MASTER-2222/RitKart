#!/usr/bin/env python3
"""
RitZone Admin Users API Testing Script
=====================================
Comprehensive testing of admin users API endpoints to identify JSON parsing errors.
Focus on admin authentication and user management endpoints.
"""

import requests
import json
import sys
import time
from datetime import datetime

# Configuration
BACKEND_URL = "http://localhost:8001/api"
ADMIN_CREDENTIALS = {
    "email": "admin@ritzone.com",
    "password": "RitZone@Admin2025!"
}

class AdminUsersAPITester:
    def __init__(self):
        self.session = requests.Session()
        self.admin_token = None
        self.admin_session_cookie = None
        self.test_results = []
        
    def log_test(self, test_name, success, message, details=None):
        """Log test results"""
        result = {
            "test": test_name,
            "success": success,
            "message": message,
            "details": details,
            "timestamp": datetime.now().isoformat()
        }
        self.test_results.append(result)
        
        status = "✅" if success else "❌"
        print(f"{status} {test_name}: {message}")
        if details and not success:
            print(f"   Details: {details}")
    
    def test_backend_health(self):
        """Test if backend is running and responding"""
        try:
            response = self.session.get(f"{BACKEND_URL}/health", timeout=10)
            
            if response.status_code == 200:
                try:
                    data = response.json()
                    self.log_test(
                        "Backend Health Check", 
                        True, 
                        f"Backend is running (Node.js Express + Supabase)",
                        data
                    )
                    return True
                except json.JSONDecodeError:
                    self.log_test(
                        "Backend Health Check", 
                        False, 
                        f"Backend responding but returning non-JSON: {response.text[:200]}"
                    )
                    return False
            else:
                self.log_test(
                    "Backend Health Check", 
                    False, 
                    f"Backend health check failed with status {response.status_code}",
                    response.text[:200]
                )
                return False
                
        except requests.exceptions.RequestException as e:
            self.log_test(
                "Backend Health Check", 
                False, 
                f"Cannot connect to backend: {str(e)}"
            )
            return False
    
    def test_admin_login(self):
        """Test admin login functionality"""
        try:
            login_url = f"{BACKEND_URL}/auto-sync/auth/login"
            
            response = self.session.post(
                login_url,
                json=ADMIN_CREDENTIALS,
                headers={'Content-Type': 'application/json'},
                timeout=10
            )
            
            print(f"Login response status: {response.status_code}")
            print(f"Login response headers: {dict(response.headers)}")
            print(f"Login response text: {response.text[:500]}")
            
            if response.status_code == 200:
                try:
                    data = response.json()
                    if data.get('success'):
                        self.admin_token = data.get('sessionToken')
                        
                        # Extract session cookie
                        if 'Set-Cookie' in response.headers:
                            cookies = response.headers['Set-Cookie']
                            if 'admin_session=' in cookies:
                                cookie_value = cookies.split('admin_session=')[1].split(';')[0]
                                self.admin_session_cookie = cookie_value
                                self.session.cookies.set('admin_session', cookie_value)
                        
                        self.log_test(
                            "Admin Login", 
                            True, 
                            f"Login successful for {ADMIN_CREDENTIALS['email']}",
                            {
                                "user": data.get('user'),
                                "has_token": bool(self.admin_token),
                                "has_cookie": bool(self.admin_session_cookie)
                            }
                        )
                        return True
                    else:
                        self.log_test(
                            "Admin Login", 
                            False, 
                            f"Login failed: {data.get('message', 'Unknown error')}",
                            data
                        )
                        return False
                except json.JSONDecodeError:
                    self.log_test(
                        "Admin Login", 
                        False, 
                        f"Login endpoint returned non-JSON response: {response.text[:200]}"
                    )
                    return False
            else:
                self.log_test(
                    "Admin Login", 
                    False, 
                    f"Login failed with status {response.status_code}",
                    response.text[:200]
                )
                return False
                
        except requests.exceptions.RequestException as e:
            self.log_test(
                "Admin Login", 
                False, 
                f"Login request failed: {str(e)}"
            )
            return False
    
    def test_admin_session_validation(self):
        """Test admin session validation"""
        if not self.admin_token and not self.admin_session_cookie:
            self.log_test(
                "Admin Session Validation", 
                False, 
                "No admin token or session cookie available"
            )
            return False
        
        try:
            validate_url = f"{BACKEND_URL}/auto-sync/auth/validate"
            
            # Test with cookie authentication
            response = self.session.get(validate_url, timeout=10)
            
            print(f"Session validation response status: {response.status_code}")
            print(f"Session validation response text: {response.text[:500]}")
            
            if response.status_code == 200:
                try:
                    data = response.json()
                    if data.get('success'):
                        self.log_test(
                            "Admin Session Validation", 
                            True, 
                            "Session validation successful",
                            data.get('user')
                        )
                        return True
                    else:
                        self.log_test(
                            "Admin Session Validation", 
                            False, 
                            f"Session validation failed: {data.get('message')}",
                            data
                        )
                        return False
                except json.JSONDecodeError:
                    self.log_test(
                        "Admin Session Validation", 
                        False, 
                        f"Session validation returned non-JSON: {response.text[:200]}"
                    )
                    return False
            else:
                self.log_test(
                    "Admin Session Validation", 
                    False, 
                    f"Session validation failed with status {response.status_code}",
                    response.text[:200]
                )
                return False
                
        except requests.exceptions.RequestException as e:
            self.log_test(
                "Admin Session Validation", 
                False, 
                f"Session validation request failed: {str(e)}"
            )
            return False
    
    def test_get_admin_users(self):
        """Test GET /api/admin/users endpoint"""
        try:
            users_url = f"{BACKEND_URL}/admin/users"
            
            # Test with cookie authentication (primary method)
            response = self.session.get(users_url, timeout=10)
            
            print(f"GET /admin/users response status: {response.status_code}")
            print(f"GET /admin/users response headers: {dict(response.headers)}")
            print(f"GET /admin/users response text: {response.text[:500]}")
            
            if response.status_code == 200:
                try:
                    data = response.json()
                    if data.get('success'):
                        users = data.get('data', [])
                        pagination = data.get('pagination', {})
                        
                        self.log_test(
                            "GET Admin Users", 
                            True, 
                            f"Retrieved {len(users)} users successfully",
                            {
                                "user_count": len(users),
                                "pagination": pagination,
                                "sample_user": users[0] if users else None
                            }
                        )
                        return True
                    else:
                        self.log_test(
                            "GET Admin Users", 
                            False, 
                            f"API returned error: {data.get('message')}",
                            data
                        )
                        return False
                except json.JSONDecodeError as e:
                    self.log_test(
                        "GET Admin Users", 
                        False, 
                        f"JSON parsing error - this is the root cause! Response: {response.text[:200]}",
                        {
                            "json_error": str(e),
                            "content_type": response.headers.get('Content-Type'),
                            "full_response": response.text
                        }
                    )
                    return False
            elif response.status_code == 401:
                self.log_test(
                    "GET Admin Users", 
                    False, 
                    "Authentication failed - admin session invalid",
                    response.text[:200]
                )
                return False
            elif response.status_code == 403:
                self.log_test(
                    "GET Admin Users", 
                    False, 
                    "Access forbidden - insufficient permissions",
                    response.text[:200]
                )
                return False
            else:
                self.log_test(
                    "GET Admin Users", 
                    False, 
                    f"Request failed with status {response.status_code}",
                    response.text[:200]
                )
                return False
                
        except requests.exceptions.RequestException as e:
            self.log_test(
                "GET Admin Users", 
                False, 
                f"Request failed: {str(e)}"
            )
            return False
    
    def test_create_admin_user(self):
        """Test POST /api/admin/users endpoint"""
        try:
            users_url = f"{BACKEND_URL}/admin/users"
            
            test_user_data = {
                "email": f"testuser_{int(time.time())}@example.com",
                "password": "TestPassword123!",
                "full_name": "Test User",
                "first_name": "Test",
                "last_name": "User",
                "role": "user"
            }
            
            response = self.session.post(
                users_url,
                json=test_user_data,
                headers={'Content-Type': 'application/json'},
                timeout=10
            )
            
            print(f"POST /admin/users response status: {response.status_code}")
            print(f"POST /admin/users response text: {response.text[:500]}")
            
            if response.status_code in [200, 201]:
                try:
                    data = response.json()
                    if data.get('success'):
                        self.log_test(
                            "POST Create Admin User", 
                            True, 
                            f"User created successfully: {test_user_data['email']}",
                            data.get('data')
                        )
                        return True
                    else:
                        self.log_test(
                            "POST Create Admin User", 
                            False, 
                            f"User creation failed: {data.get('message')}",
                            data
                        )
                        return False
                except json.JSONDecodeError as e:
                    self.log_test(
                        "POST Create Admin User", 
                        False, 
                        f"JSON parsing error on user creation: {response.text[:200]}",
                        {
                            "json_error": str(e),
                            "content_type": response.headers.get('Content-Type')
                        }
                    )
                    return False
            else:
                self.log_test(
                    "POST Create Admin User", 
                    False, 
                    f"User creation failed with status {response.status_code}",
                    response.text[:200]
                )
                return False
                
        except requests.exceptions.RequestException as e:
            self.log_test(
                "POST Create Admin User", 
                False, 
                f"Request failed: {str(e)}"
            )
            return False
    
    def test_update_admin_user(self):
        """Test PUT /api/admin/users/{userId} endpoint"""
        # First, get a user to update
        try:
            users_url = f"{BACKEND_URL}/admin/users"
            response = self.session.get(users_url, timeout=10)
            
            if response.status_code == 200:
                try:
                    data = response.json()
                    users = data.get('data', [])
                    
                    if not users:
                        self.log_test(
                            "PUT Update Admin User", 
                            False, 
                            "No users available to test update"
                        )
                        return False
                    
                    # Use the first user for testing
                    test_user = users[0]
                    user_id = test_user.get('id')
                    
                    if not user_id:
                        self.log_test(
                            "PUT Update Admin User", 
                            False, 
                            "User ID not found in user data"
                        )
                        return False
                    
                    # Test update
                    update_url = f"{BACKEND_URL}/admin/users/{user_id}"
                    update_data = {
                        "full_name": "Updated Test Name"
                    }
                    
                    update_response = self.session.put(
                        update_url,
                        json=update_data,
                        headers={'Content-Type': 'application/json'},
                        timeout=10
                    )
                    
                    print(f"PUT /admin/users/{user_id} response status: {update_response.status_code}")
                    print(f"PUT /admin/users/{user_id} response text: {update_response.text[:500]}")
                    
                    if update_response.status_code == 200:
                        try:
                            update_result = update_response.json()
                            if update_result.get('success'):
                                self.log_test(
                                    "PUT Update Admin User", 
                                    True, 
                                    f"User {user_id} updated successfully",
                                    update_result.get('data')
                                )
                                return True
                            else:
                                self.log_test(
                                    "PUT Update Admin User", 
                                    False, 
                                    f"User update failed: {update_result.get('message')}",
                                    update_result
                                )
                                return False
                        except json.JSONDecodeError as e:
                            self.log_test(
                                "PUT Update Admin User", 
                                False, 
                                f"JSON parsing error on user update: {update_response.text[:200]}",
                                {
                                    "json_error": str(e),
                                    "content_type": update_response.headers.get('Content-Type')
                                }
                            )
                            return False
                    else:
                        self.log_test(
                            "PUT Update Admin User", 
                            False, 
                            f"User update failed with status {update_response.status_code}",
                            update_response.text[:200]
                        )
                        return False
                        
                except json.JSONDecodeError:
                    self.log_test(
                        "PUT Update Admin User", 
                        False, 
                        "Cannot get users list for update test"
                    )
                    return False
            else:
                self.log_test(
                    "PUT Update Admin User", 
                    False, 
                    "Cannot get users list for update test"
                )
                return False
                
        except requests.exceptions.RequestException as e:
            self.log_test(
                "PUT Update Admin User", 
                False, 
                f"Request failed: {str(e)}"
            )
            return False
    
    def test_authentication_methods(self):
        """Test different authentication methods"""
        if not self.admin_token:
            self.log_test(
                "Authentication Methods Test", 
                False, 
                "No admin token available for testing"
            )
            return False
        
        users_url = f"{BACKEND_URL}/admin/users"
        
        # Test 1: Cookie authentication (already tested above)
        # Test 2: Authorization header
        try:
            response = self.session.get(
                users_url,
                headers={'Authorization': f'Bearer {self.admin_token}'},
                timeout=10
            )
            
            print(f"Authorization header test status: {response.status_code}")
            print(f"Authorization header test response: {response.text[:200]}")
            
            auth_header_success = response.status_code == 200
            
        except requests.exceptions.RequestException:
            auth_header_success = False
        
        # Test 3: X-Admin-Token header
        try:
            response = self.session.get(
                users_url,
                headers={'X-Admin-Token': self.admin_token},
                timeout=10
            )
            
            print(f"X-Admin-Token header test status: {response.status_code}")
            print(f"X-Admin-Token header test response: {response.text[:200]}")
            
            admin_token_success = response.status_code == 200
            
        except requests.exceptions.RequestException:
            admin_token_success = False
        
        self.log_test(
            "Authentication Methods Test", 
            True, 
            f"Cookie: {'✅' if self.admin_session_cookie else '❌'}, "
            f"Bearer: {'✅' if auth_header_success else '❌'}, "
            f"X-Admin-Token: {'✅' if admin_token_success else '❌'}",
            {
                "cookie_auth": bool(self.admin_session_cookie),
                "bearer_auth": auth_header_success,
                "admin_token_auth": admin_token_success
            }
        )
        
        return True
    
    def test_error_response_format(self):
        """Test error response formats to identify HTML vs JSON issues"""
        try:
            # Test with invalid endpoint
            invalid_url = f"{BACKEND_URL}/admin/invalid-endpoint"
            response = self.session.get(invalid_url, timeout=10)
            
            print(f"Invalid endpoint response status: {response.status_code}")
            print(f"Invalid endpoint response headers: {dict(response.headers)}")
            print(f"Invalid endpoint response text: {response.text[:200]}")
            
            content_type = response.headers.get('Content-Type', '')
            is_json = 'application/json' in content_type
            
            try:
                if is_json:
                    data = response.json()
                    self.log_test(
                        "Error Response Format Test", 
                        True, 
                        f"Error responses are properly formatted as JSON",
                        {
                            "status_code": response.status_code,
                            "content_type": content_type,
                            "response": data
                        }
                    )
                else:
                    self.log_test(
                        "Error Response Format Test", 
                        False, 
                        f"Error responses are not JSON! Content-Type: {content_type}",
                        {
                            "status_code": response.status_code,
                            "content_type": content_type,
                            "response_text": response.text[:200]
                        }
                    )
            except json.JSONDecodeError:
                self.log_test(
                    "Error Response Format Test", 
                    False, 
                    f"Error response is not valid JSON despite Content-Type: {content_type}",
                    {
                        "status_code": response.status_code,
                        "content_type": content_type,
                        "response_text": response.text[:200]
                    }
                )
            
            return True
            
        except requests.exceptions.RequestException as e:
            self.log_test(
                "Error Response Format Test", 
                False, 
                f"Request failed: {str(e)}"
            )
            return False
    
    def run_comprehensive_test(self):
        """Run all tests in sequence"""
        print("🚀 Starting RitZone Admin Users API Comprehensive Testing")
        print("=" * 60)
        
        # Test sequence
        tests = [
            ("Backend Health", self.test_backend_health),
            ("Admin Login", self.test_admin_login),
            ("Admin Session Validation", self.test_admin_session_validation),
            ("GET Admin Users", self.test_get_admin_users),
            ("POST Create Admin User", self.test_create_admin_user),
            ("PUT Update Admin User", self.test_update_admin_user),
            ("Authentication Methods", self.test_authentication_methods),
            ("Error Response Format", self.test_error_response_format)
        ]
        
        passed = 0
        total = len(tests)
        
        for test_name, test_func in tests:
            print(f"\n🧪 Running {test_name}...")
            try:
                if test_func():
                    passed += 1
            except Exception as e:
                self.log_test(test_name, False, f"Test crashed: {str(e)}")
        
        # Summary
        print("\n" + "=" * 60)
        print("📊 TEST SUMMARY")
        print("=" * 60)
        print(f"✅ Passed: {passed}/{total}")
        print(f"❌ Failed: {total - passed}/{total}")
        
        # Detailed results
        print("\n📋 DETAILED RESULTS:")
        for result in self.test_results:
            status = "✅" if result['success'] else "❌"
            print(f"{status} {result['test']}: {result['message']}")
        
        # Root cause analysis
        print("\n🔍 ROOT CAUSE ANALYSIS:")
        
        # Check for JSON parsing errors
        json_errors = [r for r in self.test_results if 'JSON parsing error' in r['message']]
        if json_errors:
            print("🚨 CRITICAL: JSON parsing errors detected!")
            for error in json_errors:
                print(f"   - {error['test']}: {error['message']}")
                if error.get('details', {}).get('content_type'):
                    print(f"     Content-Type: {error['details']['content_type']}")
        
        # Check authentication issues
        auth_failures = [r for r in self.test_results if not r['success'] and 'auth' in r['test'].lower()]
        if auth_failures:
            print("🔐 Authentication issues detected:")
            for failure in auth_failures:
                print(f"   - {failure['test']}: {failure['message']}")
        
        # Check for HTML responses
        html_responses = [r for r in self.test_results if 'HTML' in str(r.get('details', ''))]
        if html_responses:
            print("🌐 HTML responses detected (should be JSON):")
            for response in html_responses:
                print(f"   - {response['test']}: {response['message']}")
        
        return passed == total

def main():
    """Main execution function"""
    tester = AdminUsersAPITester()
    success = tester.run_comprehensive_test()
    
    if success:
        print("\n🎉 All tests passed! Admin Users API is working correctly.")
        sys.exit(0)
    else:
        print("\n🚨 Some tests failed. Check the detailed results above.")
        sys.exit(1)

if __name__ == "__main__":
    main()
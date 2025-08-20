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

class AuthenticationTester:
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
    
    def test_profile_api_with_auth(self) -> bool:
        """Test 3: Profile API Test with Authentication"""
        if not self.access_token:
            self.log_test(
                "Profile API with Authentication",
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
                        "Profile API with Authentication",
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
                        "Profile API with Authentication",
                        False,
                        "Profile response missing user data or success flag",
                        {"Response": json.dumps(data, indent=2)[:300]}
                    )
                    return False
            else:
                self.log_test(
                    "Profile API with Authentication",
                    False,
                    f"Profile API failed with status {response.status_code}",
                    {"Response": response.text[:200]}
                )
                return False
                
        except Exception as e:
            self.log_test(
                "Profile API with Authentication",
                False,
                f"Profile API request failed: {str(e)}"
            )
            return False
    
    def test_profile_enhancement_apis(self) -> bool:
        """Test 4: Profile Enhancement APIs with Authentication"""
        if not self.access_token:
            self.log_test(
                "Profile Enhancement APIs",
                False,
                "No access token available - authentication must succeed first"
            )
            return False
            
        headers = {
            "Authorization": f"Bearer {self.access_token}",
            "Content-Type": "application/json"
        }
        
        apis_to_test = [
            ("Dashboard", "/profile/dashboard"),
            ("Addresses", "/profile/addresses"),
            ("Payment Methods", "/profile/payment-methods"),
            ("Wishlist", "/profile/wishlist"),
            ("Orders", "/orders")
        ]
        
        results = []
        
        for api_name, endpoint in apis_to_test:
            try:
                response = self.session.get(
                    f"{BACKEND_URL}{endpoint}",
                    headers=headers,
                    timeout=30
                )
                
                success = response.status_code == 200
                results.append(success)
                
                if success:
                    data = response.json()
                    message = f"{api_name} API working properly"
                    details = {
                        "Status Code": response.status_code,
                        "Success": data.get('success', False),
                        "Data Count": len(data.get('data', [])) if isinstance(data.get('data'), list) else "Object" if data.get('data') else 0
                    }
                else:
                    message = f"{api_name} API failed with status {response.status_code}"
                    details = {"Response": response.text[:100]}
                
                self.log_test(f"{api_name} API", success, message, details)
                
            except Exception as e:
                results.append(False)
                self.log_test(f"{api_name} API", False, f"Request failed: {str(e)}")
        
        overall_success = all(results)
        success_count = sum(results)
        total_count = len(results)
        
        self.log_test(
            "Profile Enhancement APIs Summary",
            overall_success,
            f"{success_count}/{total_count} profile APIs working properly",
            {"Success Rate": f"{(success_count/total_count)*100:.1f}%"}
        )
        
        return overall_success
    
    def test_token_validation(self) -> bool:
        """Test 5: Token Validation - Verify Supabase tokens work with authenticateSupabaseToken middleware"""
        if not self.access_token:
            self.log_test(
                "Token Validation",
                False,
                "No access token available - authentication must succeed first"
            )
            return False
            
        # Test with valid token
        valid_token_test = self.test_api_with_token(self.access_token, "Valid Token")
        
        # Test with invalid token
        invalid_token_test = self.test_api_with_token("invalid_token_12345", "Invalid Token", expect_failure=True)
        
        # Test without token
        no_token_test = self.test_api_without_token()
        
        overall_success = valid_token_test and invalid_token_test and no_token_test
        
        self.log_test(
            "Token Validation Summary",
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
        """Run all authentication system tests"""
        print("=" * 80)
        print("🔍 RITZONE AUTHENTICATION SYSTEM TESTING")
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
        
        # Test 3: Profile API with Authentication
        test_results.append(self.test_profile_api_with_auth())
        
        # Test 4: Profile Enhancement APIs
        test_results.append(self.test_profile_enhancement_apis())
        
        # Test 5: Token Validation
        test_results.append(self.test_token_validation())
        
        # Summary
        passed_tests = sum(test_results)
        total_tests = len(test_results)
        success_rate = (passed_tests / total_tests) * 100
        
        print("=" * 80)
        print("📊 AUTHENTICATION SYSTEM TEST SUMMARY")
        print("=" * 80)
        print(f"Tests Passed: {passed_tests}/{total_tests}")
        print(f"Success Rate: {success_rate:.1f}%")
        print()
        
        if success_rate == 100:
            print("🎉 EXCELLENT: All authentication tests passed!")
            print("✅ Profile page should show real user data")
            print("✅ All profile sections should load properly")
        elif success_rate >= 80:
            print("⚠️  GOOD: Most authentication tests passed")
            print("🔍 Minor issues may exist - check failed tests above")
        else:
            print("❌ CRITICAL: Authentication system has major issues")
            print("🚨 Profile page will likely show dummy data and errors")
        
        print("=" * 80)
        
        return success_rate == 100

def main():
    """Main test execution"""
    tester = AuthenticationTester()
    success = tester.run_comprehensive_test()
    
    # Exit with appropriate code
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()
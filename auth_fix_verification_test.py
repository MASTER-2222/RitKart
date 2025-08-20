#!/usr/bin/env python3
"""
RitZone Authentication System Fix Verification Test
==================================================
Testing the critical authentication fix where backend /auth/profile endpoints
were updated to use authenticateSupabaseToken middleware instead of JWT-based
authenticateToken middleware.

BACKGROUND:
- User reported profile page showing dummy data ("user@example.com")
- All API endpoints were failing due to authentication disconnect
- Frontend sends Supabase session tokens but backend was expecting JWT tokens

FIXES TESTED:
1. authenticateSupabaseToken middleware added to /auth/profile endpoints
2. GET /auth/profile endpoint uses Supabase authentication
3. PUT /auth/profile endpoint uses Supabase authentication
4. Auto-sync functionality working with Supabase tokens

Test Credentials: b@b.com / Abcd@1234
Backend URL: http://localhost:10000/api (from .env.local)
"""

import requests
import json
import time
import sys
from datetime import datetime

# Configuration
BACKEND_URL = "http://localhost:10000/api"
TEST_USER_EMAIL = "b@b.com"
TEST_USER_PASSWORD = "Abcd@1234"

# Test results tracking
test_results = []
total_tests = 0
passed_tests = 0

def log_test(test_name, success, message, details=None):
    """Log test results"""
    global total_tests, passed_tests
    total_tests += 1
    if success:
        passed_tests += 1
        status = "✅ PASS"
    else:
        status = "❌ FAIL"
    
    result = {
        "test": test_name,
        "success": success,
        "message": message,
        "details": details,
        "timestamp": datetime.now().isoformat()
    }
    test_results.append(result)
    print(f"{status}: {test_name} - {message}")
    if details and not success:
        print(f"   Details: {details}")

def test_backend_health():
    """Test backend health and connectivity"""
    try:
        response = requests.get(f"{BACKEND_URL}/health", timeout=10)
        if response.status_code == 200:
            data = response.json()
            log_test("Backend Health Check", True, f"Backend is running on {BACKEND_URL}")
            return True
        else:
            log_test("Backend Health Check", False, f"Backend returned status {response.status_code}")
            return False
    except Exception as e:
        log_test("Backend Health Check", False, f"Cannot connect to backend: {str(e)}")
        return False

def authenticate_user():
    """Authenticate user and get Supabase token"""
    try:
        # First, try to login to get Supabase session token
        login_data = {
            "email": TEST_USER_EMAIL,
            "password": TEST_USER_PASSWORD
        }
        
        response = requests.post(f"{BACKEND_URL}/auth/login", json=login_data, timeout=15)
        
        if response.status_code == 200:
            data = response.json()
            if data.get("success") and data.get("token"):
                log_test("User Authentication", True, f"Successfully authenticated user {TEST_USER_EMAIL}")
                return data.get("token")
            else:
                log_test("User Authentication", False, f"Login successful but no token received: {data}")
                return None
        else:
            log_test("User Authentication", False, f"Login failed with status {response.status_code}: {response.text}")
            return None
            
    except Exception as e:
        log_test("User Authentication", False, f"Authentication error: {str(e)}")
        return None

def test_supabase_auth_profile_get(token):
    """Test GET /auth/profile with Supabase token authentication"""
    try:
        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }
        
        response = requests.get(f"{BACKEND_URL}/auth/profile", headers=headers, timeout=15)
        
        if response.status_code == 200:
            data = response.json()
            if data.get("success") and data.get("user"):
                user = data["user"]
                # Check if we're getting real user data, not dummy data
                if user.get("email") == TEST_USER_EMAIL and user.get("email") != "user@example.com":
                    log_test("GET /auth/profile with Supabase Auth", True, 
                           f"Successfully retrieved real user profile for {user.get('email')}")
                    return True, user
                else:
                    log_test("GET /auth/profile with Supabase Auth", False, 
                           f"Retrieved profile but data seems incorrect: {user}")
                    return False, user
            else:
                log_test("GET /auth/profile with Supabase Auth", False, 
                       f"Profile request successful but invalid response structure: {data}")
                return False, None
        elif response.status_code == 401:
            log_test("GET /auth/profile with Supabase Auth", False, 
                   "Authentication failed - token not accepted by Supabase middleware")
            return False, None
        else:
            log_test("GET /auth/profile with Supabase Auth", False, 
                   f"Profile request failed with status {response.status_code}: {response.text}")
            return False, None
            
    except Exception as e:
        log_test("GET /auth/profile with Supabase Auth", False, f"Profile GET error: {str(e)}")
        return False, None

def test_supabase_auth_profile_put(token):
    """Test PUT /auth/profile with Supabase token authentication"""
    try:
        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }
        
        # Test data for profile update
        update_data = {
            "fullName": "Test User Updated",
            "phone": "+1234567890",
            "dateOfBirth": "1990-01-01"
        }
        
        response = requests.put(f"{BACKEND_URL}/auth/profile", 
                              json=update_data, headers=headers, timeout=15)
        
        if response.status_code == 200:
            data = response.json()
            if data.get("success"):
                log_test("PUT /auth/profile with Supabase Auth", True, 
                       "Successfully updated user profile with Supabase authentication")
                return True, data.get("user")
            else:
                log_test("PUT /auth/profile with Supabase Auth", False, 
                       f"Profile update failed: {data.get('message', 'Unknown error')}")
                return False, None
        elif response.status_code == 401:
            log_test("PUT /auth/profile with Supabase Auth", False, 
                   "Authentication failed - token not accepted by Supabase middleware")
            return False, None
        else:
            log_test("PUT /auth/profile with Supabase Auth", False, 
                   f"Profile update failed with status {response.status_code}: {response.text}")
            return False, None
            
    except Exception as e:
        log_test("PUT /auth/profile with Supabase Auth", False, f"Profile PUT error: {str(e)}")
        return False, None

def test_profile_data_persistence(token):
    """Test that profile updates are persisted correctly"""
    try:
        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }
        
        # Get profile after update to verify persistence
        response = requests.get(f"{BACKEND_URL}/auth/profile", headers=headers, timeout=15)
        
        if response.status_code == 200:
            data = response.json()
            if data.get("success") and data.get("user"):
                user = data["user"]
                # Check if updated data is persisted
                if user.get("full_name") == "Test User Updated":
                    log_test("Profile Data Persistence", True, 
                           "Profile updates are correctly persisted in database")
                    return True
                else:
                    log_test("Profile Data Persistence", False, 
                           f"Profile data not persisted correctly: {user}")
                    return False
            else:
                log_test("Profile Data Persistence", False, 
                       f"Could not retrieve profile for persistence check: {data}")
                return False
        else:
            log_test("Profile Data Persistence", False, 
                   f"Profile persistence check failed with status {response.status_code}")
            return False
            
    except Exception as e:
        log_test("Profile Data Persistence", False, f"Persistence check error: {str(e)}")
        return False

def test_authentication_middleware_validation(token):
    """Test that authentication middleware properly validates Supabase tokens"""
    try:
        # Test with valid token
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.get(f"{BACKEND_URL}/auth/profile", headers=headers, timeout=10)
        valid_token_works = response.status_code == 200
        
        # Test with invalid token
        headers = {"Authorization": "Bearer invalid_token_12345"}
        response = requests.get(f"{BACKEND_URL}/auth/profile", headers=headers, timeout=10)
        invalid_token_rejected = response.status_code == 403
        
        # Test with no token
        response = requests.get(f"{BACKEND_URL}/auth/profile", timeout=10)
        no_token_rejected = response.status_code == 401
        
        if valid_token_works and invalid_token_rejected and no_token_rejected:
            log_test("Authentication Middleware Validation", True, 
                   "Supabase authentication middleware working correctly")
            return True
        else:
            log_test("Authentication Middleware Validation", False, 
                   f"Auth validation issues - Valid: {valid_token_works}, Invalid rejected: {invalid_token_rejected}, No token rejected: {no_token_rejected}")
            return False
            
    except Exception as e:
        log_test("Authentication Middleware Validation", False, f"Auth middleware test error: {str(e)}")
        return False

def test_auto_sync_functionality(token):
    """Test that auto-sync middleware is working with Supabase authentication"""
    try:
        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }
        
        # Make a request that should trigger auto-sync
        response = requests.get(f"{BACKEND_URL}/auth/profile", headers=headers, timeout=15)
        
        if response.status_code == 200:
            data = response.json()
            if data.get("success") and data.get("user"):
                user = data["user"]
                # Check if user data indicates successful sync
                if user.get("id") and user.get("email") == TEST_USER_EMAIL:
                    log_test("Auto-Sync Functionality", True, 
                           "Auto-sync middleware successfully syncing Supabase users to local database")
                    return True
                else:
                    log_test("Auto-Sync Functionality", False, 
                           f"Auto-sync may not be working properly: {user}")
                    return False
            else:
                log_test("Auto-Sync Functionality", False, 
                       f"Auto-sync test failed - invalid response: {data}")
                return False
        else:
            log_test("Auto-Sync Functionality", False, 
                   f"Auto-sync test failed with status {response.status_code}")
            return False
            
    except Exception as e:
        log_test("Auto-Sync Functionality", False, f"Auto-sync test error: {str(e)}")
        return False

def run_authentication_fix_verification():
    """Run complete authentication system fix verification"""
    print("🧪 RITZONE AUTHENTICATION SYSTEM FIX VERIFICATION")
    print("=" * 60)
    print(f"Backend URL: {BACKEND_URL}")
    print(f"Test User: {TEST_USER_EMAIL}")
    print(f"Test Time: {datetime.now().isoformat()}")
    print("=" * 60)
    
    # Test 1: Backend Health
    if not test_backend_health():
        print("\n❌ Backend is not accessible. Cannot proceed with authentication tests.")
        return False
    
    # Test 2: User Authentication
    token = authenticate_user()
    if not token:
        print("\n❌ User authentication failed. Cannot proceed with profile tests.")
        return False
    
    # Test 3: GET /auth/profile with Supabase Auth
    get_success, user_data = test_supabase_auth_profile_get(token)
    
    # Test 4: PUT /auth/profile with Supabase Auth
    put_success, updated_user = test_supabase_auth_profile_put(token)
    
    # Test 5: Profile Data Persistence
    persistence_success = test_profile_data_persistence(token)
    
    # Test 6: Authentication Middleware Validation
    auth_validation_success = test_authentication_middleware_validation(token)
    
    # Test 7: Auto-Sync Functionality
    auto_sync_success = test_auto_sync_functionality(token)
    
    # Final Results
    print("\n" + "=" * 60)
    print("🎯 AUTHENTICATION FIX VERIFICATION RESULTS")
    print("=" * 60)
    print(f"Total Tests: {total_tests}")
    print(f"Passed: {passed_tests}")
    print(f"Failed: {total_tests - passed_tests}")
    print(f"Success Rate: {(passed_tests/total_tests)*100:.1f}%")
    
    if passed_tests == total_tests:
        print("\n🎉 ALL TESTS PASSED! Authentication system fix is working correctly!")
        print("✅ Profile page should now show real user data instead of dummy data")
        print("✅ All API endpoints should work properly with Supabase authentication")
        return True
    else:
        print(f"\n⚠️  {total_tests - passed_tests} tests failed. Authentication system needs attention.")
        print("\nFailed Tests:")
        for result in test_results:
            if not result["success"]:
                print(f"❌ {result['test']}: {result['message']}")
        return False

if __name__ == "__main__":
    success = run_authentication_fix_verification()
    sys.exit(0 if success else 1)
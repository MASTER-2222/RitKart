#!/usr/bin/env python3
"""
RitZone Supabase Authentication Direct Test
==========================================
Testing direct Supabase authentication to get the proper access token
that should be used with the authenticateSupabaseToken middleware.

This test bypasses the backend login endpoint and uses Supabase directly
to get the proper access token, then tests the profile endpoints.
"""

import requests
import json
import time
import sys
from datetime import datetime

# Configuration
BACKEND_URL = "http://localhost:10000/api"
SUPABASE_URL = "https://igzpodmmymbptmwebonh.supabase.co"
SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlnenBvZG1teW1icHRtd2Vib25oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1NDczNDIsImV4cCI6MjA3MDEyMzM0Mn0.eOy5F_0pE7ki3TXl49bW5c0K1TWGKf2_Vpn1IRKWQRc"
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

def get_supabase_access_token():
    """Get Supabase access token directly from Supabase Auth API"""
    try:
        # Use Supabase Auth API directly
        auth_url = f"{SUPABASE_URL}/auth/v1/token?grant_type=password"
        
        headers = {
            "apikey": SUPABASE_ANON_KEY,
            "Content-Type": "application/json"
        }
        
        data = {
            "email": TEST_USER_EMAIL,
            "password": TEST_USER_PASSWORD
        }
        
        response = requests.post(auth_url, json=data, headers=headers, timeout=15)
        
        if response.status_code == 200:
            auth_data = response.json()
            access_token = auth_data.get("access_token")
            if access_token:
                log_test("Supabase Direct Authentication", True, 
                       f"Successfully obtained Supabase access token for {TEST_USER_EMAIL}")
                return access_token
            else:
                log_test("Supabase Direct Authentication", False, 
                       f"No access token in response: {auth_data}")
                return None
        else:
            log_test("Supabase Direct Authentication", False, 
                   f"Supabase auth failed with status {response.status_code}: {response.text}")
            return None
            
    except Exception as e:
        log_test("Supabase Direct Authentication", False, f"Supabase auth error: {str(e)}")
        return None

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

def test_profile_get_with_supabase_token(access_token):
    """Test GET /auth/profile with real Supabase access token"""
    try:
        headers = {
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json"
        }
        
        response = requests.get(f"{BACKEND_URL}/auth/profile", headers=headers, timeout=15)
        
        if response.status_code == 200:
            data = response.json()
            if data.get("success") and data.get("user"):
                user = data["user"]
                if user.get("email") == TEST_USER_EMAIL:
                    log_test("GET /auth/profile with Real Supabase Token", True, 
                           f"Successfully retrieved user profile: {user.get('email')}")
                    return True, user
                else:
                    log_test("GET /auth/profile with Real Supabase Token", False, 
                           f"Profile data incorrect: {user}")
                    return False, user
            else:
                log_test("GET /auth/profile with Real Supabase Token", False, 
                       f"Invalid response structure: {data}")
                return False, None
        elif response.status_code == 401:
            log_test("GET /auth/profile with Real Supabase Token", False, 
                   "Authentication failed - 401 Unauthorized")
            return False, None
        elif response.status_code == 403:
            log_test("GET /auth/profile with Real Supabase Token", False, 
                   "Authentication failed - 403 Forbidden (token validation failed)")
            return False, None
        else:
            log_test("GET /auth/profile with Real Supabase Token", False, 
                   f"Request failed with status {response.status_code}: {response.text}")
            return False, None
            
    except Exception as e:
        log_test("GET /auth/profile with Real Supabase Token", False, f"Request error: {str(e)}")
        return False, None

def test_profile_put_with_supabase_token(access_token):
    """Test PUT /auth/profile with real Supabase access token"""
    try:
        headers = {
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json"
        }
        
        update_data = {
            "fullName": "Supabase Test User",
            "phone": "+1987654321",
            "dateOfBirth": "1985-05-15"
        }
        
        response = requests.put(f"{BACKEND_URL}/auth/profile", 
                              json=update_data, headers=headers, timeout=15)
        
        if response.status_code == 200:
            data = response.json()
            if data.get("success"):
                log_test("PUT /auth/profile with Real Supabase Token", True, 
                       "Successfully updated profile with Supabase token")
                return True, data.get("user")
            else:
                log_test("PUT /auth/profile with Real Supabase Token", False, 
                       f"Update failed: {data.get('message')}")
                return False, None
        elif response.status_code == 401:
            log_test("PUT /auth/profile with Real Supabase Token", False, 
                   "Authentication failed - 401 Unauthorized")
            return False, None
        elif response.status_code == 403:
            log_test("PUT /auth/profile with Real Supabase Token", False, 
                   "Authentication failed - 403 Forbidden (token validation failed)")
            return False, None
        else:
            log_test("PUT /auth/profile with Real Supabase Token", False, 
                   f"Update failed with status {response.status_code}: {response.text}")
            return False, None
            
    except Exception as e:
        log_test("PUT /auth/profile with Real Supabase Token", False, f"Update error: {str(e)}")
        return False, None

def test_token_validation_with_supabase_token(access_token):
    """Test token validation with real Supabase token"""
    try:
        # Test valid token
        headers = {"Authorization": f"Bearer {access_token}"}
        response = requests.get(f"{BACKEND_URL}/auth/profile", headers=headers, timeout=10)
        valid_token_works = response.status_code == 200
        
        # Test invalid token
        headers = {"Authorization": "Bearer invalid_supabase_token"}
        response = requests.get(f"{BACKEND_URL}/auth/profile", headers=headers, timeout=10)
        invalid_token_rejected = response.status_code in [401, 403]
        
        # Test no token
        response = requests.get(f"{BACKEND_URL}/auth/profile", timeout=10)
        no_token_rejected = response.status_code == 401
        
        if valid_token_works and invalid_token_rejected and no_token_rejected:
            log_test("Supabase Token Validation", True, 
                   "Token validation working correctly with Supabase tokens")
            return True
        else:
            log_test("Supabase Token Validation", False, 
                   f"Validation issues - Valid: {valid_token_works}, Invalid rejected: {invalid_token_rejected}, No token rejected: {no_token_rejected}")
            return False
            
    except Exception as e:
        log_test("Supabase Token Validation", False, f"Validation test error: {str(e)}")
        return False

def run_supabase_auth_test():
    """Run Supabase authentication test"""
    print("🧪 RITZONE SUPABASE AUTHENTICATION DIRECT TEST")
    print("=" * 60)
    print(f"Backend URL: {BACKEND_URL}")
    print(f"Supabase URL: {SUPABASE_URL}")
    print(f"Test User: {TEST_USER_EMAIL}")
    print(f"Test Time: {datetime.now().isoformat()}")
    print("=" * 60)
    
    # Test 1: Backend Health
    if not test_backend_health():
        print("\n❌ Backend is not accessible. Cannot proceed with tests.")
        return False
    
    # Test 2: Get Supabase Access Token
    access_token = get_supabase_access_token()
    if not access_token:
        print("\n❌ Could not obtain Supabase access token. Cannot proceed with profile tests.")
        return False
    
    print(f"\n🔑 Supabase Access Token (first 50 chars): {access_token[:50]}...")
    
    # Test 3: GET /auth/profile with Supabase Token
    get_success, user_data = test_profile_get_with_supabase_token(access_token)
    
    # Test 4: PUT /auth/profile with Supabase Token
    put_success, updated_user = test_profile_put_with_supabase_token(access_token)
    
    # Test 5: Token Validation
    validation_success = test_token_validation_with_supabase_token(access_token)
    
    # Final Results
    print("\n" + "=" * 60)
    print("🎯 SUPABASE AUTHENTICATION TEST RESULTS")
    print("=" * 60)
    print(f"Total Tests: {total_tests}")
    print(f"Passed: {passed_tests}")
    print(f"Failed: {total_tests - passed_tests}")
    print(f"Success Rate: {(passed_tests/total_tests)*100:.1f}%")
    
    if passed_tests == total_tests:
        print("\n🎉 ALL TESTS PASSED! Supabase authentication is working correctly!")
        print("✅ authenticateSupabaseToken middleware is properly configured")
        print("✅ Profile endpoints work with real Supabase access tokens")
        return True
    else:
        print(f"\n⚠️  {total_tests - passed_tests} tests failed.")
        print("\nFailed Tests:")
        for result in test_results:
            if not result["success"]:
                print(f"❌ {result['test']}: {result['message']}")
        return False

if __name__ == "__main__":
    success = run_supabase_auth_test()
    sys.exit(0 if success else 1)
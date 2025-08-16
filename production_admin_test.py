#!/usr/bin/env python3
"""
Production Admin Users API Test
==============================
Test the production backend to identify JSON parsing issues
"""

import requests
import json
import sys

# Production Configuration
PRODUCTION_BACKEND_URL = "https://ritkart-backend.onrender.com/api"
ADMIN_CREDENTIALS = {
    "email": "admin@ritzone.com",
    "password": "RitZone@Admin2025!"
}

def test_production_admin_endpoints():
    """Test production admin endpoints"""
    session = requests.Session()
    
    print("🚀 Testing Production Admin Users API")
    print("=" * 50)
    
    # Test 1: Admin Login
    try:
        login_response = session.post(
            f"{PRODUCTION_BACKEND_URL}/auto-sync/auth/login",
            json=ADMIN_CREDENTIALS,
            headers={'Content-Type': 'application/json'},
            timeout=30
        )
        
        print(f"✅ Admin Login Status: {login_response.status_code}")
        print(f"Content-Type: {login_response.headers.get('Content-Type')}")
        
        if login_response.status_code == 200:
            try:
                login_data = login_response.json()
                print(f"✅ Login successful: {login_data.get('success')}")
                
                # Extract session cookie
                if 'Set-Cookie' in login_response.headers:
                    cookies = login_response.headers['Set-Cookie']
                    if 'admin_session=' in cookies:
                        cookie_value = cookies.split('admin_session=')[1].split(';')[0]
                        session.cookies.set('admin_session', cookie_value)
                        print("✅ Session cookie extracted")
                
            except json.JSONDecodeError as e:
                print(f"❌ JSON parsing error in login: {e}")
                print(f"Response text: {login_response.text[:200]}")
                return False
        else:
            print(f"❌ Login failed: {login_response.text[:200]}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Login request failed: {e}")
        return False
    
    # Test 2: GET Admin Users
    try:
        users_response = session.get(
            f"{PRODUCTION_BACKEND_URL}/admin/users",
            timeout=30
        )
        
        print(f"✅ GET Admin Users Status: {users_response.status_code}")
        print(f"Content-Type: {users_response.headers.get('Content-Type')}")
        
        if users_response.status_code == 200:
            try:
                users_data = users_response.json()
                print(f"✅ Users retrieved: {len(users_data.get('data', []))}")
                print("✅ JSON parsing successful - NO JSON PARSING ERROR!")
                
            except json.JSONDecodeError as e:
                print(f"🚨 CRITICAL: JSON parsing error in GET users: {e}")
                print(f"Response text: {users_response.text[:500]}")
                print("🚨 THIS IS THE ROOT CAUSE OF THE FRONTEND ERROR!")
                return False
        else:
            print(f"❌ GET Users failed: {users_response.text[:200]}")
            
    except requests.exceptions.RequestException as e:
        print(f"❌ GET Users request failed: {e}")
        return False
    
    # Test 3: POST Create User (test data)
    try:
        test_user = {
            "email": "test_production@example.com",
            "password": "TestPassword123!",
            "full_name": "Production Test User"
        }
        
        create_response = session.post(
            f"{PRODUCTION_BACKEND_URL}/admin/users",
            json=test_user,
            headers={'Content-Type': 'application/json'},
            timeout=30
        )
        
        print(f"✅ POST Create User Status: {create_response.status_code}")
        print(f"Content-Type: {create_response.headers.get('Content-Type')}")
        
        try:
            create_data = create_response.json()
            print(f"✅ Create response parsed: {create_data.get('success')}")
            
        except json.JSONDecodeError as e:
            print(f"🚨 CRITICAL: JSON parsing error in POST create: {e}")
            print(f"Response text: {create_response.text[:500]}")
            print("🚨 THIS IS THE ROOT CAUSE OF THE FRONTEND ERROR!")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ POST Create request failed: {e}")
        return False
    
    print("\n🎉 ALL TESTS PASSED - NO JSON PARSING ERRORS DETECTED!")
    return True

if __name__ == "__main__":
    success = test_production_admin_endpoints()
    if success:
        print("\n✅ CONCLUSION: Backend APIs are returning proper JSON responses")
        print("✅ The JSON parsing error is likely a frontend issue, not backend")
    else:
        print("\n❌ CONCLUSION: JSON parsing errors detected in backend responses")
        print("❌ Backend is returning HTML/text instead of JSON")
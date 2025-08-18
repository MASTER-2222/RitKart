#!/usr/bin/env python3
"""
Quick debug test for Profile Update API
"""

import requests
import json
import time

def test_profile_update():
    base_url = "http://localhost:10000/api"
    
    # Register a test user
    timestamp = int(time.time())
    test_email = f"debugtest{timestamp}@ritzone.com"
    
    user_data = {
        "email": test_email,
        "password": "DebugTest123!",
        "fullName": "Debug Test User",
        "phone": "+1234567890"
    }
    
    print("🔧 Registering test user...")
    register_response = requests.post(f"{base_url}/auth/register", json=user_data, timeout=15)
    print(f"Register Status: {register_response.status_code}")
    
    if register_response.status_code != 201:
        print(f"Registration failed: {register_response.text}")
        return
    
    # Login to get token
    login_data = {
        "email": test_email,
        "password": "DebugTest123!"
    }
    
    print("🔐 Logging in...")
    login_response = requests.post(f"{base_url}/auth/login", json=login_data, timeout=15)
    print(f"Login Status: {login_response.status_code}")
    
    if login_response.status_code != 200:
        print(f"Login failed: {login_response.text}")
        return
    
    login_data = login_response.json()
    token = login_data.get('token')
    print(f"Token obtained: {token[:20]}...")
    
    # Test profile update
    headers = {"Authorization": f"Bearer {token}"}
    profile_data = {
        "fullName": "Debug Test User Updated",
        "phone": "+1987654321",
        "dateOfBirth": "1990-01-15"
    }
    
    print("📝 Testing profile update...")
    update_response = requests.put(f"{base_url}/auth/profile", headers=headers, json=profile_data, timeout=15)
    print(f"Update Status: {update_response.status_code}")
    print(f"Update Response: {update_response.text}")
    
    if update_response.status_code == 400:
        print("❌ Profile update failed with 400 error")
        try:
            error_data = update_response.json()
            print(f"Error details: {error_data}")
        except:
            print("Could not parse error response")

if __name__ == "__main__":
    test_profile_update()
#!/usr/bin/env python3
"""
Debug User Service - Test the userService.login directly to see what it returns
"""

import requests
import json

# Test by calling the backend and checking logs
BACKEND_URL = "http://localhost:10000/api"
TEST_USER_EMAIL = "b@b.com"
TEST_USER_PASSWORD = "Abcd@1234"

def test_login_with_debug():
    """Test login and check backend logs"""
    try:
        # Add some debug logging to see what's happening
        login_data = {
            "email": TEST_USER_EMAIL,
            "password": TEST_USER_PASSWORD
        }
        
        print("Testing login endpoint...")
        response = requests.post(f"{BACKEND_URL}/auth/login", json=login_data, timeout=15)
        
        print(f"Response status: {response.status_code}")
        print(f"Response: {response.text}")
        
        # Check backend logs
        print("\nChecking backend logs...")
        
    except Exception as e:
        print(f"Error: {str(e)}")

if __name__ == "__main__":
    test_login_with_debug()
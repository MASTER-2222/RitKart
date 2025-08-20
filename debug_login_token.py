#!/usr/bin/env python3
"""
Debug Login Token - Check what token is being returned by the login endpoint
"""

import requests
import json

BACKEND_URL = "http://localhost:10000/api"
TEST_USER_EMAIL = "b@b.com"
TEST_USER_PASSWORD = "Abcd@1234"

def debug_login():
    """Debug what token is returned by login"""
    try:
        login_data = {
            "email": TEST_USER_EMAIL,
            "password": TEST_USER_PASSWORD
        }
        
        response = requests.post(f"{BACKEND_URL}/auth/login", json=login_data, timeout=15)
        
        print(f"Login Response Status: {response.status_code}")
        print(f"Login Response Headers: {dict(response.headers)}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"Login Response Data: {json.dumps(data, indent=2)}")
            
            token = data.get("token")
            if token:
                print(f"\nToken (first 100 chars): {token[:100]}...")
                print(f"Token length: {len(token)}")
                
                # Check if it looks like a JWT token (has 3 parts separated by dots)
                parts = token.split('.')
                print(f"Token parts: {len(parts)}")
                if len(parts) == 3:
                    print("This looks like a JWT token")
                else:
                    print("This looks like a Supabase access token")
                    
                return token
            else:
                print("No token in response")
                return None
        else:
            print(f"Login failed: {response.text}")
            return None
            
    except Exception as e:
        print(f"Login error: {str(e)}")
        return None

if __name__ == "__main__":
    debug_login()
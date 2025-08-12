#!/usr/bin/env python3
"""
RitZone Cart API Debug Testing - Detailed Error Investigation
============================================================
Investigating the 400 error when using Supabase tokens for Add to Cart
"""

import requests
import json
import sys
from datetime import datetime

def test_supabase_token_cart_debug():
    """Debug the Supabase token cart issue with detailed error logging"""
    
    supabase_url = "https://igzpodmmymbptmwebonh.supabase.co"
    supabase_anon_key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlnenBvZG1teW1icHRtd2Vib25oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1NDczNDIsImV4cCI6MjA3MDEyMzM0Mn0.eOy5F_0pE7ki3TXl49bW5c0K1TWGKf2_Vpn1IRKWQRc"
    backend_url = "https://ritkart-backend.onrender.com/api"
    
    print("🔍 DEBUGGING SUPABASE TOKEN CART ISSUE")
    print("=" * 60)
    
    # Step 1: Create user and get Supabase token
    timestamp = datetime.now().strftime('%H%M%S%f')[:-3]
    test_email = f"debugtest.{timestamp}@example.com"
    test_password = "DebugTest123!"
    
    signup_url = f"{supabase_url}/auth/v1/signup"
    signup_data = {
        "email": test_email,
        "password": test_password,
        "data": {"full_name": f"Debug Test User {timestamp}"}
    }
    
    headers = {
        'apikey': supabase_anon_key,
        'Content-Type': 'application/json'
    }
    
    print(f"📝 Creating test user: {test_email}")
    signup_response = requests.post(signup_url, json=signup_data, headers=headers, timeout=15)
    
    if signup_response.status_code not in [200, 201]:
        print(f"❌ User creation failed: {signup_response.status_code}")
        print(f"Response: {signup_response.text}")
        return
    
    signup_result = signup_response.json()
    access_token = signup_result.get('access_token')
    user_id = signup_result.get('user', {}).get('id')
    
    if not access_token:
        print("❌ No access token received")
        return
    
    print(f"✅ User created successfully")
    print(f"🔑 Access token: {access_token[:50]}...")
    print(f"👤 User ID: {user_id}")
    
    # Step 2: Test cart access with Supabase token
    cart_headers = {
        'Authorization': f'Bearer {access_token}',
        'Content-Type': 'application/json'
    }
    
    print(f"\n🛒 Testing cart access...")
    cart_response = requests.get(f"{backend_url}/cart", headers=cart_headers, timeout=15)
    print(f"Cart GET Status: {cart_response.status_code}")
    print(f"Cart GET Response: {cart_response.text}")
    
    # Step 3: Get a product
    print(f"\n🛍️ Getting product for cart test...")
    products_response = requests.get(f"{backend_url}/products/category/electronics?limit=1", timeout=15)
    
    if products_response.status_code != 200:
        print(f"❌ Products request failed: {products_response.status_code}")
        return
    
    products_data = products_response.json()
    if not (products_data.get('success') and products_data.get('data')):
        print("❌ No products available")
        return
    
    product = products_data['data'][0]
    product_id = product.get('id')
    product_name = product.get('name', 'Unknown')
    
    print(f"✅ Product found: {product_name}")
    print(f"📦 Product ID: {product_id}")
    
    # Step 4: Test Add to Cart with detailed error logging
    print(f"\n➕ Testing Add to Cart with Supabase token...")
    
    add_to_cart_data = {
        "productId": product_id,
        "quantity": 1
    }
    
    print(f"📤 Request URL: {backend_url}/cart/add")
    print(f"📤 Request Headers: {json.dumps({k: v[:50] + '...' if k == 'Authorization' else v for k, v in cart_headers.items()}, indent=2)}")
    print(f"📤 Request Body: {json.dumps(add_to_cart_data, indent=2)}")
    
    add_response = requests.post(f"{backend_url}/cart/add", json=add_to_cart_data, headers=cart_headers, timeout=15)
    
    print(f"\n📥 Response Status: {add_response.status_code}")
    print(f"📥 Response Headers: {dict(add_response.headers)}")
    print(f"📥 Response Body: {add_response.text}")
    
    # Step 5: Compare with JWT token approach
    print(f"\n🔄 COMPARING WITH JWT TOKEN APPROACH...")
    
    # Register via backend
    backend_reg_data = {
        "email": f"jwtdebug.{timestamp}@example.com",
        "password": "JWTDebug123!",
        "fullName": f"JWT Debug User {timestamp}",
        "phone": "+1234567890"
    }
    
    print(f"📝 Creating JWT user via backend...")
    jwt_reg_response = requests.post(f"{backend_url}/auth/register", json=backend_reg_data, timeout=15)
    
    if jwt_reg_response.status_code == 201:
        # Login to get JWT
        login_data = {"email": backend_reg_data["email"], "password": backend_reg_data["password"]}
        login_response = requests.post(f"{backend_url}/auth/login", json=login_data, timeout=15)
        
        if login_response.status_code == 200:
            login_result = login_response.json()
            jwt_token = login_result.get('token')
            
            if jwt_token:
                print(f"✅ JWT token acquired: {jwt_token[:50]}...")
                
                # Test Add to Cart with JWT
                jwt_headers = {
                    'Authorization': f'Bearer {jwt_token}',
                    'Content-Type': 'application/json'
                }
                
                print(f"\n➕ Testing Add to Cart with JWT token...")
                jwt_add_response = requests.post(f"{backend_url}/cart/add", json=add_to_cart_data, headers=jwt_headers, timeout=15)
                
                print(f"📥 JWT Response Status: {jwt_add_response.status_code}")
                print(f"📥 JWT Response Body: {jwt_add_response.text}")
                
                # If JWT works, test getting cart
                if jwt_add_response.status_code == 200:
                    cart_check_response = requests.get(f"{backend_url}/cart", headers=jwt_headers, timeout=15)
                    print(f"\n🛒 JWT Cart Check Status: {cart_check_response.status_code}")
                    print(f"🛒 JWT Cart Check Body: {cart_check_response.text}")
    
    print(f"\n" + "=" * 60)
    print("🔍 ANALYSIS:")
    print("- If Supabase token fails but JWT works, the issue is in token validation")
    print("- If both fail, the issue is in the cart service itself")
    print("- Check the backend authentication middleware for Supabase token handling")

if __name__ == "__main__":
    test_supabase_token_cart_debug()
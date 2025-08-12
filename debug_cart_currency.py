#!/usr/bin/env python3
"""
Debug Cart Currency Issue
"""

import requests
import json
from datetime import datetime

def debug_cart_currency():
    base_url = "https://ritkart-backend.onrender.com/api"
    
    # 1. Register and login user
    timestamp = datetime.now().strftime('%H%M%S%f')[:-3]
    test_email = f"debugcart.{timestamp}@example.com"
    
    user_data = {
        "email": test_email,
        "password": "DebugTest123!",
        "fullName": f"Debug Test User {timestamp}",
        "phone": "+1234567890"
    }
    
    print("1. Registering user...")
    response = requests.post(f"{base_url}/auth/register", json=user_data, timeout=15)
    print(f"Register status: {response.status_code}")
    
    # Login
    login_data = {"email": test_email, "password": "DebugTest123!"}
    response = requests.post(f"{base_url}/auth/login", json=login_data, timeout=15)
    
    if response.status_code != 200:
        print("Login failed")
        return
    
    token = response.json().get('token')
    headers = {'Authorization': f'Bearer {token}', 'Content-Type': 'application/json'}
    
    print("2. Getting a product to add to cart...")
    response = requests.get(f"{base_url}/products?limit=1", timeout=15)
    if response.status_code != 200:
        print("Failed to get products")
        return
    
    products = response.json().get('data', [])
    if not products:
        print("No products found")
        return
    
    product_id = products[0]['id']
    print(f"Product ID: {product_id}")
    
    # 3. Add product to cart
    print("3. Adding product to cart...")
    cart_data = {"productId": product_id, "quantity": 1}
    response = requests.post(f"{base_url}/cart/add", json=cart_data, headers=headers, timeout=15)
    print(f"Add to cart status: {response.status_code}")
    print(f"Add to cart response: {response.text[:300]}")
    
    # 4. Get cart in INR
    print("4. Getting cart in INR...")
    response = requests.get(f"{base_url}/cart", headers=headers, timeout=15)
    print(f"Cart INR status: {response.status_code}")
    if response.status_code == 200:
        cart_data = response.json()
        print(f"Cart INR data: {json.dumps(cart_data, indent=2)[:500]}")
    
    # 5. Get cart in USD
    print("5. Getting cart in USD...")
    response = requests.get(f"{base_url}/cart?currency=USD", headers=headers, timeout=15)
    print(f"Cart USD status: {response.status_code}")
    if response.status_code == 200:
        cart_data = response.json()
        print(f"Cart USD data: {json.dumps(cart_data, indent=2)[:500]}")
        
        # Check if currency data is present
        if cart_data.get('success') and cart_data.get('data'):
            cart_items = cart_data['data'].get('cart_items', [])
            if cart_items:
                item = cart_items[0]
                product_data = item.get('products', {})
                print(f"Product currency: {product_data.get('currency')}")
                print(f"Product currency_symbol: {product_data.get('currency_symbol')}")
                print(f"Product formatted_price: {product_data.get('formatted_price')}")

if __name__ == "__main__":
    debug_cart_currency()
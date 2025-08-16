#!/usr/bin/env python3
"""
Debug Cart Test
===============
Debug the cart retrieval issue
"""

import requests
import json
from datetime import datetime

def debug_cart():
    base_url = "http://localhost:8001/api"
    
    # Setup user
    timestamp = datetime.now().strftime('%H%M%S%f')[:-3]
    test_email = f"debug.{timestamp}@example.com"
    
    # Register and login
    user_data = {
        "email": test_email,
        "password": "Debug123!",
        "fullName": f"Debug User {timestamp}"
    }
    
    response = requests.post(f"{base_url}/auth/register", json=user_data)
    print(f"Registration: {response.status_code} - {response.json()}")
    
    login_data = {"email": test_email, "password": "Debug123!"}
    response = requests.post(f"{base_url}/auth/login", json=login_data)
    login_result = response.json()
    print(f"Login: {response.status_code} - {login_result}")
    
    token = login_result.get('token')
    headers = {'Authorization': f'Bearer {token}', 'Content-Type': 'application/json'}
    
    # Get a product
    response = requests.get(f"{base_url}/products/category/electronics?limit=1", headers=headers)
    products = response.json()
    print(f"Products: {response.status_code} - Found {len(products.get('data', []))} products")
    
    if not products.get('data'):
        print("No products available")
        return
    
    product = products['data'][0]
    product_id = product['id']
    print(f"Using product: {product['name']} (ID: {product_id})")
    
    # Add to cart
    cart_data = {"productId": product_id, "quantity": 1}
    response = requests.post(f"{base_url}/cart/add", json=cart_data, headers=headers)
    add_result = response.json()
    print(f"Add to cart: {response.status_code} - {add_result}")
    
    # Get cart
    response = requests.get(f"{base_url}/cart", headers=headers)
    cart_result = response.json()
    print(f"Get cart: {response.status_code} - {cart_result}")
    
    # Check cart structure
    if cart_result.get('success'):
        cart_data = cart_result.get('data', {})
        print(f"Cart data keys: {list(cart_data.keys())}")
        print(f"Cart items: {cart_data.get('items', 'NO ITEMS KEY')}")
        print(f"Cart total: {cart_data.get('total', 'NO TOTAL KEY')}")
        
        # Check if it's cart_items instead of items
        if 'cart_items' in cart_data:
            print(f"Found cart_items: {cart_data['cart_items']}")

if __name__ == "__main__":
    debug_cart()
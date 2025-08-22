#!/usr/bin/env python3
"""
RitZone Search Functionality Backend Test
Quick focused test for search API endpoints
"""

import requests
import json
import sys

# Backend URL from environment
BACKEND_URL = "https://ritzone-frontend-s3ik.onrender.com/api"
TEST_EMAIL = "b@b.com"
TEST_PASSWORD = "Abcd@1234"

def test_search_functionality():
    """Test search functionality on RitZone backend"""
    print("🔍 TESTING RITZONE SEARCH FUNCTIONALITY")
    print("=" * 50)
    
    # Test 1: Search with search parameter
    print("\n1. Testing GET /api/products?search=iphone")
    try:
        response = requests.get(f"{BACKEND_URL}/products?search=iphone", timeout=10)
        print(f"   Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"   Success: {data.get('success', False)}")
            print(f"   Products found: {len(data.get('data', []))}")
            if data.get('data'):
                product = data['data'][0]
                print(f"   Sample product: {product.get('name', 'N/A')}")
                print(f"   Has required fields: id={bool(product.get('id'))}, name={bool(product.get('name'))}, price={bool(product.get('price'))}")
        else:
            print(f"   Error: {response.text}")
    except Exception as e:
        print(f"   Exception: {e}")
    
    # Test 2: Category filter
    print("\n2. Testing GET /api/products?category=electronics")
    try:
        response = requests.get(f"{BACKEND_URL}/products?category=electronics", timeout=10)
        print(f"   Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"   Success: {data.get('success', False)}")
            print(f"   Products found: {len(data.get('data', []))}")
        else:
            print(f"   Error: {response.text}")
    except Exception as e:
        print(f"   Exception: {e}")
    
    # Test 3: Combined search and category
    print("\n3. Testing GET /api/products?search=phone&category=electronics")
    try:
        response = requests.get(f"{BACKEND_URL}/products?search=phone&category=electronics", timeout=10)
        print(f"   Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"   Success: {data.get('success', False)}")
            print(f"   Products found: {len(data.get('data', []))}")
        else:
            print(f"   Error: {response.text}")
    except Exception as e:
        print(f"   Exception: {e}")
    
    # Test 4: Basic products endpoint
    print("\n4. Testing GET /api/products (basic)")
    try:
        response = requests.get(f"{BACKEND_URL}/products", timeout=10)
        print(f"   Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"   Success: {data.get('success', False)}")
            print(f"   Products found: {len(data.get('data', []))}")
            if data.get('data'):
                product = data['data'][0]
                required_fields = ['id', 'name', 'price', 'images', 'category_name', 'rating_average']
                field_status = {field: bool(product.get(field)) for field in required_fields}
                print(f"   Required fields present: {field_status}")
        else:
            print(f"   Error: {response.text}")
    except Exception as e:
        print(f"   Exception: {e}")
    
    print("\n" + "=" * 50)
    print("🎯 SEARCH FUNCTIONALITY TEST COMPLETE")

if __name__ == "__main__":
    test_search_functionality()
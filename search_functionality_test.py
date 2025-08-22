#!/usr/bin/env python3
"""
RitZone Search Functionality Backend Test
Quick focused test for search API endpoints
"""

import requests
import json
import sys

def test_search_functionality():
    """Test search functionality on RitZone backend"""
    print("🔍 TESTING RITZONE SEARCH FUNCTIONALITY")
    print("=" * 50)
    
    # Try different backend URLs
    backend_urls = [
        "https://ritkart-backend-ujnt.onrender.com/api",
        "http://localhost:10000/api"
    ]
    
    working_url = None
    
    # Find working backend URL
    for url in backend_urls:
        print(f"\n🔗 Testing backend connectivity: {url}")
        try:
            response = requests.get(f"{url}/products", timeout=5)
            if response.status_code in [200, 404]:  # 404 is ok, means server is running
                working_url = url
                print(f"   ✅ Backend accessible at: {url}")
                break
            else:
                print(f"   ❌ Status: {response.status_code}")
        except Exception as e:
            print(f"   ❌ Connection failed: {e}")
    
    if not working_url:
        print("❌ No working backend URL found!")
        return
    
    # Test 1: Search with search parameter
    print(f"\n1. Testing GET {working_url}/products?search=iphone")
    try:
        response = requests.get(f"{working_url}/products?search=iphone", timeout=10)
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
            print(f"   Error: {response.text[:200]}...")
    except Exception as e:
        print(f"   Exception: {e}")
    
    # Test 2: Category filter
    print(f"\n2. Testing GET {working_url}/products?category=electronics")
    try:
        response = requests.get(f"{working_url}/products?category=electronics", timeout=10)
        print(f"   Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"   Success: {data.get('success', False)}")
            print(f"   Products found: {len(data.get('data', []))}")
        else:
            print(f"   Error: {response.text[:200]}...")
    except Exception as e:
        print(f"   Exception: {e}")
    
    # Test 3: Combined search and category
    print(f"\n3. Testing GET {working_url}/products?search=phone&category=electronics")
    try:
        response = requests.get(f"{working_url}/products?search=phone&category=electronics", timeout=10)
        print(f"   Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"   Success: {data.get('success', False)}")
            print(f"   Products found: {len(data.get('data', []))}")
        else:
            print(f"   Error: {response.text[:200]}...")
    except Exception as e:
        print(f"   Exception: {e}")
    
    # Test 4: Basic products endpoint
    print(f"\n4. Testing GET {working_url}/products (basic)")
    try:
        response = requests.get(f"{working_url}/products", timeout=10)
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
            print(f"   Error: {response.text[:200]}...")
    except Exception as e:
        print(f"   Exception: {e}")
    
    print("\n" + "=" * 50)
    print("🎯 SEARCH FUNCTIONALITY TEST COMPLETE")

if __name__ == "__main__":
    test_search_functionality()
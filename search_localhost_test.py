#!/usr/bin/env python3
"""
RitZone Search Functionality Test - Localhost Development Server
Quick focused test for search API endpoints on localhost
"""

import requests
import json
import sys
import time

def test_search_localhost():
    """Test search functionality on localhost development server"""
    print("🔍 TESTING RITZONE SEARCH FUNCTIONALITY - LOCALHOST")
    print("=" * 60)
    
    # Localhost backend URL
    backend_url = "http://localhost:10000/api"
    
    # Test backend connectivity first
    print(f"\n🔗 Testing backend connectivity: {backend_url}")
    try:
        response = requests.get(f"{backend_url}/products", timeout=5)
        if response.status_code == 200:
            print(f"   ✅ Backend accessible - Status: {response.status_code}")
        else:
            print(f"   ⚠️  Backend responding but with status: {response.status_code}")
    except Exception as e:
        print(f"   ❌ Backend connection failed: {e}")
        print("   💡 Make sure backend is running on localhost:10000")
        return
    
    # Test 1: Search with search parameter
    print(f"\n1. Testing GET {backend_url}/products?search=iphone")
    try:
        response = requests.get(f"{backend_url}/products?search=iphone", timeout=10)
        print(f"   Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"   Success: {data.get('success', False)}")
            print(f"   Products found: {len(data.get('data', []))}")
            if data.get('data'):
                product = data['data'][0]
                print(f"   Sample product: {product.get('name', 'N/A')}")
                print(f"   Price: {product.get('price', 'N/A')}")
                print(f"   Has required fields: id={bool(product.get('id'))}, name={bool(product.get('name'))}, price={bool(product.get('price'))}")
                print(f"   Images: {bool(product.get('images'))}, Category: {product.get('category_name', 'N/A')}")
        else:
            print(f"   Error: {response.text[:300]}...")
    except Exception as e:
        print(f"   Exception: {e}")
    
    # Test 2: Category filter
    print(f"\n2. Testing GET {backend_url}/products?category=electronics")
    try:
        response = requests.get(f"{backend_url}/products?category=electronics", timeout=10)
        print(f"   Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"   Success: {data.get('success', False)}")
            print(f"   Products found: {len(data.get('data', []))}")
            if data.get('data'):
                print(f"   Sample category product: {data['data'][0].get('name', 'N/A')}")
        else:
            print(f"   Error: {response.text[:300]}...")
    except Exception as e:
        print(f"   Exception: {e}")
    
    # Test 3: Combined search and category
    print(f"\n3. Testing GET {backend_url}/products?search=phone&category=electronics")
    try:
        response = requests.get(f"{backend_url}/products?search=phone&category=electronics", timeout=10)
        print(f"   Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"   Success: {data.get('success', False)}")
            print(f"   Products found: {len(data.get('data', []))}")
            if data.get('data'):
                print(f"   Sample combined search product: {data['data'][0].get('name', 'N/A')}")
        else:
            print(f"   Error: {response.text[:300]}...")
    except Exception as e:
        print(f"   Exception: {e}")
    
    # Test 4: Basic products endpoint with detailed field verification
    print(f"\n4. Testing GET {backend_url}/products (basic with field verification)")
    try:
        response = requests.get(f"{backend_url}/products", timeout=10)
        print(f"   Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"   Success: {data.get('success', False)}")
            print(f"   Products found: {len(data.get('data', []))}")
            if data.get('data'):
                product = data['data'][0]
                required_fields = ['id', 'name', 'price', 'images', 'category_name', 'rating_average']
                print(f"   📋 DETAILED FIELD VERIFICATION:")
                for field in required_fields:
                    value = product.get(field)
                    status = "✅" if value else "❌"
                    print(f"      {status} {field}: {value}")
                
                # Additional useful fields
                extra_fields = ['brand', 'stock_quantity', 'is_active', 'original_price']
                print(f"   📋 ADDITIONAL FIELDS:")
                for field in extra_fields:
                    value = product.get(field)
                    status = "✅" if value is not None else "❌"
                    print(f"      {status} {field}: {value}")
        else:
            print(f"   Error: {response.text[:300]}...")
    except Exception as e:
        print(f"   Exception: {e}")
    
    # Test 5: Search functionality implementation check
    print(f"\n5. Testing search implementation details")
    search_terms = ["phone", "laptop", "samsung"]
    for term in search_terms:
        try:
            response = requests.get(f"{backend_url}/products?search={term}", timeout=5)
            if response.status_code == 200:
                data = response.json()
                count = len(data.get('data', []))
                print(f"   🔍 Search '{term}': {count} products found")
            else:
                print(f"   ❌ Search '{term}' failed: {response.status_code}")
        except Exception as e:
            print(f"   ❌ Search '{term}' exception: {e}")
    
    print("\n" + "=" * 60)
    print("🎯 LOCALHOST SEARCH FUNCTIONALITY TEST COMPLETE")

if __name__ == "__main__":
    test_search_localhost()
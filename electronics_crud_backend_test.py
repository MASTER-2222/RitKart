#!/usr/bin/env python3
"""
Electronics Section CRUD Backend API Testing
==============================================
Testing the new Electronics section CRUD functionality in the admin homepage API endpoints.

IMPLEMENTATION DETAILS:
- Added new backend endpoints: POST /api/admin/homepage/electronics (create), 
  PUT /api/admin/homepage/electronics/:id/details (update details), 
  DELETE /api/admin/homepage/electronics/:id (delete), 
  and existing PUT /api/admin/homepage/electronics/:id (toggle bestseller)
- Added backend service methods: getBestsellerElectronicsProducts() and updateProductBestsellerStatus()  
- Updated /api/admin/homepage/sections endpoint to call getBestsellerElectronicsProducts() instead of getProductsByCategory()

TEST PRIORITY REQUIREMENTS:
1. HIGH PRIORITY: Test the main sections endpoint GET /api/admin/homepage/sections to ensure electronics_section now returns bestseller electronics products only
2. HIGH PRIORITY: Test the new CREATE endpoint POST /api/admin/homepage/electronics with required fields (name, price, images)
3. HIGH PRIORITY: Test the new UPDATE endpoint PUT /api/admin/homepage/electronics/:id/details for product details 
4. HIGH PRIORITY: Test the new DELETE endpoint DELETE /api/admin/homepage/electronics/:id for soft deletion
5. MEDIUM PRIORITY: Test the existing toggle bestseller endpoint PUT /api/admin/homepage/electronics/:id

BUSINESS LOGIC TO VERIFY:
- Electronics section should only return products where is_bestseller=true and is_active=true
- New products default to is_bestseller=true when created via electronics endpoint
- Delete operation should set both is_active=false AND is_bestseller=false
- All endpoints should have proper validation and error handling
- Response format should match frontend expectations with transformed product data
"""

import requests
import json
import sys
import uuid
from datetime import datetime

# Configuration
BASE_URL = "http://localhost:10000/api"
ADMIN_HOMEPAGE_URL = f"{BASE_URL}/admin/homepage"

# Test data
TEST_ELECTRONICS_PRODUCT = {
    "name": "Samsung Galaxy S24 Ultra",
    "slug": "samsung-galaxy-s24-ultra-test",
    "description": "Latest flagship smartphone with advanced AI features",
    "price": 1199.99,
    "original_price": 1299.99,
    "brand": "Samsung",
    "stock_quantity": 50,
    "category_id": "01234567-89ab-cdef-0123-456789abcdef",  # Electronics category ID
    "images": [
        "https://images.samsung.com/is/image/samsung/p6pim/us/2401/gallery/us-galaxy-s24-ultra-s928-sm-s928uzkeue-thumb-539573016",
        "https://images.samsung.com/is/image/samsung/p6pim/us/2401/gallery/us-galaxy-s24-ultra-s928-sm-s928uzkeue-thumb-539573017"
    ]
}

def print_test_header(test_name):
    """Print formatted test header"""
    print(f"\n{'='*80}")
    print(f"🧪 {test_name}")
    print(f"{'='*80}")

def print_test_result(success, message, details=None):
    """Print formatted test result"""
    status = "✅ PASS" if success else "❌ FAIL"
    print(f"{status}: {message}")
    if details:
        print(f"Details: {details}")

def make_request(method, url, data=None, headers=None):
    """Make HTTP request with error handling"""
    try:
        if headers is None:
            headers = {'Content-Type': 'application/json'}
        
        if method.upper() == 'GET':
            response = requests.get(url, headers=headers)
        elif method.upper() == 'POST':
            response = requests.post(url, json=data, headers=headers)
        elif method.upper() == 'PUT':
            response = requests.put(url, json=data, headers=headers)
        elif method.upper() == 'DELETE':
            response = requests.delete(url, headers=headers)
        else:
            raise ValueError(f"Unsupported HTTP method: {method}")
        
        return response
    except requests.exceptions.RequestException as e:
        print(f"❌ Request failed: {e}")
        return None

def test_homepage_sections_electronics():
    """
    HIGH PRIORITY: Test GET /api/admin/homepage/sections 
    Verify electronics_section returns bestseller electronics products only
    """
    print_test_header("Test Homepage Sections - Electronics Section")
    
    response = make_request('GET', f"{ADMIN_HOMEPAGE_URL}/sections")
    
    if not response:
        print_test_result(False, "Failed to make request to sections endpoint")
        return False
    
    if response.status_code != 200:
        print_test_result(False, f"Expected status 200, got {response.status_code}", response.text)
        return False
    
    try:
        data = response.json()
        
        # Verify response structure
        if not data.get('success'):
            print_test_result(False, "Response success is false", data.get('message'))
            return False
        
        sections_data = data.get('data', {})
        electronics_section = sections_data.get('electronics_section', {})
        products = electronics_section.get('products', [])
        
        print(f"📊 Found {len(products)} electronics products")
        
        # Verify all products are bestsellers and active
        all_bestsellers = True
        all_active = True
        
        for product in products:
            if not product.get('is_bestseller'):
                all_bestsellers = False
                print(f"❌ Product {product.get('name')} is not a bestseller")
            
            if not product.get('is_active'):
                all_active = False
                print(f"❌ Product {product.get('name')} is not active")
        
        # Verify product structure
        if products:
            sample_product = products[0]
            required_fields = ['id', 'name', 'price', 'images', 'is_bestseller', 'is_active']
            missing_fields = [field for field in required_fields if field not in sample_product]
            
            if missing_fields:
                print_test_result(False, f"Missing required fields in product: {missing_fields}")
                return False
        
        success = all_bestsellers and all_active
        message = "Electronics section returns only bestseller and active products" if success else "Electronics section contains non-bestseller or inactive products"
        print_test_result(success, message)
        
        return success
        
    except json.JSONDecodeError:
        print_test_result(False, "Invalid JSON response", response.text)
        return False

def test_create_electronics_product():
    """
    HIGH PRIORITY: Test POST /api/admin/homepage/electronics
    Verify creation with required fields (name, price, images)
    """
    print_test_header("Test Create Electronics Product")
    
    response = make_request('POST', f"{ADMIN_HOMEPAGE_URL}/electronics", TEST_ELECTRONICS_PRODUCT)
    
    if not response:
        print_test_result(False, "Failed to make request to create electronics endpoint")
        return None
    
    if response.status_code != 201:
        print_test_result(False, f"Expected status 201, got {response.status_code}", response.text)
        return None
    
    try:
        data = response.json()
        
        if not data.get('success'):
            print_test_result(False, "Response success is false", data.get('message'))
            return None
        
        product = data.get('data', {})
        
        # Verify product was created with correct defaults
        if not product.get('is_bestseller'):
            print_test_result(False, "New electronics product should default to is_bestseller=true")
            return None
        
        if not product.get('is_active'):
            print_test_result(False, "New electronics product should default to is_active=true")
            return None
        
        # Verify required fields are present
        if product.get('name') != TEST_ELECTRONICS_PRODUCT['name']:
            print_test_result(False, f"Product name mismatch: expected {TEST_ELECTRONICS_PRODUCT['name']}, got {product.get('name')}")
            return None
        
        if product.get('price') != TEST_ELECTRONICS_PRODUCT['price']:
            print_test_result(False, f"Product price mismatch: expected {TEST_ELECTRONICS_PRODUCT['price']}, got {product.get('price')}")
            return None
        
        product_id = product.get('id')
        if not product_id:
            print_test_result(False, "Created product missing ID")
            return None
        
        print_test_result(True, f"Electronics product created successfully with ID: {product_id}")
        print(f"📦 Product: {product.get('name')} - ${product.get('price')}")
        print(f"🏆 Bestseller: {product.get('is_bestseller')}")
        print(f"✅ Active: {product.get('is_active')}")
        
        return product_id
        
    except json.JSONDecodeError:
        print_test_result(False, "Invalid JSON response", response.text)
        return None

def test_create_electronics_validation():
    """Test validation for required fields in create electronics endpoint"""
    print_test_header("Test Create Electronics Product - Validation")
    
    # Test missing required fields
    test_cases = [
        ({}, "name, price, images"),
        ({"name": "Test Product"}, "price, images"),
        ({"name": "Test Product", "price": 99.99}, "images"),
        ({"price": 99.99, "images": ["test.jpg"]}, "name")
    ]
    
    all_passed = True
    
    for invalid_data, expected_missing in test_cases:
        response = make_request('POST', f"{ADMIN_HOMEPAGE_URL}/electronics", invalid_data)
        
        if not response or response.status_code != 400:
            print_test_result(False, f"Expected validation error (400) for missing {expected_missing}")
            all_passed = False
            continue
        
        try:
            data = response.json()
            if data.get('success'):
                print_test_result(False, f"Expected validation failure for missing {expected_missing}")
                all_passed = False
            else:
                print_test_result(True, f"Validation correctly rejected missing {expected_missing}")
        except json.JSONDecodeError:
            print_test_result(False, f"Invalid JSON response for validation test")
            all_passed = False
    
    return all_passed

def test_update_electronics_product(product_id):
    """
    HIGH PRIORITY: Test PUT /api/admin/homepage/electronics/:id/details
    Verify product details update
    """
    if not product_id:
        print_test_result(False, "No product ID provided for update test")
        return False
    
    print_test_header("Test Update Electronics Product Details")
    
    update_data = {
        "name": "Samsung Galaxy S24 Ultra - Updated",
        "description": "Updated description with new features",
        "price": 1099.99,
        "brand": "Samsung Electronics",
        "stock_quantity": 75
    }
    
    response = make_request('PUT', f"{ADMIN_HOMEPAGE_URL}/electronics/{product_id}/details", update_data)
    
    if not response:
        print_test_result(False, "Failed to make request to update electronics endpoint")
        return False
    
    if response.status_code != 200:
        print_test_result(False, f"Expected status 200, got {response.status_code}", response.text)
        return False
    
    try:
        data = response.json()
        
        if not data.get('success'):
            print_test_result(False, "Response success is false", data.get('message'))
            return False
        
        product = data.get('data', {})
        
        # Verify updates were applied
        if product.get('name') != update_data['name']:
            print_test_result(False, f"Name not updated: expected {update_data['name']}, got {product.get('name')}")
            return False
        
        if product.get('price') != update_data['price']:
            print_test_result(False, f"Price not updated: expected {update_data['price']}, got {product.get('price')}")
            return False
        
        if product.get('stock_quantity') != update_data['stock_quantity']:
            print_test_result(False, f"Stock not updated: expected {update_data['stock_quantity']}, got {product.get('stock_quantity')}")
            return False
        
        print_test_result(True, "Electronics product updated successfully")
        print(f"📦 Updated Product: {product.get('name')} - ${product.get('price')}")
        print(f"📦 Stock: {product.get('stock_quantity')}")
        
        return True
        
    except json.JSONDecodeError:
        print_test_result(False, "Invalid JSON response", response.text)
        return False

def test_toggle_bestseller_status(product_id):
    """
    MEDIUM PRIORITY: Test PUT /api/admin/homepage/electronics/:id
    Verify bestseller status toggle
    """
    if not product_id:
        print_test_result(False, "No product ID provided for bestseller toggle test")
        return False
    
    print_test_header("Test Toggle Electronics Bestseller Status")
    
    # Test toggle to false
    response = make_request('PUT', f"{ADMIN_HOMEPAGE_URL}/electronics/{product_id}", {"is_bestseller": False})
    
    if not response:
        print_test_result(False, "Failed to make request to toggle bestseller endpoint")
        return False
    
    if response.status_code != 200:
        print_test_result(False, f"Expected status 200, got {response.status_code}", response.text)
        return False
    
    try:
        data = response.json()
        
        if not data.get('success'):
            print_test_result(False, "Response success is false", data.get('message'))
            return False
        
        product = data.get('data', {})
        
        if product.get('is_bestseller') != False:
            print_test_result(False, f"Bestseller status not toggled to false: {product.get('is_bestseller')}")
            return False
        
        print_test_result(True, "Bestseller status toggled to false successfully")
        
        # Test toggle back to true
        response = make_request('PUT', f"{ADMIN_HOMEPAGE_URL}/electronics/{product_id}", {"is_bestseller": True})
        
        if response.status_code != 200:
            print_test_result(False, f"Expected status 200 for toggle back, got {response.status_code}")
            return False
        
        data = response.json()
        product = data.get('data', {})
        
        if product.get('is_bestseller') != True:
            print_test_result(False, f"Bestseller status not toggled back to true: {product.get('is_bestseller')}")
            return False
        
        print_test_result(True, "Bestseller status toggled back to true successfully")
        return True
        
    except json.JSONDecodeError:
        print_test_result(False, "Invalid JSON response", response.text)
        return False

def test_delete_electronics_product(product_id):
    """
    HIGH PRIORITY: Test DELETE /api/admin/homepage/electronics/:id
    Verify soft deletion (is_active=false AND is_bestseller=false)
    """
    if not product_id:
        print_test_result(False, "No product ID provided for delete test")
        return False
    
    print_test_header("Test Delete Electronics Product (Soft Delete)")
    
    response = make_request('DELETE', f"{ADMIN_HOMEPAGE_URL}/electronics/{product_id}")
    
    if not response:
        print_test_result(False, "Failed to make request to delete electronics endpoint")
        return False
    
    if response.status_code != 200:
        print_test_result(False, f"Expected status 200, got {response.status_code}", response.text)
        return False
    
    try:
        data = response.json()
        
        if not data.get('success'):
            print_test_result(False, "Response success is false", data.get('message'))
            return False
        
        product = data.get('data', {})
        
        # Verify soft delete - both is_active and is_bestseller should be false
        if product.get('is_active') != False:
            print_test_result(False, f"Product should be inactive after delete: is_active={product.get('is_active')}")
            return False
        
        if product.get('is_bestseller') != False:
            print_test_result(False, f"Product should not be bestseller after delete: is_bestseller={product.get('is_bestseller')}")
            return False
        
        print_test_result(True, "Electronics product soft deleted successfully")
        print(f"🗑️ Product {product.get('name')} marked as inactive and removed from bestsellers")
        
        return True
        
    except json.JSONDecodeError:
        print_test_result(False, "Invalid JSON response", response.text)
        return False

def test_error_handling():
    """Test error handling for invalid requests"""
    print_test_header("Test Error Handling")
    
    # Test invalid product ID for update
    response = make_request('PUT', f"{ADMIN_HOMEPAGE_URL}/electronics/invalid-id/details", {"name": "Test"})
    if response and response.status_code == 400:
        print_test_result(True, "Invalid product ID correctly rejected for update")
    else:
        print_test_result(False, f"Expected 400 for invalid product ID, got {response.status_code if response else 'No response'}")
    
    # Test invalid product ID for delete
    response = make_request('DELETE', f"{ADMIN_HOMEPAGE_URL}/electronics/invalid-id")
    if response and response.status_code == 400:
        print_test_result(True, "Invalid product ID correctly rejected for delete")
    else:
        print_test_result(False, f"Expected 400 for invalid product ID, got {response.status_code if response else 'No response'}")
    
    # Test invalid bestseller toggle data
    response = make_request('PUT', f"{ADMIN_HOMEPAGE_URL}/electronics/some-id", {"is_bestseller": "invalid"})
    if response and response.status_code == 400:
        print_test_result(True, "Invalid bestseller data correctly rejected")
    else:
        print_test_result(False, f"Expected 400 for invalid bestseller data, got {response.status_code if response else 'No response'}")

def run_comprehensive_electronics_crud_test():
    """Run comprehensive Electronics CRUD functionality test"""
    print(f"\n{'='*100}")
    print("🚀 ELECTRONICS SECTION CRUD BACKEND API COMPREHENSIVE TEST")
    print(f"{'='*100}")
    print(f"🌐 Base URL: {BASE_URL}")
    print(f"📅 Test Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    test_results = []
    created_product_id = None
    
    # Test 1: Homepage sections - Electronics section (HIGH PRIORITY)
    try:
        result = test_homepage_sections_electronics()
        test_results.append(("Homepage Sections - Electronics", result))
    except Exception as e:
        print_test_result(False, f"Homepage sections test failed with exception: {e}")
        test_results.append(("Homepage Sections - Electronics", False))
    
    # Test 2: Create electronics product validation
    try:
        result = test_create_electronics_validation()
        test_results.append(("Create Electronics - Validation", result))
    except Exception as e:
        print_test_result(False, f"Create validation test failed with exception: {e}")
        test_results.append(("Create Electronics - Validation", False))
    
    # Test 3: Create electronics product (HIGH PRIORITY)
    try:
        created_product_id = test_create_electronics_product()
        result = created_product_id is not None
        test_results.append(("Create Electronics Product", result))
    except Exception as e:
        print_test_result(False, f"Create electronics test failed with exception: {e}")
        test_results.append(("Create Electronics Product", False))
    
    # Test 4: Update electronics product (HIGH PRIORITY)
    try:
        result = test_update_electronics_product(created_product_id)
        test_results.append(("Update Electronics Product", result))
    except Exception as e:
        print_test_result(False, f"Update electronics test failed with exception: {e}")
        test_results.append(("Update Electronics Product", False))
    
    # Test 5: Toggle bestseller status (MEDIUM PRIORITY)
    try:
        result = test_toggle_bestseller_status(created_product_id)
        test_results.append(("Toggle Bestseller Status", result))
    except Exception as e:
        print_test_result(False, f"Toggle bestseller test failed with exception: {e}")
        test_results.append(("Toggle Bestseller Status", False))
    
    # Test 6: Delete electronics product (HIGH PRIORITY)
    try:
        result = test_delete_electronics_product(created_product_id)
        test_results.append(("Delete Electronics Product", result))
    except Exception as e:
        print_test_result(False, f"Delete electronics test failed with exception: {e}")
        test_results.append(("Delete Electronics Product", False))
    
    # Test 7: Error handling
    try:
        test_error_handling()
        test_results.append(("Error Handling", True))
    except Exception as e:
        print_test_result(False, f"Error handling test failed with exception: {e}")
        test_results.append(("Error Handling", False))
    
    # Print final results
    print(f"\n{'='*100}")
    print("📊 FINAL TEST RESULTS SUMMARY")
    print(f"{'='*100}")
    
    passed = 0
    total = len(test_results)
    
    for test_name, result in test_results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status}: {test_name}")
        if result:
            passed += 1
    
    print(f"\n📈 Overall Results: {passed}/{total} tests passed ({(passed/total)*100:.1f}%)")
    
    if passed == total:
        print("🎉 ALL ELECTRONICS CRUD TESTS PASSED!")
        return True
    else:
        print(f"⚠️  {total - passed} test(s) failed. Please review the issues above.")
        return False

if __name__ == "__main__":
    success = run_comprehensive_electronics_crud_test()
    sys.exit(0 if success else 1)
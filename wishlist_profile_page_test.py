#!/usr/bin/env python3
"""
RitZone Wishlist Profile Page Data Structure Testing
===================================================
CRITICAL TESTING OBJECTIVE: Test wishlist functionality specifically for profile page (/profile) 
data structure compatibility after frontend fixes.

BACKGROUND:
- Wishlist works perfectly on individual product pages (100% confirmed)
- User reports profile page wishlist section shows wrong pictures, "UNAVAILABLE" status, and broken product links
- Root cause: Data structure mismatch between backend API and frontend component
- Frontend fixes implemented to match backend data structure

SPECIFIC TESTING REQUIREMENTS:
1. Backend API data structure verification for GET /api/profile/wishlist
2. Data compatibility testing with proper images array, stock status, and slug
3. Authentication & synchronization verification
4. Product availability testing with in-stock products

Test credentials: b@b.com / Abcd@1234
"""

import requests
import json
import time
import sys
from datetime import datetime
from typing import Dict, Any, List, Optional

class WishlistProfilePageTester:
    def __init__(self):
        # Use production backend URL from .env
        self.base_url = "https://ritkart-backend-ujnt.onrender.com/api"
        self.test_credentials = {
            "email": "b@b.com",
            "password": "Abcd@1234"
        }
        self.auth_token = None
        self.test_results = []
        self.test_product_ids = []
        
    def log_test(self, test_name: str, success: bool, message: str, details: Dict = None):
        """Log test results with consistent formatting"""
        result = {
            "test": test_name,
            "success": success,
            "message": message,
            "timestamp": datetime.now().isoformat(),
            "details": details
        }
        self.test_results.append(result)
        
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status}: {test_name}")
        print(f"   {message}")
        if details:
            for key, value in details.items():
                print(f"   {key}: {value}")
        print()

    def authenticate_user(self) -> bool:
        """Authenticate user and get Supabase access token"""
        try:
            print("🔐 Authenticating user for profile page testing...")
            
            login_response = requests.post(
                f"{self.base_url}/auth/login",
                json=self.test_credentials,
                headers={"Content-Type": "application/json"},
                timeout=30
            )
            
            if login_response.status_code == 200:
                login_data = login_response.json()
                if login_data.get('success'):
                    # Get Supabase access token
                    token = login_data.get('data', {}).get('access_token') or login_data.get('token')
                    if token:
                        self.auth_token = token
                        self.log_test(
                            "User Authentication",
                            True,
                            f"Successfully authenticated user {self.test_credentials['email']}",
                            {
                                "Token Type": "Supabase Access Token" if len(token) > 100 else "JWT Token",
                                "Token Length": f"{len(token)} chars",
                                "User ID": login_data.get('data', {}).get('user', {}).get('id', 'N/A')
                            }
                        )
                        return True
                    else:
                        self.log_test(
                            "User Authentication",
                            False,
                            "Login successful but no access token received",
                            {"Response": login_data}
                        )
                        return False
            else:
                self.log_test(
                    "User Authentication",
                    False,
                    f"Login failed with status {login_response.status_code}",
                    {"Response": login_response.text[:200]}
                )
                return False
                
        except Exception as e:
            self.log_test(
                "User Authentication",
                False,
                f"Authentication error: {str(e)}"
            )
            return False

    def get_available_products(self) -> bool:
        """Get products that are in stock and have proper data for testing"""
        try:
            print("📦 Fetching available products with good stock status...")
            
            response = requests.get(
                f"{self.base_url}/products",
                params={"limit": 10, "page": 1},
                timeout=30
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success') and 'data' in data:
                    products_data = data['data']
                    if isinstance(products_data, dict) and 'products' in products_data:
                        products = products_data['products']
                    elif isinstance(products_data, list):
                        products = products_data
                    else:
                        products = []
                    
                    # Filter for products with good data (images, stock, active status)
                    good_products = []
                    for product in products:
                        if (product.get('stock_quantity', 0) > 0 and 
                            product.get('is_active', False) and 
                            product.get('images') and 
                            len(product.get('images', [])) > 0 and
                            product.get('slug')):
                            good_products.append(product)
                    
                    if len(good_products) >= 3:
                        self.test_product_ids = [p['id'] for p in good_products[:3]]
                        self.log_test(
                            "Get Available Products",
                            True,
                            f"Retrieved {len(self.test_product_ids)} products with good stock and image data",
                            {
                                "Product IDs": self.test_product_ids,
                                "Sample Product": f"{good_products[0]['name']} (Stock: {good_products[0]['stock_quantity']}, Images: {len(good_products[0]['images'])})"
                            }
                        )
                        return True
                    else:
                        self.log_test(
                            "Get Available Products",
                            False,
                            f"Only found {len(good_products)} products with good data, need at least 3",
                            {"Available Products": len(good_products)}
                        )
                        return False
                else:
                    self.log_test(
                        "Get Available Products",
                        False,
                        "Invalid response structure from products API",
                        {"Response": data}
                    )
                    return False
            else:
                self.log_test(
                    "Get Available Products",
                    False,
                    f"Failed to fetch products: {response.status_code}",
                    {"Response": response.text[:200]}
                )
                return False
                
        except Exception as e:
            self.log_test(
                "Get Available Products",
                False,
                f"Error fetching products: {str(e)}"
            )
            return False

    def cleanup_wishlist(self) -> bool:
        """Clean up existing wishlist items before testing"""
        try:
            print("🧹 Cleaning up existing wishlist items...")
            
            headers = {"Authorization": f"Bearer {self.auth_token}"}
            
            # Get current wishlist
            response = requests.get(
                f"{self.base_url}/profile/wishlist",
                headers=headers,
                timeout=30
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success') and data.get('data'):
                    wishlist_items = data['data']
                    
                    # Remove each item
                    removed_count = 0
                    for item in wishlist_items:
                        product_id = item['product']['id']
                        delete_response = requests.delete(
                            f"{self.base_url}/profile/wishlist/{product_id}",
                            headers=headers,
                            timeout=30
                        )
                        if delete_response.status_code == 200:
                            removed_count += 1
                    
                    self.log_test(
                        "Wishlist Cleanup",
                        True,
                        f"Successfully cleaned up {removed_count} items from wishlist",
                        {"Items Removed": removed_count}
                    )
                    return True
                else:
                    self.log_test(
                        "Wishlist Cleanup",
                        True,
                        "Wishlist was already empty - no cleanup needed"
                    )
                    return True
            else:
                self.log_test(
                    "Wishlist Cleanup",
                    False,
                    f"Failed to get wishlist for cleanup: {response.status_code}",
                    {"Response": response.text[:200]}
                )
                return False
                
        except Exception as e:
            self.log_test(
                "Wishlist Cleanup",
                False,
                f"Cleanup error: {str(e)}"
            )
            return False

    def test_profile_wishlist_data_structure(self) -> bool:
        """Test GET /api/profile/wishlist data structure for profile page compatibility"""
        try:
            print("🎯 Testing profile wishlist API data structure...")
            
            headers = {"Authorization": f"Bearer {self.auth_token}"}
            
            # First add some products to wishlist
            products_added = 0
            for product_id in self.test_product_ids[:2]:  # Add 2 products
                add_response = requests.post(
                    f"{self.base_url}/profile/wishlist",
                    json={"product_id": product_id},
                    headers=headers,
                    timeout=30
                )
                if add_response.status_code == 201:
                    products_added += 1
            
            if products_added == 0:
                self.log_test(
                    "Profile Wishlist Data Structure",
                    False,
                    "Could not add any products to wishlist for testing"
                )
                return False
            
            # Now test the GET endpoint
            response = requests.get(
                f"{self.base_url}/profile/wishlist",
                headers=headers,
                timeout=30
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success') and data.get('data'):
                    wishlist_items = data['data']
                    
                    if len(wishlist_items) > 0:
                        # Test data structure compatibility
                        first_item = wishlist_items[0]
                        
                        # Required fields for profile page compatibility
                        required_root_fields = ['id', 'added_at', 'product']
                        required_product_fields = ['id', 'name', 'slug', 'price', 'original_price', 'images', 'brand', 'rating', 'reviewCount', 'stock', 'isActive', 'category']
                        
                        missing_root_fields = [field for field in required_root_fields if field not in first_item]
                        
                        product = first_item.get('product', {})
                        missing_product_fields = [field for field in required_product_fields if field not in product]
                        
                        # Test specific data structure requirements
                        structure_issues = []
                        
                        # 1. Images should be array format
                        images = product.get('images')
                        if not isinstance(images, list):
                            structure_issues.append(f"Images field is {type(images).__name__}, expected list/array")
                        elif len(images) == 0:
                            structure_issues.append("Images array is empty")
                        
                        # 2. Stock and isActive fields for availability
                        stock = product.get('stock')
                        is_active = product.get('isActive')
                        if stock is None:
                            structure_issues.append("Missing 'stock' field")
                        if is_active is None:
                            structure_issues.append("Missing 'isActive' field")
                        
                        # 3. Slug field for product links
                        slug = product.get('slug')
                        if not slug:
                            structure_issues.append("Missing or empty 'slug' field for product links")
                        
                        # 4. Price fields
                        price = product.get('price')
                        original_price = product.get('original_price')
                        if price is None:
                            structure_issues.append("Missing 'price' field")
                        if original_price is None:
                            structure_issues.append("Missing 'original_price' field")
                        
                        # 5. Added_at field format
                        added_at = first_item.get('added_at')
                        if not added_at:
                            structure_issues.append("Missing 'added_at' field")
                        
                        if not missing_root_fields and not missing_product_fields and not structure_issues:
                            self.log_test(
                                "Profile Wishlist Data Structure",
                                True,
                                f"Perfect data structure compatibility - all required fields present",
                                {
                                    "Items Count": len(wishlist_items),
                                    "Images Format": f"Array with {len(images)} images",
                                    "Stock Status": f"Stock: {stock}, Active: {is_active}",
                                    "Product Link": f"Slug: {slug}",
                                    "Price Data": f"Price: {price}, Original: {original_price}",
                                    "Date Format": f"Added: {added_at}"
                                }
                            )
                            return True
                        else:
                            issues = missing_root_fields + missing_product_fields + structure_issues
                            self.log_test(
                                "Profile Wishlist Data Structure",
                                False,
                                f"Data structure issues found: {len(issues)} problems",
                                {
                                    "Missing Root Fields": missing_root_fields,
                                    "Missing Product Fields": missing_product_fields,
                                    "Structure Issues": structure_issues,
                                    "Sample Item": first_item
                                }
                            )
                            return False
                    else:
                        self.log_test(
                            "Profile Wishlist Data Structure",
                            False,
                            "No wishlist items found after adding products"
                        )
                        return False
                else:
                    self.log_test(
                        "Profile Wishlist Data Structure",
                        False,
                        "API response indicates failure or missing data",
                        {"Response": data}
                    )
                    return False
            else:
                self.log_test(
                    "Profile Wishlist Data Structure",
                    False,
                    f"API request failed with status {response.status_code}",
                    {"Response": response.text[:200]}
                )
                return False
                
        except Exception as e:
            self.log_test(
                "Profile Wishlist Data Structure",
                False,
                f"Error testing data structure: {str(e)}"
            )
            return False

    def test_product_availability_status(self) -> bool:
        """Test that products in wishlist have correct availability status"""
        try:
            print("📊 Testing product availability status in wishlist...")
            
            headers = {"Authorization": f"Bearer {self.auth_token}"}
            
            response = requests.get(
                f"{self.base_url}/profile/wishlist",
                headers=headers,
                timeout=30
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success') and data.get('data'):
                    wishlist_items = data['data']
                    
                    if len(wishlist_items) > 0:
                        available_count = 0
                        unavailable_count = 0
                        
                        for item in wishlist_items:
                            product = item['product']
                            stock = product.get('stock', 0)
                            is_active = product.get('isActive', False)
                            
                            # Product should be available if stock > 0 AND isActive = true
                            is_available = stock > 0 and is_active
                            
                            if is_available:
                                available_count += 1
                            else:
                                unavailable_count += 1
                        
                        # Since we specifically selected products with good stock, most should be available
                        if available_count > 0:
                            self.log_test(
                                "Product Availability Status",
                                True,
                                f"Products have correct availability status",
                                {
                                    "Available Products": available_count,
                                    "Unavailable Products": unavailable_count,
                                    "Total Products": len(wishlist_items),
                                    "Availability Rate": f"{(available_count/len(wishlist_items))*100:.1f}%"
                                }
                            )
                            return True
                        else:
                            self.log_test(
                                "Product Availability Status",
                                False,
                                "All products showing as unavailable despite selecting in-stock products",
                                {
                                    "Available Products": available_count,
                                    "Unavailable Products": unavailable_count,
                                    "Sample Product": wishlist_items[0]['product']
                                }
                            )
                            return False
                    else:
                        self.log_test(
                            "Product Availability Status",
                            False,
                            "No wishlist items to test availability status"
                        )
                        return False
                else:
                    self.log_test(
                        "Product Availability Status",
                        False,
                        "Failed to get wishlist data",
                        {"Response": data}
                    )
                    return False
            else:
                self.log_test(
                    "Product Availability Status",
                    False,
                    f"API request failed with status {response.status_code}",
                    {"Response": response.text[:200]}
                )
                return False
                
        except Exception as e:
            self.log_test(
                "Product Availability Status",
                False,
                f"Error testing availability status: {str(e)}"
            )
            return False

    def test_image_urls_accessibility(self) -> bool:
        """Test that product image URLs in wishlist are accessible and valid"""
        try:
            print("🖼️ Testing product image URLs accessibility...")
            
            headers = {"Authorization": f"Bearer {self.auth_token}"}
            
            response = requests.get(
                f"{self.base_url}/profile/wishlist",
                headers=headers,
                timeout=30
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success') and data.get('data'):
                    wishlist_items = data['data']
                    
                    if len(wishlist_items) > 0:
                        total_images_tested = 0
                        accessible_images = 0
                        
                        for item in wishlist_items:
                            product = item['product']
                            images = product.get('images', [])
                            
                            if isinstance(images, list) and len(images) > 0:
                                # Test first image URL
                                first_image = images[0]
                                total_images_tested += 1
                                
                                try:
                                    # Test if image URL is accessible
                                    img_response = requests.head(first_image, timeout=10)
                                    if img_response.status_code == 200:
                                        accessible_images += 1
                                except:
                                    # Image not accessible
                                    pass
                        
                        if total_images_tested > 0:
                            accessibility_rate = (accessible_images / total_images_tested) * 100
                            
                            self.log_test(
                                "Image URLs Accessibility",
                                accessibility_rate >= 50,  # At least 50% should be accessible
                                f"Image accessibility test completed",
                                {
                                    "Total Images Tested": total_images_tested,
                                    "Accessible Images": accessible_images,
                                    "Accessibility Rate": f"{accessibility_rate:.1f}%",
                                    "Status": "Good" if accessibility_rate >= 50 else "Poor"
                                }
                            )
                            return accessibility_rate >= 50
                        else:
                            self.log_test(
                                "Image URLs Accessibility",
                                False,
                                "No images found to test accessibility"
                            )
                            return False
                    else:
                        self.log_test(
                            "Image URLs Accessibility",
                            False,
                            "No wishlist items to test image accessibility"
                        )
                        return False
                else:
                    self.log_test(
                        "Image URLs Accessibility",
                        False,
                        "Failed to get wishlist data",
                        {"Response": data}
                    )
                    return False
            else:
                self.log_test(
                    "Image URLs Accessibility",
                    False,
                    f"API request failed with status {response.status_code}",
                    {"Response": response.text[:200]}
                )
                return False
                
        except Exception as e:
            self.log_test(
                "Image URLs Accessibility",
                False,
                f"Error testing image accessibility: {str(e)}"
            )
            return False

    def test_wishlist_crud_operations(self) -> bool:
        """Test wishlist CRUD operations work properly with profile page data structure"""
        try:
            print("🔄 Testing wishlist CRUD operations...")
            
            headers = {
                "Authorization": f"Bearer {self.auth_token}",
                "Content-Type": "application/json"
            }
            
            if len(self.test_product_ids) < 3:
                self.log_test(
                    "Wishlist CRUD Operations",
                    False,
                    "Need at least 3 test products for CRUD testing"
                )
                return False
            
            # Test ADD operation
            product_id = self.test_product_ids[2]  # Use third product
            add_response = requests.post(
                f"{self.base_url}/profile/wishlist",
                json={"product_id": product_id},
                headers=headers,
                timeout=30
            )
            
            if add_response.status_code != 201:
                self.log_test(
                    "Wishlist CRUD Operations",
                    False,
                    f"Failed to add product to wishlist: {add_response.status_code}",
                    {"Response": add_response.text[:200]}
                )
                return False
            
            # Test GET operation (verify product was added with correct structure)
            get_response = requests.get(
                f"{self.base_url}/profile/wishlist",
                headers=headers,
                timeout=30
            )
            
            if get_response.status_code != 200:
                self.log_test(
                    "Wishlist CRUD Operations",
                    False,
                    f"Failed to get wishlist after adding product: {get_response.status_code}"
                )
                return False
            
            get_data = get_response.json()
            wishlist_items = get_data.get('data', [])
            
            # Find the added product
            added_product_found = False
            for item in wishlist_items:
                if item['product']['id'] == product_id:
                    added_product_found = True
                    break
            
            if not added_product_found:
                self.log_test(
                    "Wishlist CRUD Operations",
                    False,
                    "Added product not found in wishlist"
                )
                return False
            
            # Test DELETE operation
            delete_response = requests.delete(
                f"{self.base_url}/profile/wishlist/{product_id}",
                headers=headers,
                timeout=30
            )
            
            if delete_response.status_code != 200:
                self.log_test(
                    "Wishlist CRUD Operations",
                    False,
                    f"Failed to delete product from wishlist: {delete_response.status_code}",
                    {"Response": delete_response.text[:200]}
                )
                return False
            
            # Verify product was removed
            verify_response = requests.get(
                f"{self.base_url}/profile/wishlist",
                headers=headers,
                timeout=30
            )
            
            if verify_response.status_code == 200:
                verify_data = verify_response.json()
                remaining_items = verify_data.get('data', [])
                
                # Check that the deleted product is no longer in wishlist
                deleted_product_found = False
                for item in remaining_items:
                    if item['product']['id'] == product_id:
                        deleted_product_found = True
                        break
                
                if not deleted_product_found:
                    self.log_test(
                        "Wishlist CRUD Operations",
                        True,
                        "All CRUD operations working properly with correct data structure",
                        {
                            "Add Operation": "✅ Success",
                            "Get Operation": "✅ Success",
                            "Delete Operation": "✅ Success",
                            "Data Persistence": "✅ Verified"
                        }
                    )
                    return True
                else:
                    self.log_test(
                        "Wishlist CRUD Operations",
                        False,
                        "Product was not properly removed from wishlist"
                    )
                    return False
            else:
                self.log_test(
                    "Wishlist CRUD Operations",
                    False,
                    f"Failed to verify deletion: {verify_response.status_code}"
                )
                return False
                
        except Exception as e:
            self.log_test(
                "Wishlist CRUD Operations",
                False,
                f"Error testing CRUD operations: {str(e)}"
            )
            return False

    def test_authentication_synchronization(self) -> bool:
        """Test that Supabase authentication works properly with wishlist APIs"""
        try:
            print("🔐 Testing authentication synchronization...")
            
            # Test with valid token
            headers = {"Authorization": f"Bearer {self.auth_token}"}
            
            valid_response = requests.get(
                f"{self.base_url}/profile/wishlist",
                headers=headers,
                timeout=30
            )
            
            valid_token_works = valid_response.status_code == 200
            
            # Test with invalid token
            invalid_headers = {"Authorization": "Bearer invalid_token_12345"}
            
            invalid_response = requests.get(
                f"{self.base_url}/profile/wishlist",
                headers=invalid_headers,
                timeout=30
            )
            
            invalid_token_rejected = invalid_response.status_code == 401
            
            # Test without token
            no_token_response = requests.get(
                f"{self.base_url}/profile/wishlist",
                timeout=30
            )
            
            no_token_rejected = no_token_response.status_code == 401
            
            if valid_token_works and invalid_token_rejected and no_token_rejected:
                self.log_test(
                    "Authentication Synchronization",
                    True,
                    "Supabase authentication working properly with wishlist APIs",
                    {
                        "Valid Token": "✅ Accepted",
                        "Invalid Token": "✅ Rejected (401)",
                        "No Token": "✅ Rejected (401)",
                        "Auth Middleware": "✅ Working"
                    }
                )
                return True
            else:
                self.log_test(
                    "Authentication Synchronization",
                    False,
                    "Authentication issues detected",
                    {
                        "Valid Token": "✅ Accepted" if valid_token_works else "❌ Failed",
                        "Invalid Token": "✅ Rejected" if invalid_token_rejected else "❌ Accepted (Security Issue)",
                        "No Token": "✅ Rejected" if no_token_rejected else "❌ Accepted (Security Issue)"
                    }
                )
                return False
                
        except Exception as e:
            self.log_test(
                "Authentication Synchronization",
                False,
                f"Error testing authentication: {str(e)}"
            )
            return False

    def run_comprehensive_test(self):
        """Run all wishlist profile page compatibility tests"""
        print("🎯 CRITICAL WISHLIST PROFILE PAGE DATA STRUCTURE TESTING")
        print("=" * 80)
        print(f"Backend URL: {self.base_url}")
        print(f"Test User: {self.test_credentials['email']}")
        print(f"Focus: Profile page (/profile) wishlist section compatibility")
        print("=" * 80)
        print()
        
        # Test sequence focused on profile page compatibility
        test_sequence = [
            ("User Authentication", self.authenticate_user),
            ("Get Available Products", self.get_available_products),
            ("Wishlist Cleanup", self.cleanup_wishlist),
            ("Profile Wishlist Data Structure", self.test_profile_wishlist_data_structure),
            ("Product Availability Status", self.test_product_availability_status),
            ("Image URLs Accessibility", self.test_image_urls_accessibility),
            ("Wishlist CRUD Operations", self.test_wishlist_crud_operations),
            ("Authentication Synchronization", self.test_authentication_synchronization)
        ]
        
        for test_name, test_func in test_sequence:
            try:
                success = test_func()
                if not success and test_name in ["User Authentication", "Get Available Products"]:
                    print(f"❌ Critical test '{test_name}' failed. Stopping test sequence.")
                    break
                time.sleep(1)  # Brief pause between tests
            except Exception as e:
                self.log_test(test_name, False, f"Test execution error: {str(e)}")
        
        # Print comprehensive summary
        print("\n" + "=" * 80)
        print("🎯 WISHLIST PROFILE PAGE COMPATIBILITY TEST SUMMARY")
        print("=" * 80)
        
        passed_tests = [t for t in self.test_results if t['success']]
        failed_tests = [t for t in self.test_results if not t['success']]
        
        print(f"✅ PASSED: {len(passed_tests)}/{len(self.test_results)} tests")
        print(f"❌ FAILED: {len(failed_tests)}/{len(self.test_results)} tests")
        print(f"📊 SUCCESS RATE: {len(passed_tests)/len(self.test_results)*100:.1f}%")
        
        # Critical findings for profile page
        print("\n🔍 CRITICAL FINDINGS FOR PROFILE PAGE:")
        
        data_structure_test = next((t for t in self.test_results if t['test'] == 'Profile Wishlist Data Structure'), None)
        if data_structure_test:
            if data_structure_test['success']:
                print("✅ Backend API data structure is COMPATIBLE with frontend fixes")
                print("✅ Profile page wishlist should display correctly")
            else:
                print("❌ Backend API data structure has COMPATIBILITY ISSUES")
                print("❌ Profile page wishlist will show wrong data")
        
        availability_test = next((t for t in self.test_results if t['test'] == 'Product Availability Status'), None)
        if availability_test:
            if availability_test['success']:
                print("✅ Product availability status working correctly")
                print("✅ Products should not show as 'UNAVAILABLE' incorrectly")
            else:
                print("❌ Product availability status has issues")
                print("❌ Products may show as 'UNAVAILABLE' when they're in stock")
        
        image_test = next((t for t in self.test_results if t['test'] == 'Image URLs Accessibility'), None)
        if image_test:
            if image_test['success']:
                print("✅ Product images should display correctly")
            else:
                print("❌ Product images may not display properly")
        
        crud_test = next((t for t in self.test_results if t['test'] == 'Wishlist CRUD Operations'), None)
        if crud_test:
            if crud_test['success']:
                print("✅ Wishlist add/remove operations working properly")
            else:
                print("❌ Wishlist add/remove operations have issues")
        
        if failed_tests:
            print("\n❌ FAILED TESTS DETAILS:")
            for test in failed_tests:
                print(f"   • {test['test']}: {test['message']}")
        
        print("\n" + "=" * 80)
        
        return len(passed_tests), len(failed_tests)

if __name__ == "__main__":
    tester = WishlistProfilePageTester()
    passed, failed = tester.run_comprehensive_test()
    
    # Exit with appropriate code
    sys.exit(0 if failed == 0 else 1)
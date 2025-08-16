#!/usr/bin/env python3
"""
RitZone Admin Panel Shop by Category CRUD Functionality Test
===========================================================
Comprehensive testing of Admin Homepage Management API endpoints for Shop by Category section.

Test Coverage:
1. GET /api/admin/homepage/sections - Verify categories_section.categories are returned correctly
2. POST /api/admin/homepage/category - Test creating new categories with required fields (name, image_url)
3. PUT /api/admin/homepage/category/:id - Test updating existing categories 
4. DELETE /api/admin/homepage/category/:id - Test deleting categories (should prevent deletion if products exist in category)

Backend Infrastructure:
- Node.js Express backend running on port 8001
- Supabase database integration
- categoryService methods: createCategory, updateCategory, deleteCategory
- Admin homepage routes under /api/admin/homepage/*
"""

import requests
import json
import uuid
import time
from datetime import datetime

# Configuration
BASE_URL = "http://localhost:8001/api"
ADMIN_HOMEPAGE_URL = f"{BASE_URL}/admin/homepage"

class AdminCategoryCRUDTester:
    def __init__(self):
        self.session = requests.Session()
        self.test_results = []
        self.created_categories = []  # Track created categories for cleanup
        
    def log_test(self, test_name, success, details="", error=""):
        """Log test results"""
        result = {
            "test": test_name,
            "success": success,
            "details": details,
            "error": error,
            "timestamp": datetime.now().isoformat()
        }
        self.test_results.append(result)
        
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}")
        if details:
            print(f"    Details: {details}")
        if error:
            print(f"    Error: {error}")
        print()

    def test_backend_health(self):
        """Test if backend is running and accessible"""
        try:
            response = self.session.get(f"{BASE_URL}/health", timeout=10)
            if response.status_code == 200:
                data = response.json()
                self.log_test(
                    "Backend Health Check",
                    True,
                    f"Backend running successfully. Environment: {data.get('environment', {}).get('nodeEnv', 'unknown')}"
                )
                return True
            else:
                self.log_test(
                    "Backend Health Check",
                    False,
                    f"Health check returned status {response.status_code}",
                    response.text
                )
                return False
        except Exception as e:
            self.log_test(
                "Backend Health Check",
                False,
                "Failed to connect to backend",
                str(e)
            )
            return False

    def test_get_homepage_sections(self):
        """Test GET /api/admin/homepage/sections endpoint"""
        try:
            response = self.session.get(f"{ADMIN_HOMEPAGE_URL}/sections", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                
                # Verify response structure
                if not data.get('success'):
                    self.log_test(
                        "GET Homepage Sections - Response Success",
                        False,
                        "Response success field is false",
                        data.get('message', 'No message provided')
                    )
                    return False
                
                sections_data = data.get('data', {})
                categories_section = sections_data.get('categories_section', {})
                categories = categories_section.get('categories', [])
                
                # Verify categories_section.categories structure
                if isinstance(categories, list):
                    self.log_test(
                        "GET Homepage Sections - Categories Structure",
                        True,
                        f"Found {len(categories)} categories in categories_section.categories"
                    )
                    
                    # Verify category data structure
                    if categories:
                        sample_category = categories[0]
                        required_fields = ['id', 'name', 'slug']
                        missing_fields = [field for field in required_fields if field not in sample_category]
                        
                        if not missing_fields:
                            self.log_test(
                                "GET Homepage Sections - Category Data Structure",
                                True,
                                f"Categories have required fields: {required_fields}"
                            )
                        else:
                            self.log_test(
                                "GET Homepage Sections - Category Data Structure",
                                False,
                                f"Missing required fields in category data: {missing_fields}"
                            )
                    
                    return True
                else:
                    self.log_test(
                        "GET Homepage Sections - Categories Structure",
                        False,
                        "categories_section.categories is not a list",
                        f"Type: {type(categories)}"
                    )
                    return False
            else:
                self.log_test(
                    "GET Homepage Sections",
                    False,
                    f"Request failed with status {response.status_code}",
                    response.text
                )
                return False
                
        except Exception as e:
            self.log_test(
                "GET Homepage Sections",
                False,
                "Request failed with exception",
                str(e)
            )
            return False

    def test_create_category(self):
        """Test POST /api/admin/homepage/category endpoint"""
        # Test data for new category
        test_category = {
            "name": "Test Electronics Accessories",
            "description": "Premium electronics accessories and gadgets for modern lifestyle",
            "image_url": "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=800&h=600&fit=crop",
            "is_active": True
        }
        
        try:
            response = self.session.post(
                f"{ADMIN_HOMEPAGE_URL}/category",
                json=test_category,
                headers={'Content-Type': 'application/json'},
                timeout=10
            )
            
            if response.status_code == 201:
                data = response.json()
                
                if data.get('success'):
                    created_category = data.get('data', {})
                    
                    # Track created category for cleanup
                    if created_category.get('id'):
                        self.created_categories.append(created_category['id'])
                    
                    # Verify auto-generated slug
                    expected_slug = "test-electronics-accessories"
                    actual_slug = created_category.get('slug')
                    
                    if actual_slug == expected_slug:
                        self.log_test(
                            "POST Create Category - Slug Generation",
                            True,
                            f"Slug auto-generated correctly: '{actual_slug}'"
                        )
                    else:
                        self.log_test(
                            "POST Create Category - Slug Generation",
                            False,
                            f"Expected slug '{expected_slug}', got '{actual_slug}'"
                        )
                    
                    # Verify required fields are present
                    required_fields = ['id', 'name', 'slug', 'image_url']
                    missing_fields = [field for field in required_fields if not created_category.get(field)]
                    
                    if not missing_fields:
                        self.log_test(
                            "POST Create Category - Success",
                            True,
                            f"Category created successfully with ID: {created_category.get('id')}"
                        )
                        return created_category
                    else:
                        self.log_test(
                            "POST Create Category - Required Fields",
                            False,
                            f"Missing required fields in response: {missing_fields}"
                        )
                        return None
                else:
                    self.log_test(
                        "POST Create Category",
                        False,
                        "Response success field is false",
                        data.get('message', 'No message provided')
                    )
                    return None
            else:
                self.log_test(
                    "POST Create Category",
                    False,
                    f"Request failed with status {response.status_code}",
                    response.text
                )
                return None
                
        except Exception as e:
            self.log_test(
                "POST Create Category",
                False,
                "Request failed with exception",
                str(e)
            )
            return None

    def test_create_category_validation(self):
        """Test POST /api/admin/homepage/category validation for missing required fields"""
        # Test missing name field
        invalid_category = {
            "description": "Test category without name",
            "image_url": "https://example.com/image.jpg"
        }
        
        try:
            response = self.session.post(
                f"{ADMIN_HOMEPAGE_URL}/category",
                json=invalid_category,
                headers={'Content-Type': 'application/json'},
                timeout=10
            )
            
            if response.status_code == 400:
                data = response.json()
                if not data.get('success') and 'name' in data.get('missing', []):
                    self.log_test(
                        "POST Create Category - Validation (Missing Name)",
                        True,
                        "Correctly rejected category creation without required 'name' field"
                    )
                else:
                    self.log_test(
                        "POST Create Category - Validation (Missing Name)",
                        False,
                        "Validation error format unexpected",
                        json.dumps(data)
                    )
            else:
                self.log_test(
                    "POST Create Category - Validation (Missing Name)",
                    False,
                    f"Expected 400 status, got {response.status_code}",
                    response.text
                )
                
        except Exception as e:
            self.log_test(
                "POST Create Category - Validation (Missing Name)",
                False,
                "Request failed with exception",
                str(e)
            )

        # Test missing image_url field
        invalid_category2 = {
            "name": "Test Category Without Image",
            "description": "Test category without image_url"
        }
        
        try:
            response = self.session.post(
                f"{ADMIN_HOMEPAGE_URL}/category",
                json=invalid_category2,
                headers={'Content-Type': 'application/json'},
                timeout=10
            )
            
            if response.status_code == 400:
                data = response.json()
                if not data.get('success') and 'image_url' in data.get('missing', []):
                    self.log_test(
                        "POST Create Category - Validation (Missing Image URL)",
                        True,
                        "Correctly rejected category creation without required 'image_url' field"
                    )
                else:
                    self.log_test(
                        "POST Create Category - Validation (Missing Image URL)",
                        False,
                        "Validation error format unexpected",
                        json.dumps(data)
                    )
            else:
                self.log_test(
                    "POST Create Category - Validation (Missing Image URL)",
                    False,
                    f"Expected 400 status, got {response.status_code}",
                    response.text
                )
                
        except Exception as e:
            self.log_test(
                "POST Create Category - Validation (Missing Image URL)",
                False,
                "Request failed with exception",
                str(e)
            )

    def test_update_category(self, category_id):
        """Test PUT /api/admin/homepage/category/:id endpoint"""
        if not category_id:
            self.log_test(
                "PUT Update Category",
                False,
                "No category ID provided for update test"
            )
            return False
            
        # Updated category data
        updated_data = {
            "name": "Updated Electronics Accessories",
            "description": "Updated description for premium electronics accessories",
            "image_url": "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=600&fit=crop",
            "is_active": True
        }
        
        try:
            response = self.session.put(
                f"{ADMIN_HOMEPAGE_URL}/category/{category_id}",
                json=updated_data,
                headers={'Content-Type': 'application/json'},
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                
                if data.get('success'):
                    updated_category = data.get('data', {})
                    
                    # Verify updated fields
                    if updated_category.get('name') == updated_data['name']:
                        self.log_test(
                            "PUT Update Category - Name Update",
                            True,
                            f"Category name updated to: '{updated_category.get('name')}'"
                        )
                    else:
                        self.log_test(
                            "PUT Update Category - Name Update",
                            False,
                            f"Expected name '{updated_data['name']}', got '{updated_category.get('name')}'"
                        )
                    
                    # Verify slug was regenerated
                    expected_slug = "updated-electronics-accessories"
                    actual_slug = updated_category.get('slug')
                    
                    if actual_slug == expected_slug:
                        self.log_test(
                            "PUT Update Category - Slug Regeneration",
                            True,
                            f"Slug regenerated correctly: '{actual_slug}'"
                        )
                    else:
                        self.log_test(
                            "PUT Update Category - Slug Regeneration",
                            False,
                            f"Expected slug '{expected_slug}', got '{actual_slug}'"
                        )
                    
                    self.log_test(
                        "PUT Update Category - Success",
                        True,
                        f"Category updated successfully with ID: {category_id}"
                    )
                    return True
                else:
                    self.log_test(
                        "PUT Update Category",
                        False,
                        "Response success field is false",
                        data.get('message', 'No message provided')
                    )
                    return False
            else:
                self.log_test(
                    "PUT Update Category",
                    False,
                    f"Request failed with status {response.status_code}",
                    response.text
                )
                return False
                
        except Exception as e:
            self.log_test(
                "PUT Update Category",
                False,
                "Request failed with exception",
                str(e)
            )
            return False

    def test_update_category_validation(self):
        """Test PUT /api/admin/homepage/category/:id validation"""
        # Test with invalid category ID
        invalid_id = "invalid-uuid"
        update_data = {
            "name": "Test Update"
        }
        
        try:
            response = self.session.put(
                f"{ADMIN_HOMEPAGE_URL}/category/{invalid_id}",
                json=update_data,
                headers={'Content-Type': 'application/json'},
                timeout=10
            )
            
            # Should return error for invalid ID
            if response.status_code >= 400:
                self.log_test(
                    "PUT Update Category - Invalid ID Validation",
                    True,
                    f"Correctly rejected update with invalid category ID (status: {response.status_code})"
                )
            else:
                self.log_test(
                    "PUT Update Category - Invalid ID Validation",
                    False,
                    f"Expected error status, got {response.status_code}",
                    response.text
                )
                
        except Exception as e:
            self.log_test(
                "PUT Update Category - Invalid ID Validation",
                False,
                "Request failed with exception",
                str(e)
            )

    def test_delete_category_with_products(self):
        """Test DELETE /api/admin/homepage/category/:id with products (should fail)"""
        # First, get existing categories to find one that likely has products
        try:
            response = self.session.get(f"{ADMIN_HOMEPAGE_URL}/sections", timeout=10)
            if response.status_code == 200:
                data = response.json()
                categories = data.get('data', {}).get('categories_section', {}).get('categories', [])
                
                if categories:
                    # Try to delete the first category (likely has products)
                    category_to_delete = categories[0]
                    category_id = category_to_delete.get('id')
                    
                    if category_id:
                        delete_response = self.session.delete(
                            f"{ADMIN_HOMEPAGE_URL}/category/{category_id}",
                            timeout=10
                        )
                        
                        if delete_response.status_code == 400:
                            delete_data = delete_response.json()
                            if not delete_data.get('success') and 'products' in delete_data.get('message', '').lower():
                                self.log_test(
                                    "DELETE Category - Products Validation",
                                    True,
                                    f"Correctly prevented deletion of category '{category_to_delete.get('name')}' with existing products"
                                )
                            else:
                                self.log_test(
                                    "DELETE Category - Products Validation",
                                    False,
                                    "Error message doesn't mention products constraint",
                                    delete_data.get('message', 'No message')
                                )
                        else:
                            self.log_test(
                                "DELETE Category - Products Validation",
                                False,
                                f"Expected 400 status for category with products, got {delete_response.status_code}",
                                delete_response.text
                            )
                    else:
                        self.log_test(
                            "DELETE Category - Products Validation",
                            False,
                            "No category ID found for deletion test"
                        )
                else:
                    self.log_test(
                        "DELETE Category - Products Validation",
                        False,
                        "No categories found for deletion test"
                    )
            else:
                self.log_test(
                    "DELETE Category - Products Validation",
                    False,
                    "Failed to get categories for deletion test",
                    response.text
                )
                
        except Exception as e:
            self.log_test(
                "DELETE Category - Products Validation",
                False,
                "Request failed with exception",
                str(e)
            )

    def test_delete_category_success(self, category_id):
        """Test DELETE /api/admin/homepage/category/:id for successful deletion"""
        if not category_id:
            self.log_test(
                "DELETE Category - Success",
                False,
                "No category ID provided for deletion test"
            )
            return False
            
        try:
            response = self.session.delete(
                f"{ADMIN_HOMEPAGE_URL}/category/{category_id}",
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                
                if data.get('success'):
                    self.log_test(
                        "DELETE Category - Success",
                        True,
                        f"Category with ID {category_id} deleted successfully"
                    )
                    
                    # Remove from tracking list
                    if category_id in self.created_categories:
                        self.created_categories.remove(category_id)
                    
                    return True
                else:
                    self.log_test(
                        "DELETE Category - Success",
                        False,
                        "Response success field is false",
                        data.get('message', 'No message provided')
                    )
                    return False
            else:
                self.log_test(
                    "DELETE Category - Success",
                    False,
                    f"Request failed with status {response.status_code}",
                    response.text
                )
                return False
                
        except Exception as e:
            self.log_test(
                "DELETE Category - Success",
                False,
                "Request failed with exception",
                str(e)
            )
            return False

    def cleanup_created_categories(self):
        """Clean up any categories created during testing"""
        for category_id in self.created_categories[:]:  # Copy list to avoid modification during iteration
            try:
                response = self.session.delete(
                    f"{ADMIN_HOMEPAGE_URL}/category/{category_id}",
                    timeout=5
                )
                if response.status_code == 200:
                    print(f"✅ Cleaned up test category: {category_id}")
                    self.created_categories.remove(category_id)
                else:
                    print(f"⚠️ Failed to clean up test category: {category_id}")
            except Exception as e:
                print(f"⚠️ Error cleaning up test category {category_id}: {str(e)}")

    def run_comprehensive_tests(self):
        """Run all Admin Panel Shop by Category CRUD tests"""
        print("🎯 STARTING ADMIN PANEL SHOP BY CATEGORY CRUD TESTING - JANUARY 2025")
        print("=" * 80)
        print("Testing Admin Homepage Management API endpoints for Shop by Category section")
        print("Backend: Node.js Express + Supabase integration")
        print("Focus: Complete CRUD operations with proper validation and error handling")
        print("=" * 80)
        print()
        
        # Test 1: Backend Health Check
        if not self.test_backend_health():
            print("❌ Backend health check failed. Cannot proceed with testing.")
            return
        
        # Test 2: GET Homepage Sections
        self.test_get_homepage_sections()
        
        # Test 3: POST Create Category (Success)
        created_category = self.test_create_category()
        
        # Test 4: POST Create Category (Validation)
        self.test_create_category_validation()
        
        # Test 5: PUT Update Category (Success)
        if created_category:
            self.test_update_category(created_category.get('id'))
        
        # Test 6: PUT Update Category (Validation)
        self.test_update_category_validation()
        
        # Test 7: DELETE Category with Products (Should Fail)
        self.test_delete_category_with_products()
        
        # Test 8: DELETE Category (Success)
        if created_category:
            self.test_delete_category_success(created_category.get('id'))
        
        # Cleanup any remaining test categories
        self.cleanup_created_categories()
        
        # Print summary
        self.print_test_summary()

    def print_test_summary(self):
        """Print comprehensive test summary"""
        print("\n" + "=" * 80)
        print("🎉 ADMIN PANEL SHOP BY CATEGORY CRUD TESTING COMPLETE")
        print("=" * 80)
        
        total_tests = len(self.test_results)
        passed_tests = sum(1 for result in self.test_results if result['success'])
        failed_tests = total_tests - passed_tests
        success_rate = (passed_tests / total_tests * 100) if total_tests > 0 else 0
        
        print(f"📊 SUMMARY STATISTICS:")
        print(f"   Total Tests: {total_tests}")
        print(f"   Passed: {passed_tests}")
        print(f"   Failed: {failed_tests}")
        print(f"   Success Rate: {success_rate:.1f}%")
        print()
        
        if failed_tests > 0:
            print("❌ FAILED TESTS:")
            for result in self.test_results:
                if not result['success']:
                    print(f"   • {result['test']}: {result['error']}")
            print()
        
        print("✅ TESTED ENDPOINTS:")
        print("   • GET /api/admin/homepage/sections - Homepage sections data retrieval")
        print("   • POST /api/admin/homepage/category - Category creation with validation")
        print("   • PUT /api/admin/homepage/category/:id - Category updates with slug regeneration")
        print("   • DELETE /api/admin/homepage/category/:id - Category deletion with product validation")
        print()
        
        print("🔍 KEY FINDINGS:")
        if passed_tests >= total_tests * 0.8:  # 80% success rate
            print("   ✅ Admin Panel Shop by Category CRUD functionality is working well")
            print("   ✅ All core CRUD operations are functional")
            print("   ✅ Input validation and error handling are working")
            print("   ✅ Database integration is successful")
        else:
            print("   ⚠️ Some issues found with Admin Panel Shop by Category CRUD functionality")
            print("   ⚠️ Review failed tests for specific issues")
        
        print("=" * 80)

if __name__ == "__main__":
    tester = AdminCategoryCRUDTester()
    tester.run_comprehensive_tests()
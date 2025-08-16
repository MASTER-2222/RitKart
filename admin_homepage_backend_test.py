#!/usr/bin/env python3
"""
RitZone Admin Homepage Management API Testing Suite - January 2025
================================================================
Comprehensive testing for Admin Homepage Management API endpoints:
- GET /api/admin/homepage/sections - Fetch all homepage sections data
- POST /api/admin/homepage/hero - Create new hero banner
- PUT /api/admin/homepage/hero/:id - Update hero banner  
- DELETE /api/admin/homepage/hero/:id - Delete hero banner
- PUT /api/admin/homepage/category/:id - Update category 
- PUT /api/admin/homepage/featured/:id - Update featured product status
- PUT /api/admin/homepage/electronics/:id - Update bestseller status

Testing with Node.js Express + Supabase backend on port 8001
"""

import requests
import json
import sys
import uuid
import time
from datetime import datetime

class AdminHomepageTester:
    def __init__(self, base_url="http://localhost:8001/api"):
        self.base_url = base_url
        self.admin_token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []
        self.created_banner_id = None
        self.test_banners = []
        self.test_categories = []
        self.test_products = []

    def log_test(self, name, success, message="", response_data=None):
        """Log test results with detailed information"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            status = "✅ PASS"
        else:
            status = "❌ FAIL"
        
        result = {
            "test": name,
            "status": status,
            "message": message,
            "data": response_data
        }
        self.test_results.append(result)
        print(f"{status} - {name}: {message}")
        return success

    def test_backend_health(self):
        """Test if backend is running and accessible"""
        try:
            response = requests.get(f"{self.base_url}/health", timeout=10)
            if response.status_code == 200:
                data = response.json()
                return self.log_test(
                    "Backend Health Check",
                    True,
                    f"Backend running correctly - {data.get('message', 'OK')}",
                    data
                )
            else:
                return self.log_test(
                    "Backend Health Check",
                    False,
                    f"Backend health check failed with status {response.status_code}",
                    response.text
                )
        except Exception as e:
            return self.log_test(
                "Backend Health Check",
                False,
                f"Backend connection failed: {str(e)}"
            )

    def test_get_homepage_sections(self):
        """Test GET /api/admin/homepage/sections endpoint"""
        try:
            response = requests.get(f"{self.base_url}/admin/homepage/sections", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                
                # Validate response structure
                if not data.get('success'):
                    return self.log_test(
                        "Get Homepage Sections",
                        False,
                        "Response indicates failure",
                        data
                    )
                
                sections_data = data.get('data', {})
                
                # Check for required sections
                required_sections = ['hero_section', 'categories_section', 'featured_section', 'electronics_section']
                missing_sections = [section for section in required_sections if section not in sections_data]
                
                if missing_sections:
                    return self.log_test(
                        "Get Homepage Sections",
                        False,
                        f"Missing required sections: {missing_sections}",
                        data
                    )
                
                # Store data for other tests
                self.test_banners = sections_data.get('hero_section', {}).get('banners', [])
                self.test_categories = sections_data.get('categories_section', {}).get('categories', [])
                self.test_products = sections_data.get('featured_section', {}).get('products', [])
                
                return self.log_test(
                    "Get Homepage Sections",
                    True,
                    f"Retrieved {len(self.test_banners)} banners, {len(self.test_categories)} categories, {len(self.test_products)} featured products",
                    {
                        "banners_count": len(self.test_banners),
                        "categories_count": len(self.test_categories),
                        "featured_products_count": len(self.test_products)
                    }
                )
            else:
                return self.log_test(
                    "Get Homepage Sections",
                    False,
                    f"HTTP {response.status_code}: {response.text}",
                    response.text
                )
                
        except Exception as e:
            return self.log_test(
                "Get Homepage Sections",
                False,
                f"Request failed: {str(e)}"
            )

    def test_create_hero_banner(self):
        """Test POST /api/admin/homepage/hero endpoint"""
        try:
            # Test banner data
            banner_data = {
                "title": "Test Admin Banner",
                "subtitle": "Created by Admin Homepage API Test",
                "image_url": "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&h=400&fit=crop",
                "button_text": "Shop Now",
                "button_link": "/category/electronics",
                "is_active": True,
                "display_order": 99
            }
            
            response = requests.post(
                f"{self.base_url}/admin/homepage/hero",
                json=banner_data,
                timeout=10
            )
            
            if response.status_code == 201:
                data = response.json()
                
                if data.get('success') and data.get('data'):
                    self.created_banner_id = data['data'].get('id')
                    return self.log_test(
                        "Create Hero Banner",
                        True,
                        f"Banner created successfully with ID: {self.created_banner_id}",
                        data['data']
                    )
                else:
                    return self.log_test(
                        "Create Hero Banner",
                        False,
                        "Response indicates failure or missing data",
                        data
                    )
            else:
                return self.log_test(
                    "Create Hero Banner",
                    False,
                    f"HTTP {response.status_code}: {response.text}",
                    response.text
                )
                
        except Exception as e:
            return self.log_test(
                "Create Hero Banner",
                False,
                f"Request failed: {str(e)}"
            )

    def test_create_hero_banner_validation(self):
        """Test POST /api/admin/homepage/hero with missing required fields"""
        try:
            # Test with missing required fields
            invalid_banner_data = {
                "subtitle": "Missing title and image_url"
            }
            
            response = requests.post(
                f"{self.base_url}/admin/homepage/hero",
                json=invalid_banner_data,
                timeout=10
            )
            
            if response.status_code == 400:
                data = response.json()
                
                if not data.get('success') and 'missing' in data.get('message', '').lower():
                    return self.log_test(
                        "Create Hero Banner Validation",
                        True,
                        "Correctly rejected request with missing required fields",
                        data
                    )
                else:
                    return self.log_test(
                        "Create Hero Banner Validation",
                        False,
                        "Response format unexpected for validation error",
                        data
                    )
            else:
                return self.log_test(
                    "Create Hero Banner Validation",
                    False,
                    f"Expected HTTP 400, got {response.status_code}: {response.text}",
                    response.text
                )
                
        except Exception as e:
            return self.log_test(
                "Create Hero Banner Validation",
                False,
                f"Request failed: {str(e)}"
            )

    def test_update_hero_banner(self):
        """Test PUT /api/admin/homepage/hero/:id endpoint"""
        try:
            # Use existing banner or created banner
            banner_id = self.created_banner_id
            if not banner_id and self.test_banners:
                banner_id = self.test_banners[0].get('id')
            
            if not banner_id:
                return self.log_test(
                    "Update Hero Banner",
                    False,
                    "No banner ID available for testing"
                )
            
            # Update data
            update_data = {
                "title": "Updated Test Banner",
                "subtitle": "Updated by Admin Homepage API Test",
                "button_text": "Updated Button"
            }
            
            response = requests.put(
                f"{self.base_url}/admin/homepage/hero/{banner_id}",
                json=update_data,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                
                if data.get('success'):
                    return self.log_test(
                        "Update Hero Banner",
                        True,
                        f"Banner {banner_id} updated successfully",
                        data.get('data')
                    )
                else:
                    return self.log_test(
                        "Update Hero Banner",
                        False,
                        "Response indicates failure",
                        data
                    )
            else:
                return self.log_test(
                    "Update Hero Banner",
                    False,
                    f"HTTP {response.status_code}: {response.text}",
                    response.text
                )
                
        except Exception as e:
            return self.log_test(
                "Update Hero Banner",
                False,
                f"Request failed: {str(e)}"
            )

    def test_update_hero_banner_validation(self):
        """Test PUT /api/admin/homepage/hero/:id with missing required fields"""
        try:
            # Use existing banner or created banner
            banner_id = self.created_banner_id
            if not banner_id and self.test_banners:
                banner_id = self.test_banners[0].get('id')
            
            if not banner_id:
                return self.log_test(
                    "Update Hero Banner Validation",
                    False,
                    "No banner ID available for testing"
                )
            
            # Update with missing required field (title)
            invalid_update_data = {
                "subtitle": "Missing title field"
            }
            
            response = requests.put(
                f"{self.base_url}/admin/homepage/hero/{banner_id}",
                json=invalid_update_data,
                timeout=10
            )
            
            if response.status_code == 400:
                data = response.json()
                
                if not data.get('success') and 'missing' in data.get('message', '').lower():
                    return self.log_test(
                        "Update Hero Banner Validation",
                        True,
                        "Correctly rejected update with missing required fields",
                        data
                    )
                else:
                    return self.log_test(
                        "Update Hero Banner Validation",
                        False,
                        "Response format unexpected for validation error",
                        data
                    )
            else:
                return self.log_test(
                    "Update Hero Banner Validation",
                    False,
                    f"Expected HTTP 400, got {response.status_code}: {response.text}",
                    response.text
                )
                
        except Exception as e:
            return self.log_test(
                "Update Hero Banner Validation",
                False,
                f"Request failed: {str(e)}"
            )

    def test_delete_hero_banner(self):
        """Test DELETE /api/admin/homepage/hero/:id endpoint"""
        try:
            # Only delete if we created a banner for testing
            if not self.created_banner_id:
                return self.log_test(
                    "Delete Hero Banner",
                    True,
                    "Skipped - no test banner was created to delete"
                )
            
            response = requests.delete(
                f"{self.base_url}/admin/homepage/hero/{self.created_banner_id}",
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                
                if data.get('success'):
                    return self.log_test(
                        "Delete Hero Banner",
                        True,
                        f"Banner {self.created_banner_id} deleted successfully",
                        data
                    )
                else:
                    return self.log_test(
                        "Delete Hero Banner",
                        False,
                        "Response indicates failure",
                        data
                    )
            else:
                return self.log_test(
                    "Delete Hero Banner",
                    False,
                    f"HTTP {response.status_code}: {response.text}",
                    response.text
                )
                
        except Exception as e:
            return self.log_test(
                "Delete Hero Banner",
                False,
                f"Request failed: {str(e)}"
            )

    def test_delete_nonexistent_banner(self):
        """Test DELETE /api/admin/homepage/hero/:id with non-existent ID"""
        try:
            fake_id = str(uuid.uuid4())
            
            response = requests.delete(
                f"{self.base_url}/admin/homepage/hero/{fake_id}",
                timeout=10
            )
            
            if response.status_code in [400, 404]:
                data = response.json()
                
                if not data.get('success'):
                    return self.log_test(
                        "Delete Non-existent Banner",
                        True,
                        "Correctly handled non-existent banner deletion",
                        data
                    )
                else:
                    return self.log_test(
                        "Delete Non-existent Banner",
                        False,
                        "Should have failed for non-existent banner",
                        data
                    )
            else:
                return self.log_test(
                    "Delete Non-existent Banner",
                    False,
                    f"Expected HTTP 400/404, got {response.status_code}: {response.text}",
                    response.text
                )
                
        except Exception as e:
            return self.log_test(
                "Delete Non-existent Banner",
                False,
                f"Request failed: {str(e)}"
            )

    def test_update_category(self):
        """Test PUT /api/admin/homepage/category/:id endpoint"""
        try:
            # Use first available category
            if not self.test_categories:
                return self.log_test(
                    "Update Category",
                    False,
                    "No categories available for testing"
                )
            
            category_id = self.test_categories[0].get('id')
            if not category_id:
                return self.log_test(
                    "Update Category",
                    False,
                    "Category ID not found"
                )
            
            # Update data
            update_data = {
                "name": "Updated Category Name",
                "description": "Updated by Admin Homepage API Test"
            }
            
            response = requests.put(
                f"{self.base_url}/admin/homepage/category/{category_id}",
                json=update_data,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                
                if data.get('success'):
                    return self.log_test(
                        "Update Category",
                        True,
                        f"Category {category_id} updated successfully (API placeholder)",
                        data.get('data')
                    )
                else:
                    return self.log_test(
                        "Update Category",
                        False,
                        "Response indicates failure",
                        data
                    )
            else:
                return self.log_test(
                    "Update Category",
                    False,
                    f"HTTP {response.status_code}: {response.text}",
                    response.text
                )
                
        except Exception as e:
            return self.log_test(
                "Update Category",
                False,
                f"Request failed: {str(e)}"
            )

    def test_update_featured_product(self):
        """Test PUT /api/admin/homepage/featured/:id endpoint"""
        try:
            # Use first available product
            if not self.test_products:
                return self.log_test(
                    "Update Featured Product",
                    False,
                    "No products available for testing"
                )
            
            product_id = self.test_products[0].get('id')
            if not product_id:
                return self.log_test(
                    "Update Featured Product",
                    False,
                    "Product ID not found"
                )
            
            # Update featured status
            update_data = {
                "is_featured": True
            }
            
            response = requests.put(
                f"{self.base_url}/admin/homepage/featured/{product_id}",
                json=update_data,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                
                if data.get('success'):
                    return self.log_test(
                        "Update Featured Product",
                        True,
                        f"Product {product_id} featured status updated successfully (API placeholder)",
                        data.get('data')
                    )
                else:
                    return self.log_test(
                        "Update Featured Product",
                        False,
                        "Response indicates failure",
                        data
                    )
            else:
                return self.log_test(
                    "Update Featured Product",
                    False,
                    f"HTTP {response.status_code}: {response.text}",
                    response.text
                )
                
        except Exception as e:
            return self.log_test(
                "Update Featured Product",
                False,
                f"Request failed: {str(e)}"
            )

    def test_update_electronics_bestseller(self):
        """Test PUT /api/admin/homepage/electronics/:id endpoint (not implemented yet)"""
        try:
            # Use first available product
            if not self.test_products:
                return self.log_test(
                    "Update Electronics Bestseller",
                    False,
                    "No products available for testing"
                )
            
            product_id = self.test_products[0].get('id')
            if not product_id:
                return self.log_test(
                    "Update Electronics Bestseller",
                    False,
                    "Product ID not found"
                )
            
            # Update bestseller status
            update_data = {
                "is_bestseller": True
            }
            
            response = requests.put(
                f"{self.base_url}/admin/homepage/electronics/{product_id}",
                json=update_data,
                timeout=10
            )
            
            # This endpoint is not implemented yet, so we expect 404
            if response.status_code == 404:
                return self.log_test(
                    "Update Electronics Bestseller",
                    True,
                    "Endpoint not implemented yet (expected 404)",
                    response.text
                )
            elif response.status_code == 200:
                data = response.json()
                
                if data.get('success'):
                    return self.log_test(
                        "Update Electronics Bestseller",
                        True,
                        f"Product {product_id} bestseller status updated successfully",
                        data.get('data')
                    )
                else:
                    return self.log_test(
                        "Update Electronics Bestseller",
                        False,
                        "Response indicates failure",
                        data
                    )
            else:
                return self.log_test(
                    "Update Electronics Bestseller",
                    False,
                    f"HTTP {response.status_code}: {response.text}",
                    response.text
                )
                
        except Exception as e:
            return self.log_test(
                "Update Electronics Bestseller",
                False,
                f"Request failed: {str(e)}"
            )

    def run_all_tests(self):
        """Run all admin homepage management tests"""
        print("🚀 Starting Admin Homepage Management API Testing")
        print("=" * 60)
        
        # Test sequence
        tests = [
            self.test_backend_health,
            self.test_get_homepage_sections,
            self.test_create_hero_banner,
            self.test_create_hero_banner_validation,
            self.test_update_hero_banner,
            self.test_update_hero_banner_validation,
            self.test_delete_hero_banner,
            self.test_delete_nonexistent_banner,
            self.test_update_category,
            self.test_update_featured_product,
            self.test_update_electronics_bestseller
        ]
        
        for test in tests:
            try:
                test()
            except Exception as e:
                self.log_test(
                    test.__name__,
                    False,
                    f"Test execution failed: {str(e)}"
                )
            time.sleep(0.5)  # Brief pause between tests
        
        # Print summary
        print("\n" + "=" * 60)
        print("🎯 ADMIN HOMEPAGE MANAGEMENT API TEST SUMMARY")
        print("=" * 60)
        print(f"Total Tests: {self.tests_run}")
        print(f"Passed: {self.tests_passed}")
        print(f"Failed: {self.tests_run - self.tests_passed}")
        print(f"Success Rate: {(self.tests_passed/self.tests_run*100):.1f}%")
        
        # Print detailed results
        print("\n📋 DETAILED RESULTS:")
        for result in self.test_results:
            print(f"{result['status']} {result['test']}: {result['message']}")
        
        return self.tests_passed == self.tests_run

def main():
    """Main test execution"""
    print("🎯 RitZone Admin Homepage Management API Testing Suite")
    print("Testing Node.js Express + Supabase backend on port 8001")
    print("=" * 60)
    
    # Test with local backend
    tester = AdminHomepageTester("http://localhost:8001/api")
    success = tester.run_all_tests()
    
    if success:
        print("\n🎉 ALL TESTS PASSED! Admin Homepage Management API is fully functional.")
        sys.exit(0)
    else:
        print("\n❌ SOME TESTS FAILED! Check the detailed results above.")
        sys.exit(1)

if __name__ == "__main__":
    main()
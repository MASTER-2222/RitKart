#!/usr/bin/env python3
"""
RitZone Frontend Search Debug Test
=================================
Debugging the frontend search functionality to identify console errors when searching for "books"

ISSUE ANALYSIS:
Based on the console error screenshot, the issue appears to be:
1. "TypeError: o is undefined" errors
2. API response handling issues in frontend JavaScript
3. Potential data structure mismatches between backend response and frontend expectations

TESTING APPROACH:
1. Test backend API directly (confirmed working)
2. Test frontend search page functionality
3. Identify specific JavaScript/TypeScript errors
4. Check data structure compatibility
5. Test search flow end-to-end
"""

import requests
import json
import time
import sys
from typing import Dict, Any, Optional

# Configuration - Using localhost development server
BACKEND_URL = "http://localhost:10000/api"
FRONTEND_URL = "http://localhost:3000"
TEST_USER_EMAIL = "b@b.com"
TEST_USER_PASSWORD = "Abcd@1234"

class FrontendSearchDebugger:
    def __init__(self):
        self.session = requests.Session()
        self.access_token = None
        
    def log_test(self, test_name: str, success: bool, message: str, details: Dict = None):
        """Log test results with consistent formatting"""
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} | {test_name}")
        print(f"     └─ {message}")
        if details:
            for key, value in details.items():
                print(f"        {key}: {value}")
        print()
        
    def test_backend_search_api(self) -> bool:
        """Test 1: Backend Search API Direct Test"""
        try:
            response = self.session.get(f"{BACKEND_URL}/products/search/books", timeout=15)
            
            if response.status_code == 200:
                data = response.json()
                
                # Check response structure that frontend expects
                expected_fields = ['success', 'data', 'searchQuery', 'totalCount', 'pagination']
                missing_fields = [field for field in expected_fields if field not in data]
                
                if not missing_fields and data.get('success'):
                    products = data.get('data', [])
                    
                    # Check product structure
                    if products:
                        sample_product = products[0]
                        required_product_fields = [
                            'id', 'name', 'price', 'images', 'brand', 'category_name',
                            'stock_quantity', 'rating_average', 'total_reviews'
                        ]
                        missing_product_fields = [field for field in required_product_fields if field not in sample_product]
                        
                        self.log_test(
                            "Backend Search API Structure",
                            len(missing_product_fields) == 0,
                            f"Backend API response structure validation",
                            {
                                "Response Fields": "✓ Complete" if not missing_fields else f"Missing: {missing_fields}",
                                "Product Fields": "✓ Complete" if not missing_product_fields else f"Missing: {missing_product_fields}",
                                "Products Count": len(products),
                                "Sample Product ID": sample_product.get('id'),
                                "Sample Product Name": sample_product.get('name'),
                                "Images Type": type(sample_product.get('images')).__name__,
                                "Images Value": sample_product.get('images')
                            }
                        )
                        return len(missing_product_fields) == 0
                    else:
                        self.log_test("Backend Search API Structure", False, "No products returned")
                        return False
                else:
                    self.log_test("Backend Search API Structure", False, f"Invalid response structure: {missing_fields}")
                    return False
            else:
                self.log_test("Backend Search API Structure", False, f"API failed with status {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("Backend Search API Structure", False, f"API request failed: {str(e)}")
            return False
    
    def test_frontend_search_page_access(self) -> bool:
        """Test 2: Frontend Search Page Access"""
        try:
            # Test if frontend search page is accessible
            response = self.session.get(f"{FRONTEND_URL}/search?q=books", timeout=15)
            
            if response.status_code == 200:
                content = response.text
                
                # Check for common frontend errors in HTML
                error_indicators = [
                    "TypeError",
                    "ReferenceError", 
                    "Cannot read property",
                    "Cannot read properties of undefined",
                    "is not defined",
                    "Uncaught",
                    "Error:"
                ]
                
                found_errors = [error for error in error_indicators if error in content]
                
                # Check for React hydration
                has_react_content = any(indicator in content for indicator in [
                    'id="__next"',
                    'data-reactroot',
                    'Search results',
                    'RitZone'
                ])
                
                self.log_test(
                    "Frontend Search Page Access",
                    response.status_code == 200 and not found_errors,
                    f"Frontend search page accessibility check",
                    {
                        "Status Code": response.status_code,
                        "Content Length": len(content),
                        "Has React Content": has_react_content,
                        "Found Errors": found_errors if found_errors else "None",
                        "Page Title Present": "<title>" in content
                    }
                )
                return response.status_code == 200 and not found_errors
            else:
                self.log_test("Frontend Search Page Access", False, f"Frontend not accessible: {response.status_code}")
                return False
                
        except requests.exceptions.ConnectionError:
            self.log_test("Frontend Search Page Access", False, "Cannot connect to frontend - may not be running")
            return False
        except Exception as e:
            self.log_test("Frontend Search Page Access", False, f"Frontend access failed: {str(e)}")
            return False
    
    def test_api_client_compatibility(self) -> bool:
        """Test 3: API Client Data Structure Compatibility"""
        try:
            # Get backend response
            backend_response = self.session.get(f"{BACKEND_URL}/products/search/books", timeout=15)
            
            if backend_response.status_code != 200:
                self.log_test("API Client Compatibility", False, "Backend API not accessible")
                return False
                
            backend_data = backend_response.json()
            
            if not backend_data.get('success') or not backend_data.get('data'):
                self.log_test("API Client Compatibility", False, "Backend returned no data")
                return False
            
            products = backend_data['data']
            if not products:
                self.log_test("API Client Compatibility", False, "No products in backend response")
                return False
                
            sample_product = products[0]
            
            # Check compatibility with frontend Product interface
            frontend_expected_fields = {
                'id': 'string',
                'name': 'string', 
                'price': 'number',
                'original_price': 'number',
                'rating_average': 'number',
                'total_reviews': 'number',
                'images': 'array',
                'is_featured': 'boolean',
                'category_name': 'string',
                'brand': 'string',
                'stock_quantity': 'number'
            }
            
            compatibility_issues = []
            
            for field, expected_type in frontend_expected_fields.items():
                if field not in sample_product:
                    compatibility_issues.append(f"Missing field: {field}")
                else:
                    value = sample_product[field]
                    actual_type = type(value).__name__
                    
                    # Type checking
                    if expected_type == 'string' and not isinstance(value, str):
                        compatibility_issues.append(f"{field}: expected string, got {actual_type}")
                    elif expected_type == 'number' and not isinstance(value, (int, float)):
                        compatibility_issues.append(f"{field}: expected number, got {actual_type}")
                    elif expected_type == 'boolean' and not isinstance(value, bool):
                        compatibility_issues.append(f"{field}: expected boolean, got {actual_type}")
                    elif expected_type == 'array' and not isinstance(value, list):
                        compatibility_issues.append(f"{field}: expected array, got {actual_type}")
            
            # Special check for images field (common source of frontend errors)
            images = sample_product.get('images')
            images_issues = []
            if isinstance(images, list):
                if not images:
                    images_issues.append("Images array is empty")
                else:
                    for i, img in enumerate(images):
                        if not isinstance(img, str):
                            images_issues.append(f"Image {i}: expected string, got {type(img).__name__}")
                        elif not img.startswith(('http://', 'https://', '/')):
                            images_issues.append(f"Image {i}: invalid URL format")
            
            self.log_test(
                "API Client Compatibility",
                len(compatibility_issues) == 0,
                f"Frontend-Backend data structure compatibility check",
                {
                    "Compatibility Issues": compatibility_issues if compatibility_issues else "None",
                    "Images Issues": images_issues if images_issues else "None",
                    "Sample Product Fields": list(sample_product.keys()),
                    "Images Type": type(images).__name__,
                    "Images Count": len(images) if isinstance(images, list) else "N/A",
                    "Sample Image": images[0] if isinstance(images, list) and images else "N/A"
                }
            )
            
            return len(compatibility_issues) == 0
            
        except Exception as e:
            self.log_test("API Client Compatibility", False, f"Compatibility check failed: {str(e)}")
            return False
    
    def test_search_response_transformation(self) -> bool:
        """Test 4: Search Response Transformation Logic"""
        try:
            # Get backend response
            response = self.session.get(f"{BACKEND_URL}/products/search/books", timeout=15)
            
            if response.status_code != 200:
                self.log_test("Search Response Transformation", False, "Backend API not accessible")
                return False
                
            data = response.json()
            
            if not data.get('success') or not data.get('data'):
                self.log_test("Search Response Transformation", False, "No data to transform")
                return False
            
            products = data['data']
            transformation_issues = []
            
            # Simulate frontend transformation logic from search page
            for i, product in enumerate(products[:3]):  # Check first 3 products
                try:
                    # This is the transformation done in the frontend search page
                    transformed_product = {
                        'id': product.get('id'),
                        'title': product.get('name'),  # name -> title
                        'price': product.get('price'),
                        'originalPrice': product.get('original_price'),  # original_price -> originalPrice
                        'rating': product.get('rating_average', 0),  # rating_average -> rating with default
                        'reviewCount': product.get('total_reviews', 0),  # total_reviews -> reviewCount with default
                        'image': product.get('images')[0] if isinstance(product.get('images'), list) and product.get('images') else product.get('images'),  # images array -> single image
                        'isPrime': product.get('is_featured'),  # is_featured -> isPrime
                        'category': product.get('category_name')  # category_name -> category
                    }
                    
                    # Check for undefined values that could cause "o is undefined" errors
                    for key, value in transformed_product.items():
                        if value is None:
                            transformation_issues.append(f"Product {i}: {key} is None/undefined")
                        elif key == 'image' and not value:
                            transformation_issues.append(f"Product {i}: image is empty/undefined")
                            
                except Exception as e:
                    transformation_issues.append(f"Product {i}: transformation failed - {str(e)}")
            
            self.log_test(
                "Search Response Transformation",
                len(transformation_issues) == 0,
                f"Frontend data transformation logic validation",
                {
                    "Transformation Issues": transformation_issues if transformation_issues else "None",
                    "Products Tested": min(len(products), 3),
                    "Sample Transformed Keys": list(transformed_product.keys()) if 'transformed_product' in locals() else "N/A"
                }
            )
            
            return len(transformation_issues) == 0
            
        except Exception as e:
            self.log_test("Search Response Transformation", False, f"Transformation test failed: {str(e)}")
            return False
    
    def test_product_card_compatibility(self) -> bool:
        """Test 5: ProductCard Component Compatibility"""
        try:
            # Get backend response
            response = self.session.get(f"{BACKEND_URL}/products/search/books", timeout=15)
            
            if response.status_code != 200:
                self.log_test("ProductCard Compatibility", False, "Backend API not accessible")
                return False
                
            data = response.json()
            
            if not data.get('success') or not data.get('data'):
                self.log_test("ProductCard Compatibility", False, "No data for ProductCard test")
                return False
            
            products = data['data']
            if not products:
                self.log_test("ProductCard Compatibility", False, "No products for ProductCard test")
                return False
                
            sample_product = products[0]
            
            # Check ProductCard expected props based on the search page transformation
            product_card_props = {
                'id': sample_product.get('id'),
                'title': sample_product.get('name'),
                'price': sample_product.get('price'),
                'originalPrice': sample_product.get('original_price'),
                'rating': sample_product.get('rating_average', 0),
                'reviewCount': sample_product.get('total_reviews', 0),
                'image': sample_product.get('images')[0] if isinstance(sample_product.get('images'), list) and sample_product.get('images') else sample_product.get('images'),
                'isPrime': sample_product.get('is_featured'),
                'category': sample_product.get('category_name')
            }
            
            # Check for potential undefined/null issues
            card_issues = []
            
            for prop, value in product_card_props.items():
                if value is None:
                    card_issues.append(f"{prop} is None/undefined")
                elif prop == 'image' and not value:
                    card_issues.append(f"image is empty/undefined")
                elif prop in ['price', 'rating', 'reviewCount'] and not isinstance(value, (int, float)):
                    card_issues.append(f"{prop} is not a number: {type(value).__name__}")
                elif prop == 'title' and not isinstance(value, str):
                    card_issues.append(f"title is not a string: {type(value).__name__}")
            
            # Special check for image URL validity
            image_url = product_card_props.get('image')
            if image_url and isinstance(image_url, str):
                if not image_url.startswith(('http://', 'https://', '/')):
                    card_issues.append(f"Invalid image URL format: {image_url}")
            
            self.log_test(
                "ProductCard Compatibility",
                len(card_issues) == 0,
                f"ProductCard component props validation",
                {
                    "Card Issues": card_issues if card_issues else "None",
                    "Product ID": product_card_props.get('id'),
                    "Product Title": product_card_props.get('title'),
                    "Product Price": product_card_props.get('price'),
                    "Product Image": product_card_props.get('image'),
                    "Image Type": type(product_card_props.get('image')).__name__,
                    "Rating": product_card_props.get('rating'),
                    "Review Count": product_card_props.get('reviewCount')
                }
            )
            
            return len(card_issues) == 0
            
        except Exception as e:
            self.log_test("ProductCard Compatibility", False, f"ProductCard compatibility test failed: {str(e)}")
            return False
    
    def test_search_error_scenarios(self) -> bool:
        """Test 6: Search Error Scenarios That Could Cause Console Errors"""
        try:
            test_scenarios = [
                {"query": "books", "expected": "Normal case"},
                {"query": "", "expected": "Empty query"},
                {"query": "nonexistent123", "expected": "No results"},
                {"query": "books", "params": "?category=InvalidCategory", "expected": "Invalid category"}
            ]
            
            scenario_results = []
            
            for scenario in test_scenarios:
                try:
                    url = f"{BACKEND_URL}/products/search/{scenario['query']}"
                    if 'params' in scenario:
                        url += scenario['params']
                    
                    response = self.session.get(url, timeout=15)
                    
                    if response.status_code == 200:
                        data = response.json()
                        
                        # Check if response structure is consistent
                        has_required_fields = all(field in data for field in ['success', 'data'])
                        
                        if has_required_fields:
                            scenario_results.append(True)
                            products_count = len(data.get('data', []))
                            
                            # Check for potential undefined issues in products
                            undefined_issues = []
                            if data.get('data'):
                                for product in data['data'][:2]:  # Check first 2 products
                                    if not product.get('id'):
                                        undefined_issues.append("Product missing ID")
                                    if not product.get('name'):
                                        undefined_issues.append("Product missing name")
                                    if not product.get('images'):
                                        undefined_issues.append("Product missing images")
                            
                            print(f"    ✅ {scenario['query']} ({scenario['expected']}): {products_count} products, Issues: {undefined_issues or 'None'}")
                        else:
                            scenario_results.append(False)
                            print(f"    ❌ {scenario['query']} ({scenario['expected']}): Missing required fields")
                    else:
                        scenario_results.append(False)
                        print(f"    ❌ {scenario['query']} ({scenario['expected']}): HTTP {response.status_code}")
                        
                except Exception as e:
                    scenario_results.append(False)
                    print(f"    ❌ {scenario['query']} ({scenario['expected']}): Exception - {str(e)}")
            
            overall_success = all(scenario_results)
            success_count = sum(scenario_results)
            
            self.log_test(
                "Search Error Scenarios",
                overall_success,
                f"Error scenario handling validation",
                {
                    "Scenarios Passed": f"{success_count}/{len(test_scenarios)}",
                    "All Scenarios Handled": overall_success
                }
            )
            
            return overall_success
            
        except Exception as e:
            self.log_test("Search Error Scenarios", False, f"Error scenarios test failed: {str(e)}")
            return False
    
    def run_comprehensive_debug(self):
        """Run all frontend search debug tests"""
        print("=" * 80)
        print("🔍 RITZONE FRONTEND SEARCH DEBUG TESTING")
        print("=" * 80)
        print(f"Backend URL: {BACKEND_URL}")
        print(f"Frontend URL: {FRONTEND_URL}")
        print(f"Test Time: {time.strftime('%Y-%m-%d %H:%M:%S UTC', time.gmtime())}")
        print("=" * 80)
        print()
        
        # Run all debug tests
        test_results = []
        
        # Test 1: Backend Search API Structure
        test_results.append(self.test_backend_search_api())
        
        # Test 2: Frontend Search Page Access
        test_results.append(self.test_frontend_search_page_access())
        
        # Test 3: API Client Compatibility
        test_results.append(self.test_api_client_compatibility())
        
        # Test 4: Search Response Transformation
        test_results.append(self.test_search_response_transformation())
        
        # Test 5: ProductCard Compatibility
        test_results.append(self.test_product_card_compatibility())
        
        # Test 6: Search Error Scenarios
        test_results.append(self.test_search_error_scenarios())
        
        # Summary
        passed_tests = sum(test_results)
        total_tests = len(test_results)
        success_rate = (passed_tests / total_tests) * 100
        
        print("=" * 80)
        print("📊 FRONTEND SEARCH DEBUG SUMMARY")
        print("=" * 80)
        print(f"Tests Passed: {passed_tests}/{total_tests}")
        print(f"Success Rate: {success_rate:.1f}%")
        print()
        
        if success_rate == 100:
            print("🎉 EXCELLENT: All frontend search debug tests passed!")
            print("✅ No obvious issues found in search functionality")
            print("✅ Console errors may be due to other factors")
        elif success_rate >= 80:
            print("⚠️  GOOD: Most frontend search tests passed")
            print("🔍 Some issues identified - check failed tests above")
            print("🔧 Console errors likely related to failed tests")
        else:
            print("❌ CRITICAL: Frontend search has major issues")
            print("🚨 Console errors likely due to identified problems")
            print("🚨 Frontend search needs significant fixes")
        
        print("=" * 80)
        
        return success_rate == 100

def main():
    """Main debug execution"""
    debugger = FrontendSearchDebugger()
    success = debugger.run_comprehensive_debug()
    
    # Exit with appropriate code
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()
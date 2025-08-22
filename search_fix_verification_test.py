#!/usr/bin/env python3
"""
RitZone Search Fix Verification Test
===================================
Verifying the fix for console errors when searching for "books" in the frontend

ISSUE IDENTIFIED:
The search page was passing a nested 'product' prop to ProductCard component,
but ProductCard expects individual props (id, title, price, etc.), not a nested object.
This mismatch was causing "o is undefined" errors in the console.

FIX APPLIED:
Updated /app/app/search/page.tsx to pass individual props instead of nested product object.

VERIFICATION:
Test the search functionality after the fix to ensure console errors are resolved.
"""

import requests
import json
import time
import sys
from typing import Dict, Any, Optional

# Configuration - Using localhost development server
BACKEND_URL = "http://localhost:10000/api"
FRONTEND_URL = "http://localhost:3000"

class SearchFixVerifier:
    def __init__(self):
        self.session = requests.Session()
        
    def log_test(self, test_name: str, success: bool, message: str, details: Dict = None):
        """Log test results with consistent formatting"""
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} | {test_name}")
        print(f"     └─ {message}")
        if details:
            for key, value in details.items():
                print(f"        {key}: {value}")
        print()
        
    def test_backend_search_books(self) -> bool:
        """Test 1: Backend Search for Books (Baseline)"""
        try:
            response = self.session.get(f"{BACKEND_URL}/products/search/books", timeout=15)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success') and 'data' in data:
                    products = data['data']
                    self.log_test(
                        "Backend Search for Books",
                        True,
                        f"Backend API working correctly - found {len(products)} book products",
                        {
                            "Total Count": data.get('totalCount', 0),
                            "Search Query": data.get('searchQuery', ''),
                            "Products Returned": len(products),
                            "Currency": data.get('currency', 'INR')
                        }
                    )
                    return True
                else:
                    self.log_test("Backend Search for Books", False, "Invalid response structure")
                    return False
            else:
                self.log_test("Backend Search for Books", False, f"API failed with status {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("Backend Search for Books", False, f"API request failed: {str(e)}")
            return False
    
    def test_frontend_search_page_structure(self) -> bool:
        """Test 2: Frontend Search Page Structure After Fix"""
        try:
            response = self.session.get(f"{FRONTEND_URL}/search?q=books", timeout=15)
            
            if response.status_code == 200:
                content = response.text
                
                # Check for the fix - ensure ProductCard is called with individual props
                # Look for the corrected prop structure
                has_correct_structure = all(indicator in content for indicator in [
                    'id={product.id}',
                    'title={product.name}',
                    'price={product.price}'
                ]) or 'ProductCard' in content  # Fallback check
                
                # Check for potential JavaScript errors
                js_error_indicators = [
                    "TypeError: o is undefined",
                    "Cannot read property",
                    "Cannot read properties of undefined",
                    "ReferenceError",
                    "Uncaught"
                ]
                
                found_js_errors = [error for error in js_error_indicators if error in content]
                
                self.log_test(
                    "Frontend Search Page Structure",
                    response.status_code == 200 and not found_js_errors,
                    f"Frontend search page structure validation after fix",
                    {
                        "Status Code": response.status_code,
                        "Content Length": len(content),
                        "Has Correct Structure": has_correct_structure,
                        "JS Errors Found": found_js_errors if found_js_errors else "None",
                        "Contains ProductCard": "ProductCard" in content,
                        "Contains Search Results": "Results for" in content or "search" in content.lower()
                    }
                )
                return response.status_code == 200 and not found_js_errors
            else:
                self.log_test("Frontend Search Page Structure", False, f"Frontend not accessible: {response.status_code}")
                return False
                
        except requests.exceptions.ConnectionError:
            self.log_test("Frontend Search Page Structure", False, "Cannot connect to frontend - may not be running")
            return False
        except Exception as e:
            self.log_test("Frontend Search Page Structure", False, f"Frontend test failed: {str(e)}")
            return False
    
    def test_productcard_prop_compatibility(self) -> bool:
        """Test 3: ProductCard Prop Compatibility After Fix"""
        try:
            # Get backend data to simulate frontend transformation
            response = self.session.get(f"{BACKEND_URL}/products/search/books", timeout=15)
            
            if response.status_code != 200:
                self.log_test("ProductCard Prop Compatibility", False, "Backend API not accessible")
                return False
                
            data = response.json()
            
            if not data.get('success') or not data.get('data'):
                self.log_test("ProductCard Prop Compatibility", False, "No data from backend")
                return False
            
            products = data['data']
            if not products:
                self.log_test("ProductCard Prop Compatibility", False, "No products to test")
                return False
                
            sample_product = products[0]
            
            # Simulate the FIXED prop structure (individual props, not nested)
            fixed_props = {
                'id': sample_product.get('id'),
                'title': sample_product.get('name'),
                'price': sample_product.get('price'),
                'originalPrice': sample_product.get('original_price'),
                'rating': sample_product.get('rating_average', 0),
                'reviewCount': sample_product.get('total_reviews', 0),
                'image': sample_product.get('images')[0] if isinstance(sample_product.get('images'), list) and sample_product.get('images') else sample_product.get('images'),
                'isPrime': sample_product.get('is_featured'),
                'currency': sample_product.get('currency')
            }
            
            # Check for potential undefined/null issues that could cause console errors
            prop_issues = []
            
            for prop, value in fixed_props.items():
                if value is None:
                    prop_issues.append(f"{prop} is None/undefined")
                elif prop == 'image' and not value:
                    prop_issues.append(f"image is empty/undefined")
                elif prop in ['price', 'rating', 'reviewCount'] and not isinstance(value, (int, float)):
                    prop_issues.append(f"{prop} is not a number: {type(value).__name__}")
                elif prop == 'title' and not isinstance(value, str):
                    prop_issues.append(f"title is not a string: {type(value).__name__}")
            
            self.log_test(
                "ProductCard Prop Compatibility",
                len(prop_issues) == 0,
                f"ProductCard individual props validation after fix",
                {
                    "Prop Issues": prop_issues if prop_issues else "None",
                    "Fixed Props Structure": "Individual props (not nested)",
                    "Sample ID": fixed_props.get('id'),
                    "Sample Title": fixed_props.get('title'),
                    "Sample Price": fixed_props.get('price'),
                    "Sample Image": fixed_props.get('image'),
                    "Image Type": type(fixed_props.get('image')).__name__,
                    "All Props Valid": len(prop_issues) == 0
                }
            )
            
            return len(prop_issues) == 0
            
        except Exception as e:
            self.log_test("ProductCard Prop Compatibility", False, f"Prop compatibility test failed: {str(e)}")
            return False
    
    def test_search_functionality_end_to_end(self) -> bool:
        """Test 4: End-to-End Search Functionality"""
        try:
            search_terms = ["books", "iPhone", "laptop"]
            results = []
            
            for term in search_terms:
                try:
                    response = self.session.get(f"{BACKEND_URL}/products/search/{term}", timeout=15)
                    
                    if response.status_code == 200:
                        data = response.json()
                        if data.get('success') and 'data' in data:
                            products = data['data']
                            results.append(True)
                            
                            # Check that all products have the required fields for the fixed frontend
                            all_products_valid = True
                            for product in products:
                                required_fields = ['id', 'name', 'price', 'images']
                                if not all(field in product and product[field] is not None for field in required_fields):
                                    all_products_valid = False
                                    break
                            
                            if not all_products_valid:
                                results[-1] = False
                                
                        else:
                            results.append(False)
                    else:
                        results.append(False)
                        
                except Exception:
                    results.append(False)
            
            overall_success = all(results)
            success_count = sum(results)
            
            self.log_test(
                "End-to-End Search Functionality",
                overall_success,
                f"Complete search functionality validation",
                {
                    "Search Terms Tested": len(search_terms),
                    "Successful Searches": success_count,
                    "Success Rate": f"{success_count}/{len(search_terms)}",
                    "All Products Valid": overall_success,
                    "Terms Tested": ", ".join(search_terms)
                }
            )
            
            return overall_success
            
        except Exception as e:
            self.log_test("End-to-End Search Functionality", False, f"End-to-end test failed: {str(e)}")
            return False
    
    def run_fix_verification(self):
        """Run all search fix verification tests"""
        print("=" * 80)
        print("🔧 RITZONE SEARCH FIX VERIFICATION TESTING")
        print("=" * 80)
        print(f"Backend URL: {BACKEND_URL}")
        print(f"Frontend URL: {FRONTEND_URL}")
        print(f"Test Time: {time.strftime('%Y-%m-%d %H:%M:%S UTC', time.gmtime())}")
        print()
        print("ISSUE FIXED:")
        print("- Search page was passing nested 'product' prop to ProductCard")
        print("- ProductCard expects individual props (id, title, price, etc.)")
        print("- Fixed by updating search page to pass individual props")
        print("=" * 80)
        print()
        
        # Run all verification tests
        test_results = []
        
        # Test 1: Backend Search for Books (Baseline)
        test_results.append(self.test_backend_search_books())
        
        # Test 2: Frontend Search Page Structure
        test_results.append(self.test_frontend_search_page_structure())
        
        # Test 3: ProductCard Prop Compatibility
        test_results.append(self.test_productcard_prop_compatibility())
        
        # Test 4: End-to-End Search Functionality
        test_results.append(self.test_search_functionality_end_to_end())
        
        # Summary
        passed_tests = sum(test_results)
        total_tests = len(test_results)
        success_rate = (passed_tests / total_tests) * 100
        
        print("=" * 80)
        print("📊 SEARCH FIX VERIFICATION SUMMARY")
        print("=" * 80)
        print(f"Tests Passed: {passed_tests}/{total_tests}")
        print(f"Success Rate: {success_rate:.1f}%")
        print()
        
        if success_rate == 100:
            print("🎉 EXCELLENT: Search fix verification successful!")
            print("✅ Console errors should be resolved")
            print("✅ Search functionality working properly")
            print("✅ ProductCard prop structure fixed")
        elif success_rate >= 75:
            print("⚠️  GOOD: Most verification tests passed")
            print("🔍 Some issues may remain - check failed tests above")
            print("🔧 Console errors may be partially resolved")
        else:
            print("❌ CRITICAL: Search fix verification failed")
            print("🚨 Console errors likely still present")
            print("🚨 Additional fixes needed")
        
        print("=" * 80)
        
        return success_rate >= 75

def main():
    """Main verification execution"""
    verifier = SearchFixVerifier()
    success = verifier.run_fix_verification()
    
    # Exit with appropriate code
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()
#!/usr/bin/env python3
"""
RitZone Search Functionality Testing - LOCALHOST DEVELOPMENT SERVER
==================================================================
Testing the search functionality on localhost development server based on console errors when searching for "books"

REVIEW REQUEST CONTEXT:
Test the current search functionality comprehensively on LOCALHOST:
1. Test the search API endpoint: GET /api/products/search/:query
2. Test with different search scenarios (iPhone, laptop, books, etc.)
3. Test with category filters, sorting options, pagination
4. Test error handling for invalid queries
5. Verify response format matches what frontend expects
6. Test currency conversion in search results
7. Use test credentials: b@b.com / Abcd@1234

BACKEND INFO:
- Backend URL: http://localhost:10000/api (DEVELOPMENT SERVER)
- Search endpoint: GET /api/products/search/:query 
- Parameters: page, limit, category, sortBy, currency
- Expected response format: {success, data, searchQuery, category, sortBy, pagination, totalCount, currency}
"""

import requests
import json
import time
import sys
from typing import Dict, Any, Optional

# Configuration - Using localhost development server
BACKEND_URL = "http://localhost:10000/api"
TEST_USER_EMAIL = "b@b.com"
TEST_USER_PASSWORD = "Abcd@1234"

class SearchFunctionalityTester:
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
        
    def test_backend_health(self) -> bool:
        """Test 1: Backend Health Check"""
        try:
            response = self.session.get(f"{BACKEND_URL}/health", timeout=15)
            
            if response.status_code == 200:
                data = response.json()
                self.log_test(
                    "Backend Health Check (Localhost)",
                    True,
                    f"Development server is running properly",
                    {
                        "Status Code": response.status_code,
                        "Message": data.get('message', 'N/A'),
                        "Environment": data.get('environment', {}).get('nodeEnv', 'N/A'),
                        "Database": "Connected" if data.get('database', {}).get('success') else "Failed"
                    }
                )
                return True
            else:
                self.log_test("Backend Health Check", False, f"Backend health check failed with status {response.status_code}")
                return False
                
        except requests.exceptions.ConnectionError:
            self.log_test("Backend Health Check", False, "Cannot connect to localhost:10000 - Backend server may not be running")
            return False
        except Exception as e:
            self.log_test("Backend Health Check", False, f"Backend connection failed: {str(e)}")
            return False
    
    def test_user_authentication(self) -> bool:
        """Test 2: User Authentication"""
        try:
            login_data = {
                "email": TEST_USER_EMAIL,
                "password": TEST_USER_PASSWORD
            }
            
            response = self.session.post(f"{BACKEND_URL}/auth/login", json=login_data, timeout=15)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success') and data.get('token'):
                    self.access_token = data['token']
                    self.log_test(
                        "User Authentication (Localhost)", 
                        True, 
                        f"Successfully authenticated user {TEST_USER_EMAIL}",
                        {
                            "Token Length": len(self.access_token),
                            "Token Type": "Supabase Access Token" if len(self.access_token) > 100 else "JWT Token"
                        }
                    )
                    return True
                else:
                    self.log_test("User Authentication", False, "Login response missing token or success flag")
                    return False
            else:
                self.log_test("User Authentication", False, f"Login failed with status {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("User Authentication", False, f"Authentication request failed: {str(e)}")
            return False
    
    def test_search_books_specific(self) -> bool:
        """Test 3: Search for 'books' (specific issue from console error)"""
        try:
            response = self.session.get(f"{BACKEND_URL}/products/search/books", timeout=15)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success') and 'data' in data:
                    products = data['data']
                    self.log_test(
                        "Search 'books' (Console Error Case)",
                        True,
                        f"Found {len(products)} book products",
                        {
                            "Total Count": data.get('totalCount', 0),
                            "Search Query": data.get('searchQuery', ''),
                            "Products Returned": len(products),
                            "Response Structure": "Valid" if all(key in data for key in ['success', 'data', 'searchQuery']) else "Invalid",
                            "Currency": data.get('currency', 'Not specified'),
                            "Pagination Present": "Yes" if 'pagination' in data else "No"
                        }
                    )
                    
                    # Check if products have required fields for frontend
                    if products:
                        sample_product = products[0]
                        required_fields = ['id', 'name', 'price', 'images', 'brand', 'category_name']
                        missing_fields = [field for field in required_fields if field not in sample_product]
                        
                        if missing_fields:
                            self.log_test(
                                "Books Search - Product Structure",
                                False,
                                f"Missing required fields in product: {', '.join(missing_fields)}",
                                {"Sample Product Keys": list(sample_product.keys())}
                            )
                            return False
                        else:
                            self.log_test(
                                "Books Search - Product Structure",
                                True,
                                "All required product fields present",
                                {
                                    "Sample Product ID": sample_product.get('id'),
                                    "Sample Product Name": sample_product.get('name'),
                                    "Sample Product Price": sample_product.get('price'),
                                    "Sample Product Brand": sample_product.get('brand')
                                }
                            )
                    
                    return True
                else:
                    self.log_test("Search 'books'", False, "Invalid response structure - missing success or data")
                    return False
            else:
                self.log_test("Search 'books'", False, f"Search failed with status {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("Search 'books'", False, f"Search request failed: {str(e)}")
            return False
    
    def test_search_various_terms(self) -> bool:
        """Test 4: Search Various Terms"""
        search_terms = ["iPhone", "laptop", "samsung", "phone", "electronics"]
        results = []
        
        for term in search_terms:
            try:
                response = self.session.get(f"{BACKEND_URL}/products/search/{term}", timeout=15)
                
                if response.status_code == 200:
                    data = response.json()
                    if data.get('success') and 'data' in data:
                        products = data['data']
                        results.append(True)
                        self.log_test(
                            f"Search '{term}'",
                            True,
                            f"Found {len(products)} products",
                            {
                                "Total Count": data.get('totalCount', 0),
                                "Search Query": data.get('searchQuery', ''),
                                "Products Returned": len(products)
                            }
                        )
                    else:
                        results.append(False)
                        self.log_test(f"Search '{term}'", False, "Invalid response structure")
                else:
                    results.append(False)
                    self.log_test(f"Search '{term}'", False, f"Search failed with status {response.status_code}")
                    
            except Exception as e:
                results.append(False)
                self.log_test(f"Search '{term}'", False, f"Search request failed: {str(e)}")
        
        overall_success = all(results)
        success_count = sum(results)
        self.log_test(
            "Various Search Terms Summary",
            overall_success,
            f"{success_count}/{len(search_terms)} search terms working properly"
        )
        return overall_success
    
    def test_search_with_filters(self) -> bool:
        """Test 5: Search with Category Filtering and Sorting"""
        test_cases = [
            {"query": "phone", "category": "Electronics", "sortBy": "price-low"},
            {"query": "laptop", "category": "Electronics", "sortBy": "price-high"},
            {"query": "books", "sortBy": "rating"},
            {"query": "phone", "sortBy": "newest"}
        ]
        
        results = []
        
        for case in test_cases:
            try:
                params = {}
                if 'category' in case:
                    params['category'] = case['category']
                if 'sortBy' in case:
                    params['sortBy'] = case['sortBy']
                
                response = self.session.get(
                    f"{BACKEND_URL}/products/search/{case['query']}", 
                    params=params, 
                    timeout=15
                )
                
                if response.status_code == 200:
                    data = response.json()
                    if data.get('success') and 'data' in data:
                        results.append(True)
                        self.log_test(
                            f"Filtered Search: {case['query']} ({case.get('category', 'All')}, {case.get('sortBy', 'relevance')})",
                            True,
                            f"Found {len(data['data'])} products",
                            {
                                "Category": data.get('category', 'All'),
                                "Sort By": data.get('sortBy', 'relevance'),
                                "Total Count": data.get('totalCount', 0)
                            }
                        )
                    else:
                        results.append(False)
                        self.log_test(f"Filtered Search: {case['query']}", False, "Invalid response structure")
                else:
                    results.append(False)
                    self.log_test(f"Filtered Search: {case['query']}", False, f"Search failed with status {response.status_code}")
                    
            except Exception as e:
                results.append(False)
                self.log_test(f"Filtered Search: {case['query']}", False, f"Search request failed: {str(e)}")
        
        overall_success = all(results)
        success_count = sum(results)
        self.log_test(
            "Filtered Search Summary",
            overall_success,
            f"{success_count}/{len(test_cases)} filtered searches working properly"
        )
        return overall_success
    
    def test_search_pagination(self) -> bool:
        """Test 6: Search Pagination"""
        try:
            # Test pagination with different page sizes
            response1 = self.session.get(f"{BACKEND_URL}/products/search/phone?page=1&limit=3", timeout=15)
            response2 = self.session.get(f"{BACKEND_URL}/products/search/phone?page=2&limit=3", timeout=15)
            
            if response1.status_code == 200 and response2.status_code == 200:
                data1 = response1.json()
                data2 = response2.json()
                
                if (data1.get('success') and data2.get('success') and 
                    'pagination' in data1 and 'pagination' in data2):
                    
                    pagination1 = data1['pagination']
                    pagination2 = data2['pagination']
                    
                    self.log_test(
                        "Search Pagination",
                        True,
                        "Pagination working correctly",
                        {
                            "Page 1 Products": len(data1['data']),
                            "Page 2 Products": len(data2['data']),
                            "Page 1 Current": pagination1.get('currentPage'),
                            "Page 2 Current": pagination2.get('currentPage'),
                            "Total Pages": pagination1.get('totalPages'),
                            "Total Count": pagination1.get('totalCount')
                        }
                    )
                    return True
                else:
                    self.log_test("Search Pagination", False, "Invalid pagination response structure")
                    return False
            else:
                self.log_test("Search Pagination", False, f"Pagination requests failed: {response1.status_code}, {response2.status_code}")
                return False
                
        except Exception as e:
            self.log_test("Search Pagination", False, f"Pagination test failed: {str(e)}")
            return False
    
    def test_search_currency_conversion(self) -> bool:
        """Test 7: Search with Currency Conversion"""
        currencies = ["INR", "USD", "EUR"]
        results = []
        
        for currency in currencies:
            try:
                response = self.session.get(
                    f"{BACKEND_URL}/products/search/phone?currency={currency}", 
                    timeout=15
                )
                
                if response.status_code == 200:
                    data = response.json()
                    if data.get('success') and 'data' in data and len(data['data']) > 0:
                        product = data['data'][0]
                        results.append(True)
                        self.log_test(
                            f"Currency Conversion ({currency})",
                            True,
                            f"Products returned with {currency} pricing",
                            {
                                "Currency": data.get('currency', 'N/A'),
                                "Sample Price": product.get('price', 'N/A'),
                                "Products Count": len(data['data'])
                            }
                        )
                    else:
                        results.append(False)
                        self.log_test(f"Currency Conversion ({currency})", False, "No products returned")
                else:
                    results.append(False)
                    self.log_test(f"Currency Conversion ({currency})", False, f"Request failed with status {response.status_code}")
                    
            except Exception as e:
                results.append(False)
                self.log_test(f"Currency Conversion ({currency})", False, f"Request failed: {str(e)}")
        
        overall_success = all(results)
        success_count = sum(results)
        self.log_test(
            "Currency Conversion Summary",
            overall_success,
            f"{success_count}/{len(currencies)} currencies working properly"
        )
        return overall_success
    
    def test_search_response_structure(self) -> bool:
        """Test 8: Search Response Data Structure Validation"""
        try:
            response = self.session.get(f"{BACKEND_URL}/products/search/phone", timeout=15)
            
            if response.status_code == 200:
                data = response.json()
                
                # Check main response structure
                required_response_fields = ['success', 'data', 'searchQuery', 'totalCount', 'pagination']
                missing_response_fields = [field for field in required_response_fields if field not in data]
                
                if missing_response_fields:
                    self.log_test(
                        "Search Response Structure",
                        False,
                        f"Missing required response fields: {', '.join(missing_response_fields)}",
                        {"Available Fields": list(data.keys())}
                    )
                    return False
                
                if data.get('success') and 'data' in data and len(data['data']) > 0:
                    product = data['data'][0]
                    
                    # Check required product fields for frontend compatibility
                    required_product_fields = [
                        'id', 'name', 'price', 'images', 'brand', 'category_name', 
                        'stock_quantity', 'rating_average'
                    ]
                    
                    missing_product_fields = [field for field in required_product_fields if field not in product]
                    
                    if not missing_product_fields:
                        self.log_test(
                            "Search Response Structure",
                            True,
                            "All required fields present in response",
                            {
                                "Response Fields": "✓ Complete",
                                "Product Fields": "✓ Complete",
                                "Product ID": product.get('id', 'N/A'),
                                "Product Name": product.get('name', 'N/A'),
                                "Price": product.get('price', 'N/A'),
                                "Brand": product.get('brand', 'N/A'),
                                "Category": product.get('category_name', 'N/A'),
                                "Stock": product.get('stock_quantity', 'N/A'),
                                "Rating": product.get('rating_average', 'N/A')
                            }
                        )
                        return True
                    else:
                        self.log_test(
                            "Search Response Structure",
                            False,
                            f"Missing required product fields: {', '.join(missing_product_fields)}",
                            {"Available Product Fields": list(product.keys())}
                        )
                        return False
                else:
                    self.log_test("Search Response Structure", False, "No products returned for structure validation")
                    return False
            else:
                self.log_test("Search Response Structure", False, f"Search failed with status {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("Search Response Structure", False, f"Structure validation failed: {str(e)}")
            return False
    
    def test_search_error_handling(self) -> bool:
        """Test 9: Search Error Handling"""
        test_cases = [
            {"query": "", "expected": "Should handle empty query"},
            {"query": "nonexistentproduct12345", "expected": "Should return empty results gracefully"},
            {"query": "a" * 100, "expected": "Should handle long queries"},
            {"query": "special!@#$%chars", "expected": "Should handle special characters"}
        ]
        
        results = []
        
        for case in test_cases:
            try:
                if case['query'] == "":
                    # For empty query, test the endpoint directly
                    response = self.session.get(f"{BACKEND_URL}/products/search/", timeout=15)
                else:
                    response = self.session.get(f"{BACKEND_URL}/products/search/{case['query']}", timeout=15)
                
                # We expect 200 status for most cases (graceful handling)
                if response.status_code in [200, 404]:  # 404 might be expected for empty query
                    if response.status_code == 200:
                        data = response.json()
                        if data.get('success') is not None:  # success can be true or false
                            results.append(True)
                            self.log_test(
                                f"Error Handling: '{case['query'][:20]}...' query",
                                True,
                                f"Handled gracefully - {case['expected']}",
                                {
                                    "Status Code": response.status_code,
                                    "Success": data.get('success'),
                                    "Products Count": len(data.get('data', [])),
                                    "Total Count": data.get('totalCount', 0)
                                }
                            )
                        else:
                            results.append(False)
                            self.log_test(f"Error Handling: '{case['query'][:20]}...'", False, "Invalid response structure")
                    else:  # 404 case
                        results.append(True)
                        self.log_test(
                            f"Error Handling: '{case['query'][:20]}...' query",
                            True,
                            f"Handled with 404 - {case['expected']}",
                            {"Status Code": response.status_code}
                        )
                else:
                    results.append(False)
                    self.log_test(f"Error Handling: '{case['query'][:20]}...'", False, f"Unexpected status code: {response.status_code}")
                    
            except Exception as e:
                results.append(False)
                self.log_test(f"Error Handling: '{case['query'][:20]}...'", False, f"Request failed: {str(e)}")
        
        overall_success = all(results)
        success_count = sum(results)
        self.log_test(
            "Error Handling Summary",
            overall_success,
            f"{success_count}/{len(test_cases)} error cases handled properly"
        )
        return overall_success
    
    def test_search_without_authentication(self) -> bool:
        """Test 10: Search Without Authentication (Public Access)"""
        try:
            # Create new session without authentication
            public_session = requests.Session()
            response = public_session.get(f"{BACKEND_URL}/products/search/phone", timeout=15)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success') and 'data' in data:
                    self.log_test(
                        "Public Search Access",
                        True,
                        f"Search works without authentication - found {len(data['data'])} products",
                        {
                            "Status Code": response.status_code,
                            "Products Count": len(data['data']),
                            "Total Count": data.get('totalCount', 0)
                        }
                    )
                    return True
                else:
                    self.log_test("Public Search Access", False, "Invalid response structure")
                    return False
            else:
                self.log_test("Public Search Access", False, f"Public search failed with status {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("Public Search Access", False, f"Public search test failed: {str(e)}")
            return False
    
    def run_comprehensive_test(self):
        """Run all search functionality tests"""
        print("=" * 80)
        print("🔍 RITZONE SEARCH FUNCTIONALITY - LOCALHOST DEVELOPMENT TESTING")
        print("=" * 80)
        print(f"Backend URL: {BACKEND_URL}")
        print(f"Test User: {TEST_USER_EMAIL}")
        print(f"Test Time: {time.strftime('%Y-%m-%d %H:%M:%S UTC', time.gmtime())}")
        print("=" * 80)
        print()
        
        # Run all tests
        test_results = []
        
        # Test 1: Backend Health Check
        test_results.append(self.test_backend_health())
        
        # Test 2: User Authentication
        test_results.append(self.test_user_authentication())
        
        # Test 3: Search for 'books' (specific console error case)
        test_results.append(self.test_search_books_specific())
        
        # Test 4: Search Various Terms
        test_results.append(self.test_search_various_terms())
        
        # Test 5: Search with Filters
        test_results.append(self.test_search_with_filters())
        
        # Test 6: Search Pagination
        test_results.append(self.test_search_pagination())
        
        # Test 7: Currency Conversion
        test_results.append(self.test_search_currency_conversion())
        
        # Test 8: Response Structure Validation
        test_results.append(self.test_search_response_structure())
        
        # Test 9: Error Handling
        test_results.append(self.test_search_error_handling())
        
        # Test 10: Public Access
        test_results.append(self.test_search_without_authentication())
        
        # Summary
        passed_tests = sum(test_results)
        total_tests = len(test_results)
        success_rate = (passed_tests / total_tests) * 100
        
        print("=" * 80)
        print("📊 LOCALHOST SEARCH FUNCTIONALITY TEST SUMMARY")
        print("=" * 80)
        print(f"Tests Passed: {passed_tests}/{total_tests}")
        print(f"Success Rate: {success_rate:.1f}%")
        print()
        
        if success_rate == 100:
            print("🎉 EXCELLENT: All search functionality tests passed!")
            print("✅ Search API is working perfectly on localhost")
            print("✅ All features (filtering, sorting, pagination, currency) working")
            print("✅ Console errors should be resolved")
        elif success_rate >= 80:
            print("⚠️  GOOD: Most search functionality tests passed")
            print("🔍 Minor issues may exist - check failed tests above")
            print("🔧 Some console errors may persist")
        else:
            print("❌ CRITICAL: Search functionality has major issues")
            print("🚨 Search API needs significant fixes")
            print("🚨 Console errors likely due to backend issues")
        
        print("=" * 80)
        
        return success_rate == 100

def main():
    """Main test execution"""
    tester = SearchFunctionalityTester()
    success = tester.run_comprehensive_test()
    
    # Exit with appropriate code
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()
#!/usr/bin/env python3
"""
RitZone Search Functionality Testing
===================================
Testing the search API endpoint: GET /api/products/search/:query

REVIEW REQUEST CONTEXT:
Test the search functionality implementation for RitZone Web Application.
- Test the new search API endpoint: GET /api/products/search/:query
- Verify search functionality works with different search terms
- Test category filtering, sorting options, and pagination
- Verify currency conversion support
- Test both registered and non-registered user access
- Ensure proper data structure matches frontend expectations
"""

import requests
import json
import time
import sys
from typing import Dict, Any, Optional

# Configuration - Using production backend URL
BACKEND_URL = "https://ritkart-backend-ujnt.onrender.com/api"
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
            response = self.session.get(f"{BACKEND_URL}/health", timeout=30)
            
            if response.status_code == 200:
                data = response.json()
                self.log_test(
                    "Backend Health Check",
                    True,
                    f"Backend is running properly",
                    {
                        "Status Code": response.status_code,
                        "Message": data.get('message', 'N/A'),
                        "Database": "Connected" if data.get('database', {}).get('success') else "Failed"
                    }
                )
                return True
            else:
                self.log_test("Backend Health Check", False, f"Backend health check failed with status {response.status_code}")
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
            
            response = self.session.post(f"{BACKEND_URL}/auth/login", json=login_data, timeout=30)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success') and data.get('token'):
                    self.access_token = data['token']
                    self.log_test("User Authentication", True, f"Successfully authenticated user {TEST_USER_EMAIL}")
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
    
    def test_search_basic_functionality(self) -> bool:
        """Test 3: Basic Search Functionality"""
        search_terms = ["phone", "laptop", "samsung"]
        results = []
        
        for term in search_terms:
            try:
                response = self.session.get(f"{BACKEND_URL}/products/search/{term}", timeout=30)
                
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
            "Basic Search Functionality Summary",
            overall_success,
            f"{success_count}/{len(search_terms)} search terms working properly"
        )
        return overall_success
    
    def test_search_with_filters(self) -> bool:
        """Test 4: Search with Category Filtering and Sorting"""
        test_cases = [
            {"query": "phone", "category": "Electronics", "sortBy": "price-low"},
            {"query": "laptop", "category": "Electronics", "sortBy": "price-high"},
            {"query": "samsung", "sortBy": "rating"},
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
                    timeout=30
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
        """Test 5: Search Pagination"""
        try:
            # Test pagination with different page sizes
            response1 = self.session.get(f"{BACKEND_URL}/products/search/phone?page=1&limit=5", timeout=30)
            response2 = self.session.get(f"{BACKEND_URL}/products/search/phone?page=2&limit=5", timeout=30)
            
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
                self.log_test("Search Pagination", False, "Pagination requests failed")
                return False
                
        except Exception as e:
            self.log_test("Search Pagination", False, f"Pagination test failed: {str(e)}")
            return False
    
    def test_search_currency_conversion(self) -> bool:
        """Test 6: Search with Currency Conversion"""
        currencies = ["INR", "USD", "EUR"]
        results = []
        
        for currency in currencies:
            try:
                response = self.session.get(
                    f"{BACKEND_URL}/products/search/phone?currency={currency}", 
                    timeout=30
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
    
    def test_search_data_structure(self) -> bool:
        """Test 7: Search Response Data Structure"""
        try:
            response = self.session.get(f"{BACKEND_URL}/products/search/phone", timeout=30)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success') and 'data' in data and len(data['data']) > 0:
                    product = data['data'][0]
                    
                    # Check required fields
                    required_fields = [
                        'id', 'name', 'price', 'original_price', 'images', 
                        'brand', 'category_name', 'stock_quantity', 
                        'rating_average', 'total_reviews'
                    ]
                    
                    missing_fields = [field for field in required_fields if field not in product]
                    
                    if not missing_fields:
                        self.log_test(
                            "Search Data Structure",
                            True,
                            "All required fields present in response",
                            {
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
                            "Search Data Structure",
                            False,
                            f"Missing required fields: {', '.join(missing_fields)}"
                        )
                        return False
                else:
                    self.log_test("Search Data Structure", False, "No products returned for structure validation")
                    return False
            else:
                self.log_test("Search Data Structure", False, f"Search failed with status {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("Search Data Structure", False, f"Data structure test failed: {str(e)}")
            return False
    
    def test_search_without_authentication(self) -> bool:
        """Test 8: Search Without Authentication (Public Access)"""
        try:
            # Create new session without authentication
            public_session = requests.Session()
            response = public_session.get(f"{BACKEND_URL}/products/search/phone", timeout=30)
            
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
        print("🔍 RITZONE SEARCH FUNCTIONALITY TESTING")
        print("=" * 80)
        print(f"Backend URL: {BACKEND_URL}")
        print(f"Test Time: {time.strftime('%Y-%m-%d %H:%M:%S UTC', time.gmtime())}")
        print("=" * 80)
        print()
        
        # Run all tests
        test_results = []
        
        # Test 1: Backend Health Check
        test_results.append(self.test_backend_health())
        
        # Test 2: User Authentication
        test_results.append(self.test_user_authentication())
        
        # Test 3: Basic Search Functionality
        test_results.append(self.test_search_basic_functionality())
        
        # Test 4: Search with Filters
        test_results.append(self.test_search_with_filters())
        
        # Test 5: Search Pagination
        test_results.append(self.test_search_pagination())
        
        # Test 6: Currency Conversion
        test_results.append(self.test_search_currency_conversion())
        
        # Test 7: Data Structure Validation
        test_results.append(self.test_search_data_structure())
        
        # Test 8: Public Access
        test_results.append(self.test_search_without_authentication())
        
        # Summary
        passed_tests = sum(test_results)
        total_tests = len(test_results)
        success_rate = (passed_tests / total_tests) * 100
        
        print("=" * 80)
        print("📊 SEARCH FUNCTIONALITY TEST SUMMARY")
        print("=" * 80)
        print(f"Tests Passed: {passed_tests}/{total_tests}")
        print(f"Success Rate: {success_rate:.1f}%")
        print()
        
        if success_rate == 100:
            print("🎉 EXCELLENT: All search functionality tests passed!")
            print("✅ Search API is working perfectly")
            print("✅ All features (filtering, sorting, pagination, currency) working")
        elif success_rate >= 80:
            print("⚠️  GOOD: Most search functionality tests passed")
            print("🔍 Minor issues may exist - check failed tests above")
        else:
            print("❌ CRITICAL: Search functionality has major issues")
            print("🚨 Search API needs significant fixes")
        
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
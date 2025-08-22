#!/usr/bin/env python3
"""
RitZone Orders Redirection Backend Testing
==========================================
Focused testing of orders redirection functionality for RitZone Web Application.

REVIEW REQUEST CONTEXT:
Test the orders redirection functionality for RitZone Web Application. Specifically test:
1. Backend Orders API - Test GET /api/orders endpoint to ensure it's working properly
2. Authentication Flow - Test with valid user credentials: b@b.com / Abcd@1234
3. API Connectivity - Test backend server is running on expected port and verify API endpoints are accessible

Focus: Making sure the backend infrastructure is ready to support the new /orders page 
redirection functionality that redirects users to the "My Orders" section of their profile page.
"""

import requests
import json
import time
import sys
from typing import Dict, Any, Optional

# Configuration - Using production backend URL from .env
BACKEND_URL = "https://ritkart-backend-ujnt.onrender.com/api"
TEST_USER_EMAIL = "b@b.com"
TEST_USER_PASSWORD = "Abcd@1234"

class OrdersRedirectionTester:
    def __init__(self):
        self.session = requests.Session()
        self.access_token = None
        self.user_data = None
        
    def log_test(self, test_name: str, success: bool, message: str, details: Dict = None):
        """Log test results with consistent formatting"""
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} | {test_name}")
        print(f"     └─ {message}")
        if details:
            for key, value in details.items():
                print(f"        {key}: {value}")
        print()
        
    def test_backend_connectivity(self) -> bool:
        """Test 1: Backend Server Connectivity and Health Check"""
        try:
            response = self.session.get(f"{BACKEND_URL}/health", timeout=30)
            
            if response.status_code == 200:
                data = response.json()
                self.log_test(
                    "Backend Server Connectivity",
                    True,
                    f"Backend server is running and accessible",
                    {
                        "Status Code": response.status_code,
                        "Server Message": data.get('message', 'N/A'),
                        "Environment": data.get('environment', {}).get('nodeEnv', 'N/A'),
                        "Database Status": "Connected" if data.get('database', {}).get('success') else "Failed",
                        "Backend URL": BACKEND_URL
                    }
                )
                return True
            else:
                self.log_test(
                    "Backend Server Connectivity",
                    False,
                    f"Backend server returned unexpected status {response.status_code}",
                    {"Response": response.text[:200]}
                )
                return False
                
        except Exception as e:
            self.log_test(
                "Backend Server Connectivity",
                False,
                f"Failed to connect to backend server: {str(e)}",
                {"Backend URL": BACKEND_URL}
            )
            return False
    
    def test_user_authentication(self) -> bool:
        """Test 2: User Authentication with b@b.com / Abcd@1234"""
        try:
            login_data = {
                "email": TEST_USER_EMAIL,
                "password": TEST_USER_PASSWORD
            }
            
            response = self.session.post(
                f"{BACKEND_URL}/auth/login",
                json=login_data,
                timeout=30
            )
            
            if response.status_code == 200:
                data = response.json()
                
                if data.get('success') and data.get('token'):
                    self.access_token = data['token']
                    self.user_data = data.get('user', {})
                    
                    self.log_test(
                        "User Authentication",
                        True,
                        f"Successfully authenticated user {TEST_USER_EMAIL}",
                        {
                            "Status Code": response.status_code,
                            "Token Type": "Supabase Access Token" if len(self.access_token) > 100 else "JWT Token",
                            "Token Length": len(self.access_token),
                            "User ID": self.user_data.get('id', 'N/A'),
                            "User Email": self.user_data.get('email', 'N/A'),
                            "Authentication": "Working"
                        }
                    )
                    return True
                else:
                    self.log_test(
                        "User Authentication",
                        False,
                        "Login response missing token or success flag",
                        {"Response": json.dumps(data, indent=2)[:300]}
                    )
                    return False
            else:
                self.log_test(
                    "User Authentication",
                    False,
                    f"Authentication failed with status {response.status_code}",
                    {"Response": response.text[:200]}
                )
                return False
                
        except Exception as e:
            self.log_test(
                "User Authentication",
                False,
                f"Authentication request failed: {str(e)}"
            )
            return False
    
    def test_orders_api_endpoint(self) -> bool:
        """Test 3: GET /api/orders Endpoint Functionality"""
        if not self.access_token:
            self.log_test(
                "Orders API Endpoint",
                False,
                "No access token available - authentication must succeed first"
            )
            return False
            
        try:
            headers = {
                "Authorization": f"Bearer {self.access_token}",
                "Content-Type": "application/json"
            }
            
            response = self.session.get(
                f"{BACKEND_URL}/orders",
                headers=headers,
                timeout=30
            )
            
            if response.status_code == 200:
                data = response.json()
                
                if data.get('success'):
                    orders_data = data.get('data', [])
                    pagination = data.get('pagination', {})
                    
                    self.log_test(
                        "Orders API Endpoint",
                        True,
                        "GET /api/orders endpoint working properly",
                        {
                            "Status Code": response.status_code,
                            "Success": data.get('success'),
                            "Orders Count": len(orders_data),
                            "Current Page": pagination.get('currentPage', 'N/A'),
                            "Total Pages": pagination.get('totalPages', 'N/A'),
                            "Total Count": pagination.get('totalCount', 'N/A'),
                            "Limit": pagination.get('limit', 'N/A'),
                            "Data Format": "Correct" if isinstance(orders_data, list) else "Incorrect"
                        }
                    )
                    return True
                else:
                    self.log_test(
                        "Orders API Endpoint",
                        False,
                        "Orders API response missing success flag",
                        {"Response": json.dumps(data, indent=2)[:300]}
                    )
                    return False
            else:
                self.log_test(
                    "Orders API Endpoint",
                    False,
                    f"Orders API failed with status {response.status_code}",
                    {"Response": response.text[:200]}
                )
                return False
                
        except Exception as e:
            self.log_test(
                "Orders API Endpoint",
                False,
                f"Orders API request failed: {str(e)}"
            )
            return False
    
    def test_orders_api_authentication_protection(self) -> bool:
        """Test 4: Orders API Authentication Protection"""
        try:
            # Test without authentication token
            response = self.session.get(
                f"{BACKEND_URL}/orders",
                timeout=30
            )
            
            # Should return 401 Unauthorized
            if response.status_code == 401:
                self.log_test(
                    "Orders API Authentication Protection",
                    True,
                    "Orders API properly protected - requires authentication",
                    {
                        "Status Code": response.status_code,
                        "Protection": "Working",
                        "Message": "Correctly rejects unauthenticated requests"
                    }
                )
                return True
            else:
                self.log_test(
                    "Orders API Authentication Protection",
                    False,
                    f"Orders API should return 401 for unauthenticated requests, got {response.status_code}",
                    {"Response": response.text[:200]}
                )
                return False
                
        except Exception as e:
            self.log_test(
                "Orders API Authentication Protection",
                False,
                f"Authentication protection test failed: {str(e)}"
            )
            return False
    
    def test_orders_api_with_invalid_token(self) -> bool:
        """Test 5: Orders API with Invalid Token"""
        try:
            headers = {
                "Authorization": "Bearer invalid_token_12345",
                "Content-Type": "application/json"
            }
            
            response = self.session.get(
                f"{BACKEND_URL}/orders",
                headers=headers,
                timeout=30
            )
            
            # Should return 401 or 403 for invalid token
            if response.status_code in [401, 403]:
                self.log_test(
                    "Orders API Invalid Token Handling",
                    True,
                    "Orders API properly rejects invalid tokens",
                    {
                        "Status Code": response.status_code,
                        "Token Validation": "Working",
                        "Message": "Correctly rejects invalid authentication tokens"
                    }
                )
                return True
            else:
                self.log_test(
                    "Orders API Invalid Token Handling",
                    False,
                    f"Orders API should reject invalid tokens with 401/403, got {response.status_code}",
                    {"Response": response.text[:200]}
                )
                return False
                
        except Exception as e:
            self.log_test(
                "Orders API Invalid Token Handling",
                False,
                f"Invalid token test failed: {str(e)}"
            )
            return False
    
    def test_orders_api_pagination(self) -> bool:
        """Test 6: Orders API Pagination Parameters"""
        if not self.access_token:
            self.log_test(
                "Orders API Pagination",
                False,
                "No access token available - authentication must succeed first"
            )
            return False
            
        try:
            headers = {
                "Authorization": f"Bearer {self.access_token}",
                "Content-Type": "application/json"
            }
            
            # Test with pagination parameters
            response = self.session.get(
                f"{BACKEND_URL}/orders?page=1&limit=5",
                headers=headers,
                timeout=30
            )
            
            if response.status_code == 200:
                data = response.json()
                pagination = data.get('pagination', {})
                
                # Check if pagination parameters are respected
                limit_respected = pagination.get('limit') == 5
                page_respected = pagination.get('currentPage') == 1
                
                self.log_test(
                    "Orders API Pagination",
                    limit_respected and page_respected,
                    "Orders API pagination parameters working properly",
                    {
                        "Status Code": response.status_code,
                        "Requested Limit": 5,
                        "Returned Limit": pagination.get('limit', 'N/A'),
                        "Requested Page": 1,
                        "Returned Page": pagination.get('currentPage', 'N/A'),
                        "Pagination Working": "Yes" if (limit_respected and page_respected) else "No"
                    }
                )
                return limit_respected and page_respected
            else:
                self.log_test(
                    "Orders API Pagination",
                    False,
                    f"Orders API pagination test failed with status {response.status_code}",
                    {"Response": response.text[:200]}
                )
                return False
                
        except Exception as e:
            self.log_test(
                "Orders API Pagination",
                False,
                f"Pagination test failed: {str(e)}"
            )
            return False
    
    def test_cors_configuration(self) -> bool:
        """Test 7: CORS Configuration for Frontend Integration"""
        try:
            # Test preflight request
            headers = {
                "Origin": "https://ritzone-frontend-s3ik.onrender.com",
                "Access-Control-Request-Method": "GET",
                "Access-Control-Request-Headers": "Authorization, Content-Type"
            }
            
            response = self.session.options(
                f"{BACKEND_URL}/orders",
                headers=headers,
                timeout=30
            )
            
            # Check CORS headers
            cors_headers = {
                "Access-Control-Allow-Origin": response.headers.get("Access-Control-Allow-Origin"),
                "Access-Control-Allow-Methods": response.headers.get("Access-Control-Allow-Methods"),
                "Access-Control-Allow-Headers": response.headers.get("Access-Control-Allow-Headers")
            }
            
            cors_working = (
                cors_headers["Access-Control-Allow-Origin"] is not None and
                cors_headers["Access-Control-Allow-Methods"] is not None
            )
            
            self.log_test(
                "CORS Configuration",
                cors_working,
                "CORS configuration for frontend integration",
                {
                    "Status Code": response.status_code,
                    "Allow-Origin": cors_headers["Access-Control-Allow-Origin"] or "Not Set",
                    "Allow-Methods": cors_headers["Access-Control-Allow-Methods"] or "Not Set",
                    "Allow-Headers": cors_headers["Access-Control-Allow-Headers"] or "Not Set",
                    "CORS Status": "Working" if cors_working else "Issues Detected"
                }
            )
            return cors_working
                
        except Exception as e:
            self.log_test(
                "CORS Configuration",
                False,
                f"CORS test failed: {str(e)}"
            )
            return False
    
    def run_comprehensive_test(self):
        """Run all orders redirection backend tests"""
        print("=" * 80)
        print("🔍 RITZONE ORDERS REDIRECTION BACKEND TESTING")
        print("=" * 80)
        print(f"Backend URL: {BACKEND_URL}")
        print(f"Test User: {TEST_USER_EMAIL}")
        print(f"Test Time: {time.strftime('%Y-%m-%d %H:%M:%S UTC', time.gmtime())}")
        print("=" * 80)
        print()
        
        # Run all tests
        test_results = []
        
        # Test 1: Backend Server Connectivity
        test_results.append(self.test_backend_connectivity())
        
        # Test 2: User Authentication
        test_results.append(self.test_user_authentication())
        
        # Test 3: Orders API Endpoint
        test_results.append(self.test_orders_api_endpoint())
        
        # Test 4: Orders API Authentication Protection
        test_results.append(self.test_orders_api_authentication_protection())
        
        # Test 5: Orders API Invalid Token Handling
        test_results.append(self.test_orders_api_with_invalid_token())
        
        # Test 6: Orders API Pagination
        test_results.append(self.test_orders_api_pagination())
        
        # Test 7: CORS Configuration
        test_results.append(self.test_cors_configuration())
        
        # Summary
        passed_tests = sum(test_results)
        total_tests = len(test_results)
        success_rate = (passed_tests / total_tests) * 100
        
        print("=" * 80)
        print("📊 ORDERS REDIRECTION BACKEND TEST SUMMARY")
        print("=" * 80)
        print(f"Tests Passed: {passed_tests}/{total_tests}")
        print(f"Success Rate: {success_rate:.1f}%")
        print()
        
        if success_rate == 100:
            print("🎉 EXCELLENT: All orders backend tests passed!")
            print("✅ Backend infrastructure is ready for orders redirection functionality")
            print("✅ GET /api/orders endpoint working properly")
            print("✅ Authentication flow working with b@b.com / Abcd@1234")
            print("✅ API connectivity and CORS configuration working")
        elif success_rate >= 85:
            print("⚠️  GOOD: Most orders backend tests passed")
            print("🔍 Minor issues may exist - check failed tests above")
            print("✅ Core orders redirection functionality should work")
        else:
            print("❌ CRITICAL: Orders backend has major issues")
            print("🚨 Orders redirection functionality may not work properly")
            print("🔧 Fix failed tests before implementing frontend redirection")
        
        print("=" * 80)
        
        return success_rate >= 85

def main():
    """Main test execution"""
    tester = OrdersRedirectionTester()
    success = tester.run_comprehensive_test()
    
    # Exit with appropriate code
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()
#!/usr/bin/env python3
"""
RitZone User Review Submission Bug Investigation
==============================================
Testing user review submission functionality to identify HTTP 400 error causes
"""

import requests
import json
import uuid
import time
import os
from datetime import datetime

# Configuration
BACKEND_URL = "http://localhost:10000/api"  # Internal backend URL for testing
TEST_USER_EMAIL = "testuser@ritzone.com"
TEST_USER_PASSWORD = "TestPassword123!"
TEST_USER_NAME = "Test User"

class UserReviewBugTester:
    def __init__(self):
        self.session = requests.Session()
        self.auth_token = None
        self.user_id = None
        self.test_product_id = None
        
    def log(self, message, level="INFO"):
        timestamp = datetime.now().strftime("%H:%M:%S")
        print(f"[{timestamp}] {level}: {message}")
        
    def test_backend_health(self):
        """Test if backend is running and accessible"""
        self.log("🔍 Testing backend health...")
        try:
            response = self.session.get(f"{BACKEND_URL}/health", timeout=10)
            if response.status_code == 200:
                data = response.json()
                self.log(f"✅ Backend is healthy: {data.get('message', 'OK')}")
                return True
            else:
                self.log(f"❌ Backend health check failed: {response.status_code}", "ERROR")
                return False
        except Exception as e:
            self.log(f"❌ Backend connection failed: {str(e)}", "ERROR")
            return False
    
    def register_test_user(self):
        """Register a test user for authentication testing"""
        self.log("👤 Registering test user...")
        try:
            user_data = {
                "email": TEST_USER_EMAIL,
                "password": TEST_USER_PASSWORD,
                "fullName": TEST_USER_NAME,
                "phone": "+1234567890"
            }
            
            response = self.session.post(
                f"{BACKEND_URL}/auth/register",
                json=user_data,
                headers={"Content-Type": "application/json"}
            )
            
            if response.status_code in [200, 201]:
                data = response.json()
                self.log("✅ Test user registered successfully")
                return True
            elif response.status_code == 400 and "already exists" in response.text.lower():
                self.log("ℹ️ Test user already exists, proceeding with login")
                return True
            else:
                self.log(f"❌ User registration failed: {response.status_code} - {response.text}", "ERROR")
                return False
                
        except Exception as e:
            self.log(f"❌ User registration error: {str(e)}", "ERROR")
            return False
    
    def login_test_user(self):
        """Login test user and get authentication token"""
        self.log("🔐 Logging in test user...")
        try:
            login_data = {
                "email": TEST_USER_EMAIL,
                "password": TEST_USER_PASSWORD
            }
            
            response = self.session.post(
                f"{BACKEND_URL}/auth/login",
                json=login_data,
                headers={"Content-Type": "application/json"}
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success') and data.get('token'):
                    self.auth_token = data['token']
                    self.user_id = data['user']['id']
                    self.log("✅ User login successful")
                    self.log(f"🔑 Auth token: {self.auth_token[:20]}...")
                    return True
                else:
                    self.log(f"❌ Login response missing token data: {data}", "ERROR")
                    return False
            else:
                self.log(f"❌ User login failed: {response.status_code} - {response.text}", "ERROR")
                return False
                
        except Exception as e:
            self.log(f"❌ User login error: {str(e)}", "ERROR")
            return False
    
    def get_test_product(self):
        """Get a product ID for testing reviews"""
        self.log("📦 Getting test product...")
        try:
            response = self.session.get(f"{BACKEND_URL}/products?limit=1")
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success') and data.get('data'):
                    products = data['data']
                    if isinstance(products, list) and products:
                        self.test_product_id = products[0]['id']
                        product_name = products[0]['name']
                        self.log(f"✅ Test product found: {product_name} (ID: {self.test_product_id})")
                        return True
                    elif isinstance(products, dict) and products.get('products'):
                        products_list = products['products']
                        if products_list:
                            self.test_product_id = products_list[0]['id']
                            product_name = products_list[0]['name']
                            self.log(f"✅ Test product found: {product_name} (ID: {self.test_product_id})")
                            return True
                    else:
                        self.log("❌ No products found in database", "ERROR")
                        return False
                else:
                    self.log(f"❌ Products API response invalid: {data}", "ERROR")
                    return False
            else:
                self.log(f"❌ Failed to get products: {response.status_code} - {response.text}", "ERROR")
                return False
                
        except Exception as e:
            self.log(f"❌ Get products error: {str(e)}", "ERROR")
            return False
    
    def test_auth_token_validation(self):
        """Test if authentication token is working"""
        self.log("🔒 Testing authentication token validation...")
        try:
            headers = {
                "Authorization": f"Bearer {self.auth_token}",
                "Content-Type": "application/json"
            }
            
            response = self.session.get(f"{BACKEND_URL}/auth/profile", headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success'):
                    self.log("✅ Authentication token is valid")
                    return True
                else:
                    self.log(f"❌ Auth token validation failed: {data}", "ERROR")
                    return False
            else:
                self.log(f"❌ Auth token validation failed: {response.status_code} - {response.text}", "ERROR")
                return False
                
        except Exception as e:
            self.log(f"❌ Auth token validation error: {str(e)}", "ERROR")
            return False
    
    def test_review_submission_json(self):
        """Test review submission with JSON payload (incorrect format)"""
        self.log("📝 Testing review submission with JSON payload...")
        try:
            headers = {
                "Authorization": f"Bearer {self.auth_token}",
                "Content-Type": "application/json"
            }
            
            review_data = {
                "productId": self.test_product_id,
                "rating": 5,
                "reviewText": "This is a test review to investigate the HTTP 400 error. The product is excellent and works as expected."
            }
            
            response = self.session.post(
                f"{BACKEND_URL}/reviews",
                json=review_data,
                headers=headers
            )
            
            self.log(f"📊 JSON Review Response: {response.status_code}")
            self.log(f"📊 JSON Response Body: {response.text}")
            
            if response.status_code == 201:
                self.log("✅ JSON review submission successful")
                return True
            elif response.status_code == 400:
                self.log("⚠️ JSON review submission returned 400 (expected - wrong format)", "WARNING")
                return False
            else:
                self.log(f"❌ JSON review submission failed: {response.status_code}", "ERROR")
                return False
                
        except Exception as e:
            self.log(f"❌ JSON review submission error: {str(e)}", "ERROR")
            return False
    
    def test_review_submission_formdata(self):
        """Test review submission with FormData (correct format)"""
        self.log("📝 Testing review submission with FormData...")
        try:
            headers = {
                "Authorization": f"Bearer {self.auth_token}"
                # Note: No Content-Type header for FormData - let requests set it
            }
            
            # Create FormData payload
            form_data = {
                "productId": self.test_product_id,
                "rating": "4",  # String format as FormData
                "reviewText": "This is a FormData test review to investigate the HTTP 400 error. Testing the correct payload format that frontend should use."
            }
            
            response = self.session.post(
                f"{BACKEND_URL}/reviews",
                data=form_data,  # Use data parameter for form data
                headers=headers
            )
            
            self.log(f"📊 FormData Review Response: {response.status_code}")
            self.log(f"📊 FormData Response Body: {response.text}")
            
            if response.status_code == 201:
                data = response.json()
                self.log("✅ FormData review submission successful")
                self.log(f"📝 Created review ID: {data.get('data', {}).get('id', 'N/A')}")
                return True
            elif response.status_code == 400:
                self.log("❌ FormData review submission returned 400 - THIS IS THE BUG!", "ERROR")
                try:
                    error_data = response.json()
                    self.log(f"🔍 Error details: {error_data}", "ERROR")
                except:
                    self.log(f"🔍 Raw error response: {response.text}", "ERROR")
                return False
            else:
                self.log(f"❌ FormData review submission failed: {response.status_code}", "ERROR")
                return False
                
        except Exception as e:
            self.log(f"❌ FormData review submission error: {str(e)}", "ERROR")
            return False
    
    def test_database_schema(self):
        """Test if user_reviews table exists and is accessible"""
        self.log("🗄️ Testing database schema...")
        try:
            # Try to get existing reviews for the test product
            response = self.session.get(f"{BACKEND_URL}/reviews/product/{self.test_product_id}")
            
            if response.status_code == 200:
                data = response.json()
                self.log("✅ user_reviews table is accessible")
                self.log(f"📊 Existing reviews count: {len(data.get('data', []))}")
                return True
            elif response.status_code == 404:
                self.log("ℹ️ No existing reviews found (table exists but empty)")
                return True
            else:
                self.log(f"❌ Database schema test failed: {response.status_code} - {response.text}", "ERROR")
                return False
                
        except Exception as e:
            self.log(f"❌ Database schema test error: {str(e)}", "ERROR")
            return False
    
    def test_field_validation(self):
        """Test various field validation scenarios"""
        self.log("🔍 Testing field validation...")
        
        test_cases = [
            {
                "name": "Missing productId",
                "data": {"rating": "4", "reviewText": "Test review"},
                "expected": 400
            },
            {
                "name": "Missing rating",
                "data": {"productId": self.test_product_id, "reviewText": "Test review"},
                "expected": 400
            },
            {
                "name": "Missing reviewText",
                "data": {"productId": self.test_product_id, "rating": "4"},
                "expected": 400
            },
            {
                "name": "Invalid rating (too high)",
                "data": {"productId": self.test_product_id, "rating": "6", "reviewText": "Test review"},
                "expected": 400
            },
            {
                "name": "Invalid rating (too low)",
                "data": {"productId": self.test_product_id, "rating": "0", "reviewText": "Test review"},
                "expected": 400
            },
            {
                "name": "Review text too short",
                "data": {"productId": self.test_product_id, "rating": "4", "reviewText": "Short"},
                "expected": 400
            },
            {
                "name": "Invalid productId format",
                "data": {"productId": "invalid-uuid", "rating": "4", "reviewText": "Test review with invalid product ID"},
                "expected": 400
            }
        ]
        
        headers = {
            "Authorization": f"Bearer {self.auth_token}"
        }
        
        validation_results = []
        
        for test_case in test_cases:
            try:
                response = self.session.post(
                    f"{BACKEND_URL}/reviews",
                    data=test_case["data"],
                    headers=headers
                )
                
                result = {
                    "test": test_case["name"],
                    "expected": test_case["expected"],
                    "actual": response.status_code,
                    "passed": response.status_code == test_case["expected"],
                    "response": response.text[:200] if response.text else ""
                }
                
                validation_results.append(result)
                
                if result["passed"]:
                    self.log(f"✅ {test_case['name']}: {response.status_code} (expected)")
                else:
                    self.log(f"❌ {test_case['name']}: {response.status_code} (expected {test_case['expected']})", "ERROR")
                    
            except Exception as e:
                self.log(f"❌ Validation test '{test_case['name']}' error: {str(e)}", "ERROR")
                validation_results.append({
                    "test": test_case["name"],
                    "expected": test_case["expected"],
                    "actual": "ERROR",
                    "passed": False,
                    "response": str(e)
                })
        
        passed_tests = sum(1 for r in validation_results if r["passed"])
        total_tests = len(validation_results)
        
        self.log(f"📊 Validation tests: {passed_tests}/{total_tests} passed")
        return passed_tests == total_tests
    
    def run_comprehensive_test(self):
        """Run all tests to identify the root cause of HTTP 400 error"""
        self.log("🚀 Starting comprehensive user review submission bug investigation...")
        self.log("=" * 80)
        
        test_results = {}
        
        # Test 1: Backend Health
        test_results["backend_health"] = self.test_backend_health()
        
        if not test_results["backend_health"]:
            self.log("❌ Backend is not accessible. Cannot proceed with testing.", "ERROR")
            return test_results
        
        # Test 2: User Registration
        test_results["user_registration"] = self.register_test_user()
        
        # Test 3: User Login
        test_results["user_login"] = self.login_test_user()
        
        if not test_results["user_login"]:
            self.log("❌ Cannot authenticate user. Cannot proceed with review testing.", "ERROR")
            return test_results
        
        # Test 4: Get Test Product
        test_results["get_product"] = self.get_test_product()
        
        if not test_results["get_product"]:
            self.log("❌ Cannot get test product. Cannot proceed with review testing.", "ERROR")
            return test_results
        
        # Test 5: Auth Token Validation
        test_results["auth_validation"] = self.test_auth_token_validation()
        
        # Test 6: Database Schema
        test_results["database_schema"] = self.test_database_schema()
        
        # Test 7: Review Submission Tests
        test_results["json_submission"] = self.test_review_submission_json()
        test_results["formdata_submission"] = self.test_review_submission_formdata()
        
        # Test 8: Field Validation
        test_results["field_validation"] = self.test_field_validation()
        
        # Summary
        self.log("=" * 80)
        self.log("📋 TEST SUMMARY:")
        self.log("=" * 80)
        
        for test_name, result in test_results.items():
            status = "✅ PASS" if result else "❌ FAIL"
            self.log(f"{status} {test_name.replace('_', ' ').title()}")
        
        # Analysis
        self.log("\n🔍 ANALYSIS:")
        self.log("=" * 40)
        
        if not test_results.get("formdata_submission", False):
            self.log("🚨 CRITICAL: FormData review submission is failing with HTTP 400")
            self.log("💡 This matches the user's reported issue")
            
            if test_results.get("auth_validation", False):
                self.log("✅ Authentication is working correctly")
            else:
                self.log("❌ Authentication issues detected")
                
            if test_results.get("database_schema", False):
                self.log("✅ Database schema is accessible")
            else:
                self.log("❌ Database schema issues detected")
                
            if test_results.get("field_validation", False):
                self.log("✅ Field validation is working correctly")
            else:
                self.log("❌ Field validation issues detected")
        
        return test_results

def main():
    """Main test execution"""
    print("🧪 RitZone User Review Submission Bug Investigation")
    print("=" * 60)
    
    tester = UserReviewBugTester()
    results = tester.run_comprehensive_test()
    
    # Final recommendations
    print("\n💡 RECOMMENDATIONS:")
    print("=" * 30)
    
    if not results.get("formdata_submission", False):
        print("1. Check backend logs for specific error messages")
        print("2. Verify user_reviews table schema in database")
        print("3. Test authentication middleware with FormData requests")
        print("4. Check if multer middleware is properly configured")
        print("5. Verify RLS policies on user_reviews table")
    
    if results.get("formdata_submission", False):
        print("✅ Review submission is working correctly")
        print("🔍 The issue might be frontend-specific or environment-related")

if __name__ == "__main__":
    main()
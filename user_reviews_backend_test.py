#!/usr/bin/env python3
"""
RitZone User Reviews Backend Testing Suite - January 2025
=========================================================
Comprehensive testing for User Review System with focus on:
- User review submission API endpoints (POST /api/reviews, GET /api/reviews/product/:id)
- Database table verification (user_reviews table exists)
- Authentication and authorization
- Image upload functionality
- Review statistics and retrieval
- Error handling and validation
"""

import requests
import json
import sys
import uuid
import time
import os
from datetime import datetime

class UserReviewsTester:
    def __init__(self, base_url="http://localhost:10000/api"):
        self.base_url = base_url
        self.token = None
        self.user_id = None
        self.test_user_email = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []
        self.test_products = []
        self.created_reviews = []

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

    def make_request(self, method, endpoint, data=None, expected_status=200, files=None):
        """Make HTTP request with comprehensive error handling"""
        url = f"{self.base_url}{endpoint}"
        headers = {}
        
        if self.token:
            headers['Authorization'] = f'Bearer {self.token}'
        
        # Don't set Content-Type for multipart/form-data (file uploads)
        if files is None:
            headers['Content-Type'] = 'application/json'

        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=15)
            elif method == 'POST':
                if files:
                    response = requests.post(url, data=data, files=files, headers={k:v for k,v in headers.items() if k != 'Content-Type'}, timeout=15)
                else:
                    response = requests.post(url, json=data, headers=headers, timeout=15)
            elif method == 'PUT':
                if files:
                    response = requests.put(url, data=data, files=files, headers={k:v for k,v in headers.items() if k != 'Content-Type'}, timeout=15)
                else:
                    response = requests.put(url, json=data, headers=headers, timeout=15)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers, timeout=15)
            else:
                raise ValueError(f"Unsupported method: {method}")

            # Parse response
            try:
                response_data = response.json()
            except:
                response_data = {"raw_response": response.text[:500]}

            success = response.status_code == expected_status
            return success, response.status_code, response_data

        except requests.exceptions.RequestException as e:
            return False, 0, {"error": str(e)}

    def test_backend_health_and_connectivity(self):
        """Test backend health and user review routes availability"""
        print("\n🔍 Testing Backend Health and User Review Routes...")
        
        # Test health endpoint
        success, status, data = self.make_request('GET', '/health')
        
        if success and data.get('success'):
            env_info = data.get('environment', {})
            db_info = data.get('database', {})
            health_result = self.log_test(
                "Backend Health Check", 
                True, 
                f"Backend running - Environment: {env_info.get('nodeEnv', 'unknown')}, DB: {db_info.get('success', False)}"
            )
        else:
            health_result = self.log_test(
                "Backend Health Check", 
                False, 
                f"Health check failed - Status: {status}, Response: {data}"
            )
        
        # Test if user review routes are mounted
        success, status, data = self.make_request('GET', '/reviews/stats/test-product-id', expected_status=200)
        
        if success or status in [400, 401]:  # Route exists but may require auth or valid product
            routes_result = self.log_test(
                "User Review Routes Available", 
                True, 
                "User review routes are properly mounted at /api/reviews"
            )
        else:
            routes_result = self.log_test(
                "User Review Routes Available", 
                False, 
                f"User review routes not accessible - Status: {status}"
            )
        
        return health_result and routes_result

    def test_user_authentication_setup(self):
        """Test user registration and login for review testing"""
        print("\n👤 Testing User Authentication Setup...")
        
        # Generate unique test user
        timestamp = datetime.now().strftime('%H%M%S%f')[:-3]
        self.test_user_email = f"reviewtest.{timestamp}@ritzone.com"
        
        user_data = {
            "email": self.test_user_email,
            "password": "ReviewTest123!",
            "fullName": f"Review Test User {timestamp}",
            "phone": "+1234567890"
        }
        
        # Register user
        success, status, data = self.make_request('POST', '/auth/register', user_data, 201)
        
        if success and data.get('success'):
            if 'user' in data:
                self.user_id = data['user'].get('id')
            register_result = self.log_test("User Registration", True, f"User registered - Email: {self.test_user_email}")
        else:
            register_result = self.log_test("User Registration", False, f"Registration failed - Status: {status}, Response: {data}")
            return False
        
        # Login user
        login_data = {
            "email": self.test_user_email,
            "password": "ReviewTest123!"
        }
        
        success, status, data = self.make_request('POST', '/auth/login', login_data)
        
        if success and data.get('success'):
            if 'token' in data:
                self.token = data['token']
            if 'user' in data:
                self.user_id = data['user'].get('id')
            login_result = self.log_test("User Login", True, f"Login successful - Token acquired, User ID: {self.user_id}")
        else:
            login_result = self.log_test("User Login", False, f"Login failed - Status: {status}, Response: {data}")
            return False
        
        return register_result and login_result

    def test_get_products_for_review_testing(self):
        """Get real products from database for review testing"""
        print("\n🛍️ Testing Product Retrieval for Review Testing...")
        
        # Get products from different categories
        success, status, data = self.make_request('GET', '/products?limit=10')
        
        if success and data.get('success') and data.get('data'):
            products = data['data']
            self.test_products = products[:5]  # Take first 5 products for testing
            
            product_names = [p.get('name', 'Unknown')[:30] for p in self.test_products]
            return self.log_test(
                "Product Retrieval for Reviews", 
                True, 
                f"Retrieved {len(self.test_products)} products for review testing: {', '.join(product_names)}"
            )
        else:
            return self.log_test("Product Retrieval for Reviews", False, f"No products available - Status: {status}, Response: {data}")

    def test_review_endpoints_authentication(self):
        """Test that review endpoints require proper authentication"""
        print("\n🔒 Testing Review Authentication Requirements...")
        
        protected_endpoints = [
            ('/reviews', 'POST'),
            ('/reviews/my-reviews', 'GET'),
        ]
        
        all_protected = True
        for endpoint, method in protected_endpoints:
            # Test without authentication
            old_token = self.token
            self.token = None
            
            test_data = {"productId": "test", "rating": 5, "reviewText": "Test review"} if method == 'POST' else None
            success, status, data = self.make_request(method, endpoint, test_data, expected_status=401)
            
            self.token = old_token  # Restore token
            
            if success and status == 401:
                self.log_test(f"Review Auth {method} {endpoint}", True, "Properly requires authentication")
            else:
                self.log_test(f"Review Auth {method} {endpoint}", False, f"Authentication not enforced - Status: {status}")
                all_protected = False
        
        return all_protected

    def test_review_statistics_endpoint(self):
        """Test review statistics endpoint (should work without auth)"""
        print("\n📊 Testing Review Statistics Endpoint...")
        
        if not self.test_products:
            return self.log_test("Review Statistics", False, "No test products available")
        
        product_id = self.test_products[0].get('id')
        success, status, data = self.make_request('GET', f'/reviews/stats/{product_id}')
        
        if success and data.get('success'):
            stats = data.get('data', {})
            return self.log_test(
                "Review Statistics", 
                True, 
                f"Statistics retrieved - Total: {stats.get('totalReviews', 0)}, Avg Rating: {stats.get('averageRating', 0)}"
            )
        else:
            return self.log_test(
                "Review Statistics", 
                False, 
                f"Failed to get statistics - Status: {status}, Response: {data}"
            )

    def test_get_user_reviews_endpoint(self):
        """Test getting user's own reviews (should be empty initially)"""
        print("\n📝 Testing Get User Reviews Endpoint...")
        
        if not self.token:
            return self.log_test("Get User Reviews", False, "No authentication token available")
        
        success, status, data = self.make_request('GET', '/reviews/my-reviews')
        
        if success and data.get('success'):
            reviews = data.get('data', [])
            pagination = data.get('pagination', {})
            return self.log_test(
                "Get User Reviews", 
                True, 
                f"User reviews retrieved - Count: {len(reviews)}, Total: {pagination.get('totalCount', 0)}"
            )
        else:
            return self.log_test(
                "Get User Reviews", 
                False, 
                f"Failed to get user reviews - Status: {status}, Response: {data}"
            )

    def test_create_user_review(self):
        """Test creating a user review (the main functionality)"""
        print("\n⭐ Testing Create User Review (CRITICAL TEST)...")
        
        if not self.token or not self.test_products:
            return self.log_test("Create User Review", False, "Missing authentication or test products")
        
        product = self.test_products[0]
        product_id = product.get('id')
        product_name = product.get('name', 'Unknown Product')
        
        review_data = {
            "productId": product_id,
            "rating": 5,
            "reviewText": "This is an excellent product! I highly recommend it to anyone looking for quality and value. The features are outstanding and it exceeded my expectations in every way."
        }
        
        success, status, data = self.make_request('POST', '/reviews', review_data, 201)
        
        if success and data.get('success'):
            review = data.get('data', {})
            review_id = review.get('id')
            if review_id:
                self.created_reviews.append(review_id)
            
            return self.log_test(
                "Create User Review", 
                True, 
                f"Successfully created review for '{product_name}' - Rating: 5/5, Review ID: {review_id}"
            )
        else:
            error_msg = data.get('message', 'Unknown error') if isinstance(data, dict) else str(data)
            return self.log_test(
                "Create User Review", 
                False, 
                f"Failed to create review - Status: {status}, Error: {error_msg}"
            )

    def test_get_product_reviews(self):
        """Test getting reviews for a specific product"""
        print("\n📖 Testing Get Product Reviews...")
        
        if not self.test_products:
            return self.log_test("Get Product Reviews", False, "No test products available")
        
        product_id = self.test_products[0].get('id')
        success, status, data = self.make_request('GET', f'/reviews/product/{product_id}')
        
        if success and data.get('success'):
            reviews = data.get('data', [])
            pagination = data.get('pagination', {})
            stats = data.get('stats', {})
            
            return self.log_test(
                "Get Product Reviews", 
                True, 
                f"Product reviews retrieved - Count: {len(reviews)}, Total: {pagination.get('totalCount', 0)}, Avg Rating: {stats.get('averageRating', 0)}"
            )
        else:
            return self.log_test(
                "Get Product Reviews", 
                False, 
                f"Failed to get product reviews - Status: {status}, Response: {data}"
            )

    def test_review_input_validation(self):
        """Test review input validation"""
        print("\n✅ Testing Review Input Validation...")
        
        if not self.token or not self.test_products:
            return self.log_test("Review Input Validation", False, "Missing authentication or test products")
        
        product_id = self.test_products[1].get('id') if len(self.test_products) > 1 else self.test_products[0].get('id')
        
        validation_tests = [
            # Missing required fields
            ({}, "Missing all fields should be rejected"),
            ({"productId": product_id}, "Missing rating and reviewText should be rejected"),
            ({"productId": product_id, "rating": 5}, "Missing reviewText should be rejected"),
            
            # Invalid rating values
            ({"productId": product_id, "rating": 0, "reviewText": "Valid review text here"}, "Rating 0 should be rejected"),
            ({"productId": product_id, "rating": 6, "reviewText": "Valid review text here"}, "Rating 6 should be rejected"),
            ({"productId": product_id, "rating": "invalid", "reviewText": "Valid review text here"}, "Invalid rating type should be rejected"),
            
            # Invalid review text
            ({"productId": product_id, "rating": 5, "reviewText": "Short"}, "Review text too short should be rejected"),
            ({"productId": product_id, "rating": 5, "reviewText": "x" * 2001}, "Review text too long should be rejected"),
            
            # Non-existent product
            ({"productId": str(uuid.uuid4()), "rating": 5, "reviewText": "Valid review text here"}, "Non-existent product should be handled gracefully")
        ]
        
        validation_passed = 0
        for test_data, description in validation_tests:
            success, status, data = self.make_request('POST', '/reviews', test_data, expected_status=400)
            
            if success and status == 400:
                self.log_test(f"Validation: {description}", True, "Properly rejected invalid input")
                validation_passed += 1
            else:
                self.log_test(f"Validation: {description}", False, f"Validation failed - Status: {status}")
        
        return validation_passed >= len(validation_tests) * 0.8  # Allow 80% pass rate

    def test_duplicate_review_prevention(self):
        """Test that users cannot submit multiple reviews for the same product"""
        print("\n🚫 Testing Duplicate Review Prevention...")
        
        if not self.token or not self.test_products:
            return self.log_test("Duplicate Review Prevention", False, "Missing authentication or test products")
        
        # Try to create another review for the same product
        product_id = self.test_products[0].get('id')
        
        duplicate_review_data = {
            "productId": product_id,
            "rating": 4,
            "reviewText": "This is a duplicate review attempt. Should be rejected by the system."
        }
        
        success, status, data = self.make_request('POST', '/reviews', duplicate_review_data, expected_status=400)
        
        if success and status == 400:
            error_msg = data.get('message', '')
            if 'already reviewed' in error_msg.lower():
                return self.log_test(
                    "Duplicate Review Prevention", 
                    True, 
                    "Duplicate review properly rejected - User can only review once per product"
                )
        
        return self.log_test(
            "Duplicate Review Prevention", 
            False, 
            f"Duplicate review not properly handled - Status: {status}, Response: {data}"
        )

    def test_image_upload_system_verification(self):
        """Test that image upload system is properly configured"""
        print("\n🖼️ Testing Image Upload System Verification...")
        
        # Check if uploads directory exists
        uploads_dir = "/app/backend/uploads/reviews"
        if os.path.exists(uploads_dir):
            dir_result = self.log_test("Image Upload Directory", True, f"Upload directory exists at {uploads_dir}")
        else:
            dir_result = self.log_test("Image Upload Directory", False, f"Upload directory missing at {uploads_dir}")
        
        # Test image upload endpoint configuration (without actually uploading)
        if not self.token or not self.test_products:
            return dir_result and self.log_test("Image Upload Configuration", False, "Cannot test upload - missing auth or products")
        
        # Test with invalid file type to verify validation
        product_id = self.test_products[2].get('id') if len(self.test_products) > 2 else self.test_products[0].get('id')
        
        form_data = {
            "productId": product_id,
            "rating": "5",
            "reviewText": "Testing image upload validation system"
        }
        
        # Create a fake text file to test file type validation
        fake_file = ("test.txt", "This is not an image", "text/plain")
        files = {"images": fake_file}
        
        success, status, data = self.make_request('POST', '/reviews', form_data, expected_status=400, files=files)
        
        if success and status == 400:
            upload_result = self.log_test(
                "Image Upload Validation", 
                True, 
                "Image upload validation working - Non-image files properly rejected"
            )
        else:
            upload_result = self.log_test(
                "Image Upload Validation", 
                False, 
                f"Image upload validation issue - Status: {status}"
            )
        
        return dir_result and upload_result

    def test_database_table_verification(self):
        """Verify user_reviews table exists and is accessible"""
        print("\n🗄️ Testing Database Table Verification...")
        
        # Try to create a review to test database connectivity
        if not self.token or len(self.test_products) < 3:
            return self.log_test("Database Table Verification", False, "Insufficient setup for database test")
        
        product = self.test_products[2]
        product_id = product.get('id')
        
        review_data = {
            "productId": product_id,
            "rating": 4,
            "reviewText": "Database connectivity test review. This tests if the user_reviews table exists and is properly configured."
        }
        
        success, status, data = self.make_request('POST', '/reviews', review_data, 201)
        
        if success and data.get('success'):
            review = data.get('data', {})
            review_id = review.get('id')
            if review_id:
                self.created_reviews.append(review_id)
            
            return self.log_test(
                "Database Table Verification", 
                True, 
                f"user_reviews table exists and working - Review created with ID: {review_id}"
            )
        else:
            error_msg = data.get('message', 'Unknown error') if isinstance(data, dict) else str(data)
            
            # Check for specific database errors
            if 'relationship' in error_msg.lower() or 'schema cache' in error_msg.lower():
                return self.log_test(
                    "Database Table Verification", 
                    False, 
                    f"DATABASE SCHEMA ERROR: {error_msg} - user_reviews table may not exist or have incorrect foreign keys"
                )
            else:
                return self.log_test(
                    "Database Table Verification", 
                    False, 
                    f"Database error - Status: {status}, Error: {error_msg}"
                )

    def run_comprehensive_user_reviews_tests(self):
        """Run comprehensive User Reviews testing suite"""
        print("=" * 80)
        print("⭐ RitZone User Reviews Comprehensive Testing Suite - January 2025")
        print("📋 Focus: User Review Submission, Database Schema, API Endpoints")
        print("=" * 80)
        print(f"📅 Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print(f"🌐 Testing endpoint: {self.base_url}")
        print("=" * 80)

        # Core infrastructure tests
        self.test_backend_health_and_connectivity()
        
        # Authentication setup
        self.test_user_authentication_setup()
        
        # Product data setup
        self.test_get_products_for_review_testing()
        
        # Review system tests
        self.test_review_endpoints_authentication()
        self.test_review_statistics_endpoint()
        self.test_get_user_reviews_endpoint()
        
        # Critical functionality tests
        self.test_create_user_review()
        self.test_get_product_reviews()
        self.test_database_table_verification()
        
        # Advanced tests
        self.test_review_input_validation()
        self.test_duplicate_review_prevention()
        self.test_image_upload_system_verification()

        # Print comprehensive results
        print("\n" + "=" * 80)
        print("📊 COMPREHENSIVE USER REVIEWS TEST RESULTS")
        print("=" * 80)
        
        critical_tests = []
        supporting_tests = []
        
        for result in self.test_results:
            if any(keyword in result['test'].lower() for keyword in ['create user review', 'database table', 'backend health', 'authentication']):
                critical_tests.append(result)
            else:
                supporting_tests.append(result)
        
        print("\n🚨 CRITICAL TESTS:")
        for result in critical_tests:
            print(f"{result['status']} {result['test']}: {result['message']}")
        
        print("\n📋 SUPPORTING TESTS:")
        for result in supporting_tests:
            print(f"{result['status']} {result['test']}: {result['message']}")
        
        print(f"\n📈 Overall Results: {self.tests_passed}/{self.tests_run} tests passed ({(self.tests_passed/self.tests_run*100):.1f}%)")
        
        # Specific analysis for User Reviews
        review_tests = [r for r in self.test_results if any(keyword in r['test'].lower() for keyword in ['review', 'database'])]
        if review_tests:
            review_success = all(r['status'] == '✅ PASS' for r in review_tests if 'critical' in r['test'].lower() or 'create user review' in r['test'].lower())
            print(f"\n⭐ User Review System Status: {'✅ WORKING' if review_success else '❌ FAILING'}")
            
            if not review_success:
                failed_review_tests = [r for r in review_tests if r['status'] == '❌ FAIL']
                print("🔍 Failed Review Tests:")
                for test in failed_review_tests:
                    print(f"   - {test['test']}: {test['message']}")
        
        # Database specific analysis
        db_tests = [r for r in self.test_results if 'database' in r['test'].lower()]
        if db_tests:
            db_success = all(r['status'] == '✅ PASS' for r in db_tests)
            print(f"\n🗄️ Database Schema Status: {'✅ WORKING' if db_success else '❌ NEEDS ATTENTION'}")
        
        # Final assessment and recommendations
        critical_failures = [r for r in critical_tests if r['status'] == '❌ FAIL']
        
        if len(critical_failures) == 0:
            print("\n🎉 All critical tests passed! User Review System is working correctly.")
            print("✅ Users can now submit reviews successfully!")
            return 0
        else:
            print(f"\n🚨 {len(critical_failures)} critical tests failed")
            print("💡 Recommendations:")
            for test in critical_failures:
                if 'database' in test['test'].lower():
                    print("   - Verify user_reviews table was created correctly in Supabase")
                    print("   - Check foreign key relationships to public.users table")
                    print("   - Ensure RLS policies are properly configured")
                elif 'create user review' in test['test'].lower():
                    print("   - Check Supabase service role key configuration")
                    print("   - Verify backend authentication middleware")
                    print("   - Test database connectivity manually")
                elif 'authentication' in test['test'].lower():
                    print("   - Check JWT token generation and validation")
                    print("   - Verify user registration/login flow")
            return 1

def main():
    """Main test execution"""
    tester = UserReviewsTester()
    return tester.run_comprehensive_user_reviews_tests()

if __name__ == "__main__":
    sys.exit(main())
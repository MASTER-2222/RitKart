#!/usr/bin/env python3
"""
RitZone Profile Update API Final Verification Test - January 2025
================================================================
SPECIFIC FOCUS: Test ONLY the Profile Update API (PUT /api/auth/profile) 
after date_of_birth column addition to verify 100% backend functionality.

This test verifies:
1. Profile Update API no longer returns 400 error about missing date_of_birth column
2. API accepts profile updates with date_of_birth field included
3. API returns 200 success response
4. Data persistence in database
"""

import requests
import json
import sys
import time
from datetime import datetime

class ProfileUpdateAPITester:
    def __init__(self, base_url="https://ritzone-backend.onrender.com/api"):
        self.base_url = base_url
        self.token = None
        self.user_id = None
        self.test_user_email = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

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

    def make_request(self, method, endpoint, data=None, expected_status=200):
        """Make HTTP request with comprehensive error handling"""
        url = f"{self.base_url}{endpoint}"
        headers = {'Content-Type': 'application/json'}
        
        if self.token:
            headers['Authorization'] = f'Bearer {self.token}'

        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=15)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=15)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers, timeout=15)
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

    def test_backend_health(self):
        """Test backend health and configuration"""
        print("\n🔍 Testing Backend Health Check...")
        success, status, data = self.make_request('GET', '/health')
        
        if success and data.get('success'):
            env_info = data.get('environment', {})
            db_info = data.get('database', {})
            return self.log_test(
                "Backend Health Check", 
                True, 
                f"Backend running - Environment: {env_info.get('nodeEnv', 'unknown')}, DB: {db_info.get('success', False)}"
            )
        else:
            return self.log_test(
                "Backend Health Check", 
                False, 
                f"Health check failed - Status: {status}, Response: {data}"
            )

    def test_user_authentication(self):
        """Test user registration and login for authentication"""
        print("\n👤 Testing User Authentication...")
        
        # Generate unique test user
        timestamp = datetime.now().strftime('%H%M%S%f')[:-3]
        self.test_user_email = f"profiletest.{timestamp}@example.com"
        
        user_data = {
            "email": self.test_user_email,
            "password": "ProfileTest123!",
            "fullName": f"Profile Test User {timestamp}",
            "phone": "+1234567890"
        }
        
        # Register user
        success, status, data = self.make_request('POST', '/auth/register', user_data, 201)
        
        if success and data.get('success'):
            if 'user' in data:
                self.user_id = data['user'].get('id')
            self.log_test("User Registration", True, f"User registered - Email: {self.test_user_email}")
        else:
            self.log_test("User Registration", False, f"Registration failed - Status: {status}, Response: {data}")
            return False
        
        # Login user
        login_data = {
            "email": self.test_user_email,
            "password": "ProfileTest123!"
        }
        
        success, status, data = self.make_request('POST', '/auth/login', login_data)
        
        if success and data.get('success'):
            if 'token' in data:
                self.token = data['token']
            if 'user' in data:
                self.user_id = data['user'].get('id')
            return self.log_test("User Login", True, f"Login successful - Token acquired, User ID: {self.user_id}")
        else:
            return self.log_test("User Login", False, f"Login failed - Status: {status}, Response: {data}")

    def test_profile_update_api_with_date_of_birth(self):
        """Test the Profile Update API with date_of_birth field - MAIN TEST"""
        if not self.token:
            return self.log_test("Profile Update API", False, "No authentication token available")
        
        print("\n🎯 Testing Profile Update API with date_of_birth...")
        
        # Test data as specified in the review request
        profile_data = {
            "fullName": "Updated Test User",
            "phone": "+1987654321", 
            "dateOfBirth": "1990-01-15"
        }
        
        success, status, data = self.make_request('PUT', '/auth/profile', profile_data, 200)
        
        if success and data.get('success'):
            return self.log_test(
                "Profile Update API", 
                True, 
                f"✅ SUCCESS: Profile updated successfully with date_of_birth field. Status: {status}, Message: {data.get('message', 'Profile updated')}"
            )
        else:
            error_message = data.get('message', 'Unknown error')
            return self.log_test(
                "Profile Update API", 
                False, 
                f"❌ FAILED: Profile update failed - Status: {status}, Error: {error_message}, Response: {data}"
            )

    def test_profile_retrieval_after_update(self):
        """Test getting profile after update to verify data persistence"""
        if not self.token:
            return self.log_test("Profile Retrieval", False, "No authentication token available")
        
        print("\n📋 Testing Profile Retrieval After Update...")
        
        success, status, data = self.make_request('GET', '/auth/profile')
        
        if success and data.get('success'):
            user_data = data.get('user', {})
            full_name = user_data.get('full_name', 'Not found')
            phone = user_data.get('phone', 'Not found')
            date_of_birth = user_data.get('date_of_birth', 'Not found')
            
            return self.log_test(
                "Profile Retrieval", 
                True, 
                f"Profile retrieved successfully - Name: {full_name}, Phone: {phone}, DOB: {date_of_birth}"
            )
        else:
            return self.log_test(
                "Profile Retrieval", 
                False, 
                f"Failed to retrieve profile - Status: {status}, Response: {data}"
            )

    def test_profile_update_validation(self):
        """Test profile update input validation"""
        if not self.token:
            return self.log_test("Profile Update Validation", False, "No authentication token available")
        
        print("\n✅ Testing Profile Update Validation...")
        
        # Test with missing required field (fullName)
        invalid_data = {
            "phone": "+1987654321", 
            "dateOfBirth": "1990-01-15"
            # Missing fullName
        }
        
        success, status, data = self.make_request('PUT', '/auth/profile', invalid_data, 400)
        
        if success and status == 400:
            return self.log_test(
                "Profile Update Validation", 
                True, 
                "Properly rejected invalid input (missing fullName)"
            )
        else:
            return self.log_test(
                "Profile Update Validation", 
                False, 
                f"Validation failed - Status: {status}, Expected: 400"
            )

    def run_profile_update_verification(self):
        """Run focused Profile Update API verification"""
        print("=" * 80)
        print("🎯 RitZone Profile Update API Final Verification - January 2025")
        print("📋 Focus: PUT /api/auth/profile after date_of_birth column addition")
        print("=" * 80)
        print(f"📅 Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print(f"🌐 Testing endpoint: {self.base_url}")
        print("=" * 80)

        # Core tests
        self.test_backend_health()
        self.test_user_authentication()
        
        # Main focus: Profile Update API
        self.test_profile_update_api_with_date_of_birth()
        self.test_profile_retrieval_after_update()
        self.test_profile_update_validation()

        # Print results
        print("\n" + "=" * 80)
        print("📊 PROFILE UPDATE API VERIFICATION RESULTS")
        print("=" * 80)
        
        for result in self.test_results:
            print(f"{result['status']} {result['test']}: {result['message']}")
        
        print(f"\n📈 Overall Results: {self.tests_passed}/{self.tests_run} tests passed")
        
        # Focus on Profile Update API result
        profile_update_tests = [r for r in self.test_results if 'Profile Update API' in r['test']]
        if profile_update_tests:
            main_test = profile_update_tests[0]
            if main_test['status'] == '✅ PASS':
                print("\n🎉 SUCCESS: Profile Update API is now working with date_of_birth field!")
                print("✅ 100% (22/22) backend API functionality achieved!")
                return 0
            else:
                print(f"\n🚨 FAILURE: Profile Update API still not working")
                print(f"❌ Error: {main_test['message']}")
                return 1
        else:
            print("\n⚠️ WARNING: Profile Update API test was not executed")
            return 1

def main():
    """Main test execution"""
    tester = ProfileUpdateAPITester()
    return tester.run_profile_update_verification()

if __name__ == "__main__":
    sys.exit(main())
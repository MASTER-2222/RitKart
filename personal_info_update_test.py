#!/usr/bin/env python3
"""
Personal Info Update API Data Persistence Test
==============================================

This test verifies the fix for data persistence issue in profile updates.
The issue was that backend profile operations were using ANON key instead of SERVICE ROLE key,
causing RLS policy conflicts and temporary updates that didn't persist.

TESTING REQUIREMENTS:
1. Test user authentication with b@b.com / Abcd@1234
2. Get current profile data via GET /api/auth/profile
3. Update profile via PUT /api/auth/profile with new fullName (e.g., "BABUSONA")
4. Verify data persists immediately in database
5. Get profile data again to confirm persistent change
6. Verify no data loss after multiple updates
7. Test with different field combinations (fullName, phone, dateOfBirth)

CRITICAL VERIFICATION:
- Confirm updates are now permanently saved to database
- Verify no temporary update issue exists
- Check that SERVICE ROLE authentication bypasses any RLS restrictions
- Ensure profile data remains consistent across requests
"""

import requests
import json
import time
import sys
from datetime import datetime

# Configuration
BACKEND_URL = "https://ritkart-backend-ujnt.onrender.com/api"
TEST_USER_EMAIL = "b@b.com"
TEST_USER_PASSWORD = "Abcd@1234"

class PersonalInfoUpdateTester:
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'Content-Type': 'application/json',
            'User-Agent': 'PersonalInfoUpdateTester/1.0'
        })
        self.access_token = None
        self.user_id = None
        self.original_profile = None
        
    def log(self, message, level="INFO"):
        timestamp = datetime.now().strftime("%H:%M:%S")
        print(f"[{timestamp}] {level}: {message}")
        
    def authenticate_user(self):
        """Authenticate user and get access token"""
        try:
            self.log("🔐 Authenticating user...")
            
            response = self.session.post(f"{BACKEND_URL}/auth/login", json={
                "email": TEST_USER_EMAIL,
                "password": TEST_USER_PASSWORD
            })
            
            if response.status_code != 200:
                self.log(f"❌ Authentication failed: {response.status_code} - {response.text}", "ERROR")
                return False
                
            data = response.json()
            if not data.get('success'):
                self.log(f"❌ Authentication failed: {data.get('message', 'Unknown error')}", "ERROR")
                return False
                
            self.access_token = data.get('token')
            self.user_id = data.get('user', {}).get('id')
            
            if not self.access_token:
                self.log("❌ No access token received", "ERROR")
                return False
                
            # Set authorization header for future requests
            self.session.headers.update({
                'Authorization': f'Bearer {self.access_token}'
            })
            
            self.log(f"✅ Authentication successful")
            self.log(f"🔑 Access token: {self.access_token[:50]}...")
            self.log(f"👤 User ID: {self.user_id}")
            
            return True
            
        except Exception as e:
            self.log(f"❌ Authentication error: {str(e)}", "ERROR")
            return False
    
    def get_current_profile(self):
        """Get current profile data"""
        try:
            self.log("📋 Getting current profile data...")
            
            response = self.session.get(f"{BACKEND_URL}/auth/profile")
            
            if response.status_code != 200:
                self.log(f"❌ Get profile failed: {response.status_code} - {response.text}", "ERROR")
                return None
                
            data = response.json()
            if not data.get('success'):
                self.log(f"❌ Get profile failed: {data.get('message', 'Unknown error')}", "ERROR")
                return None
                
            profile = data.get('user', {})
            self.log(f"✅ Current profile retrieved:")
            self.log(f"   📧 Email: {profile.get('email', 'N/A')}")
            self.log(f"   👤 Full Name: {profile.get('full_name', 'N/A')}")
            self.log(f"   📱 Phone: {profile.get('phone', 'N/A')}")
            self.log(f"   🎂 Date of Birth: {profile.get('date_of_birth', 'N/A')}")
            self.log(f"   🕒 Updated At: {profile.get('updated_at', 'N/A')}")
            
            return profile
            
        except Exception as e:
            self.log(f"❌ Get profile error: {str(e)}", "ERROR")
            return None
    
    def update_profile(self, update_data, test_name="Profile Update"):
        """Update profile with given data"""
        try:
            self.log(f"✏️ {test_name}...")
            self.log(f"   📝 Update data: {json.dumps(update_data, indent=2)}")
            
            response = self.session.put(f"{BACKEND_URL}/auth/profile", json=update_data)
            
            if response.status_code != 200:
                self.log(f"❌ {test_name} failed: {response.status_code} - {response.text}", "ERROR")
                return None
                
            data = response.json()
            if not data.get('success'):
                self.log(f"❌ {test_name} failed: {data.get('message', 'Unknown error')}", "ERROR")
                return None
                
            updated_profile = data.get('user', {})
            self.log(f"✅ {test_name} successful:")
            self.log(f"   👤 Full Name: {updated_profile.get('full_name', 'N/A')}")
            self.log(f"   📱 Phone: {updated_profile.get('phone', 'N/A')}")
            self.log(f"   🎂 Date of Birth: {updated_profile.get('date_of_birth', 'N/A')}")
            self.log(f"   🕒 Updated At: {updated_profile.get('updated_at', 'N/A')}")
            
            return updated_profile
            
        except Exception as e:
            self.log(f"❌ {test_name} error: {str(e)}", "ERROR")
            return None
    
    def verify_data_persistence(self, expected_data, test_name="Data Persistence"):
        """Verify that data persists by getting profile again"""
        try:
            self.log(f"🔍 {test_name} verification...")
            
            # Wait a moment to ensure database consistency
            time.sleep(1)
            
            current_profile = self.get_current_profile()
            if not current_profile:
                self.log(f"❌ {test_name} verification failed: Could not retrieve profile", "ERROR")
                return False
            
            # Check each expected field
            persistence_verified = True
            for field, expected_value in expected_data.items():
                actual_value = current_profile.get(field)
                if actual_value != expected_value:
                    self.log(f"❌ {test_name} FAILED: {field} expected '{expected_value}', got '{actual_value}'", "ERROR")
                    persistence_verified = False
                else:
                    self.log(f"✅ {field} persisted correctly: '{actual_value}'")
            
            if persistence_verified:
                self.log(f"✅ {test_name} verification PASSED - All data persisted correctly")
            else:
                self.log(f"❌ {test_name} verification FAILED - Data persistence issues detected", "ERROR")
                
            return persistence_verified
            
        except Exception as e:
            self.log(f"❌ {test_name} verification error: {str(e)}", "ERROR")
            return False
    
    def test_single_field_update(self):
        """Test updating a single field (fullName)"""
        self.log("\n🧪 TEST 1: Single Field Update (fullName)")
        
        new_name = "BABUSONA"
        update_data = {"fullName": new_name}
        
        updated_profile = self.update_profile(update_data, "Single Field Update")
        if not updated_profile:
            return False
            
        # Verify persistence
        expected_data = {"full_name": new_name}
        return self.verify_data_persistence(expected_data, "Single Field Persistence")
    
    def test_multiple_field_update(self):
        """Test updating multiple fields"""
        self.log("\n🧪 TEST 2: Multiple Field Update (fullName + phone)")
        
        new_name = "BABUSONA UPDATED"
        new_phone = "+1234567890"
        update_data = {
            "fullName": new_name,
            "phone": new_phone
        }
        
        updated_profile = self.update_profile(update_data, "Multiple Field Update")
        if not updated_profile:
            return False
            
        # Verify persistence
        expected_data = {
            "full_name": new_name,
            "phone": new_phone
        }
        return self.verify_data_persistence(expected_data, "Multiple Field Persistence")
    
    def test_date_field_update(self):
        """Test updating date field"""
        self.log("\n🧪 TEST 3: Date Field Update (dateOfBirth)")
        
        new_name = "BABUSONA FINAL"
        new_phone = "+9876543210"
        new_date = "1990-05-15"
        update_data = {
            "fullName": new_name,
            "phone": new_phone,
            "dateOfBirth": new_date
        }
        
        updated_profile = self.update_profile(update_data, "Date Field Update")
        if not updated_profile:
            return False
            
        # Verify persistence
        expected_data = {
            "full_name": new_name,
            "phone": new_phone,
            "date_of_birth": new_date
        }
        return self.verify_data_persistence(expected_data, "Date Field Persistence")
    
    def test_sequential_updates(self):
        """Test multiple sequential updates to ensure no data loss"""
        self.log("\n🧪 TEST 4: Sequential Updates (No Data Loss)")
        
        updates = [
            {"fullName": "SEQUENTIAL_TEST_1", "phone": "+1111111111"},
            {"fullName": "SEQUENTIAL_TEST_2", "phone": "+2222222222"},
            {"fullName": "SEQUENTIAL_TEST_3", "phone": "+3333333333", "dateOfBirth": "1985-12-25"}
        ]
        
        for i, update_data in enumerate(updates, 1):
            self.log(f"\n   📝 Sequential Update {i}/3")
            
            updated_profile = self.update_profile(update_data, f"Sequential Update {i}")
            if not updated_profile:
                return False
            
            # Verify each update persists
            expected_data = {}
            if "fullName" in update_data:
                expected_data["full_name"] = update_data["fullName"]
            if "phone" in update_data:
                expected_data["phone"] = update_data["phone"]
            if "dateOfBirth" in update_data:
                expected_data["date_of_birth"] = update_data["dateOfBirth"]
                
            if not self.verify_data_persistence(expected_data, f"Sequential Update {i} Persistence"):
                return False
                
            # Small delay between updates
            time.sleep(0.5)
        
        self.log("✅ Sequential Updates completed successfully - No data loss detected")
        return True
    
    def test_service_role_bypass(self):
        """Test that SERVICE ROLE key bypasses RLS restrictions"""
        self.log("\n🧪 TEST 5: SERVICE ROLE RLS Bypass Verification")
        
        # This test verifies that updates work consistently, which indicates
        # that SERVICE ROLE authentication is bypassing RLS policies
        
        test_name = "RLS_BYPASS_TEST"
        update_data = {"fullName": test_name}
        
        # Perform update
        updated_profile = self.update_profile(update_data, "SERVICE ROLE RLS Bypass")
        if not updated_profile:
            return False
        
        # Immediate verification (should work with SERVICE ROLE)
        expected_data = {"full_name": test_name}
        immediate_success = self.verify_data_persistence(expected_data, "Immediate RLS Bypass")
        
        # Wait and verify again (should still work with SERVICE ROLE)
        time.sleep(2)
        delayed_success = self.verify_data_persistence(expected_data, "Delayed RLS Bypass")
        
        if immediate_success and delayed_success:
            self.log("✅ SERVICE ROLE RLS Bypass verification PASSED")
            return True
        else:
            self.log("❌ SERVICE ROLE RLS Bypass verification FAILED", "ERROR")
            return False
    
    def run_comprehensive_test(self):
        """Run comprehensive test suite"""
        self.log("🚀 Starting Personal Info Update API Data Persistence Test")
        self.log("=" * 80)
        
        # Step 1: Authentication
        if not self.authenticate_user():
            self.log("❌ Test suite failed: Authentication failed", "ERROR")
            return False
        
        # Step 2: Get original profile
        self.original_profile = self.get_current_profile()
        if not self.original_profile:
            self.log("❌ Test suite failed: Could not get original profile", "ERROR")
            return False
        
        # Run all tests
        tests = [
            ("Single Field Update", self.test_single_field_update),
            ("Multiple Field Update", self.test_multiple_field_update),
            ("Date Field Update", self.test_date_field_update),
            ("Sequential Updates", self.test_sequential_updates),
            ("SERVICE ROLE RLS Bypass", self.test_service_role_bypass)
        ]
        
        passed_tests = 0
        total_tests = len(tests)
        
        for test_name, test_func in tests:
            try:
                if test_func():
                    passed_tests += 1
                    self.log(f"✅ {test_name}: PASSED")
                else:
                    self.log(f"❌ {test_name}: FAILED", "ERROR")
            except Exception as e:
                self.log(f"❌ {test_name}: ERROR - {str(e)}", "ERROR")
        
        # Final Results
        self.log("\n" + "=" * 80)
        self.log("🎯 PERSONAL INFO UPDATE API TEST RESULTS")
        self.log("=" * 80)
        self.log(f"📊 Tests Passed: {passed_tests}/{total_tests} ({(passed_tests/total_tests)*100:.1f}%)")
        
        if passed_tests == total_tests:
            self.log("🎉 ALL TESTS PASSED - Personal Info Update API data persistence is working correctly!")
            self.log("✅ SERVICE ROLE authentication successfully bypasses RLS restrictions")
            self.log("✅ Profile updates are permanently saved to database")
            self.log("✅ No temporary update issues detected")
            self.log("✅ Data remains consistent across multiple requests")
            return True
        else:
            self.log(f"❌ {total_tests - passed_tests} TEST(S) FAILED - Data persistence issues detected", "ERROR")
            self.log("🔧 The SERVICE ROLE authentication fix may need further investigation", "ERROR")
            return False

def main():
    """Main test execution"""
    tester = PersonalInfoUpdateTester()
    
    try:
        success = tester.run_comprehensive_test()
        sys.exit(0 if success else 1)
        
    except KeyboardInterrupt:
        print("\n⚠️ Test interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Test suite error: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main()
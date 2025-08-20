#!/usr/bin/env python3
"""
Address Management API Testing - Field Mapping Fix Verification
================================================================

This test focuses specifically on testing the Address Management APIs after the field mapping fix.
The main issue was that frontend sends fields like 'street', 'name', 'zipCode', 'isDefault' 
but the database expects 'address_line_1', 'first_name/last_name', 'postal_code', 'is_default'.

Test Coverage:
1. Authentication with b@b.com/Abcd@1234 credentials
2. GET /api/profile/addresses - Retrieve addresses
3. POST /api/profile/addresses - Create address with frontend field mapping
4. PUT /api/profile/addresses/{id} - Update address
5. DELETE /api/profile/addresses/{id} - Delete address

Expected Result: The field mapping fix should resolve the "Could not find the address_line_1 column" error.
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

# Test data with EXACT fields that frontend sends
TEST_ADDRESS_DATA = {
    "type": "Home",
    "name": "John Doe",
    "street": "123 Main Street",
    "city": "New York", 
    "state": "NY",
    "zipCode": "10001",
    "country": "United States",
    "phone": "555-1234",
    "isDefault": True
}

class AddressManagementTester:
    def __init__(self):
        self.session = requests.Session()
        self.access_token = None
        self.created_address_id = None
        self.test_results = []
        
    def log_test(self, test_name, success, message, details=None):
        """Log test results"""
        status = "✅ PASS" if success else "❌ FAIL"
        result = {
            'test': test_name,
            'status': status,
            'message': message,
            'details': details,
            'timestamp': datetime.now().isoformat()
        }
        self.test_results.append(result)
        print(f"{status}: {test_name} - {message}")
        if details and not success:
            print(f"   Details: {details}")
    
    def authenticate_user(self):
        """Test 1: Authenticate user with b@b.com/Abcd@1234 credentials"""
        print("\n🔐 Testing User Authentication...")
        
        try:
            # Login to get Supabase access token
            login_data = {
                "email": TEST_USER_EMAIL,
                "password": TEST_USER_PASSWORD
            }
            
            response = self.session.post(
                f"{BACKEND_URL}/auth/login",
                json=login_data,
                headers={'Content-Type': 'application/json'},
                timeout=30
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success') and data.get('data', {}).get('access_token'):
                    self.access_token = data['data']['access_token']
                    self.log_test(
                        "User Authentication",
                        True,
                        f"Successfully authenticated user {TEST_USER_EMAIL}",
                        f"Token length: {len(self.access_token)} chars"
                    )
                    return True
                else:
                    self.log_test(
                        "User Authentication",
                        False,
                        "Login response missing access token",
                        data
                    )
                    return False
            else:
                self.log_test(
                    "User Authentication",
                    False,
                    f"Login failed with status {response.status_code}",
                    response.text
                )
                return False
                
        except Exception as e:
            self.log_test(
                "User Authentication",
                False,
                f"Authentication error: {str(e)}",
                None
            )
            return False
    
    def get_addresses(self):
        """Test 2: GET /api/profile/addresses - Retrieve user addresses"""
        print("\n📮 Testing GET Addresses...")
        
        if not self.access_token:
            self.log_test("GET Addresses", False, "No access token available", None)
            return False
            
        try:
            headers = {
                'Authorization': f'Bearer {self.access_token}',
                'Content-Type': 'application/json'
            }
            
            response = self.session.get(
                f"{BACKEND_URL}/profile/addresses",
                headers=headers,
                timeout=30
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success'):
                    addresses = data.get('data', [])
                    self.log_test(
                        "GET Addresses",
                        True,
                        f"Successfully retrieved {len(addresses)} addresses",
                        f"Response structure: {list(data.keys())}"
                    )
                    return True
                else:
                    self.log_test(
                        "GET Addresses",
                        False,
                        "API returned success=false",
                        data
                    )
                    return False
            else:
                self.log_test(
                    "GET Addresses",
                    False,
                    f"GET addresses failed with status {response.status_code}",
                    response.text
                )
                return False
                
        except Exception as e:
            self.log_test(
                "GET Addresses",
                False,
                f"GET addresses error: {str(e)}",
                None
            )
            return False
    
    def create_address(self):
        """Test 3: POST /api/profile/addresses - Create address with field mapping"""
        print("\n➕ Testing POST Address (Field Mapping Fix)...")
        
        if not self.access_token:
            self.log_test("POST Address", False, "No access token available", None)
            return False
            
        try:
            headers = {
                'Authorization': f'Bearer {self.access_token}',
                'Content-Type': 'application/json'
            }
            
            print(f"   Sending address data: {json.dumps(TEST_ADDRESS_DATA, indent=2)}")
            
            response = self.session.post(
                f"{BACKEND_URL}/profile/addresses",
                json=TEST_ADDRESS_DATA,
                headers=headers,
                timeout=30
            )
            
            print(f"   Response status: {response.status_code}")
            print(f"   Response body: {response.text[:500]}...")
            
            if response.status_code == 201:
                data = response.json()
                if data.get('success') and data.get('data'):
                    created_address = data['data']
                    self.created_address_id = created_address.get('id')
                    
                    # Verify field mapping worked correctly
                    expected_mappings = {
                        'street -> address_line_1': created_address.get('address_line_1') == TEST_ADDRESS_DATA['street'],
                        'zipCode -> postal_code': created_address.get('postal_code') == TEST_ADDRESS_DATA['zipCode'],
                        'isDefault -> is_default': created_address.get('is_default') == TEST_ADDRESS_DATA['isDefault']
                    }
                    
                    all_mappings_correct = all(expected_mappings.values())
                    
                    self.log_test(
                        "POST Address - Field Mapping Fix",
                        all_mappings_correct,
                        f"Address created successfully with field mapping {'✓' if all_mappings_correct else '✗'}",
                        {
                            'address_id': self.created_address_id,
                            'field_mappings': expected_mappings,
                            'created_address': created_address
                        }
                    )
                    return all_mappings_correct
                else:
                    self.log_test(
                        "POST Address",
                        False,
                        "Address creation response missing data",
                        data
                    )
                    return False
            else:
                # Check if this is the specific error we're trying to fix
                error_text = response.text.lower()
                if "address_line_1" in error_text and "column" in error_text:
                    self.log_test(
                        "POST Address - Field Mapping Fix",
                        False,
                        "❌ CRITICAL: Field mapping fix NOT working - still getting address_line_1 column error",
                        response.text
                    )
                else:
                    self.log_test(
                        "POST Address",
                        False,
                        f"Address creation failed with status {response.status_code}",
                        response.text
                    )
                return False
                
        except Exception as e:
            self.log_test(
                "POST Address",
                False,
                f"Address creation error: {str(e)}",
                None
            )
            return False
    
    def update_address(self):
        """Test 4: PUT /api/profile/addresses/{id} - Update address"""
        print("\n✏️ Testing PUT Address...")
        
        if not self.access_token or not self.created_address_id:
            self.log_test("PUT Address", False, "No access token or address ID available", None)
            return False
            
        try:
            headers = {
                'Authorization': f'Bearer {self.access_token}',
                'Content-Type': 'application/json'
            }
            
            # Update data with frontend field names
            update_data = {
                "name": "Jane Smith",
                "street": "456 Oak Avenue",
                "city": "Los Angeles",
                "state": "CA",
                "zipCode": "90210",
                "phone": "555-9876",
                "isDefault": False
            }
            
            response = self.session.put(
                f"{BACKEND_URL}/profile/addresses/{self.created_address_id}",
                json=update_data,
                headers=headers,
                timeout=30
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success'):
                    updated_address = data.get('data', {})
                    
                    # Verify field mapping worked for update
                    mapping_check = {
                        'street_mapped': updated_address.get('address_line_1') == update_data['street'],
                        'zipCode_mapped': updated_address.get('postal_code') == update_data['zipCode'],
                        'isDefault_mapped': updated_address.get('is_default') == update_data['isDefault']
                    }
                    
                    all_mappings_correct = all(mapping_check.values())
                    
                    self.log_test(
                        "PUT Address - Field Mapping",
                        all_mappings_correct,
                        f"Address updated successfully with field mapping {'✓' if all_mappings_correct else '✗'}",
                        {
                            'mapping_check': mapping_check,
                            'updated_address': updated_address
                        }
                    )
                    return all_mappings_correct
                else:
                    self.log_test(
                        "PUT Address",
                        False,
                        "Address update response indicates failure",
                        data
                    )
                    return False
            else:
                self.log_test(
                    "PUT Address",
                    False,
                    f"Address update failed with status {response.status_code}",
                    response.text
                )
                return False
                
        except Exception as e:
            self.log_test(
                "PUT Address",
                False,
                f"Address update error: {str(e)}",
                None
            )
            return False
    
    def delete_address(self):
        """Test 5: DELETE /api/profile/addresses/{id} - Delete address"""
        print("\n🗑️ Testing DELETE Address...")
        
        if not self.access_token or not self.created_address_id:
            self.log_test("DELETE Address", False, "No access token or address ID available", None)
            return False
            
        try:
            headers = {
                'Authorization': f'Bearer {self.access_token}',
                'Content-Type': 'application/json'
            }
            
            response = self.session.delete(
                f"{BACKEND_URL}/profile/addresses/{self.created_address_id}",
                headers=headers,
                timeout=30
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success'):
                    self.log_test(
                        "DELETE Address",
                        True,
                        "Address deleted successfully",
                        f"Deleted address ID: {self.created_address_id}"
                    )
                    return True
                else:
                    self.log_test(
                        "DELETE Address",
                        False,
                        "Address deletion response indicates failure",
                        data
                    )
                    return False
            else:
                self.log_test(
                    "DELETE Address",
                    False,
                    f"Address deletion failed with status {response.status_code}",
                    response.text
                )
                return False
                
        except Exception as e:
            self.log_test(
                "DELETE Address",
                False,
                f"Address deletion error: {str(e)}",
                None
            )
            return False
    
    def run_comprehensive_test(self):
        """Run all address management tests"""
        print("🎯 STARTING ADDRESS MANAGEMENT API TESTING - FIELD MAPPING FIX VERIFICATION")
        print("=" * 80)
        print(f"Backend URL: {BACKEND_URL}")
        print(f"Test User: {TEST_USER_EMAIL}")
        print(f"Test Focus: Field mapping fix (street->address_line_1, zipCode->postal_code, etc.)")
        print("=" * 80)
        
        # Test sequence
        tests = [
            ("Authentication", self.authenticate_user),
            ("GET Addresses", self.get_addresses),
            ("POST Address (Field Mapping)", self.create_address),
            ("PUT Address (Field Mapping)", self.update_address),
            ("DELETE Address", self.delete_address)
        ]
        
        passed_tests = 0
        total_tests = len(tests)
        
        for test_name, test_func in tests:
            try:
                if test_func():
                    passed_tests += 1
                time.sleep(1)  # Brief pause between tests
            except Exception as e:
                print(f"❌ CRITICAL ERROR in {test_name}: {str(e)}")
        
        # Final summary
        print("\n" + "=" * 80)
        print("🎯 ADDRESS MANAGEMENT API TESTING SUMMARY")
        print("=" * 80)
        
        success_rate = (passed_tests / total_tests) * 100
        print(f"📊 OVERALL RESULTS: {passed_tests}/{total_tests} tests passed ({success_rate:.1f}% success rate)")
        
        # Detailed results
        for result in self.test_results:
            print(f"{result['status']}: {result['test']} - {result['message']}")
        
        # Field mapping fix status
        field_mapping_tests = [r for r in self.test_results if "Field Mapping" in r['test']]
        if field_mapping_tests:
            all_field_mapping_passed = all("✅" in r['status'] for r in field_mapping_tests)
            if all_field_mapping_passed:
                print("\n🎉 FIELD MAPPING FIX STATUS: ✅ WORKING")
                print("   The error 'Could not find the address_line_1 column' has been resolved!")
                print("   Frontend fields (street, zipCode, isDefault) are correctly mapped to database fields.")
            else:
                print("\n🚨 FIELD MAPPING FIX STATUS: ❌ NOT WORKING")
                print("   The field mapping issue persists. Backend still expects database field names.")
        
        print("\n🔍 KEY FINDINGS:")
        if passed_tests == total_tests:
            print("   ✅ All Address Management APIs are working perfectly")
            print("   ✅ Field mapping fix is successful")
            print("   ✅ Frontend-to-backend field translation working correctly")
        elif passed_tests >= 3:
            print("   ⚠️ Most Address Management APIs are working")
            print("   ⚠️ Some issues may remain with field mapping or specific operations")
        else:
            print("   ❌ Critical issues with Address Management APIs")
            print("   ❌ Field mapping fix may not be working properly")
        
        return passed_tests == total_tests

def main():
    """Main test execution"""
    tester = AddressManagementTester()
    success = tester.run_comprehensive_test()
    
    if success:
        print("\n🎉 ALL TESTS PASSED - Address Management APIs working perfectly!")
        sys.exit(0)
    else:
        print("\n⚠️ SOME TESTS FAILED - Check results above for details")
        sys.exit(1)

if __name__ == "__main__":
    main()
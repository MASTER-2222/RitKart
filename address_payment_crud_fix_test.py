#!/usr/bin/env python3
"""
RitZone Address Book & Payment Methods CRUD Fix Verification Test
================================================================

This test verifies the FIXED Address Book and Payment Methods CRUD operations
to confirm that the previously reported issues have been resolved:

1. Address Book Issue: Frontend was sending "Home" (uppercase) but database 
   requires "home" (lowercase) - FIXED by updating frontend to send lowercase
2. Payment Methods Issue: Backend code expected different database columns 
   than what existed - FIXED by updating backend to use correct schema columns

Test Requirements:
- Verify all 8 CRUD operations work (4 for addresses + 4 for payment methods)
- Use specific test data provided in review request
- Confirm "Failed to add address" and "Failed to add payment method" errors are resolved
"""

import requests
import json
import time
import sys
from datetime import datetime

class AddressPaymentCRUDFixTest:
    def __init__(self):
        # Use production backend URL from environment configuration
        self.base_url = "https://ritzone-backend.onrender.com/api"
        self.session = requests.Session()
        self.session.headers.update({
            'Content-Type': 'application/json',
            'User-Agent': 'RitZone-Test-Client/1.0'
        })
        
        # Test credentials from review request
        self.test_email = "b@b.com"
        self.test_password = "Abcd@1234"
        self.access_token = None
        
        # Test data from review request
        self.test_address_data = {
            "type": "home",  # lowercase as per fix
            "name": "John Doe",
            "street": "123 Main St",
            "city": "New York",
            "state": "NY",
            "zipCode": "10001",
            "country": "United States",
            "phone": "555-1234",
            "isDefault": True
        }
        
        self.test_payment_data = {
            "type": "card",
            "name": "Test Card",
            "details": "**** **** **** 1234",
            "lastFour": "1234",
            "expiryDate": "01/26",
            "isDefault": True
        }
        
        # Track created items for cleanup
        self.created_addresses = []
        self.created_payment_methods = []
        
        self.test_results = []
        self.passed_tests = 0
        self.total_tests = 0

    def log_test(self, test_name, success, message="", details=None):
        """Log test results"""
        self.total_tests += 1
        if success:
            self.passed_tests += 1
            status = "✅ PASS"
        else:
            status = "❌ FAIL"
        
        result = f"{status}: {test_name}"
        if message:
            result += f" - {message}"
        
        print(result)
        self.test_results.append({
            'test': test_name,
            'success': success,
            'message': message,
            'details': details
        })

    def authenticate_user(self):
        """Authenticate user and get access token"""
        try:
            print("🔐 Authenticating user...")
            
            # Login to get Supabase access token
            login_data = {
                "email": self.test_email,
                "password": self.test_password
            }
            
            response = self.session.post(
                f"{self.base_url}/auth/login",
                json=login_data,
                timeout=30
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success') and data.get('data', {}).get('access_token'):
                    self.access_token = data['data']['access_token']
                    self.session.headers.update({
                        'Authorization': f'Bearer {self.access_token}'
                    })
                    self.log_test("User Authentication", True, f"Successfully authenticated {self.test_email}")
                    return True
                else:
                    self.log_test("User Authentication", False, f"Login response missing access token: {data}")
                    return False
            else:
                self.log_test("User Authentication", False, f"Login failed with status {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("User Authentication", False, f"Authentication error: {str(e)}")
            return False

    def test_address_crud_operations(self):
        """Test all Address CRUD operations"""
        print("\n📮 Testing Address Management CRUD Operations...")
        
        # Test 1: GET /api/profile/addresses (Read)
        try:
            response = self.session.get(f"{self.base_url}/profile/addresses", timeout=15)
            if response.status_code == 200:
                data = response.json()
                if data.get('success'):
                    self.log_test("GET Addresses", True, f"Retrieved {len(data.get('data', []))} addresses")
                else:
                    self.log_test("GET Addresses", False, f"API returned success=false: {data}")
            else:
                self.log_test("GET Addresses", False, f"Status {response.status_code}: {response.text}")
        except Exception as e:
            self.log_test("GET Addresses", False, f"Request error: {str(e)}")

        # Test 2: POST /api/profile/addresses (Create)
        try:
            response = self.session.post(
                f"{self.base_url}/profile/addresses",
                json=self.test_address_data,
                timeout=15
            )
            if response.status_code == 201:
                data = response.json()
                if data.get('success') and data.get('data', {}).get('id'):
                    address_id = data['data']['id']
                    self.created_addresses.append(address_id)
                    self.log_test("POST Address (Create)", True, f"Successfully created address with ID: {address_id}")
                else:
                    self.log_test("POST Address (Create)", False, f"Create response missing ID: {data}")
            else:
                self.log_test("POST Address (Create)", False, f"Status {response.status_code}: {response.text}")
        except Exception as e:
            self.log_test("POST Address (Create)", False, f"Request error: {str(e)}")

        # Test 3: PUT /api/profile/addresses/{id} (Update)
        if self.created_addresses:
            try:
                address_id = self.created_addresses[0]
                update_data = {
                    "name": "John Doe Updated",
                    "street": "456 Updated St",
                    "city": "Updated City"
                }
                
                response = self.session.put(
                    f"{self.base_url}/profile/addresses/{address_id}",
                    json=update_data,
                    timeout=15
                )
                if response.status_code == 200:
                    data = response.json()
                    if data.get('success'):
                        self.log_test("PUT Address (Update)", True, f"Successfully updated address {address_id}")
                    else:
                        self.log_test("PUT Address (Update)", False, f"Update response success=false: {data}")
                else:
                    self.log_test("PUT Address (Update)", False, f"Status {response.status_code}: {response.text}")
            except Exception as e:
                self.log_test("PUT Address (Update)", False, f"Request error: {str(e)}")
        else:
            self.log_test("PUT Address (Update)", False, "No address ID available for update test")

        # Test 4: DELETE /api/profile/addresses/{id} (Delete)
        if self.created_addresses:
            try:
                address_id = self.created_addresses[0]
                response = self.session.delete(
                    f"{self.base_url}/profile/addresses/{address_id}",
                    timeout=15
                )
                if response.status_code == 200:
                    data = response.json()
                    if data.get('success'):
                        self.log_test("DELETE Address", True, f"Successfully deleted address {address_id}")
                        self.created_addresses.remove(address_id)
                    else:
                        self.log_test("DELETE Address", False, f"Delete response success=false: {data}")
                else:
                    self.log_test("DELETE Address", False, f"Status {response.status_code}: {response.text}")
            except Exception as e:
                self.log_test("DELETE Address", False, f"Request error: {str(e)}")
        else:
            self.log_test("DELETE Address", False, "No address ID available for delete test")

    def test_payment_methods_crud_operations(self):
        """Test all Payment Methods CRUD operations"""
        print("\n💳 Testing Payment Methods CRUD Operations...")
        
        # Test 1: GET /api/profile/payment-methods (Read)
        try:
            response = self.session.get(f"{self.base_url}/profile/payment-methods", timeout=15)
            if response.status_code == 200:
                data = response.json()
                if data.get('success'):
                    self.log_test("GET Payment Methods", True, f"Retrieved {len(data.get('data', []))} payment methods")
                else:
                    self.log_test("GET Payment Methods", False, f"API returned success=false: {data}")
            else:
                self.log_test("GET Payment Methods", False, f"Status {response.status_code}: {response.text}")
        except Exception as e:
            self.log_test("GET Payment Methods", False, f"Request error: {str(e)}")

        # Test 2: POST /api/profile/payment-methods (Create)
        try:
            response = self.session.post(
                f"{self.base_url}/profile/payment-methods",
                json=self.test_payment_data,
                timeout=15
            )
            if response.status_code == 201:
                data = response.json()
                if data.get('success') and data.get('data', {}).get('id'):
                    payment_id = data['data']['id']
                    self.created_payment_methods.append(payment_id)
                    self.log_test("POST Payment Method (Create)", True, f"Successfully created payment method with ID: {payment_id}")
                else:
                    self.log_test("POST Payment Method (Create)", False, f"Create response missing ID: {data}")
            else:
                self.log_test("POST Payment Method (Create)", False, f"Status {response.status_code}: {response.text}")
        except Exception as e:
            self.log_test("POST Payment Method (Create)", False, f"Request error: {str(e)}")

        # Test 3: PUT /api/profile/payment-methods/{id} (Update)
        if self.created_payment_methods:
            try:
                payment_id = self.created_payment_methods[0]
                update_data = {
                    "name": "Updated Test Card",
                    "details": "**** **** **** 5678",
                    "lastFour": "5678"
                }
                
                response = self.session.put(
                    f"{self.base_url}/profile/payment-methods/{payment_id}",
                    json=update_data,
                    timeout=15
                )
                if response.status_code == 200:
                    data = response.json()
                    if data.get('success'):
                        self.log_test("PUT Payment Method (Update)", True, f"Successfully updated payment method {payment_id}")
                    else:
                        self.log_test("PUT Payment Method (Update)", False, f"Update response success=false: {data}")
                else:
                    self.log_test("PUT Payment Method (Update)", False, f"Status {response.status_code}: {response.text}")
            except Exception as e:
                self.log_test("PUT Payment Method (Update)", False, f"Request error: {str(e)}")
        else:
            self.log_test("PUT Payment Method (Update)", False, "No payment method ID available for update test")

        # Test 4: DELETE /api/profile/payment-methods/{id} (Delete)
        if self.created_payment_methods:
            try:
                payment_id = self.created_payment_methods[0]
                response = self.session.delete(
                    f"{self.base_url}/profile/payment-methods/{payment_id}",
                    timeout=15
                )
                if response.status_code == 200:
                    data = response.json()
                    if data.get('success'):
                        self.log_test("DELETE Payment Method", True, f"Successfully deleted payment method {payment_id}")
                        self.created_payment_methods.remove(payment_id)
                    else:
                        self.log_test("DELETE Payment Method", False, f"Delete response success=false: {data}")
                else:
                    self.log_test("DELETE Payment Method", False, f"Status {response.status_code}: {response.text}")
            except Exception as e:
                self.log_test("DELETE Payment Method", False, f"Request error: {str(e)}")
        else:
            self.log_test("DELETE Payment Method", False, "No payment method ID available for delete test")

    def test_specific_fix_scenarios(self):
        """Test specific scenarios mentioned in the fix"""
        print("\n🔧 Testing Specific Fix Scenarios...")
        
        # Test lowercase address type (the fix)
        try:
            lowercase_address = {
                **self.test_address_data,
                "type": "home"  # Explicitly lowercase
            }
            
            response = self.session.post(
                f"{self.base_url}/profile/addresses",
                json=lowercase_address,
                timeout=15
            )
            
            if response.status_code == 201:
                data = response.json()
                if data.get('success'):
                    address_id = data['data']['id']
                    self.created_addresses.append(address_id)
                    self.log_test("Lowercase Address Type Fix", True, "Successfully created address with lowercase 'home' type")
                else:
                    self.log_test("Lowercase Address Type Fix", False, f"Create failed: {data}")
            else:
                self.log_test("Lowercase Address Type Fix", False, f"Status {response.status_code}: {response.text}")
        except Exception as e:
            self.log_test("Lowercase Address Type Fix", False, f"Request error: {str(e)}")

        # Test payment method with corrected field names (the fix)
        try:
            corrected_payment = {
                "type": "card",
                "name": "Fixed Schema Card",
                "details": "**** **** **** 9999",
                "lastFour": "9999",  # Using corrected field name
                "expiryDate": "12/27",  # Using corrected field name
                "isDefault": False
            }
            
            response = self.session.post(
                f"{self.base_url}/profile/payment-methods",
                json=corrected_payment,
                timeout=15
            )
            
            if response.status_code == 201:
                data = response.json()
                if data.get('success'):
                    payment_id = data['data']['id']
                    self.created_payment_methods.append(payment_id)
                    self.log_test("Corrected Payment Schema Fix", True, "Successfully created payment method with corrected field names")
                else:
                    self.log_test("Corrected Payment Schema Fix", False, f"Create failed: {data}")
            else:
                self.log_test("Corrected Payment Schema Fix", False, f"Status {response.status_code}: {response.text}")
        except Exception as e:
            self.log_test("Corrected Payment Schema Fix", False, f"Request error: {str(e)}")

    def cleanup_test_data(self):
        """Clean up any created test data"""
        print("\n🧹 Cleaning up test data...")
        
        # Clean up addresses
        for address_id in self.created_addresses[:]:
            try:
                response = self.session.delete(f"{self.base_url}/profile/addresses/{address_id}", timeout=10)
                if response.status_code == 200:
                    print(f"✅ Cleaned up address {address_id}")
                    self.created_addresses.remove(address_id)
                else:
                    print(f"⚠️ Failed to cleanup address {address_id}: {response.status_code}")
            except Exception as e:
                print(f"⚠️ Error cleaning up address {address_id}: {str(e)}")

        # Clean up payment methods
        for payment_id in self.created_payment_methods[:]:
            try:
                response = self.session.delete(f"{self.base_url}/profile/payment-methods/{payment_id}", timeout=10)
                if response.status_code == 200:
                    print(f"✅ Cleaned up payment method {payment_id}")
                    self.created_payment_methods.remove(payment_id)
                else:
                    print(f"⚠️ Failed to cleanup payment method {payment_id}: {response.status_code}")
            except Exception as e:
                print(f"⚠️ Error cleaning up payment method {payment_id}: {str(e)}")

    def run_comprehensive_test(self):
        """Run comprehensive test suite"""
        print("🎯 RitZone Address Book & Payment Methods CRUD Fix Verification Test")
        print("=" * 80)
        print(f"Backend URL: {self.base_url}")
        print(f"Test User: {self.test_email}")
        print(f"Test Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print("=" * 80)

        try:
            # Step 1: Authenticate
            if not self.authenticate_user():
                print("❌ Authentication failed. Cannot proceed with tests.")
                return False

            # Step 2: Test Address CRUD operations
            self.test_address_crud_operations()

            # Step 3: Test Payment Methods CRUD operations
            self.test_payment_methods_crud_operations()

            # Step 4: Test specific fix scenarios
            self.test_specific_fix_scenarios()

            # Step 5: Cleanup
            self.cleanup_test_data()

            # Final Results
            print("\n" + "=" * 80)
            print("🎯 FINAL TEST RESULTS")
            print("=" * 80)
            
            success_rate = (self.passed_tests / self.total_tests * 100) if self.total_tests > 0 else 0
            print(f"✅ Tests Passed: {self.passed_tests}/{self.total_tests} ({success_rate:.1f}%)")
            
            if self.passed_tests == self.total_tests:
                print("🎉 ALL TESTS PASSED! Address Book & Payment Methods CRUD fixes are working perfectly!")
                print("✅ 'Failed to add address' error: RESOLVED")
                print("✅ 'Failed to add payment method' error: RESOLVED")
                return True
            else:
                print("❌ Some tests failed. Issues may still exist.")
                failed_tests = [r for r in self.test_results if not r['success']]
                print(f"\n❌ Failed Tests ({len(failed_tests)}):")
                for test in failed_tests:
                    print(f"  • {test['test']}: {test['message']}")
                return False

        except Exception as e:
            print(f"❌ Test suite error: {str(e)}")
            return False

def main():
    """Main test execution"""
    tester = AddressPaymentCRUDFixTest()
    success = tester.run_comprehensive_test()
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()
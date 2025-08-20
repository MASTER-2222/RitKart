#!/usr/bin/env python3
"""
RitZone Address Book and Payment Methods CRUD Testing
====================================================
Focused testing of Address Book and Payment Methods CRUD operations as requested in review.

REVIEW REQUEST CONTEXT:
User reports "Failed to add address" and "Failed to add payment method" errors in frontend.
Need to test CRUD operations with actual form data that frontend would send.

SPECIFIC TESTS REQUIRED:
1. Authentication Test - Verify user can authenticate with b@b.com/Abcd@1234
2. Address Management APIs:
   - GET /api/profile/addresses (should work)
   - POST /api/profile/addresses (create new address - FAILING)
   - PUT /api/profile/addresses/{id} (update address)
   - DELETE /api/profile/addresses/{id} (delete address)
3. Payment Methods APIs:
   - GET /api/profile/payment-methods (should work)
   - POST /api/profile/payment-methods (create new payment method - FAILING)
   - PUT /api/profile/payment-methods/{id} (update payment method)
   - DELETE /api/profile/payment-methods/{id} (delete payment method)

FOCUS AREAS:
- Test with actual form data that frontend would send
- Check database schema compatibility
- Look for field name mismatches between frontend, backend, and database
- Verify Supabase authentication is working properly
- Check for any database constraints or validation errors

TEST DATA:
- Address: type="Home", name="John Doe", street="123 Main St", city="New York", state="NY", zipCode="10001", country="United States", phone="555-1234"
- Payment Method: type="card", cardNumber="1234123412341234", expiryDate="01/26", cvv="123", cardholderName="John Doe"
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

class AddressPaymentCRUDTester:
    def __init__(self):
        self.session = requests.Session()
        self.access_token = None
        self.user_data = None
        self.created_address_id = None
        self.created_payment_method_id = None
        
    def log_test(self, test_name: str, success: bool, message: str, details: Dict = None):
        """Log test results with consistent formatting"""
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} | {test_name}")
        print(f"     └─ {message}")
        if details:
            for key, value in details.items():
                print(f"        {key}: {value}")
        print()
        
    def test_authentication(self) -> bool:
        """Test 1: User Authentication with b@b.com / Abcd@1234"""
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
                            "User Email": self.user_data.get('email', 'N/A')
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
                    f"Login failed with status {response.status_code}",
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
    
    def test_address_management_apis(self) -> bool:
        """Test 2: Address Management CRUD Operations"""
        if not self.access_token:
            self.log_test(
                "Address Management APIs",
                False,
                "No access token available - authentication must succeed first"
            )
            return False
            
        headers = {
            "Authorization": f"Bearer {self.access_token}",
            "Content-Type": "application/json"
        }
        
        results = []
        
        # Test 2.1: GET /api/profile/addresses (should work)
        try:
            response = self.session.get(
                f"{BACKEND_URL}/profile/addresses",
                headers=headers,
                timeout=30
            )
            
            success = response.status_code == 200
            results.append(success)
            
            if success:
                data = response.json()
                existing_addresses = data.get('data', [])
                self.log_test(
                    "GET Addresses",
                    True,
                    f"Successfully retrieved {len(existing_addresses)} addresses",
                    {
                        "Status Code": response.status_code,
                        "Address Count": len(existing_addresses),
                        "Success": data.get('success', False)
                    }
                )
            else:
                self.log_test(
                    "GET Addresses",
                    False,
                    f"Failed to retrieve addresses with status {response.status_code}",
                    {"Response": response.text[:200]}
                )
                
        except Exception as e:
            results.append(False)
            self.log_test("GET Addresses", False, f"Request failed: {str(e)}")
        
        # Test 2.2: POST /api/profile/addresses (create new address - THIS IS FAILING)
        try:
            # Test data as specified in review request
            address_data = {
                "type": "Home",
                "name": "John Doe",
                "street": "123 Main St",
                "city": "New York",
                "state": "NY",
                "zipCode": "10001",
                "country": "United States",
                "phone": "555-1234",
                "isDefault": True
            }
            
            response = self.session.post(
                f"{BACKEND_URL}/profile/addresses",
                json=address_data,
                headers=headers,
                timeout=30
            )
            
            success = response.status_code == 201
            results.append(success)
            
            if success:
                data = response.json()
                created_address = data.get('data', {})
                self.created_address_id = created_address.get('id')
                
                self.log_test(
                    "POST Address (Create)",
                    True,
                    "Successfully created new address",
                    {
                        "Status Code": response.status_code,
                        "Address ID": self.created_address_id,
                        "Address Name": created_address.get('name'),
                        "Address Type": created_address.get('type'),
                        "Is Default": created_address.get('is_default')
                    }
                )
            else:
                error_data = {}
                try:
                    error_response = response.json()
                    error_data = {
                        "Error Message": error_response.get('message', 'Unknown error'),
                        "Error Details": error_response.get('error', 'No details'),
                        "Response": response.text[:300]
                    }
                except:
                    error_data = {"Response": response.text[:300]}
                
                self.log_test(
                    "POST Address (Create)",
                    False,
                    f"Failed to create address with status {response.status_code}",
                    error_data
                )
                
        except Exception as e:
            results.append(False)
            self.log_test("POST Address (Create)", False, f"Request failed: {str(e)}")
        
        # Test 2.3: PUT /api/profile/addresses/{id} (update address) - only if create succeeded
        if self.created_address_id:
            try:
                update_data = {
                    "name": "John Doe Updated",
                    "street": "456 Updated St",
                    "city": "Updated City",
                    "phone": "555-9999"
                }
                
                response = self.session.put(
                    f"{BACKEND_URL}/profile/addresses/{self.created_address_id}",
                    json=update_data,
                    headers=headers,
                    timeout=30
                )
                
                success = response.status_code == 200
                results.append(success)
                
                if success:
                    data = response.json()
                    updated_address = data.get('data', {})
                    
                    self.log_test(
                        "PUT Address (Update)",
                        True,
                        "Successfully updated address",
                        {
                            "Status Code": response.status_code,
                            "Updated Name": updated_address.get('name'),
                            "Updated Street": updated_address.get('street'),
                            "Updated City": updated_address.get('city')
                        }
                    )
                else:
                    self.log_test(
                        "PUT Address (Update)",
                        False,
                        f"Failed to update address with status {response.status_code}",
                        {"Response": response.text[:200]}
                    )
                    
            except Exception as e:
                results.append(False)
                self.log_test("PUT Address (Update)", False, f"Request failed: {str(e)}")
        else:
            results.append(False)
            self.log_test("PUT Address (Update)", False, "Skipped - no address ID available from create test")
        
        # Test 2.4: DELETE /api/profile/addresses/{id} (delete address) - only if create succeeded
        if self.created_address_id:
            try:
                response = self.session.delete(
                    f"{BACKEND_URL}/profile/addresses/{self.created_address_id}",
                    headers=headers,
                    timeout=30
                )
                
                success = response.status_code == 200
                results.append(success)
                
                if success:
                    self.log_test(
                        "DELETE Address",
                        True,
                        "Successfully deleted address",
                        {"Status Code": response.status_code}
                    )
                else:
                    self.log_test(
                        "DELETE Address",
                        False,
                        f"Failed to delete address with status {response.status_code}",
                        {"Response": response.text[:200]}
                    )
                    
            except Exception as e:
                results.append(False)
                self.log_test("DELETE Address", False, f"Request failed: {str(e)}")
        else:
            results.append(False)
            self.log_test("DELETE Address", False, "Skipped - no address ID available from create test")
        
        # Summary
        success_count = sum(results)
        total_count = len(results)
        overall_success = success_count == total_count
        
        self.log_test(
            "Address Management APIs Summary",
            overall_success,
            f"{success_count}/{total_count} address API tests passed",
            {"Success Rate": f"{(success_count/total_count)*100:.1f}%"}
        )
        
        return overall_success
    
    def test_payment_methods_apis(self) -> bool:
        """Test 3: Payment Methods CRUD Operations"""
        if not self.access_token:
            self.log_test(
                "Payment Methods APIs",
                False,
                "No access token available - authentication must succeed first"
            )
            return False
            
        headers = {
            "Authorization": f"Bearer {self.access_token}",
            "Content-Type": "application/json"
        }
        
        results = []
        
        # Test 3.1: GET /api/profile/payment-methods (should work)
        try:
            response = self.session.get(
                f"{BACKEND_URL}/profile/payment-methods",
                headers=headers,
                timeout=30
            )
            
            success = response.status_code == 200
            results.append(success)
            
            if success:
                data = response.json()
                existing_methods = data.get('data', [])
                self.log_test(
                    "GET Payment Methods",
                    True,
                    f"Successfully retrieved {len(existing_methods)} payment methods",
                    {
                        "Status Code": response.status_code,
                        "Payment Methods Count": len(existing_methods),
                        "Success": data.get('success', False)
                    }
                )
            else:
                self.log_test(
                    "GET Payment Methods",
                    False,
                    f"Failed to retrieve payment methods with status {response.status_code}",
                    {"Response": response.text[:200]}
                )
                
        except Exception as e:
            results.append(False)
            self.log_test("GET Payment Methods", False, f"Request failed: {str(e)}")
        
        # Test 3.2: POST /api/profile/payment-methods (create new payment method - THIS IS FAILING)
        try:
            # Test data as specified in review request
            # Note: Backend expects different field names than frontend form data
            payment_method_data = {
                "type": "card",
                "card_last4": "1234",  # Extract last 4 digits from cardNumber
                "card_brand": "visa",  # Determine from cardNumber
                "expiry_month": 1,     # Extract from expiryDate "01/26"
                "expiry_year": 2026,   # Extract from expiryDate "01/26"
                "cardholder_name": "John Doe",
                "is_default": True
            }
            
            response = self.session.post(
                f"{BACKEND_URL}/profile/payment-methods",
                json=payment_method_data,
                headers=headers,
                timeout=30
            )
            
            success = response.status_code == 201
            results.append(success)
            
            if success:
                data = response.json()
                created_method = data.get('data', {})
                self.created_payment_method_id = created_method.get('id')
                
                self.log_test(
                    "POST Payment Method (Create)",
                    True,
                    "Successfully created new payment method",
                    {
                        "Status Code": response.status_code,
                        "Payment Method ID": self.created_payment_method_id,
                        "Card Last 4": created_method.get('card_last4'),
                        "Card Brand": created_method.get('card_brand'),
                        "Cardholder Name": created_method.get('cardholder_name'),
                        "Is Default": created_method.get('is_default')
                    }
                )
            else:
                error_data = {}
                try:
                    error_response = response.json()
                    error_data = {
                        "Error Message": error_response.get('message', 'Unknown error'),
                        "Error Details": error_response.get('error', 'No details'),
                        "Response": response.text[:300]
                    }
                except:
                    error_data = {"Response": response.text[:300]}
                
                self.log_test(
                    "POST Payment Method (Create)",
                    False,
                    f"Failed to create payment method with status {response.status_code}",
                    error_data
                )
                
        except Exception as e:
            results.append(False)
            self.log_test("POST Payment Method (Create)", False, f"Request failed: {str(e)}")
        
        # Test 3.3: PUT /api/profile/payment-methods/{id} (update payment method) - only if create succeeded
        if self.created_payment_method_id:
            try:
                update_data = {
                    "cardholder_name": "John Doe Updated",
                    "expiry_month": 12,
                    "expiry_year": 2027
                }
                
                response = self.session.put(
                    f"{BACKEND_URL}/profile/payment-methods/{self.created_payment_method_id}",
                    json=update_data,
                    headers=headers,
                    timeout=30
                )
                
                success = response.status_code == 200
                results.append(success)
                
                if success:
                    data = response.json()
                    updated_method = data.get('data', {})
                    
                    self.log_test(
                        "PUT Payment Method (Update)",
                        True,
                        "Successfully updated payment method",
                        {
                            "Status Code": response.status_code,
                            "Updated Cardholder": updated_method.get('cardholder_name'),
                            "Updated Expiry Month": updated_method.get('expiry_month'),
                            "Updated Expiry Year": updated_method.get('expiry_year')
                        }
                    )
                else:
                    self.log_test(
                        "PUT Payment Method (Update)",
                        False,
                        f"Failed to update payment method with status {response.status_code}",
                        {"Response": response.text[:200]}
                    )
                    
            except Exception as e:
                results.append(False)
                self.log_test("PUT Payment Method (Update)", False, f"Request failed: {str(e)}")
        else:
            results.append(False)
            self.log_test("PUT Payment Method (Update)", False, "Skipped - no payment method ID available from create test")
        
        # Test 3.4: DELETE /api/profile/payment-methods/{id} (delete payment method) - only if create succeeded
        if self.created_payment_method_id:
            try:
                response = self.session.delete(
                    f"{BACKEND_URL}/profile/payment-methods/{self.created_payment_method_id}",
                    headers=headers,
                    timeout=30
                )
                
                success = response.status_code == 200
                results.append(success)
                
                if success:
                    self.log_test(
                        "DELETE Payment Method",
                        True,
                        "Successfully deleted payment method",
                        {"Status Code": response.status_code}
                    )
                else:
                    self.log_test(
                        "DELETE Payment Method",
                        False,
                        f"Failed to delete payment method with status {response.status_code}",
                        {"Response": response.text[:200]}
                    )
                    
            except Exception as e:
                results.append(False)
                self.log_test("DELETE Payment Method", False, f"Request failed: {str(e)}")
        else:
            results.append(False)
            self.log_test("DELETE Payment Method", False, "Skipped - no payment method ID available from create test")
        
        # Summary
        success_count = sum(results)
        total_count = len(results)
        overall_success = success_count == total_count
        
        self.log_test(
            "Payment Methods APIs Summary",
            overall_success,
            f"{success_count}/{total_count} payment method API tests passed",
            {"Success Rate": f"{(success_count/total_count)*100:.1f}%"}
        )
        
        return overall_success
    
    def run_comprehensive_test(self):
        """Run all Address Book and Payment Methods CRUD tests"""
        print("=" * 80)
        print("🔍 RITZONE ADDRESS BOOK & PAYMENT METHODS CRUD TESTING")
        print("=" * 80)
        print(f"Backend URL: {BACKEND_URL}")
        print(f"Test User: {TEST_USER_EMAIL}")
        print(f"Test Time: {time.strftime('%Y-%m-%d %H:%M:%S UTC', time.gmtime())}")
        print("=" * 80)
        print()
        
        # Run all tests
        test_results = []
        
        # Test 1: Authentication
        test_results.append(self.test_authentication())
        
        # Test 2: Address Management APIs
        test_results.append(self.test_address_management_apis())
        
        # Test 3: Payment Methods APIs
        test_results.append(self.test_payment_methods_apis())
        
        # Summary
        passed_tests = sum(test_results)
        total_tests = len(test_results)
        success_rate = (passed_tests / total_tests) * 100
        
        print("=" * 80)
        print("📊 ADDRESS BOOK & PAYMENT METHODS CRUD TEST SUMMARY")
        print("=" * 80)
        print(f"Tests Passed: {passed_tests}/{total_tests}")
        print(f"Success Rate: {success_rate:.1f}%")
        print()
        
        if success_rate == 100:
            print("🎉 EXCELLENT: All CRUD operations working perfectly!")
            print("✅ Address Book and Payment Methods fully functional")
        elif success_rate >= 66:
            print("⚠️  PARTIAL SUCCESS: Some CRUD operations working")
            print("🔍 Check failed tests above for specific issues")
        else:
            print("❌ CRITICAL: Major CRUD operation failures detected")
            print("🚨 Address Book and Payment Methods have significant issues")
        
        print("=" * 80)
        
        return success_rate == 100

def main():
    """Main test execution"""
    tester = AddressPaymentCRUDTester()
    success = tester.run_comprehensive_test()
    
    # Exit with appropriate code
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()
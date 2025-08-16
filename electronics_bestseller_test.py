#!/usr/bin/env python3
"""
RitZone Electronics Bestseller Endpoint Testing Suite - January 2025
===================================================================
Comprehensive testing for the newly implemented electronics bestseller endpoint:
PUT /api/admin/homepage/electronics/:id - Update electronics bestseller status

Test Requirements:
- Test with valid product ID and is_bestseller boolean field
- Test validation (missing is_bestseller field, invalid data types)  
- Test with both is_bestseller: true and is_bestseller: false
- Verify response structure matches expected format
- Check error handling

Sample Test Cases:
1. Valid request: PUT /electronics/test-product-id with {"is_bestseller": true}
2. Valid request: PUT /electronics/test-product-id with {"is_bestseller": false}  
3. Invalid request: PUT /electronics/test-product-id with {"is_bestseller": "invalid"}
4. Invalid request: PUT /electronics/test-product-id with missing is_bestseller field
"""

import requests
import json
import sys
import uuid
from datetime import datetime

class ElectronicsBestsellerTester:
    def __init__(self, base_url="http://localhost:8001/api"):
        self.base_url = base_url
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []
        self.test_product_id = "test-product-id"

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

        try:
            if method == 'PUT':
                response = requests.put(url, json=data, headers=headers, timeout=15)
            elif method == 'GET':
                response = requests.get(url, headers=headers, timeout=15)
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

    def test_valid_bestseller_true(self):
        """Test valid request with is_bestseller: true"""
        print("\n✅ Testing Valid Request - is_bestseller: true...")
        
        data = {"is_bestseller": True}
        success, status, response_data = self.make_request(
            'PUT', 
            f'/admin/homepage/electronics/{self.test_product_id}', 
            data, 
            200
        )
        
        if success and response_data.get('success'):
            # Verify response structure
            response_data_obj = response_data.get('data', {})
            expected_fields = ['id', 'is_bestseller', 'category', 'updated_at']
            missing_fields = [field for field in expected_fields if field not in response_data_obj]
            
            if not missing_fields and response_data_obj.get('is_bestseller') is True:
                return self.log_test(
                    "Valid Request - is_bestseller: true",
                    True,
                    f"Successfully updated bestseller status to true - Product ID: {response_data_obj.get('id')}, Category: {response_data_obj.get('category')}"
                )
            else:
                return self.log_test(
                    "Valid Request - is_bestseller: true",
                    False,
                    f"Response structure invalid - Missing fields: {missing_fields}, is_bestseller value: {response_data_obj.get('is_bestseller')}"
                )
        else:
            return self.log_test(
                "Valid Request - is_bestseller: true",
                False,
                f"Request failed - Status: {status}, Response: {response_data}"
            )

    def test_valid_bestseller_false(self):
        """Test valid request with is_bestseller: false"""
        print("\n✅ Testing Valid Request - is_bestseller: false...")
        
        data = {"is_bestseller": False}
        success, status, response_data = self.make_request(
            'PUT', 
            f'/admin/homepage/electronics/{self.test_product_id}', 
            data, 
            200
        )
        
        if success and response_data.get('success'):
            # Verify response structure
            response_data_obj = response_data.get('data', {})
            expected_fields = ['id', 'is_bestseller', 'category', 'updated_at']
            missing_fields = [field for field in expected_fields if field not in response_data_obj]
            
            if not missing_fields and response_data_obj.get('is_bestseller') is False:
                return self.log_test(
                    "Valid Request - is_bestseller: false",
                    True,
                    f"Successfully updated bestseller status to false - Product ID: {response_data_obj.get('id')}, Category: {response_data_obj.get('category')}"
                )
            else:
                return self.log_test(
                    "Valid Request - is_bestseller: false",
                    False,
                    f"Response structure invalid - Missing fields: {missing_fields}, is_bestseller value: {response_data_obj.get('is_bestseller')}"
                )
        else:
            return self.log_test(
                "Valid Request - is_bestseller: false",
                False,
                f"Request failed - Status: {status}, Response: {response_data}"
            )

    def test_invalid_bestseller_string(self):
        """Test invalid request with is_bestseller as string"""
        print("\n❌ Testing Invalid Request - is_bestseller: 'invalid'...")
        
        data = {"is_bestseller": "invalid"}
        success, status, response_data = self.make_request(
            'PUT', 
            f'/admin/homepage/electronics/{self.test_product_id}', 
            data, 
            400
        )
        
        if success and not response_data.get('success'):
            # Verify proper validation error message
            message = response_data.get('message', '')
            if 'is_bestseller' in message.lower() and 'boolean' in message.lower():
                return self.log_test(
                    "Invalid Request - is_bestseller: string",
                    True,
                    f"Properly rejected invalid string value - Message: {message}"
                )
            else:
                return self.log_test(
                    "Invalid Request - is_bestseller: string",
                    False,
                    f"Error message not specific enough - Message: {message}"
                )
        else:
            return self.log_test(
                "Invalid Request - is_bestseller: string",
                False,
                f"Should have returned 400 error - Status: {status}, Response: {response_data}"
            )

    def test_missing_bestseller_field(self):
        """Test invalid request with missing is_bestseller field"""
        print("\n❌ Testing Invalid Request - Missing is_bestseller field...")
        
        data = {}  # Empty data - missing is_bestseller field
        success, status, response_data = self.make_request(
            'PUT', 
            f'/admin/homepage/electronics/{self.test_product_id}', 
            data, 
            400
        )
        
        if success and not response_data.get('success'):
            # Verify proper validation error message
            message = response_data.get('message', '')
            if 'is_bestseller' in message.lower():
                return self.log_test(
                    "Invalid Request - Missing is_bestseller",
                    True,
                    f"Properly rejected missing field - Message: {message}"
                )
            else:
                return self.log_test(
                    "Invalid Request - Missing is_bestseller",
                    False,
                    f"Error message not specific enough - Message: {message}"
                )
        else:
            return self.log_test(
                "Invalid Request - Missing is_bestseller",
                False,
                f"Should have returned 400 error - Status: {status}, Response: {response_data}"
            )

    def test_invalid_bestseller_number(self):
        """Test invalid request with is_bestseller as number"""
        print("\n❌ Testing Invalid Request - is_bestseller: 1...")
        
        data = {"is_bestseller": 1}
        success, status, response_data = self.make_request(
            'PUT', 
            f'/admin/homepage/electronics/{self.test_product_id}', 
            data, 
            400
        )
        
        if success and not response_data.get('success'):
            # Verify proper validation error message
            message = response_data.get('message', '')
            if 'is_bestseller' in message.lower() and 'boolean' in message.lower():
                return self.log_test(
                    "Invalid Request - is_bestseller: number",
                    True,
                    f"Properly rejected invalid number value - Message: {message}"
                )
            else:
                return self.log_test(
                    "Invalid Request - is_bestseller: number",
                    False,
                    f"Error message not specific enough - Message: {message}"
                )
        else:
            return self.log_test(
                "Invalid Request - is_bestseller: number",
                False,
                f"Should have returned 400 error - Status: {status}, Response: {response_data}"
            )

    def test_invalid_bestseller_null(self):
        """Test invalid request with is_bestseller as null"""
        print("\n❌ Testing Invalid Request - is_bestseller: null...")
        
        data = {"is_bestseller": None}
        success, status, response_data = self.make_request(
            'PUT', 
            f'/admin/homepage/electronics/{self.test_product_id}', 
            data, 
            400
        )
        
        if success and not response_data.get('success'):
            # Verify proper validation error message
            message = response_data.get('message', '')
            if 'is_bestseller' in message.lower():
                return self.log_test(
                    "Invalid Request - is_bestseller: null",
                    True,
                    f"Properly rejected null value - Message: {message}"
                )
            else:
                return self.log_test(
                    "Invalid Request - is_bestseller: null",
                    False,
                    f"Error message not specific enough - Message: {message}"
                )
        else:
            return self.log_test(
                "Invalid Request - is_bestseller: null",
                False,
                f"Should have returned 400 error - Status: {status}, Response: {response_data}"
            )

    def test_response_structure_validation(self):
        """Test that successful responses have the correct structure"""
        print("\n🔍 Testing Response Structure Validation...")
        
        data = {"is_bestseller": True}
        success, status, response_data = self.make_request(
            'PUT', 
            f'/admin/homepage/electronics/{self.test_product_id}', 
            data, 
            200
        )
        
        if success and response_data.get('success'):
            # Check top-level response structure
            required_top_level = ['success', 'message', 'data']
            missing_top_level = [field for field in required_top_level if field not in response_data]
            
            # Check data object structure
            data_obj = response_data.get('data', {})
            required_data_fields = ['id', 'is_bestseller', 'category', 'updated_at']
            missing_data_fields = [field for field in required_data_fields if field not in data_obj]
            
            # Validate data types
            validation_errors = []
            if not isinstance(data_obj.get('is_bestseller'), bool):
                validation_errors.append("is_bestseller should be boolean")
            if data_obj.get('category') != 'electronics':
                validation_errors.append("category should be 'electronics'")
            if not isinstance(data_obj.get('updated_at'), str):
                validation_errors.append("updated_at should be string (ISO timestamp)")
            
            if not missing_top_level and not missing_data_fields and not validation_errors:
                return self.log_test(
                    "Response Structure Validation",
                    True,
                    f"Response structure is correct - All required fields present with correct types"
                )
            else:
                error_details = []
                if missing_top_level:
                    error_details.append(f"Missing top-level fields: {missing_top_level}")
                if missing_data_fields:
                    error_details.append(f"Missing data fields: {missing_data_fields}")
                if validation_errors:
                    error_details.append(f"Type validation errors: {validation_errors}")
                
                return self.log_test(
                    "Response Structure Validation",
                    False,
                    f"Response structure issues - {'; '.join(error_details)}"
                )
        else:
            return self.log_test(
                "Response Structure Validation",
                False,
                f"Could not validate structure - Request failed with status: {status}"
            )

    def test_different_product_ids(self):
        """Test with different product ID formats"""
        print("\n🆔 Testing Different Product ID Formats...")
        
        test_ids = [
            "uuid-format-id",
            "12345",
            "product-with-dashes",
            "product_with_underscores",
            str(uuid.uuid4())  # Real UUID
        ]
        
        passed_tests = 0
        for test_id in test_ids:
            data = {"is_bestseller": True}
            success, status, response_data = self.make_request(
                'PUT', 
                f'/admin/homepage/electronics/{test_id}', 
                data, 
                200
            )
            
            if success and response_data.get('success'):
                data_obj = response_data.get('data', {})
                if data_obj.get('id') == test_id:
                    passed_tests += 1
                    print(f"  ✅ Product ID '{test_id}' - Success")
                else:
                    print(f"  ❌ Product ID '{test_id}' - ID mismatch in response")
            else:
                print(f"  ❌ Product ID '{test_id}' - Request failed")
        
        if passed_tests == len(test_ids):
            return self.log_test(
                "Different Product ID Formats",
                True,
                f"All {len(test_ids)} product ID formats accepted correctly"
            )
        else:
            return self.log_test(
                "Different Product ID Formats",
                False,
                f"Only {passed_tests}/{len(test_ids)} product ID formats worked correctly"
            )

    def run_comprehensive_electronics_bestseller_tests(self):
        """Run comprehensive electronics bestseller endpoint testing suite"""
        print("=" * 80)
        print("⚡ RitZone Electronics Bestseller Endpoint Testing Suite - January 2025")
        print("📋 Focus: PUT /api/admin/homepage/electronics/:id endpoint")
        print("=" * 80)
        print(f"📅 Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print(f"🌐 Testing endpoint: {self.base_url}")
        print("=" * 80)

        # Core infrastructure test
        self.test_backend_health()
        
        # Valid request tests
        self.test_valid_bestseller_true()
        self.test_valid_bestseller_false()
        
        # Invalid request tests (validation)
        self.test_invalid_bestseller_string()
        self.test_missing_bestseller_field()
        self.test_invalid_bestseller_number()
        self.test_invalid_bestseller_null()
        
        # Response structure validation
        self.test_response_structure_validation()
        
        # Product ID format tests
        self.test_different_product_ids()

        # Print comprehensive results
        print("\n" + "=" * 80)
        print("📊 COMPREHENSIVE TEST RESULTS SUMMARY")
        print("=" * 80)
        
        critical_tests = []
        validation_tests = []
        structure_tests = []
        
        for result in self.test_results:
            if any(keyword in result['test'].lower() for keyword in ['valid request', 'backend health']):
                critical_tests.append(result)
            elif any(keyword in result['test'].lower() for keyword in ['invalid request', 'missing']):
                validation_tests.append(result)
            else:
                structure_tests.append(result)
        
        print("\n🚨 CRITICAL FUNCTIONALITY TESTS:")
        for result in critical_tests:
            print(f"{result['status']} {result['test']}: {result['message']}")
        
        print("\n🛡️ VALIDATION TESTS:")
        for result in validation_tests:
            print(f"{result['status']} {result['test']}: {result['message']}")
        
        print("\n🔍 STRUCTURE & FORMAT TESTS:")
        for result in structure_tests:
            print(f"{result['status']} {result['test']}: {result['message']}")
        
        print(f"\n📈 Overall Results: {self.tests_passed}/{self.tests_run} tests passed")
        
        # Specific analysis for electronics bestseller endpoint
        endpoint_success = self.tests_passed == self.tests_run
        print(f"\n⚡ Electronics Bestseller Endpoint Status: {'✅ FULLY FUNCTIONAL' if endpoint_success else '❌ HAS ISSUES'}")
        
        if not endpoint_success:
            failed_tests = [r for r in self.test_results if r['status'] == '❌ FAIL']
            print("🔍 Failed Tests:")
            for test in failed_tests:
                print(f"   - {test['test']}: {test['message']}")
        
        # Final assessment
        if self.tests_passed == self.tests_run:
            print("🎉 All tests passed! Electronics bestseller endpoint is working correctly.")
            print("✅ The endpoint properly handles:")
            print("   - Valid requests with is_bestseller: true/false")
            print("   - Input validation for invalid data types")
            print("   - Missing field validation")
            print("   - Correct response structure")
            print("   - Different product ID formats")
            return 0
        else:
            failed_critical = [r for r in critical_tests if r['status'] == '❌ FAIL']
            if failed_critical:
                print(f"🚨 {len(failed_critical)} critical tests failed")
                print("💡 Recommendations:")
                for test in failed_critical:
                    if 'backend health' in test['test'].lower():
                        print("   - Check backend server is running on correct port")
                    elif 'valid request' in test['test'].lower():
                        print("   - Check endpoint implementation and routing")
                        print("   - Verify response structure matches expected format")
            return 1

def main():
    """Main test execution"""
    tester = ElectronicsBestsellerTester()
    return tester.run_comprehensive_electronics_bestseller_tests()

if __name__ == "__main__":
    sys.exit(main())
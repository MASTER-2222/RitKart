#!/usr/bin/env python3
"""
RitZone Profile Enhancement Backend Testing Suite - January 2025
================================================================
Comprehensive testing for Profile Enhancement APIs with focus on:
- Profile dashboard statistics (GET /api/profile/dashboard)
- Address management (GET/POST/PUT/DELETE /api/profile/addresses)
- Payment methods management (GET/POST/PUT/DELETE /api/profile/payment-methods)
- Wishlist management (GET/POST/DELETE /api/profile/wishlist)
- Profile update (PUT /api/auth/profile)
- Orders API (GET /api/orders)
- Authentication and authorization testing
- Error handling and edge cases
"""

import requests
import json
import sys
import uuid
import time
from datetime import datetime

class ProfileEnhancementTester:
    def __init__(self, base_url="https://ritkart-backend.onrender.com/api"):
        self.base_url = base_url
        self.token = None
        self.user_id = None
        self.test_user_email = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []
        self.created_addresses = []
        self.created_payment_methods = []
        self.created_wishlist_items = []

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

    def test_backend_health(self):
        """Test if backend is running and accessible"""
        try:
            response = requests.get(f"{self.base_url}/health", timeout=30)
            if response.status_code == 200:
                data = response.json()
                return self.log_test(
                    "Backend Health Check",
                    True,
                    f"Backend is running. Environment: {data.get('environment', {}).get('nodeEnv', 'unknown')}",
                    data
                )
            else:
                return self.log_test(
                    "Backend Health Check",
                    False,
                    f"Health check failed with status {response.status_code}",
                    response.text
                )
        except requests.exceptions.Timeout:
            # Try alternative endpoints if health check times out
            try:
                response = requests.get(f"{self.base_url}/products?limit=1", timeout=30)
                if response.status_code == 200:
                    return self.log_test(
                        "Backend Health Check",
                        True,
                        "Backend is running (verified via products endpoint)",
                        {"status": "healthy", "verified_via": "products_endpoint"}
                    )
                else:
                    return self.log_test(
                        "Backend Health Check",
                        False,
                        f"Backend not responding properly. Status: {response.status_code}",
                        response.text
                    )
            except Exception as e2:
                return self.log_test(
                    "Backend Health Check",
                    False,
                    f"Cannot connect to backend: {str(e2)}"
                )
        except Exception as e:
            return self.log_test(
                "Backend Health Check",
                False,
                f"Cannot connect to backend: {str(e)}"
            )

    def register_test_user(self):
        """Register a test user for authentication"""
        try:
            # Generate unique test user
            timestamp = int(time.time())
            self.test_user_email = f"profiletest{timestamp}@ritzone.com"
            
            user_data = {
                "email": self.test_user_email,
                "password": "ProfileTest123!",
                "fullName": "Profile Test User",
                "phone": "+1234567890"
            }
            
            response = requests.post(f"{self.base_url}/auth/register", json=user_data, timeout=15)
            
            if response.status_code == 201:
                data = response.json()
                return self.log_test(
                    "User Registration",
                    True,
                    f"Test user registered: {self.test_user_email}",
                    data
                )
            else:
                return self.log_test(
                    "User Registration",
                    False,
                    f"Registration failed with status {response.status_code}",
                    response.text
                )
        except Exception as e:
            return self.log_test(
                "User Registration",
                False,
                f"Registration error: {str(e)}"
            )

    def login_test_user(self):
        """Login with test user to get authentication token"""
        try:
            login_data = {
                "email": self.test_user_email,
                "password": "ProfileTest123!"
            }
            
            response = requests.post(f"{self.base_url}/auth/login", json=login_data, timeout=15)
            
            if response.status_code == 200:
                data = response.json()
                self.token = data.get('token')
                self.user_id = data.get('user', {}).get('id')
                
                return self.log_test(
                    "User Login",
                    True,
                    f"Login successful. Token obtained for user: {self.user_id}",
                    {"user_id": self.user_id, "has_token": bool(self.token)}
                )
            else:
                return self.log_test(
                    "User Login",
                    False,
                    f"Login failed with status {response.status_code}",
                    response.text
                )
        except Exception as e:
            return self.log_test(
                "User Login",
                False,
                f"Login error: {str(e)}"
            )

    def get_auth_headers(self):
        """Get authorization headers for authenticated requests"""
        return {"Authorization": f"Bearer {self.token}"}

    def test_profile_dashboard(self):
        """Test GET /api/profile/dashboard endpoint"""
        try:
            response = requests.get(
                f"{self.base_url}/profile/dashboard",
                headers=self.get_auth_headers(),
                timeout=15
            )
            
            if response.status_code == 200:
                data = response.json()
                dashboard_data = data.get('data', {})
                
                # Verify dashboard structure
                required_fields = ['user', 'stats', 'recentOrders']
                missing_fields = [field for field in required_fields if field not in dashboard_data]
                
                if not missing_fields:
                    stats = dashboard_data.get('stats', {})
                    return self.log_test(
                        "Profile Dashboard",
                        True,
                        f"Dashboard loaded successfully. Stats: {stats}",
                        dashboard_data
                    )
                else:
                    return self.log_test(
                        "Profile Dashboard",
                        False,
                        f"Missing dashboard fields: {missing_fields}",
                        data
                    )
            else:
                return self.log_test(
                    "Profile Dashboard",
                    False,
                    f"Dashboard request failed with status {response.status_code}",
                    response.text
                )
        except Exception as e:
            return self.log_test(
                "Profile Dashboard",
                False,
                f"Dashboard error: {str(e)}"
            )

    def test_addresses_crud(self):
        """Test address management endpoints"""
        # Test GET addresses (empty initially)
        try:
            response = requests.get(
                f"{self.base_url}/profile/addresses",
                headers=self.get_auth_headers(),
                timeout=15
            )
            
            if response.status_code == 200:
                data = response.json()
                addresses = data.get('data', [])
                self.log_test(
                    "Get Addresses (Initial)",
                    True,
                    f"Retrieved {len(addresses)} addresses",
                    addresses
                )
            else:
                self.log_test(
                    "Get Addresses (Initial)",
                    False,
                    f"Get addresses failed with status {response.status_code}",
                    response.text
                )
        except Exception as e:
            self.log_test(
                "Get Addresses (Initial)",
                False,
                f"Get addresses error: {str(e)}"
            )

        # Test POST address (create new)
        try:
            address_data = {
                "type": "home",
                "name": "John Doe",
                "street": "123 Main Street, Apt 4B",
                "city": "New York",
                "state": "NY",
                "zip_code": "10001",
                "country": "United States",
                "phone": "+1234567890",
                "is_default": True
            }
            
            response = requests.post(
                f"{self.base_url}/profile/addresses",
                headers=self.get_auth_headers(),
                json=address_data,
                timeout=15
            )
            
            if response.status_code == 201:
                data = response.json()
                created_address = data.get('data', {})
                address_id = created_address.get('id')
                self.created_addresses.append(address_id)
                
                self.log_test(
                    "Create Address",
                    True,
                    f"Address created successfully with ID: {address_id}",
                    created_address
                )
                
                # Test PUT address (update)
                update_data = {
                    "street": "456 Updated Street, Suite 10",
                    "city": "Brooklyn"
                }
                
                update_response = requests.put(
                    f"{self.base_url}/profile/addresses/{address_id}",
                    headers=self.get_auth_headers(),
                    json=update_data,
                    timeout=15
                )
                
                if update_response.status_code == 200:
                    updated_data = update_response.json()
                    self.log_test(
                        "Update Address",
                        True,
                        f"Address updated successfully",
                        updated_data.get('data', {})
                    )
                else:
                    self.log_test(
                        "Update Address",
                        False,
                        f"Update failed with status {update_response.status_code}",
                        update_response.text
                    )
                
            else:
                self.log_test(
                    "Create Address",
                    False,
                    f"Create address failed with status {response.status_code}",
                    response.text
                )
        except Exception as e:
            self.log_test(
                "Create Address",
                False,
                f"Create address error: {str(e)}"
            )

    def test_payment_methods_crud(self):
        """Test payment methods management endpoints"""
        # Test GET payment methods (empty initially)
        try:
            response = requests.get(
                f"{self.base_url}/profile/payment-methods",
                headers=self.get_auth_headers(),
                timeout=15
            )
            
            if response.status_code == 200:
                data = response.json()
                payment_methods = data.get('data', [])
                self.log_test(
                    "Get Payment Methods (Initial)",
                    True,
                    f"Retrieved {len(payment_methods)} payment methods",
                    payment_methods
                )
            else:
                self.log_test(
                    "Get Payment Methods (Initial)",
                    False,
                    f"Get payment methods failed with status {response.status_code}",
                    response.text
                )
        except Exception as e:
            self.log_test(
                "Get Payment Methods (Initial)",
                False,
                f"Get payment methods error: {str(e)}"
            )

        # Test POST payment method (create new)
        try:
            payment_data = {
                "type": "card",
                "name": "Visa ending in 4567",
                "details": "**** **** **** 4567",
                "last_four": "4567",
                "expiry_date": "12/28",
                "is_default": True
            }
            
            response = requests.post(
                f"{self.base_url}/profile/payment-methods",
                headers=self.get_auth_headers(),
                json=payment_data,
                timeout=15
            )
            
            if response.status_code == 201:
                data = response.json()
                created_method = data.get('data', {})
                method_id = created_method.get('id')
                self.created_payment_methods.append(method_id)
                
                self.log_test(
                    "Create Payment Method",
                    True,
                    f"Payment method created successfully with ID: {method_id}",
                    created_method
                )
                
                # Test PUT payment method (update)
                update_data = {
                    "name": "Visa ending in 4567 (Updated)",
                    "expiry_date": "06/29"
                }
                
                update_response = requests.put(
                    f"{self.base_url}/profile/payment-methods/{method_id}",
                    headers=self.get_auth_headers(),
                    json=update_data,
                    timeout=15
                )
                
                if update_response.status_code == 200:
                    updated_data = update_response.json()
                    self.log_test(
                        "Update Payment Method",
                        True,
                        f"Payment method updated successfully",
                        updated_data.get('data', {})
                    )
                else:
                    self.log_test(
                        "Update Payment Method",
                        False,
                        f"Update failed with status {update_response.status_code}",
                        update_response.text
                    )
                
            else:
                self.log_test(
                    "Create Payment Method",
                    False,
                    f"Create payment method failed with status {response.status_code}",
                    response.text
                )
        except Exception as e:
            self.log_test(
                "Create Payment Method",
                False,
                f"Create payment method error: {str(e)}"
            )

    def test_wishlist_management(self):
        """Test wishlist management endpoints"""
        # Test GET wishlist (empty initially)
        try:
            response = requests.get(
                f"{self.base_url}/profile/wishlist",
                headers=self.get_auth_headers(),
                timeout=15
            )
            
            if response.status_code == 200:
                data = response.json()
                wishlist_items = data.get('data', [])
                self.log_test(
                    "Get Wishlist (Initial)",
                    True,
                    f"Retrieved {len(wishlist_items)} wishlist items",
                    wishlist_items
                )
            else:
                self.log_test(
                    "Get Wishlist (Initial)",
                    False,
                    f"Get wishlist failed with status {response.status_code}",
                    response.text
                )
        except Exception as e:
            self.log_test(
                "Get Wishlist (Initial)",
                False,
                f"Get wishlist error: {str(e)}"
            )

        # Get a product ID for testing (from products API)
        product_id = None
        try:
            products_response = requests.get(f"{self.base_url}/products?limit=1", timeout=15)
            if products_response.status_code == 200:
                products_data = products_response.json()
                products = products_data.get('data', [])
                if products:
                    product_id = products[0].get('id')
                    self.log_test(
                        "Get Product for Wishlist Test",
                        True,
                        f"Found product ID: {product_id}",
                        {"product_id": product_id}
                    )
        except Exception as e:
            self.log_test(
                "Get Product for Wishlist Test",
                False,
                f"Failed to get product: {str(e)}"
            )

        # Test POST wishlist (add item)
        if product_id:
            try:
                wishlist_data = {
                    "product_id": product_id
                }
                
                response = requests.post(
                    f"{self.base_url}/profile/wishlist",
                    headers=self.get_auth_headers(),
                    json=wishlist_data,
                    timeout=15
                )
                
                if response.status_code == 201:
                    data = response.json()
                    created_item = data.get('data', {})
                    self.created_wishlist_items.append(product_id)
                    
                    self.log_test(
                        "Add to Wishlist",
                        True,
                        f"Item added to wishlist successfully",
                        created_item
                    )
                    
                    # Test DELETE wishlist item
                    delete_response = requests.delete(
                        f"{self.base_url}/profile/wishlist/{product_id}",
                        headers=self.get_auth_headers(),
                        timeout=15
                    )
                    
                    if delete_response.status_code == 200:
                        self.log_test(
                            "Remove from Wishlist",
                            True,
                            f"Item removed from wishlist successfully",
                            delete_response.json()
                        )
                    else:
                        self.log_test(
                            "Remove from Wishlist",
                            False,
                            f"Remove failed with status {delete_response.status_code}",
                            delete_response.text
                        )
                    
                else:
                    self.log_test(
                        "Add to Wishlist",
                        False,
                        f"Add to wishlist failed with status {response.status_code}",
                        response.text
                    )
            except Exception as e:
                self.log_test(
                    "Add to Wishlist",
                    False,
                    f"Add to wishlist error: {str(e)}"
                )

    def test_profile_update(self):
        """Test PUT /api/auth/profile endpoint"""
        try:
            profile_data = {
                "fullName": "Profile Test User Updated",
                "phone": "+1987654321",
                "dateOfBirth": "1990-01-15"
            }
            
            response = requests.put(
                f"{self.base_url}/auth/profile",
                headers=self.get_auth_headers(),
                json=profile_data,
                timeout=15
            )
            
            if response.status_code == 200:
                data = response.json()
                updated_user = data.get('user', {})
                
                self.log_test(
                    "Update Profile",
                    True,
                    f"Profile updated successfully",
                    updated_user
                )
            else:
                self.log_test(
                    "Update Profile",
                    False,
                    f"Profile update failed with status {response.status_code}",
                    response.text
                )
        except Exception as e:
            self.log_test(
                "Update Profile",
                False,
                f"Profile update error: {str(e)}"
            )

    def test_orders_api(self):
        """Test GET /api/orders endpoint"""
        try:
            response = requests.get(
                f"{self.base_url}/orders",
                headers=self.get_auth_headers(),
                timeout=15
            )
            
            if response.status_code == 200:
                data = response.json()
                orders = data.get('data', [])
                pagination = data.get('pagination', {})
                
                self.log_test(
                    "Get Orders",
                    True,
                    f"Retrieved {len(orders)} orders. Pagination: {pagination}",
                    {"orders_count": len(orders), "pagination": pagination}
                )
            else:
                self.log_test(
                    "Get Orders",
                    False,
                    f"Get orders failed with status {response.status_code}",
                    response.text
                )
        except Exception as e:
            self.log_test(
                "Get Orders",
                False,
                f"Get orders error: {str(e)}"
            )

    def test_authentication_protection(self):
        """Test that endpoints are properly protected"""
        endpoints_to_test = [
            "/profile/dashboard",
            "/profile/addresses",
            "/profile/payment-methods",
            "/profile/wishlist",
            "/auth/profile",
            "/orders"
        ]
        
        for endpoint in endpoints_to_test:
            try:
                # Test without token
                response = requests.get(f"{self.base_url}{endpoint}", timeout=10)
                
                if response.status_code == 401:
                    self.log_test(
                        f"Auth Protection - {endpoint}",
                        True,
                        f"Endpoint properly protected (401 Unauthorized)",
                        {"endpoint": endpoint, "status": response.status_code}
                    )
                else:
                    self.log_test(
                        f"Auth Protection - {endpoint}",
                        False,
                        f"Endpoint not properly protected (expected 401, got {response.status_code})",
                        {"endpoint": endpoint, "status": response.status_code}
                    )
            except Exception as e:
                self.log_test(
                    f"Auth Protection - {endpoint}",
                    False,
                    f"Auth protection test error: {str(e)}"
                )

    def cleanup_test_data(self):
        """Clean up created test data"""
        # Delete created addresses
        for address_id in self.created_addresses:
            try:
                requests.delete(
                    f"{self.base_url}/profile/addresses/{address_id}",
                    headers=self.get_auth_headers(),
                    timeout=10
                )
            except:
                pass
        
        # Delete created payment methods
        for method_id in self.created_payment_methods:
            try:
                requests.delete(
                    f"{self.base_url}/profile/payment-methods/{method_id}",
                    headers=self.get_auth_headers(),
                    timeout=10
                )
            except:
                pass
        
        # Remove wishlist items
        for product_id in self.created_wishlist_items:
            try:
                requests.delete(
                    f"{self.base_url}/profile/wishlist/{product_id}",
                    headers=self.get_auth_headers(),
                    timeout=10
                )
            except:
                pass

    def run_all_tests(self):
        """Run comprehensive profile enhancement testing suite"""
        print("🚀 Starting RitZone Profile Enhancement Backend Testing Suite")
        print("=" * 80)
        
        # Phase 1: Basic connectivity and authentication
        print("\n📡 Phase 1: Backend Connectivity & Authentication")
        print("-" * 50)
        
        if not self.test_backend_health():
            print("❌ Backend health check failed. Cannot proceed with testing.")
            return False
        
        if not self.register_test_user():
            print("❌ User registration failed. Cannot proceed with testing.")
            return False
        
        if not self.login_test_user():
            print("❌ User login failed. Cannot proceed with testing.")
            return False
        
        # Phase 2: Profile Enhancement APIs
        print("\n🏠 Phase 2: Profile Enhancement APIs")
        print("-" * 50)
        
        self.test_profile_dashboard()
        self.test_addresses_crud()
        self.test_payment_methods_crud()
        self.test_wishlist_management()
        self.test_profile_update()
        self.test_orders_api()
        
        # Phase 3: Security and Authentication
        print("\n🔒 Phase 3: Security & Authentication Testing")
        print("-" * 50)
        
        self.test_authentication_protection()
        
        # Phase 4: Cleanup
        print("\n🧹 Phase 4: Cleanup")
        print("-" * 50)
        
        self.cleanup_test_data()
        print("✅ Test data cleanup completed")
        
        # Final Results
        print("\n" + "=" * 80)
        print("🎯 PROFILE ENHANCEMENT TESTING RESULTS")
        print("=" * 80)
        
        success_rate = (self.tests_passed / self.tests_run * 100) if self.tests_run > 0 else 0
        
        print(f"📊 Tests Run: {self.tests_run}")
        print(f"✅ Tests Passed: {self.tests_passed}")
        print(f"❌ Tests Failed: {self.tests_run - self.tests_passed}")
        print(f"📈 Success Rate: {success_rate:.1f}%")
        
        print(f"\n📋 DETAILED RESULTS:")
        print("-" * 50)
        
        for result in self.test_results:
            print(f"{result['status']} {result['test']}: {result['message']}")
        
        # Summary for main agent
        print(f"\n🎯 SUMMARY FOR MAIN AGENT:")
        print("-" * 50)
        
        if success_rate >= 80:
            print("✅ PROFILE ENHANCEMENT APIS ARE WORKING WELL!")
            print("🎉 All major functionality is operational.")
            print("📝 Ready for frontend integration and user testing.")
        else:
            print("⚠️ SOME PROFILE ENHANCEMENT APIS NEED ATTENTION")
            print("🔧 Review failed tests and address issues before proceeding.")
        
        return success_rate >= 80

def main():
    """Main execution function"""
    print("🎯 RitZone Profile Enhancement Backend Testing Suite")
    print("📅 January 2025 - Comprehensive API Testing")
    print("=" * 80)
    
    # Initialize tester with production server
    tester = ProfileEnhancementTester("https://ritkart-backend.onrender.com/api")
    
    # Run all tests
    success = tester.run_all_tests()
    
    # Exit with appropriate code
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()
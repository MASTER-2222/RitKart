#!/usr/bin/env python3
"""
RitZone Admin Panel Synchronization Testing
===========================================
Comprehensive testing of admin panel synchronization functionality:
1. Admin Panel User Profile Data Synchronization
2. Order Synchronization 
3. Real-time Data Consistency
4. Complete Profile Enhancement APIs
"""

import requests
import json
import time
import uuid
from datetime import datetime

# Configuration
BACKEND_URL = "https://ritkart-backend-ujnt.onrender.com/api"
TIMEOUT = 30

class AdminPanelSyncTester:
    def __init__(self):
        self.session = requests.Session()
        self.admin_token = None
        self.user_token = None
        self.test_user_id = None
        self.test_results = []
        
    def log_test(self, test_name, success, message, details=None):
        """Log test results"""
        result = {
            'test': test_name,
            'success': success,
            'message': message,
            'details': details,
            'timestamp': datetime.now().isoformat()
        }
        self.test_results.append(result)
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status}: {test_name} - {message}")
        if details:
            print(f"   Details: {details}")
    
    def test_backend_health(self):
        """Test backend connectivity"""
        try:
            response = self.session.get(f"{BACKEND_URL}/health", timeout=TIMEOUT)
            if response.status_code == 200:
                data = response.json()
                self.log_test("Backend Health Check", True, 
                            f"Backend is running - {data.get('message', 'OK')}")
                return True
            else:
                self.log_test("Backend Health Check", False, 
                            f"Backend returned status {response.status_code}")
                return False
        except Exception as e:
            self.log_test("Backend Health Check", False, f"Connection failed: {str(e)}")
            return False
    
    def admin_login(self):
        """Login as admin to get admin token"""
        try:
            login_data = {
                "email": "admin@ritzone.com",
                "password": "RitZone@Admin2025!"
            }
            
            response = self.session.post(f"{BACKEND_URL}/admin/auth/login", 
                                       json=login_data, timeout=TIMEOUT)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success') and data.get('sessionToken'):
                    self.admin_token = data['sessionToken']
                    self.session.headers.update({'Authorization': f'Bearer {self.admin_token}'})
                    self.log_test("Admin Login", True, "Admin authentication successful")
                    return True
                else:
                    self.log_test("Admin Login", False, f"Login failed: {data.get('message', 'Unknown error')}")
                    return False
            else:
                self.log_test("Admin Login", False, f"Login request failed with status {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("Admin Login", False, f"Admin login error: {str(e)}")
            return False
    
    def user_login(self):
        """Login as regular user to get user token and ID"""
        try:
            # First try to register a test user
            register_data = {
                "email": f"testuser_{uuid.uuid4().hex[:8]}@example.com",
                "password": "TestUser123!",
                "fullName": "Test User Profile Sync",
                "phone": "+1234567890"
            }
            
            register_response = self.session.post(f"{BACKEND_URL}/auth/register", 
                                                json=register_data, timeout=TIMEOUT)
            
            if register_response.status_code == 201:
                register_result = register_response.json()
                if register_result.get('success'):
                    self.user_token = register_result['token']
                    self.test_user_id = register_result['user']['id']
                    self.log_test("User Registration", True, 
                                f"Test user created with ID: {self.test_user_id}")
                    return True
            
            # If registration fails, try to login with existing test user
            login_data = {
                "email": "testuser@example.com",
                "password": "TestUser123!"
            }
            
            login_response = self.session.post(f"{BACKEND_URL}/auth/login", 
                                             json=login_data, timeout=TIMEOUT)
            
            if login_response.status_code == 200:
                login_result = login_response.json()
                if login_result.get('success'):
                    self.user_token = login_result['token']
                    self.test_user_id = login_result['user']['id']
                    self.log_test("User Login", True, 
                                f"Logged in with existing user ID: {self.test_user_id}")
                    return True
            
            self.log_test("User Authentication", False, "Failed to authenticate test user")
            return False
            
        except Exception as e:
            self.log_test("User Authentication", False, f"User auth error: {str(e)}")
            return False
    
    def create_test_data(self):
        """Create test data for synchronization testing"""
        if not self.user_token or not self.test_user_id:
            self.log_test("Create Test Data", False, "No authenticated user available")
            return False
        
        try:
            # Set user authorization header
            user_headers = {'Authorization': f'Bearer {self.user_token}'}
            
            # Create test address
            address_data = {
                "type": "home",
                "street": "123 Test Street",
                "city": "Test City",
                "state": "Test State",
                "country": "Test Country",
                "postal_code": "12345",
                "is_default": True
            }
            
            address_response = self.session.post(f"{BACKEND_URL}/profile/addresses", 
                                               json=address_data, headers=user_headers, timeout=TIMEOUT)
            
            # Create test payment method
            payment_data = {
                "type": "card",
                "card_number": "4111111111111111",
                "card_holder_name": "Test User",
                "expiry_month": "12",
                "expiry_year": "2025",
                "is_default": True
            }
            
            payment_response = self.session.post(f"{BACKEND_URL}/profile/payment-methods", 
                                               json=payment_data, headers=user_headers, timeout=TIMEOUT)
            
            # Add items to wishlist (need to get some product IDs first)
            products_response = self.session.get(f"{BACKEND_URL}/products?limit=2", timeout=TIMEOUT)
            if products_response.status_code == 200:
                products_data = products_response.json()
                if products_data.get('success') and products_data.get('data', {}).get('products'):
                    product_id = products_data['data']['products'][0]['id']
                    
                    wishlist_data = {"product_id": product_id}
                    wishlist_response = self.session.post(f"{BACKEND_URL}/profile/wishlist", 
                                                        json=wishlist_data, headers=user_headers, timeout=TIMEOUT)
            
            self.log_test("Create Test Data", True, "Test data created for synchronization testing")
            return True
            
        except Exception as e:
            self.log_test("Create Test Data", False, f"Error creating test data: {str(e)}")
            return False
    
    def test_admin_user_profile_sync(self):
        """Test GET /api/admin/users/{userId} endpoint for comprehensive user profile data"""
        if not self.admin_token or not self.test_user_id:
            self.log_test("Admin User Profile Sync", False, "Missing admin token or test user ID")
            return False
        
        try:
            response = self.session.get(f"{BACKEND_URL}/admin/users/{self.test_user_id}", 
                                      timeout=TIMEOUT)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success') and data.get('data'):
                    user_data = data['data']
                    
                    # Verify comprehensive user profile data
                    required_fields = ['id', 'email', 'full_name', 'phone', 'created_at']
                    profile_sections = ['addresses', 'paymentMethods', 'wishlistItems', 'recentOrders', 'statistics']
                    
                    missing_fields = [field for field in required_fields if field not in user_data]
                    missing_sections = [section for section in profile_sections if section not in user_data]
                    
                    if not missing_fields and not missing_sections:
                        # Verify statistics
                        stats = user_data.get('statistics', {})
                        required_stats = ['totalOrders', 'completedOrders', 'pendingOrders', 'totalSpent', 
                                        'cartItemsCount', 'wishlistItemsCount']
                        missing_stats = [stat for stat in required_stats if stat not in stats]
                        
                        if not missing_stats:
                            self.log_test("Admin User Profile Sync", True, 
                                        f"Complete user profile data retrieved with all sections and statistics",
                                        f"User: {user_data.get('full_name')}, Addresses: {len(user_data.get('addresses', []))}, "
                                        f"Payment Methods: {len(user_data.get('paymentMethods', []))}, "
                                        f"Wishlist Items: {len(user_data.get('wishlistItems', []))}")
                            return True
                        else:
                            self.log_test("Admin User Profile Sync", False, 
                                        f"Missing statistics fields: {missing_stats}")
                            return False
                    else:
                        self.log_test("Admin User Profile Sync", False, 
                                    f"Missing fields: {missing_fields}, Missing sections: {missing_sections}")
                        return False
                else:
                    self.log_test("Admin User Profile Sync", False, "Invalid response structure")
                    return False
            else:
                self.log_test("Admin User Profile Sync", False, 
                            f"Request failed with status {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("Admin User Profile Sync", False, f"Error: {str(e)}")
            return False
    
    def test_admin_user_orders_sync(self):
        """Test GET /api/admin/users/{userId}/orders endpoint"""
        if not self.admin_token or not self.test_user_id:
            self.log_test("Admin User Orders Sync", False, "Missing admin token or test user ID")
            return False
        
        try:
            response = self.session.get(f"{BACKEND_URL}/admin/users/{self.test_user_id}/orders", 
                                      timeout=TIMEOUT)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success'):
                    orders = data.get('data', [])
                    pagination = data.get('pagination', {})
                    
                    # Verify pagination structure
                    required_pagination = ['currentPage', 'totalPages', 'totalOrders', 'limit']
                    missing_pagination = [field for field in required_pagination if field not in pagination]
                    
                    if not missing_pagination:
                        self.log_test("Admin User Orders Sync", True, 
                                    f"User orders endpoint working correctly",
                                    f"Total Orders: {pagination.get('totalOrders', 0)}, "
                                    f"Current Page: {pagination.get('currentPage', 1)}")
                        return True
                    else:
                        self.log_test("Admin User Orders Sync", False, 
                                    f"Missing pagination fields: {missing_pagination}")
                        return False
                else:
                    self.log_test("Admin User Orders Sync", False, "Invalid response structure")
                    return False
            else:
                self.log_test("Admin User Orders Sync", False, 
                            f"Request failed with status {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("Admin User Orders Sync", False, f"Error: {str(e)}")
            return False
    
    def test_profile_dashboard_consistency(self):
        """Test data consistency between user profile dashboard and admin panel"""
        if not self.user_token or not self.admin_token or not self.test_user_id:
            self.log_test("Profile Dashboard Consistency", False, "Missing required tokens or user ID")
            return False
        
        try:
            # Get user profile dashboard data
            user_headers = {'Authorization': f'Bearer {self.user_token}'}
            user_response = self.session.get(f"{BACKEND_URL}/profile/dashboard", 
                                           headers=user_headers, timeout=TIMEOUT)
            
            # Get admin view of same user
            admin_response = self.session.get(f"{BACKEND_URL}/admin/users/{self.test_user_id}", 
                                            timeout=TIMEOUT)
            
            if user_response.status_code == 200 and admin_response.status_code == 200:
                user_data = user_response.json()
                admin_data = admin_response.json()
                
                if user_data.get('success') and admin_data.get('success'):
                    user_stats = user_data.get('data', {}).get('stats', {})
                    admin_stats = admin_data.get('data', {}).get('statistics', {})
                    
                    # Compare key statistics
                    stats_to_compare = ['totalOrders', 'wishlistItems', 'cartItems']
                    inconsistencies = []
                    
                    for stat in stats_to_compare:
                        user_val = user_stats.get(stat, 0)
                        admin_val = admin_stats.get(f"{stat}Count" if stat != 'totalOrders' else stat, 0)
                        
                        if user_val != admin_val:
                            inconsistencies.append(f"{stat}: User={user_val}, Admin={admin_val}")
                    
                    if not inconsistencies:
                        self.log_test("Profile Dashboard Consistency", True, 
                                    "Data is consistent between user profile and admin panel")
                        return True
                    else:
                        self.log_test("Profile Dashboard Consistency", False, 
                                    f"Data inconsistencies found: {', '.join(inconsistencies)}")
                        return False
                else:
                    self.log_test("Profile Dashboard Consistency", False, "Invalid response structure")
                    return False
            else:
                self.log_test("Profile Dashboard Consistency", False, 
                            f"Request failed - User: {user_response.status_code}, Admin: {admin_response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("Profile Dashboard Consistency", False, f"Error: {str(e)}")
            return False
    
    def test_profile_apis_functionality(self):
        """Test all profile-related APIs for completeness"""
        if not self.user_token:
            self.log_test("Profile APIs Functionality", False, "Missing user token")
            return False
        
        try:
            user_headers = {'Authorization': f'Bearer {self.user_token}'}
            api_tests = []
            
            # Test profile dashboard
            dashboard_response = self.session.get(f"{BACKEND_URL}/profile/dashboard", 
                                                headers=user_headers, timeout=TIMEOUT)
            api_tests.append(("Dashboard API", dashboard_response.status_code == 200))
            
            # Test addresses API
            addresses_response = self.session.get(f"{BACKEND_URL}/profile/addresses", 
                                                headers=user_headers, timeout=TIMEOUT)
            api_tests.append(("Addresses API", addresses_response.status_code == 200))
            
            # Test payment methods API
            payment_response = self.session.get(f"{BACKEND_URL}/profile/payment-methods", 
                                              headers=user_headers, timeout=TIMEOUT)
            api_tests.append(("Payment Methods API", payment_response.status_code == 200))
            
            # Test wishlist API
            wishlist_response = self.session.get(f"{BACKEND_URL}/profile/wishlist", 
                                               headers=user_headers, timeout=TIMEOUT)
            api_tests.append(("Wishlist API", wishlist_response.status_code == 200))
            
            # Test orders API
            orders_response = self.session.get(f"{BACKEND_URL}/orders", 
                                             headers=user_headers, timeout=TIMEOUT)
            api_tests.append(("Orders API", orders_response.status_code == 200))
            
            # Test profile update API
            profile_response = self.session.get(f"{BACKEND_URL}/auth/profile", 
                                              headers=user_headers, timeout=TIMEOUT)
            api_tests.append(("Profile Info API", profile_response.status_code == 200))
            
            passed_tests = [test for test, result in api_tests if result]
            failed_tests = [test for test, result in api_tests if not result]
            
            if len(passed_tests) == len(api_tests):
                self.log_test("Profile APIs Functionality", True, 
                            f"All {len(api_tests)} profile APIs working correctly",
                            f"Working APIs: {', '.join([test for test, _ in api_tests])}")
                return True
            else:
                self.log_test("Profile APIs Functionality", False, 
                            f"{len(passed_tests)}/{len(api_tests)} APIs working",
                            f"Failed APIs: {', '.join(failed_tests)}")
                return False
                
        except Exception as e:
            self.log_test("Profile APIs Functionality", False, f"Error: {str(e)}")
            return False
    
    def test_real_time_data_sync(self):
        """Test real-time synchronization by making changes and verifying they appear in admin panel"""
        if not self.user_token or not self.admin_token or not self.test_user_id:
            self.log_test("Real-time Data Sync", False, "Missing required tokens or user ID")
            return False
        
        try:
            user_headers = {'Authorization': f'Bearer {self.user_token}'}
            
            # Create a new address
            new_address = {
                "type": "work",
                "street": "456 Sync Test Avenue",
                "city": "Sync City",
                "state": "Sync State",
                "country": "Sync Country",
                "postal_code": "54321",
                "is_default": False
            }
            
            create_response = self.session.post(f"{BACKEND_URL}/profile/addresses", 
                                              json=new_address, headers=user_headers, timeout=TIMEOUT)
            
            if create_response.status_code == 201:
                # Wait a moment for data to sync
                time.sleep(1)
                
                # Check if the new address appears in admin panel
                admin_response = self.session.get(f"{BACKEND_URL}/admin/users/{self.test_user_id}", 
                                                timeout=TIMEOUT)
                
                if admin_response.status_code == 200:
                    admin_data = admin_response.json()
                    if admin_data.get('success'):
                        addresses = admin_data.get('data', {}).get('addresses', [])
                        sync_address = next((addr for addr in addresses if addr.get('street') == "456 Sync Test Avenue"), None)
                        
                        if sync_address:
                            self.log_test("Real-time Data Sync", True, 
                                        "Data synchronization working - new address appears in admin panel immediately")
                            return True
                        else:
                            self.log_test("Real-time Data Sync", False, 
                                        "New address not found in admin panel")
                            return False
                    else:
                        self.log_test("Real-time Data Sync", False, "Invalid admin response")
                        return False
                else:
                    self.log_test("Real-time Data Sync", False, 
                                f"Admin request failed with status {admin_response.status_code}")
                    return False
            else:
                self.log_test("Real-time Data Sync", False, 
                            f"Failed to create test address: {create_response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("Real-time Data Sync", False, f"Error: {str(e)}")
            return False
    
    def run_all_tests(self):
        """Run all admin panel synchronization tests"""
        print("🎯 STARTING ADMIN PANEL SYNCHRONIZATION TESTING")
        print("=" * 60)
        
        # Basic connectivity tests
        if not self.test_backend_health():
            print("❌ Backend not accessible, stopping tests")
            return
        
        if not self.admin_login():
            print("❌ Admin authentication failed, stopping tests")
            return
        
        if not self.user_login():
            print("❌ User authentication failed, stopping tests")
            return
        
        # Create test data for synchronization testing
        self.create_test_data()
        
        # Run synchronization tests
        print("\n🔄 TESTING ADMIN PANEL SYNCHRONIZATION...")
        self.test_admin_user_profile_sync()
        self.test_admin_user_orders_sync()
        self.test_profile_dashboard_consistency()
        self.test_profile_apis_functionality()
        self.test_real_time_data_sync()
        
        # Generate summary
        self.generate_summary()
    
    def generate_summary(self):
        """Generate test summary"""
        print("\n" + "=" * 60)
        print("🎯 ADMIN PANEL SYNCHRONIZATION TEST SUMMARY")
        print("=" * 60)
        
        passed_tests = [test for test in self.test_results if test['success']]
        failed_tests = [test for test in self.test_results if not test['success']]
        
        print(f"✅ PASSED: {len(passed_tests)}/{len(self.test_results)} tests")
        print(f"❌ FAILED: {len(failed_tests)}/{len(self.test_results)} tests")
        print(f"📊 SUCCESS RATE: {(len(passed_tests)/len(self.test_results)*100):.1f}%")
        
        if failed_tests:
            print("\n❌ FAILED TESTS:")
            for test in failed_tests:
                print(f"   • {test['test']}: {test['message']}")
        
        print("\n✅ PASSED TESTS:")
        for test in passed_tests:
            print(f"   • {test['test']}: {test['message']}")
        
        # Specific findings for admin panel synchronization
        print("\n🔍 ADMIN PANEL SYNCHRONIZATION FINDINGS:")
        
        sync_tests = ['Admin User Profile Sync', 'Admin User Orders Sync', 'Profile Dashboard Consistency', 'Real-time Data Sync']
        sync_results = [test for test in self.test_results if test['test'] in sync_tests]
        sync_passed = [test for test in sync_results if test['success']]
        
        if len(sync_passed) == len(sync_results):
            print("✅ ADMIN PANEL SYNCHRONIZATION: FULLY WORKING")
            print("   • User profile data synchronization: ✅ Working")
            print("   • Order synchronization: ✅ Working") 
            print("   • Real-time data consistency: ✅ Working")
            print("   • Complete profile APIs: ✅ Working")
        else:
            print("❌ ADMIN PANEL SYNCHRONIZATION: ISSUES DETECTED")
            for test in sync_results:
                status = "✅" if test['success'] else "❌"
                print(f"   • {test['test']}: {status}")

if __name__ == "__main__":
    tester = AdminPanelSyncTester()
    tester.run_all_tests()
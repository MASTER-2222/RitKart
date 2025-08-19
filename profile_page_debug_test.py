#!/usr/bin/env python3
"""
RitZone Profile Page Debug Test
===============================
Debugging the profile page errors reported by user:
- Dashboard: "Error Loading Dashboard - Failed to load dashboard data. Please try again"
- Personal Info: "Error Loading Profile - Failed to load profile data. Please try again"
- And similar errors for other sections
"""

import requests
import json
import uuid
from datetime import datetime

# Configuration - Test both local and production URLs
BACKEND_URLS = [
    "http://localhost:10000/api",  # Local backend
    "https://ritkart-backend-ujnt.onrender.com/api"  # Production backend
]
TIMEOUT = 30

class ProfilePageDebugger:
    def __init__(self):
        self.session = requests.Session()
        self.user_token = None
        self.test_user_id = None
        self.test_results = []
        self.working_backend_url = None
        
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
    
    def find_working_backend(self):
        """Find which backend URL is working"""
        for backend_url in BACKEND_URLS:
            try:
                response = self.session.get(f"{backend_url}/health", timeout=10)
                if response.status_code == 200:
                    data = response.json()
                    self.working_backend_url = backend_url
                    self.log_test("Backend Discovery", True, 
                                f"Found working backend: {backend_url}")
                    return True
            except Exception as e:
                self.log_test("Backend Discovery", False, 
                            f"Backend {backend_url} not accessible: {str(e)}")
                continue
        
        self.log_test("Backend Discovery", False, "No working backend found")
        return False
    
    def authenticate_user(self):
        """Create and authenticate a test user"""
        if not self.working_backend_url:
            return False
        
        try:
            # Try to register a new test user
            register_data = {
                "email": f"profiletest_{uuid.uuid4().hex[:8]}@example.com",
                "password": "ProfileTest123!",
                "fullName": "Profile Test User",
                "phone": "+1234567890"
            }
            
            register_response = self.session.post(f"{self.working_backend_url}/auth/register", 
                                                json=register_data, timeout=TIMEOUT)
            
            if register_response.status_code == 201:
                # Registration successful, now login
                login_data = {
                    "email": register_data["email"],
                    "password": register_data["password"]
                }
                
                login_response = self.session.post(f"{self.working_backend_url}/auth/login", 
                                                 json=login_data, timeout=TIMEOUT)
                
                if login_response.status_code == 200:
                    login_result = login_response.json()
                    if login_result.get('success'):
                        self.user_token = login_result['token']
                        self.test_user_id = login_result['user']['id']
                        self.log_test("User Authentication", True, 
                                    f"Test user authenticated with ID: {self.test_user_id}")
                        return True
            
            # If registration fails, try existing test user
            login_data = {
                "email": "testuser@example.com",
                "password": "TestUser123!"
            }
            
            login_response = self.session.post(f"{self.working_backend_url}/auth/login", 
                                             json=login_data, timeout=TIMEOUT)
            
            if login_response.status_code == 200:
                login_result = login_response.json()
                if login_result.get('success'):
                    self.user_token = login_result['token']
                    self.test_user_id = login_result['user']['id']
                    self.log_test("User Authentication", True, 
                                f"Logged in with existing user ID: {self.test_user_id}")
                    return True
            
            self.log_test("User Authentication", False, "Failed to authenticate any user")
            return False
            
        except Exception as e:
            self.log_test("User Authentication", False, f"Authentication error: {str(e)}")
            return False
    
    def test_profile_dashboard(self):
        """Test the profile dashboard endpoint that's failing"""
        if not self.user_token:
            self.log_test("Profile Dashboard", False, "No user token available")
            return False
        
        try:
            headers = {'Authorization': f'Bearer {self.user_token}'}
            response = self.session.get(f"{self.working_backend_url}/profile/dashboard", 
                                      headers=headers, timeout=TIMEOUT)
            
            self.log_test("Profile Dashboard Raw Response", True, 
                        f"Status: {response.status_code}, Content: {response.text[:200]}...")
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success'):
                    dashboard_data = data.get('data', {})
                    stats = dashboard_data.get('stats', {})
                    
                    self.log_test("Profile Dashboard", True, 
                                "Dashboard API working correctly",
                                f"Stats: {stats}")
                    return True
                else:
                    self.log_test("Profile Dashboard", False, 
                                f"API returned success=false: {data.get('message', 'Unknown error')}")
                    return False
            else:
                self.log_test("Profile Dashboard", False, 
                            f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Profile Dashboard", False, f"Request error: {str(e)}")
            return False
    
    def test_profile_info(self):
        """Test the profile info endpoint"""
        if not self.user_token:
            self.log_test("Profile Info", False, "No user token available")
            return False
        
        try:
            headers = {'Authorization': f'Bearer {self.user_token}'}
            response = self.session.get(f"{self.working_backend_url}/auth/profile", 
                                      headers=headers, timeout=TIMEOUT)
            
            self.log_test("Profile Info Raw Response", True, 
                        f"Status: {response.status_code}, Content: {response.text[:200]}...")
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success'):
                    user_data = data.get('user', {})
                    
                    self.log_test("Profile Info", True, 
                                "Profile Info API working correctly",
                                f"User: {user_data.get('full_name', 'N/A')}")
                    return True
                else:
                    self.log_test("Profile Info", False, 
                                f"API returned success=false: {data.get('message', 'Unknown error')}")
                    return False
            else:
                self.log_test("Profile Info", False, 
                            f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Profile Info", False, f"Request error: {str(e)}")
            return False
    
    def test_all_profile_sections(self):
        """Test all profile sections that user reported as failing"""
        if not self.user_token:
            self.log_test("All Profile Sections", False, "No user token available")
            return False
        
        headers = {'Authorization': f'Bearer {self.user_token}'}
        
        # Define all profile endpoints
        profile_endpoints = {
            "Dashboard": "/profile/dashboard",
            "Personal Info": "/auth/profile", 
            "My Orders": "/orders",
            "Wishlist": "/profile/wishlist",
            "Address Book": "/profile/addresses",
            "Payment Methods": "/profile/payment-methods"
        }
        
        results = {}
        
        for section_name, endpoint in profile_endpoints.items():
            try:
                response = self.session.get(f"{self.working_backend_url}{endpoint}", 
                                          headers=headers, timeout=TIMEOUT)
                
                if response.status_code == 200:
                    data = response.json()
                    if data.get('success'):
                        results[section_name] = "✅ Working"
                        self.log_test(f"Profile Section - {section_name}", True, 
                                    f"API working correctly")
                    else:
                        results[section_name] = f"❌ API Error: {data.get('message', 'Unknown')}"
                        self.log_test(f"Profile Section - {section_name}", False, 
                                    f"API returned success=false: {data.get('message')}")
                else:
                    results[section_name] = f"❌ HTTP {response.status_code}"
                    self.log_test(f"Profile Section - {section_name}", False, 
                                f"HTTP {response.status_code}: {response.text[:100]}")
                    
            except Exception as e:
                results[section_name] = f"❌ Error: {str(e)}"
                self.log_test(f"Profile Section - {section_name}", False, 
                            f"Request error: {str(e)}")
        
        # Summary
        working_sections = [k for k, v in results.items() if v.startswith("✅")]
        failing_sections = [k for k, v in results.items() if v.startswith("❌")]
        
        self.log_test("Profile Sections Summary", len(failing_sections) == 0, 
                    f"{len(working_sections)}/{len(profile_endpoints)} sections working",
                    f"Working: {', '.join(working_sections) if working_sections else 'None'}, "
                    f"Failing: {', '.join(failing_sections) if failing_sections else 'None'}")
        
        return results
    
    def test_frontend_backend_connectivity(self):
        """Test if frontend can connect to backend with correct URLs"""
        # Check environment variables that frontend would use
        frontend_backend_urls = [
            "http://localhost:10000/api",  # .env.local
            "https://ritkart-backend-ujnt.onrender.com/api"  # .env production
        ]
        
        connectivity_results = {}
        
        for url in frontend_backend_urls:
            try:
                response = requests.get(f"{url}/health", timeout=10)
                if response.status_code == 200:
                    connectivity_results[url] = "✅ Accessible"
                else:
                    connectivity_results[url] = f"❌ HTTP {response.status_code}"
            except Exception as e:
                connectivity_results[url] = f"❌ Error: {str(e)}"
        
        self.log_test("Frontend-Backend Connectivity", True, 
                    "Connectivity test completed",
                    f"Results: {connectivity_results}")
        
        return connectivity_results
    
    def diagnose_profile_page_issues(self):
        """Main diagnostic function"""
        print("🔍 DIAGNOSING PROFILE PAGE ISSUES")
        print("=" * 50)
        
        # Step 1: Find working backend
        if not self.find_working_backend():
            print("❌ Cannot proceed - no backend accessible")
            return
        
        # Step 2: Test frontend-backend connectivity
        self.test_frontend_backend_connectivity()
        
        # Step 3: Authenticate user
        if not self.authenticate_user():
            print("❌ Cannot test profile endpoints - authentication failed")
            return
        
        # Step 4: Test specific failing endpoints
        print("\n🧪 TESTING SPECIFIC PROFILE ENDPOINTS...")
        self.test_profile_dashboard()
        self.test_profile_info()
        
        # Step 5: Test all profile sections
        print("\n📋 TESTING ALL PROFILE SECTIONS...")
        section_results = self.test_all_profile_sections()
        
        # Step 6: Generate diagnosis
        self.generate_diagnosis(section_results)
    
    def generate_diagnosis(self, section_results):
        """Generate diagnosis and recommendations"""
        print("\n" + "=" * 50)
        print("🎯 PROFILE PAGE DIAGNOSIS SUMMARY")
        print("=" * 50)
        
        passed_tests = [test for test in self.test_results if test['success']]
        failed_tests = [test for test in self.test_results if not test['success']]
        
        print(f"✅ PASSED: {len(passed_tests)}/{len(self.test_results)} tests")
        print(f"❌ FAILED: {len(failed_tests)}/{len(self.test_results)} tests")
        
        if failed_tests:
            print("\n❌ FAILED TESTS:")
            for test in failed_tests:
                print(f"   • {test['test']}: {test['message']}")
        
        print("\n📊 PROFILE SECTIONS STATUS:")
        if section_results:
            for section, status in section_results.items():
                print(f"   • {section}: {status}")
        
        print("\n🔧 RECOMMENDATIONS:")
        
        # Check if backend is accessible
        if self.working_backend_url:
            print(f"✅ Backend is accessible at: {self.working_backend_url}")
        else:
            print("❌ Backend is not accessible - check if backend service is running")
            print("   Run: sudo supervisorctl status backend_nodejs")
            return
        
        # Check authentication
        if self.user_token:
            print("✅ User authentication is working")
        else:
            print("❌ User authentication failed - check auth service")
            return
        
        # Analyze section results
        if section_results:
            working_sections = [k for k, v in section_results.items() if v.startswith("✅")]
            failing_sections = [k for k, v in section_results.items() if v.startswith("❌")]
            
            if len(working_sections) == len(section_results):
                print("✅ ALL PROFILE SECTIONS ARE WORKING!")
                print("   The issue might be in frontend-backend connectivity or environment variables")
                print("   Check frontend .env files for correct NEXT_PUBLIC_BACKEND_URL")
            elif len(working_sections) > 0:
                print(f"⚠️  PARTIAL FUNCTIONALITY: {len(working_sections)}/{len(section_results)} sections working")
                print(f"   Working: {', '.join(working_sections)}")
                print(f"   Failing: {', '.join(failing_sections)}")
            else:
                print("❌ ALL PROFILE SECTIONS FAILING")
                print("   This indicates a systematic issue - check database connectivity")
        
        print("\n🌐 FRONTEND ENVIRONMENT CHECK:")
        print("   1. Check /app/.env.local - should have NEXT_PUBLIC_BACKEND_URL=http://localhost:10000/api")
        print("   2. Check /app/.env - should have NEXT_PUBLIC_BACKEND_URL=https://ritkart-backend-ujnt.onrender.com/api")
        print("   3. Restart frontend service: sudo supervisorctl restart frontend_nextjs")
        
        print("\n🔄 NEXT STEPS:")
        if len(failed_tests) == 0:
            print("✅ All backend APIs are working - issue is likely in frontend configuration")
        else:
            print("❌ Backend issues detected - fix backend APIs first")

if __name__ == "__main__":
    debugger = ProfilePageDebugger()
    debugger.diagnose_profile_page_issues()
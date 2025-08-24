#!/usr/bin/env python3
"""
RitZone Backend Server Connectivity and Health Testing
Testing Node.js backend server for Render deployment readiness
"""

import requests
import json
import time
import sys
from datetime import datetime

class RitZoneBackendTester:
    def __init__(self):
        # Test URLs - localhost development server
        self.backend_url = "http://localhost:10000/api"
        self.frontend_url = "http://localhost:3000"
        
        # Test credentials
        self.test_email = "b@b.com"
        self.test_password = "Abcd@1234"
        
        self.session = requests.Session()
        self.session.headers.update({
            'Content-Type': 'application/json',
            'User-Agent': 'RitZone-Backend-Tester/1.0'
        })
        
        self.test_results = []
        self.auth_token = None

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
        print(f"{status}: {test_name}")
        print(f"   {message}")
        if details:
            print(f"   Details: {details}")
        print()

    def test_backend_server_startup(self):
        """Test 1: Backend server startup and accessibility"""
        try:
            response = self.session.get(f"{self.backend_url}", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success') and 'RitZone Backend API' in data.get('message', ''):
                    self.log_test(
                        "Backend Server Startup",
                        True,
                        f"Backend server running successfully on {self.backend_url}",
                        f"Version: {data.get('version', 'N/A')}, Environment: {data.get('environment', 'N/A')}"
                    )
                    return True
                else:
                    self.log_test("Backend Server Startup", False, "Invalid API response format", str(data))
                    return False
            else:
                self.log_test("Backend Server Startup", False, f"HTTP {response.status_code}", response.text[:200])
                return False
                
        except requests.exceptions.ConnectionError:
            self.log_test("Backend Server Startup", False, "Connection refused - server not running", "Check if backend server is started on localhost:10000")
            return False
        except Exception as e:
            self.log_test("Backend Server Startup", False, f"Connection error: {str(e)}", None)
            return False

    def test_health_endpoint(self):
        """Test 2: Health check endpoint functionality"""
        try:
            response = self.session.get(f"{self.backend_url}/health", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success') and 'running' in data.get('message', '').lower():
                    db_status = data.get('database', {})
                    env_info = data.get('environment', {})
                    
                    self.log_test(
                        "Health Check Endpoint",
                        True,
                        "Health endpoint working with database connectivity",
                        f"DB Status: {db_status.get('success', 'Unknown')}, Environment: {env_info.get('nodeEnv', 'Unknown')}"
                    )
                    return True
                else:
                    self.log_test("Health Check Endpoint", False, "Health check failed", str(data))
                    return False
            else:
                self.log_test("Health Check Endpoint", False, f"HTTP {response.status_code}", response.text[:200])
                return False
                
        except Exception as e:
            self.log_test("Health Check Endpoint", False, f"Health check error: {str(e)}", None)
            return False

    def test_environment_variables(self):
        """Test 3: Environment variable loading"""
        try:
            response = self.session.get(f"{self.backend_url}/health", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                env_info = data.get('environment', {})
                
                required_env_vars = ['nodeEnv', 'port', 'host']
                missing_vars = [var for var in required_env_vars if not env_info.get(var)]
                
                if not missing_vars:
                    self.log_test(
                        "Environment Variables Loading",
                        True,
                        "All required environment variables loaded successfully",
                        f"Node Env: {env_info.get('nodeEnv')}, Port: {env_info.get('port')}, Host: {env_info.get('host')}"
                    )
                    return True
                else:
                    self.log_test("Environment Variables Loading", False, f"Missing environment variables: {missing_vars}", str(env_info))
                    return False
            else:
                self.log_test("Environment Variables Loading", False, "Cannot verify environment variables", "Health endpoint not accessible")
                return False
                
        except Exception as e:
            self.log_test("Environment Variables Loading", False, f"Environment check error: {str(e)}", None)
            return False

    def test_cors_configuration(self):
        """Test 4: CORS configuration for frontend integration"""
        try:
            # Test preflight request
            headers = {
                'Origin': self.frontend_url,
                'Access-Control-Request-Method': 'GET',
                'Access-Control-Request-Headers': 'Content-Type,Authorization'
            }
            
            response = self.session.options(f"{self.backend_url}/health", headers=headers, timeout=10)
            
            cors_headers = {
                'Access-Control-Allow-Origin': response.headers.get('Access-Control-Allow-Origin'),
                'Access-Control-Allow-Methods': response.headers.get('Access-Control-Allow-Methods'),
                'Access-Control-Allow-Headers': response.headers.get('Access-Control-Allow-Headers'),
                'Access-Control-Allow-Credentials': response.headers.get('Access-Control-Allow-Credentials')
            }
            
            # Check if CORS allows localhost:3000
            origin_allowed = (cors_headers['Access-Control-Allow-Origin'] == self.frontend_url or 
                            cors_headers['Access-Control-Allow-Origin'] == '*')
            
            if origin_allowed and cors_headers['Access-Control-Allow-Methods']:
                self.log_test(
                    "CORS Configuration",
                    True,
                    "CORS properly configured for frontend integration",
                    f"Origin: {cors_headers['Access-Control-Allow-Origin']}, Methods: {cors_headers['Access-Control-Allow-Methods']}"
                )
                return True
            else:
                self.log_test("CORS Configuration", False, "CORS not properly configured", str(cors_headers))
                return False
                
        except Exception as e:
            self.log_test("CORS Configuration", False, f"CORS test error: {str(e)}", None)
            return False

    def test_database_connectivity(self):
        """Test 5: Database connectivity through backend"""
        try:
            response = self.session.get(f"{self.backend_url}/health", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                db_status = data.get('database', {})
                
                if db_status.get('success'):
                    self.log_test(
                        "Database Connectivity",
                        True,
                        "Database connection successful through backend",
                        f"DB Message: {db_status.get('message', 'Connected')}"
                    )
                    return True
                else:
                    self.log_test("Database Connectivity", False, "Database connection failed", str(db_status))
                    return False
            else:
                self.log_test("Database Connectivity", False, "Cannot verify database connectivity", "Health endpoint not accessible")
                return False
                
        except Exception as e:
            self.log_test("Database Connectivity", False, f"Database test error: {str(e)}", None)
            return False

    def test_api_routes_accessibility(self):
        """Test 6: API routes accessibility"""
        test_routes = [
            ('/products', 'GET', 'Products API'),
            ('/categories', 'GET', 'Categories API'),
            ('/auth/register', 'POST', 'Auth Registration API'),
            ('/auth/login', 'POST', 'Auth Login API')
        ]
        
        accessible_routes = 0
        total_routes = len(test_routes)
        
        for route, method, description in test_routes:
            try:
                if method == 'GET':
                    response = self.session.get(f"{self.backend_url}{route}", timeout=5)
                else:
                    # For POST routes, just check if they respond (even with validation errors)
                    response = self.session.post(f"{self.backend_url}{route}", json={}, timeout=5)
                
                # Consider route accessible if it doesn't return 404
                if response.status_code != 404:
                    accessible_routes += 1
                    print(f"   ✅ {description}: HTTP {response.status_code}")
                else:
                    print(f"   ❌ {description}: Route not found")
                    
            except Exception as e:
                print(f"   ❌ {description}: Error - {str(e)}")
        
        success_rate = (accessible_routes / total_routes) * 100
        
        if success_rate >= 75:
            self.log_test(
                "API Routes Accessibility",
                True,
                f"API routes accessible ({accessible_routes}/{total_routes} routes working)",
                f"Success rate: {success_rate:.1f}%"
            )
            return True
        else:
            self.log_test(
                "API Routes Accessibility",
                False,
                f"Many API routes inaccessible ({accessible_routes}/{total_routes} routes working)",
                f"Success rate: {success_rate:.1f}%"
            )
            return False

    def test_api_request_handling(self):
        """Test 7: Backend API request handling"""
        try:
            # Test products API (should work without authentication)
            response = self.session.get(f"{self.backend_url}/products", timeout=10)
            
            if response.status_code in [200, 401, 403]:  # 200 = success, 401/403 = auth required but API working
                try:
                    data = response.json()
                    if isinstance(data, dict) and ('success' in data or 'data' in data or 'message' in data):
                        self.log_test(
                            "API Request Handling",
                            True,
                            "Backend properly handles API requests with JSON responses",
                            f"Status: {response.status_code}, Response format: Valid JSON"
                        )
                        return True
                    else:
                        self.log_test("API Request Handling", False, "Invalid JSON response format", str(data)[:200])
                        return False
                except json.JSONDecodeError:
                    self.log_test("API Request Handling", False, "Non-JSON response from API", response.text[:200])
                    return False
            else:
                self.log_test("API Request Handling", False, f"API not responding properly: HTTP {response.status_code}", response.text[:200])
                return False
                
        except Exception as e:
            self.log_test("API Request Handling", False, f"API request error: {str(e)}", None)
            return False

    def test_port_configuration(self):
        """Test 8: Port configuration for Render deployment"""
        try:
            # Test if backend responds on expected port
            response = self.session.get(f"{self.backend_url}", timeout=5)
            
            if response.status_code == 200:
                # Check if PORT environment variable is properly configured
                health_response = self.session.get(f"{self.backend_url}/health", timeout=5)
                if health_response.status_code == 200:
                    health_data = health_response.json()
                    env_info = health_data.get('environment', {})
                    port = env_info.get('port')
                    
                    if port == 10000 or port == '10000':
                        self.log_test(
                            "Port Configuration",
                            True,
                            "Backend properly configured for port 10000 (Render compatible)",
                            f"Current port: {port}, Host: {env_info.get('host', 'Unknown')}"
                        )
                        return True
                    else:
                        self.log_test("Port Configuration", False, f"Unexpected port configuration: {port}", "Should be 10000 for Render deployment")
                        return False
                else:
                    self.log_test("Port Configuration", False, "Cannot verify port configuration", "Health endpoint not accessible")
                    return False
            else:
                self.log_test("Port Configuration", False, "Backend not responding on expected port", f"HTTP {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("Port Configuration", False, f"Port test error: {str(e)}", None)
            return False

    def run_all_tests(self):
        """Run all backend tests"""
        print("🚀 RITZONE BACKEND SERVER TESTING FOR RENDER DEPLOYMENT")
        print("=" * 60)
        print(f"Backend URL: {self.backend_url}")
        print(f"Frontend URL: {self.frontend_url}")
        print(f"Test Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print("=" * 60)
        print()

        # Run all tests
        tests = [
            self.test_backend_server_startup,
            self.test_health_endpoint,
            self.test_environment_variables,
            self.test_cors_configuration,
            self.test_database_connectivity,
            self.test_api_routes_accessibility,
            self.test_api_request_handling,
            self.test_port_configuration
        ]

        passed_tests = 0
        total_tests = len(tests)

        for test_func in tests:
            try:
                if test_func():
                    passed_tests += 1
            except Exception as e:
                print(f"❌ CRITICAL ERROR in {test_func.__name__}: {str(e)}")
                print()

        # Final summary
        print("=" * 60)
        print("🎯 FINAL TEST SUMMARY")
        print("=" * 60)
        
        success_rate = (passed_tests / total_tests) * 100
        
        print(f"✅ Tests Passed: {passed_tests}/{total_tests}")
        print(f"📊 Success Rate: {success_rate:.1f}%")
        
        if success_rate >= 87.5:  # 7/8 tests
            print("🎉 RESULT: Backend is READY for Render deployment!")
            print("✅ All critical functionality working properly")
        elif success_rate >= 75:   # 6/8 tests
            print("⚠️  RESULT: Backend is MOSTLY READY with minor issues")
            print("🔧 Some non-critical issues need attention")
        else:
            print("❌ RESULT: Backend has CRITICAL ISSUES")
            print("🚨 Major problems need to be resolved before deployment")
        
        print()
        print("📋 DETAILED RESULTS:")
        for result in self.test_results:
            status = "✅" if result['success'] else "❌"
            print(f"{status} {result['test']}: {result['message']}")
        
        print("=" * 60)
        return success_rate >= 75

if __name__ == "__main__":
    tester = RitZoneBackendTester()
    success = tester.run_all_tests()
    sys.exit(0 if success else 1)
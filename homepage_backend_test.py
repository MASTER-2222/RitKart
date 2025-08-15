#!/usr/bin/env python3
"""
RitZone Homepage Management API Backend Testing Suite
====================================================
Comprehensive testing for homepage management API endpoints
Testing Node.js Express backend with Supabase integration
"""

import requests
import json
import sys
import time
from datetime import datetime
from typing import Dict, List, Any, Optional

class HomepageAPITester:
    def __init__(self):
        # Use the backend URL from environment
        self.base_url = "https://ritkart-backend.onrender.com/api"
        self.local_url = "http://localhost:8001/api"
        
        # Try local first, fallback to production
        self.backend_url = self.local_url
        
        # Test results tracking
        self.test_results = []
        self.total_tests = 0
        self.passed_tests = 0
        self.failed_tests = 0
        
        # Homepage sections to test
        self.test_sections = [
            'hero',
            'categories', 
            'featured_products',
            'bestsellers_electronics',
            'prime_benefits'
        ]
        
        print("🚀 RitZone Homepage Management API Testing Suite")
        print("=" * 60)
        print(f"🌐 Testing Backend: {self.backend_url}")
        print("=" * 60)

    def log_test(self, test_name: str, success: bool, message: str, details: Optional[Dict] = None):
        """Log test results"""
        self.total_tests += 1
        if success:
            self.passed_tests += 1
            status = "✅ PASS"
        else:
            self.failed_tests += 1
            status = "❌ FAIL"
            
        result = {
            'test_name': test_name,
            'success': success,
            'message': message,
            'details': details or {},
            'timestamp': datetime.now().isoformat()
        }
        self.test_results.append(result)
        
        print(f"{status} | {test_name}")
        print(f"     └─ {message}")
        if details and not success:
            print(f"     └─ Details: {details}")
        print()

    def make_request(self, method: str, endpoint: str, data: Optional[Dict] = None, 
                    headers: Optional[Dict] = None) -> Optional[Dict]:
        """Make HTTP request with error handling"""
        try:
            url = f"{self.backend_url}{endpoint}"
            default_headers = {'Content-Type': 'application/json'}
            if headers:
                default_headers.update(headers)
                
            if method.upper() == 'GET':
                response = requests.get(url, headers=default_headers, timeout=30)
            elif method.upper() == 'POST':
                response = requests.post(url, json=data, headers=default_headers, timeout=30)
            elif method.upper() == 'PUT':
                response = requests.put(url, json=data, headers=default_headers, timeout=30)
            elif method.upper() == 'DELETE':
                response = requests.delete(url, headers=default_headers, timeout=30)
            else:
                return None
                
            return {
                'status_code': response.status_code,
                'data': response.json() if response.content else {},
                'headers': dict(response.headers)
            }
        except requests.exceptions.ConnectionError:
            # Try production URL if local fails
            if self.backend_url == self.local_url:
                self.backend_url = "https://ritkart-backend.onrender.com/api"
                return self.make_request(method, endpoint, data, headers)
            return None
        except Exception as e:
            return {'error': str(e), 'status_code': 0}

    def test_backend_health(self):
        """Test 1: Backend Health Check"""
        print("🏥 Testing Backend Health Check...")
        
        response = self.make_request('GET', '/health')
        
        if not response:
            self.log_test(
                "Backend Health Check",
                False,
                "Failed to connect to backend server",
                {"url": self.backend_url}
            )
            return False
            
        if response.get('status_code') == 200:
            data = response.get('data', {})
            if data.get('success') and 'RitZone Backend' in data.get('message', ''):
                self.log_test(
                    "Backend Health Check",
                    True,
                    f"Backend running correctly - {data.get('environment', {}).get('nodeEnv', 'unknown')} environment",
                    {
                        "status": data.get('message'),
                        "database": data.get('database', {}).get('success', False),
                        "environment": data.get('environment', {})
                    }
                )
                return True
            else:
                self.log_test(
                    "Backend Health Check",
                    False,
                    "Backend responded but health check failed",
                    data
                )
        else:
            self.log_test(
                "Backend Health Check",
                False,
                f"Backend health check failed with status {response.get('status_code')}",
                response.get('data', {})
            )
        return False

    def test_get_all_sections(self):
        """Test 2: GET /api/homepage/sections - Get all homepage sections"""
        print("📋 Testing Get All Homepage Sections...")
        
        response = self.make_request('GET', '/homepage/sections')
        
        if not response:
            self.log_test(
                "Get All Homepage Sections",
                False,
                "Failed to connect to homepage sections endpoint"
            )
            return False
            
        if response.get('status_code') == 200:
            data = response.get('data', {})
            if data.get('success') and 'data' in data:
                sections = data.get('data', [])
                section_names = [s.get('section_name') for s in sections]
                
                # Check if we have the expected sections
                expected_sections = ['hero', 'categories', 'featured_products', 'bestsellers_electronics', 'prime_benefits']
                found_sections = [s for s in expected_sections if s in section_names]
                
                self.log_test(
                    "Get All Homepage Sections",
                    True,
                    f"Retrieved {len(sections)} homepage sections successfully",
                    {
                        "total_sections": len(sections),
                        "section_names": section_names,
                        "expected_found": f"{len(found_sections)}/{len(expected_sections)}",
                        "has_content": any('content' in s for s in sections),
                        "has_images": any('images' in s for s in sections)
                    }
                )
                return True
            else:
                self.log_test(
                    "Get All Homepage Sections",
                    False,
                    "Invalid response format from sections endpoint",
                    data
                )
        else:
            self.log_test(
                "Get All Homepage Sections",
                False,
                f"Failed to get sections with status {response.get('status_code')}",
                response.get('data', {})
            )
        return False

    def test_get_specific_sections(self):
        """Test 3-7: GET /api/homepage/sections/{section} - Get specific sections"""
        print("🎯 Testing Get Specific Homepage Sections...")
        
        all_passed = True
        
        for section_name in self.test_sections:
            response = self.make_request('GET', f'/homepage/sections/{section_name}')
            
            if not response:
                self.log_test(
                    f"Get {section_name.title()} Section",
                    False,
                    f"Failed to connect to {section_name} section endpoint"
                )
                all_passed = False
                continue
                
            if response.get('status_code') == 200:
                data = response.get('data', {})
                if data.get('success') and 'data' in data:
                    section_data = data.get('data', {})
                    
                    # Validate section structure
                    required_fields = ['section_name', 'section_title', 'section_type']
                    has_required = all(field in section_data for field in required_fields)
                    
                    self.log_test(
                        f"Get {section_name.title()} Section",
                        True,
                        f"{section_name} section retrieved successfully",
                        {
                            "section_name": section_data.get('section_name'),
                            "section_title": section_data.get('section_title'),
                            "section_type": section_data.get('section_type'),
                            "has_content": bool(section_data.get('content')),
                            "has_images": bool(section_data.get('images')),
                            "content_items": len(section_data.get('content', [])),
                            "image_items": len(section_data.get('images', []))
                        }
                    )
                else:
                    self.log_test(
                        f"Get {section_name.title()} Section",
                        False,
                        f"Invalid response format for {section_name} section",
                        data
                    )
                    all_passed = False
            elif response.get('status_code') == 404:
                self.log_test(
                    f"Get {section_name.title()} Section",
                    False,
                    f"{section_name} section not found in database",
                    response.get('data', {})
                )
                all_passed = False
            else:
                self.log_test(
                    f"Get {section_name.title()} Section",
                    False,
                    f"Failed to get {section_name} section with status {response.get('status_code')}",
                    response.get('data', {})
                )
                all_passed = False
                
        return all_passed

    def test_update_content(self):
        """Test 8-9: PUT /api/homepage/sections/{section}/content - Update section content"""
        print("✏️ Testing Update Section Content...")
        
        # Test updating hero section content
        test_content = {
            "content": {
                "welcome_title": "Test Welcome Title - Updated",
                "welcome_subtitle": "Test subtitle for homepage testing",
                "cta_button_text": "Test Shop Now"
            }
        }
        
        response = self.make_request('PUT', '/homepage/sections/hero/content', test_content)
        
        if not response:
            self.log_test(
                "Update Hero Section Content",
                False,
                "Failed to connect to hero content update endpoint"
            )
            return False
            
        if response.get('status_code') == 200:
            data = response.get('data', {})
            if data.get('success'):
                self.log_test(
                    "Update Hero Section Content",
                    True,
                    "Hero section content updated successfully",
                    {
                        "updated_fields": list(test_content['content'].keys()),
                        "response_message": data.get('message')
                    }
                )
                
                # Test updating categories section content
                categories_content = {
                    "content": {
                        "section_description": "Browse our comprehensive product categories - Updated via API"
                    }
                }
                
                response2 = self.make_request('PUT', '/homepage/sections/categories/content', categories_content)
                
                if response2 and response2.get('status_code') == 200:
                    data2 = response2.get('data', {})
                    if data2.get('success'):
                        self.log_test(
                            "Update Categories Section Content",
                            True,
                            "Categories section content updated successfully",
                            {
                                "updated_fields": list(categories_content['content'].keys()),
                                "response_message": data2.get('message')
                            }
                        )
                        return True
                    
                self.log_test(
                    "Update Categories Section Content",
                    False,
                    "Failed to update categories section content",
                    response2.get('data', {}) if response2 else {}
                )
                return False
            else:
                self.log_test(
                    "Update Hero Section Content",
                    False,
                    "Hero content update failed",
                    data
                )
        else:
            self.log_test(
                "Update Hero Section Content",
                False,
                f"Failed to update hero content with status {response.get('status_code')}",
                response.get('data', {})
            )
        return False

    def test_update_images(self):
        """Test 10-11: PUT /api/homepage/sections/{section}/images - Update section images"""
        print("🖼️ Testing Update Section Images...")
        
        # Test updating hero section images
        test_images = {
            "images": {
                "hero_background": {
                    "url": "https://images.unsplash.com/photo-1534452203293-494d7ddbf7e0?w=1200&h=400&fit=crop&crop=center",
                    "alt": "RitZone Hero Banner - Test Updated",
                    "title": "Premium Shopping Experience - API Test",
                    "upload_type": "url"
                }
            }
        }
        
        response = self.make_request('PUT', '/homepage/sections/hero/images', test_images)
        
        if not response:
            self.log_test(
                "Update Hero Section Images",
                False,
                "Failed to connect to hero images update endpoint"
            )
            return False
            
        if response.get('status_code') == 200:
            data = response.get('data', {})
            if data.get('success'):
                self.log_test(
                    "Update Hero Section Images",
                    True,
                    "Hero section images updated successfully",
                    {
                        "updated_images": list(test_images['images'].keys()),
                        "response_message": data.get('message')
                    }
                )
                
                # Test updating categories section images
                categories_images = {
                    "images": {
                        "category_electronics": {
                            "url": "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=300&h=200&fit=crop",
                            "alt": "Electronics Category - API Test Updated",
                            "title": "Latest tech gadgets and electronics - API Test",
                            "upload_type": "url"
                        }
                    }
                }
                
                response2 = self.make_request('PUT', '/homepage/sections/categories/images', categories_images)
                
                if response2 and response2.get('status_code') == 200:
                    data2 = response2.get('data', {})
                    if data2.get('success'):
                        self.log_test(
                            "Update Categories Section Images",
                            True,
                            "Categories section images updated successfully",
                            {
                                "updated_images": list(categories_images['images'].keys()),
                                "response_message": data2.get('message')
                            }
                        )
                        return True
                    
                self.log_test(
                    "Update Categories Section Images",
                    False,
                    "Failed to update categories section images",
                    response2.get('data', {}) if response2 else {}
                )
                return False
            else:
                self.log_test(
                    "Update Hero Section Images",
                    False,
                    "Hero images update failed",
                    data
                )
        else:
            self.log_test(
                "Update Hero Section Images",
                False,
                f"Failed to update hero images with status {response.get('status_code')}",
                response.get('data', {})
            )
        return False

    def test_database_integration(self):
        """Test 12: Database Integration - Verify tables exist and data is populated"""
        print("🗄️ Testing Database Integration...")
        
        # Test by getting all sections and verifying data structure
        response = self.make_request('GET', '/homepage/sections')
        
        if not response or response.get('status_code') != 200:
            self.log_test(
                "Database Integration",
                False,
                "Cannot verify database integration - sections endpoint failed"
            )
            return False
            
        data = response.get('data', {})
        sections = data.get('data', [])
        
        if not sections:
            self.log_test(
                "Database Integration",
                False,
                "No homepage sections found in database"
            )
            return False
            
        # Verify database structure
        database_checks = {
            "sections_populated": len(sections) > 0,
            "has_content_data": any(s.get('content') for s in sections),
            "has_image_data": any(s.get('images') for s in sections),
            "proper_section_types": all(s.get('section_type') in ['hero', 'category', 'products', 'content'] for s in sections),
            "sections_have_ids": all(s.get('id') for s in sections),
            "sections_ordered": all(isinstance(s.get('display_order'), int) for s in sections)
        }
        
        all_checks_passed = all(database_checks.values())
        
        self.log_test(
            "Database Integration",
            all_checks_passed,
            f"Database integration {'verified' if all_checks_passed else 'has issues'}",
            {
                "total_sections": len(sections),
                "database_checks": database_checks,
                "section_names": [s.get('section_name') for s in sections]
            }
        )
        
        return all_checks_passed

    def test_api_response_format(self):
        """Test 13: API Response Format - Verify all APIs return proper JSON format"""
        print("📋 Testing API Response Format...")
        
        endpoints_to_test = [
            ('/homepage/sections', 'GET'),
            ('/homepage/sections/hero', 'GET'),
            ('/homepage/sections/categories', 'GET'),
            ('/homepage/sections/featured_products', 'GET'),
            ('/homepage/sections/bestsellers_electronics', 'GET'),
            ('/homepage/sections/prime_benefits', 'GET')
        ]
        
        format_issues = []
        successful_responses = 0
        
        for endpoint, method in endpoints_to_test:
            response = self.make_request(method, endpoint)
            
            if not response:
                format_issues.append(f"{endpoint}: Connection failed")
                continue
                
            if response.get('status_code') not in [200, 404]:
                format_issues.append(f"{endpoint}: Unexpected status {response.get('status_code')}")
                continue
                
            data = response.get('data', {})
            
            # Check required response format
            if not isinstance(data, dict):
                format_issues.append(f"{endpoint}: Response is not JSON object")
                continue
                
            if 'success' not in data:
                format_issues.append(f"{endpoint}: Missing 'success' field")
                continue
                
            if 'message' not in data:
                format_issues.append(f"{endpoint}: Missing 'message' field")
                continue
                
            if data.get('success') and 'data' not in data:
                format_issues.append(f"{endpoint}: Missing 'data' field for successful response")
                continue
                
            successful_responses += 1
            
        all_format_correct = len(format_issues) == 0
        
        self.log_test(
            "API Response Format",
            all_format_correct,
            f"API response format {'correct' if all_format_correct else 'has issues'}",
            {
                "endpoints_tested": len(endpoints_to_test),
                "successful_responses": successful_responses,
                "format_issues": format_issues if format_issues else "None"
            }
        )
        
        return all_format_correct

    def run_all_tests(self):
        """Run all homepage management API tests"""
        print("🧪 Starting Comprehensive Homepage Management API Tests...")
        print()
        
        # Test 1: Backend Health Check
        if not self.test_backend_health():
            print("❌ Backend health check failed. Stopping tests.")
            return self.generate_summary()
            
        # Test 2: Get All Sections
        self.test_get_all_sections()
        
        # Tests 3-7: Get Specific Sections
        self.test_get_specific_sections()
        
        # Tests 8-9: Update Content
        self.test_update_content()
        
        # Tests 10-11: Update Images
        self.test_update_images()
        
        # Test 12: Database Integration
        self.test_database_integration()
        
        # Test 13: API Response Format
        self.test_api_response_format()
        
        return self.generate_summary()

    def generate_summary(self):
        """Generate comprehensive test summary"""
        print("=" * 60)
        print("📊 HOMEPAGE MANAGEMENT API TEST SUMMARY")
        print("=" * 60)
        
        success_rate = (self.passed_tests / self.total_tests * 100) if self.total_tests > 0 else 0
        
        print(f"🧪 Total Tests: {self.total_tests}")
        print(f"✅ Passed: {self.passed_tests}")
        print(f"❌ Failed: {self.failed_tests}")
        print(f"📈 Success Rate: {success_rate:.1f}%")
        print()
        
        if self.failed_tests > 0:
            print("❌ FAILED TESTS:")
            for result in self.test_results:
                if not result['success']:
                    print(f"   • {result['test_name']}: {result['message']}")
            print()
        
        # Overall assessment
        if success_rate >= 90:
            status = "🎉 EXCELLENT"
            assessment = "Homepage management API is working excellently!"
        elif success_rate >= 75:
            status = "✅ GOOD"
            assessment = "Homepage management API is working well with minor issues."
        elif success_rate >= 50:
            status = "⚠️ NEEDS ATTENTION"
            assessment = "Homepage management API has significant issues that need attention."
        else:
            status = "❌ CRITICAL"
            assessment = "Homepage management API has critical issues and needs immediate attention."
            
        print(f"🏆 Overall Status: {status}")
        print(f"📝 Assessment: {assessment}")
        print()
        
        print(f"🌐 Backend URL: {self.backend_url}")
        print(f"⏰ Test Completed: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print("=" * 60)
        
        return {
            'total_tests': self.total_tests,
            'passed_tests': self.passed_tests,
            'failed_tests': self.failed_tests,
            'success_rate': success_rate,
            'status': status,
            'assessment': assessment,
            'backend_url': self.backend_url,
            'test_results': self.test_results
        }

def main():
    """Main test execution"""
    tester = HomepageAPITester()
    summary = tester.run_all_tests()
    
    # Exit with appropriate code
    if summary['success_rate'] >= 75:
        sys.exit(0)  # Success
    else:
        sys.exit(1)  # Failure

if __name__ == "__main__":
    main()
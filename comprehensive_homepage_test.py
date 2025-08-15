#!/usr/bin/env python3
"""
COMPREHENSIVE HOMEPAGE MANAGEMENT API TESTING - JANUARY 2025
============================================================
Testing complete homepage management API system after database constraint fix
Focus: CRUD operations, image updates, file uploads, and admin panel integration
"""

import requests
import json
import sys
import time
import tempfile
import os
from datetime import datetime
from typing import Dict, List, Any, Optional
from io import BytesIO

class HomepageManagementTester:
    def __init__(self):
        # Use the backend URL from environment - try local first, fallback to production
        self.local_url = "http://localhost:8001/api"
        self.production_url = "https://ritkart-backend.onrender.com/api"
        
        # Try local first
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
        
        print("🚀 COMPREHENSIVE HOMEPAGE MANAGEMENT API TESTING - JANUARY 2025")
        print("=" * 80)
        print("🎯 OBJECTIVE: Test complete homepage management API system after database constraint fix")
        print("🔍 FOCUS: CRUD operations, image updates, file uploads, admin panel integration")
        print("=" * 80)
        print(f"🌐 Testing Backend: {self.backend_url}")
        print("=" * 80)

    def log_test(self, test_name: str, success: bool, message: str, details: Optional[Dict] = None):
        """Log test results with enhanced formatting"""
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
        if details and (not success or len(str(details)) < 200):
            print(f"     └─ Details: {details}")
        print()

    def make_request(self, method: str, endpoint: str, data: Optional[Dict] = None, 
                    headers: Optional[Dict] = None, files: Optional[Dict] = None) -> Optional[Dict]:
        """Make HTTP request with error handling and fallback"""
        try:
            url = f"{self.backend_url}{endpoint}"
            default_headers = {'Content-Type': 'application/json'} if not files else {}
            if headers:
                default_headers.update(headers)
                
            kwargs = {'headers': default_headers, 'timeout': 30}
            
            if files:
                # For file uploads, don't set Content-Type header
                if 'Content-Type' in kwargs['headers']:
                    del kwargs['headers']['Content-Type']
                kwargs['files'] = files
                if data:
                    kwargs['data'] = data
            elif data:
                kwargs['json'] = data
                
            if method.upper() == 'GET':
                response = requests.get(url, **{k: v for k, v in kwargs.items() if k != 'json' and k != 'files' and k != 'data'})
            elif method.upper() == 'POST':
                response = requests.post(url, **kwargs)
            elif method.upper() == 'PUT':
                response = requests.put(url, **kwargs)
            elif method.upper() == 'DELETE':
                response = requests.delete(url, **{k: v for k, v in kwargs.items() if k != 'json' and k != 'files' and k != 'data'})
            else:
                return None
                
            return {
                'status_code': response.status_code,
                'data': response.json() if response.content and response.headers.get('content-type', '').startswith('application/json') else {},
                'headers': dict(response.headers),
                'text': response.text if not response.headers.get('content-type', '').startswith('application/json') else None
            }
        except requests.exceptions.ConnectionError:
            # Try production URL if local fails
            if self.backend_url == self.local_url:
                print(f"     └─ Local connection failed, trying production URL...")
                self.backend_url = self.production_url
                return self.make_request(method, endpoint, data, headers, files)
            return None
        except Exception as e:
            return {'error': str(e), 'status_code': 0}

    def test_backend_health_check(self):
        """Test 1: Backend Health Check - Node.js Express + Supabase"""
        print("🏥 TESTING BACKEND HEALTH CHECK...")
        
        response = self.make_request('GET', '/health')
        
        if not response:
            self.log_test(
                "Backend Health Check",
                False,
                "Failed to connect to backend server",
                {"attempted_url": self.backend_url}
            )
            return False
            
        if response.get('status_code') == 200:
            data = response.get('data', {})
            if data.get('success'):
                env_info = data.get('environment', {})
                db_info = data.get('database', {})
                
                self.log_test(
                    "Backend Health Check",
                    True,
                    f"Node.js Express + Supabase running correctly on port 8001",
                    {
                        "backend_type": "Node.js Express",
                        "database": "Supabase",
                        "environment": env_info.get('nodeEnv', 'unknown'),
                        "database_connected": db_info.get('success', False),
                        "message": data.get('message')
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

    def test_homepage_sections_retrieval(self):
        """Test 2-6: Homepage Sections Retrieval (GET endpoints)"""
        print("📋 TESTING HOMEPAGE SECTIONS RETRIEVAL...")
        
        # Test GET /api/homepage/sections (all sections)
        response = self.make_request('GET', '/homepage/sections')
        
        if not response or response.get('status_code') != 200:
            self.log_test(
                "Get All Homepage Sections",
                False,
                "Failed to retrieve all homepage sections",
                response.get('data', {}) if response else {}
            )
            return False
            
        data = response.get('data', {})
        sections = data.get('data', [])
        
        if not sections:
            self.log_test(
                "Get All Homepage Sections",
                False,
                "No homepage sections found in response"
            )
            return False
            
        # Verify expected sections exist
        section_names = [s.get('section_name') for s in sections]
        expected_sections = ['hero', 'categories', 'featured_products', 'bestsellers_electronics', 'prime_benefits']
        found_sections = [s for s in expected_sections if s in section_names]
        
        self.log_test(
            "Get All Homepage Sections",
            len(found_sections) == len(expected_sections),
            f"Retrieved {len(sections)} sections, found {len(found_sections)}/{len(expected_sections)} expected sections",
            {
                "total_sections": len(sections),
                "section_names": section_names,
                "expected_sections": expected_sections,
                "found_sections": found_sections,
                "data_structure": {
                    "has_content": any('content' in s for s in sections),
                    "has_images": any('images' in s for s in sections)
                }
            }
        )
        
        # Test individual section retrieval
        all_individual_passed = True
        for section_name in expected_sections:
            response = self.make_request('GET', f'/homepage/sections/{section_name}')
            
            if response and response.get('status_code') == 200:
                section_data = response.get('data', {}).get('data', {})
                
                self.log_test(
                    f"Get {section_name.title()} Section",
                    True,
                    f"{section_name} section retrieved successfully",
                    {
                        "section_name": section_data.get('section_name'),
                        "section_title": section_data.get('section_title'),
                        "content_items": len(section_data.get('content', [])),
                        "image_items": len(section_data.get('images', []))
                    }
                )
            else:
                self.log_test(
                    f"Get {section_name.title()} Section",
                    False,
                    f"Failed to retrieve {section_name} section",
                    response.get('data', {}) if response else {}
                )
                all_individual_passed = False
                
        return all_individual_passed

    def test_content_update_operations(self):
        """Test 7-8: Content Update Operations (PUT content endpoints)"""
        print("✏️ TESTING CONTENT UPDATE OPERATIONS...")
        
        # Test updating hero welcome_title
        hero_content = {
            "content": {
                "welcome_title": "Welcome to RitZone - API Test Updated",
                "welcome_subtitle": "Your premium shopping destination - Updated via API",
                "cta_button_text": "Shop Now - API Test"
            }
        }
        
        response = self.make_request('PUT', '/homepage/sections/hero/content', hero_content)
        
        hero_success = False
        if response and response.get('status_code') == 200:
            data = response.get('data', {})
            if data.get('success'):
                hero_success = True
                self.log_test(
                    "Update Hero Content",
                    True,
                    "Hero welcome_title and content updated successfully",
                    {
                        "updated_fields": list(hero_content['content'].keys()),
                        "response_message": data.get('message')
                    }
                )
            else:
                self.log_test(
                    "Update Hero Content",
                    False,
                    "Hero content update failed",
                    data
                )
        else:
            self.log_test(
                "Update Hero Content",
                False,
                f"Hero content update failed with status {response.get('status_code') if response else 'No response'}",
                response.get('data', {}) if response else {}
            )
        
        # Test updating categories section_description
        categories_content = {
            "content": {
                "section_description": "Browse our comprehensive product categories - Updated via API Testing",
                "section_subtitle": "Find everything you need in our organized categories"
            }
        }
        
        response = self.make_request('PUT', '/homepage/sections/categories/content', categories_content)
        
        categories_success = False
        if response and response.get('status_code') == 200:
            data = response.get('data', {})
            if data.get('success'):
                categories_success = True
                self.log_test(
                    "Update Categories Content",
                    True,
                    "Categories section_description updated successfully",
                    {
                        "updated_fields": list(categories_content['content'].keys()),
                        "response_message": data.get('message')
                    }
                )
            else:
                self.log_test(
                    "Update Categories Content",
                    False,
                    "Categories content update failed",
                    data
                )
        else:
            self.log_test(
                "Update Categories Content",
                False,
                f"Categories content update failed with status {response.get('status_code') if response else 'No response'}",
                response.get('data', {}) if response else {}
            )
        
        # Test updating prime_benefits delivery_title
        prime_content = {
            "content": {
                "delivery_title": "Fast & Free Delivery - API Updated",
                "delivery_description": "Get your orders delivered quickly and free - API Test"
            }
        }
        
        response = self.make_request('PUT', '/homepage/sections/prime_benefits/content', prime_content)
        
        prime_success = False
        if response and response.get('status_code') == 200:
            data = response.get('data', {})
            if data.get('success'):
                prime_success = True
                self.log_test(
                    "Update Prime Benefits Content",
                    True,
                    "Prime benefits delivery_title updated successfully",
                    {
                        "updated_fields": list(prime_content['content'].keys()),
                        "response_message": data.get('message')
                    }
                )
            else:
                self.log_test(
                    "Update Prime Benefits Content",
                    False,
                    "Prime benefits content update failed",
                    data
                )
        else:
            self.log_test(
                "Update Prime Benefits Content",
                False,
                f"Prime benefits content update failed with status {response.get('status_code') if response else 'No response'}",
                response.get('data', {}) if response else {}
            )
        
        return hero_success and categories_success and prime_success

    def test_image_update_operations(self):
        """Test 9-10: Image Update Operations (PUT images endpoints) - CRITICAL TEST"""
        print("🖼️ TESTING IMAGE UPDATE OPERATIONS (CRITICAL - Previously Failed)...")
        
        # Test updating hero hero_background
        hero_images = {
            "images": {
                "hero_background": {
                    "url": "https://images.unsplash.com/photo-1534452203293-494d7ddbf7e0?w=1200&h=400&fit=crop&crop=center",
                    "alt": "RitZone Hero Banner - Database Constraint Fix Test",
                    "title": "Premium Shopping Experience - Constraint Fixed",
                    "upload_type": "url"
                }
            }
        }
        
        response = self.make_request('PUT', '/homepage/sections/hero/images', hero_images)
        
        hero_images_success = False
        if response and response.get('status_code') == 200:
            data = response.get('data', {})
            if data.get('success'):
                hero_images_success = True
                self.log_test(
                    "Update Hero Images (Constraint Fix)",
                    True,
                    "Hero hero_background updated successfully - NO constraint error!",
                    {
                        "updated_images": list(hero_images['images'].keys()),
                        "constraint_fix": "SUCCESS - No 'no unique constraint' error",
                        "response_message": data.get('message')
                    }
                )
            else:
                self.log_test(
                    "Update Hero Images (Constraint Fix)",
                    False,
                    "Hero images update failed - constraint issue may persist",
                    {
                        "error": data.get('message', 'Unknown error'),
                        "constraint_status": "FAILED"
                    }
                )
        else:
            error_msg = response.get('data', {}).get('message', 'Unknown error') if response else 'No response'
            constraint_error = 'unique constraint' in error_msg.lower() or 'duplicate key' in error_msg.lower()
            
            self.log_test(
                "Update Hero Images (Constraint Fix)",
                False,
                f"Hero images update failed - {'CONSTRAINT ERROR DETECTED' if constraint_error else 'Other error'}",
                {
                    "status_code": response.get('status_code') if response else 'No response',
                    "error_message": error_msg,
                    "constraint_error_detected": constraint_error,
                    "constraint_status": "FAILED" if constraint_error else "OTHER_ERROR"
                }
            )
        
        # Test updating categories category_electronics images
        categories_images = {
            "images": {
                "category_electronics": {
                    "url": "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=300&h=200&fit=crop",
                    "alt": "Electronics Category - Constraint Fix Test",
                    "title": "Latest tech gadgets and electronics - Database Fixed",
                    "upload_type": "url"
                }
            }
        }
        
        response = self.make_request('PUT', '/homepage/sections/categories/images', categories_images)
        
        categories_images_success = False
        if response and response.get('status_code') == 200:
            data = response.get('data', {})
            if data.get('success'):
                categories_images_success = True
                self.log_test(
                    "Update Categories Images (Constraint Fix)",
                    True,
                    "Categories category_electronics updated successfully - NO constraint error!",
                    {
                        "updated_images": list(categories_images['images'].keys()),
                        "constraint_fix": "SUCCESS - No 'no unique constraint' error",
                        "response_message": data.get('message')
                    }
                )
            else:
                self.log_test(
                    "Update Categories Images (Constraint Fix)",
                    False,
                    "Categories images update failed - constraint issue may persist",
                    {
                        "error": data.get('message', 'Unknown error'),
                        "constraint_status": "FAILED"
                    }
                )
        else:
            error_msg = response.get('data', {}).get('message', 'Unknown error') if response else 'No response'
            constraint_error = 'unique constraint' in error_msg.lower() or 'duplicate key' in error_msg.lower()
            
            self.log_test(
                "Update Categories Images (Constraint Fix)",
                False,
                f"Categories images update failed - {'CONSTRAINT ERROR DETECTED' if constraint_error else 'Other error'}",
                {
                    "status_code": response.get('status_code') if response else 'No response',
                    "error_message": error_msg,
                    "constraint_error_detected": constraint_error,
                    "constraint_status": "FAILED" if constraint_error else "OTHER_ERROR"
                }
            )
        
        return hero_images_success and categories_images_success

    def create_test_image(self):
        """Create a small test image for upload testing"""
        try:
            # Create a simple 100x100 PNG image
            from PIL import Image
            img = Image.new('RGB', (100, 100), color='red')
            
            # Save to BytesIO
            img_bytes = BytesIO()
            img.save(img_bytes, format='PNG')
            img_bytes.seek(0)
            
            return img_bytes
        except ImportError:
            # Fallback: create a simple text file as "image"
            return BytesIO(b'Test image content for homepage upload testing')

    def test_file_upload_functionality(self):
        """Test 11-12: File Upload Functionality (POST upload endpoints)"""
        print("📤 TESTING FILE UPLOAD FUNCTIONALITY...")
        
        # Create test image
        test_image = self.create_test_image()
        
        # Test hero section image upload
        files = {
            'image': ('test_hero_image.png', test_image, 'image/png')
        }
        
        data = {
            'imageKey': 'hero_background_upload',
            'alt': 'Hero Background - File Upload Test',
            'title': 'Uploaded Hero Image - API Test'
        }
        
        response = self.make_request('POST', '/homepage/sections/hero/upload', data=data, files=files)
        
        hero_upload_success = False
        if response and response.get('status_code') == 200:
            response_data = response.get('data', {})
            if response_data.get('success'):
                hero_upload_success = True
                self.log_test(
                    "Hero Section File Upload",
                    True,
                    "Hero section image uploaded successfully with multipart/form-data",
                    {
                        "image_key": response_data.get('data', {}).get('imageKey'),
                        "image_url": response_data.get('data', {}).get('imageUrl'),
                        "file_name": response_data.get('data', {}).get('fileName'),
                        "upload_method": "multipart/form-data"
                    }
                )
            else:
                self.log_test(
                    "Hero Section File Upload",
                    False,
                    "Hero section file upload failed",
                    response_data
                )
        else:
            self.log_test(
                "Hero Section File Upload",
                False,
                f"Hero section file upload failed with status {response.get('status_code') if response else 'No response'}",
                response.get('data', {}) if response else {}
            )
        
        # Test categories section image upload
        test_image2 = self.create_test_image()
        files2 = {
            'image': ('test_category_image.png', test_image2, 'image/png')
        }
        
        data2 = {
            'imageKey': 'category_electronics_upload',
            'alt': 'Electronics Category - File Upload Test',
            'title': 'Uploaded Electronics Image - API Test'
        }
        
        response = self.make_request('POST', '/homepage/sections/categories/upload', data=data2, files=files2)
        
        categories_upload_success = False
        if response and response.get('status_code') == 200:
            response_data = response.get('data', {})
            if response_data.get('success'):
                categories_upload_success = True
                self.log_test(
                    "Categories Section File Upload",
                    True,
                    "Categories section image uploaded successfully with multipart/form-data",
                    {
                        "image_key": response_data.get('data', {}).get('imageKey'),
                        "image_url": response_data.get('data', {}).get('imageUrl'),
                        "file_name": response_data.get('data', {}).get('fileName'),
                        "upload_method": "multipart/form-data"
                    }
                )
            else:
                self.log_test(
                    "Categories Section File Upload",
                    False,
                    "Categories section file upload failed",
                    response_data
                )
        else:
            self.log_test(
                "Categories Section File Upload",
                False,
                f"Categories section file upload failed with status {response.get('status_code') if response else 'No response'}",
                response.get('data', {}) if response else {}
            )
        
        return hero_upload_success and categories_upload_success

    def test_bulk_update_operations(self):
        """Test 13-14: Bulk Update Operations (PUT section with content + images + settings)"""
        print("🔄 TESTING BULK UPDATE OPERATIONS...")
        
        # Test bulk update for hero section
        hero_bulk_data = {
            "content": {
                "welcome_title": "RitZone - Bulk Update Test",
                "welcome_subtitle": "Complete section management via bulk API",
                "cta_button_text": "Bulk Update Success"
            },
            "images": {
                "hero_background_bulk": {
                    "url": "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1200&h=400&fit=crop",
                    "alt": "Hero Background - Bulk Update Test",
                    "title": "Bulk Updated Hero Image",
                    "upload_type": "url"
                }
            },
            "settings": {
                "auto_rotate": True,
                "display_duration": 5000,
                "show_indicators": True
            }
        }
        
        response = self.make_request('PUT', '/homepage/sections/hero', hero_bulk_data)
        
        hero_bulk_success = False
        if response and response.get('status_code') == 200:
            data = response.get('data', {})
            if data.get('success'):
                details = data.get('details', [])
                successful_updates = [d for d in details if d.get('success')]
                
                hero_bulk_success = len(successful_updates) == len(details)
                
                self.log_test(
                    "Hero Section Bulk Update",
                    hero_bulk_success,
                    f"Hero section bulk update {'completed successfully' if hero_bulk_success else 'partially failed'}",
                    {
                        "total_operations": len(details),
                        "successful_operations": len(successful_updates),
                        "operations": details,
                        "content_updated": any(d.get('type') == 'content' and d.get('success') for d in details),
                        "images_updated": any(d.get('type') == 'images' and d.get('success') for d in details),
                        "settings_updated": any(d.get('type') == 'settings' and d.get('success') for d in details)
                    }
                )
            else:
                self.log_test(
                    "Hero Section Bulk Update",
                    False,
                    "Hero section bulk update failed",
                    data
                )
        else:
            self.log_test(
                "Hero Section Bulk Update",
                False,
                f"Hero section bulk update failed with status {response.get('status_code') if response else 'No response'}",
                response.get('data', {}) if response else {}
            )
        
        # Test bulk update for categories section
        categories_bulk_data = {
            "content": {
                "section_title": "Shop by Category - Bulk Updated",
                "section_description": "Explore our product categories - Bulk API Test"
            },
            "images": {
                "category_fashion_bulk": {
                    "url": "https://images.unsplash.com/photo-1445205170230-053b83016050?w=300&h=200&fit=crop",
                    "alt": "Fashion Category - Bulk Update",
                    "title": "Fashion Products - Bulk Updated",
                    "upload_type": "url"
                }
            }
        }
        
        response = self.make_request('PUT', '/homepage/sections/categories', categories_bulk_data)
        
        categories_bulk_success = False
        if response and response.get('status_code') == 200:
            data = response.get('data', {})
            if data.get('success'):
                details = data.get('details', [])
                successful_updates = [d for d in details if d.get('success')]
                
                categories_bulk_success = len(successful_updates) == len(details)
                
                self.log_test(
                    "Categories Section Bulk Update",
                    categories_bulk_success,
                    f"Categories section bulk update {'completed successfully' if categories_bulk_success else 'partially failed'}",
                    {
                        "total_operations": len(details),
                        "successful_operations": len(successful_updates),
                        "operations": details,
                        "content_updated": any(d.get('type') == 'content' and d.get('success') for d in details),
                        "images_updated": any(d.get('type') == 'images' and d.get('success') for d in details)
                    }
                )
            else:
                self.log_test(
                    "Categories Section Bulk Update",
                    False,
                    "Categories section bulk update failed",
                    data
                )
        else:
            self.log_test(
                "Categories Section Bulk Update",
                False,
                f"Categories section bulk update failed with status {response.get('status_code') if response else 'No response'}",
                response.get('data', {}) if response else {}
            )
        
        return hero_bulk_success and categories_bulk_success

    def run_comprehensive_tests(self):
        """Run all comprehensive homepage management API tests"""
        print("🧪 STARTING COMPREHENSIVE HOMEPAGE MANAGEMENT API TESTS...")
        print()
        
        # Test 1: Backend Health Check
        if not self.test_backend_health_check():
            print("❌ Backend health check failed. Stopping tests.")
            return self.generate_summary()
        
        # Tests 2-6: Homepage Sections Retrieval
        self.test_homepage_sections_retrieval()
        
        # Tests 7-8: Content Update Operations
        self.test_content_update_operations()
        
        # Tests 9-10: Image Update Operations (CRITICAL)
        self.test_image_update_operations()
        
        # Tests 11-12: File Upload Functionality
        self.test_file_upload_functionality()
        
        # Tests 13-14: Bulk Update Operations
        self.test_bulk_update_operations()
        
        return self.generate_summary()

    def generate_summary(self):
        """Generate comprehensive test summary"""
        print("=" * 80)
        print("📊 COMPREHENSIVE HOMEPAGE MANAGEMENT API TEST SUMMARY - JANUARY 2025")
        print("=" * 80)
        
        success_rate = (self.passed_tests / self.total_tests * 100) if self.total_tests > 0 else 0
        
        print(f"🧪 Total Tests: {self.total_tests}")
        print(f"✅ Passed: {self.passed_tests}")
        print(f"❌ Failed: {self.failed_tests}")
        print(f"📈 Success Rate: {success_rate:.1f}%")
        print()
        
        # Critical test results
        critical_tests = [
            "Update Hero Images (Constraint Fix)",
            "Update Categories Images (Constraint Fix)",
            "Hero Section File Upload",
            "Categories Section File Upload"
        ]
        
        critical_results = [r for r in self.test_results if r['test_name'] in critical_tests]
        critical_passed = sum(1 for r in critical_results if r['success'])
        
        print("🎯 CRITICAL TEST RESULTS (Database Constraint Fix & File Upload):")
        for result in critical_results:
            status = "✅ PASS" if result['success'] else "❌ FAIL"
            print(f"   {status} | {result['test_name']}")
        print(f"   📊 Critical Success Rate: {(critical_passed/len(critical_results)*100):.1f}% ({critical_passed}/{len(critical_results)})")
        print()
        
        if self.failed_tests > 0:
            print("❌ FAILED TESTS:")
            for result in self.test_results:
                if not result['success']:
                    print(f"   • {result['test_name']}: {result['message']}")
            print()
        
        # Overall assessment
        if success_rate >= 95:
            status = "🎉 EXCELLENT"
            assessment = "Homepage management API is working excellently! Ready for admin panel integration."
        elif success_rate >= 85:
            status = "✅ GOOD"
            assessment = "Homepage management API is working well with minor issues."
        elif success_rate >= 70:
            status = "⚠️ NEEDS ATTENTION"
            assessment = "Homepage management API has some issues that need attention."
        else:
            status = "❌ CRITICAL"
            assessment = "Homepage management API has critical issues and needs immediate attention."
        
        # Special assessment for constraint fix
        constraint_tests = [r for r in self.test_results if "Constraint Fix" in r['test_name']]
        constraint_success = all(r['success'] for r in constraint_tests)
        
        if constraint_success and len(constraint_tests) > 0:
            constraint_status = "✅ DATABASE CONSTRAINT ISSUE RESOLVED!"
        elif len(constraint_tests) > 0:
            constraint_status = "❌ DATABASE CONSTRAINT ISSUE PERSISTS!"
        else:
            constraint_status = "⚠️ CONSTRAINT TESTS NOT FOUND"
            
        print(f"🏆 Overall Status: {status}")
        print(f"📝 Assessment: {assessment}")
        print(f"🔧 Constraint Fix Status: {constraint_status}")
        print()
        
        print(f"🌐 Backend URL: {self.backend_url}")
        print(f"⏰ Test Completed: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print("=" * 80)
        
        return {
            'total_tests': self.total_tests,
            'passed_tests': self.passed_tests,
            'failed_tests': self.failed_tests,
            'success_rate': success_rate,
            'status': status,
            'assessment': assessment,
            'constraint_fix_status': constraint_status,
            'backend_url': self.backend_url,
            'test_results': self.test_results,
            'critical_success_rate': (critical_passed/len(critical_results)*100) if critical_results else 0
        }

def main():
    """Main test execution"""
    tester = HomepageManagementTester()
    summary = tester.run_comprehensive_tests()
    
    # Exit with appropriate code
    if summary['success_rate'] >= 85:
        sys.exit(0)  # Success
    else:
        sys.exit(1)  # Failure

if __name__ == "__main__":
    main()
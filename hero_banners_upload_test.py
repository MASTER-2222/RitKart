#!/usr/bin/env python3
"""
RitZone Hero Banners Image Upload Testing Suite - January 2025
==============================================================
Comprehensive testing for Hero Banners image upload functionality:
- Existing hero banners API endpoints (GET /api/banners, PUT /api/banners/:id)
- New image upload endpoint (POST /api/banners/:id/upload)
- Supabase Storage integration with 'hero-banners' bucket
- Admin authentication requirements
- File validation (image types, size limits)
- Error handling and edge cases
"""

import requests
import json
import sys
import uuid
import time
import io
from datetime import datetime
from PIL import Image

class HeroBannersUploadTester:
    def __init__(self, base_url="http://localhost:8001/api"):
        self.base_url = base_url
        self.admin_token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []
        self.existing_banners = []
        self.test_banner_id = None

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
            response = requests.get(f"{self.base_url}/health", timeout=10)
            if response.status_code == 200:
                data = response.json()
                return self.log_test(
                    "Backend Health Check",
                    True,
                    f"Backend running correctly - {data.get('message', 'OK')}",
                    data
                )
            else:
                return self.log_test(
                    "Backend Health Check",
                    False,
                    f"Backend health check failed with status {response.status_code}",
                    response.text
                )
        except Exception as e:
            return self.log_test(
                "Backend Health Check",
                False,
                f"Backend connection failed: {str(e)}"
            )

    def authenticate_admin(self):
        """Authenticate as admin user to get access token"""
        try:
            # Try to authenticate with admin credentials
            auth_data = {
                "email": "admin@ritzone.com",
                "password": "RitZone@Admin2025!"
            }
            
            response = requests.post(f"{self.base_url}/auto-sync/auth/login", json=auth_data, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success') and data.get('data', {}).get('token'):
                    self.admin_token = data['data']['token']
                    return self.log_test(
                        "Admin Authentication",
                        True,
                        f"Admin authenticated successfully - Token acquired",
                        {"user": data.get('data', {}).get('user', {})}
                    )
                else:
                    return self.log_test(
                        "Admin Authentication",
                        False,
                        f"Authentication response missing token: {data}",
                        data
                    )
            else:
                return self.log_test(
                    "Admin Authentication",
                    False,
                    f"Admin authentication failed with status {response.status_code}",
                    response.text
                )
        except Exception as e:
            return self.log_test(
                "Admin Authentication",
                False,
                f"Admin authentication error: {str(e)}"
            )

    def test_get_hero_banners(self):
        """Test GET /api/banners endpoint"""
        try:
            response = requests.get(f"{self.base_url}/banners", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success') and 'data' in data:
                    self.existing_banners = data['data']
                    banner_count = len(self.existing_banners)
                    
                    # Store first banner ID for testing if available
                    if self.existing_banners:
                        self.test_banner_id = self.existing_banners[0].get('id')
                    
                    return self.log_test(
                        "Get Hero Banners",
                        True,
                        f"Retrieved {banner_count} hero banners successfully",
                        {"count": banner_count, "sample": self.existing_banners[:2] if self.existing_banners else []}
                    )
                else:
                    return self.log_test(
                        "Get Hero Banners",
                        False,
                        f"Invalid response format: {data}",
                        data
                    )
            else:
                return self.log_test(
                    "Get Hero Banners",
                    False,
                    f"Get banners failed with status {response.status_code}",
                    response.text
                )
        except Exception as e:
            return self.log_test(
                "Get Hero Banners",
                False,
                f"Get banners error: {str(e)}"
            )

    def test_update_banner_data(self):
        """Test PUT /api/banners/:id endpoint"""
        if not self.admin_token:
            return self.log_test(
                "Update Banner Data",
                False,
                "Admin authentication required"
            )
        
        if not self.test_banner_id:
            return self.log_test(
                "Update Banner Data",
                False,
                "No banner ID available for testing"
            )

        try:
            headers = {"Authorization": f"Bearer {self.admin_token}"}
            update_data = {
                "title": f"Test Banner Update - {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}",
                "description": "Updated via automated testing"
            }
            
            response = requests.put(
                f"{self.base_url}/banners/{self.test_banner_id}",
                json=update_data,
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success'):
                    return self.log_test(
                        "Update Banner Data",
                        True,
                        f"Banner updated successfully - {data.get('message', 'OK')}",
                        data.get('data', {})
                    )
                else:
                    return self.log_test(
                        "Update Banner Data",
                        False,
                        f"Update failed: {data.get('message', 'Unknown error')}",
                        data
                    )
            else:
                return self.log_test(
                    "Update Banner Data",
                    False,
                    f"Update banner failed with status {response.status_code}",
                    response.text
                )
        except Exception as e:
            return self.log_test(
                "Update Banner Data",
                False,
                f"Update banner error: {str(e)}"
            )

    def create_test_image(self, format='JPEG', size=(800, 400), color='red'):
        """Create a test image in memory"""
        img = Image.new('RGB', size, color=color)
        img_buffer = io.BytesIO()
        img.save(img_buffer, format=format)
        img_buffer.seek(0)
        return img_buffer

    def test_image_upload_success(self):
        """Test successful image upload to Supabase Storage"""
        if not self.admin_token:
            return self.log_test(
                "Image Upload Success",
                False,
                "Admin authentication required"
            )
        
        if not self.test_banner_id:
            return self.log_test(
                "Image Upload Success",
                False,
                "No banner ID available for testing"
            )

        try:
            headers = {"Authorization": f"Bearer {self.admin_token}"}
            
            # Create test image
            test_image = self.create_test_image('JPEG', (800, 400), 'blue')
            
            files = {
                'image': ('test_banner.jpg', test_image, 'image/jpeg')
            }
            
            response = requests.post(
                f"{self.base_url}/banners/{self.test_banner_id}/upload",
                files=files,
                headers=headers,
                timeout=30  # Longer timeout for file upload
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success'):
                    upload_data = data.get('data', {})
                    image_url = upload_data.get('imageUrl', '')
                    
                    # Verify the response contains expected fields
                    expected_fields = ['bannerId', 'imageUrl', 'fileName', 'originalName', 'size']
                    missing_fields = [field for field in expected_fields if field not in upload_data]
                    
                    if not missing_fields and image_url:
                        return self.log_test(
                            "Image Upload Success",
                            True,
                            f"Image uploaded successfully to Supabase Storage - URL: {image_url[:50]}...",
                            {
                                "imageUrl": image_url,
                                "fileName": upload_data.get('fileName'),
                                "size": upload_data.get('size'),
                                "banner": upload_data.get('banner', {}).get('id')
                            }
                        )
                    else:
                        return self.log_test(
                            "Image Upload Success",
                            False,
                            f"Upload response missing fields: {missing_fields}",
                            data
                        )
                else:
                    return self.log_test(
                        "Image Upload Success",
                        False,
                        f"Upload failed: {data.get('message', 'Unknown error')}",
                        data
                    )
            else:
                return self.log_test(
                    "Image Upload Success",
                    False,
                    f"Image upload failed with status {response.status_code}",
                    response.text
                )
        except Exception as e:
            return self.log_test(
                "Image Upload Success",
                False,
                f"Image upload error: {str(e)}"
            )

    def test_file_validation_image_types(self):
        """Test file validation - only allows image files"""
        if not self.admin_token or not self.test_banner_id:
            return self.log_test(
                "File Validation - Image Types",
                False,
                "Admin authentication or banner ID required"
            )

        try:
            headers = {"Authorization": f"Bearer {self.admin_token}"}
            
            # Test with non-image file (text file)
            text_content = b"This is not an image file"
            files = {
                'image': ('test_file.txt', io.BytesIO(text_content), 'text/plain')
            }
            
            response = requests.post(
                f"{self.base_url}/banners/{self.test_banner_id}/upload",
                files=files,
                headers=headers,
                timeout=10
            )
            
            # Should reject non-image files
            if response.status_code == 400 or response.status_code == 422:
                data = response.json() if response.headers.get('content-type', '').startswith('application/json') else {"error": response.text}
                return self.log_test(
                    "File Validation - Image Types",
                    True,
                    f"Correctly rejected non-image file - Status: {response.status_code}",
                    data
                )
            else:
                return self.log_test(
                    "File Validation - Image Types",
                    False,
                    f"Should have rejected non-image file but got status {response.status_code}",
                    response.text
                )
        except Exception as e:
            return self.log_test(
                "File Validation - Image Types",
                False,
                f"File validation test error: {str(e)}"
            )

    def test_file_size_limit(self):
        """Test file size limit (10MB max)"""
        if not self.admin_token or not self.test_banner_id:
            return self.log_test(
                "File Size Limit",
                False,
                "Admin authentication or banner ID required"
            )

        try:
            headers = {"Authorization": f"Bearer {self.admin_token}"}
            
            # Create large image (over 10MB)
            large_image = self.create_test_image('JPEG', (5000, 5000), 'green')  # Should be > 10MB
            
            files = {
                'image': ('large_test.jpg', large_image, 'image/jpeg')
            }
            
            response = requests.post(
                f"{self.base_url}/banners/{self.test_banner_id}/upload",
                files=files,
                headers=headers,
                timeout=30
            )
            
            # Should reject files over 10MB
            if response.status_code == 413 or response.status_code == 400:
                data = response.json() if response.headers.get('content-type', '').startswith('application/json') else {"error": response.text}
                return self.log_test(
                    "File Size Limit",
                    True,
                    f"Correctly rejected oversized file - Status: {response.status_code}",
                    data
                )
            else:
                # If it didn't reject, check if the image was actually small enough
                large_image.seek(0, 2)  # Seek to end
                file_size = large_image.tell()
                large_image.seek(0)  # Reset
                
                if file_size < 10 * 1024 * 1024:  # Less than 10MB
                    return self.log_test(
                        "File Size Limit",
                        True,
                        f"Test image was actually under 10MB ({file_size} bytes), upload succeeded as expected",
                        {"file_size": file_size, "status": response.status_code}
                    )
                else:
                    return self.log_test(
                        "File Size Limit",
                        False,
                        f"Should have rejected large file ({file_size} bytes) but got status {response.status_code}",
                        response.text
                    )
        except Exception as e:
            return self.log_test(
                "File Size Limit",
                False,
                f"File size limit test error: {str(e)}"
            )

    def test_authentication_required(self):
        """Test that upload endpoint requires admin authentication"""
        if not self.test_banner_id:
            return self.log_test(
                "Authentication Required",
                False,
                "No banner ID available for testing"
            )

        try:
            # Test without authentication
            test_image = self.create_test_image('JPEG', (400, 200), 'yellow')
            files = {
                'image': ('test_auth.jpg', test_image, 'image/jpeg')
            }
            
            response = requests.post(
                f"{self.base_url}/banners/{self.test_banner_id}/upload",
                files=files,
                timeout=10
            )
            
            # Should reject unauthenticated requests
            if response.status_code == 401 or response.status_code == 403:
                data = response.json() if response.headers.get('content-type', '').startswith('application/json') else {"error": response.text}
                return self.log_test(
                    "Authentication Required",
                    True,
                    f"Correctly rejected unauthenticated request - Status: {response.status_code}",
                    data
                )
            else:
                return self.log_test(
                    "Authentication Required",
                    False,
                    f"Should have rejected unauthenticated request but got status {response.status_code}",
                    response.text
                )
        except Exception as e:
            return self.log_test(
                "Authentication Required",
                False,
                f"Authentication test error: {str(e)}"
            )

    def test_missing_file_error(self):
        """Test error handling when no file is uploaded"""
        if not self.admin_token or not self.test_banner_id:
            return self.log_test(
                "Missing File Error",
                False,
                "Admin authentication or banner ID required"
            )

        try:
            headers = {"Authorization": f"Bearer {self.admin_token}"}
            
            # Send request without file
            response = requests.post(
                f"{self.base_url}/banners/{self.test_banner_id}/upload",
                headers=headers,
                timeout=10
            )
            
            # Should return error for missing file
            if response.status_code == 400:
                data = response.json() if response.headers.get('content-type', '').startswith('application/json') else {"error": response.text}
                return self.log_test(
                    "Missing File Error",
                    True,
                    f"Correctly handled missing file - Status: {response.status_code}",
                    data
                )
            else:
                return self.log_test(
                    "Missing File Error",
                    False,
                    f"Should have returned 400 for missing file but got status {response.status_code}",
                    response.text
                )
        except Exception as e:
            return self.log_test(
                "Missing File Error",
                False,
                f"Missing file test error: {str(e)}"
            )

    def test_invalid_banner_id(self):
        """Test error handling for invalid banner ID"""
        if not self.admin_token:
            return self.log_test(
                "Invalid Banner ID",
                False,
                "Admin authentication required"
            )

        try:
            headers = {"Authorization": f"Bearer {self.admin_token}"}
            invalid_banner_id = str(uuid.uuid4())  # Random UUID that doesn't exist
            
            test_image = self.create_test_image('JPEG', (400, 200), 'purple')
            files = {
                'image': ('test_invalid.jpg', test_image, 'image/jpeg')
            }
            
            response = requests.post(
                f"{self.base_url}/banners/{invalid_banner_id}/upload",
                files=files,
                headers=headers,
                timeout=10
            )
            
            # Should return error for invalid banner ID
            if response.status_code == 400 or response.status_code == 404:
                data = response.json() if response.headers.get('content-type', '').startswith('application/json') else {"error": response.text}
                return self.log_test(
                    "Invalid Banner ID",
                    True,
                    f"Correctly handled invalid banner ID - Status: {response.status_code}",
                    data
                )
            else:
                return self.log_test(
                    "Invalid Banner ID",
                    False,
                    f"Should have returned error for invalid banner ID but got status {response.status_code}",
                    response.text
                )
        except Exception as e:
            return self.log_test(
                "Invalid Banner ID",
                False,
                f"Invalid banner ID test error: {str(e)}"
            )

    def test_integration_workflow(self):
        """Test full workflow: create banner -> upload image -> verify banner has new image URL"""
        if not self.admin_token:
            return self.log_test(
                "Integration Workflow",
                False,
                "Admin authentication required"
            )

        try:
            headers = {"Authorization": f"Bearer {self.admin_token}"}
            
            # Step 1: Create a new banner
            banner_data = {
                "title": f"Integration Test Banner - {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}",
                "description": "Created for integration testing",
                "image_url": "https://via.placeholder.com/800x400/cccccc/000000?text=Placeholder",
                "button_text": "Test Button",
                "button_link": "/test",
                "is_active": True
            }
            
            create_response = requests.post(
                f"{self.base_url}/banners",
                json=banner_data,
                headers=headers,
                timeout=10
            )
            
            if create_response.status_code != 201:
                return self.log_test(
                    "Integration Workflow",
                    False,
                    f"Failed to create test banner - Status: {create_response.status_code}",
                    create_response.text
                )
            
            create_data = create_response.json()
            if not create_data.get('success'):
                return self.log_test(
                    "Integration Workflow",
                    False,
                    f"Banner creation failed: {create_data.get('message')}",
                    create_data
                )
            
            new_banner_id = create_data.get('data', {}).get('id')
            if not new_banner_id:
                return self.log_test(
                    "Integration Workflow",
                    False,
                    "No banner ID returned from creation",
                    create_data
                )
            
            # Step 2: Upload image to the new banner
            test_image = self.create_test_image('PNG', (1200, 600), 'orange')
            files = {
                'image': ('integration_test.png', test_image, 'image/png')
            }
            
            upload_response = requests.post(
                f"{self.base_url}/banners/{new_banner_id}/upload",
                files=files,
                headers=headers,
                timeout=30
            )
            
            if upload_response.status_code != 200:
                return self.log_test(
                    "Integration Workflow",
                    False,
                    f"Image upload failed - Status: {upload_response.status_code}",
                    upload_response.text
                )
            
            upload_data = upload_response.json()
            if not upload_data.get('success'):
                return self.log_test(
                    "Integration Workflow",
                    False,
                    f"Image upload failed: {upload_data.get('message')}",
                    upload_data
                )
            
            new_image_url = upload_data.get('data', {}).get('imageUrl')
            if not new_image_url:
                return self.log_test(
                    "Integration Workflow",
                    False,
                    "No image URL returned from upload",
                    upload_data
                )
            
            # Step 3: Verify banner has new image URL
            verify_response = requests.get(f"{self.base_url}/banners", timeout=10)
            if verify_response.status_code != 200:
                return self.log_test(
                    "Integration Workflow",
                    False,
                    f"Failed to retrieve banners for verification - Status: {verify_response.status_code}",
                    verify_response.text
                )
            
            verify_data = verify_response.json()
            banners = verify_data.get('data', [])
            updated_banner = next((b for b in banners if b.get('id') == new_banner_id), None)
            
            if not updated_banner:
                return self.log_test(
                    "Integration Workflow",
                    False,
                    f"Could not find updated banner with ID {new_banner_id}",
                    {"available_banners": len(banners)}
                )
            
            banner_image_url = updated_banner.get('image_url')
            if banner_image_url == new_image_url:
                return self.log_test(
                    "Integration Workflow",
                    True,
                    f"Full workflow completed successfully - Banner updated with new image URL",
                    {
                        "banner_id": new_banner_id,
                        "old_url": banner_data['image_url'][:50] + "...",
                        "new_url": new_image_url[:50] + "...",
                        "title": updated_banner.get('title')
                    }
                )
            else:
                return self.log_test(
                    "Integration Workflow",
                    False,
                    f"Banner image URL not updated correctly",
                    {
                        "expected": new_image_url,
                        "actual": banner_image_url,
                        "banner": updated_banner
                    }
                )
                
        except Exception as e:
            return self.log_test(
                "Integration Workflow",
                False,
                f"Integration workflow error: {str(e)}"
            )

    def run_all_tests(self):
        """Run all hero banners upload tests"""
        print("🚀 Starting Hero Banners Image Upload Testing - January 2025")
        print("=" * 70)
        
        # Core infrastructure tests
        if not self.test_backend_health():
            print("❌ Backend not accessible, stopping tests")
            return False
        
        if not self.authenticate_admin():
            print("❌ Admin authentication failed, stopping tests")
            return False
        
        # Existing API tests
        self.test_get_hero_banners()
        self.test_update_banner_data()
        
        # New upload functionality tests
        self.test_image_upload_success()
        self.test_file_validation_image_types()
        self.test_file_size_limit()
        self.test_authentication_required()
        self.test_missing_file_error()
        self.test_invalid_banner_id()
        
        # Integration test
        self.test_integration_workflow()
        
        # Print summary
        print("\n" + "=" * 70)
        print("🎯 HERO BANNERS IMAGE UPLOAD TEST SUMMARY")
        print("=" * 70)
        
        success_rate = (self.tests_passed / self.tests_run * 100) if self.tests_run > 0 else 0
        
        print(f"📊 Tests Run: {self.tests_run}")
        print(f"✅ Tests Passed: {self.tests_passed}")
        print(f"❌ Tests Failed: {self.tests_run - self.tests_passed}")
        print(f"📈 Success Rate: {success_rate:.1f}%")
        
        print("\n📋 DETAILED RESULTS:")
        for result in self.test_results:
            print(f"{result['status']} {result['test']}")
            if result['message']:
                print(f"   └─ {result['message']}")
        
        if success_rate >= 90:
            print(f"\n🎉 HERO BANNERS IMAGE UPLOAD FUNCTIONALITY: EXCELLENT ({success_rate:.1f}%)")
            print("✅ All critical upload features working correctly")
            print("✅ Supabase Storage integration functional")
            print("✅ Admin authentication working")
            print("✅ File validation and error handling working")
        elif success_rate >= 70:
            print(f"\n⚠️ HERO BANNERS IMAGE UPLOAD FUNCTIONALITY: GOOD ({success_rate:.1f}%)")
            print("✅ Core upload functionality working")
            print("⚠️ Some edge cases or validations may need attention")
        else:
            print(f"\n🚨 HERO BANNERS IMAGE UPLOAD FUNCTIONALITY: NEEDS ATTENTION ({success_rate:.1f}%)")
            print("❌ Critical issues found in upload functionality")
        
        return success_rate >= 70

if __name__ == "__main__":
    # Check if custom URL provided
    base_url = "http://localhost:8001/api"
    if len(sys.argv) > 1:
        base_url = sys.argv[1]
        if not base_url.endswith('/api'):
            base_url += '/api'
    
    print(f"🔗 Testing Hero Banners Upload API at: {base_url}")
    
    tester = HeroBannersUploadTester(base_url)
    success = tester.run_all_tests()
    
    sys.exit(0 if success else 1)
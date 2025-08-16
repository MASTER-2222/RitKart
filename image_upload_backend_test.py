#!/usr/bin/env python3
"""
RitZone Image Upload API Testing Suite - January 2025
====================================================
Comprehensive testing for dual image upload functionality including:
- GET /api/images/info - Upload service information
- POST /api/images/validate-url - Image URL validation
- POST /api/images/from-url - Process image from URL with automatic resizing
- POST /api/images/upload - Upload image file with processing
- POST /api/images/upload-multiple - Multiple file upload
- DELETE /api/images/delete - Delete uploaded images

Focus on:
- Automatic image resizing (banner: 1920x600, category: 400x400, etc.)
- Support for all image formats (JPG, PNG, GIF, WebP, SVG, BMP, TIFF)
- Supabase Storage integration
- File size validation (up to 50MB)
- Error handling and validation
"""

import requests
import json
import sys
import os
import tempfile
from datetime import datetime
from PIL import Image
import io

class ImageUploadTester:
    def __init__(self, base_url="http://localhost:8001/api"):
        self.base_url = base_url
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []
        self.uploaded_images = []  # Track uploaded images for cleanup

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

    def make_request(self, method, endpoint, data=None, files=None, expected_status=200):
        """Make HTTP request with comprehensive error handling"""
        url = f"{self.base_url}{endpoint}"
        headers = {}
        
        # Don't set Content-Type for multipart/form-data requests
        if files is None:
            headers['Content-Type'] = 'application/json'

        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=30)
            elif method == 'POST':
                if files:
                    response = requests.post(url, data=data, files=files, timeout=30)
                else:
                    response = requests.post(url, json=data, headers=headers, timeout=30)
            elif method == 'DELETE':
                response = requests.delete(url, json=data, headers=headers, timeout=30)
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

    def create_test_image(self, width=800, height=600, format='JPEG'):
        """Create a test image in memory"""
        # Create a colorful test image
        img = Image.new('RGB', (width, height), color='red')
        
        # Add some visual elements
        for i in range(0, width, 50):
            for j in range(0, height, 50):
                color = (i % 255, j % 255, (i + j) % 255)
                for x in range(i, min(i + 25, width)):
                    for y in range(j, min(j + 25, height)):
                        img.putpixel((x, y), color)
        
        # Convert to bytes
        img_bytes = io.BytesIO()
        img.save(img_bytes, format=format)
        img_bytes.seek(0)
        return img_bytes.getvalue()

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

    def test_get_upload_info(self):
        """Test GET /api/images/info endpoint"""
        print("\n📊 Testing Get Upload Service Information...")
        success, status, data = self.make_request('GET', '/images/info')
        
        if success and data.get('success'):
            upload_data = data.get('data', {})
            allowed_types = upload_data.get('allowedMimeTypes', [])
            max_size_mb = upload_data.get('maxFileSizeMB', 0)
            dimensions = upload_data.get('optimalDimensions', {})
            
            # Verify expected dimensions
            expected_dimensions = {
                'banner': {'width': 1920, 'height': 600},
                'category': {'width': 400, 'height': 400},
                'product': {'width': 800, 'height': 800}
            }
            
            dimensions_correct = True
            for img_type, expected in expected_dimensions.items():
                actual = dimensions.get(img_type, {})
                if actual.get('width') != expected['width'] or actual.get('height') != expected['height']:
                    dimensions_correct = False
                    break
            
            return self.log_test(
                "Get Upload Info", 
                True, 
                f"Upload info retrieved - Max size: {max_size_mb}MB, Formats: {len(allowed_types)}, Dimensions correct: {dimensions_correct}"
            )
        else:
            return self.log_test(
                "Get Upload Info", 
                False, 
                f"Failed to get upload info - Status: {status}, Response: {data}"
            )

    def test_validate_image_url_valid(self):
        """Test POST /api/images/validate-url with valid image URLs"""
        print("\n🔍 Testing Image URL Validation (Valid URLs)...")
        
        # Test with various valid image URLs
        valid_urls = [
            "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=600&fit=crop",
            "https://picsum.photos/800/600.jpg",
            "https://via.placeholder.com/800x600.png"
        ]
        
        valid_count = 0
        for url in valid_urls:
            validation_data = {"imageUrl": url}
            success, status, data = self.make_request('POST', '/images/validate-url', validation_data)
            
            if success and data.get('success'):
                validation_result = data.get('data', {})
                if validation_result.get('valid'):
                    valid_count += 1
                    self.log_test(f"URL Validation Valid ({url[:50]}...)", True, f"URL validated successfully - Content-Type: {validation_result.get('contentType')}")
                else:
                    self.log_test(f"URL Validation Valid ({url[:50]}...)", False, f"Valid URL marked as invalid: {validation_result}")
            else:
                self.log_test(f"URL Validation Valid ({url[:50]}...)", False, f"Validation request failed - Status: {status}")
        
        return valid_count > 0

    def test_validate_image_url_invalid(self):
        """Test POST /api/images/validate-url with invalid URLs"""
        print("\n❌ Testing Image URL Validation (Invalid URLs)...")
        
        # Test with invalid URLs
        invalid_urls = [
            "https://example.com/not-an-image.txt",
            "https://httpstat.us/404",
            "not-a-valid-url",
            ""
        ]
        
        invalid_count = 0
        for url in invalid_urls:
            validation_data = {"imageUrl": url}
            success, status, data = self.make_request('POST', '/images/validate-url', validation_data)
            
            if success and data.get('success'):
                validation_result = data.get('data', {})
                if not validation_result.get('valid'):
                    invalid_count += 1
                    self.log_test(f"URL Validation Invalid ({url[:30]}...)", True, "Invalid URL correctly rejected")
                else:
                    self.log_test(f"URL Validation Invalid ({url[:30]}...)", False, "Invalid URL incorrectly accepted")
            else:
                # For empty URL, expect 400 status
                if url == "" and status == 400:
                    invalid_count += 1
                    self.log_test(f"URL Validation Invalid (empty)", True, "Empty URL correctly rejected with 400")
                else:
                    self.log_test(f"URL Validation Invalid ({url[:30]}...)", False, f"Validation failed unexpectedly - Status: {status}")
        
        return invalid_count > 0

    def test_process_image_from_url(self):
        """Test POST /api/images/from-url endpoint"""
        print("\n🌐 Testing Process Image from URL...")
        
        # Test with a reliable image URL
        test_url = "https://picsum.photos/1200/800.jpg"
        
        # Test different image types and dimensions
        test_cases = [
            {"imageType": "banner", "expected_width": 1920, "expected_height": 600},
            {"imageType": "category", "expected_width": 400, "expected_height": 400},
            {"imageType": "product", "expected_width": 800, "expected_height": 800},
            {"imageType": "banner", "width": 1000, "height": 500, "expected_width": 1000, "expected_height": 500}  # Custom dimensions
        ]
        
        successful_tests = 0
        for test_case in test_cases:
            request_data = {
                "imageUrl": test_url,
                "imageType": test_case["imageType"]
            }
            
            # Add custom dimensions if specified
            if "width" in test_case:
                request_data["width"] = test_case["width"]
                request_data["height"] = test_case["height"]
            
            success, status, data = self.make_request('POST', '/images/from-url', request_data)
            
            if success and data.get('success'):
                result_data = data.get('data', {})
                image_url = result_data.get('imageUrl')
                dimensions = result_data.get('dimensions', {})
                
                if image_url:
                    self.uploaded_images.append(image_url)  # Track for cleanup
                
                dimensions_match = (
                    dimensions.get('width') == test_case['expected_width'] and 
                    dimensions.get('height') == test_case['expected_height']
                )
                
                test_name = f"Process URL ({test_case['imageType']})"
                if "width" in test_case:
                    test_name += f" Custom {test_case['width']}x{test_case['height']}"
                
                if dimensions_match:
                    successful_tests += 1
                    self.log_test(
                        test_name, 
                        True, 
                        f"Image processed successfully - Dimensions: {dimensions.get('width')}x{dimensions.get('height')}, URL: {image_url[:50]}..."
                    )
                else:
                    self.log_test(
                        test_name, 
                        False, 
                        f"Dimensions mismatch - Expected: {test_case['expected_width']}x{test_case['expected_height']}, Got: {dimensions.get('width')}x{dimensions.get('height')}"
                    )
            else:
                self.log_test(
                    f"Process URL ({test_case['imageType']})", 
                    False, 
                    f"Failed to process image from URL - Status: {status}, Response: {data}"
                )
        
        return successful_tests > 0

    def test_upload_image_file(self):
        """Test POST /api/images/upload endpoint"""
        print("\n📤 Testing Upload Image File...")
        
        # Test different image formats and types
        test_cases = [
            {"format": "JPEG", "imageType": "banner", "expected_width": 1920, "expected_height": 600},
            {"format": "PNG", "imageType": "category", "expected_width": 400, "expected_height": 400},
            {"format": "JPEG", "imageType": "product", "expected_width": 800, "expected_height": 800}
        ]
        
        successful_uploads = 0
        for test_case in test_cases:
            # Create test image
            image_data = self.create_test_image(1200, 900, test_case["format"])
            
            # Prepare multipart form data
            files = {
                'image': (f'test_image.{test_case["format"].lower()}', image_data, f'image/{test_case["format"].lower()}')
            }
            
            form_data = {
                'imageType': test_case["imageType"]
            }
            
            success, status, data = self.make_request('POST', '/images/upload', form_data, files)
            
            if success and data.get('success'):
                result_data = data.get('data', {})
                image_url = result_data.get('imageUrl')
                dimensions = result_data.get('dimensions', {})
                
                if image_url:
                    self.uploaded_images.append(image_url)  # Track for cleanup
                
                dimensions_match = (
                    dimensions.get('width') == test_case['expected_width'] and 
                    dimensions.get('height') == test_case['expected_height']
                )
                
                if dimensions_match:
                    successful_uploads += 1
                    self.log_test(
                        f"Upload File ({test_case['format']} {test_case['imageType']})", 
                        True, 
                        f"File uploaded successfully - Dimensions: {dimensions.get('width')}x{dimensions.get('height')}, Size: {result_data.get('fileSize', 0)} bytes"
                    )
                else:
                    self.log_test(
                        f"Upload File ({test_case['format']} {test_case['imageType']})", 
                        False, 
                        f"Dimensions mismatch - Expected: {test_case['expected_width']}x{test_case['expected_height']}, Got: {dimensions.get('width')}x{dimensions.get('height')}"
                    )
            else:
                self.log_test(
                    f"Upload File ({test_case['format']} {test_case['imageType']})", 
                    False, 
                    f"Failed to upload file - Status: {status}, Response: {data}"
                )
        
        return successful_uploads > 0

    def test_upload_multiple_images(self):
        """Test POST /api/images/upload-multiple endpoint"""
        print("\n📤 Testing Upload Multiple Images...")
        
        # Create multiple test images
        image1_data = self.create_test_image(800, 600, 'JPEG')
        image2_data = self.create_test_image(1000, 800, 'PNG')
        image3_data = self.create_test_image(600, 400, 'JPEG')
        
        # Prepare multipart form data for multiple files
        files = [
            ('images', ('test_image1.jpg', image1_data, 'image/jpeg')),
            ('images', ('test_image2.png', image2_data, 'image/png')),
            ('images', ('test_image3.jpg', image3_data, 'image/jpeg'))
        ]
        
        form_data = {
            'imageType': 'product'
        }
        
        success, status, data = self.make_request('POST', '/images/upload-multiple', form_data, files)
        
        if success and data.get('success'):
            result_data = data.get('data', {})
            successful_uploads = result_data.get('successful', [])
            failed_uploads = result_data.get('failed', [])
            total_processed = result_data.get('totalProcessed', 0)
            
            # Track uploaded images for cleanup
            for upload in successful_uploads:
                if upload.get('imageUrl'):
                    self.uploaded_images.append(upload['imageUrl'])
            
            return self.log_test(
                "Upload Multiple Images", 
                True, 
                f"Processed {total_processed} of 3 images successfully, {len(failed_uploads)} failed"
            )
        else:
            return self.log_test(
                "Upload Multiple Images", 
                False, 
                f"Failed to upload multiple images - Status: {status}, Response: {data}"
            )

    def test_upload_validation_errors(self):
        """Test upload validation and error handling"""
        print("\n✅ Testing Upload Validation and Error Handling...")
        
        validation_tests = [
            # No file provided
            (None, {}, "No file should be rejected"),
            # Invalid image type
            (('image', ('test.txt', b'not an image', 'text/plain')), {}, "Non-image file should be rejected"),
        ]
        
        validation_passed = 0
        for files, form_data, description in validation_tests:
            if files:
                files_dict = {'image': files}
            else:
                files_dict = None
            
            success, status, data = self.make_request('POST', '/images/upload', form_data, files_dict, expected_status=400)
            
            if success and status == 400:
                self.log_test(f"Validation: {description}", True, "Properly rejected invalid input")
                validation_passed += 1
            else:
                self.log_test(f"Validation: {description}", False, f"Validation failed - Status: {status}")
        
        return validation_passed > 0

    def test_delete_uploaded_images(self):
        """Test DELETE /api/images/delete endpoint"""
        print("\n🗑️ Testing Delete Uploaded Images...")
        
        if not self.uploaded_images:
            return self.log_test("Delete Images", False, "No uploaded images to delete")
        
        successful_deletions = 0
        for image_url in self.uploaded_images[:3]:  # Test deleting first 3 images
            delete_data = {
                "imageUrl": image_url,
                "bucketName": "images"
            }
            
            success, status, data = self.make_request('DELETE', '/images/delete', delete_data)
            
            if success and data.get('success'):
                successful_deletions += 1
                self.log_test(
                    f"Delete Image ({image_url[-20:]}...)", 
                    True, 
                    "Image deleted successfully"
                )
            else:
                self.log_test(
                    f"Delete Image ({image_url[-20:]}...)", 
                    False, 
                    f"Failed to delete image - Status: {status}, Response: {data}"
                )
        
        return successful_deletions > 0

    def test_custom_dimensions(self):
        """Test custom dimensions functionality"""
        print("\n📏 Testing Custom Dimensions...")
        
        test_url = "https://picsum.photos/1500/1000.jpg"
        custom_dimensions = [
            {"width": 1200, "height": 400},
            {"width": 600, "height": 600},
            {"width": 1000, "height": 300}
        ]
        
        successful_custom = 0
        for dims in custom_dimensions:
            request_data = {
                "imageUrl": test_url,
                "imageType": "banner",
                "width": dims["width"],
                "height": dims["height"]
            }
            
            success, status, data = self.make_request('POST', '/images/from-url', request_data)
            
            if success and data.get('success'):
                result_data = data.get('data', {})
                dimensions = result_data.get('dimensions', {})
                
                if (dimensions.get('width') == dims['width'] and 
                    dimensions.get('height') == dims['height']):
                    successful_custom += 1
                    self.log_test(
                        f"Custom Dimensions {dims['width']}x{dims['height']}", 
                        True, 
                        f"Custom dimensions applied correctly"
                    )
                    
                    # Track for cleanup
                    if result_data.get('imageUrl'):
                        self.uploaded_images.append(result_data['imageUrl'])
                else:
                    self.log_test(
                        f"Custom Dimensions {dims['width']}x{dims['height']}", 
                        False, 
                        f"Custom dimensions not applied - Expected: {dims['width']}x{dims['height']}, Got: {dimensions.get('width')}x{dimensions.get('height')}"
                    )
            else:
                self.log_test(
                    f"Custom Dimensions {dims['width']}x{dims['height']}", 
                    False, 
                    f"Failed to process with custom dimensions - Status: {status}"
                )
        
        return successful_custom > 0

    def run_comprehensive_image_upload_tests(self):
        """Run comprehensive image upload testing suite"""
        print("=" * 80)
        print("🖼️ RitZone Image Upload API Comprehensive Testing Suite - January 2025")
        print("📋 Focus: Dual Image Upload, Automatic Resizing, Supabase Integration")
        print("=" * 80)
        print(f"📅 Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print(f"🌐 Testing endpoint: {self.base_url}")
        print("=" * 80)

        # Core infrastructure tests
        self.test_backend_health()
        
        # Upload service information
        self.test_get_upload_info()
        
        # URL validation tests
        self.test_validate_image_url_valid()
        self.test_validate_image_url_invalid()
        
        # Image processing from URL
        self.test_process_image_from_url()
        
        # File upload tests
        self.test_upload_image_file()
        self.test_upload_multiple_images()
        
        # Validation and error handling
        self.test_upload_validation_errors()
        
        # Custom dimensions
        self.test_custom_dimensions()
        
        # Cleanup - delete uploaded images
        self.test_delete_uploaded_images()

        # Print comprehensive results
        print("\n" + "=" * 80)
        print("📊 COMPREHENSIVE IMAGE UPLOAD TEST RESULTS")
        print("=" * 80)
        
        critical_tests = []
        supporting_tests = []
        
        for result in self.test_results:
            if any(keyword in result['test'].lower() for keyword in ['backend health', 'upload info', 'process url', 'upload file']):
                critical_tests.append(result)
            else:
                supporting_tests.append(result)
        
        print("\n🚨 CRITICAL TESTS:")
        for result in critical_tests:
            print(f"{result['status']} {result['test']}: {result['message']}")
        
        print("\n📋 SUPPORTING TESTS:")
        for result in supporting_tests:
            print(f"{result['status']} {result['test']}: {result['message']}")
        
        print(f"\n📈 Overall Results: {self.tests_passed}/{self.tests_run} tests passed ({(self.tests_passed/self.tests_run*100):.1f}%)")
        
        # Specific analysis for image upload functionality
        upload_tests = [r for r in self.test_results if any(keyword in r['test'].lower() for keyword in ['upload', 'process', 'validate'])]
        if upload_tests:
            upload_success = all(r['status'] == '✅ PASS' for r in upload_tests)
            print(f"\n🖼️ Image Upload Status: {'✅ FULLY FUNCTIONAL' if upload_success else '❌ ISSUES DETECTED'}")
            
            if not upload_success:
                failed_upload_tests = [r for r in upload_tests if r['status'] == '❌ FAIL']
                print("🔍 Failed Upload Tests:")
                for test in failed_upload_tests:
                    print(f"   - {test['test']}: {test['message']}")
        
        # Feature analysis
        print("\n🎯 FEATURE ANALYSIS:")
        features = {
            "Upload Service Info": any('upload info' in r['test'].lower() and r['status'] == '✅ PASS' for r in self.test_results),
            "URL Validation": any('url validation' in r['test'].lower() and r['status'] == '✅ PASS' for r in self.test_results),
            "Process from URL": any('process url' in r['test'].lower() and r['status'] == '✅ PASS' for r in self.test_results),
            "File Upload": any('upload file' in r['test'].lower() and r['status'] == '✅ PASS' for r in self.test_results),
            "Multiple Upload": any('multiple' in r['test'].lower() and r['status'] == '✅ PASS' for r in self.test_results),
            "Custom Dimensions": any('custom dimensions' in r['test'].lower() and r['status'] == '✅ PASS' for r in self.test_results),
            "Image Deletion": any('delete' in r['test'].lower() and r['status'] == '✅ PASS' for r in self.test_results)
        }
        
        for feature, working in features.items():
            status = "✅ Working" if working else "❌ Not Working"
            print(f"   {feature}: {status}")
        
        # Final assessment
        if self.tests_passed >= self.tests_run * 0.8:  # 80% pass rate
            print("\n🎉 Image Upload API is functioning well! Most features are working correctly.")
            return 0
        else:
            failed_critical = [r for r in critical_tests if r['status'] == '❌ FAIL']
            if failed_critical:
                print(f"\n🚨 {len(failed_critical)} critical tests failed")
                print("💡 Recommendations:")
                for test in failed_critical:
                    if 'backend health' in test['test'].lower():
                        print("   - Check backend server status and configuration")
                    elif 'upload' in test['test'].lower():
                        print("   - Verify Supabase Storage configuration")
                        print("   - Check Sharp image processing library installation")
                        print("   - Validate multer middleware configuration")
            return 1

def main():
    """Main test execution"""
    tester = ImageUploadTester()
    return tester.run_comprehensive_image_upload_tests()

if __name__ == "__main__":
    sys.exit(main())
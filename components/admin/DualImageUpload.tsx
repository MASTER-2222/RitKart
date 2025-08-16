'use client';
import { useState, useRef } from 'react';

interface DualImageUploadProps {
  currentImageUrl?: string;
  imageType?: 'banner' | 'hero' | 'category' | 'product' | 'thumbnail' | 'featured';
  customDimensions?: { width: number; height: number };
  onImageChange: (imageUrl: string) => void;
  label?: string;
  required?: boolean;
  disabled?: boolean;
}

export default function DualImageUpload({
  currentImageUrl,
  imageType = 'banner',
  customDimensions,
  onImageChange,
  label = 'Image',
  required = false,
  disabled = false
}: DualImageUploadProps) {
  const [uploadMethod, setUploadMethod] = useState<'url' | 'browse'>('url');
  const [imageUrl, setImageUrl] = useState(currentImageUrl || '');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState(currentImageUrl || '');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8001/api';

  // Handle URL input change
  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setImageUrl(url);
    setPreviewUrl(url);
    if (url) {
      onImageChange(url);
    }
  };

  // Handle URL processing (fetch and resize)
  const handleProcessUrl = async () => {
    if (!imageUrl.trim()) {
      setUploadError('Please enter a valid image URL');
      return;
    }

    try {
      setIsUploading(true);
      setUploadError(null);
      setUploadProgress(20);

      // Validate URL first
      const validateResponse = await fetch(`${backendUrl}/images/validate-url`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ imageUrl })
      });

      const validateResult = await validateResponse.json();
      setUploadProgress(40);

      if (!validateResult.success || !validateResult.data.valid) {
        throw new Error('Invalid image URL or unsupported image format');
      }

      // Process image from URL
      const processResponse = await fetch(`${backendUrl}/images/from-url`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          imageUrl,
          imageType,
          ...(customDimensions && customDimensions)
        })
      });

      const processResult = await processResponse.json();
      setUploadProgress(80);

      if (!processResult.success) {
        throw new Error(processResult.message || 'Failed to process image from URL');
      }

      // Update with processed image URL
      const processedImageUrl = processResult.data.imageUrl;
      setPreviewUrl(processedImageUrl);
      onImageChange(processedImageUrl);
      setUploadProgress(100);

      // Show success message briefly
      setTimeout(() => {
        setUploadProgress(0);
      }, 1500);

    } catch (error: any) {
      console.error('❌ URL processing error:', error);
      setUploadError(error.message || 'Failed to process image URL');
      setUploadProgress(0);
    } finally {
      setIsUploading(false);
    }
  };

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  // Handle file upload
  const handleFileUpload = async (file: File) => {
    try {
      setIsUploading(true);
      setUploadError(null);
      setUploadProgress(10);

      // Create form data
      const formData = new FormData();
      formData.append('image', file);
      formData.append('imageType', imageType);
      
      if (customDimensions) {
        formData.append('width', customDimensions.width.toString());
        formData.append('height', customDimensions.height.toString());
      }

      setUploadProgress(30);

      // Upload file
      const uploadResponse = await fetch(`${backendUrl}/images/upload`, {
        method: 'POST',
        credentials: 'include',
        body: formData
      });

      const uploadResult = await uploadResponse.json();
      setUploadProgress(80);

      if (!uploadResult.success) {
        throw new Error(uploadResult.message || 'Failed to upload image');
      }

      // Update with uploaded image URL
      const uploadedImageUrl = uploadResult.data.imageUrl;
      setPreviewUrl(uploadedImageUrl);
      setImageUrl(uploadedImageUrl);
      onImageChange(uploadedImageUrl);
      setUploadProgress(100);

      // Show success message briefly
      setTimeout(() => {
        setUploadProgress(0);
      }, 1500);

    } catch (error: any) {
      console.error('❌ File upload error:', error);
      setUploadError(error.message || 'Failed to upload image');
      setUploadProgress(0);
    } finally {
      setIsUploading(false);
    }
  };

  // Handle drag and drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find(file => file.type.startsWith('image/'));
    
    if (imageFile) {
      handleFileUpload(imageFile);
    } else {
      setUploadError('Please drop a valid image file');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        
        {/* Upload Method Toggle */}
        <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
          <button
            type="button"
            onClick={() => setUploadMethod('url')}
            className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
              uploadMethod === 'url'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
            disabled={disabled}
          >
            <i className="ri-link mr-1"></i>
            URL
          </button>
          <button
            type="button"
            onClick={() => setUploadMethod('browse')}
            className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
              uploadMethod === 'browse'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
            disabled={disabled}
          >
            <i className="ri-upload-cloud-2-line mr-1"></i>
            Browse
          </button>
        </div>
      </div>

      {/* Upload Progress */}
      {uploadProgress > 0 && (
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${uploadProgress}%` }}
          ></div>
        </div>
      )}

      {/* Error Display */}
      {uploadError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          <i className="ri-error-warning-line mr-1"></i>
          {uploadError}
        </div>
      )}

      {/* URL Upload Method */}
      {uploadMethod === 'url' && (
        <div className="space-y-3">
          <div className="flex space-x-2">
            <input
              type="url"
              value={imageUrl}
              onChange={handleUrlChange}
              placeholder="https://example.com/image.jpg"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={disabled || isUploading}
            />
            <button
              type="button"
              onClick={handleProcessUrl}
              disabled={disabled || isUploading || !imageUrl.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center"
            >
              {isUploading ? (
                <>
                  <i className="ri-loader-4-line animate-spin mr-2"></i>
                  Processing...
                </>
              ) : (
                <>
                  <i className="ri-download-cloud-line mr-2"></i>
                  Process
                </>
              )}
            </button>
          </div>
          <p className="text-xs text-gray-500">
            Enter an image URL to automatically resize and optimize for {imageType} use
          </p>
        </div>
      )}

      {/* File Upload Method */}
      {uploadMethod === 'browse' && (
        <div className="space-y-3">
          <div
            className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
              disabled ? 'border-gray-200 bg-gray-50' : 'border-gray-300 hover:border-blue-400'
            }`}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
              disabled={disabled || isUploading}
            />
            
            <div className="space-y-3">
              <div className="flex justify-center">
                <i className="ri-upload-cloud-2-line text-4xl text-gray-400"></i>
              </div>
              
              <div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={disabled || isUploading}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {isUploading ? (
                    <>
                      <i className="ri-loader-4-line animate-spin mr-2"></i>
                      Uploading...
                    </>
                  ) : (
                    <>
                      <i className="ri-folder-open-line mr-2"></i>
                      Choose File
                    </>
                  )}
                </button>
                <p className="text-sm text-gray-500 mt-2">
                  or drag and drop an image here
                </p>
              </div>
              
              <div className="text-xs text-gray-400 space-y-1">
                <p>Supports: JPG, PNG, GIF, WebP, SVG, BMP, TIFF</p>
                <p>Max size: 50MB • Auto-resized for optimal {imageType} dimensions</p>
                {customDimensions && (
                  <p>Target size: {customDimensions.width}×{customDimensions.height}px</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Image Preview */}
      {previewUrl && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Preview</label>
          <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
            <img
              src={previewUrl}
              alt="Image preview"
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = 'https://images.unsplash.com/photo-1534452203293-494d7ddbf7e0?w=600&h=300&fit=crop&crop=center';
              }}
            />
          </div>
          <div className="flex justify-between items-center text-xs text-gray-500">
            <span>
              {imageType.charAt(0).toUpperCase() + imageType.slice(1)} image preview
            </span>
            <button
              type="button"
              onClick={() => {
                setPreviewUrl('');
                setImageUrl('');
                onImageChange('');
              }}
              className="text-red-600 hover:text-red-800 font-medium"
              disabled={disabled}
            >
              <i className="ri-delete-bin-line mr-1"></i>
              Remove
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
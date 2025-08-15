'use client';
import { useState } from 'react';
import apiClient from '../../utils/api';

interface ImageManagerProps {
  title: string;
  currentImage: string;
  compact?: boolean;
  sectionName?: string;
  imageKey?: string;
  onImageUpdate?: (imageUrl: string) => void;
}

export default function ImageManager({ 
  title, 
  currentImage, 
  compact = false,
  sectionName,
  imageKey,
  onImageUpdate
}: ImageManagerProps) {
  const [image, setImage] = useState(currentImage);
  const [isEditing, setIsEditing] = useState(false);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string>('');

  const handleImageUrlUpdate = async () => {
    if (!newImageUrl.trim()) {
      setSaveMessage('❌ Please enter a valid URL');
      return;
    }

    if (!sectionName || !imageKey) {
      setSaveMessage('❌ Configuration error');
      return;
    }

    setIsUploading(true);
    setSaveMessage('');

    try {
      // Update image via URL
      const result = await apiClient.updateHomepageImages(sectionName, {
        [imageKey]: {
          url: newImageUrl.trim(),
          alt: title,
          title: title,
          upload_type: 'url'
        }
      });

      if (result.success) {
        setImage(newImageUrl.trim());
        setNewImageUrl('');
        setIsEditing(false);
        setSaveMessage('✅ Image updated successfully');
        onImageUpdate?.(newImageUrl.trim());
        
        // Clear message after 3 seconds
        setTimeout(() => setSaveMessage(''), 3000);
      } else {
        setSaveMessage(`❌ ${result.message || 'Update failed'}`);
      }
    } catch (error) {
      console.error('Image URL update error:', error);
      setSaveMessage('❌ Failed to update image');
    } finally {
      setIsUploading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!sectionName || !imageKey) {
      setSaveMessage('❌ Configuration error');
      return;
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setSaveMessage('❌ Only image files are allowed (JPEG, PNG, GIF, WebP)');
      return;
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      setSaveMessage('❌ File size must be less than 10MB');
      return;
    }

    setIsUploading(true);
    setSaveMessage('');

    try {
      // Upload image file
      const result = await apiClient.uploadHomepageImage(
        sectionName,
        imageKey,
        file,
        title,
        title
      );

      if (result.success) {
        const uploadedImageUrl = result.data.imageUrl;
        setImage(uploadedImageUrl);
        setIsEditing(false);
        setSaveMessage('✅ Image uploaded successfully');
        onImageUpdate?.(uploadedImageUrl);
        
        // Clear message after 3 seconds
        setTimeout(() => setSaveMessage(''), 3000);
      } else {
        setSaveMessage(`❌ ${result.message || 'Upload failed'}`);
      }
    } catch (error) {
      console.error('Image upload error:', error);
      setSaveMessage('❌ Failed to upload image');
    } finally {
      setIsUploading(false);
      // Reset file input
      e.target.value = '';
    }
  };

  return (
    <div className={`border border-gray-200 rounded-lg p-4 ${compact ? 'space-y-3' : 'space-y-4'}`}>
      <div className="flex items-center justify-between">
        <h3 className={`font-medium text-gray-900 ${compact ? 'text-sm' : ''}`}>{title}</h3>
        <div className="flex items-center space-x-2">
          {saveMessage && (
            <span className={`text-xs ${saveMessage.includes('✅') ? 'text-green-600' : 'text-red-600'}`}>
              {saveMessage}
            </span>
          )}
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium whitespace-nowrap"
            disabled={isUploading}
          >
            <i className="ri-edit-line w-4 h-4 flex items-center justify-center mr-1"></i>
            Edit
          </button>
        </div>
      </div>

      <div className={`relative ${compact ? 'h-32' : 'h-48'} bg-gray-100 rounded-lg overflow-hidden`}>
        {isUploading ? (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="text-white text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
              <div className="text-sm">Uploading...</div>
            </div>
          </div>
        ) : (
          <>
            <img
              src={image}
              alt={title}
              className="w-full h-full object-cover"
              onError={(e) => {
                // Fallback to default image on error
                e.currentTarget.src = 'https://images.unsplash.com/photo-1534452203293-494d7ddbf7e0?w=400&h=200&fit=crop&crop=center';
              }}
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-opacity flex items-center justify-center opacity-0 hover:opacity-100">
              <div className="text-white text-sm font-medium">Click Edit to change</div>
            </div>
          </>
        )}
      </div>

      {isEditing && (
        <div className="space-y-3 border-t border-gray-200 pt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload New Image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              disabled={isUploading}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50"
            />
            <p className="text-xs text-gray-500 mt-1">
              Supported formats: JPEG, PNG, GIF, WebP (max 10MB)
            </p>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">or</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Image URL
            </label>
            <div className="flex space-x-2">
              <input
                type="url"
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isUploading}
              />
              <button
                onClick={handleImageUrlUpdate}
                disabled={isUploading || !newImageUrl.trim()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium whitespace-nowrap disabled:opacity-50"
              >
                {isUploading ? 'Updating...' : 'Update'}
              </button>
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <button
              onClick={() => {
                setIsEditing(false);
                setNewImageUrl('');
                setSaveMessage('');
              }}
              className="px-3 py-1 text-gray-600 hover:text-gray-800 text-sm whitespace-nowrap"
              disabled={isUploading}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
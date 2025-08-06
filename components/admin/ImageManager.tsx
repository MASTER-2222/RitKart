'use client';
import { useState } from 'react';

interface ImageManagerProps {
  title: string;
  currentImage: string;
  compact?: boolean;
}

export default function ImageManager({ title, currentImage, compact = false }: ImageManagerProps) {
  const [image, setImage] = useState(currentImage);
  const [isEditing, setIsEditing] = useState(false);
  const [newImageUrl, setNewImageUrl] = useState('');

  const handleImageUpdate = () => {
    if (newImageUrl.trim()) {
      setImage(newImageUrl);
      setNewImageUrl('');
      setIsEditing(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // In a real application, you would upload to your server
      const reader = new FileReader();
      reader.onload = (e) => {
        setImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className={`border border-gray-200 rounded-lg p-4 ${compact ? 'space-y-3' : 'space-y-4'}`}>
      <div className="flex items-center justify-between">
        <h3 className={`font-medium text-gray-900 ${compact ? 'text-sm' : ''}`}>{title}</h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium whitespace-nowrap"
          >
            <i className="ri-edit-line w-4 h-4 flex items-center justify-center mr-1"></i>
            Edit
          </button>
        </div>
      </div>

      <div className={`relative ${compact ? 'h-32' : 'h-48'} bg-gray-100 rounded-lg overflow-hidden`}>
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-opacity flex items-center justify-center opacity-0 hover:opacity-100">
          <div className="text-white text-sm font-medium">Click to change</div>
        </div>
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
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
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
              />
              <button
                onClick={handleImageUpdate}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium whitespace-nowrap"
              >
                Update
              </button>
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <button
              onClick={() => setIsEditing(false)}
              className="px-3 py-1 text-gray-600 hover:text-gray-800 text-sm whitespace-nowrap"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
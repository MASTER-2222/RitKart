'use client';
import React, { useState, useCallback } from 'react';

interface ImageUploadProps {
  images: File[];
  onImagesChange: (images: File[]) => void;
  maxImages?: number;
  maxSizePerFile?: number; // in MB
}

export default function ImageUpload({ 
  images, 
  onImagesChange, 
  maxImages = 5, 
  maxSizePerFile = 20 
}: ImageUploadProps) {
  const [dragOver, setDragOver] = useState(false);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  // Generate preview URLs when images change
  React.useEffect(() => {
    const urls = images.map(file => URL.createObjectURL(file));
    setPreviewUrls(urls);
    
    // Cleanup old URLs
    return () => {
      urls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [images]);

  const handleFileSelect = useCallback((files: FileList | null) => {
    if (!files) return;

    const newFiles = Array.from(files);
    const validFiles: File[] = [];
    const errors: string[] = [];

    // Validate each file
    newFiles.forEach(file => {
      // Check if it's an image
      if (!file.type.startsWith('image/')) {
        errors.push(`${file.name} is not an image file`);
        return;
      }

      // Check file size (convert MB to bytes)
      if (file.size > maxSizePerFile * 1024 * 1024) {
        errors.push(`${file.name} is too large (max ${maxSizePerFile}MB)`);
        return;
      }

      validFiles.push(file);
    });

    // Check total image limit
    const totalImages = images.length + validFiles.length;
    if (totalImages > maxImages) {
      errors.push(`Maximum ${maxImages} images allowed`);
      const allowedCount = maxImages - images.length;
      validFiles.splice(allowedCount);
    }

    // Show errors if any
    if (errors.length > 0) {
      alert(errors.join('\n'));
    }

    // Add valid files to existing images
    if (validFiles.length > 0) {
      onImagesChange([...images, ...validFiles]);
    }
  }, [images, onImagesChange, maxImages, maxSizePerFile]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const removeImage = useCallback((index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
  }, [images, onImagesChange]);

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragOver 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <div className="space-y-2">
          <div className="text-gray-400 text-4xl">
            📸
          </div>
          <div>
            <label htmlFor="image-upload" className="cursor-pointer">
              <span className="text-blue-600 hover:text-blue-500 font-medium">
                Click to upload images
              </span>
              <span className="text-gray-500"> or drag and drop</span>
            </label>
            <input
              id="image-upload"
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFileSelect(e.target.files)}
            />
          </div>
          <p className="text-sm text-gray-500">
            PNG, JPG, GIF up to {maxSizePerFile}MB each (max {maxImages} images)
          </p>
        </div>
      </div>

      {/* Image Previews */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {previewUrls.map((url, index) => (
            <div key={index} className="relative group">
              <img
                src={url}
                alt={`Preview ${index + 1}`}
                className="w-full h-24 object-cover rounded-lg border"
              />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600 transition-colors"
              >
                ×
              </button>
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 rounded-lg flex items-center justify-center">
                <span className="text-white opacity-0 group-hover:opacity-100 text-xs font-medium">
                  {(images[index].size / (1024 * 1024)).toFixed(1)}MB
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Progress Info */}
      <div className="flex justify-between text-sm text-gray-500">
        <span>{images.length} of {maxImages} images selected</span>
        <span>
          Total: {(images.reduce((sum, file) => sum + file.size, 0) / (1024 * 1024)).toFixed(1)}MB
        </span>
      </div>
    </div>
  );
}
'use client';
import React, { useState, useEffect } from 'react';
import apiClient from '../../../utils/api';

interface HeroBanner {
  id: string;
  title: string;
  subtitle: string;
  image_url: string;
  button_text: string;
  button_link: string;
  sort_order: number;
  is_active: boolean;
}

interface BannerEditProps {
  banner: HeroBanner;
  onUpdate: (bannerId: string, data: Partial<HeroBanner>) => void;
  onSave: (bannerId: string) => void;
  onUpload: (bannerId: string, file: File) => void;
  saving: string | null;
  uploading: string | null;
}

const BannerEdit: React.FC<BannerEditProps> = ({ banner, onUpdate, onSave, onUpload, saving, uploading }) => {
  const [localData, setLocalData] = useState({
    title: banner.title,
    subtitle: banner.subtitle,
    image_url: banner.image_url,
    button_text: banner.button_text,
    button_link: banner.button_link
  });
  const [dragActive, setDragActive] = useState(false);

  const handleChange = (field: string, value: string) => {
    setLocalData(prev => ({ ...prev, [field]: value }));
    onUpdate(banner.id, { [field]: value });
  };

  const handleSave = () => {
    onSave(banner.id);
  };

  const handleFileUpload = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      onUpload(banner.id, file);
    } else {
      alert('Please select a valid image file (JPEG, PNG, GIF, WebP)');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          Banner {banner.sort_order}
        </h3>
        <button
          onClick={handleSave}
          disabled={saving === banner.id}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            saving === banner.id
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          {saving === banner.id ? (
            <span className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Saving...
            </span>
          ) : (
            'Save Changes'
          )}
        </button>
      </div>

      {/* Hero Image Preview */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Preview</label>
        <div 
          className="w-full h-32 bg-cover bg-center rounded-lg border relative"
          style={{ backgroundImage: `url(${localData.image_url})` }}
        >
          <div className="absolute inset-0 bg-black bg-opacity-40 rounded-lg flex items-center justify-center">
            <div className="text-center text-white">
              <h4 className="text-sm font-bold">{localData.title}</h4>
              <p className="text-xs mt-1">{localData.subtitle}</p>
              <button className="bg-yellow-500 text-black px-3 py-1 rounded mt-2 text-xs font-medium">
                {localData.button_text}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Form Fields */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Hero Title</label>
          <input
            type="text"
            value={localData.title}
            onChange={(e) => handleChange('title', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter hero title..."
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Button Text</label>
          <input
            type="text"
            value={localData.button_text}
            onChange={(e) => handleChange('button_text', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g., Shop Now"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Hero Subtitle</label>
        <textarea
          value={localData.subtitle}
          onChange={(e) => handleChange('subtitle', e.target.value)}
          rows={2}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          placeholder="Enter hero subtitle..."
        />
      </div>

      <div className="space-y-4">
        <label className="block text-sm font-medium text-gray-700">Background Image</label>
        
        {/* URL Input Method */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Option 1: Image URL</label>
          <input
            type="url"
            value={localData.image_url}
            onChange={(e) => handleChange('image_url', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="https://example.com/image.jpg"
          />
        </div>

        {/* Upload Method */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Option 2: Upload Image</label>
          <div
            onDrop={handleDrop}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
              dragActive 
                ? 'border-blue-400 bg-blue-50' 
                : uploading === banner.id
                ? 'border-gray-300 bg-gray-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            {uploading === banner.id ? (
              <div className="space-y-2">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-sm text-gray-600">Uploading image...</p>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex justify-center">
                  <i className="ri-upload-cloud-2-line text-3xl text-gray-400"></i>
                </div>
                <div>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium text-blue-600 hover:text-blue-500 cursor-pointer">
                      Click to upload
                    </span> or drag and drop
                  </p>
                  <p className="text-xs text-gray-500">PNG, JPG, GIF, WebP up to 10MB</p>
                </div>
              </div>
            )}
            
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileUpload(file);
              }}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              disabled={uploading === banner.id}
            />
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Button Link</label>
        <input
          type="text"
          value={localData.button_link}
          onChange={(e) => handleChange('button_link', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="e.g., /category/fashion or /deals"
        />
      </div>
    </div>
  );
};

export default function HeroBannersManagement() {
  const [banners, setBanners] = useState<HeroBanner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [saving, setSaving] = useState<string | null>(null);
  const [uploading, setUploading] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<string>('');
  const [pendingUpdates, setPendingUpdates] = useState<Record<string, Partial<HeroBanner>>>({});

  useEffect(() => {
    loadBanners();
  }, []);

  const loadBanners = async () => {
    try {
      setLoading(true);
      setError('');
      const result = await apiClient.getBanners();
      
      if (result.success) {
        setBanners(result.data || []);
      } else {
        setError(result.message || 'Failed to load hero banners');
      }
    } catch (err) {
      console.error('Load banners error:', err);
      setError('Failed to load hero banners');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateBanner = (bannerId: string, updates: Partial<HeroBanner>) => {
    setPendingUpdates(prev => ({
      ...prev,
      [bannerId]: { ...prev[bannerId], ...updates }
    }));
  };

  const handleSaveBanner = async (bannerId: string) => {
    try {
      setSaving(bannerId);
      setSaveMessage('');
      
      const updates = pendingUpdates[bannerId];
      if (!updates) {
        setSaveMessage('No changes to save');
        return;
      }

      const result = await apiClient.updateBanner(bannerId, updates);
      
      if (result.success) {
        // Update local state
        setBanners(prev => prev.map(banner => 
          banner.id === bannerId ? { ...banner, ...updates } : banner
        ));
        
        // Clear pending updates
        setPendingUpdates(prev => {
          const newUpdates = { ...prev };
          delete newUpdates[bannerId];
          return newUpdates;
        });
        
        setSaveMessage(`✅ Banner ${banners.find(b => b.id === bannerId)?.sort_order} updated successfully`);
        setTimeout(() => setSaveMessage(''), 3000);
      } else {
        setSaveMessage(`❌ Failed to update banner: ${result.message}`);
        setTimeout(() => setSaveMessage(''), 5000);
      }
    } catch (err) {
      console.error('Save banner error:', err);
      setSaveMessage('❌ Failed to save banner changes');
      setTimeout(() => setSaveMessage(''), 5000);
    } finally {
      setSaving(null);
    }
  };

  const handleUploadImage = async (bannerId: string, file: File) => {
    try {
      setUploading(bannerId);
      setSaveMessage('');
      
      const result = await apiClient.uploadBannerImage(bannerId, file);
      
      if (result.success) {
        // Update local state with new image URL
        setBanners(prev => prev.map(banner => 
          banner.id === bannerId ? { ...banner, image_url: result.data.imageUrl } : banner
        ));
        
        // Clear any pending updates for image_url
        setPendingUpdates(prev => {
          const newUpdates = { ...prev };
          if (newUpdates[bannerId]) {
            delete newUpdates[bannerId].image_url;
            if (Object.keys(newUpdates[bannerId]).length === 0) {
              delete newUpdates[bannerId];
            }
          }
          return newUpdates;
        });
        
        setSaveMessage(`✅ Image uploaded successfully for Banner ${banners.find(b => b.id === bannerId)?.sort_order}`);
        setTimeout(() => setSaveMessage(''), 3000);
      } else {
        setSaveMessage(`❌ Failed to upload image: ${result.message}`);
        setTimeout(() => setSaveMessage(''), 5000);
      }
    } catch (err) {
      console.error('Upload image error:', err);
      setSaveMessage('❌ Failed to upload image');
      setTimeout(() => setSaveMessage(''), 5000);
    } finally {
      setUploading(null);
    }
  };

  const handleRefresh = () => {
    setPendingUpdates({});
    loadBanners();
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading hero banners...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="text-center py-12">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={loadBanners}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Hero Banners Management</h2>
            <p className="text-gray-600 text-sm mt-1">
              Manage your 8 hero banners that appear on the homepage slider
            </p>
          </div>
          <div className="flex items-center space-x-4">
            {saveMessage && (
              <span className={`text-sm ${saveMessage.includes('✅') ? 'text-green-600' : 'text-red-600'}`}>
                {saveMessage}
              </span>
            )}
            <button
              onClick={handleRefresh}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              <i className="ri-refresh-line w-4 h-4 mr-1"></i>
              Refresh
            </button>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center">
              <i className="ri-image-line text-blue-600 text-2xl mr-3"></i>
              <div>
                <p className="text-sm text-gray-600">Total Banners</p>
                <p className="text-xl font-bold text-gray-900">{banners.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center">
              <i className="ri-check-line text-green-600 text-2xl mr-3"></i>
              <div>
                <p className="text-sm text-gray-600">Active Banners</p>
                <p className="text-xl font-bold text-gray-900">
                  {banners.filter(b => b.is_active).length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-yellow-50 rounded-lg p-4">
            <div className="flex items-center">
              <i className="ri-edit-line text-yellow-600 text-2xl mr-3"></i>
              <div>
                <p className="text-sm text-gray-600">Pending Changes</p>
                <p className="text-xl font-bold text-gray-900">
                  {Object.keys(pendingUpdates).length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Banners Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {banners
          .sort((a, b) => a.sort_order - b.sort_order)
          .map((banner) => (
            <BannerEdit
              key={banner.id}
              banner={banner}
              onUpdate={handleUpdateBanner}
              onSave={handleSaveBanner}
              saving={saving}
            />
          ))}
      </div>

      {banners.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <i className="ri-image-line text-gray-400 text-4xl mb-4"></i>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Hero Banners Found</h3>
          <p className="text-gray-600 mb-4">
            It looks like there are no hero banners configured yet.
          </p>
          <button
            onClick={loadBanners}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium"
          >
            Reload Banners
          </button>
        </div>
      )}
    </div>
  );
}
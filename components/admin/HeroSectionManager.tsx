'use client';
import { useState } from 'react';
import DualImageUpload from './DualImageUpload';
import ContentEditor from './ContentEditor';

interface Banner {
  id: string;
  title: string;
  subtitle?: string;
  image_url: string;
  button_text?: string;
  button_link?: string;
  is_active: boolean;
}

interface HeroSectionManagerProps {
  banners: Banner[];
  onUpdate: () => void;
}

export default function HeroSectionManager({ banners, onUpdate }: HeroSectionManagerProps) {
  const [editingBanner, setEditingBanner] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);

  const [newBanner, setNewBanner] = useState({
    title: '',
    subtitle: '',
    image_url: '',
    button_text: 'Shop Now',
    button_link: '/',
    is_active: true
  });

  const handleUpdateBanner = async (bannerId: string, bannerData: any) => {
    try {
      setLoading(bannerId);
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8001/api'}/admin/homepage/hero/${bannerId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(bannerData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        setEditingBanner(null);
        onUpdate(); // Refresh parent data
      } else {
        throw new Error(result.message || 'Failed to update banner');
      }
    } catch (error) {
      console.error('Error updating banner:', error);
      alert('Failed to update banner. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  const handleCreateBanner = async () => {
    if (!newBanner.title || !newBanner.image_url) {
      alert('Please provide at least title and image URL');
      return;
    }

    try {
      setLoading('creating');
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8001/api'}/admin/homepage/hero`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(newBanner)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        setShowAddForm(false);
        setNewBanner({
          title: '',
          subtitle: '',
          image_url: '',
          button_text: 'Shop Now',
          button_link: '/',
          is_active: true
        });
        onUpdate(); // Refresh parent data
      } else {
        throw new Error(result.message || 'Failed to create banner');
      }
    } catch (error) {
      console.error('Error creating banner:', error);
      alert('Failed to create banner. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  const handleDeleteBanner = async (bannerId: string) => {
    if (!confirm('Are you sure you want to delete this banner?')) {
      return;
    }

    try {
      setLoading(bannerId);
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8001/api'}/admin/homepage/hero/${bannerId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        onUpdate(); // Refresh parent data
      } else {
        throw new Error(result.message || 'Failed to delete banner');
      }
    } catch (error) {
      console.error('Error deleting banner:', error);
      alert('Failed to delete banner. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Hero Section Banners</h3>
          <p className="text-sm text-gray-600">
            Manage the rotating banners displayed on your homepage. You have {banners.length} banners configured.
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center"
        >
          <i className="ri-add-line w-4 h-4 flex items-center justify-center mr-2"></i>
          Add Banner
        </button>
      </div>

      {/* Add New Banner Form */}
      {showAddForm && (
        <div className="border border-blue-200 bg-blue-50 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-gray-900">Add New Banner</h4>
            <button
              onClick={() => setShowAddForm(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <i className="ri-close-line w-5 h-5 flex items-center justify-center"></i>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
              <input
                type="text"
                value={newBanner.title}
                onChange={(e) => setNewBanner(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter banner title"
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle</label>
              <input
                type="text"
                value={newBanner.subtitle}
                onChange={(e) => setNewBanner(prev => ({ ...prev, subtitle: e.target.value }))}
                placeholder="Enter banner subtitle"
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Button Text</label>
              <input
                type="text"
                value={newBanner.button_text}
                onChange={(e) => setNewBanner(prev => ({ ...prev, button_text: e.target.value }))}
                placeholder="Enter button text"
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Button Link</label>
              <input
                type="text"
                value={newBanner.button_link}
                onChange={(e) => setNewBanner(prev => ({ ...prev, button_link: e.target.value }))}
                placeholder="Enter button link"
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Image URL *</label>
            <input
              type="url"
              value={newBanner.image_url}
              onChange={(e) => setNewBanner(prev => ({ ...prev, image_url: e.target.value }))}
              placeholder="https://example.com/image.jpg"
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateBanner}
              disabled={loading === 'creating'}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
            >
              {loading === 'creating' ? 'Creating...' : 'Create Banner'}
            </button>
          </div>
        </div>
      )}

      {/* Existing Banners */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {banners.map((banner) => (
          <div key={banner.id} className="border border-gray-200 rounded-lg p-4 bg-white">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h4 className="font-semibold text-gray-900">{banner.title}</h4>
                {banner.subtitle && (
                  <p className="text-sm text-gray-600">{banner.subtitle}</p>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 text-xs rounded-full ${
                  banner.is_active 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {banner.is_active ? 'Active' : 'Inactive'}
                </span>
                <button
                  onClick={() => setEditingBanner(editingBanner === banner.id ? null : banner.id)}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  <i className="ri-edit-line w-4 h-4 flex items-center justify-center"></i>
                </button>
                <button
                  onClick={() => handleDeleteBanner(banner.id)}
                  disabled={loading === banner.id}
                  className="text-red-600 hover:text-red-800 text-sm font-medium disabled:opacity-50"
                >
                  <i className="ri-delete-bin-line w-4 h-4 flex items-center justify-center"></i>
                </button>
              </div>
            </div>

            <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden mb-3">
              <img
                src={banner.image_url}
                alt={banner.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = 'https://images.unsplash.com/photo-1534452203293-494d7ddbf7e0?w=600&h=300&fit=crop&crop=center';
                }}
              />
            </div>

            {editingBanner === banner.id && (
              <BannerEditForm 
                banner={banner}
                onSave={(data) => handleUpdateBanner(banner.id, data)}
                onCancel={() => setEditingBanner(null)}
                loading={loading === banner.id}
              />
            )}

            <div className="text-sm text-gray-600">
              <div className="flex items-center">
                <span className="font-medium">Button:</span>
                <span className="ml-2">{banner.button_text} → {banner.button_link}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {banners.length === 0 && (
        <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
          <i className="ri-image-line w-12 h-12 flex items-center justify-center text-gray-400 mx-auto mb-4 text-4xl"></i>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Hero Banners</h3>
          <p className="text-gray-600 mb-4">Get started by creating your first hero banner.</p>
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Create First Banner
          </button>
        </div>
      )}
    </div>
  );
}

// Banner Edit Form Component
function BannerEditForm({ banner, onSave, onCancel, loading }: any) {
  const [formData, setFormData] = useState({
    title: banner.title,
    subtitle: banner.subtitle || '',
    image_url: banner.image_url,
    button_text: banner.button_text || 'Shop Now',
    button_link: banner.button_link || '/',
    is_active: banner.is_active
  });

  const handleSave = () => {
    if (!formData.title || !formData.image_url) {
      alert('Please provide at least title and image URL');
      return;
    }
    onSave(formData);
  };

  return (
    <div className="border-t border-gray-200 pt-4 mt-4">
      <div className="grid grid-cols-1 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle</label>
          <input
            type="text"
            value={formData.subtitle}
            onChange={(e) => setFormData(prev => ({ ...prev, subtitle: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
          <input
            type="url"
            value={formData.image_url}
            onChange={(e) => setFormData(prev => ({ ...prev, image_url: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Button Text</label>
            <input
              type="text"
              value={formData.button_text}
              onChange={(e) => setFormData(prev => ({ ...prev, button_text: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Button Link</label>
            <input
              type="text"
              value={formData.button_link}
              onChange={(e) => setFormData(prev => ({ ...prev, button_link: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <div className="flex items-center">
          <input
            type="checkbox"
            id="is_active"
            checked={formData.is_active}
            onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
            Banner is active
          </label>
        </div>
      </div>

      <div className="flex justify-end space-x-3 mt-4">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}
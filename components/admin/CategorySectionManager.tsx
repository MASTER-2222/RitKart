'use client';
import { useState } from 'react';
import DualImageUpload from './DualImageUpload';

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image_url: string;
  is_active: boolean;
}

interface CategorySectionManagerProps {
  categories: Category[];
  onUpdate: () => void;
}

export default function CategorySectionManager({ categories, onUpdate }: CategorySectionManagerProps) {
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState<string | null>(null);

  const handleUpdateCategory = async (categoryId: string, categoryData: any) => {
    try {
      setLoading(categoryId);
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8001/api'}/admin/homepage/category/${categoryId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(categoryData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        setEditingCategory(null);
        onUpdate(); // Refresh parent data
      } else {
        throw new Error(result.message || 'Failed to update category');
      }
    } catch (error) {
      console.error('Error updating category:', error);
      alert('Failed to update category. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Shop by Category Section</h3>
          <p className="text-sm text-gray-600">
            Manage the category cards displayed in the "Shop by Category" section. You have {categories.length} categories configured.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => (
          <div key={category.id} className="border border-gray-200 rounded-lg p-4 bg-white">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h4 className="font-semibold text-gray-900">{category.name}</h4>
                <p className="text-sm text-gray-600">/{category.slug}</p>
                {category.description && (
                  <p className="text-sm text-gray-500 mt-1">{category.description}</p>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 text-xs rounded-full ${
                  category.is_active 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {category.is_active ? 'Active' : 'Inactive'}
                </span>
                <button
                  onClick={() => setEditingCategory(editingCategory === category.id ? null : category.id)}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  <i className="ri-edit-line w-4 h-4 flex items-center justify-center"></i>
                </button>
              </div>
            </div>

            <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-3">
              <img
                src={category.image_url}
                alt={category.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = `https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=300&h=300&fit=crop&crop=center`;
                }}
              />
            </div>

            {editingCategory === category.id && (
              <CategoryEditForm 
                category={category}
                onSave={(data) => handleUpdateCategory(category.id, data)}
                onCancel={() => setEditingCategory(null)}
                loading={loading === category.id}
              />
            )}
          </div>
        ))}
      </div>

      {categories.length === 0 && (
        <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
          <i className="ri-folder-line w-12 h-12 flex items-center justify-center text-gray-400 mx-auto mb-4 text-4xl"></i>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Categories</h3>
          <p className="text-gray-600 mb-4">Categories are automatically managed by your product catalog.</p>
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <i className="ri-information-line w-5 h-5 flex items-center justify-center text-blue-600 mr-3 mt-0.5"></i>
          <div>
            <h4 className="text-sm font-semibold text-blue-900 mb-1">Category Management</h4>
            <p className="text-sm text-blue-700">
              Categories are automatically generated based on your product catalog. You can edit the display name, description, and image for each category to customize how they appear on your homepage.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Category Edit Form Component
function CategoryEditForm({ category, onSave, onCancel, loading }: any) {
  const [formData, setFormData] = useState({
    name: category.name,
    description: category.description || '',
    image_url: category.image_url,
    is_active: category.is_active
  });

  const handleSave = () => {
    if (!formData.name || !formData.image_url) {
      alert('Please provide at least category name and image URL');
      return;
    }
    onSave(formData);
  };

  return (
    <div className="border-t border-gray-200 pt-4 mt-4">
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Category Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            placeholder="Brief description of the category"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
          <input
            type="url"
            value={formData.image_url}
            onChange={(e) => setFormData(prev => ({ ...prev, image_url: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="https://example.com/category-image.jpg"
          />
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id={`category_active_${category.id}`}
            checked={formData.is_active}
            onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor={`category_active_${category.id}`} className="ml-2 block text-sm text-gray-900">
            Show category on homepage
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
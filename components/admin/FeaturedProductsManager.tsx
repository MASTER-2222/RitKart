'use client';
import { useState } from 'react';
import DualImageUpload from './DualImageUpload';

interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  original_price?: number;
  images: string[];
  brand?: string;
  category_name?: string;
  is_featured: boolean;
  is_active: boolean;
  stock_quantity: number;
  rating_average?: number;
  total_reviews?: number;
  sku?: string;
}

interface FeaturedProductsManagerProps {
  products: Product[];
  onUpdate: () => void;
}

export default function FeaturedProductsManager({ products, onUpdate }: FeaturedProductsManagerProps) {
  const [editingProduct, setEditingProduct] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);

  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: 0,
    original_price: 0,
    images: [''],
    brand: '',
    stock_quantity: 0,
    is_featured: true
  });

  const handleUpdateProduct = async (productId: string, productData: any) => {
    try {
      setLoading(productId);
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8001/api'}/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(productData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        setEditingProduct(null);
        onUpdate(); // Refresh parent data
      } else {
        throw new Error(result.message || 'Failed to update product');
      }
    } catch (error) {
      console.error('Error updating product:', error);
      alert('Failed to update product. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  const handleCreateProduct = async () => {
    if (!newProduct.name || !newProduct.images[0]) {
      alert('Please provide at least product name and image');
      return;
    }

    try {
      setLoading('creating');
      
      // For simplicity, we'll set a default category_id and sku
      const productPayload = {
        ...newProduct,
        category_id: '550e8400-e29b-41d4-a716-446655440001', // Default category
        sku: `SKU-${Date.now()}`, // Auto-generate SKU
        is_active: true
      };
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8001/api'}/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(productPayload)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        setShowAddForm(false);
        setNewProduct({
          name: '',
          description: '',
          price: 0,
          original_price: 0,
          images: [''],
          brand: '',
          stock_quantity: 0,
          is_featured: true
        });
        onUpdate(); // Refresh parent data
      } else {
        throw new Error(result.message || 'Failed to create product');
      }
    } catch (error) {
      console.error('Error creating product:', error);
      alert('Failed to create product. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product? This will remove it from your store permanently.')) {
      return;
    }

    try {
      setLoading(productId);
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8001/api'}/products/${productId}`, {
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
        throw new Error(result.message || 'Failed to delete product');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Failed to delete product. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  const handleToggleFeatured = async (productId: string, currentStatus: boolean) => {
    try {
      setLoading(productId);
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8001/api'}/admin/homepage/featured/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ is_featured: !currentStatus })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        onUpdate(); // Refresh parent data
      } else {
        throw new Error(result.message || 'Failed to update featured status');
      }
    } catch (error) {
      console.error('Error updating featured status:', error);
      alert('Failed to update featured status. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const featuredProducts = products.filter(p => p.is_featured);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Featured Products Section</h3>
          <p className="text-sm text-gray-600">
            Manage products displayed in the "Featured Products" section. You have {featuredProducts.length} featured products configured.
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center"
        >
          <i className="ri-add-line w-4 h-4 flex items-center justify-center mr-2"></i>
          Add Product
        </button>
      </div>

      {/* Add New Product Form */}
      {showAddForm && (
        <div className="border border-blue-200 bg-blue-50 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-gray-900">Add New Featured Product</h4>
            <button
              onClick={() => setShowAddForm(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <i className="ri-close-line w-5 h-5 flex items-center justify-center"></i>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
              <input
                type="text"
                value={newProduct.name}
                onChange={(e) => setNewProduct(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter product name"
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
              <input
                type="text"
                value={newProduct.brand}
                onChange={(e) => setNewProduct(prev => ({ ...prev, brand: e.target.value }))}
                placeholder="Enter brand name"
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price *</label>
              <input
                type="number"
                value={newProduct.price}
                onChange={(e) => setNewProduct(prev => ({ ...prev, price: Number(e.target.value) }))}
                placeholder="Enter price"
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Stock Quantity</label>
              <input
                type="number"
                value={newProduct.stock_quantity}
                onChange={(e) => setNewProduct(prev => ({ ...prev, stock_quantity: Number(e.target.value) }))}
                placeholder="Enter stock quantity"
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={newProduct.description}
              onChange={(e) => setNewProduct(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Enter product description"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          <div className="mb-4">
            <DualImageUpload
              currentImageUrl={newProduct.images[0]}
              imageType="product"
              onImageChange={(imageUrl) => setNewProduct(prev => ({ ...prev, images: [imageUrl] }))}
              label="Product Image"
              required={true}
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
              onClick={handleCreateProduct}
              disabled={loading === 'creating'}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
            >
              {loading === 'creating' ? 'Creating...' : 'Create Product'}
            </button>
          </div>
        </div>
      )}

      {/* Featured Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {featuredProducts.map((product) => (
          <div key={product.id} className="border border-gray-200 rounded-lg p-4 bg-white">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 text-sm line-clamp-2" title={product.name}>
                  {product.name}
                </h4>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-lg font-bold text-blue-600">
                    {formatPrice(product.price)}
                  </span>
                  {product.rating_average && (
                    <div className="flex items-center">
                      <i className="ri-star-fill w-4 h-4 flex items-center justify-center text-yellow-400"></i>
                      <span className="text-sm text-gray-600 ml-1">
                        {product.rating_average.toFixed(1)}
                      </span>
                    </div>
                  )}
                </div>
                {product.brand && (
                  <p className="text-xs text-gray-500 mt-1">{product.brand}</p>
                )}
              </div>
              
              <div className="flex items-center space-x-2 ml-2">
                <span className={`px-2 py-1 text-xs rounded-full ${
                  product.is_featured 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  Featured
                </span>
                <button
                  onClick={() => setEditingProduct(editingProduct === product.id ? null : product.id)}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  <i className="ri-edit-line w-4 h-4 flex items-center justify-center"></i>
                </button>
                <button
                  onClick={() => handleToggleFeatured(product.id, product.is_featured)}
                  disabled={loading === product.id}
                  className="text-orange-600 hover:text-orange-800 text-sm font-medium disabled:opacity-50"
                  title="Remove from featured"
                >
                  <i className="ri-star-off-line w-4 h-4 flex items-center justify-center"></i>
                </button>
                <button
                  onClick={() => handleDeleteProduct(product.id)}
                  disabled={loading === product.id}
                  className="text-red-600 hover:text-red-800 text-sm font-medium disabled:opacity-50"
                >
                  <i className="ri-delete-bin-line w-4 h-4 flex items-center justify-center"></i>
                </button>
              </div>
            </div>

            <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-3">
              <img
                src={product.images[0] || 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=300&h=300&fit=crop&crop=center'}
                alt={product.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=300&h=300&fit=crop&crop=center';
                }}
              />
            </div>

            {editingProduct === product.id && (
              <ProductEditForm 
                product={product}
                onSave={(data) => handleUpdateProduct(product.id, data)}
                onCancel={() => setEditingProduct(null)}
                loading={loading === product.id}
              />
            )}

            <div className="text-xs text-gray-500 space-y-1">
              {product.category_name && (
                <div className="flex items-center justify-between">
                  <span>Category:</span>
                  <span className="font-medium">{product.category_name}</span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span>Stock:</span>
                <span className="font-medium">{product.stock_quantity}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>ID:</span>
                <span className="font-mono text-xs">{product.id.substring(0, 8)}...</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* All Products (for adding to featured) */}
      <div className="border-t border-gray-200 pt-6">
        <h4 className="text-md font-semibold text-gray-900 mb-4">
          All Products - Make Featured
          <span className="text-sm font-normal text-gray-600 ml-2">
            ({products.filter(p => !p.is_featured && p.is_active).length} available)
          </span>
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {products
            .filter(p => !p.is_featured && p.is_active)
            .slice(0, 8) // Show only first 8 for space
            .map((product) => (
            <div key={product.id} className="border border-gray-200 rounded-lg p-3 bg-gray-50">
              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-2">
                <img
                  src={product.images[0] || 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=200&h=200&fit=crop&crop=center'}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=200&h=200&fit=crop&crop=center';
                  }}
                />
              </div>
              <h5 className="font-medium text-gray-900 text-sm line-clamp-2 mb-1" title={product.name}>
                {product.name}
              </h5>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-gray-900">
                  {formatPrice(product.price)}
                </span>
                <button
                  onClick={() => handleToggleFeatured(product.id, product.is_featured)}
                  disabled={loading === product.id}
                  className="bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-medium px-2 py-1 rounded transition-colors disabled:opacity-50"
                >
                  {loading === product.id ? 'Adding...' : 'Make Featured'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {products.filter(p => !p.is_featured && p.is_active).length > 8 && (
          <p className="text-sm text-gray-600 mt-3 text-center">
            {(() => {
              const remainingCount = products.filter(p => !p.is_featured && p.is_active).length - 8;
              return remainingCount > 0 ? `And ${remainingCount} more products available...` : '';
            })()}
          </p>
        )}
      </div>

      {featuredProducts.length === 0 && (
        <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
          <i className="ri-star-line w-12 h-12 flex items-center justify-center text-gray-400 mx-auto mb-4 text-4xl"></i>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Featured Products</h3>
          <p className="text-gray-600 mb-4">Create new products or mark existing products as featured to display them here.</p>
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Create First Product
          </button>
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <i className="ri-star-line w-5 h-5 flex items-center justify-center text-blue-600 mr-3 mt-0.5"></i>
          <div>
            <h4 className="text-sm font-semibold text-blue-900 mb-1">Featured Products Management</h4>
            <p className="text-sm text-blue-700">
              You can create new products, edit existing ones, and control which products appear in the "Featured Products" carousel on your homepage. Featured products get more visibility and typically have higher conversion rates. You can also upload custom images using either URL or browse options.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Product Edit Form Component
function ProductEditForm({ product, onSave, onCancel, loading }: any) {
  const [formData, setFormData] = useState({
    name: product.name,
    description: product.description || '',
    price: product.price,
    original_price: product.original_price || product.price,
    images: product.images,
    brand: product.brand || '',
    stock_quantity: product.stock_quantity,
    is_active: product.is_active
  });

  const handleSave = () => {
    if (!formData.name || !formData.images[0]) {
      alert('Please provide at least product name and image');
      return;
    }
    onSave(formData);
  };

  return (
    <div className="border-t border-gray-200 pt-4 mt-4">
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
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
            placeholder="Brief description of the product"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
            <input
              type="number"
              value={formData.price}
              onChange={(e) => setFormData(prev => ({ ...prev, price: Number(e.target.value) }))}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
            <input
              type="number"
              value={formData.stock_quantity}
              onChange={(e) => setFormData(prev => ({ ...prev, stock_quantity: Number(e.target.value) }))}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
          <input
            type="text"
            value={formData.brand}
            onChange={(e) => setFormData(prev => ({ ...prev, brand: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div>
          <DualImageUpload
            currentImageUrl={formData.images[0]}
            imageType="product"
            onImageChange={(imageUrl) => setFormData(prev => ({ ...prev, images: [imageUrl] }))}
            label="Product Image"
            required={true}
          />
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id={`product_active_${product.id}`}
            checked={formData.is_active}
            onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor={`product_active_${product.id}`} className="ml-2 block text-sm text-gray-900">
            Product is active in store
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
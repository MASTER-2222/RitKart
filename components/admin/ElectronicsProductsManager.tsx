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
  stock_quantity: number;
  rating_average?: number;
  total_reviews?: number;
  is_bestseller?: boolean;
  is_active?: boolean;
  sku?: string;
}

interface ElectronicsProductsManagerProps {
  products: Product[];
  onUpdate: () => void;
}

export default function ElectronicsProductsManager({ products, onUpdate }: ElectronicsProductsManagerProps) {
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
    stock_quantity: 1,
    is_bestseller: true,
    is_active: true
  });

  const handleUpdateProduct = async (productId: string, productData: any) => {
    try {
      setLoading(productId);
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8001/api'}/admin/homepage/electronics/${productId}/details`, {
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
    if (!newProduct.name || !newProduct.images[0] || newProduct.price <= 0) {
      alert('Please provide at least product name, image, and valid price');
      return;
    }

    try {
      setLoading('creating');
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8001/api'}/admin/homepage/electronics`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(newProduct)
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
          stock_quantity: 1,
          is_bestseller: true,
          is_active: true
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
    if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      return;
    }

    try {
      setLoading(productId);
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8001/api'}/admin/homepage/electronics/${productId}`, {
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

  const handleToggleBestseller = async (productId: string, currentStatus: boolean) => {
    try {
      setLoading(productId);
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8001/api'}/admin/homepage/electronics/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ is_bestseller: !currentStatus })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        onUpdate(); // Refresh parent data
      } else {
        throw new Error(result.message || 'Failed to update bestseller status');
      }
    } catch (error) {
      console.error('Error updating bestseller status:', error);
      alert('Failed to update bestseller status. Please try again.');
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Bestsellers in Electronics Section</h3>
          <p className="text-sm text-gray-600">
            Manage electronics products displayed in the "Bestsellers in Electronics" section. You have {products.length} products configured.
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center"
        >
          <i className="ri-add-line w-4 h-4 flex items-center justify-center mr-2"></i>
          Add Product
        </button>
      </div>

      {/* Add New Product Form */}
      {showAddForm && (
        <div className="border border-purple-200 bg-purple-50 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-gray-900">Add New Electronics Product</h4>
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
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
              <input
                type="text"
                value={newProduct.brand}
                onChange={(e) => setNewProduct(prev => ({ ...prev, brand: e.target.value }))}
                placeholder="Enter brand name"
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹) *</label>
              <input
                type="number"
                value={newProduct.price}
                onChange={(e) => setNewProduct(prev => ({ ...prev, price: Number(e.target.value) }))}
                placeholder="Enter price"
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Original Price (₹)</label>
              <input
                type="number"
                value={newProduct.original_price}
                onChange={(e) => setNewProduct(prev => ({ ...prev, original_price: Number(e.target.value) }))}
                placeholder="Enter original price (optional)"
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Stock Quantity</label>
              <input
                type="number"
                value={newProduct.stock_quantity}
                onChange={(e) => setNewProduct(prev => ({ ...prev, stock_quantity: Number(e.target.value) }))}
                placeholder="Enter stock quantity"
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
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
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
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
              className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
            >
              {loading === 'creating' ? 'Creating...' : 'Create Product'}
            </button>
          </div>
        </div>
      )}

      {/* Existing Products */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <div key={product.id} className="border border-gray-200 rounded-lg p-4 bg-white">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h4 className="font-semibold text-gray-900">{product.name}</h4>
                {product.brand && (
                  <p className="text-sm text-gray-600">{product.brand}</p>
                )}
                <div className="flex items-center mt-1">
                  <span className="text-lg font-bold text-gray-900">
                    {formatPrice(product.price)}
                  </span>
                  {product.original_price && product.original_price > product.price && (
                    <span className="text-sm text-gray-500 line-through ml-2">
                      {formatPrice(product.original_price)}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 text-xs rounded-full ${
                  product.is_bestseller 
                    ? 'bg-purple-100 text-purple-800' 
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {product.is_bestseller ? 'Bestseller' : 'Regular'}
                </span>
                <button
                  onClick={() => setEditingProduct(editingProduct === product.id ? null : product.id)}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  <i className="ri-edit-line w-4 h-4 flex items-center justify-center"></i>
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

            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                <div>Stock: {product.stock_quantity}</div>
                {product.rating_average && (
                  <div className="flex items-center">
                    <i className="ri-star-fill w-4 h-4 flex items-center justify-center text-yellow-400"></i>
                    <span className="ml-1">
                      {product.rating_average.toFixed(1)} ({product.total_reviews})
                    </span>
                  </div>
                )}
              </div>
              <button
                onClick={() => handleToggleBestseller(product.id, product.is_bestseller)}
                disabled={loading === product.id}
                className={`text-sm font-medium px-3 py-1 rounded transition-colors disabled:opacity-50 ${
                  product.is_bestseller
                    ? 'bg-red-50 text-red-700 hover:bg-red-100'
                    : 'bg-purple-50 text-purple-700 hover:bg-purple-100'
                }`}
              >
                {loading === product.id 
                  ? 'Updating...' 
                  : product.is_bestseller 
                    ? 'Remove Bestseller' 
                    : 'Make Bestseller'
                }
              </button>
            </div>
          </div>
        ))}
      </div>

      {products.length === 0 && (
        <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
          <i className="ri-computer-line w-12 h-12 flex items-center justify-center text-gray-400 mx-auto mb-4 text-4xl"></i>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Electronics Products</h3>
          <p className="text-gray-600 mb-4">Get started by creating your first electronics bestseller product.</p>
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Create First Product
          </button>
        </div>
      )}

      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <div className="flex items-start">
          <i className="ri-computer-line w-5 h-5 flex items-center justify-center text-purple-600 mr-3 mt-0.5"></i>
          <div>
            <h4 className="text-sm font-semibold text-purple-900 mb-1">Electronics Bestsellers Management</h4>
            <p className="text-sm text-purple-700">
              You can create, edit, and delete electronics products for your homepage. Each product can have a custom name, description, price, images, and brand. Products marked as bestsellers will appear in the "Bestsellers in Electronics" section on your homepage.
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
    original_price: product.original_price || 0,
    images: product.images,
    brand: product.brand || '',
    stock_quantity: product.stock_quantity,
    is_bestseller: product.is_bestseller,
    is_active: product.is_active ?? true
  });

  const handleSave = () => {
    if (!formData.name || !formData.images[0] || formData.price <= 0) {
      alert('Please provide at least product name, image, and valid price');
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
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
            <input
              type="text"
              value={formData.brand}
              onChange={(e) => setFormData(prev => ({ ...prev, brand: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Stock Quantity</label>
            <input
              type="number"
              value={formData.stock_quantity}
              onChange={(e) => setFormData(prev => ({ ...prev, stock_quantity: Number(e.target.value) }))}
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
            <input
              type="number"
              value={formData.price}
              onChange={(e) => setFormData(prev => ({ ...prev, price: Number(e.target.value) }))}
              min="1"
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Original Price (₹)</label>
            <input
              type="number"
              value={formData.original_price}
              onChange={(e) => setFormData(prev => ({ ...prev, original_price: Number(e.target.value) }))}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
            placeholder="Brief description of the product"
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

        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              id={`product_bestseller_${product.id}`}
              checked={formData.is_bestseller}
              onChange={(e) => setFormData(prev => ({ ...prev, is_bestseller: e.target.checked }))}
              className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
            />
            <label htmlFor={`product_bestseller_${product.id}`} className="ml-2 block text-sm text-gray-900">
              Mark as bestseller
            </label>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id={`product_active_${product.id}`}
              checked={formData.is_active}
              onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
              className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
            />
            <label htmlFor={`product_active_${product.id}`} className="ml-2 block text-sm text-gray-900">
              Product is active
            </label>
          </div>
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
          className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}
'use client';
import { useState } from 'react';
import DualImageUpload from './DualImageUpload';

interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  original_price?: number;
  brand?: string;
  sku?: string;
  stock_quantity?: number;
  category_name?: string;
  category_id?: string;
  rating_average?: number;
  total_reviews?: number;
  features?: string[];
  specifications?: Record<string, string>;
  reviews?: string; // New field for product reviews content
  images?: string[];
  is_active: boolean;
  is_featured?: boolean;
  is_bestseller?: boolean;
}

interface ProductsManagerProps {
  products: Product[];
  onUpdate: () => void;
}

export default function ProductsManager({ products, onUpdate }: ProductsManagerProps) {
  const [editingProduct, setEditingProduct] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Available categories based on user requirements
  const categories = [
    { id: 'all', name: 'All Products', count: products.length },
    { id: 'electronics', name: 'Electronics', slug: 'electronics' },
    { id: 'fashion', name: 'Fashion', slug: 'fashion' },
    { id: 'books', name: 'Books', slug: 'books' },
    { id: 'home', name: 'Home & Gardens', slug: 'home' },
    { id: 'sports', name: 'Sports & Outdoors', slug: 'sports' },
    { id: 'grocery', name: 'Grocery', slug: 'grocery' },
    { id: 'appliances', name: 'Appliances', slug: 'appliances' },
    { id: 'solar', name: 'Solar', slug: 'solar' },
    { id: 'pharmacy', name: 'Pharmacy', slug: 'pharmacy' },
    { id: 'beauty', name: 'Beauty & Personal Care', slug: 'beauty' }
  ];

  // Filter products by category
  const filteredProducts = selectedCategory === 'all' 
    ? products 
    : products.filter(product => {
        const category = categories.find(cat => cat.id === selectedCategory);
        return category && product.category_name?.toLowerCase().includes(category.slug || category.name.toLowerCase());
      });

  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: '',
    original_price: '',
    brand: '',
    sku: '',
    stock_quantity: '',
    category_id: '',
    rating_average: '',
    total_reviews: '',
    features: '',
    specifications: '',
    reviews: '', // New field for product reviews content
    images: [''],
    is_active: true,
    is_featured: false,
    is_bestseller: false
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
    if (!newProduct.name || !newProduct.price) {
      alert('Please provide at least product name and price');
      return;
    }

    try {
      setLoading('creating');
      
      // Process the form data
      const productData = {
        name: newProduct.name,
        description: newProduct.description || '',
        price: parseFloat(newProduct.price),
        original_price: newProduct.original_price ? parseFloat(newProduct.original_price) : null,
        brand: newProduct.brand || '',
        sku: newProduct.sku || `SKU-${Date.now()}`,
        stock_quantity: newProduct.stock_quantity ? parseInt(newProduct.stock_quantity) : 0,
        category_id: newProduct.category_id || 'default-category',
        rating_average: newProduct.rating_average ? parseFloat(newProduct.rating_average) : 0,
        total_reviews: newProduct.total_reviews ? parseInt(newProduct.total_reviews) : 0,
        features: newProduct.features ? newProduct.features.split(',').map(f => f.trim()).filter(f => f) : [],
        specifications: newProduct.specifications ? JSON.parse(`{${newProduct.specifications}}`) : {},
        reviews: newProduct.reviews || '', // Include reviews field
        images: newProduct.images.filter(img => img.trim()),
        is_active: newProduct.is_active,
        is_featured: newProduct.is_featured,
        is_bestseller: newProduct.is_bestseller
      };
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8001/api'}/products`, {
        method: 'POST',
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
        setShowAddForm(false);
        setNewProduct({
          name: '',
          description: '',
          price: '',
          original_price: '',
          brand: '',
          sku: '',
          stock_quantity: '',
          category_id: '',
          rating_average: '',
          total_reviews: '',
          features: '',
          specifications: '',
          reviews: '', // Reset reviews field
          images: [''],
          is_active: true,
          is_featured: false,
          is_bestseller: false
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

  const renderStarRating = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<i key={i} className="ri-star-fill text-yellow-400"></i>);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<i key={i} className="ri-star-half-fill text-yellow-400"></i>);
      } else {
        stars.push(<i key={i} className="ri-star-line text-gray-300"></i>);
      }
    }
    return stars;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Products Management</h3>
          <p className="text-sm text-gray-600">
            Manage all 345 products in your store. Add, edit, delete, and replace content including brands, ratings, descriptions, features, specifications, reviews, and images. You have {products.length} products configured.
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

      {/* Category Filter */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex flex-wrap gap-2">
          <span className="text-sm font-medium text-gray-700 mr-2">Filter by Category:</span>
          {categories.map((category) => {
            const categoryProducts = category.id === 'all' 
              ? products 
              : products.filter(p => {
                  const slug = category.slug || category.name.toLowerCase();
                  return p.category_name?.toLowerCase().includes(slug);
                });
            
            return (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                }`}
              >
                {category.name} ({categoryProducts.length})
              </button>
            );
          })}
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Showing {filteredProducts.length} of {products.length} products
          {selectedCategory !== 'all' && ` in ${categories.find(cat => cat.id === selectedCategory)?.name} category`}
        </p>
      </div>

      {/* Add New Product Form */}
      {showAddForm && (
        <div className="border border-blue-200 bg-blue-50 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-gray-900">Add New Product</h4>
            <button
              onClick={() => setShowAddForm(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <i className="ri-close-line w-5 h-5 flex items-center justify-center"></i>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
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
              <label className="block text-sm font-medium text-gray-700 mb-1">SKU</label>
              <input
                type="text"
                value={newProduct.sku}
                onChange={(e) => setNewProduct(prev => ({ ...prev, sku: e.target.value }))}
                placeholder="Enter SKU"
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price *</label>
              <input
                type="number"
                step="0.01"
                value={newProduct.price}
                onChange={(e) => setNewProduct(prev => ({ ...prev, price: e.target.value }))}
                placeholder="Enter price"
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Original Price</label>
              <input
                type="number"
                step="0.01"
                value={newProduct.original_price}
                onChange={(e) => setNewProduct(prev => ({ ...prev, original_price: e.target.value }))}
                placeholder="Enter original price"
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Stock Quantity</label>
              <input
                type="number"
                value={newProduct.stock_quantity}
                onChange={(e) => setNewProduct(prev => ({ ...prev, stock_quantity: e.target.value }))}
                placeholder="Enter stock quantity"
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Star Rating (0-5)</label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="5"
                value={newProduct.rating_average}
                onChange={(e) => setNewProduct(prev => ({ ...prev, rating_average: e.target.value }))}
                placeholder="Enter rating (e.g., 4.5)"
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Total Reviews</label>
              <input
                type="number"
                value={newProduct.total_reviews}
                onChange={(e) => setNewProduct(prev => ({ ...prev, total_reviews: e.target.value }))}
                placeholder="Enter number of reviews"
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category ID</label>
              <input
                type="text"
                value={newProduct.category_id}
                onChange={(e) => setNewProduct(prev => ({ ...prev, category_id: e.target.value }))}
                placeholder="Enter category ID"
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={newProduct.description}
                onChange={(e) => setNewProduct(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter product description"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Features (comma-separated)</label>
              <textarea
                value={newProduct.features}
                onChange={(e) => setNewProduct(prev => ({ ...prev, features: e.target.value }))}
                placeholder="Feature 1, Feature 2, Feature 3"
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Specifications (JSON format)</label>
              <textarea
                value={newProduct.specifications}
                onChange={(e) => setNewProduct(prev => ({ ...prev, specifications: e.target.value }))}
                placeholder='"Color": "Red", "Size": "Large", "Material": "Cotton"'
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Product Reviews</label>
              <textarea
                value={newProduct.reviews}
                onChange={(e) => setNewProduct(prev => ({ ...prev, reviews: e.target.value }))}
                placeholder="Enter product reviews, customer feedback, or review summary..."
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>
          </div>

          <div className="mb-4">
            <DualImageUpload
              currentImageUrl={newProduct.images[0]}
              imageType="product"
              onImageChange={(imageUrl) => setNewProduct(prev => ({ 
                ...prev, 
                images: [imageUrl, ...prev.images.slice(1)].filter(img => img) 
              }))}
              label="Product Image"
              required={true}
            />
          </div>

          <div className="flex items-center space-x-4 mb-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="new_is_active"
                checked={newProduct.is_active}
                onChange={(e) => setNewProduct(prev => ({ ...prev, is_active: e.target.checked }))}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="new_is_active" className="ml-2 block text-sm text-gray-900">
                Product is active
              </label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="new_is_featured"
                checked={newProduct.is_featured}
                onChange={(e) => setNewProduct(prev => ({ ...prev, is_featured: e.target.checked }))}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="new_is_featured" className="ml-2 block text-sm text-gray-900">
                Featured product
              </label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="new_is_bestseller"
                checked={newProduct.is_bestseller}
                onChange={(e) => setNewProduct(prev => ({ ...prev, is_bestseller: e.target.checked }))}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="new_is_bestseller" className="ml-2 block text-sm text-gray-900">
                Bestseller product
              </label>
            </div>
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

      {/* Existing Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredProducts.map((product) => (
          <div key={product.id} className="border border-gray-200 rounded-lg p-4 bg-white">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 truncate">{product.name}</h4>
                {product.brand && (
                  <p className="text-sm text-blue-600 font-medium">{product.brand}</p>
                )}
                <div className="flex items-center space-x-2 mt-1">
                  <div className="flex items-center">
                    {renderStarRating(product.rating_average || 0)}
                  </div>
                  <span className="text-sm text-gray-600">
                    {product.rating_average?.toFixed(1) || '0.0'} ({product.total_reviews || 0} reviews)
                  </span>
                </div>
              </div>
              <div className="flex items-center space-x-1 ml-2">
                {product.is_featured && (
                  <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">Featured</span>
                )}
                {product.is_bestseller && (
                  <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">Bestseller</span>
                )}
                <span className={`px-2 py-1 text-xs rounded-full ${
                  product.is_active 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {product.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-2 mb-3">
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

            {product.images && product.images.length > 0 && (
              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-3">
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'https://images.unsplash.com/photo-1560393464-5c69a73c5770?w=300&h=300&fit=crop&crop=center';
                  }}
                />
              </div>
            )}

            {editingProduct === product.id && (
              <ProductEditForm 
                product={product}
                onSave={(data) => handleUpdateProduct(product.id, data)}
                onCancel={() => setEditingProduct(null)}
                loading={loading === product.id}
              />
            )}

            <div className="text-sm text-gray-600 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-medium">Price:</span>
                <span className="font-semibold text-green-600">₹{product.price}</span>
              </div>
              {product.original_price && product.original_price > product.price && (
                <div className="flex items-center justify-between">
                  <span className="font-medium">Original:</span>
                  <span className="line-through text-gray-400">₹{product.original_price}</span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="font-medium">Stock:</span>
                <span>{product.stock_quantity || 0}</span>
              </div>
              {product.description && (
                <p className="text-xs text-gray-500 mt-2 line-clamp-2">{product.description}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
          <i className="ri-shopping-bag-line w-12 h-12 flex items-center justify-center text-gray-400 mx-auto mb-4 text-4xl"></i>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {selectedCategory === 'all' ? 'No Products' : `No Products in ${categories.find(cat => cat.id === selectedCategory)?.name}`}
          </h3>
          <p className="text-gray-600 mb-4">
            {selectedCategory === 'all' 
              ? 'Get started by creating your first product.' 
              : 'No products found in this category. Try selecting another category or add a new product.'
            }
          </p>
          {selectedCategory === 'all' && (
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Create First Product
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// Product Edit Form Component
function ProductEditForm({ product, onSave, onCancel, loading }: any) {
  const [formData, setFormData] = useState({
    name: product.name,
    description: product.description || '',
    price: product.price?.toString() || '',
    original_price: product.original_price?.toString() || '',
    brand: product.brand || '',
    sku: product.sku || '',
    stock_quantity: product.stock_quantity?.toString() || '',
    rating_average: product.rating_average?.toString() || '',
    total_reviews: product.total_reviews?.toString() || '',
    features: Array.isArray(product.features) ? product.features.join(', ') : '',
    specifications: typeof product.specifications === 'object' ? 
      Object.entries(product.specifications || {}).map(([k, v]) => `"${k}": "${v}"`).join(', ') : '',
    reviews: product.reviews || '', // Add reviews field
    images: product.images || [''],
    is_active: product.is_active,
    is_featured: product.is_featured || false,
    is_bestseller: product.is_bestseller || false
  });

  const handleSave = () => {
    if (!formData.name || !formData.price) {
      alert('Please provide at least product name and price');
      return;
    }

    const updatedData = {
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price),
      original_price: formData.original_price ? parseFloat(formData.original_price) : null,
      brand: formData.brand,
      sku: formData.sku,
      stock_quantity: formData.stock_quantity ? parseInt(formData.stock_quantity) : 0,
      rating_average: formData.rating_average ? parseFloat(formData.rating_average) : 0,
      total_reviews: formData.total_reviews ? parseInt(formData.total_reviews) : 0,
      features: formData.features ? formData.features.split(',').map(f => f.trim()).filter(f => f) : [],
      specifications: formData.specifications ? JSON.parse(`{${formData.specifications}}`) : {},
      images: formData.images.filter(img => img && img.trim()),
      is_active: formData.is_active,
      is_featured: formData.is_featured,
      is_bestseller: formData.is_bestseller
    };

    onSave(updatedData);
  };

  const renderStarRating = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<i key={i} className="ri-star-fill text-yellow-400"></i>);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<i key={i} className="ri-star-half-fill text-yellow-400"></i>);
      } else {
        stars.push(<i key={i} className="ri-star-line text-gray-300"></i>);
      }
    }
    return stars;
  };

  return (
    <div className="border-t border-gray-200 pt-4 mt-4">
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
            <input
              type="text"
              value={formData.brand}
              onChange={(e) => setFormData(prev => ({ ...prev, brand: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
            <input
              type="number"
              step="0.01"
              value={formData.price}
              onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Original Price</label>
            <input
              type="number"
              step="0.01"
              value={formData.original_price}
              onChange={(e) => setFormData(prev => ({ ...prev, original_price: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Star Rating (0-5)
              <div className="flex items-center mt-1">
                {renderStarRating(parseFloat(formData.rating_average) || 0)}
                <span className="ml-2 text-sm text-gray-600">
                  {parseFloat(formData.rating_average)?.toFixed(1) || '0.0'}
                </span>
              </div>
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="5"
              value={formData.rating_average}
              onChange={(e) => setFormData(prev => ({ ...prev, rating_average: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Total Reviews</label>
            <input
              type="number"
              value={formData.total_reviews}
              onChange={(e) => setFormData(prev => ({ ...prev, total_reviews: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Features (comma-separated)</label>
          <textarea
            value={formData.features}
            onChange={(e) => setFormData(prev => ({ ...prev, features: e.target.value }))}
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>

        <div>
          <DualImageUpload
            currentImageUrl={formData.images[0]}
            imageType="product"
            onImageChange={(imageUrl) => setFormData(prev => ({ 
              ...prev, 
              images: [imageUrl, ...prev.images.slice(1)].filter(img => img) 
            }))}
            label="Product Image"
            required={true}
          />
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              id={`product_active_${product.id}`}
              checked={formData.is_active}
              onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor={`product_active_${product.id}`} className="ml-2 block text-sm text-gray-900">
              Product is active
            </label>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id={`product_featured_${product.id}`}
              checked={formData.is_featured}
              onChange={(e) => setFormData(prev => ({ ...prev, is_featured: e.target.checked }))}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor={`product_featured_${product.id}`} className="ml-2 block text-sm text-gray-900">
              Featured product
            </label>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id={`product_bestseller_${product.id}`}
              checked={formData.is_bestseller}
              onChange={(e) => setFormData(prev => ({ ...prev, is_bestseller: e.target.checked }))}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor={`product_bestseller_${product.id}`} className="ml-2 block text-sm text-gray-900">
              Bestseller product
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
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}
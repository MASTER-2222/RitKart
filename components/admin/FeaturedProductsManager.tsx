'use client';
import { useState } from 'react';

interface Product {
  id: string;
  name: string;
  price: number;
  images: string[];
  brand?: string;
  category_name?: string;
  is_featured: boolean;
  stock_quantity: number;
  rating_average?: number;
}

interface FeaturedProductsManagerProps {
  products: Product[];
  onUpdate: () => void;
}

export default function FeaturedProductsManager({ products, onUpdate }: FeaturedProductsManagerProps) {
  const [loading, setLoading] = useState<string | null>(null);

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Featured Products Section</h3>
          <p className="text-sm text-gray-600">
            Manage which products are highlighted in the "Featured Products" section. Currently showing {products.filter(p => p.is_featured).length} featured products.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {products.map((product) => (
          <div key={product.id} className="border border-gray-200 rounded-lg p-4 bg-white">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h4 className="font-medium text-gray-900 text-sm line-clamp-2" title={product.name}>
                  {product.name}
                </h4>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-lg font-bold text-gray-900">
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
                {product.category_name && (
                  <span className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded mt-2">
                    {product.category_name}
                  </span>
                )}
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

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <span className={`px-2 py-1 text-xs rounded-full ${
                  product.is_featured 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {product.is_featured ? 'Featured' : 'Not Featured'}
                </span>
              </div>
              
              <button
                onClick={() => handleToggleFeatured(product.id, product.is_featured)}
                disabled={loading === product.id}
                className={`text-sm font-medium px-3 py-1 rounded transition-colors disabled:opacity-50 ${
                  product.is_featured
                    ? 'bg-red-50 text-red-700 hover:bg-red-100'
                    : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                }`}
              >
                {loading === product.id 
                  ? 'Updating...' 
                  : product.is_featured 
                    ? 'Remove Featured' 
                    : 'Make Featured'
                }
              </button>
            </div>

            <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
              <span>Stock: {product.stock_quantity}</span>
              <span>ID: {product.id.substring(0, 8)}...</span>
            </div>
          </div>
        ))}
      </div>

      {products.length === 0 && (
        <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
          <i className="ri-star-line w-12 h-12 flex items-center justify-center text-gray-400 mx-auto mb-4 text-4xl"></i>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Featured Products</h3>
          <p className="text-gray-600 mb-4">Products marked as featured will appear in this section.</p>
        </div>
      )}

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start">
          <i className="ri-star-line w-5 h-5 flex items-center justify-center text-yellow-600 mr-3 mt-0.5"></i>
          <div>
            <h4 className="text-sm font-semibold text-yellow-900 mb-1">Featured Products Management</h4>
            <p className="text-sm text-yellow-700">
              Toggle the featured status of products to control which ones appear in the "Featured Products" carousel on your homepage. Featured products get more visibility and typically have higher conversion rates.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
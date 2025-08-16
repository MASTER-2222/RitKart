'use client';
import { useState } from 'react';

interface Product {
  id: string;
  name: string;
  price: number;
  images: string[];
  brand?: string;
  category_name?: string;
  stock_quantity: number;
  rating_average?: number;
  total_reviews?: number;
  is_bestseller?: boolean;
}

interface ElectronicsProductsManagerProps {
  products: Product[];
  onUpdate: () => void;
}

export default function ElectronicsProductsManager({ products, onUpdate }: ElectronicsProductsManagerProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const handleToggleBestseller = async (productId: string, currentStatus: boolean) => {
    try {
      setLoading(productId);
      
      // This would be a different endpoint for bestseller status
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

  // Filter for electronics products only
  const electronicsProducts = products.filter(product => 
    product.category_name?.toLowerCase().includes('electronics') ||
    product.category_name?.toLowerCase().includes('electronic')
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Bestsellers in Electronics Section</h3>
          <p className="text-sm text-gray-600">
            Manage which electronics products appear in the "Bestsellers in Electronics" section. 
            Currently showing {electronicsProducts.filter(p => p.is_bestseller).length} bestseller products.
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                viewMode === 'grid' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <i className="ri-grid-line w-4 h-4 flex items-center justify-center"></i>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                viewMode === 'list' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <i className="ri-list-check w-4 h-4 flex items-center justify-center"></i>
            </button>
          </div>
        </div>
      </div>

      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {electronicsProducts.map((product) => (
            <ProductCard 
              key={product.id}
              product={product}
              loading={loading}
              onToggleBestseller={handleToggleBestseller}
              formatPrice={formatPrice}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {electronicsProducts.map((product) => (
            <ProductListItem 
              key={product.id}
              product={product}
              loading={loading}
              onToggleBestseller={handleToggleBestseller}
              formatPrice={formatPrice}
            />
          ))}
        </div>
      )}

      {electronicsProducts.length === 0 && (
        <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
          <i className="ri-computer-line w-12 h-12 flex items-center justify-center text-gray-400 mx-auto mb-4 text-4xl"></i>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Electronics Products</h3>
          <p className="text-gray-600 mb-4">Electronics products will appear here when they are added to your catalog.</p>
        </div>
      )}

      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <div className="flex items-start">
          <i className="ri-computer-line w-5 h-5 flex items-center justify-center text-purple-600 mr-3 mt-0.5"></i>
          <div>
            <h4 className="text-sm font-semibold text-purple-900 mb-1">Electronics Bestsellers Management</h4>
            <p className="text-sm text-purple-700">
              Mark electronics products as bestsellers to feature them prominently in the "Bestsellers in Electronics" carousel. 
              This section helps customers discover your top-performing electronics products quickly.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Product Card Component for Grid View
function ProductCard({ product, loading, onToggleBestseller, formatPrice }: any) {
  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-white">
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
                {product.total_reviews && (
                  <span className="text-xs text-gray-500 ml-1">
                    ({product.total_reviews})
                  </span>
                )}
              </div>
            )}
          </div>
          {product.brand && (
            <p className="text-xs text-gray-500 mt-1">{product.brand}</p>
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
            product.is_bestseller 
              ? 'bg-purple-100 text-purple-800' 
              : 'bg-gray-100 text-gray-600'
          }`}>
            {product.is_bestseller ? 'Bestseller' : 'Regular'}
          </span>
        </div>
        
        <button
          onClick={() => onToggleBestseller(product.id, product.is_bestseller)}
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

      <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
        <span>Stock: {product.stock_quantity}</span>
        <span>ID: {product.id.substring(0, 8)}...</span>
      </div>
    </div>
  );
}

// Product List Item Component for List View
function ProductListItem({ product, loading, onToggleBestseller, formatPrice }: any) {
  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-white">
      <div className="flex items-center space-x-4">
        <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
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
        
        <div className="flex-1">
          <h4 className="font-medium text-gray-900" title={product.name}>
            {product.name}
          </h4>
          <div className="flex items-center space-x-4 mt-1">
            <span className="text-lg font-bold text-gray-900">
              {formatPrice(product.price)}
            </span>
            {product.brand && (
              <span className="text-sm text-gray-500">{product.brand}</span>
            )}
            {product.rating_average && (
              <div className="flex items-center">
                <i className="ri-star-fill w-4 h-4 flex items-center justify-center text-yellow-400"></i>
                <span className="text-sm text-gray-600 ml-1">
                  {product.rating_average.toFixed(1)}
                </span>
                {product.total_reviews && (
                  <span className="text-xs text-gray-500 ml-1">
                    ({product.total_reviews} reviews)
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <span className={`px-2 py-1 text-xs rounded-full ${
            product.is_bestseller 
              ? 'bg-purple-100 text-purple-800' 
              : 'bg-gray-100 text-gray-600'
          }`}>
            {product.is_bestseller ? 'Bestseller' : 'Regular'}
          </span>
          
          <span className="text-sm text-gray-500">
            Stock: {product.stock_quantity}
          </span>
          
          <button
            onClick={() => onToggleBestseller(product.id, product.is_bestseller)}
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
    </div>
  );
}
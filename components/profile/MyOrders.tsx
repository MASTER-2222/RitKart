'use client';
import { useState, useEffect } from 'react';
import { apiClient } from '../../utils/api';

interface OrderItem {
  id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  products: {
    id: string;
    name: string;
    images: string[];
    brand: string;
  };
}

interface Order {
  id: string;
  status: string;
  total_amount: number;
  created_at: string;
  delivery_address: string;
  tracking_number?: string;
  estimated_delivery?: string;
  order_items: OrderItem[];
}

export default function MyOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await apiClient.getOrders();
        
        if (response.success) {
          setOrders(response.data.orders || response.data || []);
        } else {
          setError(response.message || 'Failed to load orders');
        }
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError('Failed to load orders. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const filteredOrders = filterStatus === 'all' 
    ? orders 
    : orders.filter(order => order.status.toLowerCase().replace(' ', '-') === filterStatus);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Delivered':
        return 'bg-green-100 text-green-800';
      case 'In Transit':
        return 'bg-blue-100 text-blue-800';
      case 'Processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'Cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleTrackOrder = (trackingNumber: string) => {
    // TODO: Implement order tracking functionality
    console.log('Tracking order:', trackingNumber);
  };

  const handleReorder = (orderId: string) => {
    // TODO: Implement reorder functionality
    console.log('Reordering:', orderId);
  };

  const handleCancelOrder = (orderId: string) => {
    // TODO: Implement order cancellation functionality
    console.log('Cancelling order:', orderId);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="animate-pulse">
          <div className="flex items-center justify-between mb-6">
            <div className="h-8 bg-gray-200 rounded w-32"></div>
            <div className="h-10 bg-gray-200 rounded w-32"></div>
          </div>
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="border rounded-lg p-6">
                <div className="h-6 bg-gray-200 rounded w-40 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-64 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-48"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="text-center py-12">
          <div className="text-red-500 mb-4">
            <i className="ri-error-warning-line text-6xl"></i>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Orders</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
        <div className="flex items-center space-x-4">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 pr-8"
          >
            <option value="all">All Orders</option>
            <option value="processing">Processing</option>
            <option value="in-transit">In Transit</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500 mb-4">
            <i className="ri-shopping-bag-line text-6xl"></i>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
          <p className="text-gray-600">
            {filterStatus === 'all' 
              ? "You haven't placed any orders yet."
              : `No ${filterStatus.replace('-', ' ')} orders found.`
            }
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredOrders.map((order, index) => (
            <div key={index} className="border rounded-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center space-x-4 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">Order #{order.id}</h3>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div>Order Date: {new Date(order.created_at).toLocaleDateString()}</div>
                    <div>Total: ₹{order.total_amount.toFixed(2)}</div>
                    {order.estimated_delivery && (
                      <div>Estimated Delivery: {new Date(order.estimated_delivery).toLocaleDateString()}</div>
                    )}
                  </div>
                </div>
                <div className="flex space-x-2">
                  {order.tracking_number && order.status !== 'Delivered' && order.status !== 'Cancelled' && (
                    <button
                      onClick={() => handleTrackOrder(order.tracking_number!)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap"
                    >
                      Track Order
                    </button>
                  )}
                  {order.status === 'Processing' && (
                    <button
                      onClick={() => handleCancelOrder(order.id)}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap"
                    >
                      Cancel
                    </button>
                  )}
                  {order.status === 'Delivered' && (
                    <button
                      onClick={() => handleReorder(order.id)}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap"
                    >
                      Reorder
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                {order.order_items.map((item, itemIndex) => (
                  <div key={itemIndex} className="flex items-center space-x-4 p-3 bg-gray-50 rounded">
                    <img
                      src={item.products.images?.[0] || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100&h=100&fit=crop&crop=center'}
                      alt={item.products.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{item.products.name}</h4>
                      <div className="text-sm text-gray-600">
                        <div>Price: ₹{item.unit_price.toFixed(2)}</div>
                        <div>Quantity: {item.quantity}</div>
                        {item.products.brand && <div>Brand: {item.products.brand}</div>}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-gray-900">₹{item.total_price.toFixed(2)}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200 text-sm text-gray-600">
                <div className="flex items-center">
                  <i className="ri-map-pin-line w-4 h-4 flex items-center justify-center mr-2"></i>
                  Delivery Address: {order.delivery_address || 'No address specified'}
                </div>
                {order.tracking_number && (
                  <div className="flex items-center mt-1">
                    <i className="ri-truck-line w-4 h-4 flex items-center justify-center mr-2"></i>
                    Tracking: {order.tracking_number}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
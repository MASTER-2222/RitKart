'use client';
import { useState } from 'react';

export default function MyOrders() {
  const [filterStatus, setFilterStatus] = useState('all');

  const orders = [
    {
      id: '#RZ-001234',
      date: 'December 15, 2023',
      status: 'Delivered',
      total: '$1,599.00',
      items: [
        {
          id: '1',
          name: 'Apple MacBook Pro 14-inch M3 Chip',
          image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=100&h=100&fit=crop&crop=center',
          price: '$1,599.00',
          quantity: 1
        }
      ],
      deliveryAddress: '123 Main St, New York, NY 10001',
      trackingNumber: 'TRK123456789'
    },
    {
      id: '#RZ-001235',
      date: 'December 18, 2023',
      status: 'In Transit',
      total: '$358.00',
      items: [
        {
          id: 'f2',
          name: 'Nike Air Force 1 \'07 White Leather Sneakers',
          image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=100&h=100&fit=crop&crop=center',
          price: '$110.00',
          quantity: 1
        },
        {
          id: '2',
          name: 'Sony WH-1000XM4 Wireless Headphones',
          image: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=100&h=100&fit=crop&crop=center',
          price: '$248.00',
          quantity: 1
        }
      ],
      deliveryAddress: '123 Main St, New York, NY 10001',
      trackingNumber: 'TRK123456790',
      estimatedDelivery: 'December 22, 2023'
    },
    {
      id: '#RZ-001236',
      date: 'December 20, 2023',
      status: 'Processing',
      total: '$129.99',
      items: [
        {
          id: 's2',
          name: 'Nike Men\'s Air Zoom Pegasus 39 Running Shoes',
          image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=100&h=100&fit=crop&crop=center',
          price: '$129.99',
          quantity: 1
        }
      ],
      deliveryAddress: '123 Main St, New York, NY 10001'
    },
    {
      id: '#RZ-001237',
      date: 'December 12, 2023',
      status: 'Cancelled',
      total: '$79.00',
      items: [
        {
          id: 'a1',
          name: 'Instant Pot Duo 7-in-1 Electric Pressure Cooker',
          image: 'https://images.unsplash.com/photo-1585515656617-d405f574bfa3?w=100&h=100&fit=crop&crop=center',
          price: '$79.00',
          quantity: 1
        }
      ],
      deliveryAddress: '123 Main St, New York, NY 10001'
    }
  ];

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
    console.log('Tracking order:', trackingNumber);
  };

  const handleReorder = (orderId: string) => {
    console.log('Reordering:', orderId);
  };

  const handleCancelOrder = (orderId: string) => {
    console.log('Cancelling order:', orderId);
  };

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
                    <h3 className="text-lg font-semibold text-gray-900">Order {order.id}</h3>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div>Order Date: {order.date}</div>
                    <div>Total: {order.total}</div>
                    {order.estimatedDelivery && (
                      <div>Estimated Delivery: {order.estimatedDelivery}</div>
                    )}
                  </div>
                </div>
                <div className="flex space-x-2">
                  {order.trackingNumber && order.status !== 'Delivered' && order.status !== 'Cancelled' && (
                    <button
                      onClick={() => handleTrackOrder(order.trackingNumber)}
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
                {order.items.map((item, itemIndex) => (
                  <div key={itemIndex} className="flex items-center space-x-4 p-3 bg-gray-50 rounded">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{item.name}</h4>
                      <div className="text-sm text-gray-600">
                        <div>Price: {item.price}</div>
                        <div>Quantity: {item.quantity}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200 text-sm text-gray-600">
                <div className="flex items-center">
                  <i className="ri-map-pin-line w-4 h-4 flex items-center justify-center mr-2"></i>
                  Delivery Address: {order.deliveryAddress}
                </div>
                {order.trackingNumber && (
                  <div className="flex items-center mt-1">
                    <i className="ri-truck-line w-4 h-4 flex items-center justify-center mr-2"></i>
                    Tracking: {order.trackingNumber}
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
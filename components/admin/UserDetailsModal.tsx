'use client';
import React, { useState, useEffect } from 'react';
import { useAdminAuth } from '../../contexts/AdminAuthContext';
import Image from 'next/image';

interface User {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  email_verified: boolean;
  last_login_at?: string;
  profile_image_url?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
  statistics?: {
    totalOrders: number;
    completedOrders: number;
    pendingOrders: number;
    totalSpent: number;
    cartItemsCount: number;
    joinedDaysAgo: number;
  };
  recentOrders?: Order[];
}

interface Order {
  id: string;
  order_number: string;
  status: string;
  total_amount: number;
  currency: string;
  created_at: string;
  updated_at: string;
  notes?: string;
  order_items: {
    id: string;
    quantity: number;
    price: number;
    products: {
      id: string;
      name: string;
      images: string[];
    };
  }[];
}

interface UserDetailsModalProps {
  user: User;
  onClose: () => void;
  onEditUser: () => void;
  onNotifyUser: () => void;
}

export default function UserDetailsModal({
  user,
  onClose,
  onEditUser,
  onNotifyUser
}: UserDetailsModalProps) {
  const { adminUser } = useAdminAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'orders' | 'notifications'>('profile');
  const [detailedUser, setDetailedUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersPagination, setOrdersPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalOrders: 0,
    limit: 10
  });

  // Fetch detailed user information
  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const response = await fetch(`/api/admin/users/${user.id}`, {
          headers: {
            'Authorization': `Bearer ${adminUser?.token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setDetailedUser(data.data);
          }
        }
      } catch (error) {
        console.error('Error fetching user details:', error);
      } finally {
        setLoading(false);
      }
    };

    if (adminUser?.token) {
      fetchUserDetails();
    }
  }, [user.id, adminUser?.token]);

  // Fetch user orders
  const fetchUserOrders = async (page = 1) => {
    try {
      setOrdersLoading(true);
      const response = await fetch(`/api/admin/users/${user.id}/orders?page=${page}&limit=10`, {
        headers: {
          'Authorization': `Bearer ${adminUser?.token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setOrders(data.data);
          setOrdersPagination(data.pagination);
        }
      }
    } catch (error) {
      console.error('Error fetching user orders:', error);
    } finally {
      setOrdersLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'orders' && adminUser?.token) {
      fetchUserOrders();
    }
  }, [activeTab, user.id, adminUser?.token]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number, currency: string) => {
    const symbols: { [key: string]: string } = {
      USD: '$',
      EUR: '€',
      GBP: '£',
      INR: '₹',
      CAD: 'C$',
      JPY: '¥',
      AUD: 'A$'
    };
    return `${symbols[currency] || currency} ${amount.toFixed(2)}`;
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      shipped: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${adminUser?.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: newStatus,
          notes: `Status updated by admin to ${newStatus}`
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // Refresh orders
          fetchUserOrders(ordersPagination.currentPage);
          alert('Order status updated successfully!');
        }
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Failed to update order status');
    }
  };

  const currentUser = detailedUser || user;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-full overflow-hidden bg-white/20">
                {currentUser.profile_image_url ? (
                  <Image
                    src={currentUser.profile_image_url}
                    alt={currentUser.full_name}
                    width={64}
                    height={64}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <i className="ri-user-line w-8 h-8 text-white"></i>
                  </div>
                )}
              </div>
              <div>
                <h2 className="text-2xl font-bold">{currentUser.full_name}</h2>
                <p className="text-white/80">{currentUser.email}</p>
                <div className="flex items-center space-x-4 mt-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    currentUser.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {currentUser.is_active ? 'Active' : 'Inactive'}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    currentUser.email_verified ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {currentUser.email_verified ? 'Verified' : 'Unverified'}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={onEditUser}
                className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
              >
                <i className="ri-edit-line w-4 h-4 mr-2"></i>
                Edit
              </button>
              <button
                onClick={onNotifyUser}
                className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
              >
                <i className="ri-notification-line w-4 h-4 mr-2"></i>
                Notify
              </button>
              <button
                onClick={onClose}
                className="bg-white/20 hover:bg-white/30 text-white p-2 rounded-lg transition-colors"
              >
                <i className="ri-close-line w-5 h-5"></i>
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'profile', name: 'Profile Info', icon: 'ri-user-line' },
              { id: 'orders', name: 'Order History', icon: 'ri-shopping-bag-line' },
              { id: 'notifications', name: 'Notifications', icon: 'ri-notification-line' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <i className={`${tab.icon} w-4 h-4`}></i>
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading user details...</p>
              </div>
            </div>
          ) : activeTab === 'profile' ? (
            <div className="space-y-6">
              {/* Statistics Cards */}
              {currentUser.statistics && (
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  <div className="bg-blue-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600">{currentUser.statistics.totalOrders}</div>
                    <div className="text-sm text-blue-800">Total Orders</div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-green-600">{currentUser.statistics.completedOrders}</div>
                    <div className="text-sm text-green-800">Completed</div>
                  </div>
                  <div className="bg-yellow-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-yellow-600">{currentUser.statistics.pendingOrders}</div>
                    <div className="text-sm text-yellow-800">Pending</div>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {formatCurrency(currentUser.statistics.totalSpent, 'INR')}
                    </div>
                    <div className="text-sm text-purple-800">Total Spent</div>
                  </div>
                  <div className="bg-orange-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-orange-600">{currentUser.statistics.joinedDaysAgo}</div>
                    <div className="text-sm text-orange-800">Days Ago</div>
                  </div>
                </div>
              )}

              {/* User Information */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Personal Information */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Full Name</label>
                      <div className="text-gray-900">{currentUser.full_name}</div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Email</label>
                      <div className="text-gray-900">{currentUser.email}</div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Phone</label>
                      <div className="text-gray-900">{currentUser.phone || 'Not provided'}</div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Registration Date</label>
                      <div className="text-gray-900">{formatDate(currentUser.created_at)}</div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Last Login</label>
                      <div className="text-gray-900">
                        {currentUser.last_login_at ? formatDate(currentUser.last_login_at) : 'Never'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Address Information */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Address Information</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Address</label>
                      <div className="text-gray-900">{currentUser.address || 'Not provided'}</div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">City</label>
                      <div className="text-gray-900">{currentUser.city || 'Not provided'}</div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">State</label>
                      <div className="text-gray-900">{currentUser.state || 'Not provided'}</div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Country</label>
                      <div className="text-gray-900">{currentUser.country || 'Not provided'}</div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Postal Code</label>
                      <div className="text-gray-900">{currentUser.postal_code || 'Not provided'}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Orders Preview */}
              {currentUser.recentOrders && currentUser.recentOrders.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
                    <button
                      onClick={() => setActiveTab('orders')}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      View All Orders
                    </button>
                  </div>
                  <div className="space-y-3">
                    {currentUser.recentOrders.slice(0, 3).map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-3 bg-white rounded-lg">
                        <div>
                          <div className="font-medium text-gray-900">{order.order_number}</div>
                          <div className="text-sm text-gray-500">{formatDate(order.created_at)}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium text-gray-900">
                            {formatCurrency(order.total_amount, order.currency)}
                          </div>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : activeTab === 'orders' ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Order History</h3>
                <div className="text-sm text-gray-500">
                  Total: {ordersPagination.totalOrders} orders
                </div>
              </div>

              {ordersLoading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading orders...</p>
                  </div>
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-12">
                  <i className="ri-shopping-bag-line w-12 h-12 text-gray-400 mx-auto mb-4"></i>
                  <p className="text-gray-500">No orders found for this user</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order.id} className="bg-gray-50 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h4 className="font-semibold text-gray-900">{order.order_number}</h4>
                          <p className="text-sm text-gray-500">
                            Ordered on {formatDate(order.created_at)}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-gray-900">
                            {formatCurrency(order.total_amount, order.currency)}
                          </div>
                          <div className="flex items-center space-x-2 mt-2">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                            </span>
                            <select
                              value={order.status}
                              onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                              className="text-xs px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                              <option value="pending">Pending</option>
                              <option value="processing">Processing</option>
                              <option value="shipped">Shipped</option>
                              <option value="delivered">Delivered</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          </div>
                        </div>
                      </div>
                      
                      {/* Order Items */}
                      <div className="space-y-2">
                        {order.order_items.map((item) => (
                          <div key={item.id} className="flex items-center space-x-3 p-3 bg-white rounded">
                            <div className="w-12 h-12 bg-gray-200 rounded overflow-hidden">
                              {item.products.images && item.products.images[0] && (
                                <Image
                                  src={item.products.images[0]}
                                  alt={item.products.name}
                                  width={48}
                                  height={48}
                                  className="w-full h-full object-cover"
                                />
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="text-sm font-medium text-gray-900">{item.products.name}</div>
                              <div className="text-xs text-gray-500">Quantity: {item.quantity}</div>
                            </div>
                            <div className="text-sm font-medium text-gray-900">
                              {formatCurrency(item.price, order.currency)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Orders Pagination */}
              {ordersPagination.totalPages > 1 && (
                <div className="flex items-center justify-center space-x-2">
                  {ordersPagination.currentPage > 1 && (
                    <button
                      onClick={() => fetchUserOrders(ordersPagination.currentPage - 1)}
                      className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                      Previous
                    </button>
                  )}
                  
                  <span className="text-sm text-gray-700">
                    Page {ordersPagination.currentPage} of {ordersPagination.totalPages}
                  </span>
                  
                  {ordersPagination.currentPage < ordersPagination.totalPages && (
                    <button
                      onClick={() => fetchUserOrders(ordersPagination.currentPage + 1)}
                      className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                      Next
                    </button>
                  )}
                </div>
              )}
            </div>
          ) : (
            /* Notifications Tab */
            <div className="space-y-6">
              <div className="text-center py-12">
                <i className="ri-notification-line w-12 h-12 text-gray-400 mx-auto mb-4"></i>
                <p className="text-gray-500">Notifications management will be available soon</p>
                <button
                  onClick={onNotifyUser}
                  className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Send Notification
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
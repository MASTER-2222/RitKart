'use client';
import { useState, useEffect } from 'react';
import { apiClient, ProfileDashboard as ProfileDashboardType } from '../../utils/api';

export default function ProfileDashboard() {
  const [dashboardData, setDashboardData] = useState<ProfileDashboardType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await apiClient.getProfileDashboard();
        
        if (response.success) {
          setDashboardData(response.data);
        } else {
          setError(response.message || 'Failed to load dashboard data');
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-gray-50 rounded-lg p-4">
                  <div className="h-10 bg-gray-200 rounded mb-3"></div>
                  <div className="h-4 bg-gray-200 rounded mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              ))}
            </div>
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
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Dashboard</h3>
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

  if (!dashboardData) {
    return null;
  }

  const stats = [
    {
      title: 'Total Orders',
      value: dashboardData.stats.totalOrders.toString(),
      icon: 'ri-shopping-bag-line',
      color: 'bg-blue-500',
      trend: `${dashboardData.stats.completedOrders} completed`
    },
    {
      title: 'Active Deliveries',
      value: dashboardData.stats.activeDeliveries.toString(),
      icon: 'ri-truck-line',
      color: 'bg-green-500',
      trend: dashboardData.stats.activeDeliveries > 0 ? 'On the way' : 'None active'
    },
    {
      title: 'Wishlist Items',
      value: dashboardData.stats.wishlistItems.toString(),
      icon: 'ri-heart-line',
      color: 'bg-red-500',
      trend: dashboardData.stats.wishlistItems > 0 ? 'View items' : 'Add favorites'
    },
    {
      title: 'Cart Items',
      value: dashboardData.stats.cartItems.toString(),
      icon: 'ri-shopping-cart-line',
      color: 'bg-orange-500',
      trend: dashboardData.stats.cartItems > 0 ? 'Ready to checkout' : 'Empty cart'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome back, {dashboardData.user.fullName}!
            </h1>
            <p className="text-gray-600">Here's what's happening with your account today.</p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-600">Member since</div>
            <div className="font-semibold text-gray-900">
              {new Date(dashboardData.user.memberSince).toLocaleDateString('en-US', {
                month: 'long',
                year: 'numeric'
              })}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <div key={index} className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 ${stat.color} rounded-lg flex items-center justify-center`}>
                  <i className={`${stat.icon} w-5 h-5 flex items-center justify-center text-white`}></i>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                </div>
              </div>
              <div className="text-sm font-medium text-gray-900 mb-1">{stat.title}</div>
              <div className="text-xs text-gray-600">{stat.trend}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Recent Orders</h2>
          <button 
            onClick={() => {
              // Navigate to orders section (handled by parent component)
              const event = new CustomEvent('navigate-to-section', { detail: 'orders' });
              window.dispatchEvent(event);
            }}
            className="text-blue-600 hover:underline text-sm font-medium"
          >
            View All Orders
          </button>
        </div>

        {dashboardData.recentOrders.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-500 mb-4">
              <i className="ri-shopping-bag-line text-5xl"></i>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
            <p className="text-gray-600">Start shopping to see your orders here.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {dashboardData.recentOrders.slice(0, 3).map((order, index) => (
              <div key={index} className="flex items-center space-x-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <img
                  src={order.items[0]?.image || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100&h=100&fit=crop&crop=center'}
                  alt={order.items[0]?.name || 'Product'}
                  className="w-16 h-16 object-cover rounded"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {order.items[0]?.name || 'Order'}
                        {order.items.length > 1 && ` +${order.items.length - 1} more`}
                      </h3>
                      <p className="text-sm text-gray-600">Order {order.id}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(order.date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-gray-900">
                        ₹{order.totalAmount.toFixed(2)}
                      </div>
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                        order.status === 'Delivered' 
                          ? 'bg-green-100 text-green-800'
                          : order.status === 'In Transit'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                </div>
                <button className="text-blue-600 hover:text-blue-800 font-medium text-sm whitespace-nowrap">
                  View Details
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
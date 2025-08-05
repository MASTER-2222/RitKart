'use client';
import { useState, useEffect } from 'react';
import DashboardStats from '../../components/admin/DashboardStats';
import SalesChart from '../../components/admin/SalesChart';
import RecentOrders from '../../components/admin/RecentOrders';
import TopProducts from '../../components/admin/TopProducts';

export default function AdminDashboard() {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome back, Sir Rit! Here's what's happening with your store.</p>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-500">Current Time</div>
          <div className="font-mono text-lg font-semibold" suppressHydrationWarning={true}>
            {currentTime.toLocaleString()}
          </div>
        </div>
      </div>

      <DashboardStats />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SalesChart />
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              <button className="flex items-center p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                <i className="ri-add-line w-5 h-5 flex items-center justify-center text-blue-600 mr-2"></i>
                <span className="text-sm font-medium text-blue-600 whitespace-nowrap">Add Product</span>
              </button>
              <button className="flex items-center p-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
                <i className="ri-user-add-line w-5 h-5 flex items-center justify-center text-green-600 mr-2"></i>
                <span className="text-sm font-medium text-green-600 whitespace-nowrap">Add User</span>
              </button>
              <button className="flex items-center p-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors">
                <i className="ri-folder-add-line w-5 h-5 flex items-center justify-center text-purple-600 mr-2"></i>
                <span className="text-sm font-medium text-purple-600 whitespace-nowrap">New Category</span>
              </button>
              <button className="flex items-center p-3 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors">
                <i className="ri-coupon-line w-5 h-5 flex items-center justify-center text-orange-600 mr-2"></i>
                <span className="text-sm font-medium text-orange-600 whitespace-nowrap">Create Deal</span>
              </button>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">System Status</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Website Status</span>
                <span className="flex items-center text-green-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  <span className="text-sm font-medium">Online</span>
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Database</span>
                <span className="flex items-center text-green-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  <span className="text-sm font-medium">Connected</span>
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Payment Gateway</span>
                <span className="flex items-center text-green-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  <span className="text-sm font-medium">Active</span>
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">CDN</span>
                <span className="flex items-center text-yellow-600">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
                  <span className="text-sm font-medium">Slow</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentOrders />
        <TopProducts />
      </div>
    </div>
  );
}
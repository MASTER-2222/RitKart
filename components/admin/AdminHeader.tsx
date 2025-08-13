'use client';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { useAdminAuth } from '../../contexts/AdminAuthContext';

export default function AdminHeader() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const pathname = usePathname();
  const { adminUser, logout } = useAdminAuth();

  const getPageTitle = () => {
    const pathMap = {
      '/admin': 'Dashboard',
      '/admin/homepage': 'Homepage Management',
      '/admin/products': 'Product Management',
      '/admin/categories': 'Category Management',
      '/admin/users': 'User Management',
      '/admin/orders': 'Order Management',
      '/admin/inventory': 'Inventory Dashboard',
      '/admin/analytics': 'Analytics',
      '/admin/system': 'System Monitoring',
      '/admin/media': 'Media Library',
    };
    return pathMap[pathname] || 'Admin Panel';
  };

  const handleLogout = async () => {
    await logout();
    setShowProfileMenu(false);
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">{getPageTitle()}</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your RitZone eCommerce platform</p>
        </div>

        <div className="flex items-center space-x-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search admin panel..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
            />
            <i className="ri-search-line w-5 h-5 flex items-center justify-center absolute left-3 top-2.5 text-gray-400"></i>
          </div>

          <div className="flex items-center space-x-3">
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors relative">
              <i className="ri-notification-line w-5 h-5 flex items-center justify-center text-gray-600"></i>
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">3</span>
            </button>

            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <i className="ri-mail-line w-5 h-5 flex items-center justify-center text-gray-600"></i>
            </button>

            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <i className="ri-settings-line w-5 h-5 flex items-center justify-center text-gray-600"></i>
            </button>

            <div className="relative ml-4 pl-4 border-l border-gray-200">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">
                    {adminUser?.fullName?.charAt(0)?.toUpperCase() || 'A'}
                  </span>
                </div>
                <div className="text-sm text-left">
                  <div className="font-medium text-gray-900">
                    {adminUser?.fullName || 'Admin User'}
                  </div>
                  <div className="text-gray-500">
                    {adminUser?.role || 'Administrator'}
                  </div>
                </div>
                <i className="ri-arrow-down-s-line w-4 h-4 flex items-center justify-center text-gray-500"></i>
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                  <div className="p-4 border-b border-gray-100">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold text-lg">
                          {adminUser?.fullName?.charAt(0)?.toUpperCase() || 'A'}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          {adminUser?.fullName || 'Admin User'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {adminUser?.email || 'admin@ritzone.com'}
                        </div>
                        <div className="text-xs text-purple-600 font-medium">
                          {adminUser?.role || 'Administrator'}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-2">
                    <button className="w-full flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                      <i className="ri-user-line w-4 h-4 flex items-center justify-center mr-3"></i>
                      Profile Settings
                    </button>
                    <button className="w-full flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                      <i className="ri-shield-line w-4 h-4 flex items-center justify-center mr-3"></i>
                      Security
                    </button>
                    <button className="w-full flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                      <i className="ri-history-line w-4 h-4 flex items-center justify-center mr-3"></i>
                      Activity Log
                    </button>
                    <hr className="my-2" />
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <i className="ri-logout-box-line w-4 h-4 flex items-center justify-center mr-3"></i>
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Overlay to close dropdown when clicking outside */}
      {showProfileMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowProfileMenu(false)}
        ></div>
      )}
    </header>
  );
}
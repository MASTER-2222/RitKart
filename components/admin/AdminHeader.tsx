'use client';
import { useState } from 'react';
import { usePathname } from 'next/navigation';

export default function AdminHeader() {
  const [searchQuery, setSearchQuery] = useState('');
  const pathname = usePathname();

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

            <div className="flex items-center space-x-2 ml-4 pl-4 border-l border-gray-200">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <i className="ri-user-line w-4 h-4 flex items-center justify-center text-white"></i>
              </div>
              <div className="text-sm">
                <div className="font-medium text-gray-900">Sir Rit</div>
                <div className="text-gray-500">Administrator</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
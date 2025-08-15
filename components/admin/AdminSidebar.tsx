'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import AdminProfileMenu from './AdminProfileMenu';

export default function AdminSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const menuItems = [
    { icon: 'ri-dashboard-line', label: 'Dashboard', path: '/admin' },
    { icon: 'ri-home-line', label: 'Homepage', path: '/admin/homepage' },
    { icon: 'ri-image-line', label: 'Hero Banners', path: '/admin/hero-banners' },
    { icon: 'ri-box-line', label: 'Products', path: '/admin/products' },
    { icon: 'ri-folder-line', label: 'Categories', path: '/admin/categories' },
    { icon: 'ri-user-line', label: 'Users', path: '/admin/users' },
    { icon: 'ri-shopping-cart-line', label: 'Orders', path: '/admin/orders' },
    { icon: 'ri-store-line', label: 'Inventory', path: '/admin/inventory' },
    { icon: 'ri-bar-chart-line', label: 'Analytics', path: '/admin/analytics' },
    { icon: 'ri-settings-line', label: 'System', path: '/admin/system' },
    { icon: 'ri-camera-line', label: 'Media', path: '/admin/media' },
  ];

  const handleLogout = () => {
    router.push('/');
  };

  return (
    <div className={`bg-white border-r border-gray-200 transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-64'} flex flex-col h-full`}>
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        {!isCollapsed && (
          <Link href="/admin" className="flex items-center">
            <span className="text-xl font-['Pacifico'] text-gray-800">RitZone</span>
            <span className="ml-2 text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full whitespace-nowrap">Admin</span>
          </Link>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <i className={`${isCollapsed ? 'ri-menu-unfold-line' : 'ri-menu-fold-line'} w-5 h-5 flex items-center justify-center text-gray-600`}></i>
        </button>
      </div>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`flex items-center p-3 rounded-lg transition-colors ${
                isActive 
                  ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <i className={`${item.icon} w-5 h-5 flex items-center justify-center`}></i>
              {!isCollapsed && (
                <span className="ml-3 font-medium whitespace-nowrap">{item.label}</span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-200 relative">
        <button
          onClick={() => setShowProfileMenu(!showProfileMenu)}
          className={`w-full flex items-center p-3 hover:bg-gray-50 rounded-lg transition-colors ${
            isCollapsed ? 'justify-center' : ''
          }`}
        >
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
            <i className="ri-user-line w-4 h-4 flex items-center justify-center text-white"></i>
          </div>
          {!isCollapsed && (
            <div className="ml-3 text-left">
              <div className="font-medium text-gray-900">Sir Rit</div>
              <div className="text-sm text-gray-500">Admin</div>
            </div>
          )}
        </button>

        {showProfileMenu && (
          <AdminProfileMenu 
            onClose={() => setShowProfileMenu(false)}
            onLogout={handleLogout}
            isCollapsed={isCollapsed}
          />
        )}
      </div>
    </div>
  );
}
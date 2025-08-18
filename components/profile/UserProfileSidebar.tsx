'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { apiClient } from '../../utils/api';

interface UserProfileSidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

export default function UserProfileSidebar({ activeSection, onSectionChange }: UserProfileSidebarProps) {
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'ri-dashboard-line' },
    { id: 'personal-info', label: 'Personal Info', icon: 'ri-user-line' },
    { id: 'orders', label: 'My Orders', icon: 'ri-shopping-bag-line' },
    { id: 'wishlist', label: 'Wishlist', icon: 'ri-heart-line' },
    { id: 'addresses', label: 'Address Book', icon: 'ri-map-pin-line' },
    { id: 'payments', label: 'Payment Methods', icon: 'ri-credit-card-line' },
  ];

  const handleLogout = () => {
    console.log('User logged out');
    setShowLogoutModal(false);
    window.location.href = '/';
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm border p-6 sticky top-6">
        <div className="text-center mb-6">
          <div className="w-20 h-20 bg-gray-300 rounded-full mx-auto mb-3 flex items-center justify-center">
            <i className="ri-user-line w-8 h-8 flex items-center justify-center text-gray-600 text-2xl"></i>
          </div>
          <h2 className="text-xl font-bold text-gray-900">User Profile</h2>
          <p className="text-gray-600 text-sm">Loading...</p>
        </div>

        <nav className="space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                activeSection === item.id
                  ? 'bg-blue-50 text-blue-600 border border-blue-200'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <i className={`${item.icon} w-5 h-5 flex items-center justify-center`}></i>
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <button
            onClick={() => setShowLogoutModal(true)}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
          >
            <i className="ri-logout-box-line w-5 h-5 flex items-center justify-center"></i>
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </div>

      {showLogoutModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Confirm Logout</h3>
            <p className="text-gray-600 mb-6">Are you sure you want to logout?</p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 px-4 rounded-lg whitespace-nowrap"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg whitespace-nowrap"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
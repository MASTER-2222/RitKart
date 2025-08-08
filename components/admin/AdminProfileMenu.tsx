'use client';
import { useEffect, useRef } from 'react';

interface AdminProfileMenuProps {
  onClose: () => void;
  onLogout: () => void;
  isCollapsed: boolean;
}

export default function AdminProfileMenu({ onClose, onLogout, isCollapsed }: AdminProfileMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  return (
    <div 
      ref={menuRef}
      className={`absolute bottom-full mb-2 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50 ${
        isCollapsed ? 'left-0 w-48' : 'left-0 right-0'
      }`}
    >
      <div className="px-4 py-2 border-b border-gray-100">
        <div className="text-sm font-medium text-gray-900">Welcome Sir Rit</div>
        <div className="text-xs text-gray-500">Administrator</div>
      </div>
      
      <div className="py-1">
        <button className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
          <i className="ri-user-settings-line w-4 h-4 flex items-center justify-center mr-3"></i>
          Profile Settings
        </button>
        
        <button className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
          <i className="ri-settings-line w-4 h-4 flex items-center justify-center mr-3"></i>
          Account Settings
        </button>
        
        <button className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
          <i className="ri-shield-check-line w-4 h-4 flex items-center justify-center mr-3"></i>
          Security
        </button>
        
        <hr className="my-1 border-gray-100" />
        
        <button 
          onClick={onLogout}
          className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
        >
          <i className="ri-logout-box-line w-4 h-4 flex items-center justify-center mr-3"></i>
          Logout
        </button>
      </div>
    </div>
  );
}
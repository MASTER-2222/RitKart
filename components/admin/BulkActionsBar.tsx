'use client';
import React, { useState } from 'react';

interface BulkActionsBarProps {
  selectedCount: number;
  onBulkDelete: () => void;
  onBulkUpdate: (updateData: any) => void;
  onBulkNotify: () => void;
}

export default function BulkActionsBar({
  selectedCount,
  onBulkDelete,
  onBulkUpdate,
  onBulkNotify
}: BulkActionsBarProps) {
  const [showBulkUpdateMenu, setShowBulkUpdateMenu] = useState(false);

  const handleBulkActivate = () => {
    onBulkUpdate({ is_active: true });
    setShowBulkUpdateMenu(false);
  };

  const handleBulkDeactivate = () => {
    onBulkUpdate({ is_active: false });
    setShowBulkUpdateMenu(false);
  };

  const handleBulkVerify = () => {
    onBulkUpdate({ email_verified: true });
    setShowBulkUpdateMenu(false);
  };

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <i className="ri-checkbox-circle-fill w-5 h-5 text-blue-600"></i>
          <span className="text-sm font-medium text-blue-900">
            {selectedCount} user{selectedCount !== 1 ? 's' : ''} selected
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Bulk Update Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowBulkUpdateMenu(!showBulkUpdateMenu)}
              className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg flex items-center text-sm transition-colors"
            >
              <i className="ri-edit-line w-4 h-4 mr-1"></i>
              Update
              <i className="ri-arrow-down-s-line w-4 h-4 ml-1"></i>
            </button>
            
            {showBulkUpdateMenu && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                <div className="py-1">
                  <button
                    onClick={handleBulkActivate}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <i className="ri-check-line w-4 h-4 mr-2 text-green-500"></i>
                    Activate Users
                  </button>
                  <button
                    onClick={handleBulkDeactivate}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <i className="ri-close-line w-4 h-4 mr-2 text-red-500"></i>
                    Deactivate Users
                  </button>
                  <button
                    onClick={handleBulkVerify}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <i className="ri-verified-badge-line w-4 h-4 mr-2 text-blue-500"></i>
                    Verify Emails
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Bulk Notify */}
          <button
            onClick={onBulkNotify}
            className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-lg flex items-center text-sm transition-colors"
          >
            <i className="ri-notification-line w-4 h-4 mr-1"></i>
            Notify
          </button>

          {/* Bulk Delete */}
          <button
            onClick={onBulkDelete}
            className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg flex items-center text-sm transition-colors"
          >
            <i className="ri-delete-bin-line w-4 h-4 mr-1"></i>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
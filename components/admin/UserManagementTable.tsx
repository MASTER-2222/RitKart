'use client';
import React from 'react';
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
  orderStats: {
    total: number;
    pending: number;
    completed: number;
  };
}

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalUsers: number;
  limit: number;
}

interface UserManagementTableProps {
  users: User[];
  selectedUsers: Set<string>;
  selectAll: boolean;
  sortBy: string;
  sortOrder: string;
  onUserSelect: (userId: string, checked: boolean) => void;
  onSelectAll: (checked: boolean) => void;
  onUserClick: (user: User) => void;
  onEditUser: (user: User) => void;
  onNotifyUser: (user: User) => void;
  onSort: (field: string) => void;
  pagination: PaginationInfo;
  onPageChange: (page: number) => void;
}

export default function UserManagementTable({
  users,
  selectedUsers,
  selectAll,
  sortBy,
  sortOrder,
  onUserSelect,
  onSelectAll,
  onUserClick,
  onEditUser,
  onNotifyUser,
  onSort,
  pagination,
  onPageChange
}: UserManagementTableProps) {
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTimeAgo = (dateString: string | null) => {
    if (!dateString) return 'Never';
    
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  };

  const getSortIcon = (field: string) => {
    if (sortBy !== field) return 'ri-arrow-up-down-line text-gray-400';
    return sortOrder === 'asc' ? 'ri-arrow-up-line text-blue-600' : 'ri-arrow-down-line text-blue-600';
  };

  const renderPagination = () => {
    const pages = [];
    const maxVisible = 5;
    let startPage = Math.max(1, pagination.currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(pagination.totalPages, startPage + maxVisible - 1);
    
    if (endPage - startPage + 1 < maxVisible) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }

    // Previous button
    if (pagination.currentPage > 1) {
      pages.push(
        <button
          key="prev"
          onClick={() => onPageChange(pagination.currentPage - 1)}
          className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-l-md hover:bg-gray-50 transition-colors"
        >
          Previous
        </button>
      );
    }

    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => onPageChange(i)}
          className={`px-3 py-2 text-sm font-medium border ${
            i === pagination.currentPage
              ? 'bg-blue-600 text-white border-blue-600'
              : 'text-gray-500 bg-white border-gray-300 hover:bg-gray-50'
          } transition-colors ${
            i === startPage && pagination.currentPage > 1 ? '' : 
            i === endPage && pagination.currentPage < pagination.totalPages ? '' : 'border-l-0'
          }`}
        >
          {i}
        </button>
      );
    }

    // Next button
    if (pagination.currentPage < pagination.totalPages) {
      pages.push(
        <button
          key="next"
          onClick={() => onPageChange(pagination.currentPage + 1)}
          className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-r-md hover:bg-gray-50 transition-colors border-l-0"
        >
          Next
        </button>
      );
    }

    return pages;
  };

  return (
    <div>
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selectAll}
                  onChange={(e) => onSelectAll(e.target.checked)}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                />
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => onSort('full_name')}
              >
                <div className="flex items-center space-x-1">
                  <span>User</span>
                  <i className={`w-4 h-4 ${getSortIcon('full_name')}`}></i>
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => onSort('email')}
              >
                <div className="flex items-center space-x-1">
                  <span>Email</span>
                  <i className={`w-4 h-4 ${getSortIcon('email')}`}></i>
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Orders
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => onSort('created_at')}
              >
                <div className="flex items-center space-x-1">
                  <span>Joined</span>
                  <i className={`w-4 h-4 ${getSortIcon('created_at')}`}></i>
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => onSort('last_login_at')}
              >
                <div className="flex items-center space-x-1">
                  <span>Last Login</span>
                  <i className={`w-4 h-4 ${getSortIcon('last_login_at')}`}></i>
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr 
                key={user.id} 
                className={`hover:bg-gray-50 transition-colors ${
                  selectedUsers.has(user.id) ? 'bg-blue-50' : ''
                }`}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={selectedUsers.has(user.id)}
                    onChange={(e) => onUserSelect(user.id, e.target.checked)}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      {user.profile_image_url ? (
                        <Image
                          src={user.profile_image_url}
                          alt={user.full_name}
                          width={40}
                          height={40}
                          className="h-10 w-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                          <i className="ri-user-line text-gray-500 w-6 h-6"></i>
                        </div>
                      )}
                    </div>
                    <div className="ml-4">
                      <button
                        onClick={() => onUserClick(user)}
                        className="text-sm font-medium text-gray-900 hover:text-blue-600 transition-colors text-left"
                      >
                        {user.full_name}
                      </button>
                      <div className="text-sm text-gray-500">
                        {user.phone || 'No phone'}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{user.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-col space-y-1">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      user.is_active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {user.is_active ? 'Active' : 'Inactive'}
                    </span>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      user.email_verified 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {user.email_verified ? 'Verified' : 'Unverified'}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    <div className="font-medium">{user.orderStats.total} total</div>
                    <div className="text-xs text-gray-500">
                      {user.orderStats.pending} pending, {user.orderStats.completed} completed
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(user.created_at)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatTimeAgo(user.last_login_at)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => onEditUser(user)}
                      className="text-blue-600 hover:text-blue-900 transition-colors p-1 rounded hover:bg-blue-50"
                      title="Edit User"
                    >
                      <i className="ri-edit-line w-4 h-4"></i>
                    </button>
                    <button
                      onClick={() => onNotifyUser(user)}
                      className="text-green-600 hover:text-green-900 transition-colors p-1 rounded hover:bg-green-50"
                      title="Send Notification"
                    >
                      <i className="ri-notification-line w-4 h-4"></i>
                    </button>
                    <button
                      onClick={() => onUserClick(user)}
                      className="text-gray-600 hover:text-gray-900 transition-colors p-1 rounded hover:bg-gray-50"
                      title="View Details"
                    >
                      <i className="ri-eye-line w-4 h-4"></i>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            {pagination.currentPage > 1 && (
              <button
                onClick={() => onPageChange(pagination.currentPage - 1)}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Previous
              </button>
            )}
            {pagination.currentPage < pagination.totalPages && (
              <button
                onClick={() => onPageChange(pagination.currentPage + 1)}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Next
              </button>
            )}
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing{' '}
                <span className="font-medium">
                  {((pagination.currentPage - 1) * pagination.limit) + 1}
                </span>{' '}
                to{' '}
                <span className="font-medium">
                  {Math.min(pagination.currentPage * pagination.limit, pagination.totalUsers)}
                </span>{' '}
                of{' '}
                <span className="font-medium">{pagination.totalUsers}</span>{' '}
                users
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                {renderPagination()}
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { useAdminAuth } from '../../../contexts/AdminAuthContext';
import UserManagementTable from '../../../components/admin/UserManagementTable';
import UserDetailsModal from '../../../components/admin/UserDetailsModal';
import BulkActionsBar from '../../../components/admin/BulkActionsBar';
import AddUserModal from '../../../components/admin/AddUserModal';
import EditUserModal from '../../../components/admin/EditUserModal';
import NotificationModal from '../../../components/admin/NotificationModal';
import UserStatsCards from '../../../components/admin/UserStatsCards';

// Use the same API base URL as AdminAuthContext
const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8001/api';

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

interface UserStats {
  totalUsers: number;
  activeUsers: number;
  verifiedUsers: number;
  newUsersThisMonth: number;
  uniqueCustomers: number;
}

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalUsers: number;
  limit: number;
}

export default function AdminUsersPage() {
  const { adminUser } = useAdminAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  
  // Selection state
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(false);
  
  // Pagination and filtering
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 1,
    totalUsers: 0,
    limit: 20
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  
  // Modal states
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [showAddUser, setShowAddUser] = useState(false);
  const [showEditUser, setShowEditUser] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [bulkNotification, setBulkNotification] = useState(false);

  // Fetch users from backend
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.currentPage.toString(),
        limit: pagination.limit.toString(),
        search: searchQuery,
        sortBy,
        sortOrder,
        status: statusFilter
      });

      const response = await fetch(`/api/admin/users?${params}`, {
        credentials: 'include', // This will include cookies
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const data = await response.json();
      if (data.success) {
        setUsers(data.data);
        setPagination(data.pagination);
        setError(null);
      } else {
        throw new Error(data.message || 'Failed to fetch users');
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  }, [adminUser?.token, pagination.currentPage, pagination.limit, searchQuery, sortBy, sortOrder, statusFilter]);

  // Fetch user statistics
  const fetchUserStats = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/users/stats', {
        credentials: 'include', // This will include cookies
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setUserStats(data.data);
        }
      }
    } catch (err) {
      console.error('Error fetching user stats:', err);
    }
  }, [adminUser?.token]);

  // Load data on component mount and dependency changes
  useEffect(() => {
    if (adminUser?.token) {
      fetchUsers();
      fetchUserStats();
    }
  }, [fetchUsers, fetchUserStats, adminUser?.token]);

  // Handle user selection
  const handleUserSelect = (userId: string, checked: boolean) => {
    const newSelection = new Set(selectedUsers);
    if (checked) {
      newSelection.add(userId);
    } else {
      newSelection.delete(userId);
    }
    setSelectedUsers(newSelection);
    setSelectAll(newSelection.size === users.length && users.length > 0);
  };

  // Handle select all
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedUsers(new Set(users.map(user => user.id)));
    } else {
      setSelectedUsers(new Set());
    }
    setSelectAll(checked);
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, currentPage: page }));
    setSelectedUsers(new Set());
    setSelectAll(false);
  };

  const handleLimitChange = (limit: number) => {
    setPagination(prev => ({ ...prev, limit, currentPage: 1 }));
    setSelectedUsers(new Set());
    setSelectAll(false);
  };

  // Handle search and filters
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setPagination(prev => ({ ...prev, currentPage: 1 }));
    setSelectedUsers(new Set());
    setSelectAll(false);
  };

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status);
    setPagination(prev => ({ ...prev, currentPage: 1 }));
    setSelectedUsers(new Set());
    setSelectAll(false);
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  // Handle user actions
  const handleUserClick = (user: User) => {
    setSelectedUser(user);
    setShowUserDetails(true);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setShowEditUser(true);
  };

  const handleNotifyUser = (user: User) => {
    setSelectedUser(user);
    setShowNotification(true);
    setBulkNotification(false);
  };

  const handleBulkNotify = () => {
    if (selectedUsers.size > 0) {
      setShowNotification(true);
      setBulkNotification(true);
    }
  };

  // Handle bulk delete
  const handleBulkDelete = async () => {
    if (selectedUsers.size === 0) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete ${selectedUsers.size} selected users? This action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      const response = await fetch('/api/admin/users/bulk-delete', {
        method: 'POST',
        credentials: 'include', // This will include cookies
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userIds: Array.from(selectedUsers)
        })
      });

      const data = await response.json();
      if (data.success) {
        await fetchUsers();
        await fetchUserStats();
        setSelectedUsers(new Set());
        setSelectAll(false);
        alert(`Successfully deleted ${data.data.deletedCount} users`);
      } else {
        throw new Error(data.message || 'Failed to delete users');
      }
    } catch (err) {
      console.error('Error deleting users:', err);
      alert('Failed to delete users');
    }
  };

  // Handle bulk update
  const handleBulkUpdate = async (updateData: any) => {
    if (selectedUsers.size === 0) return;

    try {
      const response = await fetch('/api/admin/users/bulk-update', {
        method: 'POST',
        credentials: 'include', // This will include cookies
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userIds: Array.from(selectedUsers),
          updateData
        })
      });

      const data = await response.json();
      if (data.success) {
        await fetchUsers();
        await fetchUserStats();
        setSelectedUsers(new Set());
        setSelectAll(false);
        alert(`Successfully updated ${data.data.updatedCount} users`);
      } else {
        throw new Error(data.message || 'Failed to update users');
      }
    } catch (err) {
      console.error('Error updating users:', err);
      alert('Failed to update users');
    }
  };

  // Close modals
  const closeModals = () => {
    setShowUserDetails(false);
    setShowAddUser(false);
    setShowEditUser(false);
    setShowNotification(false);
    setSelectedUser(null);
    setBulkNotification(false);
  };

  // Handle successful user operations
  const handleUserOperationSuccess = () => {
    fetchUsers();
    fetchUserStats();
    closeModals();
  };

  if (!adminUser) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600">
            Manage registered users, view profiles, and track orders
          </p>
        </div>
        <button
          onClick={() => setShowAddUser(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
        >
          <i className="ri-user-add-line w-5 h-5 mr-2"></i>
          Add User
        </button>
      </div>

      {/* User Statistics */}
      {userStats && <UserStatsCards stats={userStats} />}

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
          {/* Search */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <input
                type="text"
                placeholder="Search users by name, email, or phone..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <i className="ri-search-line absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5"></i>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center space-x-4">
            <select
              value={statusFilter}
              onChange={(e) => handleStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Users</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="verified">Verified</option>
              <option value="unverified">Unverified</option>
            </select>

            <select
              value={pagination.limit}
              onChange={(e) => handleLimitChange(Number(e.target.value))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value={10}>10 per page</option>
              <option value={20}>20 per page</option>
              <option value={50}>50 per page</option>
              <option value={100}>100 per page</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {selectedUsers.size > 0 && (
        <BulkActionsBar
          selectedCount={selectedUsers.size}
          onBulkDelete={handleBulkDelete}
          onBulkUpdate={handleBulkUpdate}
          onBulkNotify={handleBulkNotify}
        />
      )}

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading users...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="text-red-500 mb-4">
                <i className="ri-error-warning-line w-12 h-12 mx-auto"></i>
              </div>
              <p className="text-gray-600">{error}</p>
              <button
                onClick={() => fetchUsers()}
                className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        ) : (
          <UserManagementTable
            users={users}
            selectedUsers={selectedUsers}
            selectAll={selectAll}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onUserSelect={handleUserSelect}
            onSelectAll={handleSelectAll}
            onUserClick={handleUserClick}
            onEditUser={handleEditUser}
            onNotifyUser={handleNotifyUser}
            onSort={handleSort}
            pagination={pagination}
            onPageChange={handlePageChange}
          />
        )}
      </div>

      {/* Modals */}
      {showUserDetails && selectedUser && (
        <UserDetailsModal
          user={selectedUser}
          onClose={closeModals}
          onEditUser={() => {
            setShowUserDetails(false);
            setShowEditUser(true);
          }}
          onNotifyUser={() => {
            setShowUserDetails(false);
            setShowNotification(true);
            setBulkNotification(false);
          }}
        />
      )}

      {showAddUser && (
        <AddUserModal
          onClose={closeModals}
          onSuccess={handleUserOperationSuccess}
        />
      )}

      {showEditUser && selectedUser && (
        <EditUserModal
          user={selectedUser}
          onClose={closeModals}
          onSuccess={handleUserOperationSuccess}
        />
      )}

      {showNotification && (
        <NotificationModal
          users={bulkNotification ? Array.from(selectedUsers) : selectedUser ? [selectedUser.id] : []}
          isBulk={bulkNotification}
          onClose={closeModals}
          onSuccess={() => {
            closeModals();
            alert('Notifications sent successfully!');
          }}
        />
      )}
    </div>
  );
}
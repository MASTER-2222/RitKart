// RitZone Admin Users Service
// ==============================================
// Service layer for advanced user management and order tracking

const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { getSupabaseClient } = require('./supabase-service');
const { adminActivityService } = require('./admin-service');

// ==============================================
// 👥 USER MANAGEMENT SERVICE
// ==============================================
const adminUsersService = {
  // Get users with pagination, search, and filtering
  getUsers: async (options = {}) => {
    try {
      const {
        page = 1,
        limit = 20,
        search = '',
        sortBy = 'created_at',
        sortOrder = 'desc',
        status = 'all'
      } = options;

      const client = getSupabaseClient();
      const offset = (page - 1) * limit;

      // Build query
      let query = client
        .from('users')
        .select(`
          id,
          email,
          full_name,
          phone,
          created_at,
          updated_at,
          is_active,
          email_verified,
          last_login_at,
          profile_image_url
        `, { count: 'exact' });

      // Apply search filter
      if (search) {
        query = query.or(`email.ilike.%${search}%,full_name.ilike.%${search}%,phone.ilike.%${search}%`);
      }

      // Apply status filter
      if (status !== 'all') {
        if (status === 'active') {
          query = query.eq('is_active', true);
        } else if (status === 'inactive') {
          query = query.eq('is_active', false);
        } else if (status === 'verified') {
          query = query.eq('email_verified', true);
        } else if (status === 'unverified') {
          query = query.eq('email_verified', false);
        }
      }

      // Apply sorting and pagination
      query = query
        .order(sortBy, { ascending: sortOrder === 'asc' })
        .range(offset, offset + limit - 1);

      const { data: users, error: usersError, count } = await query;

      if (usersError) throw usersError;

      // Get order counts for each user
      const userIds = users.map(user => user.id);
      const { data: orderCounts, error: orderError } = await client
        .from('orders')
        .select('user_id, status')
        .in('user_id', userIds);

      if (orderError) {
        console.warn('Failed to fetch order counts:', orderError.message);
      }

      // Aggregate order counts
      const orderStats = {};
      if (orderCounts) {
        orderCounts.forEach(order => {
          if (!orderStats[order.user_id]) {
            orderStats[order.user_id] = { total: 0, pending: 0, completed: 0 };
          }
          orderStats[order.user_id].total++;
          if (order.status === 'pending') orderStats[order.user_id].pending++;
          if (order.status === 'delivered') orderStats[order.user_id].completed++;
        });
      }

      // Attach order stats to users
      const enrichedUsers = users.map(user => ({
        ...user,
        orderStats: orderStats[user.id] || { total: 0, pending: 0, completed: 0 }
      }));

      return {
        success: true,
        users: enrichedUsers,
        currentPage: page,
        totalPages: Math.ceil(count / limit),
        totalUsers: count,
        limit
      };

    } catch (error) {
      console.error('❌ Get users failed:', error.message);
      return { success: false, error: error.message };
    }
  },

  // Get detailed user information with order history
  getUserDetails: async (userId) => {
    try {
      const client = getSupabaseClient();

      // Get user details
      const { data: user, error: userError } = await client
        .from('users')
        .select(`
          id,
          email,
          full_name,
          phone,
          created_at,
          updated_at,
          is_active,
          email_verified,
          last_login_at,
          profile_image_url,
          address,
          city,
          state,
          country,
          postal_code
        `)
        .eq('id', userId)
        .single();

      if (userError || !user) {
        return { success: false, error: 'User not found' };
      }

      // Get user's recent orders
      const { data: orders, error: ordersError } = await client
        .from('orders')
        .select(`
          id,
          order_number,
          status,
          total_amount,
          currency,
          created_at,
          updated_at,
          notes,
          order_items (
            id,
            quantity,
            price,
            products (
              id,
              name,
              images
            )
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (ordersError) {
        console.warn('Failed to fetch user orders:', ordersError.message);
      }

      // Get user's cart items count
      const { data: cartItems, error: cartError } = await client
        .from('cart_items')
        .select('id')
        .eq('cart_id', `(SELECT id FROM carts WHERE user_id = '${userId}')`);

      if (cartError) {
        console.warn('Failed to fetch cart items:', cartError.message);
      }

      // Calculate user statistics
      const totalOrders = orders?.length || 0;
      const completedOrders = orders?.filter(order => order.status === 'delivered').length || 0;
      const pendingOrders = orders?.filter(order => order.status === 'pending').length || 0;
      const totalSpent = orders?.reduce((sum, order) => sum + parseFloat(order.total_amount || 0), 0) || 0;
      const cartItemsCount = cartItems?.length || 0;

      const userWithDetails = {
        ...user,
        recentOrders: orders || [],
        statistics: {
          totalOrders,
          completedOrders,
          pendingOrders,
          totalSpent,
          cartItemsCount,
          joinedDaysAgo: Math.floor((new Date() - new Date(user.created_at)) / (1000 * 60 * 60 * 24))
        }
      };

      return { success: true, user: userWithDetails };

    } catch (error) {
      console.error('❌ Get user details failed:', error.message);
      return { success: false, error: error.message };
    }
  },

  // Create new user using Supabase Auth
  createUser: async (userData, adminUserId) => {
    try {
      const client = getSupabaseClient();
      const { email, password, full_name, phone, address, city, state, country, postal_code } = userData;

      // Validate required fields
      if (!email || !password || !full_name) {
        return { success: false, error: 'Email, password, and full name are required' };
      }

      // Check if user already exists
      const { data: existingUser } = await client
        .from('users')
        .select('id')
        .eq('email', email)
        .single();

      if (existingUser) {
        return { success: false, error: 'User with this email already exists' };
      }

      // Create user using Supabase Auth API (admin method)
      const { data: authUser, error: authError } = await client.auth.admin.createUser({
        email,
        password,
        email_confirm: false, // Auto-confirm email for admin-created users
        user_metadata: {
          full_name,
          phone: phone || null,
          address: address || null,
          city: city || null,
          state: state || null,
          country: country || null,
          postal_code: postal_code || null
        }
      });

      if (authError) {
        console.error('❌ Supabase Auth create user failed:', authError);
        return { success: false, error: `Failed to create user: ${authError.message}` };
      }

      // Create corresponding record in users table
      const { data: user, error: userError } = await client
        .from('users')
        .insert([{
          id: authUser.user.id, // Use the Supabase Auth user ID
          email,
          full_name,
          phone: phone || null,
          address: address || null,
          city: city || null,
          state: state || null,
          country: country || null,
          postal_code: postal_code || null,
          is_active: true,
          email_verified: !authError, // Set based on auth creation success
          created_at: authUser.user.created_at,
          updated_at: authUser.user.updated_at
        }])
        .select()
        .single();

      if (userError) {
        console.error('❌ User table insert failed:', userError);
        // Try to delete the auth user if table insert fails
        try {
          await client.auth.admin.deleteUser(authUser.user.id);
        } catch (deleteError) {
          console.error('❌ Failed to cleanup auth user:', deleteError);
        }
        return { success: false, error: `Failed to create user record: ${userError.message}` };
      }

      // Log activity
      await adminActivityService.logActivity(
        adminUserId,
        'create_user',
        'user',
        user.id,
        { email: user.email, full_name: user.full_name }
      );

      return { success: true, user: user };

    } catch (error) {
      console.error('❌ Create user failed:', error.message);
      return { success: false, error: error.message };
    }
  },

  // Update user
  updateUser: async (userId, updateData, adminUserId) => {
    try {
      const client = getSupabaseClient();
      const allowedFields = [
        'full_name', 'phone', 'address', 'city', 'state', 'country', 'postal_code',
        'is_active', 'email_verified', 'profile_image_url'
      ];

      // Filter update data to only allowed fields
      const filteredData = {};
      Object.keys(updateData).forEach(key => {
        if (allowedFields.includes(key)) {
          filteredData[key] = updateData[key];
        }
      });

      if (Object.keys(filteredData).length === 0) {
        return { success: false, error: 'No valid fields to update' };
      }

      filteredData.updated_at = new Date().toISOString();

      // Update user
      const { data: user, error: updateError } = await client
        .from('users')
        .update(filteredData)
        .eq('id', userId)
        .select()
        .single();

      if (updateError) throw updateError;

      if (!user) {
        return { success: false, error: 'User not found' };
      }

      // Log activity
      await adminActivityService.logActivity(
        adminUserId,
        'update_user',
        'user',
        userId,
        { updatedFields: Object.keys(filteredData) }
      );

      return { success: true, user };

    } catch (error) {
      console.error('❌ Update user failed:', error.message);
      return { success: false, error: error.message };
    }
  },

  // Delete user
  deleteUser: async (userId, adminUserId) => {
    try {
      const client = getSupabaseClient();

      // Check if user exists and get details for logging
      const { data: user, error: getUserError } = await client
        .from('users')
        .select('email, full_name')
        .eq('id', userId)
        .single();

      if (getUserError || !user) {
        return { success: false, error: 'User not found' };
      }

      // Delete user (cascade will handle related records)
      const { error: deleteError } = await client
        .from('users')
        .delete()
        .eq('id', userId);

      if (deleteError) throw deleteError;

      // Log activity
      await adminActivityService.logActivity(
        adminUserId,
        'delete_user',
        'user',
        userId,
        { email: user.email, full_name: user.full_name }
      );

      return { success: true };

    } catch (error) {
      console.error('❌ Delete user failed:', error.message);
      return { success: false, error: error.message };
    }
  },

  // Bulk delete users
  bulkDeleteUsers: async (userIds, adminUserId) => {
    try {
      const client = getSupabaseClient();
      let deletedCount = 0;
      let failedCount = 0;
      const errors = [];

      for (const userId of userIds) {
        try {
          const result = await adminUsersService.deleteUser(userId, adminUserId);
          if (result.success) {
            deletedCount++;
          } else {
            failedCount++;
            errors.push({ userId, error: result.error });
          }
        } catch (error) {
          failedCount++;
          errors.push({ userId, error: error.message });
        }
      }

      // Log bulk activity
      await adminActivityService.logActivity(
        adminUserId,
        'bulk_delete_users',
        'user',
        null,
        { deletedCount, failedCount, totalAttempted: userIds.length }
      );

      return { success: true, deletedCount, failedCount, errors };

    } catch (error) {
      console.error('❌ Bulk delete users failed:', error.message);
      return { success: false, error: error.message };
    }
  },

  // Bulk update users
  bulkUpdateUsers: async (userIds, updateData, adminUserId) => {
    try {
      const client = getSupabaseClient();
      let updatedCount = 0;
      let failedCount = 0;
      const errors = [];

      for (const userId of userIds) {
        try {
          const result = await adminUsersService.updateUser(userId, updateData, adminUserId);
          if (result.success) {
            updatedCount++;
          } else {
            failedCount++;
            errors.push({ userId, error: result.error });
          }
        } catch (error) {
          failedCount++;
          errors.push({ userId, error: error.message });
        }
      }

      // Log bulk activity
      await adminActivityService.logActivity(
        adminUserId,
        'bulk_update_users',
        'user',
        null,
        { updatedCount, failedCount, totalAttempted: userIds.length, updateFields: Object.keys(updateData) }
      );

      return { success: true, updatedCount, failedCount, errors };

    } catch (error) {
      console.error('❌ Bulk update users failed:', error.message);
      return { success: false, error: error.message };
    }
  },

  // Get user's orders with pagination
  getUserOrders: async (userId, options = {}) => {
    try {
      const {
        page = 1,
        limit = 10,
        status = 'all',
        dateFrom,
        dateTo
      } = options;

      const client = getSupabaseClient();
      const offset = (page - 1) * limit;

      let query = client
        .from('orders')
        .select(`
          id,
          order_number,
          status,
          total_amount,
          currency,
          created_at,
          updated_at,
          notes,
          order_items (
            id,
            quantity,
            price,
            products (
              id,
              name,
              images
            )
          )
        `, { count: 'exact' })
        .eq('user_id', userId);

      // Apply status filter
      if (status !== 'all') {
        query = query.eq('status', status);
      }

      // Apply date filters
      if (dateFrom) {
        query = query.gte('created_at', dateFrom);
      }
      if (dateTo) {
        query = query.lte('created_at', dateTo);
      }

      // Apply pagination
      query = query
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      const { data: orders, error: ordersError, count } = await query;

      if (ordersError) throw ordersError;

      return {
        success: true,
        orders: orders || [],
        currentPage: page,
        totalPages: Math.ceil(count / limit),
        totalOrders: count,
        limit
      };

    } catch (error) {
      console.error('❌ Get user orders failed:', error.message);
      return { success: false, error: error.message };
    }
  },

  // Update order status
  updateOrderStatus: async (orderId, status, notes, adminUserId) => {
    try {
      const client = getSupabaseClient();

      const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
      if (!validStatuses.includes(status)) {
        return { success: false, error: 'Invalid order status' };
      }

      const { data: order, error: updateError } = await client
        .from('orders')
        .update({
          status,
          notes: notes || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId)
        .select(`
          *,
          users (
            id,
            email,
            full_name
          )
        `)
        .single();

      if (updateError) throw updateError;

      if (!order) {
        return { success: false, error: 'Order not found' };
      }

      // Log activity
      await adminActivityService.logActivity(
        adminUserId,
        'update_order_status',
        'order',
        orderId,
        { 
          newStatus: status, 
          notes,
          userEmail: order.users?.email 
        }
      );

      return { success: true, order };

    } catch (error) {
      console.error('❌ Update order status failed:', error.message);
      return { success: false, error: error.message };
    }
  },

  // Send notification to user
  sendUserNotification: async (userId, notificationData, adminUserId) => {
    try {
      const client = getSupabaseClient();
      const { type, title, message, orderId } = notificationData;

      // Create notification record
      const { data: notification, error: notificationError } = await client
        .from('user_notifications')
        .insert([{
          id: uuidv4(),
          user_id: userId,
          type: type || 'general',
          title,
          message,
          order_id: orderId || null,
          is_read: false,
          sent_by_admin: adminUserId
        }])
        .select()
        .single();

      if (notificationError) throw notificationError;

      // Log activity
      await adminActivityService.logActivity(
        adminUserId,
        'send_notification',
        'notification',
        notification.id,
        { userId, type, title }
      );

      return { success: true, notification };

    } catch (error) {
      console.error('❌ Send notification failed:', error.message);
      return { success: false, error: error.message };
    }
  },

  // Bulk send notifications
  bulkSendNotifications: async (userIds, notificationData, adminUserId) => {
    try {
      const client = getSupabaseClient();
      let sentCount = 0;
      let failedCount = 0;
      const errors = [];

      for (const userId of userIds) {
        try {
          const result = await adminUsersService.sendUserNotification(userId, notificationData, adminUserId);
          if (result.success) {
            sentCount++;
          } else {
            failedCount++;
            errors.push({ userId, error: result.error });
          }
        } catch (error) {
          failedCount++;
          errors.push({ userId, error: error.message });
        }
      }

      // Log bulk activity
      await adminActivityService.logActivity(
        adminUserId,
        'bulk_send_notifications',
        'notification',
        null,
        { sentCount, failedCount, totalAttempted: userIds.length, type: notificationData.type }
      );

      return { success: true, sentCount, failedCount, errors };

    } catch (error) {
      console.error('❌ Bulk send notifications failed:', error.message);
      return { success: false, error: error.message };
    }
  },

  // Get user statistics
  getUserStats: async () => {
    try {
      const client = getSupabaseClient();

      // Get total users
      const { count: totalUsers } = await client
        .from('users')
        .select('*', { count: 'exact', head: true });

      // Get active users
      const { count: activeUsers } = await client
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

      // Get verified users
      const { count: verifiedUsers } = await client
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('email_verified', true);

      // Get new users this month
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { count: newUsersThisMonth } = await client
        .from('users')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', startOfMonth.toISOString());

      // Get users with orders
      const { data: usersWithOrders } = await client
        .from('orders')
        .select('user_id')
        .not('user_id', 'is', null);

      const uniqueCustomers = new Set(usersWithOrders?.map(order => order.user_id)).size;

      return {
        success: true,
        stats: {
          totalUsers: totalUsers || 0,
          activeUsers: activeUsers || 0,
          verifiedUsers: verifiedUsers || 0,
          newUsersThisMonth: newUsersThisMonth || 0,
          uniqueCustomers
        }
      };

    } catch (error) {
      console.error('❌ Get user stats failed:', error.message);
      return { success: false, error: error.message };
    }
  }
};

module.exports = {
  adminUsersService
};